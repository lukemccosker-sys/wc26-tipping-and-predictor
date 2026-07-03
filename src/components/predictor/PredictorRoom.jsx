import React, { useState } from "react";
import Flag from "@/lib/flags";
import { GL, KO_MATCHES, ROUND_ORDER, ROUND_NAME, DEFAULT_PRED_SETTINGS, DEFAULT_KICKOFFS } from "@/lib/wc2026data";
import { calcGroupTable, buildOfficialKOTeamsFromResults, buildPredKOTeams, buildActualRoundReached } from "@/lib/scoring";

const KO_COLOR = { R16: "#ff7a2f", QF: "#12b3a6", SF: "#2f8bff", "3rd": "#f0a400", F: "#7b54f0" };
const AWARD_KEYS = ["boot", "ball", "young", "glove"];
const AWARD_LABELS = { boot: "Golden Boot", ball: "Golden Ball", young: "Best Young Player", glove: "Golden Glove" };

function awardMatch(mine, actual) {
  if (!mine || !actual) return false;
  const norm = str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const gw = norm(mine).split(/\s+/).filter(Boolean);
  const aw = norm(actual).split(/\s+/).filter(Boolean);
  return gw.some(g => aw.some(a => a.includes(g) || g.includes(a)));
}

function FlagPts({ team, pts }) {
  if (!team) return <span style={{ color: "#9aa0ad" }}>—</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <Flag name={team} size={18} />
      {pts != null && <span style={{ fontSize: 10, fontWeight: 800, color: pts > 0 ? "#2cb551" : "#b9b1a3" }}>+{pts}</span>}
    </span>
  );
}

