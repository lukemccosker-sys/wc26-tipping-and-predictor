import React, { useState, useEffect, useRef } from "react";
import Flag from "@/lib/flags";
import { Lock } from "lucide-react";
import { WC_GROUPS, GL } from "@/lib/wc2026data";
import { calcGroupTable } from "@/lib/scoring";

export default function PredictorGroups({ bracketPred, locked, onPickPos, onPickThird, onSuggest, canSuggest, suggestionKey, officialResults, predSettings, standingsOverride, thirdPlaceSlots }) {
  // Local state — source of truth for the UI, prevents glitches from debounced DB saves
  const [localGroupPicks, setLocalGroupPicks] = useState(() =>
    bracketPred?.groupPicks ? JSON.parse(bracketPred.groupPicks) : {}
  );
  const [localThirdPicks, setLocalThirdPicks] = useState(() =>
    bracketPred?.thirdPicks ? JSON.parse(bracketPred.thirdPicks) : {}
  );
  const initialised = useRef(false);

  // Sync on first load, and clear if bracketPred is wiped (reset)
  useEffect(() => {
    if (!bracketPred) {
      setLocalGroupPicks({});
      setLocalThirdPicks({});
      initialised.current = false;
      return;
    }
    if (!initialised.current) {
      setLocalGroupPicks(bracketPred.groupPicks ? JSON.parse(bracketPred.groupPicks) : {});
      setLocalThirdPicks(bracketPred.thirdPicks ? JSON.parse(bracketPred.thirdPicks) : {});
      initialised.current = true;
    }
  }, [bracketPred]);

  // Re-sync when an auto-fill happens (parent increments suggestionKey)
  const prevSuggestionKey = useRef(suggestionKey);
  useEffect(() => {
    if (suggestionKey !== prevSuggestionKey.current && bracketPred) {
      prevSuggestionKey.current = suggestionKey;
      setLocalGroupPicks(bracketPred.groupPicks ? JSON.parse(bracketPred.groupPicks) : {});
      setLocalThirdPicks(bracketPred.thirdPicks ? JSON.parse(bracketPred.thirdPicks) : {});
    }
  }, [suggestionKey, bracketPred]);

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
      const next = { ...prev, [L]: group };
      // Pass the full updated picks to the parent so the DB save uses the correct state
      onPickPos(next, L, team, pos);
      return next;
    });
    // Clear this team's 3rd-place pick if they're now 1st or 2nd
    setLocalThirdPicks(prev => {
      if (prev[L] !== team) return prev;
      const next = { ...prev, [L]: null };
      onPickThird(next, L, team);
      return next;
    });
  };

  const handlePickThird = (L, team) => {
    // Don't allow picking a team as 3rd if they're already 1st or 2nd
    const picks = localGroupPicks[L] || {};
    if (picks.first === team || picks.second === team) return;

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
      // Pass the full updated picks to the parent so the DB save uses the correct state
      onPickThird(next, L, team);
      return next;
    });
  };

  const computeGroupEarned = (group) => {
    if (!officialResults) return null;
    const s = predSettings || {};
    const table = calcGroupTable(group, officialResults, standingsOverride);
    const totalPld = table.reduce((acc, r) => acc + r.pld, 0);
    if (totalPld < 12) return null;
    const actual1st = table[0]?.team;
    const actual2nd = table[1]?.team;
    const actual3rd = table[2]?.team;
    const actualQualifiers = new Set([actual1st, actual2nd].filter(Boolean));
    const slotsAssigned = thirdPlaceSlots || {};
    // Include actual 3rd as a qualifier if they were assigned to a best-3rd slot (incremental)
    if (actual3rd && Object.values(slotsAssigned).includes(actual3rd)) {
      actualQualifiers.add(actual3rd);
    }
    const pick = localGroupPicks[group] || {};
    let pts = 0;
    const earned = {};
    if (actual1st && pick.first === actual1st) { const v = +s.g1 || 3; pts += v; earned.first = v; }
    if (actual2nd && pick.second === actual2nd) { const v = +s.g2 || 2; pts += v; earned.second = v; }
    if (pick.first && actualQualifiers.has(pick.first)) { const v = +s.r32 || 1; pts += v; earned.r32first = v; }
    if (pick.second && actualQualifiers.has(pick.second)) { const v = +s.r32 || 1; pts += v; earned.r32second = v; }
    if (localThirdPicks[group] && actualQualifiers.has(localThirdPicks[group])) { const v = +s.r32 || 1; pts += v; earned.r32third = v; }
    if (actual3rd && localThirdPicks[group] === actual3rd && Object.values(slotsAssigned).includes(actual3rd)) { const v = +s.third || 2; pts += v; earned.third = v; }
    return { pts, earned };
  };

  const s = predSettings || {};

  return (
    <div>
      <div className="ko-rules">
        🥇 <b>Group stage scoring:</b> Correctly pick 1st place: <b>{+s.g1 || 3}pts</b> · 2nd place: <b>{+s.g2 || 2}pts</b> · Best-3rd qualifier: <b>{+s.third || 2}pts</b>. Plus, any team you pick that qualifies for the knockout stage (as 1st, 2nd, or best-3rd) earns <b>{+s.r32 || 1}pt</b> each.
      </div>

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

      {groupsDone === 12 && !locked && (
        <div className="nudge-go">✅ All 1st & 2nd picks done! Pick your best-3rds and knockout bracket next.</div>
      )}

      <div className="groups-grid">
        {GL.map(L => {
          const teams = WC_GROUPS[L] || [];
          const picks = localGroupPicks[L] || {};
          const third = localThirdPicks[L] || null;
          const groupEarned = computeGroupEarned(L);

          return (
            <div className="card pgrp" key={L}>
              <div className="card-h">
                <div className="gtitle">GROUP {L}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {groupEarned && <span className={`earned-badge${groupEarned.pts === 0 ? " zero" : ""}`}>+{groupEarned.pts} pts</span>}
                  <div className="pgrp-key">
                    <span className="pk pk1">1st</span>
                    <span className="pk pk2">2nd</span>
                    <span className="pk pk3">3rd</span>
                  </div>
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
                        <span className="pteam-res" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          {isF ? <span className="medal-static m1">1st</span>
                            : isS ? <span className="medal-static m2">2nd</span>
                            : isT ? <span className="medal-static m3">3rd</span>
                            : <span className="medal-none">—</span>}
                          {groupEarned && (() => {
                            let tp = 0;
                            if (isF && groupEarned.earned.first) tp += groupEarned.earned.first;
                            if (isS && groupEarned.earned.second) tp += groupEarned.earned.second;
                            if (isT && groupEarned.earned.third) tp += groupEarned.earned.third;
                            if (isF && groupEarned.earned.r32first) tp += groupEarned.earned.r32first;
                            if (isS && groupEarned.earned.r32second) tp += groupEarned.earned.r32second;
                            if (isT && groupEarned.earned.r32third) tp += groupEarned.earned.r32third;
                            return tp > 0 ? <span className="mini-pts">+{tp}</span> : null;
                          })()}
                          <Lock size={11} style={{ color: "var(--muted2)", opacity: 0.6, flexShrink: 0 }} />
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