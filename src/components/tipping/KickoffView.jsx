import React from "react";
import Flag from "@/lib/flags";
import ScoreInput from "./ScoreInput";
import Countdown from "./Countdown";
import { GROUP_MATCHES } from "@/lib/wc2026data";
import { scoreTip } from "@/lib/wc2026data";

function fmtKick(ms) {
  if (!ms) return "TBC";
  return new Date(ms).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtDay(ms) {
  if (!ms) return "TBC";
  return new Date(ms).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

export default function KickoffView({
  predictions, officialResults, kickoffs,
  onSetScore, isAdmin, adminEditing, onSetOfficial, onClearOfficial,
  player, poolSettings
}) {
  const globalLock = poolSettings?.globalLockTipping ?? false;
  const settings = {
    exact: poolSettings?.pointsExact ?? 5,
    gd: poolSettings?.pointsGD ?? 3,
    result: poolSettings?.pointsResult ?? 1,
  };

  const isLocked = (matchId) => {
    if (globalLock) return true;
    const ko = kickoffs?.[matchId];
    if (!ko) return false;
    return Date.now() >= ko;
  };

  // Sort all group matches by kickoff time
  const sorted = [...GROUP_MATCHES].sort((a, b) => {
    const ka = kickoffs?.[a.id] || 0;
    const kb = kickoffs?.[b.id] || 0;
    return ka - kb;
  });

  // Group by day
  const byDay = [];
  let currentDay = null;
  for (const m of sorted) {
    const ko = kickoffs?.[m.id];
    const day = ko ? fmtDay(ko) : "TBC";
    if (day !== currentDay) {
      byDay.push({ day, matches: [] });
      currentDay = day;
    }
    byDay[byDay.length - 1].matches.push(m);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {byDay.map(({ day, matches }) => (
        <div key={day}>
          <div style={{
            fontFamily: "'Anton', sans-serif", fontSize: 15, letterSpacing: ".04em",
            textTransform: "uppercase", color: "var(--pink)", marginBottom: 8
          }}>{day}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {matches.map(m => {
              const pred = predictions.find(p => p.playerId === player?.id && p.matchId === m.id);
              const official = officialResults.find(r => r.matchId === m.id);
              const locked = isLocked(m.id) || !!official;
              const kicked = kickoffs?.[m.id];
              const hasTip = pred && pred.homeScore != null && pred.awayScore != null;
              const hasOfficial = official && official.homeScore != null && official.awayScore != null;
              const scored = hasOfficial && hasTip ? scoreTip(pred, official, settings) : null;

              return (
                <div
                  className={`card${scored ? " scored" : ""}${locked ? " locked-match" : ""}`}
                  key={m.id}
                  id={`match-${m.id}`}
                  style={{ padding: "10px 14px" }}
                >
                  {/* Header row */}
                  <div className="cd-row" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted2)", letterSpacing: ".06em", textTransform: "uppercase" }}>
                      Group {m.group}
                    </span>
                    {kicked && <span className="kick-when" style={{ marginLeft: "auto" }}>{fmtKick(kicked)}</span>}
                    <Countdown kickoff={kicked} />
                    {locked && !hasOfficial && <span className="gm-lock-badge">🔒 Locked</span>}
                    {locked && hasOfficial && <span className="gm-lock-badge">🔒 Final</span>}
                    {hasTip && !locked && <span className="tip-saved">✓ saved</span>}
                    {scored && <span className={`pts-circle t-${scored.tier}`}>{scored.pts}</span>}
                  </div>

                  {/* Match row */}
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
                  {(adminEditing || hasOfficial) && (
                    <div className="gm-result-row">
                      <span className="gm-result-lbl">
                        {hasOfficial ? "✅ Result" : "📝 Enter result"}
                      </span>
                      <div className="gm-result-inputs">
                        {adminEditing ? (
                          <>
                            <ScoreInput
                              value={official?.homeScore}
                              onChange={v => onSetOfficial(m.id, "h", v)}
                              locked={false}
                              active={hasOfficial}
                            />
                            <span className="vs">–</span>
                            <ScoreInput
                              value={official?.awayScore}
                              onChange={v => onSetOfficial(m.id, "a", v)}
                              locked={false}
                              active={hasOfficial}
                            />
                            {hasOfficial && (
                              <button className="result-clear-btn" onClick={() => onClearOfficial(m.id)}>✕</button>
                            )}
                          </>
                        ) : (
                          <span className="gm-result-score">{official.homeScore} – {official.awayScore}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}