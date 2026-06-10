import React from "react";

export default function ScoreInput({ value, onChange, locked, active }) {
  const isEmpty = value == null || value === "";
  const v = isEmpty ? null : +value;

  const cls = [
    "sin",
    active ? "act" : "",
    locked ? "lk" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={cls}>
      <button
        className="sin-btn plus"
        disabled={locked}
        onClick={() => onChange((v == null ? 0 : v) + 1)}
        aria-label="increase"
      >+</button>
      <div className={`sin-num${isEmpty ? " empty" : ""}`}>
        {isEmpty ? "–" : v}
      </div>
      <button
        className="sin-btn minus"
        disabled={locked || v == null || v <= 0}
        onClick={() => onChange(Math.max(0, (v ?? 0) - 1))}
        aria-label="decrease"
      >−</button>
    </div>
  );
}