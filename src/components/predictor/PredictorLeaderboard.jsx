import React from "react";
import Flag from "@/lib/flags";
import { PredictorScoringCard } from "@/components/ScoringCard";

export default function PredictorLeaderboard({ predLB, player, predSettings, onRefresh, loading, isAdmin, onSavePredSettings }) {
  return (
    <div className="board">
      <div className="card pad" style={{ gridColumn: "1/-1" }}>
        <div className="lb-head">
          <div className="gtitle">Predictor standings</div>
          <button className={`mini${loading ? " busy" : ""}`} onClick={onRefresh}>{loading ? "…" : "↻ Refresh"}</button>
        </div>
        <div className="muted2">Updates live as official results come in.</div>
        <table className="tbl lb pred-lb">
          <thead>
            <tr>
              <th></th>
              <th className="tl">Player</th>
              <th>Groups</th>
              <th>Bracket</th>
              <th>Awards</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {predLB.length === 0 && (
              <tr><td colSpan="6" className="muted2 ctr">No points yet — picks score once official results come in.</td></tr>
            )}
            {predLB.map((r, i) => (
              <tr key={r.id} className={player && r.id === player.id ? "melb" : ""}>
                <td className="pos">{i + 1}</td>
                <td className="tl">
                  {r.name}
                  {r.isAdmin && <span className="lb-crown">👑</span>}
                  {player && r.id === player.id && " (you)"}
                </td>
                <td>{r.groupPts || 0}</td>
                <td>{r.bracketPts || 0}</td>
                <td>{r.awardPts || 0}</td>
                <td className="pts">{r.total || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="champ-list">
          <div className="champ-h">🏆 Predicted champions</div>
          {predLB.map(r => (
            <div className="champ-row" key={r.id}>
              <span className="champ-who">{r.name}{player && r.id === player.id ? " (you)" : ""}</span>
              {r.champion
                ? <span className="champ-team"><Flag name={r.champion} size={18} /> {r.champion}</span>
                : <span className="champ-pending">— not predicted yet</span>}
            </div>
          ))}
        </div>

      </div>

      <PredictorScoringCard predSettings={predSettings} isAdmin={isAdmin} onSave={onSavePredSettings} />
    </div>
  );
}