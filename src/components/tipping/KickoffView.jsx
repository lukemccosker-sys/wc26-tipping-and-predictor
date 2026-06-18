import React, { useState } from "react";
import Flag from "@/lib/flags";
import ScoreInput from "./ScoreInput";
import ResultEntry from "./ResultEntry";
import Countdown from "./Countdown";
import TeamStatsModal from "./TeamStatsModal";
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
  const [selectedTeam, setSelectedTeam] = useState(null);
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

  const hasOfficialResult = (m) => {
    const r = officialResults.find(r => r.matchId === m.id);
    return r && r.homeScore != null && r.awayScore != null;
  };

  // Upcoming (no official result yet) sorted by kickoff asc; finished sorted by kickoff asc
  const upcoming = [...GROUP_MATCHES]
    .filter(m => !hasOfficialResult(m))
    .sort((a, b) => (kickoffs?.[a.id] || 0) - (kickoffs?.[b.id] || 0));

  const finished = [...GROUP_MATCHES]
    .filter(m => hasOfficialResult(m))
    .sort((a, b) => (kickoffs?.[a.id] || 0) - (kickoffs?.[b.id] || 0));

  const sorted = [...upcoming, ...finished];

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

  const teamBtn = (teamName) => (
    <button
      onClick={() => setSelectedTeam(teamName)}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
    >
      <span
        className="tname"
        style={{ textDecoration: "underline dotted", textUnderlineOffset: 3, textDecorationColor: "rgba(107,116,132,.4)" }}
      >
        <Flag name={teamName} size={16} /><span>{teamName}</span>
      </span>
    </button>
  );

  return (
    <div>
      {selectedTeam && (
        <TeamStatsModal
          team={selectedTeam}
          officialResults={officialResults}
          onClose={() => setSelectedTeam(null)}
        />
      )}
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
                      {locked && !hasOfficial && (
                        <span className="gm-lock-badge">🔒 Locked</span>
                      )}
                      {locked && hasOfficial && <span className="gm-lock-badge">✅ Final</span>}
                      {hasTip && !locked && <span className="tip-saved">✓ saved</span>}
                      {scored && <span className={`pts-circle t-${scored.tier}`}>{scored.pts}</span>}
                    </div>

                    {/* Match row */}
                    <div className={`gm-main${locked ? " gm-locked" : ""}`}>
                      <div className="gm-team">{teamBtn(m.home)}</div>
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
                      <div className="gm-team r">{teamBtn(m.away)}</div>
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
          </div>
        ))}
      </div>
    </div>
  );
}