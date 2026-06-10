import React, { useState, useRef, useEffect } from "react";

export default function ScoreInput({ value, onChange, locked, active }) {
  const toNum = (v) => (v == null || v === "" ? null : +v);

  const [local, setLocal] = useState(() => toNum(value));
  const localRef = useRef(local);
  const onChangeRef = useRef(onChange);
  const pendingTimer = useRef(null);
  const isPending = useRef(false);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Sync from parent only when not mid-edit
  useEffect(() => {
    const ext = toNum(value);
    if (!isPending.current && ext !== localRef.current) {
      localRef.current = ext;
      setLocal(ext);
    }
  }, [value]);

  const commit = (next) => {
    localRef.current = next;
    setLocal(next);
    isPending.current = true;
    onChangeRef.current(next);

    clearTimeout(pendingTimer.current);
    pendingTimer.current = setTimeout(() => {
      isPending.current = false;
    }, 800);
  };

  const inc = () => {
    if (locked) return;
    commit(localRef.current == null ? 0 : localRef.current + 1);
  };

  const dec = () => {
    if (locked || localRef.current == null || localRef.current <= 0) return;
    commit(localRef.current - 1);
  };

  const cls = ["sin", active || local != null ? "act" : ""].filter(Boolean).join(" ");

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