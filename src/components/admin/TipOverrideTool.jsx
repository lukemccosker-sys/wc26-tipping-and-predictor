import React, { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function TipOverrideTool({ players }) {
  const [playerId, setPlayerId] = useState("");
  const [matchId, setMatchId] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [status, setStatus] = useState(null); // { type: "success"|"error", msg }
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!playerId || !matchId || homeScore === "" || awayScore === "") return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await base44.functions.invoke("adminOverrideTip", {
        playerId, matchId, homeScore: +homeScore, awayScore: +awayScore,
      });
      const data = res.data;
      setStatus({ type: "success", msg: `✅ ${data.action === "created" ? "Created" : "Updated"} tip for match ${matchId}` });
      setMatchId(""); setHomeScore(""); setAwayScore("");
    } catch (err) {
      setStatus({ type: "error", msg: `❌ Error: ${err.message}` });
    }
    setLoading(false);
  };

  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* Player */}
        <div style={{ flex: "1 1 180px" }}>
          <label style={labelStyle}>Player</label>
          <select value={playerId} onChange={e => setPlayerId(e.target.value)} style={inputStyle} required>
            <option value="">— Select player —</option>
            {sortedPlayers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Match ID */}
        <div style={{ flex: "1 1 120px" }}>
          <label style={labelStyle}>Match ID</label>
          <input
            type="text" placeholder="e.g. GA0, M73"
            value={matchId} onChange={e => setMatchId(e.target.value.toUpperCase())}
            style={inputStyle} required
          />
        </div>

        {/* Home Score */}
        <div style={{ flex: "0 0 80px" }}>
          <label style={labelStyle}>Home</label>
          <input
            type="number" min="0" max="99" placeholder="0"
            value={homeScore} onChange={e => setHomeScore(e.target.value)}
            style={inputStyle} required
          />
        </div>

        {/* Away Score */}
        <div style={{ flex: "0 0 80px" }}>
          <label style={labelStyle}>Away</label>
          <input
            type="number" min="0" max="99" placeholder="0"
            value={awayScore} onChange={e => setAwayScore(e.target.value)}
            style={inputStyle} required
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "linear-gradient(95deg,#ff3d7f,#ff7a2f)", color: "#fff",
            border: "none", borderRadius: 10, padding: "10px 22px",
            fontWeight: 800, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit", opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Saving…" : "💾 Save Override"}
        </button>
        {status && (
          <div style={{
            fontSize: 13, fontWeight: 700,
            color: status.type === "success" ? "#2cb551" : "#ff3d7f"
          }}>
            {status.msg}
          </div>
        )}
      </div>
    </form>
  );
}

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase",
  letterSpacing: ".06em", color: "#9aa0ad", marginBottom: 5
};

const inputStyle = {
  width: "100%", border: "2px solid #efe3d2", borderRadius: 9,
  padding: "9px 10px", fontSize: 13.5, fontWeight: 700, color: "#222a3d",
  background: "#fff", fontFamily: "inherit", boxSizing: "border-box"
};