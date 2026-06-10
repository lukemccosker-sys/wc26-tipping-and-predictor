import React, { useState } from "react";

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

  const Field = ({ label, sub, k }) => (
    <div style={{ background: "#fff8f0", border: "1.5px solid #efe3d2", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "#9aa0ad", marginTop: 2 }}>{sub}</div>}
      </div>
      {editing && isAdmin ? (
        <input
          type="number" min={0} max={99}
          value={vals[k]}
          onChange={e => setVals(v => ({ ...v, [k]: e.target.value }))}
          style={{ width: 60, border: "2px solid #12b3a6", borderRadius: 10, padding: "6px 10px", fontSize: 16, fontWeight: 800, textAlign: "center", fontFamily: "inherit", color: "#222a3d" }}
        />
      ) : (
        <div style={{ background: "#fff", border: "2px solid #efe3d2", borderRadius: 10, padding: "6px 14px", fontSize: 18, fontWeight: 800, minWidth: 48, textAlign: "center" }}>
          {vals[k]}
        </div>
      )}
    </div>
  );

  return (
    <div className="card pad">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div className="gtitle">Tipping scoring</div>
        {isAdmin && !editing && <button className="mini" onClick={() => setEditing(true)}>✏️ Edit</button>}
        {isAdmin && editing && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="mini" onClick={() => setEditing(false)}>Cancel</button>
            <button className="mini" style={{ background: "linear-gradient(95deg,#ff3d7f,#ff7a2f)", color: "#fff", border: "none" }} onClick={save}>Save</button>
          </div>
        )}
      </div>
      <div style={{ color: "#9aa0ad", fontSize: 13, marginBottom: 14 }}>
        Points each game by how close your tip is.{isAdmin ? " Edit any number (applies to the whole pool)." : ""}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Exact score" sub="you 2-1 · result 2-1" k="exact" />
        <Field label="Winner + goal diff" sub="you 1-0 · result 2-1" k="gd" />
        <Field label="Right winner / draw" sub="you 1-0 · result 3-0" k="result" />
        <div style={{ background: "#fff8f0", border: "1.5px solid #efe3d2", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, opacity: 0.7 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Wrong outcome</div>
            <div style={{ fontSize: 12, color: "#9aa0ad", marginTop: 2 }}>you 2-1 · result 0-1</div>
          </div>
          <div style={{ background: "#f0e8db", border: "2px solid #efe3d2", borderRadius: 10, padding: "6px 14px", fontSize: 18, fontWeight: 800, minWidth: 48, textAlign: "center", color: "#9aa0ad" }}>0</div>
        </div>
      </div>
      <div style={{ marginTop: 16, borderTop: "1px solid #efe3d2", paddingTop: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>🏆 Knockouts &amp; penalties</div>
        <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
          Knockout games score the same way on the 90/120-minute score. If a knockout is a <b>draw</b> (e.g. 1–1, 0–0), you still get the normal points for the scoreline.
        </div>
        <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6, marginTop: 8 }}>
          When a knockout is drawn, the <b>admin taps the "P" winner</b> — the team that won on penalties — and that team advances to the next round to tip. If you tipped a <b>team to win</b> and they ended up going through on penalties, you still get the <b>1 result point</b> for picking the team that progressed.
        </div>
        <div style={{ fontSize: 12, color: "#9aa0ad", marginTop: 8 }}>When the real results are finalised, your points are awarded automatically and that game locks.</div>
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

  const Field = ({ label, k, emoji }) => (
    <div style={{ background: "#fff8f0", border: "1.5px solid #efe3d2", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 14 }}>{emoji && <span style={{ marginRight: 6 }}>{emoji}</span>}{label}</div>
      {editing && isAdmin ? (
        <input
          type="number" min={0} max={99}
          value={vals[k]}
          onChange={e => setVals(v => ({ ...v, [k]: +e.target.value }))}
          style={{ width: 60, border: "2px solid #12b3a6", borderRadius: 10, padding: "6px 10px", fontSize: 16, fontWeight: 800, textAlign: "center", fontFamily: "inherit", color: "#222a3d" }}
        />
      ) : (
        <div style={{ background: "#fff", border: "2px solid #efe3d2", borderRadius: 10, padding: "6px 14px", fontSize: 18, fontWeight: 800, minWidth: 48, textAlign: "center" }}>
          {vals[k]}
        </div>
      )}
    </div>
  );

  return (
    <div className="card pad">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div className="gtitle">Predictor scoring</div>
        {isAdmin && !editing && <button className="mini" onClick={() => setEditing(true)}>✏️ Edit</button>}
        {isAdmin && editing && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="mini" onClick={() => { setVals({ ...predSettings }); setEditing(false); }}>Cancel</button>
            <button className="mini" style={{ background: "linear-gradient(95deg,#7b54f0,#2f8bff)", color: "#fff", border: "none" }} onClick={save}>Save</button>
          </div>
        )}
      </div>
      <div style={{ color: "#9aa0ad", fontSize: 13, marginBottom: 14 }}>
        Points for every correct call — biggest for the deep rounds.{isAdmin ? " Edit any number (applies to the whole pool)." : ""}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Group winner" emoji="🥇" k="g1" />
        <Field label="Group runner-up" emoji="🥈" k="g2" />
        <Field label="Best-3rd qualifier" emoji="🥉" k="third" />
        <Field label="Reach Round of 16" k="r32" />
        <Field label="Reach Quarter-final" k="r16" />
        <Field label="Reach Semi-final" k="qf" />
        <Field label="Reach Final" k="sf" />
        <Field label="3rd-place play-off win" k="third_place" />
        <Field label="Champion" emoji="🏆" k="champ" />
        <Field label="Each award" emoji="🥇" k="award" />
      </div>
      <div style={{ fontSize: 12, color: "#9aa0ad", marginTop: 14, lineHeight: 1.6 }}>
        🥇 Awards = Golden Boot, Golden Ball, Young Player &amp; Golden Glove. When the real results are finalised, points will be awarded automatically; everything locks at the first kick-off.
      </div>
    </div>
  );
}

export { TippingScoringCard, PredictorScoringCard };