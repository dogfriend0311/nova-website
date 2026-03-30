import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

const SUPABASE_URL = "https://expzaiduzjehvyfclnnj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cHphaWR1emplaHZ5ZmNsbm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTUwNTQsImV4cCI6MjA4ODI3MTA1NH0.ZZrWRASkBWha6XDuw23bazoXK224diM0HTlgPkdLCy0";
const H = (x={}) => ({ apikey:SUPABASE_ANON_KEY, Authorization:`Bearer ${SUPABASE_ANON_KEY}`, "Content-Type":"application/json", ...x });
const sbUp = async (bucket, uid, file, pre="") => {
  const path = `${pre}${uid}-${Date.now()}.${file.name.split(".").pop()}`;
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, { method:"POST", headers:{ apikey:SUPABASE_ANON_KEY, Authorization:`Bearer ${SUPABASE_ANON_KEY}`, "Content-Type":file.type }, body:file });
  if (!r.ok) { console.error("upload fail", bucket, await r.text()); return null; }
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};
const sb = {
  get:   async (t,q="")    => { try { const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}${q}`,{headers:H()}); if(!r.ok){console.error("sb.get",t,await r.text());return null;} return r.json(); } catch(e){console.error(e);return null;} },
  post:  async (t,b)       => { try { const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}`,{method:"POST",headers:H({Prefer:"return=representation"}),body:JSON.stringify(b)}); if(!r.ok){console.error("sb.post",t,await r.text());return null;} return r.json(); } catch(e){console.error(e);return null;} },
  patch: async (t,q,b)     => { try { const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}${q}`,{method:"PATCH",headers:H({Prefer:"return=representation"}),body:JSON.stringify(b)}); return r.ok?r.json():null; } catch(e){console.error(e);return null;} },
  del:   async (t,q)       => { try { await fetch(`${SUPABASE_URL}/rest/v1/${t}${q}`,{method:"DELETE",headers:H()}); } catch(e){console.error(e);} },
  upsert:async (t,b,conflict="id") => { try { const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}`,{method:"POST",headers:H({"Prefer":`resolution=merge-duplicates,return=representation`,"Content-Type":"application/json"}),body:JSON.stringify(b)}); if(!r.ok){console.error("sb.upsert",t,await r.text());return null;} return r.json(); } catch(e){console.error(e);return null;} },
  upload:      (uid,file)       => sbUp("nova-avatars",uid,file,"av-"),
  uploadBanner:(uid,file,slot)  => sbUp("nova-banners",uid,file,`${slot}-`),
  uploadClip:  (uid,file)       => sbUp("nova-clips",uid,file,"cl-"),
};
const getSess  = () => { try { return JSON.parse(localStorage.getItem("nova_session")); } catch { return null; } };
const saveSess = u  => { try { localStorage.setItem("nova_session", JSON.stringify(u)); } catch {} };
const clearSess   = () => { try { localStorage.removeItem("nova_session"); } catch {} };

