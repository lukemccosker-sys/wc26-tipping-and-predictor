import React, { useState } from "react";
import Flag from "@/lib/flags";
import { GROUP_MATCHES, KO_MATCHES, GL } from "@/lib/wc2026data";

// Safely use ROUND_SHORT from data or define locally
const RS = { R32:"R32", R16:"R16", QF:"QF", SF:"Semis", "3rd":"3rd", F:"Final" };

function toLocalInput(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(s) {
  if (!s) return null;
  return new Date(s).getTime();
}

export default function KickoffEditor({ kickoffs, onSetKickoff, onClose }) {
  const [sortBy, setSortBy] = useState("group");

  const allMatches = [
    ...GROUP_MATCHES.map(m => ({ ...m, label: <><Flag name={m.home} size={14} /> {m.home} v {m.away} <Flag name={m.away} size={14} /></>, section: `Group ${m.group}` })),
    ...KO_MATCHES.map(m => ({ ...m, label: <>M{m.id.slice(1)} · {RS[m.round] || m.round} <span style={{ color: "#9aa0ad" }}>{m.venue}</span></>, section: m.round })),
  ];

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-c kickedit" onClick={e => e.stopPropagation()}>
        <div className="gtitle">Kick-off times</div>
        <p className="muted2">Set each game's kick-off in your local time. Tips auto-lock at kick-off.</p>

        <div className="kick-toggle">
          <button className={sortBy === "group" ? "on" : ""} onClick={() => setSortBy("group")}>By group</button>
          <button className={sortBy === "time" ? "on" : ""} onClick={() => setSortBy("time")}>By time</button>
        </div>

        <div className="kick-list">
          {sortBy === "group" ? (
            <>
              <div className="kick-sec">Group stage</div>
              {GL.map(L => (
                <div key={L} className="kick-grp">
                  <div className="kick-grp-h">Group {L}</div>
                  {GROUP_MATCHES.filter(m => m.group === L).map(m => (
                    <div className="kick-row" key={m.id}>
                      <span className="kick-fix"><Flag name={m.home} size={14} /> {m.home} v {m.away} <Flag name={m.away} size={14} /></span>
                      <input
                        type="datetime-local"
                        className="kick-in"
                        value={toLocalInput(kickoffs[m.id])}
                        onChange={e => onSetKickoff(m.id, fromLocalInput(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              ))}
              <div className="kick-sec">Knockouts</div>
              {KO_MATCHES.map(m => (
                <div className="kick-row" key={m.id}>
                  <span className="kick-fix">M{m.id.slice(1)} · {RS[m.round]} <span className="kick-ven">{m.venue}</span></span>
                  <input
                    type="datetime-local"
                    className="kick-in"
                    value={toLocalInput(kickoffs[m.id])}
                    onChange={e => onSetKickoff(m.id, fromLocalInput(e.target.value))}
                  />
                </div>
              ))}
            </>
          ) : (
            (() => {
              const items = allMatches.slice().sort((a, b) => {
                const ka = kickoffs[a.id] || Infinity;
                const kb = kickoffs[b.id] || Infinity;
                return ka - kb;
              });
              const dayKey = id => {
                const ms = kickoffs[id];
                return ms ? new Date(ms).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "Time TBC";
              };
              const days = [];
              let cur = null;
              for (const it of items) {
                const dk = dayKey(it.id);
                if (!cur || cur.k !== dk) { cur = { k: dk, items: [] }; days.push(cur); }
                cur.items.push(it);
              }
              return days.map(d => (
                <div key={d.k} className="kick-grp">
                  <div className="kick-grp-h">{d.k}</div>
                  {d.items.map(it => (
                    <div className="kick-row" key={it.id}>
                      <span className="kick-fix">{it.label}</span>
                      <input
                        type="datetime-local"
                        className="kick-in"
                        value={toLocalInput(kickoffs[it.id])}
                        onChange={e => onSetKickoff(it.id, fromLocalInput(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              ));
            })()
          )}
        </div>

        <button className="role-btn" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}