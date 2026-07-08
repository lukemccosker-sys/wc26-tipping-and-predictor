import React from "react";

const COLORS = ["#ff3d7f","#ff7a2f","#12b3a6","#2f8bff","#7b54f0","#ffb020","#19a673","#b14ce0","#0fb5c4","#e8456e"];

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function PlayerAvatar({ player, size = 28, style }) {
  const photo = player?.profilePhoto;
  const name = player?.name || "?";
  const initial = name.charAt(0).toUpperCase();
  const dim = { width: size, height: size };

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={{ ...dim, borderRadius: "50%", objectFit: "cover", flexShrink: 0, ...style }}
      />
    );
  }
  return (
    <span
      style={{
        ...dim,
        borderRadius: "50%",
        background: colorFor(name),
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        fontWeight: 800,
        flexShrink: 0,
        ...style,
      }}
    >
      {initial}
    </span>
  );
}