function Section({ title, subtitle, color, pts, isOpen, onToggle, children }) {
  return (
    <div className="card" style={{ overflow: "hidden", marginBottom: 8 }}>
      <div onClick={onToggle} style={{ cursor: "pointer", padding: "12px 14px", background: `linear-gradient(100deg, ${color}22, ${color}08)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 22, borderRadius: 4, background: color, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 13 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 10.5, color: "#9aa0ad", fontWeight: 700 }}>{subtitle}</div>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {pts != null && <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, color }}>{pts}pts</span>}
          <span style={{ fontSize: 12, color: "#9aa0ad", fontWeight: 800 }}>{isOpen ? "▲" : "▼"}</span>
        </div>
      </div>
      {isOpen && children}
    </div>
  );
}

export default function PredictorRoom({ players, bracketPredictions, officialResults, player, predSettings, thirdPlaceSlots, groupStandingsOverrides, officialAwards }) {
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [expanded, setExpanded] = useState({});

  const s = predSettings || DEFAULT_PRED_SETTINGS;
  const slotsAssigned = thirdPlaceSlots || {};
  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  // Pre-compute picks for all players
  const allPicks = players.map(p => {
    const bp = bracketPredictions.find(b => b.playerId === p.id);
    return {
      player: p,
      picks: bp ? {
        gp: bp.groupPicks ? JSON.parse(bp.groupPicks) : {},
        tp: bp.thirdPicks ? JSON.parse(bp.thirdPicks) : {},
        ap: bp.advancePicks ? JSON.parse(bp.advancePicks) : {},
        awards: bp.awardPicks ? JSON.parse(bp.awardPicks) : {},
      } : null,
    };
  });

  const officialKOTeams = buildOfficialKOTeamsFromResults(officialResults, thirdPlaceSlots, groupStandingsOverrides);
  const actualRoundReached = buildActualRoundReached(officialKOTeams, officialResults);

  const computeGroupPts = (group, picks) => {
    const table = calcGroupTable(group, officialResults, groupStandingsOverrides);
    const a1 = table[0]?.team, a2 = table[1]?.team, a3 = table[2]?.team;
    const q = new Set([a1, a2].filter(Boolean));
    if (a3 && Object.values(slotsAssigned).includes(a3)) q.add(a3);
    const pk = picks?.gp[group] || {}, th = picks?.tp[group];
    let pts = 0;
    if (a1 && pk.first === a1) pts += +s.g1 || 3;
    if (a2 && pk.second === a2) pts += +s.g2 || 2;
    if (a3 && th === a3 && Object.values(slotsAssigned).includes(a3)) pts += +s.third || 2;
    if (pk.first && q.has(pk.first)) pts += +s.r32 || 1;
    if (pk.second && q.has(pk.second)) pts += +s.r32 || 1;
    if (th && q.has(th)) pts += +s.r32 || 1;
    const breakdown = {
      first: (a1 && pk.first === a1 ? (+s.g1 || 3) : 0) + (pk.first && q.has(pk.first) ? (+s.r32 || 1) : 0),
      second: (a2 && pk.second === a2 ? (+s.g2 || 2) : 0) + (pk.second && q.has(pk.second) ? (+s.r32 || 1) : 0),
      third: (a3 && th === a3 && Object.values(slotsAssigned).includes(a3) ? (+s.third || 2) : 0) + (th && q.has(th) ? (+s.r32 || 1) : 0),
    };
    return { pts, a1, a2, a3, breakdown };
  };

  const resolvePick = (m, picks) => {
    if (!picks) return null;
    const kt = buildPredKOTeams(picks.gp, picks.tp, picks.ap);
    const ut = kt[m.id];
    if (!ut) return null;
    const side = picks.ap[m.id];
    return side === "h" ? ut.home : side === "a" ? ut.away : null;
  };

  // Did the player have `team` anywhere in their bracket at this round?
  const playerHadTeamAtRound = (picks, team, round) => {
    if (!picks || !team) return false;
    const kt = buildPredKOTeams(picks.gp, picks.tp, picks.ap);
    return KO_MATCHES.filter(m => m.round === round).some(m => {
      const ut = kt[m.id];
      return ut && (ut.home === team || ut.away === team);
    });
  };

  // Actual winner of a KO match from official results
  const matchWinner = (m) => {
    const res = officialResults.find(r => r.matchId === m.id);
    if (!res || res.homeScore == null) return null;
    const at = officialKOTeams[m.id];
    if (!at) return null;
    const h = +res.homeScore, a = +res.awayScore;
    if (h > a) return at.home;
    if (h < a) return at.away;
    if (res.penaltyWinner === "h") return at.home;
    if (res.penaltyWinner === "a") return at.away;
    return null;
  };

  const computeKOPts = (m, picks) => {
    const pt = resolvePick(m, picks);
    if (!pt) return null;
    // R32: team-centric — check if picked team reached R16, regardless of slot
    if (m.round === "R32") {
      const tr32 = actualRoundReached[pt];
      if (!tr32) return 0;
      if (ROUND_ORDER.indexOf(tr32) >= ROUND_ORDER.indexOf("R16")) return +s.r16 || 2;
      return 0;
    }
    const res = officialResults.find(r => r.matchId === m.id);
    if (!res || res.homeScore == null) return null;
    if (m.round === "3rd") {
      const at = officialKOTeams[m.id];
      if (!at) return null;
      const h = +res.homeScore, a = +res.awayScore;
      let w = null;
      if (h > a) w = at.home;
      else if (h < a) w = at.away;
      else if (res.penaltyWinner === "h") w = at.home;
      else if (res.penaltyWinner === "a") w = at.away;
      return w ? (w === pt ? (+s.third_place || 5) : 0) : null;
    }
    const rpm = { R16: "r16", QF: "qf", SF: "sf", F: "final" };
    const tr = actualRoundReached[pt];
    if (!tr) return 0;
    if (ROUND_ORDER.indexOf(tr) >= ROUND_ORDER.indexOf(m.round)) {
      let pts = +s[rpm[m.round]] || 0;
      if (m.round === "F" && ROUND_ORDER.indexOf(tr) > ROUND_ORDER.indexOf("F")) pts += +s.champ || 12;
      return pts;
    }
    return 0;
  };

  const computeAwardPts = (picks) => {
    if (!picks?.awards) return 0;
    let pts = 0;
    for (const k of AWARD_KEYS)
      if (officialAwards?.[k] && awardMatch(picks.awards[k], officialAwards[k])) pts += s.award != null ? +s.award : 5;
    return pts;
  };

  const finalizedGroups = GL.filter(g => calcGroupTable(g, officialResults, groupStandingsOverrides).reduce((s, r) => s + r.pld, 0) >= 12);
  const koRoundsWithResults = ROUND_ORDER.filter(r => KO_MATCHES.some(m => m.round === r && officialResults.some(res => res.matchId === m.id && res.homeScore != null))).slice().reverse();
  const hasOfficialAwards = AWARD_KEYS.some(k => officialAwards?.[k]);
  const hasAnyRevealed = finalizedGroups.length > 0 || koRoundsWithResults.length > 0;

  const selectedData = selectedPlayer ? allPicks.find(a => a.player.id === selectedPlayer) : null;
  const selPicks = selectedData?.picks;

  const selTotal = (() => {
    if (!selPicks) return 0;
    let t = 0;
    finalizedGroups.forEach(g => { t += computeGroupPts(g, selPicks).pts; });
    koRoundsWithResults.forEach(r => {
      const roundMatches = r === "R32"
        ? KO_MATCHES.filter(m => m.round === "R32")
        : KO_MATCHES.filter(m => m.round === r && officialResults.some(res => res.matchId === m.id && res.homeScore != null));
      roundMatches.forEach(m => {
        const p = computeKOPts(m, selPicks); if (p != null) t += p;
      });
    });
    return t + computeAwardPts(selPicks);
  })();

  // ── Selected player views ──

  const rSelGroup = (group) => {
    const g = computeGroupPts(group, selPicks);
    const pk = selPicks?.gp[group] || {}, th = selPicks?.tp[group];
    const key = `sg-${group}`;
    return (
      <Section key={key} title={`Group ${group}`} subtitle={`1st ${g.a1} · 2nd ${g.a2} · 3rd ${g.a3}`} color="#12b3a6" pts={g.pts} isOpen={!!expanded[key]} onToggle={() => toggle(key)}>
        <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { team: pk.first, pts: g.breakdown.first, label: "1st pick", color: "#2cb551" },
            { team: pk.second, pts: g.breakdown.second, label: "2nd pick", color: "#2cb551" },
            { team: th, pts: g.breakdown.third, label: "3rd pick", color: "#cd7f32" },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: i < 2 ? "1px solid #f4ebdf" : "none" }}>
              <FlagPts team={row.team} pts={row.pts} />
              <span style={{ fontSize: 11, fontWeight: 800, color: row.team ? row.color : "#9aa0ad" }}>{row.label}</span>
            </div>
          ))}
        </div>
      </Section>
    );
  };

  const rSelRound = (round) => {
    const matches = KO_MATCHES.filter(m => m.round === round && officialResults.some(res => res.matchId === m.id && res.homeScore != null)).sort((a, b) => (DEFAULT_KICKOFFS[b.id] || 0) - (DEFAULT_KICKOFFS[a.id] || 0));
    const key = `sr-${round}`;
    const color = KO_COLOR[round] || "#9aa0ad";
    let rp = 0;
    if (round === "R32") {
      KO_MATCHES.filter(m => m.round === "R32").forEach(m => { const p = computeKOPts(m, selPicks); if (p != null) rp += p; });
    } else {
      matches.forEach(m => { const p = computeKOPts(m, selPicks); if (p != null) rp += p; });
    }
    return (
      <Section key={key} title={ROUND_NAME[round]} subtitle={`${matches.length} ${matches.length === 1 ? "match" : "matches"} played`} color={color} pts={rp} isOpen={!!expanded[key]} onToggle={() => toggle(key)}>
        <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          {matches.map(m => {
            const res = officialResults.find(r => r.matchId === m.id);
            const at = officialKOTeams[m.id];
            const winner = matchWinner(m);
            const had = playerHadTeamAtRound(selPicks, winner, m.round);
            const pts = m.round === "R32" ? (had ? (+s.r16 || 2) : 0) : computeKOPts(m, selPicks);
            return (
              <div key={m.id} style={{ borderBottom: "1px solid #f4ebdf", paddingBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
                    {at?.home && <Flag name={at.home} size={13} />}{at?.home || "TBD"} {res.homeScore}–{res.awayScore} {at?.away || "TBD"}{at?.away && <Flag name={at.away} size={13} />}
                  </span>
                  {pts != null && <span style={{ fontSize: 11, fontWeight: 800, color: pts > 0 ? "#2cb551" : "#b9b1a3" }}>+{pts}</span>}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Winner: {winner ? <Flag name={winner} size={16} /> : <span style={{ color: "#9aa0ad" }}>—</span>}
                  <span style={{ fontSize: 10, fontWeight: 800, color: had ? "#2cb551" : "#b9b1a3" }}>{had ? "✓ in bracket" : "✗ not in bracket"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    );
  };

  const rSelAwards = () => {
    const key = `sa`;
    const ap = computeAwardPts(selPicks);
    return (
      <Section key={key} title="Individual Awards" subtitle={`${AWARD_KEYS.filter(k => officialAwards?.[k]).length} official winners`} color="#ffb020" pts={ap} isOpen={!!expanded[key]} onToggle={() => toggle(key)}>
        <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          {AWARD_KEYS.map(k => {
            const mine = selPicks?.awards?.[k], actual = officialAwards?.[k];
            const correct = mine && actual && awardMatch(mine, actual);
            return (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid #f4ebdf" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#9aa0ad" }}>{AWARD_LABELS[k]}</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Pick: {mine || <span style={{ color: "#9aa0ad" }}>—</span>}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#ffb020" }}>{actual || "TBD"}</div>
                  {correct && <span style={{ fontSize: 11, fontWeight: 800, color: "#2cb551" }}>✓ +{s.award || 5}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    );
  };

  // ── All players views ──

  const rAllGroup = (group) => {
    const g = computeGroupPts(group, null);
    const key = `ag-${group}`;
    return (
      <Section key={key} title={`Group ${group}`} subtitle={`1st ${g.a1} · 2nd ${g.a2} · 3rd ${g.a3}`} color="#12b3a6" isOpen={!!expanded[key]} onToggle={() => toggle(key)}>
        <table className="tbl rev-tbl" style={{ width: "100%" }}>
          <thead><tr><th className="tl">Player</th><th>1st</th><th>2nd</th><th>3rd</th><th>Pts</th></tr></thead>
          <tbody>
            {allPicks.map(({ player: p, picks }) => {
              const r = computeGroupPts(group, picks);
              const pk = picks?.gp[group] || {}, th = picks?.tp[group];
              return (
                <tr key={p.id} className={player && p.id === player.id ? "melb" : ""}>
                  <td className="tl" style={{ fontSize: 11.5, fontWeight: 600 }}>{p.name}{player && p.id === player.id ? " (you)" : ""}</td>
                  <td style={{ fontSize: 11 }}><FlagPts team={pk.first} pts={r.breakdown?.first} /></td>
                  <td style={{ fontSize: 11 }}><FlagPts team={pk.second} pts={r.breakdown?.second} /></td>
                  <td style={{ fontSize: 11 }}><FlagPts team={th} pts={r.breakdown?.third} /></td>
                  <td><span className="pbadge" style={{ background: r.pts > 0 ? "#2cb551" : "#f0e8db", color: r.pts > 0 ? "#fff" : "#9aa0ad" }}>{r.pts}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>
    );
  };

  const rAllRound = (round) => {
    const matches = KO_MATCHES.filter(m => m.round === round && officialResults.some(res => res.matchId === m.id && res.homeScore != null)).sort((a, b) => (DEFAULT_KICKOFFS[b.id] || 0) - (DEFAULT_KICKOFFS[a.id] || 0));
    const key = `ar-${round}`;
    const color = KO_COLOR[round] || "#9aa0ad";
    return (
      <Section key={key} title={ROUND_NAME[round]} subtitle={`${matches.length} ${matches.length === 1 ? "match" : "matches"} played`} color={color} isOpen={!!expanded[key]} onToggle={() => toggle(key)}>
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          {matches.map(m => {
            const res = officialResults.find(r => r.matchId === m.id);
            const at = officialKOTeams[m.id];
            const winner = matchWinner(m);
            return (
              <div key={m.id}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 5, display: "inline-flex", alignItems: "center", gap: 3 }}>
                  {at?.home && <Flag name={at.home} size={13} />}{at?.home || "TBD"} {res.homeScore}–{res.awayScore} {at?.away || "TBD"}{at?.away && <Flag name={at.away} size={13} />}
                </div>
                <table className="tbl rev-tbl" style={{ width: "100%" }}>
                  <tbody>
                    {allPicks.map(({ player: p, picks }) => {
                      const had = playerHadTeamAtRound(picks, winner, m.round);
                      const pts = m.round === "R32" ? (had ? (+s.r16 || 2) : 0) : computeKOPts(m, picks);
                      if (!had || !pts || pts === 0) return null;
                      return (
                        <tr key={p.id} className={player && p.id === player.id ? "melb" : ""}>
                          <td className="tl" style={{ fontSize: 11, fontWeight: 600 }}>{p.name}{player && p.id === player.id ? " (you)" : ""}</td>
                          <td style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                            <Flag name={winner} size={18} />
                            <span className="pbadge" style={{ background: "#2cb551", color: "#fff" }}>{pts}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </Section>
    );
  };

  return (
    <div className="reveal">
      <div className="card pad filter-card">
        <div className="lb-head"><div className="gtitle">Predictor Lab</div></div>
        <div className="muted2">Picks reveal here once a group is finalised or a knockout match is played.</div>
        <div style={{ marginTop: 12, borderTop: "1px dashed #e0d2bd", paddingTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#9aa0ad", marginBottom: 7 }}>View a player's predictor</div>
          <select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} style={{ width: "100%", border: "2px solid #efe3d2", borderRadius: 10, padding: "8px 12px", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: "#fff", color: "#222a3d" }}>
            <option value="">— Pick a player —</option>
            {players.slice().sort((a, b) => a.name.localeCompare(b.name)).map(p => <option key={p.id} value={p.id}>{p.name}{player && p.id === player.id ? " (you)" : ""}</option>)}
          </select>
        </div>
      </div>

      {!hasAnyRevealed && !hasOfficialAwards && (
        <div className="card pad empty">
          <div className="empty-em">🔮</div>
          <div className="empty-t">No picks revealed yet</div>
          <div className="muted2">Once a group is finalised or a KO match is played, predictor picks appear here.</div>
        </div>
      )}

      {selectedPlayer && selPicks && (
        <>
          <div className="card pad" style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 800, fontSize: 14 }}>{selectedData?.player.name}'s predictor</span>
              <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, color: "#7b54f0" }}>{selTotal}pts</span>
            </div>
          </div>
          {koRoundsWithResults.map(rSelRound)}
          {finalizedGroups.map(rSelGroup)}
          {hasOfficialAwards && rSelAwards()}
        </>
      )}

      {selectedPlayer && !selPicks && (
        <div className="card pad empty"><div className="muted2 ctr" style={{ padding: "12px 0" }}>No predictor picks for this player yet.</div></div>
      )}

      {!selectedPlayer && hasAnyRevealed && (
        <>{koRoundsWithResults.map(rAllRound)}{finalizedGroups.map(rAllGroup)}</>
      )}
    </div>
  );
}