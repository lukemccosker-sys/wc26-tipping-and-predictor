import React, { useState, useEffect, useRef } from "react";
import Flag from "@/lib/flags";
import { WC_GROUPS, GL } from "@/lib/wc2026data";

export default function PredictorGroups({ bracketPred, locked, onPickPos, onPickThird, onSuggest, canSuggest }) {
  // Local state — source of truth for the UI, avoids glitches from debounced DB saves
  const [localGroupPicks, setLocalGroupPicks] = useState(() =>
    bracketPred?.groupPicks ? JSON.parse(bracketPred.groupPicks) : {}
  );
  const [localThirdPicks, setLocalThirdPicks] = useState(() =>
    bracketPred?.thirdPicks ? JSON.parse(bracketPred.thirdPicks) : {}
  );
  const initialised = useRef(false);

  // Sync from prop only once when bracketPred first arrives (after data loads or after auto-fill)
  useEffect(() => {
    if (bracketPred) {
      setLocalGroupPicks(bracketPred.groupPicks ? JSON.parse(bracketPred.groupPicks) : {});
      setLocalThirdPicks(bracketPred.thirdPicks ? JSON.parse(bracketPred.thirdPicks) : {});
      initialised.current = true;
    }
  }, [bracketPred?.groupPicks, bracketPred?.thirdPicks]);

  const groupsDone = GL.filter(L => localGroupPicks[L]?.first && localGroupPicks[L]?.second).length;
  const thirdsCount = Object.keys(localThirdPicks).filter(k => localThirdPicks[k]).length;

  const handlePickPos = (L, team, pos) => {
    setLocalGroupPicks(prev => {
      const group = { ...(prev[L] || {}) };
      if (pos === 1) {
        if (group.second === team) group.second = null;
        group.first = group.first === team ? null : team;
      } else {
        if (group.first === team) group.first = null;
        group.second = group.second === team ? null : team;
      }
      onPickPos(L, team, pos);
      return { ...prev, [L]: group };
    });
  };

  const handlePickThird = (L, team) => {
    setLocalThirdPicks(prev => {
      const next = { ...prev };
      if (next[L] === team) {
        next[L] = null;
      } else {
        const count = Object.values(next).filter(Boolean).length;
        if (count >= 8 && !next[L]) {
          alert("You can only pick 8 best-3rd teams.");
          return prev;
        }
        next[L] = team;
      }
      onPickThird(L, team);
      return next;
    });
  };

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
          const picks = localGroupPicks[L] || {};
          const third = localThirdPicks[L] || null;

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
                            onClick={() => handlePickPos(L, team, 1)}
                          >1st</button>
                          <button
                            className={`posb p2${isS ? " on" : ""}`}
                            onClick={() => handlePickPos(L, team, 2)}
                          >2nd</button>
                          <button
                            className={`posb b3${isT ? " on" : ""}`}
                            disabled={isF || isS}
                            onClick={() => handlePickThird(L, team)}
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