import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { GROUP_MATCHES, KO_MATCHES, ROUND_NAME } from "@/lib/wc2026data";
import Flag from "@/lib/flags";

export default function ResultOverrideTool({ officialResults }) {
  const [matchId, setMatchId] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const allMatches = useMemo(() => {
    const groups = GROUP_MATCHES.map(m => ({
      id: m.id, label: `${m.id} — ${m.home} vs ${m.away} (Group ${m.group})`, home: m.home, away: m.away, isGroup: true,
    }));
    const kos = KO_MATCHES.map(m => ({
      id: m.id, label: `${m.id} — ${ROUND_NAME[m.round] || m.round} (${m.h} vs ${m.a})`, home: null, away: null, isGroup: false,
    }));
    return [...groups, ...kos];
  }, []);

  const selectedMatch = allMatches.find(m => m.id === matchId);
  const existing = officialResults.find(r => r.matchId === matchId);

  const onMatchChange = (id) => {
    setMatchId(id);
    const r = officialResults.find(r => r.matchId === id);
    if (r) {
      setHomeScore(r.homeScore ?? "");
      setAwayScore(r.awayScore ?? "");
    } else {
      setHomeScore(""); setAwayScore("");
    }
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!matchId || homeScore === "" || awayScore === "") return;
    setLoading(true);
    setStatus(null);
    try {
      if (existing) {
        await base44.entities.OfficialResult.update(existing.id, { homeScore: +homeScore, awayScore: +awayScore });
        setStatus({ type: "success", msg: `✅ Updated ${matchId} to ${homeScore}–${awayScore}` });
      } else {
        const saved = await base44.entities.OfficialResult.create({ matchId, homeScore: +homeScore, awayScore: +awayScore });
        setStatus({ type: "success", msg: `✅ Created result for ${matchId}: ${homeScore}–${awayScore}` });
      }
    } catch (err) {
      setStatus({ type: "error", msg: `❌ Error: ${err.message}` });
    }
    setLoading(false);
  };

  const handleClear = async () => {
    if (!existing) return;
    if (!window.confirm(`Delete the official result for ${matchId}?`)) return;
    setLoading(true);
    setStatus(null);
    try {
      await base44.entities.OfficialResult.delete(existing.id);
      setHomeScore(""); setAwayScore("");
      setStatus({ type: "success", msg: `🗑 Cleared result for ${matchId}` });
    } catch (err) {
      setStatus({ type: "error", msg: `❌ Error: ${err.message}` });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* Match selector */}
        <div style={{ flex: "1 1 280px" }}>
          <label style={labelStyle}>Match</label>
          <select value={matchId} onChange={e => onMatchChange(e.target.value)} style={inputStyle} required>
            <option value="">— Select match —</option>
            <optgroup label="Group Stage">
              {allMatches.filter(m => m.isGroup).map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </optgroup>
            <optgroup label="Knockout Stage">
              {allMatches.filter(m => !m.isGroup).map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Home Score */}
        <div style={{ flex: "0 0 90px" }}>
          <label style={labelStyle}>Home</label>
          <input
            type="number" min="0" max="99" placeholder="0"
            value={homeScore} onChange={e => setHomeScore(e.target.value)}
            style={inputStyle} required
          />
        </div>

        {/* Away Score */}
        <div style={{ flex: "0 0 90px" }}>
          <label style={labelStyle}>Away</label>
          <input
            type="number" min="0" max="99" placeholder="0"
            value={awayScore} onChange={e => setAwayScore(e.target.value)}
            style={inputStyle} required
          />
        </div>
      </div>

      {selectedMatch?.isGroup && (
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6c7384", display: "flex", alignItems: "center", gap: 6 }}>
          <Flag name={selectedMatch.home} size={14} />{selectedMatch.home} &nbsp;vs&nbsp; <Flag name={selectedMatch.away} size={14} />{selectedMatch.away}
          {existing && <span style={{ color: "#9aa0ad", fontWeight: 600, marginLeft: 8 }}>Current: {existing.homeScore}–{existing.awayScore}</span>}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={loading || !matchId}
          style={{
            background: "linear-gradient(95deg,#ff3d7f,#ff7a2f)", color: "#fff",
            border: "none", borderRadius: 10, padding: "10px 22px",
            fontWeight: 800, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit", opacity: loading || !matchId ? 0.7 : 1
          }}
        >
          {loading ? "Saving…" : existing ? "✏️ Update Result" : "💾 Save Result"}
        </button>
        {existing && (
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            style={{
              background: "#fff0f2", border: "1.5px solid #ff3d7f", color: "#ff3d7f",
              borderRadius: 10, padding: "10px 18px", fontWeight: 800, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.6 : 1
            }}
          >
            🗑 Clear Result
          </button>
        )}
        {status && (
          <div style={{ fontSize: 13, fontWeight: 700, color: status.type === "success" ? "#2cb551" : "#ff3d7f" }}>
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