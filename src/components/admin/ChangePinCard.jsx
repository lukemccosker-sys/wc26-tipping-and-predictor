import React, { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function ChangePinCard({ player }) {
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!newPin.trim()) { setMsg({ type: "error", text: "PIN cannot be empty." }); return; }
    if (newPin !== confirmPin) { setMsg({ type: "error", text: "PINs don't match." }); return; }

    setSaving(true);
    try {
      await base44.entities.Player.update(player.id, { pin: newPin.trim() });
      const updated = { ...player, pin: newPin.trim() };
      localStorage.setItem("wc_player", JSON.stringify(updated));
      setMsg({ type: "ok", text: "PIN updated successfully." });
      setNewPin("");
      setConfirmPin("");
    } catch (err) {
      setMsg({ type: "error", text: "Failed to update PIN. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ap-card">
      <div className="ap-section-title">🔑 Change Admin PIN</div>
      <div className="ap-section-sub">Update the PIN code you use to log in. Make sure to remember it — you'll need it next time.</div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360 }}>
        <input
          type="text"
          placeholder="New PIN"
          value={newPin}
          onChange={e => setNewPin(e.target.value)}
          style={{ border: "2px solid #efe3d2", borderRadius: 10, padding: "11px 14px", fontSize: 15, fontWeight: 600, color: "#222a3d", background: "#fff", fontFamily: "inherit" }}
        />
        <input
          type="text"
          placeholder="Confirm new PIN"
          value={confirmPin}
          onChange={e => setConfirmPin(e.target.value)}
          style={{ border: "2px solid #efe3d2", borderRadius: 10, padding: "11px 14px", fontSize: 15, fontWeight: 600, color: "#222a3d", background: "#fff", fontFamily: "inherit" }}
        />
        {msg && (
          <div style={{ fontSize: 13, fontWeight: 700, color: msg.type === "ok" ? "#2cb551" : "#ff3d7f" }}>
            {msg.type === "ok" ? "✓ " : "⚠ "}{msg.text}
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          style={{
            background: "linear-gradient(95deg,#ff3d7f,#ff7a2f)", color: "#fff", border: "none",
            borderRadius: 10, padding: "12px 20px", fontWeight: 800, fontSize: 14, cursor: "pointer",
            fontFamily: "inherit", opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving…" : "Update PIN"}
        </button>
      </form>
    </div>
  );
}