function useIsMobile(bp=768) {
  const [m,setM] = useState(()=>window.innerWidth<bp);
  useEffect(()=>{ const h=()=>setM(window.innerWidth<bp); window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h); },[bp]);
  return m;
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#030712;color:#E2E8F0;font-family:'Rajdhani',sans-serif;overflow-x:hidden}
  @keyframes twinkle{0%{opacity:.1;transform:scale(.7)}100%{opacity:1;transform:scale(1.4)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  @keyframes bellShake{0%,100%{transform:rotate(0)}20%{transform:rotate(-14deg)}40%{transform:rotate(14deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(8deg)}}
  @keyframes badgePop{0%{transform:scale(0) rotate(-15deg);opacity:0}70%{transform:scale(1.15) rotate(4deg)}100%{transform:scale(1) rotate(0);opacity:1}}
  @keyframes carouselIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
  @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  div:hover>.gif-star{opacity:1!important;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fadeUp{animation:fadeUp .55s ease both}
  .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
  .notif-item{animation:slideIn .25s ease both}
  .badge-pop{animation:badgePop .4s cubic-bezier(.34,1.56,.64,1) both}
  .carousel-slide{animation:carouselIn .3s ease both}
  .bell-shake{animation:bellShake .6s ease}
  .msg-in{animation:msgIn .2s ease both}
  .spin{animation:spin 1s linear infinite}
  a{color:inherit;text-decoration:none}
  input,textarea,select{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#E2E8F0;font-family:'Rajdhani',sans-serif;font-size:16px;padding:10px 14px;outline:none;width:100%;transition:border-color .2s,box-shadow .2s}
  input:focus,textarea:focus,select:focus{border-color:#00D4FF;box-shadow:0 0 0 3px rgba(0,212,255,.1)}
  input::placeholder,textarea::placeholder{color:#475569}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#030712}::-webkit-scrollbar-thumb{background:rgba(0,212,255,.2);border-radius:4px}
  iframe{display:block}
  .comment-row:hover .del-btn{opacity:1!important}
  .feed-item{scroll-snap-align:start}
  .feed-wrap{scroll-snap-type:y mandatory;overflow-y:scroll}
  .mob-nav{position:fixed;bottom:0;left:0;right:0;z-index:150;background:rgba(3,7,18,.97);backdrop-filter:blur(24px);border-top:1px solid rgba(255,255,255,.08);display:flex;height:58px;padding-bottom:env(safe-area-inset-bottom,0px)}
  .mob-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border:none;background:none;cursor:pointer;padding:4px 0;min-width:0}
  .mob-tab-icon{font-size:19px;line-height:1;position:relative;display:inline-block}
  .mob-tab-label{font-size:9px;font-family:'Orbitron',sans-serif;font-weight:700;letter-spacing:.04em;white-space:nowrap}
  @keyframes epicPulse{0%,100%{box-shadow:0 0 14px #A855F7,0 0 4px #A855F7}50%{box-shadow:0 0 34px #A855F7,0 0 60px #A855F788}}
  @keyframes legendFlare{0%,100%{box-shadow:0 0 16px #F59E0B,0 0 6px #F59E0B}33%{box-shadow:0 0 38px #F59E0B,0 0 72px #F59E0BAA,0 0 5px #EF4444}66%{box-shadow:0 0 26px #F59E0B,0 0 48px #F59E0B88}}
  @keyframes rarePulse{0%,100%{box-shadow:0 0 8px #818CF8}50%{box-shadow:0 0 22px #818CF8,0 0 40px #818CF844}}
  @keyframes shimmer{0%{background-position:200% 50%}100%{background-position:-200% 50%}}
  @keyframes starPop{0%{transform:translateX(-50%) scale(0);opacity:0}70%{transform:translateX(-50%) scale(1.18)}100%{transform:translateX(-50%) scale(1);opacity:1}}
  @keyframes cardFanOut{from{opacity:0;transform:scale(.55) translateY(50px)}to{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes cardDrop{from{opacity:0;transform:scale(.45) translateY(-40px) rotate(-10deg)}to{opacity:1;transform:scale(1) translateY(0) rotate(0deg)}}
  @keyframes burst{0%{transform:translate(-50%,-50%) rotate(var(--angle)) translateX(0) scale(1);opacity:1}100%{transform:translate(-50%,-50%) rotate(var(--angle)) translateX(var(--dist)) scale(0);opacity:0}}
`;


const gid = () => "x"+Date.now()+Math.random().toString(36).slice(2,5);
const extractSpotify = u => { const m=u.match(/track\/([A-Za-z0-9]+)/); return m?m[1]:null; };
const extractYT = u => { const m=u.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/); return m?m[1]:null; };
const extractYouTube = u => { const m=u.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/); return m?m[1]:null; };
const extractMedal   = u => { const m=u.match(/clips\/(\d+)/); return m?m[1]:null; };
const fmtTime = ts => { const d=Math.floor((Date.now()-ts)/1000); if(d<60)return"just now"; if(d<3600)return`${Math.floor(d/60)}m ago`; if(d<86400)return`${Math.floor(d/3600)}h ago`; return new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric"}); };
const fmtAgo  = fmtTime;
const fmtMsg  = ts => new Date(ts).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
const ROLE_COLOR  = { Owner:"#F59E0B", "Co-owner":"#FB923C", "Ring Rush Admin":"#EC4899", Moderator:"#00D4FF", "Event Host":"#A78BFA", Helper:"#34D399" };
const STATUS_META = { online:{color:"#22C55E",label:"Online"}, idle:{color:"#EAB308",label:"Idle"}, dnd:{color:"#EF4444",label:"Do Not Disturb"}, offline:{color:"#6B7280",label:"Offline"} };
const SOCIAL_ICONS = {
  roblox:    <svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M117.53 0L0 394.47 394.47 512 512 117.53zm177.39 289.73l-94.66-28.46 28.46-94.66 94.66 28.46z"/></svg>,
  discord:   <svg width="16" height="16" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>,
  instagram: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  twitter:   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  youtube:   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>,
};
const SOCIAL_COLORS = { roblox:"#E53935", discord:"#5865F2", instagram:"#E1306C", twitter:"#000000", youtube:"#FF0000" };
const SOCIAL_LABELS = { roblox:"Roblox", discord:"Discord", instagram:"Instagram", twitter:"Twitter/X", youtube:"YouTube" };
const MLB_TEAMS = [
  {id:"mlb_nyy",abbr:"NYY",espn:"nyy",name:"Yankees",color:"#003087",div:"AL East"},{id:"mlb_bos",abbr:"BOS",espn:"bos",name:"Red Sox",color:"#BD3039",div:"AL East"},
  {id:"mlb_tor",abbr:"TOR",espn:"tor",name:"Blue Jays",color:"#134A8E",div:"AL East"},{id:"mlb_bal",abbr:"BAL",espn:"bal",name:"Orioles",color:"#DF4601",div:"AL East"},
  {id:"mlb_tb",abbr:"TB",espn:"tb",name:"Rays",color:"#092C5C",div:"AL East"},{id:"mlb_cws",abbr:"CWS",espn:"chw",name:"White Sox",color:"#27251F",div:"AL Central"},
  {id:"mlb_cle",abbr:"CLE",espn:"cle",name:"Guardians",color:"#00385D",div:"AL Central"},{id:"mlb_det",abbr:"DET",espn:"det",name:"Tigers",color:"#0C2340",div:"AL Central"},
  {id:"mlb_kc",abbr:"KC",espn:"kc",name:"Royals",color:"#004687",div:"AL Central"},{id:"mlb_min",abbr:"MIN",espn:"min",name:"Twins",color:"#002B5C",div:"AL Central"},
  {id:"mlb_hou",abbr:"HOU",espn:"hou",name:"Astros",color:"#EB6E1F",div:"AL West"},{id:"mlb_laa",abbr:"LAA",espn:"laa",name:"Angels",color:"#BA0021",div:"AL West"},
  {id:"mlb_oak",abbr:"OAK",espn:"oak",name:"Athletics",color:"#003831",div:"AL West"},{id:"mlb_sea",abbr:"SEA",espn:"sea",name:"Mariners",color:"#0C2C56",div:"AL West"},
  {id:"mlb_tex",abbr:"TEX",espn:"tex",name:"Rangers",color:"#003278",div:"AL West"},{id:"mlb_atl",abbr:"ATL",espn:"atl",name:"Braves",color:"#CE1141",div:"NL East"},
  {id:"mlb_mia",abbr:"MIA",espn:"mia",name:"Marlins",color:"#00A3E0",div:"NL East"},{id:"mlb_nym",abbr:"NYM",espn:"nym",name:"Mets",color:"#002D72",div:"NL East"},
  {id:"mlb_phi",abbr:"PHI",espn:"phi",name:"Phillies",color:"#E81828",div:"NL East"},{id:"mlb_wsh",abbr:"WSH",espn:"wsh",name:"Nationals",color:"#AB0003",div:"NL East"},
  {id:"mlb_chc",abbr:"CHC",espn:"chc",name:"Cubs",color:"#0E3386",div:"NL Central"},{id:"mlb_cin",abbr:"CIN",espn:"cin",name:"Reds",color:"#C6011F",div:"NL Central"},
  {id:"mlb_mil",abbr:"MIL",espn:"mil",name:"Brewers",color:"#12284B",div:"NL Central"},{id:"mlb_pit",abbr:"PIT",espn:"pit",name:"Pirates",color:"#FDB827",div:"NL Central"},
  {id:"mlb_stl",abbr:"STL",espn:"stl",name:"Cardinals",color:"#C41E3A",div:"NL Central"},{id:"mlb_ari",abbr:"ARI",espn:"ari",name:"D-backs",color:"#A71930",div:"NL West"},
  {id:"mlb_col",abbr:"COL",espn:"col",name:"Rockies",color:"#33006F",div:"NL West"},{id:"mlb_lad",abbr:"LAD",espn:"lad",name:"Dodgers",color:"#005A9C",div:"NL West"},
  {id:"mlb_sd",abbr:"SD",espn:"sd",name:"Padres",color:"#2F241D",div:"NL West"},{id:"mlb_sf",abbr:"SF",espn:"sf",name:"Giants",color:"#FD5A1E",div:"NL West"},
];
const NFL_TEAMS = [
  {id:"nfl_buf",abbr:"BUF",espn:"buf",name:"Bills",color:"#00338D",div:"AFC East"},{id:"nfl_mia",abbr:"MIA",espn:"mia",name:"Dolphins",color:"#008E97",div:"AFC East"},
  {id:"nfl_ne",abbr:"NE",espn:"ne",name:"Patriots",color:"#002244",div:"AFC East"},{id:"nfl_nyj",abbr:"NYJ",espn:"nyj",name:"Jets",color:"#125740",div:"AFC East"},
  {id:"nfl_bal",abbr:"BAL",espn:"bal",name:"Ravens",color:"#241773",div:"AFC North"},{id:"nfl_cin",abbr:"CIN",espn:"cin",name:"Bengals",color:"#FB4F14",div:"AFC North"},
  {id:"nfl_cle",abbr:"CLE",espn:"cle",name:"Browns",color:"#FF3C00",div:"AFC North"},{id:"nfl_pit",abbr:"PIT",espn:"pit",name:"Steelers",color:"#FFB612",div:"AFC North"},
  {id:"nfl_hou",abbr:"HOU",espn:"hou",name:"Texans",color:"#03202F",div:"AFC South"},{id:"nfl_ind",abbr:"IND",espn:"ind",name:"Colts",color:"#002C5F",div:"AFC South"},
  {id:"nfl_jax",abbr:"JAX",espn:"jax",name:"Jaguars",color:"#006778",div:"AFC South"},{id:"nfl_ten",abbr:"TEN",espn:"ten",name:"Titans",color:"#0C2340",div:"AFC South"},
  {id:"nfl_den",abbr:"DEN",espn:"den",name:"Broncos",color:"#FB4F14",div:"AFC West"},{id:"nfl_kc",abbr:"KC",espn:"kc",name:"Chiefs",color:"#E31837",div:"AFC West"},
  {id:"nfl_lv",abbr:"LV",espn:"lv",name:"Raiders",color:"#A5ACAF",div:"AFC West"},{id:"nfl_lac",abbr:"LAC",espn:"lac",name:"Chargers",color:"#0080C6",div:"AFC West"},
  {id:"nfl_dal",abbr:"DAL",espn:"dal",name:"Cowboys",color:"#003594",div:"NFC East"},{id:"nfl_nyg",abbr:"NYG",espn:"nyg",name:"Giants",color:"#0B2265",div:"NFC East"},
  {id:"nfl_phi",abbr:"PHI",espn:"phi",name:"Eagles",color:"#004C54",div:"NFC East"},{id:"nfl_wsh",abbr:"WSH",espn:"wsh",name:"Commanders",color:"#5A1414",div:"NFC East"},
  {id:"nfl_chi",abbr:"CHI",espn:"chi",name:"Bears",color:"#0B162A",div:"NFC North"},{id:"nfl_det",abbr:"DET",espn:"det",name:"Lions",color:"#0076B6",div:"NFC North"},
  {id:"nfl_gb",abbr:"GB",espn:"gb",name:"Packers",color:"#203731",div:"NFC North"},{id:"nfl_min",abbr:"MIN",espn:"min",name:"Vikings",color:"#4F2683",div:"NFC North"},
  {id:"nfl_atl",abbr:"ATL",espn:"atl",name:"Falcons",color:"#A71930",div:"NFC South"},{id:"nfl_car",abbr:"CAR",espn:"car",name:"Panthers",color:"#0085CA",div:"NFC South"},
  {id:"nfl_no",abbr:"NO",espn:"no",name:"Saints",color:"#D3BC8D",div:"NFC South"},{id:"nfl_tb",abbr:"TB",espn:"tb",name:"Buccaneers",color:"#D50A0A",div:"NFC South"},
  {id:"nfl_ari",abbr:"ARI",espn:"ari",name:"Cardinals",color:"#97233F",div:"NFC West"},{id:"nfl_lar",abbr:"LAR",espn:"lar",name:"Rams",color:"#003594",div:"NFC West"},
  {id:"nfl_sf",abbr:"SF",espn:"sf",name:"49ers",color:"#AA0000",div:"NFC West"},{id:"nfl_sea",abbr:"SEA",espn:"sea",name:"Seahawks",color:"#002244",div:"NFC West"},
];
const NBA_TEAMS = [
  {id:"nba_atl",abbr:"ATL",espn:"atl",name:"Hawks",color:"#C1272D",div:"SE"},{id:"nba_bos",abbr:"BOS",espn:"bos",name:"Celtics",color:"#007A33",div:"Atlantic"},
  {id:"nba_bkn",abbr:"BKN",espn:"bkn",name:"Nets",color:"#000000",div:"Atlantic"},{id:"nba_cha",abbr:"CHA",espn:"cha",name:"Hornets",color:"#1D1160",div:"SE"},
  {id:"nba_chi",abbr:"CHI",espn:"chi",name:"Bulls",color:"#CE1141",div:"Central"},{id:"nba_cle",abbr:"CLE",espn:"cle",name:"Cavaliers",color:"#860038",div:"Central"},
  {id:"nba_dal",abbr:"DAL",espn:"dal",name:"Mavericks",color:"#00538C",div:"SW"},{id:"nba_den",abbr:"DEN",espn:"den",name:"Nuggets",color:"#0E2240",div:"NW"},
  {id:"nba_det",abbr:"DET",espn:"det",name:"Pistons",color:"#C8102E",div:"Central"},{id:"nba_gsw",abbr:"GSW",espn:"gs",name:"Warriors",color:"#1D428A",div:"Pacific"},
  {id:"nba_hou",abbr:"HOU",espn:"hou",name:"Rockets",color:"#CE1141",div:"SW"},{id:"nba_ind",abbr:"IND",espn:"ind",name:"Pacers",color:"#002D62",div:"Central"},
  {id:"nba_lac",abbr:"LAC",espn:"lac",name:"Clippers",color:"#C8102E",div:"Pacific"},{id:"nba_lal",abbr:"LAL",espn:"lal",name:"Lakers",color:"#552583",div:"Pacific"},
  {id:"nba_mem",abbr:"MEM",espn:"mem",name:"Grizzlies",color:"#5D76A9",div:"SW"},{id:"nba_mia",abbr:"MIA",espn:"mia",name:"Heat",color:"#98002E",div:"SE"},
  {id:"nba_mil",abbr:"MIL",espn:"mil",name:"Bucks",color:"#00471B",div:"Central"},{id:"nba_min",abbr:"MIN",espn:"min",name:"Timberwolves",color:"#0C2340",div:"NW"},
  {id:"nba_nop",abbr:"NOP",espn:"no",name:"Pelicans",color:"#0C2340",div:"SW"},{id:"nba_nyk",abbr:"NYK",espn:"ny",name:"Knicks",color:"#006BB6",div:"Atlantic"},
  {id:"nba_okc",abbr:"OKC",espn:"okc",name:"Thunder",color:"#007AC1",div:"NW"},{id:"nba_orl",abbr:"ORL",espn:"orl",name:"Magic",color:"#0077C0",div:"SE"},
  {id:"nba_phi",abbr:"PHI",espn:"phi",name:"76ers",color:"#006BB6",div:"Atlantic"},{id:"nba_phx",abbr:"PHX",espn:"phx",name:"Suns",color:"#1D1160",div:"Pacific"},
  {id:"nba_por",abbr:"POR",espn:"por",name:"Trail Blazers",color:"#E03A3E",div:"NW"},{id:"nba_sac",abbr:"SAC",espn:"sac",name:"Kings",color:"#5A2D81",div:"Pacific"},
  {id:"nba_sas",abbr:"SAS",espn:"sa",name:"Spurs",color:"#C4CED4",div:"SW"},{id:"nba_tor",abbr:"TOR",espn:"tor",name:"Raptors",color:"#CE1141",div:"Atlantic"},
  {id:"nba_uta",abbr:"UTA",espn:"utah",name:"Jazz",color:"#002B5C",div:"NW"},{id:"nba_was",abbr:"WAS",espn:"wsh",name:"Wizards",color:"#002B5C",div:"SE"},
];
const NHL_TEAMS = [
  {id:"nhl_ana",abbr:"ANA",espn:"ana",name:"Ducks",color:"#F47A38",div:"Pacific"},{id:"nhl_bos",abbr:"BOS",espn:"bos",name:"Bruins",color:"#FFB81C",div:"Atlantic"},
  {id:"nhl_buf",abbr:"BUF",espn:"buf",name:"Sabres",color:"#003087",div:"Atlantic"},{id:"nhl_cgy",abbr:"CGY",espn:"cgy",name:"Flames",color:"#C8102E",div:"Pacific"},
  {id:"nhl_car",abbr:"CAR",espn:"car",name:"Hurricanes",color:"#CC0000",div:"Metro"},{id:"nhl_chi",abbr:"CHI",espn:"chi",name:"Blackhawks",color:"#CF0A2C",div:"Central"},
  {id:"nhl_col",abbr:"COL",espn:"col",name:"Avalanche",color:"#6F263D",div:"Central"},{id:"nhl_cbj",abbr:"CBJ",espn:"cbj",name:"Blue Jackets",color:"#002654",div:"Metro"},
  {id:"nhl_dal",abbr:"DAL",espn:"dal",name:"Stars",color:"#006847",div:"Central"},{id:"nhl_det",abbr:"DET",espn:"det",name:"Red Wings",color:"#CE1126",div:"Atlantic"},
  {id:"nhl_edm",abbr:"EDM",espn:"edm",name:"Oilers",color:"#FF4C00",div:"Pacific"},{id:"nhl_fla",abbr:"FLA",espn:"fla",name:"Panthers",color:"#041E42",div:"Atlantic"},
  {id:"nhl_lak",abbr:"LAK",espn:"la",name:"Kings",color:"#111111",div:"Pacific"},{id:"nhl_min",abbr:"MIN",espn:"min",name:"Wild",color:"#154734",div:"Central"},
  {id:"nhl_mtl",abbr:"MTL",espn:"mtl",name:"Canadiens",color:"#AF1E2D",div:"Atlantic"},{id:"nhl_nsh",abbr:"NSH",espn:"nsh",name:"Predators",color:"#FFB81C",div:"Central"},
  {id:"nhl_njd",abbr:"NJD",espn:"nj",name:"Devils",color:"#CE1126",div:"Metro"},{id:"nhl_nyi",abbr:"NYI",espn:"nyi",name:"Islanders",color:"#00539B",div:"Metro"},
  {id:"nhl_nyr",abbr:"NYR",espn:"nyr",name:"Rangers",color:"#0038A8",div:"Metro"},{id:"nhl_ott",abbr:"OTT",espn:"ott",name:"Senators",color:"#C2912C",div:"Atlantic"},
  {id:"nhl_phi",abbr:"PHI",espn:"phi",name:"Flyers",color:"#F74902",div:"Metro"},{id:"nhl_pit",abbr:"PIT",espn:"pit",name:"Penguins",color:"#FCB514",div:"Metro"},
  {id:"nhl_stl",abbr:"STL",espn:"stl",name:"Blues",color:"#002F87",div:"Central"},{id:"nhl_sjs",abbr:"SJS",espn:"sj",name:"Sharks",color:"#006D75",div:"Pacific"},
  {id:"nhl_sea",abbr:"SEA",espn:"sea",name:"Kraken",color:"#001628",div:"Pacific"},{id:"nhl_tbl",abbr:"TBL",espn:"tb",name:"Lightning",color:"#002868",div:"Atlantic"},
  {id:"nhl_tor",abbr:"TOR",espn:"tor",name:"Maple Leafs",color:"#00205B",div:"Atlantic"},{id:"nhl_van",abbr:"VAN",espn:"van",name:"Canucks",color:"#00205B",div:"Pacific"},
  {id:"nhl_vgk",abbr:"VGK",espn:"vgs",name:"Golden Knights",color:"#B4975A",div:"Pacific"},{id:"nhl_was",abbr:"WSH",espn:"wsh",name:"Capitals",color:"#041E42",div:"Metro"},
  {id:"nhl_wpg",abbr:"WPG",espn:"wpg",name:"Jets",color:"#041E42",div:"Central"},
];

const ALL_BADGES = [
  {id:"og",icon:"👑",label:"OG Member",color:"#F59E0B"},{id:"nova_star",icon:"💫",label:"Nova Star",color:"#00D4FF"},
  {id:"watchparty",icon:"🎬",label:"Watch Party Reg",color:"#A78BFA"},{id:"baseball",icon:"⚾",label:"Baseball Fan",color:"#34D399"},
  {id:"gamer",icon:"🎮",label:"Gaming Legend",color:"#F472B6"},{id:"music",icon:"🎵",label:"Music Guru",color:"#818CF8"},
  {id:"social",icon:"🤝",label:"Social Butterfly",color:"#2DD4BF"},{id:"champ",icon:"🏆",label:"Tourney Champ",color:"#FB923C"},
  {id:"earlybird",icon:"🚀",label:"Early Adopter",color:"#C084FC"},{id:"commfave",icon:"🌟",label:"Community Fave",color:"#FBBF24"},
  {id:"predictor",icon:"🎯",label:"Top Predictor",color:"#EF4444"},
];
const BADGES=ALL_BADGES;

// ─── Predictions ───────────────────────────────────────────────────────────────
function PredictPage({cu,users,setUsers,navigate}){
  const mob=useIsMobile();
  const[sport,setSport]=useState("mlb");
  const[games,setGames]=useState([]);
  const[loading,setLoading]=useState(true);
  const[predictions,setPredictions]=useState({});
  const[expanded,setExpanded]=useState({});

  // Resolve a playerId to a display name using ESPN's athlete endpoint
  const playerNameCache={};
  const resolvePlayer=async(playerId)=>{
    if(!playerId)return null;
    if(playerNameCache[playerId])return playerNameCache[playerId];
    try{
      const d=await(await fetch(`/api/hyperbeam?athlete=${playerId}`)).json();
      const name=d.name||null;
      if(name)playerNameCache[playerId]=name;
      return name;
    }catch{return null;}
  };

  const fetchMLBDetail=async(gameId)=>{
    try{
      const r=await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${gameId}`);
      const d=await r.json();
      return d;
    }catch{return null;}
  };

  const fetchGames=async s=>{
    setLoading(true);
    try{
      const sportPath=s==="mlb"?"baseball/mlb":s==="nfl"?"football/nfl":s==="nba"?"basketball/nba":"hockey/nhl";
      const data=await(await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard`)).json();
      const evs=await Promise.all((data.events||[]).map(async e=>{
        const comp=e.competitions[0];
        const home=comp.competitors.find(c=>c.homeAway==="home");
        const away=comp.competitors.find(c=>c.homeAway==="away");
        const st=comp.status?.type;
        const statusDetail=comp.status?.type?.shortDetail||"";
        const isMLB=s==="mlb";
        let detail=null;
        // Fetch game detail for all sports — needed for box scores, PBP, scoring plays
        try{
          const dPath=s==="mlb"?"baseball/mlb":s==="nfl"?"football/nfl":s==="nba"?"basketball/nba":"hockey/nhl";
          const dr=await fetch(`https://site.api.espn.com/apis/site/v2/sports/${dPath}/summary?event=${e.id}`);
          if(dr.ok)detail=await dr.json();
        }catch(e2){}
        const situation=detail?.situation;
        const halfMatch=statusDetail.match(/^(Top|Bot|Mid|End)\s/i);
        const inningHalf=halfMatch?halfMatch[1].charAt(0).toUpperCase()+halfMatch[1].slice(1).toLowerCase():"Top";
        const probables=comp.probables||[];
        const awayProb=probables.find(p=>p.homeAway==="away");
        const homeProb=probables.find(p=>p.homeAway==="home");
        const injuries=detail?.injuries||comp.injuries||[];
        const winPitcher=detail?.winPitcher;
        const losePitcher=detail?.losePitcher;
        const savePitcher=detail?.savePitcher;
        const leaders=detail?.leaders||comp.leaders||[];
        const boxTeams=detail?.boxscore?.teams||[];
        const boxPlayers=detail?.boxscore?.players||[];
        const linescore=detail?.linescore||comp.linescore||null;
        const scoringPlays=detail?.scoringPlays||[];
        // ESPN only returns playerId in situation — resolve names via athlete API
        const sitP=situation?.pitcher; const sitB=situation?.batter;
        const [pitcherName,batterName]=await Promise.all([
          resolvePlayer(sitP?.playerId),
          resolvePlayer(sitB?.playerId),
        ]);
        const currentPitcher=sitP?.playerId?{name:pitcherName,summary:""}:null;
        const currentBatter=sitB?.playerId?{name:batterName,summary:""}:null;
        // Period/quarter/period info for NBA/NHL
        const period=comp.status?.period??null;
        const clock=comp.status?.displayClock||"";
        return{
          id:e.id,date:e.date,sport:s,
          home:{name:home?.team?.displayName,abbr:home?.team?.abbreviation,logo:home?.team?.logo,score:home?.score,stats:home?.statistics||[]},
          away:{name:away?.team?.displayName,abbr:away?.team?.abbreviation,logo:away?.team?.logo,score:away?.score,stats:away?.statistics||[]},
          status:statusDetail||"Scheduled",
          started:st?.completed||st?.name==="STATUS_IN_PROGRESS",
          completed:st?.completed||false,
          isMLB,
          outs:situation?.outs??null,balls:situation?.balls??null,strikes:situation?.strikes??null,
          inning:situation?.period??null,inningHalf,
          onFirst:!!situation?.onFirst,onSecond:!!situation?.onSecond,onThird:!!situation?.onThird,
          currentPitcher,currentBatter,
          period,clock,
          awayProb:{name:awayProb?.athlete?.displayName,era:awayProb?.athlete?.statistics?.find(s=>s.name==="ERA")?.value,playerId:awayProb?.athlete?.id},
          homeProb:{name:homeProb?.athlete?.displayName,era:homeProb?.athlete?.statistics?.find(s=>s.name==="ERA")?.value,playerId:homeProb?.athlete?.id},
          injuries,winPitcher:winPitcher?{name:winPitcher.athlete?.displayName,wins:winPitcher.stats?.find?.(s=>s.name==="wins")?.value,losses:winPitcher.stats?.find?.(s=>s.name==="losses")?.value}:null,
          losePitcher:losePitcher?{name:losePitcher.athlete?.displayName,wins:losePitcher.stats?.find?.(s=>s.name==="wins")?.value,losses:losePitcher.stats?.find?.(s=>s.name==="losses")?.value}:null,
          savePitcher:savePitcher?{name:savePitcher.athlete?.displayName,saves:savePitcher.stats?.find?.(s=>s.name==="saves")?.value}:null,
          leaders,boxTeams,boxPlayers,linescore,scoringPlays,
        };
      }));
      setGames(evs);
    }catch(e){setGames([]);}
    setLoading(false);
  };

  useEffect(()=>{fetchGames(sport);},[sport]);
  useEffect(()=>{const t=setInterval(()=>fetchGames(sport),30000);return()=>clearInterval(t);},[sport]);
  // Auto-refresh at midnight PST (UTC-8) to load new day's schedule
  useEffect(()=>{
    const msPSTnow=()=>{const now=new Date();const pst=new Date(now.toLocaleString("en-US",{timeZone:"America/Los_Angeles"}));return pst;};
    const scheduleNext=()=>{
      const pst=msPSTnow();const next=new Date(pst);next.setDate(next.getDate()+1);next.setHours(0,0,5,0);
      const diff=next-pst;
      return setTimeout(()=>{fetchGames(sport);scheduleNext();},diff);
    };
    const t=scheduleNext();return()=>clearTimeout(t);
  },[sport]);
  useEffect(()=>{if(cu)setPredictions(cu.predictions||{});},[cu?.id]);

  const predict=async(gameId,pick)=>{
    if(!cu)return;
    // Use local predictions state (not cu.predictions) to avoid stale data across multiple picks
    const np={...predictions,[gameId]:pick};
    await sb.patch("nova_users",`?id=eq.${cu.id}`,{predictions:np});
    setUsers(prev=>prev.map(u=>u.id===cu.id?{...u,predictions:np}:u));
    setPredictions(np);
  };

  const toggleExp=id=>setExpanded(prev=>({...prev,[id]:!prev[id]}));

  const StatRow=({label,val,color="#94A3B8"})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
      <span style={{fontSize:11,color:"#475569"}}>{label}</span>
      <span style={{fontSize:12,fontWeight:700,color}}>{val||"—"}</span>
    </div>
  );

  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:"44px 16px 80px"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:28,fontWeight:700,marginBottom:8,background:"linear-gradient(135deg,#fff,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🎯 Predictions</h1>
        <p style={{color:"#475569",fontSize:14,marginBottom:20}}>Pick winners before games start. Locks when game begins. Live scores auto-update every 30s.</p>
        <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
          {[["mlb","⚾ MLB"],["nfl","🏈 NFL"],["nba","🏀 NBA"],["nhl","🏒 NHL"]].map(([s,l])=>(
            <button key={s} onClick={()=>setSport(s)} style={{padding:"8px 20px",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,border:`1px solid ${sport===s?"rgba(0,212,255,.5)":"rgba(255,255,255,.1)"}`,background:sport===s?"rgba(0,212,255,.12)":"rgba(255,255,255,.03)",color:sport===s?"#00D4FF":"#64748B",transition:"all .2s"}}>{l}</button>
          ))}
        </div>
      </div>
      {loading
        ?<div style={{textAlign:"center",padding:"60px 0",color:"#334155"}}><div className="spin" style={{fontSize:28,display:"inline-block",marginBottom:12}}>⚙️</div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,letterSpacing:".15em"}}>FETCHING LIVE DATA...</div></div>
        :games.length===0
          ?<Empty icon={sport==="mlb"?"⚾":sport==="nfl"?"🏈":sport==="nba"?"🏀":"🏒"} msg={`No ${sport.toUpperCase()} games today. Check back later!`}/>
          :<div style={{display:"flex",flexDirection:"column",gap:16}}>
            {games.map(g=>{
              const myPick=predictions[g.id];
              const locked=g.started;
              const homeWin=g.completed&&parseInt(g.home.score)>parseInt(g.away.score);
              const awayWin=g.completed&&parseInt(g.away.score)>parseInt(g.home.score);
              const ph=users.filter(u=>u.predictions?.[g.id]==="home").length;
              const pa=users.filter(u=>u.predictions?.[g.id]==="away").length;
              const tot=ph+pa||1;
              const isExp=expanded[g.id];
              const hasDetail=g.started||g.completed; // show Full Stats for any game that has started/ended
              return(
                <Card key={g.id} style={{padding:"16px 18px"}} hover={false}>
                  {/* Status bar */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:6}}>
                    <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".12em",padding:"3px 10px",borderRadius:20,background:g.completed?"rgba(100,116,139,.15)":g.started?"rgba(34,197,94,.15)":"rgba(0,212,255,.1)",color:g.completed?"#64748B":g.started?"#22C55E":"#00D4FF",border:`1px solid ${g.completed?"rgba(100,116,139,.2)":g.started?"rgba(34,197,94,.3)":"rgba(0,212,255,.25)"}`}}>{g.completed?"✅ FINAL":g.started?`🔴 LIVE · ${g.status}`:`🕐 ${g.status}`}</span>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      {myPick&&<span style={{fontSize:11,color:"#64748B",fontFamily:"'Orbitron',sans-serif"}}>Picked: <span style={{color:"#00D4FF"}}>{myPick==="home"?g.home.abbr:g.away.abbr}</span></span>}
                      {hasDetail&&<button onClick={()=>navigate("game",{id:g.id,sport:g.sport})} style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.2)",borderRadius:8,padding:"3px 12px",cursor:"pointer",color:"#00D4FF"}}>📊 Full Stats →</button>}
                    </div>
                  </div>

                  {/* Live MLB situation */}
                  {g.sport==="mlb"&&g.started&&!g.completed&&g.outs!==null&&(
                    <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
                      <div style={{background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)",borderRadius:10,padding:"6px 16px",textAlign:"center"}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#22C55E",letterSpacing:".1em"}}>INNING</div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.inningHalf} {g.inning}</div>
                      </div>
                      <div style={{background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.2)",borderRadius:10,padding:"6px 16px",textAlign:"center"}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".1em"}}>OUTS</div>
                        <div style={{display:"flex",gap:5,marginTop:4,justifyContent:"center"}}>
                          {[0,1,2].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<g.outs?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${i<g.outs?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>)}
                        </div>
                      </div>
                      <div style={{background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.2)",borderRadius:10,padding:"6px 16px",textAlign:"center"}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#8B5CF6",letterSpacing:".1em"}}>COUNT</div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.balls??0}-{g.strikes??0}</div>
                      </div>
                      {/* Base runners diamond */}
                      <div style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:10,padding:"6px 14px",textAlign:"center"}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#F59E0B",letterSpacing:".1em",marginBottom:4}}>BASES</div>
                        <div style={{position:"relative",width:36,height:36,margin:"0 auto"}}>
                          {/* Diamond layout: 2B top, 3B left, 1B right */}
                          <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%) rotate(45deg)",width:13,height:13,background:g.onSecond?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${g.onSecond?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>
                          <div style={{position:"absolute",top:"50%",left:0,transform:"translateY(-50%) rotate(45deg)",width:13,height:13,background:g.onThird?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${g.onThird?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>
                          <div style={{position:"absolute",top:"50%",right:0,transform:"translateY(-50%) rotate(45deg)",width:13,height:13,background:g.onFirst?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${g.onFirst?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* MLB pitcher/batter row */}
                  {g.sport==="mlb"&&g.started&&!g.completed&&(g.currentPitcher?.name||g.currentBatter?.name)&&(
                    <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
                      {g.currentPitcher?.name&&(
                        <div style={{background:"rgba(0,212,255,.07)",border:"1px solid rgba(0,212,255,.18)",borderRadius:10,padding:"6px 14px",textAlign:"center",minWidth:120}}>
                          <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".1em",marginBottom:2}}>⚾ PITCHING</div>
                          <div style={{fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{g.currentPitcher.name}</div>
                          {g.currentPitcher.summary&&<div style={{fontSize:10,color:"#64748B",marginTop:1}}>{g.currentPitcher.summary}</div>}
                        </div>
                      )}
                      {g.currentBatter?.name&&(
                        <div style={{background:"rgba(139,92,246,.07)",border:"1px solid rgba(139,92,246,.18)",borderRadius:10,padding:"6px 14px",textAlign:"center",minWidth:120}}>
                          <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#8B5CF6",letterSpacing:".1em",marginBottom:2}}>🏏 AT BAT</div>
                          <div style={{fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{g.currentBatter.name}</div>
                          {g.currentBatter.summary&&<div style={{fontSize:10,color:"#64748B",marginTop:1}}>{g.currentBatter.summary}</div>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Live NBA/NHL situation */}
                  {(g.sport==="nba"||g.sport==="nhl")&&g.started&&!g.completed&&g.period&&(
                    <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14,alignItems:"center"}}>
                      <div style={{background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)",borderRadius:10,padding:"6px 20px",textAlign:"center"}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#22C55E",letterSpacing:".1em"}}>{g.sport==="nba"?"QUARTER":"PERIOD"}</div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.period}</div>
                      </div>
                      {g.clock&&<div style={{background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.2)",borderRadius:10,padding:"6px 20px",textAlign:"center"}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".1em"}}>CLOCK</div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.clock}</div>
                      </div>}
                    </div>
                  )}

                  {/* Team matchup */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:mob?8:12,alignItems:"center"}}>
                    <button onClick={()=>!locked&&predict(g.id,"away")} disabled={locked} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:mob?"12px 8px":"16px 12px",borderRadius:12,border:`2px solid ${myPick==="away"?"#00D4FF":awayWin?"#22C55E":"rgba(255,255,255,.08)"}`,background:myPick==="away"?"rgba(0,212,255,.1)":awayWin?"rgba(34,197,94,.08)":"rgba(255,255,255,.02)",cursor:locked?"default":"pointer",transition:"all .2s",opacity:g.completed&&homeWin?.5:1}}>
                      {g.away.logo&&<img src={g.away.logo} width={mob?36:48} height={mob?36:48} style={{objectFit:"contain"}}/>}
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:12,fontWeight:700,color:myPick==="away"?"#00D4FF":"#E2E8F0"}}>{g.away.abbr}</div>
                      {g.started&&<div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:28,fontWeight:900,color:awayWin?"#22C55E":"#E2E8F0"}}>{g.away.score||0}</div>}
                      {!locked&&<div style={{fontSize:10,color:"#475569"}}>{Math.round(pa/tot*100)}% pick</div>}
                    </button>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900,color:"#334155",letterSpacing:".08em"}}>VS</div>
                      {locked&&!g.completed&&<div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#22C55E",marginTop:4}}>LIVE</div>}
                    </div>
                    <button onClick={()=>!locked&&predict(g.id,"home")} disabled={locked} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:mob?"12px 8px":"16px 12px",borderRadius:12,border:`2px solid ${myPick==="home"?"#00D4FF":homeWin?"#22C55E":"rgba(255,255,255,.08)"}`,background:myPick==="home"?"rgba(0,212,255,.1)":homeWin?"rgba(34,197,94,.08)":"rgba(255,255,255,.02)",cursor:locked?"default":"pointer",transition:"all .2s",opacity:g.completed&&awayWin?.5:1}}>
                      {g.home.logo&&<img src={g.home.logo} width={mob?36:48} height={mob?36:48} style={{objectFit:"contain"}}/>}
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:12,fontWeight:700,color:myPick==="home"?"#00D4FF":"#E2E8F0"}}>{g.home.abbr}</div>
                      {g.started&&<div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:28,fontWeight:900,color:homeWin?"#22C55E":"#E2E8F0"}}>{g.home.score||0}</div>}
                      {!locked&&<div style={{fontSize:10,color:"#475569"}}>{Math.round(ph/tot*100)}% pick</div>}
                    </button>
                  </div>

                  {/* Community pick bar */}
                  {!locked&&(
                    <div style={{marginTop:12}}>
                      <div style={{display:"flex",height:4,borderRadius:4,overflow:"hidden",background:"rgba(255,255,255,.06)"}}>
                        <div style={{width:`${Math.round(pa/tot*100)}%`,background:"linear-gradient(90deg,#8B5CF6,#00D4FF)",transition:"width .4s"}}/>
                        <div style={{flex:1,background:"linear-gradient(90deg,#00D4FF,#22C55E)",opacity:.6}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#334155",marginTop:4}}>
                        <span>{pa} picked {g.away.abbr}</span><span>{ph} picked {g.home.abbr}</span>
                      </div>
                    </div>
                  )}

                </Card>
              );
            })}
          </div>
      }
    </div>
  );
}

