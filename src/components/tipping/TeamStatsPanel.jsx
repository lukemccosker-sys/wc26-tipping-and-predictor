import React from "react";
import Flag from "@/lib/flags";
import { GROUP_MATCHES, KO_MATCHES, WC_GROUPS, GL, ROUND_NAME } from "@/lib/wc2026data";
import { buildOfficialKOTeamsFromResults } from "@/lib/scoring";

function getTeamGroup(team) {
  for (const L of GL) {
    if (WC_GROUPS[L].includes(team)) return L;
  }
  return null;
}

function getTeamResults(team, officialResults, koTeamsMap) {
  const results = [];

  // Group stage matches — use fixture team names directly
  for (const m of GROUP_MATCHES) {
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
    results.push({ matchId: m.id, round: null, opponent, gf, ga, outcome });
  }

  // KO matches — resolve actual teams from official KO teams map
  for (const m of KO_MATCHES) {
    const teams = koTeamsMap?.[m.id];
    if (!teams) continue;
    const isHome = teams.home === team;
    const isAway = teams.away === team;
    if (!isHome && !isAway) continue;
    const res = officialResults.find(r => r.matchId === m.id);
    if (!res || res.homeScore == null || res.awayScore == null) continue;
    const opponent = isHome ? teams.away : teams.home;
    const gf = isHome ? +res.homeScore : +res.awayScore;
    const ga = isHome ? +res.awayScore : +res.homeScore;
    let outcome = gf > ga ? "W" : gf < ga ? "L" : "D";
    if (outcome === "D" && res.penaltyWinner) {
      const wonPen = (isHome && res.penaltyWinner === "h") || (!isHome && res.penaltyWinner === "a");
      outcome = wonPen ? "W" : "L";
    }
    results.push({ matchId: m.id, round: m.round, opponent, gf, ga, outcome });
  }

  return results;
}

const OUTCOME_STYLE = {
  W: { bg: "#2cb551", color: "#fff" },
  D: { bg: "#ffb020", color: "#fff" },
  L: { bg: "#ff3d7f", color: "#fff" },
};

export default function TeamStatsPanel({ team, officialResults, koTeams }) {
  if (!team) return null;

  // Use parent-provided koTeams (includes admin overrides) or resolve from results
  const koTeamsMap = koTeams || buildOfficialKOTeamsFromResults(officialResults, {}, {});
  const results = getTeamResults(team, officialResults, koTeamsMap);
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
                {r.round && (
                  <span style={{ fontSize: 8.5, fontWeight: 800, color: "#9aa0ad", textTransform: "uppercase", letterSpacing: ".04em", flexShrink: 0 }}>
                    {r.round}
                  </span>
                )}
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
    </div>
  );
}