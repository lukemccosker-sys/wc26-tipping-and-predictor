import React from "react";
import { TippingScoringCard, PredictorScoringCard } from "@/components/ScoringCard";

export default function ScoringModal({ poolSettings, predSettings, isAdmin, onSaveSettings, onSavePredSettings, onClose }) {
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-c" style={{ maxWidth: 560, maxHeight: "88vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, textTransform: "uppercase", letterSpacing: ".04em" }}>Scoring</div>
          <button className="mini" onClick={onClose}>✕ Close</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TippingScoringCard poolSettings={poolSettings} isAdmin={isAdmin} onSave={onSaveSettings} />
          <PredictorScoringCard predSettings={predSettings} isAdmin={isAdmin} onSave={onSavePredSettings} />
        </div>
      </div>
    </div>
  );
}