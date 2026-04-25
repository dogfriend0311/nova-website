import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "./shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "./UI";

// ─── GM Mode — Sports GM Simulation ─────────────────────────────────────────
// Full sports GM game: roster management, trades, draft, season simulation
// Uses Claude AI for trade evaluation, simulation, and draft grading

// ─── GM Mode v2 — Step-by-Step Offseason Planner ────────────────────────────
// Gemini free tier: 15 req/min, 1500/day — queue calls to avoid 429
const _aiQueue={queue:[],running:0,maxConcurrent:1};
function _aiEnqueue(fn){return new Promise((res,rej)=>{_aiQueue.queue.push({fn,res,rej});_aiDrain();});}
async function _aiDrain(){
  if(_aiQueue.running>=_aiQueue.maxConcurrent||!_aiQueue.queue.length)return;
  _aiQueue.running++;
  const{fn,res,rej}=_aiQueue.queue.shift();
  try{res(await fn());}catch(e){rej(e);}finally{_aiQueue.running--;setTimeout(_aiDrain,800);} // 800ms gap between calls
}
async function aiCall(prompt,sys="You are an expert sports analyst. Return only valid JSON.",maxTok=2000){
  return _aiEnqueue(async()=>{
    for(let attempt=0;attempt<4;attempt++){
      try{
        const r=await fetch("/api/hyperbeam?gm_ai=1",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({prompt,system:sys,max_tokens:maxTok}),
        });
        if(!r.ok)throw new Error(`Proxy ${r.status}`);
        const d=await r.json();
        if(d.error&&d.error.includes("429")){
          // Rate limited — wait and retry
          const wait=[5000,15000,30000][attempt]||30000;
          console.warn(`Gemini 429 — retrying in ${wait/1000}s (attempt ${attempt+1})`);
          await new Promise(r=>setTimeout(r,wait));
          continue;
        }
        if(d.error){console.warn("aiCall:",d.error);return{error:d.error};}
        let t=d.text||"{}";
        t=t.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/\s*```\s*$/,"").trim();
        if(!t.startsWith("[")&&!t.startsWith("{")){const m=t.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);if(m)t=m[1];}
        return JSON.parse(t);
      }catch(e){
        if(attempt<3){await new Promise(r=>setTimeout(r,3000*(attempt+1)));continue;}
        console.error("aiCall failed:",e.message);return{error:String(e)};
      }
    }
    return{error:"Max retries exceeded"};
  });
}

// ── Constants ─────────────────────────────────────────────────────────────────
export const GM_SPORTS=[
  {id:"mlb",label:"MLB",icon:"⚾",color:"#22C55E",espnPath:"baseball/mlb"},
  {id:"nfl",label:"NFL",icon:"🏈",color:"#EF4444",espnPath:"football/nfl"},
  {id:"nba",label:"NBA",icon:"🏀",color:"#F59E0B",espnPath:"basketball/nba"},
  {id:"nhl",label:"NHL",icon:"🏒",color:"#00D4FF",espnPath:"hockey/nhl"},
];
export const CAP_TABLE={mlb:{cap:240,luxury:237},nfl:{cap:255,luxury:280},nba:{cap:136,luxury:165},nhl:{cap:88,luxury:99}};
export const ROSTER_RULES={
  mlb:{active:26,max:40,il10:true,il60:true,waivers:true,rule5:true,pickTrade:false},
  nfl:{active:53,max:53,il10:false,il60:false,waivers:true,rule5:false,pickTrade:true},
  nba:{active:15,max:15,il10:true,il60:false,waivers:true,rule5:false,pickTrade:true},
  nhl:{active:23,max:23,il10:false,il60:false,waivers:true,rule5:false,pickTrade:true},
};
export const GAMES={mlb:162,nfl:17,nba:82,nhl:82};
export const AWARDS={mlb:["MVP","Cy Young","Rookie of Year","Gold Glove","All-Star"],nfl:["MVP","OPOY","DPOY","OROY","All-Pro","Pro Bowl"],nba:["MVP","DPOY","ROY","MIP","Sixth Man","All-NBA","All-Star"],nhl:["Hart Trophy","Norris","Vezina","Calder","All-Star"]};
export const GM_POSITIONS={mlb:["SP","RP","C","1B","2B","3B","SS","LF","CF","RF","DH"],nfl:["QB","RB","WR","TE","OT","G","C","DE","DT","LB","CB","S","K"],nba:["PG","SG","SF","PF","C"],nhl:["C","LW","RW","D","G"]};
export const DEPTH_SLOTS={mlb:["SP1","SP2","SP3","SP4","SP5","CL","SU1","SU2","C","1B","2B","3B","SS","LF","CF","RF","DH","BN1","BN2"],nfl:["QB","RB1","RB2","WR1","WR2","WR3","TE","OT","G","C","DE1","DE2","DT","LB1","LB2","CB1","CB2","S1","S2","K"],nba:["PG","SG","SF","PF","C","6th","Bench1","Bench2","Bench3","Bench4"],nhl:["C1","LW1","RW1","C2","LW2","RW2","C3","LW3","RW3","D1","D2","D3","D4","G1","G2"]};
export const SCHEMES={nfl:["4-3","3-4","4-2-5 Nickel","3-3-5","2-4-5 Dime"],mlb:["Power","Small Ball","Pitching First","Analytics","Speed"],nba:["Run & Gun","Defensive Grind","Iso Heavy","Motion Offense","Twin Towers"],nhl:["Trap","Offensive Zone","Physical","Speed Based","Balanced"]};
export const GM_STEPS=[{id:"trim",n:1,label:"Trim the Fat",icon:"✂️",desc:"Cut & waive players"},{id:"cap",n:2,label:"Cap Gymnastics",icon:"💰",desc:"Restructure & extend"},{id:"trades",n:3,label:"Trade Block",icon:"🔄",desc:"Field & make offers"},{id:"fa",n:4,label:"Free Agency",icon:"🖊",desc:"Sign your guys"},{id:"draft",n:5,label:"Mock Draft",icon:"🎓",desc:"Draft real prospects"},{id:"command",n:6,label:"Command Center",icon:"⚙️",desc:"Depth chart & roster"},{id:"review",n:7,label:"Review",icon:"🏆",desc:"Grade & simulate"}];

// ── Player utilities ──────────────────────────────────────────────────────────
export function enrichPlayer(p,sport){
  const age=p.age||25,ovr=p.ovr||70;
  return{...p,
    potential:p.potential||Math.min(99,ovr+(age<=21?Math.floor(Math.random()*25)+10:age<=24?Math.floor(Math.random()*15)+4:age<=27?Math.floor(Math.random()*8)+2:Math.floor(Math.random()*4))),
    traits:p.traits||[],
    contractType:p.contractType||"standard",
    options:p.options||null,
    noTradeClause:p.noTradeClause||false,
    on40man:p.on40man!==undefined?p.on40man:true,
    il:p.il||null,
    serviceTime:p.serviceTime||Math.max(0,age-22),
    injuryHistory:p.injuryHistory||[],
    devSpeed:p.devSpeed||(age<24?"fast":age<28?"normal":"slow"),
    awardsWon:p.awardsWon||[],
    seasonStats:p.seasonStats||{},
    careerStats:p.careerStats||{},
  };
}

export function progressPlayer(p,simResult,yr){
  const newAge=p.age+1;
  let ovrDelta=0;
  if(newAge<=25)ovrDelta=p.devSpeed==="fast"?Math.floor(Math.random()*4)+1:Math.floor(Math.random()*3);
  else if(newAge<=28)ovrDelta=Math.floor(Math.random()*3)-1;
  else if(newAge<=32)ovrDelta=-(Math.floor(Math.random()*2)+1);
  else if(newAge<=35)ovrDelta=-(Math.floor(Math.random()*2)+2);
  else ovrDelta=-(Math.floor(Math.random()*3)+2);
  const perf=simResult?.playerStats?.find(s=>s.name===p.name);
  if(perf&&ovrDelta<0&&(perf.grade==="A"||perf.grade==="A+"))ovrDelta+=1;
  const newOvr=Math.max(45,Math.min(p.potential||99,p.ovr+ovrDelta));
  return{...p,age:newAge,ovr:newOvr,years:Math.max(0,p.years-1),serviceTime:(p.serviceTime||0)+1,lastProgression:ovrDelta,il:null,injuryHistory:p.il?[...(p.injuryHistory||[]),{year:yr,type:p.il==="60"?"60-day IL":"10-day IL"}]:(p.injuryHistory||[]),status:p.years<=1?"expired":p.il?"active":p.status};
}

export function playerTradeValue(p,sport){
  const capT=CAP_TABLE[sport]||{cap:200};
  let v=(p.ovr||70)*0.8;
  const age=p.age||28;
  if(age<=25)v*=1.2+((p.potential||p.ovr||70)-(p.ovr||70))*0.015;
  else if(age<=29)v*=1.1;
  else if(age<=32)v*=0.92;
  else v*=Math.max(0.5,1-(age-32)*0.08);
  const marketSal=(((p.ovr||70)/99)*capT.cap*0.18);
  v*=Math.min(1.5,marketSal/Math.max(1,p.salary||5));
  if((p.injuryHistory?.length||0)>2)v*=0.85;
  if(p.noTradeClause)v*=0.9;
  return Math.round(Math.max(10,v));
}

export function calcCap(roster,sport){
  const ct=CAP_TABLE[sport]||{cap:200,luxury:220};
  const used=roster.filter(Boolean).reduce((s,p)=>s+(p.il==="60"?p.salary*0.5:p.salary||0),0);
  return{used:parseFloat(used.toFixed(2)),total:ct.cap,space:parseFloat((ct.cap-used).toFixed(2)),luxury:used>ct.luxury,luxuryAmt:Math.max(0,used-ct.luxury),pct:(used/ct.cap)*100};
}

export function generateInjuries(roster,sport,gamesTotal){
  const rates={mlb:0.4,nfl:0.75,nba:0.3,nhl:0.5};
  const typesBySport={
    mlb:[{t:"Hamstring strain",il:"10",g:10},{t:"Oblique strain",il:"10",g:15},{t:"UCL",il:"60",g:60},{t:"Shoulder inflammation",il:"10",g:18},{t:"Wrist contusion",il:"10",g:12},{t:"Knee sprain",il:"60",g:45}],
    nfl:[{t:"Hamstring",g:2},{t:"Concussion",g:1},{t:"ACL tear",g:17},{t:"High ankle sprain",g:4},{t:"Shoulder",g:3}],
    nba:[{t:"Hamstring strain",g:10},{t:"Ankle sprain",g:6},{t:"Back tightness",g:8},{t:"Knee soreness",g:12},{t:"Finger fracture",g:5}],
    nhl:[{t:"Upper body",g:6},{t:"Lower body",g:8},{t:"Concussion",g:3},{t:"Shoulder",g:10}],
  };
  const types=typesBySport[sport]||typesBySport.nba;
  const injuries=[];
  roster.filter(p=>p.status==="active").forEach(p=>{
    const factor=(p.age>32?1.4:p.age>28?1.1:0.9)*((p.injuryHistory?.length||0)>2?1.3:1);
    if(Math.random()<(rates[sport]||0.4)*factor*0.25){
      const inj=types[Math.floor(Math.random()*types.length)];
      injuries.push({name:p.name,pos:p.pos,type:inj.t,games_missed:inj.g,il:inj.il||null,severity:inj.g>30?"Season-ending":inj.g>14?"Significant":"Minor",game:Math.floor(Math.random()*gamesTotal)+1});
    }
  });
  return injuries;
}

// ── OVR badge ─────────────────────────────────────────────────────────────────
export function OVRBadge({ovr}){
  const col=!ovr?"#64748B":ovr>=93?"#A855F7":ovr>=87?"#22C55E":ovr>=80?"#3B82F6":ovr>=73?"#F59E0B":"#64748B";
  return<div style={{minWidth:34,textAlign:"center",padding:"3px 6px",borderRadius:7,background:col+"20",border:`1px solid ${col}44`}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,color:col}}>{ovr||"?"}</div></div>;
}

export function GradeChip({grade}){
  const col=!grade?"#475569":grade.startsWith("A")?"#22C55E":grade.startsWith("B")?"#F59E0B":grade.startsWith("C")?"#FB923C":"#EF4444";
  return<div style={{padding:"2px 8px",borderRadius:10,background:col+"20",border:`1px solid ${col}44`,fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:col}}>{grade||"?"}</div>;
}

export function CapBar({used,total,ac}){
  const pct=Math.min(100,(used/total)*100);
  const col=pct>95?"#EF4444":pct>82?"#F59E0B":ac;
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#475569",marginBottom:3}}>
      <span style={{fontFamily:"'Orbitron',sans-serif"}}>${used.toFixed(1)}M used</span>
      <span style={{color:col}}>${(total-used).toFixed(1)}M space{pct>95?" ⚠️ OVER":pct>82?" ⚠️ TIGHT":""}</span>
    </div>
    <div style={{height:5,background:"rgba(255,255,255,.07)",borderRadius:3}}>
      <div style={{height:"100%",borderRadius:3,background:col,width:`${pct}%`,transition:"width .3s"}}/>
    </div>
  </div>);
}

// ── Main GMGame component ─────────────────────────────────────────────────────
export default function GMGame({cu}){
  const mob=useIsMobile();
  const[phase,setPhase]=useState("setup");
  const[step,setStep]=useState("trim");
  const[sport,setSport]=useState(null);
  const[teams,setTeams]=useState([]);
  const[myTeam,setMyTeam]=useState(null);
  const[year,setYear]=useState(2025);
  const[season,setSeason]=useState(1); // franchise season #
  const[roster,setRoster]=useState([]); // active + IL roster
  const[roster40,setRoster40]=useState([]); // 40-man (MLB only)
  const[farmSystem,setFarmSystem]=useState({AAA:[],AA:[],A:[],Rookie:[]});
  const[freeAgents,setFreeAgents]=useState([]);
  const[faAuctions,setFaAuctions]=useState({});
  const[cuts,setCuts]=useState([]);
  const[waived,setWaived]=useState([]);
  const[extensions,setExtensions]=useState({});
  const[tradeBlock,setTradeBlock]=useState([]);
  const[tradeOffers,setTradeOffers]=useState([]);
  const[myTradeOffer,setMyTradeOffer]=useState({myPlayers:[],myPicks:[],theirPlayers:[],theirPicks:[],theirTeam:"",result:null,loading:false,cashRetained:0});
  const[tradeTargets,setTradeTargets]=useState([]);
  const[loadingTargets,setLoadingTargets]=useState(false);
  const[pickInventory,setPickInventory]=useState([]); // my draft picks
  const[draftBoard,setDraftBoard]=useState([]);
  const[myDraftPicks,setMyDraftPicks]=useState([]);
  const[aiDraftOffers,setAiDraftOffers]=useState([]);
  const[undoStack,setUndoStack]=useState([]); // for undo draft picks
  const[depthChart,setDepthChart]=useState({});
  const[scheme,setScheme]=useState("");
  const[budget,setBudget]=useState({payroll:200,scouting:20,development:15,international:10});
  const[ownerGoals,setOwnerGoals]=useState([]);
  const[allMoves,setAllMoves]=useState([]);
  const[simResult,setSimResult]=useState(null);
  const[simHistory,setSimHistory]=useState([]); // past season results
  const[offseasonGrade,setOffseasonGrade]=useState(null);
  const[loading,setLoading]=useState(false);
  const[loadMsg,setLoadMsg]=useState("");
  const[simProgress,setSimProgress]=useState(0);
  const[toast,setToast]=useState(null);
  const[savedState,setSavedState]=useState(null);
  const[cmdOpen,setCmdOpen]=useState(false);
  const[rosterTab,setRosterTab]=useState("active"); // active|40man|farm|il|waived
  const[qaOfferPlayers,setQaOfferPlayers]=useState({}); // QO sent to players
  const[awardWinners,setAwardWinners]=useState(null);
  const[allStarRoster,setAllStarRoster]=useState(null);

  const sc=GM_SPORTS.find(s=>s.id===sport);
  const ac=sc?.color||"#00D4FF";
  const capInfo=calcCap(roster,sport);
  const rules=ROSTER_RULES[sport]||ROSTER_RULES.mlb;

  const showToast=(msg,color="#22C55E")=>{setToast({msg,color});setTimeout(()=>setToast(null),3500);};
  const logMove=(msg)=>setAllMoves(p=>[{msg,ts:Date.now()},...p].slice(0,100));

  // ── Persist ─────────────────────────────────────────────────────────────
  useEffect(()=>{
    try{
      const raw=localStorage.getItem(`gm3_${cu?.id||"g"}`);
      if(raw)setSavedState(JSON.parse(raw));
      // Also try old gm2 save for migration
      else{
        const old=localStorage.getItem(`gm2_${cu?.id||"g"}`);
        if(old)setSavedState({...JSON.parse(old),_migrated:true});
      }
    }catch(e){}
  },[]);

  const save=useCallback((extra={})=>{
    const s={sport,myTeam,year,season,roster,roster40,farmSystem,freeAgents,cuts,waived,tradeBlock,depthChart,scheme,budget,ownerGoals,allMoves,myDraftPicks,draftBoard,simResult,simHistory,offseasonGrade,pickInventory,faAuctions,phase,step,...extra};
    try{localStorage.setItem(`gm3_${cu?.id||"g"}`,JSON.stringify(s));}catch(e){console.warn("Save failed (storage full?):",e);}
  },[sport,myTeam,year,season,roster,roster40,farmSystem,freeAgents,cuts,waived,tradeBlock,depthChart,scheme,budget,ownerGoals,allMoves,myDraftPicks,draftBoard,simResult,simHistory,offseasonGrade,pickInventory,faAuctions,phase,step]);

  const loadSave=()=>{
    if(!savedState)return;
    const s=savedState;
    setSport(s.sport);setMyTeam(s.myTeam);setYear(s.year||2025);setSeason(s.season||1);
    setRoster((s.roster||[]).map(p=>enrichPlayer(p,s.sport)));
    setRoster40(s.roster40||[]);
    setFarmSystem(s.farmSystem||{AAA:[],AA:[],A:[],Rookie:[]});
    setFreeAgents(s.freeAgents||[]);setFaAuctions(s.faAuctions||{});
    setCuts(s.cuts||[]);setWaived(s.waived||[]);
    setTradeBlock(s.tradeBlock||[]);setDepthChart(s.depthChart||{});setScheme(s.scheme||"");
    setBudget(s.budget||{payroll:200,scouting:20,development:15,international:10});
    setOwnerGoals(s.ownerGoals||[]);setAllMoves(s.allMoves||[]);
    setMyDraftPicks(s.myDraftPicks||[]);setDraftBoard(s.draftBoard||[]);
    setSimResult(s.simResult||null);setSimHistory(s.simHistory||[]);
    setOffseasonGrade(s.offseasonGrade||null);setPickInventory(s.pickInventory||[]);
    setPhase(s.phase||"steps");setStep(s.step||"trim");
  };

  // ── Load teams ────────────────────────────────────────────────────────────
  const loadTeams=async(s)=>{
    setLoading(true);setLoadMsg("Loading teams...");
    try{
      const r=await fetch(`https://site.api.espn.com/apis/site/v2/sports/${GM_SPORTS.find(x=>x.id===s).espnPath}/teams?limit=60`);
      const d=await r.json();
      const list=(d.sports?.[0]?.leagues?.[0]?.teams||d.teams||[]).map(t=>{
        const team=t.team||t;
        return{id:String(team.id),abbr:team.abbreviation||"",name:team.displayName||team.name||"",logo:team.logos?.[0]?.href||""};
      });
      setTeams(list);
    }catch(e){showToast("Failed to load teams","#EF4444");}
    setLoading(false);setLoadMsg("");
  };

  // ── Load roster (full franchise enrichment) ───────────────────────────────
  const loadRoster=async(team,s)=>{
    setLoading(true);setLoadMsg("Loading roster & contracts...");
    const espnPath=GM_SPORTS.find(x=>x.id===s).espnPath;
    try{
      const r=await fetch(`https://site.api.espn.com/apis/site/v2/sports/${espnPath}/teams/${team.id}/roster`);
      const d=await r.json();
      const athletes=(d.athletes||[]).flatMap(g=>g.items||g);
      setLoadMsg("Generating realistic contracts & ratings...");
      const playerNames=athletes.slice(0,35).map(a=>a.displayName||a.fullName||"?").join(", ");
      const contractData=await aiCall(
        `Generate realistic ${year} ${s.toUpperCase()} contracts and ratings for these real players: ${playerNames}. Team: ${team.name}. Return JSON array same order: [{salary(M float),years(1-6),ovr(50-99),age,pos,potential(ovr+0to20),contractType("rookie"|"arb"|"standard"|"veteran"|"min"),traits(array of 1-2 strings like "Power Hitter" or "Ace"),noTradeClause(bool),note}]. Be realistic to actual player skill and market value.`,
        "You are an expert sports GM analyst. Return only valid JSON array."
      );
      const contracts=Array.isArray(contractData)?contractData:[];
      const rosterData=athletes.slice(0,35).map((a,i)=>{
        const c=contracts[i]||{};
        const name=a.displayName||a.fullName||"Player";
        const age=c.age||a.age||26;
        const ovr=c.ovr||Math.floor(Math.random()*25)+65;
        return enrichPlayer({
          id:String(a.id||i),name,
          pos:a.position?.abbreviation||c.pos||"?",
          age,ovr,potential:c.potential||Math.min(99,ovr+Math.floor(Math.random()*12)),
          salary:c.salary||parseFloat((Math.random()*12+1).toFixed(2)),
          years:c.years||Math.floor(Math.random()*3)+1,
          contractType:c.contractType||"standard",
          traits:c.traits||[],
          noTradeClause:c.noTradeClause||false,
          note:c.note||"",
          status:"active",on40man:true,
          headshot:a.headshot?.href||`https://a.espncdn.com/i/headshots/${espnPath.split("/")[1]}/players/full/${a.id}.png`,
        },s);
      });
      setRoster(rosterData);
      // Init pick inventory
      setPickInventory(initPickInventory(year,team.name,s));
      // Init depth chart
      const slots=DEPTH_SLOTS[s]||[];
      const chart={};
      slots.forEach((slot,idx)=>{const p=rosterData[idx];chart[slot]=p?p.id:null;});
      setDepthChart(chart);
      setScheme(SCHEMES[s]?.[0]||"");
      // Owner goals based on roster strength
      const teamOvr=Math.round(rosterData.reduce((s,p)=>s+p.ovr,0)/Math.max(1,rosterData.length));
      setOwnerGoals(teamOvr>=82?["Win Championship","Reduce Luxury Tax"]:[teamOvr>=75?["Make Playoffs","Develop Prospects"]:["Rebuild","Cut Payroll","Draft Well"]]);
      setLoadMsg("Scouting free agent market...");
      await loadFAs(s,team,rosterData);
      if(s==="mlb"){setLoadMsg("Building farm system...");await loadFarm(team,s);}
    }catch(e){console.error(e);showToast("Error loading roster","#EF4444");}
    setLoading(false);setLoadMsg("");
  };

  const initPickInventory=(yr,teamName,s)=>{
    if(!ROSTER_RULES[s]?.pickTrade)return[];
    const picks=[];
    [0,1,2].forEach(off=>{
      const y=yr+off;
      [1,2].forEach(round=>{
        picks.push({id:`pick_${teamName.replace(/\s/g,"_")}_${y}_r${round}`,team:teamName,year:y,round,label:`${y} ${round===1?"1st":"2nd"} Rd`,owned:true,traded:false});
      });
    });
    return picks;
  };

  // ── FA Market ─────────────────────────────────────────────────────────────
  const loadFAs=async(s,team,existingRoster)=>{
    const result=await aiCall(
      `Generate 28 realistic ${year} ${s.toUpperCase()} free agents for the open market. Context: ${team.name} is bidding. Include marquee players, solid vets, and bargains. Each player is UNIQUE — no duplicates. Return JSON array: [{name,pos,age,salary(millions ask,float),years(1-5),ovr(55-98),potential(55-99),contractType("veteran"|"standard"|"min"),note,historicalComp,aiTeamInterest(2-3 competing teams),traits(1-2 strings)}]. Mix tiers: 2-3 elite ($20M+), 5-7 solid ($8-15M), 8-10 average ($3-7M), 8-10 bargain (<$3M).`,
      "You are an expert sports GM. Return only valid JSON array."
    );
    if(Array.isArray(result)){
      const fas=result.map((fa,i)=>enrichPlayer({...fa,id:`fa_${i}_${Date.now()}`,status:"fa"},s));
      setFreeAgents(fas);
      const auctions={};
      fas.forEach(fa=>{
        if(fa.aiTeamInterest?.length>0){
          auctions[fa.id]={bidders:fa.aiTeamInterest.map(t=>({team:t,offer:parseFloat((fa.salary*(0.88+Math.random()*0.35)).toFixed(2)),years:fa.years})),stage:"open"};
        }
      });
      setFaAuctions(auctions);
    }
  };

  // ── Farm System ───────────────────────────────────────────────────────────
  const loadFarm=async(team,s)=>{
    setLoadMsg("Loading minor league system...");
    let farm={AAA:[],AA:[],A:[],Rookie:[]};
    if(s==="mlb"){
      try{
        const affRes=await fetch(`https://statsapi.mlb.com/api/v1/teams/${team.id}/affiliates?season=${year}`);
        if(affRes.ok){
          const affData=await affRes.json();
          const levelMap={11:"AAA",12:"AA",13:"A",14:"A",16:"Rookie"};
          const affiliates=affData.affiliates||[];
          await Promise.allSettled(affiliates.slice(0,5).map(async aff=>{
            const lvl=levelMap[aff.sport?.id];
            if(!lvl)return;
            try{
              const rRes=await fetch(`https://statsapi.mlb.com/api/v1/teams/${aff.teamId||aff.id}/roster?season=${year}&rosterType=fullRoster`);
              if(!rRes.ok)return;
              const rData=await rRes.json();
              const players=(rData.roster||[]).slice(0,12).map(p=>enrichPlayer({
                id:String(p.person?.id||Math.random()),
                name:p.person?.fullName||"Prospect",
                pos:p.position?.abbreviation||"?",
                age:p.person?.currentAge||21,
                ovr:Math.floor(Math.random()*18)+50,
                potential:Math.floor(Math.random()*22)+60,
                years:3,salary:0.75,
                eta:lvl==="AAA"?1:lvl==="AA"?2:lvl==="A"?3:4,
                level:lvl,on40man:false,status:"active",
              },s));
              if(players.length>0)farm[lvl]=[...farm[lvl],...players];
            }catch(e){}
          }));
        }
      }catch(e){}
    }
    const hasReal=Object.values(farm).some(a=>a.length>0);
    if(!hasReal){
      setLoadMsg("Generating farm system with AI...");
      const result=await aiCall(
        `Generate a ${year} ${s.toUpperCase()} minor league farm system for ${team.name}. 
${s==="mlb"?"Levels: AAA (10 players), AA (10), A (10), Rookie (8)":"Levels: AAA (10 players), AA (10), A (8)"}
Return JSON: {AAA:[{name,pos,age,ovr(55-72),potential(62-95),eta(1),level:"AAA",traits(1 string)}],AA:[...],A:[...],Rookie:[...]}. 
Use realistic prospect names. AAA=ready to contribute, Rookie=raw talent.`
      );
      if(result?.AAA)farm=result;
    }
    // Enrich farm players
    Object.keys(farm).forEach(lvl=>{farm[lvl]=(farm[lvl]||[]).map(p=>enrichPlayer({...p,level:lvl,on40man:false,status:"active",years:3,salary:0.75},s));});
    setFarmSystem(farm);
  };

  // ── Draft Board ───────────────────────────────────────────────────────────
  const loadDraftBoard=async()=>{
    if(draftBoard.length>0)return;
    setLoading(true);setLoadMsg("Fetching draft prospects...");
    let prospects=[];
    if(sport==="mlb"){
      try{
        setLoadMsg("Fetching MLB draft prospects from MLB.com...");
        const r=await fetch(`https://statsapi.mlb.com/api/v1/draft/prospects?year=${year}&limit=100`);
        if(r.ok){
          const d=await r.json();
          const raw=d.prospects||[];
          if(raw.length>0){
            prospects=raw.slice(0,50).map((p,i)=>({
              name:p.person?.fullName||"Prospect",
              pos:p.primaryPosition?.abbreviation||"?",
              school:p.school?.name||p.homeCity||"",
              age:p.person?.currentAge||18,
              pick:i+1,round:i<10?1:i<25?2:3,
              ovr:Math.max(50,78-Math.floor(i*0.65)),
              potential:Math.max(65,93-Math.floor(i*0.6)),
              floor:Math.max(40,65-Math.floor(i*0.5)),
              grade:i<5?"A+":i<10?"A":i<15?"A-":i<22?"B+":i<30?"B":"B-",
              scoutingReport:`${p.person?.fullName} is a ${p.primaryPosition?.abbreviation} from ${p.school?.name||p.homeCity||"Unknown"}. Ranked #${i+1} overall.`,
              comparable:"TBD",tradeValue:Math.max(1,10-Math.floor(i/4)),
              signability:i<20?"Easy":i<35?"Medium":"Hard",
              eta:i<15?1:i<30?2:3,
            }));
          }
        }
      }catch(e){console.warn("MLB draft API failed:",e);}
    }
    if(prospects.length<5){
      setLoadMsg(`Loading ${year} ${sport?.toUpperCase()} draft class...`);
      const guides={
        mlb:`${year} MLB draft: Top college pitchers from power conferences, toolsy HS bats. Real-sounding names.`,
        nfl:`${year} NFL draft: players completing eligibility after ${year-1} season. Top QBs, pass rushers, WRs. Real school names.`,
        nba:`${year} NBA draft: International prospects + US college players. Mix of stars and depth.`,
        nhl:`${year} NHL draft: CHL juniors, European leagues. Mostly 18-year-olds.`,
      };
      const result=await aiCall(
        `Create the ${year} ${sport?.toUpperCase()} draft class with 50 prospects. ${guides[sport]||""}
Return JSON array ordered by rank: [{name,pos,school,age,ovr(48-78),potential(65-99),floor(35-70),round(1-3),pick(1-50),scoutingReport(2 sentences),grade("A+"to"C"),comparable,tradeValue(1-10),signability("Easy"|"Medium"|"Hard"),eta(1-4 years)}]`,
        `You are a pro ${sport?.toUpperCase()} draft scout. Realistic names and ratings. Return only valid JSON array.`
      );
      if(Array.isArray(result))prospects=result;
    }
    if(prospects.length>0){
      setDraftBoard(prospects);
      const pickTrade=ROSTER_RULES[sport]?.pickTrade;
      if(pickTrade){
        const offers=await aiCall(`Generate 3 AI teams wanting to trade up in the ${year} ${sport?.toUpperCase()} draft. User is GM of ${myTeam?.name}. Return JSON array: [{fromTeam,offeredPick,askingPick,plusPlayer,analysis}]`);
        if(Array.isArray(offers))setAiDraftOffers(offers);
      }
      showToast(`${prospects.length} draft prospects loaded ✅`);
    }else showToast("Draft board failed — try again","#F59E0B");
    setLoading(false);setLoadMsg("");
  };

  // ── Trade offers (incoming) ───────────────────────────────────────────────
  const loadTradeOffers=async()=>{
    if(tradeOffers.length>0)return;
    setLoading(true);setLoadMsg("Fielding league trade offers...");
    const topPlayers=roster.filter(p=>p.ovr>=75).slice(0,6).map(p=>`${p.name}(${p.pos},OVR:${p.ovr},age:${p.age},$${p.salary}M,${p.noTradeClause?"NTC":""}`).join(", ");
    const result=await aiCall(
      `Generate 5 realistic incoming trade offers for ${myTeam?.name} in ${year} ${sport?.toUpperCase()}. Their best players: ${topPlayers}. 
Consider team's rebuild vs contend status. Mix of stars wanted, depth trades, and package deals. 
Return JSON array: [{fromTeam,teamNeeds("rebuild"|"contend"),theyWant(player name),theyOffer(array of {name,pos,ovr,age,salary,years}),picks(strings like "2026 2nd Rd Pick"),cashIncluded(millions int),analysis,fairness("Fair"|"Overpay"|"Underpay"),wouldAccept(bool),counterOffer(string suggestion if not accepting)}]`
    );
    if(Array.isArray(result))setTradeOffers(result);
    setLoading(false);setLoadMsg("");
  };

  // ── Load other team roster for trade machine ──────────────────────────────
  const loadTradeTargets=async(teamName)=>{
    if(!teamName.trim())return;
    setLoadingTargets(true);setTradeTargets([]);
    const result=await aiCall(
      `Generate realistic ${year} ${sport?.toUpperCase()} roster for "${teamName}". 20-25 real players with accurate contracts. Return JSON array: [{id:"ext_N",name,pos,age,ovr(50-99),salary(millions float),years(1-6),noTradeClause(bool),traits(1-2 strings),note}]`,
      "Expert sports analyst. Real player names from that franchise. Return only valid JSON array."
    );
    if(Array.isArray(result)&&result.length>0){
      setTradeTargets(result.map((p,i)=>enrichPlayer({...p,id:`tt_${i}_${Date.now()}`},sport)));
    }else showToast("Couldn't load that team roster","#F59E0B");
    setLoadingTargets(false);
  };

  // ── Cap recalc ────────────────────────────────────────────────────────────
  const recalcCap=useCallback((r)=>{
    // Handled by calcCap function now — just for legacy
  },[]);

  // ── CUT / WAIVE / IL ──────────────────────────────────────────────────────
  const cutPlayer=(p)=>{
    if(p.noTradeClause&&!confirm(`${p.name} has a no-trade clause. Cut anyway?`))return;
    const next=roster.filter(x=>x.id!==p.id);
    setRoster(next);
    setCuts(prev=>[...prev,{...p,releasedYear:year}]);
    logMove(`✂️ Released ${p.name} (${p.pos}) — $${p.salary}M freed, ${p.years}yr remaining`);
    showToast(`Released ${p.name}`);
    save();
  };

  const waivePlayer=(p)=>{
    const next=roster.map(x=>x.id===p.id?{...x,waiverStatus:"on_waivers"}:x);
    setRoster(next);
    setWaived(prev=>[...prev,p]);
    logMove(`📋 Placed ${p.name} on waivers`);
    showToast(`${p.name} placed on waivers (72hr window)`);
    save();
  };

  const placeOnIL=(p,type)=>{
    const days=type==="60"?60:10;
    const next=roster.map(x=>x.id===p.id?{...x,il:type,status:"injured",ilDays:days}:x);
    setRoster(next);
    logMove(`🚑 ${p.name} → ${type}-day IL (${days} games)`);
    showToast(`${p.name} placed on ${type}-day IL`);
    save();
  };

  const activateFromIL=(p)=>{
    const next=roster.map(x=>x.id===p.id?{...x,il:null,status:"active",ilDays:0}:x);
    setRoster(next);
    logMove(`✅ ${p.name} activated from IL`);
    showToast(`${p.name} activated!`);
    save();
  };

  const callUpProspect=(p)=>{
    const capI=calcCap(roster,sport);
    if(capI.space<(p.salary||0.75)){showToast("Not enough cap space","#EF4444");return;}
    const promoted={...p,on40man:true,status:"active",level:null};
    setRoster(prev=>[...prev,promoted]);
    setFarmSystem(prev=>{
      const copy={...prev};
      Object.keys(copy).forEach(lvl=>{copy[lvl]=(copy[lvl]||[]).filter(x=>x.id!==p.id);});
      return copy;
    });
    logMove(`⬆️ Called up ${p.name} (${p.pos}) from ${p.level||"minors"}`);
    showToast(`${p.name} called up!`);
    save();
  };

  const sendToMinors=(p)=>{
    if(p.serviceTime>=3&&!confirm(`${p.name} must clear waivers to be sent down. Continue?`))return;
    const next=roster.filter(x=>x.id!==p.id);
    setRoster(next);
    setFarmSystem(prev=>({...prev,AAA:[...prev.AAA||[],{...p,level:"AAA",on40man:false}]}));
    logMove(`⬇️ Optioned ${p.name} to AAA`);
    showToast(`${p.name} sent to AAA`);
    save();
  };

  // ── Contract restructure & extension ──────────────────────────────────────
  const restructureContract=(player,type)=>{
    const savings=type==="front"?player.salary*0.15:type==="back"?player.salary*0.1:0;
    const newSalary=parseFloat((player.salary-savings/Math.max(1,player.years)).toFixed(2));
    const next=roster.map(p=>p.id===player.id?{...p,salary:newSalary,restructured:type}:p);
    setRoster(next);
    setExtensions(prev=>({...prev,[player.id]:{type,savings,year}}));
    logMove(`💰 Restructured ${player.name} (${type}-load) — $${savings.toFixed(1)}M cap savings`);
    showToast(`Restructured ${player.name}! $${savings.toFixed(1)}M saved`);
    save();
  };

  const extendPlayer=async(player,newYears,newSalary,hasOption)=>{
    const option=hasOption?{type:"club",year:newYears,salary:newSalary*0.9}:null;
    const next=roster.map(p=>p.id===player.id?{...p,years:p.years+newYears,salary:newSalary,extended:true,options:option}:p);
    setRoster(next);
    logMove(`📝 Extended ${player.name}: ${newYears}yr @$${newSalary}M${option?` + club option`:""}`);
    showToast(`Extended ${player.name}!`);
    save();
  };

  const issueQualifyingOffer=(player)=>{
    const qoAmt=parseFloat((player.salary*1.25).toFixed(2));
    setQaOfferPlayers(prev=>({...prev,[player.id]:{amount:qoAmt,accepted:false,deadline:year+1}}));
    logMove(`📋 Issued Qualifying Offer to ${player.name}: $${qoAmt}M/1yr`);
    showToast(`QO issued to ${player.name} ($${qoAmt}M)`);
  };

  // ── Trade execution ────────────────────────────────────────────────────────
  const acceptTradeOffer=async(offer)=>{
    const myPlayerToSend=roster.find(p=>p.name===offer.theyWant);
    if(!myPlayerToSend){showToast("Player no longer on roster","#EF4444");return;}
    if(myPlayerToSend.noTradeClause){showToast(`${myPlayerToSend.name} has a no-trade clause!`,"#EF4444");return;}
    const incomingPlayers=(offer.theyOffer||[]).map((p,i)=>enrichPlayer({...p,id:`trade_${i}_${Date.now()}`,status:"active"},sport));
    const next=[...roster.filter(p=>p.id!==myPlayerToSend.id),...incomingPlayers];
    setRoster(next);
    setTradeOffers(prev=>prev.filter(o=>o!==offer));
    logMove(`🔄 Trade: Sent ${offer.theyWant} to ${offer.fromTeam} | Got ${incomingPlayers.map(p=>p.name).join(", ")}${offer.cashIncluded?` + $${offer.cashIncluded}M cash`:""}`);
    showToast(`Trade completed! ✅`);
    save();
  };

  const evaluateMyTrade=async()=>{
    const{myPlayers,myPicks,theirPlayers,theirPicks,theirTeam,cashRetained}=myTradeOffer;
    setMyTradeOffer(p=>({...p,loading:true,result:null}));
    const mySide=`${myPlayers.map(p=>`${p.name}(OVR:${p.ovr},age:${p.age},$${p.salary}M,${p.noTradeClause?"NTC":""}`).join(",")}${myPicks.length?` + ${myPicks.map(p=>p.label).join(",")}`:""}${cashRetained?` + $${cashRetained}M cash retained`:""}`;
    const theirSide=`${theirPlayers.map(p=>`${p.name}(OVR:${p.ovr},age:${p.age},$${p.salary}M)`).join(",")||"nothing"}${theirPicks?.length?` + ${theirPicks.map(p=>p.label||p).join(",")}`:""}`;
    const result=await aiCall(
      `Evaluate this ${sport?.toUpperCase()} trade:\n${myTeam?.name} sends: ${mySide||"nothing"}\n${theirTeam||"Other team"} sends: ${theirSide}\nContext: ${year} ${sport?.toUpperCase()} market.\nReturn JSON: {accepted(bool),winner("${myTeam?.name||"you"}"|"${theirTeam||"them"}"|"Even"),myGrade,theirGrade,analysis,verdict,capImpact,whyAcceptOrReject,counterSuggestion}`
    );
    setMyTradeOffer(p=>({...p,loading:false,result}));
  };

  const executeMyTrade=()=>{
    const{myPlayers,myPicks,theirPlayers,theirPicks,result,theirTeam}=myTradeOffer;
    if(!result?.accepted){showToast("Trade rejected!","#EF4444");return;}
    const added=(theirPlayers||[]).map((p,i)=>enrichPlayer({...p,id:`mytrade_${i}_${Date.now()}`,status:"active"},sport));
    const next=[...roster.filter(p=>!myPlayers.find(mp=>mp.id===p.id)),...added];
    setRoster(next);
    // Handle pick inventory
    if(myPicks?.length){setPickInventory(prev=>prev.filter(pk=>!myPicks.find(mp=>mp.id===pk.id)));}
    if(theirPicks?.length){setPickInventory(prev=>[...prev,...theirPicks.map(pk=>({...pk,team:myTeam?.name,owned:true}))]);}
    logMove(`🔄 Trade w/ ${theirTeam}: Sent ${myPlayers.map(p=>p.name).join(",")} for ${added.map(p=>p.name).join(",")}`);
    showToast("Trade executed! ✅");
    setMyTradeOffer({myPlayers:[],myPicks:[],theirPlayers:[],theirPicks:[],theirTeam:"",result:null,loading:false,cashRetained:0});
    save();
  };

  // ── FA Bid ────────────────────────────────────────────────────────────────
  const bidOnFA=async(fa,bid,yrs)=>{
    const auction=faAuctions[fa.id];
    const highestAi=auction?.bidders?.length?Math.max(...auction.bidders.map(b=>b.offer)):0;
    if(bid<fa.salary*0.85){showToast("Bid too low","#EF4444");return;}
    const capI=calcCap(roster,sport);
    if(bid>capI.space){showToast(`Over the cap! Only $${capI.space.toFixed(1)}M available`,"#EF4444");return;}
    const won=bid>highestAi*1.04||bid>fa.salary*1.15;
    if(won){
      const signed=enrichPlayer({...fa,salary:bid,years:yrs,status:"active",id:`signed_${fa.id}`,signedYear:year},sport);
      setRoster(prev=>[...prev,signed]);
      setFreeAgents(prev=>prev.filter(f=>f.id!==fa.id));
      setFaAuctions(p=>{const n={...p};delete n[fa.id];return n;});
      logMove(`🖊 Signed ${fa.name} (${fa.pos}): ${yrs}yr @$${bid.toFixed(1)}M`);
      showToast(`Signed ${fa.name}! ✅`);
    }else{
      const winner=auction?.bidders?.sort((a,b)=>b.offer-a.offer)[0]?.team||"Another team";
      showToast(`Lost ${fa.name} to ${winner} ($${highestAi.toFixed(1)}M)`,"#EF4444");
      setFreeAgents(prev=>prev.filter(f=>f.id!==fa.id));
    }
    save();
  };

  // ── Draft pick ────────────────────────────────────────────────────────────
  const draftPick=async(prospect)=>{
    const slotSalary={mlb:0.75,nfl:1.0,nba:2.5,nhl:0.9}[sport]||1.0;
    const drafted=enrichPlayer({...prospect,id:`d_${Date.now()}`,salary:slotSalary,years:4,status:"active",drafted:true,draftedYear:year,level:sport==="mlb"?"A":null,on40man:sport==="mlb"},sport);
    // MLB drafted players go to farm
    if(sport==="mlb"){
      setFarmSystem(prev=>({...prev,A:[...(prev.A||[]),{...drafted,level:"A"}]}));
    }else{
      setRoster(prev=>[...prev,drafted]);
    }
    setMyDraftPicks(prev=>[...prev,drafted]);
    setUndoStack(prev=>[...prev,{type:"draft",player:prospect,board:[...draftBoard]}]);
    setDraftBoard(prev=>prev.filter(p=>p.name!==prospect.name));
    logMove(`🎓 Drafted ${prospect.name} (${prospect.pos}) — Rd ${prospect.round}, Pick #${prospect.pick||"?"}${sport==="mlb"?" → A-ball":""}`);
    showToast(`Drafted ${prospect.name}! ✅`);
    save();
  };

  const undoLastPick=()=>{
    const last=undoStack[undoStack.length-1];
    if(!last||last.type!=="draft")return;
    setDraftBoard(last.board);
    setMyDraftPicks(prev=>prev.filter(p=>p.name!==last.player.name));
    if(sport==="mlb")setFarmSystem(prev=>{const copy={...prev};copy.A=(copy.A||[]).filter(p=>p.name!==last.player.name);return copy;});
    else setRoster(prev=>prev.filter(p=>p.name!==last.player.name));
    setUndoStack(prev=>prev.slice(0,-1));
    showToast(`Undid pick: ${last.player.name}`);
  };

  // ── Trade pick ────────────────────────────────────────────────────────────
  const tradePick=(pick,toTeam)=>{
    setPickInventory(prev=>prev.map(p=>p.id===pick.id?{...p,owned:false,traded:true,tradedTo:toTeam}:p));
    logMove(`📤 Traded ${pick.label} to ${toTeam}`);
    showToast(`${pick.label} traded to ${toTeam}`);
  };

  // ── Grade offseason ────────────────────────────────────────────────────────
  const gradeOffseason=async()=>{
    setLoading(true);setLoadMsg("Grading your offseason...");
    const activeRoster=roster.filter(p=>p.status==="active");
    const teamOvr=Math.round(activeRoster.reduce((s,p)=>s+p.ovr,0)/Math.max(1,activeRoster.length));
    const capI=calcCap(roster,sport);
    const result=await aiCall(
      `Grade the ${myTeam?.name} offseason in ${year} ${sport?.toUpperCase()}:
Moves made: ${allMoves.slice(0,20).map(m=>m.msg).join("; ")}
Team OVR: ${teamOvr} | Cap: $${capI.used.toFixed(1)}M/$${capI.total}M${capI.luxury?" (LUXURY TAX!)":""}
Draft picks acquired: ${myDraftPicks.map(p=>`${p.name}(${p.pos})`).join(",")||"none"}
Farm system size: ${Object.values(farmSystem).flat().length} prospects
Owner goals: ${ownerGoals.join(", ")}
Return JSON: {grade("A+"to"F"),headline,analysis(3 sentences),strengths(array),weaknesses(array),outlook,goalsMet(array),goalsNotMet(array),franchiseTrajectory("Contender"|"Bubble"|"Rebuilding"|"Dynasty Building")}`
    );
    setOffseasonGrade(result);
    setLoading(false);setLoadMsg("");
    save({offseasonGrade:result});
  };

  // ── Simulate season (deep) ────────────────────────────────────────────────
  const simulateSeason=async()=>{
    setLoading(true);setLoadMsg("Simulating season...");setSimProgress(5);
    const active=roster.filter(p=>p.status==="active"&&!p.il);
    const teamOvr=Math.round(active.reduce((s,p)=>s+p.ovr,0)/Math.max(1,active.length));
    const injuries=generateInjuries(roster,sport,GAMES[sport]||82);
    setSimProgress(20);
    setLoadMsg("Running game simulations...");
    const result=await aiCall(
      `Simulate the FULL ${year} ${sport?.toUpperCase()} season for the ${myTeam?.name}.
Team OVR: ${teamOvr}. Scheme: ${scheme}. Cap: $${calcCap(roster,sport).used.toFixed(1)}M.
Active roster (top 12): ${active.slice(0,12).map(p=>`${p.name}(${p.pos},OVR:${p.ovr},age:${p.age})`).join(", ")}.
Farm system (top AAA): ${(farmSystem.AAA||[]).slice(0,3).map(p=>p.name).join(", ")||"none"}.
Total games: ${GAMES[sport]||82}. Injuries already occurred: ${injuries.slice(0,4).map(i=>`${i.name}(${i.type},${i.games_missed}g)`).join(", ")||"none"}.

Return JSON: {
  wins,losses,ties(0 if N/A),record,playoffSeed(null if missed),madePlayoffs(bool),
  playoffRounds([{opponent,result("Won 4-2"|"Lost 3-4" etc),games}]),
  championshipResult,
  teamOVR,
  mvp:{name,stats,award:"MVP"},
  allStarSelections:[{name,pos}],
  awardWinners:[{name,award,stats}],
  topPerformers:[{name,pos,keyStats,grade}],
  playerStats:[{name,pos,${sport==="mlb"?"G,AB,R,H,HR,RBI,AVG,OPS,ERA,W,L,SV,K,WHIP":"G,PTS,AST,REB,MIN,FG%,TD,YDS,REC,G,A,SOG,SV%"}}],
  injuries:[{name,type,games_missed,severity,gameNumber}],
  summary,
  nextYearOutlook
}`,
      "You are an expert sports simulation engine. Generate realistic season results. Return only valid JSON."
    ,3000);
    setSimProgress(85);
    if(result?.wins!==undefined){
      // Merge AI injuries with our generated ones
      const allInjuries=[...injuries,...(result.injuries||[]).filter(i=>!injuries.find(j=>j.name===i.name))];
      const finalResult={...result,injuries:allInjuries};
      setSimResult(finalResult);
      setAwardWinners(result.awardWinners||[]);
      setAllStarRoster(result.allStarSelections||[]);
      // Apply injuries to roster
      const injuredNames=new Set(allInjuries.map(i=>i.name));
      setRoster(prev=>prev.map(p=>injuredNames.has(p.name)?{...p,il:allInjuries.find(i=>i.name===p.name)?.il||"10",status:"injured"}:p));
      // Append to history
      setSimHistory(prev=>[...prev,{year,record:finalResult.record,result:finalResult.championshipResult,madePlayoffs:finalResult.madePlayoffs}]);
      setPhase("results");
      logMove(`🏆 ${year} Season: ${finalResult.record} — ${finalResult.championshipResult}`);
      save({simResult:finalResult});
      showToast(`Season complete! ${finalResult.record} 🏆`);
    }else{
      showToast("Simulation error — check console","#EF4444");
    }
    setLoading(false);setSimProgress(0);setLoadMsg("");
  };

  // ── Advance to next season ─────────────────────────────────────────────────
  const nextSeason=()=>{
    // Progress all players
    const progressed=roster.map(p=>progressPlayer(p,simResult,year)).filter(p=>p.years>0||p.ovr>65);
    // Progress farm too
    const newFarm={};
    Object.keys(farmSystem).forEach(lvl=>{
      newFarm[lvl]=(farmSystem[lvl]||[]).map(p=>({...p,age:p.age+1,ovr:Math.min(p.potential||90,p.ovr+Math.floor(Math.random()*4)),eta:Math.max(0,(p.eta||2)-1)}));
    });
    // Promote any farm player with eta=0 and ovr>68 to 40-man
    const promotable=newFarm.AAA?.filter(p=>p.eta<=0&&p.ovr>=68)||[];
    if(promotable.length)showToast(`${promotable.length} prospects ready for promotion!`,"#F59E0B");
    // Cap raise
    const capBump=Math.floor(CAP_TABLE[sport]?.cap*0.03)||5;
    Object.keys(CAP_TABLE).forEach(s=>{CAP_TABLE[s].cap+=capBump;CAP_TABLE[s].luxury+=capBump;});
    // QO deadline — players who rejected QO become FAs
    const qaRejected=Object.entries(qaOfferPlayers).filter(([,v])=>!v.accepted).map(([id])=>id);
    const finalRoster=progressed.filter(p=>!qaRejected.includes(p.id));
    setRoster(finalRoster);
    setFarmSystem(newFarm);
    setYear(y=>y+1);
    setSeason(s=>s+1);
    setSimResult(null);setOffseasonGrade(null);setAllMoves([]);
    setMyDraftPicks([]);setDraftBoard([]);setCuts([]);setTradeOffers([]);
    setFreeAgents([]);setFaAuctions({});setQaOfferPlayers({});
    setAwardWinners(null);setAllStarRoster(null);setUndoStack([]);
    setPhase("steps");setStep("trim");
    showToast(`Welcome to ${year+1} offseason! Cap raised $${capBump}M 🎉`);
    save();
    // Reload FA market for new year
    if(myTeam&&sport)loadFAs(sport,myTeam,finalRoster);
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  STEP RENDERERS
  // ─────────────────────────────────────────────────────────────────────────
  const renderStep=()=>{
    switch(step){
      case"trim": return<TrimStepV3 roster={roster} sport={sport} ac={ac} rules={rules} onCut={cutPlayer} onWaive={waivePlayer} onIL={placeOnIL} onActivate={activateFromIL} onSendDown={sendToMinors} getCutSuggestions={async()=>{setLoading(true);setLoadMsg("Analyzing...");const r=await aiCall(`Analyze and suggest 3-5 cuts for ${myTeam?.name}. Roster: ${roster.map(p=>`${p.name}(${p.pos},OVR:${p.ovr},age:${p.age},$${p.salary}M,${p.years}yr)`).join(", ")}. Return JSON: [{name,reason,savings}]`);setLoading(false);setLoadMsg("");return Array.isArray(r)?r:[];}} mob={mob}/>;
      case"cap": return<CapStepV3 roster={roster} sport={sport} ac={ac} capInfo={calcCap(roster,sport)} onRestructure={restructureContract} onExtend={extendPlayer} onQO={issueQualifyingOffer} qaOffers={qaOfferPlayers} extensions={extensions} year={year} mob={mob}/>;
      case"trades": return<TradesStepV3 roster={roster} sport={sport} ac={ac} myTeam={myTeam} tradeOffers={tradeOffers} myOffer={myTradeOffer} setMyOffer={setMyTradeOffer} onLoadOffers={loadTradeOffers} onAccept={acceptTradeOffer} onEvaluate={evaluateMyTrade} onExecute={executeMyTrade} onLoadTargets={loadTradeTargets} tradeTargets={tradeTargets} loadingTargets={loadingTargets} onTradeBlock={(p)=>setTradeBlock(prev=>prev.find(x=>x.id===p.id)?prev.filter(x=>x.id!==p.id):[...prev,p])} tradeBlock={tradeBlock} pickInventory={pickInventory} mob={mob}/>;
      case"fa": return<FAStepV3 freeAgents={freeAgents} sport={sport} ac={ac} capInfo={calcCap(roster,sport)} auctions={faAuctions} myTeam={myTeam} onBid={bidOnFA} mob={mob}/>;
      case"draft": return<DraftStepV3 draftBoard={draftBoard} picks={myDraftPicks} sport={sport} ac={ac} year={year} aiOffers={aiDraftOffers} pickInventory={pickInventory} onLoadBoard={()=>{if(!draftBoard.length)loadDraftBoard();}} onDraft={draftPick} onUndo={undoLastPick} onTradePick={tradePick} canPickTrade={rules.pickTrade} mob={mob}/>;
      case"command": return<CommandStepV3 roster={roster} setRoster={setRoster} farmSystem={farmSystem} depthChart={depthChart} setDepthChart={setDepthChart} scheme={scheme} setScheme={setScheme} sport={sport} ac={ac} myTeam={myTeam} allMoves={allMoves} capInfo={calcCap(roster,sport)} rules={rules} rosterTab={rosterTab} setRosterTab={setRosterTab} onCallUp={callUpProspect} onSendDown={sendToMinors} onIL={placeOnIL} onActivate={activateFromIL} budget={budget} setBudget={setBudget} ownerGoals={ownerGoals} mob={mob}/>;
      case"review": return<ReviewStepV3 roster={roster} allMoves={allMoves} myDraftPicks={myDraftPicks} grade={offseasonGrade} sport={sport} ac={ac} year={year} season={season} simHistory={simHistory} farmSystem={farmSystem} capInfo={calcCap(roster,sport)} ownerGoals={ownerGoals} onGrade={gradeOffseason} onSimulate={simulateSeason} simProgress={simProgress} mob={mob}/>;
      default: return null;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  SETUP SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if(phase==="setup")return(
    <div style={{maxWidth:960,margin:"0 auto",padding:mob?"10px 10px 100px":"20px 20px 80px"}}>
      {toast&&<div style={{position:"fixed",top:76,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",padding:"10px 20px",borderRadius:20,fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,zIndex:9999,boxShadow:"0 8px 24px rgba(0,0,0,.5)"}}>{toast.msg}</div>}
      {loading&&<div style={{position:"fixed",inset:0,background:"rgba(3,7,18,.9)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}><div className="spin" style={{fontSize:36}}>⚙️</div><div style={{fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0",fontSize:13}}>{loadMsg}</div></div>}
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:52,marginBottom:8}}>🏆</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:30,fontWeight:900,color:"#E2E8F0",letterSpacing:".04em",marginBottom:6}}>GM FRANCHISE MODE</div>
        <div style={{fontSize:13,color:"#475569",maxWidth:420,margin:"0 auto"}}>Full franchise mode — trades, contracts, draft, farm system, injuries, multi-year dynasty building.</div>
      </div>
      {savedState&&(
        <div onClick={loadSave} style={{background:"rgba(0,212,255,.07)",border:"1px solid rgba(0,212,255,.22)",borderRadius:14,padding:"14px 18px",marginBottom:20,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#00D4FF",fontWeight:700,marginBottom:2}}>▶ RESUME FRANCHISE{savedState._migrated?" (Migrated from v2)":""}</div><div style={{fontSize:12,color:"#94A3B8"}}>{savedState.sport?.toUpperCase()} · {savedState.myTeam?.name} · {savedState.year||2025} · Season {savedState.season||1}</div></div>
          <span style={{fontSize:22}}>▶</span>
        </div>
      )}
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".12em",marginBottom:10}}>SELECT SPORT</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:22}}>
        {GM_SPORTS.map(s=>(
          <button key={s.id} onClick={()=>{setSport(s.id);loadTeams(s.id);}}
            style={{padding:"16px 8px",borderRadius:14,cursor:"pointer",border:`2px solid ${sport===s.id?s.color+"88":"rgba(255,255,255,.07)"}`,background:sport===s.id?s.color+"18":"rgba(255,255,255,.03)",transition:"all .2s"}}>
            <div style={{fontSize:28,marginBottom:4}}>{s.icon}</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:900,color:sport===s.id?s.color:"#94A3B8"}}>{s.label}</div>
          </button>
        ))}
      </div>
      {sport&&teams.length>0&&(
        <>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".12em",marginBottom:10}}>SELECT YOUR TEAM</div>
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(4,1fr)":"repeat(auto-fill,minmax(110px,1fr))",gap:8,marginBottom:18}}>
            {teams.map(t=>(
              <button key={t.id} onClick={()=>setMyTeam(t)}
                style={{padding:"10px 6px",borderRadius:12,cursor:"pointer",border:`2px solid ${myTeam?.id===t.id?ac+"88":"rgba(255,255,255,.06)"}`,background:myTeam?.id===t.id?ac+"18":"rgba(255,255,255,.03)",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all .2s"}}>
                {t.logo?<img src={t.logo} style={{width:mob?28:36,height:mob?28:36,objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>:<div style={{fontSize:20}}>{sc?.icon}</div>}
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?7:9,fontWeight:700,color:myTeam?.id===t.id?ac:"#64748B",textAlign:"center"}}>{t.abbr}</div>
              </button>
            ))}
          </div>
          {myTeam&&<button onClick={()=>{loadRoster(myTeam,sport);setPhase("steps");}} style={{width:"100%",padding:"16px",borderRadius:14,background:`linear-gradient(135deg,${ac},${ac}99)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:"#fff",letterSpacing:".08em"}}>START FRANCHISE: {myTeam.name.toUpperCase()} →</button>}
        </>
      )}
    </div>
  );

  // ─── RESULTS SCREEN ────────────────────────────────────────────────────────
  if(phase==="results"&&simResult)return(
    <div style={{maxWidth:960,margin:"0 auto",padding:mob?"10px 10px 100px":"20px 20px 80px"}}>
      {toast&&<div style={{position:"fixed",top:76,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",padding:"10px 20px",borderRadius:20,fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,zIndex:9999}}>{toast.msg}</div>}
      {/* Season banner */}
      <div style={{textAlign:"center",padding:"24px 20px",borderRadius:18,background:`linear-gradient(135deg,${ac}22,rgba(255,255,255,.03))`,border:`1px solid ${ac}44`,marginBottom:18}}>
        <div style={{fontSize:48,marginBottom:8}}>{simResult.madePlayoffs?"🏆":"📊"}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?24:36,fontWeight:900,color:ac,marginBottom:4}}>{simResult.record}</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?11:14,color:"#E2E8F0",marginBottom:6}}>{simResult.championshipResult}</div>
        {simResult.playoffRounds?.map((rnd,i)=><div key={i} style={{fontSize:11,color:"#64748B"}}>{rnd.result}</div>)}
        <div style={{fontSize:12,color:"#64748B",marginTop:6}}>{simResult.summary}</div>
      </div>
      {/* Awards */}
      {simResult.awardWinners?.length>0&&(
        <div style={{marginBottom:14,padding:"12px 16px",borderRadius:14,background:"rgba(168,85,247,.07)",border:"1px solid rgba(168,85,247,.2)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#A855F7",marginBottom:8}}>🏅 AWARDS</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {simResult.awardWinners.map((a,i)=><div key={i} style={{padding:"4px 10px",borderRadius:10,background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.3)",fontSize:10,color:"#E2E8F0"}}><span style={{color:"#A855F7",fontWeight:700}}>{a.award}</span>: {a.name} <span style={{fontSize:9,color:"#64748B"}}>{a.stats}</span></div>)}
          </div>
        </div>
      )}
      {/* All-Stars */}
      {simResult.allStarSelections?.length>0&&(
        <div style={{marginBottom:14,padding:"10px 14px",borderRadius:12,background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.2)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#22C55E",marginBottom:6}}>⭐ YOUR ALL-STARS</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{simResult.allStarSelections.map((p,i)=><span key={i} style={{fontSize:10,color:"#E2E8F0",padding:"2px 8px",borderRadius:8,background:"rgba(34,197,94,.12)"}}>{p.name} ({p.pos})</span>)}</div>
        </div>
      )}
      {/* Top performers */}
      {simResult.topPerformers?.length>0&&(
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".1em",marginBottom:8}}>TOP PERFORMERS</div>
          {simResult.topPerformers.map((p,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:5,alignItems:"center"}}>
              <GradeChip grade={p.grade}/><div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name} <span style={{color:ac,fontSize:9}}>{p.pos}</span></div><div style={{fontSize:10,color:"#64748B"}}>{p.keyStats}</div></div>
            </div>
          ))}
        </div>
      )}
      {/* Player stats table */}
      {simResult.playerStats?.length>0&&(
        <div style={{marginBottom:14,overflowX:"auto",borderRadius:12,border:"1px solid rgba(255,255,255,.07)"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:"rgba(255,255,255,.05)"}}>
              <td style={{padding:"8px 12px",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",minWidth:130}}>PLAYER</td>
              {Object.keys(simResult.playerStats[0]||{}).filter(k=>k!=="name"&&k!=="pos").slice(0,8).map(k=><td key={k} style={{padding:"8px",textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569"}}>{k}</td>)}
            </tr></thead>
            <tbody>{simResult.playerStats.map((p,i)=>(
              <tr key={i} style={{background:i%2===0?"rgba(255,255,255,.02)":"transparent",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <td style={{padding:"7px 12px"}}><div style={{fontWeight:700,color:"#E2E8F0",fontSize:11}}>{p.name}</div><div style={{fontSize:9,color:"#475569"}}>{p.pos}</div></td>
                {Object.entries(p).filter(([k])=>k!=="name"&&k!=="pos").slice(0,8).map(([k,v],j)=><td key={j} style={{padding:"7px 8px",textAlign:"center",color:"#94A3B8"}}>{v}</td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {/* Injuries */}
      {simResult.injuries?.length>0&&(
        <div style={{marginBottom:14,padding:"12px 14px",borderRadius:12,background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.15)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#EF4444",marginBottom:8}}>🚑 INJURIES</div>
          {simResult.injuries.map((inj,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}><span style={{color:"#94A3B8"}}>{inj.name} — {inj.type}</span><span style={{color:inj.severity==="Season-ending"?"#EF4444":"#F59E0B"}}>{inj.games_missed}G · {inj.severity}</span></div>)}
        </div>
      )}
      {/* History */}
      {simHistory.length>1&&(
        <div style={{marginBottom:14,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",marginBottom:8}}>📚 FRANCHISE HISTORY</div>
          {simHistory.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0"}}><span style={{color:"#64748B"}}>{s.year}</span><span style={{color:"#94A3B8",fontWeight:700}}>{s.record}</span><span style={{color:s.madePlayoffs?"#22C55E":"#475569",fontSize:10}}>{s.result}</span></div>)}
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <button onClick={()=>{setPhase("steps");setStep("review");}} style={{padding:"12px",borderRadius:12,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#94A3B8"}}>← Review</button>
        <button onClick={nextSeason} style={{padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${ac},${ac}99)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,color:"#fff"}}>▶ YEAR {year+1} OFFSEASON →</button>
      </div>
    </div>
  );

  // ─── MAIN STEPS SHELL ──────────────────────────────────────────────────────
  const curStep=GM_STEPS.find(s=>s.id===step);
  const curIdx=GM_STEPS.findIndex(s=>s.id===step);
  const capI=calcCap(roster,sport);
  return(
    <div style={{maxWidth:1020,margin:"0 auto",padding:mob?"8px 8px 100px":"16px 20px 80px"}}>
      {toast&&<div style={{position:"fixed",top:76,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#fff",padding:"10px 20px",borderRadius:20,fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,zIndex:9999,boxShadow:"0 6px 24px rgba(0,0,0,.5)"}}>{toast.msg}</div>}
      {loading&&<div style={{position:"fixed",inset:0,background:"rgba(3,7,18,.9)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}><div className="spin" style={{fontSize:32}}>⚙️</div><div style={{fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0",fontSize:13,maxWidth:300,textAlign:"center"}}>{loadMsg}</div>{simProgress>0&&<div style={{width:260,height:5,background:"rgba(255,255,255,.1)",borderRadius:3}}><div style={{height:"100%",borderRadius:3,background:ac,width:`${simProgress}%`,transition:"width .6s"}}/></div>}</div>}
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
        {myTeam?.logo&&<img src={myTeam.logo} style={{width:36,height:36,objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?12:15,fontWeight:900,color:"#E2E8F0"}}>{myTeam?.name?.toUpperCase()} <span style={{fontSize:9,color:ac}}>S{season} · {year}</span></div>
          <div style={{fontSize:10,color:"#475569"}}>{sport?.toUpperCase()} Franchise</div>
        </div>
        <div style={{display:"flex",gap:5,flexShrink:0}}>
          <button onClick={()=>setCmdOpen(o=>!o)} style={{padding:"5px 10px",borderRadius:9,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,cursor:"pointer"}}>⚙️ CMD</button>
          <button onClick={()=>{if(confirm("Return to setup?"))setPhase("setup");}} style={{padding:"5px 8px",borderRadius:9,background:"none",border:"1px solid rgba(255,255,255,.06)",color:"#334155",fontSize:9,cursor:"pointer"}}>✕</button>
        </div>
      </div>
      <div style={{marginBottom:12}}><CapBar used={capI.used} total={capI.total} ac={ac}/></div>
      {capI.luxury&&<div style={{fontSize:10,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",marginBottom:8}}>⚠️ LUXURY TAX: ${capI.luxuryAmt.toFixed(1)}M over threshold</div>}
      {/* CMD drawer */}
      {cmdOpen&&(
        <div style={{marginBottom:14,padding:"12px 14px",borderRadius:14,background:"rgba(0,0,0,.5)",border:"1px solid rgba(255,255,255,.1)",maxHeight:260,overflowY:"auto"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:ac,marginBottom:8}}>⚙️ MOVES LOG</div>
          {allMoves.length===0&&<div style={{fontSize:10,color:"#334155"}}>No moves yet</div>}
          {allMoves.slice(0,15).map((m,i)=><div key={i} style={{fontSize:10,color:"#64748B",padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>{m.msg}</div>)}
        </div>
      )}
      {/* Step pills */}
      <div style={{display:"flex",gap:4,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
        {GM_STEPS.map((s,i)=>{
          const done=i<curIdx,active=s.id===step;
          return<button key={s.id} onClick={()=>{if(s.id==="draft"&&!draftBoard.length)loadDraftBoard();setStep(s.id);}}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:mob?"5px 8px":"7px 12px",borderRadius:12,cursor:"pointer",flexShrink:0,transition:"all .2s",border:`1px solid ${active?ac+"66":done?ac+"33":"rgba(255,255,255,.07)"}`,background:active?ac+"18":done?ac+"08":"rgba(255,255,255,.02)"}}>
            <div style={{fontSize:mob?13:15}}>{s.icon}</div>
            {!mob&&<div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:700,color:active?ac:done?ac+"99":"#334155",whiteSpace:"nowrap"}}>Step {s.n}</div>}
            {!mob&&<div style={{fontSize:7,color:active?"#E2E8F0":"#334155",whiteSpace:"nowrap"}}>{s.label}</div>}
          </button>;
        })}
      </div>
      {/* Step title */}
      <div style={{marginBottom:14}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?14:18,fontWeight:900,color:"#E2E8F0"}}>{curStep?.icon} Step {curStep?.n}: {curStep?.label}</div>
        <div style={{fontSize:11,color:"#475569"}}>{curStep?.desc}</div>
      </div>
      {renderStep()}
      <div style={{display:"flex",gap:8,marginTop:22,justifyContent:"flex-end"}}>
        {curIdx>0&&<button onClick={()=>setStep(GM_STEPS[curIdx-1].id)} style={{padding:"10px 18px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#475569"}}>← Back</button>}
        {curIdx<GM_STEPS.length-1&&<button onClick={()=>{if(GM_STEPS[curIdx+1].id==="draft"&&!draftBoard.length)loadDraftBoard();setStep(GM_STEPS[curIdx+1].id);}} style={{padding:"10px 20px",borderRadius:12,background:ac+"22",border:`1px solid ${ac}44`,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:ac}}>Next: {GM_STEPS[curIdx+1].label} →</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP COMPONENTS (v3)
// ─────────────────────────────────────────────────────────────────────────────

export function TrimStepV3({roster,sport,ac,rules,onCut,onWaive,onIL,onActivate,onSendDown,getCutSuggestions,mob}){
  const[suggestions,setSuggestions]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[filter,setFilter]=useState("all"); // all|il|expiring|overpaid
  const loadSugg=async()=>{setLoaded(true);const s=await getCutSuggestions();setSuggestions(s);};
  const filtered=roster.filter(Boolean).filter(p=>{
    if(filter==="il")return p.il||p.status==="injured";
    if(filter==="expiring")return p.years<=1;
    if(filter==="overpaid"){const capT=CAP_TABLE[sport]||{cap:200};const mkt=((p.ovr||70)/99)*capT.cap*0.18;return p.salary>mkt*1.4;}
    return true;
  });
  const capT=CAP_TABLE[sport]||{cap:200};
  return(<div>
    <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{roster.length} PLAYERS</div>
      {[["all","All"],["il","🚑 IL/Injured"],["expiring","📋 Expiring"],["overpaid","💸 Overpaid"]].map(([v,l])=>(
        <button key={v} onClick={()=>setFilter(v)} style={{padding:"4px 10px",borderRadius:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${filter===v?ac+"55":"rgba(255,255,255,.08)"}`,background:filter===v?ac+"14":"rgba(255,255,255,.02)",color:filter===v?ac:"#475569"}}>{l}</button>
      ))}
      {!loaded&&<button onClick={loadSugg} style={{padding:"5px 12px",borderRadius:9,background:"rgba(168,85,247,.12)",border:"1px solid rgba(168,85,247,.3)",color:"#A855F7",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginLeft:"auto"}}>🤖 AI Suggestions</button>}
    </div>
    {suggestions.length>0&&(
      <div style={{marginBottom:12,padding:"10px 14px",borderRadius:12,background:"rgba(168,85,247,.07)",border:"1px solid rgba(168,85,247,.2)"}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#A855F7",marginBottom:6}}>AI RECOMMENDS CUTTING</div>
        {suggestions.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}><span style={{color:"#E2E8F0",fontWeight:600}}>{s.name}</span><span style={{color:"#64748B"}}>{s.reason} · saves ${s.savings}M</span></div>)}
      </div>
    )}
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {filtered.map((p,i)=>{
        const mktVal=((p.ovr||70)/99)*capT.cap*0.18;
        const overPaid=p.salary>mktVal*1.4;
        return(
          <div key={i} style={{display:"flex",gap:10,padding:"9px 12px",borderRadius:12,background:"rgba(255,255,255,.03)",border:`1px solid ${p.il?"rgba(239,68,68,.25)":p.years<=1?"rgba(245,158,11,.2)":"rgba(255,255,255,.06)"}`,alignItems:"center"}}>
            <div style={{width:32,height:32,borderRadius:"50%",overflow:"hidden",flexShrink:0,background:"rgba(255,255,255,.05)"}}>
              <img src={p.headshot||""} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:11,fontWeight:700,color:"#E2E8F0"}}>{p.name}</span>
                <span style={{fontSize:9,color:ac}}>{p.pos}</span>
                {p.il&&<span style={{fontSize:8,color:"#EF4444",fontFamily:"'Orbitron',sans-serif"}}>{p.il}-day IL</span>}
                {p.years<=1&&!p.il&&<span style={{fontSize:8,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif"}}>EXP</span>}
                {overPaid&&<span style={{fontSize:8,color:"#EF4444",fontFamily:"'Orbitron',sans-serif"}}>OVERPAID</span>}
                {p.noTradeClause&&<span style={{fontSize:8,color:"#A855F7",fontFamily:"'Orbitron',sans-serif"}}>NTC</span>}
                {(p.traits||[]).map((t,j)=><span key={j} style={{fontSize:8,color:"#334155",padding:"1px 5px",borderRadius:4,background:"rgba(255,255,255,.04)"}}>{t}</span>)}
              </div>
              <div style={{fontSize:9,color:"#475569"}}>Age {p.age} · ${p.salary}M · {p.years}yr · Svc: {p.serviceTime||0}yr</div>
            </div>
            <OVRBadge ovr={p.ovr}/>
            <div style={{display:"flex",gap:4,flexShrink:0}}>
              {p.il?<button onClick={()=>onActivate(p)} style={{padding:"4px 8px",borderRadius:7,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.2)",color:"#22C55E",fontSize:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>Activate</button>:
               rules.il10&&!p.il?<button onClick={()=>onIL(p,"10")} style={{padding:"4px 7px",borderRadius:7,background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",color:"#F59E0B",fontSize:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>IL</button>:null}
              {rules.waivers&&!p.il&&<button onClick={()=>onWaive(p)} style={{padding:"4px 7px",borderRadius:7,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#64748B",fontSize:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>Waive</button>}
              <button onClick={()=>onCut(p)} style={{padding:"4px 8px",borderRadius:7,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",color:"#EF4444",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>Cut</button>
            </div>
          </div>
        );
      })}
    </div>
  </div>);
}

export function CapStepV3({roster,sport,ac,capInfo,onRestructure,onExtend,extensions,onQO,qaOffers,year,mob}){
  const[extTarget,setExtTarget]=useState(null);
  const[extYears,setExtYears]=useState(2);
  const[extSalary,setExtSalary]=useState("");
  const[hasOption,setHasOption]=useState(false);
  const[tab,setTab]=useState("restructure");
  const restructurable=roster.filter(p=>!p.restructured&&p.years>1&&p.salary>2&&p.restructurable!==false);
  const extendable=roster.filter(p=>!p.extended&&p.years<=2&&p.ovr>=68);
  const expiring=roster.filter(p=>p.years<=1&&p.ovr>=72);
  return(<div>
    <div style={{display:"flex",gap:5,marginBottom:14}}>
      {[["restructure","💰 Restructure"],["extend","📝 Extend"],["qo","📋 QO / Options"],["luxury","💸 Tax Sheet"]].map(([t,l])=>(
        <button key={t} onClick={()=>setTab(t)} style={{padding:"6px 12px",borderRadius:11,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${tab===t?ac+"55":"rgba(255,255,255,.08)"}`,background:tab===t?ac+"14":"rgba(255,255,255,.02)",color:tab===t?ac:"#475569"}}>{l}</button>
      ))}
    </div>
    {tab==="restructure"&&(<div>
      <div style={{fontSize:10,color:"#334155",marginBottom:12}}>Restructuring converts base salary into signing bonus, spreading cap savings across years.</div>
      {restructurable.length===0&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:11}}>No restructure candidates</div>}
      {restructurable.map((p,i)=>(
        <div key={i} style={{padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:`1px solid ${extensions[p.id]?"rgba(34,197,94,.3)":"rgba(255,255,255,.07)"}`,marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name} <span style={{color:ac,fontSize:9}}>{p.pos}</span></div><div style={{fontSize:10,color:"#475569"}}>${p.salary}M · {p.years}yr · Age {p.age}</div></div>
            <OVRBadge ovr={p.ovr}/>
          </div>
          {extensions[p.id]?<div style={{fontSize:9,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}>✓ Restructured ({extensions[p.id].type}) — saved ${extensions[p.id].savings?.toFixed(1)}M</div>:(
            <div style={{display:"flex",gap:5}}>
              {["front","flat","back"].map(t=>(
                <button key={t} onClick={()=>onRestructure(p,t)} style={{flex:1,padding:"6px 4px",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${ac}44`,background:ac+"14",color:ac}}>
                  {t==="front"?"Front-load (save 15%)":t==="flat"?"Flat (save 0%)":"Back-load (save 10%)"}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>)}
    {tab==="extend"&&(<div>
      {extendable.length===0&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:11}}>No extension candidates</div>}
      {extendable.map((p,i)=>(
        <div key={i} style={{padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:`1px solid ${extTarget?.id===p.id?"rgba(168,85,247,.4)":"rgba(255,255,255,.07)"}`,marginBottom:8,cursor:"pointer"}} onClick={()=>setExtTarget(extTarget?.id===p.id?null:p)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name} <span style={{color:"#A855F7",fontSize:9}}>{p.pos}</span>{p.extended?<span style={{color:"#22C55E",fontSize:9}}> ✓ Extended</span>:""}</div><div style={{fontSize:10,color:"#475569"}}>${p.salary}M · {p.years}yr left · Pot: {p.potential}</div></div>
            <OVRBadge ovr={p.ovr}/>
          </div>
          {extTarget?.id===p.id&&!p.extended&&(
            <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><div style={{fontSize:9,color:"#475569",marginBottom:3}}>Add Years</div><input type="number" min="1" max="7" value={extYears} onChange={e=>setExtYears(parseInt(e.target.value)||2)}/></div>
                <div><div style={{fontSize:9,color:"#475569",marginBottom:3}}>New $/yr (M)</div><input type="number" step="0.5" value={extSalary} onChange={e=>setExtSalary(e.target.value)} placeholder={p.salary.toFixed(1)}/></div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <label style={{fontSize:10,color:"#94A3B8",display:"flex",gap:5,alignItems:"center",cursor:"pointer"}}><input type="checkbox" checked={hasOption} onChange={e=>setHasOption(e.target.checked)}/> Include Club Option (yr {p.years+extYears+1})</label>
              </div>
              <button onClick={()=>{onExtend(p,extYears,parseFloat(extSalary)||p.salary,hasOption);setExtTarget(null);}} style={{padding:"8px",borderRadius:9,background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.3)",color:"#A855F7",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700}}>📝 Offer Extension</button>
            </div>
          )}
        </div>
      ))}
    </div>)}
    {tab==="qo"&&(<div>
      <div style={{fontSize:10,color:"#334155",marginBottom:12}}>Issue a Qualifying Offer to expiring players (≥1yr service). If rejected, you receive draft pick compensation.</div>
      {expiring.length===0&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:11}}>No QO candidates</div>}
      {expiring.map((p,i)=>{
        const qoSent=qaOffers[p.id];
        return(
          <div key={i} style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:11,background:"rgba(255,255,255,.03)",border:`1px solid ${qoSent?"rgba(34,197,94,.25)":"rgba(255,255,255,.07)"}`,marginBottom:6,alignItems:"center"}}>
            <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name} <span style={{color:ac,fontSize:9}}>{p.pos}</span></div><div style={{fontSize:10,color:"#475569"}}>${p.salary}M · expiring · svc: {p.serviceTime||0}yr</div></div>
            <OVRBadge ovr={p.ovr}/>
            {qoSent?<div style={{fontSize:9,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}>QO Sent (${qoSent.amount}M)</div>:
             <button onClick={()=>onQO(p)} style={{padding:"5px 10px",borderRadius:8,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)",color:"#22C55E",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700}}>Issue QO</button>}
          </div>
        );
      })}
    </div>)}
    {tab==="luxury"&&(<div>
      <div style={{padding:"14px",borderRadius:14,background:capInfo.luxury?"rgba(239,68,68,.07)":"rgba(34,197,94,.06)",border:`1px solid ${capInfo.luxury?"rgba(239,68,68,.3)":"rgba(34,197,94,.2)"}`,marginBottom:14}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:capInfo.luxury?"#EF4444":"#22C55E",fontWeight:700,marginBottom:6}}>{capInfo.luxury?"⚠️ LUXURY TAX PAYER":"✅ UNDER LUXURY TAX"}</div>
        <div style={{fontSize:12,color:"#94A3B8"}}>Payroll: ${capInfo.used.toFixed(1)}M / Cap: ${capInfo.total}M</div>
        {capInfo.luxury&&<div style={{fontSize:11,color:"#EF4444",marginTop:4}}>Tax amount: ${capInfo.luxuryAmt.toFixed(1)}M over threshold</div>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {[...roster.filter(Boolean)].sort((a,b)=>b.salary-a.salary).map((p,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"7px 12px",borderRadius:9,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.04)",alignItems:"center"}}>
            <div style={{flex:1}}><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0"}}>{p.name}</span><span style={{fontSize:9,color:"#475569",marginLeft:5}}>{p.pos} · {p.years}yr</span></div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:p.salary>20?"#EF4444":p.salary>10?"#F59E0B":"#22C55E"}}>${p.salary.toFixed(1)}M</div>
          </div>
        ))}
      </div>
    </div>)}
  </div>);
}

export function TradesStepV3({roster,sport,ac,myTeam,tradeOffers,myOffer,setMyOffer,onLoadOffers,onAccept,onEvaluate,onExecute,onLoadTargets,tradeTargets,loadingTargets,onTradeBlock,tradeBlock,pickInventory,mob}){
  const[subTab,setSubTab]=useState("incoming");
  const myPicks=pickInventory.filter(pk=>pk.owned&&!pk.traded);
  const canPickTrade=ROSTER_RULES[sport]?.pickTrade||false;
  return(<div>
    <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
      {[["incoming","📩 Incoming"+(tradeOffers.length>0?` (${tradeOffers.length})`:"")] ,["create","🔨 Offer Trade"],["block","🚫 Trade Block"],["finder","🔍 Trade Finder"]].map(([t,l])=>(
        <button key={t} onClick={()=>{setSubTab(t);if(t==="incoming"&&!tradeOffers.length)onLoadOffers();}} style={{padding:"6px 12px",borderRadius:11,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${subTab===t?ac+"55":"rgba(255,255,255,.08)"}`,background:subTab===t?ac+"14":"rgba(255,255,255,.02)",color:subTab===t?ac:"#475569"}}>{l}</button>
      ))}
    </div>
    {subTab==="incoming"&&(<div>
      {!tradeOffers.length&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:11}}>Loading league offers...</div>}
      {tradeOffers.map((offer,i)=>(
        <div key={i} style={{padding:"14px",borderRadius:14,background:"rgba(255,255,255,.03)",border:`1px solid ${offer.wouldAccept?"rgba(34,197,94,.2)":"rgba(239,68,68,.15)"}`,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{offer.fromTeam}</div><div style={{fontSize:9,color:"#475569"}}>{offer.teamNeeds}</div></div>
            <div style={{textAlign:"right",fontSize:10,color:offer.wouldAccept?"#22C55E":"#EF4444",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{offer.wouldAccept?"Would Accept":"Would Counter"}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",marginBottom:8}}>
            <div><div style={{fontSize:8,color:"#EF4444",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>THEY WANT</div><div style={{fontSize:10,color:"#94A3B8"}}>{offer.theyWant}</div></div>
            <span style={{fontSize:16,color:"#475569"}}>⇄</span>
            <div><div style={{fontSize:8,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>YOU GET</div><div style={{fontSize:10,color:"#94A3B8"}}>{offer.theyOffer?.map(p=>p.name).join(", ")}{offer.picks?.length?` + ${offer.picks.join(", ")}`:""}{offer.cashIncluded?` + $${offer.cashIncluded}M`:""}</div></div>
          </div>
          <div style={{fontSize:10,color:"#64748B",marginBottom:6}}>{offer.analysis}</div>
          {!offer.wouldAccept&&offer.counterOffer&&<div style={{fontSize:9,color:"#F59E0B",marginBottom:6}}>💡 Counter suggestion: {offer.counterOffer}</div>}
          {offer.wouldAccept&&<button onClick={()=>onAccept(offer)} style={{padding:"7px 14px",borderRadius:10,background:"rgba(34,197,94,.12)",border:"1px solid rgba(34,197,94,.3)",color:"#22C55E",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700}}>✅ Accept Trade</button>}
        </div>
      ))}
    </div>)}
    {subTab==="create"&&(<div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12,marginBottom:12}}>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:ac,marginBottom:6}}>YOU SEND</div>
          <div style={{maxHeight:280,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
            {roster.filter(Boolean).map((p,i)=>{
              const sel=myOffer.myPlayers.find(x=>x.id===p.id);
              return<div key={i} onClick={()=>setMyOffer(prev=>({...prev,result:null,myPlayers:sel?prev.myPlayers.filter(x=>x.id!==p.id):[...prev.myPlayers,p]}))} style={{padding:"7px 10px",borderRadius:9,cursor:"pointer",border:`1px solid ${sel?ac+"55":"rgba(255,255,255,.05)"}`,background:sel?ac+"12":"transparent",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:sel?700:400,color:sel?ac:"#94A3B8"}}>{p.name}{p.noTradeClause?" 🚫":""}</span>
                <span style={{fontSize:9,color:"#475569"}}>{p.pos} {p.ovr}</span>
              </div>;
            })}
          </div>
          {canPickTrade&&myPicks.length>0&&(<div style={{marginTop:8}}>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>INCLUDE PICKS</div>
            {myPicks.map((pk,i)=>{
              const sel=myOffer.myPicks?.find(x=>x.id===pk.id);
              return<div key={i} onClick={()=>setMyOffer(prev=>({...prev,myPicks:sel?(prev.myPicks||[]).filter(x=>x.id!==pk.id):[...(prev.myPicks||[]),pk]}))} style={{padding:"5px 9px",borderRadius:8,cursor:"pointer",marginBottom:3,border:`1px solid ${sel?ac+"44":"rgba(255,255,255,.05)"}`,background:sel?ac+"10":"transparent",fontSize:10,color:sel?ac:"#64748B"}}>{pk.label}</div>;
            })}
          </div>)}
          {myOffer.myPlayers?.length>0&&<div style={{marginTop:6,fontSize:9,color:ac,fontFamily:"'Orbitron',sans-serif"}}>Sending: {myOffer.myPlayers.map(p=>p.name).join(", ")}</div>}
        </div>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#EF4444",marginBottom:6}}>YOU RECEIVE</div>
          <div style={{display:"flex",gap:5,marginBottom:8}}>
            <input placeholder="Team name e.g. New York Yankees…" value={myOffer.theirTeam||""} onChange={e=>setMyOffer(p=>({...p,theirTeam:e.target.value,result:null}))} style={{flex:1}}/>
            <button onClick={()=>onLoadTargets(myOffer.theirTeam)} disabled={loadingTargets||!myOffer.theirTeam?.trim()} style={{padding:"6px 10px",borderRadius:8,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.3)",color:"#EF4444",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700}}>{loadingTargets?"…":"Load"}</button>
          </div>
          {!tradeTargets.length&&!loadingTargets&&<div style={{textAlign:"center",padding:"20px 0",color:"#334155",fontSize:10}}>Load a team to select players</div>}
          <div style={{maxHeight:260,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
            {tradeTargets.map((p,i)=>{
              const sel=myOffer.theirPlayers.find(x=>x.id===p.id);
              return<div key={i} onClick={()=>setMyOffer(prev=>({...prev,result:null,theirPlayers:sel?prev.theirPlayers.filter(x=>x.id!==p.id):[...prev.theirPlayers,p]}))} style={{padding:"7px 10px",borderRadius:9,cursor:"pointer",border:`1px solid ${sel?"rgba(239,68,68,.4)":"rgba(255,255,255,.05)"}`,background:sel?"rgba(239,68,68,.09)":"transparent",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:sel?700:400,color:sel?"#EF4444":"#94A3B8"}}>{p.name}</span>
                <span style={{fontSize:9,color:"#475569"}}>{p.pos} {p.ovr} ${p.salary}M</span>
              </div>;
            })}
          </div>
          {myOffer.theirPlayers?.length>0&&<div style={{marginTop:6,fontSize:9,color:"#EF4444",fontFamily:"'Orbitron',sans-serif"}}>Receiving: {myOffer.theirPlayers.map(p=>p.name).join(", ")}</div>}
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
        <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>Cash retained:</div>
        <input type="number" step="1" min="0" max="15" value={myOffer.cashRetained||0} onChange={e=>setMyOffer(p=>({...p,cashRetained:parseInt(e.target.value)||0}))} style={{width:70,textAlign:"center"}}/>
        <div style={{fontSize:9,color:"#334155"}}>M</div>
      </div>
      <button onClick={onEvaluate} disabled={myOffer.loading} style={{width:"100%",padding:"12px",borderRadius:12,background:myOffer.loading?"rgba(255,255,255,.05)":`linear-gradient(135deg,${ac},${ac}99)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:900,color:"#fff",marginBottom:12}}>
        {myOffer.loading?"🤔 Evaluating...":"⚖️ Evaluate Trade"}
      </button>
      {myOffer.result&&(
        <div style={{padding:"14px",borderRadius:14,background:"rgba(255,255,255,.04)",border:`1px solid ${myOffer.result.accepted?"rgba(34,197,94,.3)":"rgba(239,68,68,.25)"}`}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,color:myOffer.result.accepted?"#22C55E":"#EF4444"}}>{myOffer.result.accepted?"✅ ACCEPTED":"❌ REJECTED"}</div>
            <GradeChip grade={myOffer.result.myGrade}/>
            <span style={{fontSize:10,color:"#64748B"}}>{myOffer.result.verdict}</span>
          </div>
          <div style={{fontSize:11,color:"#94A3B8",marginBottom:6}}>{myOffer.result.analysis}</div>
          {!myOffer.result.accepted&&myOffer.result.counterSuggestion&&<div style={{fontSize:10,color:"#F59E0B",marginBottom:8}}>💡 {myOffer.result.counterSuggestion}</div>}
          {myOffer.result.accepted&&<button onClick={onExecute} style={{padding:"8px 16px",borderRadius:10,background:"rgba(34,197,94,.12)",border:"1px solid rgba(34,197,94,.3)",color:"#22C55E",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700}}>✅ Execute Trade</button>}
        </div>
      )}
    </div>)}
    {subTab==="block"&&(<div>
      <div style={{fontSize:10,color:"#334155",marginBottom:10}}>Players on the block signal availability to other teams and boost trade offer quality.</div>
      {roster.filter(Boolean).map((p,i)=>{
        const onBlock=tradeBlock.find(x=>x.id===p.id);
        return<div key={i} onClick={()=>onTradeBlock(p)} style={{display:"flex",gap:10,padding:"9px 12px",borderRadius:11,marginBottom:5,cursor:"pointer",border:`1px solid ${onBlock?"rgba(245,158,11,.4)":"rgba(255,255,255,.06)"}`,background:onBlock?"rgba(245,158,11,.08)":"rgba(255,255,255,.02)",alignItems:"center"}}>
          <div style={{flex:1}}><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:onBlock?"#F59E0B":"#94A3B8"}}>{p.name}</span><span style={{fontSize:9,color:"#475569",marginLeft:6}}>{p.pos} · TV:{playerTradeValue(p,sport)}</span></div>
          <OVRBadge ovr={p.ovr}/>
          {onBlock&&<span style={{fontSize:8,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif"}}>ON BLOCK</span>}
        </div>;
      })}
    </div>)}
    {subTab==="finder"&&(<div>
      <div style={{fontSize:10,color:"#334155",marginBottom:14}}>Select a player you want to trade away. AI will suggest what teams would offer for them.</div>
      {roster.filter(Boolean).map((p,i)=>(
        <div key={i} onClick={async()=>{
          setMyOffer(prev=>({...prev,loading:true}));
          const r=await aiCall(`What would ${sport?.toUpperCase()} teams offer in trade for ${p.name} (${p.pos},OVR:${p.ovr},age:${p.age},$${p.salary}M,${p.years}yr)? Return JSON array of 3 offers: [{team,theyOffer(array of {name,pos,ovr,salary}),picks,analysis,grade}]`);
          setMyOffer(prev=>({...prev,loading:false,result:{accepted:true,analysis:Array.isArray(r)?r.map(o=>`${o.team}: ${o.theyOffer?.map(x=>x.name).join(",")}${o.picks?.length?" + "+o.picks.join(","):""}  —  ${o.analysis}`).join(" | "):"AI error",verdict:"Trade finder results",myGrade:"?",theirGrade:"?"}}));
        }} style={{display:"flex",gap:10,padding:"9px 12px",borderRadius:11,marginBottom:5,cursor:"pointer",border:"1px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.02)",alignItems:"center"}}>
          <div style={{flex:1}}><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name}</span><span style={{fontSize:9,color:"#475569",marginLeft:6}}>{p.pos} · TV:{playerTradeValue(p,sport)}</span></div>
          <OVRBadge ovr={p.ovr}/>
          <span style={{fontSize:9,color:"#475569"}}>Find offers →</span>
        </div>
      ))}
      {myOffer.loading&&<div style={{textAlign:"center",padding:"20px",color:"#475569",fontSize:12}}>Searching trade market…</div>}
      {myOffer.result?.verdict==="Trade finder results"&&<div style={{padding:"14px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",fontSize:11,color:"#94A3B8",lineHeight:1.7}}>{myOffer.result.analysis}</div>}
    </div>)}
  </div>);
}

export function FAStepV3({freeAgents,sport,ac,capInfo,auctions,myTeam,onBid,mob}){
  const[bidAmounts,setBidAmounts]=useState({});
  const[bidYears,setBidYears]=useState({});
  const[filter,setFilter]=useState("all");
  const positions=GM_POSITIONS[sport]||[];
  const filtered=freeAgents.filter(fa=>filter==="all"||fa.pos===filter);
  return(<div>
    <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{fontSize:10,color:capInfo.space<0?"#EF4444":"#22C55E",fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginRight:4}}>${capInfo.space.toFixed(1)}M space</div>
      <select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:"5px 9px",borderRadius:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:11}}>
        <option value="all">All Positions</option>
        {positions.map(p=><option key={p} value={p}>{p}</option>)}
      </select>
    </div>
    {filtered.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#334155",fontSize:12}}>No free agents available. Cut players to generate cap space or check back after transactions.</div>}
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {filtered.map((fa,i)=>{
        const auction=auctions[fa.id];
        const topBid=auction?.bidders?.length?Math.max(...auction.bidders.map(b=>b.offer)):0;
        const bidCount=auction?.bidders?.length||0;
        return(
          <div key={i} style={{padding:"12px 14px",borderRadius:14,background:"rgba(255,255,255,.03)",border:`1px solid ${bidCount>1?"rgba(239,68,68,.2)":"rgba(255,255,255,.07)"}`}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:2}}>
                  <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,color:"#E2E8F0"}}>{fa.name}</span>
                  <span style={{fontSize:9,color:ac,fontFamily:"'Orbitron',sans-serif"}}>{fa.pos}</span>
                  {bidCount>1&&<span style={{fontSize:8,color:"#EF4444",fontFamily:"'Orbitron',sans-serif",padding:"1px 5px",borderRadius:5,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)"}}>{bidCount} teams bidding!</span>}
                  {(fa.traits||[]).map((t,j)=><span key={j} style={{fontSize:8,color:"#334155",padding:"1px 5px",borderRadius:4,background:"rgba(255,255,255,.04)"}}>{t}</span>)}
                </div>
                <div style={{fontSize:10,color:"#64748B"}}>Age {fa.age} · OVR {fa.ovr} · Pot {fa.potential} · Ask: ${fa.salary}M/yr · {fa.historicalComp||""}</div>
                {fa.note&&<div style={{fontSize:10,color:"#475569",marginTop:2}}>{fa.note}</div>}
              </div>
              <OVRBadge ovr={fa.ovr}/>
            </div>
            {auction?.bidders?.length>0&&(
              <div style={{marginBottom:8,padding:"6px 10px",borderRadius:8,background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.1)"}}>
                <div style={{fontSize:8,color:"#EF4444",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>COMPETING OFFERS</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{auction.bidders.map((b,j)=><span key={j} style={{fontSize:9,color:"#94A3B8"}}>{b.team}: ${b.offer.toFixed(1)}M/{b.years}yr</span>)}</div>
              </div>
            )}
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <input type="number" step="0.5" min={fa.salary*0.7} max={fa.salary*3} value={bidAmounts[fa.id]||""} onChange={e=>setBidAmounts(p=>({...p,[fa.id]:e.target.value}))} placeholder={`$${fa.salary}M`} style={{width:85,textAlign:"center"}}/>
              <select value={bidYears[fa.id]||fa.years} onChange={e=>setBidYears(p=>({...p,[fa.id]:e.target.value}))} style={{width:65}}>
                {[1,2,3,4,5,6,7].map(y=><option key={y} value={y}>{y}yr</option>)}
              </select>
              <button onClick={()=>onBid(fa,parseFloat(bidAmounts[fa.id]||fa.salary),parseInt(bidYears[fa.id]||fa.years))} style={{padding:"7px 14px",borderRadius:10,background:ac+"22",border:`1px solid ${ac}44`,color:ac,fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{topBid>0?"🔼 Outbid":"🖊 Sign"}</button>
            </div>
          </div>
        );
      })}
    </div>
  </div>);
}

export function DraftStepV3({draftBoard,picks,sport,ac,year,aiOffers,pickInventory,onLoadBoard,onDraft,onUndo,onTradePick,canPickTrade,mob}){
  const[filter,setFilter]=useState("all");
  const[viewScouting,setViewScouting]=useState(null);
  const[tradePickTarget,setTradePickTarget]=useState(null);
  const[tradePickTeam,setTradePickTeam]=useState("");
  useEffect(()=>{onLoadBoard();},[]);
  const positions=GM_POSITIONS[sport]||[];
  const filtered=draftBoard.filter(p=>filter==="all"||p.pos===filter);
  const myAvailPicks=pickInventory.filter(pk=>pk.owned&&!pk.traded);
  return(<div>
    {picks.length>0&&(
      <div style={{marginBottom:12,padding:"10px 14px",borderRadius:12,background:ac+"10",border:`1px solid ${ac}33`}}>
        <div style={{fontSize:9,color:ac,fontFamily:"'Orbitron',sans-serif",marginBottom:5}}>YOUR PICKS ({picks.length})</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{picks.map((p,i)=><span key={i} style={{padding:"3px 9px",borderRadius:9,background:ac+"20",border:`1px solid ${ac}44`,fontSize:10,color:ac,fontFamily:"'Orbitron',sans-serif"}}>{p.name} ({p.pos})</span>)}</div>
        {picks.length>0&&<button onClick={onUndo} style={{marginTop:6,padding:"3px 10px",borderRadius:7,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"#EF4444",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>↩ Undo Last Pick</button>}
      </div>
    )}
    {aiOffers.length>0&&(
      <div style={{marginBottom:12,padding:"10px 14px",borderRadius:12,background:"rgba(168,85,247,.07)",border:"1px solid rgba(168,85,247,.2)"}}>
        <div style={{fontSize:9,color:"#A855F7",fontFamily:"'Orbitron',sans-serif",marginBottom:5}}>🤖 AI PICK TRADE OFFERS</div>
        {aiOffers.map((o,i)=><div key={i} style={{fontSize:10,color:"#94A3B8",marginBottom:3}}>{o.fromTeam}: Give {o.offeredPick} → Get {o.askingPick}{o.plusPlayer?` + ${o.plusPlayer}`:""} — {o.analysis}</div>)}
      </div>
    )}
    {canPickTrade&&myAvailPicks.length>0&&(
      <div style={{marginBottom:12}}>
        <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:6}}>MY PICKS — click to trade</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {myAvailPicks.map((pk,i)=>(
            <button key={i} onClick={()=>setTradePickTarget(pk===tradePickTarget?null:pk)} style={{padding:"5px 10px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${tradePickTarget?.id===pk.id?"rgba(245,158,11,.5)":"rgba(255,255,255,.1)"}`,background:tradePickTarget?.id===pk.id?"rgba(245,158,11,.12)":"rgba(255,255,255,.03)",color:tradePickTarget?.id===pk.id?"#F59E0B":"#64748B"}}>{pk.label}</button>
          ))}
        </div>
        {tradePickTarget&&(
          <div style={{display:"flex",gap:6,marginTop:8,alignItems:"center"}}>
            <input value={tradePickTeam} onChange={e=>setTradePickTeam(e.target.value)} placeholder="Trade to (team name)…" style={{flex:1}}/>
            <button onClick={()=>{onTradePick(tradePickTarget,tradePickTeam);setTradePickTarget(null);setTradePickTeam("");}} disabled={!tradePickTeam.trim()} style={{padding:"6px 12px",borderRadius:9,background:"rgba(245,158,11,.12)",border:"1px solid rgba(245,158,11,.3)",color:"#F59E0B",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700}}>Trade Pick</button>
          </div>
        )}
      </div>
    )}
    <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
      <select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:"5px 9px",borderRadius:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:11}}>
        <option value="all">All Positions</option>
        {positions.map(p=><option key={p} value={p}>{p}</option>)}
      </select>
      <div style={{fontSize:10,color:"#334155",display:"flex",alignItems:"center",fontFamily:"'Orbitron',sans-serif"}}>{draftBoard.length} prospects</div>
    </div>
    {viewScouting&&(
      <div style={{marginBottom:12,padding:"14px",borderRadius:14,background:"rgba(0,212,255,.06)",border:"1px solid rgba(0,212,255,.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#E2E8F0"}}>{viewScouting.name} <span style={{color:ac,fontSize:10}}>{viewScouting.pos}</span></div>
          <button onClick={()=>setViewScouting(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:14}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
          {[["CEIL",viewScouting.ceiling,"#22C55E"],["FLOOR",viewScouting.floor,"#F59E0B"],["ETA",viewScouting.eta+"yr","#00D4FF"],["TV",viewScouting.tradeValue,ac]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",padding:"8px",borderRadius:8,background:"rgba(255,255,255,.04)"}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900,color:c}}>{v}</div><div style={{fontSize:8,color:"#334155"}}>{l}</div></div>
          ))}
        </div>
        <div style={{fontSize:11,color:"#94A3B8",lineHeight:1.6,marginBottom:5}}>{viewScouting.scoutingReport}</div>
        <div style={{display:"flex",gap:12,fontSize:10,color:"#475569"}}><span>Comp: {viewScouting.comparable||"—"}</span><span>School: {viewScouting.school}</span><span>Sign: {viewScouting.signability}</span></div>
      </div>
    )}
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {draftBoard.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#334155",fontSize:12}}>Loading draft board…</div>}
      {filtered.map((p,i)=>(
        <div key={i} style={{display:"flex",gap:10,padding:"9px 12px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",alignItems:"center"}}>
          <div style={{width:28,height:28,borderRadius:6,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,color:"#475569",flexShrink:0}}>#{p.pick||i+1}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:11,fontWeight:700,color:"#E2E8F0"}}>{p.name}</span>
              <span style={{fontSize:9,color:ac}}>{p.pos}</span>
              <span style={{fontSize:9,color:"#475569"}}>{p.school}</span>
              <GradeChip grade={p.grade}/>
            </div>
            <div style={{fontSize:9,color:"#475569"}}>Ceil:{p.ceiling} · Floor:{p.floor} · ETA:{p.eta}yr · Comp:{p.comparable}</div>
          </div>
          <div style={{display:"flex",gap:4,flexShrink:0}}>
            <button onClick={()=>setViewScouting(p===viewScouting?null:p)} style={{padding:"4px 8px",borderRadius:7,background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.2)",color:"#00D4FF",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>Scout</button>
            <button onClick={()=>onDraft(p)} style={{padding:"5px 10px",borderRadius:9,background:ac+"22",border:`1px solid ${ac}44`,color:ac,fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>Draft</button>
          </div>
        </div>
      ))}
    </div>
  </div>);
}

export function CommandStepV3({roster,setRoster,farmSystem,depthChart,setDepthChart,scheme,setScheme,sport,ac,myTeam,allMoves,capInfo,rules,rosterTab,setRosterTab,onCallUp,onSendDown,onIL,onActivate,budget,setBudget,ownerGoals,mob}){
  const[cmdTab,setCmdTab]=useState("roster");
  const slots=DEPTH_SLOTS[sport]||[];
  const schemes=SCHEMES[sport]||[];
  const findPlayer=(id)=>roster.find(p=>p.id===id);
  const ilPlayers=roster.filter(p=>p.il||p.status==="injured");
  const waiverPlayers=roster.filter(p=>p.waiverStatus==="on_waivers");
  const activeRoster=roster.filter(p=>p.status==="active"&&!p.il);
  return(<div>
    <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
      {[["roster","👥 Roster"],["depth","📊 Depth Chart"],["farm","🌱 Farm System"],["budget","💼 Budget"],["scheme","🎮 Scheme"],["log","📋 Moves"]].map(([t,l])=>(
        <button key={t} onClick={()=>setCmdTab(t)} style={{padding:"6px 11px",borderRadius:11,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${cmdTab===t?ac+"55":"rgba(255,255,255,.08)"}`,background:cmdTab===t?ac+"14":"rgba(255,255,255,.02)",color:cmdTab===t?ac:"#475569"}}>{l}</button>
      ))}
    </div>
    {cmdTab==="roster"&&(<div>
      <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
        {[["active",`Active (${activeRoster.length}/${rules.active})`],["il",`IL (${ilPlayers.length})`],["waiver",`Waivers (${waiverPlayers.length})`]].map(([t,l])=>(
          <button key={t} onClick={()=>setRosterTab(t)} style={{padding:"4px 10px",borderRadius:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,border:`1px solid ${rosterTab===t?ac+"44":"rgba(255,255,255,.07)"}`,background:rosterTab===t?ac+"10":"rgba(255,255,255,.02)",color:rosterTab===t?ac:"#475569"}}>{l}</button>
        ))}
      </div>
      {rosterTab==="active"&&activeRoster.map((p,i)=>(
        <div key={i} style={{display:"flex",gap:10,padding:"8px 12px",borderRadius:11,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:4,alignItems:"center"}}>
          <div style={{flex:1,minWidth:0}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name} <span style={{fontSize:9,color:ac}}>{p.pos}</span></div><div style={{fontSize:9,color:"#475569"}}>${p.salary}M · {p.years}yr · Age {p.age}</div></div>
          <OVRBadge ovr={p.ovr}/>
          <div style={{display:"flex",gap:4}}>
            {rules.il10&&<button onClick={()=>onIL(p,"10")} style={{padding:"3px 7px",borderRadius:6,background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",color:"#F59E0B",fontSize:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>IL</button>}
            {sport==="mlb"&&<button onClick={()=>onSendDown(p)} style={{padding:"3px 7px",borderRadius:6,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#475569",fontSize:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>⬇ AAA</button>}
          </div>
        </div>
      ))}
      {rosterTab==="il"&&(<div>
        {!ilPlayers.length&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:11}}>No injured players</div>}
        {ilPlayers.map((p,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"8px 12px",borderRadius:11,background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.15)",marginBottom:4,alignItems:"center"}}>
            <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name} <span style={{fontSize:9,color:"#EF4444"}}>{p.il}-day IL</span></div><div style={{fontSize:9,color:"#475569"}}>{p.pos} · Age {p.age}</div></div>
            <OVRBadge ovr={p.ovr}/>
            <button onClick={()=>onActivate(p)} style={{padding:"5px 10px",borderRadius:8,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.2)",color:"#22C55E",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700}}>Activate</button>
          </div>
        ))}
      </div>)}
      {rosterTab==="waiver"&&(<div>
        {!waiverPlayers.length&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:11}}>No players on waivers</div>}
        {waiverPlayers.map((p,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"8px 12px",borderRadius:11,background:"rgba(245,158,11,.05)",border:"1px solid rgba(245,158,11,.15)",marginBottom:4,alignItems:"center"}}>
            <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name}</div><div style={{fontSize:9,color:"#475569"}}>{p.pos} · ${p.salary}M</div></div>
            <OVRBadge ovr={p.ovr}/>
          </div>
        ))}
      </div>)}
    </div>)}
    {cmdTab==="depth"&&(<div>
      {slots.map(slot=>{
        const p=findPlayer(depthChart[slot]);
        return(<div key={slot} style={{display:"flex",gap:10,alignItems:"center",padding:"6px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:4}}>
          <div style={{minWidth:mob?50:70,fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,color:ac}}>{slot}</div>
          <select value={depthChart[slot]||""} onChange={e=>setDepthChart(prev=>({...prev,[slot]:e.target.value||null}))} style={{flex:1,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",borderRadius:8,padding:"4px 8px",fontSize:11}}>
            <option value="">— Empty —</option>
            {roster.filter(Boolean).map(r=><option key={r.id} value={r.id}>{r.name} ({r.pos}) {r.ovr}</option>)}
          </select>
          {p&&<OVRBadge ovr={p.ovr}/>}
        </div>);
      })}
    </div>)}
    {cmdTab==="farm"&&(<div>
      {["AAA","AA","A","Rookie"].map(lvl=>{
        const players=(farmSystem[lvl]||[]);
        if(!players.length&&lvl==="Rookie")return null;
        return(<div key={lvl} style={{marginBottom:16}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:ac,marginBottom:8}}>{lvl} ({players.length} prospects)</div>
          {!players.length&&<div style={{fontSize:10,color:"#334155",padding:"10px 0"}}>No {lvl} prospects</div>}
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:6}}>
            {players.filter(Boolean).map((p,i)=>(
              <div key={i} style={{padding:"10px 12px",borderRadius:11,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.05)",display:"flex",gap:8,alignItems:"center"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{p.name}</div>
                  <div style={{fontSize:9,color:ac}}>{p.pos} · ETA: {p.eta||"?"}yr</div>
                  <div style={{fontSize:9,color:"#334155"}}>Age {p.age} · Ceil: {p.potential||p.ceiling}</div>
                </div>
                <OVRBadge ovr={p.ovr}/>
                {lvl==="AAA"&&(p.eta<=1||p.ovr>=72)&&(
                  <button onClick={()=>onCallUp(p)} style={{padding:"4px 8px",borderRadius:7,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.2)",color:"#22C55E",fontSize:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>⬆ MLB</button>
                )}
              </div>
            ))}
          </div>
        </div>);
      })}
    </div>)}
    {cmdTab==="budget"&&(<div>
      <div style={{fontSize:10,color:"#334155",marginBottom:12}}>Adjust your front office budget. Higher scouting = better draft intel. Higher development = faster farm progression.</div>
      {[["payroll","Payroll Budget",200,50],["scouting","Scouting",10,50],["development","Player Development",5,40],["international","International",5,30]].map(([k,label,mn,mx])=>(
        <div key={k} style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:10,color:"#94A3B8",fontFamily:"'Orbitron',sans-serif"}}>{label.toUpperCase()}</span>
            <span style={{fontSize:11,color:ac,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>${budget[k]||mn}M</span>
          </div>
          <input type="range" min={mn} max={mx} value={budget[k]||mn} onChange={e=>setBudget(prev=>({...prev,[k]:parseInt(e.target.value)}))} style={{width:"100%",accentColor:ac}}/>
        </div>
      ))}
      <div style={{padding:"12px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",marginTop:8}}>
        <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:6}}>OWNER GOALS</div>
        {(ownerGoals||[]).map((g,i)=><div key={i} style={{fontSize:11,color:"#22C55E",padding:"3px 0"}}>✓ {g}</div>)}
        {!ownerGoals?.length&&<div style={{fontSize:10,color:"#334155"}}>No goals set yet</div>}
      </div>
    </div>)}
    {cmdTab==="scheme"&&(<div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",marginBottom:12}}>TEAM SCHEME</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {schemes.map(s=>(
          <button key={s} onClick={()=>setScheme(s)} style={{padding:"10px 18px",borderRadius:12,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,border:`2px solid ${scheme===s?ac+"88":"rgba(255,255,255,.1)"}`,background:scheme===s?ac+"18":"rgba(255,255,255,.03)",color:scheme===s?ac:"#64748B"}}>{s}</button>
        ))}
      </div>
    </div>)}
    {cmdTab==="log"&&(<div>
      {!allMoves.length&&<div style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:12}}>No moves made yet</div>}
      {allMoves.map((m,i)=>(
        <div key={i} style={{padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.05)",fontSize:11,color:"#94A3B8",marginBottom:4}}>{m.msg}<span style={{float:"right",fontSize:9,color:"#334155"}}>{new Date(m.ts).toLocaleTimeString()}</span></div>
      ))}
    </div>)}
  </div>);
}

export function ReviewStepV3({roster,allMoves,myDraftPicks,grade,sport,ac,year,season,simHistory,farmSystem,capInfo,ownerGoals,onGrade,onSimulate,simProgress,mob}){
  const active=roster.filter(p=>p.status==="active"&&!p.il);
  const teamOvr=Math.round(active.reduce((s,p)=>s+p.ovr,0)/Math.max(1,active.length));
  const farmCount=Object.values(farmSystem).flat().length;
  return(<div>
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:16}}>
      {[[teamOvr,"TEAM OVR",ac],[allMoves.length,"MOVES",ac],[myDraftPicks.length,"DRAFTED",ac],[farmCount,"FARM",ac]].map(([v,l,c])=>(
        <div key={l} style={{textAlign:"center",padding:"14px",borderRadius:14,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28,fontWeight:900,color:c}}>{v}</div>
          <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{l}</div>
        </div>
      ))}
    </div>
    {/* Owner goals */}
    {ownerGoals?.length>0&&(
      <div style={{marginBottom:14,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:6}}>OWNER GOALS</div>
        {ownerGoals.map((g,i)=><div key={i} style={{fontSize:11,color:"#22C55E"}}>• {g}</div>)}
      </div>
    )}
    {/* Season history */}
    {simHistory.length>0&&(
      <div style={{marginBottom:14,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",marginBottom:6}}>FRANCHISE HISTORY</div>
        {simHistory.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}><span style={{color:"#64748B"}}>{s.year}</span><span style={{color:"#E2E8F0",fontWeight:700}}>{s.record}</span><span style={{color:s.madePlayoffs?"#22C55E":"#475569",fontSize:10}}>{s.result}</span></div>)}
      </div>
    )}
    {/* Grade */}
    {grade&&(
      <div style={{marginBottom:14,padding:"16px",borderRadius:14,background:grade.grade?.startsWith("A")?"rgba(34,197,94,.08)":grade.grade?.startsWith("B")?"rgba(245,158,11,.08)":"rgba(239,68,68,.07)",border:`1px solid ${grade.grade?.startsWith("A")?"rgba(34,197,94,.25)":grade.grade?.startsWith("B")?"rgba(245,158,11,.25)":"rgba(239,68,68,.2)"}`}}>
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:8}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:40,fontWeight:900,color:grade.grade?.startsWith("A")?"#22C55E":grade.grade?.startsWith("B")?"#F59E0B":"#EF4444"}}>{grade.grade}</div>
          <div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:"#E2E8F0"}}>{grade.headline}</div><div style={{fontSize:10,color:"#64748B"}}>{grade.franchiseTrajectory}</div></div>
        </div>
        <div style={{fontSize:12,color:"#94A3B8",lineHeight:1.6,marginBottom:8}}>{grade.analysis}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div><div style={{fontSize:9,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>✅ STRENGTHS</div>{grade.strengths?.map((s,i)=><div key={i} style={{fontSize:10,color:"#94A3B8"}}>· {s}</div>)}</div>
          <div><div style={{fontSize:9,color:"#EF4444",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>⚠️ WEAKNESSES</div>{grade.weaknesses?.map((s,i)=><div key={i} style={{fontSize:10,color:"#94A3B8"}}>· {s}</div>)}</div>
        </div>
      </div>
    )}
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {!grade&&<button onClick={onGrade} style={{padding:"12px",borderRadius:12,background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.3)",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#A855F7"}}>🤖 Grade My Offseason</button>}
      <button onClick={onSimulate} style={{padding:"14px",borderRadius:12,background:`linear-gradient(135deg,${ac},${ac}99)`,border:"none",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#fff"}}>▶ SIMULATE {year} SEASON{season>1?` (Year ${season})`:""}  →</button>
    </div>
  </div>);
}



