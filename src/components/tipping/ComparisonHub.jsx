import React, { useMemo } from "react";
import { GROUP_MATCHES, KO_MATCHES, scoreTip } from "@/lib/wc2026data";

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

const TIER_COLORS = { exact: "#2cb551", gd: "#12b3a6", result: "#ffb020", miss: "#d0c8be" };
const TIER_LABELS = { exact: "Exact", gd: "Win+GD", result: "Winner", miss: "Miss" };

function buildStats(pid, players, predictions, dedupedResults, allMatches, settings) {
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
}

export default function ComparisonHub({ players, predictions, officialResults, settings, currentPlayer, playerAId, playerBId }) {
  const allMatches = useMemo(() => [...GROUP_MATCHES, ...KO_MATCHES], []);

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

  const stats = useMemo(() => [playerAId, playerBId].map(pid =>
    buildStats(pid, players, predictions, dedupedResults, allMatches, settings)
  ), [playerAId, playerBId, players, predictions, dedupedResults, allMatches, settings]);

  return (
    <div style={{ marginTop: 10, border: "1px solid #efe3d2", borderRadius: 12, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: "linear-gradient(100deg,rgba(123,84,240,.08),rgba(47,139,255,.05))", borderBottom: "2px solid #efe3d2" }}>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#9aa0ad" }}>Stat</th>
            {stats.map(s => (
              <th key={s.pid} style={{ textAlign: "center", padding: "8px 10px", fontSize: 12, fontWeight: 800, color: "#222a3d" }}>
                {s.name}
                {currentPlayer && s.pid === currentPlayer.id && <span style={{ color: "#9aa0ad", fontWeight: 600, fontSize: 9, display: "block" }}>you</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Points */}
          <tr style={{ background: "rgba(123,84,240,.04)", borderBottom: "1px solid #f4ebdf" }}>
            <td style={{ padding: "9px 12px", fontSize: 10.5, fontWeight: 800, color: "#6c7384", textTransform: "uppercase", letterSpacing: ".04em" }}>Points</td>
            {stats.map(s => {
              const best = Math.max(...stats.map(x => x.pts));
              return (
                <td key={s.pid} style={{ textAlign: "center", padding: "9px 10px" }}>
                  <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, color: s.pts === best && best > 0 ? "#7b54f0" : "#222a3d" }}>
                    {s.pts}
                  </span>
                </td>
              );
            })}
          </tr>
          {/* Tier rows */}
          {["exact", "gd", "result", "miss"].map(tier => (
            <tr key={tier} style={{ borderBottom: "1px solid #f4ebdf" }}>
              <td style={{ padding: "7px 12px" }}>
                <span style={{
                  background: `${TIER_COLORS[tier]}22`, color: TIER_COLORS[tier],
                  borderRadius: 6, padding: "2px 7px", fontSize: 10.5, fontWeight: 800,
                  textTransform: "uppercase", letterSpacing: ".04em", display: "inline-block",
                }}>{TIER_LABELS[tier]}</span>
              </td>
              {stats.map(s => {
                const val = s[tier];
                const best = Math.max(...stats.map(x => x[tier]));
                const isBest = val === best && best > 0 && tier !== "miss";
                return (
                  <td key={s.pid} style={{ textAlign: "center", padding: "7px 10px" }}>
                    <span style={{
                      fontFamily: "'Anton', sans-serif", fontSize: 17,
                      color: isBest ? TIER_COLORS[tier] : (val === 0 ? "#d0c8be" : "#444"),
                    }}>{val}</span>
                  </td>
                );
              })}
            </tr>
          ))}
          {/* Tipped */}
          <tr>
            <td style={{ padding: "7px 12px", fontSize: 10.5, fontWeight: 800, color: "#9aa0ad", textTransform: "uppercase", letterSpacing: ".04em" }}>Tipped</td>
            {stats.map(s => (
              <td key={s.pid} style={{ textAlign: "center", padding: "7px 10px", fontSize: 12, fontWeight: 700, color: "#9aa0ad" }}>
                {s.tipped}/{s.total}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}