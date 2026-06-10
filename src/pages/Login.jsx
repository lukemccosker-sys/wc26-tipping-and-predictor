import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ADMIN_NAME } from "@/lib/wc2026data";
import Flag from "@/lib/flags";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState("start"); // start | playerlogin | setpin | adminlogin | adminsetup
  const [err, setErr] = useState("");
  const [players, setPlayers] = useState(null);
  const [poolSettings, setPoolSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const [pl, ps] = await Promise.all([
      base44.entities.Player.list(),
      base44.entities.PoolSettings.list(),
    ]);
    setPlayers(pl || []);
    setPoolSettings(ps?.[0] || null);
    return { pl: pl || [], ps: ps?.[0] || null };
  };

  const onContinue = async () => {
    if (!name.trim()) { setErr("Please enter your name"); return; }
    setLoading(true);
    setErr("");
    const { pl, ps } = await loadData();
    setLoading(false);
    const trimmed = name.trim();
    const isAdm = trimmed.toLowerCase() === ADMIN_NAME.toLowerCase();
    const existing = pl.find(p => p.name.toLowerCase() === trimmed.toLowerCase());

    if (isAdm) {
      if (!ps?.adminPin) setMode("adminsetup");
      else setMode("adminlogin");
    } else if (existing) {
      setMode("playerlogin");
    } else {
      setMode("setpin");
    }
  };

  const adminLogin = async () => {
    if (pin !== poolSettings?.adminPin) { setErr("Wrong admin PIN"); return; }
    const existing = players.find(p => p.isAdmin);
    if (existing) {
      onLogin({ ...existing, isAdmin: true });
    } else {
      const p = await base44.entities.Player.create({ name: name.trim(), pin, isAdmin: true });
      onLogin({ ...p, isAdmin: true });
    }
  };

  const setupAdmin = async () => {
    if (pin.length !== 4) { setErr("PIN must be 4 digits"); return; }
    // Save settings with adminPin
    const existing = await base44.entities.PoolSettings.list();
    let ps;
    if (existing?.[0]) {
      ps = await base44.entities.PoolSettings.update(existing[0].id, { adminPin: pin, adminName: ADMIN_NAME });
    } else {
      ps = await base44.entities.PoolSettings.create({ adminPin: pin, adminName: ADMIN_NAME });
    }
    const existing2 = players.find(p => p.isAdmin);
    let player;
    if (existing2) {
      player = await base44.entities.Player.update(existing2.id, { pin });
    } else {
      player = await base44.entities.Player.create({ name: name.trim(), pin, isAdmin: true });
    }
    onLogin({ ...player, isAdmin: true });
  };

  const playerLogin = () => {
    const existing = players?.find(p => p.name.toLowerCase() === name.trim().toLowerCase());
    if (!existing) { setErr("Player not found"); return; }
    if (existing.pin !== pin) { setErr("Wrong PIN"); return; }
    onLogin({ ...existing, isAdmin: false });
  };

  const setPlayerPin = async () => {
    if (pin.length !== 4) { setErr("PIN must be 4 digits"); return; }
    const player = await base44.entities.Player.create({ name: name.trim(), pin, isAdmin: false });
    onLogin({ ...player, isAdmin: false });
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, background: "radial-gradient(900px 480px at 92% -8%,rgba(255,61,127,.22),transparent 60%), radial-gradient(820px 460px at 4% -4%,rgba(18,179,166,.20),transparent 58%), #fff7ee"
    }}>
      <div style={{
        background: "#fff", borderRadius: 22, padding: 32, maxWidth: 440, width: "100%",
        boxShadow: "0 30px 70px -28px rgba(120,60,40,.45)", border: "1px solid #efe3d2",
        position: "relative", overflow: "hidden"
      }}>
        {/* Rainbow top stripe */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 8, background: "linear-gradient(90deg,#ff3d7f,#ff7a2f,#ffce3a,#12b3a6,#2f8bff,#7b54f0)" }} />

        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.26em", color: "#12b3a6", fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>
            FIFA WORLD CUP 26 · 🇺🇸 🇨🇦 🇲🇽
          </div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400, fontSize: 48, lineHeight: 0.9, margin: "10px 0 12px", textTransform: "uppercase", color: "#222a3d" }}>
            TIPPING <span style={{ color: "#ff3d7f" }}>HQ</span>
          </h1>

          {mode === "start" && (
            <>
              <p style={{ color: "#6c7384", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 18px" }}>
                Join the pool or log back in. Type your name — new players set a 4-digit PIN, returning players enter theirs.
              </p>
              <input
                style={{ width: "100%", background: "#fff", border: "2px solid #e0d2bd", borderRadius: 12, padding: "12px 14px", fontSize: 15, fontWeight: 600, marginBottom: 10, fontFamily: "inherit", boxSizing: "border-box" }}
                placeholder="Your name"
                value={name}
                maxLength={20}
                autoFocus
                onChange={e => { setName(e.target.value); setErr(""); }}
                onKeyDown={e => e.key === "Enter" && onContinue()}
              />
              {err && <div style={{ color: "#ff3d7f", fontSize: 12.5, fontWeight: 700, margin: "2px 0 10px" }}>{err}</div>}
              <button
                onClick={onContinue}
                disabled={loading}
                style={{ width: "100%", background: "linear-gradient(95deg,#ff3d7f,#ff7a2f)", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 4, boxShadow: "0 12px 24px -12px rgba(255,61,127,.7)", fontFamily: "inherit" }}
              >
                {loading ? "Loading…" : "Continue"}
              </button>
            </>
          )}

          {mode === "adminlogin" && (
            <>
              <p style={{ color: "#6c7384", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 18px" }}>
                Welcome back, <b>{name.trim()}</b> 👑 — enter the admin PIN to log in.
              </p>
              <input
                style={{ width: "100%", background: "#fff", border: "2px solid #e0d2bd", borderRadius: 12, padding: "12px 14px", fontSize: 15, fontWeight: 600, marginBottom: 10, fontFamily: "inherit", boxSizing: "border-box" }}
                placeholder="Admin PIN" type="password" value={pin} autoFocus maxLength={4}
                onChange={e => { setPin(e.target.value.replace(/\D/g,"")); setErr(""); }}
                onKeyDown={e => e.key === "Enter" && adminLogin()}
              />
              {err && <div style={{ color: "#ff3d7f", fontSize: 12.5, fontWeight: 700 }}>{err}</div>}
              <button onClick={adminLogin} style={{ width: "100%", background: "linear-gradient(95deg,#ffb020,#ff7a2f)", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 8, fontFamily: "inherit" }}>
                👑 Log in as admin
              </button>
              <button onClick={() => { setMode("start"); setErr(""); setPin(""); }} style={{ width: "100%", background: "none", border: "none", color: "#12b3a6", fontSize: 13, fontWeight: 800, cursor: "pointer", marginTop: 12, fontFamily: "inherit" }}>← back</button>
            </>
          )}

          {mode === "adminsetup" && (
            <>
              <p style={{ color: "#6c7384", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 18px" }}>
                Welcome, <b>{name.trim()}</b> 👑 — set a <b>4-digit admin PIN</b>. You'll use it to log in and enter official results.
              </p>
              <input
                style={{ width: "100%", background: "#fff", border: "2px solid #e0d2bd", borderRadius: 12, padding: "12px 14px", fontSize: 16, fontWeight: 600, marginBottom: 10, fontFamily: "inherit", boxSizing: "border-box" }}
                placeholder="Set admin PIN (4 digits)" type="password" value={pin} autoFocus maxLength={4} inputMode="numeric"
                onChange={e => { setPin(e.target.value.replace(/\D/g,"")); setErr(""); }}
                onKeyDown={e => e.key === "Enter" && setupAdmin()}
              />
              {err && <div style={{ color: "#ff3d7f", fontSize: 12.5, fontWeight: 700 }}>{err}</div>}
              <button onClick={setupAdmin} style={{ width: "100%", background: "linear-gradient(95deg,#ffb020,#ff7a2f)", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 8, fontFamily: "inherit" }}>
                👑 Set PIN & start as admin
              </button>
              <button onClick={() => { setMode("start"); setErr(""); setPin(""); }} style={{ width: "100%", background: "none", border: "none", color: "#12b3a6", fontSize: 13, fontWeight: 800, cursor: "pointer", marginTop: 12, fontFamily: "inherit" }}>← back</button>
            </>
          )}

          {mode === "playerlogin" && (
            <>
              <p style={{ color: "#6c7384", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 18px" }}>
                Welcome back, <b>{name.trim()}</b> — enter your 4-digit PIN to log in.
              </p>
              <input
                style={{ width: "100%", background: "#fff", border: "2px solid #e0d2bd", borderRadius: 12, padding: "12px 14px", fontSize: 16, fontWeight: 600, marginBottom: 10, fontFamily: "inherit", boxSizing: "border-box" }}
                placeholder="Your PIN" type="password" value={pin} autoFocus maxLength={4} inputMode="numeric"
                onChange={e => { setPin(e.target.value.replace(/\D/g,"")); setErr(""); }}
                onKeyDown={e => e.key === "Enter" && playerLogin()}
              />
              {err && <div style={{ color: "#ff3d7f", fontSize: 12.5, fontWeight: 700 }}>{err}</div>}
              <button onClick={playerLogin} style={{ width: "100%", background: "linear-gradient(95deg,#ff3d7f,#ff7a2f)", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 8, fontFamily: "inherit" }}>
                Log in
              </button>
              <button onClick={() => { setMode("start"); setErr(""); setPin(""); }} style={{ width: "100%", background: "none", border: "none", color: "#12b3a6", fontSize: 13, fontWeight: 800, cursor: "pointer", marginTop: 12, fontFamily: "inherit" }}>← back</button>
            </>
          )}

          {mode === "setpin" && (
            <>
              <p style={{ color: "#6c7384", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 18px" }}>
                Hi <b>{name.trim()}</b> — pick a <b>4-digit PIN</b>. You'll use it to log back in.
              </p>
              <input
                style={{ width: "100%", background: "#fff", border: "2px solid #e0d2bd", borderRadius: 12, padding: "12px 14px", fontSize: 16, fontWeight: 600, marginBottom: 10, fontFamily: "inherit", boxSizing: "border-box" }}
                placeholder="Choose a 4-digit PIN" type="password" value={pin} autoFocus maxLength={4} inputMode="numeric"
                onChange={e => { setPin(e.target.value.replace(/\D/g,"")); setErr(""); }}
                onKeyDown={e => e.key === "Enter" && setPlayerPin()}
              />
              {err && <div style={{ color: "#ff3d7f", fontSize: 12.5, fontWeight: 700 }}>{err}</div>}
              <p style={{ color: "#9aa0ad", fontSize: 12, margin: "0 0 10px", textAlign: "center" }}>Remember this PIN — you'll need it to log in on another device.</p>
              <button onClick={setPlayerPin} style={{ width: "100%", background: "linear-gradient(95deg,#ff3d7f,#ff7a2f)", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 4, fontFamily: "inherit" }}>
                Save PIN & join
              </button>
              <button onClick={() => { setMode("start"); setErr(""); setPin(""); }} style={{ width: "100%", background: "none", border: "none", color: "#12b3a6", fontSize: 13, fontWeight: 800, cursor: "pointer", marginTop: 12, fontFamily: "inherit" }}>← back</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}