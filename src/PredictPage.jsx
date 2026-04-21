import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "../shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "../components/UI";

export default function PredictPage({cu,users,setUsers,navigate}){
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

