import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import Flag from "@/lib/flags";
import GroupCard from "@/components/tipping/GroupCard";
import KickoffView from "@/components/tipping/KickoffView";
import KOBracket from "@/components/tipping/KOBracket";
import Leaderboard from "@/components/tipping/Leaderboard";
import TipsRoom from "@/components/tipping/TipsRoom";
import PredictorGroups from "@/components/predictor/PredictorGroups";
import PredictorBracket from "@/components/predictor/PredictorBracket";
import PredictorAwards from "@/components/predictor/PredictorAwards";
import PredictorLeaderboard from "@/components/predictor/PredictorLeaderboard";
import AdminPlayerManager from "@/components/admin/AdminPlayerManager";
import KickoffEditor from "@/components/admin/KickoffEditor";
import HelpModal from "@/components/HelpModal";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import WelcomeBackBanner from "@/components/WelcomeBackBanner";
import CeremonyModal from "@/components/CeremonyModal";
import LoginPage from "./Login";
import {
  GL, WC_GROUPS, GROUP_MATCHES, KO_MATCHES, ROUND_ORDER,
  DEFAULT_KICKOFFS, DEFAULT_PRED_SETTINGS, DEFAULT_SETTINGS,
  scoreTip, ADMIN_NAME
} from "@/lib/wc2026data";
import { computePlayerScore, buildLeaderboard, buildOfficialKOTeamsFromResults, buildPredictorLeaderboard, buildCombinedLeaderboard } from "@/lib/scoring";
import CombinedLeaderboard from "@/components/CombinedLeaderboard";

