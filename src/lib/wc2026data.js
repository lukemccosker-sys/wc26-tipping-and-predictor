// =============================================
// FIFA WORLD CUP 2026 — Full fixture data
// Source: Official schedule, times in Sydney (AEST UTC+10)
// UTC = Sydney time - 10 hours
// =============================================

export const ADMIN_NAME = "Luke McCosker";

// Groups derived from the official schedule fixtures
export const WC_GROUPS = {
  A: ["Mexico","South Korea","South Africa","Czechia"],
  B: ["Canada","Qatar","Switzerland","Bosnia & Herz."],
  C: ["Brazil","Scotland","Morocco","Haiti"],
  D: ["USA","Australia","Türkiye","Paraguay"],
  E: ["Germany","Côte d'Ivoire","Ecuador","Curaçao"],
  F: ["Netherlands","Sweden","Japan","Tunisia"],
  G: ["Belgium","Iran","Egypt","New Zealand"],
  H: ["Spain","Saudi Arabia","Uruguay","Cabo Verde"],
  I: ["France","Norway","Senegal","Iraq"],
  J: ["Argentina","Austria","Algeria","Jordan"],
  K: ["Portugal","Colombia","Uzbekistan","DR Congo"],
  L: ["England","Ghana","Croatia","Panama"],
};

export const GL = ["A","B","C","D","E","F","G","H","I","J","K","L"];

