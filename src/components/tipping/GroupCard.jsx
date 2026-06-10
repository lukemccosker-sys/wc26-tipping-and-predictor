import React from "react";
import Flag from "@/lib/flags";
import ScoreInput from "./ScoreInput";
import Countdown from "./Countdown";
import { groupMatches } from "@/lib/wc2026data";
import { scoreTip } from "@/lib/wc2026data";

function fmtKick(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function GroupCard({
  group, predictions, officialResults, kickoffs,
  onSetScore, isAdmin, adminEditing, onSetOfficial,
  player, poolSettings
}) {
  const matches = groupMatches(group);

  const getPred = (matchId) => predictions.find(p => p.playerId === player?.id && p.matchId === matchId);
  const getOfficial = (matchId) => officialResults.find(r => r.matchId === matchId);
  const getKickoff = (matchId) => kickoffs?.[matchId] || null;

  const isLocked = (matchId) => {
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
          const hasOfficial = official && official.homeScore != null;
          const scored = hasOfficial && hasTip ? scoreTip(pred, official, settings) : null;

          return (
            <div className={`gm${scored ? " scored" : ""}`} key={m.id} id={`match-${m.id}`}>
              <div className="cd-row">
                {kicked && <span className="kick-when">{fmtKick(kicked)}</span>}
                <Countdown kickoff={kicked} />
                {locked && !hasOfficial && <span className="cd cd-closed">Locked</span>}
                {hasTip && !locked && <span className="tip-saved">✓ saved</span>}
                {scored && (
                  <span className={`pts-circle t-${scored.tier}`}>{scored.pts}</span>
                )}
              </div>
              <div className="gm-main">
                <div className="gm-team">
                  <span className="tname"><Flag name={m.home} size={16} /><span>{m.home}</span></span>
                </div>
                <div className={`gm-score${hasTip && !locked ? " tipped" : ""}${locked ? " locked" : ""}`}>
                  {hasOfficial && adminEditing ? (
                    <>
                      <ScoreInput value={official.homeScore} onChange={v => onSetOfficial(m.id, "h", v)} locked={false} active />
                      <span className="vs">vs</span>
                      <ScoreInput value={official.awayScore} onChange={v => onSetOfficial(m.id, "a", v)} locked={false} active />
                    </>
                  ) : hasOfficial ? (
                    <>
                      <div className="sin ro act"><div className="sin-num">{official.homeScore}</div></div>
                      <span className="vs">–</span>
                      <div className="sin ro act"><div className="sin-num">{official.awayScore}</div></div>
                    </>
                  ) : adminEditing ? (
                    <>
                      <ScoreInput value={official?.homeScore} onChange={v => onSetOfficial(m.id, "h", v)} locked={false} active />
                      <span className="vs">vs</span>
                      <ScoreInput value={official?.awayScore} onChange={v => onSetOfficial(m.id, "a", v)} locked={false} active />
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
                <div className="gm-team r">
                  <span className="tname"><Flag name={m.away} size={16} /><span>{m.away}</span></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}