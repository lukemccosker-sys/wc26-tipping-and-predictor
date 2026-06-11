import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(null);

  useEffect(() => {
    base44.entities.Announcement.list().then(list => {
      const active = (list || []).find(a => a.isActive);
      setAnnouncement(active || null);
    });
    const unsub = base44.entities.Announcement.subscribe((event) => {
      if (event.type === "delete") {
        setAnnouncement(prev => prev?.id === event.id ? null : prev);
      } else if (event.type === "create" || event.type === "update") {
        if (event.data?.isActive) {
          setAnnouncement(event.data);
          setDismissed(null); // new active message resets dismiss
        } else {
          setAnnouncement(prev => prev?.id === event.id ? null : prev);
        }
      }
    });
    return unsub;
  }, []);

  if (!announcement || dismissed === announcement.id) return null;

  return (
    <div style={{
      background: "linear-gradient(95deg,#7b54f0,#2f8bff)",
      color: "#fff",
      borderRadius: 14,
      padding: "13px 18px",
      marginBottom: 14,
      display: "flex",
      alignItems: "center",
      gap: 12,
      boxShadow: "0 8px 24px -12px rgba(123,84,240,.5)",
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>📢</span>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700, lineHeight: 1.5 }}>{announcement.message}</div>
      <button
        onClick={() => setDismissed(announcement.id)}
        style={{ background: "rgba(255,255,255,.2)", border: "none", borderRadius: 999, width: 26, height: 26, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      >✕</button>
    </div>
  );
}