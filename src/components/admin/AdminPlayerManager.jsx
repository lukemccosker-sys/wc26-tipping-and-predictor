import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import PlayerAvatar from "@/components/PlayerAvatar";

export default function AdminPlayerManager({ players, onRefresh }) {
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState("");
  const [resettingPin, setResettingPin] = useState(null);
  const [newPin, setNewPin] = useState("");
  const [photoLoading, setPhotoLoading] = useState(null);
  const fileRefs = useRef({});

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

  const changePhoto = async (p, file) => {
    if (!file) return;
    setPhotoLoading(p.id);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Player.update(p.id, { profilePhoto: file_url });
      onRefresh();
    } catch (err) {
      console.error("Failed to upload photo:", err);
    } finally {
      setPhotoLoading(null);
    }
  };

  const removePhoto = async (p) => {
    if (!window.confirm(`Remove ${p.name}'s profile photo?`)) return;
    await base44.entities.Player.update(p.id, { profilePhoto: null });
    onRefresh();
  };

  const removePlayer = async (p) => {
    if (!window.confirm(`Remove ${p.name}? This deletes their tips, predictions and all picks permanently.`)) return;
    // Delete all their predictions and bracket picks too
    const [preds, brackets] = await Promise.all([
      base44.entities.Prediction.filter({ playerId: p.id }),
      base44.entities.BracketPrediction.filter({ playerId: p.id }),
    ]);
    await Promise.all([
      ...preds.map(r => base44.entities.Prediction.delete(r.id)),
      ...brackets.map(r => base44.entities.BracketPrediction.delete(r.id)),
      base44.entities.Player.delete(p.id),
    ]);
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
              <span className="manage-name" style={{ gap: 8 }}>
                <PlayerAvatar player={p} size={28} />
                {p.name}
                {p.isAdmin && <span className="lb-crown">👑</span>}
              </span>
              <div className="manage-btns" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {!p.isAdmin && (
                  <button
                    className="mbtn"
                    style={{ display: "flex", alignItems: "center", gap: 6, background: p.predictorOverride ? "rgba(123,84,240,.12)" : "", borderColor: p.predictorOverride ? "#7b54f0" : "", color: p.predictorOverride ? "#7b54f0" : "" }}
                    title="Allow this player to edit their Predictor picks even after the tournament has started"
                    onClick={async () => {
                      await base44.entities.Player.update(p.id, { predictorOverride: !p.predictorOverride });
                      onRefresh();
                    }}
                  >
                    {p.predictorOverride ? "🔓 Predictor open" : "🔒 Predictor locked"}
                  </button>
                )}
                <input
                  ref={el => fileRefs.current[p.id] = el}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={e => { if (e.target.files?.[0]) changePhoto(p, e.target.files[0]); e.target.value = ""; }}
                />
                <button
                  className="mbtn"
                  disabled={photoLoading === p.id}
                  onClick={() => fileRefs.current[p.id]?.click()}
                  title="Change profile photo"
                >
                  {photoLoading === p.id ? "⏳" : "📷 Photo"}
                </button>
                {p.profilePhoto && (
                  <button className="mbtn del" onClick={() => removePhoto(p)} title="Remove profile photo">🗑 Photo</button>
                )}
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