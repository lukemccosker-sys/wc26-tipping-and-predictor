import React, { useState, useRef } from "react";
import Flag from "@/lib/flags";
import ScoreInput from "./ScoreInput";
import ResultEntry from "./ResultEntry";
import Countdown from "./Countdown";
import TeamStatsPanel from "./TeamStatsPanel";
import { KO_MATCHES, ROUND_ORDER, ROUND_NAME } from "@/lib/wc2026data";
import { scoreTip } from "@/lib/wc2026data";

const ROUND_SHORT = { R32:"R32", R16:"R16", QF:"QF", SF:"Semis", "3rd":"3rd", F:"Final" };

function MatchStatusBadge({ kickoff, hasOfficial }) {
  const now = Date.now();
  if (hasOfficial) return null;
  if (!kickoff) return <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", background: "rgba(150,160,175,.15)", color: "#6c7384", borderRadius: 999, padding: "2px 7px" }}>Upcoming</span>;
  const diff = kickoff - now;
  if (diff > 0 && diff <= 90 * 60 * 1000) {
    return <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", background: "rgba(44,181,81,.15)", color: "#1c7a3a", borderRadius: 999, padding: "2px 7px", display: "inline-flex", alignItems: "center", gap: 3 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2cb551", animation: "livepulse 1.8s ease-in-out infinite", display: "inline-block" }} />Live</span>;
  }
  if (diff <= 0) {
    return <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", background: "rgba(255,176,32,.15)", color: "#9a6800", borderRadius: 999, padding: "2px 7px" }}>🔒 Locked</span>;
  }
  return <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", background: "rgba(47,139,255,.12)", color: "#1f6fd6", borderRadius: 999, padding: "2px 7px" }}>Upcoming</span>;
}

function slotLabel(slot) {
  if (!slot) return "TBD";
  if (slot.startsWith("W")) return `Winner M${slot.slice(2)}`;
  if (slot.startsWith("L")) return `Loser M${slot.slice(2)}`;
  // e.g. "1A" → "Group A winners", "2B" → "Group B runners-up"
  if (slot.match(/^[12][A-L]$/)) {
    const pos = slot[0] === "1" ? "winners" : "runners-up";
    return `Group ${slot[1]} ${pos}`;
  }
  // e.g. "3ABCDF" → "Group A/B/C/D/F third place"
  if (slot.startsWith("3")) {
    const groups = slot.slice(1).split("").join("/");
    return `Group ${groups} 3rd place`;
  }
  return slot;
}

