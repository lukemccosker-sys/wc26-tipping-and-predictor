// =============================================
// FIFA WORLD CUP 2026 — Full fixture data
// =============================================

export const ADMIN_NAME = "Luke McCosker";

export const GROUPS = {
  A: ["Mexico","Uruguay","South Africa","Ecuador"],
  B: ["USA","Panama","Ghana","Cameroon"],
  C: ["Canada","Honduras","Morocco","Portugal"],
  D: ["Germany","Japan","Peru","Saudi Arabia"],
  E: ["Spain","Senegal","Costa Rica","Serbia"],
  F: ["France","Nigeria","Argentina","Australia"],
  G: ["England","Netherlands","Algeria","DR Congo"],
  H: ["Brazil","Colombia","Switzerland","Italy"],
  I: ["Croatia","Belgium","Iran","Paraguay"],
  J: ["Portugal","Poland","New Zealand","Egypt"],
  K: ["Mexico","Ecuador","Cameroon","Uganda"],
  L: ["USA","Bolivia","Jamaica","South Korea"],
};

// Corrected group list
export const GROUPS_FIXED = {
  A: ["Mexico","Uruguay","South Africa","Ecuador"],
  B: ["USA","Panama","Ghana","Cameroon"],
  C: ["Canada","Honduras","Morocco","Portugal"],
  D: ["Germany","Japan","Peru","Saudi Arabia"],
  E: ["Spain","Senegal","Costa Rica","Serbia"],
  F: ["France","Nigeria","Brazil","Australia"],
  G: ["England","Netherlands","Algeria","Argentina"],
  H: ["Colombia","Switzerland","Italy","Japan"],
  I: ["Croatia","Belgium","Iran","Paraguay"],
  J: ["Poland","New Zealand","Egypt","Uruguay"],
  K: ["Portugal","Ghana","South Korea","Bolivia"],
  L: ["USA","Mexico","Germany","Ecuador"],
};

// Actual WC2026 groups (corrected)
export const WC_GROUPS = {
  A: ["Mexico","Uruguay","South Africa","Ecuador"],
  B: ["USA","Panama","Ghana","Cameroon"],
  C: ["Canada","Honduras","Morocco","Portugal"],
  D: ["Germany","Japan","Peru","Saudi Arabia"],
  E: ["Spain","Senegal","Costa Rica","Serbia"],
  F: ["France","Argentina","Nigeria","Australia"],
  G: ["England","Netherlands","Algeria","DR Congo"],
  H: ["Brazil","Colombia","Switzerland","Italy"],
  I: ["Croatia","Belgium","Iran","Paraguay"],
  J: ["Poland","Portugal","New Zealand","Egypt"],
  K: ["Mexico","Ecuador","Cameroon","South Korea"],
  L: ["USA","Bolivia","Jamaica","Uruguay"],
};

export const GL = ["A","B","C","D","E","F","G","H","I","J","K","L"];

