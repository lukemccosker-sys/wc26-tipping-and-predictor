import { DEFAULT_SETTINGS, DEFAULT_PRED_SETTINGS, scoreTip, GL, WC_GROUPS, GROUP_MATCHES, KO_MATCHES, ROUND_ORDER } from "./wc2026data";

// Third-place slot constraints (which groups are eligible for each R32 slot)
const THIRD_SLOT_GROUPS = {
  "3CEFHI": ["C","E","F","H","I"],
  "3ABCDF": ["A","B","C","D","F"],
  "3EFGIJ": ["E","F","G","I","J"],
  "3DEIJL": ["D","E","I","J","L"],
  "3AEHIJ": ["A","E","H","I","J"],
  "3CDFGH": ["C","D","F","G","H"],
  "3BEFIJ": ["B","E","F","I","J"],
  "3EHIJK": ["E","H","I","J","K"],
};
const THIRD_SLOT_KEYS = Object.keys(THIRD_SLOT_GROUPS);

// Assign best-3rd teams (tp: { groupLetter: team }) into slotTeams using backtracking
// so that all picked teams are placed — moving teams around to maximise fit.
export function assignThirdPlaceTeams(tp, slotTeams) {
  const picks = GL.map(L => tp[L]).filter(Boolean); // teams to place, in group order
  const slots = THIRD_SLOT_KEYS.slice(); // 8 slot keys
  const assignment = new Array(slots.length).fill(null);

  // For each pick, which slots are eligible?
  const eligibleSlots = picks.map(team => {
    const groupL = GL.find(L => tp[L] === team);
    return slots.reduce((acc, sk, i) => {
      if (THIRD_SLOT_GROUPS[sk].includes(groupL)) acc.push(i);
      return acc;
    }, []);
  });

  // Backtrack over ALL slot permutations to find the assignment that places the most teams
  // Each pick is either placed in one of its eligible slots, or marked -1 (unplaced).
  // We try EVERY combination so rearranging earlier picks can free up slots for later ones.
  let bestAssignment = null;
  let bestCount = -1;

  function backtrack(pickIdx, usedSlots) {
    if (pickIdx === picks.length) {
      const count = assignment.filter(x => x !== null && x !== -1).length;
      if (count > bestCount) {
        bestCount = count;
        bestAssignment = assignment.slice();
      }
      return;
    }
    // Try every eligible slot
    for (const si of eligibleSlots[pickIdx]) {
      if (!usedSlots.has(si)) {
        assignment[pickIdx] = si;
        usedSlots.add(si);
        backtrack(pickIdx + 1, usedSlots);
        usedSlots.delete(si);
        assignment[pickIdx] = null;
      }
    }
    // Also try leaving this pick unplaced (allows later picks to use slots this one could have taken)
    assignment[pickIdx] = -1;
    backtrack(pickIdx + 1, usedSlots);
    assignment[pickIdx] = null;
  }

  backtrack(0, new Set());

  // Apply best assignment
  if (bestAssignment) {
    for (let i = 0; i < picks.length; i++) {
      const si = bestAssignment[i];
      if (si != null && si !== -1) {
        slotTeams[slots[si]] = picks[i];
      }
    }
  }

  // Fallback: any still-unplaced picks go into remaining empty slots (unconstrained)
  const placed = new Set(
    (bestAssignment || [])
      .map((si, i) => (si != null && si !== -1 ? picks[i] : null))
      .filter(Boolean)
  );
  const emptySlots = slots.filter(sk => !slotTeams[sk]);
  for (const team of picks) {
    if (!placed.has(team) && emptySlots.length > 0) {
      slotTeams[emptySlots.shift()] = team;
    }
  }
}

