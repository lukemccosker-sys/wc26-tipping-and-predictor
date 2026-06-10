import React, { useState } from "react";
import Flag from "@/lib/flags";
import { GROUP_MATCHES, KO_MATCHES, ROUND_NAME, scoreTip } from "@/lib/wc2026data";

const STAGES = [
  ["all","All"],["group","Groups"],["R32","R32"],["R16","R16"],["QF","QF"],["SF","SF"],["3rd","3rd"],["F","Final"]
];

export default function TipsRoom({ players, predictions, officialResults, player, onRefresh, loading, poolSettings }) {
  const [stage, setStage] = useState("all");

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
      const pred = predictions.find(pr => pr.playerId === p.id && pr.matchId === res.matchId);
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
          return (
            <div className="card rev-game" key={m.id}>
              <div className="rev-head">
                <div className="rev-fix">
                  {m.home && m.away ? (
                    <>
                      <span className="tlteam"><Flag name={m.home} size={18} />{m.home}</span>
                      <span className="rev-ft">{m.official.homeScore}–{m.official.awayScore}</span>
                      <span className="tlteam">{m.away}<Flag name={m.away} size={18} /></span>
                    </>
                  ) : (
                    <>
                      <span className="rev-kolabel">{m.label}</span>
                      <span className="rev-ft">{m.official.homeScore}–{m.official.awayScore}</span>
                    </>
                  )}
                </div>
                <div className="rev-tag">{m.stage === "group" ? m.label : ROUND_NAME[m.round]}</div>
              </div>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}