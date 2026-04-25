import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "./shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig, RobloxAvatar } from "./UI";
import { LeaguePlayersPage } from "./LeaguePage";

// ----------------------------------------------------------------------
// DashboardLeague Components
// ----------------------------------------------------------------------

export function DashRatingsTab({league,accentColor,label}){
  const mob=useIsMobile();
  const[players,setPlayers]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[saving,setSaving]=useState({});
  const[editVals,setEditVals]=useState({});
  useEffect(()=>{
    if(loaded)return;
    sb.get(`nova_${league}_players`,"?order=name.asc").then(r=>{
      const p=r||[];
      setPlayers(p);
      const ev={};
      p.forEach(x=>{if(x?.id)ev[x.id]=x.ovr||70;});
      setEditVals(ev);
      setLoaded(true);
    });
  },[]);
  const updateOvr=async(player,newOvr)=>{
    const val=Math.max(40,Math.min(99,parseInt(newOvr)||70));
    setSaving(p=>({...p,[player.id]:true}));
    await sb.patch(`nova_${league}_players`,`?id=eq.${player.id}`,{ovr:val});
    setPlayers(p=>p.map(x=>x.id===player.id?{...x,ovr:val}:x));
    setEditVals(p=>({...p,[player.id]:val}));
    setTimeout(()=>setSaving(p=>({...p,[player.id]:false})),1200);
  };
  return(
    <div style={{marginBottom:20}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,letterSpacing:".12em",marginBottom:4,fontWeight:700}}>{label} PLAYER RATINGS</div>
      <div style={{fontSize:10,color:"#334155",marginBottom:12}}>Edit any player's OVR — 40 min, 99 max. Color updates live.</div>
      {!players.length&&!loaded&&<div style={{color:"#334155",fontSize:11,padding:"20px 0"}}>Loading players...</div>}
      {!players.length&&loaded&&<div style={{color:"#334155",fontSize:11,padding:"20px 0"}}>No players added yet</div>}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {players.filter(Boolean).map((p,i)=>{
          const currentOvr=editVals[p.id]||p.ovr||70;
          return(
            <div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
              <OVRBig ovr={currentOvr}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{p.name}</div>
                <div style={{fontSize:10,color:accentColor}}>{p.position}{p.team?` · ${p.team}`:""}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <input type="number" min="40" max="99" value={editVals[p.id]||70}
                  onChange={e=>setEditVals(prev=>({...prev,[p.id]:e.target.value}))}
                  onBlur={e=>updateOvr(p,e.target.value)}
                  style={{width:64,textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:14,color:ovrColor(parseInt(editVals[p.id])||70)}}
                />
                <div style={{width:14,textAlign:"center"}}>{saving[p.id]&&<span style={{fontSize:14,color:"#22C55E"}}>✓</span>}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashGMOvrTab({cu}){
  const mob=useIsMobile();
  const[gmSave,setGmSave]=useState(null);
  const[editVals,setEditVals]=useState({});
  const[saving,setSaving]=useState({});
  const[loaded,setLoaded]=useState(false);
  const[error,setError]=useState("");
  const[searchTeam,setSearchTeam]=useState("");
  const[searchSport,setSearchSport]=useState("mlb");
  const[loadingTeam,setLoadingTeam]=useState(false);
  const[extraRosters,setExtraRosters]=useState({});
  const[activeKey,setActiveKey]=useState("my_save");
  const MY_KEY=`gm2_${cu?.id||"g"}`;

  const GM_SPORTS=[
    {id:"mlb",label:"MLB",icon:"⚾",color:"#22C55E",espnPath:"baseball/mlb"},
    {id:"nfl",label:"NFL",icon:"🏈",color:"#EF4444",espnPath:"football/nfl"},
    {id:"nba",label:"NBA",icon:"🏀",color:"#F59E0B",espnPath:"basketball/nba"},
    {id:"nhl",label:"NHL",icon:"🏒",color:"#00D4FF",espnPath:"hockey/nhl"},
  ];

  const loadMySave=()=>{
    try{
      const raw=localStorage.getItem(MY_KEY);
      if(raw){
        const s=JSON.parse(raw);
        setGmSave(s);
        const ev={};
        (s.roster||[]).forEach(p=>{if(p&&p.id)ev[p.id]=String(p.ovr||70);});
        setEditVals(prev=>({...prev,...ev}));
      }
      setLoaded(true);
    }catch(e){setError(e.message);setLoaded(true);}
  };
  useEffect(()=>{loadMySave();},[]);

  const loadTeam=async()=>{
    if(!searchTeam.trim())return;
    const key=`${searchSport}_${searchTeam.trim().toLowerCase().replace(/\s+/g,"_")}`;
    if(extraRosters[key]){setActiveKey(key);return;}
    setLoadingTeam(true);setError("");
    const yr=gmSave?.year||2025;
    const aiCall=async(prompt,sys)=>{ /* placeholder - this should be imported */ return {error:"AI not available"}; };
    const result=await aiCall(`Generate the ${yr} ${searchSport.toUpperCase()} roster for "${searchTeam}". Return 20-25 real players with realistic OVR ratings. JSON array: [{id:"p_N",name,pos,age,ovr(50-99),salary(millions float),years(1-6)}]`);
    if(Array.isArray(result)&&result.length>0){
      const roster=result.map((p,i)=>({...p,id:p.id||`ext_${key}_${i}`}));
      setExtraRosters(prev=>({...prev,[key]:{roster,teamName:searchTeam,sport:searchSport,year:yr}}));
      setActiveKey(key);
      const ev={};
      roster.forEach(p=>{if(p&&p.id)ev[p.id]=String(p.ovr||70);});
      setEditVals(prev=>({...prev,...ev}));
    }else{
      setError("Could not load team — check the name and try again");
    }
    setLoadingTeam(false);
  };

  const saveOvr=(playerId,rawVal)=>{
    const val=Math.max(40,Math.min(99,parseInt(rawVal)||70));
    setSaving(p=>({...p,[playerId]:true}));
    setEditVals(p=>({...p,[playerId]:String(val)}));
    if(activeKey==="my_save"){
      try{
        const raw=localStorage.getItem(MY_KEY);
        if(raw){
          const s=JSON.parse(raw);
          s.roster=(s.roster||[]).map(p=>p&&p.id===playerId?{...p,ovr:val}:p);
          localStorage.setItem(MY_KEY,JSON.stringify(s));
          setGmSave(s);
        }
      }catch(e){console.error(e);}
    }else{
      setExtraRosters(prev=>{
        const next={...prev};
        if(next[activeKey])next[activeKey]={...next[activeKey],roster:next[activeKey].roster.map(p=>p&&p.id===playerId?{...p,ovr:val}:p)};
        return next;
      });
    }
    setTimeout(()=>setSaving(p=>({...p,[playerId]:false})),1000);
  };

  const active=activeKey==="my_save"
    ?{roster:(gmSave?.roster||[]).filter(Boolean),teamName:gmSave?.myTeam?.name||"My Team",sport:gmSave?.sport||"mlb",year:gmSave?.year||2025}
    :extraRosters[activeKey]||{roster:[],teamName:"",sport:searchSport,year:2025};
  const sc=GM_SPORTS.find(s=>s.id===active.sport);
  const ac=sc?.color||"#00D4FF";
  const tabs=[
    {key:"my_save",label:gmSave?.myTeam?.name||"My Save",icon:GM_SPORTS.find(s=>s.id===gmSave?.sport)?.icon||"🎮"},
    ...Object.entries(extraRosters).map(([k,v])=>({key:k,label:v.teamName,icon:GM_SPORTS.find(s=>s.id===v.sport)?.icon||"🏆"}))
  ];

  return(
    <div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#94A3B8",letterSpacing:".12em",marginBottom:4,fontWeight:700}}>🎮 GM — PLAYER OVR EDITOR</div>
      <div style={{fontSize:10,color:"#334155",marginBottom:14}}>Edit OVR for your team OR any other team. Tab out of the input to save.</div>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"flex-end"}}>
        <div>
          <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>SPORT</div>
          <select value={searchSport} onChange={e=>setSearchSport(e.target.value)} style={{padding:"6px 8px",borderRadius:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",fontSize:11}}>
            {GM_SPORTS.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
          </select>
        </div>
        <div style={{flex:1,minWidth:150}}>
          <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:3}}>TEAM NAME</div>
          <input value={searchTeam} onChange={e=>setSearchTeam(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadTeam()} placeholder="e.g. Los Angeles Lakers…"/>
        </div>
        <button onClick={loadTeam} disabled={loadingTeam||!searchTeam.trim()} style={{padding:"8px 14px",borderRadius:10,background:"rgba(0,212,255,.12)",border:"1px solid rgba(0,212,255,.3)",color:"#00D4FF",cursor:loadingTeam?"wait":"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700}}>{loadingTeam?"Loading…":"Load"}</button>
      </div>
      {error&&<div style={{color:"#EF4444",fontSize:10,marginBottom:10,padding:"6px 10px",borderRadius:8,background:"rgba(239,68,68,.07)"}}>{error} <button onClick={()=>setError("")} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",marginLeft:6}}>✕</button></div>}
      {tabs.length>1&&(
        <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
          {tabs.map(t=>(
            <button key={t.key} onClick={()=>setActiveKey(t.key)} style={{padding:"5px 12px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,border:`1px solid ${activeKey===t.key?ac+"66":"rgba(255,255,255,.08)"}`,background:activeKey===t.key?ac+"18":"rgba(255,255,255,.03)",color:activeKey===t.key?ac:"#475569"}}>{t.icon} {t.label}</button>
          ))}
        </div>
      )}
      {!loaded&&<div style={{color:"#334155",padding:"20px 0",textAlign:"center",fontSize:11}}>Loading…</div>}
      {loaded&&active.roster.length===0&&activeKey==="my_save"&&(
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:36,marginBottom:8}}>🎮</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,color:"#94A3B8",marginBottom:6}}>No GM Save Found</div>
          <div style={{fontSize:11,color:"#334155"}}>Play GM Mode first, or load any team above.</div>
        </div>
      )}
      {active.roster.length>0&&(
        <>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            <div style={{padding:"3px 10px",borderRadius:10,background:ac+"18",border:`1px solid ${ac}33`,fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:ac}}>{sc?.icon||"🏆"} {active.teamName}</div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif"}}>{active.roster.length} PLAYERS</div>
            {activeKey==="my_save"&&<button onClick={loadMySave} style={{padding:"3px 8px",borderRadius:8,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#475569",fontSize:9,cursor:"pointer",fontFamily:"'Orbitron',sans-serif"}}>🔄</button>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {[...active.roster].sort((a,b)=>parseInt(editVals[b.id]||b.ovr||70)-parseInt(editVals[a.id]||a.ovr||70)).map((p,i)=>{
              const ovr=parseInt(editVals[p.id]||p.ovr||70);
              return(
                <div key={p.id||i} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 12px",borderRadius:11,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
                  <OVRBig ovr={ovr}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{p.name}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:1}}>
                      <span style={{fontSize:10,color:ac}}>{p.pos}</span>
                      {p.age&&<span style={{fontSize:9,color:"#475569"}}>Age {p.age}</span>}
                      {p.salary&&<span style={{fontSize:9,color:"#334155"}}>${typeof p.salary==="number"?p.salary.toFixed(1):p.salary}M{p.years?` · ${p.years}yr`:""}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    <input type="number" min="40" max="99" value={editVals[p.id]||ovr} onChange={e=>setEditVals(prev=>({...prev,[p.id]:e.target.value}))} onBlur={e=>saveOvr(p.id,e.target.value)} style={{width:60,textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:13,color:ovrColor(ovr)}}/>
                    {saving[p.id]?<span style={{fontSize:13,color:"#22C55E"}}>✓</span>:<span style={{fontSize:9,color:"#334155"}}>OVR</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Main DashboardPage component
// ----------------------------------------------------------------------
export default function DashboardPage({cu,users,setUsers,navigate}){
  const mob=useIsMobile();
  const[sel,setSel]=useState(null);
  const[tab,setTab]=useState(cu?.staff_role==="2v2FF Admin"?"nffl_stats":"members");
  const[announce,setAnnounce]=useState("");
  const[announcements,setAnnouncements]=useState([]);
  const[announceSent,setAnnounceSent]=useState(false);
  const target=sel?users.find(u=>u.id===sel):null;
  const[starTarget,setStarTarget]=useState("");
  const[starAmount,setStarAmount]=useState("");
  const[starReason,setStarReason]=useState("");
  const[starMsg,setStarMsg]=useState(null);
  const[starBalances,setStarBalances]=useState({});
  const[starLoading,setStarLoading]=useState(false);
  const isCoOwner=cu?.staff_role==="Co-owner";
  const isRRAdmin=cu?.staff_role==="Basketball League Admin";
  const is2v2FF=cu?.staff_role==="2v2FF Admin";
  const is3v3FF=cu?.staff_role==="3v3FF";
  if(!cu?.is_owner&&!isCoOwner&&!isRRAdmin&&!is2v2FF&&!is3v3FF)return<div style={{padding:"100px 20px",textAlign:"center",color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>⛔ Access Denied</div>;

  const loadStarBalance=async(uid)=>{
    if(starBalances[uid]!==undefined)return;
    const rows=await sb.get("nova_stars",`?user_id=eq.${uid}&limit=1`);
    setStarBalances(p=>({...p,[uid]:rows?.[0]?.balance||0}));
  };

  const giveStars=async()=>{
    const amt=parseInt(starAmount);
    if(!starTarget||!amt||isNaN(amt)){setStarMsg({msg:"Pick a user and enter an amount","color":"#EF4444"});return;}
    setStarLoading(true);
    const rows=await sb.get("nova_stars",`?user_id=eq.${starTarget}&limit=1`);
    const reason=starReason.trim()||"Owner grant";
    if(rows?.length){
      const nb=(rows[0].balance||0)+amt;
      const nl=(rows[0].lifetime_earned||0)+(amt>0?amt:0);
      await sb.patch("nova_stars",`?user_id=eq.${starTarget}`,{balance:Math.max(0,nb),lifetime_earned:nl});
      setStarBalances(p=>({...p,[starTarget]:Math.max(0,nb)}));
    }else{
      const nb=Math.max(0,amt);
      await sb.post("nova_stars",{user_id:starTarget,balance:nb,lifetime_earned:nb>0?nb:0,last_login_claim:0,login_streak:0});
      setStarBalances(p=>({...p,[starTarget]:nb}));
    }
    await sb.post("nova_star_log",{id:gid(),user_id:starTarget,amount:amt,reason:`[OWNER] ${reason}`,ts:Date.now()});
    const u=users.find(x=>x.id===starTarget);
    setStarMsg({msg:`${amt>0?"+":" "}${amt} ⭐ ${amt>0?"given to":"taken from"} ${u?.display_name||"user"}`,color:amt>0?"#22C55E":"#EF4444"});
    setStarAmount("");setStarReason("");
    setStarLoading(false);
    setTimeout(()=>setStarMsg(null),3000);
  };
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
      {/* Dashboard tab groups - simplified for brevity, but keep your existing tabs */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginRight:4,flexShrink:0}}>NOVA</div>
          {[["members","👥 Members"],["badges","🏅 Badges"],["roles","⭐ Roles"],["stars","⭐ Stars"],["announce","📢 Announce"],["ratings","📊 Ratings"],["gm_ovr","🎮 GM OVRs"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:18,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"rgba(245,158,11,.5)":"rgba(255,255,255,.08)"}`,background:tab===t?"rgba(245,158,11,.12)":"rgba(255,255,255,.03)",color:tab===t?"#F59E0B":"#64748B",transition:"all .2s"}}>{l}</button>
          ))}
        </div>
      </div>
      {/* Render selected tab content */}
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
      {tab==="stars"&&(<div style={{maxWidth:600}}>...</div>)}
      {tab==="announce"&&(<div style={{maxWidth:600}}>...</div>)}
      {tab==="gm_ovr"&&<DashGMOvrTab cu={cu}/>}
      {tab==="ratings"&&<DashRatingsTab league="nffl" accentColor="#F59E0B" label="2v2FF"/>}
    </div>
  );
}