// ---- Group table calculation (uses GROUP_MATCHES fixture data) ----
export function calcGroupTable(group, officialResults) {
  const teams = WC_GROUPS[group] || [];
  const table = {};
  teams.forEach(t => { table[t] = { team: t, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }; });

  const groupFixtures = GROUP_MATCHES.filter(m => m.group === group);
  for (const fixture of groupFixtures) {
    const res = officialResults.find(r => r.matchId === fixture.id);
    if (!res || res.homeScore == null || res.awayScore == null) continue;
    const h = fixture.home, a = fixture.away;
    if (!table[h] || !table[a]) continue;
    const gh = +res.homeScore, ga = +res.awayScore;
    table[h].pld++; table[a].pld++;
    table[h].gf += gh; table[h].ga += ga; table[h].gd = table[h].gf - table[h].ga;
    table[a].gf += ga; table[a].ga += gh; table[a].gd = table[a].gf - table[a].ga;
    if (gh > ga) { table[h].w++; table[h].pts += 3; table[a].l++; }
    else if (gh < ga) { table[a].w++; table[a].pts += 3; table[h].l++; }
    else { table[h].d++; table[h].pts++; table[a].d++; table[a].pts++; }
  }

  const sorted = Object.values(table).sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
  );
  return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
}

// Deduplicate predictions — keep only the latest per matchId
// Use created_date as the tiebreaker since updated_date can have sub-second precision issues
function dedupePredictions(predictions) {
  const map = {};
  for (const p of predictions) {
    const existing = map[p.matchId];
    if (!existing) {
      map[p.matchId] = p;
    } else {
      // Compare by updated_date first, then created_date as tiebreaker
      const pTime = Math.max(
        p.updated_date ? new Date(p.updated_date).getTime() : 0,
        p.created_date ? new Date(p.created_date).getTime() : 0
      );
      const eTime = Math.max(
        existing.updated_date ? new Date(existing.updated_date).getTime() : 0,
        existing.created_date ? new Date(existing.created_date).getTime() : 0
      );
      if (pTime > eTime) map[p.matchId] = p;
    }
  }
  return Object.values(map);
}

// ---- Compute player tipping score ----
export function computePlayerScore(predictions, officialResults, settings) {
  predictions = dedupePredictions(predictions);
  const s = settings || DEFAULT_SETTINGS;
  let total = 0;
  const counts = { exact: 0, gd: 0, result: 0, miss: 0 };
  const byStage = { group: 0 };
  ROUND_ORDER.forEach(r => { byStage[r] = 0; });

  for (const pred of predictions) {
    const official = officialResults.find(r => r.matchId === pred.matchId);
    if (!official || official.homeScore == null) continue;
    const result = scoreTip(pred, official, s);
    if (!result) continue;
    total += result.pts;
    if (result.tier === "exact") counts.exact++;
    else if (result.tier === "gd") counts.gd++;
    else if (result.tier === "result") counts.result++;
    else counts.miss++;

    // stage
    const stage = pred.matchId?.startsWith("G") ? "group" : (pred.round || "R32");
    if (byStage[stage] !== undefined) byStage[stage] += result.pts;
    else byStage.group += result.pts;
  }

  return { total, counts, byStage };
}

// ---- Leaderboard builder ----
export function buildLeaderboard(players, allPredictions, officialResults, settings) {
  return players.map(player => {
    const preds = allPredictions.filter(p => p.playerId === player.id);
    const score = computePlayerScore(preds, officialResults, settings);
    return { ...player, ...score };
  }).sort((a, b) => b.total - a.total || b.counts.exact - a.counts.exact);
}

// ---- Predictor scoring ----
// Determine group rank of a team from official results
function getGroupRank(team, officialResults) {
  for (const group of GL) {
    const teams = WC_GROUPS[group];
    if (!teams.includes(team)) continue;
    const table = calcGroupTable(group, officialResults);
    const entry = table.find(r => r.team === team);
    if (entry) return { group, rank: entry.rank };
  }
  return null;
}

