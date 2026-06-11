import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { calcGroupTable } from "@/lib/scoring";
import { KO_MATCHES, GL } from "@/lib/wc2026data";
import AnnouncementManager from "@/components/admin/AnnouncementManager";

export default function AdminPanel() {
  const [player, setPlayer] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wc_player") || "null"); } catch { return null; }
  });
  const [players, setPlayers] = useState([]);
  const [poolSettings, setPoolSettings] = useState(null);
  const [officialResults, setOfficialResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!player || !player.isAdmin) return; // don't load data for non-admins
    async function load() {
      setLoading(true);
      const [pl, ps, or_] = await Promise.all([
        base44.entities.Player.list(),
        base44.entities.PoolSettings.list(),
        base44.entities.OfficialResult.list(),
      ]);
      setPlayers(pl || []);
      setPoolSettings(ps?.[0] || null);
      setOfficialResults(or_ || []);
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

  const resetAllResults = async () => {
    if (!window.confirm("Reset ALL official match results? This wipes every entered score and cannot be undone.")) return;
    const results = await base44.entities.OfficialResult.list();
    await Promise.all(results.map(r => base44.entities.OfficialResult.delete(r.id)));
  };

  const savePoolSettings = async (data) => {
    if (poolSettings) {
      const updated = await base44.entities.PoolSettings.update(poolSettings.id, data);
      setPoolSettings(ps => ({ ...ps, ...data }));
    } else {
      const saved = await base44.entities.PoolSettings.create(data);
      setPoolSettings(saved);
    }
  };

  const thirdPlaceSlots = poolSettings?.thirdPlaceSlots ? JSON.parse(poolSettings.thirdPlaceSlots) : {};

  const setThirdSlot = async (slotKey, team) => {
    const next = { ...thirdPlaceSlots, [slotKey]: team || null };
    // remove null entries
    Object.keys(next).forEach(k => { if (!next[k]) delete next[k]; });
    await savePoolSettings({ thirdPlaceSlots: JSON.stringify(next) });
  };

  // Build list of all 3rd-place teams from finished groups
  const thirdPlaceTeams = GL.map(group => {
    const table = calcGroupTable(group, officialResults);
    const totalPld = table.reduce((s, r) => s + r.pld, 0);
    if (totalPld < 6) return null;
    return table[2] ? { team: table[2].team, group, pts: table[2].pts, gd: table[2].gd } : null;
  }).filter(Boolean).sort((a, b) => b.pts - a.pts || b.gd - a.gd);

  // The 8 R32 slots that require a best-3rd team
  const thirdSlotMatches = KO_MATCHES.filter(m => m.round === "R32" && (m.h.startsWith("3") || m.a.startsWith("3")));

  const removePlayer = async (p) => {
    if (!window.confirm(`Remove ${p.name}? This permanently deletes all their tips and predictions.`)) return;
    setRemoving(p.id);
    // Fetch with a large limit to ensure we get all records
    const [preds, brackets] = await Promise.all([
      base44.entities.Prediction.filter({ playerId: p.id }, null, 500),
      base44.entities.BracketPrediction.filter({ playerId: p.id }, null, 500),
    ]);
    await Promise.all([
      ...preds.map(r => base44.entities.Prediction.delete(r.id)),
      ...brackets.map(r => base44.entities.BracketPrediction.delete(r.id)),
      base44.entities.Player.delete(p.id),
    ]);
    setPlayers(prev => prev.filter(x => x.id !== p.id));
    setRemoving(null);
  };

  // Access gates — rendered after all hooks
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

  if (!player.isAdmin) {
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

      {/* Announcements */}
      <div className="ap-card">
        <div className="ap-section-title">📢 Announcements</div>
        <div className="ap-section-sub">Post a message that appears live for all players at the top of TippingHQ. Only one message is shown at a time.</div>
        <AnnouncementManager />
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

      {/* Reset results */}
      <div className="ap-card">
        <div className="ap-section-title">🗑 Reset All Results</div>
        <div className="ap-section-sub">Wipes every official match result entered so far. Use this to test the app from scratch.</div>
        <button
          onClick={resetAllResults}
          style={{ background: "#fff0f2", border: "1.5px solid #ff3d7f", color: "#ff3d7f", borderRadius: 10, padding: "11px 20px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
          onMouseOver={e => { e.target.style.background = "#ff3d7f"; e.target.style.color = "#fff"; }}
          onMouseOut={e => { e.target.style.background = "#fff0f2"; e.target.style.color = "#ff3d7f"; }}
        >
          🗑 Reset All Entered Results
        </button>
      </div>

      {/* 3rd Place Slot Assignment */}
      <div className="ap-card">
        <div className="ap-section-title">3️⃣ 3rd Place R32 Slots</div>
        <div className="ap-section-sub">
          Once group stage is complete, assign the correct best-3rd-placed team to each Round of 32 fixture. These override the automatic assignment.
        </div>
        {thirdPlaceTeams.length === 0 ? (
          <div style={{ fontSize: 13, color: "#9aa0ad", fontStyle: "italic" }}>No completed groups yet — come back once group stage results are entered.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {thirdSlotMatches.map(m => {
              const isHome = m.h.startsWith("3");
              const slotKey = isHome ? m.h : m.a;
              const fixedSide = isHome ? m.a : m.h; // the non-3rd side (e.g. "1E")
              const currentTeam = thirdPlaceSlots[slotKey] || "";
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "10px 0", borderBottom: "1px solid #f4ebdf" }}>
                  <div style={{ minWidth: 60, fontSize: 11, fontWeight: 800, color: "#9aa0ad", textTransform: "uppercase", letterSpacing: ".04em" }}>{m.id}</div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#222a3d" }}>
                    <span style={{ color: "#6c7384" }}>{fixedSide}</span> vs <span style={{ color: "#7b54f0" }}>{slotKey}</span>
                  </div>
                  <select
                    value={currentTeam}
                    onChange={e => setThirdSlot(slotKey, e.target.value)}
                    style={{ border: "2px solid #efe3d2", borderRadius: 9, padding: "7px 10px", fontSize: 13, fontWeight: 700, color: "#222a3d", background: "#fff", fontFamily: "inherit", minWidth: 180, cursor: "pointer" }}
                  >
                    <option value="">— Unassigned —</option>
                    {thirdPlaceTeams.map(t => (
                      <option key={t.team} value={t.team}>{t.team} (Group {t.group}, {t.pts}pts)</option>
                    ))}
                  </select>
                  {currentTeam && (
                    <button
                      onClick={() => setThirdSlot(slotKey, null)}
                      style={{ background: "#fff0f2", border: "1.5px solid #ff3d7f", color: "#ff3d7f", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                    >✕</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {!p.isAdmin && (
                  <button
                    onClick={async () => {
                      await base44.entities.Player.update(p.id, { predictorOverride: !p.predictorOverride });
                    }}
                    style={{
                      background: p.predictorOverride ? "rgba(123,84,240,.12)" : "#f4f0ff",
                      border: `1.5px solid ${p.predictorOverride ? "#7b54f0" : "#d0c8f0"}`,
                      color: p.predictorOverride ? "#7b54f0" : "#9aa0ad",
                      borderRadius: 9, padding: "7px 13px", fontSize: 12.5, fontWeight: 800,
                      cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap"
                    }}
                    title="Toggle whether this player can edit their Predictor picks after tournament has started"
                  >
                    {p.predictorOverride ? "🔓 Predictor open" : "🔒 Predictor locked"}
                  </button>
                )}
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}