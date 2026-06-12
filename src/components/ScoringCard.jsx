import React, { useState } from "react";

const ROW = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 0", borderBottom: "1px solid #f4ebdf" };
const LABEL = { fontSize: 13, fontWeight: 600, color: "#222a3d", flex: 1, minWidth: 0 };
const SUB = { fontSize: 11, color: "#9aa0ad", marginTop: 1 };
const BADGE = { background: "#fff", border: "2px solid #efe3d2", borderRadius: 9, padding: "3px 12px", fontSize: 15, fontWeight: 800, minWidth: 40, textAlign: "center", flexShrink: 0 };
const BADGE_MUTED = { ...BADGE, background: "#f0e8db", color: "#b9b1a3", border: "2px solid #efe3d2" };
const INPUT_STYLE = { width: 52, border: "2px solid #12b3a6", borderRadius: 9, padding: "3px 8px", fontSize: 15, fontWeight: 800, textAlign: "center", fontFamily: "inherit", color: "#222a3d" };

// ── Tipping Scoring Card ──────────────────────────────────────────
function TippingScoringCard({ poolSettings, isAdmin, onSave }) {
  const [editing, setEditing] = useState(false);
  const [vals, setVals] = useState({
    exact: poolSettings?.pointsExact ?? 5,
    gd: poolSettings?.pointsGD ?? 3,
    result: poolSettings?.pointsResult ?? 1,
  });

  const save = async () => {
    await onSave({ pointsExact: +vals.exact, pointsGD: +vals.gd, pointsResult: +vals.result });
    setEditing(false);
  };

  const rows = [
    { label: "Exact score", sub: "Nailed the exact scoreline — e.g. tip 1–1, result 1–1", k: "exact", color: "#2cb551" },
    { label: "Correct winner & goal margin", sub: "Right winner, right margin, wrong score — e.g. tip 2–1, result 3–2", k: "gd", color: "#12b3a6" },
    { label: "Correct winner or draw", sub: "Right team won (or draw), but wrong margin/score — e.g. tip 2–1, result 3–0", k: "result", color: "#ffb020" },
  ];

  return (
    <div>
      {isAdmin && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          {!editing
            ? <button className="mini" onClick={() => setEditing(true)}>✏️ Edit</button>
            : <div style={{ display: "flex", gap: 6 }}>
                <button className="mini" onClick={() => setEditing(false)}>Cancel</button>
                <button className="mini" style={{ background: "linear-gradient(95deg,#ff3d7f,#ff7a2f)", color: "#fff", border: "none" }} onClick={save}>Save</button>
              </div>
          }
        </div>
      )}
      <div>
        {rows.map(({ label, sub, k, color }) => (
          <div key={k} style={ROW}>
            <div style={LABEL}>
              <div>{label}</div>
              <div style={SUB}>{sub}</div>
            </div>
            {editing && isAdmin
              ? <input type="number" min={0} max={99} value={vals[k]} onChange={e => setVals(v => ({ ...v, [k]: e.target.value }))} style={INPUT_STYLE} />
              : <div style={{ ...BADGE, color }}>{vals[k]} pts</div>
            }
          </div>
        ))}
        <div style={{ ...ROW, opacity: 0.55, borderBottom: "none" }}>
          <div style={LABEL}>
            <div>Wrong outcome</div>
            <div style={SUB}>e.g. tip 2–1 · result 0–1</div>
          </div>
          <div style={BADGE_MUTED}>0 pts</div>
        </div>
      </div>
      <div style={{ marginTop: 12, background: "#fff8f0", borderRadius: 11, padding: "10px 12px", fontSize: 12, color: "#6c7384", lineHeight: 1.55 }}>
        <b style={{ color: "#222a3d" }}>🏆 Knockouts:</b> Same scoring on 120-min score. If it's a draw, admin marks the penalty winner — you still get <b>1pt</b> if you picked that team to win.
      </div>
    </div>
  );
}

// ── Predictor Scoring Card ────────────────────────────────────────
function PredictorScoringCard({ predSettings, isAdmin, onSave }) {
  const [editing, setEditing] = useState(false);
  const [vals, setVals] = useState({ ...predSettings });

  const save = async () => {
    await onSave(vals);
    setEditing(false);
  };

  const rows = [
    { label: "Group winner", emoji: "🥇", k: "g1" },
    { label: "Group runner-up", emoji: "🥈", k: "g2" },
    { label: "Best 3rd qualifier", emoji: "🥉", k: "third" },
    { label: "Reach Round of 32", emoji: "→", k: "r32" },
    { label: "Reach Round of 16", emoji: "→", k: "r16" },
    { label: "Reach Quarter-final", emoji: "→", k: "qf" },
    { label: "Reach Semi-final", emoji: "→", k: "sf" },
    { label: "3rd place play-off win", emoji: "🥉", k: "third_place" },
    { label: "Champion", emoji: "🏆", k: "champ" },
    { label: "Each award winner", emoji: "🌟", k: "award" },
  ];

  return (
    <div>
      {isAdmin && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          {!editing
            ? <button className="mini" onClick={() => setEditing(true)}>✏️ Edit</button>
            : <div style={{ display: "flex", gap: 6 }}>
                <button className="mini" onClick={() => { setVals({ ...predSettings }); setEditing(false); }}>Cancel</button>
                <button className="mini" style={{ background: "linear-gradient(95deg,#7b54f0,#2f8bff)", color: "#fff", border: "none" }} onClick={save}>Save</button>
              </div>
          }
        </div>
      )}
      <div>
        {rows.map(({ label, emoji, k }, i) => (
          <div key={k} style={{ ...ROW, borderBottom: i === rows.length - 1 ? "none" : "1px solid #f4ebdf" }}>
            <div style={{ ...LABEL, display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{emoji}</span>
              <span>{label}</span>
            </div>
            {editing && isAdmin
              ? <input type="number" min={0} max={99} value={vals[k]} onChange={e => setVals(v => ({ ...v, [k]: +e.target.value }))} style={INPUT_STYLE} />
              : <div style={BADGE}>{vals[k]} pts</div>
            }
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, background: "#f0f0ff", borderRadius: 11, padding: "10px 12px", fontSize: 12, color: "#6c7384", lineHeight: 1.55 }}>
        <b style={{ color: "#222a3d" }}>🌟 Awards:</b> Golden Boot, Golden Ball, Young Player &amp; Golden Glove. Locks at first kick-off.
      </div>
    </div>
  );
}

export { TippingScoringCard, PredictorScoringCard };