import React, { useState, useEffect } from "react";

function fmt(ms) {
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60) % 60;
  const h = Math.floor(s / 3600) % 24;
  const d = Math.floor(s / 86400);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Countdown({ kickoff }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  if (!kickoff) return <span className="cd cd-tbc">Time TBC</span>;

  const diff = kickoff - now;
  const hours = diff / 3600000;
  const dayDiff = (new Date(kickoff).setHours(0,0,0,0) - new Date(now).setHours(0,0,0,0)) / 86400000;

  if (diff < -7200000) return null; // more than 2h past — don't show
  if (diff < 0) return <span className="cd cd-now">● LIVE</span>;
  if (diff < 3600000) return <span className="cd cd-now">▶ {fmt(diff)}</span>;
  if (hours < 6) return <span className="cd cd-soon">⏰ {fmt(diff)}</span>;
  if (dayDiff === 0) return <span className="cd cd-today">Today · {fmt(diff)}</span>;
  return <span className="cd cd-up">{fmt(diff)}</span>;
}