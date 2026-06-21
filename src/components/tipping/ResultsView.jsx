import React, { useState } from "react";
import Flag from "@/lib/flags";
import TeamStatsPanel from "./TeamStatsPanel";
import { GROUP_MATCHES, KO_MATCHES } from "@/lib/wc2026data";
import { scoreTip } from "@/lib/wc2026data";

function fmtKick(ms) {
  if (!ms) return "TBC";
  return new Date(ms).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ResultsView({
  predictions, officialResults, kickoffs, player, poolSettings
}) {
  const [openStats, setOpenStats] = useState({});

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

  // All matches with official results — group + KO
  const allMatches = [...GROUP_MATCHES, ...KO_MATCHES];
  const finished = allMatches
    .filter(m => hasOfficialResult(m.id))
    .sort((a, b) => (kickoffs?.[b.id] || 0) - (kickoffs?.[a.id] || 0));

  const teamBtn = (teamName, matchId, side) => {
    const isOpen = openStats[matchId] === side;
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
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {finished.map(m => {
        const pred = predictions.find(p => p.playerId === player?.id && p.matchId === m.id);
        const official = officialResults.find(r => r.matchId === m.id);
        const kicked = kickoffs?.[m.id];
        const hasTip = pred && pred.homeScore != null && pred.awayScore != null;
        const scored = hasTip ? scoreTip(pred, official, settings) : null;
        const openSide = openStats[m.id];
        const isGroup = !!GROUP_MATCHES.find(x => x.id === m.id);
        const stageLabel = isGroup ? `Group ${m.group}` : (m.round || "KO");

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
              <span className="gm-lock-badge">✅ Final</span>
              {hasTip && <span className="tip-saved">✓ tipped</span>}
              {scored && <span className={`pts-circle t-${scored.tier}`}>{scored.pts}</span>}
            </div>

            <div className="gm-main gm-locked">
              <div className="gm-team">{teamBtn(m.home, m.id, "home")}</div>
              <div className="gm-score">
                <span className="sin ro act">
                  <span className="sin-num">{official.homeScore}</span>
                </span>
                <span className="vs">vs</span>
                <span className="sin ro act">
                  <span className="sin-num">{official.awayScore}</span>
                </span>
              </div>
              <div className="gm-team r">{teamBtn(m.away, m.id, "away")}</div>
            </div>

            {openSide && (
              <TeamStatsPanel
                team={openSide === "home" ? m.home : m.away}
                officialResults={officialResults}
              />
            )}

            {hasTip && (
              <div className="gm-result-row">
                <span className="gm-result-lbl">Your tip</span>
                <span className="gm-result-score" style={{ color: scored ? "var(--ink)" : "var(--muted)" }}>
                  {pred.homeScore} – {pred.awayScore}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}