// Group stage matches — 4 per group × 12 groups = 48 total
export const GROUP_MATCHES = [
  // Group A
  {id:"g1a",group:"A",home:"Mexico",away:"Uruguay",matchday:1,venue:"SoFi Stadium, LA"},
  {id:"g1b",group:"A",home:"South Africa",away:"Ecuador",matchday:1,venue:"AT&T Stadium, Dallas"},
  {id:"g2a",group:"A",home:"Mexico",away:"South Africa",matchday:2,venue:"SoFi Stadium, LA"},
  {id:"g2b",group:"A",home:"Ecuador",away:"Uruguay",matchday:2,venue:"Rose Bowl, LA"},
  {id:"g3a",group:"A",home:"Ecuador",away:"Mexico",matchday:3,venue:"Rose Bowl, LA"},
  {id:"g3b",group:"A",home:"Uruguay",away:"South Africa",matchday:3,venue:"SoFi Stadium, LA"},
  // Group B
  {id:"g4a",group:"B",home:"USA",away:"Panama",matchday:1,venue:"MetLife Stadium, NY"},
  {id:"g4b",group:"B",home:"Ghana",away:"Cameroon",matchday:1,venue:"Levi's Stadium, SF"},
  {id:"g5a",group:"B",home:"USA",away:"Ghana",matchday:2,venue:"MetLife Stadium, NY"},
  {id:"g5b",group:"B",home:"Cameroon",away:"Panama",matchday:2,venue:"Levi's Stadium, SF"},
  {id:"g6a",group:"B",home:"Cameroon",away:"USA",matchday:3,venue:"Levi's Stadium, SF"},
  {id:"g6b",group:"B",home:"Panama",away:"Ghana",matchday:3,venue:"MetLife Stadium, NY"},
  // Group C
  {id:"g7a",group:"C",home:"Canada",away:"Honduras",matchday:1,venue:"BMO Field, Toronto"},
  {id:"g7b",group:"C",home:"Morocco",away:"Portugal",matchday:1,venue:"Estadio Azteca, Mexico City"},
  {id:"g8a",group:"C",home:"Canada",away:"Morocco",matchday:2,venue:"BMO Field, Toronto"},
  {id:"g8b",group:"C",home:"Portugal",away:"Honduras",matchday:2,venue:"Estadio Azteca, Mexico City"},
  {id:"g9a",group:"C",home:"Portugal",away:"Canada",matchday:3,venue:"Estadio Azteca, Mexico City"},
  {id:"g9b",group:"C",home:"Honduras",away:"Morocco",matchday:3,venue:"BMO Field, Toronto"},
  // Group D
  {id:"g10a",group:"D",home:"Germany",away:"Japan",matchday:1,venue:"MetLife Stadium, NY"},
  {id:"g10b",group:"D",home:"Peru",away:"Saudi Arabia",matchday:1,venue:"Hard Rock Stadium, Miami"},
  {id:"g11a",group:"D",home:"Germany",away:"Peru",matchday:2,venue:"MetLife Stadium, NY"},
  {id:"g11b",group:"D",home:"Saudi Arabia",away:"Japan",matchday:2,venue:"Hard Rock Stadium, Miami"},
  {id:"g12a",group:"D",home:"Saudi Arabia",away:"Germany",matchday:3,venue:"Hard Rock Stadium, Miami"},
  {id:"g12b",group:"D",home:"Japan",away:"Peru",matchday:3,venue:"MetLife Stadium, NY"},
  // Group E
  {id:"g13a",group:"E",home:"Spain",away:"Senegal",matchday:1,venue:"AT&T Stadium, Dallas"},
  {id:"g13b",group:"E",home:"Costa Rica",away:"Serbia",matchday:1,venue:"Gillette Stadium, Boston"},
  {id:"g14a",group:"E",home:"Spain",away:"Costa Rica",matchday:2,venue:"AT&T Stadium, Dallas"},
  {id:"g14b",group:"E",home:"Serbia",away:"Senegal",matchday:2,venue:"Gillette Stadium, Boston"},
  {id:"g15a",group:"E",home:"Serbia",away:"Spain",matchday:3,venue:"Gillette Stadium, Boston"},
  {id:"g15b",group:"E",home:"Senegal",away:"Costa Rica",matchday:3,venue:"AT&T Stadium, Dallas"},
  // Group F
  {id:"g16a",group:"F",home:"France",away:"Argentina",matchday:1,venue:"AT&T Stadium, Dallas"},
  {id:"g16b",group:"F",home:"Nigeria",away:"Australia",matchday:1,venue:"SoFi Stadium, LA"},
  {id:"g17a",group:"F",home:"France",away:"Nigeria",matchday:2,venue:"AT&T Stadium, Dallas"},
  {id:"g17b",group:"F",home:"Australia",away:"Argentina",matchday:2,venue:"SoFi Stadium, LA"},
  {id:"g18a",group:"F",home:"Australia",away:"France",matchday:3,venue:"SoFi Stadium, LA"},
  {id:"g18b",group:"F",home:"Argentina",away:"Nigeria",matchday:3,venue:"AT&T Stadium, Dallas"},
  // Group G
  {id:"g19a",group:"G",home:"England",away:"Netherlands",matchday:1,venue:"MetLife Stadium, NY"},
  {id:"g19b",group:"G",home:"Algeria",away:"DR Congo",matchday:1,venue:"Gillette Stadium, Boston"},
  {id:"g20a",group:"G",home:"England",away:"Algeria",matchday:2,venue:"MetLife Stadium, NY"},
  {id:"g20b",group:"G",home:"DR Congo",away:"Netherlands",matchday:2,venue:"Gillette Stadium, Boston"},
  {id:"g21a",group:"G",home:"DR Congo",away:"England",matchday:3,venue:"Gillette Stadium, Boston"},
  {id:"g21b",group:"G",home:"Netherlands",away:"Algeria",matchday:3,venue:"MetLife Stadium, NY"},
  // Group H
  {id:"g22a",group:"H",home:"Brazil",away:"Colombia",matchday:1,venue:"Hard Rock Stadium, Miami"},
  {id:"g22b",group:"H",home:"Switzerland",away:"Italy",matchday:1,venue:"SoFi Stadium, LA"},
  {id:"g23a",group:"H",home:"Brazil",away:"Switzerland",matchday:2,venue:"Hard Rock Stadium, Miami"},
  {id:"g23b",group:"H",home:"Italy",away:"Colombia",matchday:2,venue:"SoFi Stadium, LA"},
  {id:"g24a",group:"H",home:"Italy",away:"Brazil",matchday:3,venue:"SoFi Stadium, LA"},
  {id:"g24b",group:"H",home:"Colombia",away:"Switzerland",matchday:3,venue:"Hard Rock Stadium, Miami"},
  // Group I
  {id:"g25a",group:"I",home:"Croatia",away:"Belgium",matchday:1,venue:"AT&T Stadium, Dallas"},
  {id:"g25b",group:"I",home:"Iran",away:"Paraguay",matchday:1,venue:"Rose Bowl, LA"},
  {id:"g26a",group:"I",home:"Croatia",away:"Iran",matchday:2,venue:"AT&T Stadium, Dallas"},
  {id:"g26b",group:"I",home:"Paraguay",away:"Belgium",matchday:2,venue:"Rose Bowl, LA"},
  {id:"g27a",group:"I",home:"Paraguay",away:"Croatia",matchday:3,venue:"Rose Bowl, LA"},
  {id:"g27b",group:"I",home:"Belgium",away:"Iran",matchday:3,venue:"AT&T Stadium, Dallas"},
  // Group J
  {id:"g28a",group:"J",home:"Poland",away:"Portugal",matchday:1,venue:"Levi's Stadium, SF"},
  {id:"g28b",group:"J",home:"New Zealand",away:"Egypt",matchday:1,venue:"Estadio Akron, Guadalajara"},
  {id:"g29a",group:"J",home:"Poland",away:"New Zealand",matchday:2,venue:"Levi's Stadium, SF"},
  {id:"g29b",group:"J",home:"Egypt",away:"Portugal",matchday:2,venue:"Estadio Akron, Guadalajara"},
  {id:"g30a",group:"J",home:"Egypt",away:"Poland",matchday:3,venue:"Estadio Akron, Guadalajara"},
  {id:"g30b",group:"J",home:"Portugal",away:"New Zealand",matchday:3,venue:"Levi's Stadium, SF"},
  // Group K
  {id:"g31a",group:"K",home:"Mexico",away:"Ecuador",matchday:1,venue:"Estadio Azteca, Mexico City"},
  {id:"g31b",group:"K",home:"Cameroon",away:"South Korea",matchday:1,venue:"Estadio BBVA, Monterrey"},
  {id:"g32a",group:"K",home:"Mexico",away:"Cameroon",matchday:2,venue:"Estadio Azteca, Mexico City"},
  {id:"g32b",group:"K",home:"South Korea",away:"Ecuador",matchday:2,venue:"Estadio BBVA, Monterrey"},
  {id:"g33a",group:"K",home:"South Korea",away:"Mexico",matchday:3,venue:"Estadio BBVA, Monterrey"},
  {id:"g33b",group:"K",home:"Ecuador",away:"Cameroon",matchday:3,venue:"Estadio Azteca, Mexico City"},
  // Group L
  {id:"g34a",group:"L",home:"USA",away:"Bolivia",matchday:1,venue:"SoFi Stadium, LA"},
  {id:"g34b",group:"L",home:"Jamaica",away:"Uruguay",matchday:1,venue:"MetLife Stadium, NY"},
  {id:"g35a",group:"L",home:"USA",away:"Jamaica",matchday:2,venue:"SoFi Stadium, LA"},
  {id:"g35b",group:"L",home:"Uruguay",away:"Bolivia",matchday:2,venue:"MetLife Stadium, NY"},
  {id:"g36a",group:"L",home:"Uruguay",away:"USA",matchday:3,venue:"MetLife Stadium, NY"},
  {id:"g36b",group:"L",home:"Bolivia",away:"Jamaica",matchday:3,venue:"SoFi Stadium, LA"},
];

