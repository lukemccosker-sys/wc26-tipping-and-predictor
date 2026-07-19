import React, { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const PODIUM_COLORS = {
  0: { bg: "linear-gradient(135deg,#FFD700,#FFA500)", border: "#FFD700", label: "🥇 1st Place", size: "h-28", order: 2 },
  1: { bg: "linear-gradient(135deg,#C0C0C0,#A9A9A9)", border: "#C0C0C0", label: "🥈 2nd Place", size: "h-20", order: 1 },
  2: { bg: "linear-gradient(135deg,#CD7F32,#A0522D)", border: "#CD7F32", label: "🥉 3rd Place", size: "h-14", order: 3 },
};

export default function CeremonyModal({ leaderboard, predLB, combinedLB, onClose, player }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    const fire = (particleRatio, opts) => {
      confetti({
        origin: { y: 0.6 },
        zIndex: 300,
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });
    };
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  const top3Tip = leaderboard.slice(0, 3);
  const top3Pred = predLB.slice(0, 3);
  const top3Combined = (combinedLB || []).slice(0, 3);

  const tipChamp = top3Tip[0];
  const predChamp = top3Pred[0];
  const combinedChamp = top3Combined[0];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "radial-gradient(ellipse at 50% 0%,rgba(255,176,32,.22),transparent 60%), radial-gradient(ellipse at 0% 100%,rgba(123,84,240,.2),transparent 60%), rgba(10,8,20,.92)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "16px 16px 100px", overflowY: "auto", WebkitOverflowScrolling: "touch"
    }}>
      <div style={{
        background: "linear-gradient(160deg,#1a1230,#0d1a2e)",
        border: "1px solid rgba(255,176,32,.4)",
        borderRadius: 20,
        padding: "24px 20px",
        maxWidth: 520, width: "100%",
        margin: "auto 0",
        boxShadow: "0 0 80px -20px rgba(255,176,32,.5)",
        textAlign: "center",
        fontFamily: "'Manrope',system-ui,sans-serif"
      }}>
        {/* Header */}
        <div style={{ fontSize: 36, marginBottom: 2 }}>🏆</div>
        <div style={{ fontFamily: "'Anton',sans-serif", fontSize: "clamp(24px,5vw,38px)", color: "#FFD700", letterSpacing: ".04em", lineHeight: 1.1 }}>
          TOURNAMENT OVER
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.55)", marginTop: 4, marginBottom: 20, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>
          FIFA World Cup 2026 · Final Standings
        </div>

        {/* Tipping Podium */}
        <SectionLabel icon="🎯" title="Tipping Champions" />
        <Podium players={top3Tip} currentPlayerId={player?.id} />

        {/* Predictor Podium */}
        <div style={{ marginTop: 20 }}>
          <SectionLabel icon="🔮" title="Predictor Champions" />
          <Podium players={top3Pred} currentPlayerId={player?.id} scoreKey="total" />
        </div>

        {/* Combined Podium */}
        <div style={{ marginTop: 20 }}>
          <SectionLabel icon="🏅" title="Overall Champions" />
          <Podium players={top3Combined} currentPlayerId={player?.id} scoreKey="total" />
        </div>

        {/* Champions callout */}
        {(tipChamp || predChamp || combinedChamp) && (
          <div style={{ marginTop: 20, background: "rgba(255,176,32,.1)", border: "1px solid rgba(255,176,32,.3)", borderRadius: 12, padding: "12px 16px" }}>
            {combinedChamp && (
              <div style={{ color: "#2cb551", fontWeight: 800, fontSize: 14, marginBottom: (tipChamp || predChamp) ? 6 : 0 }}>
                🏅 Overall Champion: <span style={{ color: "#fff" }}>{combinedChamp.name}</span> · {combinedChamp.total} pts
              </div>
            )}
            {tipChamp && (
              <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 13, marginBottom: predChamp ? 6 : 0 }}>
                🎯 Tipping King: <span style={{ color: "#fff" }}>{tipChamp.name}</span> · {tipChamp.total} pts
              </div>
            )}
            {predChamp && (
              <div style={{ color: "#b89cff", fontWeight: 800, fontSize: 13 }}>
                🔮 Predictor Master: <span style={{ color: "#fff" }}>{predChamp.name}</span> · {predChamp.total} pts
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: 20, width: "100%",
            background: "linear-gradient(95deg,#FFD700,#FF7A2F)",
            border: "none", borderRadius: 14,
            padding: "14px", color: "#fff",
            fontSize: 16, fontWeight: 800,
            cursor: "pointer", fontFamily: "inherit",
            letterSpacing: ".02em"
          }}
        >
          ← Back to App
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, justifyContent: "center" }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontFamily: "'Anton',sans-serif", fontSize: 18, color: "#fff", letterSpacing: ".04em", textTransform: "uppercase" }}>{title}</span>
    </div>
  );
}

function Podium({ players, currentPlayerId, scoreKey = "total" }) {
  if (!players.length) return <div style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>No data yet</div>;

  // Order: 2nd, 1st, 3rd for visual podium effect
  const displayOrder = [
    players[1] ? { ...players[1], podiumIdx: 1 } : null,
    players[0] ? { ...players[0], podiumIdx: 0 } : null,
    players[2] ? { ...players[2], podiumIdx: 2 } : null,
  ].filter(Boolean);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6, height: 150 }}>
      {displayOrder.map((p) => {
        const cfg = PODIUM_COLORS[p.podiumIdx];
        const isMe = p.id === currentPlayerId;
        const heights = [130, 100, 78];
        const h = heights[p.podiumIdx];
        return (
          <div key={p.id} style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
            flex: p.podiumIdx === 0 ? "0 0 44%" : "0 0 28%",
          }}>
            {/* Name above podium */}
            <div style={{
              color: isMe ? "#FFD700" : "#fff",
              fontWeight: 800, fontSize: p.podiumIdx === 0 ? 13 : 11,
              marginBottom: 2, maxWidth: "100%",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              textShadow: isMe ? "0 0 12px rgba(255,176,32,.6)" : "none"
            }}>
              {isMe ? "⭐ " : ""}{p.name}
            </div>
            <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, marginBottom: 4, fontWeight: 700 }}>
              {p[scoreKey] ?? p.total} pts
            </div>
            {/* Podium block */}
            <div style={{
              width: "100%", height: h,
              background: cfg.bg,
              borderRadius: "8px 8px 0 0",
              border: `2px solid ${cfg.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: p.podiumIdx === 0 ? 32 : 24,
              boxShadow: p.podiumIdx === 0 ? `0 0 24px -8px ${cfg.border}` : "none"
            }}>
              {p.podiumIdx === 0 ? "🥇" : p.podiumIdx === 1 ? "🥈" : "🥉"}
            </div>
          </div>
        );
      })}
    </div>
  );
}