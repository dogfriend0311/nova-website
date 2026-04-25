import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "./shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig, RobloxAvatar } from "./UI";

// ─── LeagueTeamsTab — public Teams page + dashboard team editing ───────────────
export function LeagueTeamsTab({teams,players,accentColor,league,cu,onTeamsUpdated,isAdmin,navigate,users}){
  const mob=useIsMobile();
  const[selTeam,setSelTeam]=useState(null);
  const[editing,setEditing]=useState(null);
  const[editName,setEditName]=useState("");
  const[editOwner,setEditOwner]=useState("");
  const[editLogo,setEditLogo]=useState("");
  const[saving,setSaving]=useState(false);

  const handleLogoUpload=(e)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    if(file.size>500000){alert("Logo must be under 500KB");return;}
    const reader=new FileReader();
    reader.onload=ev=>setEditLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const openEdit=(team,e)=>{
    e.stopPropagation();
    setEditing(team);
    setEditName(team.name||"");
    setEditOwner(team.owner_name||"");
    setEditLogo(team.logo||"");
  };

  const saveEdit=async()=>{
    if(!editing)return;
    setSaving(true);
    const patch={name:editName.trim(),owner_name:editOwner.trim(),logo:editLogo};
    await sb.patch(`nova_${league}_teams`,`?id=eq.${editing.id}`,patch);
    onTeamsUpdated(prev=>prev.map(t=>t.id===editing.id?{...t,...patch}:t));
    setSaving(false);
    setEditing(null);
  };

  const teamPlayers=(teamName)=>players.filter(Boolean).filter(p=>p.team===teamName);

  if(selTeam){
    const t=teams.find(x=>x.id===selTeam)||teams[0];
    if(!t)return null;
    const tp=teamPlayers(t.name);
    return(
      <div>
        <button onClick={()=>setSelTeam(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,marginBottom:16,display:"flex",alignItems:"center",gap:5}}>← ALL TEAMS</button>
        <Card style={{padding:mob?"16px":"20px 24px",marginBottom:16}} hover={false}>
          <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{width:mob?72:88,height:mob?72:88,borderRadius:14,overflow:"hidden",background:`${accentColor}18`,border:`2px solid ${accentColor}44`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {t.logo?<img src={t.logo} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:36}}>🏟</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?18:24,fontWeight:900,color:"#E2E8F0"}}>{t.name}</div>
              {t.owner_name&&<div style={{fontSize:12,color:accentColor,marginTop:4}}>👑 GM: {t.owner_name}</div>}
              <div style={{fontSize:11,color:"#475569",marginTop:2}}>{tp.length} players</div>
            </div>
            {isAdmin&&<button onClick={(e)=>openEdit(t,e)} style={{padding:"8px 14px",borderRadius:10,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#94A3B8",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700}}>✏️ Edit Team</button>}
          </div>
        </Card>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".12em",marginBottom:12}}>ROSTER</div>
        {tp.length===0&&<Empty icon="👥" msg="No players on this team yet"/>}
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:8,marginBottom:16}}>
          {tp.map((p,i)=>{
            const member=p.nova_user_id?users?.find(u=>u.id===p.nova_user_id):null;
            const rid=p.roblox_id||member?.social_roblox||"";
            return(
              <div key={i} onClick={()=>navigate&&navigate("nffl_player",{league,playerId:p.id})}
                style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,.03)",border:`1px solid ${accentColor}22`,cursor:"pointer",transition:"all .18s",alignItems:"center"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=accentColor+"55";e.currentTarget.style.background=accentColor+"0a";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=accentColor+"22";e.currentTarget.style.background="rgba(255,255,255,.03)";}}>
                <div style={{width:40,height:40,borderRadius:8,overflow:"hidden",background:`${accentColor}18`,border:`1px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {rid?<img src={`/api/roblox-avatar?userId=${rid}`} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:<span style={{fontSize:18}}>👤</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  <div style={{display:"flex",gap:5,alignItems:"center",marginTop:1}}>
                    <span style={{fontSize:9,color:accentColor}}>{p.position}</span>
                    {p.jersey&&<span style={{fontSize:9,color:"#334155"}}>#{p.jersey}</span>}
                    {p.ovr&&<span style={{padding:"1px 5px",borderRadius:5,background:ovrColor(p.ovr)+"20",fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:700,color:ovrColor(p.ovr)}}>{p.ovr}</span>}
                  </div>
                </div>
                <span style={{color:"#334155"}}>›</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if(editing)return(
    <div>
      <button onClick={()=>setEditing(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,marginBottom:16,display:"flex",alignItems:"center",gap:5}}>← BACK</button>
      <Card style={{padding:"18px",maxWidth:480}} hover={false}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:14,fontWeight:700}}>✏️ EDIT TEAM</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:64,height:64,borderRadius:12,overflow:"hidden",background:`${accentColor}18`,border:`2px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {editLogo?<img src={editLogo} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:28}}>🏟</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>TEAM LOGO</div>
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={{fontSize:10,color:"#94A3B8"}}/>
              {editLogo&&<button onClick={()=>setEditLogo("")} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:10,display:"block",marginTop:4}}>Remove logo</button>}
            </div>
          </div>
          <div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>TEAM NAME</div>
            <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Team name…"/>
          </div>
          <div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>GM / TEAM OWNER NAME</div>
            <input value={editOwner} onChange={e=>setEditOwner(e.target.value)} placeholder="e.g. Snow"/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={saveEdit} disabled={saving||!editName.trim()}>{saving?"Saving…":"💾 Save Changes"}</Btn>
            <button onClick={()=>setEditing(null)} style={{padding:"8px 14px",borderRadius:10,background:"none",border:"1px solid rgba(255,255,255,.1)",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10}}>Cancel</button>
          </div>
        </div>
      </Card>
    </div>
  );

  return(
    <div>
      {teams.length===0&&<Empty icon="🏟" msg="No teams created yet"/>}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>
        {teams.map((t,i)=>{
          const tp=teamPlayers(t.name);
          return(
            <div key={i} onClick={()=>setSelTeam(t.id)}
              style={{borderRadius:16,background:"rgba(255,255,255,.03)",border:`1px solid ${accentColor}22`,cursor:"pointer",overflow:"hidden",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=accentColor+"66";e.currentTarget.style.background=accentColor+"0a";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=accentColor+"22";e.currentTarget.style.background="rgba(255,255,255,.03)";}}>
              <div style={{padding:"16px",display:"flex",gap:14,alignItems:"center"}}>
                <div style={{width:56,height:56,borderRadius:10,overflow:"hidden",background:`${accentColor}18`,border:`1px solid ${accentColor}44`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {t.logo?<img src={t.logo} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:28}}>🏟</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                  {t.owner_name&&<div style={{fontSize:11,color:accentColor,marginTop:2}}>👑 {t.owner_name}</div>}
                  <div style={{fontSize:10,color:"#475569",marginTop:2}}>{tp.length} players</div>
                </div>
                {isAdmin&&<button onClick={(e)=>openEdit(t,e)} style={{padding:"5px 10px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,flexShrink:0}}>✏️</button>}
              </div>
              {tp.length>0&&(
                <div style={{borderTop:`1px solid ${accentColor}18`,padding:"10px 16px",display:"flex",gap:6,flexWrap:"wrap"}}>
                  {tp.slice(0,6).map((p,j)=>(
                    <div key={j} style={{fontSize:9,color:"#475569",padding:"2px 7px",borderRadius:6,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)"}}>
                      {p.name.split(" ").slice(-1)[0]} <span style={{color:accentColor}}>{p.position}</span>
                    </div>
                  ))}
                  {tp.length>6&&<div style={{fontSize:9,color:"#334155"}}>+{tp.length-6} more</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── NFFL Page (Football League) ─────────────────────────────────
export function NFFLPage({cu,users,navigate}){
  const mob=useIsMobile();
  const isAdmin=cu?.is_owner||cu?.staff_role==="Co-owner"||cu?.staff_role==="Basketball League Admin"||cu?.staff_role==="2v2FF Admin";
  const[tab,setTab]=useState("feed");
  const[feed,setFeed]=useState([]);
  const[players,setPlayers]=useState([]);
  const[teams,setTeams]=useState([]);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    const load=async()=>{
      const [f,p,t]=await Promise.all([
        sb.get("nova_nffl_feed","?order=ts.desc&limit=50"),
        sb.get("nova_nffl_players","?order=name.asc"),
        sb.get("nova_nffl_teams","?order=name.asc"),
      ]);
      setFeed(f||[]);setPlayers(p||[]);setTeams(t||[]);setLoading(false);
    };
    load();
  },[]);

  const TABS=[{id:"feed",label:"📢 Game Feed"},{id:"teams",label:"🏟 Teams"},{id:"stats",label:"📊 Stats"},{id:"players",label:"👤 Players"}];

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"12px 10px 100px":"20px 20px 80px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <span style={{fontSize:28}}>🏈</span>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:22,fontWeight:900,color:"#F59E0B",letterSpacing:".06em"}}>2v2FF</div>
          <div style={{fontSize:11,color:"#475569"}}>2v2 Flag Football League</div>
        </div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:18,borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:10}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,border:"none",background:"none",borderBottom:`2px solid ${tab===t.id?"#F59E0B":"transparent"}`,color:tab===t.id?"#F59E0B":"#475569",transition:"all .18s"}}>{t.label}</button>)}
      </div>
      {loading&&<div style={{textAlign:"center",padding:60,color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading 2v2FF data...</div>}
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
      {!loading&&tab==="teams"&&(
        <LeagueTeamsTab teams={teams} players={players} accentColor="#F59E0B" league="nffl" cu={cu} onTeamsUpdated={setTeams} isAdmin={isAdmin} navigate={navigate} users={users}/>
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

// ─── NBBL Page (Baseball League) ─────────────────────────────────
export function NBBLPage({cu,users,navigate}){
  const mob=useIsMobile();
  const isAdmin=cu?.is_owner||cu?.staff_role==="Co-owner"||cu?.staff_role==="Basketball League Admin";
  const[tab,setTab]=useState("feed");
  const[feed,setFeed]=useState([]);
  const[players,setPlayers]=useState([]);
  const[loading,setLoading]=useState(true);
  const[statCat,setStatCat]=useState("hitting");
  const[teams,setTeams]=useState([]);

  useEffect(()=>{
    const load=async()=>{
      const [f,p,t]=await Promise.all([
        sb.get("nova_nbbl_feed","?order=ts.desc&limit=50"),
        sb.get("nova_nbbl_players","?order=name.asc"),
        sb.get("nova_nbbl_teams","?order=name.asc"),
      ]);
      setFeed(f||[]);setPlayers(p||[]);setTeams(t||[]);setLoading(false);
    };
    load();
  },[]);

  const TABS=[{id:"feed",label:"📢 Game Feed"},{id:"teams",label:"🏟 Teams"},{id:"stats",label:"📊 Stats"},{id:"players",label:"👤 Players"}];

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
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:22,fontWeight:900,color:"#22C55E",letterSpacing:".06em"}}>Baseball League</div>
          <div style={{fontSize:11,color:"#475569"}}>Baseball League</div>
        </div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:18,borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:10}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,border:"none",background:"none",borderBottom:`2px solid ${tab===t.id?"#22C55E":"transparent"}`,color:tab===t.id?"#22C55E":"#475569",transition:"all .18s"}}>{t.label}</button>)}
      </div>
      {loading&&<div style={{textAlign:"center",padding:60,color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading Baseball League data...</div>}
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
      {!loading&&tab==="teams"&&(
        <LeagueTeamsTab teams={teams} players={players} accentColor="#22C55E" league="nbbl" cu={cu} onTeamsUpdated={setTeams} isAdmin={isAdmin} navigate={navigate} users={users}/>
      )}
      {!loading&&tab==="stats"&&(
        <div>
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

// ─── Ring Rush Page (Basketball League) ───────────────────────────────
export function RingRushPage({cu,users,navigate}){
  const mob=useIsMobile();
  const isAdmin=cu?.is_owner||cu?.staff_role==="Co-owner"||cu?.staff_role==="Basketball League Admin";
  const[tab,setTab]=useState("feed");
  const[feed,setFeed]=useState([]);
  const[players,setPlayers]=useState([]);
  const[teams,setTeams]=useState([]);
  const[loading,setLoading]=useState(true);
  const[statCat,setStatCat]=useState("scoring");

  useEffect(()=>{
    const load=async()=>{
      const[f,p,t]=await Promise.all([
        sb.get("nova_ringrush_feed","?order=ts.desc&limit=50"),
        sb.get("nova_ringrush_players","?order=name.asc"),
        sb.get("nova_ringrush_teams","?order=name.asc"),
      ]);
      setFeed(f||[]);setPlayers(p||[]);setTeams(t||[]);setLoading(false);
    };
    load();
  },[]);

  const TABS=[{id:"feed",label:"📢 Game Feed"},{id:"teams",label:"🏟 Teams"},{id:"stats",label:"📊 Stats"},{id:"players",label:"👤 Players"}];
  const ac="#EC4899";

  const STAT_CATS={
    scoring:{label:"🏀 Scoring",color:"#EC4899",cols:["G","MIN","PTS","FGM","FGA","FG%","3PM","3PA","3P%","FTM","FTA","FT%"]},
    rebounds:{label:"💪 Rebounds",color:"#F59E0B",cols:["G","MIN","OREB","DREB","REB","REB/G"]},
    playmaking:{label:"🎯 Playmaking",color:"#22C55E",cols:["G","MIN","AST","TOV","AST/G","AST/TOV"]},
    defense:{label:"🛡 Defense",color:"#3B82F6",cols:["G","MIN","STL","BLK","PF","STL/G","BLK/G"]},
  };

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"12px 10px 100px":"20px 20px 80px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <span style={{fontSize:32}}>🏀</span>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:22,fontWeight:900,color:ac,letterSpacing:".06em"}}>RING RUSH</div>
          <div style={{fontSize:11,color:"#475569"}}>Basketball League</div>
        </div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:18,borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:10}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"7px 14px",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,border:"none",background:"none",
              borderBottom:`2px solid ${tab===t.id?ac:"transparent"}`,
              color:tab===t.id?ac:"#475569",transition:"all .18s"}}>
            {t.label}
          </button>
        ))}
      </div>
      {loading&&<div style={{textAlign:"center",padding:60,color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:11}}>Loading Basketball League data...</div>}
      {!loading&&tab==="feed"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {feed.length===0&&<Empty icon="🏀" msg="No game feed posts yet — check back soon!"/>}
          {feed.map((f,i)=>(
            <Card key={i} style={{padding:"14px 16px"}} hover={false}>
              <div style={{fontSize:11,color:ac,fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginBottom:4}}>{f.title||"Update"}</div>
              <div style={{fontSize:13,color:"#94A3B8",lineHeight:1.5}}>{f.content||""}</div>
              <div style={{fontSize:9,color:"#334155",marginTop:8,fontFamily:"'Orbitron',sans-serif"}}>{f.author_name?`${f.author_name} · `:""}{f.ts?new Date(f.ts).toLocaleDateString():""}</div>
            </Card>
          ))}
        </div>
      )}
      {!loading&&tab==="teams"&&(
        <LeagueTeamsTab teams={teams} players={players} accentColor={ac} league="ringrush" cu={cu} onTeamsUpdated={setTeams} isAdmin={isAdmin} navigate={navigate} users={users}/>
      )}
      {!loading&&tab==="stats"&&(
        <div>
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
          {(()=>{
            const cat=STAT_CATS[statCat];
            const statKey=`${statCat}_stats`;
            const statPlayers=players.filter(Boolean).filter(p=>p[statKey]&&Object.keys(p[statKey]).length>0);
            if(!statPlayers.length)return<Empty icon="📊" msg={`No ${statCat} stats recorded yet`}/>;
            return(
              <Card style={{padding:"14px 16px"}} hover={false}>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                    <thead>
                      <tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                        <td style={{padding:"6px 10px",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",minWidth:120}}>PLAYER</td>
                        {cat.cols.map(c=><td key={c} style={{padding:"6px 8px",textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569"}}>{c}</td>)}
                      </tr>
                    </thead>
                    <tbody>
                      {statPlayers.map((p,i)=>(
                        <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                          <td style={{padding:"7px 10px"}}>
                            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0"}}>{p.name}</div>
                            <div style={{fontSize:9,color:ac}}>{p.position}</div>
                          </td>
                          {cat.cols.map(c=><td key={c} style={{padding:"7px 8px",textAlign:"center",color:"#94A3B8"}}>{p[statKey]?.[c]||"—"}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })()}
        </div>
      )}
      {!loading&&tab==="players"&&(
        <LeaguePlayersPage players={players} league="ringrush" accentColor={ac} users={users} navigate={navigate}/>
      )}
    </div>
  );
}

// ─── LeaguePlayersPage ─────────────────────────────────────────────
export function LeaguePlayersPage({players,league,accentColor,users,navigate}){
  const mob=useIsMobile();
  const[sel,setSel]=useState(null);
  const[statsView,setStatsView]=useState("season");
  const[playerClips,setPlayerClips]=useState([]);
  const[clipsLoaded,setClipsLoaded]=useState({});
  const[listMode,setListMode]=useState("cards");
  const[sortCol,setSortCol]=useState(null);
  const[sortDir,setSortDir]=useState("desc");
  const[lbField,setLbField]=useState(null);
  const[searchQ,setSearchQ]=useState("");
  const isBaseball=league==="nbbl";
  const isBasketball=league==="ringrush";
  const selectedPlayer=sel?players.find(p=>p.id===sel):null;
  const sportKey=isBasketball?"basketball":isBaseball?"baseball":"football";

  useEffect(()=>{
    if(!sel||clipsLoaded[sel])return;
    sb.get(`nova_${league}_clips`,`?player_id=eq.${sel}&order=ts.desc`).then(r=>{
      setPlayerClips(r||[]);
      setClipsLoaded(prev=>({...prev,[sel]:true}));
    });
  },[sel]);

  const matchMember=(player)=>{
    if(!player)return null;
    if(player.nova_user_id)return users.find(u=>u.id===player.nova_user_id)||null;
    const n=(player.name||"").toLowerCase();
    return users.find(u=>(u.display_name||"").toLowerCase().includes(n)||n.includes((u.display_name||"").toLowerCase())||(u.username||"").toLowerCase()===n)||null;
  };

  const statGlow=(key,val)=>{
    const v=parseFloat(val);if(isNaN(v))return null;
    const map={AVG:[[.300,"#22C55E"],[.260,"#F59E0B"]],OPS:[[.900,"#A855F7"],[.800,"#22C55E"]],ERA:[[2.5,"#A855F7"],[3.5,"#22C55E"],[4.5,"#F59E0B"]],HR:[[25,"#A855F7"],[15,"#22C55E"]],RBI:[[70,"#A855F7"],[50,"#22C55E"]],TD:[[15,"#A855F7"],[8,"#22C55E"]],YDS:[[1200,"#A855F7"],[600,"#22C55E"]],RTG:[[100,"#22C55E"],[90,"#F59E0B"]],PTS:[[25,"#A855F7"],[18,"#22C55E"]],REB:[[10,"#A855F7"],[7,"#22C55E"]],AST:[[8,"#A855F7"],[5,"#22C55E"]],SACK:[[8,"#A855F7"],[4,"#22C55E"]],INT:[[6,"#A855F7"],[3,"#22C55E"]]};
    const lowerBetter=["ERA","WHIP","BB9","TOV"];
    const tiers=map[key];if(!tiers)return null;
    if(lowerBetter.includes(key)){for(const[t,c]of tiers){if(v<=t)return c;}}
    else{for(const[t,c]of tiers){if(v>=t)return c;}}
    return null;
  };

  const LB_CATS=isBasketball?[
    {key:"scoring_stats_season",label:"🏀 Scoring",cols:["G","PTS","FG%","3P%","FT%","MIN"]},
    {key:"rebounds_stats_season",label:"💪 Rebounds",cols:["G","REB","OREB","DREB","REB/G"]},
    {key:"playmaking_stats_season",label:"🎯 Playmaking",cols:["G","AST","TOV","AST/TOV"]},
    {key:"defense_stats_season",label:"🛡 Defense",cols:["G","STL","BLK","PF"]},
  ]:isBaseball?[
    {key:"hitting_stats_season",label:"⚾ Hitting",cols:["G","AVG","HR","RBI","OBP","SLG","OPS","SB"]},
    {key:"pitching_stats_season",label:"⚾ Pitching",cols:["G","W","L","ERA","SO","IP","WHIP"]},
    {key:"fielding_stats_season",label:"🧤 Fielding",cols:["G","PO","A","E","FLD%"]},
  ]:[
    {key:"passing_stats_season",label:"🎯 Passing",cols:["G","YDS","TD","INT","RTG","CMP","ATT"]},
    {key:"rushing_stats_season",label:"🏃 Rushing",cols:["G","YDS","TD","CAR","AVG"]},
    {key:"receiving_stats_season",label:"📡 Receiving",cols:["G","REC","YDS","TD","AVG"]},
    {key:"defensive_stats_season",label:"🛡 Defense",cols:["G","TCK","SACK","INT","FF","PD"]},
  ];
  const lbCat=LB_CATS.find(c=>c.key===lbField)||LB_CATS[0];
  const lbCols=lbCat?.cols||[];
  const sortedPlayers=useMemo(()=>{
    if(!sortCol)return [...players.filter(Boolean)];
    return [...players.filter(Boolean)].sort((a,b)=>{
      const av=parseFloat((a[lbCat?.key]||{})[sortCol]);
      const bv=parseFloat((b[lbCat?.key]||{})[sortCol]);
      if(isNaN(av)&&isNaN(bv))return 0;if(isNaN(av))return 1;if(isNaN(bv))return -1;
      return sortDir==="desc"?bv-av:av-bv;
    });
  },[players,sortCol,sortDir,lbField]);

  const handleSort=(col)=>{if(sortCol===col)setSortDir(d=>d==="desc"?"asc":"desc");else{setSortCol(col);setSortDir("desc");}};

  if(sel&&selectedPlayer){
    const member=matchMember(selectedPlayer);
    const robloxId=selectedPlayer.roblox_id||member?.social_roblox||"";
    const favSong=member?.page_music;
    const songTrack=Array.isArray(favSong)?favSong[0]:favSong;
    const getStats=(baseKey,type)=>type==="season"?selectedPlayer[baseKey+"_season"]||{}:selectedPlayer[baseKey]||{};

    const MLB_CATS=[
      {key:"hitting_stats",label:"⚾ Hitting",color:accentColor,cols:["G","AB","R","H","2B","3B","HR","RBI","BB","SO","SB","AVG","OBP","SLG","OPS"]},
      {key:"pitching_stats",label:"⚾ Pitching",color:"#3B82F6",cols:["G","GS","W","L","SV","IP","H","ER","BB","SO","ERA","WHIP","K9","BB9"]},
      {key:"fielding_stats",label:"🧤 Fielding",color:"#A855F7",cols:["G","GS","PO","A","E","DP","FLD%","INN"]},
    ];
    const NFL_CATS=[
      {key:"passing_stats",label:"🎯 Passing",color:accentColor,cols:["G","CMP","ATT","YDS","TD","INT","RTG"]},
      {key:"rushing_stats",label:"🏃 Rushing",color:"#EF4444",cols:["G","CAR","YDS","TD","AVG","LONG"]},
      {key:"receiving_stats",label:"📡 Receiving",color:"#8B5CF6",cols:["G","REC","YDS","TD","AVG","LONG"]},
      {key:"defensive_stats",label:"🛡 Defense",color:"#00D4FF",cols:["G","TCK","SACK","INT","FF","PD"]},
      {key:"kicking_stats",label:"⚽ Kicking",color:"#F59E0B",cols:["G","FGM","FGA","FG%","XPM","XPA","LONG"]},
    ];
    const NBA_CATS=[
      {key:"scoring_stats",label:"🏀 Scoring",color:accentColor,cols:["G","MIN","PTS","FGM","FGA","FG%","3PM","3PA","3P%","FTM","FTA","FT%"]},
      {key:"rebounds_stats",label:"💪 Rebounds",color:"#F59E0B",cols:["G","OREB","DREB","REB","REB/G"]},
      {key:"playmaking_stats",label:"🎯 Playmaking",color:"#22C55E",cols:["G","AST","TOV","AST/G","AST/TOV"]},
      {key:"defense_stats",label:"🛡 Defense",color:"#3B82F6",cols:["G","STL","BLK","PF","STL/G","BLK/G"]},
    ];
    const CATS=isBasketball?NBA_CATS:isBaseball?MLB_CATS:NFL_CATS;
    const hasAnyStats=(type)=>CATS.some(cat=>{const d=getStats(cat.key,type);return cat.cols.some(c=>d[c]!==undefined&&d[c]!=="");});

    const snap=(()=>{
      if(isBaseball){
        const h=getStats("hitting_stats","season");const p=getStats("pitching_stats","season");
        const isP=["P","SP","RP"].includes(selectedPlayer.position);
        return isP?[["ERA",p.ERA],["W",p.W],["SO",p.SO],["WHIP",p.WHIP]]:[["AVG",h.AVG],["HR",h.HR],["RBI",h.RBI],["OPS",h.OPS]];
      }
      if(isBasketball){const s=getStats("scoring_stats","season");const r=getStats("rebounds_stats","season");const a=getStats("playmaking_stats","season");return[["PTS",s.PTS],["REB",r.REB],["AST",a.AST],["FG%",s["FG%"]]];}
      const pos=selectedPlayer.position||"";
      if(pos==="QB"){const s=getStats("passing_stats","season");return[["YDS",s.YDS],["TD",s.TD],["INT",s.INT],["RTG",s.RTG]];}
      if(pos==="RB"){const s=getStats("rushing_stats","season");return[["YDS",s.YDS],["TD",s.TD],["CAR",s.CAR],["AVG",s.AVG]];}
      const s=getStats("receiving_stats","season");return[["REC",s.REC],["YDS",s.YDS],["TD",s.TD],["AVG",s.AVG]];
    })().filter(([,v])=>v!==undefined&&v!=="");

    const StatTable=({cat,type})=>{
      const data=getStats(cat.key,type);
      const hasData=cat.cols.some(c=>data[c]!==undefined&&data[c]!=="");
      if(!hasData)return null;
      return(
        <div style={{borderRadius:16,overflow:"hidden",border:`1px solid ${cat.color}25`,marginBottom:12,background:`linear-gradient(160deg,${cat.color}08,rgba(0,0,0,.3))`}}>
          <div style={{padding:"10px 16px",background:`linear-gradient(90deg,${cat.color}20,transparent)`,borderBottom:`1px solid ${cat.color}20`,display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:3,height:14,borderRadius:2,background:cat.color,flexShrink:0}}/>
            <span style={{fontSize:9,color:cat.color,fontFamily:"'Orbitron',sans-serif",letterSpacing:".14em",fontWeight:700}}>{cat.label}</span>
          </div>
          <div style={{overflowX:"auto",padding:"4px 0 8px"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{cat.cols.map(c=><td key={c} style={{padding:"6px 10px",textAlign:"center",color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:8,whiteSpace:"nowrap",letterSpacing:".08em",fontWeight:700}}>{c}</td>)}</tr></thead>
              <tbody><tr>{cat.cols.map(c=>{
                const val=data[c];const sc=val!==undefined&&val!==""?statGlow(c,val):null;
                return(
                  <td key={c} style={{padding:"8px 10px",textAlign:"center",fontWeight:sc?900:600,fontSize:sc?15:12,color:sc||"#CBD5E1",position:"relative",transition:"all .15s"}}>
                    {val!==undefined&&val!==""?<>
                      <span style={{color:sc||"#CBD5E1"}}>{val}</span>
                      {sc&&<div style={{position:"absolute",bottom:3,left:"50%",transform:"translateX(-50%)",width:3,height:3,borderRadius:"50%",background:sc,boxShadow:`0 0 4px ${sc}`}}/>}
                    </>:<span style={{color:"#1E293B"}}>—</span>}
                  </td>
                );
              })}</tr></tbody>
            </table>
          </div>
        </div>
      );
    };

    const spotifyMatch=selectedPlayer.spotify_url?.match(/spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
    const spotifyEmbed=spotifyMatch?`https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator&theme=0`:"";

    return(
      <div>
        <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"#334155",cursor:"pointer",fontSize:11,marginBottom:20,display:"flex",alignItems:"center",gap:6,fontFamily:"'Orbitron',sans-serif",letterSpacing:".08em"}}>
          <span style={{fontSize:16,lineHeight:1}}>←</span> ROSTER
        </button>
        <div style={{borderRadius:20,overflow:"hidden",marginBottom:16,position:"relative",background:"#030712",border:`1px solid ${accentColor}30`}}>
          <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at top left,${accentColor}40 0%,transparent 60%),radial-gradient(ellipse at bottom right,${accentColor}18 0%,transparent 60%)`,pointerEvents:"none"}}/>
          <div style={{position:"absolute",inset:0,backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.03'/%3E%3C/svg%3E\")",opacity:.4,pointerEvents:"none"}}/>
          {selectedPlayer.jersey&&<div style={{position:"absolute",right:mob?-10:0,top:"-10px",fontFamily:"'Orbitron',sans-serif",fontSize:mob?110:160,fontWeight:900,color:accentColor,opacity:.06,lineHeight:1,userSelect:"none",pointerEvents:"none",overflow:"hidden"}}>#{selectedPlayer.jersey}</div>}
          <div style={{position:"relative",padding:mob?"20px":"28px 32px"}}>
            <div style={{display:"flex",gap:mob?16:24,alignItems:"flex-start",flexWrap:"wrap"}}>
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{position:"absolute",inset:-4,borderRadius:20,background:`conic-gradient(${accentColor},${accentColor}88,transparent,${accentColor}88,${accentColor})`,animation:"spin 4s linear infinite",opacity:.6}}/>
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                <div style={{position:"relative",width:mob?88:110,height:mob?88:110,borderRadius:16,overflow:"hidden",background:"#0F172A",border:`2px solid ${accentColor}`,flexShrink:0}}>
                  <RobloxAvatar userId={robloxId} size={mob?88:110} radius={14} sport={sportKey}/>
                </div>
                {selectedPlayer.ovr&&<div style={{position:"absolute",bottom:-8,left:"50%",transform:"translateX(-50%)",padding:"3px 10px",borderRadius:8,background:ovrColor(selectedPlayer.ovr),fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:900,color:"#030712",whiteSpace:"nowrap",boxShadow:`0 4px 12px ${ovrColor(selectedPlayer.ovr)}99`}}>{selectedPlayer.ovr} OVR</div>}
              </div>
              <div style={{flex:1,minWidth:0,paddingTop:4}}>
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:6}}>
                  <span style={{padding:"3px 10px",borderRadius:8,background:`${accentColor}25`,border:`1px solid ${accentColor}50`,fontSize:10,color:accentColor,fontWeight:900,fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em"}}>{selectedPlayer.position}</span>
                  {selectedPlayer.jersey&&<span style={{fontSize:11,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>#{selectedPlayer.jersey}</span>}
                  {selectedPlayer.team&&<span style={{fontSize:10,color:"#334155",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{selectedPlayer.team}</span>}
                </div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:32,fontWeight:900,color:"#F1F5F9",lineHeight:1.05,marginBottom:14,letterSpacing:"-.01em"}}>{selectedPlayer.name}</div>
                {snap.length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
                  {snap.map(([k,v])=>{
                    const sc=statGlow(k,v);
                    return(
                      <div key={k} style={{textAlign:"center",padding:"8px 16px",borderRadius:12,background:`rgba(0,0,0,.4)`,border:`1px solid ${sc||accentColor}30`,backdropFilter:"blur(8px)"}}>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:sc||"#E2E8F0",lineHeight:1}}>{v}</div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:sc||"#475569",marginTop:3,letterSpacing:".1em"}}>{k}</div>
                      </div>
                    );
                  })}
                </div>}
                {(spotifyEmbed||songTrack?.url)&&(
                  <div style={{marginBottom:10,maxWidth:340}}>
                    <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginBottom:5}}>🎵 WALK-UP SONG</div>
                    {spotifyEmbed
                      ?<iframe src={spotifyEmbed} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{borderRadius:10,border:"none"}}/>
                      :<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(0,0,0,.4)",borderRadius:10,border:"1px solid rgba(255,255,255,.08)"}}>
                        {songTrack.thumbnail&&<img src={songTrack.thumbnail} style={{width:32,height:32,borderRadius:4,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>}
                        <div style={{minWidth:0}}>
                          <div style={{fontSize:11,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{songTrack.title||"Now Playing…"}</div>
                        </div>
                      </div>}
                  </div>
                )}
                {member&&<button onClick={()=>navigate("profile",member.id)} style={{padding:"6px 16px",borderRadius:10,background:`${accentColor}18`,border:`1px solid ${accentColor}40`,color:accentColor,fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".06em"}}>VIEW NOVA PROFILE →</button>}
              </div>
            </div>
          </div>
        </div>
        {playerClips.length>0&&(
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:3,height:14,borderRadius:2,background:accentColor}}/>
              <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:accentColor,letterSpacing:".14em",fontWeight:700}}>HIGHLIGHTS</span>
              <span style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>{playerClips.length} clip{playerClips.length!==1?"s":""}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
              {playerClips.map(clip=>(
                <div key={clip.id} style={{borderRadius:14,overflow:"hidden",border:`1px solid ${accentColor}25`,background:"#030712",boxShadow:`0 4px 20px ${accentColor}10`}}>
                  <video src={clip.url} controls style={{width:"100%",aspectRatio:"16/9",objectFit:"cover",background:"#000",display:"block"}}/>
                  <div style={{padding:"6px 12px",fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>{new Date(clip.ts).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:3,height:14,borderRadius:2,background:accentColor}}/>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:accentColor,letterSpacing:".14em",fontWeight:700}}>STATS</span>
          </div>
          <div style={{display:"flex",gap:5}}>
            {[["season","📅 Season"],["career","🏆 Career"]].map(([t,l])=>(
              <button key={t} onClick={()=>setStatsView(t)}
                style={{padding:"5px 14px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
                  border:`1px solid ${statsView===t?accentColor+"80":"rgba(255,255,255,.08)"}`,
                  background:statsView===t?accentColor+"18":"rgba(255,255,255,.03)",
                  color:statsView===t?accentColor:"#475569",transition:"all .2s"}}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {CATS.map(cat=><StatTable key={cat.key} cat={cat} type={statsView}/>)}
        {!hasAnyStats(statsView)&&(
          <div style={{textAlign:"center",padding:"40px 20px",color:"#1E293B",fontFamily:"'Orbitron',sans-serif",fontSize:12,border:"1px dashed rgba(255,255,255,.06)",borderRadius:16}}>
            <div style={{fontSize:32,marginBottom:8,opacity:.3}}>{isBasketball?"🏀":isBaseball?"⚾":"🏈"}</div>
            No {statsView} stats recorded yet
          </div>
        )}
      </div>
    );
  }

  const filtered=players.filter(Boolean).filter(p=>!searchQ||p.name?.toLowerCase().includes(searchQ.toLowerCase()));

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍 Search…"
          style={{flex:1,minWidth:120,padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",color:"#E2E8F0",fontSize:12,outline:"none"}}/>
        <div style={{display:"flex",gap:5}}>
          {[["cards","🃏"],["leaderboard","📊"]].map(([m,l])=>(
            <button key={m} onClick={()=>{setListMode(m);if(m==="leaderboard"&&!lbField)setLbField(LB_CATS[0].key);}}
              style={{padding:"7px 12px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:12,
                border:`1px solid ${listMode===m?accentColor+"80":"rgba(255,255,255,.08)"}`,
                background:listMode===m?accentColor+"18":"rgba(255,255,255,.03)",
                color:listMode===m?accentColor:"#475569",transition:"all .2s"}}>{l}</button>
          ))}
        </div>
        <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",padding:"0 6px"}}>{filtered.length} PLAYERS</div>
      </div>

      {!players.length&&<Empty icon={isBasketball?"🏀":isBaseball?"⚾":"🏈"} msg="No players yet"/>}

      {listMode==="cards"&&(
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
          {filtered.map((p,i)=>{
            const member=matchMember(p);
            const robloxId=p.roblox_id||member?.social_roblox||"";
            const ovrC=ovrColor(p.ovr);
            const sKey=isBasketball?"scoring_stats_season":isBaseball?"hitting_stats_season":"passing_stats_season";
            const sData=p[sKey]||{};
            const cardStats=isBasketball?[["PTS",sData.PTS],["REB",sData.REB],["AST",sData.AST]]:isBaseball?[["AVG",sData.AVG],["HR",sData.HR],["RBI",sData.RBI]]:[["YDS",sData.YDS],["TD",sData.TD],["RTG",sData.RTG]];
            const hasStats=cardStats.some(([,v])=>v!==undefined&&v!=="");
            const rushSData=(p["rushing_stats_season"]||{});
            const recSData=(p["receiving_stats_season"]||{});
            const altStats=p.position==="RB"?[["YDS",rushSData.YDS],["TD",rushSData.TD],["AVG",rushSData.AVG]]:["WR","TE"].includes(p.position)?[["REC",recSData.REC],["YDS",recSData.YDS],["TD",recSData.TD]]:null;
            const displayStats=(!isBaseball&&!isBasketball&&altStats&&altStats.some(([,v])=>v!==undefined&&v!==""))?altStats:cardStats;

            return(
              <div key={i} onClick={()=>setSel(p.id)}
                style={{borderRadius:18,overflow:"hidden",background:"#050B1A",border:`1px solid ${accentColor}22`,cursor:"pointer",transition:"all .22s",position:"relative"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 12px 40px ${accentColor}28`;e.currentTarget.style.borderColor=`${accentColor}60`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";e.currentTarget.style.borderColor=`${accentColor}22`;}}>
                <div style={{height:mob?70:80,background:`linear-gradient(135deg,${accentColor}40,${accentColor}10,transparent)`,position:"relative"}}>
                  {p.jersey&&<div style={{position:"absolute",right:8,top:-4,fontFamily:"'Orbitron',sans-serif",fontSize:60,fontWeight:900,color:accentColor,opacity:.1,lineHeight:1,userSelect:"none"}}>#{p.jersey}</div>}
                  <div style={{position:"absolute",top:10,left:12,padding:"3px 9px",borderRadius:8,background:`${accentColor}30`,border:`1px solid ${accentColor}50`,fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:900,color:accentColor,letterSpacing:".08em"}}>{p.position}</div>
                  {p.ovr&&<div style={{position:"absolute",top:10,right:12,padding:"3px 9px",borderRadius:8,background:ovrC,fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:900,color:"#030712",boxShadow:`0 2px 8px ${ovrC}66`}}>{p.ovr}</div>
                </div>
                <div style={{padding:mob?"0 12px 12px":"0 16px 16px",marginTop:-(mob?34:40)}}>
                  <div style={{display:"flex",alignItems:"flex-end",gap:10,marginBottom:10}}>
                    <div style={{width:mob?56:68,height:mob?56:68,borderRadius:14,overflow:"hidden",border:`3px solid #050B1A`,boxShadow:`0 0 0 2px ${accentColor}60`,flexShrink:0,background:"#0F172A"}}>
                      <RobloxAvatar userId={robloxId} size={mob?56:68} radius={11} sport={sportKey}/>
                    </div>
                    <div style={{flex:1,minWidth:0,paddingBottom:4}}>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?11:13,fontWeight:900,color:"#F1F5F9",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:".01em"}}>{p.name}</div>
                      {p.team&&<div style={{fontSize:9,color:"#334155",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.team}</div>}
                      {p.clips?.length>0&&<div style={{fontSize:8,color:accentColor,marginTop:2,fontFamily:"'Orbitron',sans-serif"}}>🎬 {p.clips.length}</div>}
                    </div>
                  </div>
                  {hasStats&&(
                    <div style={{display:"grid",gridTemplateColumns:`repeat(${displayStats.filter(([,v])=>v!==undefined&&v!=="").length},1fr)`,gap:4,borderTop:`1px solid ${accentColor}18`,paddingTop:10}}>
                      {displayStats.map(([label,val])=>val!==undefined&&val!==""?(
                        <div key={label} style={{textAlign:"center",padding:"5px 2px",borderRadius:8,background:`${accentColor}0d`}}>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?12:14,fontWeight:900,color:statGlow(label,val)||"#E2E8F0"}}>{val}</div>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:7,color:accentColor,letterSpacing:".06em",marginTop:1}}>{label}</div>
                        </div>
                      ):null)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {listMode==="leaderboard"&&(
        <div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
            {LB_CATS.map(cat=>(
              <button key={cat.key} onClick={()=>{setLbField(cat.key);setSortCol(null);}}
                style={{padding:"5px 12px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
                  border:`1px solid ${lbField===cat.key?accentColor+"80":"rgba(255,255,255,.08)"}`,
                  background:lbField===cat.key?accentColor+"18":"rgba(255,255,255,.03)",
                  color:lbField===cat.key?accentColor:"#475569",transition:"all .18s"}}>{cat.label}</button>
            ))}
          </div>
          <div style={{overflowX:"auto",borderRadius:14,border:`1px solid ${accentColor}20`,background:"#030712"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:500}}>
              <thead>
                <tr style={{background:`${accentColor}10`,borderBottom:`1px solid ${accentColor}20`}}>
                  <th style={{padding:"12px 16px",textAlign:"left",fontFamily:"'Orbitron',sans-serif",fontSize:8,color:accentColor,fontWeight:700,letterSpacing:".12em",whiteSpace:"nowrap"}}>PLAYER</th>
                  <th style={{padding:"12px 8px",textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:8,color:"#475569",fontWeight:700}}>POS</th>
                  <th style={{padding:"12px 8px",textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:8,color:"#475569",fontWeight:700}}>OVR</th>
                  {lbCols.map(col=>(
                    <th key={col} onClick={()=>handleSort(col)}
                      style={{padding:"12px 8px",textAlign:"center",cursor:"pointer",whiteSpace:"nowrap",
                        fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:700,letterSpacing:".08em",
                        color:sortCol===col?accentColor:"#475569",
                        background:sortCol===col?`${accentColor}15`:"transparent",
                        transition:"all .15s",userSelect:"none"}}>
                      {col}{sortCol===col?(sortDir==="desc"?" ↓":" ↑"):""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((p,i)=>{
                  const stats=(p[lbCat?.key]||{});
                  const member=matchMember(p);
                  const robloxId=p.roblox_id||member?.social_roblox||"";
                  const isTop3=i<3;
                  const medals=["🥇","🥈","🥉"];
                  return(
                    <tr key={p.id} onClick={()=>setSel(p.id)}
                      style={{borderBottom:`1px solid ${accentColor}10`,cursor:"pointer",transition:"background .15s",background:isTop3?`${accentColor}08`:"transparent"}}
                      onMouseEnter={e=>e.currentTarget.style.background=`${accentColor}14`}
                      onMouseLeave={e=>e.currentTarget.style.background=isTop3?`${accentColor}08`:"transparent"}>
                      <td style={{padding:"10px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:isTop3?14:9,minWidth:18,textAlign:"center",fontFamily:"'Orbitron',sans-serif",color:"#334155"}}>{isTop3?medals[i]:i+1}</span>
                          <div style={{width:32,height:32,borderRadius:8,overflow:"hidden",border:`1px solid ${accentColor}30`,flexShrink:0,background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <RobloxAvatar userId={robloxId} size={32} radius={7} sport={sportKey}/>
                          </div>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:110}}>{p.name}</div>
                        </div>
                      </td>
                      <td style={{padding:"10px 8px",textAlign:"center",fontSize:10,color:accentColor,fontWeight:700,fontFamily:"'Orbitron',sans-serif"}}>{p.position}</td>
                      <td style={{padding:"10px 8px",textAlign:"center"}}>
                        {p.ovr?<span style={{padding:"2px 7px",borderRadius:6,background:ovrColor(p.ovr)+"25",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:900,color:ovrColor(p.ovr)}}>{p.ovr}</span>:<span style={{color:"#1E293B"}}>—</span>}
                      </td>
                      {lbCols.map(col=>{
                        const val=stats[col];const sc=val!==undefined&&val!==""?statGlow(col,val):null;
                        return(
                          <td key={col} style={{padding:"10px 8px",textAlign:"center",fontSize:12,fontWeight:sortCol===col?900:500,color:sc||(sortCol===col?"#E2E8F0":"#64748B")}}>{val??"—"}</td>
                        );
                      })}
                    </tr>
                  );
                })}
                {sortedPlayers.length===0&&<tr><td colSpan={3+lbCols.length} style={{textAlign:"center",padding:"30px",color:"#1E293B",fontSize:12,fontFamily:"'Orbitron',sans-serif"}}>No player data yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared Components (AddLeaguePlayer, PostFeedForm, etc.) ─────────────────
export function AddLeaguePlayer({league,onAdd,cu,sport="",leagueTeams=[]}){
  const[name,setName]=useState("");
  const[positions_sel,setPositionsSel]=useState([]);
  const[team,setTeam]=useState("");
  const[jersey,setJersey]=useState("");
  const[saving,setSaving]=useState(false);
  const isBaseball=league==="nbbl";
  const isBasketball=league==="ringrush";
  const baseballPos=["P","C","1B","2B","3B","SS","LF","CF","RF","DH","SP","RP"];
  const footballPos=["QB","RB","WR","TE","K","DEF","OL","DL","LB","CB","S"];
  const basketballPos=["Top","Corner"];
  const positions=isBasketball||sport==="basketball"?basketballPos:isBaseball?baseballPos:footballPos;
  const ac=isBasketball||sport==="basketball"?"#EC4899":isBaseball?"#22C55E":"#F59E0B";
  const togglePos=(pos)=>setPositionsSel(prev=>prev.includes(pos)?prev.filter(x=>x!==pos):[...prev,pos]);
  const submit=async()=>{
    if(!name.trim()||!positions_sel.length)return;
    setSaving(true);
    const player={id:gid(),name:name.trim(),position:positions_sel.join("/"),team:team.trim(),jersey:jersey.trim(),added_by:cu?.id,ts:Date.now()};
    await sb.post(`nova_${league}_players`,player);
    onAdd(player);setName("");setPositionsSel([]);setTeam("");setJersey("");setSaving(false);
  };
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div style={{gridColumn:"1/-1"}}><Lbl>Player Name</Lbl><input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name…"/></div>
      <div style={{gridColumn:"1/-1"}}>
        <Lbl>Position(s) — select all that apply</Lbl>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:4}}>
          {positions.map(pos=>{
            const sel=positions_sel.includes(pos);
            return(
              <button key={pos} type="button" onClick={()=>togglePos(pos)}
                style={{padding:"4px 10px",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
                  border:`1px solid ${sel?ac+"88":"rgba(255,255,255,.1)"}`,
                  background:sel?ac+"22":"rgba(255,255,255,.03)",
                  color:sel?ac:"#64748B",transition:"all .15s"}}>
                {pos}
              </button>
            );
          })}
        </div>
        {positions_sel.length>0&&<div style={{fontSize:9,color:ac,marginTop:5,fontFamily:"'Orbitron',sans-serif"}}>Selected: {positions_sel.join(" / ")}</div>}
      </div>
      <div>
        <Lbl>Team</Lbl>
        {leagueTeams.length>0
          ?<select value={team} onChange={e=>setTeam(e.target.value)} style={{width:"100%"}}>
              <option value="">— Free Agent —</option>
              {leagueTeams.map(t=><option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          :<input value={team} onChange={e=>setTeam(e.target.value)} placeholder="Team name…"/>}
      </div>
      <div><Lbl>Jersey #</Lbl><input value={jersey} onChange={e=>setJersey(e.target.value)} placeholder="#"/></div>
      <div style={{gridColumn:"1/-1"}}><Btn onClick={submit} disabled={saving||!name.trim()||!positions_sel.length}>{saving?"Adding…":"➕ Add Player"}</Btn></div>
    </div>
  );
}

export function PostFeedForm({league,onPost,cu}){
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

// ─── MessagesPage ───────────────────────────────────────────────────────────
export function MessagesPage({cu,users,conversations,setConversations,messages,setMessages}){
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
                <button onClick={()=>{setInWatchParty(false);setInCall(v=>!v);}} title="Voice Call" style={{background:inCall?"rgba(34,197,94,.2)":"rgba(255,255,255,.05)",border:`1px solid ${inCall?"rgba(34,197,94,.4)":"rgba(255,255,255,.1)"}`,borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:inCall?"#22C55E":"#94A3B8"}}>📞</button>
                <button onClick={()=>{setInCall(false);setInWatchParty(v=>!v);}} title="Watch Party" style={{background:inWatchParty?"rgba(139,92,246,.2)":"rgba(255,255,255,.05)",border:`1px solid ${inWatchParty?"rgba(139,92,246,.4)":"rgba(255,255,255,.1)"}`,borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:inWatchParty?"#8B5CF6":"#94A3B8"}}>🎬</button>
              </div>
              {inCall&&cu&&activeConv&&(
                <div style={{borderBottom:"1px solid rgba(34,197,94,.2)",flexShrink:0}}>
                  <VoiceCall cu={cu} conv={activeConv} users={users} onEnd={()=>setInCall(false)}/>
                </div>
              )}
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

// ─── Placeholder VoiceCall and WatchParty (simplified) ──────────────────────
const VoiceCall = ({cu,conv,users,onEnd}) => {
  return (
    <div style={{padding:12,background:"rgba(34,197,94,.08)",borderRadius:8,margin:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:12,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}>🔴 Voice call active</div>
      <button onClick={onEnd} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer"}}>End</button>
    </div>
  );
};
const WatchParty = ({cu,conv,users,onEnd}) => {
  return (
    <div style={{position:"absolute",inset:0,background:"#000",display:"flex",flexDirection:"column",padding:16}}>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
        <div style={{fontSize:48}}>🎬</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",color:"#E2E8F0"}}>Watch Party – Coming Soon</div>
        <button onClick={onEnd} style={{padding:"8px 16px",background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,cursor:"pointer",color:"#EF4444"}}>Leave</button>
      </div>
    </div>
  );
};

// ─── LoginModal and RegisterModal ──────────────────────────────────────────
export function LoginModal({onLogin,onClose,users}){
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

export function RegisterModal({onRegister,onClose}){
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

// ─── Helper functions used but not exported ─────────────────────────────────
const fmtMsg = (ts) => new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});