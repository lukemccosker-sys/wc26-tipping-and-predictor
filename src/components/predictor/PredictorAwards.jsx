import React from "react";

const AWARDS = [
  { key: "boot", label: "🥇 Golden Boot", hint: "Top goalscorer" },
  { key: "ball", label: "⚽ Golden Ball", hint: "Best player" },
  { key: "young", label: "⭐ Young Player", hint: "Best player born on/after 1 Jan 2005" },
  { key: "glove", label: "🧤 Golden Glove", hint: "Best goalkeeper" },
];

export default function PredictorAwards({ bracketPred, locked, onSetAward, officialAwards, isAdmin, onSetOfficialAward }) {
  const awardPicks = bracketPred?.awardPicks ? JSON.parse(bracketPred.awardPicks) : {};

  function awardMatch(mine, actual) {
    if (!mine || !actual) return false;
    const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return norm(mine) === norm(actual);
  }

  return (
    <div className="awards">
      <div className="notice" style={{ gridColumn: "1/-1" }}>
        Pick the individual award winners. {locked ? "Picks are locked." : "You can edit until the first kick-off."}
      </div>

      {AWARDS.map(({ key, label, hint }) => {
        const actual = officialAwards?.[key];
        const mine = awardPicks[key] || "";
        const known = !!(actual && actual.trim());
        const ok = known && awardMatch(mine, actual);

        return (
          <div className="award-card" key={key}>
            <div className="award-h">
              <div className="award-htext">
                <span className="award-t">{label}</span>
                <span className="award-hint">{hint}</span>
              </div>
              {known && (
                <span className={`pts-circle t-${ok ? "exact" : "miss"}`}>
                  {ok ? 5 : 0}
                </span>
              )}
            </div>
            <input
              className="award-in"
              type="text"
              placeholder="e.g. Kylian Mbappé"
              value={mine}
              disabled={locked}
              onChange={e => onSetAward(key, e.target.value)}
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