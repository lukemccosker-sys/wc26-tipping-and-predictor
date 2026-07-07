import React, { useState, useRef, useEffect } from "react";
import Flag from "@/lib/flags";
import { Lock } from "lucide-react";
import { KO_MATCHES, ROUND_ORDER, ROUND_NAME } from "@/lib/wc2026data";

const ROUND_SHORT = { R32:"R32", R16:"R16", QF:"QF", SF:"Semis", "3rd":"3rd", F:"Final" };

function slotLabel(slot) {
  if (!slot) return "TBD";
  if (slot.startsWith("W")) return `Winner M${slot.slice(2)}`;
  if (slot.startsWith("L")) return `Loser M${slot.slice(2)}`;
  // e.g. "1A" → "Group A winners", "2B" → "Group B runners-up"
  if (slot.match(/^[12][A-L]$/)) {
    const pos = slot[0] === "1" ? "winners" : "runners-up";
    return `Group ${slot[1]} ${pos}`;
  }
  // e.g. "3ABCDF" → "Group A/B/C/D/F 3rd place"
  if (slot.startsWith("3")) {
    const groups = slot.slice(1).split("").join("/");
    return `Group ${groups} 3rd place`;
  }
  return slot;
}

export default function PredictorBracket({ bracketPred, locked, koTeams, onPickAdvance, onGoToAwards, officialResults, predSettings, officialKOTeams }) {
  const [round, setRound] = useState("R16");
  const topRef = useRef(null);

  // Local picks state — source of truth for UI. Syncs from prop only on initial load.
  const [localPicks, setLocalPicks] = useState(() =>
    bracketPred?.advancePicks ? JSON.parse(bracketPred.advancePicks) : {}
  );
  const initialised = useRef(false);

  // Sync from prop on first load, and clear if bracketPred is wiped (reset)
  useEffect(() => {
    if (!bracketPred) {
      setLocalPicks({});
      initialised.current = false;
      return;
    }
    if (!initialised.current && bracketPred.advancePicks) {
      setLocalPicks(JSON.parse(bracketPred.advancePicks));
      initialised.current = true;
    }
  }, [bracketPred]);

  // Build actualRoundReached map from official results
  const actualRoundReached = {};
  if (officialKOTeams && officialResults) {
    for (const m of KO_MATCHES) {
      const teams = officialKOTeams[m.id];
      if (!teams) continue;
      [teams.home, teams.away].filter(Boolean).forEach(t => {
        const rIdx = ROUND_ORDER.indexOf(m.round);
        const existing = ROUND_ORDER.indexOf(actualRoundReached[t] || "");
        if (rIdx > existing) actualRoundReached[t] = m.round;
      });
      const res = officialResults.find(r => r.matchId === m.id);
      if (res && res.homeScore != null) {
        const h = +res.homeScore, a = +res.awayScore;
        let winner = null;
        if (h > a) winner = teams.home;
        else if (h < a) winner = teams.away;
        else if (res.penaltyWinner === "h") winner = teams.home;
        else if (res.penaltyWinner === "a") winner = teams.away;
        if (winner) {
          const rIdx = ROUND_ORDER.indexOf(m.round);
          const nextRound = ROUND_ORDER[rIdx + 1];
          if (nextRound) {
            const existing = ROUND_ORDER.indexOf(actualRoundReached[winner] || "");
            if (ROUND_ORDER.indexOf(nextRound) > existing) actualRoundReached[winner] = nextRound;
          }
        }
      }
    }
  }

  const computeMatchEarned = (m) => {
    if (m.round === "R32") {
      const s = predSettings || {};
      const pickedSide = localPicks[m.id];
      const pickedTeam = pickedSide === "h" ? (koTeams?.[m.id]?.home) : pickedSide === "a" ? (koTeams?.[m.id]?.away) : null;
      if (!pickedTeam) return null;
      const teamRound = actualRoundReached[pickedTeam];
      if (!teamRound) return null;
      if (ROUND_ORDER.indexOf(teamRound) >= ROUND_ORDER.indexOf("R16")) {
        return +s.r16 || 2;
      }
      return 0;
    }
    const s = predSettings || {};
    const pickedSide = localPicks[m.id];
    const pickedTeam = pickedSide === "h" ? (koTeams?.[m.id]?.home) : pickedSide === "a" ? (koTeams?.[m.id]?.away) : null;
    if (!pickedTeam) return null;
    if (m.round === "3rd") {
      const actualTeams = officialKOTeams?.[m.id];
      const res = officialResults?.find(r => r.matchId === m.id);
      if (!actualTeams || !res || res.homeScore == null) return null;
      const h = +res.homeScore, a = +res.awayScore;
      let winner = null;
      if (h > a) winner = actualTeams.home;
      else if (h < a) winner = actualTeams.away;
      else if (res.penaltyWinner === "h") winner = actualTeams.home;
      else if (res.penaltyWinner === "a") winner = actualTeams.away;
      if (!winner) return null;
      return winner === pickedTeam ? (+s.third_place || 5) : 0;
    }
    // Only show earned points if this match has actually been played
    const matchRes = officialResults?.find(r => r.matchId === m.id);
    if (!matchRes || matchRes.homeScore == null) return null;
    const teamRound = actualRoundReached[pickedTeam];
    if (!teamRound) return null;
    if (m.round === "F") {
      const at = officialKOTeams?.[m.id];
      if (!at) return null;
      const fh = +matchRes.homeScore, fa = +matchRes.awayScore;
      let fWinner = null;
      if (fh > fa) fWinner = at.home;
      else if (fh < fa) fWinner = at.away;
      else if (matchRes.penaltyWinner === "h") fWinner = at.home;
      else if (matchRes.penaltyWinner === "a") fWinner = at.away;
      return fWinner && fWinner === pickedTeam ? (+s.champ || 12) : 0;
    }
    // Award next-round points if the team advanced past this round
    if (ROUND_ORDER.indexOf(teamRound) > ROUND_ORDER.indexOf(m.round)) {
      const nextRoundPtsMap = { R16: "qf", QF: "sf", SF: "final" };
      const key = nextRoundPtsMap[m.round];
      return key ? (+s[key] || 0) : 0;
    }
    return 0;
  };

  const idx = ROUND_ORDER.indexOf(round);
  const matches = KO_MATCHES.filter(m => m.round === round);

  // Build winners from local picks so subsequent rounds update instantly
  const predWinners = {};
  for (const [matchId, side] of Object.entries(localPicks)) {
    if (!side) continue;
    const m = KO_MATCHES.find(x => x.id === matchId);
    if (!m) continue;
    const team = koTeams?.[matchId]?.[side === "h" ? "home" : "away"];
    if (team) predWinners[matchId] = team;
  }

  const champion = predWinners["M104"];

  const handlePick = (matchId, side) => {
    if (locked) return;
    setLocalPicks(prev => {
      const next = { ...prev, [matchId]: prev[matchId] === side ? null : side };
      onPickAdvance(matchId, next[matchId]);
      return next;
    });
  };

  const goRound = (r) => {
    setRound(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const groupPicks = bracketPred?.groupPicks ? JSON.parse(bracketPred.groupPicks) : {};
  const thirdPicks = bracketPred?.thirdPicks ? JSON.parse(bracketPred.thirdPicks) : {};
  const groupsDone = Object.keys(groupPicks).filter(L => groupPicks[L]?.first && groupPicks[L]?.second).length;
  const thirdsCount = Object.keys(thirdPicks).filter(k => thirdPicks[k]).length;
  const predGroupsComplete = groupsDone === 12;

  // Per-round completion prompts
  const picksByRound = {};
  const roundMatchCount = {};
  for (const r of ROUND_ORDER) {
    const rm = KO_MATCHES.filter(m => m.round === r);
    roundMatchCount[r] = rm.length;
    picksByRound[r] = rm.filter(m => localPicks[m.id]).length;
  }
  const currentRoundDone = picksByRound[round] === roundMatchCount[round];
  const nextRound = ROUND_ORDER[idx + 1];

  const renderMatch = (m) => {
    const home = koTeams?.[m.id]?.home;
    const away = koTeams?.[m.id]?.away;
    const teamsKnown = !!(home && away);
    const picked = localPicks[m.id];
    const isF = m.round === "F";
    const is3rd = m.round === "3rd";
    const earned = computeMatchEarned(m);

    return (
      <div className={`ko pko${isF ? " final" : ""}${is3rd ? " bronze" : ""}${!teamsKnown ? " pending" : ""}`} key={m.id}>
        <div className="ko-h">
          <span>M{m.id.slice(1)}</span>
          <span className="ko-v">{isF ? "Champion decider" : m.venue}</span>
        </div>

        {[["h", home, m.h], ["a", away, m.a]].map(([side, team, slot]) => {
          const isPicked = picked === side;
          const sideEarned = isPicked ? earned : null;
          return (
            <button
              key={side}
              className={`pko-row${isPicked ? " picked" : ""}${!team ? " empty" : ""}`}
              disabled={locked || !team}
              onClick={() => handlePick(m.id, side)}
            >
              <span className="ko-team">
                {team ? <><Flag name={team} size={16} /><span>{team}</span></> : <span className="ko-ph">{slotLabel(slot)}</span>}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                {sideEarned != null && sideEarned > 0 && <span className="mini-pts">+{sideEarned}</span>}
                {isPicked && <span className="pko-tick">{isF ? "🏆" : "✓"}</span>}
                {locked && <Lock size={11} style={{ color: "var(--muted2)", opacity: 0.5, flexShrink: 0 }} />}
              </span>
            </button>
          );
        })}

        {!teamsKnown && <div className="ko-pending">Pick winners in earlier rounds first</div>}
      </div>
    );
  };

  const s = predSettings || {};
  const roundPts = {
    "R16": +s.r16 || 2,
    "QF": +s.qf || 4,
    "SF": +s.sf || 6,
    "3rd": +s.third_place || 3,
    "F": +s.final || 9,
  };
  const champBonus = +s.champ || 15;

  return (
    <div className="bracket-wrap" ref={topRef}>
      {!predGroupsComplete && (
        <div className="alert-red">⚠️ Finish picking 1st & 2nd for all 12 groups first — go to the Groups tab.</div>
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

      {currentRoundDone && nextRound && nextRound !== "3rd" && round !== "SF" && round !== "F" && (
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