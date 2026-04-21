import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "../shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "../components/UI";

// ─── MatchupPage.jsx ──────────────────────────────────────────────────────────
// Batter vs. Pitcher simulation using pre-computed Statcast tendencies.
// Add this component to App.jsx and render it on page "matchup".
//
// Wiring (in App.jsx):
//   (MatchupPage is defined inline below)
//   OR paste this entire file directly into App.jsx before the closing `}`
//
// In App content() function, add:
//   if(page==="matchup") return <MatchupPage />;
//
// In the nav/sidebar, add a link:
//   <button onClick={()=>nav("matchup")}>⚔️ Matchup Sim</button>
//   <button onClick={()=>nav("animecards")}>🌸 Anime Cards</button>

// ─── Simulation engine (pure JS, no dependencies) ─────────────────────────────


// ─── Batter vs Pitcher Matchup Simulator v2 ───────────────────────────────────
// Uses MLB Stats API (2025 + 2026 season) via /api/hyperbeam proxy
// No CSV needed — fetches real stats on demand, caches per player

const SIM_CACHE = {};
const PLAYER_STAT_CACHE = {};

// ── Statcast helpers ──────────────────────────────────────────────────────────
function searchStatcastPlayers(q, type) {
  const lq = q.toLowerCase();
  return STATCAST_PLAYERS.filter(p =>
    p.name.toLowerCase().includes(lq) &&
    (type === "any" || !type || p.type === type)
  ).slice(0, 8).map(p => ({ id: p.id, name: p.name, team: p.type === "pitcher" ? "P" : "", type: p.type }));
}

function getStatcastProfile(playerId) {
  const bProf = STATCAST_TENDENCIES.batters?.[playerId];
  if (bProf) return { ...bProf, _source: "statcast" };
  const pProf = STATCAST_TENDENCIES.pitchers?.[playerId];
  if (pProf) return { ...pProf, _source: "statcast" };
  return null;
}

const PITCH_LABELS = {
  "FF":"4-Seam FB","FA":"Fastball","FT":"2-Seam FB","SI":"Sinker","FC":"Cutter",
  "SL":"Slider","CU":"Curveball","KC":"Knuckle Curve","CH":"Changeup",
  "FS":"Splitter","KN":"Knuckleball","UN":"Unknown","SW":"Sweeper","ST":"Sweeper",
};
const OUTCOME_LABELS = {
  "1B":"Single","2B":"Double","3B":"Triple","HR":"Home Run","BB":"Walk",
  "HBP":"Hit By Pitch","K":"Strikeout","OUT":"Out","GIDP":"Double Play",
};
const DEFAULT_OUTCOMES = {
  "1B":0.150,"2B":0.045,"3B":0.005,"HR":0.030,"BB":0.085,
  "K":0.220,"OUT":0.420,"HBP":0.010,"GIDP":0.025,"SF":0.007,
};
const OUTCOME_COLORS = {
  "HR":"#A855F7","3B":"#EC4899","2B":"#F59E0B","1B":"#22C55E",
  "BB":"#3B82F6","HBP":"#06B6D4","K":"#EF4444","OUT":"#475569","GIDP":"#374151",
};

function wRandom(weights){
  const keys=Object.keys(weights);
  const vals=keys.map(k=>weights[k]);
  const total=vals.reduce((a,b)=>a+b,0);
  if(total===0)return keys[Math.floor(Math.random()*keys.length)];
  let r=Math.random()*total;
  for(let i=0;i<keys.length;i++){r-=vals[i];if(r<=0)return keys[i];}
  return keys[keys.length-1];
}