// ─── Leaderboard ───────────────────────────────────────────────────────────────

// ─── Game Detail Page ──────────────────────────────────────────────────────────
function GameDetailPage({gameId,sport,navigate}){
  const mob=useIsMobile();
  const[game,setGame]=useState(null);
  const[loading,setLoading]=useState(true);
  const[pbp,setPbp]=useState([]); // live play by play
  const[pbpLoading,setPbpLoading]=useState(false);
  const[pbpTab,setPbpTab]=useState("pbp"); // pbp | scoring | inning
  const[pbpInning,setPbpInning]=useState(null); // null=all, or inning number
  const[rawAtBats,setRawAtBats]=useState([]); // MLB: full at-bat objects with pitches
  const pbpRef=useRef(null);

  const loadPbp=async(gameState)=>{
    if(sport!=="mlb"&&sport!=="nba"&&sport!=="nhl")return;
    // gameState param lets us pass game data before state settles
    const gData=gameState||game;
    setPbpLoading(true);
    try{
      if(sport==="mlb"){
        let gamePk=gameId;
        let mlbData=null;
        // Attempt 1: ESPN gameId IS often the MLB gamePk directly — try it
        try{
          const r=await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`,{signal:(()=>{const c=new AbortController();setTimeout(()=>c.abort(),10000);return c.signal;})()});
          if(r.ok){const d=await r.json();if(d?.liveData?.plays?.allPlays?.length>0)mlbData=d;}
        }catch(e){}
        // Attempt 2: look up real gamePk via ESPN summary externalIds
        if(!mlbData){
          try{
            const eR=await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${gameId}`);
            if(eR.ok){
              const eD=await eR.json();
              const extId=eD?.header?.competitions?.[0]?.externalIds?.find(x=>
                x.provider==="mlbgamepk"||x.provider==="gamepk"||x.provider==="mlb");
              if(extId?.value&&String(extId.value)!==String(gameId)){
                gamePk=extId.value;
                const r2=await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`,{signal:(()=>{const c=new AbortController();setTimeout(()=>c.abort(),10000);return c.signal;})()});
                if(r2.ok)mlbData=await r2.json();
              }
            }
          }catch(e){}
        }
        // Attempt 3: search MLB schedule — include ALL game types (spring training=S, regular=R, postseason=P etc)
        if(!mlbData){
          try{
            const today=new Date();
            for(let d=0;d<=5&&!mlbData;d++){
              const dt=new Date(today);dt.setDate(dt.getDate()-d);
              const dateStr=dt.toISOString().slice(0,10);
              // S=spring training, R=regular, P=postseason, F=wild card, D=division, L=LCS, W=world series
              const sR=await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}&gameType=S,R,P,F,D,L,W`);
              if(!sR.ok)continue;
              const sD=await sR.json();
              const allGames=(sD.dates?.[0]?.games||[]);
              if(!allGames.length)continue;
              // Match by team name keywords if we have game data
              let match=null;
              if(gData?.home?.name){
                const hKw=(gData.home.name||"").split(" ").pop().toLowerCase();
                const aKw=(gData.away?.name||"").split(" ").pop().toLowerCase();
                match=allGames.find(g=>{
                  const h=(g.teams?.home?.team?.name||"").toLowerCase();
                  const a=(g.teams?.away?.team?.name||"").toLowerCase();
                  return(h.includes(hKw)||a.includes(hKw))&&(h.includes(aKw)||a.includes(aKw));
                });
              }
              // If no name match, try all games on that date (pick one that has plays)
              const candidates=match?[match]:allGames.slice(0,10);
              for(const cg of candidates){
                if(!cg.gamePk)continue;
                try{
                  const r3=await fetch(`https://statsapi.mlb.com/api/v1.1/game/${cg.gamePk}/feed/live`,{signal:(()=>{const c=new AbortController();setTimeout(()=>c.abort(),10000);return c.signal;})()});
                  if(!r3.ok)continue;
                  const d3=await r3.json();
                  if(d3?.liveData?.plays?.allPlays?.length>0){mlbData=d3;break;}
                }catch(e){}
              }
            }
          }catch(e){}
        }
        if(mlbData){
          const allAtBats=mlbData.liveData?.plays?.allPlays||[];
          // Store full at-bat data including pitches
          const mapped=allAtBats.map(ab=>({
            id:ab.atBatIndex,
            inningNum:ab.about?.inning||1,
            inning:`${ab.about?.halfInning==="top"?"▲":"▼"} ${ab.about?.inning}`,
            isTop:ab.about?.halfInning==="top",
            batter:ab.matchup?.batter?.fullName||"",
            pitcher:ab.matchup?.pitcher?.fullName||"",
            event:ab.result?.event||"",
            desc:ab.result?.description||"",
            rbi:ab.result?.rbi||0,
            outs:ab.count?.outs??null,
            isScoring:ab.result?.rbi>0||["Home Run","Grand Slam","Stolen Base Home"].includes(ab.result?.event||""),
            isComplete:ab.about?.isComplete||false,
            pitches:(ab.pitchIndex||[]).map(pi=>{
              const p=ab.playEvents?.[pi];
              if(!p)return null;
              const pd=p.pitchData||{};
              const hd=p.hitData||{};
              return{
                num:p.pitchNumber||pi+1,
                type:p.details?.type?.description||p.type?.description||"",
                call:p.details?.call?.description||p.details?.description||"",
                callCode:p.details?.call?.code||p.details?.code||"",
                velocity:pd.startSpeed?Math.round(pd.startSpeed):null,
                spinRate:pd.breaks?.spinRate?Math.round(pd.breaks.spinRate):null,
                px:pd.coordinates?.pX??null, // horizontal plate position
                pz:pd.coordinates?.pZ??null, // vertical plate position
                szTop:pd.strikeZoneTop??3.5,
                szBot:pd.strikeZoneBottom??1.5,
                // Hit data
                hitDist:hd.totalDistance?Math.round(hd.totalDistance):null,
                hitAngle:hd.launchAngle?Math.round(hd.launchAngle):null,
                exitVelo:hd.launchSpeed?Math.round(hd.launchSpeed):null,
                hitX:hd.coordinates?.coordX??null,
                hitY:hd.coordinates?.coordY??null,
                isInPlay:p.type==="X",
                isBall:p.type==="B",
                isStrike:p.type==="S",
                balls:p.count?.balls??0,
                strikes:p.count?.strikes??0,
              };
            }).filter(Boolean),
          }));
          setRawAtBats(mapped.slice().reverse()); // newest first
          // Simple PBP list for non-pitch view
          setPbp(mapped.slice().reverse().map(ab=>({
            id:ab.id,inning:ab.inning,inningNum:ab.inningNum,
            batter:ab.batter,pitcher:ab.pitcher,event:ab.event,
            desc:ab.desc,rbi:ab.rbi,outs:ab.outs,
            isScoring:ab.isScoring,isComplete:ab.isComplete,
          })));
        }
      } else if(sport==="nba"){
        const r=await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`);
        if(r.ok){
          const d=await r.json();
          const raw=d?.plays||[];
          setPbp(raw.slice().reverse().map((p,i)=>({
            id:i,
            period:p.period?.displayValue||`Q${p.period?.number||""}`,
            periodNum:p.period?.number||0,
            clock:p.clock?.displayValue||"",
            team:p.team?.abbreviation||p.team?.displayName||"",
            desc:p.text||p.description||"",
            awayScore:p.awayScore??null,
            homeScore:p.homeScore??null,
            isScoring:p.scoringPlay||false,
            type:p.type?.text||p.type?.displayName||"",
          })));
        }
      } else if(sport==="nhl"){
        const r=await fetch(`https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/summary?event=${gameId}`);
        if(r.ok){
          const d=await r.json();
          // ESPN NHL: plays array OR scoringPlays for goals
          const raw=d?.plays||[];
          // If no plays, fall back to scoring plays from main game data
          const mapped=raw.length>0?raw.slice().reverse().map((p,i)=>({
            id:i,
            period:p.period?.displayValue||`P${p.period?.number||""}`,
            periodNum:p.period?.number||0,
            clock:p.clock?.displayValue||"",
            team:p.team?.abbreviation||p.team?.displayName||"",
            desc:p.text||p.description||"",
            awayScore:p.awayScore??null,
            homeScore:p.homeScore??null,
            isScoring:!!(p.scoringPlay||p.type?.text==="Goal"||p.type?.id==="goal"||
              (p.text||"").toLowerCase().includes("goal")||(p.type?.description||"").toLowerCase().includes("goal")),
            type:p.type?.text||p.type?.displayName||"",
          })):[];
          // If no ESPN plays, build from game scoring plays
          if(!mapped.length&&game?.scoringPlays?.length){
            const fallback=game.scoringPlays.map((sp,i)=>({
              id:i,period:sp.period||"",periodNum:1,clock:sp.clock||"",
              team:sp.team||"",desc:sp.desc||"",
              awayScore:sp.awayScore??null,homeScore:sp.homeScore??null,
              isScoring:true,type:"Goal",
            }));
            setPbp(fallback);
          } else {
            setPbp(mapped);
          }
        }
      }
    }catch(e){console.warn("PBP load error:",e.message);}
    setPbpLoading(false);
  };

  // Inning/period list for navigation
  const pbpPeriods=useMemo(()=>{
    if(!pbp.length)return[];
    const seen=new Set();const list=[];
    pbp.forEach(p=>{
      const key=sport==="mlb"?p.inningNum:p.periodNum;
      if(key!=null&&!seen.has(key)){seen.add(key);list.push(key);}
    });
    return list.sort((a,b)=>a-b);
  },[pbp,sport]);

  const pbpFiltered=useMemo(()=>{
    let list=pbp;
    if(pbpInning!==null){
      list=list.filter(p=>(sport==="mlb"?p.inningNum:p.periodNum)===pbpInning);
    }
    if(pbpTab==="scoring")list=list.filter(p=>p.isScoring);
    return list;
  },[pbp,pbpInning,pbpTab,sport]);

  // Pitch zone colors
  const pitchColor=(call)=>{
    const c=(call||"").toLowerCase();
    if(c.includes("ball")||c==="b")return"#3B82F6";
    if(c.includes("strike")||c==="s"||c==="c"||c==="f"||c==="t")return"#EF4444";
    if(c.includes("in play")||c==="x")return"#22C55E";
    return"#94A3B8";
  };



  useEffect(()=>{load();},[gameId]);
  useEffect(()=>{
    // Refresh game data every 30s, PBP every 20s for live games
    const t=setInterval(()=>load(true),30000);
    return()=>clearInterval(t);
  },[gameId]);
  useEffect(()=>{
    // loadPbp with no args on mount — game state may not be ready yet, 
    // load() will call it again with fresh game data
    loadPbp();
    const interval=sport==="mlb"||sport==="nba"||sport==="nhl"?
      setInterval(()=>loadPbp(),20000):null;
    return()=>{if(interval)clearInterval(interval);};
  },[gameId,sport]);

  const sportPath=sport==="mlb"?"baseball/mlb":sport==="nfl"?"football/nfl":sport==="nba"?"basketball/nba":"hockey/nhl";

  const load=async(quiet=false)=>{
    if(!quiet)setLoading(true);
    try{
      const d=await(await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${gameId}`)).json();
      const scoreboard=await(await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard`)).json();
      const ev=scoreboard.events?.find(e=>e.id===gameId);
      const comp=ev?.competitions?.[0];
      const home=comp?.competitors?.find(c=>c.homeAway==="home");
      const away=comp?.competitors?.find(c=>c.homeAway==="away");
      const st=comp?.status?.type;
      const statusDetail=comp?.status?.type?.shortDetail||"";
      const period=comp?.status?.period??null;
      const clock=comp?.status?.displayClock||"";
      const halfMatch=statusDetail.match(/^(Top|Bot|Mid|End)\s/i);
      const inningHalf=halfMatch?halfMatch[1].charAt(0).toUpperCase()+halfMatch[1].slice(1).toLowerCase():"Top";
      const sit=d?.situation;
      const probables=comp?.probables||[];
      const awayProb=probables.find(p=>p.homeAway==="away");
      const homeProb=probables.find(p=>p.homeAway==="home");
      // Build normalized scoring plays for all sports
      // ESPN returns different period formats: object with displayValue, or plain number
      const rawPlays=d?.scoringPlays||[];
      const normPeriod=(sp)=>{
        const p=sp.period;
        if(!p)return sp.periodText||"";
        if(typeof p==="number")return sport==="nba"?`Q${p}`:sport==="nhl"?`P${p}`:`Q${p}`;
        if(p.displayValue)return p.displayValue;
        if(p.number){
          if(sport==="nba")return `Q${p.number}`;
          if(sport==="nhl")return `P${p.number}`;
          if(sport==="mlb")return p.type==="B"?`Bot ${p.number}`:`Top ${p.number}`;
          return `Q${p.number}`;
        }
        return p.text||"";
      };
      const normClock=(sp)=>{
        const c=sp.clock;
        if(!c)return "";
        if(typeof c==="string")return c;
        return c.displayValue||c.value||"";
      };
      const scoringPlays=rawPlays.map(sp=>({
        period:normPeriod(sp),
        clock:normClock(sp),
        team:sp.team?.abbreviation||sp.team?.shortDisplayName||"",
        desc:sp.text||sp.description||sp.headline||sp.summary||"",
        awayScore:sp.awayScore??null,
        homeScore:sp.homeScore??null,
        type:sp.scoringType?.displayName||sp.type?.text||sp.type?.name||"",
      }));

      // MLB live pitcher/batter
      // ESPN stores pitcher/batter stats in statistics[] not a summary string
      // ESPN only returns playerId in situation — resolve to names via athlete API
      const gdP=sit?.pitcher; const gdB=sit?.batter;
      const [gdPitcherName,gdBatterName]=await Promise.all([
        (async(id)=>{if(!id)return null;try{const d=await(await fetch(`/api/hyperbeam?athlete=${id}`)).json();return d.name||null;}catch{return null;}})(gdP?.playerId),
        (async(id)=>{if(!id)return null;try{const d=await(await fetch(`/api/hyperbeam?athlete=${id}`)).json();return d.name||null;}catch{return null;}})(gdB?.playerId),
      ]);
      const currentPitcher=gdP?.playerId?{name:gdPitcherName,summary:""}:null;
      const currentBatter=gdB?.playerId?{name:gdBatterName,summary:""}:null;

      // Build per-period linescore for NBA/NHL/NFL (ESPN returns comp.linescores[])
      const compLinescores=comp?.linescores||[];
      // For MLB use d.linescore; for others build from comp.linescores per competitor
      const linescoreNonMLB=compLinescores.length>0?{
        columns:compLinescores.map((_,i)=>({label:sport==="nba"?`Q${i+1}`:sport==="nhl"?`P${i+1}`:`Q${i+1}`})).concat([{label:"T"}]),
        rows:[
          {label:away?.team?.abbreviation,columns:[...(away?.linescores||[]).map(l=>({value:l.value??"-"})),{value:away?.score||"",bold:true}]},
          {label:home?.team?.abbreviation,columns:[...(home?.linescores||[]).map(l=>({value:l.value??"-"})),{value:home?.score||"",bold:true}]},
        ]
      }:null;

      setGame({
        id:gameId,sport,
        home:{name:home?.team?.displayName,abbr:home?.team?.abbreviation,logo:home?.team?.logo,score:home?.score,id:home?.team?.id},
        away:{name:away?.team?.displayName,abbr:away?.team?.abbreviation,logo:away?.team?.logo,score:away?.score,id:away?.team?.id},
        status:statusDetail||"Scheduled",
        started:st?.completed||st?.name==="STATUS_IN_PROGRESS",
        completed:st?.completed||false,
        period,clock,
        inning:sit?.period??null,inningHalf,
        outs:sit?.outs??null,balls:sit?.balls??null,strikes:sit?.strikes??null,
        onFirst:!!sit?.onFirst,onSecond:!!sit?.onSecond,onThird:!!sit?.onThird,
        currentPitcher,currentBatter,
        awayProb:{name:awayProb?.athlete?.displayName,era:awayProb?.athlete?.statistics?.find(s=>s.name==="ERA")?.value,playerId:awayProb?.athlete?.id},
        homeProb:{name:homeProb?.athlete?.displayName,era:homeProb?.athlete?.statistics?.find(s=>s.name==="ERA")?.value,playerId:homeProb?.athlete?.id},
        leaders:d?.leaders||comp?.leaders||[],
        boxTeams:d?.boxscore?.teams||[],
        boxPlayers:d?.boxscore?.players||[],
        linescore:sport==="mlb"?(d?.linescore||comp?.linescore||null):linescoreNonMLB,
        scoringPlays,
        winPitcher:d?.winPitcher?{name:d.winPitcher.athlete?.displayName,wins:d.winPitcher.stats?.find?.(s=>s.name==="wins")?.value,losses:d.winPitcher.stats?.find?.(s=>s.name==="losses")?.value}:null,
        losePitcher:d?.losePitcher?{name:d.losePitcher.athlete?.displayName,wins:d.losePitcher.stats?.find?.(s=>s.name==="wins")?.value,losses:d.losePitcher.stats?.find?.(s=>s.name==="losses")?.value}:null,
        savePitcher:d?.savePitcher?{name:d.savePitcher.athlete?.displayName,saves:d.savePitcher.stats?.find?.(s=>s.name==="saves")?.value}:null,
        injuries:d?.injuries||[],
        drives:d?.drives?.previous||[],
      });
      // Call loadPbp with fresh game data so attempt 3 has team names
      const freshGame={home:{name:home?.team?.displayName},away:{name:away?.team?.displayName}};
      loadPbp(freshGame);
    }catch(e){console.error(e);}
    if(!quiet)setLoading(false);
  };

  if(loading)return <div style={{textAlign:"center",padding:"80px 20px",color:"#334155"}}><div className="spin" style={{fontSize:32,display:"inline-block",marginBottom:12}}>⚙️</div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,letterSpacing:".15em"}}>LOADING GAME DATA...</div></div>;
  if(!game)return <div style={{textAlign:"center",padding:80,color:"#334155"}}>Game not found.</div>;

  const g=game;
  const sportIcon={mlb:"⚾",nfl:"🏈",nba:"🏀",nhl:"🏒"}[g.sport]||"🏆";

  const SLabel=({children,color="#00D4FF"})=>(
    <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color,marginBottom:8,letterSpacing:".12em",borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:6}}>{children}</div>
  );
  const StatRow=({l,av,hv})=>(
    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:6,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.04)",alignItems:"center"}}>
      <div style={{textAlign:"right",fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{av||"—"}</div>
      <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",textAlign:"center",minWidth:90,padding:"0 4px"}}>{l}</div>
      <div style={{textAlign:"left",fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{hv||"—"}</div>
    </div>
  );

  return(
    <div style={{maxWidth:860,margin:"0 auto",padding:"44px 16px 80px"}}>
      {/* Back */}
      <button onClick={()=>navigate("predict")} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:"#475569",fontSize:12,marginBottom:20,padding:0}}>← Back to Predictions</button>

      {/* Header scoreboard */}
      <Card style={{padding:"20px 24px",marginBottom:20}} hover={false}>
        <div style={{textAlign:"center",marginBottom:14}}>
          <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".12em",padding:"3px 12px",borderRadius:20,background:g.completed?"rgba(100,116,139,.15)":g.started?"rgba(34,197,94,.15)":"rgba(0,212,255,.1)",color:g.completed?"#64748B":g.started?"#22C55E":"#00D4FF",border:`1px solid ${g.completed?"rgba(100,116,139,.2)":g.started?"rgba(34,197,94,.3)":"rgba(0,212,255,.25)"}`}}>
            {g.completed?"✅ FINAL":g.started?`🔴 LIVE · ${g.status}`:`🕐 ${g.status}`}
          </span>
        </div>

        {/* MLB live situation */}
        {g.sport==="mlb"&&g.started&&!g.completed&&g.outs!==null&&(
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)",borderRadius:10,padding:"6px 16px",textAlign:"center"}}>
              <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#22C55E",letterSpacing:".1em"}}>INNING</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.inningHalf} {g.inning}</div>
            </div>
            <div style={{background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.2)",borderRadius:10,padding:"6px 16px",textAlign:"center"}}>
              <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".1em"}}>OUTS</div>
              <div style={{display:"flex",gap:5,marginTop:4,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<g.outs?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${i<g.outs?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>)}</div>
            </div>
            <div style={{background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.2)",borderRadius:10,padding:"6px 16px",textAlign:"center"}}>
              <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#8B5CF6",letterSpacing:".1em"}}>COUNT</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.balls??0}-{g.strikes??0}</div>
            </div>
            <div style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:10,padding:"6px 14px",textAlign:"center"}}>
              <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#F59E0B",letterSpacing:".1em",marginBottom:4}}>BASES</div>
              <div style={{position:"relative",width:36,height:36,margin:"0 auto"}}>
                <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%) rotate(45deg)",width:13,height:13,background:g.onSecond?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${g.onSecond?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>
                <div style={{position:"absolute",top:"50%",left:0,transform:"translateY(-50%) rotate(45deg)",width:13,height:13,background:g.onThird?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${g.onThird?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>
                <div style={{position:"absolute",top:"50%",right:0,transform:"translateY(-50%) rotate(45deg)",width:13,height:13,background:g.onFirst?"#F59E0B":"rgba(255,255,255,.1)",border:`1px solid ${g.onFirst?"#F59E0B":"rgba(255,255,255,.15)"}`}}/>
              </div>
            </div>
          </div>
        )}
        {/* MLB live pitcher/batter */}
        {g.sport==="mlb"&&g.started&&!g.completed&&(g.currentPitcher?.name||g.currentBatter?.name)&&(
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
            {g.currentPitcher?.name&&(
              <div style={{background:"rgba(0,212,255,.07)",border:"1px solid rgba(0,212,255,.2)",borderRadius:10,padding:"8px 18px",textAlign:"center",minWidth:140}}>
                <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".1em",marginBottom:3}}>⚾ PITCHING</div>
                <div style={{fontSize:14,fontWeight:700,color:"#E2E8F0"}}>{g.currentPitcher.name}</div>
                {g.currentPitcher.summary&&<div style={{fontSize:11,color:"#64748B",marginTop:2}}>{g.currentPitcher.summary}</div>}
              </div>
            )}
            {g.currentBatter?.name&&(
              <div style={{background:"rgba(139,92,246,.07)",border:"1px solid rgba(139,92,246,.2)",borderRadius:10,padding:"8px 18px",textAlign:"center",minWidth:140}}>
                <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#8B5CF6",letterSpacing:".1em",marginBottom:3}}>🏏 AT BAT</div>
                <div style={{fontSize:14,fontWeight:700,color:"#E2E8F0"}}>{g.currentBatter.name}</div>
                {g.currentBatter.summary&&<div style={{fontSize:11,color:"#64748B",marginTop:2}}>{g.currentBatter.summary}</div>}
              </div>
            )}
          </div>
        )}

        {/* NBA/NHL live period */}
        {(g.sport==="nba"||g.sport==="nhl")&&g.started&&!g.completed&&g.period&&(
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14}}>
            <div style={{background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)",borderRadius:10,padding:"6px 20px",textAlign:"center"}}>
              <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#22C55E",letterSpacing:".1em"}}>{g.sport==="nba"?"QUARTER":"PERIOD"}</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.period}</div>
            </div>
            {g.clock&&<div style={{background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.2)",borderRadius:10,padding:"6px 20px",textAlign:"center"}}>
              <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".1em"}}>CLOCK</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,color:"#E2E8F0"}}>{g.clock}</div>
            </div>}
          </div>
        )}

        {/* Scoreboard */}
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:12,alignItems:"center"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            {g.away.logo&&<img src={g.away.logo} width={mob?48:64} height={mob?48:64} style={{objectFit:"contain"}}/>}
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?12:14,fontWeight:700,color:"#E2E8F0"}}>{g.away.abbr}</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?28:40,fontWeight:900,color:"#E2E8F0"}}>{g.started||g.completed?g.away.score||0:"—"}</div>
            <div style={{fontSize:10,color:"#475569"}}>{g.away.name}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,fontWeight:900,color:"#1E293B",letterSpacing:".08em"}}>VS</div>
            <div style={{fontSize:22,marginTop:4}}>{sportIcon}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            {g.home.logo&&<img src={g.home.logo} width={mob?48:64} height={mob?48:64} style={{objectFit:"contain"}}/>}
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?12:14,fontWeight:700,color:"#E2E8F0"}}>{g.home.abbr}</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?28:40,fontWeight:900,color:"#E2E8F0"}}>{g.started||g.completed?g.home.score||0:"—"}</div>
            <div style={{fontSize:10,color:"#475569"}}>{g.home.name}</div>
          </div>
        </div>
      </Card>

      <div style={{display:"flex",flexDirection:"column",gap:16}}>

        {/* MLB probable starters */}
        {g.sport==="mlb"&&!g.started&&(g.awayProb?.name||g.homeProb?.name)&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel>⚾ PROBABLE STARTERS</SLabel>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[{side:"Away",team:g.away.abbr,p:g.awayProb},{side:"Home",team:g.home.abbr,p:g.homeProb}].map(({side,team,p})=>(
                <div key={side} style={{background:"rgba(255,255,255,.03)",borderRadius:10,padding:"12px 14px",border:"1px solid rgba(255,255,255,.07)"}}>
                  <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>{team} ({side})</div>
                  <div onClick={p?.playerId?()=>navigate("stats",{playerId:p.playerId,sport:g.sport}):undefined}
                    style={{fontSize:15,fontWeight:700,color:p?.playerId?"#00D4FF":"#E2E8F0",cursor:p?.playerId?"pointer":"default"}}>{p?.name||"TBD"}</div>
                  {p?.era&&<div style={{fontSize:12,color:"#94A3B8",marginTop:2}}>ERA: {p.era}</div>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* MLB pitching decision */}
        {g.sport==="mlb"&&g.completed&&(g.winPitcher||g.losePitcher||g.savePitcher)&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel color="#22C55E">🏆 PITCHING DECISION</SLabel>
            {g.winPitcher&&<StatRow l={`W: ${g.winPitcher.name}`} av={`${g.winPitcher.wins??"-"}-${g.winPitcher.losses??"-"}`} hv="WIN"/>}
            {g.losePitcher&&<StatRow l={`L: ${g.losePitcher.name}`} av={`${g.losePitcher.wins??"-"}-${g.losePitcher.losses??"-"}`} hv="LOSS"/>}
            {g.savePitcher&&<StatRow l={`SV: ${g.savePitcher.name}`} av={`${g.savePitcher.saves??"-"} SV`} hv="SAVE"/>}
          </Card>
        )}

        {/* Player of the game */}
        {g.completed&&g.leaders?.length>0&&(()=>{
          const potg=g.leaders.reduce((best,l)=>{const v=parseFloat((l.displayValue||"0").replace(/[^0-9.]/g,""))||0;const bv=parseFloat((best?.displayValue||"0").replace(/[^0-9.]/g,""))||0;return v>bv?l:best;},g.leaders[0]);
          return(
            <Card style={{padding:"16px 18px"}} hover={false}>
              <SLabel color="#F59E0B">⭐ TOP PERFORMERS</SLabel>
              {potg&&<div style={{background:"linear-gradient(135deg,rgba(245,158,11,.15),rgba(251,191,36,.07))",border:"1px solid rgba(245,158,11,.3)",borderRadius:12,padding:"12px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:28}}>🌟</div>
                <div>
                  <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#F59E0B",letterSpacing:".12em",marginBottom:2}}>PLAYER OF THE GAME</div>
                  <div style={{fontSize:15,fontWeight:700,color:"#E2E8F0"}}>{potg.athlete?.displayName||potg.displayName||potg.name||"—"}</div>
                  <div style={{fontSize:13,color:"#F59E0B",fontWeight:600}}>{potg.displayValue||potg.value||"—"}</div>
                </div>
              </div>}
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {g.leaders.slice(0,10).map((l,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <span style={{fontSize:12,color:"#94A3B8"}}>{l.athlete?.displayName||l.displayName||l.name||"—"}</span>
                    <span style={{fontSize:12,fontWeight:700,color:"#F59E0B"}}>{l.displayValue||l.value||"—"}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })()}

        {/* MLB linescore */}
        {g.sport==="mlb"&&(g.started||g.completed)&&g.linescore?.columns?.length>0&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel>📊 LINE SCORE</SLabel>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:320}}>
                <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}><td style={{padding:"4px 8px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:10}}>TEAM</td>{(g.linescore.columns||[]).map((cl,i)=><td key={i} style={{padding:"4px 6px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:10}}>{cl.label||cl.value||i+1}</td>)}</tr></thead>
                <tbody>{(g.linescore.rows||[]).map((row,ri)=>(<tr key={ri} style={{background:ri%2===0?"rgba(255,255,255,.02)":"transparent"}}><td style={{padding:"4px 8px",color:"#E2E8F0",fontWeight:700,fontFamily:"'Orbitron',sans-serif",fontSize:10}}>{row.label||row.team||""}</td>{(row.columns||[]).map((cell,ci)=>(<td key={ci} style={{padding:"4px 6px",textAlign:"center",color:cell.bold?"#22C55E":"#94A3B8",fontWeight:cell.bold?700:400}}>{cell.value??""}</td>))}</tr>))}</tbody>
              </table>
            </div>
          </Card>
        )}

        {/* NBA/NHL/NFL period scores linescore */}
        {g.sport!=="mlb"&&(g.started||g.completed)&&g.linescore?.columns?.length>0&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel color={g.sport==="nba"?"#F59E0B":g.sport==="nhl"?"#00D4FF":"#22C55E"}>
              {g.sport==="nba"?"🏀 QUARTER SCORES":g.sport==="nhl"?"🏒 PERIOD SCORES":"🏈 QUARTER SCORES"}
            </SLabel>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:280}}>
                <thead>
                  <tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                    <td style={{padding:"5px 10px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:10}}>TEAM</td>
                    {(g.linescore.columns||[]).map((cl,i)=>(
                      <td key={i} style={{padding:"5px 8px",textAlign:"center",color:cl.label==="T"?"#22C55E":"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:cl.label==="T"?700:400}}>{cl.label}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(g.linescore.rows||[]).map((row,ri)=>(
                    <tr key={ri} style={{background:ri%2===0?"rgba(255,255,255,.02)":"transparent",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                      <td style={{padding:"6px 10px",color:"#E2E8F0",fontWeight:700,fontFamily:"'Orbitron',sans-serif",fontSize:11}}>{row.label}</td>
                      {(row.columns||[]).map((cell,ci)=>(
                        <td key={ci} style={{padding:"6px 8px",textAlign:"center",color:cell.bold?"#22C55E":"#94A3B8",fontWeight:cell.bold?900:400,fontSize:cell.bold?13:12}}>{cell.value??""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}


        {/* ── Play-by-Play (MLB pitch-by-pitch · NBA/NHL live) ── */}
        {(sport==="mlb"||sport==="nba"||sport==="nhl")&&(g.started||g.completed)&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            {/* Header */}
            <div style={{display:"flex",gap:6,marginBottom:12,alignItems:"center",justifyContent:"space-between",flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[["pbp",sport==="mlb"?"⚾ At-Bats":sport==="nhl"?"🏒 All Plays":"🏀 All Plays"],
                  ["scoring",sport==="mlb"?"🏃 Scoring":"🥅 Goals / Scores"]
                ].map(([t,l])=>(
                  <button key={t} onClick={()=>setPbpTab(t)}
                    style={{padding:"5px 12px",borderRadius:14,cursor:"pointer",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,
                      border:`1px solid ${pbpTab===t?"rgba(34,197,94,.45)":"rgba(255,255,255,.1)"}`,
                      background:pbpTab===t?"rgba(34,197,94,.1)":"rgba(255,255,255,.03)",
                      color:pbpTab===t?"#22C55E":"#64748B"}}>
                    {l}
                  </button>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {!g.completed&&<div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}><div style={{width:5,height:5,borderRadius:"50%",background:"#22C55E",animation:"twinkle .9s ease-in-out infinite alternate"}}/>LIVE</div>}
                <button onClick={loadPbp} style={{padding:"3px 9px",borderRadius:7,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#475569",fontSize:10,cursor:"pointer"}}>↻</button>
              </div>
            </div>

            {/* Inning/Period navigation */}
            {pbpPeriods.length>1&&(
              <div style={{display:"flex",gap:5,marginBottom:12,overflowX:"auto",paddingBottom:4}}>
                <button onClick={()=>setPbpInning(null)}
                  style={{padding:"4px 10px",borderRadius:12,cursor:"pointer",fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0,
                    border:`1px solid ${pbpInning===null?"rgba(0,212,255,.4)":"rgba(255,255,255,.1)"}`,
                    background:pbpInning===null?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",
                    color:pbpInning===null?"#00D4FF":"#475569"}}>
                  All
                </button>
                {pbpPeriods.map(p=>(
                  <button key={p} onClick={()=>setPbpInning(p)}
                    style={{padding:"4px 10px",borderRadius:12,cursor:"pointer",fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0,
                      border:`1px solid ${pbpInning===p?"rgba(0,212,255,.4)":"rgba(255,255,255,.1)"}`,
                      background:pbpInning===p?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",
                      color:pbpInning===p?"#00D4FF":"#475569"}}>
                    {sport==="mlb"?`Inn ${p}`:sport==="nba"?`Q${p}`:`P${p}`}
                  </button>
                ))}
              </div>
            )}

            {pbpLoading&&pbp.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading...</div>}
            {!pbpLoading&&pbp.length===0&&<div style={{textAlign:"center",padding:"14px 0",color:"#334155",fontSize:12}}>No play-by-play data available for this game</div>}
            {!pbpLoading&&pbp.length>0&&pbpFiltered.length===0&&<div style={{textAlign:"center",padding:"14px 0",color:"#334155",fontSize:12}}>No {pbpTab==="scoring"?"scoring plays":"plays"} in this {sport==="mlb"?"inning":"period"}</div>}

            {/* MLB: pitch-by-pitch at-bat view */}
            {sport==="mlb"&&pbpFiltered.length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:520,overflowY:"auto"}}>
                {pbpFiltered.map((ab,i)=>{
                  const isScore=ab.isScoring;
                  const isCurrent=i===0&&!g.completed&&!ab.isComplete;
                  const fullAb=rawAtBats.find(r=>r.id===ab.id);
                  const pitches=fullAb?.pitches||[];
                  return(
                    <div key={ab.id||i} style={{
                      borderRadius:10,border:`1px solid ${isCurrent?"rgba(0,212,255,.3)":isScore?"rgba(34,197,94,.2)":"rgba(255,255,255,.07)"}`,
                      background:isCurrent?"rgba(0,212,255,.04)":isScore?"rgba(34,197,94,.04)":"rgba(255,255,255,.02)",
                      overflow:"hidden",
                    }}>
                      {/* At-bat header */}
                      <div style={{display:"flex",gap:8,padding:"8px 12px",alignItems:"center",borderBottom:pitches.length?"1px solid rgba(255,255,255,.05)":"none"}}>
                        <div style={{minWidth:38,flexShrink:0}}>
                          <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:isCurrent?"#00D4FF":isScore?"#22C55E":"#475569",fontWeight:700}}>{ab.inning}</div>
                          {ab.outs!==null&&<div style={{fontSize:8,color:"#334155"}}>{ab.outs} out{ab.outs!==1?"s":""}</div>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",marginBottom:1}}>
                            <span style={{fontSize:11,fontWeight:700,color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif"}}>{ab.batter}</span>
                            {ab.pitcher&&<span style={{fontSize:9,color:"#475569"}}>vs {ab.pitcher}</span>}
                          </div>
                          {ab.event&&<div style={{fontSize:10,color:isScore?"#22C55E":"#F59E0B",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{ab.event}{ab.rbi>0?` · ${ab.rbi} RBI`:""}</div>}
                          {ab.desc&&<div style={{fontSize:10,color:"#64748B",lineHeight:1.3,marginTop:1}}>{ab.desc}</div>}
                        </div>
                        {isCurrent&&<div style={{fontSize:8,color:"#00D4FF",fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0,animation:"twinkle .9s ease-in-out infinite alternate"}}>LIVE</div>}
                      </div>

                      {/* Pitches row */}
                      {pitches.length>0&&(
                        <div style={{padding:"8px 12px",display:"flex",gap:6,alignItems:"flex-start",flexWrap:"wrap"}}>
                          {/* Strike zone diagram */}
                          <div style={{position:"relative",width:80,height:90,flexShrink:0}}>
                            {/* Zone box */}
                            <div style={{position:"absolute",left:14,top:8,width:52,height:65,border:"1px solid rgba(255,255,255,.2)",borderRadius:2,
                              background:"rgba(255,255,255,.02)"}}>
                              {/* 9-zone grid lines */}
                              <div style={{position:"absolute",top:"33%",left:0,right:0,height:1,background:"rgba(255,255,255,.1)"}}/>
                              <div style={{position:"absolute",top:"66%",left:0,right:0,height:1,background:"rgba(255,255,255,.1)"}}/>
                              <div style={{position:"absolute",left:"33%",top:0,bottom:0,width:1,background:"rgba(255,255,255,.1)"}}/>
                              <div style={{position:"absolute",left:"66%",top:0,bottom:0,width:1,background:"rgba(255,255,255,.1)"}}/>
                            </div>
                            {/* Plot each pitch */}
                            {pitches.map((p,pi)=>{
                              if(p.px===null||p.pz===null)return null;
                              // px: -0.83 to 0.83 (plate width), map to 14-66px
                              // pz: szBot to szTop, map to 73-8px (inverted)
                              const xPct=(p.px+0.85)/(1.7);
                              const yPct=1-(p.pz-p.szBot)/(p.szTop-p.szBot);
                              const x=14+xPct*52;
                              const y=8+Math.min(Math.max(yPct,0),1)*65;
                              const col=pitchColor(p.callCode||p.call);
                              const isLast=pi===pitches.length-1;
                              return(
                                <div key={pi} title={`${p.type} ${p.velocity?p.velocity+"mph":""} — ${p.call}`}
                                  style={{position:"absolute",width:isLast?10:8,height:isLast?10:8,borderRadius:"50%",
                                    background:col,left:x-4,top:y-4,
                                    border:isLast?"2px solid rgba(255,255,255,.8)":"1px solid rgba(0,0,0,.4)",
                                    fontSize:6,display:"flex",alignItems:"center",justifyContent:"center",
                                    color:"rgba(0,0,0,.7)",fontWeight:900,zIndex:pi+1,
                                    boxShadow:isLast?`0 0 6px ${col}`:undefined}}>
                                  {pi+1}
                                </div>
                              );
                            })}
                          </div>

                          {/* Pitch list */}
                          <div style={{flex:1,display:"flex",flexDirection:"column",gap:3,minWidth:0}}>
                            {pitches.map((p,pi)=>{
                              const col=pitchColor(p.callCode||p.call);
                              const isInPlay=p.isInPlay;
                              return(
                                <div key={pi} style={{display:"flex",gap:5,alignItems:"center",fontSize:10,padding:"2px 0",
                                  borderBottom:pi<pitches.length-1?"1px solid rgba(255,255,255,.04)":"none"}}>
                                  <div style={{width:14,height:14,borderRadius:"50%",background:col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:900,color:"rgba(0,0,0,.7)",flexShrink:0}}>{pi+1}</div>
                                  <div style={{minWidth:70,fontSize:9,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.type||"Pitch"}</div>
                                  <div style={{fontSize:9,fontWeight:700,color:col,minWidth:50,fontFamily:"'Orbitron',sans-serif"}}>{p.call?.split("(")?.[0]?.trim()||""}</div>
                                  {p.velocity&&<div style={{fontSize:9,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",flexShrink:0}}>{p.velocity}mph</div>}
                                  {isInPlay&&p.exitVelo&&<div style={{fontSize:9,color:"#22C55E",flexShrink:0}}>{p.exitVelo}mph EV</div>}
                                  {isInPlay&&p.hitDist&&<div style={{fontSize:9,color:"#22C55E",flexShrink:0}}>{p.hitDist}ft</div>}
                                  {isInPlay&&p.hitAngle!=null&&<div style={{fontSize:9,color:"#22C55E",flexShrink:0}}>{p.hitAngle}° LA</div>}
                                  <div style={{fontSize:8,color:"#334155",marginLeft:"auto",flexShrink:0}}>{p.balls}-{p.strikes}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* NBA PBP */}
            {sport==="nba"&&pbpFiltered.length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:460,overflowY:"auto"}}>
                {pbpFiltered.map((play,i)=>{
                  const isCurrent=i===0&&!g.completed;
                  const isScore=play.isScoring;
                  const score=play.awayScore!=null?`${play.awayScore}–${play.homeScore}`:"";
                  return(
                    <div key={i} style={{display:"flex",gap:10,padding:"7px 10px",borderRadius:7,
                      background:isCurrent?"rgba(59,130,246,.07)":isScore?"rgba(34,197,94,.05)":"rgba(255,255,255,.02)",
                      border:`1px solid ${isCurrent?"rgba(59,130,246,.25)":isScore?"rgba(34,197,94,.15)":"rgba(255,255,255,.05)"}`,
                      alignItems:"center"}}>
                      <div style={{minWidth:46,flexShrink:0}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:isCurrent?"#3B82F6":"#475569",fontWeight:700}}>{play.period}</div>
                        <div style={{fontSize:8,color:"#334155"}}>{play.clock}</div>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        {play.team&&<span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",fontWeight:700,marginRight:5}}>{play.team}</span>}
                        {isScore&&play.type&&<span style={{fontSize:9,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",marginRight:5}}>{play.type}</span>}
                        <span style={{fontSize:11,color:isScore?"#E2E8F0":"#64748B",lineHeight:1.3}}>{play.desc}</span>
                      </div>
                      {score&&<div style={{fontSize:12,fontWeight:900,color:isScore?"#22C55E":"#475569",flexShrink:0,fontFamily:"'Orbitron',sans-serif"}}>{score}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* NHL PBP */}
            {sport==="nhl"&&pbpFiltered.length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:460,overflowY:"auto"}}>
                {pbpFiltered.map((play,i)=>{
                  const isCurrent=i===0&&!g.completed;
                  const isScore=play.isScoring;
                  const score=play.awayScore!=null?`${play.awayScore}–${play.homeScore}`:"";
                  return(
                    <div key={i} style={{display:"flex",gap:10,padding:"7px 10px",borderRadius:7,
                      background:isScore?"rgba(34,197,94,.07)":"rgba(255,255,255,.02)",
                      border:`1px solid ${isScore?"rgba(34,197,94,.25)":"rgba(255,255,255,.06)"}`,
                      alignItems:"center"}}>
                      <div style={{minWidth:46,flexShrink:0}}>
                        <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:isScore?"#22C55E":"#475569",fontWeight:700}}>{play.period}</div>
                        <div style={{fontSize:8,color:"#334155"}}>{play.clock}</div>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        {play.team&&<span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:isScore?"#F59E0B":"#64748B",fontWeight:isScore?700:400,marginRight:5}}>{play.team}</span>}
                        <span style={{fontSize:11,color:isScore?"#E2E8F0":"#64748B",lineHeight:1.3}}>{play.desc}</span>
                      </div>
                      {score&&isScore&&<div style={{fontSize:13,fontWeight:900,color:"#22C55E",flexShrink:0,fontFamily:"'Orbitron',sans-serif"}}>{score}</div>}
                      {isScore&&<div style={{fontSize:8,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0}}>GOAL</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}


        {(g.started||g.completed)&&g.scoringPlays?.length>0&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel color="#22C55E">{g.sport==="mlb"?"⚾ SCORING PLAYS":g.sport==="nba"?"🏀 SCORING SUMMARY":g.sport==="nhl"?"🏒 GOALS":"🏈 SCORING SUMMARY"}</SLabel>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {g.scoringPlays.map((sp,i)=>{
                // scoringPlays are pre-normalized: {period, clock, team, desc, awayScore, homeScore, type}
                const score=sp.awayScore!=null?`${sp.awayScore}–${sp.homeScore}`:"";
                return(
                  <div key={i} style={{display:"flex",gap:10,padding:"8px 12px",borderRadius:8,background:"rgba(34,197,94,.05)",border:"1px solid rgba(34,197,94,.12)",alignItems:"flex-start"}}>
                    <div style={{minWidth:52,flexShrink:0}}>
                      {sp.period&&<div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#22C55E",fontWeight:700}}>{sp.period}</div>}
                      {sp.clock&&<div style={{fontSize:9,color:"#475569"}}>{sp.clock}</div>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      {sp.team&&<span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",marginRight:8,fontWeight:700}}>{sp.team}</span>}
                      {sp.type&&<span style={{fontSize:9,color:"#F59E0B",marginRight:6,fontFamily:"'Orbitron',sans-serif"}}>{sp.type}</span>}
                      <span style={{fontSize:12,color:"#94A3B8",lineHeight:1.4}}>{sp.desc}</span>
                    </div>
                    {score&&<div style={{fontSize:13,fontWeight:900,color:"#22C55E",flexShrink:0,fontFamily:"'Orbitron',sans-serif",letterSpacing:".04em"}}>{score}</div>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Team stats — all sports */}
        {g.boxTeams?.length>0&&(()=>{
          const awayT=g.boxTeams.find(t=>t.homeAway==="away")||g.boxTeams[0];
          const homeT=g.boxTeams.find(t=>t.homeAway==="home")||g.boxTeams[1];
          const aStats=awayT?.statistics||[];const hStats=homeT?.statistics||[];
          if(!aStats.length&&!hStats.length)return null;
          return(
            <Card style={{padding:"16px 18px"}} hover={false}>
              <SLabel color="#8B5CF6">📋 TEAM STATS</SLabel>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,marginBottom:8,alignItems:"center"}}>
                <div style={{textAlign:"center",fontSize:11,fontFamily:"'Orbitron',sans-serif",color:"#64748B",fontWeight:700}}>{g.away.abbr}</div>
                <div/>
                <div style={{textAlign:"center",fontSize:11,fontFamily:"'Orbitron',sans-serif",color:"#64748B",fontWeight:700}}>{g.home.abbr}</div>
              </div>
              {aStats.slice(0,15).map((stat,i)=>{
                const hStat=hStats.find(s=>s.name===stat.name);
                return<StatRow key={i} l={stat.label||stat.name} av={stat.displayValue||stat.value} hv={hStat?.displayValue||hStat?.value}/>;
              })}
            </Card>
          );
        })()}

        {/* NFL Drives */}
        {g.sport==="nfl"&&g.drives?.length>0&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel color="#F59E0B">🏈 DRIVE SUMMARY</SLabel>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {g.drives.slice(0,20).map((dr,i)=>(
                <div key={i} style={{padding:"8px 12px",borderRadius:8,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                    <span style={{fontSize:11,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",fontWeight:700}}>{dr.team?.abbreviation||""}</span>
                    <span style={{fontSize:11,color:dr.result==="TD"?"#22C55E":dr.result==="FG"?"#F59E0B":"#475569",fontWeight:700}}>{dr.result||"—"}</span>
                  </div>
                  <div style={{fontSize:11,color:"#64748B"}}>{dr.description||""}</div>
                  <div style={{fontSize:10,color:"#334155",marginTop:2}}>{dr.plays?.length||0} plays · {dr.yards||0} yds</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Player box scores — all sports */}
        {g.boxPlayers?.length>0&&g.boxPlayers.map((side,si)=>{
          const categories=side.statistics||[];if(!categories.length)return null;
          const teamAbbr=side.team?.abbreviation||`Team ${si+1}`;
          const teamName=side.team?.displayName||teamAbbr;
          // Sport-specific category names
          const sportCatNames={
            mlb:["BATTING","PITCHING","FIELDING"],
            nba:["STARTERS","BENCH"],
            nfl:["PASSING","RUSHING","RECEIVING","DEFENSE","KICKING"],
            nhl:["SKATERS","GOALIES"],
          }[g.sport]||[];
          // Key highlight stats per sport for quick-scan row
          const highlightStat=(stats,labels,sport)=>{
            if(sport==="nba"){const pts=stats[labels.indexOf("PTS")]||stats[0];const reb=stats[labels.indexOf("REB")]||stats[4];const ast=stats[labels.indexOf("AST")]||stats[5];return[pts,reb,ast].filter(Boolean).join(" / ");}
            if(sport==="nhl"){const g2=stats[labels.indexOf("G")]??stats[0];const a=stats[labels.indexOf("A")]??stats[1];return`${g2}G ${a}A`;}
            return null;
          };
          return(
            <Card key={si} style={{padding:"16px 18px",marginBottom:12}} hover={false}>
              <SLabel color={g.sport==="nba"