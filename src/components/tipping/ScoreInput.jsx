import React from "react";

export default function ScoreInput({ value, onChange, locked, active }) {
  const v = value == null || value === "" ? null : +value;

  const inc = () => {
    if (locked) return;
    onChange(v == null ? 0 : v + 1);
  };

  const dec = () => {
    if (locked || v == null || v <= 0) return;
    onChange(v - 1);
  };

  const cls = ["sin", active || v != null ? "act" : ""].filter(Boolean).join(" ");

  return (
    <div className={cls}>
      <button className="sin-btn plus" disabled={locked} onClick={inc} aria-label="increase">+</button>
      <div className={`sin-num${v == null ? " empty" : ""}`}>
        {v == null ? "–" : v}
      </div>
      <button className="sin-btn minus" disabled={locked || v == null || v <= 0} onClick={dec} aria-label="decrease">−</button>
    </div>
  );
}