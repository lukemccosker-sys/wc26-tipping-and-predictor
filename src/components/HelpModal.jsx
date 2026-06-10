import React from "react";

export default function HelpModal({ player, onClose }) {
  const isAdmin = player?.isAdmin || false;

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal-c"
        style={{ maxWidth: 480, width: "100%" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 10 }}>⚽</div>
          <div style={{ fontFamily: "'Anton',sans-serif", fontSize: 26, letterSpacing: ".01em" }}>
            Welcome, {player?.name}!
          </div>
          <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>
            Two games in one — switch any time with the 🎯 <b>Tipping</b> / 🔮 <b>Predictor</b> toggle at the top.
          </div>
        </div>

        {/* Tipping card */}
        <div style={{
          border: "2px solid var(--pink)", borderRadius: 14, padding: "14px 16px",
          marginBottom: 10, background: "rgba(255,61,127,.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>🎯</span>
            <span style={{ fontFamily: "'Anton',sans-serif", fontSize: 20, letterSpacing: ".02em" }}>Tipping</span>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted2)", marginLeft: 4 }}>Score every game</span>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--ink)" }}>
            <div><b>Group Stage</b> — tap the score boxes to predict every game.</div>
            <div><b>Knockouts</b> — each match unlocks when its real teams are known; tip that actual matchup before kick-off.</div>
            <div><b>Leaderboard &amp; Tips Room</b> — see your rank, and everyone's tips once a game finishes.</div>
          </div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--line2)", fontSize: 12, color: "var(--muted2)", fontStyle: "italic" }}>
            Each tip locks at that game's kick-off.
          </div>
        </div>

        {/* Predictor card */}
        <div style={{
          border: "2px solid var(--purple)", borderRadius: 14, padding: "14px 16px",
          marginBottom: 10, background: "rgba(123,84,240,.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>🔮</span>
            <span style={{ fontFamily: "'Anton',sans-serif", fontSize: 20, letterSpacing: ".02em" }}>Predictor</span>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted2)", marginLeft: 4 }}>Call it all up front</span>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--ink)" }}>
            <div><b>Groups</b> — pick each group's 1st &amp; 2nd, plus your 8 best third-placed teams.</div>
            <div><b>Bracket</b> — tap who advances each round, through to your champion.</div>
            <div><b>Awards</b> — name your Golden Boot, Ball, Young Player &amp; Glove.</div>
          </div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--line2)", fontSize: 12, color: "var(--muted2)", fontStyle: "italic" }}>
            One-time picks — everything locks at the first kick-off.
          </div>
        </div>

        {/* Admin note */}
        {isAdmin && (
          <div style={{
            border: "2px solid var(--gold)", borderRadius: 12, padding: "12px 14px",
            marginBottom: 14, background: "rgba(255,176,32,.08)",
            fontSize: 13, lineHeight: 1.55, color: "var(--ink)"
          }}>
            👑 <b>You're the admin.</b> Use <b>Enter results</b> (top right) to type real scores — that scores everyone &amp; locks each game. Set award winners in <b>Predictor → Awards</b>, and share the pool with the <b>Publish</b> button.
          </div>
        )}

        {/* CTA */}
        <button
          className="role-btn"
          style={{ marginTop: 2 }}
          onClick={onClose}
        >
          Let's go →
        </button>
      </div>
    </div>
  );
}