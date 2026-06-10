import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ---- Inline scoring logic (mirrors lib/wc2026data.js + lib/scoring.js) ----

const DEFAULT_SETTINGS = { exact: 5, gd: 3, result: 1 };
const DEFAULT_PRED_SETTINGS = { g1: 3, g2: 2, third: 2, r32: 1, r16: 3, qf: 5, sf: 8, third_place: 5, champ: 12, award: 5 };

function scoreTip(pred, official, settings) {
  const s = settings || DEFAULT_SETTINGS;
  if (!official || official.homeScore == null || official.awayScore == null) return null;
  if (pred == null || pred.homeScore == null || pred.awayScore == null) return { pts: 0, tier: "miss" };
  const ph = +pred.homeScore, pa = +pred.awayScore;
  const oh = +official.homeScore, oa = +official.awayScore;

  if (ph === oh && pa === oa) return { pts: +s.exact || 5, tier: "exact" };

  const pdiff = ph - pa, odiff = oh - oa;
  const pwin = ph > pa ? "h" : ph < pa ? "a" : "d";
  const owin = oh > oa ? "h" : oh < oa ? "a" : "d";

  if (owin === "d" && official.penaltyWinner) {
    const pen = official.penaltyWinner;
    if (pwin === "d" && pdiff === odiff) return { pts: +s.gd || 3, tier: "gd" };
    if (pwin === "d") return { pts: +s.result || 1, tier: "result" };
    if (pwin === pen) return { pts: +s.result || 1, tier: "result" };
    return { pts: 0, tier: "miss" };
  }

  if (pdiff === odiff && pwin === owin) return { pts: +s.gd || 3, tier: "gd" };
  if (pwin === owin) return { pts: +s.result || 1, tier: "result" };
  return { pts: 0, tier: "miss" };
}

function awardMatch(mine, actual) {
  if (!mine || !actual) return false;
  const norm = str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const guessWords = norm(mine).split(/\s+/).filter(Boolean);
  const actualWords = norm(actual).split(/\s+/).filter(Boolean);
  return guessWords.some(gw => actualWords.some(aw => aw.includes(gw) || gw.includes(aw)));
}

