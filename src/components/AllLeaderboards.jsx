import React from "react";
import Flag from "@/lib/flags";
import { TippingScoringCard, PredictorScoringCard } from "@/components/ScoringCard";

// ── Tipping Leaderboard ──────────────────────────────────────────────────────
function TippingLB({ leaderboard, player, poolSettings, isAdmin, onSaveSettings }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card pad">
        <div className="gtitle" style={{ marginBottom: 6 }}>🎯 Tipping</div>
        <div className="muted2">Ranked by tipping points.</div>
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
        {player && (() => {
          const me = leaderboard.find(r => r.id === player.id);
          if (!me) return null;
          return (
            <div style={{ marginTop: 14, borderTop: "1px dashed #e0d2bd", paddingTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Your card</div>
              <div className="cnts">
                <div className="cnt exact"><b>{me.counts?.exact || 0}</b>exact</div>
                <div className="cnt gd"><b>{me.counts?.gd || 0}</b>win+GD</div>
                <div className="cnt result"><b>{me.counts?.result || 0}</b>winner</div>
                <div className="cnt miss"><b>{me.counts?.miss || 0}</b>missed</div>
              </div>
            </div>
          );
        })()}
      </div>
      <TippingScoringCard poolSettings={poolSettings} isAdmin={isAdmin} onSave={onSaveSettings} />
    </div>
  );
}

// ── Predictor Leaderboard ────────────────────────────────────────────────────
function PredictorLB({ predLB, player, predSettings, isAdmin, onSavePredSettings }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card pad">
        <div className="gtitle" style={{ marginBottom: 6 }}>🔮 Predictor</div>
        <div className="muted2">Updates live as official results come in.</div>
        <table className="tbl lb pred-lb">
          <thead>
            <tr>
              <th></th><th className="tl">Player</th><th>Groups</th><th>Bracket</th><th>Awards</th><th>Pts</th>
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

// ── Combined Leaderboard ─────────────────────────────────────────────────────
function CombinedLB({ combinedLB, player }) {
  return (
    <div className="card pad">
      <div className="gtitle" style={{ marginBottom: 6 }}>🌟 Combined</div>
      <div className="muted2">Tipping + Predictor points combined.</div>
      <table className="tbl lb">
        <thead>
          <tr>
            <th></th><th className="tl">Player</th><th>Total</th><th>Tipping</th><th>Predictor</th>
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

// ── Main export ──────────────────────────────────────────────────────────────
export default function AllLeaderboards({
  leaderboard, predLB, combinedLB, player,
  poolSettings, predSettings, isAdmin,
  onSaveSettings, onSavePredSettings,
  onRefresh, loading
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 400, textTransform: "uppercase", lineHeight: 1, letterSpacing: ".03em" }}>
            LEADER<span style={{ color: "var(--pink)" }}>BOARDS</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 4 }}>All standings in one place</div>
        </div>
        <button className={`mini${loading ? " busy" : ""}`} onClick={onRefresh}>{loading ? "…" : "↻ Refresh all"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20, alignItems: "start" }}>
        <TippingLB leaderboard={leaderboard} player={player} poolSettings={poolSettings} isAdmin={isAdmin} onSaveSettings={onSaveSettings} />
        <PredictorLB predLB={predLB} player={player} predSettings={predSettings} isAdmin={isAdmin} onSavePredSettings={onSavePredSettings} />
        <CombinedLB combinedLB={combinedLB} player={player} />
      </div>
    </div>
  );
}