import React from "react";
import Flag from "@/lib/flags";
import ScoreInput from "./ScoreInput";
import ResultEntry from "./ResultEntry";
import Countdown from "./Countdown";
import { groupMatches, WC_GROUPS } from "@/lib/wc2026data";
import { scoreTip } from "@/lib/wc2026data";

function calcPredictedTable(group, matches, myPreds) {
  const teams = WC_GROUPS[group];
  const stats = {};
  teams.forEach(t => { stats[t] = { pts: 0, gf: 0, ga: 0, gd: 0, pld: 0 }; });
  for (const m of matches) {
    const pred = myPreds.find(p => p.matchId === m.id);
    if (!pred || pred.homeScore == null || pred.awayScore == null) continue;
    const h = +pred.homeScore, a = +pred.awayScore;
    stats[m.home].pld++; stats[m.away].pld++;
    stats[m.home].gf += h; stats[m.home].ga += a; stats[m.home].gd += h - a;
    stats[m.away].gf += a; stats[m.away].ga += h; stats[m.away].gd += a - h;
    if (h > a) { stats[m.home].pts += 3; }
    else if (h < a) { stats[m.away].pts += 3; }
    else { stats[m.home].pts += 1; stats[m.away].pts += 1; }
  }
  return teams.slice().sort((a, b) =>
    stats[b].pts - stats[a].pts || stats[b].gd - stats[a].gd || stats[b].gf - stats[a].gf
  ).map(t => ({ team: t, ...stats[t] }));
}

function fmtKick(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function GroupCard({
  group, predictions, officialResults, kickoffs,
  onSetScore, isAdmin, adminEditing, onSetOfficial, onClearOfficial,
  player, poolSettings
}) {
  const matches = groupMatches(group);
  const myPreds = predictions.filter(p => p.playerId === player?.id);

  const getPred = (matchId) => predictions.find(p => p.playerId === player?.id && p.matchId === matchId);
  const getOfficial = (matchId) => officialResults.find(r => r.matchId === matchId);
  const getKickoff = (matchId) => kickoffs?.[matchId] || null;

  const globalLock = poolSettings?.globalLockTipping ?? false;

  const isLocked = (matchId) => {
    if (globalLock) return true;
    const ko = getKickoff(matchId);
    if (!ko) return false;
    return Date.now() >= ko;
  };

  const settings = {
    exact: poolSettings?.pointsExact ?? 5,
    gd: poolSettings?.pointsGD ?? 3,
    result: poolSettings?.pointsResult ?? 1,
  };

  return (
    <div className="card">
      <div className="card-h">
        <div className="gtitle">GROUP {group}</div>
      </div>
      <div className="fixtures">
        {matches.map(m => {
          const pred = getPred(m.id);
          const official = getOfficial(m.id);
          const locked = isLocked(m.id) || !!official;
          const kicked = getKickoff(m.id);
          const hasTip = pred && pred.homeScore != null && pred.awayScore != null;
          const hasOfficial = official && official.homeScore != null && official.awayScore != null;
          const scored = hasOfficial && hasTip ? scoreTip(pred, official, settings) : null;

          return (
            <div className={`gm${scored ? " scored" : ""}${locked ? " locked-match" : ""}`} key={m.id} id={`match-${m.id}`}>
              <div className="cd-row">
                {kicked && <span className="kick-when">{fmtKick(kicked)}</span>}
                <Countdown kickoff={kicked} />
                {locked && !hasOfficial && <span className="gm-lock-badge">🔒 Locked</span>}
                {locked && hasOfficial && <span className="gm-lock-badge">🔒 Final</span>}
                {hasTip && !locked && <span className="tip-saved">✓ saved</span>}
                {scored && (
                  <span className={`pts-circle t-${scored.tier}`}>{scored.pts}</span>
                )}
              </div>

              {/* Tip row */}
              <div className={`gm-main${locked ? " gm-locked" : ""}`}>
                <div className="gm-team">
                  <span className="tname"><Flag name={m.home} size={16} /><span>{m.home}</span></span>
                </div>
                <div className="gm-score">
                  <ScoreInput
                    value={pred?.homeScore}
                    onChange={v => onSetScore(m.id, "h", v)}
                    locked={locked}
                    active={hasTip}
                  />
                  <span className="vs">vs</span>
                  <ScoreInput
                    value={pred?.awayScore}
                    onChange={v => onSetScore(m.id, "a", v)}
                    locked={locked}
                    active={hasTip}
                  />
                </div>
                <div className="gm-team r">
                  <span className="tname"><Flag name={m.away} size={16} /><span>{m.away}</span></span>
                </div>
              </div>

              {/* Result row */}
              {hasOfficial && !(isAdmin && adminEditing) && (
                <div className="gm-result-row">
                  <span className="gm-result-lbl">✅ Result</span>
                  <span className="gm-result-score">{official.homeScore} – {official.awayScore}</span>
                </div>
              )}
              {isAdmin && adminEditing && (
                <ResultEntry
                  matchId={m.id}
                  official={official}
                  onSetOfficial={(mid, h, a) => onSetOfficial(mid, h, a)}
                  onClearOfficial={onClearOfficial}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Predicted standings */}
      {(() => {
        const table = calcPredictedTable(group, matches, myPreds);
        const anyTipped = table.some(r => r.pld > 0);
        if (!anyTipped) return null;
        return (
          <div style={{ borderTop: "1px dashed #e0d2bd", padding: "8px 12px 10px" }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#9aa0ad", marginBottom: 5 }}>Predicted Standings</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
              <thead>
                <tr style={{ color: "#9aa0ad", fontWeight: 800, fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase" }}>
                  <th style={{ width: 18 }}></th>
                  <th style={{ textAlign: "left", paddingLeft: 4 }}>Team</th>
                  <th style={{ textAlign: "center" }}>P</th>
                  <th style={{ textAlign: "center" }}>GD</th>
                  <th style={{ textAlign: "center", fontWeight: 900 }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => (
                  <tr key={row.team} style={{
                    background: i < 2 ? "rgba(18,179,166,.08)" : i === 2 ? "rgba(255,176,32,.06)" : "transparent",
                    borderTop: "1px solid #f4ebdf"
                  }}>
                    <td style={{ textAlign: "center", color: "#9aa0ad", fontWeight: 800, fontSize: 10 }}>{i + 1}</td>
                    <td style={{ paddingLeft: 4 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
                        <Flag name={row.team} size={12} />{row.team}
                      </span>
                    </td>
                    <td style={{ textAlign: "center", color: "#6c7384" }}>{row.pld}</td>
                    <td style={{ textAlign: "center", color: "#6c7384" }}>{row.gd >= 0 ? `+${row.gd}` : row.gd}</td>
                    <td style={{ textAlign: "center", fontWeight: 900, color: "#222a3d" }}>{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", gap: 10, marginTop: 5, fontSize: 9.5, color: "#9aa0ad" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(18,179,166,.3)", display: "inline-block" }} />Qualify</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,176,32,.3)", display: "inline-block" }} />Best 3rd</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}