export const ROUND_ORDER = ["R32","R16","QF","SF","3rd","F"];
export const ROUND_NAME = {R32:"Round of 32",R16:"Round of 16",QF:"Quarter-finals",SF:"Semi-finals","3rd":"3rd Place Play-off",F:"Final"};

// Knockout slots — bracket structure
export const KO_MATCHES = [
  // Round of 32
  {id:"m1",round:"R32",h:"1A",a:"3DEF",venue:"MetLife Stadium, NY"},
  {id:"m2",round:"R32",h:"1B",a:"3ADEF",venue:"SoFi Stadium, LA"},
  {id:"m3",round:"R32",h:"1C",a:"3ABEF",venue:"AT&T Stadium, Dallas"},
  {id:"m4",round:"R32",h:"1D",a:"3ABCF",venue:"Hard Rock Stadium, Miami"},
  {id:"m5",round:"R32",h:"1E",a:"3ABCG",venue:"Gillette Stadium, Boston"},
  {id:"m6",round:"R32",h:"1F",a:"3BCGH",venue:"Rose Bowl, LA"},
  {id:"m7",round:"R32",h:"1G",a:"3CDGH",venue:"Levi's Stadium, SF"},
  {id:"m8",round:"R32",h:"1H",a:"3EFGH",venue:"Estadio Azteca, Mexico City"},
  {id:"m9",round:"R32",h:"2A",a:"2C",venue:"BMO Field, Toronto"},
  {id:"m10",round:"R32",h:"2B",a:"2D",venue:"Estadio Akron, Guadalajara"},
  {id:"m11",round:"R32",h:"2E",a:"2G",venue:"Estadio BBVA, Monterrey"},
  {id:"m12",round:"R32",h:"2F",a:"2H",venue:"MetLife Stadium, NY"},
  {id:"m13",round:"R32",h:"1I",a:"3JKL",venue:"SoFi Stadium, LA"},
  {id:"m14",round:"R32",h:"1J",a:"3IKL",venue:"AT&T Stadium, Dallas"},
  {id:"m15",round:"R32",h:"1K",a:"3IJL",venue:"Hard Rock Stadium, Miami"},
  {id:"m16",round:"R32",h:"1L",a:"3IJK",venue:"Levi's Stadium, SF"},
  // Round of 16
  {id:"m17",round:"R16",h:"W1",a:"W2",venue:"MetLife Stadium, NY"},
  {id:"m18",round:"R16",h:"W3",a:"W4",venue:"SoFi Stadium, LA"},
  {id:"m19",round:"R16",h:"W5",a:"W6",venue:"AT&T Stadium, Dallas"},
  {id:"m20",round:"R16",h:"W7",a:"W8",venue:"Hard Rock Stadium, Miami"},
  {id:"m21",round:"R16",h:"W9",a:"W10",venue:"Gillette Stadium, Boston"},
  {id:"m22",round:"R16",h:"W11",a:"W12",venue:"Rose Bowl, LA"},
  {id:"m23",round:"R16",h:"W13",a:"W14",venue:"Levi's Stadium, SF"},
  {id:"m24",round:"R16",h:"W15",a:"W16",venue:"Estadio Azteca, Mexico City"},
  // Quarter-finals
  {id:"m25",round:"QF",h:"W17",a:"W18",venue:"MetLife Stadium, NY"},
  {id:"m26",round:"QF",h:"W19",a:"W20",venue:"SoFi Stadium, LA"},
  {id:"m27",round:"QF",h:"W21",a:"W22",venue:"AT&T Stadium, Dallas"},
  {id:"m28",round:"QF",h:"W23",a:"W24",venue:"Hard Rock Stadium, Miami"},
  // Semi-finals
  {id:"m29",round:"SF",h:"W25",a:"W26",venue:"MetLife Stadium, NY"},
  {id:"m30",round:"SF",h:"W27",a:"W28",venue:"SoFi Stadium, LA"},
  // 3rd Place
  {id:"m31",round:"3rd",h:"L29",a:"L30",venue:"Hard Rock Stadium, Miami"},
  // Final
  {id:"m32",round:"F",h:"W29",a:"W30",venue:"MetLife Stadium, NY"},
];

