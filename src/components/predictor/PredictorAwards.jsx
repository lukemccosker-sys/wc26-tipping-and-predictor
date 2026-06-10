import React, { useState, useEffect } from "react";
import { DEFAULT_PRED_SETTINGS } from "@/lib/wc2026data";

const AWARDS = [
  { key: "boot", label: "🥇 Golden Boot", hint: "Top goalscorer" },
  { key: "ball", label: "⚽ Golden Ball", hint: "Best player" },
  { key: "young", label: "⭐ Young Player", hint: "Best player born on/after 1 Jan 2005" },
  { key: "glove", label: "🧤 Golden Glove", hint: "Best goalkeeper" },
];

export default function PredictorAwards({ bracketPred, locked, onSetAward, officialAwards, isAdmin, onSetOfficialAward, predSettings }) {
  const awardPts = predSettings?.award ?? DEFAULT_PRED_SETTINGS.award ?? 5;

  // Local state for smooth typing — syncs from bracketPred on mount/change
  const [localPicks, setLocalPicks] = useState(() => {
    return bracketPred?.awardPicks ? JSON.parse(bracketPred.awardPicks) : {};
  });

  useEffect(() => {
    setLocalPicks(bracketPred?.awardPicks ? JSON.parse(bracketPred.awardPicks) : {});
  }, [bracketPred?.awardPicks]);

  const savedPicks = bracketPred?.awardPicks ? JSON.parse(bracketPred.awardPicks) : {};

  function awardMatch(mine, actual) {
    if (!mine || !actual) return false;
    const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return norm(mine) === norm(actual);
  }

  const handleChange = (key, value) => {
    setLocalPicks(prev => ({ ...prev, [key]: value }));
    onSetAward(key, value);
  };

  return (
    <div className="awards">
      <div className="notice" style={{ gridColumn: "1/-1" }}>
        Pick the individual award winners. {locked ? "Picks are locked." : "You can edit until the first kick-off."}
      </div>

      {AWARDS.map(({ key, label, hint }) => {
        const actual = officialAwards?.[key];
        const saved = savedPicks[key] || "";
        const known = !!(actual && actual.trim());
        const ok = known && awardMatch(saved, actual);

        return (
          <div className="award-card" key={key}>
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
            <input
              className="award-in"
              type="text"
              placeholder="e.g. Kylian Mbappé"
              value={localPicks[key] || ""}
              disabled={locked}
              onChange={e => handleChange(key, e.target.value)}
            />
            <div className="award-note">
              ✍️ Full name, no abbreviations. Accents optional — <b>Mbappe</b> or <b>Mbappé</b> both count.
            </div>
            {isAdmin && (
              <div className="award-official">
                <label>
                  Actual winner (admin):
                  <input
                    type="text"
                    placeholder="set once known"
                    value={actual || ""}
                    onChange={e => onSetOfficialAward(key, e.target.value)}
                  />
                </label>
              </div>
            )}
            {!isAdmin && known && (
              <div className="award-actual">Winner: <b>{actual}</b></div>
            )}
          </div>
        );
      })}
    </div>
  );
}