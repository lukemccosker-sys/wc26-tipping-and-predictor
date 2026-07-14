import React, { useState, useMemo } from "react";
import Flag from "@/lib/flags";
import PlayerAvatar from "@/components/PlayerAvatar";
import { GL, KO_MATCHES, ROUND_ORDER, ROUND_NAME } from "@/lib/wc2026data";
import { buildPredKOTeams } from "@/lib/scoring";

const AWARD_LABELS = { boot: "Golden Boot", ball: "Golden Ball", young: "Best Young Player", glove: "Golden Glove" };

function parsePicks(bp) {
  if (!bp) return null;
  return {
    gp: bp.groupPicks ? JSON.parse(bp.groupPicks) : {},
    tp: bp.thirdPicks ? JSON.parse(bp.thirdPicks) : {},
    ap: bp.advancePicks ? JSON.parse(bp.advancePicks) : {},
    awards: bp.awardPicks ? JSON.parse(bp.awardPicks) : {},
  };
}

function PickCell({ team }) {
  if (!team) return <span style={{ color: "#c8bfae", fontSize: 12 }}>—</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
      <Flag name={team} size={14} />{team}
    </span>
  );
}

export default function AdminBracketViewer({ players, bracketPredictions }) {
  const [expanded, setExpanded] = useState({});

  const allData = useMemo(() => players.map(p => {
    const bp = bracketPredictions.find(b => b.playerId === p.id);
    return { player: p, picks: parsePicks(bp), hasBracket: !!bp };
  }).sort((a, b) => a.player.name.localeCompare(b.player.name)), [players, bracketPredictions]);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const getChampion = (picks) => {
    if (!picks) return null;
    const kt = buildPredKOTeams(picks.gp, picks.tp, picks.ap);
    const finalMatch = KO_MATCHES.find(m => m.round === "F");
    if (!finalMatch) return null;
    const teams = kt[finalMatch.id];
    if (!teams) return null;
    const side = picks.ap[finalMatch.id];
    return side === "h" ? teams.home : side === "a" ? teams.away : null;
  };

  return (
    <div>
      <div style={{ fontSize: 12.5, color: "#6c7384", fontWeight: 600, marginBottom: 14 }}>
        View every player's full predictor bracket — group picks, knockout advance picks, champion, and award predictions.
      </div>

      {allData.length === 0 && (
        <div style={{ textAlign: "center", padding: 24, color: "#9aa0ad" }}>No players yet.</div>
      )}

      {allData.map(({ player: p, picks, hasBracket }) => {
        const isOpen = !!expanded[p.id];
        const champion = getChampion(picks);

        return (
          <div key={p.id} style={{ background: "#fff", border: "1px solid #efe3d2", borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
            {/* Header row */}
            <div
              onClick={() => toggle(p.id)}
              style={{ cursor: "pointer", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: isOpen ? "rgba(123,84,240,.05)" : "#fff" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <PlayerAvatar player={p} size={28} />
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</span>
                {p.isAdmin && <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: "linear-gradient(95deg,#ffb020,#ff7a2f)", borderRadius: 999, padding: "2px 7px" }}>ADMIN</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {!hasBracket && <span style={{ fontSize: 11, color: "#c8bfae", fontWeight: 700 }}>No picks</span>}
                {hasBracket && champion && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 800, color: "#7b54f0" }}>
                    🏆 <Flag name={champion} size={16} /> {champion}
                  </span>
                )}
                <span style={{ fontSize: 13, color: "#9aa0ad", fontWeight: 800 }}>{isOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Expanded content */}
            {isOpen && hasBracket && picks && (
              <div style={{ padding: "12px 14px", borderTop: "1px solid #f4ebdf" }}>
                {/* Group picks */}
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#9aa0ad", marginBottom: 6 }}>Group Picks</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6, marginBottom: 14 }}>
                  {GL.map(L => {
                    const g = picks.gp[L] || {};
                    const th = picks.tp[L];
                    return (
                      <div key={L} style={{ background: "#fff7ee", borderRadius: 8, padding: "6px 9px", fontSize: 11.5, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 800, color: "#9aa0ad", minWidth: 18 }}>{L}</span>
                        <PickCell team={g.first} />
                        <span style={{ color: "#c8bfae" }}>·</span>
                        <PickCell team={g.second} />
                        {th && (
                          <>
                            <span style={{ color: "#c8bfae" }}>·</span>
                            <span style={{ fontSize: 10, color: "#9a5a1e", fontWeight: 700 }}>
                              <Flag name={th} size={11} /> 3rd
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* KO advance picks */}
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#9aa0ad", marginBottom: 6 }}>Knockout Picks</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 6, marginBottom: 14 }}>
                  {ROUND_ORDER.map(round => {
                    const matches = KO_MATCHES.filter(m => m.round === round);
                    const roundPicks = matches
                      .map(m => {
                        const side = picks.ap[m.id];
                        if (!side) return null;
                        const kt = buildPredKOTeams(picks.gp, picks.tp, picks.ap);
                        const teams = kt[m.id];
                        if (!teams) return null;
                        const team = side === "h" ? teams.home : side === "a" ? teams.away : null;
                        return { matchId: m.id, team };
                      })
                      .filter(Boolean);
                    if (roundPicks.length === 0) return null;
                    return (
                      <div key={round} style={{ background: "#f4f0ff", borderRadius: 8, padding: "6px 9px" }}>
                        <div style={{ fontSize: 9.5, fontWeight: 800, color: "#7b54f0", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 3 }}>{ROUND_NAME[round]}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {roundPicks.map(rp => (
                            <div key={rp.matchId} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                              <PickCell team={rp.team} />
                              {round === "F" && rp.team && <span style={{ fontSize: 10, fontWeight: 800, color: "#7b54f0" }}>🏆</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Award picks */}
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#9aa0ad", marginBottom: 6 }}>Award Picks</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6 }}>
                  {Object.keys(AWARD_LABELS).map(k => (
                    <div key={k} style={{ background: "#fffbeb", borderRadius: 8, padding: "6px 9px", fontSize: 11.5, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, color: "#9a6800", fontSize: 10 }}>{AWARD_LABELS[k]}</span>
                      <span style={{ marginLeft: "auto" }}>
                        {picks.awards?.[k] ? (
                          <span style={{ fontWeight: 600 }}>{picks.awards[k]}</span>
                        ) : (
                          <span style={{ color: "#c8bfae", fontSize: 11 }}>—</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isOpen && !hasBracket && (
              <div style={{ padding: "16px 14px", borderTop: "1px solid #f4ebdf", textAlign: "center", color: "#c8bfae", fontSize: 12.5, fontWeight: 600 }}>
                This player hasn't made any predictor picks yet.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}