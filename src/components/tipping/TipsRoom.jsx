import React, { useState } from "react";
import Flag from "@/lib/flags";
import { GROUP_MATCHES, KO_MATCHES, ROUND_NAME, scoreTip } from "@/lib/wc2026data";

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
  const [playerViewOpen, setPlayerViewOpen] = useState(false);

  const toggleMatch = (id) => setExpandedMatches(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleGroup = (key) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const settings = {
    exact: poolSettings?.pointsExact ?? 5,
    gd: poolSettings?.pointsGD ?? 3,
    result: poolSettings?.pointsResult ?? 1,
  };

  // Build revealed matches (only those with official result)
  const revealed = [];
  for (const res of officialResults) {
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
      stage: isGroup ? "group" : km.round,
      round: isGroup ? null : km.round,
      label: isGroup ? `Group ${gm.group}` : `M${m.id.slice(1)}`,
      players: playerTips,
    });
  }
  revealed.sort((a, b) => a.id.localeCompare(b.id));

  // Group the revealed matches
  // For group stage: bucket by group letter; for KO: bucket by round
  const groupBuckets = {}; // key -> { label, color, matches[] }
  const GROUP_COLORS = ["#ff3d7f","#ff7a2f","#12b3a6","#2f8bff","#7b54f0","#e8456e","#f0a400","#19a673","#4f6dff","#b14ce0","#ff5a4d","#0fb5c4"];
  const GL = ["A","B","C","D","E","F","G","H","I","J","K","L"];

  for (const m of revealed) {
    let key, label, color;
    if (m.isGroup) {
      key = `group-${m.group}`;
      label = `Group ${m.group}`;
      color = GROUP_COLORS[GL.indexOf(m.group)] || "#9aa0ad";
    } else {
      key = `ko-${m.round}`;
      label = ROUND_NAME[m.round] || m.round;
      color = { R32:"#ff3d7f", R16:"#ff7a2f", QF:"#12b3a6", SF:"#2f8bff", "3rd":"#f0a400", F:"#7b54f0" }[m.round] || "#9aa0ad";
    }
    if (!groupBuckets[key]) groupBuckets[key] = { key, label, color, matches: [] };
    groupBuckets[key].matches.push(m);
  }

  // Order buckets: groups A-L first, then KO rounds in order
  const koRoundOrder = ["R32","R16","QF","SF","3rd","F"];
  const bucketKeys = [
    ...GL.map(L => `group-${L}`).filter(k => groupBuckets[k]),
    ...koRoundOrder.map(r => `ko-${r}`).filter(k => groupBuckets[k]),
  ];

  // Build all-games view for selected player
  const allMatches = [...GROUP_MATCHES, ...KO_MATCHES];
  const selectedPlayerObj = players.find(p => p.id === selectedPlayer);
  const playerAllTips = selectedPlayerObj ? (() => {
    const results = [];
    for (const res of officialResults) {
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

  const renderMatch = (m) => {
    const top = Math.max(...m.players.map(p => p.pts), 0);
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
              {m.players.filter(p => p.pred && p.pred.homeScore != null).length === 0 && (
                <tr><td colSpan="3" className="muted2 ctr">Nobody tipped this game.</td></tr>
              )}
              {m.players.filter(p => p.pred && p.pred.homeScore != null).map(p => (
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
        <div className="rev-count">{revealed.length} completed {revealed.length === 1 ? "game" : "games"} · {players.length} player{players.length === 1 ? "" : "s"}</div>

        {/* Player lookup */}
        <div style={{ marginTop: 12, borderTop: "1px dashed #e0d2bd", paddingTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#9aa0ad", marginBottom: 7 }}>View a player's tips</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={selectedPlayer}
              onChange={e => { setSelectedPlayer(e.target.value); setPlayerViewOpen(!!e.target.value); }}
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

          {selectedPlayer && playerViewOpen && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{selectedPlayerObj?.name} — all tips</span>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, color: "#ff3d7f" }}>{playerTotal}pts</span>
              </div>
              <table className="tbl rev-tbl" style={{ width: "100%" }}>
                <thead>
                  <tr><th className="tl">Match</th><th>Result</th><th>Their tip</th><th>Pts</th></tr>
                </thead>
                <tbody>
                  {playerAllTips.length === 0 && (
                    <tr><td colSpan="4" className="muted2 ctr">No scored games yet.</td></tr>
                  )}
                  {playerAllTips.map(r => (
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