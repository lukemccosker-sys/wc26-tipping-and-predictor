import React, { useState } from "react";
import { GL, WC_GROUPS } from "@/lib/wc2026data";
import { calcGroupTable } from "@/lib/scoring";
import Flag from "@/lib/flags";

export default function GroupStandingsOverride({ officialResults, poolSettings, onSave }) {
  const overrides = poolSettings?.groupStandingsOverrides ? JSON.parse(poolSettings.groupStandingsOverrides) : {};
  const [expanded, setExpanded] = useState({});

  const toggleGroup = (g) => setExpanded(prev => ({ ...prev, [g]: !prev[g] }));

  const handlePositionChange = async (group, position, newTeam) => {
    const computed = calcGroupTable(group, officialResults).map(r => r.team);
    const current = overrides[group] || computed;
    const next = [...current];
    const oldPos = next.indexOf(newTeam);
    if (oldPos === position || oldPos === -1) return;
    const displaced = next[position];
    next[position] = newTeam;
    next[oldPos] = displaced;
    const updated = { ...overrides, [group]: next };
    await onSave({ groupStandingsOverrides: JSON.stringify(updated) });
  };

  const handleReset = async (group) => {
    const updated = { ...overrides };
    delete updated[group];
    await onSave({ groupStandingsOverrides: Object.keys(updated).length ? JSON.stringify(updated) : "" });
  };

  const posLabels = ["1st", "2nd", "3rd", "4th"];
  const posColors = ["#2cb551", "#12b3a6", "#ffb020", "#9aa0ad"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {GL.map(group => {
        const table = calcGroupTable(group, officialResults);
        const totalPld = table.reduce((s, r) => s + r.pld, 0);
        const isComplete = totalPld >= 12;
        const computed = table.map(r => r.team);
        const override = overrides[group];
        const order = override || computed;
        const hasOverride = !!override;
        const isOpen = !!expanded[group];

        return (
          <div key={group} style={{ border: "1px solid #f4ebdf", borderRadius: 10, overflow: "hidden" }}>
            <div
              onClick={() => toggleGroup(group)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", cursor: "pointer", userSelect: "none",
                background: hasOverride ? "rgba(255,176,32,.08)" : "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, color: "#222a3d" }}>Group {group}</span>
                {hasOverride && <span style={{ fontSize: 10, fontWeight: 800, color: "#a86a00", background: "rgba(255,176,32,.18)", borderRadius: 999, padding: "2px 8px" }}>OVERRIDE</span>}
                <span style={{ fontSize: 10, fontWeight: 800, color: isComplete ? "#2cb551" : "#9aa0ad" }}>{totalPld}/12</span>
              </div>
              <span style={{ fontSize: 12, color: "#9aa0ad", fontWeight: 800 }}>{isOpen ? "▲" : "▼"}</span>
            </div>
            {isOpen && (
              <div style={{ padding: "8px 14px 12px", borderTop: "1px solid #f4ebdf" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {order.map((team, pos) => {
                    const row = table.find(r => r.team === team);
                    return (
                      <div key={pos} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          width: 36, textAlign: "center", fontSize: 11, fontWeight: 800,
                          color: "#fff", background: posColors[pos], borderRadius: 6, padding: "3px 0", flexShrink: 0
                        }}>{posLabels[pos]}</span>
                        <select
                          value={team}
                          onChange={e => handlePositionChange(group, pos, e.target.value)}
                          style={{
                            flex: 1, border: "2px solid #efe3d2", borderRadius: 8,
                            padding: "6px 10px", fontSize: 13, fontWeight: 700, color: "#222a3d",
                            background: "#fff", fontFamily: "inherit", cursor: "pointer"
                          }}
                        >
                          {WC_GROUPS[group].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <span style={{ fontSize: 11, color: "#9aa0ad", minWidth: 60, textAlign: "right", flexShrink: 0 }}>
                          {row ? `${row.pts}pts · ${row.gd >= 0 ? "+" : ""}${row.gd}` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {hasOverride && (
                  <button
                    onClick={() => handleReset(group)}
                    style={{
                      marginTop: 8, background: "#fff0f2", border: "1.5px solid #ff3d7f",
                      color: "#ff3d7f", borderRadius: 8, padding: "5px 12px", fontSize: 12,
                      fontWeight: 800, cursor: "pointer", fontFamily: "inherit"
                    }}
                  >
                    ↺ Reset to computed
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}