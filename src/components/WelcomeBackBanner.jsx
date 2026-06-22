import React, { useState, useEffect } from "react";

/**
 * Shows a one-time "welcome back" banner when the user returns
 * and new official results have been posted since their last visit.
 *
 * Uses localStorage key `wc_last_seen_<playerId>` to track the last
 * timestamp the player was active.
 */
export default function WelcomeBackBanner({ player, officialResults, onGoToLeaderboard, onGoToTipsRoom }) {
  const [show, setShow] = useState(false);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    if (!player || !officialResults?.length) return;

    const key = `wc_last_seen_${player.id}`;
    const lastSeen = parseInt(localStorage.getItem(key) || "0", 10);
    const now = Date.now();

    // Count results that have a valid score AND were created after last visit
    const newResults = officialResults.filter(r => {
      if (r.homeScore == null || r.awayScore == null) return false;
      const ts = r.created_date ? new Date(r.created_date).getTime() : 0;
      return ts > lastSeen;
    });

    // Update last seen timestamp immediately so refreshes don't re-trigger
    localStorage.setItem(key, String(now));

    if (newResults.length > 0 && lastSeen > 0) {
      setNewCount(newResults.length);
      setShow(true);
    }
  }, [player?.id, officialResults?.length]);

  if (!show) return null;

  return (
    <div style={{
      background: "linear-gradient(95deg,rgba(47,139,255,.12),rgba(18,179,166,.08))",
      border: "1px solid rgba(47,139,255,.3)",
      borderRadius: 10,
      padding: "8px 12px",
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      flexWrap: "wrap"
    }}>
      <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#1a4a7a", lineHeight: 1.35 }}>
        👋 <strong>Welcome back!</strong> {newCount} match{newCount === 1 ? "" : "es"} since you've been back. See how you and everyone else went!
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={onGoToLeaderboard}
          style={{
            background: "linear-gradient(95deg,#2f8bff,#12b3a6)",
            color: "#fff", border: "none", borderRadius: 999,
            padding: "6px 12px", fontSize: 11.5, fontWeight: 800,
            cursor: "pointer", fontFamily: "inherit"
          }}
        >
          Leaderboard →
        </button>
        <button
          onClick={onGoToTipsRoom}
          style={{
            background: "linear-gradient(95deg,#ff3d7f,#ff7a2f)",
            color: "#fff", border: "none", borderRadius: 999,
            padding: "6px 12px", fontSize: 11.5, fontWeight: 800,
            cursor: "pointer", fontFamily: "inherit"
          }}
        >
          Tips Room →
        </button>
        <button
          onClick={() => setShow(false)}
          style={{
            background: "rgba(0,0,0,.06)", border: "none", borderRadius: 999,
            width: 26, height: 26, cursor: "pointer",
            fontSize: 12, fontWeight: 900, color: "#666",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >✕</button>
      </div>
    </div>
  );
}