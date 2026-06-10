// Country flag component using flagcdn.com with emoji fallback
// Flags are loaded as images; on error, falls back to emoji

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
  // WC 2026 teams
  "Czechia": "cz", "Qatar": "qa", "Bosnia & Herz.": "ba", "Scotland": "gb-sct",
  "Haiti": "ht", "Türkiye": "tr", "Côte d'Ivoire": "ci", "Curaçao": "cw",
  "Sweden": "se", "Tunisia": "tn", "Cabo Verde": "cv", "Norway": "no",
  "Iraq": "iq", "Jordan": "jo", "Uzbekistan": "uz",
};

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
  "Czechia":"🇨🇿","Qatar":"🇶🇦","Bosnia & Herz.":"🇧🇦","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Haiti":"🇭🇹","Türkiye":"🇹🇷","Côte d'Ivoire":"🇨🇮","Curaçao":"🇨🇼",
  "Sweden":"🇸🇪","Tunisia":"🇹🇳","Cabo Verde":"🇨🇻","Norway":"🇳🇴",
  "Iraq":"🇮🇶","Jordan":"🇯🇴","Uzbekistan":"🇺🇿",
};

export default function Flag({ name, size = 20 }) {
  const code = COUNTRY_CODES[name];
  const emoji = EMOJI_FLAGS[name] || "🏳️";

  if (!code) {
    return (
      <span style={{ fontSize: size * 0.9, lineHeight: 1, display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
        {emoji}
      </span>
    );
  }

  const w = Math.round(size * 1.5);
  const url = `https://flagcdn.com/w${w <= 40 ? 40 : 80}/${code}.png`;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle", flexShrink: 0 }}>
      <img
        src={url}
        alt={name}
        width={w}
        height={size}
        style={{ borderRadius: 3, boxShadow: "0 0 0 1px rgba(0,0,0,0.12)", objectFit: "cover", display: "block" }}
        onError={(e) => {
          e.target.style.display = "none";
          if (e.target.nextSibling) e.target.nextSibling.style.display = "inline";
        }}
      />
      <span style={{ display: "none", fontSize: size * 0.9, lineHeight: 1 }}>{emoji}</span>
    </span>
  );
}