function buildProfileFromStats(s,type){
  const avg=parseFloat(s.avg||s.battingAverage||0.250);
  const obp=parseFloat(s.obp||s.onBasePercentage||0.320);
  const slg=parseFloat(s.slg||s.sluggingPercentage||0.420);
  const kpct=s.strikeOuts&&s.plateAppearances?parseInt(s.strikeOuts)/parseInt(s.plateAppearances):0.22;
  const bbpct=s.baseOnBalls&&s.plateAppearances?parseInt(s.baseOnBalls)/parseInt(s.plateAppearances):0.085;
  const hr=s.homeRuns&&s.plateAppearances?parseInt(s.homeRuns)/parseInt(s.plateAppearances):0.030;
  const hits=s.hits&&s.atBats?parseInt(s.hits)/parseInt(s.atBats):avg;
  const doubles=s.doubles&&s.atBats?parseInt(s.doubles)/parseInt(s.atBats):hits*0.20;
  const triples=s.triples&&s.atBats?parseInt(s.triples)/parseInt(s.atBats):hits*0.03;
  const singles=Math.max(0,hits-doubles-triples-hr);
  const out=Math.max(0,1-kpct-bbpct-singles-doubles-triples-hr-0.01);
  const pMix={"FF":0.35,"SL":0.22,"CH":0.18,"FC":0.12,"CU":0.08,"SI":0.05};
  return{
    overall:{avg,obp,slg,k_pct:kpct,bb_pct:bbpct,hard_hit:slg>0.45?0.48:0.38},
    pitch_mix:pMix,
    vs_pitch:Object.fromEntries(Object.keys(pMix).map(pt=>{
      const fb=pt==="FF"||pt==="SI"||pt==="FC";
      const bk=pt==="SL"||pt==="CU";
      const bonus=(fb?(slg>0.50?0.06:-0.03):0)+(bk?(kpct<0.18?-0.04:0.05):0);
      const aAvg=Math.max(0.100,Math.min(0.400,avg+bonus));
      const aSlg=Math.max(0.150,Math.min(0.750,slg+bonus*1.8));
      const aK=Math.max(0.05,Math.min(0.55,kpct+(bk?0.06:-0.03)));
      const aBB=Math.max(0.02,bbpct);
      const h=aAvg;const d2=aSlg*0.20;const d3=aSlg*0.02;const ehr=aSlg*0.08;
      const s1=Math.max(0,h-d2-d3-ehr);const ot=Math.max(0,1-aK-aBB-s1-d2-d3-ehr-0.01);
      return[pt,{pct:pMix[pt],sample:200,avg:+aAvg.toFixed(3),obp:+(aAvg+aBB+0.01).toFixed(3),
        slg:+aSlg.toFixed(3),k_pct:+aK.toFixed(3),bb_pct:+aBB.toFixed(3),hard_hit:slg>0.45?0.48:0.35,
        outcomes:{"1B":+s1.toFixed(4),"2B":+d2.toFixed(4),"3B":+d3.toFixed(4),"HR":+ehr.toFixed(4),
          "BB":+aBB.toFixed(4),"K":+aK.toFixed(4),"OUT":+Math.max(0,ot).toFixed(4),"HBP":0.01,"GIDP":0.015}}];
    })),
  };
}

async function fetchPlayerStats(playerId,season){
  const key=`${playerId}_${season}`;
  if(PLAYER_STAT_CACHE[key])return PLAYER_STAT_CACHE[key];
  try{
    const url=encodeURIComponent(`https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=season&group=hitting,pitching&season=${season}&sportId=1`);
    const r=await fetch(`/api/hyperbeam?espn_proxy=1&url=${url}`);
    if(r.ok){
      const d=await r.json();
      const stats=(d?.stats||[]).flatMap(g=>g.splits||[]).find(s=>s.stat)?.stat||null;
      if(stats){PLAYER_STAT_CACHE[key]=stats;return stats;}
    }
  }catch(e){}
  return null;
}

