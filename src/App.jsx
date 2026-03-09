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
const extractYouTube = u => { const m=u.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/); return m?m[1]:null; };
const extractMedal   = u => { const m=u.match(/clips\/(\d+)/); return m?m[1]:null; };
const fmtTime = ts => { const d=Math.floor((Date.now()-ts)/1000); if(d<60)return"just now"; if(d<3600)return`${Math.floor(d/60)}m ago`; if(d<86400)return`${Math.floor(d/3600)}h ago`; return new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric"}); };
const fmtMsg  = ts => new Date(ts).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
const ROLE_COLOR  = { Owner:"#F59E0B", Moderator:"#00D4FF", "Event Host":"#A78BFA", Helper:"#34D399" };
const STATUS_META = { online:{color:"#22C55E",label:"Online"}, idle:{color:"#EAB308",label:"Idle"}, dnd:{color:"#EF4444",label:"Do Not Disturb"}, offline:{color:"#6B7280",label:"Offline"} };
const SOCIAL_ICONS = {
  roblox:    <svg width="16" height="16" viewBox="0 0 100 100" fill="currentColor"><polygon points="27,0 73,14 86,73 27,100 0,60"/><polygon points="73,14 100,27 86,73 40,86 27,60" fill="rgba(255,255,255,.25)"/></svg>,
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
const ALL_BADGES = [
  {id:"og",icon:"👑",label:"OG Member",color:"#F59E0B"},{id:"nova_star",icon:"💫",label:"Nova Star",color:"#00D4FF"},
  {id:"watchparty",icon:"🎬",label:"Watch Party Reg",color:"#A78BFA"},{id:"baseball",icon:"⚾",label:"Baseball Fan",color:"#34D399"},
  {id:"gamer",icon:"🎮",label:"Gaming Legend",color:"#F472B6"},{id:"music",icon:"🎵",label:"Music Guru",color:"#818CF8"},
  {id:"social",icon:"🤝",label:"Social Butterfly",color:"#2DD4BF"},{id:"champ",icon:"🏆",label:"Tourney Champ",color:"#FB923C"},
  {id:"earlybird",icon:"🚀",label:"Early Adopter",color:"#C084FC"},{id:"commfave",icon:"🌟",label:"Community Fave",color:"#FBBF24"},
  {id:"predictor",icon:"🎯",label:"Top Predictor",color:"#EF4444"},
];

// ─── Predictions ───────────────────────────────────────────────────────────────
function PredictPage({cu,users,setUsers}){
  const mob=useIsMobile();
  const[sport,setSport]=useState("mlb");
  const[games,setGames]=useState([]);
  const[loading,setLoading]=useState(true);
  const[predictions,setPredictions]=useState({});

  const fetchGames=async s=>{
    setLoading(true);
    try{
      const url=`https://site.api.espn.com/apis/site/v2/sports/${s==="mlb"?"baseball/mlb":"football/nfl"}/scoreboard`;
      const data=await(await fetch(url)).json();
      setGames((data.events||[]).map(e=>{
        const comp=e.competitions[0];
        const home=comp.competitors.find(c=>c.homeAway==="home");
        const away=comp.competitors.find(c=>c.homeAway==="away");
        const status=comp.status?.type;
        return{id:e.id,date:e.date,
          home:{name:home?.team?.displayName,abbr:home?.team?.abbreviation,logo:home?.team?.logo,score:home?.score,color:"#"+home?.team?.color},
          away:{name:away?.team?.displayName,abbr:away?.team?.abbreviation,logo:away?.team?.logo,score:away?.score,color:"#"+away?.team?.color},
          status:status?.shortDetail||"Scheduled",started:status?.completed||status?.name==="STATUS_IN_PROGRESS",completed:status?.completed};
      }));
    }catch(e){setGames([]);}
    setLoading(false);
  };

  useEffect(()=>{fetchGames(sport);},[sport]);
  useEffect(()=>{const t=setInterval(()=>fetchGames(sport),30000);return()=>clearInterval(t);},[sport]);
  useEffect(()=>{if(cu)setPredictions(cu.predictions||{});},[cu?.id]);

  const predict=async(gameId,pick)=>{
    if(!cu)return;
    const np={...(cu.predictions||{}),[gameId]:pick};
    await sb.patch("nova_users",`?id=eq.${cu.id}`,{predictions:np});
    setUsers(prev=>prev.map(u=>u.id===cu.id?{...u,predictions:np}:u));
    setPredictions(np);
  };

  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:"44px 16px 80px"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:28,fontWeight:700,marginBottom:8,background:"linear-gradient(135deg,#fff,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🎯 Predictions</h1>
        <p style={{color:"#475569",fontSize:14,marginBottom:20}}>Pick winners before games start. Locks at tip-off. Live scores auto-update.</p>
        <div style={{display:"flex",gap:6,justifyContent:"center"}}>
          {[["mlb","⚾ MLB"],["nfl","🏈 NFL"]].map(([s,l])=>(
            <button key={s} onClick={()=>setSport(s)} style={{padding:"8px 20px",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,border:`1px solid ${sport===s?"rgba(0,212,255,.5)":"rgba(255,255,255,.1)"}`,background:sport===s?"rgba(0,212,255,.12)":"rgba(255,255,255,.03)",color:sport===s?"#00D4FF":"#64748B",transition:"all .2s"}}>{l}</button>
          ))}
        </div>
      </div>
      {loading
        ?<div style={{textAlign:"center",padding:"60px 0",color:"#334155"}}><div className="spin" style={{fontSize:28,display:"inline-block",marginBottom:12}}>⚙️</div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,letterSpacing:".15em"}}>FETCHING LIVE DATA...</div></div>
        :games.length===0
          ?<Empty icon={sport==="mlb"?"⚾":"🏈"} msg={`No ${sport.toUpperCase()} games today. Check back tomorrow!`}/>
          :<div style={{display:"flex",flexDirection:"column",gap:14}}>
            {games.map(g=>{
              const myPick=predictions[g.id];
              const locked=g.started;
              const homeWin=g.completed&&parseInt(g.home.score)>parseInt(g.away.score);
              const awayWin=g.completed&&parseInt(g.away.score)>parseInt(g.home.score);
              const ph=users.filter(u=>u.predictions?.[g.id]==="home").length;
              const pa=users.filter(u=>u.predictions?.[g.id]==="away").length;
              const tot=ph+pa||1;
              return(
                <Card key={g.id} style={{padding:"16px 18px"}} hover={false}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:6}}>
                    <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".12em",padding:"3px 10px",borderRadius:20,background:g.completed?"rgba(100,116,139,.15)":g.started?"rgba(34,197,94,.15)":"rgba(0,212,255,.1)",color:g.completed?"#64748B":g.started?"#22C55E":"#00D4FF",border:`1px solid ${g.completed?"rgba(100,116,139,.2)":g.started?"rgba(34,197,94,.3)":"rgba(0,212,255,.25)"}`}}>{g.completed?"FINAL":g.started?`LIVE · ${g.status}`:"UPCOMING"}</span>
                    {myPick&&<span style={{fontSize:11,color:"#64748B",fontFamily:"'Orbitron',sans-serif"}}>You picked: <span style={{color:"#00D4FF"}}>{myPick==="home"?g.home.abbr:g.away.abbr}</span></span>}
                  </div>
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
  const sorted=[...users].sort((a,b)=>board.key(b)-board.key(a)).slice(0,20);
  const MEDALS=["🥇","🥈","🥉"];
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
      </div>
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
            {(u.mlb_team||u.nfl_team)&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:5}}>{u.mlb_team&&<TeamBadge teamId={u.mlb_team}/>}{u.nfl_team&&<TeamBadge teamId={u.nfl_team}/>}</div>}
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
function BannerUploadBtn({label,onUpload}){const [up,setUp]=useState(false);const ref=useRef(null);const h=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>10*1024*1024){alert("Max 10MB");return;}setUp(true);await onUpload(f);setUp(false);e.target.value="";};return <><input type="file" ref={ref} accept="image/*" onChange={h} style={{display:"none"}}/><Btn variant="ghost" size="sm" onClick={()=>ref.current.click()} disabled={up}>{up?"⏳":label}</Btn></>;}
function TeamLogo({espn,sport,size=22}){const [err,setErr]=useState(false);if(err)return <span style={{fontSize:size*.65}}>{sport==="mlb"?"⚾":"🏈"}</span>;return <img src={`https://a.espncdn.com/i/teamlogos/${sport}/500/${espn}.png`} width={size} height={size} style={{objectFit:"contain",flexShrink:0}} onError={()=>setErr(true)}/>;}
function TeamBadge({teamId}){const team=[...MLB_TEAMS,...NFL_TEAMS].find(t=>t.id===teamId);if(!team)return null;const sport=teamId.startsWith("nfl_")?"nfl":"mlb";return <div style={{display:"inline-flex",alignItems:"center",gap:5,background:team.color+"22",border:`1.5px solid ${team.color}66`,borderRadius:20,padding:"3px 10px"}}><TeamLogo espn={team.espn} sport={sport} size={18}/><span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:team.color,letterSpacing:".06em"}}>{team.abbr}</span><span style={{fontSize:9,color:team.color+"cc",fontWeight:600}}>{team.name}</span></div>;}

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