export default function KOBracket({
  predictions, officialResults, kickoffs, koTeams, koWinners,
  onSetScore, onSetPenalty, isAdmin, adminEditing, onSetOfficial, onSetOfficialPen, onClearOfficial,
  player, poolSettings, groupStageComplete
}) {
  const [round, setRound] = useState("R32");
  const [openStats, setOpenStats] = useState({});
  const topRef = useRef(null);

  const toggleStats = (matchId, side) => {
    setOpenStats(prev => {
      const current = prev[matchId];
      if (current === side) return { ...prev, [matchId]: null };
      return { ...prev, [matchId]: side };
    });
  };

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
  const idx = ROUND_ORDER.indexOf(round);
  const matches = KO_MATCHES.filter(m => m.round === round).sort((a, b) => {
    const ka = getKickoff(a.id) || Infinity;
    const kb = getKickoff(b.id) || Infinity;
    return ka - kb;
  });

  const goRound = (r) => {
    setRound(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fmtKick = (ms) => {
    if (!ms) return "";
    return new Date(ms).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
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
    const kicked = getKickoff(m.id);
    const openSide = openStats[m.id];

    const teamBtn = (teamName, matchId, side, slot) => {
      if (!teamName) return <span className="ko-ph">{slotLabel(slot)}</span>;
      const isOpen = openSide === side;
      return (
        <button
          onClick={() => toggleStats(matchId, side)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", textAlign: side === "away" ? "right" : "left" }}
        >
          <span className="tname" style={{ textDecoration: "underline dotted", textUnderlineOffset: 3, textDecorationColor: "rgba(107,116,132,.4)" }}>
            <Flag name={teamName} size={16} /><span>{teamName}</span>
          </span>
          <span style={{
            display: "block", fontSize: 9, fontWeight: 800, color: isOpen ? "var(--pink)" : "var(--teal)",
            letterSpacing: ".04em", textTransform: "uppercase", marginTop: 1, opacity: 0.85
          }}>
            {isOpen ? "▲ hide" : "▼ stats"}
          </span>
        </button>
      );
    };

    return (
      <div className={`ko${isF ? " final" : ""}${is3rd ? " bronze" : ""}${!teamsKnown ? " pending" : ""}${scored ? " scored" : ""}`} key={m.id} id={`match-${m.id}`}>
        <div className="cd-row" style={{ paddingTop: 0 }}>
          {kicked && <span className="kick-when">{fmtKick(kicked)}</span>}
          <Countdown kickoff={kicked} />
          <MatchStatusBadge kickoff={kicked} hasOfficial={hasOfficial} />
          {locked && !hasOfficial && <span className="gm-lock-badge">🔒 Locked</span>}
          {locked && hasOfficial && <span className="gm-lock-badge">✅ Final</span>}
          {hasTip && !locked && <span className="tip-saved">✓ saved</span>}
          {scored && <span className={`pts-circle t-${scored.tier}`}>{scored.pts}</span>}
        </div>

        <div className={`gm-main${locked ? " gm-locked" : ""}`}>
          <div className="gm-team">
            {teamBtn(home, m.id, "home", m.h)}
          </div>
          <div className="gm-score">
            {isAdmin && adminEditing ? (
              <ScoreInput value={official?.homeScore} onChange={v => onSetOfficial(m.id, "h", v)} locked={false} active={hasOfficial} />
            ) : (
              <ScoreInput value={pred?.homeScore} onChange={v => onSetScore(m.id, "h", v)} locked={locked || !teamsKnown} active={hasTip} />
            )}
            <span className="vs">vs</span>
            {isAdmin && adminEditing ? (
              <ScoreInput value={official?.awayScore} onChange={v => onSetOfficial(m.id, "a", v)} locked={false} active={hasOfficial} />
            ) : (
              <ScoreInput value={pred?.awayScore} onChange={v => onSetScore(m.id, "a", v)} locked={locked || !teamsKnown} active={hasTip} />
            )}
          </div>
          <div className="gm-team r">
            {teamBtn(away, m.id, "away", m.a)}
          </div>
        </div>

        {!teamsKnown && <div className="ko-pending">Teams TBD</div>}

        {/* Inline stats panel */}
        {openSide && (
          <TeamStatsPanel
            team={openSide === "home" ? home : away}
            officialResults={officialResults}
          />
        )}

        {isDraw && home && away && (
          <div className="pen-row off">
            <div className="pen-lbl">Penalty winner</div>
            {isAdmin && adminEditing ? (
              <div className="pen-btns">
                {[["h", home], ["a", away]].map(([side, team]) => (
                  <button
                    key={side}
                    className={`pen-b${pen === side ? " on" : ""}`}
                    onClick={() => onSetOfficialPen(m.id, side)}
                  >
                    <Flag name={team} size={16} /> {team}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, fontWeight: 700, color: pen ? "var(--green)" : "var(--muted2)" }}>
                {pen === "h" ? <><Flag name={home} size={14} /> {home} won on pens</> :
                 pen === "a" ? <><Flag name={away} size={14} /> {away} won on pens</> :
                 "Pending penalty result"}
              </div>
            )}
          </div>
        )}

        {/* Result row */}
        {hasOfficial && !(isAdmin && adminEditing) && (
          <div className="gm-result-row">
            <span className="gm-result-lbl">✅ Result</span>
            <span className="gm-result-score">{official.homeScore} – {official.awayScore}{pen ? ` (${pen === "h" ? home : away} on pens)` : ""}</span>
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
  };

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

      <div className="ko-rules">
        <b>KO rules:</b> Tip the score after <b>120 min</b> (90 + extra time). If it's a draw, pens decide who advances — but scoring is based on the <b>120-min scoreline</b>. A draw tip at <b>120 min</b> earns: <b>exact</b> (right score) or <b>1 pt result</b> (any draw) — <b>on top of your score points</b>. If you tipped a team to <b>win outright</b> and they win on pens, you still get <b>1 result point</b>.
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