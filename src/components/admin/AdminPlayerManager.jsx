import React, { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function AdminPlayerManager({ players, onRefresh }) {
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState("");
  const [resettingPin, setResettingPin] = useState(null);
  const [newPin, setNewPin] = useState("");

  const renamePlayer = async (p) => {
    if (!newName.trim()) return;
    await base44.entities.Player.update(p.id, { name: newName.trim() });
    setRenaming(null);
    setNewName("");
    onRefresh();
  };

  const resetPin = async (p) => {
    if (newPin.length !== 4) return;
    await base44.entities.Player.update(p.id, { pin: newPin });
    setResettingPin(null);
    setNewPin("");
    onRefresh();
  };

  const removePlayer = async (p) => {
    if (!window.confirm(`Remove ${p.name}? This deletes their picks permanently.`)) return;
    await base44.entities.Player.delete(p.id);
    onRefresh();
  };

  return (
    <div className="manage">
      <div className="manage-h">Manage players</div>
      {players.map(p => (
        <div className="manage-row" key={p.id}>
          {renaming?.id === p.id ? (
            <div style={{ display: "flex", gap: 8, width: "100%", flexWrap: "wrap" }}>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="New name"
                style={{ flex: 1, border: "2px solid #e0d2bd", borderRadius: 9, padding: "8px 12px", fontSize: 14, fontFamily: "inherit" }}
                autoFocus
                onKeyDown={e => e.key === "Enter" && renamePlayer(p)}
              />
              <button className="mbtn" onClick={() => renamePlayer(p)}>Save</button>
              <button className="mbtn" onClick={() => setRenaming(null)}>Cancel</button>
            </div>
          ) : resettingPin?.id === p.id ? (
            <div style={{ display: "flex", gap: 8, width: "100%", flexWrap: "wrap" }}>
              <input
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="New 4-digit PIN"
                type="password"
                inputMode="numeric"
                maxLength={4}
                style={{ flex: 1, border: "2px solid #e0d2bd", borderRadius: 9, padding: "8px 12px", fontSize: 14, fontFamily: "inherit" }}
                autoFocus
              />
              <button className="mbtn" onClick={() => resetPin(p)}>Save</button>
              <button className="mbtn" onClick={() => setResettingPin(null)}>Cancel</button>
            </div>
          ) : (
            <>
              <span className="manage-name">
                {p.name}
                {p.isAdmin && <span className="lb-crown">👑</span>}
              </span>
              <div className="manage-btns">
                <button className="mbtn" onClick={() => { setRenaming(p); setNewName(p.name); }}>✎ Rename</button>
                {p.isAdmin ? (
                  <span className="manage-locked">admin</span>
                ) : (
                  <>
                    <button className="mbtn" onClick={() => { setResettingPin(p); setNewPin(""); }}>🔑 Reset PIN</button>
                    <button className="mbtn del" onClick={() => removePlayer(p)}>✕ Remove</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ))}
      <div className="muted2 mng-note" style={{ padding: "0 13px 11px" }}>Removing a player deletes their picks permanently. The admin account can't be removed.</div>
    </div>
  );
}