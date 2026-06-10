import React, { useState, useEffect } from "react";
import ScoreInput from "./ScoreInput";

/**
 * Admin result entry with local draft state.
 * Once "Set ✓" is clicked, inputs lock and the score is saved permanently.
 * Admin must click "✕ Reset" to clear and re-enter.
 */
export default function ResultEntry({ matchId, official, onSetOfficial, onClearOfficial }) {
  const hasOfficial = official && official.homeScore != null && official.awayScore != null;

  const [draftHome, setDraftHome] = useState(official?.homeScore ?? null);
  const [draftAway, setDraftAway] = useState(official?.awayScore ?? null);

  // Sync draft when official result changes externally (e.g. another admin clears it)
  useEffect(() => {
    setDraftHome(official?.homeScore ?? null);
    setDraftAway(official?.awayScore ?? null);
  }, [official?.homeScore, official?.awayScore]);

  const canSet = draftHome != null && draftAway != null && !hasOfficial;

  const handleSet = async () => {
    if (!canSet) return;
    await onSetOfficial(matchId, draftHome, draftAway);
  };

  const handleClear = () => {
    onClearOfficial(matchId);
    setDraftHome(null);
    setDraftAway(null);
  };

  return (
    <div className="gm-result-row">
      <span className="gm-result-lbl">
        {hasOfficial ? "✅ Result" : "📝 Enter result"}
      </span>
      <div className="gm-result-inputs" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <ScoreInput
          value={hasOfficial ? official.homeScore : draftHome}
          onChange={v => !hasOfficial && setDraftHome(v)}
          locked={hasOfficial}
          active={hasOfficial}
        />
        <span className="vs">–</span>
        <ScoreInput
          value={hasOfficial ? official.awayScore : draftAway}
          onChange={v => !hasOfficial && setDraftAway(v)}
          locked={hasOfficial}
          active={hasOfficial}
        />
        {!hasOfficial && (
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
        )}
        {hasOfficial && (
          <button
            className="result-clear-btn"
            onClick={handleClear}
            title="Reset result"
          >✕ Reset</button>
        )}
      </div>
    </div>
  );
}