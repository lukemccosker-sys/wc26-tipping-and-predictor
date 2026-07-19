import React, { useState, useEffect, useRef } from "react";
import { DEFAULT_PRED_SETTINGS } from "@/lib/wc2026data";

const AWARDS = [
  { key: "boot", label: "🥇 Golden Boot", hint: "Top goalscorer" },
  { key: "ball", label: "⚽ Golden Ball", hint: "Best player" },
  { key: "young", label: "⭐ Young Player", hint: "Best player born on/after 1 Jan 2005" },
  { key: "glove", label: "🧤 Golden Glove", hint: "Best goalkeeper" },
];

function AdminActualInput({ awardKey, actual, onSetOfficialAward }) {
  const [value, setValue] = useState(actual || "");
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!actual) setValue("");
  }, [actual]);

  const handleChange = (e) => {
    const v = e.target.value;
    setValue(v);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onSetOfficialAward(awardKey, v), 600);
  };

  return (
    <div className="award-official">
      <label>
        Actual winner (admin):
        <input
          type="text"
          placeholder="set once known"
          value={value}
          onChange={handleChange}
        />
      </label>
    </div>
  );
}

function AwardInput({ awardKey, label, hint, locked, savedValue, onSave, actual, isAdmin, onSetOfficialAward, awardPts }) {
  const [value, setValue] = useState(savedValue || "");
  const saveTimer = useRef(null);

  // Only sync from parent on initial mount or if parent clears the value
  useEffect(() => {
    if (!savedValue) setValue("");
  }, [savedValue]);

  const handleChange = (e) => {
    const v = e.target.value;
    setValue(v);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onSave(awardKey, v), 600);
  };

  const known = !!(actual && actual.trim());
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  // Match if any word in the guess appears in any word of the actual name (fuzzy, accent-insensitive)
  const fuzzyMatch = (guess, actual) => {
    if (!guess || !actual) return false;
    const guessWords = norm(guess).split(/\s+/).filter(Boolean);
    const actualWords = norm(actual).split(/\s+/).filter(Boolean);
    return guessWords.filter(gw => gw.length >= 3).some(gw => actualWords.some(aw => aw.includes(gw) || gw.includes(aw)));
  };
  const ok = known && fuzzyMatch(value, actual);

  return (
    <div className="award-card">
      <div className="award-h">
        <div className="award-htext">
          <span className="award-t">{label}</span>
          <span className="award-hint">{hint}</span>
        </div>
        {known && (
          <span className={`pts-circle t-${ok ? "exact" : "miss"}`}>
            {ok ? awardPts : 0}
          </span>
        )}
      </div>

      <textarea
        rows={2}
        placeholder="Type full name, e.g. Kylian Mbappé"
        value={value}
        disabled={locked}
        onChange={handleChange}
        style={{
          width: "100%",
          border: "2px solid var(--line2)",
          borderRadius: 11,
          padding: "11px 13px",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--ink)",
          background: locked ? "var(--panel2)" : "#fff",
          fontFamily: "inherit",
          resize: "none",
          outline: "none",
          opacity: locked ? 0.8 : 1,
        }}
      />
      <div className="award-note">
        First or last name is fine — accents & spelling don't have to be perfect. <b>Mbappe</b>, <b>Kylian</b>, or <b>Mbappé</b> all count.
      </div>

      {isAdmin && (
        <AdminActualInput awardKey={awardKey} actual={actual} onSetOfficialAward={onSetOfficialAward} />
      )}
      {!isAdmin && known && (
        <div className="award-actual">Winner: <b>{actual}</b></div>
      )}
    </div>
  );
}

export default function PredictorAwards({ bracketPred, locked, onSetAward, officialAwards, isAdmin, onSetOfficialAward, predSettings }) {
  const awardPts = predSettings?.award ?? DEFAULT_PRED_SETTINGS.award ?? 5;
  const savedPicks = bracketPred?.awardPicks ? JSON.parse(bracketPred.awardPicks) : {};

  return (
    <div className="awards">
      <div className="notice" style={{ gridColumn: "1/-1" }}>
        Pick the individual award winners. {locked ? "Picks are locked." : "You can edit until the first kick-off."}
      </div>
      {AWARDS.map(({ key, label, hint }) => (
        <AwardInput
          key={key}
          awardKey={key}
          label={label}
          hint={hint}
          locked={locked}
          savedValue={savedPicks[key] || ""}
          onSave={onSetAward}
          actual={officialAwards?.[key]}
          isAdmin={isAdmin}
          onSetOfficialAward={onSetOfficialAward}
          awardPts={awardPts}
        />
      ))}
    </div>
  );
}