// Default kick-off times in UTC (ms) — first match June 12 2026 19:00 UTC
export const DEFAULT_KICKOFFS = {
  // Group A — June 12-22
  "g1a": 1749758400000, // Jun 12 20:00 UTC
  "g1b": 1749772800000, // Jun 12 24:00 UTC
  "g2a": 1750276800000, // Jun 18 20:00 UTC
  "g2b": 1750291200000, // Jun 18 24:00 UTC
  "g3a": 1750881600000, // Jun 25 20:00 UTC
  "g3b": 1750881600000,
  // Group B
  "g4a": 1749686400000, // Jun 12 00:00 UTC (first match)
  "g4b": 1749700800000,
  "g5a": 1750190400000,
  "g5b": 1750204800000,
  "g6a": 1750795200000,
  "g6b": 1750795200000,
  // Group C
  "g7a": 1749772800000,
  "g7b": 1749787200000,
  "g8a": 1750276800000,
  "g8b": 1750291200000,
  "g9a": 1750881600000,
  "g9b": 1750881600000,
  // Group D
  "g10a": 1749859200000,
  "g10b": 1749873600000,
  "g11a": 1750363200000,
  "g11b": 1750377600000,
  "g12a": 1750968000000,
  "g12b": 1750968000000,
  // Group E
  "g13a": 1749945600000,
  "g13b": 1749960000000,
  "g14a": 1750449600000,
  "g14b": 1750464000000,
  "g15a": 1751054400000,
  "g15b": 1751054400000,
  // Group F
  "g16a": 1750032000000,
  "g16b": 1750046400000,
  "g17a": 1750536000000,
  "g17b": 1750550400000,
  "g18a": 1751140800000,
  "g18b": 1751140800000,
  // Group G
  "g19a": 1750118400000,
  "g19b": 1750132800000,
  "g20a": 1750622400000,
  "g20b": 1750636800000,
  "g21a": 1751227200000,
  "g21b": 1751227200000,
  // Group H
  "g22a": 1750204800000,
  "g22b": 1750219200000,
  "g23a": 1750708800000,
  "g23b": 1750723200000,
  "g24a": 1751313600000,
  "g24b": 1751313600000,
  // Group I
  "g25a": 1750291200000,
  "g25b": 1750305600000,
  "g26a": 1750795200000,
  "g26b": 1750809600000,
  "g27a": 1751400000000,
  "g27b": 1751400000000,
  // Group J
  "g28a": 1750377600000,
  "g28b": 1750392000000,
  "g29a": 1750881600000,
  "g29b": 1750896000000,
  "g30a": 1751486400000,
  "g30b": 1751486400000,
  // Group K
  "g31a": 1750464000000,
  "g31b": 1750478400000,
  "g32a": 1750968000000,
  "g32b": 1750982400000,
  "g33a": 1751572800000,
  "g33b": 1751572800000,
  // Group L
  "g34a": 1750550400000,
  "g34b": 1750564800000,
  "g35a": 1751054400000,
  "g35b": 1751068800000,
  "g36a": 1751659200000,
  "g36b": 1751659200000,
};

