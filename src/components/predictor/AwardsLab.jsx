import React, { useState } from "react";
import PlayerAvatar from "@/components/PlayerAvatar";

const AWARDS = [
  { key: "boot", label: "🥇 Golden Boot", hint: "Top goalscorer" },
  { key: "ball", label: "⚽ Golden Ball", hint: "Best player" },
  { key: "young", label: "⭐ Young Player", hint: "Best young player" },
  { key: "glove", label: "🧤 Golden Glove", hint: "Best goalkeeper" },
];

function norm(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function fuzzyMatch(guess, actual) {
  if (!guess || !actual) return false;
  const guessWords = norm(guess).split(/\s+/).filter(Boolean);
  const actualWords = norm(actual).split(/\s+/).filter(Boolean);
  return guessWords.some(gw => actualWords.some(aw => aw.includes(gw) || gw.includes(aw)));
}

export default function AwardsLab({ players, bracketPredictions, officialAwards, player, predSettings }) {
  const [activeAward, setActiveAward] = useState("boot");

  // Map playerId → player object
  const playerMap = {};
  (players || []).forEach(p => { playerMap[p.id] = p; });

  // Build picks list for the active award
  const awardActual = officialAwards?.[activeAward] || "";
  const known = !!(awardActual && awardActual.trim());

  const picks = (bracketPredictions || [])
    .map(bp => {
      const picks = bp.awardPicks ? JSON.parse(bp.awardPicks) : {};
      const value = picks[activeAward] || "";
      const p = playerMap[bp.playerId];
      const name = p?.name || "Unknown";
      return { playerId: bp.playerId, name, value, photo: p?.profilePhoto, matched: known && fuzzyMatch(value, awardActual) };
    })
    .filter(p => p.value.trim());

  // Sort: correct first, then alphabetical
  picks.sort((a, b) => {
    if (a.matched !== b.matched) return a.matched ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const currentAward = AWARDS.find(a => a.key === activeAward);

  return (
    <div>
      {/* Award selector chips */}
      <div className="filter-row" style={{ marginBottom: 14 }}>
        {AWARDS.map(a => (
          <button
            key={a.key}
            className={`chip${activeAward === a.key ? " on" : ""}`}
            onClick={() => setActiveAward(a.key)}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="card pad" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>{currentAward?.hint}</div>
        {known ? (
          <div style={{ marginTop: 6, fontSize: 14, fontWeight: 800, color: "var(--green)" }}>
            ✅ Official winner: <span style={{ color: "var(--ink)" }}>{awardActual}</span>
          </div>
        ) : (
          <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600, color: "var(--muted2)" }}>
            Official winner not yet announced
          </div>
        )}
        <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted2)" }}>
          {picks.length} player{picks.length === 1 ? "" : "s"} picked someone for this award
        </div>
      </div>

      {picks.length === 0 ? (
        <div className="empty" style={{ padding: "30px 0" }}>
          <div className="empty-em">🤷</div>
          <div className="empty-t">No picks yet</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Nobody has made a pick for this award.</div>
        </div>
      ) : (
        <div className="rev-list" style={{ gridTemplateColumns: "1fr" }}>
          {picks.map(pick => {
            const isMe = pick.playerId === player?.id;
            return (
              <div key={pick.playerId} className="card" style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <PlayerAvatar player={{ name: pick.name, profilePhoto: pick.photo }} size={32} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: isMe ? "var(--pink)" : "var(--ink)" }}>
                        {isMe && "⭐ "}{pick.name}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                        {pick.value}
                      </div>
                    </div>
                  </div>
                  {known && (
                    <span className={`pts-circle t-${pick.matched ? "exact" : "miss"}`} style={{ width: 28, height: 28, fontSize: 12 }}>
                      {pick.matched ? "✓" : "✗"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}