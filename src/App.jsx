import { useState, useRef, useEffect } from "react";

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
`;

const gid = () => "x"+Date.now()+Math.random().toString(36).slice(2,5);
const extractSpotify = u => { const m=u.match(/track\/([A-Za-z0-9]+)/); return m?m[1]:null; };
const extractYT = u => { const m=u.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/); return m?m[1]:null; };
const extractYouTube = u => { const m=u.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/); return m?m[1]:null; };
const extractMedal   = u => { const m=u.match(/clips\/(\d+)/); return m?m[1]:null; };
const fmtTime = ts => { const d=Math.floor((Date.now()-ts)/1000); if(d<60)return"just now"; if(d<3600)return`${Math.floor(d/60)}m ago`; if(d<86400)return`${Math.floor(d/3600)}h ago`; return new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric"}); };
const fmtAgo  = fmtTime;
const fmtMsg  = ts => new Date(ts).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
const ROLE_COLOR  = { Owner:"#F59E0B", Moderator:"#00D4FF", "Event Host":"#A78BFA", Helper:"#34D399" };
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
      const d=await(await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/athletes/${playerId}`)).json();
      const name=d.athlete?.displayName||d.athlete?.shortName||d.displayName||null;
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
        if(isMLB)detail=await fetchMLBDetail(e.id);
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
          awayProb:{name:awayProb?.athlete?.displayName,era:awayProb?.athlete?.statistics?.find(s=>s.name==="ERA")?.value},
          homeProb:{name:homeProb?.athlete?.displayName,era:homeProb?.athlete?.statistics?.find(s=>s.name==="ERA")?.value},
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
              const hasDetail=g.winPitcher||g.awayProb?.name||g.injuries?.length||g.outs!==null||g.leaders?.length>0||g.boxTeams?.length>0;
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

  const sportPath=sport==="mlb"?"baseball/mlb":sport==="nfl"?"football/nfl":sport==="nba"?"basketball/nba":"hockey/nhl";

  useEffect(()=>{load();},[gameId]);
  useEffect(()=>{const t=setInterval(()=>load(true),30000);return()=>clearInterval(t);},[gameId]);

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
        (async(id)=>{if(!id)return null;try{const d=await(await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/athletes/${id}`)).json();return d.athlete?.displayName||d.athlete?.shortName||null;}catch{return null;}})(gdP?.playerId),
        (async(id)=>{if(!id)return null;try{const d=await(await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/athletes/${id}`)).json();return d.athlete?.displayName||d.athlete?.shortName||null;}catch{return null;}})(gdB?.playerId),
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
        awayProb:{name:awayProb?.athlete?.displayName,era:awayProb?.athlete?.statistics?.find(s=>s.name==="ERA")?.value},
        homeProb:{name:homeProb?.athlete?.displayName,era:homeProb?.athlete?.statistics?.find(s=>s.name==="ERA")?.value},
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
                  <div style={{fontSize:15,fontWeight:700,color:"#E2E8F0"}}>{p?.name||"TBD"}</div>
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

        {/* Scoring summary — all sports */}
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
          const sportCatNames={mlb:["BATTING","PITCHING"],nba:["PLAYERS",""],nfl:["PASSING/RUSHING","DEFENSE"],nhl:["SKATERS","GOALIES"]}[g.sport]||["PLAYERS",""];
          return(
            <Card key={si} style={{padding:"16px 18px"}} hover={false}>
              <SLabel>🧢 {teamAbbr} — PLAYER STATS</SLabel>
              {categories.slice(0,2).map((cat,ci)=>{
                const players=cat.athletes||[];if(!players.length)return null;
                const labels=cat.labels||cat.keys||[];
                return(
                  <div key={ci} style={{marginBottom:ci===0?14:0}}>
                    {sportCatNames[ci]&&<div style={{fontSize:9,color:"#475569",marginBottom:6,fontFamily:"'Orbitron',sans-serif"}}>{sportCatNames[ci]}</div>}
                    <div style={{overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:300}}>
                        <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}><td style={{padding:"4px 8px",color:"#475569",minWidth:110}}>PLAYER</td>{labels.slice(0,7).map((l,li)=><td key={li} style={{padding:"4px 6px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9}}>{l}</td>)}</tr></thead>
                        <tbody>{players.map((p,pi)=>(<tr key={pi} style={{background:pi%2===0?"rgba(255,255,255,.02)":"transparent",borderBottom:"1px solid rgba(255,255,255,.03)"}}><td style={{padding:"5px 8px",color:"#E2E8F0",fontWeight:600,whiteSpace:"nowrap"}}>{p.athlete?.shortName||p.athlete?.displayName||"—"}</td>{(p.stats||[]).slice(0,7).map((s,si2)=>(<td key={si2} style={{padding:"5px 6px",textAlign:"center",color:"#94A3B8"}}>{s||"—"}</td>))}</tr>))}</tbody>
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

function LeaderboardPage({users,navigate}){
  const mob=useIsMobile();
  const[tab,setTab]=useState("followers");
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
  const feats=[{icon:"🎬",title:"Watch Parties",desc:"Stream movies together in real time"},{icon:"🎮",title:"Game Nights",desc:"Squad up for epic gaming sessions"},{icon:"🎵",title:"Music Lounge",desc:"Vibe out and share playlists"},{icon:"⚾",title:"Sports Nights",desc:"Watch live sports with the whole crew"}];
  const online=users.filter(u=>u.status_type==="online").length;
  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:"0 20px 100px"}}>
      <div style={{textAlign:"center",padding:mob?"60px 0 50px":"80px 0 70px"}}>
        <div className="fadeUp" style={{fontSize:mob?48:62,marginBottom:12,display:"inline-block",animation:"float 3.5s ease-in-out infinite"}}>💫</div>
        <h1 className="fadeUp d1" style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?"clamp(50px,18vw,80px)":"clamp(46px,8vw,92px)",fontWeight:900,lineHeight:1.02,letterSpacing:".06em",marginBottom:16,background:"linear-gradient(135deg,#fff 0%,#a8d8ff 40%,#00D4FF 65%,#8B5CF6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NOVA</h1>
        <p className="fadeUp d2" style={{fontSize:mob?15:18,color:"#94A3B8",maxWidth:440,margin:"0 auto 10px",lineHeight:1.65,fontWeight:500}}>Your community for watch parties, game nights, music vibes and live sports.</p>
        <div className="fadeUp d2" style={{display:"flex",gap:20,justifyContent:"center",marginBottom:28}}>
          <span style={{fontSize:11,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".18em"}}>{users.length} MEMBERS</span>
          <span style={{fontSize:11,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",letterSpacing:".18em",display:"flex",alignItems:"center",gap:5}}><div style={{width:6,height:6,borderRadius:"50%",background:"#22C55E",boxShadow:"0 0 6px #22C55E"}}/>{online} ONLINE</span>
        </div>
        <div className="fadeUp d3" style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <a href={discordUrl} target="_blank" rel="noopener noreferrer"><Btn size="lg" style={{fontSize:12}}>🚀 Join Nova Discord</Btn></a>
          <Btn variant="ghost" size={mob?"md":"lg"} style={{fontSize:12}} onClick={()=>nav("members")}>👥 Browse Members</Btn>
          <Btn variant="ghost" size={mob?"md":"lg"} style={{fontSize:12}} onClick={()=>nav("feed")}>🎬 Clips Feed</Btn>
        </div>
      </div>
      <div style={{marginBottom:60}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,letterSpacing:".22em",color:"#334155",textAlign:"center",textTransform:"uppercase",marginBottom:24}}>What We Do</div>
        <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
          {feats.map((f,i)=>(
            <Card key={i} style={{padding:"20px 16px"}}>
              <div style={{fontSize:28,marginBottom:10}}>{f.icon}</div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",marginBottom:7,letterSpacing:".05em"}}>{f.title}</div>
              <div style={{color:"#64748B",fontSize:13,lineHeight:1.55}}>{f.desc}</div>
            </Card>
          ))}
        </div>
      </div>
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
function Card({children,style:ext={},hover=true,onClick}){
  const [h,setH]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:"rgba(255,255,255,.03)",backdropFilter:"blur(14px)",border:`1px solid ${h&&hover?"rgba(0,212,255,.28)":"rgba(255,255,255,.07)"}`,borderRadius:14,transition:"all .28s",transform:h&&hover?"translateY(-2px)":"",boxShadow:h&&hover?"0 12px 40px rgba(0,0,0,.3)":"none",cursor:onClick?"pointer":"default",...ext}}>{children}</div>;
}
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
  const s=useRef(null);
  if(!s.current)s.current=Array.from({length:200},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,sz:Math.random()*2.4+.4,delay:Math.random()*7,dur:Math.random()*3.5+2,bright:Math.random()>.92}));
  return <div style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden",background:"radial-gradient(ellipse at 18% 38%,#0e0228 0%,#030712 54%)"}}>
    <div style={{position:"absolute",width:"65%",height:"65%",top:"-15%",left:"45%",borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 70%)"}}/>
    {s.current.map(st=><div key={st.id} style={{position:"absolute",left:`${st.x}%`,top:`${st.y}%`,width:st.sz,height:st.sz,borderRadius:"50%",background:st.bright?"#a8e0ff":st.sz>1.8?"rgba(180,220,255,.9)":"rgba(255,255,255,.8)",boxShadow:st.bright?"0 0 4px 1px rgba(168,224,255,.6)":"none",animation:`twinkle ${st.dur}s ${st.delay}s ease-in-out infinite alternate`}}/>)}
  </div>;
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
function Navbar({cu,onLogin,onRegister,onLogout,nav,page,notifs,onReadNotifs,onClearNotifs,onMarkOneNotif,users,msgUnread}){
  const mob=useIsMobile();
  const dTabs=[["home","Home"],["members","Members"],["news","📰 News"],["feed","🎬 Feed"],["predict","🎯 Predict"],["leaderboard","🏆 Board"]];
  const mTabs=[{p:"home",icon:"🏠",lbl:"Home"},{p:"members",icon:"👥",lbl:"Members"},{p:"news",icon:"📰",lbl:"News"},{p:"predict",icon:"🎯",lbl:"Predict"},{p:"leaderboard",icon:"🏆",lbl:"Board"},{p:"messages",icon:"💬",lbl:"DMs",badge:msgUnread}];
  return (
    <>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:62,display:"flex",alignItems:"center",justifyContent:"space-between",padding:mob?"0 12px":"0 20px",background:"rgba(3,7,18,.97)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,.055)"}}>
        <div style={{display:"flex",alignItems:"center",gap:mob?8:16}}>
          <button onClick={()=>nav("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:20}}>💫</span>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:mob?15:17,letterSpacing:".12em",background:"linear-gradient(135deg,#fff 10%,#00D4FF 55%,#8B5CF6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NOVA</span>
          </button>
          {!mob&&(
            <div style={{display:"flex",gap:1}}>
              {dTabs.map(([p,l])=><button key={p} onClick={()=>nav(p)} style={{background:page===p?"rgba(0,212,255,.09)":"none",border:page===p?"1px solid rgba(0,212,255,.2)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:page===p?"#00D4FF":"#94A3B8",transition:"all .2s",whiteSpace:"nowrap"}}>{l}</button>)}
              {cu?.is_owner&&<button onClick={()=>nav("dashboard")} style={{background:page==="dashboard"?"rgba(245,158,11,.09)":"none",border:page==="dashboard"?"1px solid rgba(245,158,11,.2)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:page==="dashboard"?"#F59E0B":"#94A3B8"}}>⚡ Dashboard</button>}
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
              {mob&&cu?.is_owner&&<button onClick={()=>nav("dashboard")} style={{background:"none",border:"1px solid rgba(245,158,11,.3)",borderRadius:8,padding:"4px 8px",cursor:"pointer",fontSize:11,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>⚡</button>}
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
              <span className="mob-tab-icon">
                {t.icon}
                {t.badge>0&&<span style={{position:"absolute",top:-4,right:-6,width:15,height:15,borderRadius:"50%",background:"#EF4444",color:"white",fontSize:8,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",border:"1.5px solid #030712"}}>{t.badge>9?"9+":t.badge}</span>}
              </span>
              <span className="mob-tab-label" style={{color:page===t.p?"#00D4FF":"#475569"}}>{t.lbl}</span>
            </button>
          ))}
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
const HB_KEY = "sk_test_vUEKzTF26D0FfDCFTJZpUXGrQlpzs8P7ET95_q9CRyI";

async function createHBSession(){
  const r = await fetch("https://engine.hyperbeam.com/v0/vm", {
    method:"POST",
    headers:{"Authorization":`Bearer ${HB_KEY}`,"Content-Type":"application/json"},
    body:JSON.stringify({start_url:"https://www.google.com", ublock_origin:true})
  });
  if(!r.ok){ const t=await r.text(); throw new Error(t); }
  return r.json(); // { session_id, embed_url, admin_token }
}

function WatchParty({cu,conv,users,onEnd}){
  const [phase,setPhase]=useState("idle"); // idle | loading | active
  const [embedUrl,setEmbedUrl]=useState(null);
  const [sessionId,setSessionId]=useState(null);
  const [chatMsgs,setChatMsgs]=useState([]);
  const [chatInput,setChatInput]=useState("");
  const [members,setMembers]=useState([cu.display_name]);
  const [err,setErr]=useState(null);
  const chatPollRef=useRef(null);
  const chatTsRef=useRef(Date.now()-500);
  const memberPollRef=useRef(null);
  const isHost=useRef(false);

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
        await fetch(`https://engine.hyperbeam.com/v0/vm/${sessionId}`,{method:"DELETE",headers:{"Authorization":`Bearer ${HB_KEY}`}});
      }catch{}
      await sb.del("nova_signaling",`?conv_id=eq.${conv.id}_hb`);
      await sb.del("nova_signaling",`?conv_id=eq.${conv.id}_hbchat`);
    }
    onEnd();
  };

  const sendChat=async()=>{
    if(!chatInput.trim())return;
    const msg={name:cu.display_name,text:chatInput.trim(),ts:Date.now()};
    await sb.post("nova_signaling",{id:gid(),conv_id:conv.id+"_hbchat",from_id:cu.id,type:"hb-chat",data:JSON.stringify(msg),ts:Date.now()});
    setChatMsgs(prev=>[...prev,{...msg,id:gid()}]);
    setChatInput("");
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
          {/* Hyperbeam iframe */}
          <iframe
            src={embedUrl}
            allow="microphone; camera; fullscreen; clipboard-read; clipboard-write; autoplay"
            style={{flex:1,border:"none",background:"#000"}}
          />
          {/* Party chat sidebar */}
          <div style={{width:220,flexShrink:0,display:"flex",flexDirection:"column",borderLeft:"1px solid rgba(255,255,255,.07)",background:"rgba(0,0,0,.4)"}}>
            <div style={{padding:"8px 12px",fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",borderBottom:"1px solid rgba(255,255,255,.05)",letterSpacing:".1em"}}>PARTY CHAT</div>
            <div style={{flex:1,overflowY:"auto",padding:"10px",display:"flex",flexDirection:"column",gap:7}}>
              {chatMsgs.length===0&&<div style={{fontSize:11,color:"#334155",textAlign:"center",padding:"20px 0"}}>Chat while you watch!</div>}
              {chatMsgs.map((m,i)=>(
                <div key={m.id||i}>
                  <span style={{color:m.name===cu.display_name?"#00D4FF":"#8B5CF6",fontWeight:700,fontSize:10}}>{m.name}: </span>
                  <span style={{fontSize:12,color:"#94A3B8"}}>{m.text}</span>
                </div>
              ))}
            </div>
            <div style={{padding:"8px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:4}}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendChat();}} placeholder="Say something..." style={{flex:1,fontSize:11,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",outline:"none"}}/>
              <button onClick={sendChat} style={{background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#00D4FF",fontSize:14}}>→</button>
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
              {/* Watch Party panel */}
              {inWatchParty&&cu&&activeConv&&(
                <div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column"}}>
                  <WatchParty cu={cu} conv={activeConv} users={users} onEnd={()=>setInWatchParty(false)}/>
                </div>
              )}
              {!inWatchParty&&<div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:8}}>
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
              </div>}{/* end !inWatchParty */}
              {!inWatchParty&&<div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:8,flexShrink:0,alignItems:"center"}}>
                <input type="file" ref={dmImgRef} accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)sendImage(f);e.target.value="";}}/>
                <button onClick={()=>dmImgRef.current.click()} disabled={dmUploading} title="Send photo" style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{dmUploading?"⏳":"📷"}</button>
                <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="Type a message..." onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}} style={{flex:1,borderRadius:24,padding:"10px 18px"}}/>
                <Btn onClick={sendMsg} disabled={!newMsg.trim()}>Send ➤</Btn>
              </div>}
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
function ProfilePage({userId,cu,users,setUsers,navigate,addNotif}){
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
  const[userActivity,setUserActivity]=useState([]); // comments made by this user elsewhere
  const[activityLoading,setActivityLoading]=useState(false);

  useEffect(()=>{if(u)loadComments();},[userId]);
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

          {/* Social clips */}
          {((u.page_social||[]).length>0||(isMe||isOwner))&&(
            <Sec title="📱 Social Clips" onAdd={isMe||isOwner?()=>setShowAddSocial(true):null}>
              <ClipCarousel clips={u.page_social||[]} canEdit={isMe||isOwner} onDelete={deleteSocial} emptyIcon="📱" emptyMsg="No social clips"/>
            </Sec>
          )}

          {/* Comments with likes + replies + activity tab */}
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
                  return(
                    <div key={ac.id} style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:8,cursor:isNews?"default":"pointer"}} onClick={()=>!isNews&&navigate("profile",ac.profile_user_id)}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:10,color:"#475569",marginBottom:4}}>
                          {isNews
                            ?<span style={{color:"#8B5CF6",fontWeight:700}}>📰 News Discussion</span>
                            :<>commented on <span style={{color:"#00D4FF",fontWeight:700}}>{targetUser?.display_name||"someone"}'s profile</span></>
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
                      {!isNews&&<span style={{fontSize:11,color:"#334155",flexShrink:0}}>→</span>}
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
                  <CommentImgUpload onUpload={async f=>{
                    const ext=f.name.split(".").pop();
                    const url=await sbUp("nova-banners",`cmt-${gid()}.${ext}`,f);
                    if(url)submitComment(url);
                  }}/>
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
// ─── Dashboard ─────────────────────────────────────────────────────────────────
function DashboardPage({cu,users,setUsers,navigate}){
  const mob=useIsMobile();
  const[sel,setSel]=useState(null);
  const[tab,setTab]=useState("members");
  const[announce,setAnnounce]=useState("");
  const[announcements,setAnnouncements]=useState([]);
  const[announceSent,setAnnounceSent]=useState(false);
  const target=sel?users.find(u=>u.id===sel):null;
  if(!cu?.is_owner)return<div style={{padding:"100px 20px",textAlign:"center",color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>⛔ Access Denied</div>;
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
        {[["members","👥 Members"],["badges","🏅 Badges"],["roles","⭐ Roles"],["announce","📢 Announce"]].map(([t,l])=>(
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

function NewsPage({cu,users,addNotif}){
  const mob=useIsMobile();
  const[feed,setFeed]=useState([]);
  const[loading,setLoading]=useState(true);
  const[filter,setFilter]=useState("all");
  const[expandedId,setExpandedId]=useState(null);
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
            <Card key={item.id} style={{padding:"14px 16px"}} hover={false}>
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
                      <CommentImgUpload onUpload={async f=>{
                        const ext=f.name.split(".").pop();
                        const url=await sbUp("nova-banners",`news-${gid()}.${ext}`,f);
                        if(url)postComment(item.id,url);
                      }}/>
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

  const nav=(p,id)=>{
    if(p==="profile"&&id){setProfileId(id);}
    if(p==="game"&&id){setGameRef(id);} // id = {id, sport}
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
    if(page==="profile"&&profileId)return <ProfilePage userId={profileId} cu={cu} users={users} setUsers={updater=>{const next=typeof updater==="function"?updater(users):updater;setUsers(next);if(cu){const up=next.find(x=>x.id===cu.id);if(up)setCu(up);}}} navigate={nav} addNotif={addNotif}/>;
    if(page==="news")return <NewsPage cu={cu} users={users} addNotif={addNotif}/>;
    if(page==="members")return <MembersPage users={users} nav={nav}/>;
    if(page==="feed")return <FeedPage users={users} cu={cu} likes={likes} onLike={handleLike} navigate={nav}/>;
    if(page==="game"&&gameRef)return <GameDetailPage gameId={gameRef.id} sport={gameRef.sport} navigate={nav}/>;
    if(page==="predict")return <PredictPage cu={cu} users={users} setUsers={setUsers} navigate={nav}/>;
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