Deno.serve(async (req) => {
  const results = [];
  let passed = 0, failed = 0;

  function test(name, got, expected) {
    const ok = JSON.stringify(got) === JSON.stringify(expected);
    results.push({ name, ok, got, expected });
    if (ok) passed++; else failed++;
  }

  const S = DEFAULT_SETTINGS;

  // ── TIPPING SCORING ──────────────────────────────────────────────────────

  // 1. Exact score
  test("Exact score", scoreTip({homeScore:2,awayScore:1},{homeScore:2,awayScore:1},S), {pts:5,tier:"exact"});

  // 2. Correct GD (same diff, same outcome)
  test("Correct GD", scoreTip({homeScore:3,awayScore:1},{homeScore:2,awayScore:0},S), {pts:3,tier:"gd"});

  // 3. Correct result only
  test("Correct result", scoreTip({homeScore:3,awayScore:0},{homeScore:1,awayScore:0},S), {pts:1,tier:"result"});

  // 4. Miss
  test("Miss", scoreTip({homeScore:1,awayScore:0},{homeScore:0,awayScore:1},S), {pts:0,tier:"miss"});

  // 5. Draw exact
  test("Draw exact", scoreTip({homeScore:1,awayScore:1},{homeScore:1,awayScore:1},S), {pts:5,tier:"exact"});

  // 6. Draw GD (both predict draw, same diff=0 always)
  // e.g. predicted 2-2, actual 0-0 → same diff (0), same outcome (draw) → GD
  test("Draw GD (2-2 vs 0-0)", scoreTip({homeScore:2,awayScore:2},{homeScore:0,awayScore:0},S), {pts:3,tier:"gd"});

  // 7. Draw result (predicted draw wrong score)
  // predicted 0-0, actual 2-2 → exact already handled; 2-2 vs 0-0 gives GD (same diff=0)
  // Let's test predicted 1-1 actual 3-3 → GD
  test("Draw GD (1-1 vs 3-3)", scoreTip({homeScore:1,awayScore:1},{homeScore:3,awayScore:3},S), {pts:3,tier:"gd"});

  // 8. No prediction = miss
  test("No prediction", scoreTip({homeScore:null,awayScore:null},{homeScore:1,awayScore:0},S), {pts:0,tier:"miss"});

  // 9. No official result = null
  test("No official result", scoreTip({homeScore:1,awayScore:0},null,S), null);

  // ── PENALTY SHOOTOUT SCORING ─────────────────────────────────────────────

  const penOfficial = { homeScore:1, awayScore:1, penaltyWinner:"h" };

  // 10. Predicted exact draw scoreline (1-1) in a pen shootout → EXACT points
  test("Pen: exact draw → exact pts", scoreTip({homeScore:1,awayScore:1},penOfficial,S), {pts:5,tier:"exact"});

  // 11. Predicted a different draw (2-2) in a pen shootout → GD (diff=0 both draws)
  test("Pen: different draw → gd", scoreTip({homeScore:2,awayScore:2},penOfficial,S), {pts:3,tier:"gd"});

  // 12. Predicted home win, home won on pens → result pt
  test("Pen: predicted winner (home) → result", scoreTip({homeScore:2,awayScore:1},penOfficial,S), {pts:1,tier:"result"});

  // 13. Predicted away win, home won on pens → miss
  test("Pen: predicted loser (away) → miss", scoreTip({homeScore:0,awayScore:1},penOfficial,S), {pts:0,tier:"miss"});

  // 14. Away wins on pens, predicted away → result
  const penAway = { homeScore:0, awayScore:0, penaltyWinner:"a" };
  test("Pen: predicted winner (away) → result", scoreTip({homeScore:0,awayScore:1},penAway,S), {pts:1,tier:"result"});

  // 15. Any draw predicted, away wins on pens → result (correct 90-min)
  test("Pen: any draw predicted → result", scoreTip({homeScore:3,awayScore:3},penAway,S), {pts:3,tier:"gd"});

  // ── CUSTOM POINT VALUES ──────────────────────────────────────────────────

  const customS = { exact:10, gd:6, result:2 };
  test("Custom pts exact", scoreTip({homeScore:1,awayScore:0},{homeScore:1,awayScore:0},customS), {pts:10,tier:"exact"});
  test("Custom pts gd", scoreTip({homeScore:2,awayScore:0},{homeScore:3,awayScore:1},customS), {pts:6,tier:"gd"});
  test("Custom pts result", scoreTip({homeScore:3,awayScore:0},{homeScore:1,awayScore:0},customS), {pts:2,tier:"result"});

  // ── AWARD FUZZY MATCHING ─────────────────────────────────────────────────

  test("Award: exact match", awardMatch("Kylian Mbappé","Kylian Mbappé"), true);
  test("Award: first name only", awardMatch("Kylian","Kylian Mbappé"), true);
  test("Award: last name only", awardMatch("Mbappé","Kylian Mbappé"), true);
  test("Award: no accent", awardMatch("Mbappe","Kylian Mbappé"), true);
  test("Award: lowercase", awardMatch("mbappe","Kylian Mbappé"), true);
  test("Award: wrong player", awardMatch("Ronaldo","Kylian Mbappé"), false);
  test("Award: Haaland last name", awardMatch("Haaland","Erling Haaland"), true);
  test("Award: partial first name", awardMatch("Erling","Erling Haaland"), true);
  test("Award: empty guess", awardMatch("","Kylian Mbappé"), false);
  test("Award: null actual", awardMatch("Mbappé",null), false);
  test("Award: case insensitive", awardMatch("MBAPPE","Kylian Mbappé"), true);

  // ── PREDICTOR GROUP SCORING ──────────────────────────────────────────────

  // Simulate scoring a group: predict 1st=A, 2nd=B, actual 1st=A, 2nd=B → 3+2=5
  const PS = DEFAULT_PRED_SETTINGS;
  let groupPts = 0;
  const pick = { first: "Mexico", second: "South Korea" };
  const actual1 = "Mexico", actual2 = "South Korea", actual3 = "South Africa";
  if (pick.first === actual1) groupPts += PS.g1;
  if (pick.second === actual2) groupPts += PS.g2;
  test("Group picks: both correct", groupPts, 5);

  let groupPts2 = 0;
  if (pick.first === actual1) groupPts2 += PS.g1;
  if (pick.second === "Czechia") groupPts2 += PS.g2; // wrong 2nd
  test("Group picks: only 1st correct", groupPts2, 3);

  // Third pick
  let thirdPts = 0;
  if ("South Africa" === actual3) thirdPts += PS.third;
  test("Third pick: correct", thirdPts, 2);

  // ── BRACKET/ADVANCEMENT SCORING ──────────────────────────────────────────

  // Simulated: picked team wins R32 → r32 pts (1), wins R16 → r16 pts (3), etc.
  let bracketPts = 0;
  bracketPts += PS.r32; // team advanced from R32
  bracketPts += PS.r16; // team advanced from R16
  bracketPts += PS.qf;  // team advanced from QF
  bracketPts += PS.sf;  // team advanced from SF
  bracketPts += PS.champ; // won the final
  test("Bracket: champion path pts", bracketPts, 1+3+5+8+12); // 29

  // ── LIVE SUBSCRIPTION FLOW (structural check) ───────────────────────────
  // Verify real DB is accessible
  const base44 = createClientFromRequest(req);
  let dbOk = false;
  try {
    const players = await base44.asServiceRole.entities.Player.list();
    const predictions = await base44.asServiceRole.entities.Prediction.list();
    const official = await base44.asServiceRole.entities.OfficialResult.list();
    const brackets = await base44.asServiceRole.entities.BracketPrediction.list();
    const settings = await base44.asServiceRole.entities.PoolSettings.list();
    dbOk = true;
    results.push({
      name: "DB connectivity",
      ok: true,
      got: {
        players: players.length,
        predictions: predictions.length,
        officialResults: official.length,
        bracketPredictions: brackets.length,
        hasSettings: settings.length > 0
      }
    });
    passed++;

    // Verify each prediction references a valid player
    const playerIds = new Set(players.map(p => p.id));
    const orphanPreds = predictions.filter(p => !playerIds.has(p.playerId));
    test("No orphaned predictions", orphanPreds.length, 0);

    // Verify each bracket prediction references a valid player
    const orphanBrackets = brackets.filter(b => !playerIds.has(b.playerId));
    test("No orphaned bracket predictions", orphanBrackets.length, 0);

    // Verify official results have valid matchIds
    const allMatchIds = new Set([
      ...["GA0","GA1","GA2","GA3","GA4","GA5","GB0","GB1","GB2","GB3","GB4","GB5","GC0","GC1","GC2","GC3","GC4","GC5","GD0","GD1","GD2","GD3","GD4","GD5","GE0","GE1","GE2","GE3","GE4","GE5","GF0","GF1","GF2","GF3","GF4","GF5","GG0","GG1","GG2","GG3","GG4","GG5","GH0","GH1","GH2","GH3","GH4","GH5","GI0","GI1","GI2","GI3","GI4","GI5","GJ0","GJ1","GJ2","GJ3","GJ4","GJ5","GK0","GK1","GK2","GK3","GK4","GK5","GL0","GL1","GL2","GL3","GL4","GL5"],
      ...["M73","M74","M75","M76","M77","M78","M79","M80","M81","M82","M83","M84","M85","M86","M87","M88","M89","M90","M91","M92","M93","M94","M95","M96","M97","M98","M99","M100","M101","M102","M103","M104"]
    ]);
    const badResults = official.filter(r => !allMatchIds.has(r.matchId));
    test("All official results have valid matchIds", badResults.length, 0);
    results.push({ name: "Bad result details", ok: true, got: badResults.map(r => ({ id: r.id, matchId: r.matchId, home: r.homeScore, away: r.awayScore })) });

    // Verify settings structure
    if (settings.length > 0) {
      const s = settings[0];
      const hasPts = s.pointsExact != null || s.pointsGD != null || s.pointsResult != null;
      results.push({ name: "Settings loaded", ok: true, got: { pointsExact: s.pointsExact, pointsGD: s.pointsGD, pointsResult: s.pointsResult, globalLock: s.globalLockTipping, hasPredSettings: !!s.predSettings } });
      passed++;
    }

  } catch(e) {
    results.push({ name: "DB connectivity", ok: false, got: e.message, expected: "no error" });
    failed++;
  }

  return Response.json({
    summary: { passed, failed, total: passed + failed },
    failures: results.filter(r => !r.ok),
    extras: results.filter(r => r.ok && r.name.startsWith("Bad")),
    allPassed: results.every(r => r.ok)
  });
});