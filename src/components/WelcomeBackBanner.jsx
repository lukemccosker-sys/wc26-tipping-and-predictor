import React, { useState, useEffect } from "react";

/**
 * Shows a one-time "welcome back" summary banner when the user returns
 * and new official results have been posted since their last visit.
 *
 * Uses localStorage key `wc_last_seen_<playerId>` to track the last
 * timestamp the player was active.
 */
export default function WelcomeBackBanner({ player, officialResults, onGoToLeaderboard }) {
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
      // created_date is an ISO string from Base44
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
      background: "linear-gradient(95deg,rgba(47,139,255,.15),rgba(18,179,166,.1))",
      border: "1.5px solid rgba(47,139,255,.4)",
      borderRadius: 14,
      padding: "13px 16px",
      marginBottom: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap"
    }}>
      <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#1a4a7a", lineHeight: 1.45 }}>
        👋 <strong>Welcome back!</strong> {newCount} match{newCount === 1 ? "" : "es"} {newCount === 1 ? "has" : "have"} been scored since your last visit. Check the leaderboard to see how your points have changed!
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={onGoToLeaderboard}
          style={{
            background: "linear-gradient(95deg,#2f8bff,#12b3a6)",
            color: "#fff", border: "none", borderRadius: 999,
            padding: "9px 16px", fontSize: 13, fontWeight: 800,
            cursor: "pointer", fontFamily: "inherit"
          }}
        >
          View Leaderboard →
        </button>
        <button
          onClick={() => setShow(false)}
          style={{
            background: "rgba(0,0,0,.06)", border: "none", borderRadius: 999,
            width: 32, height: 32, cursor: "pointer",
            fontSize: 14, fontWeight: 900, color: "#666",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >✕</button>
      </div>
    </div>
  );
}