// Build official KO team map from official results + GROUP_MATCHES data
// thirdPlaceSlots: optional admin override { [slotKey]: teamName } e.g. {"3CEFHI": "Côte d'Ivoire"}
export function buildOfficialKOTeamsFromResults(officialResults, thirdPlaceSlots) {
  // Build group standings
  const standings = {};
  for (const group of GL) {
    standings[group] = calcGroupTable(group, officialResults);
  }

  // Slot teams: 1A = 1st in group A, etc.
  // Only fill if the group has actually played at least one match
  const slotTeams = {};
  for (const group of GL) {
    const table = standings[group] || [];
    const groupPlayed = table.some(r => r.pld > 0);
    if (!groupPlayed) continue; // don't assign teams from groups with no results
    const allPlayed = table.every(r => r.pld > 0) && table.reduce((s, r) => s + r.pld, 0) >= 6;
    // Only assign 1st/2nd once all 3 matchdays are complete (6 games played in group)
    if (allPlayed) {
      slotTeams[`1${group}`] = table[0]?.team || null;
      slotTeams[`2${group}`] = table[1]?.team || null;
      slotTeams[`3${group}`] = table[2]?.team || null;
    }
  }

  // Best 3rd-place teams: only from groups where all matches are complete
  const thirds = GL.map(group => {
    const table = standings[group] || [];
    const totalPld = table.reduce((s, r) => s + r.pld, 0);
    if (totalPld < 6) return null; // group not finished
    return table[2] ? { ...table[2], group } : null;
  }).filter(Boolean).sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
  );

  // If admin has manually assigned 3rd-place teams to slots, use those.
  // Otherwise fall back to automatic assignment by group eligibility.
  if (thirdPlaceSlots && Object.keys(thirdPlaceSlots).length > 0) {
    for (const [slotKey, team] of Object.entries(thirdPlaceSlots)) {
      if (team) slotTeams[slotKey] = team;
    }
  } else {
    // Build a tp-style map { groupLetter: teamName } from the top 8 thirds
    const tpMap = {};
    for (const t of thirds.slice(0, 8)) tpMap[t.group] = t.team;
    assignThirdPlaceTeams(tpMap, slotTeams);
  }

  // Resolve KO matches round by round using official results
  const teamOf = {};
  for (const m of KO_MATCHES) {
    const home = slotTeams[m.h] || null;
    const away = slotTeams[m.a] || null;
    teamOf[m.id] = { home, away };

    // Determine winner from official result to propagate
    const res = officialResults.find(r => r.matchId === m.id);
    if (res && res.homeScore != null && res.awayScore != null) {
      const h = +res.homeScore, a = +res.awayScore;
      let winner = null, loser = null;
      if (h > a) { winner = home; loser = away; }
      else if (h < a) { winner = away; loser = home; }
      else if (res.penaltyWinner === "h") { winner = home; loser = away; }
      else if (res.penaltyWinner === "a") { winner = away; loser = home; }
      if (winner) slotTeams[`W${m.id}`] = winner;
      if (loser) slotTeams[`L${m.id}`] = loser;
    }
  }
  return teamOf;
}

