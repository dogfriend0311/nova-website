import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "../shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "../components/UI";

// ─── Game Detail Page ──────────────────────────────────────────────────────────
export function GameDetailPage({gameId,sport,navigate}){
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
                          {players.filter(Boolean).map((p,pi)=>{
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

