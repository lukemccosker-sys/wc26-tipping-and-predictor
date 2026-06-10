import React, { useState, useEffect } from "react";

function fmt(ms) {
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const d = Math.floor(ms / 86400000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function Countdown({ kickoff }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!kickoff) return;
    const diff = kickoff - Date.now();
    // Tick every second if under 1 hour, else every 30s
    const interval = diff < 3600000 ? 1000 : 30000;
    const t = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(t);
  }, [kickoff]);

  if (!kickoff) return <span className="cd cd-tbc">Time TBC</span>;

  const diff = kickoff - now;
  const hours = diff / 3600000;
  const dayDiff = (new Date(kickoff).setHours(0,0,0,0) - new Date(now).setHours(0,0,0,0)) / 86400000;

  if (diff < -7200000) return null; // more than 2h past
  if (diff < 0) return <span className="cd cd-now">● LIVE</span>;
  if (diff < 3600000) return <span className="cd cd-now">⏱ {fmt(diff)}</span>;
  if (hours < 6) return <span className="cd cd-soon">⏰ {fmt(diff)}</span>;
  if (dayDiff === 0) return <span className="cd cd-today">Today · {fmt(diff)}</span>;
  return <span className="cd cd-up">{fmt(diff)}</span>;
}