// Group stage matches — 6 per group × 12 groups = 72 total
// IDs match the schedule: GA0, GA1, GA2, ... etc (lowercased)
export const GROUP_MATCHES = [
  // Group A
  {id:"GA0",group:"A",home:"Mexico",away:"South Africa",matchday:1,venue:""},
  {id:"GA1",group:"A",home:"South Korea",away:"Czechia",matchday:1,venue:""},
  {id:"GA2",group:"A",home:"Czechia",away:"South Africa",matchday:2,venue:""},
  {id:"GA3",group:"A",home:"Mexico",away:"South Korea",matchday:2,venue:""},
  {id:"GA4",group:"A",home:"Czechia",away:"Mexico",matchday:3,venue:""},
  {id:"GA5",group:"A",home:"South Africa",away:"South Korea",matchday:3,venue:""},
  // Group B
  {id:"GB0",group:"B",home:"Canada",away:"Bosnia & Herz.",matchday:1,venue:""},
  {id:"GB1",group:"B",home:"Qatar",away:"Switzerland",matchday:1,venue:""},
  {id:"GB2",group:"B",home:"Switzerland",away:"Bosnia & Herz.",matchday:2,venue:""},
  {id:"GB3",group:"B",home:"Canada",away:"Qatar",matchday:2,venue:""},
  {id:"GB4",group:"B",home:"Switzerland",away:"Canada",matchday:3,venue:""},
  {id:"GB5",group:"B",home:"Bosnia & Herz.",away:"Qatar",matchday:3,venue:""},
  // Group C
  {id:"GC0",group:"C",home:"Brazil",away:"Morocco",matchday:1,venue:""},
  {id:"GC1",group:"C",home:"Haiti",away:"Scotland",matchday:1,venue:""},
  {id:"GC2",group:"C",home:"Scotland",away:"Morocco",matchday:2,venue:""},
  {id:"GC3",group:"C",home:"Brazil",away:"Haiti",matchday:2,venue:""},
  {id:"GC4",group:"C",home:"Scotland",away:"Brazil",matchday:3,venue:""},
  {id:"GC5",group:"C",home:"Morocco",away:"Haiti",matchday:3,venue:""},
  // Group D
  {id:"GD0",group:"D",home:"USA",away:"Paraguay",matchday:1,venue:""},
  {id:"GD1",group:"D",home:"Australia",away:"Türkiye",matchday:1,venue:""},
  {id:"GD2",group:"D",home:"USA",away:"Australia",matchday:2,venue:""},
  {id:"GD3",group:"D",home:"Türkiye",away:"Paraguay",matchday:2,venue:""},
  {id:"GD4",group:"D",home:"Türkiye",away:"USA",matchday:3,venue:""},
  {id:"GD5",group:"D",home:"Paraguay",away:"Australia",matchday:3,venue:""},
  // Group E
  {id:"GE0",group:"E",home:"Germany",away:"Curaçao",matchday:1,venue:""},
  {id:"GE1",group:"E",home:"Côte d'Ivoire",away:"Ecuador",matchday:1,venue:""},
  {id:"GE2",group:"E",home:"Germany",away:"Côte d'Ivoire",matchday:2,venue:""},
  {id:"GE3",group:"E",home:"Ecuador",away:"Curaçao",matchday:2,venue:""},
  {id:"GE4",group:"E",home:"Curaçao",away:"Côte d'Ivoire",matchday:3,venue:""},
  {id:"GE5",group:"E",home:"Ecuador",away:"Germany",matchday:3,venue:""},
  // Group F
  {id:"GF0",group:"F",home:"Netherlands",away:"Japan",matchday:1,venue:""},
  {id:"GF1",group:"F",home:"Sweden",away:"Tunisia",matchday:1,venue:""},
  {id:"GF2",group:"F",home:"Netherlands",away:"Sweden",matchday:2,venue:""},
  {id:"GF3",group:"F",home:"Tunisia",away:"Japan",matchday:2,venue:""},
  {id:"GF4",group:"F",home:"Japan",away:"Sweden",matchday:3,venue:""},
  {id:"GF5",group:"F",home:"Tunisia",away:"Netherlands",matchday:3,venue:""},
  // Group G
  {id:"GG0",group:"G",home:"Belgium",away:"Egypt",matchday:1,venue:""},
  {id:"GG1",group:"G",home:"Iran",away:"New Zealand",matchday:1,venue:""},
  {id:"GG2",group:"G",home:"Belgium",away:"Iran",matchday:2,venue:""},
  {id:"GG3",group:"G",home:"New Zealand",away:"Egypt",matchday:2,venue:""},
  {id:"GG4",group:"G",home:"Egypt",away:"Iran",matchday:3,venue:""},
  {id:"GG5",group:"G",home:"New Zealand",away:"Belgium",matchday:3,venue:""},
  // Group H
  {id:"GH0",group:"H",home:"Spain",away:"Cabo Verde",matchday:1,venue:""},
  {id:"GH1",group:"H",home:"Saudi Arabia",away:"Uruguay",matchday:1,venue:""},
  {id:"GH2",group:"H",home:"Spain",away:"Saudi Arabia",matchday:2,venue:""},
  {id:"GH3",group:"H",home:"Uruguay",away:"Cabo Verde",matchday:2,venue:""},
  {id:"GH4",group:"H",home:"Cabo Verde",away:"Saudi Arabia",matchday:3,venue:""},
  {id:"GH5",group:"H",home:"Uruguay",away:"Spain",matchday:3,venue:""},
  // Group I
  {id:"GI0",group:"I",home:"France",away:"Senegal",matchday:1,venue:""},
  {id:"GI1",group:"I",home:"Iraq",away:"Norway",matchday:1,venue:""},
  {id:"GI2",group:"I",home:"France",away:"Iraq",matchday:2,venue:""},
  {id:"GI3",group:"I",home:"Norway",away:"Senegal",matchday:2,venue:""},
  {id:"GI4",group:"I",home:"Norway",away:"France",matchday:3,venue:""},
  {id:"GI5",group:"I",home:"Senegal",away:"Iraq",matchday:3,venue:""},
  // Group J
  {id:"GJ0",group:"J",home:"Argentina",away:"Algeria",matchday:1,venue:""},
  {id:"GJ1",group:"J",home:"Austria",away:"Jordan",matchday:1,venue:""},
  {id:"GJ2",group:"J",home:"Argentina",away:"Austria",matchday:2,venue:""},
  {id:"GJ3",group:"J",home:"Jordan",away:"Algeria",matchday:2,venue:""},
  {id:"GJ4",group:"J",home:"Jordan",away:"Argentina",matchday:3,venue:""},
  {id:"GJ5",group:"J",home:"Algeria",away:"Austria",matchday:3,venue:""},
  // Group K
  {id:"GK0",group:"K",home:"Portugal",away:"DR Congo",matchday:1,venue:""},
  {id:"GK1",group:"K",home:"Uzbekistan",away:"Colombia",matchday:1,venue:""},
  {id:"GK2",group:"K",home:"Portugal",away:"Uzbekistan",matchday:2,venue:""},
  {id:"GK3",group:"K",home:"Colombia",away:"DR Congo",matchday:2,venue:""},
  {id:"GK4",group:"K",home:"Colombia",away:"Portugal",matchday:3,venue:""},
  {id:"GK5",group:"K",home:"DR Congo",away:"Uzbekistan",matchday:3,venue:""},
  // Group L
  {id:"GL0",group:"L",home:"England",away:"Croatia",matchday:1,venue:""},
  {id:"GL1",group:"L",home:"Ghana",away:"Panama",matchday:1,venue:""},
  {id:"GL2",group:"L",home:"England",away:"Ghana",matchday:2,venue:""},
  {id:"GL3",group:"L",home:"Panama",away:"Croatia",matchday:2,venue:""},
  {id:"GL4",group:"L",home:"Panama",away:"England",matchday:3,venue:""},
  {id:"GL5",group:"L",home:"Croatia",away:"Ghana",matchday:3,venue:""},
];