// Score a single player's bracket prediction against official results
export function computePredictorScore(bracketPred, officialResults, predSettings) {
  const s = predSettings || DEFAULT_PRED_SETTINGS;
  let groupPts = 0, bracketPts = 0, awardPts = 0;

  if (!bracketPred) return { groupPts: 0, bracketPts: 0, awardPts: 0, total: 0 };

  const gp = bracketPred.groupPicks ? JSON.parse(bracketPred.groupPicks) : {};
  const tp = bracketPred.thirdPicks ? JSON.parse(bracketPred.thirdPicks) : {};

  // Group picks scoring — compare against official standings
  // Only score groups where ALL 3 matchdays are complete (6 matches played)
  for (const group of GL) {
    const table = calcGroupTable(group, officialResults);
    const totalPld = table.reduce((s, r) => s + r.pld, 0);
    if (totalPld < 6) continue; // group not finished, don't score yet
    const actual1st = table[0]?.team;
    const actual2nd = table[1]?.team;
    const actual3rd = table[2]?.team;
    const pick = gp[group] || {};
    if (actual1st && pick.first === actual1st) groupPts += +s.g1 || 3;
    if (actual2nd && pick.second === actual2nd) groupPts += +s.g2 || 2;
    // Best 3rd picks
    if (actual3rd && tp[group] === actual3rd) groupPts += +s.third || 2;
  }

  // Bracket picks — Team Achievement model
  // Score based on whether the team the user picked to advance actually reached that round,
  // regardless of which specific match slot they were assigned to.
  const officialKOTeams = buildOfficialKOTeamsFromResults(officialResults);
  const ap = bracketPred.advancePicks ? JSON.parse(bracketPred.advancePicks) : {};

  // Build a map of team -> highest round they actually reached
  const actualRoundReached = {}; // { teamName: "QF" }
  for (const m of KO_MATCHES) {
    const teams = officialKOTeams[m.id];
    if (!teams) continue;
    const res = officialResults.find(r => r.matchId === m.id);
    // Both teams that appear in a match have "reached" that round
    [teams.home, teams.away].filter(Boolean).forEach(t => {
      const idx = ROUND_ORDER.indexOf(m.round);
      const existing = ROUND_ORDER.indexOf(actualRoundReached[t] || "");
      if (idx > existing) actualRoundReached[t] = m.round;
    });
    // The winner has reached the NEXT round too
    if (res && res.homeScore != null) {
      const h = +res.homeScore, a = +res.awayScore;
      let winner = null;
      if (h > a) winner = teams.home;
      else if (h < a) winner = teams.away;
      else if (res.penaltyWinner === "h") winner = teams.home;
      else if (res.penaltyWinner === "a") winner = teams.away;
      if (winner) {
        const roundIdx = ROUND_ORDER.indexOf(m.round);
        const nextRound = ROUND_ORDER[roundIdx + 1];
        if (nextRound) {
          const existing = ROUND_ORDER.indexOf(actualRoundReached[winner] || "");
          if (ROUND_ORDER.indexOf(nextRound) > existing) actualRoundReached[winner] = nextRound;
        }
      }
    }
  }

  // Score each user pick: did they pick this team to advance from this round,
  // and did the team actually reach at least that round?
  const roundPtsMap = { R32: "r32", R16: "r16", QF: "qf", SF: "sf", F: "final" };
  for (const m of KO_MATCHES) {
    if (m.round === "3rd") {
      // 3rd place match: score separately
      const teams = officialKOTeams[m.id];
      if (!teams) continue;
      const pickedSide = ap[m.id];
      const pickedTeam = pickedSide === "h" ? teams.home : pickedSide === "a" ? teams.away : null;
      if (!pickedTeam) continue;
      const res = officialResults.find(r => r.matchId === m.id);
      if (!res || res.homeScore == null) continue;
      const h = +res.homeScore, a = +res.awayScore;
      let winner = null;
      if (h > a) winner = teams.home;
      else if (h < a) winner = teams.away;
      else if (res.penaltyWinner === "h") winner = teams.home;
      else if (res.penaltyWinner === "a") winner = teams.away;
      if (winner && winner === pickedTeam) bracketPts += +s.third_place || 5;
      continue;
    }

    const teams = officialKOTeams[m.id];
    if (!teams) continue;
    const pickedSide = ap[m.id];
    const pickedTeam = pickedSide === "h" ? teams.home : pickedSide === "a" ? teams.away : null;
    if (!pickedTeam) continue;

    // Award points if the picked team actually reached at least this round
    const teamActualRound = actualRoundReached[pickedTeam];
    if (!teamActualRound) continue;
    if (ROUND_ORDER.indexOf(teamActualRound) >= ROUND_ORDER.indexOf(m.round)) {
      const key = roundPtsMap[m.round];
      if (key && s[key]) bracketPts += +s[key];
      // Extra champion bonus if they won the Final
      if (m.round === "F" && ROUND_ORDER.indexOf(teamActualRound) > ROUND_ORDER.indexOf("F")) {
        bracketPts += +s.champ || 12;
      }
    }
  }

  // Award picks
  const awardPicks = bracketPred.awardPicks ? JSON.parse(bracketPred.awardPicks) : {};
  // officialAwards stored separately — passed in via bracketPred.officialAwards if present
  // We score via a separate path in TippingHQ

  return { groupPts, bracketPts, awardPts, total: groupPts + bracketPts + awardPts };
}