// Default predictor settings
export const DEFAULT_PRED_SETTINGS = {
  g1: 3, g2: 2, third: 2,
  r32: 1, r16: 3, qf: 5, sf: 8,
  third_place: 5, champ: 12, award: 5,
};

export const DEFAULT_SETTINGS = {
  exact: 5, gd: 3, result: 1,
};

// ---- Scoring helpers ----
export function scoreTip(pred, official, settings) {
  const s = settings || DEFAULT_SETTINGS;
  if (!official || official.homeScore == null || official.awayScore == null) return null;
  if (pred == null || pred.homeScore == null || pred.awayScore == null) return { pts: 0, tier: "miss" };
  const ph = +pred.homeScore, pa = +pred.awayScore;
  const oh = +official.homeScore, oa = +official.awayScore;
  if (ph === oh && pa === oa) return { pts: +s.exact || 5, tier: "exact" };
  const pdiff = ph - pa, odiff = oh - oa;
  const pwin = ph > pa ? "h" : ph < pa ? "a" : "d";
  const owin = oh > oa ? "h" : oh < oa ? "a" : "d";
  if (pdiff === odiff && pwin === owin) return { pts: +s.gd || 3, tier: "gd" };
  if (pwin === owin) return { pts: +s.result || 1, tier: "result" };
  return { pts: 0, tier: "miss" };
}

export function groupMatches(group) {
  return GROUP_MATCHES.filter(m => m.group === group);
}