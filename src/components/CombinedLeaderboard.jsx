import React from "react";

export default function CombinedLeaderboard({ combinedLB, player, onRefresh, loading }) {
  return (
    <div className="card pad">
      <div className="lb-head">
        <div className="gtitle">Combined Leaderboard</div>
        <button className={`mini${loading ? " busy" : ""}`} onClick={onRefresh}>{loading ? "…" : "↻ Refresh"}</button>
      </div>
      <div className="muted2">Tipping + Predictor points combined.</div>
      <table className="tbl lb">
        <thead>
          <tr>
            <th></th>
            <th className="tl">Player</th>
            <th>Total</th>
            <th>Tipping</th>
            <th>Predictor</th>
          </tr>
        </thead>
        <tbody>
          {combinedLB.length === 0 && (
            <tr><td colSpan="5" className="muted2 ctr">No scores yet.</td></tr>
          )}
          {combinedLB.map((r, i) => (
            <tr key={r.id} className={player && r.id === player.id ? "melb" : ""}>
              <td className="pos">{i + 1}</td>
              <td className="tl">
                {r.name}
                {r.isAdmin && <span className="lb-crown">👑</span>}
                {player && r.id === player.id && " (you)"}
              </td>
              <td className="pts" style={{ color: "#7b54f0", fontWeight: 900 }}>{r.total}</td>
              <td style={{ color: "#ff3d7f" }}>{r.tippingTotal}</td>
              <td style={{ color: "#2f8bff" }}>{r.predictorTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Top 3 podium */}
      {combinedLB.length >= 1 && (
        <div style={{ marginTop: 20, borderTop: "1px dashed #e0d2bd", paddingTop: 16 }}>
          <div className="gtitle" style={{ marginBottom: 12, fontSize: 16 }}>🏆 Combined Podium</div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10 }}>
            {[1, 0, 2].map(idx => {
              const r = combinedLB[idx];
              if (!r) return <div key={idx} style={{ width: 90 }} />;
              const isFirst = idx === 0;
              const podiumConfig = [
                { label: "🥇 1st", height: 90, bg: "linear-gradient(160deg,#ffb020,#ffce3a)", color: "#7a4f00" },
                { label: "🥈 2nd", height: 65, bg: "linear-gradient(160deg,#aab2c0,#c8d0dc)", color: "#3a4050" },
                { label: "🥉 3rd", height: 50, bg: "linear-gradient(160deg,#cd7f32,#e0a060)", color: "#5a3010" },
              ];
              const cfg = podiumConfig[idx];
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: isFirst ? "0 0 100px" : "0 0 84px" }}>
                  <div style={{ fontWeight: 800, fontSize: isFirst ? 13 : 12, textAlign: "center", color: "#222a3d", maxWidth: isFirst ? 100 : 84, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                  <div style={{ fontWeight: 900, fontSize: isFirst ? 18 : 15, color: "#7b54f0" }}>{r.total}pts</div>
                  <div style={{ width: "100%", height: cfg.height, background: cfg.bg, borderRadius: "10px 10px 0 0", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2, boxShadow: "0 8px 20px -8px rgba(0,0,0,.25)" }}>
                    <div style={{ fontSize: isFirst ? 14 : 12, fontWeight: 800, color: cfg.color }}>{cfg.label}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: cfg.color, opacity: .8 }}>{r.tippingTotal}+{r.predictorTotal}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}