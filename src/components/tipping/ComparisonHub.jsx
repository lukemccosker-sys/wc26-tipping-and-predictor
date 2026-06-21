import React, { useState, useMemo } from "react";
import Flag from "@/lib/flags";
import { GROUP_MATCHES, KO_MATCHES, ROUND_NAME, scoreTip } from "@/lib/wc2026data";

function getBestPred(candidates) {
  return candidates.reduce((best, pr) => {
    if (!best) return pr;
    if (pr.status === 'final' && best.status !== 'final') return pr;
    if (best.status === 'final' && pr.status !== 'final') return best;
    const prTime = pr.created_date ? new Date(pr.created_date).getTime() : 0;
    const bestTime = best.created_date ? new Date(best.created_date).getTime() : 0;
    return prTime > bestTime ? pr : best;
  }, null);
}

const TIER_COLORS = {
  exact: "#2cb551",
  gd: "#12b3a6",
  result: "#ffb020",
  miss: "#d0c8be",
};

const TIER_LABELS = {
  exact: "Exact",
  gd: "Win+GD",
  result: "Winner",
  miss: "Miss",
};

export default function ComparisonHub({ players, predictions, officialResults, settings, currentPlayer }) {
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const allMatches = useMemo(() => [...GROUP_MATCHES, ...KO_MATCHES], []);

  // Deduplicate official results
  const dedupedResults = useMemo(() => Object.values(
    officialResults.reduce((acc, r) => {
      const existing = acc[r.matchId];
      if (!existing) { acc[r.matchId] = r; return acc; }
      const rTime = r.created_date ? new Date(r.created_date).getTime() : 0;
      const eTime = existing.created_date ? new Date(existing.created_date).getTime() : 0;
      if (rTime > eTime) acc[r.matchId] = r;
      return acc;
    }, {})
  ).filter(r => r.homeScore != null && r.awayScore != null), [officialResults]);

  // Aggregate stats per selected player
  const stats = useMemo(() => {
    return selected.map(pid => {
      const p = players.find(x => x.id === pid);
      let pts = 0, exact = 0, gd = 0, result = 0, miss = 0, tipped = 0;
      for (const res of dedupedResults) {
        const m = allMatches.find(x => x.id === res.matchId);
        if (!m) continue;
        const candidates = predictions.filter(pr => pr.playerId === pid && pr.matchId === res.matchId);
        const pred = getBestPred(candidates);
        if (!pred || pred.homeScore == null) { miss++; continue; }
        tipped++;
        const scored = scoreTip({ homeScore: pred.homeScore, awayScore: pred.awayScore }, { homeScore: res.homeScore, awayScore: res.awayScore }, settings);
        pts += scored?.pts ?? 0;
        if (scored?.tier === 'exact') exact++;
        else if (scored?.tier === 'gd') gd++;
        else if (scored?.tier === 'result') result++;
        else miss++;
      }
      return { pid, name: p?.name, pts, exact, gd, result, miss, tipped, total: dedupedResults.length };
    });
  }, [selected, predictions, dedupedResults, players, allMatches, settings]);

  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div style={{ marginTop: 14, borderTop: "1px dashed #e0d2bd", paddingTop: 14 }}>
      {/* Header */}
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#9aa0ad", marginBottom: 8 }}>
        Compare Players <span style={{ fontWeight: 600, textTransform: "none", letterSpacing: 0, fontSize: 10.5, color: "#b9b1a3" }}>— tap up to 4</span>
      </div>

      {/* Chip cloud */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {sortedPlayers.map(p => {
          const isOn = selected.includes(p.id);
          const isMe = currentPlayer && p.id === currentPlayer.id;
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              disabled={!isOn && selected.length >= 4}
              style={{
                border: `2px solid ${isOn ? "#7b54f0" : "#efe3d2"}`,
                background: isOn ? "linear-gradient(95deg,#7b54f0,#2f8bff)" : "#fff",
                color: isOn ? "#fff" : "#6c7384",
                borderRadius: 999,
                padding: "5px 13px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                opacity: (!isOn && selected.length >= 4) ? 0.4 : 1,
                transition: "all .15s",
              }}
            >
              {p.name}{isMe ? " (you)" : ""}
            </button>
          );
        })}
      </div>

      {/* Comparison table */}
      {selected.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: selected.length > 2 ? 340 : 260 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #efe3d2" }}>
                <th style={{ textAlign: "left", padding: "6px 8px", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#9aa0ad", minWidth: 64 }}>Stat</th>
                {stats.map(s => (
                  <th key={s.pid} style={{ textAlign: "center", padding: "6px 6px", fontSize: 11, fontWeight: 800, color: "#222a3d", minWidth: 72 }}>
                    {s.name}
                    {currentPlayer && s.pid === currentPlayer.id && <span style={{ color: "#9aa0ad", fontWeight: 600, fontSize: 9 }}> (you)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Points row */}
              <tr style={{ background: "rgba(123,84,240,.06)", borderBottom: "1px solid #f4ebdf" }}>
                <td style={{ padding: "8px 8px", fontSize: 10.5, fontWeight: 800, color: "#6c7384", textTransform: "uppercase", letterSpacing: ".04em" }}>Points</td>
                {stats.map(s => {
                  const best = Math.max(...stats.map(x => x.pts));
                  return (
                    <td key={s.pid} style={{ textAlign: "center", padding: "8px 6px" }}>
                      <span style={{
                        fontFamily: "'Anton', sans-serif", fontSize: 20,
                        color: s.pts === best && best > 0 ? "#7b54f0" : "#222a3d"
                      }}>{s.pts}</span>
                    </td>
                  );
                })}
              </tr>
              {/* Tier rows */}
              {["exact", "gd", "result", "miss"].map(tier => (
                <tr key={tier} style={{ borderBottom: "1px solid #f4ebdf" }}>
                  <td style={{ padding: "7px 8px" }}>
                    <span style={{
                      background: `${TIER_COLORS[tier]}22`,
                      color: TIER_COLORS[tier],
                      borderRadius: 6,
                      padding: "2px 7px",
                      fontSize: 10.5,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: ".04em",
                      display: "inline-block",
                    }}>{TIER_LABELS[tier]}</span>
                  </td>
                  {stats.map(s => {
                    const val = s[tier];
                    const best = Math.max(...stats.map(x => x[tier]));
                    const isBest = val === best && best > 0 && tier !== "miss";
                    return (
                      <td key={s.pid} style={{ textAlign: "center", padding: "7px 6px" }}>
                        <span style={{
                          fontFamily: "'Anton', sans-serif",
                          fontSize: 16,
                          color: isBest ? TIER_COLORS[tier] : (val === 0 ? "#d0c8be" : "#444"),
                          fontWeight: isBest ? 900 : 700,
                        }}>{val}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Tipped row */}
              <tr>
                <td style={{ padding: "7px 8px", fontSize: 10.5, fontWeight: 800, color: "#9aa0ad", textTransform: "uppercase", letterSpacing: ".04em" }}>Tipped</td>
                {stats.map(s => (
                  <td key={s.pid} style={{ textAlign: "center", padding: "7px 6px", fontSize: 12, fontWeight: 700, color: "#9aa0ad" }}>
                    {s.tipped}/{s.total}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {selected.length === 0 && (
        <div style={{ fontSize: 12, color: "#b9b1a3", fontStyle: "italic", paddingBottom: 4 }}>
          Tap player names above to compare their stats.
        </div>
      )}
    </div>
  );
}