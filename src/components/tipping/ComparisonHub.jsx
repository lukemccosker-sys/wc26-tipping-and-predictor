import React, { useMemo, useState } from "react";
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
    const scored = scoreTip(pred, res, settings);
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
  const [showMatches, setShowMatches] = useState(true);

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

  // Build per-match comparison rows
  const matchRows = useMemo(() => {
    return dedupedResults.map(res => {
      const m = allMatches.find(x => x.id === res.matchId);
      if (!m) return null;
      const isGroup = !!GROUP_MATCHES.find(x => x.id === res.matchId);
      const km = !isGroup ? KO_MATCHES.find(x => x.id === res.matchId) : null;

      const preds = [playerAId, playerBId].map(pid => {
        const candidates = predictions.filter(pr => pr.playerId === pid && pr.matchId === res.matchId);
        const pred = getBestPred(candidates);
        if (!pred || pred.homeScore == null) return { tip: null, pts: 0, tier: "miss" };
        const scored = scoreTip(pred, res, settings);
        return { tip: `${pred.homeScore}–${pred.awayScore}`, pts: scored?.pts ?? 0, tier: scored?.tier ?? "miss" };
      });

      return {
        matchId: res.matchId,
        home: m.home,
        away: m.away,
        result: `${res.homeScore}–${res.awayScore}`,
        isGroup,
        group: isGroup ? m.group : null,
        matchday: isGroup ? m.matchday : null,
        round: km?.round || null,
        preds,
      };
    }).filter(Boolean).sort((a, b) => a.matchId.localeCompare(b.matchId));
  }, [dedupedResults, allMatches, predictions, playerAId, playerBId, settings]);

  // Bucket match rows by section
  const buckets = useMemo(() => {
    const map = {};
    for (const r of matchRows) {
      let key, label;
      if (r.isGroup) {
        key = `md-${r.matchday}`;
        label = `Group Stage · Matchday ${r.matchday}`;
      } else {
        key = `ko-${r.round}`;
        label = ROUND_NAME[r.round] || r.round;
      }
      if (!map[key]) map[key] = { key, label, rows: [] };
      map[key].rows.push(r);
    }
    const KO_ORDER = ["R32","R16","QF","SF","3rd","F"];
    return [
      ...[1,2,3].map(md => `md-${md}`).filter(k => map[k]).map(k => map[k]),
      ...KO_ORDER.map(r => `ko-${r}`).filter(k => map[k]).map(k => map[k]),
    ];
  }, [matchRows]);

  const nameA = players.find(p => p.id === playerAId)?.name || "Player A";
  const nameB = players.find(p => p.id === playerBId)?.name || "Player B";

  return (
    <div style={{ marginTop: 10 }}>
      {/* Summary table */}
      <div style={{ border: "1px solid #efe3d2", borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
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
                      <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 17, color: isBest ? TIER_COLORS[tier] : (val === 0 ? "#d0c8be" : "#444") }}>{val}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
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

      {/* Match-by-match toggle */}
      <button
        onClick={() => setShowMatches(v => !v)}
        style={{
          width: "100%", background: "#fff", border: "1.5px solid #efe3d2", borderRadius: 10,
          padding: "9px 14px", fontSize: 12, fontWeight: 800, color: "#6c7384", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit", marginBottom: showMatches ? 8 : 0
        }}
      >
        <span>⚔️ Head-to-head tips</span>
        <span>{showMatches ? "▲ Hide" : "▼ Show"}</span>
      </button>

      {showMatches && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {buckets.map(bucket => (
            <div key={bucket.key} style={{ border: "1px solid #efe3d2", borderRadius: 11, overflow: "hidden" }}>
              {/* Bucket header */}
              <div style={{ background: "#faf6f1", padding: "7px 12px", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#9aa0ad", borderBottom: "1px solid #efe3d2" }}>
                {bucket.label}
              </div>
              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#f9f4ef", borderBottom: "1px solid #efe3d2", padding: "5px 10px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#7b54f0" }}>{nameA}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#9aa0ad", textAlign: "center" }}>Match</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#2f8bff", textAlign: "right" }}>{nameB}</div>
              </div>
              {/* Match rows */}
              {bucket.rows.map(r => {
                const [predA, predB] = r.preds;
                return (
                  <div key={r.matchId} style={{ borderBottom: "1px solid #f4ebdf", padding: "7px 10px" }}>
                    {/* Teams + result */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 5, fontSize: 11 }}>
                      {r.home ? <><Flag name={r.home} size={11} /><span style={{ fontWeight: 600 }}>{r.home}</span></> : <span style={{ color: "#9aa0ad" }}>TBD</span>}
                      <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 13, background: "#fff", border: "1px solid #efe3d2", borderRadius: 6, padding: "0 6px", color: "#222a3d" }}>{r.result}</span>
                      {r.away ? <><span style={{ fontWeight: 600 }}>{r.away}</span><Flag name={r.away} size={11} /></> : <span style={{ color: "#9aa0ad" }}>TBD</span>}
                    </div>
                    {/* Tips side by side */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {[predA, predB].map((pred, i) => (
                        <div key={i} style={{
                          background: pred.tier !== "miss" ? `${TIER_COLORS[pred.tier]}14` : "#f4f0eb",
                          border: `1.5px solid ${pred.tier !== "miss" ? TIER_COLORS[pred.tier] + "44" : "#e8e0d6"}`,
                          borderRadius: 8, padding: "5px 8px",
                          display: "flex", alignItems: "center", justifyContent: i === 0 ? "flex-start" : "flex-end", gap: 6
                        }}>
                          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 14, color: "#222a3d" }}>
                            {pred.tip || <span style={{ color: "#c8c0b8", fontSize: 11 }}>—</span>}
                          </span>
                          {pred.tip && (
                            <span style={{
                              background: TIER_COLORS[pred.tier], color: "#fff",
                              borderRadius: 5, padding: "1px 6px", fontSize: 10, fontWeight: 800
                            }}>{pred.pts}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}