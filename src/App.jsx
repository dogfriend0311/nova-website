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
const ROLE_COLOR  = { Owner:"#F59E0B", "Co-owner":"#FB923C", Moderator:"#00D4FF", "Event Host":"#A78BFA", Helper:"#34D399" };
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
];const NBA_TEAMS = [
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
              <SLabel color={g.sport==="nba"?"#F59E0B":g.sport==="nhl"?"#00D4FF":"#22C55E"}>
                {g.sport==="nba"?"🏀":g.sport==="nhl"?"🏒":g.sport==="mlb"?"⚾":"🏈"} {teamName.toUpperCase()} — PLAYER STATS
              </SLabel>
              {categories.map((cat,ci)=>{
                const players=cat.athletes||[];if(!players.length)return null;
                const labels=(cat.labels||cat.keys||[]);
                const totals=cat.totals||[];
                const catName=sportCatNames[ci]||cat.name||`CAT ${ci+1}`;
                return(
                  <div key={ci} style={{marginBottom:ci<categories.length-1?18:0}}>
                    <div style={{fontSize:9,color:"#475569",marginBottom:8,fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",paddingBottom:4,borderBottom:"1px solid rgba(255,255,255,.05)"}}>{catName}</div>
                    <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:Math.max(360,labels.length*52+140)}}>
                        <thead>
                          <tr style={{borderBottom:"1px solid rgba(255,255,255,.1)"}}>
                            <td style={{padding:"5px 8px",color:"#475569",minWidth:130,fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>PLAYER</td>
                            {labels.map((l,li)=>(
                              <td key={li} style={{padding:"5px 6px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>{l}</td>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {players.map((p,pi)=>{
                            const stats=p.stats||[];
                            const name=p.athlete?.shortName||p.athlete?.displayName||"—";
                            const pos=p.athlete?.position?.abbreviation||"";
                            const isStarter=p.starter||p.status?.displayValue==="Starter"||false;
                            // Highlight top performers
                            const pts=g.sport==="nba"?parseInt(stats[labels.indexOf("PTS")]||0):0;
                            const goals=g.sport==="nhl"?parseInt(stats[labels.indexOf("G")]??0):0;
                            const isTop=(g.sport==="nba"&&pts>=20)||(g.sport==="nhl"&&goals>=1);
                            return(
                              <tr key={pi} style={{
                                background:isTop?"rgba(245,158,11,.04)":pi%2===0?"rgba(255,255,255,.02)":"transparent",
                                borderBottom:"1px solid rgba(255,255,255,.04)",
                              }}>
                                <td style={{padding:"6px 8px",whiteSpace:"nowrap"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                                    {pos&&<span style={{fontSize:8,fontFamily:"'Orbitron',sans-serif",color:"#334155",minWidth:20}}>{pos}</span>}
                                    <span style={{color:isTop?"#F59E0B":"#E2E8F0",fontWeight:isTop?700:500,fontSize:11}}>{name}</span>
                                    {isStarter&&<span style={{fontSize:7,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}>S</span>}
                                  </div>
                                </td>
                                {stats.map((s,si2)=>{
                                  const lbl=labels[si2]||"";
                                  // Color-code key stats
                                  const isKeyNBA=["PTS","REB","AST","STL","BLK"].includes(lbl);
                                  const isKeyNHL=["G","A","PTS","+/-"].includes(lbl);
                                  const isKey=isKeyNBA||isKeyNHL;
                                  const val=s||"—";
                                  const isZero=val==="0"||val==="0.0"||val==="—";
                                  return(
                                    <td key={si2} style={{
                                      padding:"6px 6px",textAlign:"center",
                                      color:isKey&&!isZero?"#E2E8F0":"#64748B",
                                      fontWeight:isKey&&!isZero?700:400,
                                      fontSize:isKey?12:11,
                                      fontFamily:isKey?"'Orbitron',sans-serif":"'Rajdhani',sans-serif",
                                    }}>{val}</td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                          {/* Totals row */}
                          {totals.length>0&&(
                            <tr style={{borderTop:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.04)"}}>
                              <td style={{padding:"5px 8px",fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>TOTALS</td>
                              {totals.map((t,ti)=><td key={ti} style={{padding:"5px 6px",textAlign:"center",color:"#94A3B8",fontSize:11,fontWeight:700}}>{t||"—"}</td>)}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </Card>
          );
        })}

        {/* Injuries */}
        {g.injuries?.length>0&&(
          <Card style={{padding:"16px 18px"}} hover={false}>
            <SLabel color="#EF4444">🚑 INJURY REPORT</SLabel>
            {g.injuries.slice(0,12).map((inj,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{fontSize:12,color:"#94A3B8"}}>{inj.athlete?.displayName||inj.displayName||"—"} <span style={{color:"#475569",fontSize:10}}>({inj.team?.abbreviation||""})</span></span>
                <span style={{fontSize:12,fontWeight:600,color:"#EF4444"}}>{inj.status||inj.type||"—"}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── TRIVIA ───────────────────────────────────────────────────────────────────────
// ─── TRIVIA ───────────────────────────────────────────────────────────────────────
const TRIVIA_Q={
  mlb:{
    easy:[
      {q:"Who won the 2023 AL MVP award?",a:"Shohei Ohtani",w:["Aaron Judge","Freddie Freeman","Shohei Ohtani","Yordan Alvarez"]},
      {q:"Which team won the 2023 World Series?",a:"Texas Rangers",w:["Arizona Diamondbacks","Texas Rangers","Houston Astros","Atlanta Braves"]},
      {q:"Who hit 62 home runs in 2022 to break the AL record?",a:"Aaron Judge",w:["Aaron Judge","Pete Alonso","Kyle Schwarber","Yordan Alvarez"]},
      {q:"Who won the 2022 NL Cy Young Award?",a:"Sandy Alcantara",w:["Corbin Burnes","Sandy Alcantara","Max Scherzer","Spencer Strider"]},
      {q:"Which team did Shohei Ohtani sign with before the 2024 season?",a:"Los Angeles Dodgers",w:["San Francisco Giants","Los Angeles Dodgers","New York Yankees","Toronto Blue Jays"]},
      {q:"Who won the 2021 World Series?",a:"Atlanta Braves",w:["Houston Astros","Atlanta Braves","Tampa Bay Rays","Los Angeles Dodgers"]},
      {q:"Who won the 2019 AL MVP?",a:"Mike Trout",w:["Alex Bregman","Mike Trout","George Springer","Jose Abreu"]},
      {q:"What team did Freddie Freeman win the 2020 NL MVP with?",a:"Atlanta Braves",w:["Los Angeles Dodgers","Atlanta Braves","Washington Nationals","New York Mets"]},
      {q:"Who won the 2022 World Series?",a:"Houston Astros",w:["Philadelphia Phillies","Houston Astros","Atlanta Braves","New York Yankees"]},
      {q:"Which pitcher won the 2023 AL Cy Young?",a:"Gerrit Cole",w:["Dylan Cease","Gerrit Cole","Kevin Gausman","Luis Castillo"]},
      {q:"Who holds the record for most career stolen bases?",a:"Rickey Henderson (1,406)",w:["Tim Raines (808)","Vince Coleman (752)","Lou Brock (938)","Rickey Henderson (1,406)"]},
      {q:"Who won the 2020 World Series?",a:"Los Angeles Dodgers",w:["Tampa Bay Rays","Los Angeles Dodgers","Houston Astros","Atlanta Braves"]},
      {q:"Which player won the NL MVP in both 2021 and 2023?",a:"Bryce Harper / Freddie Freeman",w:["Bryce Harper / Freddie Freeman","Juan Soto","Paul Goldschmidt","Mookie Betts"]},
      {q:"Who won the 2023 NL MVP?",a:"Ronald Acuña Jr.",w:["Mookie Betts","Freddie Freeman","Ronald Acuña Jr.","Matt Olson"]},
      {q:"Shohei Ohtani won the 2021 AL MVP unanimously. How many first-place votes did he receive?",a:"30 (unanimous)",w:["28","30 (unanimous)","25","All but 2"]},
      {q:"Who won the 2018 NL Cy Young Award?",a:"Jacob deGrom",w:["Max Scherzer","Patrick Corbin","Aaron Nola","Jacob deGrom"]},
      {q:"Which team won back-to-back World Series in 2017 and 2018?",a:"No team — Houston won 2017, Boston won 2018",w:["Houston Astros","Los Angeles Dodgers","No team — Houston won 2017, Boston won 2018","Boston Red Sox"]},
      {q:"Who led the NL in batting average in 2023?",a:"Luis Arraez (.354)",w:["Freddie Freeman","Luis Arraez (.354)","Mookie Betts","Matt Olson"]},
      {q:"Which team did Pete Alonso win the 2019 Home Run Derby with?",a:"New York Mets",w:["New York Yankees","New York Mets","Los Angeles Dodgers","Chicago Cubs"]},
      {q:"Who won the 2019 World Series MVP?",a:"Stephen Strasburg",w:["Anthony Rendon","Stephen Strasburg","Howie Kendrick","Max Scherzer"]},
    ],
    medium:[
      {q:"Jacob deGrom won back-to-back NL Cy Young Awards. Which years?",a:"2018 and 2019",w:["2017 and 2018","2018 and 2019","2019 and 2020","2020 and 2021"]},
      {q:"Who was the only player to win MVP in both leagues?",a:"Frank Robinson",w:["Barry Bonds","Frank Robinson","Roger Clemens","Hank Aaron"]},
      {q:"Which pitcher had a 1.70 ERA over 2018–2019 combined, the lowest in modern history for a starter?",a:"Jacob deGrom",w:["Max Scherzer","Clayton Kershaw","Jacob deGrom","Justin Verlander"]},
      {q:"Who won the 2011 AL MVP with 45 HRs, 111 RBI while playing for the Tigers?",a:"Justin Verlander",w:["Jose Bautista","Adrian Beltre","Justin Verlander","Curtis Granderson"]},
      {q:"Barry Bonds set the single-season OPS record in 2004. What was it?",a:"1.421",w:["1.298","1.350","1.421","1.381"]},
      {q:"Which team won three consecutive World Series titles from 2000–2002?",a:"No team — Yankees won 2000, D-backs 2001, Angels 2002",w:["New York Yankees","No team — Yankees won 2000, D-backs 2001, Angels 2002","Atlanta Braves","Boston Red Sox"]},
      {q:"Who hit .406 in 1941, the last player to hit .400 in a season?",a:"Ted Williams",w:["Joe DiMaggio","Ted Williams","Stan Musial","Mickey Mantle"]},
      {q:"What was Mike Trout's WAR in 2012, considered one of the highest rookie seasons ever?",a:"10.9",w:["8.7","9.4","10.9","7.6"]},
      {q:"Who won the 2016 NL MVP with the Cubs?",a:"Kris Bryant",w:["Anthony Rizzo","Jon Lester","Kris Bryant","Jake Arrieta"]},
      {q:"Which closer set the all-time saves record with 652?",a:"Mariano Rivera",w:["Trevor Hoffman","Billy Wagner","Mariano Rivera","Lee Smith"]},
      {q:"Who threw a perfect game on May 29, 2010 only to have it controversially called off on the final out?",a:"Armando Galarraga",w:["Dallas Braden","Roy Halladay","Armando Galarraga","Ubaldo Jimenez"]},
      {q:"Which hitter led the AL in OPS+ for 7 consecutive seasons from 2012–2018?",a:"Mike Trout",w:["Miguel Cabrera","Mike Trout","Jose Altuve","Mookie Betts"]},
      {q:"Who was the 2013 AL Cy Young winner with a 24-5 record?",a:"Max Scherzer",w:["Felix Hernandez","Max Scherzer","Hisashi Iwakuma","Justin Verlander"]},
      {q:"How many consecutive Gold Glove Awards did Yadier Molina win at catcher?",a:"9",w:["6","8","9","13"]},
      {q:"Which team did Clayton Kershaw win his 2014 NL MVP AND Cy Young with?",a:"Los Angeles Dodgers",w:["Atlanta Braves","San Francisco Giants","Los Angeles Dodgers","Cincinnati Reds"]},
      {q:"Who led MLB in WAR in 2019 with a mark of 8.3?",a:"Cody Bellinger",w:["Christian Yelich","Mike Trout","Cody Bellinger","Freddie Freeman"]},
      {q:"In 2001, who hit .350 with 73 HRs and 137 RBI, winning the NL MVP?",a:"Barry Bonds",w:["Barry Bonds","Sammy Sosa","Luis Gonzalez","Jeff Bagwell"]},
      {q:"What is the MLB record for strikeouts in a single season by a pitcher?",a:"383 (Nolan Ryan, 1973)",w:["341 (Randy Johnson)","368 (Sandy Koufax)","382 (Steve Carlton)","383 (Nolan Ryan, 1973)"]},
      {q:"Which team lost the 2017 World Series but was later revealed to have been sign-stealing?",a:"Houston Astros (won it, controversy arose after)",w:["Houston Astros (won it, controversy arose after)","Los Angeles Dodgers","New York Yankees","Boston Red Sox"]},
      {q:"Who won the 2014 AL MVP with the Tigers, the last first baseman to win it?",a:"Miguel Cabrera",w:["Mike Trout","Miguel Cabrera","Nelson Cruz","Victor Martinez"]},
    ],
    hard:[
      {q:"Ichiro set the single-season hits record in 2004 with how many hits?",a:"262",w:["255","258","262","271"]},
      {q:"Who had the highest single-season fWAR since integration, recording 12.6 in 2012?",a:"Mike Trout",w:["Barry Bonds (2002)","Mike Trout","Willie Mays (1962)","Babe Ruth (1923)"]},
      {q:"Which pitcher won the NL Cy Young in 2020 despite only pitching 73 innings?",a:"Trevor Bauer",w:["Yu Darvish","Jacob deGrom","Trevor Bauer","Dinelson Lamet"]},
      {q:"What team did the 2019 Astros' sign-stealing scheme most directly affect in the playoffs?",a:"All opponents, most notably the Yankees and Dodgers",w:["Boston Red Sox","All opponents, most notably the Yankees and Dodgers","Tampa Bay Rays","New York Yankees"]},
      {q:"Who led MLB in bWAR in BOTH 2013 and 2014?",a:"Mike Trout",w:["Miguel Cabrera","Clayton Kershaw","Mike Trout","Andrew McCutchen"]},
      {q:"Which team's 2018 sign-stealing investigation also resulted in a manager firing?",a:"Boston Red Sox (Alex Cora fired)",w:["Houston Astros","Boston Red Sox (Alex Cora fired)","New York Mets","Los Angeles Dodgers"]},
      {q:"What was Felix Hernandez's ERA in 2010 when he won the AL Cy Young with only 13 wins?",a:"2.27",w:["2.43","2.61","2.27","1.98"]},
      {q:"Who had the highest single-season OBP since 1950 with .609 in 2004?",a:"Barry Bonds",w:["Ted Williams","Babe Ruth","Barry Bonds","Mickey Mantle"]},
      {q:"Which pitcher holds the record for most no-hitters thrown in a career?",a:"Nolan Ryan (7)",w:["Sandy Koufax (4)","Bob Feller (3)","Nolan Ryan (7)","Randy Johnson (2)"]},
      {q:"In what year did the Houston Astros go from worst to first, winning 86 games after losing 111?",a:"2015",w:["2013","2014","2015","2016"]},
      {q:"What was Zack Greinke's ERA in 2009 when he won the AL Cy Young?",a:"2.16",w:["2.33","1.99","2.16","2.48"]},
      {q:"Who hit .372 in 1994 — the year the season was cut short by a strike — to potentially threaten .400?",a:"Tony Gwynn",w:["Frank Thomas","Tony Gwynn","Jeff Bagwell","Matt Williams"]},
      {q:"Which player was intentionally walked 120 times in a single season?",a:"Barry Bonds (2004)",w:["Babe Ruth (1923)","Ted Williams (1957)","Barry Bonds (2004)","Mickey Mantle (1961)"]},
      {q:"How many consecutive scoreless innings did Orel Hershiser throw in 1988, setting the MLB record?",a:"59",w:["52","55","59","63"]},
      {q:"Who won the 2012 AL MVP, the last player other than Trout or Ohtani to win it until 2024?",a:"Miguel Cabrera (Triple Crown season)",w:["Josh Hamilton","Miguel Cabrera (Triple Crown season)","Mike Trout","Robinson Cano"]},
    ],
  },
  nfl:{
    easy:[
      {q:"Who won the 2023 NFL MVP award?",a:"Lamar Jackson",w:["Patrick Mahomes","Josh Allen","Lamar Jackson","CJ Stroud"]},
      {q:"Which team won Super Bowl LVIII (58) in 2024?",a:"Kansas City Chiefs",w:["San Francisco 49ers","Kansas City Chiefs","Baltimore Ravens","Detroit Lions"]},
      {q:"Who won the Super Bowl MVP in Super Bowl LVIII?",a:"Patrick Mahomes",w:["Travis Kelce","Patrick Mahomes","Mecole Hardman","Chris Jones"]},
      {q:"How many MVP awards has Lamar Jackson won as of 2024?",a:"2 (2019 and 2023)",w:["1","2 (2019 and 2023)","3","He's never won MVP"]},
      {q:"Who won the 2022 NFL MVP?",a:"Patrick Mahomes",w:["Josh Allen","Justin Jefferson","Patrick Mahomes","Jalen Hurts"]},
      {q:"Which team won Super Bowl LVII (57)?",a:"Kansas City Chiefs",w:["Philadelphia Eagles","Kansas City Chiefs","San Francisco 49ers","Cincinnati Bengals"]},
      {q:"Who won the 2021 NFL MVP?",a:"Cooper Kupp (Offensive Player) / Aaron Rodgers (MVP)",w:["Josh Allen","Tom Brady","Cooper Kupp (Offensive Player) / Aaron Rodgers (MVP)","Dak Prescott"]},
      {q:"Who won back-to-back NFL MVP awards in 2020 and 2021?",a:"Aaron Rodgers",w:["Patrick Mahomes","Tom Brady","Aaron Rodgers","Josh Allen"]},
      {q:"Which team won Super Bowl LV (55) defeating the Chiefs 31-9?",a:"Tampa Bay Buccaneers",w:["Kansas City Chiefs","Tampa Bay Buccaneers","Green Bay Packers","Buffalo Bills"]},
      {q:"Who was the Super Bowl LV MVP?",a:"Tom Brady",w:["Rob Gronkowski","Tom Brady","Chris Godwin","Antonio Brown"]},
      {q:"How many total Super Bowls has Patrick Mahomes won as of 2024?",a:"3",w:["2","3","4","1"]},
      {q:"Who won the 2018 NFL MVP?",a:"Patrick Mahomes",w:["Drew Brees","Patrick Mahomes","Todd Gurley","Saquon Barkley"]},
      {q:"Which team did Tom Brady win his 7th Super Bowl with?",a:"Tampa Bay Buccaneers",w:["New England Patriots","Tampa Bay Buccaneers","Los Angeles Rams","Kansas City Chiefs"]},
      {q:"Who won the 2019 NFL MVP?",a:"Lamar Jackson",w:["Patrick Mahomes","Lamar Jackson","Russell Wilson","Deshaun Watson"]},
      {q:"Which running back won the 2018 NFL Offensive Rookie of the Year?",a:"Saquon Barkley",w:["Nick Chubb","Saquon Barkley","Phillip Lindsay","Sony Michel"]},
      {q:"Who led the NFL in receiving yards in 2022?",a:"Justin Jefferson",w:["Davante Adams","Tyreek Hill","Justin Jefferson","Stefon Diggs"]},
      {q:"Which team won Super Bowl LVI (56)?",a:"Los Angeles Rams",w:["Cincinnati Bengals","Los Angeles Rams","San Francisco 49ers","Las Vegas Raiders"]},
      {q:"Who was the Super Bowl LVI MVP?",a:"Cooper Kupp",w:["Matthew Stafford","Aaron Donald","Cooper Kupp","Odell Beckham Jr."]},
      {q:"How many passing TDs did Patrick Mahomes throw in his MVP 2018 season?",a:"50",w:["43","46","50","54"]},
      {q:"Which defensive player won the 2023 NFL Defensive Player of the Year?",a:"Myles Garrett",w:["Micah Parsons","Myles Garrett","Maxx Crosby","Fred Warner"]},
    ],
    medium:[
      {q:"Lamar Jackson's 2019 MVP season — how many passing TDs did he throw?",a:"36",w:["31","34","36","41"]},
      {q:"Who won the NFL MVP in 2017 with 4,577 yards and 34 TDs for the Eagles?",a:"Carson Wentz (but lost it to Tom Brady due to injury)",w:["Carson Wentz (but lost it to Tom Brady due to injury)","Nick Foles","Tom Brady","Drew Brees"]},
      {q:"Which QB set the NFL single-season completion percentage record of 74.3% in 2018?",a:"Drew Brees",w:["Aaron Rodgers","Patrick Mahomes","Drew Brees","Nick Foles"]},
      {q:"Who won the AP NFL MVP in 2012, his third in four years?",a:"Adrian Peterson",w:["Peyton Manning","Tom Brady","Adrian Peterson","Aaron Rodgers"]},
      {q:"What was Peyton Manning's single-season TD record set in 2013?",a:"55",w:["50","52","55","57"]},
      {q:"Who won the 2016 NFL MVP despite the Falcons going 11-5?",a:"Matt Ryan",w:["Dak Prescott","Matt Ryan","Ezekiel Elliott","Drew Brees"]},
      {q:"Which receiver set the NFL record for receiving yards in a season in 2012?",a:"Calvin Johnson (1,964 yards)",w:["Jerry Rice (1,848)","Julio Jones (1,964)","Calvin Johnson (1,964 yards)","Randy Moss (1,782)"]},
      {q:"Who rushed for 2,097 yards in 2012, second-most in NFL history?",a:"Adrian Peterson",w:["Jamaal Charles","LeSean McCoy","Adrian Peterson","Marshawn Lynch"]},
      {q:"Which team's defense allowed the fewest points in 2023, earning the #1 seed?",a:"San Francisco 49ers",w:["Baltimore Ravens","Dallas Cowboys","San Francisco 49ers","Cleveland Browns"]},
      {q:"Who won the 2015 NFL MVP, his second, leading the Panthers to a 15-1 record?",a:"Cam Newton",w:["Tom Brady","Cam Newton","Russell Wilson","Aaron Rodgers"]},
      {q:"What yards-per-carry did Derrick Henry average in his 2,000-yard 2020 season?",a:"5.4",w:["4.8","5.1","5.4","5.9"]},
      {q:"Which QB was the only unanimous NFL MVP in history (2024 ballot)?",a:"No one — there has been no unanimous MVP",w:["Lamar Jackson","Patrick Mahomes","No one — there has been no unanimous MVP","Aaron Rodgers"]},
      {q:"Who holds the record for most rushing TDs in a season with 28 in 1945?",a:"Steve Van Buren",w:["LaDainian Tomlinson (28 in 2006)","Emmitt Smith","Steve Van Buren","Jim Brown"]},
      {q:"Which team did Peyton Manning win his 5th MVP with in 2013?",a:"Denver Broncos",w:["Indianapolis Colts","Denver Broncos","Tennessee Titans","New Orleans Saints"]},
      {q:"Who was the last running back to win the NFL MVP before LaDainian Tomlinson in 2006?",a:"Marshall Faulk (2000)",w:["Emmitt Smith (1995)","Marshall Faulk (2000)","Barry Sanders (1997)","Jamal Lewis (2003)"]},
      {q:"How many interceptions did Lamar Jackson throw in his unanimous-style 2019 MVP season?",a:"6",w:["3","6","9","12"]},
      {q:"Which team did Kurt Warner win his second NFL MVP with in 2001?",a:"St. Louis Rams",w:["Arizona Cardinals","St. Louis Rams","New York Giants","Green Bay Packers"]},
      {q:"Justin Jefferson set the record for receiving yards in a player's first two NFL seasons. How many?",a:"3,016",w:["2,841","2,974","3,016","3,125"]},
      {q:"Who won the Super Bowl LI MVP after the greatest comeback in Super Bowl history?",a:"Tom Brady",w:["James White","Julian Edelman","Tom Brady","Malcolm Butler"]},
      {q:"How many straight 4,000-yard passing seasons did Drew Brees have from 2006–2018?",a:"13",w:["9","11","13","14"]},
    ],
    hard:[
      {q:"Lamar Jackson's 2019 MVP season passer rating was the highest single-season mark ever at the time. What was it?",a:"113.3",w:["109.7","111.4","113.3","116.1"]},
      {q:"Who was the only player to win the NFL MVP, Super Bowl MVP, and be cut the next season?",a:"Joe Theismann (not exactly) — trick Q. Answer: no such player exists",w:["Jim Plunkett","Joe Theismann (not exactly) — trick Q. Answer: no such player exists","Doug Williams","Phil Simms"]},
      {q:"Patrick Mahomes' 2018 MVP season: what was his adjusted net yards per attempt?",a:"9.6",w:["8.7","9.1","9.6","10.2"]},
      {q:"Which QB has the highest career passer rating in NFL history (minimum 1,500 attempts)?",a:"Patrick Mahomes (106.3 entering 2024)",w:["Aaron Rodgers (103.1)","Tom Brady (97.6)","Patrick Mahomes (106.3 entering 2024)","Tony Romo (97.6)"]},
      {q:"Who led the NFL in EPA (Expected Points Added) per dropback in 2023?",a:"Dak Prescott",w:["Josh Allen","Tua Tagovailoa","Dak Prescott","Brock Purdy"]},
      {q:"What was Peyton Manning's TD:INT ratio in his 55-TD 2013 season?",a:"55:10",w:["55:7","55:10","55:12","55:8"]},
      {q:"Which team went 14-3 in the 2023 regular season but lost in the NFC Championship?",a:"San Francisco 49ers",w:["Detroit Lions","Philadelphia Eagles","San Francisco 49ers","Dallas Cowboys"]},
      {q:"Who holds the NFL record for most receiving yards in a single game?",a:"Flipper Anderson (336 yards, 1989)",w:["Jerry Rice (289)","Calvin Johnson (329)","Flipper Anderson (336 yards, 1989)","Colt Anderson (303)"]},
      {q:"Aaron Rodgers' 2011 season had the highest single-season passer rating at the time. What was it?",a:"122.5",w:["118.6","120.3","122.5","124.8"]},
      {q:"Which team holds the record for most points scored in a single Super Bowl?",a:"San Francisco 49ers (55 points, Super Bowl XXIX)",w:["Chicago Bears (46, Super Bowl XX)","San Francisco 49ers (55 points, Super Bowl XXIX)","Dallas Cowboys (52, Super Bowl XXVII)","New England Patriots (48, Super Bowl XXXIX)"]},
      {q:"How many NFL MVP awards has Aaron Rodgers won?",a:"4 (2011, 2014, 2020, 2021)",w:["3","4 (2011, 2014, 2020, 2021)","2","5"]},
      {q:"Who set the record for most tackles for loss in a single season with 23 in 2019?",a:"Myles Garrett",w:["Aaron Donald","Myles Garrett","Chase Young","Joey Bosa"]},
      {q:"Which QB threw 40 TDs and only 4 INTs in 2018, with a historically low interception rate?",a:"Drew Brees",w:["Patrick Mahomes","Drew Brees","Aaron Rodgers","Matt Ryan"]},
      {q:"What record did Justin Jefferson break in 2022 to become the fastest to 5,000 career receiving yards?",a:"Odell Beckham Jr.'s record",w:["Randy Moss's record","Odell Beckham Jr.'s record","Jerry Rice's record","Marvin Harrison's record"]},
      {q:"Who was the defensive MVP of Super Bowl XLVIII, a 43-8 Seattle blowout of Denver?",a:"Malcolm Smith",w:["Earl Thomas","Richard Sherman","Malcolm Smith","Bobby Wagner"]},
    ],
  },
  nba:{
    easy:[
      {q:"Who won the 2023 NBA MVP?",a:"Joel Embiid",w:["Nikola Jokic","Joel Embiid","Jayson Tatum","Luka Doncic"]},
      {q:"How many consecutive NBA MVPs did Nikola Jokic win before Embiid in 2023?",a:"2 (2021 and 2022)",w:["1","2 (2021 and 2022)","3","He won 3 straight"]},
      {q:"Which team won the 2023 NBA Championship?",a:"Denver Nuggets",w:["Miami Heat","Denver Nuggets","Boston Celtics","Golden State Warriors"]},
      {q:"Who was the 2023 NBA Finals MVP?",a:"Nikola Jokic",w:["Jamal Murray","Nikola Jokic","Jaylen Brown","Jimmy Butler"]},
      {q:"Which team won the 2022 NBA Championship?",a:"Golden State Warriors",w:["Boston Celtics","Golden State Warriors","Miami Heat","Memphis Grizzlies"]},
      {q:"Who won the 2022 NBA Finals MVP?",a:"Stephen Curry",w:["Klay Thompson","Draymond Green","Stephen Curry","Andrew Wiggins"]},
      {q:"LeBron James passed Kareem Abdul-Jabbar as the all-time scoring leader in what year?",a:"2023",w:["2021","2022","2023","2024"]},
      {q:"Who won the 2021 NBA MVP?",a:"Nikola Jokic",w:["Giannis Antetokounmpo","Stephen Curry","Nikola Jokic","Luka Doncic"]},
      {q:"Who won the 2021 NBA Championship?",a:"Milwaukee Bucks",w:["Phoenix Suns","Atlanta Hawks","Milwaukee Bucks","Los Angeles Clippers"]},
      {q:"Who was the 2021 NBA Finals MVP?",a:"Giannis Antetokounmpo",w:["Khris Middleton","Jrue Holiday","Giannis Antetokounmpo","Brook Lopez"]},
      {q:"Giannis Antetokounmpo won back-to-back MVPs in which years?",a:"2019 and 2020",w:["2018 and 2019","2019 and 2020","2020 and 2021","2021 and 2022"]},
      {q:"Who won the 2024 NBA MVP?",a:"Nikola Jokic",w:["Luka Doncic","Shai Gilgeous-Alexander","Nikola Jokic","Jayson Tatum"]},
      {q:"Which team did LeBron James win his first NBA championship with?",a:"Miami Heat",w:["Cleveland Cavaliers","Miami Heat","Los Angeles Lakers","Boston Celtics"]},
      {q:"Who won the 2020 NBA MVP?",a:"Giannis Antetokounmpo",w:["LeBron James","James Harden","Giannis Antetokounmpo","Kawhi Leonard"]},
      {q:"Which team won the 2024 NBA Championship?",a:"Boston Celtics",w:["Dallas Mavericks","Boston Celtics","Indiana Pacers","New York Knicks"]},
      {q:"Who was the 2018 NBA Finals MVP playing for Golden State?",a:"Kevin Durant",w:["Stephen Curry","Klay Thompson","Kevin Durant","Draymond Green"]},
      {q:"Stephen Curry set the NBA 3-point record in 2015-16 with how many makes?",a:"402",w:["339","371","402","418"]},
      {q:"Who won the 2019 NBA Finals MVP?",a:"Kawhi Leonard",w:["Kyle Lowry","Pascal Siakam","Kawhi Leonard","Marc Gasol"]},
      {q:"Which team won the 2019 NBA Championship?",a:"Toronto Raptors",w:["Golden State Warriors","Toronto Raptors","Milwaukee Bucks","Portland Trail Blazers"]},
      {q:"Who won the 2016 NBA MVP?",a:"Stephen Curry (unanimous)",w:["LeBron James","Kevin Durant","Stephen Curry (unanimous)","Kawhi Leonard"]},
    ],
    medium:[
      {q:"Nikola Jokic's 2021 MVP season — what was his stat line (PPG/RPG/APG)?",a:"26.4 / 10.8 / 8.3",w:["24.2 / 9.7 / 7.1","26.4 / 10.8 / 8.3","28.1 / 11.2 / 7.9","23.6 / 10.2 / 8.9"]},
      {q:"Which player became the first center to win MVP since Shaquille O'Neal (2000) until Jokic?",a:"Nikola Jokic was the first since Shaq",w:["Dwight Howard","Joel Embiid","Nikola Jokic was the first since Shaq","Karl-Anthony Towns"]},
      {q:"Stephen Curry's unanimous 2016 MVP season: what was his PPG?",a:"30.1",w:["27.8","29.4","30.1","32.3"]},
      {q:"Who holds the NBA record for most points in a playoff series?",a:"Michael Jordan (though Wilt held single-game records)",w:["Michael Jordan (though Wilt held single-game records)","LeBron James","Kobe Bryant","Jerry West"]},
      {q:"Which player averaged 36.3 PPG in the 2007 playoffs, the highest since Michael Jordan?",a:"LeBron James",w:["Dwyane Wade","Kobe Bryant","LeBron James","Dirk Nowitzki"]},
      {q:"Who won the NBA MVP in 2014 with OKC, averaging 32.0 PPG?",a:"Kevin Durant",w:["LeBron James","Kevin Durant","Russell Westbrook","James Harden"]},
      {q:"Russell Westbrook averaged a triple-double for the full season in 2016-17. What was his APG?",a:"10.4",w:["9.1","10.4","11.2","12.0"]},
      {q:"Which player won the MVP in 2018 with the most Win Shares in the league despite playing for the Rockets?",a:"James Harden",w:["LeBron James","James Harden","Steph Curry","Anthony Davis"]},
      {q:"Who led the NBA in scoring in 2023-24 with 34.3 PPG?",a:"Luka Doncic",w:["Shai Gilgeous-Alexander","Jayson Tatum","Luka Doncic","Damian Lillard"]},
      {q:"Which team set the NBA record for wins in a season with 73 in 2015-16?",a:"Golden State Warriors",w:["Chicago Bulls (72-10)","Golden State Warriors","San Antonio Spurs","Cleveland Cavaliers"]},
      {q:"Giannis Antetokounmpo's 2019-20 MVP season: what was his PER?",a:"31.9",w:["28.7","30.4","31.9","33.2"]},
      {q:"Who won the Defensive Player of the Year AND MVP in the same season (2020)?",a:"Giannis Antetokounmpo",w:["Kawhi Leonard","Ben Simmons","Giannis Antetokounmpo","Rudy Gobert"]},
      {q:"Joel Embiid's 2022-23 MVP season had what PPG, highest by an MVP since Jordan?",a:"33.1",w:["30.6","31.8","33.1","34.7"]},
      {q:"Which player averaged 29/8/8 in the 2023 Finals to win MVP despite his team losing?",a:"No player wins Finals MVP on the losing team — Jimmy Butler came close",w:["Jimmy Butler","Nikola Jokic","No player wins Finals MVP on the losing team — Jimmy Butler came close","Jamal Murray"]},
      {q:"Who holds the record for the highest single-season assist average in NBA history?",a:"John Stockton (14.5 APG, 1989-90)",w:["Magic Johnson (13.1)","John Stockton (14.5 APG, 1989-90)","Isiah Thomas (13.9)","Oscar Robertson (11.5)"]},
      {q:"Which team had the best record in the 2023-24 regular season?",a:"Oklahoma City Thunder",w:["Boston Celtics","Oklahoma City Thunder","Milwaukee Bucks","Denver Nuggets"]},
      {q:"How many MVP awards did LeBron James win in his career?",a:"4",w:["3","4","5","6"]},
      {q:"Who was the 2017 NBA MVP leading the Rockets to 55 wins?",a:"James Harden",w:["Chris Paul","Steph Curry","James Harden","Kawhi Leonard"]},
      {q:"Which player won the 2024 NBA Finals MVP for the Celtics?",a:"Jaylen Brown",w:["Jayson Tatum","Al Horford","Jaylen Brown","Jrue Holiday"]},
      {q:"What was Wilt Chamberlain's scoring average in 1961-62, an NBA record?",a:"50.4 PPG",w:["44.8 PPG","48.1 PPG","50.4 PPG","52.2 PPG"]},
    ],
    hard:[
      {q:"Nikola Jokic is the only player in NBA history to be in the top 20 in both career PER and career assist percentage. True or false — and what is his career PER entering 2024?",a:"True — approximately 31.3 career PER",w:["False — PER is around 26.8","True — approximately 31.3 career PER","True — approximately 28.9 career PER","False — PER is around 29.4"]},
      {q:"Which player holds the NBA record for most triple-doubles in a career?",a:"Russell Westbrook (198)",w:["Magic Johnson (138)","Oscar Robertson (181)","Russell Westbrook (198)","LeBron James (107)"]},
      {q:"Stephen Curry set the record for most 3s in a playoff series with how many in 2015?",a:"98 total in 2015 playoffs",w:["78","88","98 total in 2015 playoffs","104"]},
      {q:"What was Michael Jordan's career playoff scoring average, an all-time record?",a:"33.4 PPG",w:["31.2 PPG","32.5 PPG","33.4 PPG","34.1 PPG"]},
      {q:"Which player had the highest usage rate in a single season at 38.8% in 2013-14?",a:"Kevin Durant",w:["Russell Westbrook","James Harden","Kevin Durant","Kobe Bryant"]},
      {q:"Joel Embiid's 33.1 PPG in 2022-23 was the highest MVP average since who?",a:"Allen Iverson (31.4 in 2001)",w:["Michael Jordan (30.1 in 1993)","Allen Iverson (31.4 in 2001)","Shaquille O'Neal (29.7)","Kobe Bryant (35.4 in 2006)"]},
      {q:"Which player averaged 40+ PPG over an entire season (1961-62)?",a:"Wilt Chamberlain (50.4, and also averaged 44.8 in 1962-63)",w:["Elgin Baylor","Wilt Chamberlain (50.4, and also averaged 44.8 in 1962-63)","Oscar Robertson","Jerry West"]},
      {q:"Who won the 2013 NBA MVP, averaging 28.1/10.0/7.3?",a:"LeBron James",w:["Kevin Durant","LeBron James","Carmelo Anthony","Chris Paul"]},
      {q:"Which team holds the record for the most losses in an NBA season?",a:"Charlotte Bobcats (7-59, 2011-12)",w:["Cleveland Cavaliers (17-65)","Charlotte Bobcats (7-59, 2011-12)","New Jersey Nets (12-70)","Dallas Mavericks (11-71)"]},
      {q:"LeBron's highest single-season PER was in 2009. What was it?",a:"31.7",w:["29.3","30.6","31.7","33.1"]},
      {q:"Kareem Abdul-Jabbar won 6 MVP awards. Who is second all-time with 5?",a:"Michael Jordan",w:["LeBron James","Bill Russell","Michael Jordan","Wilt Chamberlain"]},
      {q:"What is the record for most assists in a single NBA game?",a:"Scott Skiles (30 assists, 1990)",w:["Magic Johnson (24)","Bob Cousy (28)","Scott Skiles (30 assists, 1990)","John Stockton (25)"]},
      {q:"Which player won Finals MVP but his team still lost (has this ever happened)?",a:"No — Finals MVP has always gone to the winning team",w:["Jerry West (1969, unique case)","Wilt Chamberlain","No — Finals MVP has always gone to the winning team","Bill Russell"]},
      {q:"How many points did Kobe Bryant score in his legendary 81-point game in 2006?",a:"81 (vs. Toronto Raptors)",w:["72","76","81 (vs. Toronto Raptors)","88"]},
      {q:"Which player holds the record for highest True Shooting % in a single season (min. 1000 pts)?",a:"DeAndre Jordan (.710 in 2014-15)",w:["Shaquille O'Neal","Tyson Chandler","DeAndre Jordan (.710 in 2014-15)","Nikola Jokic"]},
    ],
  },
  nhl:{
    easy:[
      {q:"Who won the 2023 Hart Trophy (NHL MVP)?",a:"Connor McDavid",w:["Nathan MacKinnon","Connor McDavid","David Pastrnak","Leon Draisaitl"]},
      {q:"Which team won the 2023 Stanley Cup?",a:"Vegas Golden Knights",w:["Florida Panthers","Vegas Golden Knights","Carolina Hurricanes","Edmonton Oilers"]},
      {q:"Who was the 2023 Conn Smythe Trophy winner (playoff MVP)?",a:"Jonathan Marchessault",w:["William Karlsson","Mark Stone","Jonathan Marchessault","Adin Hill"]},
      {q:"How many Hart Trophies has Connor McDavid won as of 2024?",a:"3",w:["2","3","4","5"]},
      {q:"Who won the 2022 Hart Trophy?",a:"Auston Matthews",w:["Leon Draisaitl","Nathan MacKinnon","Auston Matthews","Connor McDavid"]},
      {q:"Which team won the 2022 Stanley Cup?",a:"Colorado Avalanche",w:["Tampa Bay Lightning","Colorado Avalanche","Edmonton Oilers","Carolina Hurricanes"]},
      {q:"Who was the 2022 Conn Smythe winner?",a:"Cale Makar",w:["Nathan MacKinnon","Mikko Rantanen","Cale Makar","Darcy Kuemper"]},
      {q:"Which team won back-to-back Stanley Cups in 2020 and 2021?",a:"Tampa Bay Lightning",w:["Montreal Canadiens","Tampa Bay Lightning","Colorado Avalanche","Florida Panthers"]},
      {q:"Who won the 2021 Hart Trophy?",a:"Connor McDavid",w:["Leon Draisaitl","Connor McDavid","Nathan MacKinnon","Auston Matthews"]},
      {q:"Who won the 2020 Hart Trophy?",a:"Leon Draisaitl",w:["Connor McDavid","Nathan MacKinnon","Leon Draisaitl","Alex Ovechkin"]},
      {q:"Alex Ovechkin holds the NHL record for most goals. How many as of 2024?",a:"893",w:["858","874","893","901"]},
      {q:"Who won the 2019 Stanley Cup with the Blues?",a:"St. Louis Blues (Ryan O'Reilly won Conn Smythe)",w:["Boston Bruins","St. Louis Blues (Ryan O'Reilly won Conn Smythe)","San Jose Sharks","Dallas Stars"]},
      {q:"Which team won the 2024 Stanley Cup?",a:"Florida Panthers",w:["Edmonton Oilers","Florida Panthers","New York Rangers","Carolina Hurricanes"]},
      {q:"Who won the 2024 Hart Trophy?",a:"Nathan MacKinnon",w:["Connor McDavid","Nikita Kucherov","Nathan MacKinnon","Auston Matthews"]},
      {q:"Leon Draisaitl won the 2020 Hart Trophy with what point total?",a:"110 points",w:["97 points","103 points","110 points","116 points"]},
      {q:"Who led the NHL in goals in 2022-23 with 60?",a:"David Pastrnak",w:["Connor McDavid","Leon Draisaitl","David Pastrnak","Tage Thompson"]},
      {q:"Which goalie won the Vezina Trophy in 2023?",a:"Linus Ullmark",w:["Igor Shesterkin","Andrei Vasilevskiy","Linus Ullmark","Juuse Saros"]},
      {q:"Who won the 2018 Hart Trophy?",a:"Taylor Hall",w:["Nikita Kucherov","Connor McDavid","Taylor Hall","Nathan MacKinnon"]},
      {q:"Which team won the 2018 Stanley Cup?",a:"Washington Capitals",w:["Vegas Golden Knights","Pittsburgh Penguins","Washington Capitals","Tampa Bay Lightning"]},
      {q:"Who won the 2024 Conn Smythe Trophy?",a:"Aleksander Barkov",w:["Sam Reinhart","Sergei Bobrovsky","Aleksander Barkov","Matthew Tkachuk"]},
    ],
    medium:[
      {q:"Connor McDavid's 2022-23 season — how many points did he record, the highest since Lemieux?",a:"153 points",w:["141","147","153 points","163"]},
      {q:"Which player scored 92 goals in 1981-82, the second-most in NHL history?",a:"Wayne Gretzky (who also scored 92 that year — Phil Esposito held the previous record with 76)",w:["Mike Bossy","Wayne Gretzky (who also scored 92 that year — Phil Esposito held the previous record with 76)","Mario Lemieux","Brett Hull"]},
      {q:"Nikita Kucherov set the record for most points in a single playoff year. How many?",a:"34 points (2019 playoffs)",w:["28","31","34 points (2019 playoffs)","37"]},
      {q:"Who won the Hart Trophy in 2019 with 128 points — his second Hart in a row?",a:"Nikita Kucherov",w:["Connor McDavid","Nikita Kucherov","Nathan MacKinnon","Taylor Hall"]},
      {q:"What year did Wayne Gretzky score his record 92 goals in a season?",a:"1981-82",w:["1979-80","1980-81","1981-82","1983-84"]},
      {q:"Which goalie had a .937 save percentage in 2021-22, winning the Vezina?",a:"Igor Shesterkin",w:["Andrei Vasilevskiy","Jake Oettinger","Igor Shesterkin","Thatcher Demko"]},
      {q:"Who won the Conn Smythe in 2021 leading Tampa to back-to-back cups?",a:"Andrei Vasilevskiy",w:["Nikita Kucherov","Brayden Point","Andrei Vasilevskiy","Victor Hedman"]},
      {q:"Nathan MacKinnon's 2022-23 season points total?",a:"111 points",w:["99","104","111 points","119"]},
      {q:"Which defenseman won the Norris Trophy in 2022 becoming one of the youngest ever?",a:"Cale Makar",w:["Adam Fox","Roman Josi","Cale Makar","Victor Hedman"]},
      {q:"How many points did Nikita Kucherov score in 2023-24 to lead the NHL?",a:"100 points",w:["87","93","100 points","108"]},
      {q:"Alex Ovechkin set the record for most power play goals in history. How many as of 2024?",a:"335",w:["298","312","335","354"]},
      {q:"Who won the Hart Trophy in both 2023 and 2024?",a:"Connor McDavid (2023) and Nathan MacKinnon (2024) — different winners",w:["Connor McDavid both years","Connor McDavid (2023) and Nathan MacKinnon (2024) — different winners","Nathan MacKinnon both years","Leon Draisaitl both years"]},
      {q:"Which player's 2020-21 season was historically anomalous — 85 points in 54 games while injured most of the year?",a:"Nikita Kucherov (ineligible for Hart due to IR loophole)",w:["Connor McDavid","Nikita Kucherov (ineligible for Hart due to IR loophole)","Leon Draisaitl","Artemi Panarin"]},
      {q:"Who won the Vezina Trophy in 2021 and 2022?",a:"Marc-Andre Fleury (2021) and Igor Shesterkin (2022)",w:["Andrei Vasilevskiy both years","Tuukka Rask (2021) and Igor Shesterkin (2022)","Marc-Andre Fleury (2021) and Igor Shesterkin (2022)","Juuse Saros both years"]},
      {q:"What was Auston Matthews' goal total in 2021-22, setting an American-born record?",a:"60 goals",w:["53","57","60 goals","64"]},
      {q:"Which team won three straight Stanley Cups from 2016-2018?",a:"No team — Pittsburgh won 2016 and 2017, Washington won 2018",w:["Pittsburgh Penguins (3 straight)","No team — Pittsburgh won 2016 and 2017, Washington won 2018","Tampa Bay Lightning","Chicago Blackhawks"]},
      {q:"Who won the 2021 Stanley Cup against the Montreal Canadiens?",a:"Tampa Bay Lightning",w:["Colorado Avalanche","Tampa Bay Lightning","Vegas Golden Knights","Carolina Hurricanes"]},
      {q:"What is Connor McDavid's career points per game, the highest in modern NHL history?",a:"1.48 PPG entering 2024",w:["1.31","1.38","1.48 PPG entering 2024","1.55"]},
      {q:"Which player became the fastest to 1,000 career points since Gretzky?",a:"Mario Lemieux",w:["Jaromir Jagr","Wayne Gretzky","Mario Lemieux","Steve Yzerman"]},
      {q:"Who won the 2017 Stanley Cup MVP playing for the Pittsburgh Penguins?",a:"Sidney Crosby",w:["Evgeni Malkin","Phil Kessel","Sidney Crosby","Matt Murray"]},
    ],
    hard:[
      {q:"Wayne Gretzky's all-time points record stands at 2,857. His ASSISTS ALONE (1,963) would be the all-time points record. True?",a:"True — his assists alone exceed every other player's total points",w:["False — Gordie Howe is second with 1,850 total points","True — his assists alone exceed every other player's total points","True — but only barely over Messier's 1,887","False — Jagr is second at 1,921 total points"]},
      {q:"Connor McDavid's 153-point 2022-23 season — whose record did it come closest to breaking?",a:"Mario Lemieux's 1995-96 mark of 161 points in 70 games",w:["Wayne Gretzky's 92-goal season","Mario Lemieux's 1995-96 mark of 161 points in 70 games","Steve Yzerman's 155 points in 1988-89","Brett Hull's 86 goals in 1990-91"]},
      {q:"Who holds the NHL record for most points in a single season by a defenseman?",a:"Bobby Orr (102 points, 1970-71)",w:["Paul Coffey (138 in 1985-86)","Denis Potvin (101)","Bobby Orr (102 points, 1970-71)","Al MacInnis (103)"]},
      {q:"Nikita Kucherov's 2023-24 regular season point total of 100 came despite missing significant time. Who led the NHL in points-per-game among qualifiers?",a:"Kucherov himself at 1.22 PPG",w:["Connor McDavid","Nathan MacKinnon","Kucherov himself at 1.22 PPG","Leon Draisaitl"]},
      {q:"Which goalie holds the record for most career wins in NHL history?",a:"Martin Brodeur (691 wins)",w:["Patrick Roy (551)","Martin Brodeur (691 wins)","Roberto Luongo (489)","Henrik Lundqvist (459)"]},
      {q:"How many Hart Trophies did Wayne Gretzky win in his career?",a:"9",w:["6","8","9","11"]},
      {q:"Who was the last player before McDavid to reach 150+ points in a season?",a:"Mario Lemieux (161 points in 1995-96)",w:["Jaromir Jagr (149 in 1995-96)","Steve Yzerman","Mario Lemieux (161 points in 1995-96)","Mark Messier"]},
      {q:"Cale Makar won the Norris Trophy in 2022 with how many points, a record for defensemen since Coffey?",a:"86 points",w:["74","79","86 points","92"]},
      {q:"Which goalie had a .942 SV% in 2014-15, the highest in the modern NHL?",a:"Carey Price",w:["Pekka Rinne","Ben Bishop","Carey Price","Tuukka Rask"]},
      {q:"Who scored 76 goals in 1992-93, the third-most in NHL history?",a:"Teemu Selanne",w:["Mario Lemieux","Brett Hull","Teemu Selanne","Luc Robitaille"]},
      {q:"Bobby Orr won the Norris Trophy how many consecutive times from 1967-1975?",a:"8 straight",w:["6 straight","7 straight","8 straight","All except one year"]},
      {q:"What is the record for most goals in a single NHL game by one player?",a:"7 goals (Joe Malone, 1920)",w:["5 goals (many players)","6 goals (Syd Howe, 1944)","7 goals (Joe Malone, 1920)","6 goals (Red Berenson, 1968)"]},
      {q:"Which team set the NHL record for most wins in a season in 2023-24?",a:"Florida Panthers",w:["New York Rangers","Florida Panthers","Vancouver Canucks","Colorado Avalanche"]},
      {q:"Nathan MacKinnon's 2022-23 regular season: his 111 points tied him with whom for 5th in Avs franchise history single-season points?",a:"Joe Sakic (1996-97)",w:["Peter Forsberg","Joe Sakic (1996-97)","Milan Hejduk","Paul Stastny"]},
      {q:"What does Gretzky's record of 92 goals in 1981-82 represent as goals-per-game rate?",a:"1.12 goals per game",w:["0.98 goals per game","1.05 goals per game","1.12 goals per game","1.18 goals per game"]},
    ],
  },
};

function shuffle(arr,rng){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function quickRng(){let s=Date.now()>>>0;return()=>{s=Math.imul(s^(s>>>13),s^(s<<7));s^=s>>>17;return(s>>>0)/4294967296;};}

// Strip parenthetical context from displayed choice text — scoring still uses full string
function cleanChoice(s){
  // Keep short parens like "(2019)" or "(unanimous)" — only strip long explanations
  return s.replace(/\s*\([^)]{30,}\)/g,"").replace(/\s*—[^"]{15,}/g,"").trim();
}

function TriviaPage({cu}){
  const mob=useIsMobile();
  const [sport,setSport]=useState(null);
  const [diff,setDiff]=useState(null);
  const [questions,setQuestions]=useState([]);
  const [qIdx,setQIdx]=useState(0);
  const [selected,setSelected]=useState(null);
  const [locked,setLocked]=useState(false);
  const [score,setScore]=useState(0);
  const [streak,setStreak]=useState(0);
  const [bestStreak,setBestStreak]=useState(0);
  const [results,setResults]=useState([]);
  const [phase,setPhase]=useState("pick"); // pick | diff | quiz | done

  const sportColor={mlb:"#22C55E",nfl:"#F97316",nba:"#3B82F6",nhl:"#A78BFA"};
  const sportEmoji={mlb:"⚾",nfl:"🏈",nba:"🏀",nhl:"🏒"};
  const diffColor={easy:"#22C55E",medium:"#F59E0B",hard:"#EF4444"};
  const diffIcon={easy:"🟢",medium:"🟡",hard:"🔴"};
  const ac=sport?sportColor[sport]:"#00D4FF";

  const pickSport=(s)=>{setSport(s);setPhase("diff");};

  const startQuiz=(s,d)=>{
    const rng=quickRng();
    const pool=shuffle(TRIVIA_Q[s][d],rng).slice(0,15);
    const qs=pool.map(q=>({...q,choices:shuffle(q.w,quickRng())}));
    setDiff(d);setQuestions(qs);setQIdx(0);setSelected(null);setLocked(false);
    setScore(0);setStreak(0);setBestStreak(0);setResults([]);setPhase("quiz");
  };

  const pick=(choice)=>{
    if(locked)return;
    setSelected(choice);setLocked(true);
    const q=questions[qIdx];
    const correct=choice===q.a;
    const ns=correct?streak+1:0;
    setBestStreak(b=>Math.max(b,ns));setStreak(ns);
    if(correct)setScore(s=>s+1);
    setResults(r=>[...r,{q:q.q,correct,chosen:choice,answer:q.a}]);
  };

  const saveStats=async(finalResults,finalScore)=>{
    if(!cu)return;
    const total=finalResults.length;
    const wrong=total-finalScore;
    try{
      // Upsert by updating cumulative totals
      const existing=await sb.get("nova_trivia_stats",`?user_id=eq.${cu.id}&limit=1`);
      if(existing&&existing.length>0){
        const e=existing[0];
        await sb.patch("nova_trivia_stats",{
          total_correct:e.total_correct+finalScore,
          total_wrong:e.total_wrong+wrong,
          total_questions:e.total_questions+total,
          games_played:e.games_played+1,
          last_played:Date.now(),
        },`?user_id=eq.${cu.id}`);
      } else {
        await sb.post("nova_trivia_stats",{
          id:gid(),user_id:cu.id,username:cu.username,display_name:cu.display_name,avatar:cu.avatar,avatar_url:cu.avatar_url,
          total_correct:finalScore,total_wrong:wrong,total_questions:total,games_played:1,last_played:Date.now()
        });
      }
    }catch(e){console.warn("Could not save trivia stats",e);}
  };

  const next=()=>{
    if(qIdx+1>=questions.length){
      const finalResults=[...results];
      // score state may lag, count directly
      const finalScore=finalResults.filter(r=>r.correct).length;
      saveStats(finalResults,finalScore);
      setPhase("done");return;
    }
    setQIdx(i=>i+1);setSelected(null);setLocked(false);
  };
  const quit=()=>{
    const finalResults=[...results];
    const finalScore=finalResults.filter(r=>r.correct).length;
    saveStats(finalResults,finalScore);
    setPhase("done");
  };
  const restart=()=>{setSport(null);setDiff(null);setPhase("pick");};

  // ── Pick sport ──
  if(phase==="pick") return(
    <div style={{maxWidth:480,margin:"0 auto",padding:mob?"24px 16px":"48px 20px",textAlign:"center"}}>
      <div style={{fontSize:mob?22:30,fontWeight:900,fontFamily:"'Orbitron',sans-serif",background:"linear-gradient(135deg,#00D4FF,#A78BFA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6,letterSpacing:".05em"}}>SPORTS TRIVIA</div>
      <div style={{fontSize:12,color:"#475569",marginBottom:32}}>MVP awards · stat records · championships — no basic questions</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {["mlb","nfl","nba","nhl"].map(s=>(
          <button key={s} onClick={()=>pickSport(s)} style={{padding:"26px 16px",borderRadius:16,border:`1.5px solid ${sportColor[s]}44`,background:`${sportColor[s]}0e`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8,transition:"all .2s"}}>
            <div style={{fontSize:34}}>{sportEmoji[s]}</div>
            <div style={{fontSize:13,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:sportColor[s],letterSpacing:".08em"}}>{s.toUpperCase()}</div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{Object.values(TRIVIA_Q[s]).flat().length} QUESTIONS</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Pick difficulty ──
  if(phase==="diff") return(
    <div style={{maxWidth:420,margin:"0 auto",padding:mob?"24px 16px":"48px 20px",textAlign:"center"}}>
      <button onClick={()=>setPhase("pick")} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12,marginBottom:20,display:"flex",alignItems:"center",gap:6,margin:"0 auto 20px"}}>← back</button>
      <div style={{fontSize:20,marginBottom:4}}>{sportEmoji[sport]}</div>
      <div style={{fontSize:mob?18:22,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:ac,marginBottom:6,letterSpacing:".06em"}}>{sport?.toUpperCase()} TRIVIA</div>
      <div style={{fontSize:12,color:"#475569",marginBottom:28}}>Choose your difficulty</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[["easy","Casual Fan","MVP winners, championship years, basic career stats"],["medium","Stats Head","Specific numbers, award details, multi-year trends"],["hard","Historian","Record-breaking stats, obscure facts, deep analytics"]].map(([d,label,desc])=>(
          <button key={d} onClick={()=>startQuiz(sport,d)} style={{padding:"18px 20px",borderRadius:14,border:`1.5px solid ${diffColor[d]}44`,background:`${diffColor[d]}0e`,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,transition:"all .2s"}}>
            <div style={{fontSize:24,flexShrink:0}}>{diffIcon[d]}</div>
            <div>
              <div style={{fontSize:13,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:diffColor[d],letterSpacing:".06em",marginBottom:3}}>{d.toUpperCase()} — {label}</div>
              <div style={{fontSize:11,color:"#64748B"}}>{desc}</div>
            </div>
            <div style={{marginLeft:"auto",fontSize:11,color:"#334155",fontFamily:"'Orbitron',sans-serif",flexShrink:0}}>{TRIVIA_Q[sport][d].length}Q</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Done ──
  if(phase==="done"){
    const total=results.length;
    const pct=total?Math.round((score/total)*100):0;
    const grade=pct>=93?"🏆 Immaculate":pct>=80?"⭐ Elite":pct>=67?"💪 Solid":pct>=50?"📚 Learning":"💀 Rough Game";
    return(
      <div style={{maxWidth:560,margin:"0 auto",padding:mob?"20px 14px":"40px 20px"}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{fontSize:44,marginBottom:8}}>{grade.split(" ")[0]}</div>
          <div style={{fontSize:mob?18:24,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:ac}}>{grade.slice(2)}</div>
          <div style={{fontSize:11,color:"#475569",marginTop:4,fontFamily:"'Orbitron',sans-serif"}}>{sport?.toUpperCase()} · {diff?.toUpperCase()} · {sportEmoji[sport]}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
          {[["CORRECT",`${score}/${total}`],["ACCURACY",`${pct}%`],["BEST STREAK",`${bestStreak}🔥`]].map(([label,val])=>(
            <div key={label} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,padding:"12px 6px",textAlign:"center"}}>
              <div style={{fontSize:8,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".07em",marginBottom:4}}>{label}</div>
              <div style={{fontSize:mob?15:19,fontWeight:900,color:ac,fontFamily:"'Orbitron',sans-serif"}}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"8px 14px",borderBottom:"1px solid rgba(255,255,255,.05)",fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em"}}>REVIEW</div>
          <div style={{maxHeight:260,overflowY:"auto"}}>
            {results.map((r,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"9px 14px",borderBottom:"1px solid rgba(255,255,255,.03)",alignItems:"flex-start"}}>
                <div style={{fontSize:13,flexShrink:0,marginTop:1}}>{r.correct?"✅":"❌"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,color:"#CBD5E1",lineHeight:1.3,marginBottom:2}}>{r.q}</div>
                  {!r.correct&&<div style={{fontSize:10,color:"#22C55E",marginBottom:1}}>✓ {r.answer}</div>}
                  {!r.correct&&<div style={{fontSize:10,color:"#EF4444"}}>✗ {r.chosen}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>startQuiz(sport,diff)} style={{flex:1,padding:"12px",borderRadius:10,background:ac,border:"none",color:"#000",fontWeight:900,fontSize:12,fontFamily:"'Orbitron',sans-serif",cursor:"pointer"}}>🔄 PLAY AGAIN</button>
          <button onClick={()=>setPhase("diff")} style={{flex:1,padding:"12px",borderRadius:10,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",color:"#94A3B8",fontWeight:700,fontSize:12,fontFamily:"'Orbitron',sans-serif",cursor:"pointer"}}>CHANGE DIFF</button>
          <button onClick={restart} style={{padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#64748B",fontSize:12,cursor:"pointer"}}>🏠</button>
        </div>
      </div>
    );
  }

  // ── Quiz ──
  const q=questions[qIdx];
  const progress=(qIdx/questions.length)*100;
  const correctFeedback=["Locked in! 🔒","That's right! 🎯","Nailed it! 🔥","Correct! ✅","No doubt! 💪","Easy money 💰","Big brain! 🧠"][Math.floor(Math.random()*7)];
  return(
    <div style={{maxWidth:580,margin:"0 auto",padding:mob?"16px 12px":"32px 20px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>{sportEmoji[sport]}</span>
          <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:diffColor[diff],fontWeight:700,letterSpacing:".06em"}}>{diff?.toUpperCase()}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {streak>=2&&<div style={{fontSize:11,color:"#F97316",fontWeight:700}}>{streak}🔥</div>}
          <div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{score}/{qIdx}</div>
          <button onClick={quit} style={{padding:"4px 10px",borderRadius:6,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"#EF4444",fontSize:9,fontFamily:"'Orbitron',sans-serif",cursor:"pointer",fontWeight:700}}>QUIT</button>
        </div>
      </div>
      <div style={{height:3,background:"rgba(255,255,255,.06)",borderRadius:2,marginBottom:18,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${ac},${ac}88)`,borderRadius:2,transition:"width .4s"}}/>
      </div>
      <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",marginBottom:8,letterSpacing:".1em"}}>Q {qIdx+1} / {questions.length}</div>
      <div style={{fontSize:mob?14:17,fontWeight:700,color:"#E2E8F0",lineHeight:1.45,marginBottom:20,minHeight:52}}>{q.q}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
        {q.choices.map((choice,i)=>{
          const isSel=selected===choice;
          const isCorr=choice===q.a;
          let bg="rgba(255,255,255,.03)",border="1px solid rgba(255,255,255,.08)",color="#CBD5E1";
          if(locked){
            if(isCorr){bg="rgba(34,197,94,.14)";border="1px solid rgba(34,197,94,.45)";color="#22C55E";}
            else if(isSel){bg="rgba(239,68,68,.14)";border="1px solid rgba(239,68,68,.4)";color="#EF4444";}
          } else if(isSel){bg=`${ac}1e`;border=`1px solid ${ac}77`;color="#E2E8F0";}
          return(
            <button key={i} onClick={()=>pick(choice)} disabled={locked}
              style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:10,background:bg,border,color,cursor:locked?"default":"pointer",textAlign:"left",transition:"all .15s",fontSize:mob?12:13,fontWeight:locked&&isCorr?700:400}}>
              <div style={{width:24,height:24,borderRadius:6,background:locked&&isCorr?"rgba(34,197,94,.25)":locked&&isSel&&!isCorr?"rgba(239,68,68,.25)":`${ac}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:locked&&isCorr?"#22C55E":locked&&isSel&&!isCorr?"#EF4444":ac,flexShrink:0}}>
                {locked&&isCorr?"✓":locked&&isSel&&!isCorr?"✗":["A","B","C","D"][i]}
              </div>
              {cleanChoice(choice)}
            </button>
          );
        })}
      </div>
      {locked&&(
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{fontSize:12,fontWeight:700,color:selected===q.a?"#22C55E":"#EF4444",flex:1}}>
            {selected===q.a?correctFeedback:`❌ ${cleanChoice(q.a)}`}
          </div>
          <button onClick={next} style={{padding:"11px 22px",borderRadius:10,background:ac,border:"none",color:"#000",fontWeight:900,fontSize:11,fontFamily:"'Orbitron',sans-serif",cursor:"pointer",flexShrink:0,letterSpacing:".04em"}}>
            {qIdx+1>=questions.length?"RESULTS →":"NEXT →"}
          </button>
        </div>
      )}
    </div>
  );
}


function LeaderboardPage({users,navigate}){
  const mob=useIsMobile();
  const[tab,setTab]=useState("followers");
  const[triviaStats,setTriviaStats]=useState([]);
  const[triviaLoading,setTriviaLoading]=useState(false);
  useEffect(()=>{
    if(tab!=="trivia_correct"&&tab!=="trivia_accuracy"&&tab!=="trivia_wrong")return;
    setTriviaLoading(true);
    sb.get("nova_trivia_stats","?order=total_correct.desc&limit=50").then(rows=>{
      setTriviaStats(rows||[]);
      setTriviaLoading(false);
    }).catch(()=>setTriviaLoading(false));
  },[tab]);
  const boards={
    followers:{label:"👥 Followers",key:u=>(u.followers||[]).length,suffix:"followers"},
    badges:{label:"🏅 Badges",key:u=>(u.badges||[]).length,suffix:"badges"},
    predictions:{label:"🎯 Predictions",key:u=>u.correct_predictions||0,suffix:"correct picks"},
    connections:{label:"🌐 Social",key:u=>(u.followers||[]).length+(u.following||[]).length,suffix:"connections"},
  };
  const board=boards[tab];
  const sorted=board?[...users].sort((a,b)=>board.key(b)-board.key(a)).slice(0,20):[];
  const MEDALS=["🥇","🥈","🥉"];

  // Collect all comments across all users for comment likes leaderboard
  const[allComments,setAllComments]=useState([]);
  const[cmtLoading,setCmtLoading]=useState(false);
  useEffect(()=>{
    if(tab!=="commentlikes")return;
    setCmtLoading(true);
    sb.get("nova_comments","?order=timestamp.desc&limit=500").then(rows=>{
      setAllComments((rows||[]).filter(c=>(c.likes||[]).length>0).sort((a,b)=>(b.likes?.length||0)-(a.likes?.length||0)));
      setCmtLoading(false);
    });
  },[tab]);

  return(
    <div style={{maxWidth:700,margin:"0 auto",padding:"44px 16px 80px"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:28,fontWeight:700,marginBottom:8,background:"linear-gradient(135deg,#F59E0B,#EF4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🏆 Leaderboard</h1>
        <p style={{color:"#475569",fontSize:14}}>Nova's top members across every category</p>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:28,flexWrap:"wrap",justifyContent:"center"}}>
        {Object.entries(boards).map(([k,v])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===k?"rgba(0,212,255,.5)":"rgba(255,255,255,.1)"}`,background:tab===k?"rgba(0,212,255,.12)":"rgba(255,255,255,.03)",color:tab===k?"#00D4FF":"#64748B",transition:"all .2s"}}>{v.label}</button>
        ))}
        <button onClick={()=>setTab("commentlikes")} style={{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab==="commentlikes"?"rgba(239,68,68,.5)":"rgba(255,255,255,.1)"}`,background:tab==="commentlikes"?"rgba(239,68,68,.12)":"rgba(255,255,255,.03)",color:tab==="commentlikes"?"#EF4444":"#64748B",transition:"all .2s"}}>❤️ Top Comments</button>
        {[["trivia_correct","🧠 Most Correct","#22C55E"],["trivia_accuracy","🎯 Best Accuracy","#00D4FF"],["trivia_wrong","💀 Most Wrong","#EF4444"]].map(([k,label,c])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===k?c+"88":"rgba(255,255,255,.1)"}`,background:tab===k?c+"18":"rgba(255,255,255,.03)",color:tab===k?c:"#64748B",transition:"all .2s"}}>{label}</button>
        ))}
      </div>

      {tab==="commentlikes"?(
        <div>
          {cmtLoading&&<div style={{textAlign:"center",padding:40,color:"#334155"}}>Loading top comments...</div>}
          {!cmtLoading&&allComments.length===0&&<Empty icon="❤️" msg="No liked comments yet!"/>}
          {!cmtLoading&&allComments.length>0&&(()=>{
            const top=allComments[0];
            const topUser=users.find(x=>x.id===top.author_id);
            return(<>
              {/* Showcase top comment */}
              <div style={{background:"linear-gradient(135deg,rgba(239,68,68,.15),rgba(245,158,11,.08))",border:"1px solid rgba(239,68,68,.3)",borderRadius:16,padding:"16px 20px",marginBottom:20}}>
                <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#EF4444",letterSpacing:".12em",marginBottom:10}}>🏆 MOST LIKED COMMENT</div>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <Av user={topUser||{avatar:top.author_avatar,avatar_url:top.author_avatar_url,page_accent:"#EF4444"}} size={36}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",marginBottom:4,cursor:"pointer"}} onClick={()=>navigate("profile",top.author_id)}>{top.author_name}</div>
                    {top.text?.startsWith("__IMG__")
                      ?<img src={top.text.slice(7)} style={{maxWidth:200,maxHeight:140,borderRadius:8,objectFit:"contain"}}/>
                      :<div style={{fontSize:14,color:"#94A3B8",lineHeight:1.6}}>{top.text}</div>
                    }
                    <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:20}}>❤️</span>
                      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:"#EF4444"}}>{top.likes?.length||0}</span>
                      <span style={{fontSize:11,color:"#475569"}}>likes</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Rest of top comments */}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {allComments.slice(0,25).map((c,i)=>{
                  const au=users.find(x=>x.id===c.author_id);
                  return(
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
                      <div style={{width:28,textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:i<3?18:12,fontWeight:900,color:i===0?"#F59E0B":i===1?"#94A3B8":i===2?"#FB923C":"#334155",flexShrink:0}}>{MEDALS[i]||`#${i+1}`}</div>
                      <Av user={au||{avatar:c.author_avatar,avatar_url:c.author_avatar_url,page_accent:"#EF4444"}} size={32}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0",cursor:"pointer",marginBottom:2}} onClick={()=>navigate("profile",c.author_id)}>{c.author_name}</div>
                        {c.text?.startsWith("__IMG__")
                          ?<span style={{fontSize:11,color:"#475569"}}>📷 Image</span>
                          :<div style={{fontSize:12,color:"#64748B",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.text}</div>
                        }
                      </div>
                      <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:4}}>
                        <span>❤️</span><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900,color:"#EF4444"}}>{c.likes?.length||0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>);
          })()}
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {sorted.map((u,i)=>(
            <div key={u.id} onClick={()=>navigate("profile",u.id)} style={{display:"flex",alignItems:"center",gap:mob?10:14,padding:mob?"12px 14px":"14px 18px",borderRadius:14,background:i===0?"linear-gradient(135deg,rgba(245,158,11,.12),rgba(251,191,36,.05))":i===1?"linear-gradient(135deg,rgba(148,163,184,.08),rgba(100,116,139,.04))":i===2?"linear-gradient(135deg,rgba(251,146,60,.1),rgba(234,88,12,.04))":"rgba(255,255,255,.03)",border:`1px solid ${i===0?"rgba(245,158,11,.3)":i===1?"rgba(148,163,184,.15)":i===2?"rgba(251,146,60,.2)":"rgba(255,255,255,.07)"}`,cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}>
              <div style={{width:32,textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:i<3?20:13,fontWeight:900,color:i===0?"#F59E0B":i===1?"#94A3B8":i===2?"#FB923C":"#334155",flexShrink:0}}>{MEDALS[i]||`#${i+1}`}</div>
              <Av user={u} size={mob?38:44}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:12,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{u.display_name}</div>
                <div style={{fontSize:11,color:"#475569"}}>@{u.username}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?18:22,fontWeight:900,color:i===0?"#F59E0B":i===1?"#94A3B8":i===2?"#FB923C":"#00D4FF"}}>{board.key(u)}</div>
                <div style={{fontSize:10,color:"#475569"}}>{board.suffix}</div>
              </div>
            </div>
          ))}
          {sorted.length===0&&<Empty icon="🏆" msg="No data yet!"/>}
        </div>
      )}
      {(tab==="trivia_correct"||tab==="trivia_accuracy"||tab==="trivia_wrong")&&(()=>{
        const MEDALS=["🥇","🥈","🥉"];
        if(triviaLoading)return <div style={{textAlign:"center",padding:60,color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:12}}>LOADING…</div>;
        if(!triviaStats.length)return <Empty icon="🧠" msg="No trivia scores yet — play some trivia!"/>;
        let sorted2=[...triviaStats];
        let statKey,statLabel,statColor,statSuffix;
        if(tab==="trivia_correct"){
          sorted2.sort((a,b)=>(b.total_correct||0)-(a.total_correct||0));
          statKey=u=>u.total_correct||0; statLabel="TOTAL CORRECT"; statColor="#22C55E"; statSuffix="correct";
        } else if(tab==="trivia_accuracy"){
          sorted2=sorted2.filter(u=>(u.total_questions||0)>=10); // min 10 questions
          sorted2.sort((a,b)=>{
            const ra=(a.total_correct||0)/Math.max(a.total_questions||1,1);
            const rb=(b.total_correct||0)/Math.max(b.total_questions||1,1);
            return rb-ra;
          });
          statKey=u=>Math.round(((u.total_correct||0)/Math.max(u.total_questions||1,1))*100)+"%";
          statLabel="ACCURACY"; statColor="#00D4FF"; statSuffix="accuracy";
        } else {
          sorted2.sort((a,b)=>(b.total_wrong||0)-(a.total_wrong||0));
          statKey=u=>u.total_wrong||0; statLabel="TOTAL WRONG"; statColor="#EF4444"; statSuffix="wrong";
        }
        const top=sorted2[0];
        const topUser=users.find(x=>x.id===top?.user_id);
        return(
          <div>
            {/* Top player showcase */}
            {top&&(
              <div style={{background:`linear-gradient(135deg,${statColor}18,${statColor}08)`,border:`1px solid ${statColor}44`,borderRadius:16,padding:"16px 20px",marginBottom:20}}>
                <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:statColor,letterSpacing:".12em",marginBottom:10}}>🏆 {statLabel} LEADER</div>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <Av user={topUser||{avatar:top.avatar,avatar_url:top.avatar_url,display_name:top.display_name}} size={48}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{top.display_name||top.username}</div>
                    <div style={{fontSize:11,color:"#64748B"}}>{top.games_played} game{top.games_played!==1?"s":""} played · {top.total_questions} questions answered</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:28,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:statColor}}>{typeof statKey==="function"?statKey(top):statKey}</div>
                    <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>{statSuffix}</div>
                  </div>
                </div>
              </div>
            )}
            {/* Full list */}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {sorted2.slice(0,20).map((u,i)=>{
                const usr=users.find(x=>x.id===u.user_id);
                const val=typeof statKey==="function"?statKey(u):statKey;
                const pct=u.total_questions?Math.round((u.total_correct/u.total_questions)*100):0;
                return(
                  <div key={u.user_id||i} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"12px 16px",cursor:"pointer"}} onClick={()=>navigate("profile",u.user_id)}>
                    <div style={{width:24,textAlign:"center",fontSize:i<3?18:13,flexShrink:0}}>{i<3?MEDALS[i]:`#${i+1}`}</div>
                    <Av user={usr||{avatar:u.avatar,avatar_url:u.avatar_url,display_name:u.display_name}} size={34}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{u.display_name||u.username}</div>
                      <div style={{fontSize:10,color:"#475569"}}>{u.games_played} games · {pct}% accuracy</div>
                    </div>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900,color:statColor,flexShrink:0}}>{val}</div>
                  </div>
                );
              })}
            </div>
            {tab==="trivia_accuracy"&&sorted2.length<triviaStats.length&&(
              <div style={{textAlign:"center",fontSize:10,color:"#334155",marginTop:12,fontFamily:"'Orbitron',sans-serif"}}>Minimum 10 questions required to appear on accuracy board</div>
            )}
          </div>
        );
      })()}
    </div>
  );
}


// ─── Feed ──────────────────────────────────────────────────────────────────────
function FeedPage({users,cu,likes,onLike,navigate}){
  const mob=useIsMobile();
  const[feedIdx,setFeedIdx]=useState(0);
  const feedRef=useRef(null);
  const allClips=[];
  users.forEach(u=>{
    (u.page_clips||[]).forEach(c=>allClips.push({...c,owner:u}));
    (u.page_social||[]).forEach(c=>allClips.push({...c,owner:u}));
  });
  allClips.sort((a,b)=>(b.ts||0)-(a.ts||0));
  useEffect(()=>{
    const el=feedRef.current; if(!el)return;
    const h=()=>setFeedIdx(Math.round(el.scrollTop/el.clientHeight));
    el.addEventListener("scroll",h,{passive:true});
    return()=>el.removeEventListener("scroll",h);
  },[]);
  const feedH=mob?"calc(100vh - 120px)":"calc(100vh - 62px)";
  if(!allClips.length)return(
    <div style={{height:feedH,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,color:"#334155"}}>
      <div style={{fontSize:48}}>🎬</div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14}}>No clips yet</div>
    </div>
  );
  return(
    <div ref={feedRef} className="feed-wrap" style={{height:feedH}}>
      {allClips.map((c,i)=>{
        const active=i===feedIdx;
        const liked=cu&&(likes[c.id]||[]).includes(cu.id);
        const likeCount=(likes[c.id]||[]).length;
        return(
          <div key={c.id+i} className="feed-item" style={{height:feedH,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",background:"#000",overflow:"hidden"}}>
            <div style={{width:"100%",maxWidth:520,padding:"0 16px",zIndex:2,position:"relative"}}>
              {c.type==="video"&&c.url&&<video src={c.url} controls={active} autoPlay={active} muted loop style={{width:"100%",maxHeight:"75vh",borderRadius:16,objectFit:"contain",background:"#000"}}/>}
              {c.type==="youtube"&&c.eid&&<iframe src={`https://www.youtube.com/embed/${c.eid}`} width="100%" height="420" frameBorder="0" allow="accelerometer;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{borderRadius:16}}/>}
              {(c.type==="link"||c.type==="medal")&&(
                <div style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,padding:28,textAlign:"center"}}>
                  <div style={{fontSize:48,marginBottom:12}}>🎮</div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:"#E2E8F0",marginBottom:12}}>{c.title}</div>
                  <a href={c.url} target="_blank" rel="noopener noreferrer"><Btn variant="ghost">▶ Watch Clip</Btn></a>
                </div>
              )}
            </div>
            <div style={{position:"absolute",right:16,bottom:"15%",display:"flex",flexDirection:"column",gap:18,alignItems:"center",zIndex:10}}>
              <button onClick={()=>cu&&onLike(c.id,liked)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",color:liked?"#EF4444":"rgba(255,255,255,.8)"}}>
                <span style={{fontSize:32}}>{liked?"❤️":"🤍"}</span>
                <span style={{fontSize:11,fontWeight:700,fontFamily:"'Orbitron',sans-serif",color:"white",textShadow:"0 1px 4px rgba(0,0,0,.8)"}}>{likeCount}</span>
              </button>
              <button onClick={()=>navigate("profile",c.owner.id)} style={{background:"none",border:"none",cursor:"pointer"}}>
                <Av user={c.owner} size={44}/>
              </button>
            </div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"60px 60px 24px 16px",background:"linear-gradient(transparent,rgba(0,0,0,.85))",zIndex:5}}>
              <div onClick={()=>navigate("profile",c.owner.id)} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,cursor:"pointer"}}>
                <Av user={c.owner} size={32}/>
                <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"white"}}>{c.owner.display_name}</span>
              </div>
              <div style={{fontSize:14,color:"rgba(255,255,255,.9)",fontWeight:600}}>{c.title}</div>
            </div>
            {i===0&&allClips.length>1&&<div style={{position:"absolute",bottom:80,left:"50%",transform:"translateX(-50%)",fontSize:11,color:"rgba(255,255,255,.3)",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",zIndex:10}}>SCROLL FOR MORE ↓</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Home ──────────────────────────────────────────────────────────────────────
function HomePage({discordUrl,staffUsers,nav,users}){
  const mob=useIsMobile();
  const online=users.filter(u=>u.status_type==="online").length;

  const NAV_PAGES=[
    {p:"members",icon:"👥",label:"Members",color:"#00D4FF",desc:"Browse every Nova member, see their stats, teams, and profiles. Follow your favorites and connect with the community."},

    {p:"feed",icon:"🎬",label:"Clips Feed",color:"#EC4899",desc:"Watch and share highlight clips from the community. React, comment, and show love to the best plays."},
    {p:"cards",icon:"⚾",label:"Nova Cards",color:"#F59E0B",desc:"Collect MLB player and team cards, open packs for real 2025 play cards, level up your cards and flex them on your profile."},

    {p:"trivia",icon:"🧠",label:"Trivia",color:"#A855F7",desc:"Challenge yourself with sports trivia across 4 sports and 3 difficulty levels. MVP years, stat records, championships and more."},
    {p:"leaderboard",icon:"🏆",label:"Leaderboard",color:"#F97316",desc:"See who's on top — ranked by followers, trivia score, predictions accuracy, and most liked comments."},
    {p:"hub",icon:"📊",label:"Hub",color:"#00D4FF",desc:"News, live scores, player stats, game logs, standings and predictions all in one place — across MLB, NBA, NHL, and NFL."},
    {p:"nffl",icon:"🏈",label:"NFFL",color:"#F59E0B",desc:"Nova Football Fusion League — player stats, game feed, transactions and rosters for our community football league."},
    {p:"nbbl",icon:"⚾",label:"NBBL",color:"#22C55E",desc:"Nova Baseball League — hitting stats, pitching stats, fielding stats and game feed for our community baseball league."},
    {p:"messages",icon:"💬",label:"Messages",color:"#38BDF8",desc:"Slide into DMs, create group chats, share clips and GIFs, and hop on voice calls with other Nova members."},
  ];

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:"0 20px 100px"}}>
      {/* Hero */}
      <div style={{textAlign:"center",padding:mob?"50px 0 44px":"72px 0 60px"}}>
        <div className="fadeUp" style={{fontSize:mob?46:60,marginBottom:10,display:"inline-block",animation:"float 3.5s ease-in-out infinite"}}>💫</div>
        <h1 className="fadeUp d1" style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?"clamp(48px,16vw,76px)":"clamp(44px,7.5vw,88px)",fontWeight:900,lineHeight:1.02,letterSpacing:".06em",marginBottom:14,background:"linear-gradient(135deg,#fff 0%,#a8d8ff 40%,#00D4FF 65%,#8B5CF6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NOVA</h1>
        <p className="fadeUp d2" style={{fontSize:mob?14:17,color:"#94A3B8",maxWidth:420,margin:"0 auto 12px",lineHeight:1.7,fontWeight:500}}>The sports community for fans who actually know the game.</p>
        <div className="fadeUp d2" style={{display:"flex",gap:20,justifyContent:"center",marginBottom:26}}>
          <span style={{fontSize:11,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".18em"}}>{users.length} MEMBERS</span>
          <span style={{width:1,background:"rgba(255,255,255,.08)"}}/>
          <span style={{fontSize:11,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",letterSpacing:".18em",display:"flex",alignItems:"center",gap:5}}><div style={{width:6,height:6,borderRadius:"50%",background:"#22C55E",boxShadow:"0 0 6px #22C55E"}}/>{online} ONLINE</span>
        </div>
        <div className="fadeUp d3" style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <a href={discordUrl} target="_blank" rel="noopener noreferrer"><Btn size="lg" style={{fontSize:12}}>🚀 Join Nova Discord</Btn></a>
          <Btn variant="ghost" size={mob?"md":"lg"} style={{fontSize:12}} onClick={()=>nav("members")}>👥 Browse Members</Btn>
        </div>
      </div>

      {/* Page cards */}
      <div style={{marginBottom:60}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,letterSpacing:".22em",color:"#334155",textAlign:"center",marginBottom:20}}>EXPLORE NOVA</div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:mob?10:14}}>
          {NAV_PAGES.map(({p,icon,label,color,desc})=>(
            <Card key={p} onClick={()=>nav(p)} style={{padding:mob?"14px":"20px 22px",cursor:"pointer",display:"flex",flexDirection:"column",gap:10,borderColor:"rgba(255,255,255,.06)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:10,background:color+"18",border:`1px solid ${color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:mob?18:20,flexShrink:0}}>{icon}</div>
                <div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:11,fontWeight:700,color,letterSpacing:".06em"}}>{label.toUpperCase()}</div>
                </div>
                <div style={{marginLeft:"auto",fontSize:14,color:"#334155",flexShrink:0}}>→</div>
              </div>
              <div style={{fontSize:mob?11:12,color:"#64748B",lineHeight:1.6}}>{desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Staff */}
      {staffUsers.length>0&&(
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,letterSpacing:".22em",color:"#334155",textAlign:"center",textTransform:"uppercase",marginBottom:24}}>Meet the Staff</div>
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(auto-fill,minmax(170px,1fr))",gap:12}}>
            {staffUsers.map(u=>(
              <Card key={u.id} style={{padding:"20px 16px",textAlign:"center"}} onClick={()=>nav("profile",u.id)}>
                <div style={{position:"relative",width:56,height:56,margin:"0 auto 10px"}}>
                  <div style={{width:56,height:56,borderRadius:"50%",background:`radial-gradient(circle,${u.page_accent||"#00D4FF"}44,rgba(0,0,0,.6))`,border:`2px solid ${u.page_accent||"#00D4FF"}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,overflow:"hidden",boxShadow:`0 0 20px ${u.page_accent||"#00D4FF"}33`}}>
                    {u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}
                  </div>
                  <StatusDot type={u.status_type||"offline"} size={12} style={{position:"absolute",bottom:1,right:1}}/>
                </div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",marginBottom:6}}>{u.display_name}</div>
                {u.staff_role&&<RoleBadge color={ROLE_COLOR[u.staff_role]||"#00D4FF"}>{u.staff_role}</RoleBadge>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Members ───────────────────────────────────────────────────────────────────
function MembersPage({users,nav}){
  const mob=useIsMobile();
  const[q,setQ]=useState("");
  const[filter,setFilter]=useState("all");
  const list=users.filter(u=>{
    const m=(u.display_name||"").toLowerCase().includes(q.toLowerCase())||(u.username||"").toLowerCase().includes(q.toLowerCase());
    if(filter==="online")return m&&u.status_type==="online";
    if(filter==="staff")return m&&u.staff_role;
    return m;
  });
  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:"44px 16px 100px"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:28,fontWeight:700,marginBottom:8,background:"linear-gradient(135deg,#fff,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Members</h1>
        <p style={{color:"#475569",marginBottom:20,fontSize:14}}>{users.length} members across the galaxy</p>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search members..." style={{maxWidth:320,margin:"0 auto 12px",display:"block"}}/>
        <div style={{display:"flex",gap:8,justifyContent:"center"}}>
          {[["all","All"],["online","🟢 Online"],["staff","⚡ Staff"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{padding:"6px 14px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Rajdhani',sans-serif",fontWeight:600,border:`1px solid ${filter===v?"rgba(0,212,255,.4)":"rgba(255,255,255,.08)"}`,background:filter===v?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",color:filter===v?"#00D4FF":"#475569"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(auto-fill,minmax(200px,1fr))",gap:mob?10:12}}>
        {list.map(u=>(
          <Card key={u.id} style={{padding:mob?12:16,cursor:"pointer"}} onClick={()=>nav("profile",u.id)}>
            <div style={{position:"relative",width:48,height:48,marginBottom:10}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:`radial-gradient(circle,${u.page_accent||"#00D4FF"}44,rgba(0,0,0,.6))`,border:`2px solid ${u.page_accent||"#00D4FF"}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,overflow:"hidden"}}>
                {u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}
              </div>
              <StatusDot type={u.status_type||"offline"} size={11} style={{position:"absolute",bottom:0,right:0}}/>
            </div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:11,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{u.display_name}</div>
            <div style={{fontSize:11,color:"#475569",marginBottom:5}}>@{u.username}</div>
            {u.staff_role&&<div style={{marginBottom:5}}><RoleBadge color={ROLE_COLOR[u.staff_role]||"#00D4FF"}>{u.staff_role}</RoleBadge></div>}
            {(u.mlb_team||u.nfl_team||u.nba_team||u.nhl_team)&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:5}}>{u.mlb_team&&<TeamBadge teamId={u.mlb_team}/>}{u.nfl_team&&<TeamBadge teamId={u.nfl_team}/>}{u.nba_team&&<TeamBadge teamId={u.nba_team}/>}{u.nhl_team&&<TeamBadge teamId={u.nhl_team}/>}</div>}
            <div style={{display:"flex",gap:8,fontSize:11,color:"#475569"}}><span>{(u.followers||[]).length} followers</span><span>·</span><span>{(u.badges||[]).length} 🏅</span></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tiny UI pieces ────────────────────────────────────────────────────────────
function Btn({children,onClick,variant="primary",size="md",style:ext={},disabled}){
  const [h,setH]=useState(false);
  const fs=size==="sm"?10:size==="lg"?14:11;
  const pd=size==="sm"?"6px 13px":size==="lg"?"14px 30px":"8px 16px";
  const base={display:"inline-flex",alignItems:"center",gap:6,cursor:disabled?"not-allowed":"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".06em",border:"none",borderRadius:8,transition:"all .22s",opacity:disabled?.5:1,fontSize:fs,padding:pd,transform:h&&!disabled?"translateY(-1px)":""};
  const v={
    primary:{background:h?"linear-gradient(135deg,#00bfea,#7c3aed)":"linear-gradient(135deg,#00D4FF,#8B5CF6)",color:"#fff",boxShadow:h?"0 8px 28px rgba(0,212,255,.35)":"none"},
    ghost:{background:h?"rgba(0,212,255,.1)":"transparent",border:"1px solid rgba(0,212,255,.4)",color:"#00D4FF"},
    danger:{background:h?"rgba(239,68,68,.25)":"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.35)",color:"#EF4444"},
    muted:{background:h?"rgba(255,255,255,.1)":"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#94A3B8"},
    follow:{background:h?"rgba(0,212,255,.18)":"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.35)",color:"#00D4FF"},
    unfollow:{background:h?"rgba(239,68,68,.15)":"rgba(255,255,255,.05)",border:`1px solid ${h?"rgba(239,68,68,.4)":"rgba(255,255,255,.12)"}`,color:h?"#EF4444":"#94A3B8"},
  };
  return <button style={{...base,...v[variant],...ext}} onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>{children}</button>;
}
function RoleBadge({children,color="#00D4FF"}){return <span style={{display:"inline-block",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",padding:"2px 8px",borderRadius:20,background:color+"22",border:`1px solid ${color}55`,color}}>{children}</span>;}
const Card=React.forwardRef(function Card({children,style:ext={},hover=true,onClick},ref){
  const [h,setH]=useState(false);
  return <div ref={ref} onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:"rgba(255,255,255,.03)",backdropFilter:"blur(14px)",border:`1px solid ${h&&hover?"rgba(0,212,255,.28)":"rgba(255,255,255,.07)"}`,borderRadius:14,transition:"all .28s",transform:h&&hover?"translateY(-2px)":"",boxShadow:h&&hover?"0 12px 40px rgba(0,0,0,.3)":"none",cursor:onClick?"pointer":"default",...ext}}>{children}</div>;
});
function Modal({children,onClose,title,width=480}){
  const mob=useIsMobile();
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.82)",backdropFilter:"blur(10px)",display:"flex",alignItems:mob?"flex-end":"center",justifyContent:"center",padding:mob?0:20}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"linear-gradient(150deg,#0c1220,#10172a)",border:"1px solid rgba(0,212,255,.18)",borderRadius:mob?"20px 20px 0 0":"18px",padding:mob?"24px 20px 32px":"30px 32px",width:"100%",maxWidth:mob?"100%":width,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 -20px 60px rgba(0,0,0,.7)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?15:17,fontWeight:700,color:"#E2E8F0"}}>{title}</h2>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"#94A3B8",cursor:"pointer",fontSize:16,padding:"5px 10px"}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Lbl({children}){return <div style={{fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".1em",color:"#475569",textTransform:"uppercase",marginBottom:7}}>{children}</div>;}
function Sec({title,children,onAdd}){return <div style={{marginBottom:34}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}><h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:700,color:"#E2E8F0",letterSpacing:".05em"}}>{title}</h2>{onAdd&&<Btn variant="ghost" size="sm" onClick={onAdd}>＋ Add</Btn>}</div>{children}</div>;}
function Empty({icon,msg}){return <div style={{textAlign:"center",padding:"36px 20px",color:"#334155",border:"1px dashed rgba(255,255,255,.07)",borderRadius:12}}><div style={{fontSize:30,marginBottom:8,opacity:.3}}>{icon}</div><div style={{fontSize:13}}>{msg}</div></div>;}
function XBtn({onClick,style:ext={}}){const [h,setH]=useState(false);return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:h?"#ef4444":"rgba(239,68,68,.8)",border:"none",borderRadius:6,width:26,height:26,color:"white",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",zIndex:10,...ext}}>✕</button>;}
function StatusDot({type,size=12,style:ext={}}){const s=STATUS_META[type]||STATUS_META.offline;return <div style={{width:size,height:size,borderRadius:"50%",background:s.color,flexShrink:0,boxShadow:type!=="offline"?`0 0 ${size/2}px ${s.color}88`:"none",border:"2px solid rgba(3,7,18,.9)",...ext}} title={s.label}/>;}
function AvatarCircle({user,size=36,onClick}){return <div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:`radial-gradient(circle,${user?.page_accent||"#00D4FF"}44,rgba(0,0,0,.7))`,border:`2px solid ${user?.page_accent||"#00D4FF"}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.45,overflow:"hidden",cursor:onClick?"pointer":"default"}}>{user?.avatar_url?<img src={user.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:user?.avatar||"👤"}</div>;}
const Av=AvatarCircle;
function BannerUploadBtn({label,onUpload}){const [up,setUp]=useState(false);const ref=useRef(null);const h=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>10*1024*1024){alert("Max 10MB");return;}setUp(true);await onUpload(f);setUp(false);e.target.value="";};return <><input type="file" ref={ref} accept="image/*" onChange={h} style={{display:"none"}}/><Btn variant="ghost" size="sm" onClick={()=>ref.current.click()} disabled={up}>{up?"⏳":label}</Btn></>;
}
const BannerBtn=BannerUploadBtn;
function CommentImgUpload({onUpload}){
  const[up,setUp]=useState(false);const ref=useRef(null);
  const h=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>8*1024*1024){alert("Max 8MB");return;}setUp(true);await onUpload(f);setUp(false);e.target.value="";};
  return <><input type="file" ref={ref} accept="image/*" onChange={h} style={{display:"none"}}/><button onClick={()=>ref.current.click()} disabled={up} title="Attach photo" style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12,color:"#64748B",display:"flex",alignItems:"center",gap:5,width:"fit-content"}}>{up?"⏳ Uploading...":"📷 Add Photo"}</button></>;
}
function playerHeadshotUrl(playerId,sport){
  if(!playerId)return"";
  if(sport==="mlb")return`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;
  // ESPN uses different CDN paths — try multiple via component onError fallback chain
  // Primary: new ESPN CDN format
  return`https://a.espncdn.com/combiner/i?img=/i/headshots/${sport}/players/full/${playerId}.png&w=350&h=254&cb=1`;
}
function TeamLogo({espn,sport,size=22}){const [err,setErr]=useState(false);if(err)return <span style={{fontSize:size*.65}}>{sport==="mlb"?"⚾":sport==="nfl"?"🏈":sport==="nba"?"🏀":"🏒"}</span>;return <img src={`https://a.espncdn.com/i/teamlogos/${sport}/500/${espn}.png`} width={size} height={size} style={{objectFit:"contain",flexShrink:0}} onError={()=>setErr(true)}/>;}
function TeamBadge({teamId}){
  const allTeams=[...MLB_TEAMS,...NFL_TEAMS,...NBA_TEAMS,...NHL_TEAMS];
  const team=allTeams.find(t=>t.id===teamId);if(!team)return null;
  const sport=teamId.startsWith("nfl_")?"nfl":teamId.startsWith("nba_")?"nba":teamId.startsWith("nhl_")?"nhl":"mlb";
  return <div style={{display:"inline-flex",alignItems:"center",gap:5,background:team.color+"22",border:`1.5px solid ${team.color}66`,borderRadius:20,padding:"3px 10px"}}><TeamLogo espn={team.espn} sport={sport} size={18}/><span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:team.color,letterSpacing:".06em"}}>{team.abbr}</span><span style={{fontSize:9,color:team.color+"cc",fontWeight:600}}>{team.name}</span></div>;
}
function TeamPicker({sport,teams,value,onChange}){
  const byDiv={};
  teams.forEach(t=>{if(!byDiv[t.div])byDiv[t.div]=[];byDiv[t.div].push(t);});
  return(
    <div style={{maxHeight:320,overflowY:"auto",display:"flex",flexDirection:"column",gap:10}}>
      {Object.entries(byDiv).map(([div,ts])=>(
        <div key={div}>
          <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".12em",marginBottom:6}}>{div}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {ts.map(t=>(
              <button key={t.id} onClick={()=>onChange(value===t.id?"":t.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:20,cursor:"pointer",border:`1.5px solid ${value===t.id?t.color+"aa":"rgba(255,255,255,.1)"}`,background:value===t.id?t.color+"22":"rgba(255,255,255,.03)",transition:"all .15s"}}>
                <TeamLogo espn={t.espn} sport={sport} size={16}/>
                <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:value===t.id?t.color:"#94A3B8"}}>{t.abbr}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SocialLinks({user}){
  const platforms=Object.keys(SOCIAL_ICONS).filter(k=>user[`social_${k}`]);
  if(!platforms.length)return null;
  return (
    <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:10,marginBottom:4}}>
      {platforms.map(k=>{
        const val=user[`social_${k}`]; const color=SOCIAL_COLORS[k];
        const inner=<div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,background:color+"18",border:`1.5px solid ${color}44`,cursor:k!=="discord"?"pointer":"default"}}><span style={{color,display:"flex",alignItems:"center"}}>{SOCIAL_ICONS[k]}</span><span style={{fontSize:12,fontWeight:600,color:"#C4CDD6"}}>{k==="discord"?val:`@${val}`}</span></div>;
        if(k==="discord")return <div key={k}>{inner}</div>;
        const urls={roblox:`https://www.roblox.com/search/users?keyword=${val}`,instagram:`https://instagram.com/${val}`,twitter:`https://twitter.com/${val}`,youtube:val.startsWith("http")?val:`https://youtube.com/@${val}`};
        return <a key={k} href={urls[k]} target="_blank" rel="noopener noreferrer">{inner}</a>;
      })}
    </div>
  );
}

function LikeBtn({clipId,cu,likes,onLike}){
  const liked=cu&&(likes[clipId]||[]).includes(cu.id);
  const count=(likes[clipId]||[]).length;
  const [bounce,setBounce]=useState(false);
  const click=()=>{if(!cu)return;setBounce(true);setTimeout(()=>setBounce(false),300);onLike(clipId,liked);};
  return <button onClick={click} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:cu?"pointer":"not-allowed",color:liked?"#EF4444":"#64748B",transform:bounce?"scale(1.3)":"scale(1)",transition:"transform .15s"}}>
    <span style={{fontSize:22,lineHeight:1}}>{liked?"❤️":"🤍"}</span>
    <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{count}</span>
  </button>;
}

function ClipCarousel({clips,canEdit,onDelete,emptyIcon,emptyMsg,cu,likes,onLike}){
  const [idx,setIdx]=useState(0);const [key,setKey]=useState(0);
  const touchRef=useRef(null);const timerRef=useRef(null);
  const ci=clips.length?Math.min(idx,clips.length-1):0;
  const go=dir=>{setIdx(i=>(i+dir+clips.length)%clips.length);setKey(k=>k+1);reset();};
  const reset=()=>{clearInterval(timerRef.current);if(clips.length>1)timerRef.current=setInterval(()=>{setIdx(i=>(i+1)%clips.length);setKey(k=>k+1);},60000);};
  useEffect(()=>{reset();return()=>clearInterval(timerRef.current);},[clips.length]);
  if(!clips.length)return <Empty icon={emptyIcon} msg={emptyMsg}/>;
  const c=clips[ci];
  const renderClip=()=>{
    if(c.type==="video"&&c.url)return <div><div style={{fontSize:13,fontWeight:600,color:"#94A3B8",marginBottom:7}}>{c.title}</div><video src={c.url} controls width="100%" style={{borderRadius:10,maxHeight:260,background:"#000"}}/></div>;
    if(c.type==="youtube"&&c.eid)return <div><div style={{fontSize:13,fontWeight:600,color:"#94A3B8",marginBottom:7}}>{c.title}</div><iframe src={`https://www.youtube.com/embed/${c.eid}`} width="100%" height="220" frameBorder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{borderRadius:10}}/></div>;
    if(c.type==="medal")return <Card style={{padding:18}}><div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:8}}>MEDAL.TV</div><div style={{fontWeight:700,color:"#E2E8F0",marginBottom:10}}>{c.title}</div>{c.eid?<iframe src={`https://medal.tv/clip/${c.eid}/embed`} width="100%" height="200" frameBorder="0" allowFullScreen style={{borderRadius:8}}/>:<a href={c.url} target="_blank" rel="noopener noreferrer"><Btn variant="ghost" size="sm">▶ Watch</Btn></a>}</Card>;
    return <Card style={{padding:18}}><div style={{display:"flex",gap:14}}><div style={{fontSize:28}}>{c.platform==="instagram"?"📸":"🎬"}</div><div style={{flex:1}}><div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",marginBottom:6}}>{c.platform==="instagram"?"INSTAGRAM REEL":"CLIP"}</div><div style={{fontWeight:700,color:"#E2E8F0",marginBottom:10}}>{c.title}</div><a href={c.url} target="_blank" rel="noopener noreferrer"><Btn variant="ghost" size="sm">▶ Watch Clip</Btn></a></div></div></Card>;
  };
  return (
    <div style={{userSelect:"none"}}>
      <div onTouchStart={e=>touchRef.current=e.touches[0].clientX} onTouchEnd={e=>{if(touchRef.current===null||clips.length<2)return;const d=touchRef.current-e.changedTouches[0].clientX;if(Math.abs(d)>50)go(d>0?1:-1);touchRef.current=null;}} style={{position:"relative"}}>
        <div key={key} className="carousel-slide">{renderClip()}</div>
        {clips.length>1&&<>
          <button onClick={()=>go(-1)} style={{position:"absolute",left:-14,top:"50%",transform:"translateY(-50%)",width:32,height:32,borderRadius:"50%",background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",color:"#00D4FF",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5}}>‹</button>
          <button onClick={()=>go(1)} style={{position:"absolute",right:-14,top:"50%",transform:"translateY(-50%)",width:32,height:32,borderRadius:"50%",background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",color:"#00D4FF",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5}}>›</button>
        </>}
        {canEdit&&<XBtn onClick={()=>{onDelete(c.id);setIdx(0);}} style={{position:"absolute",top:0,right:0}}/>}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.06)"}}>
        {clips.length>1
          ? <div style={{display:"flex",alignItems:"center",gap:6}}>{clips.map((_,i)=><div key={i} onClick={()=>{setIdx(i);setKey(k=>k+1);reset();}} style={{width:i===ci?20:7,height:7,borderRadius:i===ci?4:3.5,background:i===ci?"#00D4FF":"rgba(255,255,255,.15)",cursor:"pointer",transition:"all .25s"}}/>)}<span style={{fontSize:11,color:"#334155",marginLeft:4}}>{ci+1}/{clips.length}</span></div>
          : <div/>
        }
        {likes&&onLike&&<LikeBtn clipId={c.id} cu={cu} likes={likes} onLike={onLike}/>}
      </div>
    </div>
  );
}

function Starfield(){
  const canvasRef=useRef(null);
  const rafRef=useRef(null);

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const ctx=canvas.getContext("2d");
    let W=window.innerWidth, H=window.innerHeight;

    // ── resize ──
    const resize=()=>{
      W=window.innerWidth; H=window.innerHeight;
      canvas.width=W; canvas.height=H;
    };
    resize();
    window.addEventListener("resize",resize);

    // ── stars ──
    const NUM=280;
    const stars=Array.from({length:NUM},()=>({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.6+0.3,
      baseAlpha:Math.random()*0.6+0.2,
      alpha:0,
      twinkleSpeed:Math.random()*0.008+0.003,
      twinkleDir:Math.random()>0.5?1:-1,
      color:Math.random()>0.88
        ?(Math.random()>0.5?"#b3d9ff":"#d4b3ff")
        :"#ffffff",
      glow:Math.random()>0.92,
    }));
    // Stagger initial alpha
    stars.forEach(s=>{ s.alpha=Math.random()*s.baseAlpha; });

    // ── shooting stars ──
    const shoots=[];
    const spawnShoot=()=>{
      // Start from top-right area, angle downward-left
      const angle=Math.PI*0.8+Math.random()*Math.PI*0.3; // ~145–199 deg
      const speed=Math.random()*6+8;
      shoots.push({
        x:Math.random()*W*0.8+W*0.2,
        y:Math.random()*H*0.3,
        vx:Math.cos(angle)*speed,
        vy:Math.sin(angle)*speed,
        len:Math.random()*140+80,
        alpha:1,
        width:Math.random()*1.2+0.4,
        trail:[],
      });
    };

    // Shoot every 3–8 seconds
    let nextShoot=Date.now()+3000+Math.random()*5000;

    // ── Rocket ──
    let rocket=null;
    let nextRocket=Date.now()+8000+Math.random()*12000;
    const spawnRocket=()=>{
      // Pick a random edge to enter from
      const side=Math.floor(Math.random()*4); // 0=top,1=right,2=bottom,3=left
      let x,y,angle;
      if(side===0){x=Math.random()*W;y=-60;angle=Math.PI/2+((Math.random()-.5)*0.6);}
      else if(side===1){x=W+60;y=Math.random()*H;angle=Math.PI+((Math.random()-.5)*0.6);}
      else if(side===2){x=Math.random()*W;y=H+60;angle=-Math.PI/2+((Math.random()-.5)*0.6);}
      else{x=-60;y=Math.random()*H;angle=(Math.random()-.5)*0.6;}
      const speed=2.2+Math.random()*1.4;
      rocket={x,y,angle,speed,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,trail:[],size:1+Math.random()*0.5};
    };

    const drawRocket=(r)=>{
      // Trail
      for(let t=1;t<r.trail.length;t++){
        const prog=t/r.trail.length;
        ctx.save();
        ctx.globalAlpha=prog*0.35;
        ctx.strokeStyle=`rgba(255,160,60,${prog})`;
        ctx.lineWidth=3*prog*r.size;
        ctx.lineCap="round";
        ctx.beginPath();
        ctx.moveTo(r.trail[t-1].x,r.trail[t-1].y);
        ctx.lineTo(r.trail[t].x,r.trail[t].y);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.translate(r.x,r.y);
      ctx.rotate(r.angle+Math.PI/2);
      const sc=r.size*14;
      // Flame flicker
      const flicker=0.7+Math.random()*0.6;
      // Flame
      ctx.beginPath();
      ctx.moveTo(0,sc*0.6);
      ctx.lineTo(-sc*0.22*flicker,sc*1.2*flicker);
      ctx.lineTo(0,sc*0.95);
      ctx.lineTo(sc*0.22*flicker,sc*1.2*flicker);
      ctx.closePath();
      const flameGrad=ctx.createLinearGradient(0,sc*0.6,0,sc*1.2);
      flameGrad.addColorStop(0,"rgba(255,220,80,0.95)");
      flameGrad.addColorStop(0.5,"rgba(255,100,20,0.8)");
      flameGrad.addColorStop(1,"rgba(255,40,0,0)");
      ctx.fillStyle=flameGrad;
      ctx.fill();
      // Body
      ctx.beginPath();
      ctx.moveTo(0,-sc);
      ctx.bezierCurveTo(sc*0.45,-sc*0.5,sc*0.45,sc*0.3,sc*0.28,sc*0.6);
      ctx.lineTo(-sc*0.28,sc*0.6);
      ctx.bezierCurveTo(-sc*0.45,sc*0.3,-sc*0.45,-sc*0.5,0,-sc);
      const bodyGrad=ctx.createLinearGradient(-sc*0.4,0,sc*0.4,0);
      bodyGrad.addColorStop(0,"#a0b4c8");
      bodyGrad.addColorStop(0.35,"#e8f0f8");
      bodyGrad.addColorStop(0.65,"#c8d8e8");
      bodyGrad.addColorStop(1,"#7090a8");
      ctx.fillStyle=bodyGrad;
      ctx.fill();
      // Window
      ctx.beginPath();
      ctx.arc(0,-sc*0.28,sc*0.18,0,Math.PI*2);
      ctx.fillStyle="rgba(120,200,255,0.85)";
      ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,0.5)";
      ctx.lineWidth=1;
      ctx.stroke();
      // Left fin
      ctx.beginPath();
      ctx.moveTo(-sc*0.28,sc*0.4);
      ctx.lineTo(-sc*0.7,sc*0.9);
      ctx.lineTo(-sc*0.28,sc*0.65);
      ctx.closePath();
      ctx.fillStyle="#8aaabb";
      ctx.fill();
      // Right fin
      ctx.beginPath();
      ctx.moveTo(sc*0.28,sc*0.4);
      ctx.lineTo(sc*0.7,sc*0.9);
      ctx.lineTo(sc*0.28,sc*0.65);
      ctx.closePath();
      ctx.fillStyle="#8aaabb";
      ctx.fill();
      ctx.restore();
    };

    // ── draw loop ──
    const draw=()=>{
      ctx.clearRect(0,0,W,H);

      // Deep space bg
      const bg=ctx.createRadialGradient(W*0.18,H*0.38,0,W*0.5,H*0.5,W*0.9);
      bg.addColorStop(0,"#0e0228");
      bg.addColorStop(0.55,"#030712");
      bg.addColorStop(1,"#030712");
      ctx.fillStyle=bg;
      ctx.fillRect(0,0,W,H);

      // Soft nebula glow top-right
      const neb=ctx.createRadialGradient(W*0.78,H*0.15,0,W*0.78,H*0.15,W*0.35);
      neb.addColorStop(0,"rgba(139,92,246,0.07)");
      neb.addColorStop(1,"transparent");
      ctx.fillStyle=neb;
      ctx.fillRect(0,0,W,H);

      // Second nebula bottom-left
      const neb2=ctx.createRadialGradient(W*0.12,H*0.82,0,W*0.12,H*0.82,W*0.28);
      neb2.addColorStop(0,"rgba(0,180,255,0.05)");
      neb2.addColorStop(1,"transparent");
      ctx.fillStyle=neb2;
      ctx.fillRect(0,0,W,H);

      // Draw stars
      stars.forEach(s=>{
        // Twinkle
        s.alpha+=s.twinkleSpeed*s.twinkleDir;
        if(s.alpha>=s.baseAlpha){s.alpha=s.baseAlpha;s.twinkleDir=-1;}
        else if(s.alpha<=0.05){s.alpha=0.05;s.twinkleDir=1;}

        ctx.save();
        ctx.globalAlpha=s.alpha;
        if(s.glow){
          const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*5);
          g.addColorStop(0,s.color);
          g.addColorStop(1,"transparent");
          ctx.fillStyle=g;
          ctx.fillRect(s.x-s.r*5,s.y-s.r*5,s.r*10,s.r*10);
        }
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=s.color;
        ctx.fill();
        ctx.restore();
      });

      // Shoot new star?
      const now=Date.now();
      if(now>=nextShoot){
        spawnShoot();
        nextShoot=now+3000+Math.random()*5000;
      }

      // Draw shooting stars
      for(let i=shoots.length-1;i>=0;i--){
        const sh=shoots[i];
        sh.x+=sh.vx; sh.y+=sh.vy;
        sh.alpha-=0.018;
        sh.trail.push({x:sh.x,y:sh.y});
        if(sh.trail.length>30)sh.trail.shift();

        if(sh.alpha<=0||sh.x<-200||sh.y>H+200){shoots.splice(i,1);continue;}

        // Draw trail
        ctx.save();
        ctx.lineCap="round";
        for(let t=1;t<sh.trail.length;t++){
          const prog=t/sh.trail.length;
          ctx.globalAlpha=sh.alpha*prog*0.9;
          ctx.strokeStyle=`rgba(200,230,255,${prog})`;
          ctx.lineWidth=sh.width*(1-prog*0.5);
          ctx.beginPath();
          ctx.moveTo(sh.trail[t-1].x,sh.trail[t-1].y);
          ctx.lineTo(sh.trail[t].x,sh.trail[t].y);
          ctx.stroke();
        }
        // Bright head
        ctx.globalAlpha=sh.alpha;
        const headGlow=ctx.createRadialGradient(sh.x,sh.y,0,sh.x,sh.y,sh.width*4);
        headGlow.addColorStop(0,"rgba(255,255,255,1)");
        headGlow.addColorStop(0.4,"rgba(180,220,255,0.6)");
        headGlow.addColorStop(1,"transparent");
        ctx.fillStyle=headGlow;
        ctx.fillRect(sh.x-sh.width*4,sh.y-sh.width*4,sh.width*8,sh.width*8);
        ctx.restore();
      }

      // Update and draw rocket
      const nowR=Date.now();
      if(!rocket&&nowR>=nextRocket){
        spawnRocket();
        nextRocket=nowR+10000+Math.random()*15000;
      }
      if(rocket){
        rocket.trail.push({x:rocket.x,y:rocket.y});
        if(rocket.trail.length>50)rocket.trail.shift();
        rocket.x+=rocket.vx;
        rocket.y+=rocket.vy;
        drawRocket(rocket);
        // Despawn if off screen (with margin)
        if(rocket.x<-200||rocket.x>W+200||rocket.y<-200||rocket.y>H+200){
          rocket=null;
        }
      }

      rafRef.current=requestAnimationFrame(draw);
    };

    draw();
    return()=>{
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize",resize);
    };
  },[]);

  return(
    <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:0,display:"block",pointerEvents:"none"}}/>
  );
}

function NotifBell({notifs,onRead,onClear,onMarkOne,navigate,users}){
  const [open,setOpen]=useState(false);const ref=useRef(null);
  const unread=notifs.filter(n=>!n.read).length;
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const handleClick=(n)=>{
    if(!n.read&&onMarkOne)onMarkOne(n.id);
    if(n.meta?.type==="news"&&n.meta?.url){window.open(n.meta.url,"_blank");setOpen(false);}
    else if(n.from_user_id&&n.from_user_id!==n.to_user_id){navigate("profile",n.from_user_id);setOpen(false);}
  };
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>{setOpen(o=>!o);}} className={unread>0?"bell-shake":""} style={{background:open?"rgba(0,212,255,.1)":"none",border:`1px solid ${open?"rgba(0,212,255,.3)":"rgba(255,255,255,.09)"}`,borderRadius:9,width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,transition:"all .2s",position:"relative"}}>
        🔔
        {unread>0&&<div style={{position:"absolute",top:-4,right:-4,width:17,height:17,borderRadius:"50%",background:"linear-gradient(135deg,#EF4444,#DC2626)",color:"white",fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",border:"2px solid #030712"}}>{unread>9?"9+":unread}</div>}
      </button>
      {open&&(
        <div style={{position:"absolute",right:0,top:46,width:340,zIndex:300,background:"linear-gradient(150deg,#0c1220,#0f1929)",border:"1px solid rgba(0,212,255,.15)",borderRadius:14,boxShadow:"0 20px 60px rgba(0,0,0,.8)",overflow:"hidden"}}>
          <div style={{padding:"14px 18px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#94A3B8",letterSpacing:".1em"}}>NOTIFICATIONS {unread>0&&<span style={{color:"#EF4444"}}>· {unread} NEW</span>}</span>
            <div style={{display:"flex",gap:8}}>
              {unread>0&&<button onClick={onRead} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:"#00D4FF"}}>Mark all read</button>}
              {notifs.length>0&&<button onClick={onClear} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:"#334155"}}>Clear</button>}
            </div>
          </div>
          <div style={{maxHeight:380,overflowY:"auto"}}>
            {notifs.length===0
              ? <div style={{padding:"28px 18px",textAlign:"center",color:"#334155",fontSize:13}}><div style={{fontSize:26,marginBottom:8}}>🔕</div>No notifications yet</div>
              : notifs.slice().reverse().map(n=>{
                  const isNews=n.meta?.type==="news";
                  const from=users.find(u=>u.id===n.from_user_id);
                  return (
                    <div key={n.id} onClick={()=>handleClick(n)} style={{padding:"11px 16px",display:"flex",gap:10,alignItems:"flex-start",borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",background:n.read?"transparent":"rgba(0,212,255,.05)",transition:"background .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}
                      onMouseLeave={e=>e.currentTarget.style.background=n.read?"transparent":"rgba(0,212,255,.05)"}>
                      {isNews
                        ?<div style={{width:32,height:32,borderRadius:8,background:"rgba(139,92,246,.2)",border:"1px solid rgba(139,92,246,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>📰</div>
                        :<AvatarCircle user={from} size={32}/>
                      }
                      <div style={{flex:1,minWidth:0}}>
                        {isNews
                          ?<div style={{fontSize:12,color:"#C4CDD6",lineHeight:1.4,marginBottom:2}}>{n.msg}</div>
                          :<div style={{fontSize:12,color:"#C4CDD6",lineHeight:1.4}}><span style={{fontWeight:700,color:"#E2E8F0"}}>{from?.display_name||"Someone"}</span> {n.msg}</div>
                        }
                        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                          <span style={{fontSize:10,color:"#334155"}}>{fmtTime(n.ts||Date.now())}</span>
                          {isNews&&<span style={{fontSize:9,color:"#8B5CF6",fontFamily:"'Orbitron',sans-serif"}}>TAP TO READ →</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
                        {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:"#00D4FF"}}/>}
                        {!n.read&&<button onClick={e=>{e.stopPropagation();onMarkOne&&onMarkOne(n.id);}} style={{fontSize:9,background:"none",border:"1px solid rgba(255,255,255,.1)",borderRadius:4,cursor:"pointer",color:"#475569",padding:"2px 4px"}} title="Mark read">✓</button>}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>

      )}
    </div>
  );
}

function FLModal({type,user,users,navigate,onClose}){
  const ids=type==="followers"?user.followers||[]:user.following||[];
  const members=ids.map(id=>users.find(u=>u.id===id)).filter(Boolean);
  return (
    <Modal title={type==="followers"?"Followers":"Following"} onClose={onClose} width={360}>
      {members.length===0
        ? <div style={{textAlign:"center",padding:"28px 0",color:"#334155",fontSize:13}}>None yet</div>
        : <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {members.map(m=>(
              <div key={m.id} onClick={()=>{navigate("profile",m.id);onClose();}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,212,255,.07)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"}>
                <AvatarCircle user={m} size={38}/>
                <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{m.display_name}</div><div style={{fontSize:11,color:"#475569"}}>@{m.username}</div></div>
                <span style={{fontSize:11,color:"#00D4FF"}}>→</span>
              </div>
            ))}
          </div>
      }
    </Modal>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
// ─── CARDS SYSTEM ─────────────────────────────────────────────────────────────

// 7-tier rarity system matching Real's spec
const RARITY_CFG={
  general:  {label:"General",  color:"#94A3B8",glow:"rgba(148,163,184,.25)",border:"rgba(148,163,184,.4)", anim:null,                                      mult:1.0, threshold:0},
  common:   {label:"Common",   color:"#4ADE80",glow:"rgba(74,222,128,.3)",  border:"rgba(74,222,128,.55)", anim:null,                                      mult:1.2, threshold:30},
  uncommon: {label:"Uncommon", color:"#38BDF8",glow:"rgba(56,189,248,.35)", border:"rgba(56,189,248,.6)",  anim:"rarePulse 3s ease-in-out infinite",        mult:1.4, threshold:90},
  rare:     {label:"Rare",     color:"#818CF8",glow:"rgba(129,140,248,.4)", border:"rgba(129,140,248,.7)", anim:"rarePulse 2.5s ease-in-out infinite",      mult:1.6, threshold:240},
  epic:     {label:"Epic",     color:"#A855F7",glow:"rgba(168,85,247,.5)",  border:"rgba(168,85,247,.8)",  anim:"epicPulse 2s ease-in-out infinite",        mult:2.0, threshold:540},
  legendary:{label:"Legendary",color:"#F59E0B",glow:"rgba(245,158,11,.55)",border:"rgba(245,158,11,.85)", anim:"legendFlare 1.8s ease-in-out infinite",    mult:2.5, threshold:1140},
  mystic:   {label:"Mystic",   color:"#EC4899",glow:"rgba(236,72,153,.6)",  border:"rgba(236,72,153,.9)",  anim:"legendFlare 1.4s ease-in-out infinite",   mult:4.0, threshold:4140},
  iconic:   {label:"Iconic",   color:"#FFF",   glow:"rgba(255,255,255,.7)", border:"rgba(255,255,255,1)",  anim:"legendFlare 1.2s ease-in-out infinite",   mult:6.0, threshold:10140},
};

function getCardRarityFromTotal(total){
  const tiers=["iconic","mystic","legendary","epic","rare","uncommon","common","general"];
  for(const t of tiers){if((total||0)>=RARITY_CFG[t].threshold)return t;}
  return "general";
}
function getPlayRarity(r){
  if(r>=10)return"legendary";
  if(r>=7) return"epic";
  if(r>=4) return"rare";
  if(r>=2) return"uncommon";
  return"common";
}
function nextRarityThreshold(total){
  const order=["general","common","uncommon","rare","epic","legendary","mystic","iconic"];
  const cur=getCardRarityFromTotal(total);
  const idx=order.indexOf(cur);
  if(idx>=order.length-1)return null;
  return {next:order[idx+1],threshold:RARITY_CFG[order[idx+1]].threshold,needed:RARITY_CFG[order[idx+1]].threshold-(total||0)};
}

const PACK_DEFS={
  starter:   {name:"Starter Pack",   emoji:"🎁",cost:100,playCount:3, perfCount:0,maxDaily:3,  desc:"3 plays from the season · great to start"},
  general:   {name:"General Pack",   emoji:"🎒",cost:200,playCount:5, perfCount:1,maxDaily:5,  desc:"5 plays + 1 performance · best value"},
  yesterday: {name:"Yesterday Pack", emoji:"📅",cost:250,playCount:5, perfCount:0,maxDaily:3,  desc:"5 plays from yesterday's MLB games"},
  player:    {name:"Player Pack",    emoji:"👤",cost:200,playCount:3, perfCount:0,maxDaily:999,desc:"3 plays from a specific player"},
  team:      {name:"Team Pack",      emoji:"⚾",cost:300,playCount:3, perfCount:1,maxDaily:999,desc:"3 plays + 1 performance from your team"},
};
const PACK_ODDS={
  starter:   {common:.55,uncommon:.28,rare:.12,epic:.04,legendary:.01},
  general:   {common:.40,uncommon:.30,rare:.18,epic:.09,legendary:.03},
  yesterday: {common:.38,uncommon:.30,rare:.20,epic:.09,legendary:.03},
  player:    {common:.42,uncommon:.30,rare:.17,epic:.08,legendary:.03},
  team:      {common:.38,uncommon:.28,rare:.20,epic:.10,legendary:.04},
};
const TEAM_TIERS=[10,20,50,100,200,500];

// Official MLB team logo helper
function mlbTeamLogo(teamId){return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;}
function mlbPlayerHeadshot(mlbPlayerId){return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/${mlbPlayerId}/headshot/67/current`;}

const MLB_TEAMS_LIST=[
  {id:"108",name:"Los Angeles Angels",      abbr:"LAA",emoji:"😇"},
  {id:"109",name:"Arizona Diamondbacks",    abbr:"ARI",emoji:"🐍"},
  {id:"110",name:"Baltimore Orioles",       abbr:"BAL",emoji:"🐦"},
  {id:"111",name:"Boston Red Sox",          abbr:"BOS",emoji:"🧦"},
  {id:"112",name:"Chicago Cubs",            abbr:"CHC",emoji:"🐻"},
  {id:"113",name:"Cincinnati Reds",         abbr:"CIN",emoji:"🔴"},
  {id:"114",name:"Cleveland Guardians",     abbr:"CLE",emoji:"🛡️"},
  {id:"115",name:"Colorado Rockies",        abbr:"COL",emoji:"⛰️"},
  {id:"116",name:"Detroit Tigers",          abbr:"DET",emoji:"🐯"},
  {id:"117",name:"Houston Astros",          abbr:"HOU",emoji:"🚀"},
  {id:"118",name:"Kansas City Royals",      abbr:"KC", emoji:"👑"},
  {id:"119",name:"Los Angeles Dodgers",     abbr:"LAD",emoji:"💙"},
  {id:"120",name:"Washington Nationals",    abbr:"WSH",emoji:"🦅"},
  {id:"121",name:"New York Mets",           abbr:"NYM",emoji:"🗽"},
  {id:"133",name:"Oakland Athletics",       abbr:"OAK",emoji:"🐘"},
  {id:"134",name:"Pittsburgh Pirates",      abbr:"PIT",emoji:"☠️"},
  {id:"135",name:"San Diego Padres",        abbr:"SD", emoji:"🏖️"},
  {id:"136",name:"Seattle Mariners",        abbr:"SEA",emoji:"🧭"},
  {id:"137",name:"San Francisco Giants",    abbr:"SF", emoji:"🌉"},
  {id:"138",name:"St. Louis Cardinals",     abbr:"STL",emoji:"🦅"},
  {id:"139",name:"Tampa Bay Rays",          abbr:"TB", emoji:"☀️"},
  {id:"140",name:"Texas Rangers",           abbr:"TEX",emoji:"⭐"},
  {id:"141",name:"Toronto Blue Jays",       abbr:"TOR",emoji:"🦅"},
  {id:"142",name:"Minnesota Twins",         abbr:"MIN",emoji:"🌙"},
  {id:"143",name:"Philadelphia Phillies",   abbr:"PHI",emoji:"🔔"},
  {id:"144",name:"Atlanta Braves",          abbr:"ATL",emoji:"🪓"},
  {id:"145",name:"Chicago White Sox",       abbr:"CWS",emoji:"⚫"},
  {id:"146",name:"Miami Marlins",           abbr:"MIA",emoji:"🐟"},
  {id:"147",name:"New York Yankees",        abbr:"NYY",emoji:"🗽"},
  {id:"158",name:"Milwaukee Brewers",       abbr:"MIL",emoji:"🍺"},
];

// No fake play generation — only real MLB Stats API data

// Stars hook
function useStars(cu){
  const[stars,setStars]=useState(0);
  const refresh=useCallback(async()=>{
    if(!cu)return;
    const rows=await sb.get("nova_stars",`?user_id=eq.${cu.id}&limit=1`);
    if(rows?.length)setStars(rows[0].balance||0);
  },[cu?.id]);
  useEffect(()=>{refresh();},[cu?.id]);

  const ensureRow=async()=>{
    const rows=await sb.get("nova_stars",`?user_id=eq.${cu.id}&limit=1`);
    if(rows?.length)return rows[0];
    const base={user_id:cu.id,balance:0,lifetime_earned:0,last_login_claim:0,login_streak:0};
    await sb.post("nova_stars",base);
    return base;
  };
  const earn=async(amount,reason)=>{
    if(!cu||amount<=0)return;
    try{
      const r=await ensureRow();
      const nb=(r.balance||0)+amount;
      await sb.patch("nova_stars",`?user_id=eq.${cu.id}`,{balance:nb,lifetime_earned:(r.lifetime_earned||0)+amount});
      setStars(nb);
      await sb.post("nova_star_log",{id:gid(),user_id:cu.id,amount,reason,ts:Date.now()});
    }catch(e){console.warn("earn stars",e);}
  };
  const spend=async(amount,reason)=>{
    if(!cu)return false;
    try{
      const r=await ensureRow();
      const bal=r.balance||0;
      if(bal<amount)return false;
      await sb.patch("nova_stars",`?user_id=eq.${cu.id}`,{balance:bal-amount});
      setStars(bal-amount);
      await sb.post("nova_star_log",{id:gid(),user_id:cu.id,amount:-amount,reason,ts:Date.now()});
      return true;
    }catch(e){return false;}
  };
  const claimDaily=async()=>{
    if(!cu)return null;
    try{
      const r=await ensureRow();
      const now=Date.now();
      const pstDay=(ts)=>{const d=new Date((ts||0)-8*3600000);return`${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;};
      if(r.last_login_claim&&pstDay(r.last_login_claim)===pstDay(now))return"already_claimed";
      const streak=Math.min((r.login_streak||0)+1,999);
      const bonus=streak>=14?150:streak>=7?100:streak>=3?75:50;
      await earn(bonus,"Daily login bonus");
      await sb.patch("nova_stars",`?user_id=eq.${cu.id}`,{last_login_claim:now,login_streak:streak});
      return{stars:bonus,streak};
    }catch(e){return null;}
  };
  return{stars,refresh,earn,spend,claimDaily};
}

function StarBadge({stars,size="sm"}){
  const fs=size==="lg"?20:size==="md"?16:13;
  return(
    <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.3)",borderRadius:8,padding:size==="lg"?"8px 14px":"4px 10px",flexShrink:0}}>
      <span style={{fontSize:fs}}>⭐</span>
      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:fs-2,fontWeight:900,color:"#F59E0B"}}>{(stars||0).toLocaleString()}</span>
    </div>
  );
}

// Card visual component
function CardDisplay({type,name,subName,headshot,totalRating=0,customName,customBorder,customBg,customEffect,onClick,size="md",pinned,serial}){
  const rarity=getCardRarityFromTotal(totalRating);
  const rc=RARITY_CFG[rarity];
  const w=size==="xs"?86:size==="sm"?118:size==="lg"?200:158;
  const h=Math.round(w*1.44);
  const borderColor=customBorder||rc.color;
  const bg=customBg||"#080d1a";
  const anim=customEffect||rc.anim;
  const[hov,setHov]=useState(false);
  return(
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{width:w,height:h,borderRadius:12,border:`2px solid ${borderColor}`,background:bg,cursor:onClick?"pointer":"default",
      position:"relative",overflow:"hidden",flexShrink:0,
      boxShadow:anim?`0 0 22px ${rc.glow},0 0 6px ${rc.glow},inset 0 0 20px rgba(0,0,0,.5)`:`0 4px 20px rgba(0,0,0,.6)`,
      animation:anim||"none",transition:"transform .18s",transform:hov&&onClick?"scale(1.06)":"scale(1)"}}>
      {/* Holographic shimmer overlay for rare+ */}
      {(rarity==="epic"||rarity==="legendary"||rarity==="mystic"||rarity==="iconic")&&(
        <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,transparent 30%,${rc.glow} 50%,transparent 70%)`,backgroundSize:"200% 200%",animation:"shimmer 2.5s linear infinite",zIndex:2,pointerEvents:"none",mixBlendMode:"overlay"}}/>
      )}
      <div style={{height:"62%",background:`linear-gradient(175deg,${rc.glow},rgba(0,0,0,.9))`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
        {headshot
          ?<img src={headshot} style={{width:type==="team"?"70%":"100%",height:type==="team"?"70%":"100%",objectFit:type==="team"?"contain":"cover",objectPosition:"top center",padding:type==="team"?"8px":0}}
            onError={e=>{e.target.style.display="none";if(e.target.nextSibling)e.target.nextSibling.style.display="flex";}}/>
          :<span/>}
      <div style={{display:"none",fontSize:size==="xs"?22:size==="sm"?28:44,alignItems:"center",justifyContent:"center"}}>{type==="team"?"🏟️":"⚾"}</div>
      {!headshot&&<div style={{fontSize:size==="xs"?22:size==="sm"?28:44,display:"flex",alignItems:"center",justifyContent:"center"}}>{type==="team"?"🏟️":"⚾"}</div>}
        <div style={{position:"absolute",top:5,right:5,background:"rgba(0,0,0,.85)",borderRadius:5,padding:"2px 6px",fontSize:7,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:rc.color,border:`1px solid ${rc.color}44`,zIndex:3}}>{rc.label.toUpperCase()}</div>
        {pinned&&<div style={{position:"absolute",bottom:4,right:5,fontSize:10,zIndex:3}}>📌</div>}
      </div>
      <div style={{padding:"6px 7px 5px",height:"38%",display:"flex",flexDirection:"column",justifyContent:"space-between",background:"rgba(0,0,0,.8)",position:"relative",zIndex:3}}>
        {customName&&<div style={{fontSize:7,color:"#64748B",fontFamily:"'Orbitron',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{customName}</div>}
        <div style={{fontSize:size==="xs"?8:size==="sm"?9:11,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0",lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
        {subName&&<div style={{fontSize:size==="xs"?7:9,color:"#475569",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{subName}</div>}
        {serial&&<div style={{fontSize:7,color:rc.color,fontFamily:"'Orbitron',sans-serif",opacity:.7}}>{serial}</div>}
        <div style={{height:3,background:"rgba(255,255,255,.08)",borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.min(100,totalRating?((totalRating%100)/100)*100:0)}%`,background:`linear-gradient(90deg,${rc.color},${rc.color}66)`,borderRadius:2}}/>
        </div>
      </div>
    </div>
  );
}

// Play card visual
function PlayCard({play,faceDown=false,flipped=false,onFlip,size="md",showPrestige}){
  const rarity=play?getPlayRarity(play.rating||0):"common";
  const rc=RARITY_CFG[rarity];
  const w=size==="xs"?84:size==="sm"?108:size==="lg"?168:138;
  const h=Math.round(w*1.44);
  const isPrestige=play?.prestige||false;
  const borderColor=isPrestige?"#FFD700":rc.color;
  const glowColor=isPrestige?"rgba(255,215,0,.7)":rc.glow;
  return(
    <div style={{width:w,height:h,perspective:900,flexShrink:0,cursor:faceDown&&!flipped?"pointer":"default"}} onClick={faceDown&&!flipped?onFlip:undefined}>
      <div style={{width:"100%",height:"100%",position:"relative",transformStyle:"preserve-3d",transition:"transform .8s cubic-bezier(.4,0,.2,1)",transform:flipped||!faceDown?"rotateY(180deg)":"rotateY(0deg)"}}>
        {/* Back face */}
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",borderRadius:10,
          border:"2px solid rgba(0,212,255,.2)",background:"linear-gradient(145deg,#050c18,#0a1a30)",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,
          boxShadow:"0 6px 24px rgba(0,0,0,.7)"}}>
          <div style={{fontSize:size==="sm"?22:32}}>💫</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:6,color:"#1e3a5f",letterSpacing:".15em",fontWeight:700}}>NOVA CARDS</div>
          <div style={{width:"60%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,212,255,.3),transparent)"}}/>
          <div style={{fontSize:7,color:"#0d2545",fontFamily:"'Orbitron',sans-serif"}}>2025 MLB</div>
        </div>
        {/* Front face */}
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",transform:"rotateY(180deg)",
          borderRadius:10,border:`2px solid ${borderColor}`,
          background:`linear-gradient(160deg,#07101f,#0d1a2e)`,overflow:"hidden",
          boxShadow:flipped?`0 0 28px ${glowColor},0 0 8px ${glowColor}`:"none",
          animation:flipped&&rc.anim?rc.anim:"none"}}>
          {isPrestige&&<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,transparent 20%,rgba(255,215,0,.15) 50%,transparent 80%)",backgroundSize:"200% 200%",animation:"shimmer 1.5s linear infinite",zIndex:1,pointerEvents:"none"}}/>}
          <div style={{height:"50%",background:`linear-gradient(140deg,${glowColor},rgba(0,0,0,.92))`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",padding:5,zIndex:2}}>
            <div style={{fontSize:size==="sm"?24:36,textAlign:"center"}}>{play?.emoji||"⚾"}</div>
            <div style={{position:"absolute",top:3,right:3,background:"rgba(0,0,0,.8)",borderRadius:4,padding:"1px 5px",fontSize:7,fontFamily:"'Orbitron',sans-serif",color:borderColor,fontWeight:700,border:`1px solid ${borderColor}44`}}>
              {isPrestige?"✨ PRESTIGE":rc.label.toUpperCase()}
            </div>
            <div style={{position:"absolute",top:3,left:3,background:"rgba(0,0,0,.8)",borderRadius:4,padding:"1px 5px",fontSize:8,fontFamily:"'Orbitron',sans-serif",color:"#F59E0B",fontWeight:700}}>{play?.rating||0}⭐</div>
          </div>
          <div style={{padding:"5px 6px",height:"50%",display:"flex",flexDirection:"column",gap:1,justifyContent:"space-between",zIndex:2,position:"relative"}}>
            <div style={{fontSize:size==="sm"?8:10,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0",lineHeight:1.15,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical"}}>{play?.playerName||"—"}</div>
            <div style={{fontSize:size==="sm"?7:8,color:borderColor,fontFamily:"'Orbitron',sans-serif",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{play?.teamName||""}{play?.opponent?` vs ${play.opponent}`:""}</div>
            {size!=="xs"&&play?.pitcherName&&play.pitcherName!=="Unknown"&&<div style={{fontSize:7,color:"#475569",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>P: {play.pitcherName}</div>}
            {size!=="xs"&&play?.inning&&<div style={{fontSize:7,color:"#334155"}}>{play.inning}{play.rbi>0?` · ${play.rbi} RBI`:""}</div>}
            <div style={{fontSize:size==="sm"?7:8,color:"#64748B",lineHeight:1.3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:size==="xs"?1:2,WebkitBoxOrient:"vertical"}}>{play?.description||""}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:7,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>{play?.serial||""}</div>
              <div style={{fontSize:7,color:"#334155"}}>{play?.gameDate||`MLB ${play?.season||2025}`}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── EPIC PACK OPENING ANIMATION ─────────────────────────────────────────────
function PackOpenModal({pack,plays,onClose,onKeep}){
  const mob=useIsMobile();
  // Phases: "tear" | "fanout" | "reveal" | "done"
  const[phase,setPhase]=useState("tear");
  const[tearPct,setTearPct]=useState(0);
  const[activeIdx,setActiveIdx]=useState(-1); // which card is selected/expanded
  const[flipped,setFlipped]=useState([]); // indices flipped
  const[particleKey,setParticleKey]=useState(0);

  // Tear animation on mount
  useEffect(()=>{
    let pct=0;
    const t=setInterval(()=>{
      pct+=3;
      setTearPct(pct);
      if(pct>=100){
        clearInterval(t);
        setTimeout(()=>setPhase("fanout"),300);
      }
    },20);
    return()=>clearInterval(t);
  },[]);

  const handleCardClick=(i)=>{
    if(phase!=="reveal")return;
    if(flipped.includes(i))return; // already revealed
    setActiveIdx(i);
    setFlipped(p=>[...p,i]);
    setParticleKey(k=>k+1);
    // If last card, trigger done after delay
    if(flipped.length+1>=plays.length){
      setTimeout(()=>setPhase("done"),1200);
    }
  };

  const revealAll=()=>{
    const all=plays.map((_,i)=>i);
    setFlipped(all);
    setParticleKey(k=>k+1);
    setTimeout(()=>setPhase("done"),1400);
  };

  const legendCount=plays.filter(p=>p.rarity==="legendary").length;
  const epicCount=plays.filter(p=>p.rarity==="epic").length;
  const mysticCount=plays.filter(p=>p.rarity==="mystic").length;

  // Colors for rarity particle bursts
  const getParticleColor=(idx)=>{
    const p=plays[idx];if(!p)return"#00D4FF";
    return RARITY_CFG[p.rarity||"common"].color;
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:600,overflow:"hidden"}}>
      {/* BG */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,#0a1628 0%,#020610 100%)"}}/>

      {/* Floating particles always */}
      {[...Array(20)].map((_,i)=>(
        <div key={i} style={{position:"absolute",width:2,height:2,borderRadius:"50%",background:`hsl(${(i*37)%360},80%,65%)`,
          left:`${(i*13.7)%100}%`,top:`${(i*7.3+10)%90}%`,
          animation:`float ${2+i%3}s ${i*0.15}s ease-in-out infinite alternate`,opacity:.3,pointerEvents:"none"}}/>
      ))}

      {/* PHASE: TEAR */}
      {phase==="tear"&&(
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
          <div style={{fontSize:mob?13:18,fontFamily:"'Orbitron',sans-serif",color:"#00D4FF",letterSpacing:".12em",marginBottom:10,fontWeight:900}}>
            {pack.emoji} {pack.name.toUpperCase()}
          </div>
          {/* Pack visual */}
          <div style={{position:"relative",width:mob?160:200,height:mob?220:280}}>
            {/* Pack body */}
            <div style={{width:"100%",height:`${100-tearPct}%`,background:"linear-gradient(160deg,#0d1f3c,#1a3060)",border:"2px solid rgba(0,212,255,.4)",borderRadius:14,overflow:"hidden",transition:"height .02s",position:"relative"}}>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
                <div style={{fontSize:mob?40:52}}>{pack.emoji}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:12,fontWeight:900,color:"#00D4FF",letterSpacing:".1em",textAlign:"center",padding:"0 10px"}}>{pack.name.toUpperCase()}</div>
                <div style={{fontSize:mob?9:11,color:"#334155"}}>{plays.length} cards inside</div>
              </div>
              {/* Rip line */}
              {tearPct>5&&(
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,#00D4FF,transparent)`,animation:"shimmer 0.5s linear infinite"}}/>
              )}
            </div>
            {/* Ripping particles */}
            {tearPct>20&&[...Array(12)].map((_,i)=>(
              <div key={i} style={{position:"absolute",width:4,height:4,borderRadius:"50%",background:"#00D4FF",
                left:`${15+(i*7)%70}%`,bottom:`${90-tearPct}%`,
                transform:`translate(${(i%3-1)*20}px,${-20-(i*5)}px)`,
                opacity:1-tearPct/100,transition:"all .1s",pointerEvents:"none"}}/>
            ))}
          </div>
          <div style={{fontSize:11,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginTop:8}}>
            {tearPct<50?"TEARING OPEN...":tearPct<90?"ALMOST...":"READY!"}
          </div>
        </div>
      )}

      {/* PHASE: FANOUT + REVEAL */}
      {(phase==="fanout"||phase==="reveal"||phase==="done")&&(
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",paddingTop:mob?16:30}}>
          {/* Header */}
          <div style={{textAlign:"center",marginBottom:mob?12:16,zIndex:10}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?13:18,fontWeight:900,color:"#00D4FF",letterSpacing:".08em"}}>{pack.emoji} {pack.name.toUpperCase()}</div>
            {phase==="reveal"&&flipped.length<plays.length&&(
              <div style={{fontSize:10,color:"#334155",marginTop:4,fontFamily:"'Orbitron',sans-serif"}}>
                TAP A CARD TO REVEAL · {flipped.length}/{plays.length}
              </div>
            )}
            {phase==="done"&&(legendCount>0||epicCount>0||mysticCount>0)&&(
              <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8,flexWrap:"wrap"}}>
                {mysticCount>0&&<div style={{padding:"4px 14px",borderRadius:20,background:"rgba(236,72,153,.15)",border:"1px solid rgba(236,72,153,.5)",fontSize:11,color:"#EC4899",fontFamily:"'Orbitron',sans-serif",fontWeight:700,animation:"legendFlare 1.4s ease-in-out infinite"}}>✨ {mysticCount}x MYSTIC!</div>}
                {legendCount>0&&<div style={{padding:"4px 14px",borderRadius:20,background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.5)",fontSize:11,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",fontWeight:700,animation:"legendFlare 1.8s ease-in-out infinite"}}>🏆 {legendCount}x LEGENDARY!</div>}
                {epicCount>0&&<div style={{padding:"4px 14px",borderRadius:20,background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.5)",fontSize:11,color:"#A855F7",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>⚡ {epicCount}x EPIC!</div>}
              </div>
            )}
          </div>

          {/* Cards area */}
          <div style={{
            display:"flex",flexWrap:"wrap",gap:mob?8:12,justifyContent:"center",
            maxWidth:mob?360:760,padding:"0 12px",
            animation:phase==="fanout"?"cardFanOut .6s ease both":"none",
            flex:1,alignContent:"center",
          }}>
            {plays.map((p,i)=>{
              const isFlipped=flipped.includes(i);
              const isActive=activeIdx===i;
              const isReady=phase==="reveal"||phase==="done";
              const rc=RARITY_CFG[p.rarity||"common"];
              return(
                <div key={i} style={{
                  position:"relative",
                  animation:phase==="fanout"?`cardDrop .5s ${i*0.08}s cubic-bezier(.34,1.56,.64,1) both`:"none",
                  transform:isActive&&isFlipped?`scale(1.12)`:"scale(1)",
                  transition:"transform .3s",
                  zIndex:isActive?20:10,
                }}>
                  <PlayCard play={p} faceDown={isReady} flipped={isFlipped} onFlip={()=>handleCardClick(i)} size={mob?"sm":"md"}/>
                  {/* Particle burst on reveal */}
                  {isFlipped&&isActive&&(
                    <div key={particleKey} style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:30}}>
                      {[...Array(16)].map((_,j)=>{
                        const angle=(j/16)*360;
                        const dist=40+Math.random()*30;
                        return(
                          <div key={j} style={{
                            position:"absolute",top:"50%",left:"50%",
                            width:j%3===0?6:4,height:j%3===0?6:4,
                            borderRadius:"50%",background:rc.color,
                            animation:`burst .6s ${j*0.02}s ease-out forwards`,
                            "--angle":`${angle}deg`,"--dist":`${dist}px`,
                            transformOrigin:"center",
                          }}/>
                        );
                      })}
                    </div>
                  )}
                  {/* Glow ring for high rarity reveal */}
                  {isFlipped&&(p.rarity==="legendary"||p.rarity==="epic"||p.rarity==="mystic")&&(
                    <div style={{position:"absolute",inset:-4,borderRadius:14,border:`2px solid ${rc.color}`,
                      animation:`${rc.anim}`,pointerEvents:"none",zIndex:5}}/>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",padding:"16px 12px",marginTop:"auto",zIndex:20}}>
            {phase==="reveal"&&flipped.length<plays.length&&(
              <button onClick={revealAll} style={{padding:"10px 24px",borderRadius:10,background:"rgba(0,212,255,.1)",border:"1px solid rgba(0,212,255,.35)",color:"#00D4FF",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>Reveal All</button>
            )}
            {phase==="done"&&(
              <button onClick={onKeep} style={{padding:"13px 32px",borderRadius:10,background:"linear-gradient(135deg,#00D4FF,#7C3AED)",border:"none",color:"#fff",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,cursor:"pointer",letterSpacing:".05em",boxShadow:"0 4px 20px rgba(0,212,255,.4)"}}>Add to Collection →</button>
            )}
            <button onClick={onClose} style={{padding:"10px 20px",borderRadius:10,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:11,cursor:"pointer"}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Set phase to reveal after fanout animation completes
// We need a wrapper that transitions fanout→reveal after animation
function PackOpenModalWrapper({pack,plays,onClose,onKeep}){
  const[ready,setReady]=useState(false);
  useEffect(()=>{
    // fanout phase duration ~ 0.6s base + plays.length*0.08s + 0.4s buffer
    const delay=600+(plays.length*80)+500;
    const t=setTimeout(()=>setReady(true),delay);
    return()=>clearTimeout(t);
  },[plays.length]);
  return <PackOpenModal pack={pack} plays={plays} onClose={onClose} onKeep={onKeep} _ready={ready}/>;
}

// Card customize modal
function CardCustomizeModal({card,onSave,onClose}){
  const[customName,setCustomName]=useState(card.custom_name||"");
  const[customHeadshot,setCustomHeadshot]=useState(card.custom_headshot||"");
  const[border,setBorder]=useState(card.custom_border||"");
  const[bg,setBg]=useState(card.custom_bg||"");
  const[effect,setEffect]=useState(card.custom_effect||"");
  const BORDERS=["","#00D4FF","#A855F7","#F59E0B","#EF4444","#22C55E","#F97316","#EC4899","#fff","#94A3B8","#FFD700"];
  const BGS=["","#080d1a","#0a1a0a","#1a0808","#080a1a","#1a1208","#0a0818","#181818","#1a0a14"];
  const EFFS=[["","None"],["rarePulse 2.5s ease-in-out infinite","Blue Glow"],["epicPulse 2s ease-in-out infinite","Purple Pulse"],["legendFlare 1.8s ease-in-out infinite","Gold Flare"],["legendFlare 1.4s ease-in-out infinite","Mystic Flare"]];
  return(
    <Modal title="✏️ Customize Card" onClose={onClose} width={440}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
        <CardDisplay type={card.card_type} name={card.card_name} headshot={customHeadshot||card.headshot_url} totalRating={card.total_play_rating||0} customName={customName||undefined} customBorder={border||undefined} customBg={bg||undefined} customEffect={effect||undefined} size="md" serial={card.serial}/>
      </div>
      <div style={{marginBottom:14}}><Lbl>Custom Photo</Lbl>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <label style={{padding:"7px 14px",borderRadius:8,background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.25)",color:"#00D4FF",fontSize:11,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0}}>
            📷 Upload Photo
            <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
              const file=e.target.files?.[0];if(!file)return;
              const reader=new FileReader();
              reader.onload=(ev)=>setCustomHeadshot(ev.target.result);
              reader.readAsDataURL(file);
            }}/>
          </label>
          {customHeadshot&&<div style={{fontSize:10,color:"#22C55E"}}>✓ Photo selected</div>}
          {customHeadshot&&<button onClick={()=>setCustomHeadshot("")} style={{background:"none",border:"none",color:"#EF4444",fontSize:11,cursor:"pointer"}}>✕ Remove</button>}
        </div>
        <div style={{fontSize:10,color:"#334155",marginTop:4}}>Upload any photo to replace the default headshot/logo on this card</div>
      </div>
      <div style={{marginBottom:14}}><Lbl>Card Nickname</Lbl>
        <input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="Custom nickname…" maxLength={28}/>
        <div style={{fontSize:10,color:"#334155",marginTop:3}}>Real name always shows below</div>
      </div>
      <div style={{marginBottom:14}}><Lbl>Border Color</Lbl>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {BORDERS.map((c,i)=><button key={i} onClick={()=>setBorder(c)} style={{width:26,height:26,borderRadius:6,background:c||"rgba(255,255,255,.06)",border:`2px solid ${border===c?"#00D4FF":"rgba(255,255,255,.12)"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{!c&&<span style={{fontSize:9,color:"#334155"}}>✕</span>}</button>)}
        </div>
      </div>
      <div style={{marginBottom:14}}><Lbl>Background</Lbl>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {BGS.map((c,i)=><button key={i} onClick={()=>setBg(c)} style={{width:26,height:26,borderRadius:6,background:c||"rgba(255,255,255,.06)",border:`2px solid ${bg===c?"#00D4FF":"rgba(255,255,255,.12)"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{!c&&<span style={{fontSize:9,color:"#334155"}}>✕</span>}</button>)}
        </div>
      </div>
      <div style={{marginBottom:22}}><Lbl>Card Effect</Lbl>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {EFFS.map(([e,l])=><button key={l} onClick={()=>setEffect(e)} style={{padding:"6px 12px",borderRadius:8,background:effect===e?"rgba(0,212,255,.12)":"rgba(255,255,255,.04)",border:`1px solid ${effect===e?"rgba(0,212,255,.4)":"rgba(255,255,255,.1)"}`,color:effect===e?"#00D4FF":"#64748B",fontSize:11,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>{l}</button>)}
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn onClick={()=>onSave({custom_name:customName,custom_headshot:customHeadshot,custom_border:border,custom_bg:bg,custom_effect:effect})} style={{flex:1}}>Save Card</Btn>
        <Btn variant="muted" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}

// Prestige modal — combine 3 identical plays
function PrestigeModal({plays,onPrestige,onClose}){
  const[sel,setSel]=useState([]);
  // group plays by description+playerName
  const groups=useMemo(()=>{
    const map={};
    plays.forEach(p=>{
      const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;
      if(!pd)return;
      const key=`${pd.playerName}__${pd.description}__${pd.rating}`;
      if(!map[key])map[key]=[];
      map[key].push({...p,_pd:pd});
    });
    return Object.entries(map).filter(([,v])=>v.length>=3);
  },[plays]);

  const doPrestige=()=>{
    if(sel.length===0)return;
    const [key]=sel;
    const group=groups.find(([k])=>k===key);
    if(!group)return;
    onPrestige(group[1].slice(0,3),key);
  };

  return(
    <Modal title="✨ Prestige — Combine 3 Identical Plays" onClose={onClose} width={500}>
      <div style={{fontSize:12,color:"#64748B",marginBottom:16}}>Combine 3 of the same play to create a Prestige card with 3× the rating and a gold border.</div>
      {groups.length===0&&<Empty icon="✨" msg="No prestige-ready plays yet — collect 3 of the same play!"/>}
      <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:320,overflowY:"auto"}}>
        {groups.map(([key,items])=>{
          const pd=items[0]._pd;
          const rc=RARITY_CFG[pd.rarity||"common"];
          const isSel=sel[0]===key;
          return(
            <div key={key} onClick={()=>setSel(isSel?[]:[key])} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,background:isSel?"rgba(255,215,0,.08)":"rgba(255,255,255,.03)",border:`1px solid ${isSel?"rgba(255,215,0,.5)":rc.color+"33"}`,cursor:"pointer",transition:"all .15s"}}>
              <div style={{fontSize:22}}>{pd.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:700,fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0"}}>{pd.playerName}</div>
                <div style={{fontSize:10,color:rc.color,marginBottom:2}}>{pd.description}</div>
                <div style={{fontSize:9,color:"#475569"}}>{rc.label} · {pd.rating}⭐ → {pd.rating*3}⭐ after prestige</div>
              </div>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:"#F59E0B"}}>{items.length}×</div>
                <div style={{fontSize:8,color:"#475569"}}>copies</div>
              </div>
            </div>
          );
        })}
      </div>
      {sel.length>0&&(
        <div style={{marginTop:16}}>
          <Btn onClick={doPrestige} style={{width:"100%"}}>✨ Prestige This Play (3× rating, gold border)</Btn>
        </div>
      )}
    </Modal>
  );
}

// ── Cards sub-tabs ───────────────────────────────────────────────────────────

function CardMarketTab({cu,stars,myCards,onBuy}){
  const mob=useIsMobile();
  const[type,setType]=useState("player");
  const[q,setQ]=useState("");
  const[results,setResults]=useState([]);
  const[searching,setSearching]=useState(false);
  const ownedIds=useMemo(()=>new Set(myCards.map(c=>c.card_def_id)),[myCards]);

  useEffect(()=>{
    if(type!=="player"||q.length<2){setResults([]);return;}
    const t=setTimeout(async()=>{
      setSearching(true);
      try{
        const r=await fetch(`/api/hyperbeam?search=${encodeURIComponent(q)}&sport=mlb`);
        const d=await r.json();
        setResults((d.athletes||[]).map(a=>({
          id:`mlb_player_${a.id}`,player_id:a.id,type:"player",
          name:a.name,team_name:a.team,position:a.position,
          headshot_url:mlbPlayerHeadshot(a.id),
          cost:200,
        })));
      }catch(e){setResults([]);}
      setSearching(false);
    },400);
    return()=>clearTimeout(t);
  },[q,type]);

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
        {[["player","👤 Players","200 ⭐"],["team","🏟️ Teams","800 ⭐"]].map(([t,l,cost])=>(
          <button key={t} onClick={()=>{setType(t);setResults([]);setQ("");}} style={{padding:"8px 18px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,border:`1px solid ${type===t?"rgba(0,212,255,.5)":"rgba(255,255,255,.1)"}`,background:type===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",color:type===t?"#00D4FF":"#64748B"}}>
            {l} <span style={{fontSize:9,color:"#334155"}}>{cost}</span>
          </button>
        ))}
      </div>
      {type==="player"&&(
        <>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search any active MLB player…" style={{marginBottom:14}}/>
          {searching&&<div style={{textAlign:"center",padding:28,color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Searching MLB roster…</div>}
          {!searching&&q.length>=2&&!results.length&&<Empty icon="🔍" msg="No players found — try full name"/>}
          {q.length<2&&<div style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontSize:36,marginBottom:10}}>⚾</div><div style={{color:"#334155",fontSize:13}}>Search any active MLB player</div><div style={{color:"#1e3a5f",fontSize:11,marginTop:4}}>200 ⭐ per player card</div></div>}
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(auto-fill,minmax(185px,1fr))",gap:12}}>
            {results.map(card=>{
              const owned=ownedIds.has(card.id);
              return(
                <Card key={card.id} style={{padding:"14px 12px 16px",textAlign:"center"}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
                    <CardDisplay type="player" name={card.name} subName={card.team_name} headshot={card.headshot_url} totalRating={0} size="sm"/>
                  </div>
                  <div style={{fontSize:11,fontWeight:700,fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0",marginBottom:2}}>{card.name}</div>
                  <div style={{fontSize:10,color:"#475569",marginBottom:10}}>{card.team_name}{card.position?` · ${card.position}`:""}</div>
                  {owned
                    ?<div style={{padding:"7px",borderRadius:8,background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.25)",fontSize:10,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>✓ OWNED</div>
                    :<button onClick={()=>onBuy(card)} disabled={!cu||stars<200} style={{width:"100%",padding:"8px",borderRadius:8,background:cu&&stars>=200?"rgba(0,212,255,.12)":"rgba(255,255,255,.04)",border:`1px solid ${cu&&stars>=200?"rgba(0,212,255,.35)":"rgba(255,255,255,.08)"}`,color:cu&&stars>=200?"#00D4FF":"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,cursor:cu&&stars>=200?"pointer":"not-allowed"}}>
                      {!cu?"Sign in to buy":"Buy · 200 ⭐"}
                    </button>
                  }
                </Card>
              );
            })}
          </div>
        </>
      )}
      {type==="team"&&(
        <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(auto-fill,minmax(172px,1fr))",gap:12}}>
          {MLB_TEAMS_LIST.map(team=>{
            const defId=`mlb_team_${team.id}`;
            const owned=ownedIds.has(defId);
            const rc=RARITY_CFG["general"];
            return(
              <Card key={team.id} style={{padding:"16px 14px",textAlign:"center"}}>
                <div style={{width:48,height:48,margin:"0 auto 7px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <img src={mlbTeamLogo(team.id)} style={{width:"100%",height:"100%",objectFit:"contain"}} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
                  <div style={{display:"none",fontSize:28,alignItems:"center",justifyContent:"center"}}>{team.emoji}</div>
                </div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0",marginBottom:2,lineHeight:1.3}}>{team.name}</div>
                <div style={{fontSize:10,color:"#475569",marginBottom:12}}>{team.abbr}</div>
                {owned
                  ?<div style={{padding:"6px",borderRadius:8,background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.25)",fontSize:10,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>✓ OWNED</div>
                  :<button onClick={()=>onBuy({id:defId,type:"team",player_id:null,name:team.name,team_name:team.name,headshot_url:mlbTeamLogo(team.id),cost:800})} disabled={!cu||stars<800} style={{width:"100%",padding:"8px",borderRadius:8,background:cu&&stars>=800?"rgba(168,85,247,.12)":"rgba(255,255,255,.04)",border:`1px solid ${cu&&stars>=800?"rgba(168,85,247,.35)":"rgba(255,255,255,.08)"}`,color:cu&&stars>=800?"#A855F7":"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:cu&&stars>=800?"pointer":"not-allowed"}}>
                    {!cu?"Sign in":"Buy · 800 ⭐"}
                  </button>
                }
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MyCardsTab({cu,cards,plays,onCustomize,onPin,onApply}){
  const mob=useIsMobile();
  const[sel,setSel]=useState(null);
  const unapplied=useMemo(()=>plays.filter(p=>!p.applied_to),[plays]);
  if(!cu)return<Empty icon="🃏" msg="Sign in to see your cards"/>;
  if(!cards.length)return<div style={{textAlign:"center",padding:60}}><div style={{fontSize:44,marginBottom:12}}>🃏</div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:"#475569"}}>No cards yet</div><div style={{fontSize:11,color:"#334155",marginTop:6}}>Head to Market · Player 200⭐ · Team 800⭐</div></div>;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {cards.map(card=>{
        const rarity=getCardRarityFromTotal(card.total_play_rating||0);
        const rc=RARITY_CFG[rarity];
        const nxt=nextRarityThreshold(card.total_play_rating||0);
        const isSelected=sel===card.id;
        return(
          <Card key={card.id} style={{padding:14,border:isSelected?"1px solid rgba(0,212,255,.5)":undefined}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <CardDisplay type={card.card_type} name={card.card_name} headshot={card.headshot_url} totalRating={card.total_play_rating||0} customName={card.custom_name||undefined} customBorder={card.custom_border||undefined} customBg={card.custom_bg||undefined} customEffect={card.custom_effect||undefined} size="sm" pinned={card.pinned} serial={card.serial} headshot={card.custom_headshot||card.headshot_url}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0",marginBottom:1}}>{card.custom_name||card.card_name}</div>
                {card.custom_name&&<div style={{fontSize:10,color:"#475569",marginBottom:4}}>{card.card_name}</div>}
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{padding:"2px 8px",borderRadius:10,background:rc.color+"18",border:`1px solid ${rc.color}33`,fontSize:9,fontFamily:"'Orbitron',sans-serif",color:rc.color,fontWeight:700}}>{rc.label}</span>
                  <span style={{fontSize:10,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif"}}>{rc.mult}x earnings</span>
                </div>
                <div style={{fontSize:10,color:"#475569",marginBottom:8}}>
                  <div>Rating: {card.total_play_rating||0} pts</div>
                  {nxt&&<div style={{fontSize:9,color:"#334155",marginTop:2}}>{nxt.needed} pts to {nxt.next}</div>}
                  {nxt&&(
                    <div style={{height:3,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden",marginTop:4}}>
                      <div style={{height:"100%",width:`${Math.min(100,((card.total_play_rating||0)-RARITY_CFG[rarity].threshold)/(nxt.threshold-RARITY_CFG[rarity].threshold)*100)}%`,background:`linear-gradient(90deg,${rc.color},${rc.color}66)`,borderRadius:2}}/>
                    </div>
                  )}
                  {card.serial&&<div style={{fontSize:9,color:rc.color,marginTop:3,fontFamily:"'Orbitron',sans-serif"}}>{card.serial}</div>}
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  <button onClick={()=>onCustomize(card)} style={{padding:"5px 10px",borderRadius:6,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",color:"#94A3B8",fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>✏️ Edit</button>
                  <button onClick={()=>onPin(card)} style={{padding:"5px 10px",borderRadius:6,background:card.pinned?"rgba(0,212,255,.1)":"rgba(255,255,255,.04)",border:`1px solid ${card.pinned?"rgba(0,212,255,.35)":"rgba(255,255,255,.09)"}`,color:card.pinned?"#00D4FF":"#94A3B8",fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>{card.pinned?"📌 Pinned":"📌 Pin"}</button>
                  {unapplied.length>0&&<button onClick={()=>setSel(isSelected?null:card.id)} style={{padding:"5px 10px",borderRadius:6,background:isSelected?"rgba(168,85,247,.12)":"rgba(255,255,255,.04)",border:`1px solid ${isSelected?"rgba(168,85,247,.4)":"rgba(255,255,255,.09)"}`,color:isSelected?"#A855F7":"#94A3B8",fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>⚡ Level Up</button>}
                </div>
              </div>
            </div>
            {isSelected&&unapplied.length>0&&(
              <div style={{marginTop:12,borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:12}}>
                <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:8,letterSpacing:".1em"}}>APPLY A PLAY:</div>
                <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6}}>
                  {unapplied.slice(0,15).map(p=>{
                    const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;
                    const pr=getPlayRarity(pd?.rating||0);const prc=RARITY_CFG[pr];
                    return(
                      <div key={p.id} style={{flexShrink:0,cursor:"pointer",textAlign:"center"}} onClick={()=>{onApply(p,card);setSel(null);}}>
                        <PlayCard play={pd} size="xs"/>
                        <div style={{fontSize:8,color:prc.color,fontFamily:"'Orbitron',sans-serif",marginTop:2}}>+{pd?.rating||0}pts</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function PackShopTab({cu,stars,loading,onOpen,myTeamCard}){
  const mob=useIsMobile();
  const[selPlayer,setSelPlayer]=useState("");
  const[playerSearch,setPlayerSearch]=useState("");
  const[playerResults,setPlayerResults]=useState([]);
  const[searching,setSearching]=useState(false);

  useEffect(()=>{
    if(playerSearch.length<2){setPlayerResults([]);return;}
    const t=setTimeout(async()=>{
      setSearching(true);
      try{const r=await fetch(`/api/hyperbeam?search=${encodeURIComponent(playerSearch)}&sport=mlb`);const d=await r.json();setPlayerResults(d.athletes||[]);}catch{setPlayerResults([]);}
      setSearching(false);
    },400);
    return()=>clearTimeout(t);
  },[playerSearch]);

  return(
    <div style={{maxWidth:560,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      {!cu&&<Empty icon="🎁" msg="Sign in to open packs"/>}
      {cu&&Object.entries(PACK_DEFS).map(([key,pack])=>{
        const isTeamPack=key==="team";
        const isPlayerPack=key==="player";
        if(isTeamPack&&!myTeamCard)return(
          <Card key={key} style={{padding:18,opacity:.5}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:32}}>{pack.emoji}</div>
              <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#E2E8F0"}}>{pack.name}</div>
              <div style={{fontSize:11,color:"#EF4444",marginTop:2}}>Requires owning a team card first</div></div>
            </div>
          </Card>
        );
        const canAfford=stars>=pack.cost;
        const odds=PACK_ODDS[key];
        return(
          <Card key={key} style={{padding:18}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{fontSize:32,flexShrink:0}}>{pack.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#E2E8F0",marginBottom:2}}>{pack.name}</div>
                <div style={{fontSize:11,color:"#475569"}}>{pack.desc}</div>
                {isTeamPack&&myTeamCard&&<div style={{fontSize:10,color:"#A855F7",marginTop:2}}>Team: {myTeamCard.card_name}</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:17,fontWeight:900,color:"#F59E0B"}}>{pack.cost}⭐</div>
                <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>{pack.maxDaily<999?`Max ${pack.maxDaily}x/day`:"Unlimited"}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
              {Object.entries(odds).map(([r,pct])=>{const rc=RARITY_CFG[r];return<div key={r} style={{padding:"2px 9px",borderRadius:14,background:rc.color+"14",border:`1px solid ${rc.color}33`,fontSize:9,color:rc.color,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{rc.label} {Math.round(pct*100)}%</div>;})}
            </div>
            {isPlayerPack&&(
              <div style={{marginBottom:12}}>
                <input value={playerSearch} onChange={e=>setPlayerSearch(e.target.value)} placeholder="Search player for this pack…" style={{marginBottom:6}}/>
                {searching&&<div style={{fontSize:10,color:"#334155"}}>Searching…</div>}
                {playerResults.length>0&&(
                  <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:140,overflowY:"auto"}}>
                    {playerResults.map(a=>(
                      <button key={a.id} onClick={()=>{setSelPlayer(a.id);setPlayerSearch(a.name);setPlayerResults([]);}} style={{padding:"6px 10px",borderRadius:7,background:selPlayer===a.id?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",border:`1px solid ${selPlayer===a.id?"rgba(0,212,255,.3)":"rgba(255,255,255,.07)"}`,color:"#E2E8F0",fontSize:11,cursor:"pointer",textAlign:"left"}}>
                        {a.name} <span style={{color:"#475569"}}>· {a.team}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button onClick={()=>onOpen(key,isPlayerPack?selPlayer:null,myTeamCard)} disabled={!canAfford||loading||(isPlayerPack&&!selPlayer)} style={{width:"100%",padding:"12px",borderRadius:10,background:canAfford&&!loading&&(!isPlayerPack||selPlayer)?"linear-gradient(135deg,#00D4FF,#7C3AED)":"rgba(255,255,255,.05)",border:"none",color:canAfford&&!loading&&(!isPlayerPack||selPlayer)?"#fff":"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,cursor:canAfford&&!loading&&(!isPlayerPack||selPlayer)?"pointer":"not-allowed",letterSpacing:".04em",transition:"all .2s"}}>
              {loading?"⟳ Opening...":canAfford?`Open ${pack.name}`:isPlayerPack&&!selPlayer?"Select a player first":`Need ${pack.cost-stars} more ⭐`}
            </button>
          </Card>
        );
      })}
    </div>
  );
}

function MyPlaysTab({cu,plays,cards,onApply,onPrestige,onPinPlay}){
  const mob=useIsMobile();
  const[sel,setSel]=useState(null);
  const[showPrestige,setShowPrestige]=useState(false);
  const unapplied=plays.filter(p=>!p.applied_to);
  const applied=plays.filter(p=>p.applied_to);
  const prestigeReady=useMemo(()=>{
    const map={};
    plays.forEach(p=>{const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;if(!pd)return;const key=`${pd.playerName}__${pd.description}__${pd.rating}`;map[key]=(map[key]||0)+1;});
    return Object.values(map).some(v=>v>=3);
  },[plays]);
  if(!cu)return<Empty icon="⚡" msg="Sign in to see your plays"/>;
  if(!plays.length)return<div style={{textAlign:"center",padding:60}}><div style={{fontSize:44,marginBottom:12}}>⚡</div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:"#475569"}}>No play cards yet</div><div style={{fontSize:11,color:"#334155",marginTop:6}}>Open packs to get real MLB plays</div></div>;
  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{fontSize:11,color:"#475569"}}>{unapplied.length} unused · {applied.length} applied</div>
        {prestigeReady&&<button onClick={()=>setShowPrestige(true)} style={{padding:"6px 14px",borderRadius:8,background:"rgba(255,215,0,.12)",border:"1px solid rgba(255,215,0,.4)",color:"#FFD700",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,cursor:"pointer",animation:"starPop .4s ease"}}>✨ Prestige Ready!</button>}
      </div>
      {unapplied.length>0&&(
        <>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#22C55E",letterSpacing:".14em",marginBottom:12}}>⚡ UNUSED · {unapplied.length}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:28}}>
            {unapplied.map(p=>{
              const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;
              const isSel=sel===p.id;
              return(
                <div key={p.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,position:"relative"}}>
                  <PlayCard play={pd} size={mob?"sm":"md"}/>
                  <div style={{display:"flex",gap:4}}>
                    {cards.length>0&&<button onClick={()=>setSel(isSel?null:p.id)} style={{padding:"4px 8px",borderRadius:6,background:isSel?"rgba(168,85,247,.15)":"rgba(255,255,255,.05)",border:`1px solid ${isSel?"rgba(168,85,247,.4)":"rgba(255,255,255,.1)"}`,color:isSel?"#A855F7":"#64748B",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{isSel?"CANCEL":"APPLY"}</button>}
                    {onPinPlay&&<button onClick={()=>onPinPlay(p)} style={{padding:"4px 8px",borderRadius:6,background:p.pinned?"rgba(0,212,255,.12)":"rgba(255,255,255,.05)",border:`1px solid ${p.pinned?"rgba(0,212,255,.35)":"rgba(255,255,255,.1)"}`,color:p.pinned?"#00D4FF":"#64748B",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{p.pinned?"📌":"📌 Pin"}</button>}
                  </div>
                  {isSel&&cards.length>0&&(
                    <div style={{position:"absolute",top:"105%",left:"50%",transform:"translateX(-50%)",background:"linear-gradient(160deg,#0c1220,#10172a)",border:"1px solid rgba(168,85,247,.3)",borderRadius:10,padding:8,zIndex:100,minWidth:170,maxHeight:190,overflowY:"auto",boxShadow:"0 12px 36px rgba(0,0,0,.8)"}}>
                      <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:6}}>APPLY TO:</div>
                      {cards.map(c=>(
                        <button key={c.id} onClick={()=>{onApply(p,c);setSel(null);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 10px",borderRadius:7,background:"none",border:"none",cursor:"pointer",textAlign:"left",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                          <span style={{fontSize:10}}>🃏</span>
                          <div><div style={{fontSize:10,color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{c.card_name}</div>
                          <div style={{fontSize:9,color:"#475569"}}>{c.total_play_rating||0}pts · {RARITY_CFG[getCardRarityFromTotal(c.total_play_rating||0)].label}</div></div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      {applied.length>0&&(
        <>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".14em",marginBottom:12}}>✓ APPLIED · {applied.length}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,opacity:.5}}>
            {applied.map(p=>{const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;return<PlayCard key={p.id} play={pd} size="sm"/>;  })}
          </div>
        </>
      )}
      {showPrestige&&<PrestigeModal plays={plays} onClose={()=>setShowPrestige(false)} onPrestige={(trio,key)=>{onPrestige(trio);setShowPrestige(false);}}/>}
    </div>
  );
}

// Main Cards Page

// ── Collection Tab — every obtainable card, yours highlighted ─────────────────
function CollectionTab({cu,myCards,myPlays}){
  const mob=useIsMobile();
  const[section,setSection]=useState("players");
  const[q,setQ]=useState("");
  const[teamFilter,setTeamFilter]=useState(""); // abbr of selected team, "" = all
  const[ownFilter,setOwnFilter]=useState("all"); // all | owned | unowned

  const ownedCardIds=useMemo(()=>new Set(myCards.map(c=>c.card_def_id)),[myCards]);
  const allTeams=MLB_TEAMS_LIST;
  const myPlayerCards=myCards.filter(c=>c.card_type==="player");
  const myTeamCards=myCards.filter(c=>c.card_type==="team");

  // Deduplicated plays pool from user collection
  const allPlays=useMemo(()=>{
    const seen=new Map();
    myPlays.forEach(p=>{
      const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;
      if(!pd?.playerName)return;
      const key=`${pd.playerName}__${pd.description}`;
      if(!seen.has(key))seen.set(key,{pd,owned:true,userPlay:p});
    });
    return Array.from(seen.values());
  },[myPlays]);

  // Team dropdown shared component
  const TeamDropdown=({value,onChange,style={}})=>(
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,color:"#E2E8F0",fontFamily:"'Rajdhani',sans-serif",fontSize:13,padding:"8px 12px",cursor:"pointer",flex:"0 0 auto",...style}}>
      <option value="">All Teams</option>
      {allTeams.map(t=><option key={t.id} value={t.abbr}>{t.emoji} {t.name}</option>)}
    </select>
  );

  // Ownership filter tabs
  const OwnTabs=()=>(
    <div style={{display:"flex",gap:5}}>
      {[["all","All"],["owned","✅ Owned"],["unowned","🔒 Not Owned"]].map(([v,l])=>(
        <button key={v} onClick={()=>setOwnFilter(v)}
          style={{padding:"6px 12px",borderRadius:16,cursor:"pointer",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,
            border:`1px solid ${ownFilter===v?"rgba(0,212,255,.45)":"rgba(255,255,255,.1)"}`,
            background:ownFilter===v?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",
            color:ownFilter===v?"#00D4FF":"#64748B"}}>
          {l}
        </button>
      ))}
    </div>
  );

  // ── Filtered lists ──────────────────────────────────────────────────────────

  // Players: filter by name search + team filter (team_name stored on card)
  const filteredPlayerCards=useMemo(()=>{
    return myPlayerCards.filter(c=>{
      const nameMatch=!q||c.card_name.toLowerCase().includes(q.toLowerCase());
      const selectedTeam=allTeams.find(t=>t.abbr===teamFilter);
      const teamMatch=!teamFilter||
        (c.team_name||"").toLowerCase().includes((selectedTeam?.name||"").toLowerCase())||
        (c.team_name||"").toLowerCase().includes(teamFilter.toLowerCase());
      return nameMatch&&teamMatch;
    });
  },[myPlayerCards,q,teamFilter,allTeams]);

  // Teams: filter by name search + ownership
  const filteredTeams=useMemo(()=>{
    return allTeams.filter(t=>{
      const nameMatch=!q||t.name.toLowerCase().includes(q.toLowerCase())||t.abbr.toLowerCase().includes(q.toLowerCase());
      const owned=ownedCardIds.has(`mlb_team_${t.id}`);
      const ownMatch=ownFilter==="all"||(ownFilter==="owned"&&owned)||(ownFilter==="unowned"&&!owned);
      return nameMatch&&ownMatch;
    });
  },[allTeams,q,ownFilter,ownedCardIds]);

  // Plays: filter by name/description search + team + ownership
  const filteredPlays=useMemo(()=>{
    return allPlays.filter(({pd,owned})=>{
      const textMatch=!q||(pd.playerName||"").toLowerCase().includes(q.toLowerCase())||(pd.description||"").toLowerCase().includes(q.toLowerCase());
      const selectedTeam=allTeams.find(t=>t.abbr===teamFilter);
      const teamMatch=!teamFilter||
        (pd.teamName||"").toLowerCase().includes((selectedTeam?.name||teamFilter).toLowerCase())||
        (pd.teamName||"").toLowerCase().includes(teamFilter.toLowerCase());
      const ownMatch=ownFilter==="all"||(ownFilter==="owned"&&owned)||(ownFilter==="unowned"&&!owned);
      return textMatch&&teamMatch&&ownMatch;
    });
  },[allPlays,q,teamFilter,ownFilter,allTeams]);

  const resetFilters=()=>{setQ("");setTeamFilter("");setOwnFilter("all");};
  const hasFilters=q||teamFilter||ownFilter!=="all";

  return(
    <div>
      {/* Section tabs */}
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        {[["players","👤 Players"],["teams","🏟️ Teams"],["plays","⚡ Plays"]].map(([s,l])=>(
          <button key={s} onClick={()=>{setSection(s);resetFilters();}}
            style={{padding:"7px 16px",borderRadius:20,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
              border:`1px solid ${section===s?"rgba(245,158,11,.5)":"rgba(255,255,255,.1)"}`,
              background:section===s?"rgba(245,158,11,.1)":"rgba(255,255,255,.03)",
              color:section===s?"#F59E0B":"#64748B"}}>
            {l}
            <span style={{marginLeft:5,fontSize:9,color:section===s?"#F59E0B":"#334155"}}>
              {s==="players"?`${myPlayerCards.length} owned`:s==="teams"?`${myTeamCards.length}/30`:`${allPlays.length} collected`}
            </span>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input value={q} onChange={e=>setQ(e.target.value)}
          placeholder={section==="players"?"Search player name…":section==="teams"?"Search team…":"Search player or play…"}
          style={{flex:1,minWidth:160}}/>
        {/* Team dropdown — not shown for teams section (redundant) */}
        {section!=="teams"&&(
          <TeamDropdown value={teamFilter} onChange={setTeamFilter} style={{minWidth:140,maxWidth:200}}/>
        )}
        {/* Own/unowned filter for teams + plays */}
        {(section==="teams"||section==="plays")&&<OwnTabs/>}
        {hasFilters&&(
          <button onClick={resetFilters}
            style={{padding:"7px 12px",borderRadius:8,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",color:"#EF4444",fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0}}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginBottom:12}}>
        {section==="players"&&`${filteredPlayerCards.length} PLAYER CARD${filteredPlayerCards.length!==1?"S":""}`}
        {section==="teams"&&`${filteredTeams.length} TEAM${filteredTeams.length!==1?"S":""} · ${myTeamCards.length}/30 OWNED`}
        {section==="plays"&&`${filteredPlays.length} PLAY${filteredPlays.length!==1?"S":""} · ${allPlays.length} TOTAL COLLECTED`}
        {teamFilter&&` · ${allTeams.find(t=>t.abbr===teamFilter)?.name||teamFilter}`}
      </div>

      {/* ── PLAYERS ── */}
      {section==="players"&&(
        <div>
          {!myPlayerCards.length&&(
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:36,marginBottom:10}}>👤</div>
              <div style={{color:"#334155",fontSize:13,fontFamily:"'Orbitron',sans-serif"}}>No player cards yet</div>
              <div style={{color:"#1e3a5f",fontSize:11,marginTop:4}}>Head to Market · 200⭐ each</div>
            </div>
          )}
          {myPlayerCards.length>0&&filteredPlayerCards.length===0&&(
            <div style={{textAlign:"center",padding:"30px 20px",color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>
              No cards match these filters
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(3,1fr)":"repeat(auto-fill,minmax(140px,1fr))",gap:mob?8:12}}>
            {filteredPlayerCards.map(card=>{
              const rarity=getCardRarityFromTotal(card.total_play_rating||0);
              const rc=RARITY_CFG[rarity];
              const nxt=nextRarityThreshold(card.total_play_rating||0);
              return(
                <div key={card.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <CardDisplay type="player" name={card.card_name} headshot={card.custom_headshot||card.headshot_url}
                    totalRating={card.total_play_rating||0} customName={card.custom_name||undefined}
                    customBorder={card.custom_border||undefined} customBg={card.custom_bg||undefined}
                    customEffect={card.custom_effect||undefined} size={mob?"sm":"md"} pinned={card.pinned} serial={card.serial}/>
                  <div style={{textAlign:"center",maxWidth:mob?90:150}}>
                    <div style={{fontSize:mob?7:9,fontFamily:"'Orbitron',sans-serif",color:rc.color,fontWeight:700}}>{rc.label}</div>
                    {nxt&&<div style={{fontSize:7,color:"#334155"}}>{nxt.needed}pts → {nxt.next}</div>}
                    {card.team_name&&<div style={{fontSize:7,color:"#475569"}}>{card.team_name}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TEAMS ── */}
      {section==="teams"&&(
        <div>
          {filteredTeams.length===0&&(
            <div style={{textAlign:"center",padding:"30px 20px",color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>
              No teams match these filters
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(3,1fr)":"repeat(auto-fill,minmax(130px,1fr))",gap:mob?8:10}}>
            {filteredTeams.map(team=>{
              const defId=`mlb_team_${team.id}`;
              const owned=ownedCardIds.has(defId);
              const ownedCard=myTeamCards.find(c=>c.card_def_id===defId);
              const rarity=owned?getCardRarityFromTotal(ownedCard?.total_play_rating||0):"general";
              const rc=RARITY_CFG[rarity];
              return(
                <div key={team.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                  opacity:owned?1:0.32,filter:owned?"none":"grayscale(1) brightness(0.4)",transition:"all .2s"}}>
                  {owned
                    ?<CardDisplay type="team" name={team.name} headshot={ownedCard?.custom_headshot||mlbTeamLogo(team.id)}
                        totalRating={ownedCard?.total_play_rating||0} customBorder={ownedCard?.custom_border||undefined}
                        customEffect={ownedCard?.custom_effect||undefined} size={mob?"sm":"md"}
                        pinned={ownedCard?.pinned} serial={ownedCard?.serial}/>
                    :<div style={{width:mob?108:138,height:mob?155:198,borderRadius:12,
                        border:"2px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.02)",
                        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
                        <img src={mlbTeamLogo(team.id)} style={{width:"50%",height:"50%",objectFit:"contain",opacity:.3}}
                          onError={e=>e.target.style.display="none"}/>
                        <div style={{fontSize:8,color:"#1e3a5f",fontFamily:"'Orbitron',sans-serif",textAlign:"center",padding:"0 4px"}}>{team.name}</div>
                        <div style={{fontSize:7,color:"#0d2545"}}>800⭐ to unlock</div>
                      </div>
                  }
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:mob?8:9,fontFamily:"'Orbitron',sans-serif",color:owned?rc.color:"#1e3a5f",fontWeight:700}}>
                      {owned?rc.label:"Locked"}
                    </div>
                    <div style={{fontSize:7,color:"#334155"}}>{team.abbr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PLAYS ── */}
      {section==="plays"&&(
        <div>
          {!allPlays.length&&(
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:36,marginBottom:10}}>⚡</div>
              <div style={{color:"#334155",fontSize:13,fontFamily:"'Orbitron',sans-serif"}}>No plays collected yet</div>
              <div style={{color:"#1e3a5f",fontSize:11,marginTop:4}}>Open packs to collect real 2025 MLB play cards</div>
            </div>
          )}
          {allPlays.length>0&&filteredPlays.length===0&&(
            <div style={{textAlign:"center",padding:"30px 20px",color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>
              No plays match these filters
            </div>
          )}
          <div style={{display:"flex",flexWrap:"wrap",gap:mob?8:12}}>
            {filteredPlays.map(({pd,owned},i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,
                opacity:owned?1:0.25,filter:owned?"none":"grayscale(1) brightness(0.3)",transition:"all .2s"}}>
                <PlayCard play={pd} size={mob?"sm":"md"}/>
                {pd.prestige&&<div style={{fontSize:8,color:"#FFD700",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>✨ PRESTIGE</div>}
                <div style={{fontSize:7,color:owned?"#22C55E":"#334155",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>
                  {owned?"OWNED":""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CardsPage({cu}){
  const mob=useIsMobile();
  const{stars,refresh:refreshStars,earn,spend,claimDaily}=useStars(cu);
  const[tab,setTab]=useState("market");
  const[myCards,setMyCards]=useState([]);
  const[myPlays,setMyPlays]=useState([]);
  const[packResult,setPackResult]=useState(null);
  const[packLoading,setPackLoading]=useState(false);
  const[toast,setToast]=useState(null);
  const[dailyClaimed,setDailyClaimed]=useState(false);
  const[customizeTarget,setCustomizeTarget]=useState(null);

  const showToast=(msg,color="#22C55E")=>{setToast({msg,color});setTimeout(()=>setToast(null),3000);};

  const loadMyCards=useCallback(async()=>{
    if(!cu)return;
    const rows=await sb.get("nova_user_cards",`?user_id=eq.${cu.id}&order=acquired_at.desc`);
    if(!rows?.length){setMyCards([]);return;}
    // Auto-fix any old ESPN headshot URLs to MLB static
    const fixed=rows.map(card=>{
      if(card.card_type==="player"&&card.player_id&&(!card.headshot_url||card.headshot_url.includes("espncdn"))){
        return{...card,headshot_url:mlbPlayerHeadshot(card.player_id)};
      }
      if(card.card_type==="team"&&card.card_def_id&&(!card.headshot_url||card.headshot_url.includes("espncdn"))){
        const teamId=card.card_def_id.replace("mlb_team_","");
        return{...card,headshot_url:mlbTeamLogo(teamId)};
      }
      return card;
    });
    setMyCards(fixed);
  },[cu?.id]);
  const loadMyPlays=useCallback(async()=>{
    if(!cu)return;
    const rows=await sb.get("nova_user_plays",`?user_id=eq.${cu.id}&order=acquired_at.desc`);
    setMyPlays(rows||[]);
  },[cu?.id]);

  useEffect(()=>{
    loadMyCards();loadMyPlays();
    if(!cu)return;
    sb.get("nova_stars",`?user_id=eq.${cu.id}&limit=1`).then(rows=>{
      if(!rows?.length)return;
      const pstDay=(ts)=>{const d=new Date((ts||0)-8*3600000);return`${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;};
      setDailyClaimed(pstDay(rows[0].last_login_claim||0)===pstDay(Date.now()));
    });
  },[cu?.id]);

  const buyCard=async(cardDef)=>{
    if(!cu){showToast("Sign in first!","#EF4444");return;}
    if(myCards.find(c=>c.card_def_id===cardDef.id)){showToast("Already owned!","#F59E0B");return;}
    const cost=cardDef.type==="team"?800:200;
    if(stars<cost){showToast(`Need ${cost}⭐ · You have ${stars}⭐`,"#EF4444");return;}
    const ok=await spend(cost,`Bought ${cardDef.name} card`);
    if(!ok){showToast("Not enough stars!","#EF4444");return;}
    // Serial number = total cards of this type + 1
    const existingCount=await sb.get("nova_user_cards",`?card_def_id=eq.${cardDef.id}`);
    const serial=`#${(existingCount?.length||0)+1}`;
    const newCard={id:gid(),user_id:cu.id,card_def_id:cardDef.id,card_type:cardDef.type,card_name:cardDef.name,player_id:cardDef.player_id||null,team_name:cardDef.team_name||null,headshot_url:cardDef.headshot_url||null,level:0,total_play_rating:0,custom_name:"",custom_border:"",custom_bg:"",custom_effect:"",pinned:false,pin_order:0,serial,acquired_at:Date.now()};
    await sb.upsert("nova_user_cards",newCard,"id");
    setMyCards(p=>[newCard,...p]);
    showToast(`🃏 Got ${cardDef.name} ${serial}!`);
    // Check team tier bonus
    if(cardDef.type==="team"){
      const allOwners=await sb.get("nova_user_cards",`?card_def_id=eq.${cardDef.id}`);
      const count=allOwners?.length||0;
      const tier=TEAM_TIERS.findIndex(t=>count===t);
      if(tier>=0){
        // Give 5 stars to all owners
        const ownerIds=[...new Set((allOwners||[]).map(c=>c.user_id))];
        for(const uid of ownerIds){
          const rows=await sb.get("nova_stars",`?user_id=eq.${uid}&limit=1`);
          if(rows?.length)await sb.patch("nova_stars",`?user_id=eq.${uid}`,{balance:(rows[0].balance||0)+5,lifetime_earned:(rows[0].lifetime_earned||0)+5});
        }
        showToast(`🎉 Tier ${tier+1} reached! All ${cardDef.name} owners got +5⭐!`,"#F59E0B");
      }
    }
    refreshStars();
  };

  const openPack=async(packType,playerIdForPack,myTeamCard)=>{
    if(!cu)return;
    const pack=PACK_DEFS[packType];
    if(stars<pack.cost){showToast(`Need ${pack.cost}⭐`,"#EF4444");return;}
    if(pack.maxDaily<999){
      const today=new Date().toLocaleDateString("en-US",{timeZone:"America/Los_Angeles"}).replace(/\//g,"-");
      const todayLog=await sb.get("nova_pack_log",`?user_id=eq.${cu.id}&pack_type=eq.${packType}&pack_date=eq.${today}`);
      if((todayLog?.length||0)>=pack.maxDaily){showToast(`Daily limit: ${pack.maxDaily}× ${pack.name}`,"#F59E0B");return;}
      await sb.upsert("nova_pack_log",{id:gid(),user_id:cu.id,pack_type:packType,pack_date:today,ts:Date.now()},"id");
    }
    setPackLoading(true);
    let fetchedPlays=[];
    let fetchError=null;
    try{
      const teamNameParam=packType==="team"&&myTeamCard?`&team_name=${encodeURIComponent(myTeamCard.team_name||myTeamCard.card_name)}`:"";
      const playerParam=playerIdForPack?`&player_id=${playerIdForPack}`:"";
      const url=`/api/hyperbeam?mlb_plays=1&pack_type=${packType}&count=${pack.playCount}${teamNameParam}${playerParam}`;
      const r=await fetch(url,{signal:(()=>{const c=new AbortController();setTimeout(()=>c.abort(),20000);return c.signal;})()});
      const d=await r.json();
      fetchedPlays=d.plays||[];
      if(d.error&&!fetchedPlays.length)fetchError=d.error;
    }catch(e){fetchError=e.message;}
    // Never use fake data — if no real plays, refund and tell the user
    if(!fetchedPlays.length){
      setPackLoading(false);
      showToast("Couldn't fetch real MLB plays right now — not charged. Try again!","#F59E0B");
      return;
    }
    const ok=await spend(pack.cost,`Opened ${pack.name}`);
    if(!ok){setPackLoading(false);showToast("Not enough stars!","#EF4444");return;}
    // Save plays with serials
    for(const p of fetchedPlays){
      const existingCount=await sb.get("nova_user_plays",`?user_id=eq.${cu.id}`);
      const serial=`#${(existingCount?.length||0)+1}`;
      await sb.upsert("nova_user_plays",{id:gid(),user_id:cu.id,play_data:JSON.stringify({...p,serial}),applied_to:null,pinned:false,acquired_at:Date.now()},"id");
    }
    setPackLoading(false);
    setPackResult({pack,plays:fetchedPlays});
    loadMyPlays();
    refreshStars();
  };

  // Recalculate a card's total rating from all currently applied plays
  const recalcCardRating=async(cardId)=>{
    const appliedPlays=await sb.get("nova_user_plays",`?user_id=eq.${cu.id}&applied_to=eq.${cardId}`);
    let total=0;
    for(const p of (appliedPlays||[])){
      const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;
      total+=(pd?.rating||0);
    }
    await sb.patch("nova_user_cards",`?id=eq.${cardId}`,{total_play_rating:total});
    return total;
  };

  const applyPlay=async(userPlay,userCard)=>{
    const pd=typeof userPlay.play_data==="string"?JSON.parse(userPlay.play_data):userPlay.play_data;
    const rating=pd?.rating||0;
    // Mark play as applied first
    await sb.patch("nova_user_plays",`?id=eq.${userPlay.id}`,{applied_to:userCard.id});
    setMyPlays(p=>p.map(pl=>pl.id===userPlay.id?{...pl,applied_to:userCard.id}:pl));
    // Recalculate from source of truth
    const newTotal=await recalcCardRating(userCard.id);
    const newRarity=getCardRarityFromTotal(newTotal);
    const oldRarity=getCardRarityFromTotal(userCard.total_play_rating||0);
    setMyCards(p=>p.map(c=>c.id===userCard.id?{...c,total_play_rating:newTotal}:c));
    if(newRarity!==oldRarity){
      const rc=RARITY_CFG[newRarity];
      showToast(`🎉 ${userCard.card_name} reached ${rc.label.toUpperCase()}!`,rc.color);
    }else{
      showToast(`⚡ +${rating}pts → ${userCard.card_name} (${newTotal} total)`);
    }
  };

  const prestigePlay=async(trio)=>{
    if(trio.length!==3)return;
    const pd=typeof trio[0].play_data==="string"?JSON.parse(trio[0].play_data):trio[0].play_data;
    if(!pd)return;
    const prestigedPlay={...pd,rating:pd.rating*3,prestige:true,serial:`#P${Math.floor(Math.random()*9999)+1}`,rarity:getPlayRarity(pd.rating*3)};
    // Delete the 3 source plays
    for(const p of trio){
      await sb.del("nova_user_plays",`?id=eq.${p.id}`);
    }
    const newPid=gid();
    await sb.upsert("nova_user_plays",{id:newPid,user_id:cu.id,play_data:JSON.stringify(prestigedPlay),applied_to:null,pinned:false,acquired_at:Date.now()},"id");
    setMyPlays(p=>[...p.filter(pl=>!trio.map(t=>t.id).includes(pl.id)),{id:newPid,play_data:JSON.stringify(prestigedPlay),applied_to:null,acquired_at:Date.now()}]);
    // Recalc any cards these were applied to
    const appliedCards=[...new Set(trio.map(t=>t.applied_to).filter(Boolean))];
    for(const cid of appliedCards){await recalcCardRating(cid);}
    await loadMyCards();
    showToast(`✨ PRESTIGE! New rating: ${prestigedPlay.rating}⭐ — ${prestigedPlay.rarity.toUpperCase()}!`,"#FFD700");
  };

  const togglePin=async(card)=>{
    const pinned=myCards.filter(c=>c.pinned);
    if(!card.pinned&&pinned.length>=10){showToast("Max 10 cards pinned to profile!","#F59E0B");return;}
    await sb.patch("nova_user_cards",`?id=eq.${card.id}`,{pinned:!card.pinned});
    setMyCards(p=>p.map(c=>c.id===card.id?{...c,pinned:!c.pinned}:c));
    showToast(card.pinned?"Unpinned from profile":"📌 Pinned to profile!");
  };

  const togglePinPlay=async(play)=>{
    const pinnedPlays=myPlays.filter(p=>p.pinned);
    if(!play.pinned&&pinnedPlays.length>=10){showToast("Max 10 plays pinned to profile!","#F59E0B");return;}
    await sb.patch("nova_user_plays",`?id=eq.${play.id}`,{pinned:!play.pinned});
    setMyPlays(p=>p.map(pl=>pl.id===play.id?{...pl,pinned:!pl.pinned}:pl));
    showToast(play.pinned?"Play unpinned":"📌 Play pinned to profile!");
  };

  const myTeamCard=myCards.find(c=>c.card_type==="team");
  const TABS=[["market","🏪 Market"],["mycards","🃏 My Cards"],["packs","🎁 Packs"],["plays","⚡ My Plays"],["collection","📖 Collection"]];

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"14px 12px 100px":"28px 20px 80px",position:"relative"}}>
      {toast&&<div style={{position:"fixed",top:74,left:"50%",transform:"translateX(-50%)",background:"rgba(8,13,26,.97)",border:`1px solid ${toast.color}44`,borderRadius:12,padding:"10px 22px",zIndex:500,color:toast.color,fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,boxShadow:"0 8px 32px rgba(0,0,0,.7)",pointerEvents:"none",whiteSpace:"nowrap",animation:"starPop .3s ease"}}>{toast.msg}</div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?15:22,fontWeight:900,background:"linear-gradient(135deg,#F59E0B,#A855F7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:2}}>⚾ NOVA CARDS</div>
          <div style={{fontSize:11,color:"#334155"}}>Collect · Level Up · Flex · MLB 2025</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <StarBadge stars={stars}/>
          {cu&&!dailyClaimed&&<button onClick={async()=>{const r=await claimDaily();if(r==="already_claimed"){showToast("Already claimed today! 🌙","#F59E0B");return;}if(r){setDailyClaimed(true);showToast(`⭐ +${r.stars} stars! Streak: ${r.streak} days`);refreshStars();}}} style={{padding:"6px 13px",borderRadius:8,background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.4)",color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>🎁 Daily Bonus</button>}
        </div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:20,flexWrap:"wrap"}}>
        {TABS.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"8px 15px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===k?"rgba(245,158,11,.5)":"rgba(255,255,255,.08)"}`,background:tab===k?"rgba(245,158,11,.1)":"rgba(255,255,255,.03)",color:tab===k?"#F59E0B":"#64748B",transition:"all .2s"}}>{l}</button>)}
      </div>
      {tab==="market"&&<CardMarketTab cu={cu} stars={stars} myCards={myCards} onBuy={buyCard}/>}
      {tab==="mycards"&&<MyCardsTab cu={cu} cards={myCards} plays={myPlays} onCustomize={setCustomizeTarget} onPin={togglePin} onApply={applyPlay}/>}
      {tab==="packs"&&<PackShopTab cu={cu} stars={stars} loading={packLoading} onOpen={openPack} myTeamCard={myTeamCard}/>}
      {tab==="plays"&&<MyPlaysTab cu={cu} plays={myPlays} cards={myCards} onApply={applyPlay} onPrestige={prestigePlay} onPinPlay={togglePinPlay}/>}
      {tab==="collection"&&<CollectionTab cu={cu} myCards={myCards} myPlays={myPlays}/>}
      {packResult&&<PackOpenModal pack={packResult.pack} plays={packResult.plays} onClose={()=>setPackResult(null)} onKeep={()=>{setPackResult(null);setTab("plays");loadMyPlays();}}/>}
      {customizeTarget&&<CardCustomizeModal card={customizeTarget} onClose={()=>setCustomizeTarget(null)} onSave={async(updates)=>{await sb.patch("nova_user_cards",`?id=eq.${customizeTarget.id}`,updates);setMyCards(p=>p.map(c=>c.id===customizeTarget.id?{...c,...updates}:c));setCustomizeTarget(null);showToast("Card updated! ✏️");}}/>}
    </div>
  );
}


function Navbar({cu,onLogin,onRegister,onLogout,nav,page,notifs,onReadNotifs,onClearNotifs,onMarkOneNotif,users,msgUnread}){
  const mob=useIsMobile();
  const[gamesOpen,setGamesOpen]=useState(false);
  const[leaguesOpen,setLeaguesOpen]=useState(false);
  const gamesRef=useRef(null);
  const leaguesRef=useRef(null);
  const GAMES_PAGES=["trivia","leaderboard","cards"];
  const HUB_PAGES=["hub","stats","news","predict"];
  const LEAGUE_PAGES=["nffl","nbbl"];
  const dTabs=[["home","Home"],["members","Members"],["feed","🎬 Feed"]];
  const mTabs=[{p:"home",icon:"🏠",lbl:"Home"},{p:"hub",icon:"📊",lbl:"Hub"},{p:"feed",icon:"🎬",lbl:"Feed"},{p:"members",icon:"👥",lbl:"Members"},{p:"messages",icon:"💬",lbl:"DMs",badge:msgUnread}];
  // Close dropdowns on outside click
  useEffect(()=>{
    const h=(e)=>{
      if(gamesRef.current&&!gamesRef.current.contains(e.target))setGamesOpen(false);
      if(leaguesRef.current&&!leaguesRef.current.contains(e.target))setLeaguesOpen(false);
    };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);
  return (
    <>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:62,display:"flex",alignItems:"center",justifyContent:"space-between",padding:mob?"0 12px":"0 20px",background:"rgba(3,7,18,.97)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,.055)"}}>
        <div style={{display:"flex",alignItems:"center",gap:mob?8:16}}>
          <button onClick={()=>nav("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:20}}>💫</span>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:mob?15:17,letterSpacing:".12em",background:"linear-gradient(135deg,#fff 10%,#00D4FF 55%,#8B5CF6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NOVA</span>
          </button>
          {!mob&&(
            <div style={{display:"flex",gap:1,alignItems:"center"}}>
              {dTabs.map(([p,l])=><button key={p} onClick={()=>nav(p)} style={{background:page===p?"rgba(0,212,255,.09)":"none",border:page===p?"1px solid rgba(0,212,255,.2)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:page===p?"#00D4FF":"#94A3B8",transition:"all .2s",whiteSpace:"nowrap"}}>{l}</button>)}
              {/* Hub tab — News + Stats + Predict */}
              <button onClick={()=>nav("hub")} style={{background:HUB_PAGES.includes(page)?"rgba(0,212,255,.09)":"none",border:HUB_PAGES.includes(page)?"1px solid rgba(0,212,255,.2)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:HUB_PAGES.includes(page)?"#00D4FF":"#94A3B8",transition:"all .2s",whiteSpace:"nowrap"}}>📊 Hub</button>
              {/* Leagues dropdown */}
              <div ref={leaguesRef} style={{position:"relative"}}>
                <button onClick={()=>setLeaguesOpen(o=>!o)} style={{background:LEAGUE_PAGES.includes(page)?"rgba(239,68,68,.09)":"none",border:LEAGUE_PAGES.includes(page)?"1px solid rgba(239,68,68,.25)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:LEAGUE_PAGES.includes(page)?"#EF4444":"#94A3B8",transition:"all .2s",display:"flex",alignItems:"center",gap:5}}>
                  🏆 Leagues <span style={{fontSize:9,opacity:.7,transition:"transform .2s",transform:leaguesOpen?"rotate(180deg)":"rotate(0deg)",display:"inline-block"}}>▼</span>
                </button>
                {leaguesOpen&&(
                  <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,background:"linear-gradient(160deg,#0c1220,#10172a)",border:"1px solid rgba(239,68,68,.25)",borderRadius:12,padding:6,minWidth:170,zIndex:200,boxShadow:"0 16px 40px rgba(0,0,0,.7)"}}>
                    {[["nffl","🏈","#F59E0B","NFFL","Nova Football Fusion League"],["nbbl","⚾","#22C55E","NBBL","Nova Baseball League"]].map(([p,icon,col,label,sub])=>(
                      <button key={p} onClick={()=>{nav(p);setLeaguesOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",borderRadius:8,background:page===p?col+"18":"none",border:"none",cursor:"pointer",textAlign:"left",transition:"background .15s"}}>
                        <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:page===p?col:"#E2E8F0"}}>{label}</div>
                          <div style={{fontSize:10,color:"#475569"}}>{sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Games dropdown */}
              <div ref={gamesRef} style={{position:"relative"}}>
                <button onClick={()=>setGamesOpen(o=>!o)} style={{background:GAMES_PAGES.includes(page)?"rgba(168,85,247,.09)":"none",border:GAMES_PAGES.includes(page)?"1px solid rgba(168,85,247,.25)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:GAMES_PAGES.includes(page)?"#A855F7":"#94A3B8",transition:"all .2s",display:"flex",alignItems:"center",gap:5}}>
                  🎮 Games <span style={{fontSize:9,opacity:.7,transition:"transform .2s",transform:gamesOpen?"rotate(180deg)":"rotate(0deg)",display:"inline-block"}}>▼</span>
                </button>
                {gamesOpen&&(
                  <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,background:"linear-gradient(160deg,#0c1220,#10172a)",border:"1px solid rgba(168,85,247,.25)",borderRadius:12,padding:6,minWidth:160,zIndex:200,boxShadow:"0 16px 40px rgba(0,0,0,.7)"}}>
                    {[["cards","⚾","Nova Cards","Collect & level up MLB player cards"],["trivia","🧠","Trivia","Test your sports knowledge"],["leaderboard","🏆","Leaderboard","Top members ranked"]].map(([p,icon,label,desc])=>(
                      <button key={p} onClick={()=>{nav(p);setGamesOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",borderRadius:8,background:page===p?"rgba(168,85,247,.12)":"none",border:"none",cursor:"pointer",textAlign:"left",transition:"background .15s"}}>
                        <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:page===p?"#A855F7":"#E2E8F0"}}>{label}</div>
                          <div style={{fontSize:10,color:"#475569"}}>{desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {(cu?.is_owner||cu?.staff_role==="Co-owner")&&<button onClick={()=>nav("dashboard")} style={{background:page==="dashboard"?"rgba(245,158,11,.09)":"none",border:page==="dashboard"?"1px solid rgba(245,158,11,.2)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:page==="dashboard"?"#F59E0B":"#94A3B8"}}>⚡ Dashboard</button>}
            </div>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:mob?6:8}}>
          {cu ? (
            <>
              <NotifBell notifs={notifs} onRead={onReadNotifs} onClear={onClearNotifs} onMarkOne={onMarkOneNotif} navigate={nav} users={users}/>
              {!mob&&(
                <button onClick={()=>nav("messages")} style={{position:"relative",background:page==="messages"?"rgba(0,212,255,.1)":"none",border:`1px solid ${page==="messages"?"rgba(0,212,255,.3)":"rgba(255,255,255,.09)"}`,borderRadius:9,width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>
                  💬
                  {msgUnread>0&&<div style={{position:"absolute",top:-4,right:-4,width:17,height:17,borderRadius:"50%",background:"linear-gradient(135deg,#00D4FF,#8B5CF6)",color:"white",fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",border:"2px solid #030712"}}>{msgUnread>9?"9+":msgUnread}</div>}
                </button>
              )}
              <button onClick={()=>nav("profile",cu.id)} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",borderRadius:9,padding:mob?"4px 8px":"4px 10px",cursor:"pointer",color:"#E2E8F0",fontFamily:"'Rajdhani',sans-serif",fontSize:12,fontWeight:600}}>
                <div style={{position:"relative",width:26,height:26,borderRadius:"50%",overflow:"hidden",background:`radial-gradient(circle,${cu.page_accent||"#00D4FF"}44,rgba(0,0,0,.7))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
                  {cu.avatar_url?<img src={cu.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:cu.avatar}
                  <StatusDot type={cu.status_type||"offline"} size={8} style={{position:"absolute",bottom:-1,right:-1}}/>
                </div>
                {!mob&&<span style={{maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cu.display_name}</span>}
              </button>
              {!mob&&<Btn variant="muted" size="sm" onClick={onLogout}>Out</Btn>}
              {mob&&(cu?.is_owner||cu?.staff_role==="Co-owner")&&<button onClick={()=>nav("dashboard")} style={{background:"none",border:"1px solid rgba(245,158,11,.3)",borderRadius:8,padding:"4px 8px",cursor:"pointer",fontSize:11,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>⚡</button>}
            </>
          ) : (
            <>
              <Btn variant="ghost" size="sm" onClick={onLogin}>Sign In</Btn>
              <Btn variant="primary" size="sm" onClick={onRegister}>{mob?"Join":"Join Nova"}</Btn>
            </>
          )}
        </div>
      </nav>
      {mob&&(
        <div className="mob-nav">
          {mTabs.map(t=>(
            <button key={t.p} className="mob-tab" onClick={()=>nav(t.p)} style={{color:page===t.p?"#00D4FF":"#475569"}}>
              <span className="mob-tab-icon" style={{position:"relative"}}>
                {t.icon}
                {t.badge>0&&<span style={{position:"absolute",top:-4,right:-6,width:15,height:15,borderRadius:"50%",background:"#EF4444",color:"white",fontSize:8,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",border:"1.5px solid #030712"}}>{t.badge>9?"9+":t.badge}</span>}
              </span>
              <span className="mob-tab-label" style={{color:page===t.p?"#00D4FF":"#475569"}}>{t.lbl}</span>
            </button>
          ))}
          {/* Games button on mobile */}
          <button className="mob-tab" onClick={()=>setGamesOpen(o=>!o)} style={{color:GAMES_PAGES.includes(page)?"#A855F7":"#475569"}}>
            <span className="mob-tab-icon">🎮</span>
            <span className="mob-tab-label" style={{color:GAMES_PAGES.includes(page)?"#A855F7":"#475569"}}>Games</span>
          </button>
          {/* Leagues button on mobile */}
          <button className="mob-tab" onClick={()=>setLeaguesOpen(o=>!o)} style={{color:LEAGUE_PAGES.includes(page)?"#EF4444":"#475569"}}>
            <span className="mob-tab-icon">🏆</span>
            <span className="mob-tab-label" style={{color:LEAGUE_PAGES.includes(page)?"#EF4444":"#475569"}}>Leagues</span>
          </button>
        </div>
      )}
      {/* Mobile games sheet */}
      {mob&&gamesOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.7)"}} onClick={()=>setGamesOpen(false)}>
          <div style={{position:"absolute",bottom:70,left:0,right:0,background:"linear-gradient(160deg,#0c1220,#10172a)",borderTop:"1px solid rgba(168,85,247,.25)",borderRadius:"20px 20px 0 0",padding:"20px 16px"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".12em",marginBottom:14}}>🎮 GAMES</div>
            {[["cards","⚾","Nova Cards","Collect & level up MLB player cards"],["trivia","🧠","Trivia","Test your sports knowledge"],["leaderboard","🏆","Leaderboard","Top members ranked"]].map(([p,icon,label,desc])=>(
              <button key={p} onClick={()=>{nav(p);setGamesOpen(false);}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 14px",borderRadius:12,background:page===p?"rgba(168,85,247,.12)":"rgba(255,255,255,.03)",border:"1px solid "+(page===p?"rgba(168,85,247,.3)":"rgba(255,255,255,.06)"),marginBottom:8,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:22}}>{icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:page===p?"#A855F7":"#E2E8F0"}}>{label}</div>
                  <div style={{fontSize:11,color:"#475569"}}>{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Mobile leagues sheet */}
      {mob&&leaguesOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.7)"}} onClick={()=>setLeaguesOpen(false)}>
          <div style={{position:"absolute",bottom:70,left:0,right:0,background:"linear-gradient(160deg,#0c1220,#10172a)",borderTop:"1px solid rgba(239,68,68,.25)",borderRadius:"20px 20px 0 0",padding:"20px 16px"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".12em",marginBottom:14}}>🏆 LEAGUES</div>
            {[["nffl","🏈","#F59E0B","NFFL","Nova Football Fusion League"],["nbbl","⚾","#22C55E","NBBL","Nova Baseball League"]].map(([p,icon,col,label,sub])=>(
              <button key={p} onClick={()=>{nav(p);setLeaguesOpen(false);}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 14px",borderRadius:12,background:page===p?col+"18":"rgba(255,255,255,.03)",border:"1px solid "+(page===p?col+"44":"rgba(255,255,255,.06)"),marginBottom:8,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:22}}>{icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:page===p?col:"#E2E8F0"}}>{label}</div>
                  <div style={{fontSize:11,color:"#475569"}}>{sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── Messages ──────────────────────────────────────────────────────────────────

// ─── WebRTC helpers ─────────────────────────────────────────────────────────────
const ICE_SERVERS={iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"}]};

// Supabase-based signaling: store offer/answer/candidates in nova_signaling
const sig={
  send:async(convId,fromId,type,data)=>{
    await sb.post("nova_signaling",{id:gid(),conv_id:convId,from_id:fromId,type,data:JSON.stringify(data),ts:Date.now()});
  },
  poll:async(convId,afterTs,excludeId)=>{
    return await sb.get("nova_signaling",`?conv_id=eq.${convId}&ts=gt.${afterTs}&from_id=neq.${excludeId}&order=ts.asc`)||[];
  },
  clear:async(convId)=>{
    await sb.del("nova_signaling",`?conv_id=eq.${convId}`);
  },
};

// ─── Voice Call Component ────────────────────────────────────────────────────────
function VoiceCall({cu,conv,users,onEnd}){
  const [status,setStatus]=useState("connecting"); // connecting | active | ended
  const [muted,setMuted]=useState(false);
  const [speaking,setSpeaking]=useState({}); // userId -> bool
  const [remoteNames,setRemoteNames]=useState([]);
  const pcRefs=useRef({});   // peerId -> RTCPeerConnection
  const streamRef=useRef(null);
  const pollRef=useRef(null);
  const tsRef=useRef(Date.now()-500);
  const isHost=useRef(false);

  useEffect(()=>{start();return()=>cleanup();},[]);

  const cleanup=()=>{
    clearInterval(pollRef.current);
    Object.values(pcRefs.current).forEach(pc=>{try{pc.close();}catch{}});
    pcRefs.current={};
    if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
  };

  const start=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
      streamRef.current=stream;
      // Check if there's already a call active in this conv
      const existing=await sb.get("nova_signaling",`?conv_id=eq.${conv.id}&type=eq.call-offer&order=ts.desc&limit=1`);
      if(existing&&existing.length>0){
        // Join existing call as answerer
        await joinCall(existing[0]);
      } else {
        // Start new call as host
        isHost.current=true;
        await sig.send(conv.id,cu.id,"call-offer",{callerId:cu.id,callerName:cu.display_name,ts:Date.now()});
      }
      setStatus("active");
      // Poll for signaling messages
      pollRef.current=setInterval(()=>pollSignals(),1200);
    }catch(e){
      console.error("Voice error:",e);
      setStatus("ended");
    }
  };

  const createPC=async(peerId)=>{
    const pc=new RTCPeerConnection(ICE_SERVERS);
    pcRefs.current[peerId]=pc;
    // Add local tracks
    streamRef.current?.getTracks().forEach(t=>pc.addTrack(t,streamRef.current));
    // Play remote audio
    pc.ontrack=e=>{
      const audio=new Audio();
      audio.srcObject=e.streams[0];
      audio.autoplay=true;
      // Speaking detection
      const ctx=new AudioContext();
      const src=ctx.createMediaStreamSource(e.streams[0]);
      const analyser=ctx.createAnalyser();
      analyser.fftSize=512;
      src.connect(analyser);
      const check=()=>{
        const d=new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(d);
        const vol=d.reduce((a,b)=>a+b,0)/d.length;
        setSpeaking(prev=>({...prev,[peerId]:vol>15}));
        if(pcRefs.current[peerId])requestAnimationFrame(check);
      };
      check();
    };
    pc.onicecandidate=e=>{
      if(e.candidate)sig.send(conv.id,cu.id,"ice-candidate",{to:peerId,candidate:e.candidate});
    };
    return pc;
  };

  const joinCall=async(offerMsg)=>{
    const {callerId}=JSON.parse(offerMsg.data||"{}");
    if(callerId===cu.id)return;
    const pc=await createPC(callerId);
    // Send our join signal
    await sig.send(conv.id,cu.id,"call-join",{joinerId:cu.id,joinerName:cu.display_name});
    setRemoteNames(prev=>[...new Set([...prev,users.find(u=>u.id===callerId)?.display_name||"Someone"])]);
  };

  const pollSignals=async()=>{
    const msgs=await sig.poll(conv.id,tsRef.current,cu.id);
    if(!msgs.length)return;
    tsRef.current=Math.max(...msgs.map(m=>m.ts));
    for(const m of msgs){
      const data=JSON.parse(m.data||"{}");
      if(m.type==="call-join"&&isHost.current){
        // Host creates offer for new joiner
        const {joinerId,joinerName}=data;
        if(joinerId===cu.id)continue;
        setRemoteNames(prev=>[...new Set([...prev,joinerName||"Someone"])]);
        const pc=await createPC(joinerId);
        const offer=await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sig.send(conv.id,cu.id,"sdp-offer",{to:joinerId,sdp:offer});
      } else if(m.type==="sdp-offer"&&data.to===cu.id){
        const pc=pcRefs.current[m.from_id]||await createPC(m.from_id);
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer=await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sig.send(conv.id,cu.id,"sdp-answer",{to:m.from_id,sdp:answer});
        setRemoteNames(prev=>[...new Set([...prev,users.find(u=>u.id===m.from_id)?.display_name||"Someone"])]);
      } else if(m.type==="sdp-answer"&&data.to===cu.id){
        const pc=pcRefs.current[m.from_id];
        if(pc&&pc.signalingState!=="stable")await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } else if(m.type==="ice-candidate"&&data.to===cu.id){
        const pc=pcRefs.current[m.from_id];
        if(pc)try{await pc.addIceCandidate(new RTCIceCandidate(data.candidate));}catch{}
      } else if(m.type==="call-end"){
        endCall();
      }
    }
  };

  const endCall=async()=>{
    await sig.send(conv.id,cu.id,"call-end",{});
    await sig.clear(conv.id);
    cleanup();
    setStatus("ended");
    setTimeout(onEnd,800);
  };

  const toggleMute=()=>{
    const enabled=!muted;
    streamRef.current?.getAudioTracks().forEach(t=>t.enabled=enabled);
    setMuted(!muted);
  };

  if(status==="ended")return null;

  return(
    <div style={{position:"fixed",bottom:80,right:20,zIndex:500,background:"linear-gradient(135deg,#0c1220,#0f1929)",border:"1px solid rgba(34,197,94,.3)",borderRadius:16,padding:"14px 18px",minWidth:220,boxShadow:"0 8px 32px rgba(0,0,0,.6)"}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#22C55E",letterSpacing:".12em",marginBottom:10}}>
        {status==="connecting"?"⏳ CONNECTING...":"🔴 VOICE CALL · LIVE"}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:speaking[cu.id]?"#22C55E":"#334155",flexShrink:0}}/>
          <span style={{fontSize:12,color:"#E2E8F0",fontWeight:700}}>{cu.display_name} {muted?"🔇":""}</span>
        </div>
        {remoteNames.map((n,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:speaking[i]?"#22C55E":"#334155",flexShrink:0}}/>
            <span style={{fontSize:12,color:"#94A3B8"}}>{n}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={toggleMute} style={{flex:1,padding:"7px 0",borderRadius:10,border:`1px solid ${muted?"rgba(245,158,11,.4)":"rgba(255,255,255,.1)"}`,background:muted?"rgba(245,158,11,.15)":"rgba(255,255,255,.05)",cursor:"pointer",fontSize:13,color:muted?"#F59E0B":"#94A3B8"}}>
          {muted?"🔇 Unmute":"🎤 Mute"}
        </button>
        <button onClick={endCall} style={{flex:1,padding:"7px 0",borderRadius:10,border:"1px solid rgba(239,68,68,.4)",background:"rgba(239,68,68,.15)",cursor:"pointer",fontSize:13,color:"#EF4444"}}>
          📵 End
        </button>
      </div>
    </div>
  );
}

// ─── Watch Party Component ───────────────────────────────────────────────────────
// ─── Watch Party (Hyperbeam) ─────────────────────────────────────────────────────
// ─── GIF Picker (Tenor) with starred favorites ───────────────────────────────────
// Tenor anonymous key - works from any domain, no registration needed
const TENOR_KEY = "LIVDSRZULELA";

// Favorites stored in localStorage per user
const getFavGifs=()=>{try{return JSON.parse(localStorage.getItem("nova_fav_gifs")||"[]");}catch{return[];}};
const saveFavGifs=arr=>{try{localStorage.setItem("nova_fav_gifs",JSON.stringify(arr.slice(0,50)));}catch{}};

function GifPicker({onSelect,onClose}){
  const [tab,setTab]=useState("trending"); // trending | search | favorites
  const [query,setQuery]=useState("");
  const [gifs,setGifs]=useState([]);
  const [favs,setFavs]=useState(()=>getFavGifs());
  const [loading,setLoading]=useState(false);
  const searchRef=useRef(null);

  useEffect(()=>{
    if(tab==="trending")fetchTrending();
    else if(tab==="search"&&query.trim())doSearch(query);
    else if(tab==="search")fetchTrending();
  },[tab]);

  useEffect(()=>{ if(tab!=="favorites")searchRef.current?.focus(); },[tab]);

  // Parse Tenor v1 result into {id, url, preview, title}
  const parseTenor=results=>(results||[]).map(g=>{
    const med=g.media?.[0];
    const url=med?.gif?.url||med?.mediumgif?.url||med?.tinygif?.url||"";
    const preview=med?.tinygif?.url||med?.gif?.url||url;
    return{id:g.id,url,preview,title:g.title||""};
  }).filter(g=>g.url);

  const fetchTrending=async()=>{
    setLoading(true);
    try{
      const r=await fetch(`https://api.tenor.com/v1/trending?key=${TENOR_KEY}&limit=24&contentfilter=medium&media_filter=minimal`);
      const d=await r.json();
      setGifs(parseTenor(d.results));
    }catch(e){console.error("Tenor trending error",e);}
    setLoading(false);
  };

  const doSearch=async(q)=>{
    if(!q.trim()){fetchTrending();return;}
    setLoading(true);
    try{
      const r=await fetch(`https://api.tenor.com/v1/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=24&contentfilter=medium&media_filter=minimal`);
      const d=await r.json();
      setGifs(parseTenor(d.results));
    }catch(e){console.error("Tenor search error",e);}
    setLoading(false);
  };

  const toggleFav=(gif,e)=>{
    e.stopPropagation();
    const exists=favs.find(f=>f.id===gif.id);
    const next=exists?favs.filter(f=>f.id!==gif.id):[gif,...favs];
    setFavs(next);
    saveFavGifs(next);
  };

  const isFav=id=>favs.some(f=>f.id===id);

  const displayGifs=tab==="favorites"?favs:gifs;

  const tabStyle=(t)=>({
    padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",border:"none",
    background:tab===t?"rgba(0,212,255,.2)":"rgba(255,255,255,.05)",
    color:tab===t?"#00D4FF":"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".05em"
  });

  return(
    <div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.75)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:440,height:540,background:"#0c1220",border:"1px solid rgba(255,255,255,.12)",borderRadius:16,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.9)"}}>
        {/* Header */}
        <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:18}}>🎭</span>
          <input ref={searchRef} placeholder="Search GIFs..." value={query}
            onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"){setTab("search");doSearch(query);}}}
            style={{flex:1,padding:"7px 12px",borderRadius:20,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:"#E2E8F0",fontSize:13,outline:"none"}}/>
          <button onClick={()=>{setTab("search");doSearch(query);}} style={{background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",borderRadius:8,padding:"6px 12px",cursor:"pointer",color:"#00D4FF",fontSize:12}}>Go</button>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#475569",fontSize:20,lineHeight:1}}>✕</button>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",gap:6,padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,.05)",flexShrink:0}}>
          <button style={tabStyle("trending")} onClick={()=>setTab("trending")}>🔥 Trending</button>
          <button style={tabStyle("search")} onClick={()=>setTab("search")}>🔍 Search</button>
          <button style={tabStyle("favorites")} onClick={()=>setTab("favorites")}>⭐ Saved {favs.length>0&&`(${favs.length})`}</button>
        </div>
        {/* Grid */}
        <div style={{flex:1,overflowY:"auto",padding:10,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,alignContent:"start"}}>
          {loading&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:30,color:"#475569",fontSize:13}}>Loading GIFs...</div>}
          {!loading&&tab==="favorites"&&favs.length===0&&(
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:"30px 20px",color:"#334155"}}>
              <div style={{fontSize:28,marginBottom:8}}>⭐</div>
              <div style={{fontSize:12}}>Star GIFs to save them here</div>
            </div>
          )}
          {!loading&&tab!=="favorites"&&gifs.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:30,color:"#475569"}}>No GIFs found</div>}
          {!loading&&displayGifs.map(g=>(
            <div key={g.id} style={{position:"relative",cursor:"pointer",borderRadius:8,overflow:"hidden",aspectRatio:"1",background:"rgba(255,255,255,.04)",border:`1px solid ${isFav(g.id)?"rgba(245,158,11,.4)":"rgba(255,255,255,.06)"}`,transition:"border-color .15s"}}
              onClick={()=>{onSelect(g.url);onClose();}}>
              <img src={g.preview||g.url} alt={g.title} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
              {/* Star button */}
              <button onClick={e=>toggleFav(g,e)} style={{position:"absolute",top:4,right:4,background:"rgba(0,0,0,.6)",border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.opacity=1;e.currentTarget.parentElement.querySelector("button").style.opacity=1;}}
                className="gif-star">
                {isFav(g.id)?"⭐":"☆"}
              </button>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div style={{padding:"6px 12px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".05em"}}>POWERED BY TENOR</div>
          {favs.length>0&&tab==="favorites"&&<button onClick={()=>{setFavs([]);saveFavGifs([]);}} style={{fontSize:10,color:"#EF4444",background:"none",border:"none",cursor:"pointer"}}>Clear all</button>}
        </div>
      </div>
    </div>
  );
}

const HB_KEY = "sk_test_vUEKzTF26D0FfDCFTJZpUXGrQlpzs8P7ET95_q9CRyI";

async function createHBSession(){
  // Call our Vercel serverless proxy to avoid CORS
  const r = await fetch("/api/hyperbeam", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({action:"create"})
  });
  if(!r.ok){ const t=await r.text(); throw new Error(t); }
  return r.json();
}

function WatchParty({cu,conv,users,onEnd}){
  const [phase,setPhase]=useState("idle"); // idle | loading | active
  const [embedUrl,setEmbedUrl]=useState(null);
  const [sessionId,setSessionId]=useState(null);
  const [chatMsgs,setChatMsgs]=useState([]);
  const [chatInput,setChatInput]=useState("");
  const [members,setMembers]=useState([cu.display_name]);
  const [wpGifPicker,setWpGifPicker]=useState(false);
  const [err,setErr]=useState(null);
  const chatPollRef=useRef(null);
  const chatTsRef=useRef(Date.now()-500);
  const memberPollRef=useRef(null);
  const isHost=useRef(false);
  const hbContainerRef=useRef(null);
  const hbInstanceRef=useRef(null);

  // Load Hyperbeam SDK once
  useEffect(()=>{
    if(!document.getElementById("hb-sdk")){
      const s=document.createElement("script");
      s.id="hb-sdk";
      s.src="https://unpkg.com/@hyperbeam/web@0.1.29/dist/index.js";
      s.crossOrigin="anonymous";
      document.head.appendChild(s);
    }
  },[]);

  // When embedUrl arrives and phase goes active, init SDK
  useEffect(()=>{
    if(phase!=="active"||!embedUrl||!hbContainerRef.current)return;
    const init=async()=>{
      // Wait for SDK to load
      let tries=0;
      while(!window.Hyperbeam&&!window.HyperbeamEmbed&&tries<30){await new Promise(r=>setTimeout(r,200));tries++;}
      const HB=window.Hyperbeam||window.HyperbeamEmbed;
      if(!HB){
        // SDK failed — fallback to iframe
        hbContainerRef.current.innerHTML=`<iframe src="${embedUrl}" allow="microphone;camera;fullscreen;clipboard-read;clipboard-write;autoplay" style="width:100%;height:100%;border:none;background:#000;"></iframe>`;
        return;
      }
      try{
        if(hbInstanceRef.current)hbInstanceRef.current.destroy();
        const fn=typeof HB==="function"?HB:(HB.default||HB.Hyperbeam);
        hbInstanceRef.current=await fn(hbContainerRef.current,embedUrl);
      }catch(e){
        console.error("HB SDK init error",e);
        // Fallback to iframe on SDK error
        hbContainerRef.current.innerHTML=`<iframe src="${embedUrl}" allow="microphone;camera;fullscreen;clipboard-read;clipboard-write;autoplay" style="width:100%;height:100%;border:none;background:#000;"></iframe>`;
      }
    };
    init();
    return()=>{ if(hbInstanceRef.current){try{hbInstanceRef.current.destroy();}catch{}} hbInstanceRef.current=null; };
  },[phase,embedUrl]);

  useEffect(()=>{
    // Check if session already exists for this conv
    sb.get("nova_signaling",`?conv_id=eq.${conv.id}_hb&type=eq.hb-session&order=ts.desc&limit=1`).then(rows=>{
      if(rows&&rows.length>0){
        const d=JSON.parse(rows[0].data||"{}");
        if(d.embed_url){ setEmbedUrl(d.embed_url); setSessionId(d.session_id); setPhase("active"); }
      }
    });
    chatPollRef.current=setInterval(pollChat,2500);
    memberPollRef.current=setInterval(pollMembers,3000);
    return()=>{ clearInterval(chatPollRef.current); clearInterval(memberPollRef.current); };
  },[]);

  const pollChat=async()=>{
    const msgs=await sb.get("nova_signaling",`?conv_id=eq.${conv.id}_hbchat&ts=gt.${chatTsRef.current}&order=ts.asc`)||[];
    if(!msgs.length)return;
    chatTsRef.current=Math.max(...msgs.map(m=>m.ts));
    setChatMsgs(prev=>[...prev,...msgs.map(m=>({...JSON.parse(m.data||"{}"),id:m.id}))]);
  };

  const pollMembers=async()=>{
    const rows=await sb.get("nova_signaling",`?conv_id=eq.${conv.id}_hb&type=eq.hb-join&order=ts.asc`)||[];
    const names=[...new Set([cu.display_name,...rows.map(r=>JSON.parse(r.data||"{}").name||"?").filter(Boolean)])];
    setMembers(names);
  };

  const hostParty=async()=>{
    setPhase("loading"); setErr(null);
    try{
      const sess=await createHBSession();
      // Save session to signaling so others can join
      await sb.post("nova_signaling",{id:gid(),conv_id:conv.id+"_hb",from_id:cu.id,type:"hb-session",data:JSON.stringify({embed_url:sess.embed_url,session_id:sess.session_id}),ts:Date.now()});
      isHost.current=true;
      setEmbedUrl(sess.embed_url); setSessionId(sess.session_id); setPhase("active");
    }catch(e){ setErr("Failed to start: "+e.message); setPhase("idle"); }
  };

  const joinParty=async()=>{
    const rows=await sb.get("nova_signaling",`?conv_id=eq.${conv.id}_hb&type=eq.hb-session&order=ts.desc&limit=1`);
    if(!rows||!rows.length){ setErr("No active party found. Ask someone to host first."); return; }
    const d=JSON.parse(rows[0].data||"{}");
    if(!d.embed_url){ setErr("Session URL missing."); return; }
    await sb.post("nova_signaling",{id:gid(),conv_id:conv.id+"_hb",from_id:cu.id,type:"hb-join",data:JSON.stringify({name:cu.display_name}),ts:Date.now()});
    setEmbedUrl(d.embed_url); setSessionId(d.session_id); setPhase("active");
  };

  const endParty=async()=>{
    if(isHost.current&&sessionId){
      try{
        await fetch("/api/hyperbeam",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"delete",sessionId})});
      }catch{}
      await sb.del("nova_signaling",`?conv_id=eq.${conv.id}_hb`);
      await sb.del("nova_signaling",`?conv_id=eq.${conv.id}_hbchat`);
    }
    onEnd();
  };

  const sendGif=async(url)=>{
    const now=Date.now();
    const msgId=gid();
    const msg={name:cu.display_name,text:`__IMG__${url}`,ts:now};
    setChatMsgs(prev=>[...prev,{...msg,id:msgId}]); // optimistic
    chatTsRef.current=now; // bump so pollChat skips this message
    await sb.post("nova_signaling",{id:msgId,conv_id:conv.id+"_hbchat",from_id:cu.id,type:"hb-chat",data:JSON.stringify(msg),ts:now});
  };
  const sendChat=async()=>{
    if(!chatInput.trim())return;
    const now=Date.now();
    const msgId=gid();
    const msg={name:cu.display_name,text:chatInput.trim(),ts:now};
    setChatMsgs(prev=>[...prev,{...msg,id:msgId}]); // optimistic
    chatTsRef.current=now; // bump so pollChat skips this message
    setChatInput("");
    await sb.post("nova_signaling",{id:msgId,conv_id:conv.id+"_hbchat",from_id:cu.id,type:"hb-chat",data:JSON.stringify(msg),ts:now});
  };

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:"#000"}}>
      {/* Header */}
      <div style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",gap:10,background:"rgba(0,0,0,.4)",flexShrink:0}}>
        <span style={{fontSize:18}}>🎬</span>
        <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#E2E8F0",flex:1}}>WATCH PARTY</span>
        {phase==="active"&&(
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {members.slice(0,4).map((n,i)=>(
              <div key={i} style={{fontSize:10,color:"#22C55E",background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.3)",borderRadius:20,padding:"2px 8px"}}>
                {n===cu.display_name?"● You":n}
              </div>
            ))}
            {members.length>4&&<div style={{fontSize:10,color:"#475569"}}>+{members.length-4}</div>}
          </div>
        )}
        <button onClick={endParty} style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"4px 10px",cursor:"pointer",color:"#EF4444",fontSize:11,fontFamily:"'Orbitron',sans-serif"}}>
          {isHost.current?"END":"LEAVE"}
        </button>
      </div>

      {phase==="idle"&&(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,padding:24}}>
          <div style={{fontSize:52}}>🎬</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:700,color:"#E2E8F0"}}>Watch Party</div>
          <div style={{fontSize:13,color:"#64748B",textAlign:"center",maxWidth:320,lineHeight:1.7}}>
            Browse any website together in real-time — Netflix, ESPN+, YouTube, Twitch, anything. Everyone sees the same browser.
          </div>
          {err&&<div style={{fontSize:12,color:"#EF4444",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"8px 14px"}}>{err}</div>}
          <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
            <Btn onClick={hostParty}>🖥 Host Party</Btn>
            <Btn variant="ghost" onClick={joinParty}>👁 Join Party</Btn>
          </div>
          <div style={{fontSize:11,color:"#334155",textAlign:"center"}}>Host creates a shared virtual browser · Everyone can browse and control it together</div>
        </div>
      )}

      {phase==="loading"&&(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
          <div style={{fontSize:36}}>⏳</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:"#00D4FF"}}>STARTING SESSION...</div>
          <div style={{fontSize:11,color:"#475569"}}>Creating virtual browser, please wait</div>
        </div>
      )}

      {phase==="active"&&embedUrl&&(
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {/* Hyperbeam SDK container */}
          <div ref={hbContainerRef} style={{flex:1,background:"#000",minWidth:0}}/>
          {/* Party chat sidebar */}
          <div style={{width:220,flexShrink:0,display:"flex",flexDirection:"column",borderLeft:"1px solid rgba(255,255,255,.07)",background:"rgba(0,0,0,.4)"}}>
            <div style={{padding:"8px 12px",fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",borderBottom:"1px solid rgba(255,255,255,.05)",letterSpacing:".1em"}}>PARTY CHAT</div>
            <div style={{flex:1,overflowY:"auto",padding:"10px",display:"flex",flexDirection:"column",gap:7}}>
              {chatMsgs.length===0&&<div style={{fontSize:11,color:"#334155",textAlign:"center",padding:"20px 0"}}>Chat while you watch!</div>}
              {chatMsgs.map((m,i)=>{
                const isGif=m.text?.startsWith("__IMG__");
                return(
                  <div key={m.id||i}>
                    <span style={{color:m.name===cu.display_name?"#00D4FF":"#8B5CF6",fontWeight:700,fontSize:10}}>{m.name}</span>
                    {isGif
                      ?<img src={m.text.slice(7)} style={{display:"block",maxWidth:"100%",borderRadius:6,marginTop:3}} loading="lazy"/>
                      :<span style={{fontSize:12,color:"#94A3B8"}}> {m.text}</span>
                    }
                  </div>
                );
              })}
            </div>
            {wpGifPicker&&<GifPicker onSelect={url=>{sendGif(url);setWpGifPicker(false);}} onClose={()=>setWpGifPicker(false)}/>}
            <div style={{padding:"8px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:4,flexDirection:"column"}}>
              <div style={{display:"flex",gap:4}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendChat();}} placeholder="Say something..." style={{flex:1,fontSize:11,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",outline:"none"}}/>
                <button onClick={()=>setWpGifPicker(true)} style={{background:"rgba(139,92,246,.15)",border:"1px solid rgba(139,92,246,.3)",borderRadius:6,padding:"6px 8px",cursor:"pointer",color:"#A78BFA",fontSize:10,fontWeight:700}}>GIF</button>
                <button onClick={sendChat} style={{background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#00D4FF",fontSize:14}}>→</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessagesPage({cu,users,conversations,setConversations,messages,setMessages}){
  const mob=useIsMobile();
  const [activeConv,setActiveConv]=useState(null);
  const [newMsg,setNewMsg]=useState("");
  const [showNew,setShowNew]=useState(false);
  const [search,setSearch]=useState("");
  const [groupName,setGroupName]=useState("");
  const [selectedUsers,setSelectedUsers]=useState([]);
  const [isGroup,setIsGroup]=useState(false);
  const msgEndRef=useRef(null);
  const pollRef=useRef(null);
  const groupAvatarRef=useRef(null);
  const dmImgRef=useRef(null);
  const [dmUploading,setDmUploading]=useState(false);
  const [inCall,setInCall]=useState(false);
  const [inWatchParty,setInWatchParty]=useState(false);

  const sendImage=async(file)=>{
    if(!file||!activeConv||!cu)return;
    setDmUploading(true);
    const ext=file.name.split(".").pop();
    const path=`dm-${gid()}.${ext}`;
    const url=await sbUp("nova-banners",path,file);
    if(url){
      const m={id:gid(),conv_id:activeConv.id,author_id:cu.id,author_name:cu.display_name,author_avatar:cu.avatar,author_avatar_url:cu.avatar_url||"",text:`__IMG__${url}`,ts:Date.now()};
      setMessages(prev=>[...prev,m]);
      await sb.post("nova_messages",m);
      await sb.patch("nova_conversations",`?id=eq.${activeConv.id}`,{last_msg:"📷 Photo",last_ts:Date.now(),last_sender:cu.display_name});
      setConversations(prev=>prev.map(c=>c.id===activeConv.id?{...c,last_msg:"📷 Photo",last_ts:Date.now()}:c));
    }
    setDmUploading(false);
  };

  const uploadGroupAvatar=async(convId,file)=>{
    if(!file)return;
    const ext=file.name.split(".").pop();
    const path=`group-${convId}.${ext}`;
    const url=await sbUp("nova-banners",path,file);
    if(url){
      await sb.patch("nova_conversations",`?id=eq.${convId}`,{avatar_url:url});
      setConversations(prev=>prev.map(c=>c.id===convId?{...c,avatar_url:url}:c));
      if(activeConv?.id===convId)setActiveConv(prev=>({...prev,avatar_url:url}));
    }
  };

  const myConvs=conversations.filter(c=>c.members.includes(cu?.id||"")).sort((a,b)=>(b.last_ts||0)-(a.last_ts||0));
  const convMsgs=activeConv?messages.filter(m=>m.conv_id===activeConv.id).sort((a,b)=>a.ts-b.ts):[];
  const showList=!mob||!activeConv;
  const showChat=!mob||!!activeConv;

  useEffect(()=>{ msgEndRef.current?.scrollIntoView({behavior:"smooth"}); },[convMsgs.length]);

  useEffect(()=>{
    if(!activeConv)return;
    const poll=async()=>{
      const data=await sb.get("nova_messages",`?conv_id=eq.${activeConv.id}&order=ts.asc`);
      if(data)setMessages(prev=>[...prev.filter(m=>m.conv_id!==activeConv.id),...data]);
    };
    poll(); pollRef.current=setInterval(poll,3000); return()=>clearInterval(pollRef.current);
  },[activeConv?.id]);

  useEffect(()=>{
    if(!cu)return;
    const t=setInterval(async()=>{
      const data=await sb.get("nova_conversations",`?members=cs.{${cu.id}}`);
      if(data)setConversations(data);
    },5000);
    return()=>clearInterval(t);
  },[cu?.id]);

  const sendMsg=async()=>{
    const text=newMsg.trim(); if(!text||!activeConv||!cu)return;
    const m={id:gid(),conv_id:activeConv.id,author_id:cu.id,author_name:cu.display_name,author_avatar:cu.avatar,author_avatar_url:cu.avatar_url||"",text,ts:Date.now()};
    setNewMsg(""); setMessages(prev=>[...prev,m]);
    await sb.post("nova_messages",m);
    await sb.patch("nova_conversations",`?id=eq.${activeConv.id}`,{last_msg:text,last_ts:Date.now(),last_sender:cu.display_name});
    setConversations(prev=>prev.map(c=>c.id===activeConv.id?{...c,last_msg:text,last_ts:Date.now()}:c));
  };

  const createConv=async()=>{
    if(!selectedUsers.length||!cu)return;
    const members=[cu.id,...selectedUsers];
    if(members.length>50){alert("Max 50 members");return;}
    const isGrp=members.length>2||isGroup;
    const conv={id:gid(),members,is_group:isGrp,name:isGrp?(groupName||"Group Chat"):null,created_by:cu.id,created_at:Date.now(),last_msg:"",last_ts:Date.now(),last_sender:""};
    const res=await sb.post("nova_conversations",conv);
    if(res){ const newC=Array.isArray(res)?res[0]:res; setConversations(prev=>[newC,...prev]); setActiveConv(newC); }
    setShowNew(false); setSelectedUsers([]); setGroupName(""); setIsGroup(false);
  };

  const getConvName=conv=>{ if(conv.is_group)return conv.name||"Group Chat"; const other=users.find(u=>u.id===conv.members.find(id=>id!==cu?.id)); return other?.display_name||"Unknown"; };
  const getConvAvatar=conv=>users.find(u=>u.id===conv.members.find(id=>id!==cu?.id));

  if(!cu)return (
    <div style={{maxWidth:600,margin:"60px auto",textAlign:"center",padding:40}}>
      <div style={{fontSize:48,marginBottom:16}}>💬</div>
      <div style={{fontFamily:"'Orbitron',sans-serif",color:"#475569"}}>Sign in to use messages</div>
    </div>
  );

  return (
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"0":"24px 16px 60px",height:mob?"calc(100vh - 120px)":"calc(100vh - 62px)",display:"flex",gap:16,overflow:"hidden"}}>

      {showList&&(
        <div style={{width:mob?"100%":280,flexShrink:0,display:"flex",flexDirection:"column",gap:10,padding:mob?"12px 12px 0":0,overflowY:"auto"}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{flex:1,fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:"#E2E8F0"}}>Messages</div>
            <Btn variant="ghost" size="sm" onClick={()=>setShowNew(true)}>＋ New</Btn>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search..."/>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
            {myConvs.filter(c=>getConvName(c).toLowerCase().includes(search.toLowerCase())).map(c=>{
              const isActive=activeConv?.id===c.id;
              return (
                <div key={c.id} onClick={()=>setActiveConv(c)} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",borderRadius:12,background:isActive?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",border:`1px solid ${isActive?"rgba(0,212,255,.3)":"rgba(255,255,255,.07)"}`,cursor:"pointer",transition:"all .18s"}}>
                  {c.is_group
                    ? <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,background:"linear-gradient(135deg,#00D4FF22,#8B5CF622)",border:"1px solid rgba(0,212,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,overflow:"hidden"}}>{c.avatar_url?<img src={c.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"👥"}</div>
                    : <AvatarCircle user={getConvAvatar(c)} size={40}/>
                  }
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:isActive?"#00D4FF":"#E2E8F0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{getConvName(c)}</div>
                    <div style={{fontSize:11,color:"#475569",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.last_msg||"No messages yet"}</div>
                    {c.is_group&&<div style={{fontSize:10,color:"#334155"}}>{c.members.length} members</div>}
                  </div>
                </div>
              );
            })}
            {myConvs.length===0&&(
              <div style={{textAlign:"center",padding:"40px 20px",color:"#334155"}}>
                <div style={{fontSize:32,marginBottom:8}}>💬</div>
                <div style={{fontSize:13}}>No conversations yet</div>
                <div style={{fontSize:11,marginTop:6}}>Hit + New to start one</div>
              </div>
            )}
          </div>
        </div>
      )}

      {showChat&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",background:"rgba(255,255,255,.02)",border:mob?"none":"1px solid rgba(255,255,255,.07)",borderRadius:mob?0:16,overflow:"hidden"}}>
          {activeConv ? (
            <>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",gap:10,background:"rgba(0,0,0,.2)",flexShrink:0}}>
                {mob&&<button onClick={()=>setActiveConv(null)} style={{background:"none",border:"none",color:"#00D4FF",cursor:"pointer",fontSize:24,lineHeight:1,padding:"0 4px 0 0"}}>‹</button>}
                {activeConv.is_group
                  ? <div style={{position:"relative",flexShrink:0}}>
                      <input type="file" ref={groupAvatarRef} accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)uploadGroupAvatar(activeConv.id,f);e.target.value="";}}/>
                      <div onClick={()=>groupAvatarRef.current.click()} style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#00D4FF22,#8B5CF622)",border:"1px solid rgba(0,212,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,cursor:"pointer",overflow:"hidden",position:"relative"}} title="Change group photo">
                        {activeConv.avatar_url?<img src={activeConv.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"👥"}
                        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}><span style={{fontSize:14}}>📷</span></div>
                      </div>
                    </div>
                  : <AvatarCircle user={getConvAvatar(activeConv)} size={36}/>
                }
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:"#E2E8F0"}}>{getConvName(activeConv)}</div>
                  {activeConv.is_group&&<div style={{fontSize:11,color:"#475569"}}>{activeConv.members.length} members · max 50</div>}
                </div>
                {/* Voice call button */}
                <button onClick={()=>{setInWatchParty(false);setInCall(v=>!v);}} title="Voice Call" style={{background:inCall?"rgba(34,197,94,.2)":"rgba(255,255,255,.05)",border:`1px solid ${inCall?"rgba(34,197,94,.4)":"rgba(255,255,255,.1)"}`,borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:inCall?"#22C55E":"#94A3B8"}}>📞</button>
                {/* Watch party button */}
                <button onClick={()=>{setInCall(false);setInWatchParty(v=>!v);}} title="Watch Party" style={{background:inWatchParty?"rgba(139,92,246,.2)":"rgba(255,255,255,.05)",border:`1px solid ${inWatchParty?"rgba(139,92,246,.4)":"rgba(255,255,255,.1)"}`,borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:inWatchParty?"#8B5CF6":"#94A3B8"}}>🎬</button>
              </div>
              {/* Voice Call panel */}
              {inCall&&cu&&activeConv&&(
                <div style={{borderBottom:"1px solid rgba(34,197,94,.2)",flexShrink:0}}>
                  <VoiceCall cu={cu} conv={activeConv} users={users} onEnd={()=>setInCall(false)}/>
                </div>
              )}
              {/* Watch Party — rendered as fullscreen modal below */}
              <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:8}}>
                {convMsgs.length===0&&(
                  <div style={{textAlign:"center",padding:"60px 20px",color:"#334155"}}>
                    <div style={{fontSize:32,marginBottom:8}}>👋</div>
                    <div style={{fontSize:13}}>Say something!</div>
                  </div>
                )}
                {convMsgs.map((m,i)=>{
                  const isMe=m.author_id===cu.id;
                  const prev=convMsgs[i-1];
                  const showAv=!isMe&&(!prev||prev.author_id!==m.author_id);
                  const author=users.find(u=>u.id===m.author_id);
                  return (
                    <div key={m.id} className="msg-in" style={{display:"flex",flexDirection:isMe?"row-reverse":"row",gap:8,alignItems:"flex-end"}}>
                      {!isMe&&<div style={{width:28,flexShrink:0}}>{showAv&&<AvatarCircle user={author} size={28}/>}</div>}
                      <div style={{maxWidth:"75%"}}>
                        {showAv&&!isMe&&<div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:3,marginLeft:4}}>{m.author_name}</div>}
                        <div style={{background:isMe?"linear-gradient(135deg,#00D4FF22,#8B5CF622)":"rgba(255,255,255,.06)",border:`1px solid ${isMe?"rgba(0,212,255,.25)":"rgba(255,255,255,.08)"}`,borderRadius:isMe?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:m.text.startsWith("__IMG__")?"4px":"9px 14px",fontSize:14,color:"#E2E8F0",lineHeight:1.5,wordBreak:"break-word",overflow:"hidden"}}>
                          {m.text.startsWith("__IMG__")
                            ?<img src={m.text.slice(7)} style={{maxWidth:240,maxHeight:300,borderRadius:12,display:"block",objectFit:"contain"}} onClick={()=>window.open(m.text.slice(7),"_blank")} />
                            :m.text
                          }
                        </div>
                        <div style={{fontSize:10,color:"#334155",marginTop:3,textAlign:isMe?"right":"left",paddingLeft:4,paddingRight:4}}>{fmtMsg(m.ts)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={msgEndRef}/>
              </div>
              <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:8,flexShrink:0,alignItems:"center"}}>
                <input type="file" ref={dmImgRef} accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)sendImage(f);e.target.value="";}}/>
                <button onClick={()=>dmImgRef.current.click()} disabled={dmUploading} title="Send photo" style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{dmUploading?"⏳":"📷"}</button>
                <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="Type a message..." onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}} style={{flex:1,borderRadius:24,padding:"10px 18px"}}/>
                <Btn onClick={sendMsg} disabled={!newMsg.trim()}>Send ➤</Btn>
              </div>
            </>
          ) : (
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,color:"#334155"}}>
              <div style={{fontSize:48}}>💬</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13}}>Select a conversation</div>
              <Btn variant="ghost" size="sm" onClick={()=>setShowNew(true)}>＋ Start New Chat</Btn>
            </div>
          )}
        </div>
      )}

      {/* Watch Party fullscreen modal */}
      {inWatchParty&&cu&&activeConv&&(
        <div style={{position:"fixed",inset:0,zIndex:400,background:"rgba(3,7,18,.97)",display:"flex",flexDirection:"column"}}>
          <WatchParty cu={cu} conv={activeConv} users={users} onEnd={()=>setInWatchParty(false)}/>
        </div>
      )}

      {showNew&&(
        <Modal title="💬 New Conversation" onClose={()=>{setShowNew(false);setSelectedUsers([]);setGroupName("");setIsGroup(false);}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setIsGroup(false)} style={{flex:1,padding:"8px 0",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${!isGroup?"#00D4FF":"rgba(255,255,255,.09)"}`,background:!isGroup?"rgba(0,212,255,.11)":"rgba(255,255,255,.04)",color:!isGroup?"#00D4FF":"#94A3B8"}}>💬 Direct Message</button>
              <button onClick={()=>setIsGroup(true)} style={{flex:1,padding:"8px 0",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${isGroup?"#00D4FF":"rgba(255,255,255,.09)"}`,background:isGroup?"rgba(0,212,255,.11)":"rgba(255,255,255,.04)",color:isGroup?"#00D4FF":"#94A3B8"}}>👥 Group Chat</button>
            </div>
            {isGroup&&<div><Lbl>Group Name</Lbl><input value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="Squad name..."/></div>}
            <div>
              <Lbl>Select Members {selectedUsers.length>0&&`(${selectedUsers.length} selected)`}</Lbl>
              <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:260,overflowY:"auto"}}>
                {users.filter(u=>u.id!==cu.id).map(u=>{
                  const sel=selectedUsers.includes(u.id);
                  return (
                    <div key={u.id} onClick={()=>setSelectedUsers(prev=>sel?prev.filter(x=>x!==u.id):[...prev,u.id])} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:sel?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",border:`1px solid ${sel?"rgba(0,212,255,.3)":"rgba(255,255,255,.07)"}`,cursor:"pointer",transition:"all .15s"}}>
                      <AvatarCircle user={u} size={34}/>
                      <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{u.display_name}</div><div style={{fontSize:11,color:"#475569"}}>@{u.username}</div></div>
                      <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${sel?"#00D4FF":"rgba(255,255,255,.2)"}`,background:sel?"#00D4FF":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"white"}}>{sel?"✓":""}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <Btn variant="muted" onClick={()=>setShowNew(false)}>Cancel</Btn>
              <Btn onClick={createConv} disabled={!selectedUsers.length}>{isGroup?"Create Group":"Start Chat"}</Btn>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

// ─── Profile ───────────────────────────────────────────────────────────────────
function ProfilePage({userId,cu,users,setUsers,navigate,addNotif,navOpts={}}){
  const mob=useIsMobile();
  const u=users.find(x=>x.id===userId);
  const isMe=cu?.id===userId;
  const isOwner=cu?.is_owner;
  const[showFL,setShowFL]=useState(null);
  const[editModal,setEditModal]=useState(null);
  const[showAddClip,setShowAddClip]=useState(false);
  const[showAddSocial,setShowAddSocial]=useState(false);
  const[commentText,setCommentText]=useState("");
  const[comments,setComments]=useState([]);
  const[showTeamPicker,setShowTeamPicker]=useState(null);
  const[replyTo,setReplyTo]=useState(null); // {id, author_name, author_id}
  const[profileTab,setProfileTab]=useState("posts"); // posts | activity
  const[pinnedCards,setPinnedCards]=useState([]);
  const[pinnedPlays,setPinnedPlays]=useState([]);
  const commentsSectionRef=useRef(null);
  useEffect(()=>{
    if(navOpts.scrollToComments){
      setProfileTab("posts");
      setTimeout(()=>commentsSectionRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),400);
    }
  },[navOpts]);
  const[userActivity,setUserActivity]=useState([]); // comments made by this user elsewhere
  const[activityLoading,setActivityLoading]=useState(false);
  const[showGifPicker,setShowGifPicker]=useState(false);

  useEffect(()=>{
    if(!u)return;
    loadComments();
    // Load pinned cards
    sb.get("nova_user_cards",`?user_id=eq.${userId}&pinned=eq.true&order=pin_order.asc`).then(rows=>{
      if(!rows?.length){setPinnedCards([]);return;}
      // Fix any old ESPN headshot URLs
      setPinnedCards(rows.map(card=>{
        if(card.card_type==="player"&&card.player_id&&(!card.headshot_url||card.headshot_url.includes("espncdn")))
          return{...card,headshot_url:mlbPlayerHeadshot(card.player_id)};
        if(card.card_type==="team"&&card.card_def_id&&(!card.headshot_url||card.headshot_url.includes("espncdn")))
          return{...card,headshot_url:mlbTeamLogo(card.card_def_id.replace("mlb_team_",""))};
        return card;
      }));
    });
    // Load pinned plays
    sb.get("nova_user_plays",`?user_id=eq.${userId}&pinned=eq.true&order=acquired_at.desc`).then(rows=>{
      setPinnedPlays(rows||[]);
    });
  },[userId]);
  useEffect(()=>{
    if(profileTab==="activity"&&userActivity.length===0){
      setActivityLoading(true);
      sb.get("nova_comments",`?author_id=eq.${userId}&order=timestamp.desc&limit=80`)
        .then(rows=>{setUserActivity(rows||[]);setActivityLoading(false);});
    }
  },[profileTab,userId]);
  const loadComments=async()=>{
    const data=await sb.get("nova_comments",`?profile_user_id=eq.${userId}&order=timestamp.desc`);
    if(data)setComments(data);
  };

  if(!u)return <div style={{padding:"100px 20px",textAlign:"center",color:"#334155"}}>User not found</div>;

  const accent=u.page_accent||"#00D4FF";
  const isFollowing=cu&&(cu.following||[]).includes(u.id);
  const following=async()=>{
    if(!cu||isMe)return;
    const myFollowing=cu.following||[];const theirFollowers=u.followers||[];
    const nowF=isFollowing;
    const newMF=nowF?myFollowing.filter(x=>x!==u.id):[...myFollowing,u.id];
    const newTF=nowF?theirFollowers.filter(x=>x!==cu.id):[...theirFollowers,cu.id];
    await sb.patch("nova_users",`?id=eq.${cu.id}`,{following:newMF});
    await sb.patch("nova_users",`?id=eq.${u.id}`,{followers:newTF});
    setUsers(prev=>prev.map(x=>x.id===cu.id?{...x,following:newMF}:x.id===u.id?{...x,followers:newTF}:x));
    if(!nowF)addNotif(u.id,cu.id,"followed you");
  };
  const patchUser=async patch=>{
    await sb.patch("nova_users",`?id=eq.${u.id}`,patch);
    setUsers(prev=>prev.map(x=>x.id===u.id?{...x,...patch}:x));
  };
  const submitComment=async(imgUrl="")=>{
    if(!commentText.trim()&&!imgUrl||!cu)return;
    const text=imgUrl?`__IMG__${imgUrl}`:commentText.trim();
    const c={id:gid(),profile_user_id:u.id,author_id:cu.id,author_name:cu.display_name,author_avatar:cu.avatar,author_avatar_url:cu.avatar_url||"",text,timestamp:Date.now(),reply_to:replyTo?.id||null,reply_to_name:replyTo?.author_name||null,likes:[]};
    await sb.post("nova_comments",c);
    setComments(prev=>[c,...prev]);
    setCommentText("");
    setReplyTo(null);
    if(!isMe)addNotif(u.id,cu.id,"commented on your profile");
    // notify person being replied to
    if(replyTo&&replyTo.author_id&&replyTo.author_id!==cu.id&&replyTo.author_id!==u.id){
      addNotif(replyTo.author_id,cu.id,`replied to your comment: "${text.slice(0,50)}"`);
    }
  };
  const deleteComment=async(cid)=>{
    await sb.del("nova_comments",`?id=eq.${cid}`);
    setComments(prev=>prev.filter(c=>c.id!==cid));
  };
  const addClip=async(clip)=>{
    const clips=[...(u.page_clips||[]),clip];
    await patchUser({page_clips:clips});
    setShowAddClip(false);
  };
  const deleteClip=async(cid)=>{
    const clips=(u.page_clips||[]).filter(c=>c.id!==cid);
    await patchUser({page_clips:clips});
  };
  const addSocial=async(entry)=>{
    const s=[...(u.page_social||[]),entry];
    await patchUser({page_social:s});
    setShowAddSocial(false);
  };
  const deleteSocial=async(sid)=>{
    const s=(u.page_social||[]).filter(x=>x.id!==sid);
    await patchUser({page_social:s});
  };
  const handleBannerUpload=async(f,slot)=>{
    const url=await sb.uploadBanner(u.id,f,slot);
    if(url)await patchUser({[`banner_${slot}_url`]:url});
  };

  const likes={};
  const bannerSlots=["top","left","right"];
  const hasSideBanners=(u.banner_left_url||u.banner_right_url);

  // Support up to 4 tracks — page_music is now an array; handle legacy single-object
  const musicTracks=(()=>{
    const pm=u.page_music;
    if(!pm)return[];
    if(Array.isArray(pm))return pm.filter(t=>t?.url);
    if(pm.url)return[pm]; // legacy single
    return[];
  })();
  const dobAge=u.dob?Math.floor((Date.now()-new Date(u.dob))/(1000*60*60*24*365.25)):null;

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"0 0 80px":"24px 20px 80px"}}>
      {showFL&&<FLModal type={showFL} user={u} users={users} navigate={navigate} onClose={()=>setShowFL(null)}/>}

      {/* Header */}
      <Card style={{padding:0,overflow:"hidden",marginBottom:20}}>
        {u.banner_top_url
          ?<div style={{height:mob?100:140,background:`url(${u.banner_top_url}) center/cover`,position:"relative"}}>
            {(isMe||isOwner)&&<div style={{position:"absolute",top:8,right:8}}><BannerBtn label="📷 Top" onUpload={f=>handleBannerUpload(f,"top")}/></div>}
          </div>
          :<div style={{height:mob?80:120,background:`linear-gradient(135deg,${accent}22,rgba(139,92,246,.15),rgba(0,0,0,.3))`,position:"relative"}}>
            {(isMe||isOwner)&&<div style={{position:"absolute",top:8,right:8}}><BannerBtn label="📷 Top Banner" onUpload={f=>handleBannerUpload(f,"top")}/></div>}
          </div>
        }
        <div style={{padding:mob?"16px 14px 16px":"20px 24px 20px",display:"flex",gap:mob?10:16,alignItems:"flex-start",flexWrap:mob?"wrap":"nowrap"}}>
          <div style={{position:"relative",flexShrink:0,marginTop:-30}}>
            <div style={{width:mob?64:82,height:mob?64:82,borderRadius:"50%",background:`radial-gradient(circle,${accent}55,rgba(0,0,0,.7))`,border:`3px solid ${accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:mob?28:38,overflow:"hidden",boxShadow:`0 0 28px ${accent}44`}}>
              {u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}
            </div>
            <StatusDot type={u.status_type||"offline"} size={mob?12:14} style={{position:"absolute",bottom:2,right:2}}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",marginBottom:5}}>
              <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:21,fontWeight:700,color:"#E2E8F0"}}>{u.display_name}</h1>
              {u.is_owner&&<RoleBadge color="#F59E0B">Owner</RoleBadge>}
              {u.staff_role&&!u.is_owner&&<RoleBadge color={ROLE_COLOR[u.staff_role]||"#00D4FF"}>{u.staff_role}</RoleBadge>}
              {dobAge!==null&&<span style={{fontSize:11,color:"#334155"}}>Age {dobAge}</span>}
            </div>
            <div style={{fontSize:12,color:"#334155",marginBottom:8}}>@{u.username} · Joined {u.joined||"Nova"}</div>
            {u.bio&&<p style={{color:"#94A3B8",fontSize:14,lineHeight:1.6,marginBottom:8}}>{u.bio}</p>}
            {(u.mlb_team||u.nfl_team||u.nba_team||u.nhl_team)&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>{u.mlb_team&&<TeamBadge teamId={u.mlb_team}/>}{u.nfl_team&&<TeamBadge teamId={u.nfl_team}/>}{u.nba_team&&<TeamBadge teamId={u.nba_team}/>}{u.nhl_team&&<TeamBadge teamId={u.nhl_team}/>}</div>}
            <SocialLinks user={u}/>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center",marginTop:10}}>
              <button onClick={()=>setShowFL("followers")} style={{background:"none",border:"none",cursor:"pointer",color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:10}}><span style={{fontSize:14,fontWeight:900}}>{(u.followers||[]).length}</span> followers</button>
              <button onClick={()=>setShowFL("following")} style={{background:"none",border:"none",cursor:"pointer",color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:10}}><span style={{fontSize:14,fontWeight:900}}>{(u.following||[]).length}</span> following</button>
              {cu&&!isMe&&<Btn variant={isFollowing?"unfollow":"follow"} size="sm" onClick={following}>{isFollowing?"Unfollow":"Follow"}</Btn>}
              {(isMe||isOwner)&&<Btn variant="ghost" size="sm" onClick={()=>setEditModal("profile")}>✏️ Edit</Btn>}
              {(isMe||isOwner)&&<Btn variant="ghost" size="sm" onClick={()=>setEditModal("team")}>⚽ Teams</Btn>}
              {(isMe||isOwner)&&<Btn variant="ghost" size="sm" onClick={()=>setEditModal("socials")}>🔗 Socials</Btn>}
            </div>
          </div>
        </div>
      </Card>

      {/* Badges */}
      {(u.badges||[]).length>0&&(
        <div style={{marginBottom:20,display:"flex",gap:10,flexWrap:"wrap"}}>
          {(u.badges||[]).map((bid,i)=>{const b=BADGES.find(x=>x.id===bid);if(!b)return null;return(
            <div key={bid} className="badge-pop" style={{animationDelay:`${i*.06}s`,display:"flex",alignItems:"center",gap:7,padding:"5px 12px",borderRadius:20,background:b.color+"14",border:`1.5px solid ${b.color}44`}} title={b.desc}>
              <span style={{fontSize:16}}>{b.icon}</span>
              <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".04em",color:b.color}}>{b.label}</span>
            </div>
          );})}
        </div>
      )}

      {/* Side banners + content */}
      <div style={{display:"flex",gap:16}}>
        {!mob&&hasSideBanners&&(
          <div style={{width:160,flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
            {u.banner_left_url
              ?<div style={{position:"relative"}}><img src={u.banner_left_url} style={{width:160,borderRadius:12,objectFit:"cover",maxHeight:560}}/>{(isMe||isOwner)&&<XBtn onClick={()=>patchUser({banner_left_url:""})} style={{position:"absolute",top:4,right:4}}/>}</div>
              :(isMe||isOwner)&&<BannerBtn label="+ Left" onUpload={f=>handleBannerUpload(f,"left")}/>
            }
          </div>
        )}
        <div style={{flex:1,minWidth:0}}>
          {/* Music */}
          {/* Music tracks (up to 4) */}
          {(musicTracks.length>0||(isMe||isOwner))&&(
            <Card style={{padding:16,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:musicTracks.length>0?10:0}}>
                <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".15em"}}>🎵 VIBING TO</div>
                {(isMe||isOwner)&&musicTracks.length<4&&<Btn variant="ghost" size="sm" onClick={()=>setEditModal("music")}>+ Add Track</Btn>}
              </div>
              {musicTracks.length===0&&(isMe||isOwner)&&(
                <div style={{textAlign:"center",padding:"10px 0"}}><Btn variant="ghost" size="sm" onClick={()=>setEditModal("music")}>🎵 Add Music</Btn></div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {musicTracks.map((track,ti)=>{
                  const tid=track.type==="spotify"?extractSpotify(track.url||""):extractYT(track.url||"");
                  if(!tid)return null;
                  return(
                    <div key={ti} style={{position:"relative"}}>
                      {track.type==="spotify"
                        ?<iframe src={`https://open.spotify.com/embed/track/${tid}?utm_source=generator&theme=0`} width="100%" height="80" frameBorder="0" allow="autoplay;clipboard-write;encrypted-media;fullscreen;picture-in-picture" style={{borderRadius:8,display:"block"}}/>
                        :<iframe src={`https://www.youtube.com/embed/${tid}`} width="100%" height="120" frameBorder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{borderRadius:8,display:"block"}}/>
                      }
                      {(isMe||isOwner)&&<button onClick={()=>{const nt=musicTracks.filter((_,i)=>i!==ti);patchUser({page_music:nt});}} style={{position:"absolute",top:4,right:4,background:"rgba(0,0,0,.6)",border:"1px solid rgba(255,255,255,.2)",borderRadius:6,color:"#94A3B8",fontSize:11,cursor:"pointer",padding:"2px 7px"}}>✕</button>}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Clips */}
          <Sec title="🎬 Clips" onAdd={isMe||isOwner?()=>setShowAddClip(true):null}>
            <ClipCarousel clips={u.page_clips||[]} canEdit={isMe||isOwner} onDelete={deleteClip} emptyIcon="🎬" emptyMsg="No clips yet" cu={cu} likes={likes} onLike={()=>{}}/>
          </Sec>

          {/* Pinned Cards */}
          {(pinnedCards.length>0||pinnedPlays.length>0)&&(
            <Sec title="⭐ Nova Cards">
              {pinnedCards.length>0&&(
                <div style={{marginBottom:pinnedPlays.length>0?18:0}}>
                  <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:10}}>CARDS · {pinnedCards.length}</div>
                  <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
                    {pinnedCards.map(card=>(
                      <div key={card.id} style={{flexShrink:0}}>
                        <CardDisplay
                          type={card.card_type}
                          name={card.card_name}
                          headshot={card.custom_headshot||card.headshot_url}
                          totalRating={card.total_play_rating||0}
                          customName={card.custom_name||undefined}
                          customBorder={card.custom_border||undefined}
                          customBg={card.custom_bg||undefined}
                          customEffect={card.custom_effect||undefined}
                          size="md"
                          serial={card.serial}
                          pinned
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pinnedPlays.length>0&&(
                <div>
                  <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:10}}>PLAYS · {pinnedPlays.length}</div>
                  <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8}}>
                    {pinnedPlays.map(p=>{
                      const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;
                      return <div key={p.id} style={{flexShrink:0}}><PlayCard play={pd} size="md"/></div>;
                    })}
                  </div>
                </div>
              )}
            </Sec>
          )}

          {/* Social clips */}
          {((u.page_social||[]).length>0||(isMe||isOwner))&&(
            <Sec title="📱 Social Clips" onAdd={isMe||isOwner?()=>setShowAddSocial(true):null}>
              <ClipCarousel clips={u.page_social||[]} canEdit={isMe||isOwner} onDelete={deleteSocial} emptyIcon="📱" emptyMsg="No social clips"/>
            </Sec>
          )}

          {/* Comments with likes + replies + activity tab */}
          <div ref={commentsSectionRef}/>
          <Sec title="💬 Comments">
            {/* Tabs */}
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {[["posts","💬 Comments"],["activity","📋 Activity"]].map(([t,l])=>(
                <button key={t} onClick={()=>setProfileTab(t)} style={{padding:"5px 14px",borderRadius:20,cursor:"pointer",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${profileTab===t?"rgba(0,212,255,.4)":"rgba(255,255,255,.1)"}`,background:profileTab===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",color:profileTab===t?"#00D4FF":"#64748B"}}>{l}</button>
              ))}
            </div>

            {profileTab==="activity"?(
              <div>
                {activityLoading&&<div style={{textAlign:"center",padding:30,color:"#334155"}}>Loading activity...</div>}
                {!activityLoading&&userActivity.length===0&&<Empty icon="📋" msg="No comment activity yet"/>}
                {!activityLoading&&userActivity.map(ac=>{
                  const isNews=ac.profile_user_id?.startsWith("news_");
                  const targetUser=!isNews&&users.find(x=>x.id===ac.profile_user_id);
                  const isImg=ac.text?.startsWith("__IMG__");
                  const newsId=isNews?ac.profile_user_id.replace("news_",""):null;
                  const handleActivityClick=()=>{
                    if(isNews){
                      navigate("news",null,{expandId:newsId});
                    } else {
                      navigate("profile",ac.profile_user_id,{scrollToComments:true});
                    }
                  };
                  return(
                    <div key={ac.id} onClick={handleActivityClick} style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:8,cursor:"pointer",transition:"border-color .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,212,255,.3)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.06)"}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:10,color:"#475569",marginBottom:4}}>
                          {isNews
                            ?<><span style={{color:"#8B5CF6",fontWeight:700}}>📰 News</span> · <span style={{color:"#94A3B8"}}>click to view discussion</span></>
                            :<>💬 commented on <span style={{color:"#00D4FF",fontWeight:700}}>{targetUser?.display_name||"someone"}'s profile</span></>
                          }
                          <span style={{marginLeft:8}}>{fmtAgo(ac.timestamp)}</span>
                        </div>
                        {ac.reply_to_name&&<div style={{fontSize:10,color:"#8B5CF6",marginBottom:3}}>↩ replying to {ac.reply_to_name}</div>}
                        {isImg
                          ?<span style={{fontSize:11,color:"#475569"}}>📷 Image</span>
                          :<div style={{fontSize:12,color:"#94A3B8",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ac.text}</div>
                        }
                        {(ac.likes?.length>0)&&<div style={{fontSize:10,color:"#EF4444",marginTop:3}}>❤️ {ac.likes.length}</div>}
                      </div>
                      <span style={{fontSize:14,color:"#334155",flexShrink:0,alignSelf:"center"}}>→</span>
                    </div>
                  );
                })}
              </div>
            ):(
              <>
            {cu&&(
              <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"flex-start"}}>
                <Av user={cu} size={32}/>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                  {replyTo&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",borderRadius:8,background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.2)"}}>
                      <span style={{fontSize:11,color:"#8B5CF6",flex:1}}>↩ Replying to <strong>{replyTo.author_name}</strong></span>
                      <button onClick={()=>setReplyTo(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#475569",fontSize:12}}>✕</button>
                    </div>
                  )}
                  <div style={{display:"flex",gap:8}}>
                    <input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitComment();}}} placeholder={replyTo?`Reply to ${replyTo.author_name}...`:"Leave a comment..."} style={{flex:1}}/>
                    <Btn size="sm" onClick={()=>submitComment()} disabled={!commentText.trim()}>Post</Btn>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <CommentImgUpload onUpload={async f=>{
                      const ext=f.name.split(".").pop();
                      const url=await sbUp("nova-banners",`cmt-${gid()}.${ext}`,f);
                      if(url)submitComment(url);
                    }}/>
                    <button onClick={()=>setShowGifPicker(true)} style={{background:"rgba(139,92,246,.15)",border:"1px solid rgba(139,92,246,.3)",borderRadius:8,padding:"4px 10px",cursor:"pointer",color:"#A78BFA",fontSize:12,fontWeight:700}}>GIF</button>
                  </div>
                  {showGifPicker&&<GifPicker onSelect={url=>submitComment(`__IMG__${url}`)} onClose={()=>setShowGifPicker(false)}/>}
                </div>
              </div>
            )}
            {comments.length===0?<Empty icon="💬" msg="No comments yet"/>
            :<div style={{display:"flex",flexDirection:"column",gap:8}}>
              {comments.map(c=>{
                const author=users.find(x=>x.id===c.author_id);
                const canDel=cu&&(cu.id===u.id||cu.is_owner||cu.staff_role);
                const isImg=c.text?.startsWith("__IMG__");
                const likeCount=c.likes?.length||0;
                const iLiked=cu&&(c.likes||[]).includes(cu.id);
                const toggleLike=()=>{
                  if(!cu)return;
                  const newLikes=iLiked?(c.likes||[]).filter(id=>id!==cu.id):[...(c.likes||[]),cu.id];
                  setComments(prev=>prev.map(x=>x.id===c.id?{...x,likes:newLikes}:x));
                  sb.patch("nova_comments",`?id=eq.${c.id}`,{likes:newLikes});
                };
                return(
                  <div key={c.id} className="comment-row" style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",position:"relative"}}>
                    <Av user={author||{avatar:c.author_avatar,avatar_url:c.author_avatar_url,page_accent:"#00D4FF"}} size={30} onClick={()=>navigate("profile",c.author_id)}/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                        <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0",cursor:"pointer"}} onClick={()=>navigate("profile",c.author_id)}>{c.author_name}</span>
                        <span style={{fontSize:10,color:"#334155"}}>{fmtAgo(c.timestamp)}</span>
                      </div>
                      {c.reply_to_name&&<div style={{fontSize:10,color:"#8B5CF6",marginBottom:3}}>↩ replying to {c.reply_to_name}</div>}
                      {isImg
                        ?<img src={c.text.slice(7)} style={{maxWidth:220,maxHeight:260,borderRadius:10,display:"block",marginTop:4,objectFit:"contain",cursor:"pointer"}} onClick={()=>window.open(c.text.slice(7),"_blank")}/>
                        :<div style={{fontSize:13,color:"#94A3B8",lineHeight:1.5}}>{c.text}</div>
                      }
                      <div style={{display:"flex",gap:10,alignItems:"center",marginTop:6}}>
                        <button onClick={toggleLike} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:cu?"pointer":"default",padding:0}}>
                          <span style={{fontSize:13,filter:iLiked?"none":"grayscale(1)",opacity:iLiked?1:.5}}>❤️</span>
                          {likeCount>0&&<span style={{fontSize:10,color:iLiked?"#EF4444":"#475569",fontWeight:700}}>{likeCount}</span>}
                        </button>
                        {cu&&<button onClick={()=>{setReplyTo({id:c.id,author_name:c.author_name,author_id:c.author_id});setProfileTab("posts");}} style={{fontSize:10,color:"#475569",background:"none",border:"none",cursor:"pointer",padding:0}}>↩ Reply</button>}
                      </div>
                    </div>
                    {canDel&&<XBtn className="del-btn" onClick={()=>deleteComment(c.id)} style={{opacity:0,position:"absolute",top:8,right:8}}/>}
                  </div>
                );
              })}
            </div>}
            </>
            )}
          </Sec>
        </div>
        {!mob&&hasSideBanners&&(
          <div style={{width:160,flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
            {u.banner_right_url
              ?<div style={{position:"relative"}}><img src={u.banner_right_url} style={{width:160,borderRadius:12,objectFit:"cover",maxHeight:560}}/>{(isMe||isOwner)&&<XBtn onClick={()=>patchUser({banner_right_url:""})} style={{position:"absolute",top:4,right:4}}/>}</div>
              :(isMe||isOwner)&&<BannerBtn label="+ Right" onUpload={f=>handleBannerUpload(f,"right")}/>
          }
          </div>
        )}
      </div>

      {/* Edit Modals */}
      {editModal==="profile"&&<EditProfileModal u={u} cu={cu} onSave={async p=>{await patchUser(p);setEditModal(null);setUsers(prev=>prev.map(x=>x.id===u.id?{...x,...p}:x));}} onClose={()=>setEditModal(null)}/>}
      {editModal==="music"&&<Modal title="🎵 Set Music" onClose={()=>setEditModal(null)}><EditMusicModal u={u} onSave={async p=>{await patchUser(p);setEditModal(null);}}/></Modal>}
      {editModal==="team"&&<Modal title="🏆 Favorite Teams" onClose={()=>setEditModal(null)} width={580}><EditTeamsModal u={u} onSave={async p=>{await patchUser(p);setEditModal(null);}}/></Modal>}
      {editModal==="socials"&&<Modal title="🔗 Social Links" onClose={()=>setEditModal(null)}><EditSocialsModal u={u} onSave={async p=>{await patchUser(p);setEditModal(null);}}/></Modal>}

      {showAddClip&&<AddClipModal uid={u.id} onAdd={addClip} onClose={()=>setShowAddClip(false)}/>}
      {showAddSocial&&<Modal title="📱 Add Social Clip" onClose={()=>setShowAddSocial(false)}><AddLinkClipModal onAdd={addSocial} onClose={()=>setShowAddSocial(false)}/></Modal>}
    </div>
  );
}

function EditProfileModal({u,cu,onSave,onClose}){
  const[display,setDisplay]=useState(u.display_name||"");
  const[bio,setBio]=useState(u.bio||"");
  const[avatar,setAvatar]=useState(u.avatar||"");
  const[accent,setAccent]=useState(u.page_accent||"#00D4FF");
  const[status,setStatus]=useState(u.status_type||"online");
  const[activity,setActivity]=useState(u.status_activity||"");
  const[dob,setDob]=useState(u.dob||"");
  const[uploading,setUploading]=useState(false);
  const fileRef=useRef(null);
  const handleAv=async e=>{const f=e.target.files[0];if(!f)return;setUploading(true);const url=await sb.upload(u.id,f);if(url)await onSave({avatar_url:url});setUploading(false);};
  return(
    <Modal title="✏️ Edit Profile" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><Lbl>Display Name</Lbl><input value={display} onChange={e=>setDisplay(e.target.value)} placeholder="Your name"/></div>
        <div><Lbl>Bio</Lbl><textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell everyone about yourself" style={{resize:"vertical",minHeight:70}}/></div>
        <div><Lbl>Avatar Emoji</Lbl><input value={avatar} onChange={e=>setAvatar(e.target.value)} placeholder="Paste an emoji 🚀"/></div>
        <div><Lbl>Upload Avatar</Lbl><input type="file" ref={fileRef} accept="image/*" onChange={handleAv} style={{display:"none"}}/><Btn variant="ghost" size="sm" onClick={()=>fileRef.current.click()} disabled={uploading}>{uploading?"Uploading...":"📷 Upload Photo"}</Btn></div>
        <div><Lbl>Date of Birth</Lbl><input type="date" value={dob} onChange={e=>setDob(e.target.value)}/></div>
        <div><Lbl>Accent Color</Lbl><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["#00D4FF","#8B5CF6","#F59E0B","#EF4444","#22C55E","#EC4899","#F97316","#A78BFA"].map(c=><button key={c} onClick={()=>setAccent(c)} style={{width:28,height:28,borderRadius:"50%",background:c,border:`3px solid ${accent===c?"white":"transparent"}`,cursor:"pointer"}}/> )}<input type="color" value={accent} onChange={e=>setAccent(e.target.value)} style={{width:28,height:28,padding:0,border:"none",background:"none",cursor:"pointer"}}/></div></div>
        <div><Lbl>Status</Lbl><select value={status} onChange={e=>setStatus(e.target.value)}>{Object.entries(STATUS_META).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
        <div><Lbl>Activity</Lbl><input value={activity} onChange={e=>setActivity(e.target.value)} placeholder="Watching Yankees game..."/></div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={()=>onSave({display_name:display,bio,avatar,page_accent:accent,status_type:status,status_activity:activity,dob})}>Save</Btn></div>
      </div>
    </Modal>
  );
}
function EditMusicModal({u,onSave}){
  const[url,setUrl]=useState("");
  const[type,setType]=useState("spotify");
  const tracks=(()=>{const pm=u.page_music;if(!pm)return[];if(Array.isArray(pm))return pm.filter(t=>t?.url);if(pm.url)return[pm];return[];})();
  const save=()=>{
    if(!url.trim())return;
    const newTrack={url:url.trim(),type};
    const updated=[...tracks,newTrack].slice(0,4);
    onSave({page_music:updated});
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {tracks.length>0&&<div style={{fontSize:11,color:"#64748B"}}>{tracks.length}/4 tracks added</div>}
      <div style={{display:"flex",gap:8}}>{["spotify","youtube"].map(t=><button key={t} onClick={()=>setType(t)} style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${type===t?"#00D4FF":"rgba(255,255,255,.1)"}`,background:type===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.04)",color:type===t?"#00D4FF":"#94A3B8"}}>{t==="spotify"?"🟢 Spotify":"🔴 YouTube"}</button>)}</div>
      <div><Lbl>Paste Link</Lbl><input value={url} onChange={e=>setUrl(e.target.value)} placeholder={type==="spotify"?"https://open.spotify.com/track/...":"https://youtu.be/..."}/></div>
      <Btn onClick={save} disabled={!url.trim()||tracks.length>=4}>Add Track {tracks.length>=4?"(Full)":""}</Btn>
    </div>
  );
}
function EditTeamsModal({u,onSave}){
  const[mlb,setMlb]=useState(u.mlb_team||"");
  const[nfl,setNfl]=useState(u.nfl_team||"");
  const[nba,setNba]=useState(u.nba_team||"");
  const[nhl,setNhl]=useState(u.nhl_team||"");
  const[tab,setTab]=useState("mlb");
  const tabs=[["mlb","⚾ MLB"],["nfl","🏈 NFL"],["nba","🏀 NBA"],["nhl","🏒 NHL"]];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {tabs.map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{flex:1,minWidth:70,padding:"7px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"#00D4FF":"rgba(255,255,255,.1)"}`,background:tab===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.04)",color:tab===t?"#00D4FF":"#94A3B8"}}>{l}</button>)}
      </div>
      {tab==="mlb"&&<TeamPicker sport="mlb" teams={MLB_TEAMS} value={mlb} onChange={setMlb}/>}
      {tab==="nfl"&&<TeamPicker sport="nfl" teams={NFL_TEAMS} value={nfl} onChange={setNfl}/>}
      {tab==="nba"&&<TeamPicker sport="nba" teams={NBA_TEAMS} value={nba} onChange={setNba}/>}
      {tab==="nhl"&&<TeamPicker sport="nhl" teams={NHL_TEAMS} value={nhl} onChange={setNhl}/>}
      <Btn onClick={()=>onSave({mlb_team:mlb,nfl_team:nfl,nba_team:nba,nhl_team:nhl})}>Save Teams</Btn>
    </div>
  );
}
function EditSocialsModal({u,onSave}){
  const init={roblox:u.social_roblox||"",discord:u.social_discord||"",instagram:u.social_instagram||"",twitter:u.social_twitter||"",youtube:u.social_youtube||""};
  const[vals,setVals]=useState(init);
  const set=(k,v)=>setVals(prev=>({...prev,[k]:v}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {Object.keys(SOCIAL_ICONS).map(k=>(
        <div key={k}><Lbl>{SOCIAL_LABELS[k]}</Lbl><input value={vals[k]} onChange={e=>set(k,e.target.value)} placeholder={k==="discord"?"username#0000":k==="youtube"?"@channel or URL":`@username`}/></div>
      ))}
      <Btn onClick={()=>onSave({social_roblox:vals.roblox,social_discord:vals.discord,social_instagram:vals.instagram,social_twitter:vals.twitter,social_youtube:vals.youtube})}>Save Socials</Btn>
    </div>
  );
}
function AddClipModal({uid,onAdd,onClose}){
  const[type,setType]=useState("url");
  const[title,setTitle]=useState("");
  const[url,setUrl]=useState("");
  const[file,setFile]=useState(null);
  const[uploading,setUploading]=useState(false);
  const fileRef=useRef(null);
  const add=async()=>{
    if(!title)return;
    if(type==="video"){
      if(!file)return;
      setUploading(true);
      const videoUrl=await sb.uploadClip(uid,file);
      setUploading(false);
      if(!videoUrl)return;
      onAdd({id:gid(),type:"video",title,url:videoUrl,ts:Date.now()});
    } else {
      const yt=extractYT(url);
      const med=extractMedal(url);
      if(yt)onAdd({id:gid(),type:"youtube",title,eid:yt,url,ts:Date.now()});
      else if(med)onAdd({id:gid(),type:"medal",title,eid:med,url,ts:Date.now()});
      else onAdd({id:gid(),type:"link",title,url,platform:"other",ts:Date.now()});
    }
  };
  return(
    <Modal title="🎬 Add Clip" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:8}}>{[["url","🔗 URL"],["video","📹 Upload"]].map(([t,l])=><button key={t} onClick={()=>setType(t)} style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${type===t?"#00D4FF":"rgba(255,255,255,.1)"}`,background:type===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.04)",color:type===t?"#00D4FF":"#94A3B8"}}>{l}</button>)}</div>
        <div><Lbl>Title</Lbl><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Clip title"/></div>
        {type==="url"&&<div><Lbl>URL</Lbl><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="YouTube, Medal.tv, etc."/></div>}
        {type==="video"&&<div><Lbl>Video File</Lbl><input type="file" ref={fileRef} accept="video/*" onChange={e=>setFile(e.target.files[0])} style={{display:"none"}}/><Btn variant="ghost" size="sm" onClick={()=>fileRef.current.click()}>{file?`✅ ${file.name}`:"Choose Video"}</Btn></div>}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={add} disabled={uploading||!title}>{uploading?"Uploading...":"Add Clip"}</Btn></div>
      </div>
    </Modal>
  );
}
function AddLinkClipModal({onAdd,onClose}){
  const[title,setTitle]=useState("");const[url,setUrl]=useState("");const[plat,setPlat]=useState("instagram");
  const add=()=>{if(!title||!url)return;onAdd({id:gid(),type:"link",title,url,platform:plat,ts:Date.now()});};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div><Lbl>Title</Lbl><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Clip title"/></div>
      <div><Lbl>URL</Lbl><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Instagram reel, etc."/></div>
      <div><Lbl>Platform</Lbl><select value={plat} onChange={e=>setPlat(e.target.value)}><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="other">Other</option></select></div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={add} disabled={!title||!url}>Add</Btn></div>
    </div>
  );
}

// ─── ESPN-Style Stats Page ─────────────────────────────────────────────────────

const STATS_SPORTS=[
  {id:"mlb",label:"MLB",icon:"⚾",espnPath:"baseball/mlb",color:"#22C55E"},
  {id:"nba",label:"NBA",icon:"🏀",espnPath:"basketball/nba",color:"#F59E0B"},
  {id:"nhl",label:"NHL",icon:"🏒",espnPath:"hockey/nhl",color:"#00D4FF"},
  {id:"nfl",label:"NFL",icon:"🏈",espnPath:"football/nfl",color:"#EF4444"},
];

function useESPN(path,deps=[]){
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(false);
  useEffect(()=>{
    if(!path)return;
    setLoading(true);
    fetch(`https://site.api.espn.com/apis/site/v2/sports/${path}`)
      .then(r=>r.ok?r.json():null)
      .then(d=>{setData(d);setLoading(false);})
      .catch(()=>setLoading(false));
  },deps);
  return{data,loading};
}

// ── Player Stats Page ────────────────────────────────────────────────────────
function PlayerStatsPage({playerId,sport,onBack}){
  const mob=useIsMobile();
  const[info,setInfo]=useState(null);
  const[stats,setStats]=useState(null);
  const[splits,setSplits]=useState(null);
  const[gamelog,setGamelog]=useState([]);
  const[tab,setTab]=useState("overview");
  const[loading,setLoading]=useState(true);
  const espnPath=STATS_SPORTS.find(s=>s.id===sport)?.espnPath||"baseball/mlb";

  useEffect(()=>{
    if(!playerId)return;
    setLoading(true);
    setTab("overview");
    setInfo(null);setStats(null);setGamelog([]);
    const load=async()=>{
      try{
        const proxy=async(url)=>{
          const r=await fetch(`/api/hyperbeam?espn_proxy=1&url=${encodeURIComponent(url)}`);
          return r.ok?r.json():null;
        };

        if(sport==="mlb"){
          // MLB Stats API — reliable, no CORS issues, full data
          const [personData,statSeasonData,statLogData]=await Promise.all([
            fetch(`https://statsapi.mlb.com/api/v1/people/${playerId}?hydrate=currentTeam,team,stats(type=season,season=2025),education,transactions`).then(r=>r.ok?r.json():null).catch(()=>null),
            fetch(`https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=season,career&leagueListId=mlb_hist&group=hitting,pitching,fielding&sportId=1`).then(r=>r.ok?r.json():null).catch(()=>null),
            fetch(`https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=gameLog&season=2025&group=hitting,pitching&sportId=1`).then(r=>r.ok?r.json():null).catch(()=>null),
          ]);
          if(personData?.people?.[0]){
            const p=personData.people[0];
            // Normalize into the same shape the component expects
            setInfo({
              athlete:{
                id:p.id,
                displayName:p.fullName,
                fullName:p.fullName,
                jersey:p.primaryNumber||"",
                position:{displayName:p.primaryPosition?.name||"",name:p.primaryPosition?.name||"",abbreviation:p.primaryPosition?.abbreviation||""},
                team:{displayName:p.currentTeam?.name||"",id:p.currentTeam?.id},
                headshot:{href:`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/${playerId}/headshot/67/current`},
                displayHeight:p.height||"",
                displayWeight:p.weight?`${p.weight} lbs`:"",
                dateOfBirth:p.birthDate||"",
                birthPlace:{city:p.birthCity||"",state:p.birthStateProvince||"",country:p.birthCountry||""},
                college:{name:p.draftInfo?.school||""},
                experience:{years:p.mlbDebutDate?new Date().getFullYear()-parseInt(p.mlbDebutDate.slice(0,4)):null},
                debut:p.mlbDebutDate||"",
                status:{type:{name:p.active?"active":"inactive",description:p.active?"Active":"Inactive"}},
              }
            });
          }
          // Build stats display — separate 2025 season from career
          if(statSeasonData?.stats?.length){
            const cats=[];
            statSeasonData.stats.forEach(sg=>{
              const splits=sg.splits||[];
              // 2025 season split
              const season2025=splits.find(s=>s.season==="2025"&&(s.type?.displayName==="Regular Season"||s.type?.gameType==="R"));
              // Career split
              const career=splits.find(s=>!s.season||s.type?.displayName==="Career"||s.stat?.gamesPlayed>200);
              const fmt=(s,label)=>{
                if(!s?.stat)return null;
                const entries=Object.entries(s.stat).filter(([,v])=>v!==null&&v!==undefined);
                return{
                  displayName:`${sg.group?.displayName?.toUpperCase()||"STATS"} — ${label}`,
                  displayNames:entries.map(([k])=>k.replace(/([A-Z])/g," $1").toUpperCase().trim()),
                  totals:entries.map(([,v])=>typeof v==="number"&&!Number.isInteger(v)?v.toFixed(3):String(v??"")),
                };
              };
              if(season2025)cats.push(fmt(season2025,"2025 Season"));
              if(career&&career!==season2025)cats.push(fmt(career,"Career"));
              if(!season2025&&!career&&splits[0])cats.push(fmt(splits[0],"Stats"));
            });
            setStats({splits:cats.filter(Boolean)});
          }
          // Game log
          if(statLogData?.stats?.[0]?.splits){
            const splits=statLogData.stats[0].splits;
            const rows=splits.slice(0,30).map(s=>({
              date:s.date||"",
              opponent:s.opponent?.name||s.opponent?.abbreviation||"",
              result:"",
              homeAway:s.isHome?"home":"away",
              stats:[{
                labels:Object.keys(s.stat||{}),
                values:Object.values(s.stat||{}).map(v=>typeof v==="number"&&!Number.isInteger(v)?v.toFixed(3):String(v??"")),
              }],
            }));
            setGamelog(rows);
          }
        } else {
          // NBA / NHL / NFL — ESPN via proxy
          const [infoData,statData,logData]=await Promise.all([
            proxy(`https://site.api.espn.com/apis/site/v2/sports/${espnPath}/athletes/${playerId}`),
            proxy(`https://site.api.espn.com/apis/site/v2/sports/${espnPath}/athletes/${playerId}/stats`),
            proxy(`https://site.api.espn.com/apis/site/v2/sports/${espnPath}/athletes/${playerId}/gamelog`),
          ]);
          // ESPN returns {athlete:{...}} — normalize so component always gets athlete key
          if(infoData){
            const normalized=infoData.athlete?infoData:{athlete:infoData};
            // Extract headshot from ESPN data if available
            const ath=normalized.athlete||{};
            if(ath.headshot?.href)ath._headshotHref=ath.headshot.href;
            setInfo(normalized);
          }
          // Stats: ESPN returns {categories:[{displayName,labels,totals}]} or {splits:[...]}
          if(statData){
            // Normalize ESPN stats to {splits:[{displayName, displayNames, labels, totals, _isCurrent, _isCareer}]}
            const rawCats=statData.categories||statData.splits||[];
            // ESPN stats endpoint has seasonTypes array too
            const seasonTypes=statData.seasonTypes||[];
            let cats=[];
            if(seasonTypes.length){
              seasonTypes.forEach(st=>{
                (st.categories||[]).forEach(cat=>{
                  const isCurrent=st.type?.name==="regular"||st.displayName?.includes("2025")||st.displayName?.includes("Season");
                  const isCareer=st.type?.name==="total"||st.displayName?.toLowerCase().includes("career")||st.displayName?.toLowerCase().includes("total");
                  cats.push({
                    displayName:`${cat.displayName||cat.name||"Stats"} — ${isCareer?"Career":st.displayName||"2025"}`,
                    labels:cat.labels||[],
                    displayNames:cat.labels||[],
                    totals:cat.totals||cat.stats||[],
                    _isCareer:isCareer,
                  });
                });
              });
            } else {
              cats=rawCats.map(cat=>({
                displayName:cat.displayName||cat.name||"Stats",
                labels:cat.labels||[],
                displayNames:cat.labels||[],
                totals:cat.totals||cat.stats||[],
              }));
            }
            setStats({splits:cats});
          }
          if(logData){
            const events=logData?.events||{};
            const cats=logData?.seasonTypes?.[0]?.categories||[];
            const rows=[];
            Object.entries(events).forEach(([eid,ev])=>{
              const statsArr=cats.map(cat=>{
                const statEntry=cat.events?.find(e=>e.eventId===eid);
                return{catName:cat.name||"",labels:cat.labels||[],values:statEntry?.stats||[]};
              });
              rows.push({date:ev.gameDate||ev.date||"",opponent:ev.opponent?.displayName||ev.opponent?.abbreviation||"",result:ev.gameResult||"",homeAway:ev.homeAway||"",stats:statsArr});
            });
            setGamelog(rows.slice(0,30));
          }
        }
      }catch(e){console.warn("PlayerStats load error:",e);}
      setLoading(false);
    };
    load();
  },[playerId,sport]);

  const athlete=info?.athlete||info;
  const ac=STATS_SPORTS.find(s=>s.id===sport)?.color||"#00D4FF";

  if(loading)return(
    <div style={{textAlign:"center",padding:"60px 20px"}}>
      <div className="spin" style={{fontSize:28,display:"inline-block",marginBottom:10}}>⚙️</div>
      <div style={{color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading player stats...</div>
    </div>
  );

  if(!athlete)return(
    <div style={{textAlign:"center",padding:60}}>
      <div style={{fontSize:36,marginBottom:10}}>🔍</div>
      <div style={{color:"#334155",fontSize:13}}>Player not found</div>
      <button onClick={onBack} style={{marginTop:12,padding:"8px 18px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#94A3B8",cursor:"pointer",fontSize:12}}>← Back</button>
    </div>
  );

  const pos=athlete.position?.displayName||athlete.position?.name||"";
  const team=athlete.team?.displayName||"";
  const headshot=athlete._headshotHref||athlete.headshot?.href||playerHeadshotUrl(playerId,sport);
  const birthDate=athlete.dateOfBirth||athlete.dob||"";
  const height=athlete.displayHeight||athlete.height||"";
  const weight=athlete.displayWeight||athlete.weight||"";
  const experience=athlete.experience?.years;
  const college=athlete.college?.shortName||athlete.college?.name||"";
  const jersey=athlete.jersey||"";

  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:mob?"12px 10px 100px":"20px 20px 80px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12,marginBottom:16,display:"flex",alignItems:"center",gap:5,fontFamily:"'Orbitron',sans-serif"}}>← BACK</button>

      {/* Player hero */}
      <div style={{background:`linear-gradient(135deg,${ac}18,rgba(0,0,0,.3))`,border:`1px solid ${ac}33`,borderRadius:16,padding:mob?"14px":"20px 24px",marginBottom:16,display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
        <img src={headshot} style={{width:mob?72:96,height:mob?72:96,borderRadius:"50%",objectFit:"cover",objectPosition:"top",background:"rgba(255,255,255,.08)",flexShrink:0,border:`3px solid ${ac}44`}}
          onError={e=>{e.target.src=`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:4}}>
            <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:22,fontWeight:900,color:"#E2E8F0",margin:0}}>{athlete.displayName||athlete.fullName||""}</h1>
            {jersey&&<span style={{fontSize:13,color:ac,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>#{jersey}</span>}
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:8}}>
            <span style={{fontSize:12,color:ac,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{pos}</span>
            {team&&<span style={{fontSize:12,color:"#64748B"}}>· {team}</span>}
          </div>
          <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:11,color:"#475569"}}>
            {height&&<span>📏 {height}</span>}
            {weight&&<span>⚖️ {weight}</span>}
            {birthDate&&<span>🎂 {birthDate.slice(0,10)}</span>}
            {college&&<span>🎓 {college}</span>}
            {experience!=null&&<span>⭐ {experience} yr{experience!==1?"s":""} exp</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap"}}>
        {[["overview","📊 Overview"],["gamelog","📅 Game Log"],["splits","📈 Splits"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{padding:"7px 14px",borderRadius:18,cursor:"pointer",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,
              border:`1px solid ${tab===t?ac+"88":"rgba(255,255,255,.1)"}`,
              background:tab===t?ac+"18":"rgba(255,255,255,.03)",
              color:tab===t?ac:"#64748B"}}>
            {l}
          </button>
        ))}
      </div>

      {/* Overview — season stats */}
      {tab==="overview"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {(stats?.splits||stats?.categories||[]).map((cat,ci)=>{
            // Handle both MLB Stats API format and ESPN format
            const labels=cat.displayNames||cat.labels||cat.names||[];
            const values=cat.totals||cat.stats||cat.values||[];
            if(!labels.length)return null;
            // Filter out non-useful labels
            const useful=labels.map((l,li)=>({l,v:values[li]})).filter(({l,v})=>
              v!==undefined&&v!==null&&v!==""&&v!=="-.--"&&v!=="---"&&l.length>0
            );
            if(!useful.length)return null;
            return(
              <Card key={ci} style={{padding:"14px 16px"}} hover={false}>
                <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:12,fontWeight:700}}>{cat.displayName||cat.name||`STATS ${ci+1}`}</div>
                <div style={{display:"grid",gridTemplateColumns:mob?"repeat(3,1fr)":"repeat(auto-fill,minmax(100px,1fr))",gap:8}}>
                  {useful.slice(0,30).map(({l,v},li)=>(
                    <div key={li} style={{textAlign:"center",padding:"10px 6px",borderRadius:8,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)"}}>
                      <div style={{fontSize:mob?15:18,fontWeight:900,color:ac,fontFamily:"'Orbitron',sans-serif",marginBottom:3,lineHeight:1}}>{v||"—"}</div>
                      <div style={{fontSize:8,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".06em",lineHeight:1.2}}>{String(l).slice(0,12)}</div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
          {/* Bio card */}
          {(athlete.birthPlace?.city||athlete.birthPlace?.country)&&(
            <Card style={{padding:"14px 16px"}} hover={false}>
              <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:10}}>BIO</div>
              <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(3,1fr)",gap:8,fontSize:12,color:"#94A3B8"}}>
                {athlete.birthPlace?.city&&<div><span style={{color:"#475569",fontSize:10}}>Hometown</span><br/>{athlete.birthPlace.city}{athlete.birthPlace.state?`, ${athlete.birthPlace.state}`:""}</div>}
                {athlete.birthPlace?.country&&<div><span style={{color:"#475569",fontSize:10}}>Country</span><br/>{athlete.birthPlace.country}</div>}
                {athlete.debut&&<div><span style={{color:"#475569",fontSize:10}}>Debut</span><br/>{athlete.debut}</div>}
                {athlete.status?.type?.description&&<div><span style={{color:"#475569",fontSize:10}}>Status</span><br/><span style={{color:athlete.status.type.name==="active"?"#22C55E":"#EF4444"}}>{athlete.status.type.description}</span></div>}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Game Log */}
      {tab==="gamelog"&&(
        <Card style={{padding:"14px 16px"}} hover={false}>
          {gamelog.length===0&&<Empty icon="📅" msg="No game log available"/>}
          {gamelog.length>0&&(()=>{
            const firstCat=gamelog[0]?.stats?.[0];
            const labels=firstCat?.labels||[];
            return(
              <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:mob?10:11,minWidth:Math.max(400,labels.length*60+160)}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid rgba(255,255,255,.1)"}}>
                      <td style={{padding:"6px 8px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,minWidth:80}}>DATE</td>
                      <td style={{padding:"6px 8px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,minWidth:90}}>OPP</td>
                      <td style={{padding:"6px 8px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>RESULT</td>
                      {labels.slice(0,15).map((l,li)=>(
                        <td key={li} style={{padding:"6px 6px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,whiteSpace:"nowrap"}}>{l}</td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gamelog.map((row,ri)=>{
                      const vals=row.stats?.[0]?.values||[];
                      const isW=row.result?.includes("W");
                      const isL=row.result?.includes("L");
                      return(
                        <tr key={ri} style={{background:ri%2===0?"rgba(255,255,255,.02)":"transparent",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                          <td style={{padding:"5px 8px",color:"#64748B",fontSize:10,whiteSpace:"nowrap"}}>{row.date?.slice(0,10)||"—"}</td>
                          <td style={{padding:"5px 8px",color:"#E2E8F0",fontSize:10,fontWeight:600}}>{row.homeAway==="home"?"vs":"@"} {row.opponent}</td>
                          <td style={{padding:"5px 8px",fontSize:10,fontWeight:700,color:isW?"#22C55E":isL?"#EF4444":"#94A3B8"}}>{row.result||"—"}</td>
                          {vals.slice(0,15).map((v,vi)=>(
                            <td key={vi} style={{padding:"5px 6px",textAlign:"center",color:"#94A3B8",fontSize:10}}>{v||"—"}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </Card>
      )}

      {/* Splits */}
      {tab==="splits"&&(
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:32,marginBottom:10}}>📈</div>
          <div style={{color:"#475569",fontSize:13}}>Splits coming soon</div>
          <div style={{color:"#334155",fontSize:11,marginTop:4}}>Home/Away, Day/Night, vs RHP/LHP splits</div>
        </div>
      )}
    </div>
  );
}

// ── ESPN Scores section ──────────────────────────────────────────────────────
function ESPNScores({sport,navigate}){
  const mob=useIsMobile();
  const espnPath=STATS_SPORTS.find(s=>s.id===sport)?.espnPath||"baseball/mlb";
  const{data,loading}=useESPN(`${espnPath}/scoreboard`,[sport]);
  const ac=STATS_SPORTS.find(s=>s.id===sport)?.color||"#00D4FF";

  const events=data?.events||[];

  if(loading)return<div style={{textAlign:"center",padding:"40px 0",color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading scores...</div>;
  if(!events.length)return<Empty icon={STATS_SPORTS.find(s=>s.id===sport)?.icon||"🏆"} msg="No games today"/>;

  return(
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(auto-fill,minmax(320px,1fr))",gap:10}}>
      {events.map(ev=>{
        const comp=ev.competitions?.[0];
        const home=comp?.competitors?.find(c=>c.homeAway==="home");
        const away=comp?.competitors?.find(c=>c.homeAway==="away");
        const st=comp?.status?.type;
        const isLive=st?.name==="STATUS_IN_PROGRESS";
        const isFinal=st?.completed;
        const statusText=st?.shortDetail||st?.description||"Scheduled";
        const homeWin=isFinal&&parseInt(home?.score||0)>parseInt(away?.score||0);
        const awayWin=isFinal&&parseInt(away?.score||0)>parseInt(home?.score||0);
        return(
          <div key={ev.id} onClick={()=>navigate("game",{id:ev.id,sport})}
            style={{background:"rgba(255,255,255,.03)",border:`1px solid ${isLive?"rgba(34,197,94,.3)":"rgba(255,255,255,.07)"}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=ac+"55"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=isLive?"rgba(34,197,94,.3)":"rgba(255,255,255,.07)"}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:isLive?"#22C55E":isFinal?"#475569":"#00D4FF",fontWeight:700,padding:"2px 8px",borderRadius:10,background:isLive?"rgba(34,197,94,.1)":isFinal?"rgba(71,85,105,.1)":"rgba(0,212,255,.08)",border:`1px solid ${isLive?"rgba(34,197,94,.3)":isFinal?"rgba(71,85,105,.2)":"rgba(0,212,255,.2)"}`}}>
                {isLive?"🔴 LIVE ·":isFinal?"✅ FINAL ·":"🕐"} {statusText}
              </span>
              <span style={{fontSize:9,color:"#334155"}}>📊 Stats</span>
            </div>
            {[{team:away,isWinner:awayWin},{team:home,isWinner:homeWin}].map(({team,isWinner},ti)=>(
              <div key={ti} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0",opacity:isFinal&&!isWinner?.7:1}}>
                {team?.team?.logo?<img src={team.team.logo} style={{width:24,height:24,objectFit:"contain",flexShrink:0}} onError={e=>e.target.style.display="none"}/>:<span style={{width:24,height:24,display:"inline-block"}}/>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:isWinner?700:500,color:isWinner?"#E2E8F0":"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{team?.team?.displayName||"TBD"}</div>
                  <div style={{fontSize:10,color:"#334155"}}>{team?.records?.[0]?.summary||""}</div>
                </div>
                <div style={{fontSize:18,fontWeight:900,color:isWinner?"#E2E8F0":"#64748B",fontFamily:"'Orbitron',sans-serif",minWidth:32,textAlign:"right"}}>{(isLive||isFinal)?team?.score||"0":"—"}</div>
                {isWinner&&<div style={{fontSize:10,color:"#22C55E"}}>▶</div>}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Player Search ─────────────────────────────────────────────────────────────
function PlayerSearchSection({sport,onSelectPlayer}){
  const mob=useIsMobile();
  const[q,setQ]=useState("");
  const[results,setResults]=useState([]);
  const[searching,setSearching]=useState(false);
  const espnPath=STATS_SPORTS.find(s=>s.id===sport)?.espnPath||"baseball/mlb";
  const ac=STATS_SPORTS.find(s=>s.id===sport)?.color||"#00D4FF";

  useEffect(()=>{
    if(q.length<2){setResults([]);return;}
    const t=setTimeout(async()=>{
      setSearching(true);
      try{
        // Use our proxy for MLB (MLB Stats API), ESPN for others
        if(sport==="mlb"){
          const r=await fetch(`/api/hyperbeam?search=${encodeURIComponent(q)}&sport=mlb`);
          const d=await r.json();
          setResults((d.athletes||[]).map(a=>({id:String(a.id),name:a.name,team:a.team,position:a.position,sport})));
        } else {
          const searchUrl=`https://site.api.espn.com/apis/site/v2/sports/${espnPath}/athletes?limit=10&searchTerm=${encodeURIComponent(q)}&active=true`;
          const r=await fetch(`/api/hyperbeam?espn_proxy=1&url=${encodeURIComponent(searchUrl)}`);
          if(r.ok){
            const d=await r.json();
            const items=d.items||d.athletes||[];
            setResults(items.slice(0,10).map(a=>({id:String(a.id),name:a.displayName||a.fullName||"",team:a.team?.displayName||"",position:a.position?.abbreviation||a.position?.name||"",sport})));
          }
        }
      }catch(e){setResults([]);}
      setSearching(false);
    },350);
    return()=>clearTimeout(t);
  },[q,sport]);

  // Top players by sport for quick access
  // MLB: MLB Stats API IDs | NBA/NHL/NFL: ESPN IDs
  const TOP_PLAYERS={
    mlb:[
      {id:"592450",name:"Mookie Betts",hs:"592450"},
      {id:"592518",name:"Aaron Judge",hs:"592518"},
      {id:"660271",name:"Shohei Ohtani",hs:"660271"},
      {id:"444482",name:"Freddie Freeman",hs:"444482"},
      {id:"665742",name:"Juan Soto",hs:"665742"},
      {id:"670541",name:"Yordan Alvarez",hs:"670541"},
      {id:"682998",name:"Gunnar Henderson",hs:"682998"},
      {id:"677951",name:"Bobby Witt Jr.",hs:"677951"},
    ],
    nba:[
      {id:"1966",name:"LeBron James",hs:"1966"},
      {id:"4066261",name:"Nikola Jokic",hs:"4066261"},
      {id:"3202",name:"Stephen Curry",hs:"3202"},
      {id:"3136193",name:"Giannis",hs:"3136193"},
      {id:"4066328",name:"Luka Doncic",hs:"4066328"},
      {id:"4431679",name:"SGA",hs:"4431679"},
    ],
    nhl:[
      {id:"3114727",name:"McDavid",hs:"3114727"},
      {id:"3041954",name:"MacKinnon",hs:"3041954"},
      {id:"3114732",name:"Draisaitl",hs:"3114732"},
      {id:"3900177",name:"Matthews",hs:"3900177"},
      {id:"4697890",name:"Kucherov",hs:"4697890"},
    ],
    nfl:[
      {id:"3139477",name:"Mahomes",hs:"3139477"},
      {id:"3054211",name:"Josh Allen",hs:"3054211"},
      {id:"4241389",name:"Lamar Jackson",hs:"4241389"},
      {id:"3916387",name:"J. Jefferson",hs:"3916387"},
      {id:"4035538",name:"Tyreek Hill",hs:"4035538"},
    ],
  };

  return(
    <div>
      <div style={{position:"relative",marginBottom:results.length||searching?0:20}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`Search any ${sport.toUpperCase()} player…`}
          style={{paddingRight:36}}/>
        {searching&&<div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:14}} className="spin">⚙️</div>}
      </div>

      {/* Search results dropdown */}
      {(results.length>0||searching)&&q.length>=2&&(
        <div style={{background:"linear-gradient(160deg,#0c1220,#0d1528)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,marginTop:4,marginBottom:16,overflow:"hidden",boxShadow:"0 12px 36px rgba(0,0,0,.7)"}}>
          {searching&&<div style={{padding:"10px 14px",fontSize:11,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>Searching...</div>}
          {results.map(p=>(
            <button key={p.id} onClick={()=>{onSelectPlayer(p.id,p.sport||sport);setQ("");setResults([]);}}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",background:"none",border:"none",borderBottom:"1px solid rgba(255,255,255,.05)",cursor:"pointer",textAlign:"left"}}>
              <div style={{width:32,height:32,borderRadius:"50%",overflow:"hidden",background:"rgba(255,255,255,.05)",flexShrink:0}}>
                <img src={playerHeadshotUrl(p.id,sport)}
                  style={{width:"100%",height:"100%",objectFit:"cover"}}
                  onError={e=>{e.target.style.display="none";}}/>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{p.name}</div>
                <div style={{fontSize:10,color:"#475569"}}>{p.position}{p.team?` · ${p.team}`:""}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick picks */}
      {!q&&TOP_PLAYERS[sport]&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:10}}>POPULAR PLAYERS</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {TOP_PLAYERS[sport].map(p=>(
              <button key={p.id} onClick={()=>onSelectPlayer(p.id,sport)}
                style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:20,background:"rgba(255,255,255,.04)",border:`1px solid ${ac}33`,cursor:"pointer",color:"#E2E8F0",fontSize:12}}>
                <div style={{width:22,height:22,borderRadius:"50%",overflow:"hidden",background:"rgba(255,255,255,.05)",flexShrink:0}}>
                  <img src={playerHeadshotUrl(p.id,sport)}
                    style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
                </div>
                {p.name.split(" ").pop()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Stats Page ───────────────────────────────────────────────────────────
function StatsPage({navigate,initPlayer,initSport}){
  const mob=useIsMobile();
  const[sport,setSport]=useState(initSport||"mlb");
  const[section,setSection]=useState(initPlayer?"player":"scores"); // scores | players | standings
  const[selectedPlayer,setSelectedPlayer]=useState(initPlayer||null);
  const[standingsData,setStandingsData]=useState(null);
  const[standingsLoading,setStandingsLoading]=useState(false);
  const ac=STATS_SPORTS.find(s=>s.id===sport)?.color||"#00D4FF";

  // Handle external navigation (from PredictPage clicking a player)
  useEffect(()=>{
    if(initPlayer){setSelectedPlayer(initPlayer);setSection("player");if(initSport)setSport(initSport);}
  },[initPlayer,initSport]);

  const selectPlayer=(pid,sp)=>{
    setSelectedPlayer(pid);
    if(sp)setSport(sp);
    setSection("player");
  };

  const loadStandings=async(sp)=>{
    setStandingsLoading(true);
    try{
      const path=STATS_SPORTS.find(s=>s.id===sp)?.espnPath||"baseball/mlb";
      const r=await fetch(`https://site.api.espn.com/apis/v2/sports/${path}/standings`);
      if(r.ok)setStandingsData(await r.json());
    }catch(e){}
    setStandingsLoading(false);
  };

  useEffect(()=>{
    if(section==="standings")loadStandings(sport);
  },[section,sport]);

  if(section==="player"&&selectedPlayer){
    return<PlayerStatsPage playerId={selectedPlayer} sport={sport} onBack={()=>{setSection("players");setSelectedPlayer(null);}}/>;
  }

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"12px 10px 100px":"20px 20px 80px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:22,fontWeight:900,background:"linear-gradient(135deg,#E2E8F0,#94A3B8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:2}}>📊 STATS CENTER</div>
          <div style={{fontSize:11,color:"#334155"}}>Live scores · Player stats · Standings</div>
        </div>
      </div>

      {/* Sport tabs */}
      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
        {STATS_SPORTS.map(s=>(
          <button key={s.id} onClick={()=>{setSport(s.id);setSection("scores");}}
            style={{padding:"7px 16px",borderRadius:20,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,flexShrink:0,
              border:`1px solid ${sport===s.id?s.color+"88":"rgba(255,255,255,.1)"}`,
              background:sport===s.id?s.color+"18":"rgba(255,255,255,.03)",
              color:sport===s.id?s.color:"#64748B"}}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Section tabs */}
      <div style={{display:"flex",gap:5,marginBottom:16,borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:12}}>
        {[["scores","🏟️ Scores"],["players","👤 Players"],["standings","🏆 Standings"]].map(([s,l])=>(
          <button key={s} onClick={()=>setSection(s)}
            style={{padding:"6px 14px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,
              border:"none",background:section===s?"rgba(255,255,255,.08)":"none",
              color:section===s?"#E2E8F0":"#475569"}}>
            {l}
          </button>
        ))}
      </div>

      {/* Scores */}
      {section==="scores"&&<ESPNScores sport={sport} navigate={navigate}/>}

      {/* Players */}
      {section==="players"&&(
        <div>
          <PlayerSearchSection sport={sport} onSelectPlayer={selectPlayer}/>
        </div>
      )}

      {/* Standings */}
      {section==="standings"&&(
        <div>
          {standingsLoading&&<div style={{textAlign:"center",padding:"40px 0",color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading standings...</div>}
          {!standingsLoading&&standingsData&&(()=>{
            const groups=standingsData.children||standingsData.standings?.entries||[];
            if(!groups.length)return<Empty icon="🏆" msg="Standings not available"/>;
            return(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {groups.slice(0,8).map((group,gi)=>{
                  const entries=group.standings?.entries||group.entries||[];
                  if(!entries.length)return null;
                  return(
                    <Card key={gi} style={{padding:"14px 16px"}} hover={false}>
                      <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:ac,letterSpacing:".12em",marginBottom:10,fontWeight:700}}>{group.name||group.abbreviation||`Division ${gi+1}`}</div>
                      <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:300}}>
                          <thead>
                            <tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                              <td style={{padding:"5px 8px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,minWidth:130}}>TEAM</td>
                              {(entries[0]?.stats||[]).slice(0,8).map((s,si)=>(
                                <td key={si} style={{padding:"5px 6px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>{s.shortDisplayName||s.abbreviation||s.name}</td>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map((entry,ei)=>{
                              const team=entry.team;
                              return(
                                <tr key={ei} style={{background:ei%2===0?"rgba(255,255,255,.02)":"transparent",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                                  <td style={{padding:"6px 8px"}}>
                                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                                      {team?.logos?.[0]?.href&&<img src={team.logos[0].href} style={{width:18,height:18,objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>}
                                      <span style={{fontSize:11,fontWeight:600,color:"#E2E8F0"}}>{team?.displayName||team?.name||"—"}</span>
                                    </div>
                                  </td>
                                  {(entry.stats||[]).slice(0,8).map((s,si)=>(
                                    <td key={si} style={{padding:"6px 6px",textAlign:"center",color:"#94A3B8",fontSize:11}}>{s.displayValue||s.value||"—"}</td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
          {!standingsLoading&&!standingsData&&<Empty icon="🏆" msg="No standings data available"/>}
        </div>
      )}
    </div>
  );
}



// ─── Hub Page (News + Stats + Predict combined) ────────────────────────────────
function HubPage({cu,users,setUsers,navigate}){
  const mob=useIsMobile();
  const[tab,setTab]=useState("stats");
  const TABS=[
    {id:"stats",  icon:"📊",label:"Stats"},
    {id:"news",   icon:"📰",label:"News"},
    {id:"predict",icon:"🎯",label:"Predict"},
  ];
  return(
    <div style={{maxWidth:1080,margin:"0 auto",paddingTop:mob?8:16}}>
      {/* Sub-tab bar */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid rgba(255,255,255,.07)",marginBottom:0,padding:mob?"0 12px":"0 20px"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"10px 18px",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:mob?9:11,fontWeight:700,
              border:"none",background:"none",
              borderBottom:`2px solid ${tab===t.id?"#00D4FF":"transparent"}`,
              color:tab===t.id?"#00D4FF":"#475569",
              transition:"all .18s",letterSpacing:".06em",whiteSpace:"nowrap"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {tab==="stats"  &&<StatsPage navigate={navigate}/>}
      {tab==="news"   &&<NewsPage cu={cu} users={users} addNotif={()=>{}} navOpts={{}}/>}
      {tab==="predict"&&<PredictPage cu={cu} users={users} setUsers={setUsers} navigate={navigate}/>}
    </div>
  );
}


// ─── NFFL Page (Nova Football Fusion League) ─────────────────────────────────
function NFFLPage({cu,users,navigate}){
  const mob=useIsMobile();
  const isAdmin=cu?.is_owner||cu?.staff_role==="Co-owner";
  const[tab,setTab]=useState("feed");
  const[feed,setFeed]=useState([]);
  const[players,setPlayers]=useState([]);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    const load=async()=>{
      const [f,p]=await Promise.all([
        sb.get("nova_nffl_feed","?order=ts.desc&limit=50"),
        sb.get("nova_nffl_players","?order=name.asc"),
      ]);
      setFeed(f||[]);setPlayers(p||[]);setLoading(false);
    };
    load();
  },[]);

  const TABS=[{id:"feed",label:"📢 Game Feed"},{id:"roster",label:"👥 Roster"},{id:"stats",label:"📊 Stats"},{id:"players",label:"👤 Players"}];

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"12px 10px 100px":"20px 20px 80px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <span style={{fontSize:28}}>🏈</span>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:22,fontWeight:900,color:"#F59E0B",letterSpacing:".06em"}}>NFFL</div>
          <div style={{fontSize:11,color:"#475569"}}>Nova Football Fusion League</div>
        </div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:18,borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:10}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,border:"none",background:"none",borderBottom:`2px solid ${tab===t.id?"#F59E0B":"transparent"}`,color:tab===t.id?"#F59E0B":"#475569",transition:"all .18s"}}>{t.label}</button>)}
      </div>
      {loading&&<div style={{textAlign:"center",padding:60,color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading NFFL data...</div>}
      {!loading&&tab==="feed"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {feed.length===0&&<Empty icon="🏈" msg="No game feed posts yet — check back soon!"/>}
          {feed.map((f,i)=>(
            <Card key={i} style={{padding:"14px 16px"}} hover={false}>
              <div style={{fontSize:11,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginBottom:4}}>{f.title||"Update"}</div>
              <div style={{fontSize:13,color:"#94A3B8",lineHeight:1.5}}>{f.content||""}</div>
              <div style={{fontSize:9,color:"#334155",marginTop:8,fontFamily:"'Orbitron',sans-serif"}}>{f.ts?new Date(f.ts).toLocaleDateString():""}</div>
            </Card>
          ))}
        </div>
      )}
      {!loading&&tab==="roster"&&(
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
          {players.length===0&&<Empty icon="👥" msg="No players added yet"/>}
          {players.map((p,i)=>(
            <Card key={i} style={{padding:"14px 16px",textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:6}}>{p.position==="QB"?"🎯":p.position==="RB"?"💨":p.position==="WR"?"📡":p.position==="TE"?"🔒":p.position==="K"?"⚽":"🏈"}</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{p.name||"—"}</div>
              <div style={{fontSize:10,color:"#F59E0B"}}>{p.position||""}</div>
              <div style={{fontSize:10,color:"#475569"}}>{p.team||""}</div>
            </Card>
          ))}
        </div>
      )}
      {!loading&&tab==="stats"&&(
        <div>
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            {["Passing","Rushing","Receiving","Defense","Kicking"].map(cat=>(
              <button key={cat} style={{padding:"6px 14px",borderRadius:16,background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.3)",color:"#F59E0B",fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{cat}</button>
            ))}
          </div>
          <Empty icon="📊" msg="Stats coming soon — add players and game results first"/>
        </div>
      )}
      {!loading&&tab==="players"&&(
        <LeaguePlayersPage players={players} league="nffl" accentColor="#F59E0B" users={users} navigate={navigate}/>
      )}
    </div>
  );
}

// ─── NBBL Page (Nova Baseball League) ─────────────────────────────────────────
function NBBLPage({cu,users,navigate}){
  const mob=useIsMobile();
  const isAdmin=cu?.is_owner||cu?.staff_role==="Co-owner";
  const[tab,setTab]=useState("feed");
  const[feed,setFeed]=useState([]);
  const[players,setPlayers]=useState([]);
  const[loading,setLoading]=useState(true);
  const[statCat,setStatCat]=useState("hitting");

  useEffect(()=>{
    const load=async()=>{
      const [f,p]=await Promise.all([
        sb.get("nova_nbbl_feed","?order=ts.desc&limit=50"),
        sb.get("nova_nbbl_players","?order=name.asc"),
      ]);
      setFeed(f||[]);setPlayers(p||[]);setLoading(false);
    };
    load();
  },[]);

  const TABS=[{id:"feed",label:"📢 Game Feed"},{id:"roster",label:"👥 Roster"},{id:"stats",label:"📊 Stats"},{id:"players",label:"👤 Players"}];

  // Stat categories with their relevant columns
  const STAT_CATS={
    hitting:{label:"⚾ Hitting",color:"#22C55E",cols:["G","AB","R","H","2B","3B","HR","RBI","BB","SO","SB","AVG","OBP","SLG","OPS"]},
    pitching:{label:"⚾ Pitching",color:"#3B82F6",cols:["G","GS","W","L","SV","IP","H","R","ER","BB","SO","ERA","WHIP","K9","BB9"]},
    fielding:{label:"🧤 Fielding",color:"#A855F7",cols:["G","GS","PO","A","E","DP","FLD%","INN"]},
  };

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"12px 10px 100px":"20px 20px 80px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <span style={{fontSize:28}}>⚾</span>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:22,fontWeight:900,color:"#22C55E",letterSpacing:".06em"}}>NBBL</div>
          <div style={{fontSize:11,color:"#475569"}}>Nova Baseball League</div>
        </div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:18,borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:10}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,border:"none",background:"none",borderBottom:`2px solid ${tab===t.id?"#22C55E":"transparent"}`,color:tab===t.id?"#22C55E":"#475569",transition:"all .18s"}}>{t.label}</button>)}
      </div>
      {loading&&<div style={{textAlign:"center",padding:60,color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading NBBL data...</div>}
      {!loading&&tab==="feed"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {feed.length===0&&<Empty icon="⚾" msg="No game feed posts yet — check back soon!"/>}
          {feed.map((f,i)=>(
            <Card key={i} style={{padding:"14px 16px"}} hover={false}>
              <div style={{fontSize:11,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginBottom:4}}>{f.title||"Update"}</div>
              <div style={{fontSize:13,color:"#94A3B8",lineHeight:1.5}}>{f.content||""}</div>
              <div style={{fontSize:9,color:"#334155",marginTop:8,fontFamily:"'Orbitron',sans-serif"}}>{f.ts?new Date(f.ts).toLocaleDateString():""}</div>
            </Card>
          ))}
        </div>
      )}
      {!loading&&tab==="roster"&&(
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
          {players.length===0&&<Empty icon="👥" msg="No players added yet"/>}
          {players.map((p,i)=>{
            const posEmoji={P:"⚾",C:"🎯",SP:"🔥",RP:"💨","1B":"🧤","2B":"⚡","3B":"💥","SS":"🌟","LF":"👈","CF":"🎪","RF":"👉","DH":"💪"}[p.position]||"⚾";
            return(
              <Card key={i} style={{padding:"14px 16px",textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:6}}>{posEmoji}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{p.name||"—"}</div>
                <div style={{fontSize:10,color:"#22C55E"}}>{p.position||""}</div>
                <div style={{fontSize:10,color:"#475569"}}>{p.team||""}</div>
                {p.jersey&&<div style={{fontSize:10,color:"#334155"}}>#{p.jersey}</div>}
              </Card>
            );
          })}
        </div>
      )}
      {!loading&&tab==="stats"&&(
        <div>
          {/* Stat category picker */}
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {Object.entries(STAT_CATS).map(([k,v])=>(
              <button key={k} onClick={()=>setStatCat(k)}
                style={{padding:"7px 16px",borderRadius:18,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
                  border:`1px solid ${statCat===k?v.color+"88":"rgba(255,255,255,.1)"}`,
                  background:statCat===k?v.color+"18":"rgba(255,255,255,.03)",
                  color:statCat===k?v.color:"#64748B"}}>
                {v.label}
              </button>
            ))}
          </div>
          {/* Stats table */}
          {(()=>{
            const cat=STAT_CATS[statCat];
            const statPlayers=players.filter(p=>p[`${statCat}_stats`]||p.stats);
            if(!statPlayers.length)return<Empty icon="📊" msg={`No ${statCat} stats recorded yet`}/>;
            return(
              <Card style={{padding:"14px 16px"}} hover={false}>
                <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:400}}>
                    <thead>
                      <tr style={{borderBottom:"1px solid rgba(255,255,255,.1)"}}>
                        <td style={{padding:"6px 8px",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,minWidth:130}}>PLAYER</td>
                        {cat.cols.map(c=><td key={c} style={{padding:"6px 6px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>{c}</td>)}
                      </tr>
                    </thead>
                    <tbody>
                      {statPlayers.map((p,pi)=>{
                        const s=p[`${statCat}_stats`]||p.stats||{};
                        return(
                          <tr key={pi} style={{background:pi%2===0?"rgba(255,255,255,.02)":"transparent",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                            <td style={{padding:"6px 8px"}}>
                              <div style={{fontWeight:600,color:"#E2E8F0"}}>{p.name}</div>
                              <div style={{fontSize:9,color:"#475569"}}>{p.position} · {p.team}</div>
                            </td>
                            {cat.cols.map(c=><td key={c} style={{padding:"6px 6px",textAlign:"center",color:"#94A3B8",fontSize:11}}>{s[c]??s[c.toLowerCase()]??"—"}</td>)}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })()}
        </div>
      )}
      {!loading&&tab==="players"&&(
        <LeaguePlayersPage players={players} league="nbbl" accentColor="#22C55E" users={users} navigate={navigate}/>
      )}
    </div>
  );
}

// Shared: post to league game feed
function PostFeedForm({league,onPost,cu}){
  const[title,setTitle]=useState("");
  const[content,setContent]=useState("");
  const[saving,setSaving]=useState(false);
  const submit=async()=>{
    if(!content.trim())return;
    setSaving(true);
    const post={id:gid(),title:title.trim(),content:content.trim(),author_id:cu?.id,author_name:cu?.display_name,ts:Date.now()};
    await sb.post(`nova_${league}_feed`,post);
    onPost(post);setTitle("");setContent("");setSaving(false);
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Post title (optional)…"/>
      <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Game update, score, highlights…" rows={3} style={{resize:"vertical"}}/>
      <Btn onClick={submit} disabled={saving||!content.trim()}>{saving?"Posting…":"📢 Post Update"}</Btn>
    </div>
  );
}

// Shared: add player to league roster
function AddLeaguePlayer({league,onAdd,cu}){
  const[name,setName]=useState("");
  const[position,setPosition]=useState("");
  const[team,setTeam]=useState("");
  const[jersey,setJersey]=useState("");
  const[saving,setSaving]=useState(false);
  const isBaseball=league==="nbbl";
  const baseballPos=["P","C","1B","2B","3B","SS","LF","CF","RF","DH","SP","RP"];
  const footballPos=["QB","RB","WR","TE","K","DEF","OL","DL","LB","CB","S"];
  const positions=isBaseball?baseballPos:footballPos;
  const submit=async()=>{
    if(!name.trim()||!position)return;
    setSaving(true);
    const player={id:gid(),name:name.trim(),position,team:team.trim(),jersey:jersey.trim(),added_by:cu?.id,ts:Date.now()};
    await sb.post(`nova_${league}_players`,player);
    onAdd(player);setName("");setPosition("");setTeam("");setJersey("");setSaving(false);
  };
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div style={{gridColumn:"1/-1"}}><Lbl>Player Name</Lbl><input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name…"/></div>
      <div><Lbl>Position</Lbl>
        <select value={position} onChange={e=>setPosition(e.target.value)} style={{width:"100%"}}>
          <option value="">Pick…</option>
          {positions.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div><Lbl>Team</Lbl><input value={team} onChange={e=>setTeam(e.target.value)} placeholder="Team name…"/></div>
      <div><Lbl>Jersey #</Lbl><input value={jersey} onChange={e=>setJersey(e.target.value)} placeholder="#"/></div>
      <div style={{gridColumn:"1/-1"}}><Btn onClick={submit} disabled={saving||!name.trim()||!position}>{saving?"Adding…":"➕ Add Player"}</Btn></div>
    </div>
  );
}


// ─── Dashboard ─────────────────────────────────────────────────────────────────

// ─── LeaguePlayersPage — shared player profile page for NFFL/NBBL ─────────────
function DashNFFLTab({cu}){
      // Lazy-load NFFL data
      const[nfflFeedL,setNfflFeedL]=useState([]);
      const[nfflPlayersL,setNfflPlayersL]=useState([]);
      const[nfflTab,setNfflTab]=useState("feed");
      const[nfflLoaded,setNfflLoaded]=useState(false);
      const[nfflPostTitle,setNfflPostTitle]=useState("");
      const[nfflPostContent,setNfflPostContent]=useState("");
      const[nfflSaving,setNfflSaving]=useState(false);
      const[nfflStatTarget,setNfflStatTarget]=useState(null);
      const[nfflStatField,setNfflStatField]=useState("passing_stats");
      const[nfflStatData,setNfflStatData]=useState({});
      const[nfflStatSaving,setNfflStatSaving]=useState(false);
      useEffect(()=>{
        if(nfflLoaded)return;
        Promise.all([
          sb.get("nova_nffl_feed","?order=ts.desc&limit=50"),
          sb.get("nova_nffl_players","?order=name.asc"),
        ]).then(([f,p])=>{setNfflFeedL(f||[]);setNfflPlayersL(p||[]);setNfflLoaded(true);});
      },[]);
      const postFeed=async()=>{
        if(!nfflPostContent.trim())return;
        setNfflSaving(true);
        const post={id:gid(),title:nfflPostTitle.trim(),content:nfflPostContent.trim(),author_id:cu?.id,author_name:cu?.display_name,ts:Date.now()};
        await sb.post("nova_nffl_feed",post);
        setNfflFeedL(p=>[post,...p]);setNfflPostTitle("");setNfflPostContent("");setNfflSaving(false);
      };
      const deleteFeed=async(id)=>{await sb.del("nova_nffl_feed",`?id=eq.${id}`);setNfflFeedL(p=>p.filter(x=>x.id!==id));};
      const saveStats=async()=>{
        if(!nfflStatTarget)return;
        setNfflStatSaving(true);
        await sb.patch("nova_nffl_players",`?id=eq.${nfflStatTarget}`,{[nfflStatField]:nfflStatData});
        setNfflPlayersL(p=>p.map(x=>x.id===nfflStatTarget?{...x,[nfflStatField]:nfflStatData}:x));
        setNfflStatSaving(false);alert("Stats saved!");
      };
      const NFL_STAT_FIELDS=[
        ["passing_stats","🎯 Passing",["G","CMP","ATT","YDS","TD","INT","RTG"]],
        ["rushing_stats","🏃 Rushing",["G","CAR","YDS","TD","AVG","LONG"]],
        ["receiving_stats","📡 Receiving",["G","REC","YDS","TD","AVG","LONG"]],
      ];
      return(
        <div>
          <div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap"}}>
            {[["feed","📢 Feed"],["roster","👥 Roster"],["stats","📊 Stats"]].map(([t,l])=>(
              <button key={t} onClick={()=>setNfflTab(t)} style={{padding:"6px 14px",borderRadius:14,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,border:`1px solid ${nfflTab===t?"rgba(245,158,11,.5)":"rgba(255,255,255,.1)"}`,background:nfflTab===t?"rgba(245,158,11,.12)":"rgba(255,255,255,.03)",color:nfflTab===t?"#F59E0B":"#64748B"}}>{l}</button>
            ))}
          </div>
          {nfflTab==="feed"&&(
            <div>
              <Card style={{padding:"16px",marginBottom:14}} hover={false}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#F59E0B",marginBottom:10,fontWeight:700}}>📢 POST GAME UPDATE</div>
                <input value={nfflPostTitle} onChange={e=>setNfflPostTitle(e.target.value)} placeholder="Title (e.g. Week 3 Recap)…" style={{marginBottom:8}}/>
                <textarea value={nfflPostContent} onChange={e=>setNfflPostContent(e.target.value)} rows={3} placeholder="Game update, scores, highlights…" style={{marginBottom:8,resize:"vertical"}}/>
                <Btn onClick={postFeed} disabled={nfflSaving||!nfflPostContent.trim()}>{nfflSaving?"Posting…":"📢 Post"}</Btn>
              </Card>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {nfflFeedL.map(f=>(
                  <Card key={f.id} style={{padding:"12px 14px"}} hover={false}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        {f.title&&<div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#F59E0B",fontWeight:700,marginBottom:4}}>{f.title}</div>}
                        <div style={{fontSize:12,color:"#94A3B8"}}>{f.content}</div>
                        <div style={{fontSize:9,color:"#334155",marginTop:6}}>{new Date(f.ts).toLocaleDateString()}</div>
                      </div>
                      <button onClick={()=>deleteFeed(f.id)} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:14,marginLeft:8}}>🗑</button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {nfflTab==="roster"&&(
            <div>
              <Card style={{padding:"16px",marginBottom:14}} hover={false}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#F59E0B",marginBottom:10,fontWeight:700}}>➕ ADD PLAYER</div>
                <AddLeaguePlayer league="nffl" onAdd={p=>{setNfflPlayersL(prev=>[...prev,p]);}} cu={cu}/>
              </Card>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {nfflPlayersL.map((p,i)=>(
                  <Card key={i} style={{padding:"10px 12px"}} hover={false}>
                    <div style={{fontWeight:700,color:"#E2E8F0",fontSize:12}}>{p.name}</div>
                    <div style={{fontSize:10,color:"#F59E0B"}}>{p.position}{p.jersey?` · #${p.jersey}`:""}</div>
                    <div style={{fontSize:10,color:"#475569"}}>{p.team}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {nfflTab==="stats"&&(
            <div>
              <Card style={{padding:"16px"}} hover={false}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#F59E0B",marginBottom:12,fontWeight:700}}>📊 ENTER PLAYER STATS</div>
                <div style={{marginBottom:10}}>
                  <Lbl>Select Player</Lbl>
                  <select value={nfflStatTarget||""} onChange={e=>{
                    setNfflStatTarget(e.target.value);
                    const p=nfflPlayersL.find(x=>x.id===e.target.value);
                    setNfflStatData(p?.[nfflStatField]||{});
                  }} style={{width:"100%"}}>
                    <option value="">Pick a player…</option>
                    {nfflPlayersL.map(p=><option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}
                  </select>
                </div>
                <div style={{marginBottom:10}}>
                  <Lbl>Stat Category</Lbl>
                  <select value={nfflStatField} onChange={e=>{setNfflStatField(e.target.value);const p=nfflPlayersL.find(x=>x.id===nfflStatTarget);setNfflStatData(p?.[e.target.value]||{});}} style={{width:"100%"}}>
                    {NFL_STAT_FIELDS.map(([k,l])=><option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
                {nfflStatTarget&&(()=>{
                  const fields=NFL_STAT_FIELDS.find(([k])=>k===nfflStatField)?.[2]||[];
                  return(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                      {fields.map(f=>(
                        <div key={f}>
                          <Lbl>{f}</Lbl>
                          <input value={nfflStatData[f]||""} onChange={e=>setNfflStatData(p=>({...p,[f]:e.target.value}))} placeholder="—" style={{textAlign:"center"}}/>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <Btn onClick={saveStats} disabled={nfflStatSaving||!nfflStatTarget}>{nfflStatSaving?"Saving…":"💾 Save Stats"}</Btn>
              </Card>
            </div>
          )}
        </div>
      );
}

function DashNBBLTab({cu}){
      const[nbblFeedL,setNbblFeedL]=useState([]);
      const[nbblPlayersL,setNbblPlayersL]=useState([]);
      const[nbblTab,setNbblTab]=useState("feed");
      const[nbblLoaded,setNbblLoaded]=useState(false);
      const[nbblPostTitle,setNbblPostTitle]=useState("");
      const[nbblPostContent,setNbblPostContent]=useState("");
      const[nbblSaving,setNbblSaving]=useState(false);
      const[nbblStatTarget,setNbblStatTarget]=useState(null);
      const[nbblStatField,setNbblStatField]=useState("hitting_stats");
      const[nbblStatData,setNbblStatData]=useState({});
      const[nbblStatSaving,setNbblStatSaving]=useState(false);
      useEffect(()=>{
        if(nbblLoaded)return;
        Promise.all([
          sb.get("nova_nbbl_feed","?order=ts.desc&limit=50"),
          sb.get("nova_nbbl_players","?order=name.asc"),
        ]).then(([f,p])=>{setNbblFeedL(f||[]);setNbblPlayersL(p||[]);setNbblLoaded(true);});
      },[]);
      const postFeed=async()=>{
        if(!nbblPostContent.trim())return;
        setNbblSaving(true);
        const post={id:gid(),title:nbblPostTitle.trim(),content:nbblPostContent.trim(),author_id:cu?.id,author_name:cu?.display_name,ts:Date.now()};
        await sb.post("nova_nbbl_feed",post);
        setNbblFeedL(p=>[post,...p]);setNbblPostTitle("");setNbblPostContent("");setNbblSaving(false);
      };
      const deleteFeed=async(id)=>{await sb.del("nova_nbbl_feed",`?id=eq.${id}`);setNbblFeedL(p=>p.filter(x=>x.id!==id));};
      const saveStats=async()=>{
        if(!nbblStatTarget)return;
        setNbblStatSaving(true);
        await sb.patch("nova_nbbl_players",`?id=eq.${nbblStatTarget}`,{[nbblStatField]:nbblStatData});
        setNbblPlayersL(p=>p.map(x=>x.id===nbblStatTarget?{...x,[nbblStatField]:nbblStatData}:x));
        setNbblStatSaving(false);alert("Stats saved!");
      };
      const NBBL_STAT_FIELDS=[
        ["hitting_stats","⚾ Hitting",["G","AB","R","H","2B","3B","HR","RBI","BB","SO","SB","AVG","OBP","SLG","OPS"]],
        ["pitching_stats","⚾ Pitching",["G","GS","W","L","SV","IP","H","R","ER","BB","SO","ERA","WHIP","K9","BB9"]],
        ["fielding_stats","🧤 Fielding",["G","GS","PO","A","E","DP","FLD%","INN"]],
      ];
      return(
        <div>
          <div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap"}}>
            {[["feed","📢 Feed"],["roster","👥 Roster"],["stats","📊 Stats"]].map(([t,l])=>(
              <button key={t} onClick={()=>setNbblTab(t)} style={{padding:"6px 14px",borderRadius:14,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,border:`1px solid ${nbblTab===t?"rgba(34,197,94,.5)":"rgba(255,255,255,.1)"}`,background:nbblTab===t?"rgba(34,197,94,.12)":"rgba(255,255,255,.03)",color:nbblTab===t?"#22C55E":"#64748B"}}>{l}</button>
            ))}
          </div>
          {nbblTab==="feed"&&(
            <div>
              <Card style={{padding:"16px",marginBottom:14}} hover={false}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#22C55E",marginBottom:10,fontWeight:700}}>📢 POST GAME UPDATE</div>
                <input value={nbblPostTitle} onChange={e=>setNbblPostTitle(e.target.value)} placeholder="Title (e.g. Game 1 — Red Sox vs Yankees)…" style={{marginBottom:8}}/>
                <textarea value={nbblPostContent} onChange={e=>setNbblPostContent(e.target.value)} rows={3} placeholder="Game recap, scores, highlights…" style={{marginBottom:8,resize:"vertical"}}/>
                <Btn onClick={postFeed} disabled={nbblSaving||!nbblPostContent.trim()}>{nbblSaving?"Posting…":"📢 Post"}</Btn>
              </Card>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {nbblFeedL.map(f=>(
                  <Card key={f.id} style={{padding:"12px 14px"}} hover={false}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        {f.title&&<div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#22C55E",fontWeight:700,marginBottom:4}}>{f.title}</div>}
                        <div style={{fontSize:12,color:"#94A3B8"}}>{f.content}</div>
                        <div style={{fontSize:9,color:"#334155",marginTop:6}}>{new Date(f.ts).toLocaleDateString()}</div>
                      </div>
                      <button onClick={()=>deleteFeed(f.id)} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:14,marginLeft:8}}>🗑</button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {nbblTab==="roster"&&(
            <div>
              <Card style={{padding:"16px",marginBottom:14}} hover={false}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#22C55E",marginBottom:10,fontWeight:700}}>➕ ADD PLAYER</div>
                <AddLeaguePlayer league="nbbl" onAdd={p=>{setNbblPlayersL(prev=>[...prev,p]);}} cu={cu}/>
              </Card>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {nbblPlayersL.map((p,i)=>(
                  <Card key={i} style={{padding:"10px 12px"}} hover={false}>
                    <div style={{fontWeight:700,color:"#E2E8F0",fontSize:12}}>{p.name}</div>
                    <div style={{fontSize:10,color:"#22C55E"}}>{p.position}{p.jersey?` · #${p.jersey}`:""}</div>
                    <div style={{fontSize:10,color:"#475569"}}>{p.team}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {nbblTab==="stats"&&(
            <div>
              <Card style={{padding:"16px"}} hover={false}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#22C55E",marginBottom:12,fontWeight:700}}>📊 ENTER PLAYER STATS</div>
                <div style={{marginBottom:10}}>
                  <Lbl>Select Player</Lbl>
                  <select value={nbblStatTarget||""} onChange={e=>{
                    setNbblStatTarget(e.target.value);
                    const p=nbblPlayersL.find(x=>x.id===e.target.value);
                    setNbblStatData(p?.[nbblStatField]||{});
                  }} style={{width:"100%"}}>
                    <option value="">Pick a player…</option>
                    {nbblPlayersL.map(p=><option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}
                  </select>
                </div>
                <div style={{marginBottom:10}}>
                  <Lbl>Stat Category</Lbl>
                  <select value={nbblStatField} onChange={e=>{setNbblStatField(e.target.value);const p=nbblPlayersL.find(x=>x.id===nbblStatTarget);setNbblStatData(p?.[e.target.value]||{});}} style={{width:"100%"}}>
                    {NBBL_STAT_FIELDS.map(([k,l])=><option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
                {nbblStatTarget&&(()=>{
                  const fields=NBBL_STAT_FIELDS.find(([k])=>k===nbblStatField)?.[2]||[];
                  return(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                      {fields.map(f=>(
                        <div key={f}>
                          <Lbl>{f}</Lbl>
                          <input value={nbblStatData[f]||""} onChange={e=>setNbblStatData(p=>({...p,[f]:e.target.value}))} placeholder="—" style={{textAlign:"center"}}/>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <Btn onClick={saveStats} disabled={nbblStatSaving||!nbblStatTarget}>{nbblStatSaving?"Saving…":"💾 Save Stats"}</Btn>
              </Card>
            </div>
          )}
        </div>
      );
}

function LeaguePlayersPage({players,league,accentColor,users,navigate}){
  const mob=useIsMobile();
  const[sel,setSel]=useState(null);
  const isBaseball=league==="nbbl";
  const selectedPlayer=sel?players.find(p=>p.id===sel):null;

  // Match a league player to a Nova member by name similarity
  const matchMember=(playerName)=>{
    if(!playerName)return null;
    const n=playerName.toLowerCase();
    return users.find(u=>
      (u.display_name||"").toLowerCase().includes(n)||
      n.includes((u.display_name||"").toLowerCase())||
      (u.username||"").toLowerCase()===n
    );
  };

  if(sel&&selectedPlayer){
    const member=matchMember(selectedPlayer.name);
    const robloxId=member?.social_roblox||member?.roblox_id||"";
    const robloxAvatarUrl=robloxId?`/api/roblox-avatar?userId=${robloxId}`:"";
    const favSong=member?.page_music;
    const songTrack=Array.isArray(favSong)?favSong[0]:favSong;
    const hitting=selectedPlayer.hitting_stats||{};
    const pitching=selectedPlayer.pitching_stats||{};
    const fielding=selectedPlayer.fielding_stats||{};
    const passing=selectedPlayer.passing_stats||{};
    const rushing=selectedPlayer.rushing_stats||{};
    const receiving=selectedPlayer.receiving_stats||{};

    const MLB_HIT_COLS=["G","AB","R","H","2B","3B","HR","RBI","BB","SO","SB","AVG","OBP","SLG","OPS"];
    const MLB_PIT_COLS=["G","GS","W","L","SV","IP","H","ER","BB","SO","ERA","WHIP"];
    const MLB_FLD_COLS=["G","PO","A","E","DP","FLD%"];
    const NFL_PASS_COLS=["G","CMP","ATT","YDS","TD","INT","RTG"];
    const NFL_RUSH_COLS=["G","CAR","YDS","TD","AVG","LONG"];
    const NFL_REC_COLS=["G","REC","YDS","TD","AVG","LONG"];

    const StatTable=({title,cols,data,color})=>{
      const hasData=cols.some(c=>data[c]||data[c.toLowerCase()]);
      if(!hasData)return null;
      return(
        <Card style={{padding:"14px 16px",marginBottom:10}} hover={false}>
          <div style={{fontSize:9,color:color||accentColor,fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:10,fontWeight:700}}>{title}</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                {cols.map(c=><td key={c} style={{padding:"5px 8px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>{c}</td>)}
              </tr></thead>
              <tbody><tr>
                {cols.map(c=><td key={c} style={{padding:"6px 8px",textAlign:"center",color:"#E2E8F0",fontWeight:600,fontSize:12}}>{data[c]??data[c.toLowerCase()]??"—"}</td>)}
              </tr></tbody>
            </table>
          </div>
        </Card>
      );
    };

    return(
      <div>
        <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12,marginBottom:16,display:"flex",alignItems:"center",gap:5,fontFamily:"'Orbitron',sans-serif"}}>← BACK</button>

        {/* Player hero card */}
        <Card style={{padding:mob?"16px":"20px 24px",marginBottom:14}} hover={false}>
          <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
            {/* Roblox avatar or fallback */}
            <div style={{width:mob?72:90,height:mob?72:90,borderRadius:12,overflow:"hidden",background:`linear-gradient(135deg,${accentColor}22,rgba(255,255,255,.04))`,border:`2px solid ${accentColor}44`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {robloxAvatarUrl
                ?<img src={robloxAvatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                :<div style={{fontSize:36}}>{isBaseball?"⚾":"🏈"}</div>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:20,fontWeight:900,color:"#E2E8F0",marginBottom:4}}>{selectedPlayer.name}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
                <span style={{fontSize:11,color:accentColor,fontWeight:700,fontFamily:"'Orbitron',sans-serif"}}>{selectedPlayer.position}</span>
                {selectedPlayer.team&&<span style={{fontSize:11,color:"#64748B"}}>· {selectedPlayer.team}</span>}
                {selectedPlayer.jersey&&<span style={{fontSize:11,color:"#475569"}}>· #{selectedPlayer.jersey}</span>}
              </div>
              {/* Favorite song */}
              {songTrack?.url&&(
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(255,255,255,.04)",borderRadius:8,border:"1px solid rgba(255,255,255,.07)",marginTop:4,maxWidth:280}}>
                  {songTrack.thumbnail&&<img src={songTrack.thumbnail} style={{width:28,height:28,borderRadius:4,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>}
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".08em"}}>🎵 ANTHEM</div>
                    <div style={{fontSize:10,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{songTrack.title||"Playing…"}</div>
                  </div>
                </div>
              )}
              {/* Link to Nova profile */}
              {member&&<button onClick={()=>navigate("profile",member.id)} style={{marginTop:8,padding:"4px 12px",borderRadius:8,background:`${accentColor}18`,border:`1px solid ${accentColor}44`,color:accentColor,fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>View Nova Profile →</button>}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:10}}>CAREER STATS</div>
        {isBaseball&&(
          <>
            <StatTable title="⚾ HITTING" cols={MLB_HIT_COLS} data={hitting}/>
            <StatTable title="⚾ PITCHING" cols={MLB_PIT_COLS} data={pitching} color="#3B82F6"/>
            <StatTable title="🧤 FIELDING" cols={MLB_FLD_COLS} data={fielding} color="#A855F7"/>
          </>
        )}
        {!isBaseball&&(
          <>
            <StatTable title="🏈 PASSING" cols={NFL_PASS_COLS} data={passing}/>
            <StatTable title="🏃 RUSHING" cols={NFL_RUSH_COLS} data={rushing} color="#EF4444"/>
            <StatTable title="📡 RECEIVING" cols={NFL_REC_COLS} data={receiving} color="#8B5CF6"/>
          </>
        )}
        {/* No stats fallback */}
        {!Object.values(isBaseball?{...hitting,...pitching,...fielding}:{...passing,...rushing,...receiving}).some(Boolean)&&(
          <div style={{textAlign:"center",padding:"30px 0",color:"#334155",fontSize:12}}>No stats recorded yet for this player</div>
        )}
      </div>
    );
  }

  // Player list view
  return(
    <div>
      <div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:12}}>{players.length} PLAYERS</div>
      {!players.length&&<Empty icon={isBaseball?"⚾":"🏈"} msg="No players yet"/>}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
        {players.map((p,i)=>{
          const member=matchMember(p.name);
          const robloxId=member?.social_roblox||member?.roblox_id||"";
          const robloxAvatarUrl=robloxId?`/api/roblox-avatar?userId=${robloxId}`:"";
          return(
            <div key={i} onClick={()=>setSel(p.id)}
              style={{background:"rgba(255,255,255,.03)",border:`1px solid ${accentColor}22`,borderRadius:12,padding:"14px",cursor:"pointer",transition:"all .18s",display:"flex",gap:12,alignItems:"center"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=accentColor+"66";e.currentTarget.style.background=`${accentColor}0a`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=`${accentColor}22`;e.currentTarget.style.background="rgba(255,255,255,.03)";}}>
              <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",background:`${accentColor}18`,border:`1px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {robloxAvatarUrl
                  ?<img src={robloxAvatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";e.target.parentNode.innerHTML=isBaseball?"⚾":"🏈";}}/>
                  :<span style={{fontSize:20}}>{isBaseball?"⚾":"🏈"}</span>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{fontSize:10,color:accentColor,fontWeight:600}}>{p.position}{p.jersey?` · #${p.jersey}`:""}</div>
                {p.team&&<div style={{fontSize:9,color:"#475569"}}>{p.team}</div>}
              </div>
              <span style={{color:"#334155",fontSize:12}}>›</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardPage({cu,users,setUsers,navigate}){
  const mob=useIsMobile();
  const[sel,setSel]=useState(null);
  const[tab,setTab]=useState("members");
  const[announce,setAnnounce]=useState("");
  const[announcements,setAnnouncements]=useState([]);
  const[announceSent,setAnnounceSent]=useState(false);
  const target=sel?users.find(u=>u.id===sel):null;
  const[starTarget,setStarTarget]=useState("");
  const[starAmount,setStarAmount]=useState("");
  const[starReason,setStarReason]=useState("");
  const[starMsg,setStarMsg]=useState(null);
  const[starBalances,setStarBalances]=useState({});
  const[starLoading,setStarLoading]=useState(false);
  const isCoOwner=cu?.staff_role==="Co-owner";
  if(!cu?.is_owner&&!isCoOwner)return<div style={{padding:"100px 20px",textAlign:"center",color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>⛔ Access Denied</div>;

  const loadStarBalance=async(uid)=>{
    if(starBalances[uid]!==undefined)return;
    const rows=await sb.get("nova_stars",`?user_id=eq.${uid}&limit=1`);
    setStarBalances(p=>({...p,[uid]:rows?.[0]?.balance||0}));
  };

  const giveStars=async()=>{
    const amt=parseInt(starAmount);
    if(!starTarget||!amt||isNaN(amt)){setStarMsg({msg:"Pick a user and enter an amount","color":"#EF4444"});return;}
    setStarLoading(true);
    const rows=await sb.get("nova_stars",`?user_id=eq.${starTarget}&limit=1`);
    const reason=starReason.trim()||"Owner grant";
    if(rows?.length){
      const nb=(rows[0].balance||0)+amt;
      const nl=(rows[0].lifetime_earned||0)+(amt>0?amt:0);
      await sb.patch("nova_stars",`?user_id=eq.${starTarget}`,{balance:Math.max(0,nb),lifetime_earned:nl});
      setStarBalances(p=>({...p,[starTarget]:Math.max(0,nb)}));
    }else{
      const nb=Math.max(0,amt);
      await sb.post("nova_stars",{user_id:starTarget,balance:nb,lifetime_earned:nb>0?nb:0,last_login_claim:0,login_streak:0});
      setStarBalances(p=>({...p,[starTarget]:nb}));
    }
    await sb.post("nova_star_log",{id:gid(),user_id:starTarget,amount:amt,reason:`[OWNER] ${reason}`,ts:Date.now()});
    const u=users.find(x=>x.id===starTarget);
    setStarMsg({msg:`${amt>0?"+":" "}${amt} ⭐ ${amt>0?"given to":"taken from"} ${u?.display_name||"user"}`,color:amt>0?"#22C55E":"#EF4444"});
    setStarAmount("");setStarReason("");
    setStarLoading(false);
    setTimeout(()=>setStarMsg(null),3000);
  };
  const toggleBadge=async(uid,bid)=>{
    const u=users.find(x=>x.id===uid);if(!u)return;
    const bs=u.badges||[];const nb=bs.includes(bid)?bs.filter(b=>b!==bid):[...bs,bid];
    await sb.patch("nova_users",`?id=eq.${uid}`,{badges:nb});
    setUsers(prev=>prev.map(x=>x.id===uid?{...x,badges:nb}:x));
  };
  const setRole=async(uid,role)=>{
    await sb.patch("nova_users",`?id=eq.${uid}`,{staff_role:role||null});
    setUsers(prev=>prev.map(x=>x.id===uid?{...x,staff_role:role||null}:x));
  };
  const deleteUser=async uid=>{
    if(!confirm("Permanently delete this user? This cannot be undone."))return;
    await sb.del("nova_users",`?id=eq.${uid}`);
    setUsers(prev=>prev.filter(u=>u.id!==uid));setSel(null);
  };
  const resetAvatar=async uid=>{
    await sb.patch("nova_users",`?id=eq.${uid}`,{avatar_url:"",avatar:"👤"});
    setUsers(prev=>prev.map(x=>x.id===uid?{...x,avatar_url:"",avatar:"👤"}:x));
  };
  const sendAnnouncement=async()=>{
    if(!announce.trim())return;
    const notifs=users.filter(u=>u.id!==cu.id).map(u=>({id:gid(),to_user_id:u.id,from_user_id:cu.id,msg:`📢 ${announce}`,ts:Date.now(),read:false}));
    await Promise.all(notifs.map(n=>sb.post("nova_notifications",n)));
    setAnnouncements(prev=>[{text:announce,ts:Date.now()},...prev]);
    setAnnounce("");setAnnounceSent(true);setTimeout(()=>setAnnounceSent(false),3000);
  };
  const statsCards=[
    {label:"TOTAL MEMBERS",val:users.length,color:"#00D4FF",icon:"👥"},
    {label:"ONLINE NOW",val:users.filter(u=>u.status_type==="online").length,color:"#22C55E",icon:"🟢"},
    {label:"STAFF MEMBERS",val:users.filter(u=>u.staff_role).length,color:"#A78BFA",icon:"⭐"},
    {label:"BADGES GIVEN",val:users.reduce((a,u)=>a+(u.badges||[]).length,0),color:"#F59E0B",icon:"🏅"},
    {label:"TOTAL PREDICTIONS",val:users.reduce((a,u)=>a+Object.keys(u.predictions||{}).length,0),color:"#EF4444",icon:"🎯"},
    {label:"AVG FOLLOWERS",val:users.length?Math.round(users.reduce((a,u)=>a+(u.followers||[]).length,0)/users.length):0,color:"#34D399",icon:"📈"},
  ];
  return(
    <div style={{maxWidth:1200,margin:"0 auto",padding:"44px 16px 80px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
        <div style={{fontSize:32}}>⚡</div>
        <div>
          <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?20:26,fontWeight:700,margin:0,background:"linear-gradient(135deg,#F59E0B,#EF4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Owner Dashboard</h1>
          <div style={{fontSize:12,color:"#475569",marginTop:2}}>Nova Command Center · Welcome back, {cu.display_name}</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(3,1fr)",gap:12,marginBottom:28}}>
        {statsCards.map((s,i)=>(
          <Card key={i} style={{padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:24}}>{s.icon}</div>
              <div>
                <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".12em"}}>{s.label}</div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:24,fontWeight:900,color:s.color}}>{s.val}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {[["members","👥 Members"],["badges","🏅 Badges"],["roles","⭐ Roles"],["stars","⭐ Stars"],["announce","📢 Announce"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"rgba(245,158,11,.5)":"rgba(255,255,255,.1)"}`,background:tab===t?"rgba(245,158,11,.12)":"rgba(255,255,255,.03)",color:tab===t?"#F59E0B":"#64748B",transition:"all .2s"}}>{l}</button>
        ))}
      </div>
      {tab==="members"&&(
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":sel?"1fr 1fr":"1fr",gap:16}}>
          <div>
            <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#94A3B8",marginBottom:12,letterSpacing:".1em"}}>ALL MEMBERS ({users.length})</h2>
            <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:600,overflowY:"auto"}}>
              {[...users].sort((a,b)=>(b.followers||[]).length-(a.followers||[]).length).map(u=>(
                <div key={u.id} onClick={()=>setSel(u.id===sel?null:u.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,background:sel===u.id?"rgba(245,158,11,.1)":"rgba(255,255,255,.03)",border:`1px solid ${sel===u.id?"rgba(245,158,11,.3)":"rgba(255,255,255,.07)"}`,cursor:"pointer",transition:"all .18s"}}>
                  <Av user={u} size={36}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.display_name}</div>
                    <div style={{fontSize:11,color:"#475569"}}>@{u.username}{u.staff_role&&<span style={{color:ROLE_COLOR[u.staff_role]||"#00D4FF"}}> · {u.staff_role}</span>}</div>
                    <div style={{fontSize:10,color:"#334155"}}>{(u.followers||[]).length} followers · {(u.badges||[]).length} badges</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <StatusDot type={u.status_type||"offline"} size={10}/>
                    {u.is_owner&&<span style={{fontSize:9,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif"}}>OWNER</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {target&&(
            <div>
              <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#94A3B8",marginBottom:12,letterSpacing:".1em"}}>MANAGING: {target.display_name.toUpperCase()}</h2>
              <Card style={{padding:20,display:"flex",flexDirection:"column",gap:16}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <Av user={target} size={52}/>
                  <div>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:"#E2E8F0"}}>{target.display_name}</div>
                    <div style={{fontSize:12,color:"#475569"}}>@{target.username}</div>
                    <div style={{fontSize:11,color:"#334155",marginTop:2}}>Joined {target.joined} · {(target.followers||[]).length} followers</div>
                  </div>
                </div>
                <div><Lbl>Staff Role</Lbl>
                  <select value={target.staff_role||""} onChange={e=>setRole(target.id,e.target.value)} style={{width:"100%"}}>
                    <option value="">None</option>
                    {Object.keys(ROLE_COLOR).map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div><Lbl>Badges</Lbl>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {BADGES.map(b=>{const has=(target.badges||[]).includes(b.id);return(
                      <button key={b.id} onClick={()=>toggleBadge(target.id,b.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,cursor:"pointer",border:`1.5px solid ${has?b.color:b.color+"33"}`,background:has?b.color+"22":"rgba(255,255,255,.03)",color:has?b.color:"#475569",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,transition:"all .15s"}}><span>{b.icon}</span>{b.label}</button>
                    );})}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <Btn variant="ghost" size="sm" onClick={()=>navigate("profile",target.id)}>👤 View Profile</Btn>
                  <Btn variant="ghost" size="sm" onClick={()=>resetAvatar(target.id)}>🗑 Reset Avatar</Btn>
                  {!target.is_owner&&<Btn variant="danger" size="sm" onClick={()=>deleteUser(target.id)}>⛔ Delete User</Btn>}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
      {tab==="badges"&&(
        <div>
          <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#94A3B8",marginBottom:16,letterSpacing:".1em"}}>BADGE OVERVIEW</h2>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(2,1fr)",gap:12}}>
            {BADGES.map(b=>{
              const holders=users.filter(u=>(u.badges||[]).includes(b.id));
              return(
                <Card key={b.id} style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:b.color+"22",border:`1px solid ${b.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{b.icon}</div>
                    <div>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:b.color}}>{b.label}</div>
                      <div style={{fontSize:11,color:"#475569"}}>{holders.length} member{holders.length!==1?"s":""} have this</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {holders.slice(0,8).map(u=>(
                      <div key={u.id} onClick={()=>{setTab("members");setSel(u.id);}} title={u.display_name} style={{cursor:"pointer"}}><Av user={u} size={28}/></div>
                    ))}
                    {holders.length>8&&<div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#475569"}}>+{holders.length-8}</div>}
                    {holders.length===0&&<div style={{fontSize:11,color:"#334155"}}>No members yet</div>}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      {tab==="roles"&&(
        <div>
          <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#94A3B8",marginBottom:16,letterSpacing:".1em"}}>STAFF ROLES</h2>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(2,1fr)",gap:12,marginBottom:20}}>
            {Object.entries(ROLE_COLOR).map(([role,color])=>{
              const members=users.filter(u=>u.staff_role===role);
              return(
                <Card key={role} style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:color}}/>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color}}>{role}</div>
                    <div style={{fontSize:11,color:"#475569",marginLeft:"auto"}}>{members.length} member{members.length!==1?"s":""}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {members.map(u=>(
                      <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:8,background:"rgba(255,255,255,.03)"}}>
                        <Av user={u} size={26}/>
                        <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:"#E2E8F0"}}>{u.display_name}</div><div style={{fontSize:10,color:"#475569"}}>@{u.username}</div></div>
                        <button onClick={()=>setRole(u.id,"")} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:12}} title="Remove role">✕</button>
                      </div>
                    ))}
                    {members.length===0&&<div style={{fontSize:11,color:"#334155"}}>No {role}s yet</div>}
                  </div>
                </Card>
              );
            })}
          </div>
          <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#94A3B8",marginBottom:12,letterSpacing:".1em"}}>QUICK ASSIGN</h2>
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:300,overflowY:"auto"}}>
            {users.filter(u=>!u.is_owner).map(u=>(
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)"}}>
                <Av user={u} size={30}/>
                <div style={{flex:1}}><div style={{fontSize:12,color:"#E2E8F0"}}>{u.display_name}</div></div>
                <select value={u.staff_role||""} onChange={e=>setRole(u.id,e.target.value)} style={{fontSize:11,padding:"4px 8px",borderRadius:8,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",minWidth:110}}>
                  <option value="">No Role</option>
                  {Object.keys(ROLE_COLOR).map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="stars"&&(
        <div style={{maxWidth:600}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#94A3B8",marginBottom:16,letterSpacing:".12em"}}>⭐ STAR MANAGEMENT</div>
          <Card style={{padding:20,marginBottom:16}}>
            <Lbl>Select Member</Lbl>
            <select value={starTarget} onChange={e=>{setStarTarget(e.target.value);if(e.target.value)loadStarBalance(e.target.value);}} style={{width:"100%",marginBottom:14}}>
              <option value="">— Pick a member —</option>
              {[...users].sort((a,b)=>a.display_name.localeCompare(b.display_name)).map(u=>(
                <option key={u.id} value={u.id}>{u.display_name} (@{u.username})</option>
              ))}
            </select>
            {starTarget&&(
              <div style={{fontSize:11,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",marginBottom:14}}>
                Current balance: {starBalances[starTarget]!==undefined?`${starBalances[starTarget].toLocaleString()} ⭐`:"loading..."}
              </div>
            )}
            <Lbl>Amount (use negative to remove stars)</Lbl>
            <input type="number" value={starAmount} onChange={e=>setStarAmount(e.target.value)} placeholder="e.g. 500 or -100" style={{marginBottom:12}}/>
            <Lbl>Reason (optional)</Lbl>
            <input value={starReason} onChange={e=>setStarReason(e.target.value)} placeholder="e.g. Community event prize" style={{marginBottom:16}}/>
            {starMsg&&<div style={{padding:"10px 14px",borderRadius:8,background:starMsg.color+"18",border:`1px solid ${starMsg.color}44`,color:starMsg.color,fontSize:12,fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginBottom:12}}>{starMsg.msg}</div>}
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={giveStars} disabled={starLoading||!starTarget||!starAmount} style={{flex:1}}>{starLoading?"Working...":"⭐ Apply Stars"}</Btn>
              <Btn variant="ghost" onClick={async()=>{
                const allRows=await sb.get("nova_stars","?order=balance.desc&limit=20");
                const updated={};
                (allRows||[]).forEach(r=>{updated[r.user_id]=r.balance||0;});
                setStarBalances(p=>({...p,...updated}));
              }}>Refresh All</Btn>
            </div>
          </Card>
          <Card style={{padding:16}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",letterSpacing:".12em",marginBottom:12}}>TOP STAR BALANCES</div>
            {Object.entries(starBalances).length===0&&<div style={{fontSize:11,color:"#334155"}}>Click "Refresh All" to load balances</div>}
            {Object.entries(starBalances).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([uid,bal])=>{
              const u=users.find(x=>x.id===uid);if(!u)return null;
              return(
                <div key={uid} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.05)",cursor:"pointer"}} onClick={()=>{setStarTarget(uid);setTab("stars");}}>
                  <Av user={u} size={28}/>
                  <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif"}}>{u.display_name}</div></div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#F59E0B"}}>{bal.toLocaleString()} ⭐</div>
                </div>
              );
            })}
          </Card>
        </div>
      )}
      {tab==="announce"&&(
        <div style={{maxWidth:600}}>
          <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#94A3B8",marginBottom:16,letterSpacing:".1em"}}>SEND ANNOUNCEMENT</h2>
          <Card style={{padding:20,marginBottom:20}}>
            <Lbl>Message (sent as notification to all members)</Lbl>
            <textarea value={announce} onChange={e=>setAnnounce(e.target.value)} placeholder="Type your announcement..." style={{resize:"vertical",minHeight:100,width:"100%",marginBottom:12,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <Btn onClick={sendAnnouncement} disabled={!announce.trim()}>📢 Send to All</Btn>
              {announceSent&&<span style={{fontSize:12,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}>✓ Sent!</span>}
            </div>
          </Card>
          {announcements.length>0&&(
            <div>
              <h3 style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#475569",marginBottom:10,letterSpacing:".1em"}}>RECENT ANNOUNCEMENTS</h3>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {announcements.map((a,i)=>(
                  <Card key={i} style={{padding:"12px 16px"}}>
                    <div style={{fontSize:13,color:"#E2E8F0",marginBottom:4}}>{a.text}</div>
                    <div style={{fontSize:10,color:"#334155"}}>{fmtAgo(a.ts)}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {tab==="nffl"&&<DashNFFLTab cu={cu}/>}
      {tab==="nbbl"&&<DashNBBLTab cu={cu}/>}
    </div>
  );
}

// ─── News Page ────────────────────────────────────────────────────────────────
// Uses ESPN news API + GNews RSS — no Twitter/Nitter dependency
const ESPN_NEWS_SOURCES=[
  {id:"mlb",  url:"https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news?limit=20",     label:"MLB News",      sport:"⚾", color:"#002D72"},
  {id:"nfl",  url:"https://site.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=20",     label:"NFL News",      sport:"🏈", color:"#013369"},
  {id:"nba",  url:"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?limit=20",   label:"NBA News",      sport:"🏀", color:"#C9082A"},
  {id:"nhl",  url:"https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/news?limit=20",       label:"NHL News",      sport:"🏒", color:"#0033A0"},
];

// Source label overrides for known ESPN reporters/sections
const REPORTER_TAGS={"Jeff Passan":"⚾","Adam Schefter":"🏈","Dianna Russini":"🏈","Mel Kiper":"🏈","Buster Olney":"⚾","Tim Kurkjian":"⚾"};

const TEAM_KEYWORDS={
  "Yankees":["Yankees","NYY"],"Red Sox":["Red Sox","BOS"],"Mets":["Mets","NYM"],
  "Dodgers":["Dodgers","LAD"],"Cubs":["Cubs","CHC"],"Cardinals":["Cardinals","STL"],
  "Braves":["Braves","ATL"],"Astros":["Astros","HOU"],"Giants":["Giants","SFG","SF Giants"],
  "Padres":["Padres","SD Padres"],"Phillies":["Phillies","PHI"],"Brewers":["Brewers","MIL"],
  "Rays":["Rays","Tampa Bay Rays"],"Blue Jays":["Blue Jays","TOR"],"Orioles":["Orioles","BAL"],
  "White Sox":["White Sox","CWS"],"Royals":["Royals","Kansas City Royals"],"Twins":["Twins","Minnesota Twins"],
  "Guardians":["Guardians","Cleveland Guardians"],"Tigers":["Tigers","Detroit Tigers"],
  "Mariners":["Mariners","Seattle Mariners"],"Angels":["Angels","LA Angels"],"Athletics":["Athletics","Oakland A's"],
  "Rangers":["Rangers","Texas Rangers"],"Rockies":["Rockies","Colorado Rockies"],
  "Marlins":["Marlins","Miami Marlins"],"Nationals":["Nationals","Washington Nationals"],
  "Pirates":["Pirates","Pittsburgh Pirates"],"Reds":["Reds","Cincinnati Reds"],
  "Diamondbacks":["Diamondbacks","Arizona D-backs"],
  "Chiefs":["Chiefs","Kansas City Chiefs"],"Eagles":["Eagles","Philadelphia Eagles"],
  "Cowboys":["Cowboys","Dallas Cowboys"],"49ers":["49ers","San Francisco 49ers"],
  "Bills":["Bills","Buffalo Bills"],"Dolphins":["Dolphins","Miami Dolphins"],
  "Patriots":["Patriots","New England Patriots"],"Jets":["Jets","New York Jets"],
  "Ravens":["Ravens","Baltimore Ravens"],"Steelers":["Steelers","Pittsburgh Steelers"],
  "Browns":["Browns","Cleveland Browns"],"Bengals":["Bengals","Cincinnati Bengals"],
  "Texans":["Texans","Houston Texans"],"Colts":["Colts","Indianapolis Colts"],
  "Jaguars":["Jaguars","Jacksonville Jaguars"],"Titans":["Titans","Tennessee Titans"],
  "Broncos":["Broncos","Denver Broncos"],"Raiders":["Raiders","Las Vegas Raiders"],
  "Chargers":["Chargers","LA Chargers"],"Seahawks":["Seahawks","Seattle Seahawks"],
  "Rams":["Rams","LA Rams"],"Packers":["Packers","Green Bay Packers"],
  "Bears":["Bears","Chicago Bears"],"Lions":["Lions","Detroit Lions"],
  "Vikings":["Vikings","Minnesota Vikings"],"Saints":["Saints","New Orleans Saints"],
  "Falcons":["Falcons","Atlanta Falcons"],"Panthers":["Panthers","Carolina Panthers"],
  "Buccaneers":["Buccaneers","Tampa Bay Bucs"],"Commanders":["Commanders","Washington Commanders"],
  "Giants (NFL)":["NY Giants","New York Giants"],"Cardinals (NFL)":["Arizona Cardinals"],
  "Lakers":["Lakers","Los Angeles Lakers"],"Celtics":["Celtics","Boston Celtics"],
};

function detectTeams(text){
  if(!text)return[];
  const found=[];
  for(const[team,kws] of Object.entries(TEAM_KEYWORDS)){
    if(kws.some(kw=>new RegExp(`\\b${kw.replace(/[()]/g,"\\$&")}\\b`,"i").test(text))&&!found.includes(team))found.push(team);
  }
  return found.slice(0,4);
}

async function fetchESPNNews(){
  const all=[];
  await Promise.allSettled(ESPN_NEWS_SOURCES.map(async src=>{
    try{
      const d=await(await fetch(src.url)).json();
      (d.articles||[]).forEach(a=>{
        const headline=a.headline||a.title||"";
        const desc=a.description||a.summary||"";
        const fullText=headline+" "+desc;
        const imgUrl=a.images?.[0]?.url||null;
        const reporter=a.byline||null;
        const link=a.links?.web?.href||a.links?.api?.news?.href||"https://espn.com";
        const pubDate=a.published?new Date(a.published).getTime():Date.now();
        all.push({
          id:`espn_${src.id}_${a.id||a.dataSourceIdentifier||Math.random()}`,
          source:src,
          reporter,
          headline,
          desc,
          imgUrl,
          link,
          pubDate,
          teams:detectTeams(fullText),
          categories:(a.categories||[]).map(c=>c.description||c.type).filter(Boolean).slice(0,2),
        });
      });
    }catch{}
  }));
  // Dedup by headline similarity and sort newest first
  const seen=new Set();
  return all.filter(x=>{if(seen.has(x.headline))return false;seen.add(x.headline);return true;})
            .sort((a,b)=>b.pubDate-a.pubDate);
}

function NewsPage({cu,users,addNotif,navOpts={}}){
  const mob=useIsMobile();
  const[feed,setFeed]=useState([]);
  const[loading,setLoading]=useState(true);
  const[filter,setFilter]=useState("all");
  const[expandedId,setExpandedId]=useState(navOpts.expandId||null);
  const expandedRef=useRef(null);
  useEffect(()=>{
    if(navOpts.expandId){
      setExpandedId(navOpts.expandId);
      loadNewsComments(navOpts.expandId);
      setTimeout(()=>expandedRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),600);
    }
  },[navOpts.expandId]);
  const[comments,setComments]=useState({});
  const[commentTexts,setCommentTexts]=useState({});
  const notifiedRef=useRef(new Set());

  const loadFeed=async(quiet=false)=>{
    if(!quiet)setLoading(true);
    const items=await fetchESPNNews();
    setFeed(items);
    if(!quiet)setLoading(false);
    if(cu&&items.length){
      // Map user's team IDs (like "nfl_kc") to team name strings (like "Chiefs") for matching
      const allTeams=[...MLB_TEAMS,...NFL_TEAMS,...NBA_TEAMS,...NHL_TEAMS];
      const cuTeamNames=[cu.mlb_team,cu.nfl_team,cu.nba_team,cu.nhl_team]
        .filter(Boolean)
        .map(id=>allTeams.find(t=>t.id===id))
        .filter(Boolean)
        .flatMap(t=>[t.name.toLowerCase(),t.abbr.toLowerCase()]);
      items.forEach(item=>{
        if(notifiedRef.current.has(item.id))return;
        const match=item.teams.some(t=>cuTeamNames.some(cn=>cn===t.toLowerCase()||t.toLowerCase().includes(cn)||cn.includes(t.toLowerCase())));
        if(match){
          addNotif&&addNotif(cu.id,cu.id,`📰 ${item.headline.slice(0,80)}`,{type:"news",url:item.link});
          notifiedRef.current.add(item.id);
        }
      });
    }
  };

  useEffect(()=>{loadFeed();},[]);
  useEffect(()=>{const t=setInterval(()=>loadFeed(true),90000);return()=>clearInterval(t);},[]);

  // Load persisted comments for a news item when expanded
  const loadNewsComments=async(itemId)=>{
    if(comments[itemId])return;
    const rows=await sb.get("nova_comments",`?profile_user_id=eq.news_${itemId}&order=timestamp.desc`);
    setComments(prev=>({...prev,[itemId]:rows||[]}));
  };

  const toggleExpand=(itemId)=>{
    if(expandedId===itemId){setExpandedId(null);}
    else{setExpandedId(itemId);loadNewsComments(itemId);}
  };

  const postComment=async(itemId,imgUrl="")=>{
    const text=commentTexts[itemId]||"";
    if(!text.trim()&&!imgUrl||!cu)return;
    const msg=imgUrl?`__IMG__${imgUrl}`:text.trim();
    const c={id:gid(),profile_user_id:`news_${itemId}`,author_id:cu.id,author_name:cu.display_name,author_avatar:cu.avatar,author_avatar_url:cu.avatar_url||"",text:msg,timestamp:Date.now(),likes:[]};
    await sb.post("nova_comments",c);
    setComments(prev=>({...prev,[itemId]:[c,...(prev[itemId]||[])]}));
    setCommentTexts(prev=>({...prev,[itemId]:""}));
  };

  const[teamFilter,setTeamFilter]=useState("");
  // Build grouped team list from all 4 sports, alphabetically per sport, only teams in current feed
  const feedTeamSet=new Set(feed.flatMap(x=>x.teams));
  const groupedTeams=[
    {label:"⚾ MLB", teams:MLB_TEAMS.filter(t=>feedTeamSet.has(t.name)).map(t=>t.name).sort()},
    {label:"🏈 NFL", teams:NFL_TEAMS.filter(t=>feedTeamSet.has(t.name)).map(t=>t.name).sort()},
    {label:"🏀 NBA", teams:NBA_TEAMS.filter(t=>feedTeamSet.has(t.name)).map(t=>t.name).sort()},
    {label:"🏒 NHL", teams:NHL_TEAMS.filter(t=>feedTeamSet.has(t.name)).map(t=>t.name).sort()},
  ].filter(g=>g.teams.length>0);
  const displayed=(()=>{
    let items=filter==="all"?feed:feed.filter(x=>x.source.id===filter);
    if(teamFilter)items=items.filter(x=>x.teams.includes(teamFilter));
    return items;
  })();

  return(
    <div style={{maxWidth:800,margin:"0 auto",padding:"44px 16px 80px"}}>
      {/* Header */}
      <div style={{marginBottom:20}}>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?20:24,fontWeight:700,margin:"0 0 4px",background:"linear-gradient(135deg,#00D4FF,#8B5CF6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>📰 Sports News</h1>
        <div style={{fontSize:12,color:"#475569"}}>Powered by ESPN · updates every 90s</div>
      </div>

      {/* Filter tabs */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
        {[["all","🌐 All"],["mlb","⚾ MLB"],["nfl","🏈 NFL"],["nba","🏀 NBA"],["nhl","🏒 NHL"]].map(([id,label])=>(
          <button key={id} onClick={()=>setFilter(id)} style={{padding:"6px 14px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,border:`1px solid ${filter===id?"rgba(0,212,255,.5)":"rgba(255,255,255,.1)"}`,background:filter===id?"rgba(0,212,255,.12)":"rgba(255,255,255,.03)",color:filter===id?"#00D4FF":"#64748B",transition:"all .2s"}}>{label}</button>
        ))}
        <button onClick={()=>loadFeed()} style={{marginLeft:"auto",padding:"6px 12px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Rajdhani',sans-serif",fontWeight:600,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.03)",color:"#475569"}}>↻ Refresh</button>
      </div>

      {/* Team filter dropdown */}
      {groupedTeams.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <span style={{fontSize:11,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".08em",flexShrink:0}}>🏷 TEAM:</span>
          <select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)} style={{flex:1,maxWidth:240,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"6px 10px",color:teamFilter?"#00D4FF":"#64748B",fontSize:12,cursor:"pointer"}}>
            <option value="">All Teams</option>
            {groupedTeams.map(g=>(
              <optgroup key={g.label} label={g.label}>
                {g.teams.map(t=><option key={t} value={t} style={{background:"#0F172A"}}>{t}</option>)}
              </optgroup>
            ))}
          </select>
          {teamFilter&&<button onClick={()=>setTeamFilter("")} style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11,color:"#EF4444"}}>✕ Clear</button>}
        </div>
      )}

      {loading&&(
        <div style={{textAlign:"center",padding:"60px 0",color:"#334155"}}>
          <div className="spin" style={{fontSize:28,display:"inline-block",marginBottom:12}}>⚙️</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,letterSpacing:".15em"}}>FETCHING LATEST NEWS...</div>
        </div>
      )}

      {!loading&&displayed.length===0&&(
        <Empty icon="📡" msg="No news found. Try refreshing."/>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {displayed.map(item=>{
          const isExp=expandedId===item.id;
          const itemComments=comments[item.id]||[];
          const cmtText=commentTexts[item.id]||"";
          return(
            <Card key={item.id} ref={isExp?expandedRef:null} style={{padding:"14px 16px"}} hover={false}>
              {/* Source + timestamp */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:item.source.color+"33",border:`1px solid ${item.source.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{item.source.sport}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:item.source.color,letterSpacing:".08em"}}>{item.source.label}{item.reporter&&<span style={{color:"#475569",fontWeight:400}}> · {item.reporter}</span>}</div>
                  <div style={{fontSize:10,color:"#334155"}}>{fmtAgo(item.pubDate)}</div>
                </div>
                <a href={item.link} target="_blank" rel="noreferrer" style={{fontSize:13,color:"#334155",textDecoration:"none",flexShrink:0,padding:"4px 6px",borderRadius:6,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)"}} title="Read on ESPN">↗</a>
              </div>

              {/* Image */}
              {item.imgUrl&&<img src={item.imgUrl} style={{width:"100%",maxHeight:220,objectFit:"cover",borderRadius:10,marginBottom:10,display:"block"}} loading="lazy"/>}

              {/* Headline */}
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?12:14,fontWeight:700,color:"#E2E8F0",lineHeight:1.5,marginBottom:item.desc?6:0}}>{item.headline}</div>

              {/* Description */}
              {item.desc&&<div style={{fontSize:13,color:"#64748B",lineHeight:1.6,marginBottom:8}}>{item.desc.slice(0,200)}{item.desc.length>200?"…":""}</div>}

              {/* Team + category tags */}
              {(item.teams.length>0||item.categories.length>0)&&(
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                  {item.teams.map(t=>(
                    <span key={t} style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(0,212,255,.1)",border:"1px solid rgba(0,212,255,.25)",color:"#00D4FF",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{t}</span>
                  ))}
                  {item.categories.slice(0,2).map(c=>(
                    <span key={c} style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#475569"}}>{c}</span>
                  ))}
                </div>
              )}

              {/* Comment toggle */}
              <button onClick={()=>toggleExpand(item.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#475569",display:"flex",alignItems:"center",gap:5,padding:"4px 0",marginTop:2}}>
                💬 {itemComments.length>0?`${itemComments.length} comment${itemComments.length!==1?"s":""}`:cu?"Discuss":"Comments"}
                <span style={{fontSize:10,color:"#334155"}}>{isExp?"▲":"▼"}</span>
              </button>

              {/* Expanded discussion */}
              {isExp&&(
                <div style={{marginTop:10,borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:10}}>
                  {cu&&(
                    <div style={{marginBottom:12}}>
                      <div style={{display:"flex",gap:8,marginBottom:6}}>
                        <Av user={cu} size={28}/>
                        <input value={cmtText} onChange={e=>setCommentTexts(prev=>({...prev,[item.id]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();postComment(item.id);}}} placeholder="Discuss this story..." style={{flex:1,fontSize:13}}/>
                        <Btn size="sm" onClick={()=>postComment(item.id)} disabled={!cmtText.trim()}>Post</Btn>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <CommentImgUpload onUpload={async f=>{
                          const ext=f.name.split(".").pop();
                          const url=await sbUp("nova-banners",`news-${gid()}.${ext}`,f);
                          if(url)postComment(item.id,url);
                        }}/>
                        <button onClick={()=>setNewsGifPicker(item.id)} style={{background:"rgba(139,92,246,.15)",border:"1px solid rgba(139,92,246,.3)",borderRadius:8,padding:"4px 10px",cursor:"pointer",color:"#A78BFA",fontSize:12,fontWeight:700}}>GIF</button>
                      </div>
                      {newsGifPicker===item.id&&<GifPicker onSelect={url=>postComment(item.id,`__IMG__${url}`)} onClose={()=>setNewsGifPicker(null)}/>}
                    </div>
                  )}
                  {!cu&&<div style={{fontSize:12,color:"#475569",marginBottom:10,padding:"8px 12px",background:"rgba(255,255,255,.03)",borderRadius:8}}>Sign in to join the discussion</div>}
                  <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {itemComments.length===0&&<div style={{fontSize:11,color:"#334155",textAlign:"center",padding:"8px 0"}}>No comments yet — be first!</div>}
                    {itemComments.map(c=>{
                      const isImg=c.text?.startsWith("__IMG__");
                      return(
                        <div key={c.id} style={{display:"flex",gap:8,padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,.03)"}}>
                          <AvatarCircle user={{avatar:c.author_avatar,avatar_url:c.author_avatar_url,page_accent:"#00D4FF"}} size={26}/>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                              <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0"}}>{c.author_name}</span>
                              <span style={{fontSize:10,color:"#334155"}}>{fmtAgo(c.timestamp)}</span>
                            </div>
                            {isImg
                              ?<img src={c.text.slice(7)} style={{maxWidth:200,maxHeight:160,borderRadius:8,display:"block",objectFit:"contain",cursor:"pointer"}} onClick={()=>window.open(c.text.slice(7),"_blank")}/>
                              :<div style={{fontSize:12,color:"#94A3B8",lineHeight:1.5,wordBreak:"break-word"}}>{c.text}</div>
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Auth Modals ───────────────────────────────────────────────────────────────
function LoginModal({onLogin,onClose,users}){
  const[un,setUn]=useState("");const[pw,setPw]=useState("");const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const go=async()=>{
    setLoading(true);setErr("");
    const u=users.find(x=>x.username.toLowerCase()===un.toLowerCase()&&x.password===pw);
    if(u){saveSess(u);onLogin(u);}else setErr("Wrong username or password");
    setLoading(false);
  };
  return(
    <Modal title="🚀 Sign In" onClose={onClose} width={400}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><Lbl>Username</Lbl><input value={un} onChange={e=>setUn(e.target.value)} placeholder="username"/></div>
        <div><Lbl>Password</Lbl><input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="password"/></div>
        {err&&<div style={{color:"#EF4444",fontSize:13}}>{err}</div>}
        <Btn onClick={go} disabled={loading}>{loading?"Signing in...":"Sign In"}</Btn>
      </div>
    </Modal>
  );
}
function RegisterModal({onRegister,onClose}){
  const[un,setUn]=useState("");const[pw,setPw]=useState("");const[dn,setDn]=useState("");const[av,setAv]=useState("🌟");const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const go=async()=>{
    if(!un||!pw||!dn){setErr("All fields required");return;}
    if(un.length<3){setErr("Username must be 3+ characters");return;}
    if(pw.length<6){setErr("Password must be 6+ characters");return;}
    setLoading(true);setErr("");
    const exists=await sb.get("nova_users",`?username=eq.${un}`);
    if(exists&&exists.length>0){setErr("Username taken");setLoading(false);return;}
    const newUser={id:gid(),username:un,password:pw,display_name:dn,avatar:av,bio:"",is_owner:false,staff_role:null,joined:new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"}),badges:[],status_type:"online",status_activity:"",followers:[],following:[],page_accent:"#00D4FF",page_music:{},page_clips:[],page_social:[],page_social_links:{},banner_top_url:"",banner_left_url:"",banner_right_url:"",social_roblox:"",social_instagram:"",social_twitter:"",social_youtube:"",social_discord:"",mlb_team:"",nfl_team:"",nba_team:"",nhl_team:"",dob:"",predictions:{},correct_predictions:0,avatar_url:""};
    const res=await sb.post("nova_users",newUser);
    if(res){const u=Array.isArray(res)?res[0]:res;saveSess(u);onRegister(u);}else setErr("Registration failed. Try again.");
    setLoading(false);
  };
  return(
    <Modal title="✨ Join Nova" onClose={onClose} width={400}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><Lbl>Display Name</Lbl><input value={dn} onChange={e=>setDn(e.target.value)} placeholder="Your name"/></div>
        <div><Lbl>Username</Lbl><input value={un} onChange={e=>setUn(e.target.value)} placeholder="no spaces"/></div>
        <div><Lbl>Password</Lbl><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="6+ characters"/></div>
        <div><Lbl>Avatar Emoji</Lbl><input value={av} onChange={e=>setAv(e.target.value)} placeholder="🚀"/></div>
        {err&&<div style={{color:"#EF4444",fontSize:13}}>{err}</div>}
        <Btn onClick={go} disabled={loading}>{loading?"Creating account...":"Create Account"}</Btn>
      </div>
    </Modal>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App(){
  const DISCORD_URL="https://discord.gg/your-invite-here";
  const[cu,setCu]=useState(()=>getSess());
  const[users,setUsers]=useState([]);
  const[page,setPage]=useState("home");
  const[profileId,setProfileId]=useState(null);
  const[gameRef,setGameRef]=useState(null);
  const[statsPlayerRef,setStatsPlayerRef]=useState(null);
  const[showLogin,setShowLogin]=useState(false);
  const[showRegister,setShowRegister]=useState(false);
  const[notifs,setNotifs]=useState([]);
  const[conversations,setConversations]=useState([]);
  const[messages,setMessages]=useState([]);
  const[likes,setLikes]=useState({});
  const[msgUnread,setMsgUnread]=useState(0);

  useEffect(()=>{loadAll();},[]);

  const loadAll=async()=>{
    const[us,ls]=await Promise.all([
      sb.get("nova_users","?order=joined.asc"),
      sb.get("nova_clip_likes","?order=ts.desc"),
    ]);
    if(us)setUsers(us);
    if(ls){
      const map={};
      ls.forEach(l=>{if(!map[l.clip_id])map[l.clip_id]=[];map[l.clip_id].push(l.user_id);});
      setLikes(map);
    }
  };

  useEffect(()=>{
    if(!cu)return;
    const loadNotifs=async()=>{
      const data=await sb.get("nova_notifications",`?to_user_id=eq.${cu.id}&order=ts.desc&limit=30`);
      if(data)setNotifs(data);
    };
    loadNotifs();
    const t=setInterval(loadNotifs,15000);
    return()=>clearInterval(t);
  },[cu?.id]);

  useEffect(()=>{
    if(!cu)return;
    const loadConvs=async()=>{
      const data=await sb.get("nova_conversations",`?members=cs.{${cu.id}}`);
      if(data)setConversations(data);
    };
    loadConvs();
  },[cu?.id]);

  useEffect(()=>{
    if(!cu||!conversations.length)return;
    const unread=conversations.filter(c=>{
      const msgs=messages.filter(m=>m.conv_id===c.id);
      if(!msgs.length)return c.last_msg&&c.last_sender&&c.last_sender!==cu.display_name;
      const last=msgs[msgs.length-1];
      return last&&last.author_id!==cu.id;
    }).length;
    setMsgUnread(unread);
  },[conversations,messages,cu?.id]);

  const [navOpts,setNavOpts]=useState({});
  const nav=(p,id,opts={})=>{
    if(p==="profile"&&id){setProfileId(id);}
    if(p==="game"&&id){setGameRef(id);} // id = {id, sport}
    if(p==="stats"&&id?.playerId){setStatsPlayerRef(id);} // id = {playerId, sport}
    if((p==="predict"||p==="news")&&!id){return nav("hub");} // redirect to hub
    setNavOpts(opts||{});
    setPage(p);
  };

  const addNotif=async(toId,fromId,msg,meta=null)=>{
    const n={id:gid(),to_user_id:toId,from_user_id:fromId,msg,ts:Date.now(),read:false,meta};
    await sb.post("nova_notifications",n);
  };

  const handleLogin=u=>{setCu(u);setShowLogin(false);};
  const handleRegister=u=>{setCu(u);setShowRegister(false);setUsers(prev=>[...prev,u]);};
  const handleLogout=()=>{clearSess();setCu(null);setPage("home");};

  const readNotifs=async()=>{
    const unread=notifs.filter(n=>!n.read);
    if(!unread.length)return;
    await Promise.all(unread.map(n=>sb.patch("nova_notifications",`?id=eq.${n.id}`,{read:true})));
    setNotifs(prev=>prev.map(n=>({...n,read:true})));
  };
  const markOneNotif=async(nid)=>{
    await sb.patch("nova_notifications",`?id=eq.${nid}`,{read:true});
    setNotifs(prev=>prev.map(n=>n.id===nid?{...n,read:true}:n));
  };
  const clearNotifs=async()=>{
    if(!cu)return;
    await sb.del("nova_notifications",`?to_user_id=eq.${cu.id}`);
    setNotifs([]);
  };

  const handleLike=async(clipId,alreadyLiked)=>{
    if(!cu)return;
    if(alreadyLiked){
      await sb.del("nova_clip_likes",`?clip_id=eq.${clipId}&user_id=eq.${cu.id}`);
      setLikes(prev=>({...prev,[clipId]:(prev[clipId]||[]).filter(id=>id!==cu.id)}));
    } else {
      const l={id:gid(),clip_id:clipId,user_id:cu.id,ts:Date.now()};
      await sb.post("nova_clip_likes",l);
      setLikes(prev=>({...prev,[clipId]:[...(prev[clipId]||[]),cu.id]}));
    }
  };

  const staffUsers=users.filter(u=>u.is_owner||u.staff_role);
  const mob=useIsMobile();

  const content=()=>{
    if(page==="profile"&&profileId)return <ProfilePage userId={profileId} cu={cu} users={users} setUsers={updater=>{const next=typeof updater==="function"?updater(users):updater;setUsers(next);if(cu){const up=next.find(x=>x.id===cu.id);if(up)setCu(up);}}} navigate={nav} addNotif={addNotif} navOpts={navOpts}/>;
    if(page==="news")return <NewsPage cu={cu} users={users} addNotif={addNotif} navOpts={navOpts}/>;
    if(page==="members")return <MembersPage users={users} nav={nav}/>;
    if(page==="feed")return <FeedPage users={users} cu={cu} likes={likes} onLike={handleLike} navigate={nav}/>;
    if(page==="game"&&gameRef)return <GameDetailPage gameId={gameRef.id} sport={gameRef.sport} navigate={nav}/>;
    if(page==="predict")return <PredictPage cu={cu} users={users} setUsers={setUsers} navigate={nav}/>;
    if(page==="hub")return <HubPage cu={cu} users={users} setUsers={setUsers} navigate={nav}/>;
    if(page==="stats")return <StatsPage navigate={nav} initPlayer={statsPlayerRef?.id||null} initSport={statsPlayerRef?.sport||null}/>;
    if(page==="nffl")return <NFFLPage cu={cu} users={users} navigate={nav}/>;
    if(page==="nbbl")return <NBBLPage cu={cu} users={users} navigate={nav}/>;
    if(page==="cards")return <CardsPage cu={cu}/>;
    if(page==="trivia")return <TriviaPage cu={cu}/>;
    if(page==="leaderboard")return <LeaderboardPage users={users} navigate={nav}/>;
    if(page==="messages")return <MessagesPage cu={cu} users={users} conversations={conversations} setConversations={setConversations} messages={messages} setMessages={setMessages}/>;
    if(page==="dashboard")return <DashboardPage cu={cu} users={users} setUsers={setUsers} navigate={nav}/>;
    return <HomePage discordUrl={DISCORD_URL} staffUsers={staffUsers} nav={nav} users={users}/>;
  };

  return(
    <>
      <style>{CSS}</style>
      <Starfield/>
      <div style={{position:"relative",zIndex:1,minHeight:"100vh",paddingTop:62,paddingBottom:mob&&page!=="feed"?58:0}}>
        <Navbar cu={cu} onLogin={()=>setShowLogin(true)} onRegister={()=>setShowRegister(true)} onLogout={handleLogout} nav={nav} page={page} notifs={notifs} onReadNotifs={readNotifs} onClearNotifs={clearNotifs} onMarkOneNotif={markOneNotif} users={users} msgUnread={msgUnread}/>
        {content()}
      </div>
      {showLogin&&<LoginModal onLogin={handleLogin} onClose={()=>setShowLogin(false)} users={users}/>}
      {showRegister&&<RegisterModal onRegister={handleRegister} onClose={()=>setShowRegister(false)}/>}
    </>
  );
}
