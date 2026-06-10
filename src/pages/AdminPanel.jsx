import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function AdminPanel() {
  const [player, setPlayer] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("wc_player") || "null"); } catch { return null; }
  });
  const [players, setPlayers] = useState([]);
  const [poolSettings, setPoolSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  // Redirect non-admins
  if (player && !player.isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", background: "#fff7ee" }}>
        <div style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 48 }}>🚫</div>
          <h2 style={{ marginTop: 12 }}>Access Denied</h2>
          <p style={{ color: "#6c7384" }}>This page is for admins only.</p>
          <a href="/" style={{ color: "#ff3d7f", fontWeight: 700 }}>← Back to TippingHQ</a>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", background: "#fff7ee" }}>
        <div style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 48 }}>🔐</div>
          <h2>Not logged in</h2>
          <a href="/" style={{ color: "#ff3d7f", fontWeight: 700 }}>← Go to TippingHQ</a>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    async function load() {
      setLoading(true);
      const [pl, ps] = await Promise.all([
        base44.entities.Player.list(),
        base44.entities.PoolSettings.list(),
      ]);
      setPlayers(pl || []);
      setPoolSettings(ps?.[0] || null);
      setLoading(false);
    }
    load();

    const unsubPlayers = base44.entities.Player.subscribe((event) => {
      if (event.type === "create") setPlayers(p => [...p.filter(x => x.id !== event.id), event.data]);
      else if (event.type === "update") setPlayers(p => p.map(x => x.id === event.id ? event.data : x));
      else if (event.type === "delete") setPlayers(p => p.filter(x => x.id !== event.id));
    });
    const unsubSettings = base44.entities.PoolSettings.subscribe((event) => {
      if (event.type === "delete") setPoolSettings(null);
      else setPoolSettings(event.data);
    });
    return () => { unsubPlayers(); unsubSettings(); };
  }, []);

  const globalLocked = poolSettings?.globalLockTipping ?? false;

  const toggleGlobalLock = async () => {
    const newVal = !globalLocked;
    if (poolSettings) {
      await base44.entities.PoolSettings.update(poolSettings.id, { globalLockTipping: newVal });
      setPoolSettings(ps => ({ ...ps, globalLockTipping: newVal }));
    } else {
      const saved = await base44.entities.PoolSettings.create({ globalLockTipping: newVal });
      setPoolSettings(saved);
    }
  };

  const removePlayer = async (p) => {
    if (!window.confirm(`Remove ${p.name}? This permanently deletes all their tips and predictions.`)) return;
    setRemoving(p.id);
    const [preds, brackets] = await Promise.all([
      base44.entities.Prediction.filter({ playerId: p.id }),
      base44.entities.BracketPrediction.filter({ playerId: p.id }),
    ]);
    await Promise.all([
      ...preds.map(r => base44.entities.Prediction.delete(r.id)),
      ...brackets.map(r => base44.entities.BracketPrediction.delete(r.id)),
      base44.entities.Player.delete(p.id),
    ]);
    setPlayers(prev => prev.filter(x => x.id !== p.id));
    setRemoving(null);
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isAdmin && !b.isAdmin) return -1;
    if (!a.isAdmin && b.isAdmin) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{ minHeight: "100vh", background: "#fff7ee", fontFamily: "'Manrope', system-ui, sans-serif", padding: "24px clamp(12px,3vw,40px) 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@400;600;700;800&display=swap');
        .ap-card { background: #fff; border: 1px solid #efe3d2; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 8px 24px -16px rgba(120,70,40,.3); }
        .ap-player-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f4ebdf; flex-wrap: wrap; }
        .ap-player-row:last-child { border-bottom: none; }
        .ap-name { font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .ap-badge { font-size: 10px; font-weight: 800; border-radius: 999px; padding: 2px 9px; color: #fff; background: linear-gradient(95deg, #ffb020, #ff7a2f); }
        .ap-you { font-size: 10px; font-weight: 800; color: #6c7384; background: #f4ebdf; border-radius: 999px; padding: 2px 8px; }
        .ap-remove-btn { background: #fff0f2; border: 1.5px solid #ff3d7f; color: #ff3d7f; border-radius: 9px; padding: 7px 14px; font-size: 12.5px; font-weight: 800; cursor: pointer; font-family: inherit; }
        .ap-remove-btn:hover { background: #ff3d7f; color: #fff; }
        .ap-remove-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .lock-toggle { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .lock-knob { width: 52px; height: 28px; border-radius: 999px; background: #e0d2bd; position: relative; cursor: pointer; transition: background .2s; border: none; flex-shrink: 0; }
        .lock-knob.on { background: #ff3d7f; }
        .lock-knob::after { content: ""; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; transition: left .2s; }
        .lock-knob.on::after { left: 27px; }
        .ap-section-title { font-family: 'Anton', sans-serif; font-size: 22px; letter-spacing: .04em; text-transform: uppercase; margin-bottom: 4px; color: #222a3d; }
        .ap-section-sub { font-size: 12.5px; color: #6c7384; font-weight: 600; margin-bottom: 16px; }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(32px,6vw,56px)", lineHeight: .92, textTransform: "uppercase", color: "#222a3d" }}>
          ADMIN <span style={{ color: "#ff3d7f" }}>PANEL</span>
        </div>
        <div style={{ color: "#6c7384", fontSize: 13, marginTop: 6 }}>
          FIFA World Cup 2026 Tipping — admin controls
        </div>
        <a href="/" style={{ display: "inline-block", marginTop: 10, color: "#2f8bff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>← Back to TippingHQ</a>
      </div>

      {/* Global tipping lock */}
      <div className="ap-card">
        <div className="ap-section-title">🔒 Tipping Lock</div>
        <div className="ap-section-sub">When enabled, all matches are locked and no player can enter or change any tips.</div>
        <div className="lock-toggle">
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: globalLocked ? "#ff3d7f" : "#2cb551" }}>
              {globalLocked ? "🔒 Tipping is LOCKED for all players" : "🟢 Tipping is OPEN"}
            </div>
            <div style={{ fontSize: 12, color: "#6c7384", marginTop: 3 }}>
              {globalLocked ? "No players can enter or edit tips right now." : "Players can freely enter and update their tips."}
            </div>
          </div>
          <button className={`lock-knob${globalLocked ? " on" : ""}`} onClick={toggleGlobalLock} title="Toggle global tipping lock" />
        </div>
      </div>

      {/* Players list */}
      <div className="ap-card">
        <div className="ap-section-title">👥 Registered Players</div>
        <div className="ap-section-sub">{players.length} player{players.length !== 1 ? "s" : ""} registered</div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 24, color: "#6c7384" }}>Loading…</div>
        ) : sortedPlayers.length === 0 ? (
          <div style={{ textAlign: "center", padding: 24, color: "#9aa0ad" }}>No players yet.</div>
        ) : (
          sortedPlayers.map(p => (
            <div className="ap-player-row" key={p.id}>
              <span className="ap-name">
                {p.name}
                {p.isAdmin && <span className="ap-badge">👑 Admin</span>}
                {p.id === player.id && <span className="ap-you">You</span>}
              </span>
              {p.isAdmin ? (
                <span style={{ fontSize: 11, color: "#9aa0ad", fontWeight: 700 }}>Cannot remove admin</span>
              ) : (
                <button
                  className="ap-remove-btn"
                  disabled={removing === p.id}
                  onClick={() => removePlayer(p)}
                >
                  {removing === p.id ? "Removing…" : "✕ Remove"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}