import React from "react";
import Flag from "@/lib/flags";
import { GROUP_MATCHES, KO_MATCHES, WC_GROUPS, GL } from "@/lib/wc2026data";

function getTeamGroup(team) {
  for (const L of GL) {
    if (WC_GROUPS[L].includes(team)) return L;
  }
  return null;
}

function getTeamResults(team, officialResults) {
  const allMatches = [...GROUP_MATCHES, ...KO_MATCHES];
  const results = [];
  for (const m of allMatches) {
    if (m.home !== team && m.away !== team) continue;
    const res = officialResults.find(r => r.matchId === m.id);
    if (!res || res.homeScore == null || res.awayScore == null) continue;
    const isHome = m.home === team;
    const opponent = isHome ? m.away : m.home;
    const gf = isHome ? +res.homeScore : +res.awayScore;
    const ga = isHome ? +res.awayScore : +res.homeScore;
    let outcome = gf > ga ? "W" : gf < ga ? "L" : "D";
    // Penalty winner for KO draws
    if (outcome === "D" && res.penaltyWinner) {
      const wonPen = (isHome && res.penaltyWinner === "h") || (!isHome && res.penaltyWinner === "a");
      outcome = wonPen ? "W" : "L";
    }
    results.push({ matchId: m.id, opponent, gf, ga, outcome, isGroup: !!m.group });
  }
  return results;
}

function getGroupStandings(team, officialResults) {
  const group = getTeamGroup(team);
  if (!group) return null;
  const teams = WC_GROUPS[group];
  const table = {};
  teams.forEach(t => { table[t] = { team: t, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }; });
  for (const m of GROUP_MATCHES.filter(m => m.group === group)) {
    const res = officialResults.find(r => r.matchId === m.id);
    if (!res || res.homeScore == null) continue;
    const h = +res.homeScore, a = +res.awayScore;
    table[m.home].pld++; table[m.away].pld++;
    table[m.home].gf += h; table[m.home].ga += a;
    table[m.away].gf += a; table[m.away].ga += h;
    if (h > a) { table[m.home].w++; table[m.home].pts += 3; table[m.away].l++; }
    else if (h < a) { table[m.away].w++; table[m.away].pts += 3; table[m.home].l++; }
    else { table[m.home].d++; table[m.home].pts++; table[m.away].d++; table[m.away].pts++; }
  }
  return { group, rows: Object.values(table).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf) };
}

