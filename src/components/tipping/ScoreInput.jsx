import React, { useState, useEffect, useRef } from "react";

export default function ScoreInput({ value, onChange, locked, active }) {
  const isEmpty = value == null || value === "";
  const [local, setLocal] = useState(isEmpty ? null : +value);
  const onChangeRef = useRef(onChange);

  // Keep callback ref fresh without causing re-syncs
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Only sync from parent when the value changes from outside (e.g. initial load or reset)
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setLocal(isEmpty ? null : +value);
    }
  }, [value, isEmpty]);

  const inc = () => {
    if (locked) return;
    const next = local == null ? 0 : local + 1;
    setLocal(next);
    onChangeRef.current(next);
  };

  const dec = () => {
    if (locked || local == null || local <= 0) return;
    const next = Math.max(0, local - 1);
    setLocal(next);
    onChangeRef.current(next);
  };

  const cls = ["sin", active || local != null ? "act" : "", locked ? "lk" : ""].filter(Boolean).join(" ");

  return (
    <div className={cls}>
      <button className="sin-btn plus" disabled={locked} onClick={inc} aria-label="increase">+</button>
      <div className={`sin-num${local == null ? " empty" : ""}`}>
        {local == null ? "–" : local}
      </div>
      <button className="sin-btn minus" disabled={locked || local == null || local <= 0} onClick={dec} aria-label="decrease">−</button>
    </div>
  );
}