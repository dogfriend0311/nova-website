import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "../shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "../components/UI";

// ─── NFFL Page (Football League) ─────────────────────────────────

// ─── LeagueTeamsTab — public Teams page + dashboard team editing ───────────────
export function LeagueTeamsTab({teams,players,accentColor,league,cu,onTeamsUpdated,isAdmin,navigate,users}){
  const mob=useIsMobile();
  const[selTeam,setSelTeam]=useState(null);
  const[editing,setEditing]=useState(null); // team being edited
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

  // Detail view for a selected team
  if(selTeam){
    const t=teams.find(x=>x.id===selTeam)||teams[0];
    if(!t)return null;
    const tp=teamPlayers(t.name);
    return(
      <div>
        <button onClick={()=>setSelTeam(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,marginBottom:16,display:"flex",alignItems:"center",gap:5}}>← ALL TEAMS</button>

        {/* Team header */}
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
            {isAdmin&&(
              <button onClick={(e)=>openEdit(t,e)} style={{padding:"8px 14px",borderRadius:10,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#94A3B8",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700}}>✏️ Edit Team</button>
            )}
          </div>
        </Card>

        {/* Team roster */}
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

  // Edit modal
  if(editing)return(
    <div>
      <button onClick={()=>setEditing(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,marginBottom:16,display:"flex",alignItems:"center",gap:5}}>← BACK</button>
      <Card style={{padding:"18px",maxWidth:480}} hover={false}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:14,fontWeight:700}}>✏️ EDIT TEAM</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Logo preview + upload */}
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

  // Team list grid
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
              {/* Team banner */}
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
              {/* Mini roster preview */}
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

// ─── NBBL Page (Baseball League) ─────────────────────────────────────────
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

// Shared: add player to league roster
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


// ─── Dashboard ─────────────────────────────────────────────────────────────────

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

  const posEmoji=(pos)=>({Top:"👑",Corner:"🔥"}[pos]||"🏀");

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"12px 10px 100px":"20px 20px 80px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <span style={{fontSize:32}}>🏀</span>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:22,fontWeight:900,color:ac,letterSpacing:".06em"}}>RING RUSH</div>
          <div style={{fontSize:11,color:"#475569"}}>Basketball League</div>
        </div>
      </div>

      {/* Tab nav */}
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

      {/* Game Feed */}
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

      {/* Roster */}
      {!loading&&tab==="teams"&&(
        <LeagueTeamsTab teams={teams} players={players} accentColor={ac} league="ringrush" cu={cu} onTeamsUpdated={setTeams} isAdmin={isAdmin} navigate={navigate} users={users}/>
      )}

      {/* Stats */}
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

      {/* Players */}
      {!loading&&tab==="players"&&(
        <LeaguePlayersPage players={players} league="ringrush" accentColor={ac} users={users} navigate={navigate}/>
      )}
    </div>
  );
}



export function LeaguePlayersPage({players,league,accentColor,users,navigate}){
  const mob=useIsMobile();
  const[sel,setSel]=useState(null);
  const[statsView,setStatsView]=useState("season");
  const[playerClips,setPlayerClips]=useState([]);
  const[clipsLoaded,setClipsLoaded]=useState({});
  const[listMode,setListMode]=useState("cards"); // "cards" | "leaderboard"
  const[sortCol,setSortCol]=useState(null);
  const[sortDir,setSortDir]=useState("desc");
  const[lbField,setLbField]=useState(null);
  const isBaseball=league==="nbbl";
  const isBasketball=league==="ringrush";
  const selectedPlayer=sel?players.find(p=>p.id===sel):null;

  useEffect(()=>{
    if(!sel||clipsLoaded[sel])return;
    sb.get(`nova_${league}_clips`,`?player_id=eq.${sel}&order=ts.desc`).then(r=>{
      setPlayerClips(r||[]);
      setClipsLoaded(prev=>({...prev,[sel]:true}));
    });
  },[sel]);

  const cuSess=getSess();
  const canEditClips=cuSess?.is_owner||["Co-owner","2v2FF Admin","Basketball League Admin"].includes(cuSess?.staff_role);

  // Match a league player to a Nova member — prefer explicit link
  const matchMember=(player)=>{
    if(!player)return null;
    if(player.nova_user_id)return users.find(u=>u.id===player.nova_user_id)||null;
    const n=(player.name||"").toLowerCase();
    return users.find(u=>
      (u.display_name||"").toLowerCase().includes(n)||
      n.includes((u.display_name||"").toLowerCase())||
      (u.username||"").toLowerCase()===n
    )||null;
  };

  if(sel&&selectedPlayer){
    const member=matchMember(selectedPlayer);
    const robloxId=selectedPlayer.roblox_id||member?.social_roblox||"";
    const robloxAvatarUrl=robloxId?`/api/roblox-avatar?userId=${robloxId}`:"";
    const favSong=member?.page_music;
    const songTrack=Array.isArray(favSong)?favSong[0]:favSong;
    // Helper to get stats for a given base key and type (season/career)
    const getStats=(baseKey,type)=>type==="season"?selectedPlayer[baseKey+"_season"]||{}:selectedPlayer[baseKey]||{};

    // All stat definitions per sport
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

    const StatTable=({cat,type})=>{
      const data=getStats(cat.key,type);
      const hasData=cat.cols.some(c=>data[c]!==undefined&&data[c]!=="");
      if(!hasData)return null;
      return(
        <Card style={{padding:"12px 14px",marginBottom:8}} hover={false}>
          <div style={{fontSize:9,color:cat.color,fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginBottom:8,fontWeight:700}}>{cat.label}</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                {cat.cols.map(c=><td key={c} style={{padding:"4px 7px",textAlign:"center",color:"#475569",fontFamily:"'Orbitron',sans-serif",fontSize:9,whiteSpace:"nowrap"}}>{c}</td>)}
              </tr></thead>
              <tbody><tr>
                {cat.cols.map(c=><td key={c} style={{padding:"6px 7px",textAlign:"center",color:"#E2E8F0",fontWeight:600,fontSize:12}}>{data[c]??"—"}</td>)}
              </tr></tbody>
            </table>
          </div>
        </Card>
      );
    };

    // statsView state is declared at component top level (below)
    // Check if any stats exist for given type
    const hasAnyStats=(type)=>CATS.some(cat=>{
      const d=getStats(cat.key,type);
      return cat.cols.some(c=>d[c]!==undefined&&d[c]!=="");
    });

    return(
      <div>
        <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12,marginBottom:16,display:"flex",alignItems:"center",gap:5,fontFamily:"'Orbitron',sans-serif"}}>← BACK</button>

        {/* Player hero card */}
        <Card style={{padding:mob?"16px":"20px 24px",marginBottom:14}} hover={false}>
          <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
            <div style={{width:mob?72:90,height:mob?72:90,borderRadius:12,overflow:"hidden",background:`linear-gradient(135deg,${accentColor}22,rgba(255,255,255,.04))`,border:`2px solid ${accentColor}44`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {robloxAvatarUrl
                ?<img src={robloxAvatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                :<div style={{fontSize:36}}>{isBasketball?"🏀":isBaseball?"⚾":"🏈"}</div>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:20,fontWeight:900,color:"#E2E8F0",marginBottom:4}}>{selectedPlayer.name}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:11,color:accentColor,fontWeight:700,fontFamily:"'Orbitron',sans-serif"}}>{selectedPlayer.position}</span>
                {selectedPlayer.team&&<span style={{fontSize:11,color:"#64748B"}}>· {selectedPlayer.team}</span>}
                {selectedPlayer.jersey&&<span style={{fontSize:11,color:"#475569"}}>· #{selectedPlayer.jersey}</span>}
                {selectedPlayer.ovr&&<OVRBig ovr={selectedPlayer.ovr} size={32}/>}
              </div>
              {selectedPlayer.spotify_url&&(()=>{
                const m2=selectedPlayer.spotify_url.match(/spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
                const embedUrl=m2?`https://open.spotify.com/embed/${m2[1]}/${m2[2]}?utm_source=generator&theme=0`:"";
                return embedUrl?(
                  <div style={{marginTop:8,maxWidth:320}}>
                    <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".08em",marginBottom:4}}>🎵 WALK-UP SONG</div>
                    <iframe src={embedUrl} width="100%" height="80" frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy" style={{borderRadius:10,border:"none"}}/>
                  </div>
                ):null;
              })()}
              {!selectedPlayer.spotify_url&&songTrack?.url&&(
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(255,255,255,.04)",borderRadius:8,border:"1px solid rgba(255,255,255,.07)",marginTop:4,maxWidth:280}}>
                  {songTrack.thumbnail&&<img src={songTrack.thumbnail} style={{width:28,height:28,borderRadius:4,objectFit:"cover",flexShrink:0}} onError={e=>e.target.style.display="none"}/>}
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".08em"}}>🎵 ANTHEM</div>
                    <div style={{fontSize:10,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{songTrack.title||"Playing…"}</div>
                  </div>
                </div>
              )}
              {member&&<button onClick={()=>navigate("profile",member.id)} style={{marginTop:8,padding:"4px 12px",borderRadius:8,background:`${accentColor}18`,border:`1px solid ${accentColor}44`,color:accentColor,fontSize:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>View Nova Profile →</button>}
            </div>
          </div>
        </Card>

        {/* Stats section with Season/Career toggle */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em"}}>STATS</div>
          <div style={{display:"flex",gap:5}}>
            {[["season","📅 Season"],["career","🏆 Career"]].map(([t,l])=>(
              <button key={t} onClick={()=>setStatsView(t)}
                style={{padding:"5px 12px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
                  border:`1px solid ${statsView===t?accentColor+"66":"rgba(255,255,255,.08)"}`,
                  background:statsView===t?accentColor+"18":"rgba(255,255,255,.03)",
                  color:statsView===t?accentColor:"#475569"}}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {CATS.map(cat=><StatTable key={cat.key} cat={cat} type={statsView}/>)}
        {!hasAnyStats(statsView)&&(
          <div style={{textAlign:"center",padding:"30px 0",color:"#334155",fontSize:12,fontFamily:"'Orbitron',sans-serif"}}>
            No {statsView} stats recorded yet
            {statsView==="season"&&hasAnyStats("career")&&<div style={{marginTop:6,fontSize:10}}>Switch to Career to see stats</div>}
          </div>
        )}

        {/* Clips */}
        <div style={{marginTop:20,borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:16}}>
          <ClipsSection
            clips={playerClips}
            setClips={setPlayerClips}
            league={league}
            playerId={selectedPlayer.id}
            playerName={selectedPlayer.name}
            canPost={canEditClips}
          />
        </div>
      </div>
    );
  }

  // Sortable leaderboard helpers
  const MLB_LB_CATS=[
    {key:"hitting_stats_season",label:"⚾ Hitting",cols:["G","AB","H","HR","RBI","BB","SO","AVG","OBP","SLG","OPS"]},
    {key:"pitching_stats_season",label:"⚾ Pitching",cols:["G","W","L","SV","IP","ER","BB","SO","ERA","WHIP"]},
  ];
  const NFL_LB_CATS=[
    {key:"passing_stats_season",label:"🎯 Passing",cols:["G","CMP","ATT","YDS","TD","INT","RTG"]},
    {key:"rushing_stats_season",label:"🏃 Rushing",cols:["G","CAR","YDS","TD","AVG"]},
    {key:"receiving_stats_season",label:"📡 Receiving",cols:["G","REC","YDS","TD","AVG"]},
    {key:"defensive_stats_season",label:"🛡 Defense",cols:["G","TCK","SACK","INT","FF","PD"]},
  ];
  const NBA_LB_CATS=[
    {key:"scoring_stats_season",label:"🏀 Scoring",cols:["G","MIN","PTS","FG%","3PM","3P%","FTM","FT%"]},
    {key:"rebounds_stats_season",label:"💪 Rebounds",cols:["G","OREB","DREB","REB","REB/G"]},
    {key:"playmaking_stats_season",label:"🎯 Playmaking",cols:["G","AST","TOV","AST/G"]},
    {key:"defense_stats_season",label:"🛡 Defense",cols:["G","STL","BLK","STL/G","BLK/G"]},
  ];
  const LB_CATS=isBasketball?NBA_LB_CATS:isBaseball?MLB_LB_CATS:NFL_LB_CATS;
  const activeLbCat=lbField?LB_CATS.find(c=>c.key===lbField):LB_CATS[0];
  const lbCols=activeLbCat?.cols||[];
  const lbKey=activeLbCat?.key||LB_CATS[0]?.key;
  const sortedPlayers=[...players.filter(Boolean)].sort((a,b)=>{
    if(!sortCol)return 0;
    const aVal=parseFloat(((a[lbKey]||{})[sortCol])||"0")||0;
    const bVal=parseFloat(((b[lbKey]||{})[sortCol])||"0")||0;
    return sortDir==="desc"?bVal-aVal:aVal-bVal;
  });
  const handleSort=(col)=>{
    if(sortCol===col)setSortDir(d=>d==="desc"?"asc":"desc");
    else{setSortCol(col);setSortDir("desc");}
  };

  // Player list view
  return(
    <div>
      {/* View mode toolbar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em"}}>{players.length} PLAYERS</div>
        <div style={{display:"flex",gap:5}}>
          {[["cards","🃏 Cards"],["leaderboard","📊 Stats Table"]].map(([m,l])=>(
            <button key={m} onClick={()=>{setListMode(m);if(m==="leaderboard"&&!lbField)setLbField(LB_CATS[0]?.key);}}
              style={{padding:"5px 12px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
                border:`1px solid ${listMode===m?accentColor+"66":"rgba(255,255,255,.08)"}`,
                background:listMode===m?accentColor+"18":"rgba(255,255,255,.03)",
                color:listMode===m?accentColor:"#475569",transition:"all .2s"}}>{l}</button>
          ))}
        </div>
      </div>

      {!players.length&&<Empty icon={isBasketball?"🏀":isBaseball?"⚾":"🏈"} msg="No players yet"/>}

      {listMode==="cards"&&(
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
          {players.filter(Boolean).map((p,i)=>{
            const member=matchMember(p);
            const robloxId=p.roblox_id||member?.social_roblox||"";
            const robloxAvatarUrl=robloxId?`/api/roblox-avatar?userId=${robloxId}`:"";
            return(
              <div key={i} onClick={()=>setSel(p.id)}
                style={{background:"rgba(255,255,255,.03)",border:`1px solid ${accentColor}22`,borderRadius:12,padding:"14px",cursor:"pointer",transition:"all .18s",display:"flex",gap:12,alignItems:"center"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=accentColor+"66";e.currentTarget.style.background=`${accentColor}0a`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=`${accentColor}22`;e.currentTarget.style.background="rgba(255,255,255,.03)";}}>
                <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",background:`${accentColor}18`,border:`1px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {robloxAvatarUrl
                    ?<img src={robloxAvatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";e.target.parentNode.innerHTML=isBaseball?"⚾":"🏈";}}/>
                    :<span style={{fontSize:20}}>{isBasketball?"🏀":isBaseball?"⚾":"🏈"}</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{fontSize:10,color:accentColor,fontWeight:600}}>{p.position}{p.jersey?` · #${p.jersey}`:""}</div>
                    {p.ovr&&<div style={{padding:"1px 6px",borderRadius:6,background:ovrColor(p.ovr)+"20",border:`1px solid ${ovrColor(p.ovr)}44`,fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,color:ovrColor(p.ovr)}}>{p.ovr}</div>}
                  </div>
                  {p.team&&<div style={{fontSize:9,color:"#475569"}}>{p.team}</div>}
                </div>
                <span style={{color:"#334155",fontSize:12}}>›</span>
              </div>
            );
          })}
        </div>
      )}

      {listMode==="leaderboard"&&(
        <div>
          {/* Category picker */}
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
            {LB_CATS.map(cat=>(
              <button key={cat.key} onClick={()=>{setLbField(cat.key);setSortCol(null);}}
                style={{padding:"5px 12px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
                  border:`1px solid ${lbKey===cat.key?accentColor+"66":"rgba(255,255,255,.08)"}`,
                  background:lbKey===cat.key?accentColor+"18":"rgba(255,255,255,.03)",
                  color:lbKey===cat.key?accentColor:"#475569",transition:"all .18s"}}>{cat.label}</button>
            ))}
          </div>
          <div style={{overflowX:"auto",borderRadius:12,border:"1px solid rgba(255,255,255,.07)"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:500}}>
              <thead>
                <tr style={{background:"rgba(255,255,255,.04)",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                  <th style={{padding:"10px 14px",textAlign:"left",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",fontWeight:700,letterSpacing:".1em",whiteSpace:"nowrap"}}>PLAYER</th>
                  <th style={{padding:"10px 8px",textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",fontWeight:700,whiteSpace:"nowrap"}}>POS</th>
                  <th style={{padding:"10px 8px",textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",fontWeight:700,whiteSpace:"nowrap"}}>OVR</th>
                  {lbCols.map(col=>(
                    <th key={col} onClick={()=>handleSort(col)}
                      style={{padding:"10px 8px",textAlign:"center",cursor:"pointer",whiteSpace:"nowrap",
                        fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,letterSpacing:".06em",
                        color:sortCol===col?accentColor:"#475569",
                        background:sortCol===col?accentColor+"12":"transparent",
                        transition:"all .15s",userSelect:"none"}}>
                      {col}{sortCol===col?(sortDir==="desc"?" ↓":" ↑"):""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((p,i)=>{
                  const stats=(p[lbKey]||{});
                  const member=matchMember(p);
                  const robloxId=p.roblox_id||member?.social_roblox||"";
                  return(
                    <tr key={p.id} onClick={()=>setSel(p.id)}
                      style={{borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",transition:"background .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background=`${accentColor}0a`}
                      onMouseLeave={e=>e.currentTarget.style.background=""}>
                      <td style={{padding:"10px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:10,color:"#334155",fontFamily:"'Orbitron',sans-serif",minWidth:16,textAlign:"right"}}>{i+1}</span>
                          <div style={{width:28,height:28,borderRadius:6,overflow:"hidden",background:`${accentColor}18`,border:`1px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {robloxId?<img src={`/api/roblox-avatar?userId=${robloxId}`} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:<span style={{fontSize:12}}>{isBasketball?"🏀":isBaseball?"⚾":"🏈"}</span>}
                          </div>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>{p.name}</div>
                        </div>
                      </td>
                      <td style={{padding:"10px 8px",textAlign:"center",fontSize:10,color:accentColor,fontWeight:600}}>{p.position}</td>
                      <td style={{padding:"10px 8px",textAlign:"center"}}>
                        {p.ovr?<span style={{padding:"2px 6px",borderRadius:5,background:ovrColor(p.ovr)+"20",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,color:ovrColor(p.ovr)}}>{p.ovr}</span>:<span style={{color:"#334155"}}>—</span>}
                      </td>
                      {lbCols.map(col=>(
                        <td key={col} style={{padding:"10px 8px",textAlign:"center",fontSize:11,fontWeight:sortCol===col?700:400,color:sortCol===col?"#E2E8F0":"#94A3B8"}}>{stats[col]??"—"}</td>
                      ))}
                    </tr>
                  );
                })}
                {sortedPlayers.length===0&&<tr><td colSpan={3+lbCols.length} style={{textAlign:"center",padding:"30px",color:"#334155",fontSize:12}}>No player data yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

