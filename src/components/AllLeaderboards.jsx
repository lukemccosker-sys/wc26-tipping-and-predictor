import React, { useState } from "react";
import Flag from "@/lib/flags";
import { GROUP_MATCHES, KO_MATCHES, scoreTip } from "@/lib/wc2026data";

// ── Shared Podium ─────────────────────────────────────────────────────────────
function Podium({ rows, getLabel, getPoints, getSubLabel, color }) {
  if (rows.length === 0) return null;
  const order = [1, 0, 2]; // 2nd, 1st, 3rd displayed left-to-right
  const configs = [
    { label: "🥇", height: 90, bg: "linear-gradient(160deg,#ffb020,#ffce3a)", textColor: "#7a4f00" },
    { label: "🥈", height: 65, bg: "linear-gradient(160deg,#aab2c0,#c8d0dc)", textColor: "#3a4050" },
    { label: "🥉", height: 50, bg: "linear-gradient(160deg,#cd7f32,#e0a060)", textColor: "#5a3010" },
  ];
  return (
    <div style={{ marginTop: 18, borderTop: "1px dashed #e0d2bd", paddingTop: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10 }}>
        {order.map((rankIdx, displayIdx) => {
          const r = rows[rankIdx];
          if (!r) return <div key={displayIdx} style={{ width: 90 }} />;
          const cfg = configs[rankIdx];
          const isFirst = rankIdx === 0;
          const sub = getSubLabel ? getSubLabel(r) : null;
          return (
            <div key={r.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: isFirst ? "0 0 100px" : "0 0 84px" }}>
              <div style={{ fontWeight: 800, fontSize: isFirst ? 13 : 12, textAlign: "center", color: "#222a3d", maxWidth: isFirst ? 100 : 84, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
              <div style={{ fontWeight: 900, fontSize: isFirst ? 17 : 14, color }}>{getPoints(r)}pts</div>
              <div style={{ width: "100%", height: cfg.height, background: cfg.bg, borderRadius: "10px 10px 0 0", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2, boxShadow: "0 8px 20px -8px rgba(0,0,0,.25)" }}>
                <div style={{ fontSize: isFirst ? 20 : 17 }}>{cfg.label}</div>
                {sub && <div style={{ fontSize: 10, fontWeight: 700, color: cfg.textColor, opacity: .85, textAlign: "center", padding: "0 4px" }}>{sub}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tipping Leaderboard ───────────────────────────────────────────────────────
function TippingLB({ leaderboard, player }) {
  return (
    <div className="card pad">
      <div className="gtitle" style={{ marginBottom: 6 }}>🎯 Tipping</div>
      <div className="muted2">Ranked by tipping points.</div>
      <table className="tbl lb">
        <thead>
          <tr><th></th><th className="tl">Player</th><th>Pts</th><th>Exact</th><th>GD</th><th>Win</th></tr>
        </thead>
        <tbody>
          {leaderboard.length === 0 && (
            <tr><td colSpan="6" className="muted2 ctr">No scores yet — tips count once results come in.</td></tr>
          )}
          {leaderboard.map((r, i) => (
            <tr key={r.id} className={player && r.id === player.id ? "melb" : ""}>
              <td className="pos">{i + 1}</td>
              <td className="tl">{r.name}{r.isAdmin && <span className="lb-crown">👑</span>}{player && r.id === player.id && " (you)"}</td>
              <td className="pts">{r.total || 0}</td>
              <td>{r.counts?.exact || 0}</td>
              <td>{r.counts?.gd || 0}</td>
              <td>{r.counts?.result || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Podium
        rows={leaderboard}
        getPoints={r => r.total || 0}
        getSubLabel={r => `${r.counts?.exact||0}✓ ${r.counts?.gd||0}GD ${r.counts?.result||0}W`}
        color="var(--pink)"
      />
      {player && (() => {
        const me = leaderboard.find(r => r.id === player.id);
        if (!me) return null;
        return (
          <div style={{ marginTop: 14, borderTop: "1px dashed #e0d2bd", paddingTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Your card</div>
            <div className="cnts">
              <div className="cnt exact"><b>{me.counts?.exact || 0}</b>exact</div>
              <div className="cnt gd"><b>{me.counts?.gd || 0}</b>win+GD</div>
              <div className="cnt result"><b>{me.counts?.result || 0}</b>winner</div>
              <div className="cnt miss"><b>{me.counts?.miss || 0}</b>missed</div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Predictor Leaderboard ─────────────────────────────────────────────────────
function PredictorLB({ predLB, player }) {
  return (
    <div className="card pad">
      <div className="gtitle" style={{ marginBottom: 6 }}>🔮 Predictor</div>
      <div className="muted2">Updates live as official results come in.</div>
      <table className="tbl lb pred-lb">
        <thead>
          <tr><th></th><th className="tl">Player</th><th>Groups</th><th>Bracket</th><th>Awards</th><th>Pts</th></tr>
        </thead>
        <tbody>
          {predLB.length === 0 && (
            <tr><td colSpan="6" className="muted2 ctr">No points yet — picks score once official results come in.</td></tr>
          )}
          {predLB.map((r, i) => (
            <tr key={r.id} className={player && r.id === player.id ? "melb" : ""}>
              <td className="pos">{i + 1}</td>
              <td className="tl">{r.name}{r.isAdmin && <span className="lb-crown">👑</span>}{player && r.id === player.id && " (you)"}</td>
              <td>{r.groupPts || 0}</td>
              <td>{r.bracketPts || 0}</td>
              <td>{r.awardPts || 0}</td>
              <td className="pts">{r.total || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Podium
        rows={predLB}
        getPoints={r => r.total || 0}
        getSubLabel={r => `${r.groupPts||0}G ${r.bracketPts||0}B ${r.awardPts||0}A`}
        color="var(--blue)"
      />
    </div>
  );
}

// ── Combined Leaderboard ──────────────────────────────────────────────────────
function CombinedLB({ combinedLB, player }) {
  return (
    <div className="card pad">
      <div className="gtitle" style={{ marginBottom: 6 }}>🌟 Combined</div>
      <div className="muted2">Tipping + Predictor points combined.</div>
      <table className="tbl lb">
        <thead>
          <tr><th></th><th className="tl">Player</th><th>Total</th><th>Tipping</th><th>Predictor</th></tr>
        </thead>
        <tbody>
          {combinedLB.length === 0 && (
            <tr><td colSpan="5" className="muted2 ctr">No scores yet.</td></tr>
          )}
          {combinedLB.map((r, i) => (
            <tr key={r.id} className={player && r.id === player.id ? "melb" : ""}>
              <td className="pos">{i + 1}</td>
              <td className="tl">{r.name}{r.isAdmin && <span className="lb-crown">👑</span>}{player && r.id === player.id && " (you)"}</td>
              <td className="pts" style={{ color: "#7b54f0", fontWeight: 900 }}>{r.total}</td>
              <td style={{ color: "#ff3d7f" }}>{r.tippingTotal}</td>
              <td style={{ color: "#2f8bff" }}>{r.predictorTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Podium
        rows={combinedLB}
        getPoints={r => r.total || 0}
        getSubLabel={r => `${r.tippingTotal}tip + ${r.predictorTotal}pred`}
        color="var(--purple)"
      />
    </div>
  );
}

// ── Predicted Champions panel (used in Predictor tab) ────────────────────────
export function PredictedChampions({ predLB, player }) {
  return (
    <div className="card pad" style={{ marginTop: 14 }}>
      <div className="gtitle" style={{ marginBottom: 6, fontSize: 17 }}>🏆 Predicted Champions</div>
      <div className="muted2" style={{ marginBottom: 10 }}>Everyone's tournament winner pick.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {predLB.length === 0 && <div className="muted2">No picks yet.</div>}
        {predLB.map(r => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 0", borderBottom: "1px solid #f4ebdf" }}>
            <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}{player && r.id === player.id ? " (you)" : ""}{r.isAdmin ? " 👑" : ""}</span>
            {r.champion
              ? <span style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 800, fontSize: 13.5 }}><Flag name={r.champion} size={18} />{r.champion}</span>
              : <span style={{ fontSize: 12.5, color: "var(--muted)", fontStyle: "italic" }}>— not predicted yet</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Movers Panel ──────────────────────────────────────────────────────────────
function MoversPanel({ leaderboard, predictions, officialResults, settings, player }) {
  // Group official results by day (Sydney time = UTC+10)
  const allMatches = [...GROUP_MATCHES, ...KO_MATCHES];

  // Find the most recent day that has official results
  const daysWithResults = {};
  for (const res of officialResults) {
    if (res.homeScore == null || res.awayScore == null) continue;
    const ts = res.updated_date || res.created_date;
    if (!ts) continue;
    const d = new Date(new Date(ts).getTime() + 10 * 3600 * 1000); // shift to Sydney
    const day = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
    if (!daysWithResults[day]) daysWithResults[day] = [];
    daysWithResults[day].push(res);
  }

  const sortedDays = Object.keys(daysWithResults).sort();
  if (sortedDays.length < 1) {
    return (
      <div className="card pad" style={{ textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
        <div style={{ fontWeight: 800, fontSize: 15 }}>No results yet</div>
        <div className="muted2">Movers will appear once official results are posted.</div>
      </div>
    );
  }

  const latestDay = sortedDays[sortedDays.length - 1];
  const latestResults = daysWithResults[latestDay];
  const latestMatchIds = new Set(latestResults.map(r => r.matchId));

  // For each player: compute pts from latest-day matches only, and rank before vs after
  const latestMatchLabels = latestResults.map(res => {
    const m = allMatches.find(x => x.id === res.matchId);
    return m ? `${m.home} v ${m.away}` : res.matchId;
  });

  // Dedup helper
  function latestPred(preds, playerId, matchId) {
    const candidates = preds.filter(p => p.playerId === playerId && p.matchId === matchId);
    return candidates.reduce((best, p) => {
      if (!best) return p;
      const pt = Math.max(p.updated_date ? new Date(p.updated_date).getTime() : 0, p.created_date ? new Date(p.created_date).getTime() : 0);
      const bt = Math.max(best.updated_date ? new Date(best.updated_date).getTime() : 0, best.created_date ? new Date(best.created_date).getTime() : 0);
      return pt > bt ? p : best;
    }, null);
  }

  // Compute points per player from latest day only
  const ptsFromLatest = {};
  for (const p of leaderboard) {
    let pts = 0;
    for (const res of latestResults) {
      const pred = latestPred(predictions, p.id, res.matchId);
      if (!pred) continue;
      const scored = scoreTip({ homeScore: pred.homeScore, awayScore: pred.awayScore }, res, settings);
      pts += scored?.pts ?? 0;
    }
    ptsFromLatest[p.id] = pts;
  }

  // Compute rank BEFORE latest day (using total minus latest pts)
  const beforeScores = leaderboard.map(p => ({ ...p, beforeTotal: (p.total || 0) - (ptsFromLatest[p.id] || 0) }));
  beforeScores.sort((a, b) => b.beforeTotal - a.beforeTotal);
  const rankBefore = {};
  beforeScores.forEach((p, i) => { rankBefore[p.id] = i + 1; });

  // Movers = rank change + pts gained, sorted by pts gained desc
  const movers = leaderboard.map((p, i) => ({
    ...p,
    rankNow: i + 1,
    rankBefore: rankBefore[p.id],
    rankChange: (rankBefore[p.id] || leaderboard.length) - (i + 1),
    ptsGained: ptsFromLatest[p.id] || 0,
  })).sort((a, b) => b.ptsGained - a.ptsGained || b.rankChange - a.rankChange);

  // Format the day label nicely
  const [yyyy, mm, dd] = latestDay.split("-");
  const dayLabel = new Date(`${latestDay}T12:00:00+10:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="card pad">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
        <div className="gtitle">📈 Latest Round Movers</div>
        <span style={{ fontSize: 11, fontWeight: 800, background: "rgba(47,139,255,.12)", color: "#1f6fd6", borderRadius: 999, padding: "3px 10px" }}>{dayLabel}</span>
      </div>
      <div className="muted2" style={{ marginBottom: 12 }}>
        Points earned from {latestResults.length} result{latestResults.length !== 1 ? "s" : ""} posted on this day. Rank change vs before.
      </div>

      {/* Match summary chips */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
        {latestMatchLabels.map((label, i) => {
          const res = latestResults[i];
          return (
            <span key={i} style={{ fontSize: 11, fontWeight: 700, background: "#f4ebdf", borderRadius: 8, padding: "3px 8px", color: "#6c7384" }}>
              {label} <span style={{ fontWeight: 900, color: "#222a3d" }}>{res.homeScore}–{res.awayScore}</span>
            </span>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {movers.map(r => {
          const isMe = player && r.id === player.id;
          const up = r.rankChange > 0;
          const down = r.rankChange < 0;
          const flat = r.rankChange === 0;
          const rankColor = up ? "#2cb551" : down ? "#ff3d7f" : "#9aa0ad";
          const rankArrow = up ? "▲" : down ? "▼" : "–";
          return (
            <div key={r.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: isMe ? "rgba(255,176,32,.14)" : r.ptsGained > 0 ? "rgba(44,181,81,.05)" : "#fafafa",
              border: `1.5px solid ${isMe ? "#ffb020" : r.ptsGained > 0 ? "rgba(44,181,81,.2)" : "#f0e8db"}`,
              borderRadius: 12, padding: "10px 13px",
            }}>
              {/* Rank now */}
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, color: "#222a3d", minWidth: 26, textAlign: "center" }}>{r.rankNow}</div>

              {/* Name */}
              <div style={{ flex: 1, fontWeight: 700, fontSize: 13.5, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.name}{r.isAdmin ? " 👑" : ""}{isMe ? " (you)" : ""}
              </div>

              {/* Rank change */}
              <div style={{ display: "flex", alignItems: "center", gap: 3, fontWeight: 800, fontSize: 12, color: rankColor, flexShrink: 0 }}>
                <span>{rankArrow}</span>
                {!flat && <span>{Math.abs(r.rankChange)}</span>}
              </div>

              {/* Pts gained */}
              <div style={{
                fontFamily: "'Anton', sans-serif", fontSize: 20,
                color: r.ptsGained > 0 ? "#2cb551" : "#9aa0ad",
                minWidth: 40, textAlign: "right", flexShrink: 0
              }}>
                +{r.ptsGained}
                <span style={{ fontSize: 10, fontWeight: 800, opacity: .7, marginLeft: 2 }}>pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gap-to-leader callout */}
      {(() => {
        const leader = movers.find(r => r.rankNow === 1);
        const closers = movers.filter(r => r.rankNow !== 1 && r.rankChange > 0).slice(0, 2);
        if (!leader || closers.length === 0) return null;
        return (
          <div style={{ marginTop: 14, background: "linear-gradient(95deg,rgba(255,61,127,.08),rgba(123,84,240,.06))", border: "1.5px solid rgba(255,61,127,.2)", borderRadius: 11, padding: "10px 13px", fontSize: 12.5, fontWeight: 600, color: "#5a3fc0" }}>
            🔥 Closing the gap: {closers.map(r => {
              const gap = (leader.total || 0) - (r.total || 0);
              return `${r.name} is ${gap} pt${gap !== 1 ? "s" : ""} behind`;
            }).join(" · ")}
          </div>
        );
      })()}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function AllLeaderboards({ leaderboard, predLB, combinedLB, player, onRefresh, loading, predictions, officialResults, settings }) {
  const [tab, setTab] = useState("tip");

  const tabs = [
    { k: "tip", label: "🎯 Tipping" },
    { k: "pred", label: "🔮 Predictor" },
    { k: "combined", label: "🌟 Combined" },
    { k: "movers", label: "📈 Movers" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 400, textTransform: "uppercase", lineHeight: 1, letterSpacing: ".03em" }}>
            LEADER<span style={{ color: "var(--pink)" }}>BOARDS</span>
          </div>
        </div>
        <button className={`mini${loading ? " busy" : ""}`} onClick={onRefresh}>{loading ? "…" : "↻ Refresh"}</button>
      </div>

      {/* Tab nav — uses modeswitch pill style so it's always visible on mobile too */}
      <div className="modeswitch" style={{ marginBottom: 18 }}>
        {tabs.map(t => (
          <button key={t.k} className={tab === t.k ? "on" : ""} onClick={() => setTab(t.k)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tip" && <TippingLB leaderboard={leaderboard} player={player} />}
      {tab === "pred" && <PredictorLB predLB={predLB} player={player} />}
      {tab === "combined" && <CombinedLB combinedLB={combinedLB} player={player} />}
      {tab === "movers" && <MoversPanel leaderboard={leaderboard} predictions={predictions || []} officialResults={officialResults || []} settings={settings || { exact: 5, gd: 3, result: 1 }} player={player} />}
    </div>
  );
}