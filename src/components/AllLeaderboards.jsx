import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import Flag from "@/lib/flags";
import { GROUP_MATCHES, KO_MATCHES, scoreTip } from "@/lib/wc2026data";

// ── Rank change helper ────────────────────────────────────────────────────────
// Computes { [playerId]: rankChange } by comparing current rank to rank before the single most-recently entered result
function computeRankChanges(rows, predictions, officialResults, settings, getTotal) {
  if (!predictions || !officialResults || officialResults.length === 0) return {};

  // Find the single most recently entered result (by updated_date or created_date)
  const scored = officialResults.filter(r => r.homeScore != null && r.awayScore != null);
  if (scored.length === 0) return {};

  const latestResult = scored.reduce((best, r) => {
    const bt = new Date(best.updated_date || best.created_date || 0).getTime();
    const rt = new Date(r.updated_date || r.created_date || 0).getTime();
    return rt > bt ? r : best;
  });

  // For each player, compute how many pts they got from that single result
  const ptsFromLatest = {};
  for (const r of rows) {
    const candidates = predictions.filter(p => p.playerId === r.id && p.matchId === latestResult.matchId);
    const pred = candidates.reduce((best, p) => {
      if (!best) return p;
      if (p.status === 'final' && best.status !== 'final') return p;
      if (best.status === 'final' && p.status !== 'final') return best;
      const pt = p.created_date ? new Date(p.created_date).getTime() : 0;
      const bt = best.created_date ? new Date(best.created_date).getTime() : 0;
      return pt > bt ? p : best;
    }, null);
    const s = pred ? scoreTip({ homeScore: pred.homeScore, awayScore: pred.awayScore }, latestResult, settings) : null;
    ptsFromLatest[r.id] = s?.pts ?? 0;
  }

  // Rank before = sort by (total - ptsFromLatest), using same tiebreakers as main leaderboard
  const before = rows.map(r => ({ id: r.id, beforeTotal: getTotal(r) - (ptsFromLatest[r.id] || 0) }));
  before.sort((a, b) => b.beforeTotal - a.beforeTotal);
  const rankBefore = {};
  before.forEach((r, i) => { rankBefore[r.id] = i + 1; });

  // rankChange = rankBefore - rankNow (positive = moved up)
  const changes = {};
  rows.forEach((r, i) => {
    changes[r.id] = (rankBefore[r.id] || rows.length) - (i + 1);
  });
  return changes;
}

// ── Rank change badge ─────────────────────────────────────────────────────────
function RankBadge({ change }) {
  if (change == null || change === 0) return null;
  const up = change > 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 1,
      fontSize: 10, fontWeight: 900,
      color: up ? "#2cb551" : "#ff3d7f",
      marginLeft: 5, verticalAlign: "middle",
    }}>
      {up ? "▲" : "▼"}{Math.abs(change)}
    </span>
  );
}

// ── Shared Podium ─────────────────────────────────────────────────────────────
function Podium({ rows, getPoints, getSubLabel, color }) {
  if (rows.length === 0) return null;
  const order = [1, 0, 2];
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
function TippingLB({ leaderboard, player, rankChanges }) {
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
              <td className="tl">
                {r.name}{r.isAdmin && <span className="lb-crown">👑</span>}{player && r.id === player.id && " (you)"}
                <RankBadge change={rankChanges[r.id]} />
              </td>
              <td className="pts">{r.total || 0}</td>
              <td>{r.counts?.exact || 0}</td>
              <td>{r.counts?.gd || 0}</td>
              <td>{r.counts?.result || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Podium rows={leaderboard} getPoints={r => r.total || 0} getSubLabel={r => `${r.counts?.exact||0}✓ ${r.counts?.gd||0}GD ${r.counts?.result||0}W`} color="var(--pink)" />
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
function PredictorLB({ predLB, player, rankChanges }) {
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
              <td className="tl">
                {r.name}{r.isAdmin && <span className="lb-crown">👑</span>}{player && r.id === player.id && " (you)"}
                <RankBadge change={rankChanges?.[r.id]} />
              </td>
              <td>{r.groupPts || 0}</td>
              <td>{r.bracketPts || 0}</td>
              <td>{r.awardPts || 0}</td>
              <td className="pts">{r.total || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Podium rows={predLB} getPoints={r => r.total || 0} getSubLabel={r => `${r.groupPts||0}G ${r.bracketPts||0}B ${r.awardPts||0}A`} color="var(--blue)" />
    </div>
  );
}

// ── Combined Leaderboard ──────────────────────────────────────────────────────
function CombinedLB({ combinedLB, player, rankChanges }) {
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
              <td className="tl">
                {r.name}{r.isAdmin && <span className="lb-crown">👑</span>}{player && r.id === player.id && " (you)"}
                <RankBadge change={rankChanges[r.id]} />
              </td>
              <td className="pts" style={{ color: "#7b54f0", fontWeight: 900 }}>{r.total}</td>
              <td style={{ color: "#ff3d7f" }}>{r.tippingTotal}</td>
              <td style={{ color: "#2f8bff" }}>{r.predictorTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Podium rows={combinedLB} getPoints={r => r.total || 0} getSubLabel={r => `${r.tippingTotal}tip + ${r.predictorTotal}pred`} color="var(--purple)" />
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

// ── Main export ───────────────────────────────────────────────────────────────
export default function AllLeaderboards({ leaderboard, predLB, combinedLB, player, onRefresh, loading, predictions, officialResults, settings, tippingRankChanges, predictorRankChanges, combinedRankChanges }) {
  const [tab, setTab] = useState("tip");

  const tabs = [
    { k: "tip", label: "🎯 Tipping" },
    { k: "pred", label: "🔮 Predictor" },
    { k: "combined", label: "🌟 Combined" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, alignItems: "center" }}>
        {tabs.map(t => (
          <button key={t.k} className={`chip${tab === t.k ? " on" : ""}`} onClick={() => setTab(t.k)}>
            {t.label}
          </button>
        ))}
        {onRefresh && (
          <button
            className="chip"
            onClick={onRefresh}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 10px", flexShrink: 0 }}
            title="Refresh"
          >
            <RefreshCw
              size={16}
              style={{
                animation: loading ? "spin .8s linear infinite" : "none",
                opacity: loading ? 1 : 0.6,
              }}
            />
          </button>
        )}
      </div>

      {tab === "tip" && <TippingLB leaderboard={leaderboard} player={player} rankChanges={tippingRankChanges} />}
      {tab === "pred" && <PredictorLB predLB={predLB} player={player} rankChanges={predictorRankChanges} />}
      {tab === "combined" && <CombinedLB combinedLB={combinedLB} player={player} rankChanges={combinedRankChanges} />}
    </div>
  );
}