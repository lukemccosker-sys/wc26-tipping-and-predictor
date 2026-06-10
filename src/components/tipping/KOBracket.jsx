import React, { useState, useRef } from "react";
import Flag from "@/lib/flags";
import ScoreInput from "./ScoreInput";
import Countdown from "./Countdown";
import { KO_MATCHES, ROUND_ORDER, ROUND_NAME } from "@/lib/wc2026data";
import { scoreTip } from "@/lib/wc2026data";

const ROUND_SHORT = { R32:"R32", R16:"R16", QF:"QF", SF:"Semis", "3rd":"3rd", F:"Final" };

function slotLabel(slot) {
  if (!slot) return "TBD";
  if (slot.startsWith("W")) return `Winner M${slot.slice(1)}`;
  if (slot.startsWith("L")) return `Loser M${slot.slice(1)}`;
  if (slot.match(/^\d/)) return `${slot} in group`;
  return slot;
}

export default function KOBracket({
  predictions, officialResults, kickoffs, koTeams, koWinners,
  onSetScore, onSetPenalty, isAdmin, adminEditing, onSetOfficial, onSetOfficialPen, onClearOfficial,
  player, poolSettings, groupStageComplete
}) {
  const [round, setRound] = useState("R32");
  const topRef = useRef(null);

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
  const idx = ROUND_ORDER.indexOf(round);
  const matches = KO_MATCHES.filter(m => m.round === round);

  const goRound = (r) => {
    setRound(r);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderMatch = (m) => {
    const home = koTeams?.[m.id]?.home;
    const away = koTeams?.[m.id]?.away;
    const official = getOfficial(m.id);
    const pred = getPred(m.id);
    const locked = isLocked(m.id) || !!official;
    const hasOfficial = official && official.homeScore != null;
    const hasTip = pred && pred.homeScore != null && pred.awayScore != null;
    const scored = hasOfficial && hasTip ? scoreTip(pred, official, settings) : null;
    const isDraw = hasOfficial && +official.homeScore === +official.awayScore;
    const pen = official?.penaltyWinner;
    const isF = m.round === "F";
    const is3rd = m.round === "3rd";
    const teamsKnown = !!(home && away);

    return (
      <div className={`ko${isF ? " final" : ""}${is3rd ? " bronze" : ""}${!teamsKnown ? " pending" : ""}${scored ? " scored" : ""}`} key={m.id} id={`match-${m.id}`}>
        <div className="ko-h">
          <span>M{m.id.slice(1)}</span>
          <span className="ko-v">{isF ? "World Cup Final" : m.venue}</span>
          {scored && <span className={`pts-circle t-${scored.tier}`}>{scored.pts}</span>}
        </div>

        {[["h", home, m.h], ["a", away, m.a]].map(([side, team, slot]) => (
          <div className={`ko-row${koWinners?.[m.id] === team ? " win" : ""}`} key={side}>
            <span className="ko-team">
              {team ? <><Flag name={team} size={16} /><span>{team}</span></> : <span className="ko-ph">{slotLabel(slot)}</span>}
            </span>
            {hasOfficial ? (
              <span className="ko-osc">{official[side]}</span>
            ) : adminEditing && teamsKnown ? (
              <ScoreInput value={official?.[side]} onChange={v => onSetOfficial(m.id, side, v)} locked={false} active />
            ) : teamsKnown ? (
              <ScoreInput
                value={pred?.[side === "h" ? "homeScore" : "awayScore"]}
                onChange={v => onSetScore(m.id, side, v)}
                locked={locked}
                active={hasTip}
              />
            ) : (
              <span className="ko-osc" style={{ color: "var(--muted2)" }}>–</span>
            )}
          </div>
        ))}

        {!teamsKnown && <div className="ko-pending">Teams TBD</div>}

        {isDraw && home && away && (
          <div className="pen-row off">
            <div className="pen-lbl">Penalty winner</div>
            <div className="pen-btns">
              {[["h", home], ["a", away]].map(([side, team]) => (
                <button
                  key={side}
                  className={`pen-b${pen === side ? " on" : ""}`}
                  disabled={!adminEditing && !isAdmin}
                  onClick={() => (adminEditing || isAdmin) && onSetOfficialPen(m.id, side)}
                >
                  <Flag name={team} size={16} /> {team}
                  {koWinners?.[m.id] === team && <b style={{ marginLeft: 6, fontSize: 10 }}>through</b>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result entry row for admin */}
        {(adminEditing || hasOfficial) && (
          <div className="gm-result-row" style={{ marginTop: 6 }}>
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
                  <span className="vs" style={{ margin: "0 4px" }}>–</span>
                  <ScoreInput
                    value={official?.awayScore}
                    onChange={v => onSetOfficial(m.id, "a", v)}
                    locked={false}
                    active={hasOfficial}
                  />
                  {hasOfficial && (
                    <button
                      className="result-clear-btn"
                      onClick={() => onClearOfficial(m.id)}
                      title="Clear result"
                    >✕</button>
                  )}
                </>
              ) : (
                <span className="gm-result-score">
                  {official.homeScore} – {official.awayScore}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!groupStageComplete && !isAdmin) {
    return (
      <div className="notice lock" style={{ marginTop: 8 }}>
        🔒 Knockout tipping unlocks once all 72 group stage results are entered.
      </div>
    );
  }

  return (
    <div ref={topRef}>
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

      <div className="ko-nextbar">
        {idx > 0 && (
          <button className="ko-nav prev" onClick={() => goRound(ROUND_ORDER[idx - 1])}>
            ◀ {ROUND_NAME[ROUND_ORDER[idx - 1]]}
          </button>
        )}
        {idx < ROUND_ORDER.length - 1 && (
          <button className="ko-nav next" onClick={() => goRound(ROUND_ORDER[idx + 1])}>
            Next: {ROUND_NAME[ROUND_ORDER[idx + 1]]} →
          </button>
        )}
      </div>
    </div>
  );
}