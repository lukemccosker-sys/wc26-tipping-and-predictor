import React, { useState } from "react";
import Flag from "@/lib/flags";
import TeamStatsPanel from "./TeamStatsPanel";
import { GROUP_MATCHES, KO_MATCHES, ROUND_NAME } from "@/lib/wc2026data";
import { scoreTip } from "@/lib/wc2026data";

function fmtKick(ms) {
  if (!ms) return "TBC";
  return new Date(ms).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const MD_COLOR = { 1: "#12b3a6", 2: "#2f8bff", 3: "#7b54f0" };
const KO_ROUND_ORDER = ["R32", "R16", "QF", "SF", "3rd", "F"];
const KO_COLOR = { R32:"#ff3d7f", R16:"#ff7a2f", QF:"#12b3a6", SF:"#2f8bff", "3rd":"#f0a400", F:"#7b54f0" };

export default function ResultsView({
  predictions, officialResults, kickoffs, player, poolSettings, koTeams
}) {
  const [openStats, setOpenStats] = useState({});
  const [expandedBuckets, setExpandedBuckets] = useState({});

  const settings = {
    exact: poolSettings?.pointsExact ?? 5,
    gd: poolSettings?.pointsGD ?? 3,
    result: poolSettings?.pointsResult ?? 1,
  };

  const hasOfficialResult = (matchId) => {
    const r = officialResults.find(r => r.matchId === matchId);
    return r && r.homeScore != null && r.awayScore != null;
  };

  const toggleStats = (matchId, side) => {
    setOpenStats(prev => {
      const current = prev[matchId];
      if (current === side) return { ...prev, [matchId]: null };
      return { ...prev, [matchId]: side };
    });
  };

  const toggleBucket = (key) => setExpandedBuckets(prev => ({ ...prev, [key]: !prev[key] }));

  // All matches with official results — group + KO
  const allMatches = [...GROUP_MATCHES, ...KO_MATCHES];
  const finished = allMatches
    .filter(m => hasOfficialResult(m.id))
    .sort((a, b) => (kickoffs?.[a.id] || 0) - (kickoffs?.[b.id] || 0));

  // Build buckets: matchday for group stage, round for KO
  const buckets = {};
  for (const m of finished) {
    const isGroup = !!GROUP_MATCHES.find(x => x.id === m.id);
    let key, label, color;
    if (isGroup) {
      key = `md-${m.matchday}`;
      label = `Group Stage · Matchday ${m.matchday}`;
      color = MD_COLOR[m.matchday] || "#12b3a6";
    } else {
      key = `ko-${m.round}`;
      label = ROUND_NAME[m.round] || m.round;
      color = KO_COLOR[m.round] || "#9aa0ad";
    }
    if (!buckets[key]) buckets[key] = { key, label, color, matches: [] };
    buckets[key].matches.push(m);
  }

  const bucketKeys = [
    ...[1, 2, 3].map(md => `md-${md}`).filter(k => buckets[k]),
    ...KO_ROUND_ORDER.map(r => `ko-${r}`).filter(k => buckets[k]),
  ];

  const teamBtn = (teamName, matchId, side, fallback) => {
    const isOpen = openStats[matchId] === side;
    return (
      <button
        onClick={() => teamName && toggleStats(matchId, side)}
        style={{ background: "none", border: "none", padding: 0, cursor: teamName ? "pointer" : "default", font: "inherit", textAlign: side === "away" ? "right" : "left" }}
      >
        <span className="tname" style={{ textDecoration: teamName ? "underline dotted" : "none", textUnderlineOffset: 3, textDecorationColor: "rgba(107,116,132,.4)" }}>
          {teamName ? <><Flag name={teamName} size={16} /><span>{teamName}</span></> : <span style={{ color: "#9aa0ad" }}>{fallback || "TBD"}</span>}
        </span>
        {teamName && (
          <span style={{
            display: "block", fontSize: 9, fontWeight: 800, color: isOpen ? "var(--pink)" : "var(--teal)",
            letterSpacing: ".04em", textTransform: "uppercase", marginTop: 1, opacity: 0.85
          }}>
            {isOpen ? "▲ hide" : "▼ stats"}
          </span>
        )}
      </button>
    );
  };

  const renderMatch = (m) => {
    const pred = predictions.find(p => p.playerId === player?.id && p.matchId === m.id);
    const official = officialResults.find(r => r.matchId === m.id);
    const kicked = kickoffs?.[m.id];
    const hasTip = pred && pred.homeScore != null && pred.awayScore != null;
    const scored = hasTip ? scoreTip(pred, official, settings) : null;
    const openSide = openStats[m.id];
    const isGroup = !!GROUP_MATCHES.find(x => x.id === m.id);
    const koData = !isGroup ? koTeams?.[m.id] : null;
    const homeTeam = isGroup ? m.home : (koData?.home || null);
    const awayTeam = isGroup ? m.away : (koData?.away || null);
    const stageLabel = isGroup ? `Group ${m.group}` : (m.round || "KO");
    const penWinnerSide = official.penaltyWinner;
    const penTeam = penWinnerSide === "h" ? homeTeam : penWinnerSide === "a" ? awayTeam : null;

    return (
      <div
        className={`card${scored ? " scored" : ""} locked-match`}
        key={m.id}
        id={`match-${m.id}`}
        style={{ padding: "10px 14px" }}
      >
        <div className="cd-row" style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "var(--muted2)", letterSpacing: ".06em", textTransform: "uppercase" }}>
            {stageLabel}
          </span>
          {kicked && <span className="kick-when" style={{ marginLeft: "auto" }}>{fmtKick(kicked)}</span>}
          <span className="gm-lock-badge">✅ Final{penTeam && " (P)"}</span>
          {hasTip && <span className="tip-saved">✓ tipped</span>}
          {scored && <span className={`pts-circle t-${scored.tier}`}>{scored.pts}</span>}
        </div>

        <div className="gm-main gm-locked">
          <div className="gm-team">{teamBtn(homeTeam, m.id, "home", isGroup ? null : m.h)}</div>
          <div className="gm-score">
            <span className="sin ro act">
              <span className="sin-num">{official.homeScore}</span>
            </span>
            <span className="vs">vs</span>
            <span className="sin ro act">
              <span className="sin-num">{official.awayScore}</span>
            </span>
          </div>
          <div className="gm-team r">{teamBtn(awayTeam, m.id, "away", isGroup ? null : m.a)}</div>
        </div>

        {penTeam && (
          <div className="gm-result-row" style={{ paddingTop: 4 }}>
            <span className="gm-result-lbl">Penalties</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 800, color: "var(--purple)" }}>
              <Flag name={penTeam} size={14} /> {penTeam} won on pens
            </span>
          </div>
        )}

        {openSide && (
          <TeamStatsPanel
            team={openSide === "home" ? homeTeam : awayTeam}
            officialResults={officialResults}
            koTeams={koTeams}
          />
        )}

        {hasTip && (
          <div className="gm-result-row">
            <span className="gm-result-lbl">Your tip</span>
            <span className="gm-result-score" style={{ color: scored ? "var(--ink)" : "var(--muted)" }}>
              {pred.homeScore} – {pred.awayScore}
              {pred.penaltyPick && (
                <span style={{ marginLeft: 6, display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11, fontWeight: 800, color: "var(--purple)" }}>
                  <Flag name={pred.penaltyPick === "h" ? homeTeam : awayTeam} size={12} />P
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (finished.length === 0) {
    return (
      <div className="card pad empty">
        <div className="empty-em">📋</div>
        <div className="empty-t">No results yet</div>
        <div className="muted2">Once a match finishes and the result is posted, it'll appear here.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {bucketKeys.map(key => {
        const bucket = buckets[key];
        const isOpen = !!expandedBuckets[key];
        return (
          <div key={key} className="card" style={{ overflow: "hidden" }}>
            <div
              onClick={() => toggleBucket(key)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", cursor: "pointer", userSelect: "none",
                background: `linear-gradient(100deg, ${bucket.color}22, ${bucket.color}08)`,
                borderBottom: isOpen ? `1px solid ${bucket.color}33` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 4, height: 28, borderRadius: 4, background: bucket.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, letterSpacing: ".03em", color: "#222a3d" }}>{bucket.label}</div>
                  <div style={{ fontSize: 11, color: "#9aa0ad", fontWeight: 700 }}>{bucket.matches.length} {bucket.matches.length === 1 ? "match" : "matches"}</div>
                </div>
              </div>
              <span style={{ fontSize: 13, color: "#9aa0ad", fontWeight: 800 }}>{isOpen ? "▲" : "▼"}</span>
            </div>
            {isOpen && (
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                {bucket.matches.map(renderMatch)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}