// ---- CSS Styles ----
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@400;500;600;700;800&display=swap');
.wc{
  --bg:#fff7ee;--panel:#ffffff;--panel2:#fff1e2;--line:#efe3d2;--line2:#e0d2bd;
  --ink:#222a3d;--muted:#6c7384;--muted2:#9aa0ad;
  --pink:#ff3d7f;--orange:#ff7a2f;--teal:#12b3a6;--blue:#2f8bff;--purple:#7b54f0;--green:#2cb551;--gold:#ffb020;--sun:#ffce3a;
  font-family:'Manrope',system-ui,sans-serif;color:var(--ink);
  background:radial-gradient(900px 480px at 92% -8%,rgba(255,61,127,.22),transparent 60%),radial-gradient(820px 460px at 4% -4%,rgba(18,179,166,.20),transparent 58%),radial-gradient(760px 520px at 50% 116%,rgba(255,176,32,.20),transparent 60%),var(--bg);
  min-height:100vh;padding:18px clamp(12px,3vw,30px) 60px;box-sizing:border-box;overflow-x:hidden;max-width:100vw;
}
.wc *{max-width:100%;}
.wc *{box-sizing:border-box;min-width:0;}
.wc input{font-family:inherit;}
.flsvg{height:auto;aspect-ratio:3/2;border-radius:3px;box-shadow:0 0 0 1px rgba(0,0,0,.12);display:inline-block;vertical-align:middle;flex:0 0 auto;}
.fl{flex:0 0 auto;line-height:1;}
.kick{font-size:11px;letter-spacing:.26em;color:var(--teal);font-weight:800;text-transform:uppercase;}
.hdr{display:flex;flex-wrap:wrap;gap:18px;justify-content:space-between;align-items:flex-end;border-bottom:2px dashed var(--line2);padding-bottom:18px;margin-bottom:14px;}
.hdr h1{font-family:'Anton',sans-serif;font-weight:400;font-size:clamp(34px,6vw,64px);line-height:.92;margin:6px 0 4px;text-transform:uppercase;}
.hdr h1 span{color:var(--pink);}
.idtag{color:var(--muted);font-size:13px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.idtag b{color:var(--ink);}
.badge-admin{background:linear-gradient(95deg,var(--gold),var(--orange));color:#fff;font-size:10px;font-weight:800;border-radius:999px;padding:2px 9px;}
.hdr-r{display:flex;gap:16px;align-items:center;}
.ptotal{background:linear-gradient(120deg,var(--pink),var(--purple));color:#fff;border-radius:18px;padding:10px 20px;text-align:center;box-shadow:0 14px 30px -12px rgba(123,84,240,.6);transition:background .3s;}
.ptotal.pred{background:linear-gradient(120deg,var(--purple),var(--blue));}
.pt-num{font-family:'Anton',sans-serif;font-size:40px;line-height:.9;}
.pt-lab{font-size:9px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;opacity:.9;}
.hdr-meta{display:flex;flex-direction:column;gap:8px;align-items:flex-end;}
.picks{font-size:12px;color:var(--muted);font-weight:700;}
.ctrls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;}
.toggle{display:inline-flex;align-items:center;gap:8px;background:#fff;border:2px solid var(--line2);color:var(--muted);border-radius:999px;padding:5px 12px 5px 7px;font-size:12px;font-weight:800;cursor:pointer;}
.toggle .knob{width:26px;height:15px;border-radius:999px;background:var(--line2);position:relative;transition:.2s;}
.toggle .knob:after{content:"";position:absolute;top:2px;left:2px;width:11px;height:11px;border-radius:50%;background:#fff;transition:.2s;}
.toggle.on{color:#fff;background:var(--teal);border-color:var(--teal);}
.toggle.on .knob{background:rgba(255,255,255,.45);}.toggle.on .knob:after{left:13px;}
.mini{background:#fff;border:2px solid var(--line2);color:var(--ink);border-radius:999px;padding:5px 13px;font-size:12px;font-weight:800;cursor:pointer;}
.mini.danger{color:var(--pink);border-color:#ffc9dc;}
.mini.busy{opacity:.6;}.mini.wide{width:100%;margin-top:14px;}
.mini:hover{border-color:var(--ink);}
.live{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:var(--green);background:rgba(44,181,81,.12);border:1px solid rgba(44,181,81,.3);border-radius:999px;padding:4px 10px;}
.live-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:livepulse 1.8s ease-in-out infinite;}
@keyframes livepulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.35;transform:scale(.8);}}
.modal{position:fixed;inset:0;background:rgba(40,30,20,.45);display:flex;align-items:center;justify-content:center;z-index:50;padding:20px;}
.modal-c{background:var(--panel);border:1px solid var(--line2);border-radius:18px;padding:24px;max-width:360px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 30px 70px -28px rgba(0,0,0,.5);}
.modal-c.kickedit{max-width:520px;max-height:84vh;display:flex;flex-direction:column;}
.kick-toggle{display:flex;gap:6px;margin:8px 0 2px;}
.kick-toggle button{flex:1;padding:8px 10px;border-radius:10px;border:1px solid var(--line2);background:var(--panel2);color:var(--muted);font-weight:800;font-size:12.5px;cursor:pointer;font-family:inherit;}
.kick-toggle button.on{background:var(--pink);border-color:var(--pink);color:#fff;}
.kick-list{overflow-y:auto;margin:10px -6px 4px;padding:0 6px;flex:1;}
.kick-sec{font-family:'Anton',sans-serif;font-size:15px;text-transform:uppercase;letter-spacing:.04em;margin:12px 0 6px;color:var(--pink);}
.kick-grp{margin-bottom:8px;}
.kick-grp-h{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--muted2);margin:6px 0 3px;}
.kick-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid #f4ebdf;}
.kick-fix{font-size:12px;font-weight:600;display:flex;align-items:center;gap:5px;min-width:0;flex:1;}
.kick-ven{color:var(--muted2);font-weight:500;}
.kick-in{flex:0 0 auto;background:#fff;border:2px solid var(--line2);border-radius:8px;padding:5px 7px;font-size:12px;font-weight:600;color:var(--ink);font-family:inherit;}
.kickedit .role-btn{margin-top:12px;flex-shrink:0;}
.modeswitch{display:flex;gap:0;background:var(--panel2);border:1px solid var(--line2);border-radius:999px;padding:4px;margin-bottom:16px;max-width:420px;}
.modeswitch button{flex:1;border:none;background:none;border-radius:999px;padding:11px 14px;font-family:'Anton',sans-serif;font-size:16px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);cursor:pointer;transition:all .22s;}
.modeswitch button.on{color:#fff;background:linear-gradient(95deg,var(--purple),var(--blue));box-shadow:0 10px 22px -10px rgba(123,84,240,.75);}
.tabs{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap;}
.tab{background:#fff;border:2px solid var(--line2);color:var(--muted);border-radius:999px;padding:9px 18px;font-weight:800;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:inherit;}
.tab-ic{display:none;}.tab-short{display:none;}
.tab.act{background:linear-gradient(95deg,var(--pink),var(--orange));color:#fff;border-color:transparent;box-shadow:0 10px 22px -12px rgba(255,61,127,.7);}
.tab:hover:not(.act){border-color:var(--ink);color:var(--ink);}
.tab.sep{margin-left:auto;position:relative;border-color:var(--line);background:var(--panel2);}
.tab.sep::before{content:"";position:absolute;left:-14px;top:14%;height:72%;width:2px;background:var(--line);}
.tab.sep.act{background:linear-gradient(95deg,var(--blue),var(--purple));}
.groups-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:16px;}
.card{background:var(--panel);border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:0 12px 30px -20px rgba(120,70,40,.45);}
.card.pad{padding:18px;}
.card-h{display:flex;justify-content:space-between;align-items:center;padding:13px 15px;color:#fff;}
.card-h .gtitle{color:#fff;}
.gtitle{font-family:'Anton',sans-serif;font-size:20px;letter-spacing:.04em;color:var(--ink);}
.groups-grid .card:nth-child(12n+1) .card-h{background:linear-gradient(100deg,#ff3d7f,#ff6a98);}
.groups-grid .card:nth-child(12n+2) .card-h{background:linear-gradient(100deg,#ff7a2f,#ffa14d);}
.groups-grid .card:nth-child(12n+3) .card-h{background:linear-gradient(100deg,#12b3a6,#3fcabc);}
.groups-grid .card:nth-child(12n+4) .card-h{background:linear-gradient(100deg,#2f8bff,#5aa6ff);}
.groups-grid .card:nth-child(12n+5) .card-h{background:linear-gradient(100deg,#7b54f0,#9a7cf5);}
.groups-grid .card:nth-child(12n+6) .card-h{background:linear-gradient(100deg,#e8456e,#ff6f8e);}
.groups-grid .card:nth-child(12n+7) .card-h{background:linear-gradient(100deg,#f0a400,#ffc23d);}
.groups-grid .card:nth-child(12n+8) .card-h{background:linear-gradient(100deg,#19a673,#39c890);}
.groups-grid .card:nth-child(12n+9) .card-h{background:linear-gradient(100deg,#4f6dff,#6f8bff);}
.groups-grid .card:nth-child(12n+10) .card-h{background:linear-gradient(100deg,#b14ce0,#c873ee);}
.groups-grid .card:nth-child(12n+11) .card-h{background:linear-gradient(100deg,#ff5a4d,#ff8276);}
.groups-grid .card:nth-child(12n+12) .card-h{background:linear-gradient(100deg,#0fb5c4,#39ccd8);}
.fixtures{padding:8px 12px 12px;}
.gm{border-bottom:1px solid #f4ebdf;padding:3px 0;}
.gm-main{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;}
.gm-team{min-width:0;overflow:hidden;padding-right:8px;}
.gm-team.r{justify-self:stretch;text-align:right;padding-right:0;padding-left:8px;}
.gm-team.r .tname{justify-content:flex-end;}
.tname{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;}
.gm-score{display:flex;align-items:center;gap:5px;flex:0 0 auto;}
.vs{color:var(--muted2);font-size:11px;font-weight:800;}
.sin{display:inline-flex;flex-direction:column;align-items:center;gap:3px;width:44px;vertical-align:middle;}
.sin-btn{width:100%;height:26px;border:2px solid var(--line2);border-radius:8px;background:var(--panel2);color:var(--ink);font-size:18px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;font-family:inherit;}
.sin-btn.plus{color:var(--green);}.sin-btn.minus{color:var(--pink);}
.sin-btn:active{transform:scale(.92);}.sin-btn:disabled{opacity:.38;cursor:not-allowed;}
.sin-num{font-size:18px;font-weight:800;color:var(--ink);line-height:24px;min-height:24px;text-align:center;}
.sin-num.empty{color:var(--muted2);}
.sin.act .sin-btn{border-color:#9fe4dd;}.sin.act .sin-num{color:var(--teal);}
.sin.ro{flex-direction:row;justify-content:center;align-items:center;gap:0;height:auto;}
.sin.ro .sin-num{font-size:18px;font-weight:800;}
.sin.ro.act .sin-num{color:var(--teal);}
.cd-row{display:flex;align-items:center;gap:8px;padding:2px 0 5px;flex-wrap:wrap;}
.cd{font-size:10.5px;font-weight:800;border-radius:999px;padding:2px 9px;display:inline-flex;align-items:center;gap:3px;}
.cd-up{background:var(--panel2);color:var(--muted);}
.cd-today{background:rgba(47,139,255,.14);color:#1f6fd6;}
.cd-soon{background:rgba(255,176,32,.18);color:#a86a00;}
.cd-now{background:var(--pink);color:#fff;animation:cdpulse 1.2s ease-in-out infinite;}
.cd-closed{background:#efe7da;color:var(--muted2);}
.cd-tbc{background:transparent;color:var(--muted2);border:1px dashed var(--line2);}
.kick-when{font-size:10.5px;font-weight:700;color:var(--muted);margin-right:auto;}
.tip-saved{font-size:10px;font-weight:800;color:var(--green);text-transform:uppercase;letter-spacing:.04em;}
@keyframes cdpulse{0%,100%{opacity:1;}50%{opacity:.55;}}
@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-16px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
.pts-circle{flex:0 0 auto;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;}
.pts-circle.t-exact{background:var(--green);}.pts-circle.t-gd{background:var(--teal);}.pts-circle.t-result{background:var(--gold);}
.pts-circle.t-miss{background:#b9b1a3;color:#fff;}
.gm.scored{background:linear-gradient(180deg,rgba(44,181,81,.05),transparent 40%);}
.ko.scored{background:linear-gradient(180deg,rgba(44,181,81,.05),transparent 40%);}
.notice{background:rgba(18,179,166,.12);border:1px solid rgba(18,179,166,.3);color:#0c6f66;border-radius:13px;padding:11px 14px;font-size:12.5px;margin-bottom:14px;font-weight:600;}
.notice.lock{background:linear-gradient(90deg,rgba(255,176,32,.16),rgba(255,122,47,.08));border-color:var(--gold);color:#9a6800;}
.alert-red{background:#fff0f2;border:1.5px solid var(--pink);border-left:5px solid var(--pink);color:#b81d4a;border-radius:12px;padding:11px 14px;font-size:13px;font-weight:600;line-height:1.5;margin-bottom:12px;}
.nudge-go{background:linear-gradient(95deg,rgba(44,181,81,.16),rgba(18,179,166,.08));border:1.5px solid var(--green);border-radius:12px;padding:12px 15px;font-size:13.5px;font-weight:600;color:#1c7a3a;line-height:1.5;margin-bottom:14px;}
.suggest-bar{display:flex;align-items:center;gap:12px;background:linear-gradient(95deg,rgba(123,84,240,.12),rgba(47,139,255,.06));border:1.5px solid var(--purple);border-radius:12px;padding:11px 14px;margin-bottom:12px;}
.suggest-txt{font-size:13px;font-weight:600;color:#5a3fc0;line-height:1.45;flex:1;}
.suggest-txt b{font-weight:800;color:#4a2fb0;}
.suggest-btn{flex:0 0 auto;background:linear-gradient(120deg,var(--purple),var(--blue));color:#fff;border:none;border-radius:999px;padding:9px 16px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;}
.round-nav{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
.rn-arrow{flex:0 0 auto;width:40px;height:40px;border-radius:12px;background:#fff;border:2px solid var(--line2);color:var(--ink);font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;}
.rn-arrow:disabled{opacity:.35;cursor:not-allowed;}
.rn-chips{flex:1;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;}
.rn-chip{background:#fff;border:2px solid var(--line2);color:var(--muted);border-radius:999px;padding:7px 14px;font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit;}
.rn-chip.on{color:#fff;border-color:transparent;}
.rn-chip.on.rc-R32{background:#ff3d7f;}.rn-chip.on.rc-R16{background:#ff7a2f;}.rn-chip.on.rc-QF{background:#12b3a6;}
.rn-chip.on.rc-SF{background:#2f8bff;}.rn-chip.on.rc-3rd{background:#f0a400;}.rn-chip.on.rc-F{background:#7b54f0;}
.rn-head{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:12px;margin-bottom:12px;color:#fff;}
.rn-head.rc-R32{background:linear-gradient(100deg,#ff3d7f,#ff6a98);}.rn-head.rc-R16{background:linear-gradient(100deg,#ff7a2f,#ffa14d);}
.rn-head.rc-QF{background:linear-gradient(100deg,#12b3a6,#3fcabc);}.rn-head.rc-SF{background:linear-gradient(100deg,#2f8bff,#5aa6ff);}
.rn-head.rc-3rd{background:linear-gradient(100deg,#f0a400,#ffc23d);}.rn-head.rc-F{background:linear-gradient(100deg,#7b54f0,#9a7cf5);}
.rn-name{font-family:'Anton',sans-serif;font-size:18px;letter-spacing:.04em;text-transform:uppercase;}
.rn-count{font-size:11px;font-weight:800;opacity:.85;text-transform:uppercase;letter-spacing:.06em;}
.ko-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(232px,1fr));gap:10px;align-items:start;}
.ko-grid .ko.final,.ko-grid .ko.bronze{grid-column:1/-1;max-width:420px;margin:0 auto;}
.ko{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:8px 9px;}
.ko.final{border:2px solid var(--gold);box-shadow:0 0 0 4px rgba(255,176,32,.18);}
.ko.bronze{border-color:#f0cf8f;}
.ko.pending{opacity:.92;}
.ko-pending{font-size:10.5px;font-weight:800;color:var(--muted2);text-align:center;padding:5px 0 2px;}
.ko-h{display:flex;justify-content:space-between;font-size:9px;color:var(--muted2);font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px;align-items:center;}
.ko-row{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:3px 4px;border-radius:8px;}
.ko-row.win{background:rgba(44,181,81,.15);}
.ko-team{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;min-width:0;flex:1;}
.ko-team>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.ko-ph{color:var(--muted2);font-size:10.5px;font-weight:600;}
.ko .sin{width:40px;flex:0 0 auto;}.ko .sin-btn{height:24px;font-size:16px;}.ko .sin-num{font-size:16px;}
.ko-osc{font-family:'Anton',sans-serif;font-size:16px;color:var(--ink);min-width:22px;text-align:center;}
.ko-v{color:var(--muted2);}
.pen-row{display:flex;flex-direction:column;gap:6px;width:100%;margin-top:6px;padding-top:8px;border-top:1px dashed var(--line);}
.pen-row.off{margin-top:4px;}
.pen-lbl{font-size:11.5px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.03em;}
.pen-btns{display:flex;gap:8px;flex-wrap:wrap;}
.pen-b{flex:1 1 auto;background:#fff;border:2px solid var(--line2);color:var(--ink);border-radius:10px;padding:9px 12px;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px;justify-content:center;font-family:inherit;}
.pen-b.on{background:var(--green);border-color:var(--green);color:#fff;}
.pen-b:disabled{opacity:.6;cursor:not-allowed;}
.ko-nextbar{display:flex;gap:10px;justify-content:space-between;align-items:center;margin-top:18px;flex-wrap:wrap;}
.ko-nav{flex:1 1 auto;min-width:150px;border:none;border-radius:12px;padding:14px 16px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;}
.ko-nav.prev{background:var(--panel2);color:var(--ink);border:2px solid var(--line2);flex:0 1 auto;}
.ko-nav.next{background:linear-gradient(95deg,var(--pink),var(--purple));color:#fff;}
.board{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;}
.muted2{color:var(--muted);font-size:12px;margin:4px 0 10px;}
.lb-head{display:flex;justify-content:space-between;align-items:center;}
.tbl{width:100%;border-collapse:collapse;font-size:12.5px;}
.tbl th{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted2);font-weight:800;padding:8px 6px;text-align:center;border-top:1px solid var(--line);background:var(--panel2);}
.tbl td{padding:7px 6px;text-align:center;border-top:1px solid #f4ebdf;}
.tbl .tl{text-align:left;}.tbl td.tl{font-weight:600;}
.tlteam{display:inline-flex;align-items:center;gap:7px;}
.tbl .pos{color:var(--muted2);font-weight:800;width:26px;}.tbl .pts{font-weight:800;}
.lb tr.melb td{background:rgba(255,176,32,.18);}.lb tr.melb .pos{color:var(--orange);}
.lb-crown{margin-left:5px;font-size:11px;}
.howto{margin-top:14px;background:linear-gradient(120deg,rgba(255,61,127,.08),rgba(18,179,166,.08));border:1px solid var(--line);border-radius:12px;padding:13px;font-size:12px;color:var(--muted);line-height:1.6;}
.howto b{color:var(--ink);}
.bigtotal{font-family:'Anton',sans-serif;font-size:62px;color:var(--pink);line-height:1;margin:6px 0 12px;}
.bigtotal span{font-size:18px;color:var(--muted);margin-left:8px;}
.cnts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;}
.cnt{background:var(--panel2);border:1px solid var(--line);border-radius:11px;padding:10px;text-align:center;font-size:9.5px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.04em;}
.cnt b{display:block;font-family:'Anton',sans-serif;font-size:23px;letter-spacing:0;}
.cnt.exact b{color:var(--green);}.cnt.gd b{color:var(--teal);}.cnt.result b{color:var(--gold);}.cnt.miss b{color:var(--muted2);}
.reveal{display:flex;flex-direction:column;gap:14px;}
.filter-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:6px;}
.flab{font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2);margin-right:2px;}
.chip{background:#fff;border:2px solid var(--line2);color:var(--muted);border-radius:999px;padding:5px 13px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;}
.chip.on{background:linear-gradient(95deg,var(--teal),var(--blue));color:#fff;border-color:transparent;}
.rev-count{margin-top:12px;font-size:12px;font-weight:700;color:var(--muted);}
.empty{text-align:center;}
.empty-em{font-size:40px;}
.empty-t{font-family:'Anton',sans-serif;font-size:22px;margin:6px 0 4px;}
.rev-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px;}
.rev-game{overflow:hidden;}
.rev-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:linear-gradient(100deg,rgba(47,139,255,.12),rgba(18,179,166,.1));border-bottom:1px solid var(--line);}
.rev-fix{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:700;flex-wrap:wrap;}
.rev-ft{font-family:'Anton',sans-serif;font-size:20px;color:var(--ink);background:#fff;border:1px solid var(--line2);border-radius:8px;padding:1px 10px;}
.rev-kolabel{font-weight:800;color:var(--blue);font-size:12px;}
.rev-tag{font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted2);background:#fff;border:1px solid var(--line);border-radius:999px;padding:3px 9px;}
.rev-tbl{font-size:12.5px;}
.rev-pred{display:flex;align-items:center;justify-content:center;gap:6px;}
.rev-pred b{font-size:14px;}
.rev-tbl .pbadge{display:inline-block;min-width:22px;text-align:center;margin:0;}
.rev-tbl tr.toprow td{background:rgba(255,176,32,.13);}
.pbadge{font-size:11px;font-weight:800;border-radius:7px;padding:2px 9px;color:#fff;}
.t-exact{background:var(--green);}.t-gd{background:var(--teal);}.t-result{background:var(--gold);}
.t-miss{background:#f0e8db;color:var(--muted2);}
.pg-progress{font-size:13px;font-weight:700;color:var(--muted);margin-bottom:12px;}
.pg-progress b{color:var(--ink);font-weight:800;}
.pg-progress b.ok{color:var(--green);}
.card.pgrp{padding:14px 14px 8px;}
.pgrp-key{display:flex;gap:5px;}
.pk{font-size:9px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;border-radius:999px;padding:2px 7px;}
.pk1{background:rgba(255,176,32,.18);color:#a86a00;}.pk2{background:rgba(150,160,175,.2);color:#5a6573;}.pk3{background:rgba(205,127,50,.18);color:#9a5a1e;}
.pgrp-teams{display:flex;flex-direction:column;gap:7px;margin-top:12px;}
.pteam{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 11px;border-radius:12px;border:1.5px solid var(--line);background:var(--panel);position:relative;overflow:hidden;}
.pteam::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:transparent;}
.pteam.f{background:linear-gradient(90deg,rgba(255,176,32,.16),rgba(255,176,32,.03));border-color:var(--gold);}
.pteam.f::before{background:var(--gold);}
.pteam.s{background:linear-gradient(90deg,rgba(150,160,175,.16),transparent);border-color:#aab2c0;}
.pteam.s::before{background:#aab2c0;}
.pteam.t{background:linear-gradient(90deg,rgba(205,127,50,.14),transparent);border-color:#cd7f32;}
.pteam.t::before{background:#cd7f32;}
.pteam-n{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:700;min-width:0;}
.pteam-btns{display:flex;gap:6px;flex:0 0 auto;}
.posb{border:1.5px solid var(--line2);background:#fff;color:var(--muted);border-radius:999px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer;min-width:42px;text-align:center;font-family:inherit;}
.posb:disabled{opacity:.35;cursor:not-allowed;}
.posb.p1.on{background:var(--gold);border-color:var(--gold);color:#fff;}
.posb.p2.on{background:#aab2c0;border-color:#aab2c0;color:#fff;}
.posb.b3.on{background:#cd7f32;border-color:#cd7f32;color:#fff;}
.pteam-res{display:flex;align-items:center;gap:8px;flex:0 0 auto;}
.medal-static{font-size:11px;font-weight:800;border-radius:999px;padding:5px 11px;color:#fff;}
.medal-static.m1{background:var(--gold);}.medal-static.m2{background:#aab2c0;}.medal-static.m3{background:#cd7f32;}
.medal-none{font-size:13px;color:var(--muted2);font-weight:800;padding:0 6px;}
.pko-row{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;text-align:left;border:1.5px solid var(--line);background:var(--panel);border-radius:11px;padding:9px 11px;margin-bottom:7px;cursor:pointer;font-family:inherit;}
.pko-row:disabled{cursor:not-allowed;}
.pko-row.empty{opacity:.6;cursor:default;}
.pko-row.picked{background:linear-gradient(90deg,rgba(123,84,240,.16),rgba(47,139,255,.06));border-color:var(--purple);}
.ko.final .pko-row.picked{background:linear-gradient(90deg,rgba(255,176,32,.22),rgba(255,206,58,.07));border-color:var(--gold);}
.pko-row .ko-team{font-size:14px;font-weight:700;}
.pko-tick{font-size:15px;font-weight:900;color:var(--purple);flex:0 0 auto;}
.ko.final .pko-tick{color:var(--gold);font-size:18px;}
.ko.pko{padding-bottom:8px;}
.awards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;}
.award-card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px;}
.award-h{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:11px;}
.award-htext{display:flex;flex-direction:column;gap:2px;min-width:0;}
.award-t{font-family:'Anton',sans-serif;font-size:19px;letter-spacing:.02em;color:var(--ink);}
.award-hint{font-size:11.5px;color:var(--muted2);font-weight:600;}
.award-in{width:100%;border:2px solid var(--line2);border-radius:11px;padding:11px 13px;font-size:15px;font-weight:600;color:var(--ink);background:#fff;font-family:inherit;}
.award-in:focus{outline:none;border-color:var(--purple);}
.award-in:disabled{background:var(--panel2);opacity:.8;}
.award-official{margin-top:9px;}
.award-official label{font-size:11px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:.04em;display:block;}
.award-official input{width:100%;margin-top:5px;border:2px dashed var(--gold);border-radius:9px;padding:8px 11px;font-size:14px;font-weight:600;color:var(--ink);background:rgba(255,176,32,.05);font-family:inherit;}
.award-actual{margin-top:9px;font-size:13px;color:var(--muted);font-weight:600;}
.award-actual b{color:var(--green);}
.award-note{font-size:11px;font-weight:600;color:var(--muted);margin-top:7px;line-height:1.4;background:var(--panel2);border-radius:8px;padding:6px 9px;}
.champ-list{margin-top:14px;border:1px solid var(--line);border-radius:14px;padding:14px;background:var(--panel2);}
.champ-h{font-family:'Anton',sans-serif;font-size:15px;letter-spacing:.01em;margin-bottom:10px;}
.champ-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid var(--line);}
.champ-row:first-of-type{border-top:none;}
.champ-who{font-weight:700;font-size:13.5px;}
.champ-team{display:flex;align-items:center;gap:7px;font-weight:800;font-size:13.5px;}
.champ-pending{font-size:12.5px;color:var(--muted);font-style:italic;}
.manage{margin-top:16px;border:1px solid var(--line);border-radius:13px;overflow:hidden;}
.manage-h{font-family:'Anton',sans-serif;font-size:15px;letter-spacing:.04em;text-transform:uppercase;padding:10px 13px;background:var(--panel2);border-bottom:1px solid var(--line);}
.manage-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 13px;border-bottom:1px solid #f4ebdf;flex-wrap:wrap;}
.manage-name{font-weight:700;font-size:13.5px;display:flex;align-items:center;gap:5px;}
.manage-btns{display:flex;align-items:center;gap:8px;flex:0 0 auto;}
.mbtn{background:#fff;border:2px solid var(--line2);color:var(--ink);border-radius:9px;padding:8px 12px;font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit;}
.mbtn:hover{border-color:var(--ink);}
.mbtn.del{color:var(--pink);border-color:#ffc9dc;}
.manage-locked{font-size:11px;font-weight:800;color:var(--muted2);text-transform:uppercase;letter-spacing:.06em;}
.role-btn{width:100%;background:linear-gradient(95deg,var(--pink),var(--orange));color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:800;cursor:pointer;margin-top:4px;font-family:inherit;}
.ctr{text-align:center;}
.psg-val{flex:0 0 auto;font-size:14px;font-weight:900;color:#fff;background:linear-gradient(120deg,var(--purple),var(--blue));border-radius:8px;padding:4px 10px;min-width:30px;text-align:center;}
.pred-lb th,.pred-lb td{padding:8px 4px;}
.cfg-note{font-size:11.5px;color:var(--muted);line-height:1.5;}
.lb-card{grid-column:1/-1;}
.ft{margin-top:26px;color:var(--muted2);font-size:11px;text-align:center;line-height:1.6;}
.gm.locked-match{background:linear-gradient(180deg,rgba(180,170,160,.09),transparent 60%);}
.gm-main.gm-locked{opacity:.72;}
.gm-lock-badge{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:800;color:#9a6800;background:rgba(255,176,32,.18);border:1px solid rgba(255,176,32,.45);border-radius:999px;padding:2px 9px;}
.gm-result-row{display:flex;align-items:center;gap:10px;padding:6px 0 4px;border-top:1px dashed var(--line2);margin-top:4px;flex-wrap:wrap;}
.gm-result-lbl{font-size:10.5px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;min-width:80px;}
.gm-result-inputs{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.gm-result-score{font-family:'Anton',sans-serif;font-size:18px;color:var(--teal);}
.result-clear-btn{background:#fff0f2;border:1.5px solid var(--pink);color:var(--pink);border-radius:8px;padding:4px 9px;font-size:13px;font-weight:800;cursor:pointer;line-height:1;font-family:inherit;}
.result-clear-btn:hover{background:var(--pink);color:#fff;}
.desk-nav{display:flex;align-items:center;justify-content:center;gap:6px;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid #efe3d2;padding:8px 16px calc(8px + env(safe-area-inset-bottom,0px));box-shadow:0 -8px 24px -16px rgba(80,40,20,.4);flex-wrap:wrap;transform:translateZ(0);-webkit-transform:translateZ(0);will-change:transform;}
.desk-nav-btn{display:flex;flex-direction:column;align-items:center;gap:2px;border:none;background:none;color:var(--muted2);cursor:pointer;font-family:inherit;padding:6px 16px;border-radius:12px;font-size:11px;font-weight:800;letter-spacing:.01em;min-width:72px;}
.desk-nav-btn:hover{background:var(--panel2);color:var(--ink);}
.desk-nav-btn.act{color:var(--pink);}
.desk-nav-btn .dnic{font-size:22px;line-height:1;}
.desk-nav-sep{width:1px;height:32px;background:var(--line);margin:0 4px;flex:0 0 auto;}
.desk-nav-live{display:flex;flex-direction:column;align-items:center;gap:2px;text-decoration:none;color:var(--muted2);padding:6px 16px;border-radius:12px;font-size:11px;font-weight:800;letter-spacing:.01em;min-width:72px;}
.desk-nav-live:hover{background:var(--panel2);color:var(--ink);}
.desk-nav-live.act{color:var(--teal);}
.mobile-tabnav{display:none;}
@media (max-width:780px){
  .mobile-tabnav{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;}
  .mtn-btn{display:inline-flex;align-items:center;gap:5px;background:#fff;border:2px solid var(--line2);color:var(--muted);border-radius:999px;padding:8px 14px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;text-decoration:none;}
  .mtn-btn.act{background:linear-gradient(95deg,var(--pink),var(--orange));color:#fff;border-color:transparent;}
  .mtn-live.act{background:linear-gradient(95deg,var(--teal),var(--blue));color:#fff;border-color:transparent;}
}
.step-prompt{background:linear-gradient(95deg,rgba(44,181,81,.14),rgba(18,179,166,.08));border:1.5px solid var(--green);border-radius:13px;padding:13px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.step-prompt-txt{font-size:13.5px;font-weight:700;color:#1c7a3a;line-height:1.4;flex:1;}
.step-prompt-btn{flex:0 0 auto;background:linear-gradient(95deg,var(--green),var(--teal));color:#fff;border:none;border-radius:999px;padding:10px 18px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;}
@media (max-width:780px){
  .wc{padding:14px 12px calc(78px + env(safe-area-inset-bottom,0px));overflow-x:hidden;}
  .board{grid-template-columns:1fr;}
  .hdr{align-items:flex-start;gap:12px;}
  .hdr h1{font-size:40px;}
  .hdr-r{width:100%;flex-direction:column;align-items:stretch;gap:10px;}
  .ptotal{padding:8px 16px;border-radius:14px;align-self:flex-start;}
  .pt-num{font-size:30px;}
  .hdr-meta{width:100%;align-items:stretch;}
  .ctrls{flex-wrap:wrap;justify-content:flex-start;}
  .groups-grid{grid-template-columns:1fr;}
  .rev-list{grid-template-columns:1fr;}
  .awards{grid-template-columns:1fr;}
  .modeswitch{max-width:none;}
  .sin{width:46px;}.sin-btn{height:32px;font-size:21px;}.sin-num{font-size:20px;}
  .ko .sin{width:44px;}.ko .sin-btn{height:30px;}.ko .sin-num{font-size:18px;}
  .ob-input{font-size:16px;}
  .award-in{font-size:16px;}
  .tabs{display:none;}
  .ko-grid{grid-template-columns:1fr;}
  .ko-grid .ko.final,.ko-grid .ko.bronze{max-width:none;}
  .modal-c.kickedit{max-width:none;}
  .kick-row{flex-direction:column;align-items:stretch;gap:6px;}
  .kick-in{width:100%;font-size:16px;padding:9px;}
  .desk-nav{padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px));gap:0;}
  .desk-nav-btn{padding:6px 8px;min-width:0;flex:1;font-size:10px;}
  .desk-nav-btn .dnic{font-size:20px;}
  .desk-nav-live{padding:6px 8px;min-width:0;flex:1;font-size:10px;}
  .desk-nav-live .dnic{font-size:20px;}
  .desk-nav-sep{display:none;}
}
@media (max-width:380px){
  .cnts{grid-template-columns:repeat(2,1fr);}
  .hdr h1{font-size:34px;}
}
`;

// First KO kick-off time = predictor lock
// GA0: Fri 12 Jun 05:00 Sydney = Thu 11 Jun 19:00 UTC
const PREDICTOR_LOCK_UTC = new Date("2026-06-12T05:00:00+10:00").getTime();

function fmtKick(ms) {
  if (!ms) return "TBC";
  return new Date(ms).toLocaleString(undefined, { weekday:"short", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
}

export default function TippingHQ() {
  const [player, setPlayer] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wc_player") || "null"); } catch { return null; }
  });
  const [mode, setMode] = useState("tip");
  const [tab, setTab] = useState("groups");
  const [groupView, setGroupView] = useState("group"); // "group" | "kickoff"
  const [ptab, setPtab] = useState("pg");
  const [adminEditing, setAdminEditing] = useState(false);
  const [showKickEditor, setShowKickEditor] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCeremony, setShowCeremony] = useState(false);

  // Data state
  const [players, setPlayers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [officialResults, setOfficialResults] = useState([]);
  const [bracketPredictions, setBracketPredictions] = useState([]);
  const [poolSettings, setPoolSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultNotification, setResultNotification] = useState(null);
  const [suggestionKey, setSuggestionKey] = useState(0);
  const [predictorResetKey, setPredictorResetKey] = useState(0);

  // Refs must be declared before any early returns (Rules of Hooks)
  const predictionsRef = useRef([]);
  const saveTimers = useRef({});
  const playerRef = useRef(player);
  const bracketRef = useRef(null); // tracks latest bracket data for optimistic updates
  const bracketSaveTimer = useRef(null);

  // Keep playerRef in sync
  useEffect(() => { playerRef.current = player; }, [player]);

  // Flush all pending tip saves immediately (used before logout/unmount)
  const flushPendingSaves = useCallback(async () => {
    const timers = saveTimers.current;
    const pending = Object.keys(timers);
    if (!pending.length) return;
    const flushPromises = pending.map(matchId => {
      clearTimeout(timers[matchId]);
      delete timers[matchId];
      const currentPlayer = playerRef.current;
      if (!currentPlayer) return;
      const pred = predictionsRef.current.find(p => p.playerId === currentPlayer.id && p.matchId === matchId);
      if (!pred || pred.homeScore == null || pred.awayScore == null) return;
      const { homeScore, awayScore } = pred;
      if (pred.id) {
        return base44.entities.Prediction.update(pred.id, { homeScore, awayScore });
      } else {
        return base44.entities.Prediction.create({ playerId: currentPlayer.id, matchId, homeScore, awayScore });
      }
    });
    await Promise.all(flushPromises.filter(Boolean));
  }, []);

  const kickoffs = poolSettings?.kickoffOverrides
    ? { ...DEFAULT_KICKOFFS, ...JSON.parse(poolSettings.kickoffOverrides) }
    : DEFAULT_KICKOFFS;

  const predSettings = poolSettings?.predSettings
    ? { ...DEFAULT_PRED_SETTINGS, ...JSON.parse(poolSettings.predSettings) }
    : DEFAULT_PRED_SETTINGS;

  const officialAwards = poolSettings?.officialAwards
    ? JSON.parse(poolSettings.officialAwards)
    : {};

  const isAdmin = player?.isAdmin || false;
  // Lock predictor at the first game kickoff (GA0), overridable by kickoff overrides
  const firstKickoff = kickoffs["GA0"] ?? PREDICTOR_LOCK_UTC;
  const predLocked = Date.now() >= firstKickoff && !player?.predictorOverride;

  const fetchAll = useCallback(async () => {
    const [pl, pr, or_, bp, ps] = await Promise.all([
      base44.entities.Player.list(),
      base44.entities.Prediction.list(),
      base44.entities.OfficialResult.list(),
      base44.entities.BracketPrediction.list(),
      base44.entities.PoolSettings.list(),
    ]);
    setPlayers(pl || []);
    setPredictions(pr || []);
    setOfficialResults(or_ || []);
    setBracketPredictions(bp || []);
    setPoolSettings(ps?.[0] || null);
    // Sync bracketRef on load (only if no pending edits)
    if (!bracketSaveTimer.current) {
      bracketRef.current = (bp || []).find(b => b.playerId === playerRef.current?.id) || null;
    }
  }, []);

  // On load, verify stored player still exists in DB — if removed, kick back to login
  useEffect(() => {
    if (!player) return;
    base44.entities.Player.list().then(all => {
      const stillExists = (all || []).some(p => p.id === player.id);
      if (!stillExists) {
        localStorage.removeItem("wc_player");
        setPlayer(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!player) return;
    fetchAll();

    // Real-time subscriptions — instantly reflect any change
    const unsubPlayers = base44.entities.Player.subscribe((event) => {
      if (event.type === "create") setPlayers(prev => [...prev.filter(p => p.id !== event.id), event.data]);
      else if (event.type === "update") {
        setPlayers(prev => prev.map(p => p.id === event.id ? event.data : p));
        // Keep the logged-in player's session data fresh (e.g. predictorOverride changes)
        if (event.id === playerRef.current?.id) {
          const updated = { ...playerRef.current, ...event.data };
          localStorage.setItem("wc_player", JSON.stringify(updated));
          setPlayer(updated);
        }
      }
      else if (event.type === "delete") {
        setPlayers(prev => prev.filter(p => p.id !== event.id));
        // If the deleted player is the currently logged-in user, force logout
        if (event.id === playerRef.current?.id) {
          localStorage.removeItem("wc_player");
          setPlayer(null);
        }
      }
    });

    const unsubPred = base44.entities.Prediction.subscribe((event) => {
      if (event.type === "create") {
        // Skip if there's a pending save for this match (our optimistic state is newer)
        if (event.data?.matchId && saveTimers.current[event.data.matchId]) return;
        setPredictions(prev => [...prev.filter(p => p.id !== event.id), event.data]);
      } else if (event.type === "update") {
        // Skip if there's a pending save for this match (our optimistic state is newer)
        if (event.data?.matchId && saveTimers.current[event.data.matchId]) return;
        setPredictions(prev => prev.map(p => p.id === event.id ? event.data : p));
      } else if (event.type === "delete") {
        setPredictions(prev => prev.filter(p => p.id !== event.id));
      }
    });

    const unsubOfficial = base44.entities.OfficialResult.subscribe((event) => {
      if (event.type === "create") {
        setOfficialResults(prev => [...prev.filter(r => r.id !== event.id), event.data]);
        // Only notify non-admins (admin is the one entering results)
        if (!playerRef.current?.isAdmin && event.data?.homeScore != null && event.data?.awayScore != null) {
          setResultNotification({ matchId: event.data.matchId, home: event.data.homeScore, away: event.data.awayScore });
          setTimeout(() => setResultNotification(null), 5000);
        }
      } else if (event.type === "update") {
        setOfficialResults(prev => prev.map(r => r.id === event.id ? event.data : r));
        if (!playerRef.current?.isAdmin && event.data?.homeScore != null && event.data?.awayScore != null) {
          setResultNotification({ matchId: event.data.matchId, home: event.data.homeScore, away: event.data.awayScore });
          setTimeout(() => setResultNotification(null), 5000);
        }
      } else if (event.type === "delete") {
        setOfficialResults(prev => prev.filter(r => r.id !== event.id));
      }
    });

    const unsubBracket = base44.entities.BracketPrediction.subscribe((event) => {
      setBracketPredictions(prev => {
        let next;
        if (event.type === "create") next = [...prev.filter(b => b.id !== event.id), event.data];
        else if (event.type === "update") next = prev.map(b => b.id === event.id ? event.data : b);
        else next = prev.filter(b => b.id !== event.id);
        // Keep bracketRef in sync — but only if not mid-edit (timer pending)
        if (!bracketSaveTimer.current) {
          bracketRef.current = next.find(b => b.playerId === playerRef.current?.id) || null;
        }
        return next;
      });
    });

    const unsubSettings = base44.entities.PoolSettings.subscribe((event) => {
      if (event.type === "delete") setPoolSettings(null);
      else setPoolSettings(event.data);
    });

    // Flush pending saves before the tab/window closes
    const handleBeforeUnload = () => { flushPendingSaves(); };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Fallback poll every 30s
    const t = setInterval(fetchAll, 30000);
    return () => {
      unsubPlayers();
      unsubPred();
      unsubOfficial();
      unsubBracket();
      unsubSettings();
      clearInterval(t);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Flush any pending saves on unmount
      flushPendingSaves();
    };
  }, [player, fetchAll, flushPendingSaves]);

  // Ceremony: show once when all 4 awards are entered
  const AWARD_KEYS = ["boot", "ball", "young", "glove"];
  const tournamentOver = AWARD_KEYS.every(k => officialAwards?.[k]?.trim());
  useEffect(() => {
    if (!player || !tournamentOver) return;
    const key = `wc_ceremony_seen_${player.id}`;
    if (!localStorage.getItem(key)) {
      setShowCeremony(true);
    }
  }, [player?.id, tournamentOver]);

  const handleLogin = (p) => {
    localStorage.setItem("wc_player", JSON.stringify(p));
    setPlayer(p);
    // Show help modal only on first ever login (tracked in localStorage per player)
    const seenKey = `wc_help_seen_${p.id}`;
    if (!localStorage.getItem(seenKey)) {
      setShowHelp(true);
    }
  };
  const handleLogout = async () => {
    await flushPendingSaves();
    localStorage.removeItem("wc_player");
    setPlayer(null);
  };

  if (!player) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // My predictions
  const myPreds = predictions.filter(p => p.playerId === player.id);
  const myBracket = bracketPredictions.find(bp => bp.playerId === player.id) || null;

  // Tip count (group stage only = 72 matches)
  const totalGroupMatches = GROUP_MATCHES.length;
  const validGroupIds = new Set(GROUP_MATCHES.map(m => m.id));
  const tipCount = myPreds.filter(p => p.homeScore != null && p.awayScore != null && validGroupIds.has(p.matchId)).length;

  // Group stage complete = all 72 matches have official results
  const groupStageComplete = GROUP_MATCHES.every(m => {
    const r = officialResults.find(r => r.matchId === m.id);
    return r && r.homeScore != null && r.awayScore != null;
  });

  // My tipping score
  const myScore = computePlayerScore(
    predictions.filter(p => p.playerId === player.id),
    officialResults,
    { exact: poolSettings?.pointsExact ?? 5, gd: poolSettings?.pointsGD ?? 3, result: poolSettings?.pointsResult ?? 1 }
  );

  // Leaderboard
  const leaderboard = buildLeaderboard(
    players,
    predictions,
    officialResults,
    { exact: poolSettings?.pointsExact ?? 5, gd: poolSettings?.pointsGD ?? 3, result: poolSettings?.pointsResult ?? 1 }
  );

  // Predictor leaderboard (real scoring)
  const predLB = buildPredictorLeaderboard(players, bracketPredictions, officialResults, officialAwards, predSettings);

  // Combined leaderboard
  const tippingSettings = { exact: poolSettings?.pointsExact ?? 5, gd: poolSettings?.pointsGD ?? 3, result: poolSettings?.pointsResult ?? 1 };
  const combinedLB = buildCombinedLeaderboard(players, predictions, bracketPredictions, officialResults, officialAwards, tippingSettings, predSettings);

  // My predictor score (from leaderboard which includes award pts)
  const myPredRow = predLB.find(r => r.id === player.id);
  const myPredScore = myPredRow?.total ?? 0;

  // KO team resolution from official results
  const thirdPlaceSlots = poolSettings?.thirdPlaceSlots ? JSON.parse(poolSettings.thirdPlaceSlots) : {};
  const koTeams = buildOfficialKOTeamsFromResults(officialResults, thirdPlaceSlots);
  const koWinners = buildKOWinners(officialResults);

  // predictionsRef is kept in sync inside onSetScore's functional setter for accuracy during rapid clicks

  const onSetScore = (matchId, side, value) => {
    const field = side === "h" ? "homeScore" : "awayScore";

    // Update local state immediately for responsive UI, and sync ref at the same time
    setPredictions(prev => {
      let next;
      const existing = prev.find(p => p.playerId === player.id && p.matchId === matchId);
      if (existing) {
        next = prev.map(p =>
          p.playerId === player.id && p.matchId === matchId ? { ...p, [field]: value } : p
        );
      } else {
        next = [...prev, {
          playerId: player.id, matchId,
          homeScore: side === "h" ? value : null,
          awayScore: side === "a" ? value : null
        }];
      }
      // Keep ref in sync immediately so debounced save uses latest value
      predictionsRef.current = next;
      return next;
    });

    // Debounce DB save — wait 200ms after last interaction before persisting
    clearTimeout(saveTimers.current[matchId]);
    saveTimers.current[matchId] = setTimeout(async () => {
      const pred = predictionsRef.current.find(p => p.playerId === player.id && p.matchId === matchId);
      if (!pred || pred.homeScore == null || pred.awayScore == null) return;

      const { homeScore, awayScore } = pred;
      if (pred.id) {
        await base44.entities.Prediction.update(pred.id, { homeScore, awayScore });
      } else {
        const saved = await base44.entities.Prediction.create({ playerId: player.id, matchId, homeScore, awayScore });
        setPredictions(prev => prev.map(p =>
          p.playerId === player.id && p.matchId === matchId && !p.id ? saved : p
        ));
      }
    }, 400);
  };

  // Commit official result (both scores at once) — triggers notification banner for all users
  const onSetOfficial = async (matchId, homeScore, awayScore) => {
    const existing = officialResults.find(r => r.matchId === matchId);
    const data = { homeScore, awayScore };
    if (existing) {
      const updated = await base44.entities.OfficialResult.update(existing.id, data);
      setOfficialResults(prev => prev.map(r => r.id === existing.id ? { ...r, ...data } : r));
    } else {
      const saved = await base44.entities.OfficialResult.create({ matchId, ...data });
      setOfficialResults(prev => [...prev, saved]);
    }
  };

  // Clear official result
  const onClearOfficial = async (matchId) => {
    const existing = officialResults.find(r => r.matchId === matchId);
    if (!existing) return;
    await base44.entities.OfficialResult.delete(existing.id);
    setOfficialResults(prev => prev.filter(r => r.id !== existing.id));
  };

  // Reset my tips for all unlocked matches (group + KO) that haven't kicked off and have no official result
  const onResetTips = async () => {
    if (!window.confirm("Are you sure you want to reset all your tips for unlocked matches? This cannot be undone.")) return;
    if (poolSettings?.globalLockTipping) return;

    // Use the latest predictions state (not ref, which may be slightly stale)
    const myPredsCurrent = predictions.filter(p => p.playerId === player.id);
    const toDelete = myPredsCurrent.filter(p => {
      const official = officialResults.find(r => r.matchId === p.matchId);
      if (official && official.homeScore != null) return false; // result already in, locked
      const ko = kickoffs[p.matchId];
      if (ko && Date.now() >= ko) return false; // already kicked off, locked
      return true;
    });

    // Clear ALL pending debounced saves immediately so nothing gets re-saved after deletion
    Object.keys(saveTimers.current).forEach(matchId => {
      clearTimeout(saveTimers.current[matchId]);
      delete saveTimers.current[matchId];
    });

    // Delete records from DB (only those with an id), one by one to ensure reliability
    const toDeleteInDB = toDelete.filter(p => p.id);
    for (const p of toDeleteInDB) {
      await base44.entities.Prediction.delete(p.id);
    }

    const deletedMatchIds = new Set(toDelete.map(d => d.matchId));
    setPredictions(prev => {
      const next = prev.filter(p => !(p.playerId === player.id && deletedMatchIds.has(p.matchId)));
      predictionsRef.current = next;
      return next;
    });
  };

  // Reset predictor picks (only if not locked)
  const onResetPredictor = async () => {
    if (predLocked) return;
    if (!window.confirm("Are you sure you want to reset all your predictor picks? This cannot be undone.")) return;
    if (myBracket) {
      clearTimeout(bracketSaveTimer.current);
      bracketSaveTimer.current = null;
      await base44.entities.BracketPrediction.delete(myBracket.id);
      bracketRef.current = null;
      setBracketPredictions(prev => prev.filter(b => b.id !== myBracket.id));
      setPredictorResetKey(k => k + 1);
    }
  };

  const onSetOfficialPen = async (matchId, side) => {
    const existing = officialResults.find(r => r.matchId === matchId);
    if (existing) {
      await base44.entities.OfficialResult.update(existing.id, { penaltyWinner: side });
      setOfficialResults(prev => prev.map(r => r.id === existing.id ? { ...r, penaltyWinner: side } : r));
    }
  };

  // Predictor picks — read from bracketRef (always latest) for instant optimistic updates
  // Receives the full updated groupPicks object from PredictorGroups local state
  const onPickPos = (updatedGroupPicks, groupL, team, pos) => {
    if (predLocked) return;
    updateBracket({ groupPicks: JSON.stringify(updatedGroupPicks) });
  };

  // Receives the full updated thirdPicks object from PredictorGroups local state
  const onPickThird = (updatedThirdPicks, groupL, team) => {
    if (predLocked) return;
    updateBracket({ thirdPicks: JSON.stringify(updatedThirdPicks) });
  };

  const onPickAdvance = (matchId, side) => {
    if (predLocked) return;
    const current = bracketRef.current;
    const ap = current?.advancePicks ? JSON.parse(current.advancePicks) : {};
    ap[matchId] = side; // side is already toggled/nulled by PredictorBracket's local state
    updateBracket({ advancePicks: JSON.stringify(ap) });
  };

  const onSetAward = async (key, value) => {
    if (predLocked) return;
    const existing = bracketRef.current;
    const awards = existing?.awardPicks ? JSON.parse(existing.awardPicks) : {};
    awards[key] = value;
    const awardPicksStr = JSON.stringify(awards);
    // Keep bracketRef in sync so subsequent bracket picks don't overwrite awardPicks
    bracketRef.current = existing
      ? { ...existing, awardPicks: awardPicksStr }
      : { playerId: player.id, awardPicks: awardPicksStr };
    await saveBracket({ awardPicks: awardPicksStr });
  };

  const onSetOfficialAward = async (key, value) => {
    const awards = { ...officialAwards, [key]: value };
    await savePoolSettings({ officialAwards: JSON.stringify(awards) });
  };

  // Optimistic bracket update — updates UI immediately, debounces DB write by 300ms
  const updateBracket = (partialData) => {
    // Update ref FIRST so subsequent rapid calls (before React re-renders) see the new state
    const existingForRef = bracketRef.current;
    bracketRef.current = existingForRef
      ? { ...existingForRef, ...partialData }
      : { playerId: player.id, ...partialData };

    setBracketPredictions(prev => {
      const existing = prev.find(b => b.playerId === player.id);
      let next;
      if (existing) {
        next = prev.map(b => b.id === existing.id ? { ...b, ...partialData } : b);
      } else {
        next = [...prev, { playerId: player.id, ...partialData }];
      }
      return next;
    });

    clearTimeout(bracketSaveTimer.current);
    bracketSaveTimer.current = setTimeout(async () => {
      // Always save the FULL current bracketRef state so no pick is lost in a race
      const current = bracketRef.current;
      if (!current) return;
      const { id, playerId, ...fullData } = current;
      if (id) {
        await base44.entities.BracketPrediction.update(id, fullData);
      } else {
        const saved = await base44.entities.BracketPrediction.create({ playerId: player.id, ...fullData });
        bracketRef.current = saved;
        setBracketPredictions(prev => {
          const next = prev.map(b => b.playerId === player.id && !b.id ? saved : b);
          return next;
        });
      }
    }, 300);
  };

  const saveBracket = async (data) => {
    const existing = bracketPredictions.find(b => b.playerId === player.id);
    if (existing) {
      await base44.entities.BracketPrediction.update(existing.id, data);
      setBracketPredictions(prev => prev.map(b => b.id === existing.id ? { ...b, ...data } : b));
    } else {
      const saved = await base44.entities.BracketPrediction.create({ playerId: player.id, ...data });
      setBracketPredictions(prev => [...prev, saved]);
    }
  };

  const savePoolSettings = async (data) => {
    if (poolSettings) {
      await base44.entities.PoolSettings.update(poolSettings.id, data);
      setPoolSettings(prev => ({ ...prev, ...data }));
    } else {
      const saved = await base44.entities.PoolSettings.create(data);
      setPoolSettings(saved);
    }
  };

  const onSetKickoff = async (matchId, ms) => {
    const overrides = poolSettings?.kickoffOverrides ? JSON.parse(poolSettings.kickoffOverrides) : {};
    overrides[matchId] = ms;
    await savePoolSettings({ kickoffOverrides: JSON.stringify(overrides) });
  };

  const onSuggestFromTips = async () => {
    // Only auto-fill groups where ALL 3 group matches have been tipped
    const gp = myBracket?.groupPicks ? JSON.parse(myBracket.groupPicks) : {};
    const groupScores = {};

    for (const L of GL) {
      const teams = WC_GROUPS[L];
      const groupMs = GROUP_MATCHES.filter(m => m.group === L);
      const allTipped = groupMs.every(m => {
        const pred = myPreds.find(p => p.matchId === m.id);
        return pred && pred.homeScore != null && pred.awayScore != null;
      });
      if (!allTipped) continue; // skip groups where not all games are tipped

      const matchScores = {};
      teams.forEach(t => { matchScores[t] = { pts: 0, gd: 0, gf: 0 }; });
      for (const m of groupMs) {
        const pred = myPreds.find(p => p.matchId === m.id);
        const h = +pred.homeScore, a = +pred.awayScore;
        matchScores[m.home].gf += h; matchScores[m.home].gd += h - a;
        matchScores[m.away].gf += a; matchScores[m.away].gd += a - h;
        if (h > a) { matchScores[m.home].pts += 3; }
        else if (h < a) { matchScores[m.away].pts += 3; }
        else { matchScores[m.home].pts += 1; matchScores[m.away].pts += 1; }
      }
      const sorted = teams.slice().sort((a, b) => {
        const sa = matchScores[a], sb = matchScores[b];
        return sb.pts - sa.pts || sb.gd - sa.gd || sb.gf - sa.gf;
      });
      gp[L] = { first: sorted[0], second: sorted[1] };
      groupScores[L] = { matchScores, sorted };
    }

    // best-3rd: only from fully-tipped groups, pick top 8 — always start fresh to avoid >8
    const tp = {};
    const thirds = Object.entries(groupScores).map(([L, { matchScores, sorted }]) => ({
      group: L, team: sorted[2], ...matchScores[sorted[2]]
    }));
    thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    thirds.slice(0, 8).forEach(t => { if (t.team) tp[t.group] = t.team; });

    await saveBracket({ groupPicks: JSON.stringify(gp), thirdPicks: JSON.stringify(tp) });
    setSuggestionKey(k => k + 1);
  };

  // Build predictor KO teams from bracket's group picks
  const myGroupPicks = myBracket?.groupPicks ? JSON.parse(myBracket.groupPicks) : {};
  const myThirdPicks = myBracket?.thirdPicks ? JSON.parse(myBracket.thirdPicks) : {};
  const myAdvancePicks = myBracket?.advancePicks ? JSON.parse(myBracket.advancePicks) : {};
  const predKOTeams = buildKOTeams(myGroupPicks, myThirdPicks, myAdvancePicks);

  // Show suggest button once at least one full group (3 matches) is tipped
  const canSuggest = GL.some(L => {
    const groupMs = GROUP_MATCHES.filter(m => m.group === L);
    return groupMs.every(m => {
      const pred = myPreds.find(p => p.matchId === m.id);
      return pred && pred.homeScore != null && pred.awayScore != null;
    });
  });

  return (
    <>
    <div className="wc">
      <style>{CSS}</style>

      <header className="hdr">
        <div>
          <div className="kick">FIFA WORLD CUP 26 · 🇺🇸 🇨🇦 🇲🇽</div>
          <h1>TIPPING <span>HQ</span></h1>
          <div className="idtag">
            Playing as <b>{player.name}</b>
            {isAdmin && <span className="badge-admin">👑 ADMIN</span>}
          </div>
        </div>
        <div className="hdr-r">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className={`ptotal${mode === "pred" ? " pred" : ""}`}>
              <div className="pt-num">{mode === "pred" ? myPredScore : myScore.total}</div>
              <div className="pt-lab">{mode === "tip" ? "tipping pts" : "predictor pts"}</div>
            </div>
            <a href="/live" className="live" style={{ textDecoration: "none", flexShrink: 0 }}><span className="live-dot" />Live</a>
          </div>
          <div className="hdr-meta">
            <div className="picks">{tipCount}/{totalGroupMatches} tips in</div>
            <div className="ctrls">
              {isAdmin && (
                <button
                  className={`toggle${adminEditing ? " on" : ""}`}
                  onClick={() => setAdminEditing(v => !v)}
                >
                  <span className="knob" />Enter results
                </button>
              )}
              {isAdmin && (
                <button className="mini" onClick={() => setShowKickEditor(true)}>🕐 Times</button>
              )}
              {isAdmin && (
                <a href="/admin" className="mini" style={{ textDecoration: "none" }}>⚙️ Admin</a>
              )}
              <button className="mini" onClick={() => setShowHelp(true)}>❓ Help</button>
              <a href="/live" className="mini" style={{ textDecoration: "none" }}>📺 Live Results</a>
              {mode === "tip" && <button className="mini danger" onClick={onResetTips}>🗑 Reset tips</button>}
              {mode === "pred" && !predLocked && <button className="mini danger" onClick={onResetPredictor}>🗑 Reset predictor</button>}
              <button className="mini" onClick={handleLogout}>Log out</button>
            </div>
          </div>
        </div>
      </header>

      <AnnouncementBanner />

      <WelcomeBackBanner
        player={player}
        officialResults={officialResults}
        onGoToLeaderboard={() => { setMode("tip"); setTab("board"); }}
      />

      <div className="modeswitch">
        <button className={mode === "tip" ? "on" : ""} onClick={() => setMode("tip")}>🎯 Tipping</button>
        <button className={mode === "pred" ? "on" : ""} onClick={() => setMode("pred")}>🔮 Predictor</button>
      </div>

      {/* Tab nav — shown on desktop via .tabs, shown on mobile via .mobile-tabnav */}
      {mode === "tip" && (
        <>
          <nav className="tabs">
            {[["groups","Group Stage","Groups","⚽",false],["ko","Knockouts","Bracket","🏆",false],["board","Leaderboard","Table","📊",false],["reveal","Tips Room","Tips","👀",false],["combined","Combined","Combined","🌟",false]].map(([k,l,sh,ic,sep]) => (
              <button key={k} className={`tab${tab===k?" act":""}${sep?" sep":""}`} onClick={() => setTab(k)}>
                <span className="tab-ic">{ic}</span>
                <span className="tab-full">{l}</span>
                <span className="tab-short">{sh}</span>
              </button>
            ))}
          </nav>
          <nav className="mobile-tabnav">
            {[["groups","⚽","Groups"],["ko","🏆","Bracket"],["board","🏅","Leaderboard"],["reveal","👀","Tips"],["combined","🌟","Combined"]].map(([k,ic,lbl]) => (
              <button key={k} className={`mtn-btn${tab===k?" act":""}`} onClick={() => setTab(k)}>
                <span>{ic}</span>{lbl}
              </button>
            ))}
          </nav>
        </>
      )}

      {mode === "pred" && (
        <>
          <nav className="tabs">
            {[["pg","Groups","Groups","🥇",false],["pb","Bracket","Bracket","🏆",false],["pa","Awards","Awards","🏅",false],["pl","Leaderboard","Table","📊",false]].map(([k,l,sh,ic,sep]) => (
              <button key={k} className={`tab${ptab===k?" act":""}${sep?" sep":""}`} onClick={() => setPtab(k)}>
                <span className="tab-ic">{ic}</span>
                <span className="tab-full">{l}</span>
                <span className="tab-short">{sh}</span>
              </button>
            ))}
          </nav>
          <nav className="mobile-tabnav">
            {[["pg","🥇","Groups"],["pb","🏆","Bracket"],["pa","🏅","Awards"],["pl","📊","Leaderboard"]].map(([k,ic,lbl]) => (
              <button key={k} className={`mtn-btn${ptab===k?" act":""}`} onClick={() => setPtab(k)}>
                <span>{ic}</span>{lbl}
              </button>
            ))}
          </nav>
        </>
      )}

      {/* TIPPING TABS */}
      {mode === "tip" && tab === "groups" && (() => {
        // Next untipped group match
        const nextUntipped = GROUP_MATCHES.find(m => {
          const ko = kickoffs[m.id];
          if (ko && Date.now() >= ko) return false;
          const pred = predictions.find(p => p.playerId === player.id && p.matchId === m.id);
          return !pred || pred.homeScore == null || pred.awayScore == null;
        });
        // Next upcoming kickoff (any group match not yet started)
        const nextKickoff = GROUP_MATCHES.map(m => ({ m, ko: kickoffs[m.id] }))
          .filter(({ ko }) => ko && Date.now() < ko)
          .sort((a, b) => a.ko - b.ko)[0];
        return (
          <>
            {nextUntipped && (
              <a href={`#match-${nextUntipped.id}`} style={{ display: "block", margin: "0 0 10px", textDecoration: "none" }}>
                <div style={{ background: "linear-gradient(95deg,#12b3a6,#2f8bff)", color: "#fff", borderRadius: 14, padding: "11px 18px", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  ⚽ Next to tip: {nextUntipped.home} v {nextUntipped.away} →
                </div>
              </a>
            )}
            {nextKickoff && (
              <a href={`#match-${nextKickoff.m.id}`} style={{ display: "block", margin: "0 0 12px", textDecoration: "none" }}>
                <div style={{ background: "linear-gradient(95deg,#ff7a2f,#ffb020)", color: "#fff", borderRadius: 14, padding: "10px 18px", cursor: "pointer" }}>
                  <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: ".04em", textTransform: "uppercase" }}>
                    🔔 Next kick-off: {nextKickoff.m.home} v {nextKickoff.m.away} →
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, opacity: .88, marginTop: 2 }}>
                    {fmtKick(nextKickoff.ko)} · Change before it locks
                  </div>
                </div>
              </a>
            )}
          </>
        );
      })()}
      {mode === "tip" && tab === "groups" && (
        <>
          {/* View toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button className={`chip${groupView === "group" ? " on" : ""}`} onClick={() => setGroupView("group")}>By Group</button>
            <button className={`chip${groupView === "kickoff" ? " on" : ""}`} onClick={() => setGroupView("kickoff")}>By Kick-off</button>
          </div>

          {groupView === "kickoff" ? (
            <KickoffView
              predictions={predictions}
              officialResults={officialResults}
              kickoffs={kickoffs}
              onSetScore={onSetScore}
              isAdmin={isAdmin}
              adminEditing={adminEditing}
              onSetOfficial={onSetOfficial}
              onClearOfficial={onClearOfficial}
              player={player}
              poolSettings={poolSettings}
            />
          ) : (
            <div className="groups-grid">
              {GL.map(L => (
                <GroupCard
                  key={L}
                  group={L}
                  predictions={predictions}
                  officialResults={officialResults}
                  kickoffs={kickoffs}
                  onSetScore={onSetScore}
                  isAdmin={isAdmin}
                  adminEditing={adminEditing}
                  onSetOfficial={onSetOfficial}
                  onClearOfficial={onClearOfficial}
                  player={player}
                  poolSettings={poolSettings}
                />
              ))}
            </div>
          )}

          {tipCount === totalGroupMatches && (
            <div className="step-prompt" style={{ marginTop: 16 }}>
              <span className="step-prompt-txt">🎉 All 72 group tips done! Head to the Bracket tab to tip the knockouts — they unlock once group results are in.</span>
              <button className="step-prompt-btn" onClick={() => setTab("ko")}>Go to Bracket →</button>
            </div>
          )}
        </>
      )}

      {mode === "tip" && tab === "ko" && (
        <div className="bracket-wrap">
          {tipCount < totalGroupMatches && (
            <div className="alert-red" style={{ marginBottom: 14 }}>
              ⚠️ You've only tipped {tipCount}/{totalGroupMatches} group matches — <button className="mini" style={{ display: "inline", padding: "2px 10px" }} onClick={() => setTab("groups")}>Go finish group tips →</button>
            </div>
          )}
          <KOBracket
            predictions={predictions}
            officialResults={officialResults}
            kickoffs={kickoffs}
            koTeams={koTeams}
            koWinners={koWinners}
            onSetScore={onSetScore}
            onSetPenalty={() => {}}
            isAdmin={isAdmin}
            adminEditing={adminEditing}
            onSetOfficial={onSetOfficial}
            onSetOfficialPen={onSetOfficialPen}
            onClearOfficial={onClearOfficial}
            player={player}
            poolSettings={poolSettings}
            groupStageComplete={groupStageComplete}
          />
        </div>
      )}

      {mode === "tip" && tab === "board" && (
        <>
          <Leaderboard
            leaderboard={leaderboard}
            player={player}
            onRefresh={fetchAll}
            loading={loading}
            poolSettings={poolSettings}
            isAdmin={isAdmin}
            onSaveSettings={savePoolSettings}
          />
          {isAdmin && (
            <div className="card pad" style={{ marginTop: 16 }}>
              <AdminPlayerManager players={players} onRefresh={fetchAll} />
            </div>
          )}
        </>
      )}

      {mode === "tip" && tab === "combined" && (
        <CombinedLeaderboard
          combinedLB={combinedLB}
          player={player}
          onRefresh={fetchAll}
          loading={loading}
        />
      )}

      {mode === "tip" && tab === "reveal" && (
        <TipsRoom
          players={players}
          predictions={predictions}
          officialResults={officialResults}
          player={player}
          onRefresh={fetchAll}
          loading={loading}
          poolSettings={poolSettings}
        />
      )}

      {/* PREDICTOR TABS */}
      {mode === "pred" && (
        <>
          {!predLocked && (
            <div style={{ background: "rgba(18,179,166,.1)", border: "1px solid rgba(18,179,166,.3)", borderRadius: 13, padding: "13px 17px", marginBottom: 12, fontSize: 13, color: "#0c6f66", lineHeight: 1.55, fontWeight: 500 }}>
              Fill out the whole tournament now: pick each group's top 2, your 8 best third-placed teams, then click winners through every round to your champion — plus the four player awards. Everything locks at the <strong>first kick-off</strong> ({fmtKick(firstKickoff)}) — you can't predict once the tournament has started. No scores here — just who goes through.
            </div>
          )}
          {predLocked && ptab !== "pl" && (
            <div className="notice lock">🔒 Predictor picks are locked — the tournament has started.</div>
          )}

          {ptab === "pg" && (
            <>
              <PredictorGroups
                key={predictorResetKey}
                bracketPred={myBracket}
                locked={predLocked}
                onPickPos={onPickPos}
                onPickThird={onPickThird}
                onSuggest={onSuggestFromTips}
                canSuggest={canSuggest}
                suggestionKey={suggestionKey}
              />
              {(() => {
                const gp = myBracket?.groupPicks ? JSON.parse(myBracket.groupPicks) : {};
                const tp = myBracket?.thirdPicks ? JSON.parse(myBracket.thirdPicks) : {};
                const groupsDone = GL.filter(L => gp[L]?.first && gp[L]?.second).length === 12;
                const thirdsDone = Object.values(tp).filter(Boolean).length >= 8;
                if (groupsDone && thirdsDone) return (
                  <div className="step-prompt" style={{ marginTop: 14 }}>
                    <span className="step-prompt-txt">✅ All groups & best 3rd picks done! Now click winners through the knockout bracket.</span>
                    <button className="step-prompt-btn" onClick={() => setPtab("pb")}>Go to Bracket →</button>
                  </div>
                );
                return null;
              })()}
            </>
          )}

          {ptab === "pb" && (
            <>
              <PredictorBracket
                key={predictorResetKey}
                bracketPred={myBracket}
                locked={predLocked}
                koTeams={predKOTeams}
                onPickAdvance={onPickAdvance}
                onGoToAwards={() => setPtab("pa")}
              />
              {(() => {
                const ap = myBracket?.advancePicks ? JSON.parse(myBracket.advancePicks) : {};
                const koMatchCount = KO_MATCHES.filter(m => m.round !== "3rd").length;
                const pickedCount = Object.values(ap).filter(Boolean).length;
                if (pickedCount >= koMatchCount - 1) return (
                  <div className="step-prompt" style={{ marginTop: 14 }}>
                    <span className="step-prompt-txt">🏆 Bracket looking good! Last step — pick your four individual award winners.</span>
                    <button className="step-prompt-btn" onClick={() => setPtab("pa")}>Go to Awards →</button>
                  </div>
                );
                return null;
              })()}
            </>
          )}

          {ptab === "pa" && (
            <>
              <PredictorAwards
                bracketPred={myBracket}
                locked={predLocked}
                onSetAward={onSetAward}
                officialAwards={officialAwards}
                isAdmin={isAdmin}
                onSetOfficialAward={onSetOfficialAward}
                predSettings={predSettings}
              />
              {(() => {
                const awards = myBracket?.awardPicks ? JSON.parse(myBracket.awardPicks) : {};
                const awardsDone = ["boot","ball","young","glove"].every(k => awards[k]?.trim());
                if (awardsDone) return (
                  <div className="step-prompt" style={{ marginTop: 14 }}>
                    <span className="step-prompt-txt">🎉 Predictor complete! Check the leaderboard to see how you stack up against everyone else.</span>
                    <button className="step-prompt-btn" onClick={() => setPtab("pl")}>View Leaderboard →</button>
                  </div>
                );
                return null;
              })()}
            </>
          )}

          {ptab === "pl" && (
            <PredictorLeaderboard
              predLB={predLB}
              player={player}
              predSettings={predSettings}
              onRefresh={fetchAll}
              loading={loading}
              isAdmin={isAdmin}
              onSavePredSettings={async (newSettings) => {
                await savePoolSettings({ predSettings: JSON.stringify({ ...predSettings, ...newSettings }) });
              }}
            />
          )}
        </>
      )}

      <footer className="ft" style={{ paddingBottom: 72 }}>
        Tables sort on points → goal difference → goals scored. Admin PIN is a light lock for friendly pools, not real security. Built for fun — not affiliated with FIFA.
      </footer>

      {showKickEditor && (
        <KickoffEditor
          kickoffs={kickoffs}
          onSetKickoff={onSetKickoff}
          onClose={() => setShowKickEditor(false)}
        />
      )}

      {resultNotification && (() => {
        const allMatches = [...GROUP_MATCHES, ...KO_MATCHES];
        const m = allMatches.find(x => x.id === resultNotification.matchId);
        const label = m ? `${m.home} ${resultNotification.home} – ${resultNotification.away} ${m.away}` : `Result posted`;
        return (
          <div style={{
            position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
            zIndex: 100, background: "linear-gradient(95deg,#2cb551,#12b3a6)",
            color: "#fff", borderRadius: 14, padding: "14px 22px",
            boxShadow: "0 12px 36px -10px rgba(18,179,166,.6)",
            display: "flex", alignItems: "center", gap: 12,
            fontSize: 14, fontWeight: 800, maxWidth: "90vw",
            animation: "slideDown .3s ease"
          }}>
            <span style={{ fontSize: 20 }}>⚽</span>
            <div>
              <div style={{ fontSize: 11, opacity: .85, textTransform: "uppercase", letterSpacing: ".06em" }}>Result just in!</div>
              <div>{label}</div>
            </div>
            <button onClick={() => setResultNotification(null)} style={{
              marginLeft: 8, background: "rgba(255,255,255,.25)", border: "none",
              borderRadius: 999, width: 24, height: 24, color: "#fff",
              cursor: "pointer", fontSize: 13, fontWeight: 900, lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>✕</button>
          </div>
        );
      })()}

      {showHelp && (
        <HelpModal
          player={player}
          onClose={() => {
            localStorage.setItem(`wc_help_seen_${player.id}`, "1");
            setShowHelp(false);
          }}
        />
      )}

      {showCeremony && (
        <CeremonyModal
          leaderboard={leaderboard}
          predLB={predLB}
          player={player}
          onClose={() => {
            localStorage.setItem(`wc_ceremony_seen_${player.id}`, "1");
            setShowCeremony(false);
          }}
        />
      )}
    </div>

      {/* Bottom nav rendered OUTSIDE .wc to avoid overflow:hidden stacking context trapping fixed positioning */}
      <nav className="desk-nav">
        {mode === "tip" ? (
          <>
            {[["groups","⚽","Groups"],["ko","🏆","Bracket"],["board","🏅","Leaderboard"],["reveal","👀","Tips"],["combined","🌟","Combined"]].map(([k,ic,lbl]) => (
              <button key={k} className={`desk-nav-btn${tab===k?" act":""}`} onClick={() => setTab(k)}>
                <span className="dnic">{ic}</span>{lbl}
              </button>
            ))}
            <div className="desk-nav-sep" />
            <a href="/live" className="desk-nav-live">
              <span className="dnic">📺</span>Live
            </a>
          </>
        ) : (
          <>
            {[["pg","🥇","Groups"],["pb","🏆","Bracket"],["pa","🏅","Awards"],["pl","📊","Leaderboard"]].map(([k,ic,lbl]) => (
              <button key={k} className={`desk-nav-btn${ptab===k?" act":""}`} onClick={() => setPtab(k)}>
                <span className="dnic">{ic}</span>{lbl}
              </button>
            ))}
            <div className="desk-nav-sep" />
            <a href="/live" className="desk-nav-live">
              <span className="dnic">📺</span>Live
            </a>
          </>
        )}
      </nav>
    </>
  );
}

// Third-place slot constraints
const THIRD_SLOT_GROUPS = {
  "3CEFHI": ["C","E","F","H","I"],
  "3ABCDF": ["A","B","C","D","F"],
  "3EFGIJ": ["E","F","G","I","J"],
  "3DEIJL": ["D","E","I","J","L"],
  "3AEHIJ": ["A","E","H","I","J"],
  "3CDFGH": ["C","D","F","G","H"],
  "3BEFIJ": ["B","E","F","I","J"],
  "3EHIJK": ["E","H","I","J","K"],
};
const THIRD_SLOT_KEYS = Object.keys(THIRD_SLOT_GROUPS);

function assignThirdPlaceTeams(tp, slotTeams) {
  const picks = GL.map(L => tp[L]).filter(Boolean);
  const slots = THIRD_SLOT_KEYS.slice();
  const assignment = new Array(slots.length).fill(null);

  const eligibleSlots = picks.map(team => {
    const groupL = GL.find(L => tp[L] === team);
    return slots.reduce((acc, sk, i) => {
      if (THIRD_SLOT_GROUPS[sk].includes(groupL)) acc.push(i);
      return acc;
    }, []);
  });

  let bestAssignment = null;
  let bestCount = -1;

  function backtrack(pickIdx, usedSlots) {
    if (pickIdx === picks.length) {
      const count = assignment.filter(x => x !== null && x !== -1).length;
      if (count > bestCount) { bestCount = count; bestAssignment = assignment.slice(); }
      return;
    }
    // Try every eligible slot for this pick
    for (const si of eligibleSlots[pickIdx]) {
      if (!usedSlots.has(si)) {
        assignment[pickIdx] = si;
        usedSlots.add(si);
        backtrack(pickIdx + 1, usedSlots);
        usedSlots.delete(si);
        assignment[pickIdx] = null;
      }
    }
    // Also try leaving this pick unplaced so later picks can use slots this one could have taken
    assignment[pickIdx] = -1;
    backtrack(pickIdx + 1, usedSlots);
    assignment[pickIdx] = null;
  }

  backtrack(0, new Set());

  if (bestAssignment) {
    for (let i = 0; i < picks.length; i++) {
      const si = bestAssignment[i];
      if (si != null && si !== -1) slotTeams[slots[si]] = picks[i];
    }
  }

  const placed = new Set(
    (bestAssignment || []).map((si, i) => (si != null && si !== -1 ? picks[i] : null)).filter(Boolean)
  );
  const emptySlots = slots.filter(sk => !slotTeams[sk]);
  for (const team of picks) {
    if (!placed.has(team) && emptySlots.length > 0) slotTeams[emptySlots.shift()] = team;
  }
}

function buildKOWinners(officialResults) {
  const winners = {};
  for (const res of officialResults) {
    if (res.homeScore == null || res.awayScore == null) continue;
    const h = +res.homeScore, a = +res.awayScore;
    const m = KO_MATCHES.find(x => x.id === res.matchId);
    if (!m) continue;
    if (h > a) winners[res.matchId] = "h";
    else if (h < a) winners[res.matchId] = "a";
    else if (res.penaltyWinner) winners[res.matchId] = res.penaltyWinner;
  }
  return winners;
}

function groupPicks(bp) {
  return bp?.groupPicks ? JSON.parse(bp.groupPicks) : {};
}
function thirdPicks(bp) {
  return bp?.thirdPicks ? JSON.parse(bp.thirdPicks) : {};
}

// Build predictor's KO team map from their group/advance picks (for predictor UI display)
function buildKOTeams(gp, tp, ap) {
  const slotTeams = {};
  for (const L of ["A","B","C","D","E","F","G","H","I","J","K","L"]) {
    slotTeams[`1${L}`] = gp[L]?.first || null;
    slotTeams[`2${L}`] = gp[L]?.second || null;
  }

  // Each R32 "best 3rd" slot accepts one team from a specific set of groups.
  // tp is { [groupLetter]: teamName } — assign each group's best-3rd to exactly one slot.
  // We iterate the user's picks and place each into the first unoccupied slot that accepts their group.
  assignThirdPlaceTeams(tp, slotTeams);

  const teamOf = {};
  for (const m of KO_MATCHES) {
    const home = slotTeams[m.h] || null;
    const away = slotTeams[m.a] || null;
    teamOf[m.id] = { home, away };
    // winner slot key: e.g. M73 → WM73
    if (ap[m.id] === "h" && home) {
      slotTeams[`W${m.id}`] = home;
      slotTeams[`L${m.id}`] = away; // loser goes to 3rd place
    }
    if (ap[m.id] === "a" && away) {
      slotTeams[`W${m.id}`] = away;
      slotTeams[`L${m.id}`] = home; // loser goes to 3rd place
    }
  }
  return teamOf;
}