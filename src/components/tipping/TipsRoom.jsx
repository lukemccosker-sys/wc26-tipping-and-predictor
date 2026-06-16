import React, { useState } from "react";
import Flag from "@/lib/flags";
import { GROUP_MATCHES, KO_MATCHES, ROUND_NAME, scoreTip } from "@/lib/wc2026data";

const STAGES = [
  ["all","All"],["group","Groups"],["R32","R32"],["R16","R16"],["QF","QF"],["SF","SF"],["3rd","3rd"],["F","Final"]
];

export default function TipsRoom({ players, predictions, officialResults, player, onRefresh, loading, poolSettings }) {
  const [stage, setStage] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerViewOpen, setPlayerViewOpen] = useState(false);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

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

    // filter by stage
    if (stage !== "all") {
      if (isGroup && stage !== "group") continue;
      if (!isGroup && km.round !== stage) continue;
    }

    const playerTips = players.map(p => {
      // Pick the latest prediction for this player+match (same logic as leaderboard dedup)
      const candidates = predictions.filter(pr => pr.playerId === p.id && pr.matchId === res.matchId);
      const pred = candidates.reduce((best, pr) => {
        if (!best) return pr;
        const prTime = pr.created_date ? new Date(pr.created_date).getTime() : 0;
        const bestTime = best.created_date ? new Date(best.created_date).getTime() : 0;
        return prTime > bestTime ? pr : best;
      }, null);
      const fakeOfficial = { matchId: res.matchId, homeScore: res.homeScore, awayScore: res.awayScore };
      const fakePred = pred ? { homeScore: pred.homeScore, awayScore: pred.awayScore } : null;
      const scored = fakePred ? scoreTip(fakePred, fakeOfficial, settings) : { pts: 0, tier: "miss" };
      return { ...p, pred, pts: scored?.pts ?? 0, tier: scored?.tier ?? "miss" };
    }).sort((a, b) => b.pts - a.pts);

    revealed.push({
      id: res.matchId,
      home: m.home, away: m.away,
      official: res,
      stage: isGroup ? "group" : km.round,
      round: isGroup ? null : km.round,
      label: isGroup ? `Group ${gm.group}` : `M${m.id.slice(1)}`,
      players: playerTips,
    });
  }

  // sort by match id for consistency
  revealed.sort((a, b) => a.id.localeCompare(b.id));

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
      const pred = candidates.reduce((best, pr) => {
        if (!best) return pr;
        const prTime = pr.created_date ? new Date(pr.created_date).getTime() : 0;
        const bestTime = best.created_date ? new Date(best.created_date).getTime() : 0;
        return prTime > bestTime ? pr : best;
      }, null);
      const scored = pred ? scoreTip({ homeScore: pred.homeScore, awayScore: pred.awayScore }, { homeScore: res.homeScore, awayScore: res.awayScore }, settings) : { pts: 0, tier: "miss" };
      results.push({ matchId: res.matchId, home: m.home, away: m.away, official: res, pred, pts: scored?.pts ?? 0, tier: scored?.tier ?? "miss" });
    }
    results.sort((a, b) => a.matchId.localeCompare(b.matchId));
    return results;
  })() : [];
  const playerTotal = playerAllTips.reduce((s, r) => s + r.pts, 0);

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

      <div className="rev-list">
        {revealed.map(m => {
          const top = Math.max(...m.players.map(p => p.pts), 0);
          const isOpen = !!expanded[m.id];
          return (
            <div className="card rev-game" key={m.id}>
              <div
                className="rev-head"
                onClick={() => toggleExpand(m.id)}
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
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <div className="rev-tag">{m.stage === "group" ? m.label : ROUND_NAME[m.round]}</div>
                  <span style={{ fontSize: 12, color: "#9aa0ad", fontWeight: 800 }}>{isOpen ? "▲" : "▼"}</span>
                </div>
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
        })}
      </div>
    </div>
  );
}