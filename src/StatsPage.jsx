import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "../shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "../components/UI";

// ─── ESPN-Style Stats Page ─────────────────────────────────────────────────────

const STATS_SPORTS=[
  {id:"mlb",label:"MLB",icon:"⚾",espnPath:"baseball/mlb",color:"#22C55E"},
  {id:"nba",label:"NBA",icon:"🏀",espnPath:"basketball/nba",color:"#F59E0B"},
  {id:"nhl",label:"NHL",icon:"🏒",espnPath:"hockey/nhl",color:"#00D4FF"},
  {id:"nfl",label:"NFL",icon:"🏈",espnPath:"football/nfl",color:"#EF4444"},
];

export function useESPN(path,deps=[]){
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
export function PlayerStatsPage({playerId,sport,onBack}){
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
export function ESPNScores({sport,navigate}){
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
export function PlayerSearchSection({sport,onSelectPlayer}){
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
export default function StatsPage({navigate,initPlayer,initSport}){
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
export function HubPage({cu,users,setUsers,navigate}){
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


