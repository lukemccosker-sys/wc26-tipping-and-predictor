import React from "react";
import Flag from "@/lib/flags";
import { TippingScoringCard } from "@/components/ScoringCard";

export default function Leaderboard({ leaderboard, player, onRefresh, loading, poolSettings, isAdmin, onSaveSettings }) {
  return (
    <div className="board">
      <div className="card pad lb-card">
        <div className="lb-head">
          <div className="gtitle">Leaderboard</div>
          <button className={`mini${loading ? " busy" : ""}`} onClick={onRefresh}>{loading ? "…" : "↻ Refresh"}</button>
        </div>
        <div className="muted2">Ranked by total points.</div>
        <table className="tbl lb">
          <thead>
            <tr><th></th><th className="tl">Player</th><th>Pts</th><th>Exact</th><th>GD</th><th>Win</th></tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 && (
              <tr><td colSpan="6" className="muted2 ctr">No scores yet — tips count once results come in.</td></tr>
            )}
            {leaderboard.map((r, i) => (
              <tr key={r.id} className={player && r.id === player.id ? "melb" : ""}>
                <td className="pos">{i + 1}</td>
                <td className="tl">
                  {r.name}
                  {r.isAdmin && <span className="lb-crown">👑</span>}
                  {player && r.id === player.id && " (you)"}
                </td>
                <td className="pts">{r.total || 0}</td>
                <td>{r.counts?.exact || 0}</td>
                <td>{r.counts?.gd || 0}</td>
                <td>{r.counts?.result || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TippingScoringCard poolSettings={poolSettings} isAdmin={isAdmin} onSave={onSaveSettings} />

      {player && (
        <div className="card pad">
          <div className="gtitle">Your card</div>
          <div className="bigtotal">
            {leaderboard.find(r => r.id === player.id)?.total || 0}
            <span>pts</span>
          </div>
          <div className="cnts">
            <div className="cnt exact"><b>{leaderboard.find(r => r.id === player.id)?.counts?.exact || 0}</b>exact</div>
            <div className="cnt gd"><b>{leaderboard.find(r => r.id === player.id)?.counts?.gd || 0}</b>win+GD</div>
            <div className="cnt result"><b>{leaderboard.find(r => r.id === player.id)?.counts?.result || 0}</b>winner</div>
            <div className="cnt miss"><b>{leaderboard.find(r => r.id === player.id)?.counts?.miss || 0}</b>missed</div>
          </div>
        </div>
      )}
    </div>
  );
}