import React, { useState, useEffect } from "react";
import ScoreInput from "./ScoreInput";

/**
 * Admin result entry with local draft state.
 * "Set ✓" commits to DB (triggers notification for all users).
 * "✕" clears the official result.
 */
export default function ResultEntry({ matchId, official, onSetOfficial, onClearOfficial }) {
  const hasOfficial = official && official.homeScore != null && official.awayScore != null;

  const [draftHome, setDraftHome] = useState(official?.homeScore ?? null);
  const [draftAway, setDraftAway] = useState(official?.awayScore ?? null);

  // Keep draft in sync if official result changes externally
  useEffect(() => {
    setDraftHome(official?.homeScore ?? null);
    setDraftAway(official?.awayScore ?? null);
  }, [official?.homeScore, official?.awayScore]);

  const canSet = draftHome != null && draftAway != null;

  const handleSet = async () => {
    if (!canSet) return;
    // Save both sides together
    await onSetOfficial(matchId, "h", draftHome);
    await onSetOfficial(matchId, "a", draftAway);
  };

  return (
    <div className="gm-result-row">
      <span className="gm-result-lbl">
        {hasOfficial ? "✅ Result" : "📝 Enter result"}
      </span>
      <div className="gm-result-inputs" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <ScoreInput
          value={draftHome}
          onChange={v => setDraftHome(v)}
          locked={false}
          active={hasOfficial}
        />
        <span className="vs">–</span>
        <ScoreInput
          value={draftAway}
          onChange={v => setDraftAway(v)}
          locked={false}
          active={hasOfficial}
        />
        <button
          onClick={handleSet}
          disabled={!canSet}
          style={{
            background: canSet ? "linear-gradient(95deg,#2cb551,#12b3a6)" : "#e0d8cf",
            color: canSet ? "#fff" : "#9aa0ad",
            border: "none",
            borderRadius: 8,
            padding: "5px 12px",
            fontSize: 12,
            fontWeight: 800,
            cursor: canSet ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          Set ✓
        </button>
        {hasOfficial && (
          <button
            className="result-clear-btn"
            onClick={() => onClearOfficial(matchId)}
            title="Clear result"
          >✕</button>
        )}
      </div>
    </div>
  );
}