async function buildMatchupProfiles(batterId,pitcherId){
  const[b26,b25,p26,p25]=await Promise.all([
    fetchPlayerStats(batterId,2026),fetchPlayerStats(batterId,2025),
    fetchPlayerStats(pitcherId,2026),fetchPlayerStats(pitcherId,2025),
  ]);
  const merge=(s26,s25)=>{
    if(!s25&&!s26)return[null,"N/A"];
    if(!s25)return[s26,"2026"];
    if(!s26)return[s25,"2025"];
    const pa26=parseInt(s26.plateAppearances||0);
    if(pa26>=80)return[s26,"2026"];
    if(pa26>0){
      const w=pa26/(pa26+parseInt(s25.plateAppearances||100));
      const bl=(a,b)=>+(parseFloat(a||0)*w+parseFloat(b||0)*(1-w)).toFixed(3);
      return[{...s25,...s26,avg:bl(s26.avg,s25.avg).toString(),obp:bl(s26.obp,s25.obp).toString(),slg:bl(s26.slg,s25.slg).toString(),_blended:true},"2025+2026"];
    }
    return[s25,"2025"];
  };
  const[bS,bSn]=merge(b26,b25);
  const[pS,pSn]=merge(p26,p25);
  return{
    batter:buildProfileFromStats(bS||{},"batter"),
    pitcher:buildProfileFromStats(pS||{},"pitcher"),
    bSeasons:bSn,pSeasons:pSn,bRaw:bS,pRaw:pS,
  };
}

function blendOutcomes(b,p,bw=0.6){
  const keys=new Set([...Object.keys(b||{}),...Object.keys(p||{}),...Object.keys(DEFAULT_OUTCOMES)]);
  const bl={};
  for(const k of keys)bl[k]=(b?.[k]??DEFAULT_OUTCOMES[k]??0)*bw+(p?.[k]??DEFAULT_OUTCOMES[k]??0)*(1-bw)+(DEFAULT_OUTCOMES[k]??0)*0.05;
  const t=Object.values(bl).reduce((a,c)=>a+c,0);
  for(const k of Object.keys(bl))bl[k]/=t;
  return bl;
}

function runSimulation(bProf,pProf,nSims=1000){
  const outC={};const pitchC={};const seqLog={};
  const pMix=pProf.pitch_mix||{"FF":1};let prev=null;
  for(let i=0;i<nSims;i++){
    const pt=wRandom(pMix);pitchC[pt]=(pitchC[pt]||0)+1;
    if(prev){const s=`${prev}→${pt}`;seqLog[s]=(seqLog[s]||0)+1;}prev=pt;
    const ev=wRandom(blendOutcomes(bProf.vs_pitch?.[pt]?.outcomes||null,pProf.vs_pitch?.[pt]?.outcomes||null));
    outC[ev]=(outC[ev]||0)+1;
  }
  const H=(outC["1B"]||0)+(outC["2B"]||0)+(outC["3B"]||0)+(outC["HR"]||0);
  const W=(outC["BB"]||0)+(outC["HBP"]||0);
  const AB=nSims-W-(outC["SF"]||0)-(outC["SB"]||0);
  const TB=(outC["1B"]||0)+2*(outC["2B"]||0)+3*(outC["3B"]||0)+4*(outC["HR"]||0);
  const avg=AB>0?H/AB:0,obp=nSims>0?(H+W)/nSims:0,slg=AB>0?TB/AB:0;
  const bo=bProf.overall||{};
  const insights=[];
  const vsp=bProf.vs_pitch||{};
  const pts=Object.entries(vsp).filter(([,d])=>d.sample>=20).map(([pt,d])=>({pt,label:PITCH_LABELS[pt]||pt,...d}));
  if(pts.length>=2){
    const bySlg=[...pts].sort((a,b)=>(b.slg||0)-(a.slg||0));
    if(bySlg[0]?.slg>=0.45)insights.push(`Crushes ${bySlg[0].label}s (.${Math.round((bySlg[0].slg||0)*1000)} SLG)`);
    if(bySlg[bySlg.length-1]?.slg<=0.30)insights.push(`Struggles vs ${bySlg[bySlg.length-1].label}s (.${Math.round((bySlg[bySlg.length-1].slg||0)*1000)} SLG)`);
    const byK=[...pts].sort((a,b)=>(b.k_pct||0)-(a.k_pct||0));
    if(byK[0]?.k_pct>=0.30)insights.push(`High K rate vs ${byK[0].label}s (${Math.round((byK[0].k_pct||0)*100)}%)`);
  }
  if((bo.hard_hit||0)>=0.44)insights.push(`Hard contact machine — ${Math.round((bo.hard_hit||0)*100)}% hard hit rate`);
  if((bo.k_pct||0)>=0.28)insights.push(`Strikeout risk (${Math.round((bo.k_pct||0)*100)}% K rate)`);
  if((bo.bb_pct||0)>=0.12)insights.push(`Patient — ${Math.round((bo.bb_pct||0)*100)}% walk rate`);
  if(insights.length===0)insights.push("Simulation built from 2025+2026 season stats.");
  return{
    stats:{avg:+avg.toFixed(3),obp:+obp.toFixed(3),slg:+slg.toFixed(3),ops:+(obp+slg).toFixed(3),kPct:+(outC["K"]||0)/nSims,bbPct:W/nSims,hrPct:+(outC["HR"]||0)/nSims},
    outcomes:Object.entries(outC).sort((a,b)=>b[1]-a[1]).map(([ev,n])=>({ev,label:OUTCOME_LABELS[ev]||ev,n,pct:n/nSims})),
    pitchUsage:Object.entries(pitchC).sort((a,b)=>b[1]-a[1]).map(([pt,n])=>({pt,label:PITCH_LABELS[pt]||pt,pct:n/nSims})),
    sequences:Object.entries(seqLog).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([s,n])=>{const[p1,p2]=s.split("→");return{label:`${PITCH_LABELS[p1]||p1} → ${PITCH_LABELS[p2]||p2}`,pct:n/nSims};}),
    insights,nSims,
  };
}

