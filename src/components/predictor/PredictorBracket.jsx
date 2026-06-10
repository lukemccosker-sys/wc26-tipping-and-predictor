import React, { useState, useRef } from "react";
import Flag from "@/lib/flags";
import { KO_MATCHES, ROUND_ORDER, ROUND_NAME } from "@/lib/wc2026data";

const ROUND_SHORT = { R32:"R32", R16:"R16", QF:"QF", SF:"Semis", "3rd":"3rd", F:"Final" };

function slotLabel(slot) {
  if (!slot) return "TBD";
  if (slot.startsWith("W")) return `Winner M${slot.slice(1)}`;
  if (slot.startsWith("L")) return `Loser M${slot.slice(1)}`;
  return slot;
}

export default function PredictorBracket({ bracketPred, locked, koTeams, onPickAdvance, onGoToAwards }) {
  const [round, setRound] = useState("R32");
  const topRef = useRef(null);

  const advancePicks = bracketPred?.advancePicks ? JSON.parse(bracketPred.advancePicks) : {};

  const idx = ROUND_ORDER.indexOf(round);
  const matches = KO_MATCHES.filter(m => m.round === round);

  // Build predictor winners from advancePicks
  const predWinners = {};
  for (const [matchId, side] of Object.entries(advancePicks)) {
    const m = KO_MATCHES.find(x => x.id === matchId);
    if (!m) continue;
    const team = koTeams?.[matchId]?.[side];
    if (team) predWinners[matchId] = team;
  }

  const goRound = (r) => {
    setRound(r);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Check if group picks are done
  const groupPicks = bracketPred?.groupPicks ? JSON.parse(bracketPred.groupPicks) : {};
  const thirdPicks = bracketPred?.thirdPicks ? JSON.parse(bracketPred.thirdPicks) : {};
  const groupsDone = Object.keys(groupPicks).filter(L => groupPicks[L]?.first && groupPicks[L]?.second).length;
  const thirdsCount = Object.keys(thirdPicks).filter(k => thirdPicks[k]).length;
  const predGroupsComplete = groupsDone === 12 && thirdsCount === 8;

  const champion = predWinners["M104"];

  // Count picks per round
  const picksByRound = {};
  for (const r of ROUND_ORDER) {
    const roundMatches = KO_MATCHES.filter(m => m.round === r);
    picksByRound[r] = roundMatches.filter(m => advancePicks[m.id]).length;
  }
  const roundMatchCount = {};
  for (const r of ROUND_ORDER) {
    roundMatchCount[r] = KO_MATCHES.filter(m => m.round === r).length;
  }
  const currentRoundDone = picksByRound[round] === roundMatchCount[round];
  const nextRound = ROUND_ORDER[idx + 1];

  const renderMatch = (m) => {
    const home = koTeams?.[m.id]?.home;
    const away = koTeams?.[m.id]?.away;
    const teamsKnown = !!(home && away);
    const picked = advancePicks[m.id];
    const isF = m.round === "F";
    const is3rd = m.round === "3rd";

    return (
      <div className={`ko pko${isF ? " final" : ""}${is3rd ? " bronze" : ""}${!teamsKnown ? " pending" : ""}`} key={m.id}>
        <div className="ko-h">
          <span>M{m.id.slice(1)}</span>
          <span className="ko-v">{isF ? "Champion decider" : m.venue}</span>
        </div>

        {[["h", home, m.h], ["a", away, m.a]].map(([side, team, slot]) => {
          const isPicked = picked === side;
          return (
            <button
              key={side}
              className={`pko-row${isPicked ? " picked" : ""}${!team ? " empty" : ""}`}
              disabled={locked || !team}
              onClick={() => !locked && team && onPickAdvance(m.id, side)}
            >
              <span className="ko-team">
                {team ? <><Flag name={team} size={16} /><span>{team}</span></> : <span className="ko-ph">{slotLabel(slot)}</span>}
              </span>
              {isPicked && <span className="pko-tick">{isF ? "🏆" : "✓"}</span>}
            </button>
          );
        })}

        {!teamsKnown && <div className="ko-pending">Pick winners in earlier rounds first</div>}
      </div>
    );
  };

  return (
    <div className="bracket-wrap" ref={topRef}>
      {!predGroupsComplete && (
        <div className="alert-red">⚠️ Finish picking groups first — go to the Groups tab to set 1st, 2nd & best-3rd for each group.</div>
      )}

      {champion && (
        <div className="notice">Your champion: <b><Flag name={champion} size={16} /> {champion}</b> 🏆</div>
      )}

      <div className="round-nav">
        <button className="rn-arrow" disabled={idx === 0} onClick={() => goRound(ROUND_ORDER[idx - 1])}>◀</button>
        <div className="rn-chips">
          {ROUND_ORDER.map(r => (
            <button key={r} className={`rn-chip rc-${r}${round === r ? " on" : ""}`} onClick={() => goRound(r)}>
              {ROUND_SHORT[r]}
            </button>
          ))}
        </div>
        <button className="rn-arrow" disabled={idx === ROUND_ORDER.length - 1} onClick={() => goRound(ROUND_ORDER[idx + 1])}>▶</button>
      </div>

      <div className={`rn-head rc-${round}`}>
        <span className="rn-name">{ROUND_NAME[round]}</span>
        <span className="rn-count">{matches.length} {matches.length === 1 ? "match" : "matches"}</span>
      </div>

      <div className="ko-grid">{matches.map(renderMatch)}</div>

      {currentRoundDone && nextRound && nextRound !== "3rd" && (
        <div className="step-prompt" style={{ marginTop: 14 }}>
          <span className="step-prompt-txt">✅ All {ROUND_NAME[round]} picks done! Move on to the {ROUND_NAME[nextRound]}.</span>
          <button className="step-prompt-btn" onClick={() => goRound(nextRound)}>Go to {ROUND_NAME[nextRound]} →</button>
        </div>
      )}
      {currentRoundDone && round === "SF" && (
        <div className="step-prompt" style={{ marginTop: 14 }}>
          <span className="step-prompt-txt">✅ Semis picked! Don't forget the 3rd place play-off and the Final.</span>
          <button className="step-prompt-btn" onClick={() => goRound("3rd")}>Go to 3rd Place →</button>
        </div>
      )}
      {currentRoundDone && round === "F" && champion && (
        <div className="step-prompt" style={{ marginTop: 14 }}>
          <span className="step-prompt-txt">🏆 Champion picked: <b>{champion}</b>! Last step — pick the four individual award winners.</span>
          <button className="step-prompt-btn" onClick={onGoToAwards}>Go to Awards →</button>
        </div>
      )}

      <div className="ko-nextbar">
        {idx > 0 && (
          <button className="ko-nav prev" onClick={() => goRound(ROUND_ORDER[idx - 1])}>
            ◀ {ROUND_NAME[ROUND_ORDER[idx - 1]]}
          </button>
        )}
        {idx < ROUND_ORDER.length - 1 ? (
          <button className="ko-nav next" onClick={() => goRound(ROUND_ORDER[idx + 1])}>
            Next: {ROUND_NAME[ROUND_ORDER[idx + 1]]} →
          </button>
        ) : (
          <button className="ko-nav next" onClick={onGoToAwards}>
            Go to Awards →
          </button>
        )}
      </div>
    </div>
  );
}