export default function TeamStatsModal({ team, officialResults, onClose }) {
  if (!team) return null;

  const results = getTeamResults(team, officialResults);
  const standings = getGroupStandings(team, officialResults);
  const group = getTeamGroup(team);

  const OUTCOME_STYLE = {
    W: { bg: "#2cb551", color: "#fff" },
    D: { bg: "#ffb020", color: "#fff" },
    L: { bg: "#ff3d7f", color: "#fff" },
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(30,20,10,.52)",
        zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff7ee", borderRadius: "22px 22px 0 0",
          width: "100%", maxWidth: 520, maxHeight: "82vh",
          overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 -12px 48px -16px rgba(80,40,20,.5)",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "#ddd" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px 14px", borderBottom: "1px solid #efe3d2" }}>
          <Flag name={team} size={32} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, letterSpacing: ".03em", color: "#222a3d" }}>{team}</div>
            {group && <div style={{ fontSize: 11, fontWeight: 800, color: "#9aa0ad", textTransform: "uppercase", letterSpacing: ".08em" }}>Group {group}</div>}
          </div>
          {/* Form pills */}
          <div style={{ display: "flex", gap: 4 }}>
            {results.slice(-5).map((r, i) => (
              <div key={i} style={{
                width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 11, fontWeight: 900,
                background: OUTCOME_STYLE[r.outcome].bg, color: OUTCOME_STYLE[r.outcome].color
              }}>{r.outcome}</div>
            ))}
          </div>
          <button onClick={onClose} style={{
            background: "#efe3d2", border: "none", borderRadius: 999, width: 30, height: 30,
            fontSize: 14, cursor: "pointer", fontWeight: 900, color: "#6c7384",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>✕</button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px 28px" }}>

          {results.length === 0 && (
            <div style={{ textAlign: "center", color: "#9aa0ad", fontSize: 13, fontWeight: 600, padding: "24px 0" }}>
              No results yet for this tournament — check back once games are played.
            </div>
          )}

          {results.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "#9aa0ad", marginBottom: 8 }}>Tournament Results</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {results.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "#fff", border: "1px solid #efe3d2", borderRadius: 12, padding: "9px 13px"
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 900,
                      background: OUTCOME_STYLE[r.outcome].bg, color: OUTCOME_STYLE[r.outcome].color
                    }}>{r.outcome}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#222a3d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        vs <Flag name={r.opponent} size={14} /> {r.opponent}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, color: "#222a3d", flexShrink: 0 }}>
                      {r.gf}–{r.ga}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary stats */}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {[
                  { label: "W", val: results.filter(r => r.outcome === "W").length, color: "#2cb551" },
                  { label: "D", val: results.filter(r => r.outcome === "D").length, color: "#ffb020" },
                  { label: "L", val: results.filter(r => r.outcome === "L").length, color: "#ff3d7f" },
                  { label: "GF", val: results.reduce((s, r) => s + r.gf, 0), color: "#2f8bff" },
                  { label: "GA", val: results.reduce((s, r) => s + r.ga, 0), color: "#9aa0ad" },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{
                    flex: 1, background: `${color}14`, border: `1.5px solid ${color}33`,
                    borderRadius: 10, padding: "7px 0", textAlign: "center"
                  }}>
                    <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, color, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 9.5, fontWeight: 800, color, opacity: .75, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group standings */}
          {standings && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "#9aa0ad", marginBottom: 8 }}>Group {standings.group} Standings</div>
              <div style={{ background: "#fff", border: "1px solid #efe3d2", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: "#fff1e2" }}>
                      <th style={{ padding: "7px 10px", textAlign: "left", fontWeight: 800, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: "#9aa0ad" }}>Team</th>
                      <th style={{ padding: "7px 6px", textAlign: "center", fontWeight: 800, fontSize: 10, color: "#9aa0ad" }}>P</th>
                      <th style={{ padding: "7px 6px", textAlign: "center", fontWeight: 800, fontSize: 10, color: "#9aa0ad" }}>W</th>
                      <th style={{ padding: "7px 6px", textAlign: "center", fontWeight: 800, fontSize: 10, color: "#9aa0ad" }}>D</th>
                      <th style={{ padding: "7px 6px", textAlign: "center", fontWeight: 800, fontSize: 10, color: "#9aa0ad" }}>L</th>
                      <th style={{ padding: "7px 6px", textAlign: "center", fontWeight: 800, fontSize: 10, color: "#9aa0ad" }}>GD</th>
                      <th style={{ padding: "7px 6px", textAlign: "center", fontWeight: 800, fontSize: 10, color: "#9aa0ad", fontFamily: "'Anton', sans-serif", fontSize: 12 }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.rows.map((r, i) => {
                      const isTeam = r.team === team;
                      const gd = r.gf - r.ga;
                      return (
                        <tr key={r.team} style={{ borderTop: "1px solid #f4ebdf", background: isTeam ? "rgba(255,176,32,.14)" : "transparent" }}>
                          <td style={{ padding: "8px 10px", fontWeight: isTeam ? 800 : 600 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 10, fontWeight: 800, color: "#9aa0ad", width: 14 }}>{i + 1}</span>
                              <Flag name={r.team} size={14} />
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }}>{r.team}</span>
                            </span>
                          </td>
                          <td style={{ textAlign: "center", color: "#6c7384" }}>{r.pld}</td>
                          <td style={{ textAlign: "center", color: "#2cb551", fontWeight: 700 }}>{r.w}</td>
                          <td style={{ textAlign: "center", color: "#ffb020", fontWeight: 700 }}>{r.d}</td>
                          <td style={{ textAlign: "center", color: "#ff3d7f", fontWeight: 700 }}>{r.l}</td>
                          <td style={{ textAlign: "center", color: gd > 0 ? "#2cb551" : gd < 0 ? "#ff3d7f" : "#6c7384", fontWeight: 700 }}>{gd > 0 ? `+${gd}` : gd}</td>
                          <td style={{ textAlign: "center", fontFamily: "'Anton', sans-serif", fontSize: 16, color: isTeam ? "#ff7a2f" : "#222a3d" }}>{r.pts}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}