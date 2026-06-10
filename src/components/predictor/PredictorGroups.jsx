import React from "react";
import Flag from "@/lib/flags";
import { WC_GROUPS, GL } from "@/lib/wc2026data";

export default function PredictorGroups({ bracketPred, locked, onPickPos, onPickThird, onSuggest, canSuggest }) {
  const groupPicks = bracketPred?.groupPicks ? JSON.parse(bracketPred.groupPicks) : {};
  const thirdPicks = bracketPred?.thirdPicks ? JSON.parse(bracketPred.thirdPicks) : {};

  const groupsDone = GL.filter(L => groupPicks[L]?.first && groupPicks[L]?.second).length;
  const thirdsCount = Object.keys(thirdPicks).filter(k => thirdPicks[k]).length;

  return (
    <div>
      <div className="pg-progress">
        Groups picked: <b className={groupsDone === 12 ? "ok" : ""}>{groupsDone}/12</b>
        {" · "}
        Best-3rd qualifiers: <b className={thirdsCount === 8 ? "ok" : ""}>{thirdsCount}/8</b>
      </div>

      {canSuggest && !locked && (
        <div className="suggest-bar">
          <div className="suggest-txt">✨ <b>Auto-fill from your tips.</b> Fill group 1st/2nd & best-3rds from how you tipped the games — then tweak anything.</div>
          <button className="suggest-btn" onClick={onSuggest}>Fill from my tips</button>
        </div>
      )}

      {groupsDone === 12 && thirdsCount === 8 && !locked && (
        <div className="nudge-go">✅ All group picks done! Pick your knockout bracket next.</div>
      )}

      <div className="groups-grid">
        {GL.map(L => {
          const teams = WC_GROUPS[L] || [];
          const picks = groupPicks[L] || {};
          const third = thirdPicks[L] || null;

          return (
            <div className="card pgrp" key={L}>
              <div className="card-h">
                <div className="gtitle">GROUP {L}</div>
                <div className="pgrp-key">
                  <span className="pk pk1">1st</span>
                  <span className="pk pk2">2nd</span>
                  <span className="pk pk3">3rd</span>
                </div>
              </div>
              <div className="pgrp-teams">
                {teams.map(team => {
                  const isF = picks.first === team;
                  const isS = picks.second === team;
                  const isT = third === team;
                  return (
                    <div className={`pteam${isF ? " f" : ""}${isS ? " s" : ""}${isT ? " t" : ""}`} key={team}>
                      <span className="pteam-n"><Flag name={team} size={20} /><span>{team}</span></span>
                      {locked ? (
                        <span className="pteam-res">
                          {isF ? <span className="medal-static m1">1st</span>
                            : isS ? <span className="medal-static m2">2nd</span>
                            : isT ? <span className="medal-static m3">3rd</span>
                            : <span className="medal-none">—</span>}
                        </span>
                      ) : (
                        <span className="pteam-btns">
                          <button
                            className={`posb p1${isF ? " on" : ""}`}
                            onClick={() => onPickPos(L, team, 1)}
                          >1st</button>
                          <button
                            className={`posb p2${isS ? " on" : ""}`}
                            onClick={() => onPickPos(L, team, 2)}
                          >2nd</button>
                          <button
                            className={`posb b3${isT ? " on" : ""}`}
                            disabled={isF || isS}
                            onClick={() => onPickThird(L, team)}
                            title="Mark as best-3rd qualifier"
                          >3rd</button>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}