export const ROUND_ORDER = ["R32","R16","QF","SF","3rd","F"];
export const ROUND_NAME = {R32:"Round of 32",R16:"Round of 16",QF:"Quarter-finals",SF:"Semi-finals","3rd":"3rd Place Play-off",F:"Final"};

// Knockout matches using official match IDs from schedule (M73–M104)
export const KO_MATCHES = [
  // Round of 32
  {id:"M73",round:"R32",h:"2A",a:"2B",venue:""},
  {id:"M74",round:"R32",h:"1E",a:"3ABCDF",venue:""},
  {id:"M75",round:"R32",h:"1F",a:"2C",venue:""},
  {id:"M76",round:"R32",h:"1C",a:"2F",venue:""},
  {id:"M77",round:"R32",h:"1I",a:"3CDFGH",venue:""},
  {id:"M78",round:"R32",h:"2E",a:"2I",venue:""},
  {id:"M79",round:"R32",h:"1A",a:"3CEFHI",venue:""},
  {id:"M80",round:"R32",h:"1L",a:"3EHIJK",venue:""},
  {id:"M81",round:"R32",h:"1D",a:"3BEFIJ",venue:""},
  {id:"M82",round:"R32",h:"1G",a:"3AEHIJ",venue:""},
  {id:"M83",round:"R32",h:"2K",a:"2L",venue:""},
  {id:"M84",round:"R32",h:"1H",a:"2J",venue:""},
  {id:"M85",round:"R32",h:"1B",a:"3EFGIJ",venue:""},
  {id:"M86",round:"R32",h:"1J",a:"2H",venue:""},
  {id:"M87",round:"R32",h:"1K",a:"3DEIJL",venue:""},
  {id:"M88",round:"R32",h:"2D",a:"2G",venue:""},
  // Round of 16
  {id:"M89",round:"R16",h:"WM74",a:"WM77",venue:""},
  {id:"M90",round:"R16",h:"WM73",a:"WM75",venue:""},
  {id:"M91",round:"R16",h:"WM76",a:"WM78",venue:""},
  {id:"M92",round:"R16",h:"WM79",a:"WM80",venue:""},
  {id:"M93",round:"R16",h:"WM83",a:"WM84",venue:""},
  {id:"M94",round:"R16",h:"WM81",a:"WM82",venue:""},
  {id:"M95",round:"R16",h:"WM86",a:"WM88",venue:""},
  {id:"M96",round:"R16",h:"WM85",a:"WM87",venue:""},
  // Quarter-finals
  {id:"M97",round:"QF",h:"WM89",a:"WM90",venue:""},
  {id:"M98",round:"QF",h:"WM93",a:"WM94",venue:""},
  {id:"M99",round:"QF",h:"WM91",a:"WM92",venue:""},
  {id:"M100",round:"QF",h:"WM95",a:"WM96",venue:""},
  // Semi-finals
  {id:"M101",round:"SF",h:"WM97",a:"WM98",venue:""},
  {id:"M102",round:"SF",h:"WM99",a:"WM100",venue:""},
  // 3rd Place
  {id:"M103",round:"3rd",h:"LM101",a:"LM102",venue:""},
  // Final
  {id:"M104",round:"F",h:"WM101",a:"WM102",venue:""},
];

