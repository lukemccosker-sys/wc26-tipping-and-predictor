import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import Flag from "@/lib/flags";
import { GL, WC_GROUPS, GROUP_MATCHES, KO_MATCHES, ROUND_ORDER, ROUND_NAME } from "@/lib/wc2026data";
import { calcGroupTable, buildOfficialKOTeamsFromResults } from "@/lib/scoring";

function getBest3rdGroups(officialResults, thirdPlaceSlots) {
  // If admin has assigned 3rd-place teams to slots, use those
  const assigned = new Set();
  if (thirdPlaceSlots) {
    for (const team of Object.values(thirdPlaceSlots)) {
      if (!team) continue;
      const group = GL.find(L => {
        const table = calcGroupTable(L, officialResults);
        return table[2]?.team === team;
      });
      if (group) assigned.add(group);
    }
    if (assigned.size > 0) return assigned;
  }
  // Fallback: compute top 8 best 3rds from groups where all 6 matches have been played
  const thirds = GL.map(group => {
    const table = calcGroupTable(group, officialResults);
    const totalPld = table.reduce((s, r) => s + r.pld, 0);
    if (totalPld < 6) return null;
    return table[2] ? { group, ...table[2] } : null;
  }).filter(Boolean).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  return new Set(thirds.slice(0, 8).map(t => t.group));
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@400;500;600;700;800&display=swap');
.lr{
  --bg:#fff7ee;--panel:#ffffff;--panel2:#fff1e2;--line:#efe3d2;--line2:#e0d2bd;
  --ink:#222a3d;--muted:#6c7384;--muted2:#9aa0ad;
  --pink:#ff3d7f;--orange:#ff7a2f;--teal:#12b3a6;--blue:#2f8bff;--purple:#7b54f0;--green:#2cb551;--gold:#ffb020;
  font-family:'Manrope',system-ui,sans-serif;color:var(--ink);
  background:radial-gradient(900px 480px at 92% -8%,rgba(255,61,127,.18),transparent 60%),radial-gradient(820px 460px at 4% -4%,rgba(18,179,166,.16),transparent 58%),var(--bg);
  min-height:100vh;padding:18px clamp(12px,3vw,30px) 60px;box-sizing:border-box;
}
.lr *{box-sizing:border-box;}
.lr-hdr{border-bottom:2px dashed var(--line2);padding-bottom:16px;margin-bottom:18px;}
.lr-hdr h1{font-family:'Anton',sans-serif;font-size:clamp(32px,5vw,54px);line-height:.92;margin:4px 0;text-transform:uppercase;}
.lr-hdr h1 span{color:var(--teal);}
.lr-sub{font-size:13px;color:var(--muted);margin-top:4px;}
.lr-tabs{display:flex;gap:8px;margin-bottom:18px;flex-wrap:nowrap;overflow-x:auto;}
.lr-tab{background:#fff;border:2px solid var(--line2);color:var(--muted);border-radius:999px;padding:9px 18px;font-weight:800;font-size:13px;cursor:pointer;font-family:inherit;}
.lr-tab.act{background:linear-gradient(95deg,var(--teal),var(--blue));color:#fff;border-color:transparent;}
.lr-tab:hover:not(.act){border-color:var(--ink);color:var(--ink);}
.lr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;}
.lr-card{background:var(--panel);border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:0 8px 24px -16px rgba(80,40,20,.35);}
.lr-card-h{padding:11px 14px;display:flex;justify-content:space-between;align-items:center;color:#fff;}
.lr-card-h.gc-A{background:linear-gradient(100deg,#ff3d7f,#ff6a98);}
.lr-card-h.gc-B{background:linear-gradient(100deg,#ff7a2f,#ffa14d);}
.lr-card-h.gc-C{background:linear-gradient(100deg,#12b3a6,#3fcabc);}
.lr-card-h.gc-D{background:linear-gradient(100deg,#2f8bff,#5aa6ff);}
.lr-card-h.gc-E{background:linear-gradient(100deg,#7b54f0,#9a7cf5);}
.lr-card-h.gc-F{background:linear-gradient(100deg,#e8456e,#ff6f8e);}
.lr-card-h.gc-G{background:linear-gradient(100deg,#f0a400,#ffc23d);}
.lr-card-h.gc-H{background:linear-gradient(100deg,#19a673,#39c890);}
.lr-card-h.gc-I{background:linear-gradient(100deg,#4f6dff,#6f8bff);}
.lr-card-h.gc-J{background:linear-gradient(100deg,#b14ce0,#c873ee);}
.lr-card-h.gc-K{background:linear-gradient(100deg,#ff5a4d,#ff8276);}
.lr-card-h.gc-L{background:linear-gradient(100deg,#0fb5c4,#39ccd8);}
.lr-gtitle{font-family:'Anton',sans-serif;font-size:19px;letter-spacing:.04em;}
.lr-tbl{width:100%;border-collapse:collapse;font-size:12.5px;}
.lr-tbl th{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted2);font-weight:800;padding:6px 6px;text-align:center;border-top:1px solid var(--line);background:var(--panel2);}
.lr-tbl td{padding:7px 6px;text-align:center;border-top:1px solid #f4ebdf;}
.lr-tbl .tl{text-align:left;font-weight:600;}
.lr-tbl .pos{color:var(--muted2);font-weight:800;width:22px;}
.lr-tbl .pts{font-weight:900;color:var(--ink);}
.lr-tbl tr.qualify td{background:rgba(18,179,166,.08);}
.lr-tbl tr.qualify-3rd td{background:rgba(255,176,32,.08);}
.tlteam{display:inline-flex;align-items:center;gap:7px;}
.lr-fixtures{padding:8px 12px 12px;}
.lr-fix{border-bottom:1px solid #f4ebdf;padding:5px 0;}
.lr-fix-inner{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:6px;}
.lr-home{display:flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;overflow:hidden;}
.lr-away{display:flex;align-items:center;justify-content:flex-end;gap:5px;font-size:12.5px;font-weight:600;overflow:hidden;}
.lr-score{font-family:'Anton',sans-serif;font-size:18px;color:var(--ink);background:var(--panel2);border:1px solid var(--line2);border-radius:8px;padding:2px 10px;text-align:center;min-width:52px;}
.lr-score.pending{color:var(--muted2);font-size:13px;font-family:'Manrope',sans-serif;font-weight:700;}
.ko-section{margin-top:4px;}
.ko-round-h{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;margin-bottom:10px;color:#fff;}
.ko-round-h.rc-R32{background:linear-gradient(100deg,#ff3d7f,#ff6a98);}
.ko-round-h.rc-R16{background:linear-gradient(100deg,#ff7a2f,#ffa14d);}
.ko-round-h.rc-QF{background:linear-gradient(100deg,#12b3a6,#3fcabc);}
.ko-round-h.rc-SF{background:linear-gradient(100deg,#2f8bff,#5aa6ff);}
.ko-round-h.rc-3rd{background:linear-gradient(100deg,#f0a400,#ffc23d);}
.ko-round-h.rc-F{background:linear-gradient(100deg,#7b54f0,#9a7cf5);}
.ko-round-n{font-family:'Anton',sans-serif;font-size:18px;letter-spacing:.04em;text-transform:uppercase;}
.ko-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;margin-bottom:18px;}
.ko-card{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:10px 12px;}
.ko-card.final{border:2px solid var(--gold);box-shadow:0 0 0 4px rgba(255,176,32,.18);}
.ko-card.bronze{border-color:#f0cf8f;}
.ko-card-h{display:flex;justify-content:space-between;font-size:9px;color:var(--muted2);font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px;}
.ko-row{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:4px 3px;border-radius:7px;}
.ko-row.win{background:rgba(44,181,81,.15);}
.ko-team{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;min-width:0;flex:1;}
.ko-team>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.ko-ph{color:var(--muted2);font-size:11px;}
.ko-sc{font-family:'Anton',sans-serif;font-size:16px;min-width:22px;text-align:center;}
.ko-sc.pen{font-size:11px;color:var(--gold);font-family:'Manrope',sans-serif;font-weight:800;}
.badge-live{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:800;color:var(--green);background:rgba(44,181,81,.12);border:1px solid rgba(44,181,81,.3);border-radius:999px;padding:3px 9px;}
.live-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:livepulse 1.8s ease-in-out infinite;}
@keyframes livepulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.35;transform:scale(.8);}}
.back-btn{background:#fff;border:2px solid var(--line2);color:var(--ink);border-radius:999px;padding:7px 15px;font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:6px;}
.back-btn:hover{border-color:var(--ink);}
.empty-notice{background:rgba(18,179,166,.1);border:1px solid rgba(18,179,166,.3);border-radius:12px;padding:14px 18px;font-size:13px;color:#0c6f66;font-weight:600;}
@media(max-width:640px){
  .lr-grid{grid-template-columns:1fr;}
  .ko-grid{grid-template-columns:1fr;}
}
`;

export default function LiveResults() {
  const [tab, setTab] = useState("ko");
  const [officialResults, setOfficialResults] = useState([]);
  const [poolSettings, setPoolSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    const [res, ps] = await Promise.all([
      base44.entities.OfficialResult.list(),
      base44.entities.PoolSettings.list(),
    ]);
    setOfficialResults(res || []);
    setPoolSettings(ps?.[0] || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResults();

    const unsubResults = base44.entities.OfficialResult.subscribe((event) => {
      setLoading(false);
      if (event.type === "create") setOfficialResults(prev => [...prev.filter(r => r.id !== event.id), event.data]);
      else if (event.type === "update") setOfficialResults(prev => prev.map(r => r.id === event.id ? event.data : r));
      else if (event.type === "delete") setOfficialResults(prev => prev.filter(r => r.id !== event.id));
    });

    const unsubSettings = base44.entities.PoolSettings.subscribe((event) => {
      if (event.type === "delete") setPoolSettings(null);
      else setPoolSettings(event.data);
    });

    const t = setInterval(fetchResults, 300000);
    return () => { unsubResults(); unsubSettings(); clearInterval(t); };
  }, [fetchResults]);

  const getResult = (matchId) => officialResults.find(r => r.matchId === matchId);

  const thirdPlaceSlots = poolSettings?.thirdPlaceSlots ? JSON.parse(poolSettings.thirdPlaceSlots) : {};
  const groupStandingsOverrides = poolSettings?.groupStandingsOverrides ? JSON.parse(poolSettings.groupStandingsOverrides) : {};
  const koTeams = buildOfficialKOTeamsFromResults(officialResults, thirdPlaceSlots, groupStandingsOverrides);

  // Determine KO winners
  const koWinners = {};
  for (const res of officialResults) {
    const m = KO_MATCHES.find(x => x.id === res.matchId);
    if (!m || res.homeScore == null) continue;
    const h = +res.homeScore, a = +res.awayScore;
    if (h > a) koWinners[res.matchId] = "h";
    else if (h < a) koWinners[res.matchId] = "a";
    else if (res.penaltyWinner) koWinners[res.matchId] = res.penaltyWinner;
  }

  return (
    <div className="lr">
      <style>{CSS}</style>

      <div className="lr-hdr">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--teal)" }}>FIFA WORLD CUP 26</div>
            <h1>LIVE <span>RESULTS</span></h1>
            <div className="lr-sub">Official scores, group tables & knockout bracket — updated live.</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span className="badge-live"><span className="live-dot" />Live</span>
            <a href="/" className="back-btn">← Back to Tipping HQ</a>
          </div>
        </div>
      </div>

      <div className="lr-tabs">
        <button className={`lr-tab${tab === "ko" ? " act" : ""}`} onClick={() => setTab("ko")}>🏆 Knockouts</button>
        <button className={`lr-tab${tab === "groups" ? " act" : ""}`} onClick={() => setTab("groups")}>⚽ Groups</button>
        <button className={`lr-tab${tab === "tables" ? " act" : ""}`} onClick={() => setTab("tables")}>📊 Tables</button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)", fontWeight: 700 }}>Loading results…</div>
      )}

      {/* GROUP FIXTURES */}
      {!loading && tab === "groups" && (
        <div className="lr-grid">
          {GL.map(L => {
            const matches = GROUP_MATCHES.filter(m => m.group === L);
            const played = matches.filter(m => getResult(m.id)?.homeScore != null).length;
            return (
              <div className="lr-card" key={L}>
                <div className={`lr-card-h gc-${L}`}>
                  <span className="lr-gtitle">GROUP {L}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, opacity: .85 }}>{played}/{matches.length} played</span>
                </div>
                <div className="lr-fixtures">
                  {matches.map(m => {
                    const res = getResult(m.id);
                    const hasScore = res && res.homeScore != null;
                    return (
                      <div className="lr-fix" key={m.id}>
                        <div className="lr-fix-inner">
                          <div className="lr-home"><Flag name={m.home} size={14} />{m.home}</div>
                          <div className={`lr-score${!hasScore ? " pending" : ""}`}>
                            {hasScore ? `${res.homeScore} – ${res.awayScore}` : "vs"}
                          </div>
                          <div className="lr-away">{m.away}<Flag name={m.away} size={14} /></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GROUP TABLES */}
      {!loading && tab === "tables" && (
        <div className="lr-grid">
          {(() => {
            const best3rdGroups = getBest3rdGroups(officialResults, thirdPlaceSlots, groupStandingsOverrides);
            return GL.map(L => {
            const table = calcGroupTable(L, officialResults, groupStandingsOverrides);
            return (
              <div className="lr-card" key={L}>
                <div className={`lr-card-h gc-${L}`}>
                  <span className="lr-gtitle">GROUP {L}</span>
                </div>
                <table className="lr-tbl">
                  <thead>
                    <tr>
                      <th></th>
                      <th className="tl">Team</th>
                      <th>P</th><th>W</th><th>D</th><th>L</th>
                      <th>GF</th><th>GA</th><th>GD</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.map((row, i) => (
                      <tr key={row.team} className={i < 2 ? "qualify" : i === 2 && best3rdGroups.has(L) ? "qualify-3rd" : ""}>
                        <td className="pos">{i + 1}</td>
                        <td className="tl"><span className="tlteam"><Flag name={row.team} size={14} />{row.team}</span></td>
                        <td>{row.pld}</td>
                        <td>{row.w}</td>
                        <td>{row.d}</td>
                        <td>{row.l}</td>
                        <td>{row.gf}</td>
                        <td>{row.ga}</td>
                        <td>{row.gd >= 0 ? `+${row.gd}` : row.gd}</td>
                        <td className="pts">{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "6px 10px 8px", fontSize: 10, color: "var(--muted2)", display: "flex", gap: 12 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(18,179,166,.3)", display: "inline-block" }} />Qualify</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255,176,32,.3)", display: "inline-block" }} />Best 3rd</span>
                </div>
              </div>
            );
          });
          })()}
        </div>
      )}

      {/* KNOCKOUT BRACKET */}
      {!loading && tab === "ko" && (
        <div className="ko-section">
          {ROUND_ORDER.map(round => {
            const matches = KO_MATCHES.filter(m => m.round === round);
            return (
              <div key={round}>
                <div className={`ko-round-h rc-${round}`}>
                  <span className="ko-round-n">{ROUND_NAME[round]}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, opacity: .85 }}>{matches.length} {matches.length === 1 ? "match" : "matches"}</span>
                </div>
                <div className="ko-grid">
                  {matches.map(m => {
                    const home = koTeams?.[m.id]?.home;
                    const away = koTeams?.[m.id]?.away;
                    const res = getResult(m.id);
                    const hasScore = res && res.homeScore != null;
                    const isDraw = hasScore && +res.homeScore === +res.awayScore;
                    const winnerSide = koWinners[m.id];
                    const isF = m.round === "F";
                    const is3rd = m.round === "3rd";
                    return (
                      <div className={`ko-card${isF ? " final" : ""}${is3rd ? " bronze" : ""}`} key={m.id}>
                        <div className="ko-card-h">
                          <span>M{m.id.slice(1)} · {isF ? "World Cup Final" : ROUND_NAME[m.round]}</span>
                          {hasScore && <span style={{ color: "var(--green)", fontWeight: 800 }}>FT</span>}
                        </div>
                        {[["h", home], ["a", away]].map(([side, team]) => (
                          <div className={`ko-row${winnerSide === side ? " win" : ""}`} key={side}>
                            <span className="ko-team">
                              {team ? <><Flag name={team} size={15} /><span>{team}</span></> : <span className="ko-ph">TBD</span>}
                            </span>
                            {hasScore ? (
                              <span className="ko-sc">
                                {res[side === "h" ? "homeScore" : "awayScore"]}
                                {isDraw && res.penaltyWinner === side && <span className="ko-sc pen"> (P)</span>}
                              </span>
                            ) : (
                              <span className="ko-sc" style={{ color: "var(--muted2)", fontSize: 13 }}>–</span>
                            )}
                          </div>
                        ))}
                        {!home && !away && (
                          <div style={{ textAlign: "center", fontSize: 11, color: "var(--muted2)", fontWeight: 700, paddingTop: 4 }}>Teams TBD</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}