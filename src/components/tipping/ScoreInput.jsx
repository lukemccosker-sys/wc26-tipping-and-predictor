import React, { useState, useEffect, useRef } from "react";

export default function ScoreInput({ value, onChange, locked, active }) {
  const isEmpty = value == null || value === "";
  const externalValue = isEmpty ? null : +value;

  const [local, setLocal] = useState(externalValue);
  const onChangeRef = useRef(onChange);
  const isPendingRef = useRef(false); // true while user is actively editing (debounce in flight)

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Sync from parent only if not mid-edit (avoids overwriting rapid clicks with stale DB value)
  useEffect(() => {
    if (!isPendingRef.current) {
      setLocal(externalValue);
    }
  }, [externalValue]);

  const inc = () => {
    if (locked) return;
    const next = local == null ? 0 : local + 1;
    setLocal(next);
    isPendingRef.current = true;
    onChangeRef.current(next);
    // Clear pending flag after debounce window + buffer
    clearTimeout(inc._t);
    inc._t = setTimeout(() => { isPendingRef.current = false; }, 800);
  };

  const dec = () => {
    if (locked || local == null || local <= 0) return;
    const next = Math.max(0, local - 1);
    setLocal(next);
    isPendingRef.current = true;
    onChangeRef.current(next);
    clearTimeout(dec._t);
    dec._t = setTimeout(() => { isPendingRef.current = false; }, 800);
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