// ── Kickoff times ──────────────────────────────────────────────
// Sydney times from schedule converted to UTC (Sydney = UTC+10, so UTC = Sydney - 10h)
// Format: new Date("YYYY-MM-DDTHH:MM:00+10:00").getTime()

export const DEFAULT_KICKOFFS = {
  // ── Group Stage ─────────────────────────────────────────────
  // Match 1: GA0  Fri 12 Jun  05:00 Sydney → Thu 11 Jun 19:00 UTC
  "GA0":  new Date("2026-06-12T05:00:00+10:00").getTime(),
  // Match 2: GA1  Fri 12 Jun  12:00 Sydney
  "GA1":  new Date("2026-06-12T12:00:00+10:00").getTime(),
  // Match 3: GB0  Sat 13 Jun  05:00 Sydney
  "GB0":  new Date("2026-06-13T05:00:00+10:00").getTime(),
  // Match 4: GD0  Sat 13 Jun  11:00 Sydney
  "GD0":  new Date("2026-06-13T11:00:00+10:00").getTime(),
  // Match 5: GB1  Sun 14 Jun  05:00 Sydney
  "GB1":  new Date("2026-06-14T05:00:00+10:00").getTime(),
  // Match 6: GC0  Sun 14 Jun  08:00 Sydney
  "GC0":  new Date("2026-06-14T08:00:00+10:00").getTime(),
  // Match 7: GC1  Sun 14 Jun  11:00 Sydney
  "GC1":  new Date("2026-06-14T11:00:00+10:00").getTime(),
  // Match 8: GD1  Sun 14 Jun  14:00 Sydney
  "GD1":  new Date("2026-06-14T14:00:00+10:00").getTime(),
  // Match 9: GE0  Mon 15 Jun  03:00 Sydney
  "GE0":  new Date("2026-06-15T03:00:00+10:00").getTime(),
  // Match 10: GF0  Mon 15 Jun  06:00 Sydney
  "GF0":  new Date("2026-06-15T06:00:00+10:00").getTime(),
  // Match 11: GE1  Mon 15 Jun  09:00 Sydney
  "GE1":  new Date("2026-06-15T09:00:00+10:00").getTime(),
  // Match 12: GF1  Mon 15 Jun  12:00 Sydney
  "GF1":  new Date("2026-06-15T12:00:00+10:00").getTime(),
  // Match 13: GH0  Tue 16 Jun  02:00 Sydney
  "GH0":  new Date("2026-06-16T02:00:00+10:00").getTime(),
  // Match 14: GG0  Tue 16 Jun  05:00 Sydney
  "GG0":  new Date("2026-06-16T05:00:00+10:00").getTime(),
  // Match 15: GH1  Tue 16 Jun  08:00 Sydney
  "GH1":  new Date("2026-06-16T08:00:00+10:00").getTime(),
  // Match 16: GG1  Tue 16 Jun  11:00 Sydney
  "GG1":  new Date("2026-06-16T11:00:00+10:00").getTime(),
  // Match 17: GI0  Wed 17 Jun  05:00 Sydney
  "GI0":  new Date("2026-06-17T05:00:00+10:00").getTime(),
  // Match 18: GI1  Wed 17 Jun  08:00 Sydney
  "GI1":  new Date("2026-06-17T08:00:00+10:00").getTime(),
  // Match 19: GJ0  Wed 17 Jun  11:00 Sydney
  "GJ0":  new Date("2026-06-17T11:00:00+10:00").getTime(),
  // Match 20: GJ1  Wed 17 Jun  14:00 Sydney
  "GJ1":  new Date("2026-06-17T14:00:00+10:00").getTime(),
  // Match 21: GK0  Thu 18 Jun  03:00 Sydney
  "GK0":  new Date("2026-06-18T03:00:00+10:00").getTime(),
  // Match 22: GL0  Thu 18 Jun  06:00 Sydney
  "GL0":  new Date("2026-06-18T06:00:00+10:00").getTime(),
  // Match 23: GL1  Thu 18 Jun  09:00 Sydney
  "GL1":  new Date("2026-06-18T09:00:00+10:00").getTime(),
  // Match 24: GK1  Thu 18 Jun  12:00 Sydney
  "GK1":  new Date("2026-06-18T12:00:00+10:00").getTime(),
  // Match 25: GA2  Fri 19 Jun  02:00 Sydney
  "GA2":  new Date("2026-06-19T02:00:00+10:00").getTime(),
  // Match 26: GB2  Fri 19 Jun  05:00 Sydney
  "GB2":  new Date("2026-06-19T05:00:00+10:00").getTime(),
  // Match 27: GB3  Fri 19 Jun  08:00 Sydney
  "GB3":  new Date("2026-06-19T08:00:00+10:00").getTime(),
  // Match 28: GA3  Fri 19 Jun  11:00 Sydney
  "GA3":  new Date("2026-06-19T11:00:00+10:00").getTime(),
  // Match 29: GD2  Sat 20 Jun  05:00 Sydney
  "GD2":  new Date("2026-06-20T05:00:00+10:00").getTime(),
  // Match 30: GC2  Sat 20 Jun  08:00 Sydney
  "GC2":  new Date("2026-06-20T08:00:00+10:00").getTime(),
  // Match 31: GC3  Sat 20 Jun  10:30 Sydney
  "GC3":  new Date("2026-06-20T10:30:00+10:00").getTime(),
  // Match 32: GD3  Sat 20 Jun  13:00 Sydney
  "GD3":  new Date("2026-06-20T13:00:00+10:00").getTime(),
  // Match 33: GF2  Sun 21 Jun  03:00 Sydney
  "GF2":  new Date("2026-06-21T03:00:00+10:00").getTime(),
  // Match 34: GE2  Sun 21 Jun  06:00 Sydney
  "GE2":  new Date("2026-06-21T06:00:00+10:00").getTime(),
  // Match 35: GE3  Sun 21 Jun  10:00 Sydney
  "GE3":  new Date("2026-06-21T10:00:00+10:00").getTime(),
  // Match 36: GF3  Sun 21 Jun  14:00 Sydney
  "GF3":  new Date("2026-06-21T14:00:00+10:00").getTime(),
  // Match 37: GH2  Mon 22 Jun  02:00 Sydney
  "GH2":  new Date("2026-06-22T02:00:00+10:00").getTime(),
  // Match 38: GG2  Mon 22 Jun  05:00 Sydney
  "GG2":  new Date("2026-06-22T05:00:00+10:00").getTime(),
  // Match 39: GH3  Mon 22 Jun  08:00 Sydney
  "GH3":  new Date("2026-06-22T08:00:00+10:00").getTime(),
  // Match 40: GG3  Mon 22 Jun  11:00 Sydney
  "GG3":  new Date("2026-06-22T11:00:00+10:00").getTime(),
  // Match 41: GJ2  Tue 23 Jun  03:00 Sydney
  "GJ2":  new Date("2026-06-23T03:00:00+10:00").getTime(),
  // Match 42: GI2  Tue 23 Jun  07:00 Sydney
  "GI2":  new Date("2026-06-23T07:00:00+10:00").getTime(),
  // Match 43: GI3  Tue 23 Jun  10:00 Sydney
  "GI3":  new Date("2026-06-23T10:00:00+10:00").getTime(),
  // Match 44: GJ3  Tue 23 Jun  13:00 Sydney
  "GJ3":  new Date("2026-06-23T13:00:00+10:00").getTime(),
  // Match 45: GK2  Wed 24 Jun  03:00 Sydney
  "GK2":  new Date("2026-06-24T03:00:00+10:00").getTime(),
  // Match 46: GL2  Wed 24 Jun  06:00 Sydney
  "GL2":  new Date("2026-06-24T06:00:00+10:00").getTime(),
  // Match 47: GL3  Wed 24 Jun  09:00 Sydney
  "GL3":  new Date("2026-06-24T09:00:00+10:00").getTime(),
  // Match 48: GK3  Wed 24 Jun  12:00 Sydney
  "GK3":  new Date("2026-06-24T12:00:00+10:00").getTime(),
  // Match 49: GB4  Thu 25 Jun  05:00 Sydney
  "GB4":  new Date("2026-06-25T05:00:00+10:00").getTime(),
  // Match 50: GB5  Thu 25 Jun  05:00 Sydney (simultaneous)
  "GB5":  new Date("2026-06-25T05:00:00+10:00").getTime(),
  // Match 51: GC4  Thu 25 Jun  08:00 Sydney
  "GC4":  new Date("2026-06-25T08:00:00+10:00").getTime(),
  // Match 52: GC5  Thu 25 Jun  08:00 Sydney (simultaneous)
  "GC5":  new Date("2026-06-25T08:00:00+10:00").getTime(),
  // Match 53: GA4  Thu 25 Jun  11:00 Sydney
  "GA4":  new Date("2026-06-25T11:00:00+10:00").getTime(),
  // Match 54: GA5  Thu 25 Jun  11:00 Sydney (simultaneous)
  "GA5":  new Date("2026-06-25T11:00:00+10:00").getTime(),
  // Match 55: GE4  Fri 26 Jun  06:00 Sydney
  "GE4":  new Date("2026-06-26T06:00:00+10:00").getTime(),
  // Match 56: GE5  Fri 26 Jun  06:00 Sydney (simultaneous)
  "GE5":  new Date("2026-06-26T06:00:00+10:00").getTime(),
  // Match 57: GF4  Fri 26 Jun  09:00 Sydney
  "GF4":  new Date("2026-06-26T09:00:00+10:00").getTime(),
  // Match 58: GF5  Fri 26 Jun  09:00 Sydney (simultaneous)
  "GF5":  new Date("2026-06-26T09:00:00+10:00").getTime(),
  // Match 59: GD4  Fri 26 Jun  12:00 Sydney
  "GD4":  new Date("2026-06-26T12:00:00+10:00").getTime(),
  // Match 60: GD5  Fri 26 Jun  12:00 Sydney (simultaneous)
  "GD5":  new Date("2026-06-26T12:00:00+10:00").getTime(),
  // Match 61: GI4  Sat 27 Jun  05:00 Sydney
  "GI4":  new Date("2026-06-27T05:00:00+10:00").getTime(),
  // Match 62: GI5  Sat 27 Jun  05:00 Sydney (simultaneous)
  "GI5":  new Date("2026-06-27T05:00:00+10:00").getTime(),
  // Match 63: GH4  Sat 27 Jun  10:00 Sydney
  "GH4":  new Date("2026-06-27T10:00:00+10:00").getTime(),
  // Match 64: GH5  Sat 27 Jun  10:00 Sydney (simultaneous)
  "GH5":  new Date("2026-06-27T10:00:00+10:00").getTime(),
  // Match 65: GG4  Sat 27 Jun  13:00 Sydney
  "GG4":  new Date("2026-06-27T13:00:00+10:00").getTime(),
  // Match 66: GG5  Sat 27 Jun  13:00 Sydney (simultaneous)
  "GG5":  new Date("2026-06-27T13:00:00+10:00").getTime(),
  // Match 67: GL4  Sun 28 Jun  07:00 Sydney
  "GL4":  new Date("2026-06-28T07:00:00+10:00").getTime(),
  // Match 68: GL5  Sun 28 Jun  07:00 Sydney (simultaneous)
  "GL5":  new Date("2026-06-28T07:00:00+10:00").getTime(),
  // Match 69: GK4  Sun 28 Jun  09:30 Sydney
  "GK4":  new Date("2026-06-28T09:30:00+10:00").getTime(),
  // Match 70: GK5  Sun 28 Jun  09:30 Sydney (simultaneous)
  "GK5":  new Date("2026-06-28T09:30:00+10:00").getTime(),
  // Match 71: GJ4  Sun 28 Jun  12:00 Sydney
  "GJ4":  new Date("2026-06-28T12:00:00+10:00").getTime(),
  // Match 72: GJ5  Sun 28 Jun  12:00 Sydney (simultaneous)
  "GJ5":  new Date("2026-06-28T12:00:00+10:00").getTime(),

  // ── Knockouts ───────────────────────────────────────────────
  // M73  Mon 29 Jun  05:00 Sydney
  "M73":  new Date("2026-06-29T05:00:00+10:00").getTime(),
  // M76  Tue 30 Jun  03:00 Sydney
  "M76":  new Date("2026-06-30T03:00:00+10:00").getTime(),
  // M74  Tue 30 Jun  06:30 Sydney
  "M74":  new Date("2026-06-30T06:30:00+10:00").getTime(),
  // M75  Tue 30 Jun  11:00 Sydney
  "M75":  new Date("2026-06-30T11:00:00+10:00").getTime(),
  // M78  Wed 01 Jul  03:00 Sydney
  "M78":  new Date("2026-07-01T03:00:00+10:00").getTime(),
  // M77  Wed 01 Jul  07:00 Sydney
  "M77":  new Date("2026-07-01T07:00:00+10:00").getTime(),
  // M79  Wed 01 Jul  11:00 Sydney
  "M79":  new Date("2026-07-01T11:00:00+10:00").getTime(),
  // M80  Thu 02 Jul  02:00 Sydney
  "M80":  new Date("2026-07-02T02:00:00+10:00").getTime(),
  // M82  Thu 02 Jul  06:00 Sydney
  "M82":  new Date("2026-07-02T06:00:00+10:00").getTime(),
  // M81  Thu 02 Jul  10:00 Sydney
  "M81":  new Date("2026-07-02T10:00:00+10:00").getTime(),
  // M84  Fri 03 Jul  05:00 Sydney
  "M84":  new Date("2026-07-03T05:00:00+10:00").getTime(),
  // M83  Fri 03 Jul  09:00 Sydney
  "M83":  new Date("2026-07-03T09:00:00+10:00").getTime(),
  // M85  Fri 03 Jul  13:00 Sydney
  "M85":  new Date("2026-07-03T13:00:00+10:00").getTime(),
  // M88  Sat 04 Jul  04:00 Sydney
  "M88":  new Date("2026-07-04T04:00:00+10:00").getTime(),
  // M86  Sat 04 Jul  08:00 Sydney
  "M86":  new Date("2026-07-04T08:00:00+10:00").getTime(),
  // M87  Sat 04 Jul  11:30 Sydney
  "M87":  new Date("2026-07-04T11:30:00+10:00").getTime(),
  // M90  Sun 05 Jul  03:00 Sydney
  "M90":  new Date("2026-07-05T03:00:00+10:00").getTime(),
  // M89  Sun 05 Jul  07:00 Sydney
  "M89":  new Date("2026-07-05T07:00:00+10:00").getTime(),
  // M91  Mon 06 Jul  06:00 Sydney
  "M91":  new Date("2026-07-06T06:00:00+10:00").getTime(),
  // M92  Mon 06 Jul  10:00 Sydney
  "M92":  new Date("2026-07-06T10:00:00+10:00").getTime(),
  // M93  Tue 07 Jul  05:00 Sydney
  "M93":  new Date("2026-07-07T05:00:00+10:00").getTime(),
  // M94  Tue 07 Jul  10:00 Sydney
  "M94":  new Date("2026-07-07T10:00:00+10:00").getTime(),
  // M95  Wed 08 Jul  02:00 Sydney
  "M95":  new Date("2026-07-08T02:00:00+10:00").getTime(),
  // M96  Wed 08 Jul  06:00 Sydney
  "M96":  new Date("2026-07-08T06:00:00+10:00").getTime(),
  // M97  Fri 10 Jul  06:00 Sydney
  "M97":  new Date("2026-07-10T06:00:00+10:00").getTime(),
  // M98  Sat 11 Jul  05:00 Sydney
  "M98":  new Date("2026-07-11T05:00:00+10:00").getTime(),
  // M99  Sun 12 Jul  07:00 Sydney
  "M99":  new Date("2026-07-12T07:00:00+10:00").getTime(),
  // M100 Sun 12 Jul  11:00 Sydney
  "M100": new Date("2026-07-12T11:00:00+10:00").getTime(),
  // M101 Wed 15 Jul  05:00 Sydney
  "M101": new Date("2026-07-15T05:00:00+10:00").getTime(),
  // M102 Thu 16 Jul  05:00 Sydney
  "M102": new Date("2026-07-16T05:00:00+10:00").getTime(),
  // M103 Sun 19 Jul  07:00 Sydney
  "M103": new Date("2026-07-19T07:00:00+10:00").getTime(),
  // M104 Mon 20 Jul  05:00 Sydney
  "M104": new Date("2026-07-20T05:00:00+10:00").getTime(),
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
// penaltyWinner: "h" or "a" — set by admin for KO draws. If the prediction picked the
// team that won on penalties (i.e. pred side matches penaltyWinner), award 1 result point.
export function scoreTip(pred, official, settings) {
  const s = settings || DEFAULT_SETTINGS;
  if (!official || official.homeScore == null || official.awayScore == null) return null;
  if (pred == null || pred.homeScore == null || pred.awayScore == null) return { pts: 0, tier: "miss" };
  const ph = +pred.homeScore, pa = +pred.awayScore;
  const oh = +official.homeScore, oa = +official.awayScore;

  // Exact scoreline
  if (ph === oh && pa === oa) return { pts: +s.exact || 5, tier: "exact" };

  const pdiff = ph - pa, odiff = oh - oa;
  const pwin = ph > pa ? "h" : ph < pa ? "a" : "d";
  const owin = oh > oa ? "h" : oh < oa ? "a" : "d";

  // KO match decided by penalties (official score is a draw, penaltyWinner set)
  // Score the 90-min scoreline normally, but also award result points if the player
  // picked the team that advanced (either by predicting a draw, or by picking that side to win).
  if (owin === "d" && official.penaltyWinner) {
    const pen = official.penaltyWinner; // "h" or "a"
    // Correct scoreline (already caught exact above, check GD: same diff, both drew)
    if (pwin === "d" && pdiff === odiff) return { pts: +s.gd || 3, tier: "gd" };
    // Predicted a draw (any draw score) — correct outcome, 1 pt
    if (pwin === "d") return { pts: +s.result || 1, tier: "result" };
    // Predicted one side to win outright — award result pt if they picked the penalty winner
    if (pwin === pen) return { pts: +s.result || 1, tier: "result" };
    return { pts: 0, tier: "miss" };
  }

  if (pdiff === odiff && pwin === owin) return { pts: +s.gd || 3, tier: "gd" };
  if (pwin === owin) return { pts: +s.result || 1, tier: "result" };
  return { pts: 0, tier: "miss" };
}

export function groupMatches(group) {
  return GROUP_MATCHES.filter(m => m.group === group);
}