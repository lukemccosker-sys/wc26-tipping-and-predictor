import { DEFAULT_SETTINGS, DEFAULT_PRED_SETTINGS, scoreTip, GL, WC_GROUPS, KO_MATCHES, ROUND_ORDER } from "./wc2026data";

// ---- Group table calculation ----
export function calcGroupTable(group, predictions, officialResults) {
  const teams = WC_GROUPS[group] || [];
  const table = {};
  teams.forEach(t => { table[t] = { team: t, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }; });

  // Find official results for this group's matches
  const groupMatchIds = predictions.filter(p => p.group === group).map(p => p.id);

  for (const res of officialResults) {
    if (res.homeScore == null || res.awayScore == null) continue;
    // find which group/teams this match belongs to
    const match = predictions.find(m => m.id === res.matchId);
    if (!match || match.group !== group) continue;
    const h = match.home, a = match.away;
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

// ---- Compute player tipping score ----
export function computePlayerScore(predictions, officialResults, settings) {
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
    const stage = pred.matchId?.startsWith("g") ? "group" : (pred.round || "R32");
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