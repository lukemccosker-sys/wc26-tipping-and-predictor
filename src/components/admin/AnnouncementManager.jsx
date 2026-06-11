import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Announcement.list().then(a => setAnnouncements(a || []));
    const unsub = base44.entities.Announcement.subscribe((event) => {
      if (event.type === "create") setAnnouncements(prev => [...prev.filter(a => a.id !== event.id), event.data]);
      else if (event.type === "update") setAnnouncements(prev => prev.map(a => a.id === event.id ? event.data : a));
      else if (event.type === "delete") setAnnouncements(prev => prev.filter(a => a.id !== event.id));
    });
    return unsub;
  }, []);

  const handlePost = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    // Deactivate any currently active announcement first
    const active = announcements.filter(a => a.isActive);
    await Promise.all(active.map(a => base44.entities.Announcement.update(a.id, { isActive: false })));
    await base44.entities.Announcement.create({ message: draft.trim(), isActive: true });
    setDraft("");
    setSaving(false);
  };

  const toggleActive = async (a) => {
    // If activating, deactivate all others first
    if (!a.isActive) {
      const active = announcements.filter(x => x.isActive && x.id !== a.id);
      await Promise.all(active.map(x => base44.entities.Announcement.update(x.id, { isActive: false })));
    }
    await base44.entities.Announcement.update(a.id, { isActive: !a.isActive });
  };

  const handleDelete = async (a) => {
    await base44.entities.Announcement.delete(a.id);
  };

  const activeCount = announcements.filter(a => a.isActive).length;

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Write a message to all players… (e.g. 'Reminder: Group A tips close in 1 hour!')"
          rows={3}
          style={{ width: "100%", border: "2px solid #efe3d2", borderRadius: 11, padding: "11px 13px", fontSize: 14, fontWeight: 600, color: "#222a3d", background: "#fff", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
        />
        <button
          onClick={handlePost}
          disabled={saving || !draft.trim()}
          style={{ marginTop: 8, background: "linear-gradient(95deg,#7b54f0,#2f8bff)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", opacity: saving || !draft.trim() ? 0.6 : 1 }}
        >
          {saving ? "Posting…" : "📢 Post Announcement"}
        </button>
      </div>

      {announcements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#9aa0ad", marginBottom: 4 }}>
            Previous Announcements {activeCount > 0 && <span style={{ color: "#2cb551" }}>· {activeCount} active</span>}
          </div>
          {[...announcements].reverse().map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 13px", borderRadius: 11, border: `1.5px solid ${a.isActive ? "#2cb551" : "#efe3d2"}`, background: a.isActive ? "rgba(44,181,81,.06)" : "#fff" }}>
              <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#222a3d", lineHeight: 1.5 }}>{a.message}</div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => toggleActive(a)}
                  style={{ background: a.isActive ? "#2cb551" : "#f4f0ea", border: "none", borderRadius: 8, padding: "6px 11px", fontSize: 12, fontWeight: 800, cursor: "pointer", color: a.isActive ? "#fff" : "#6c7384", fontFamily: "inherit" }}
                >
                  {a.isActive ? "✓ Live" : "Show"}
                </button>
                <button
                  onClick={() => handleDelete(a)}
                  style={{ background: "#fff0f2", border: "1.5px solid #ff3d7f", color: "#ff3d7f", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}