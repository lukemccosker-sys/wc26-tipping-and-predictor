import React, { useState } from "react";
import { TippingScoringCard, PredictorScoringCard } from "@/components/ScoringCard";

export default function ScoringModal({ poolSettings, predSettings, isAdmin, onSaveSettings, onSavePredSettings, onClose }) {
  const [tab, setTab] = useState("tip");

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(40,30,20,.5)",
        display: "flex", alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
        padding: "0",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff7ee",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: 560,
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -12px 48px -12px rgba(0,0,0,.35)",
        }}
      >
        {/* Handle bar */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: "#e0d2bd" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 18px 10px" }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, textTransform: "uppercase", letterSpacing: ".04em" }}>
            🏆 Scoring Rules
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9aa0ad", lineHeight: 1, padding: 4 }}
          >✕</button>
        </div>

        {/* Tab toggle */}
        <div style={{ display: "flex", gap: 0, margin: "0 18px 12px", background: "#efe3d2", borderRadius: 999, padding: 4 }}>
          <button
            onClick={() => setTab("tip")}
            style={{
              flex: 1, border: "none", borderRadius: 999, padding: "9px 10px",
              fontFamily: "'Anton', sans-serif", fontSize: 14, letterSpacing: ".03em",
              textTransform: "uppercase", cursor: "pointer", transition: "all .2s",
              background: tab === "tip" ? "linear-gradient(95deg,#ff3d7f,#ff7a2f)" : "transparent",
              color: tab === "tip" ? "#fff" : "#9aa0ad",
              boxShadow: tab === "tip" ? "0 6px 16px -6px rgba(255,61,127,.6)" : "none",
            }}
          >🎯 Tipping</button>
          <button
            onClick={() => setTab("pred")}
            style={{
              flex: 1, border: "none", borderRadius: 999, padding: "9px 10px",
              fontFamily: "'Anton', sans-serif", fontSize: 14, letterSpacing: ".03em",
              textTransform: "uppercase", cursor: "pointer", transition: "all .2s",
              background: tab === "pred" ? "linear-gradient(95deg,#7b54f0,#2f8bff)" : "transparent",
              color: tab === "pred" ? "#fff" : "#9aa0ad",
              boxShadow: tab === "pred" ? "0 6px 16px -6px rgba(123,84,240,.6)" : "none",
            }}
          >🔮 Predictor</button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: "auto", padding: "0 18px 80px", flex: 1, WebkitOverflowScrolling: "touch" }}>
          {tab === "tip" && (
            <TippingScoringCard poolSettings={poolSettings} isAdmin={isAdmin} onSave={onSaveSettings} />
          )}
          {tab === "pred" && (
            <PredictorScoringCard predSettings={predSettings} isAdmin={isAdmin} onSave={onSavePredSettings} />
          )}
        </div>
      </div>
    </div>
  );
}