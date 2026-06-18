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
    if (outcome === "D" && res.penaltyWinner) {
      const wonPen = (isHome && res.penaltyWinner === "h") || (!isHome && res.penaltyWinner === "a");
      outcome = wonPen ? "W" : "L";
    }
    results.push({ matchId: m.id, opponent, gf, ga, outcome });
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

const OUTCOME_STYLE = {
  W: { bg: "#2cb551", color: "#fff" },
  D: { bg: "#ffb020", color: "#fff" },
  L: { bg: "#ff3d7f", color: "#fff" },
};

export default function TeamStatsPanel({ team, officialResults }) {
  if (!team) return null;

  const results = getTeamResults(team, officialResults);
  const standings = getGroupStandings(team, officialResults);
  const group = getTeamGroup(team);

  return (
    <div style={{
      borderTop: "1px dashed #e0d2bd",
      marginTop: 10,
      paddingTop: 12,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Flag name={team} size={22} />
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 17, letterSpacing: ".03em", color: "#222a3d" }}>{team}</div>
        {group && <div style={{ fontSize: 10, fontWeight: 800, color: "#9aa0ad", textTransform: "uppercase", letterSpacing: ".08em" }}>Group {group}</div>}

      </div>

      {results.length === 0 && (
        <div style={{ fontSize: 12, color: "#9aa0ad", fontWeight: 600 }}>No results yet for this team.</div>
      )}

      {results.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "#9aa0ad", marginBottom: 6 }}>Results</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {results.map((r, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#fff1e2", borderRadius: 9, padding: "7px 10px"
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 900,
                  background: OUTCOME_STYLE[r.outcome].bg, color: OUTCOME_STYLE[r.outcome].color
                }}>{r.outcome}</div>
                <span style={{ fontSize: 12, fontWeight: 700, flex: 1, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  vs <Flag name={r.opponent} size={13} /> {r.opponent}
                </span>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, color: "#222a3d", flexShrink: 0 }}>
                  {r.gf}–{r.ga}
                </div>
              </div>
            ))}
          </div>
          {/* Summary stats */}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {[
              { label: "W", val: results.filter(r => r.outcome === "W").length, color: "#2cb551" },
              { label: "D", val: results.filter(r => r.outcome === "D").length, color: "#ffb020" },
              { label: "L", val: results.filter(r => r.outcome === "L").length, color: "#ff3d7f" },
              { label: "GF", val: results.reduce((s, r) => s + r.gf, 0), color: "#2f8bff" },
              { label: "GA", val: results.reduce((s, r) => s + r.ga, 0), color: "#9aa0ad" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{
                flex: 1, background: `${color}14`, border: `1.5px solid ${color}33`,
                borderRadius: 8, padding: "5px 0", textAlign: "center"
              }}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 17, color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color, opacity: .75, textTransform: "uppercase", letterSpacing: ".05em", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Group standings */}
      {standings && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "#9aa0ad", marginBottom: 6 }}>Group {standings.group} Standings</div>
          <div style={{ background: "#fff", border: "1px solid #efe3d2", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#fff1e2" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 800, fontSize: 9.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#9aa0ad" }}>Team</th>
                  {["P","W","D","L","GD","Pts"].map(h => (
                    <th key={h} style={{ padding: "6px 4px", textAlign: "center", fontWeight: 800, fontSize: 9.5, color: "#9aa0ad" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.rows.map((r, i) => {
                  const isTeam = r.team === team;
                  const gd = r.gf - r.ga;
                  return (
                    <tr key={r.team} style={{ borderTop: "1px solid #f4ebdf", background: isTeam ? "rgba(255,176,32,.14)" : "transparent" }}>
                      <td style={{ padding: "7px 8px", fontWeight: isTeam ? 800 : 600 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 9.5, fontWeight: 800, color: "#9aa0ad", width: 12 }}>{i + 1}</span>
                          <Flag name={r.team} size={13} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>{r.team}</span>
                        </span>
                      </td>
                      <td style={{ textAlign: "center", color: "#6c7384" }}>{r.pld}</td>
                      <td style={{ textAlign: "center", color: "#2cb551", fontWeight: 700 }}>{r.w}</td>
                      <td style={{ textAlign: "center", color: "#ffb020", fontWeight: 700 }}>{r.d}</td>
                      <td style={{ textAlign: "center", color: "#ff3d7f", fontWeight: 700 }}>{r.l}</td>
                      <td style={{ textAlign: "center", color: gd > 0 ? "#2cb551" : gd < 0 ? "#ff3d7f" : "#6c7384", fontWeight: 700 }}>{gd > 0 ? `+${gd}` : gd}</td>
                      <td style={{ textAlign: "center", fontFamily: "'Anton', sans-serif", fontSize: 15, color: isTeam ? "#ff7a2f" : "#222a3d" }}>{r.pts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}