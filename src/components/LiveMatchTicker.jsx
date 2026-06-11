import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function LiveMatchTicker() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    base44.entities.LiveMatch.list().then(data => setMatches(data || []));
    const unsub = base44.entities.LiveMatch.subscribe((event) => {
      setMatches(prev => {
        if (event.type === "create") return [...prev.filter(m => m.id !== event.id), event.data];
        if (event.type === "update") return prev.map(m => m.id === event.id ? event.data : m);
        if (event.type === "delete") return prev.filter(m => m.id !== event.id);
        return prev;
      });
    });
    return () => unsub();
  }, []);

  if (!matches.length) return null;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 4,
      flexShrink: 0,
    }}>
      {matches.map(m => (
        <div key={m.id} style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(44,181,81,.12)",
          border: "1px solid rgba(44,181,81,.3)",
          borderRadius: 999,
          padding: "4px 10px",
          fontSize: 11,
          fontWeight: 800,
          color: "#1a6b38",
          whiteSpace: "nowrap",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--green)",
            animation: "livepulse 1.8s ease-in-out infinite",
            flexShrink: 0,
          }} />
          <span style={{ color: "#12843f", fontWeight: 900 }}>{m.minute}</span>
          <span>{m.homeTeam}</span>
          <span style={{
            background: "#fff",
            border: "1px solid rgba(44,181,81,.4)",
            borderRadius: 6,
            padding: "1px 7px",
            fontFamily: "'Anton', sans-serif",
            fontSize: 13,
            color: "#222a3d",
            letterSpacing: ".02em",
          }}>{m.homeScore}–{m.awayScore}</span>
          <span>{m.awayTeam}</span>
        </div>
      ))}
    </div>
  );
}