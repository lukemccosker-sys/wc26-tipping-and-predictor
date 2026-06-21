import React, { useState } from "react";
import Flag from "@/lib/flags";
import { GROUP_MATCHES, KO_MATCHES, ROUND_NAME, scoreTip } from "@/lib/wc2026data";
import ComparisonHub from "./ComparisonHub";

const STAGES = [
  ["all","All"],["group","Groups"],["R32","R32"],["R16","R16"],["QF","QF"],["SF","SF"],["3rd","3rd"],["F","Final"]
];

function getBestPred(candidates) {
  return candidates.reduce((best, pr) => {
    if (!best) return pr;
    if (pr.status === 'final' && best.status !== 'final') return pr;
    if (best.status === 'final' && pr.status !== 'final') return best;
    const prTime = pr.created_date ? new Date(pr.created_date).getTime() : 0;
    const bestTime = best.created_date ? new Date(best.created_date).getTime() : 0;
    return prTime > bestTime ? pr : best;
  }, null);
}

export default function TipsRoom({ players, predictions, officialResults, player, onRefresh, loading, poolSettings }) {
  const [stage, setStage] = useState("all");
  const [expandedMatches, setExpandedMatches] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [comparePlayer, setComparePlayer] = useState("");
  const [playerViewOpen, setPlayerViewOpen] = useState(false);
  const [expandedPlayerSections, setExpandedPlayerSections] = useState({});

  const toggleMatch = (id) => setExpandedMatches(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleGroup = (key) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  const togglePlayerSection = (key) => setExpandedPlayerSections(prev => ({ ...prev, [key]: !prev[key] }));

  const settings = {
    exact: poolSettings?.pointsExact ?? 5,
    gd: poolSettings?.pointsGD ?? 3,
    result: poolSettings?.pointsResult ?? 1,
  };

  // Deduplicate officialResults by matchId (keep latest by created_date)
  const dedupedResults = Object.values(
    officialResults.reduce((acc, r) => {
      const existing = acc[r.matchId];
      if (!existing) { acc[r.matchId] = r; }
      else {
        const rTime = r.created_date ? new Date(r.created_date).getTime() : 0;
        const eTime = existing.created_date ? new Date(existing.created_date).getTime() : 0;
        if (rTime > eTime) acc[r.matchId] = r;
      }
      return acc;
    }, {})
  );

  // Build revealed matches (only those with official result)
  const revealed = [];
  for (const res of dedupedResults) {
    if (res.homeScore == null || res.awayScore == null) continue;
    const gm = GROUP_MATCHES.find(m => m.id === res.matchId);
    const km = KO_MATCHES.find(m => m.id === res.matchId);
    if (!gm && !km) continue;
    const m = gm || km;
    const isGroup = !!gm;

    if (stage !== "all") {
      if (isGroup && stage !== "group") continue;
      if (!isGroup && km.round !== stage) continue;
    }

    const playerTips = players.map(p => {
      const candidates = predictions.filter(pr => pr.playerId === p.id && pr.matchId === res.matchId);
      const pred = getBestPred(candidates);
      const fakePred = pred ? { homeScore: pred.homeScore, awayScore: pred.awayScore } : null;
      const scored = fakePred ? scoreTip(fakePred, { matchId: res.matchId, homeScore: res.homeScore, awayScore: res.awayScore }, settings) : { pts: 0, tier: "miss" };
      return { ...p, pred, pts: scored?.pts ?? 0, tier: scored?.tier ?? "miss" };
    }).sort((a, b) => b.pts - a.pts);

    revealed.push({
      id: res.matchId,
      home: m.home, away: m.away,
      official: res,
      isGroup,
      group: isGroup ? gm.group : null,
      matchday: isGroup ? gm.matchday : null,
      stage: isGroup ? "group" : km.round,
      round: isGroup ? null : km.round,
      label: isGroup ? `Group ${gm.group}` : `M${m.id.slice(1)}`,
      players: playerTips,
    });
  }
  revealed.sort((a, b) => a.id.localeCompare(b.id));

  // Group the revealed matches
  // For group stage: bucket by matchday (1/2/3); for KO: bucket by round
  const groupBuckets = {}; // key -> { label, color, matches[] }
  const MD_COLORS = { 1: "#12b3a6", 2: "#2f8bff", 3: "#7b54f0" };

  for (const m of revealed) {
    let key, label, color;
    if (m.isGroup) {
      key = `md-${m.matchday}`;
      label = `Group Stage · Matchday ${m.matchday}`;
      color = MD_COLORS[m.matchday] || "#12b3a6";
    } else {
      key = `ko-${m.round}`;
      label = ROUND_NAME[m.round] || m.round;
      color = { R32:"#ff3d7f", R16:"#ff7a2f", QF:"#12b3a6", SF:"#2f8bff", "3rd":"#f0a400", F:"#7b54f0" }[m.round] || "#9aa0ad";
    }
    if (!groupBuckets[key]) groupBuckets[key] = { key, label, color, matches: [] };
    groupBuckets[key].matches.push(m);
  }

  // Order buckets: matchday 1-3 first, then KO rounds in order
  const koRoundOrder = ["R32","R16","QF","SF","3rd","F"];
  const bucketKeys = [
    ...[1, 2, 3].map(md => `md-${md}`).filter(k => groupBuckets[k]),
    ...koRoundOrder.map(r => `ko-${r}`).filter(k => groupBuckets[k]),
  ];

  // Build all-games view for selected player
  const allMatches = [...GROUP_MATCHES, ...KO_MATCHES];
  const selectedPlayerObj = players.find(p => p.id === selectedPlayer);
  const playerAllTips = selectedPlayerObj ? (() => {
    const results = [];
    for (const res of dedupedResults) {
      if (res.homeScore == null || res.awayScore == null) continue;
      const m = allMatches.find(x => x.id === res.matchId);
      if (!m) continue;
      const candidates = predictions.filter(pr => pr.playerId === selectedPlayer && pr.matchId === res.matchId);
      const pred = getBestPred(candidates);
      const scored = pred ? scoreTip({ homeScore: pred.homeScore, awayScore: pred.awayScore }, { homeScore: res.homeScore, awayScore: res.awayScore }, settings) : { pts: 0, tier: "miss" };
      results.push({ matchId: res.matchId, home: m.home, away: m.away, official: res, pred, pts: scored?.pts ?? 0, tier: scored?.tier ?? "miss" });
    }
    results.sort((a, b) => a.matchId.localeCompare(b.matchId));
    return results;
  })() : [];
  const playerTotal = playerAllTips.reduce((s, r) => s + r.pts, 0);

  // Bucket the selected player's tips by matchday (group stage) then KO round
  const KO_ROUND_ORDER = ["R32", "R16", "QF", "SF", "3rd", "F"];
  const KO_ROUND_COLOR = { R32: "#ff3d7f", R16: "#ff7a2f", QF: "#12b3a6", SF: "#2f8bff", "3rd": "#f0a400", F: "#7b54f0" };
  const MD_COLOR = { 1: "#12b3a6", 2: "#2f8bff", 3: "#7b54f0" };
  const playerTipBuckets = (() => {
    const buckets = {};
    for (const r of playerAllTips) {
      const gm = GROUP_MATCHES.find(m => m.id === r.matchId);
      let key, label, order, color;
      if (gm) {
        key = `md-${gm.matchday}`;
        label = `Group Stage · Matchday ${gm.matchday}`;
        order = gm.matchday;
        color = MD_COLOR[gm.matchday] || "#12b3a6";
      } else {
        const km = KO_MATCHES.find(m => m.id === r.matchId);
        const round = km?.round || "F";
        key = `ko-${round}`;
        label = ROUND_NAME[round] || round;
        order = 10 + KO_ROUND_ORDER.indexOf(round);
        color = KO_ROUND_COLOR[round] || "#9aa0ad";
      }
      if (!buckets[key]) buckets[key] = { key, label, order, color, tips: [], pts: 0 };
      buckets[key].tips.push(r);
      buckets[key].pts += r.pts;
    }
    return Object.values(buckets).sort((a, b) => a.order - b.order);
  })();

  const renderMatch = (m) => {
    const filteredPlayers = selectedPlayer
      ? m.players.filter(p => p.id === selectedPlayer)
      : m.players;
    const top = Math.max(...filteredPlayers.map(p => p.pts), 0);
    const isOpen = !!expandedMatches[m.id];
    return (
      <div className="card rev-game" key={m.id} style={{ borderRadius: 12, marginBottom: 6 }}>
        <div
          className="rev-head"
          onClick={() => toggleMatch(m.id)}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          <div className="rev-fix" style={{ flexWrap: "nowrap", alignItems: "center", gap: 6, minWidth: 0, flex: 1, overflow: "hidden" }}>
            {m.home && m.away ? (
              <>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}><Flag name={m.home} size={14} />{m.home}</span>
                <span className="rev-ft" style={{ fontSize: 13, padding: "1px 7px", flexShrink: 0 }}>{m.official.homeScore}–{m.official.awayScore}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{m.away}<Flag name={m.away} size={14} /></span>
              </>
            ) : (
              <>
                <span className="rev-kolabel">{m.label}</span>
                <span className="rev-ft" style={{ fontSize: 13, padding: "1px 7px" }}>{m.official.homeScore}–{m.official.awayScore}</span>
              </>
            )}
          </div>
          <span style={{ fontSize: 12, color: "#9aa0ad", fontWeight: 800, flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
        </div>
        {isOpen && (
          <table className="tbl rev-tbl">
            <thead><tr><th className="tl">Player</th><th>Their tip</th><th>Pts</th></tr></thead>
            <tbody>
              {filteredPlayers.filter(p => p.pred && p.pred.homeScore != null).length === 0 && (
                <tr><td colSpan="3" className="muted2 ctr">No tip for this game.</td></tr>
              )}
              {filteredPlayers.filter(p => p.pred && p.pred.homeScore != null).map(p => (
                <tr key={p.id} className={`${player && p.id === player.id ? "melb " : ""}${p.pts === top && top > 0 ? "toprow" : ""}`}>
                  <td className="tl">{p.name}{player && p.id === player.id ? " (you)" : ""}</td>
                  <td className="rev-pred"><b>{p.pred.homeScore}–{p.pred.awayScore}</b></td>
                  <td><span className={`pbadge t-${p.tier}`}>{p.pts}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div className="reveal">
      <div className="card pad filter-card">
        <div className="lb-head">
          <div className="gtitle">Tips Room</div>
          <button className={`mini${loading ? " busy" : ""}`} onClick={onRefresh}>{loading ? "…" : "↻ Refresh"}</button>
        </div>
        <div className="muted2">Everyone's tips unlock here the moment the result is posted — no peeking until then.</div>
        <div className="filter-row">
          <span className="flab">Filter</span>
          {STAGES.map(([k, l]) => (
            <button key={k} className={`chip${stage === k ? " on" : ""}`} onClick={() => setStage(k)}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          <div className="rev-count" style={{ margin: 0 }}>{revealed.length} completed {revealed.length === 1 ? "game" : "games"} · {players.length} player{players.length === 1 ? "" : "s"}</div>
          {selectedPlayer && (
            <button
              className="mini"
              onClick={() => { setSelectedPlayer(""); setComparePlayer(""); setPlayerViewOpen(false); }}
              style={{ background: "rgba(255,61,127,.08)", borderColor: "#ffc9dc", color: "#ff3d7f" }}
            >
              ✕ Show all tips
            </button>
          )}
        </div>

        {/* Player lookup */}
        <div style={{ marginTop: 12, borderTop: "1px dashed #e0d2bd", paddingTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#9aa0ad", marginBottom: 7 }}>View a player's tips</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={selectedPlayer}
              onChange={e => { setSelectedPlayer(e.target.value); setPlayerViewOpen(!!e.target.value); setComparePlayer(""); }}
              style={{ flex: 1, minWidth: 160, border: "2px solid #efe3d2", borderRadius: 10, padding: "8px 12px", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: "#fff", color: "#222a3d" }}
            >
              <option value="">— Pick a player —</option>
              {players.slice().sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                <option key={p.id} value={p.id}>{p.name}{player && p.id === player.id ? " (you)" : ""}</option>
              ))}
            </select>
            {selectedPlayer && (
              <button className="mini" onClick={() => setPlayerViewOpen(v => !v)}>
                {playerViewOpen ? "▲ Hide" : "▼ Show"}
              </button>
            )}
          </div>

          {selectedPlayer && (
            <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#9aa0ad", flexShrink: 0 }}>Compare with</span>
              <select
                value={comparePlayer}
                onChange={e => setComparePlayer(e.target.value)}
                style={{ flex: 1, minWidth: 160, border: "2px solid #efe3d2", borderRadius: 10, padding: "7px 12px", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: "#fff", color: "#222a3d" }}
              >
                <option value="">— Nobody —</option>
                {players.slice().sort((a,b) => a.name.localeCompare(b.name)).filter(p => p.id !== selectedPlayer).map(p => (
                  <option key={p.id} value={p.id}>{p.name}{player && p.id === player.id ? " (you)" : ""}</option>
                ))}
              </select>
            </div>
          )}

          {selectedPlayer && comparePlayer && (
            <ComparisonHub
              players={players}
              predictions={predictions}
              officialResults={officialResults}
              settings={settings}
              currentPlayer={player}
              playerAId={selectedPlayer}
              playerBId={comparePlayer}
            />
          )}

          {selectedPlayer && playerViewOpen && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{selectedPlayerObj?.name} — all tips</span>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, color: "#ff3d7f" }}>{playerTotal}pts</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                {[
                  { label: "Exact", count: playerAllTips.filter(r => r.tier === "exact").length, color: "#2cb551" },
                  { label: "Win+GD", count: playerAllTips.filter(r => r.tier === "gd").length, color: "#12b3a6" },
                  { label: "Winner", count: playerAllTips.filter(r => r.tier === "result").length, color: "#ffb020" },
                  { label: "Missed", count: playerAllTips.filter(r => r.tier === "miss" && r.pred).length, color: "#b9b1a3" },
                ].map(({ label, count, color }) => (
                  <div key={label} style={{ background: `${color}18`, border: `1.5px solid ${color}44`, borderRadius: 8, padding: "5px 11px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, color, lineHeight: 1 }}>{count}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color, opacity: 0.8, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
                  </div>
                ))}
              </div>
              {playerAllTips.length === 0 && (
                <div className="muted2 ctr" style={{ padding: "12px 0" }}>No scored games yet.</div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {playerTipBuckets.map(bucket => {
                  const isOpen = !!expandedPlayerSections[bucket.key];
                  return (
                    <div key={bucket.key} style={{ border: `1px solid ${bucket.color}33`, borderRadius: 11, overflow: "hidden" }}>
                      <div
                        onClick={() => togglePlayerSection(bucket.key)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                          padding: "9px 12px", cursor: "pointer", userSelect: "none",
                          background: `linear-gradient(100deg, ${bucket.color}1f, ${bucket.color}08)`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                          <div style={{ width: 4, height: 22, borderRadius: 4, background: bucket.color, flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: 13, color: "#222a3d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bucket.label}</div>
                            <div style={{ fontSize: 10.5, color: "#9aa0ad", fontWeight: 700 }}>{bucket.tips.length} {bucket.tips.length === 1 ? "game" : "games"}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, color: bucket.color }}>{bucket.pts}pts</span>
                          <span style={{ fontSize: 12, color: "#9aa0ad", fontWeight: 800 }}>{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </div>
                      {isOpen && (
                        <table className="tbl rev-tbl" style={{ width: "100%" }}>
                          <thead>
                            <tr><th className="tl">Match</th><th>Result</th><th>Their tip</th><th>Pts</th></tr>
                          </thead>
                          <tbody>
                            {bucket.tips.map(r => (
                              <tr key={r.matchId} style={{ borderTop: "1px solid #f4ebdf" }}>
                                <td className="tl" style={{ fontSize: 11.5, fontWeight: 600 }}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    <Flag name={r.home} size={12} />{r.home} v {r.away}<Flag name={r.away} size={12} />
                                  </span>
                                </td>
                                <td style={{ fontWeight: 800, fontSize: 13 }}>{r.official.homeScore}–{r.official.awayScore}</td>
                                <td className="rev-pred">
                                  {r.pred ? <b>{r.pred.homeScore}–{r.pred.awayScore}</b> : <span style={{ color: "#9aa0ad" }}>—</span>}
                                </td>
                                <td><span className={`pbadge t-${r.tier}`}>{r.pts}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {revealed.length === 0 && (
        <div className="card pad empty">
          <div className="empty-em">⚽️</div>
          <div className="empty-t">No games revealed yet</div>
          <div className="muted2">Once a result is posted, every player's tip shows up here automatically.</div>
        </div>
      )}

      {/* Grouped & collapsible buckets */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {bucketKeys.map(key => {
          const bucket = groupBuckets[key];
          const isOpen = !!expandedGroups[key];
          return (
            <div key={key} className="card" style={{ overflow: "hidden" }}>
              {/* Group header */}
              <div
                onClick={() => toggleGroup(key)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", cursor: "pointer", userSelect: "none",
                  background: `linear-gradient(100deg, ${bucket.color}22, ${bucket.color}08)`,
                  borderBottom: isOpen ? `1px solid ${bucket.color}33` : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 28, borderRadius: 4, background: bucket.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, letterSpacing: ".03em", color: "#222a3d" }}>{bucket.label}</div>
                    <div style={{ fontSize: 11, color: "#9aa0ad", fontWeight: 700 }}>{bucket.matches.length} {bucket.matches.length === 1 ? "match" : "matches"}</div>
                  </div>
                </div>
                <span style={{ fontSize: 13, color: "#9aa0ad", fontWeight: 800 }}>{isOpen ? "▲" : "▼"}</span>
              </div>

              {/* Matches inside */}
              {isOpen && (
                <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 0 }}>
                  {bucket.matches.map(renderMatch)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}