import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "../shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "../components/UI";

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

export function getCardRarityFromTotal(total){
  const tiers=["iconic","mystic","legendary","epic","rare","uncommon","common","general"];
  for(const t of tiers){if((total||0)>=RARITY_CFG[t].threshold)return t;}
  return "general";
}
export function getPlayRarity(r){
  if(r>=10)return"legendary";
  if(r>=7) return"epic";
  if(r>=4) return"rare";
  if(r>=2) return"uncommon";
  return"common";
}
export function nextRarityThreshold(total){
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
export function mlbTeamLogo(teamId){return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;}
export function mlbPlayerHeadshot(mlbPlayerId){return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_426,q_auto:best/v1/people/${mlbPlayerId}/headshot/67/current`;}

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
export function useStars(cu){
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

export function StarBadge({stars,size="sm"}){
  const fs=size==="lg"?20:size==="md"?16:13;
  return(
    <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.3)",borderRadius:8,padding:size==="lg"?"8px 14px":"4px 10px",flexShrink:0}}>
      <span style={{fontSize:fs}}>⭐</span>
      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:fs-2,fontWeight:900,color:"#F59E0B"}}>{(stars||0).toLocaleString()}</span>
    </div>
  );
}

// Card visual component
export function CardDisplay({type,name,subName,headshot,totalRating=0,customName,customBorder,customBg,customEffect,onClick,size="md",pinned,serial}){
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
export function PlayCard({play,faceDown=false,flipped=false,onFlip,size="md",showPrestige}){
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
export function PackOpenModal({pack,plays,onClose,onKeep}){
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
export function PackOpenModalWrapper({pack,plays,onClose,onKeep}){
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
export function CardCustomizeModal({card,onSave,onClose}){
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
export function PrestigeModal({plays,onPrestige,onClose}){
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

export function CardMarketTab({cu,stars,myCards,onBuy}){
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

export function MyCardsTab({cu,cards,plays,onCustomize,onPin,onApply}){
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

export function PackShopTab({cu,stars,loading,onOpen,myTeamCard}){
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

export function MyPlaysTab({cu,plays,cards,onApply,onPrestige,onPinPlay}){
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
export function CollectionTab({cu,myCards,myPlays}){
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

export default function CardsPage({cu}){
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