// Build predictor KO team map from a player's own group/advance picks (mirrors TippingHQ's buildKOTeams)
function buildPredKOTeams(gp, tp, ap) {
  const slotTeams = {};
  for (const L of GL) {
    slotTeams[`1${L}`] = gp[L]?.first || null;
    slotTeams[`2${L}`] = gp[L]?.second || null;
  }
  assignThirdPlaceTeams(tp, slotTeams);

  const teamOf = {};
  for (const m of KO_MATCHES) {
    const home = slotTeams[m.h] || null;
    const away = slotTeams[m.a] || null;
    teamOf[m.id] = { home, away };
    if (ap[m.id] === "h" && home) { slotTeams[`W${m.id}`] = home; slotTeams[`L${m.id}`] = away; }
    if (ap[m.id] === "a" && away) { slotTeams[`W${m.id}`] = away; slotTeams[`L${m.id}`] = home; }
  }
  return teamOf;
}

// Deduplicate bracket predictions — keep only the latest per playerId
function dedupeBracketPredictions(bracketPredictions) {
  const map = {};
  for (const b of bracketPredictions) {
    const existing = map[b.playerId];
    if (!existing || b.updated_date > existing.updated_date) {
      map[b.playerId] = b;
    }
  }
  return Object.values(map);
}

export function buildCombinedLeaderboard(players, allPredictions, bracketPredictions, officialResults, officialAwards, tippingSettings, predSettings) {
  const tippingLB = buildLeaderboard(players, allPredictions, officialResults, tippingSettings);
  const predLB = buildPredictorLeaderboard(players, bracketPredictions, officialResults, officialAwards, predSettings);
  return players.map(player => {
    const t = tippingLB.find(r => r.id === player.id) || { total: 0 };
    const p = predLB.find(r => r.id === player.id) || { total: 0 };
    return { ...player, tippingTotal: t.total, predictorTotal: p.total, total: t.total + p.total };
  }).sort((a, b) => b.total - a.total);
}

export function buildPredictorLeaderboard(players, bracketPredictions, officialResults, officialAwards, predSettings) {
  const s = predSettings || DEFAULT_PRED_SETTINGS;
  const dedupedBrackets = dedupeBracketPredictions(bracketPredictions);

  function awardMatch(mine, actual) {
    if (!mine || !actual) return false;
    const norm = str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const guessWords = norm(mine).split(/\s+/).filter(Boolean);
    const actualWords = norm(actual).split(/\s+/).filter(Boolean);
    return guessWords.some(gw => actualWords.some(aw => aw.includes(gw) || gw.includes(aw)));
  }

  return players.map(player => {
    const bp = dedupedBrackets.find(b => b.playerId === player.id) || null;
    const { groupPts, bracketPts } = computePredictorScore(bp, officialResults, s);

    // Award scoring
    let awardPts = 0;
    if (bp?.awardPicks) {
      const picks = JSON.parse(bp.awardPicks);
      for (const key of Object.keys(picks)) {
        if (awardMatch(picks[key], officialAwards?.[key])) {
          awardPts += s.award != null ? +s.award : 5;
        }
      }
    }

    const total = groupPts + bracketPts + awardPts;

    // Champion prediction — derive from the player's own bracket picks
    const ap = bp?.advancePicks ? JSON.parse(bp.advancePicks) : {};
    const gp2 = bp?.groupPicks ? JSON.parse(bp.groupPicks) : {};
    const tp2 = bp?.thirdPicks ? JSON.parse(bp.thirdPicks) : {};
    const predKOTeams = buildPredKOTeams(gp2, tp2, ap);
    const m104Teams = predKOTeams["M104"];
    const champion = m104Teams
      ? (ap["M104"] === "h" ? m104Teams.home : ap["M104"] === "a" ? m104Teams.away : null)
      : null;

    return { ...player, groupPts, bracketPts, awardPts, total, champion };
  }).sort((a, b) => b.total - a.total);
}