export default function MatchupPage(){
  const mob=useIsMobile();
  const[bSearch,setBSearch]=useState("");
  const[pSearch,setPSearch]=useState("");
  const[bResults,setBResults]=useState([]);
  const[pResults,setPResults]=useState([]);
  const[selBatter,setSelBatter]=useState(null);
  const[selPitcher,setSelPitcher]=useState(null);
  const[simResult,setSimResult]=useState(null);
  const[loading,setLoading]=useState(false);
  const[loadMsg,setLoadMsg]=useState("");
  const[nSims,setNSims]=useState(1000);
  const[showBDD,setShowBDD]=useState(false);
  const[showPDD,setShowPDD]=useState(false);
  const[bStats,setBStats]=useState(null);
  const[pStats,setPStats]=useState(null);
  const[dataSeasons,setDataSeasons]=useState({b:"",p:""});
  const AC="#F59E0B";
  const searchPlayers=(q,setter,showDD,type)=>{
    if(q.length<2){setter([]);return;}
    const results=searchStatcastPlayers(q,type||"any");
    setter(results);
    if(results.length>0)showDD(true);
  };
  const scol=(k,v)=>{
    if(k==="avg")return v>=0.280?"#22C55E":v>=0.240?"#F59E0B":"#EF4444";
    if(k==="obp")return v>=0.350?"#22C55E":v>=0.310?"#F59E0B":"#EF4444";
    if(k==="slg")return v>=0.450?"#22C55E":v>=0.380?"#F59E0B":"#EF4444";
    if(k==="ops")return v>=0.800?"#22C55E":v>=0.700?"#F59E0B":"#EF4444";
    if(k==="kPct")return v<=0.18?"#22C55E":v<=0.25?"#F59E0B":"#EF4444";
    if(k==="bbPct")return v>=0.10?"#22C55E":v>=0.07?"#F59E0B":"#64748B";
    return"#94A3B8";
  };
  const fmtS=(k,v)=>{
    if(["kPct","bbPct","hrPct"].includes(k))return`${(v*100).toFixed(1)}%`;
    if(["avg","obp","slg"].includes(k)){const s=v.toFixed(3);return s.startsWith("0")?s.slice(1):s;}
    return v.toFixed(3);
  };
  const inp={width:"100%",padding:"9px 13px",borderRadius:10,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",color:"#E2E8F0",fontSize:13,outline:"none"};
  const runSim=async()=>{
    if(!selBatter||!selPitcher)return;
    const ck=`${selBatter.id}|${selPitcher.id}|${nSims}`;
    if(SIM_CACHE[ck]){setSimResult(SIM_CACHE[ck]);return;}
    setLoading(true);setLoadMsg("Loading Statcast tendencies…");
    try{
      // Try statcast profiles first
      const bStatcast=getStatcastProfile(selBatter.id);
      const pStatcast=getStatcastProfile(selPitcher.id);
      let batter,pitcher,bSeasons="Statcast",pSeasons="Statcast",bRaw=null,pRaw=null;
      if(bStatcast&&pStatcast){
        batter=bStatcast;pitcher=pStatcast;
      } else {
        setLoadMsg("Fetching 2025 & 2026 stats…");
        const profiles=await buildMatchupProfiles(selBatter.id,selPitcher.id);
        batter=bStatcast||profiles.batter;
        pitcher=pStatcast||profiles.pitcher;
        bSeasons=bStatcast?"Statcast":profiles.bSeasons;
        pSeasons=pStatcast?"Statcast":profiles.pSeasons;
        bRaw=profiles.bRaw;pRaw=profiles.pRaw;
      }
      setBStats(bRaw);setPStats(pRaw);setDataSeasons({b:bSeasons,p:pSeasons});
      setLoadMsg("Running simulations…");
      await new Promise(r=>setTimeout(r,16));
      const result=runSimulation(batter,pitcher,nSims);
      SIM_CACHE[ck]=result;setSimResult(result);
    }catch(e){console.error(e);}
    setLoading(false);setLoadMsg("");
  };
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:mob?"10px 10px 100px":"20px 20px 80px"}}>
      {loading&&<div style={{position:"fixed",inset:0,background:"rgba(3,7,18,.88)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}><div style={{fontSize:36}}>⚾</div><div style={{fontFamily:"'Orbitron',sans-serif",color:"#F59E0B",fontSize:13}}>{loadMsg}</div></div>}
      <div style={{marginBottom:18}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?18:24,fontWeight:900,color:"#E2E8F0",marginBottom:4}}>⚔️ BATTER vs PITCHER</div>
        <div style={{fontSize:11,color:"#475569"}}>Monte Carlo simulation · Real MLB 2025 + 2026 stats</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14,marginBottom:14}}>
        <div>
          <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:5}}>BATTER</div>
          <div style={{position:"relative"}}>
            <input style={inp} placeholder="Search batter…" value={bSearch}
              onChange={e=>{setBSearch(e.target.value);searchPlayers(e.target.value,setBResults,setShowBDD,"batter");setSelBatter(null);setSimResult(null);}}
              onFocus={()=>bResults.length>0&&setShowBDD(true)}
              onBlur={()=>setTimeout(()=>setShowBDD(false),150)}/>
            {selBatter&&<div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",width:7,height:7,borderRadius:"50%",background:"#22C55E"}}/>}
            {showBDD&&bResults.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:100,background:"#0F172A",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,maxHeight:200,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,.6)"}}>
              {bResults.map(p=><div key={p.id} onMouseDown={()=>{setSelBatter(p);setBSearch(p.name);setShowBDD(false);setBResults([]);}}
                style={{padding:"9px 14px",cursor:"pointer",fontSize:12,color:"#CBD5E1",borderBottom:"1px solid rgba(255,255,255,.04)"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(245,158,11,.08)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                {p.name}<span style={{fontSize:10,color:"#334155",marginLeft:6}}>{p.team||""}</span></div>)}
            </div>}
          </div>
          {selBatter&&bStats&&<div style={{marginTop:5,padding:"5px 9px",borderRadius:7,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",fontSize:10}}>
            <span style={{color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:8}}>{dataSeasons.b} · </span>
            {[["AVG",bStats.avg||"—"],["OBP",bStats.obp||"—"],["SLG",bStats.slg||"—"],["HR",bStats.homeRuns||"—"]].map(([l,v])=><span key={l} style={{marginRight:8}}><span style={{color:"#475569",fontSize:9}}>{l} </span><span style={{color:AC,fontWeight:700}}>{v}</span></span>)}
          </div>}
        </div>
        <div>
          <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:5}}>PITCHER</div>
          <div style={{position:"relative"}}>
            <input style={inp} placeholder="Search pitcher…" value={pSearch}
              onChange={e=>{setPSearch(e.target.value);searchPlayers(e.target.value,setPResults,setShowPDD,"pitcher");setSelPitcher(null);setSimResult(null);}}
              onFocus={()=>pResults.length>0&&setShowPDD(true)}
              onBlur={()=>setTimeout(()=>setShowPDD(false),150)}/>
            {selPitcher&&<div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",width:7,height:7,borderRadius:"50%",background:"#22C55E"}}/>}
            {showPDD&&pResults.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:100,background:"#0F172A",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,maxHeight:200,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,.6)"}}>
              {pResults.map(p=><div key={p.id} onMouseDown={()=>{setSelPitcher(p);setPSearch(p.name);setShowPDD(false);setPResults([]);}}
                style={{padding:"9px 14px",cursor:"pointer",fontSize:12,color:"#CBD5E1",borderBottom:"1px solid rgba(255,255,255,.04)"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(245,158,11,.08)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                {p.name}<span style={{fontSize:10,color:"#334155",marginLeft:6}}>{p.team||""}</span></div>)}
            </div>}
          </div>
          {selPitcher&&pStats&&<div style={{marginTop:5,padding:"5px 9px",borderRadius:7,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",fontSize:10}}>
            <span style={{color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:8}}>{dataSeasons.p} · </span>
            {[["ERA",pStats.era||"—"],["K",pStats.strikeOuts||"—"],["BB",pStats.baseOnBalls||"—"],["WHIP",pStats.whip||"—"]].map(([l,v])=><span key={l} style={{marginRight:8}}><span style={{color:"#475569",fontSize:9}}>{l} </span><span style={{color:AC,fontWeight:700}}>{v}</span></span>)}
          </div>}
        </div>
      </div>
      <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
        <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>SIMS:</div>
        {[500,1000,5000,10000].map(n=><button key={n} onClick={()=>{setNSims(n);setSimResult(null);}}
          style={{padding:"4px 11px",borderRadius:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
            border:`1px solid ${nSims===n?AC+"66":"rgba(255,255,255,.08)"}`,background:nSims===n?AC+"14":"rgba(255,255,255,.02)",color:nSims===n?AC:"#475569"}}>{n.toLocaleString()}</button>)}
        <button onClick={runSim} disabled={!selBatter||!selPitcher||loading}
          style={{marginLeft:"auto",padding:"10px 22px",borderRadius:12,border:"none",cursor:!selBatter||!selPitcher?"not-allowed":"pointer",
            fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:900,color:"#fff",
            background:!selBatter||!selPitcher?"rgba(255,255,255,.06)":`linear-gradient(135deg,${AC},${AC}cc)`,
            opacity:!selBatter||!selPitcher?0.4:1}}>
          {loading?"Running…":"▶ SIMULATE"}
        </button>
      </div>
      {selBatter&&selPitcher&&<div style={{textAlign:"center",padding:"7px 0",marginBottom:12,fontSize:mob?13:16,fontFamily:"'Orbitron',sans-serif",fontWeight:900,color:"#E2E8F0"}}>
        {selBatter.name} <span style={{color:"#334155",fontWeight:400,fontSize:11}}>vs</span> {selPitcher.name}
      </div>}
      {simResult&&<SimResultsBlock result={simResult} scol={scol} fmtS={fmtS} ac={AC} dataSeasons={dataSeasons} mob={mob}/>}
    </div>
  );
}

export function SimResultsBlock({result,scol,fmtS,ac,dataSeasons,mob}){
  const maxPct=result.outcomes[0]?.pct||1;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(4,1fr)":"repeat(7,1fr)",gap:7,marginBottom:14}}>
        {[["avg","AVG"],["obp","OBP"],["slg","SLG"],["ops","OPS"],["kPct","K%"],["bbPct","BB%"],["hrPct","HR%"]].map(([k,l])=>(
          <div key={k} style={{textAlign:"center",padding:"9px 5px",borderRadius:11,background:"rgba(255,255,255,.04)",border:`1px solid ${scol(k,result.stats[k])}33`}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:"#475569",marginBottom:3}}>{l}</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?14:18,fontWeight:900,color:scol(k,result.stats[k])}}>{fmtS(k,result.stats[k])}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"12px 14px",borderRadius:14,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",marginBottom:12}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",marginBottom:9}}>OUTCOME DISTRIBUTION</div>
        {result.outcomes.slice(0,8).map(({ev,label,pct})=>(
          <div key={ev} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
            <div style={{width:mob?52:70,fontSize:10,color:OUTCOME_COLORS[ev]||"#64748B",fontFamily:"'Orbitron',sans-serif",fontWeight:700,textAlign:"right",flexShrink:0}}>{label}</div>
            <div style={{flex:1,background:"rgba(255,255,255,.05)",borderRadius:4,height:15,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,borderRadius:4,background:(OUTCOME_COLORS[ev]||"#64748B")+"bb",width:`${(pct/maxPct)*100}%`,transition:"width .5s"}}/>
              <div style={{position:"absolute",right:5,top:"50%",transform:"translateY(-50%)",fontSize:9,color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontWeight:700,zIndex:1}}>{(pct*100).toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10,marginBottom:12}}>
        <div style={{padding:"12px 14px",borderRadius:14,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",marginBottom:9}}>PITCH USAGE</div>
          {result.pitchUsage.slice(0,6).map(({pt,label,pct})=>(
            <div key={pt} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <div style={{width:75,fontSize:10,color:"#94A3B8",flexShrink:0}}>{label}</div>
              <div style={{flex:1,background:"rgba(255,255,255,.04)",borderRadius:3,height:10}}>
                <div style={{height:"100%",borderRadius:3,background:ac+"99",width:`${pct*100}%`,transition:"width .4s"}}/>
              </div>
              <div style={{fontSize:9,color:"#64748B",width:30,textAlign:"right",fontFamily:"'Orbitron',sans-serif"}}>{(pct*100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
        <div style={{padding:"12px 14px",borderRadius:14,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",marginBottom:9}}>PITCH SEQUENCES</div>
          {result.sequences.map(({label,pct},i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
              <span style={{fontSize:10,color:"#94A3B8"}}>{label}</span>
              <span style={{fontSize:10,color:ac,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{(pct*100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"12px 14px",borderRadius:14,background:"rgba(168,85,247,.06)",border:"1px solid rgba(168,85,247,.18)"}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#A855F7",marginBottom:8}}>🔍 MATCHUP INSIGHTS</div>
        {result.insights.map((t,i)=><div key={i} style={{display:"flex",gap:7,marginBottom:5}}><span style={{color:"#A855F7",flexShrink:0}}>•</span><span style={{fontSize:12,color:"#CBD5E1",lineHeight:1.5}}>{t}</span></div>)}
        <div style={{marginTop:7,fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>{result.nSims.toLocaleString()} simulated PAs · Data: {dataSeasons.b||"2025"} batter / {dataSeasons.p||"2025"} pitcher</div>
      </div>
    </div>
  );
}