function NotifBell({notifs,onRead,onClear,navigate,users}){
  const [open,setOpen]=useState(false);const ref=useRef(null);
  const unread=notifs.filter(n=>!n.read).length;
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>{setOpen(o=>!o);if(!open)onRead();}} className={unread>0?"bell-shake":""} style={{background:open?"rgba(0,212,255,.1)":"none",border:`1px solid ${open?"rgba(0,212,255,.3)":"rgba(255,255,255,.09)"}`,borderRadius:9,width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,transition:"all .2s",position:"relative"}}>
        🔔
        {unread>0&&<div style={{position:"absolute",top:-4,right:-4,width:17,height:17,borderRadius:"50%",background:"linear-gradient(135deg,#EF4444,#DC2626)",color:"white",fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",border:"2px solid #030712"}}>{unread>9?"9+":unread}</div>}
      </button>
      {open&&(
        <div style={{position:"absolute",right:0,top:46,width:300,zIndex:300,background:"linear-gradient(150deg,#0c1220,#0f1929)",border:"1px solid rgba(0,212,255,.15)",borderRadius:14,boxShadow:"0 20px 60px rgba(0,0,0,.8)",overflow:"hidden"}}>
          <div style={{padding:"14px 18px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#94A3B8",letterSpacing:".1em"}}>NOTIFICATIONS</span>
            {notifs.length>0&&<button onClick={onClear} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#334155"}}>Clear all</button>}
          </div>
          <div style={{maxHeight:300,overflowY:"auto"}}>
            {notifs.length===0
              ? <div style={{padding:"28px 18px",textAlign:"center",color:"#334155",fontSize:13}}><div style={{fontSize:26,marginBottom:8}}>🔕</div>No notifications yet</div>
              : notifs.slice().reverse().map(n=>{
                  const from=users.find(u=>u.id===n.from_user_id);
                  return (
                    <div key={n.id} className="notif-item" onClick={()=>{navigate("profile",n.from_user_id);setOpen(false);}} style={{padding:"12px 18px",display:"flex",gap:12,alignItems:"flex-start",borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",background:n.read?"transparent":"rgba(0,212,255,.04)"}}>
                      <AvatarCircle user={from} size={32}/>
                      <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,color:"#C4CDD6",lineHeight:1.4}}><span style={{fontWeight:700,color:"#E2E8F0"}}>{from?.display_name||"Someone"}</span> {n.msg}</div><div style={{fontSize:11,color:"#334155",marginTop:3}}>{fmtTime(n.ts||Date.now())}</div></div>
                      {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:"#00D4FF",marginTop:4,flexShrink:0}}/>}
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
function Navbar({cu,onLogin,onRegister,onLogout,nav,page,notifs,onReadNotifs,onClearNotifs,users,msgUnread}){
  const mob=useIsMobile();
  const dTabs=[["home","Home"],["members","Members"],["feed","🎬 Feed"],["predict","🎯 Predict"],["leaderboard","🏆 Board"]];
  const mTabs=[{p:"home",icon:"🏠",lbl:"Home"},{p:"members",icon:"👥",lbl:"Members"},{p:"feed",icon:"🎬",lbl:"Feed"},{p:"predict",icon:"🎯",lbl:"Predict"},{p:"leaderboard",icon:"🏆",lbl:"Board"},{p:"messages",icon:"💬",lbl:"DMs",badge:msgUnread}];
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
              <NotifBell notifs={notifs} onRead={onReadNotifs} onClear={onClearNotifs} navigate={nav} users={users}/>
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
                    ? <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,background:"linear-gradient(135deg,#00D4FF22,#8B5CF622)",border:"1px solid rgba(0,212,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>👥</div>
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
                  ? <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,background:"linear-gradient(135deg,#00D4FF22,#8B5CF622)",border:"1px solid rgba(0,212,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>👥</div>
                  : <AvatarCircle user={getConvAvatar(activeConv)} size={36}/>
                }
                <div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:"#E2E8F0"}}>{getConvName(activeConv)}</div>
                  {activeConv.is_group&&<div style={{fontSize:11,color:"#475569"}}>{activeConv.members.length} members · max 50</div>}
                </div>
              </div>
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
                        <div style={{background:isMe?"linear-gradient(135deg,#00D4FF22,#8B5CF622)":"rgba(255,255,255,.06)",border:`1px solid ${isMe?"rgba(0,212,255,.25)":"rgba(255,255,255,.08)"}`,borderRadius:isMe?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"9px 14px",fontSize:14,color:"#E2E8F0",lineHeight:1.5,wordBreak:"break-word"}}>{m.text}</div>
                        <div style={{fontSize:10,color:"#334155",marginTop:3,textAlign:isMe?"right":"left",paddingLeft:4,paddingRight:4}}>{fmtMsg(m.ts)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={msgEndRef}/>
              </div>
              <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:10,flexShrink:0}}>
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

  useEffect(()=>{if(u)loadComments();},[userId]);
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
  const submitComment=async()=>{
    if(!commentText.trim()||!cu)return;
    const c={id:gid(),profile_user_id:u.id,author_id:cu.id,author_name:cu.display_name,author_avatar:cu.avatar,author_avatar_url:cu.avatar_url||"",text:commentText.trim(),timestamp:Date.now()};
    await sb.post("nova_comments",c);
    setComments(prev=>[c,...prev]);
    setCommentText("");
    if(!isMe)addNotif(u.id,cu.id,"commented on your profile");
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

  const musicId=u.page_music?.type==="spotify"?extractSpotify(u.page_music.url||""):extractYT(u.page_music?.url||"");
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
            {(u.mlb_team||u.nfl_team)&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>{u.mlb_team&&<TeamBadge teamId={u.mlb_team}/>}{u.nfl_team&&<TeamBadge teamId={u.nfl_team}/>}</div>}
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
          <div style={{width:90,flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
            {u.banner_left_url
              ?<div style={{position:"relative"}}><img src={u.banner_left_url} style={{width:90,borderRadius:10,objectFit:"cover",maxHeight:320}}/>{(isMe||isOwner)&&<XBtn onClick={()=>patchUser({banner_left_url:""})} style={{position:"absolute",top:4,right:4}}/>}</div>
              :(isMe||isOwner)&&<BannerBtn label="+ Left" onUpload={f=>handleBannerUpload(f,"left")}/>
            }
          </div>
        )}
        <div style={{flex:1,minWidth:0}}>
          {/* Music */}
          {u.page_music?.url&&musicId&&(
            <Card style={{padding:16,marginBottom:16}}>
              <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".15em",marginBottom:10}}>🎵 VIBING TO</div>
              {u.page_music.type==="spotify"
                ?<iframe src={`https://open.spotify.com/embed/track/${musicId}?utm_source=generator&theme=0`} width="100%" height="80" frameBorder="0" allow="autoplay;clipboard-write;encrypted-media;fullscreen;picture-in-picture" style={{borderRadius:8}}/>
                :<iframe src={`https://www.youtube.com/embed/${musicId}`} width="100%" height="150" frameBorder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{borderRadius:8}}/>
              }
              {(isMe||isOwner)&&<button onClick={()=>patchUser({page_music:{}})} style={{marginTop:8,background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#334155"}}>Remove</button>}
            </Card>
          )}
          {(isMe||isOwner)&&!u.page_music?.url&&<Card style={{padding:12,marginBottom:16,textAlign:"center"}}><Btn variant="ghost" size="sm" onClick={()=>setEditModal("music")}>🎵 Add Music</Btn></Card>}

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

          {/* Comments */}
          <Sec title="💬 Comments">
            {cu&&(
              <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"flex-start"}}>
                <Av user={cu} size={32}/>
                <div style={{flex:1,display:"flex",gap:8}}>
                  <input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitComment();}}} placeholder="Leave a comment..." style={{flex:1}}/>
                  <Btn size="sm" onClick={submitComment} disabled={!commentText.trim()}>Post</Btn>
                </div>
              </div>
            )}
            {comments.length===0?<Empty icon="💬" msg="No comments yet"/>
            :<div style={{display:"flex",flexDirection:"column",gap:8}}>
              {comments.map(c=>{
                const author=users.find(x=>x.id===c.author_id);const canDel=cu&&(cu.id===c.author_id||cu.id===u.id||cu.is_owner);
                return(
                  <div key={c.id} className="comment-row" style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",position:"relative"}}>
                    <Av user={author||{avatar:c.author_avatar,avatar_url:c.author_avatar_url,page_accent:"#00D4FF"}} size={30} onClick={()=>navigate("profile",c.author_id)}/>
                    <div style={{flex:1}}><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0",cursor:"pointer"}} onClick={()=>navigate("profile",c.author_id)}>{c.author_name}</span><span style={{fontSize:10,color:"#334155"}}>{fmtAgo(c.timestamp)}</span></div><div style={{fontSize:13,color:"#94A3B8",lineHeight:1.5}}>{c.text}</div></div>
                    {canDel&&<XBtn className="del-btn" onClick={()=>deleteComment(c.id)} style={{opacity:0,position:"absolute",top:8,right:8}}/>}
                  </div>
                );
              })}
            </div>}
          </Sec>
        </div>
        {!mob&&hasSideBanners&&(
          <div style={{width:90,flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
            {u.banner_right_url
              ?<div style={{position:"relative"}}><img src={u.banner_right_url} style={{width:90,borderRadius:10,objectFit:"cover",maxHeight:320}}/>{(isMe||isOwner)&&<XBtn onClick={()=>patchUser({banner_right_url:""})} style={{position:"absolute",top:4,right:4}}/>}</div>
              :(isMe||isOwner)&&<BannerBtn label="+ Right" onUpload={f=>handleBannerUpload(f,"right")}/>
          }
          </div>
        )}
      </div>

      {/* Edit Modals */}
      {editModal==="profile"&&<EditProfileModal u={u} cu={cu} onSave={async p=>{await patchUser(p);setEditModal(null);setUsers(prev=>prev.map(x=>x.id===u.id?{...x,...p}:x));}} onClose={()=>setEditModal(null)}/>}
      {editModal==="music"&&<Modal title="🎵 Set Music" onClose={()=>setEditModal(null)}><EditMusicModal u={u} onSave={async p=>{await patchUser(p);setEditModal(null);}}/></Modal>}
      {editModal==="team"&&<Modal title="⚽ Favorite Teams" onClose={()=>setEditModal(null)} width={540}><EditTeamsModal u={u} onSave={async p=>{await patchUser(p);setEditModal(null);}}/></Modal>}
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
  const[url,setUrl]=useState(u.page_music?.url||"");
  const[type,setType]=useState(u.page_music?.type||"spotify");
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:8}}>{["spotify","youtube"].map(t=><button key={t} onClick={()=>setType(t)} style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${type===t?"#00D4FF":"rgba(255,255,255,.1)"}`,background:type===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.04)",color:type===t?"#00D4FF":"#94A3B8"}}>{t==="spotify"?"🟢 Spotify":"🔴 YouTube"}</button>)}</div>
      <div><Lbl>Paste Link</Lbl><input value={url} onChange={e=>setUrl(e.target.value)} placeholder={type==="spotify"?"https://open.spotify.com/track/...":"https://youtu.be/..."}/></div>
      <Btn onClick={()=>onSave({page_music:{url,type}})}>Save Music</Btn>
    </div>
  );
}
function EditTeamsModal({u,onSave}){
  const[mlb,setMlb]=useState(u.mlb_team||"");
  const[nfl,setNfl]=useState(u.nfl_team||"");
  const[tab,setTab]=useState("mlb");
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:8}}>{[["mlb","⚾ MLB"],["nfl","🏈 NFL"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"#00D4FF":"rgba(255,255,255,.1)"}`,background:tab===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.04)",color:tab===t?"#00D4FF":"#94A3B8"}}>{l}</button>)}</div>
      {tab==="mlb"&&<TeamPicker sport="mlb" teams={MLB} value={mlb} onChange={setMlb}/>}
      {tab==="nfl"&&<TeamPicker sport="nfl" teams={NFL} value={nfl} onChange={setNfl}/>}
      <Btn onClick={()=>onSave({mlb_team:mlb,nfl_team:nfl})}>Save Teams</Btn>
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
  const[badgeModal,setBadgeModal]=useState(false);
  const target=sel?users.find(u=>u.id===sel):null;
  if(!cu?.is_owner)return<div style={{padding:"100px 20px",textAlign:"center",color:"#334155"}}>Access denied</div>;
  const toggleBadge=async(uid,bid)=>{
    const u=users.find(x=>x.id===uid);if(!u)return;
    const bs=u.badges||[];
    const nb=bs.includes(bid)?bs.filter(b=>b!==bid):[...bs,bid];
    await sb.patch("nova_users",`?id=eq.${uid}`,{badges:nb});
    setUsers(prev=>prev.map(x=>x.id===uid?{...x,badges:nb}:x));
  };
  const setRole=async(uid,role)=>{
    await sb.patch("nova_users",`?id=eq.${uid}`,{staff_role:role||null});
    setUsers(prev=>prev.map(x=>x.id===uid?{...x,staff_role:role||null}:x));
  };
  const deleteUser=async uid=>{
    if(!confirm("Delete this user?"))return;
    await sb.del("nova_users",`?id=eq.${uid}`);
    setUsers(prev=>prev.filter(u=>u.id!==uid));
    setSel(null);
  };
  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:"44px 16px 80px"}}>
      <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:28,fontWeight:700,marginBottom:24,background:"linear-gradient(135deg,#F59E0B,#EF4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>⚡ Owner Dashboard</h1>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:16,marginBottom:20}}>
        <Card style={{padding:20}}><div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".15em",marginBottom:6}}>TOTAL MEMBERS</div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:32,fontWeight:900,color:"#00D4FF"}}>{users.length}</div></Card>
        <Card style={{padding:20}}><div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".15em",marginBottom:6}}>ONLINE NOW</div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:32,fontWeight:900,color:"#22C55E"}}>{users.filter(u=>u.status_type==="online").length}</div></Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:16}}>
        <div>
          <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:"#94A3B8",marginBottom:14,letterSpacing:".1em"}}>ALL MEMBERS</h2>
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:500,overflowY:"auto"}}>
            {users.map(u=>(
              <div key={u.id} onClick={()=>setSel(u.id===sel?null:u.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,background:sel===u.id?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",border:`1px solid ${sel===u.id?"rgba(0,212,255,.3)":"rgba(255,255,255,.07)"}`,cursor:"pointer",transition:"all .18s"}}>
                <Av user={u} size={34}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.display_name}</div>
                  <div style={{fontSize:11,color:"#475569"}}>@{u.username}{u.staff_role&&` · ${u.staff_role}`}</div>
                </div>
                <StatusDot type={u.status_type||"offline"} size={10}/>
              </div>
            ))}
          </div>
        </div>
        {target&&(
          <div>
            <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:"#94A3B8",marginBottom:14,letterSpacing:".1em"}}>MANAGE: {target.display_name}</h2>
            <Card style={{padding:18,display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <Lbl>Staff Role</Lbl>
                <select value={target.staff_role||""} onChange={e=>setRole(target.id,e.target.value)} style={{width:"100%"}}>
                  <option value="">None</option>
                  {Object.keys(ROLE_COLOR).map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <Lbl>Badges</Lbl>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {BADGES.map(b=>{const has=(target.badges||[]).includes(b.id);return(
                    <button key={b.id} onClick={()=>toggleBadge(target.id,b.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,cursor:"pointer",border:`1.5px solid ${has?b.color:b.color+"33"}`,background:has?b.color+"22":"rgba(255,255,255,.03)",color:has?b.color:"#475569",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,transition:"all .15s"}}><span>{b.icon}</span>{b.label}</button>
                  );})}
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn variant="ghost" size="sm" onClick={()=>navigate("profile",target.id)}>View Profile</Btn>
                {!target.is_owner&&<Btn variant="danger" size="sm" onClick={()=>deleteUser(target.id)}>Delete User</Btn>}
              </div>
            </Card>
          </div>
        )}
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
    const newUser={id:gid(),username:un,password:pw,display_name:dn,avatar:av,bio:"",is_owner:false,staff_role:null,joined:new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"}),badges:[],status_type:"online",status_activity:"",followers:[],following:[],page_accent:"#00D4FF",page_music:{},page_clips:[],page_social:[],page_social_links:{},banner_top_url:"",banner_left_url:"",banner_right_url:"",social_roblox:"",social_instagram:"",social_twitter:"",social_youtube:"",social_discord:"",mlb_team:"",nfl_team:"",dob:"",predictions:{},correct_predictions:0,avatar_url:""};
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
    setPage(p);
  };

  const addNotif=async(toId,fromId,msg)=>{
    const n={id:gid(),to_user_id:toId,from_user_id:fromId,msg,ts:Date.now(),read:false};
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
    if(page==="profile"&&profileId)return <ProfilePage userId={profileId} cu={cu} users={users} setUsers={us=>{setUsers(us);if(cu){const up=us.find(x=>x.id===cu.id);if(up)setCu(up);}}} navigate={nav} addNotif={addNotif}/>;
    if(page==="members")return <MembersPage users={users} nav={nav}/>;
    if(page==="feed")return <FeedPage users={users} cu={cu} likes={likes} onLike={handleLike} navigate={nav}/>;
    if(page==="predict")return <PredictPage cu={cu} users={users} setUsers={setUsers}/>;
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
        <Navbar cu={cu} onLogin={()=>setShowLogin(true)} onRegister={()=>setShowRegister(true)} onLogout={handleLogout} nav={nav} page={page} notifs={notifs} onReadNotifs={readNotifs} onClearNotifs={clearNotifs} users={users} msgUnread={msgUnread}/>
        {content()}
      </div>
      {showLogin&&<LoginModal onLogin={handleLogin} onClose={()=>setShowLogin(false)} users={users}/>}
      {showRegister&&<RegisterModal onRegister={handleRegister} onClose={()=>setShowRegister(false)}/>}
    </>
  );
}
