// Inline SVG country flags for all 48 WC2026 teams
// Using emoji flags rendered via unicode regional indicators as fallback
// Primary: actual SVG flag render via flagcdn.com as img with no external deps fallback

const COUNTRY_CODES = {
  "Mexico": "mx", "Uruguay": "uy", "South Africa": "za", "Ecuador": "ec",
  "USA": "us", "Panama": "pa", "Ghana": "gh", "Cameroon": "cm",
  "Canada": "ca", "Honduras": "hn", "Morocco": "ma", "Portugal": "pt",
  "Germany": "de", "Japan": "jp", "Peru": "pe", "Saudi Arabia": "sa",
  "Spain": "es", "Senegal": "sn", "Costa Rica": "cr", "Serbia": "rs",
  "France": "fr", "Argentina": "ar", "Nigeria": "ng", "Australia": "au",
  "England": "gb-eng", "Netherlands": "nl", "Algeria": "dz", "DR Congo": "cd",
  "Brazil": "br", "Colombia": "co", "Switzerland": "ch", "Italy": "it",
  "Croatia": "hr", "Belgium": "be", "Iran": "ir", "Paraguay": "py",
  "Poland": "pl", "New Zealand": "nz", "Egypt": "eg", "South Korea": "kr",
  "Bolivia": "bo", "Jamaica": "jm", "Indonesia": "id", "Venezuela": "ve",
  "Ukraine": "ua", "Turkey": "tr", "Romania": "ro", "Austria": "at",
};

// Emoji flag fallback
const EMOJI_FLAGS = {
  "Mexico":"🇲🇽","Uruguay":"🇺🇾","South Africa":"🇿🇦","Ecuador":"🇪🇨",
  "USA":"🇺🇸","Panama":"🇵🇦","Ghana":"🇬🇭","Cameroon":"🇨🇲",
  "Canada":"🇨🇦","Honduras":"🇭🇳","Morocco":"🇲🇦","Portugal":"🇵🇹",
  "Germany":"🇩🇪","Japan":"🇯🇵","Peru":"🇵🇪","Saudi Arabia":"🇸🇦",
  "Spain":"🇪🇸","Senegal":"🇸🇳","Costa Rica":"🇨🇷","Serbia":"🇷🇸",
  "France":"🇫🇷","Argentina":"🇦🇷","Nigeria":"🇳🇬","Australia":"🇦🇺",
  "England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Netherlands":"🇳🇱","Algeria":"🇩🇿","DR Congo":"🇨🇩",
  "Brazil":"🇧🇷","Colombia":"🇨🇴","Switzerland":"🇨🇭","Italy":"🇮🇹",
  "Croatia":"🇭🇷","Belgium":"🇧🇪","Iran":"🇮🇷","Paraguay":"🇵🇾",
  "Poland":"🇵🇱","New Zealand":"🇳🇿","Egypt":"🇪🇬","South Korea":"🇰🇷",
  "Bolivia":"🇧🇴","Jamaica":"🇯🇲","Indonesia":"🇮🇩","Venezuela":"🇻🇪",
  "Ukraine":"🇺🇦","Turkey":"🇹🇷","Romania":"🇷🇴","Austria":"🇦🇹",
};

export default function Flag({ name, size = 20 }) {
  const code = COUNTRY_CODES[name];
  const emoji = EMOJI_FLAGS[name] || "🏳️";
  
  if (!code) {
    return (
      <span style={{ fontSize: size * 0.85, lineHeight: 1, display: "inline-block", verticalAlign: "middle" }}>
        {emoji}
      </span>
    );
  }

  // Use flagcdn for reliable flags
  const url = code === "gb-eng"
    ? "https://flagcdn.com/gb-eng.svg"
    : `https://flagcdn.com/${code}.svg`;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    >
      <img
        src={url}
        alt={name}
        width={Math.round(size * 1.5)}
        height={size}
        style={{
          borderRadius: 3,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.12)",
          objectFit: "cover",
          display: "block",
        }}
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling && (e.target.nextSibling.style.display = "inline");
        }}
      />
      <span style={{ display: "none", fontSize: size * 0.85 }}>{emoji}</span>
    </span>
  );
}