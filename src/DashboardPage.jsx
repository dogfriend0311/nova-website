import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "../shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig, RobloxAvatar } from "../components/UI";


import { LeaguePlayersPage } from "./LeaguePage";

// ─── LeaguePlayersPage — shared player profile page for NFFL/NBBL ─────────────

// ─── Dashboard League flat-tab components ─────────────────────────────────────


// Shared OVR color helper — used by dashboard and member pages
function ovrColor(ovr){
  if(!ovr)return"#64748B";
  if(ovr>=93)return"#A855F7"; // purple - elite
  if(ovr>=87)return"#22C55E"; // green - great
  if(ovr>=80)return"#3B82F6"; // blue - good
  if(ovr>=73)return"#F59E0B"; // gold - above avg
  if(ovr>=65)return"#FB923C"; // orange - average
  return"#64748B";             // grey - below avg
}
function OVRBig({ovr,size=44}){
  const col=ovrColor(ovr);
  return(
    <div style={{width:size,height:size,borderRadius:size*0.22,background:col+"20",border:`2px solid ${col}55`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:size*0.38,fontWeight:900,color:col,lineHeight:1}}>{ovr||"?"}</span>
    </div>
  );
}

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
                <input
                  type="number" min="40" max="99"
                  value={editVals[p.id]||70}
                  onChange={e=>setEditVals(prev=>({...prev,[p.id]:e.target.value}))}
                  onBlur={e=>updateOvr(p,e.target.value)}
                  style={{width:64,textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:14,color:ovrColor(parseInt(editVals[p.id])||70)}}
                />
                <div style={{width:14,textAlign:"center"}}>
                  {saving[p.id]&&<span style={{fontSize:14,color:"#22C55E"}}>✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



// ─── League Team Management ────────────────────────────────────────────────────

// ─── Dashboard: GM OVR Editor ─────────────────────────────────────────────────
// Lets owner edit OVR ratings for players in their active GM Mode save
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
    const result=await aiCall(
      `Generate the ${yr} ${searchSport.toUpperCase()} roster for "${searchTeam}". Return 20-25 real players with realistic OVR ratings. JSON array: [{id:"p_N",name,pos,age,ovr(50-99),salary(millions float),years(1-6)}]`,
      "You are a sports analyst. Use real player names. Return only valid JSON array."
    );
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
// ─── ClipsSection ─────────────────────────────────────────────────────────────
export function ClipsSection({clips,setClips,league,playerId,playerName,canPost}){
  const[adding,setAdding]=useState(false);
  const[title,setTitle]=useState("");
  const[url,setUrl]=useState("");
  const[saving,setSaving]=useState(false);
  const[uploading,setUploading]=useState(false);
  const[sel,setSel]=useState(null);
  const fileRef=useRef(null);
  const cu=getSess();

  const addClip=async()=>{
    if(!url.trim())return;
    setSaving(true);
    const ytId=extractYT(url);
    const med=extractMedal(url);
    const type=ytId?"youtube":med?"medal":"video";
    const clip={id:gid(),url:url.trim(),title:title.trim()||playerName||"Clip",player_id:playerId,player_name:playerName,league,type,eid:ytId||med||null,ts:Date.now()};
    await sb.post(`nova_${league}_clips`,clip);
    setClips(prev=>[clip,...prev]);
    setUrl("");setTitle("");setAdding(false);setSaving(false);
  };

  const handleUpload=async(e)=>{
    const file=e.target.files?.[0];
    if(!file||!cu)return;
    setUploading(true);
    const uploadedUrl=await sb.uploadClip(cu.id,file);
    if(uploadedUrl){
      const clip={id:gid(),url:uploadedUrl,title:file.name.replace(/\.[^.]+$/,""),player_id:playerId,player_name:playerName,league,type:"video",ts:Date.now()};
      await sb.post(`nova_${league}_clips`,clip);
      setClips(prev=>[clip,...prev]);
    }
    setUploading(false);
    if(fileRef.current)fileRef.current.value="";
  };

  const delClip=async(id)=>{
    if(!confirm("Delete this clip?"))return;
    await sb.del(`nova_${league}_clips`,`?id=eq.${id}`);
    setClips(prev=>prev.filter(c=>c.id!==id));
    if(sel?.id===id)setSel(null);
  };

  const renderEmbed=(clip)=>{
    const ytId=clip.eid||extractYT(clip.url);
    const med=clip.type==="medal"?(clip.eid||extractMedal(clip.url)):null;
    if(clip.type==="youtube"||ytId)return<iframe src={`https://www.youtube.com/embed/${ytId}`} style={{width:"100%",height:220,border:"none",borderRadius:12}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>;
    if(clip.type==="medal"||med)return(
      <div>
        <div style={{fontSize:9,color:"#94A3B8",fontFamily:"'Orbitron',sans-serif",marginBottom:6}}>MEDAL.TV</div>
        {med?<iframe src={`https://medal.tv/clip/${med}/embed`} width="100%" height="220" frameBorder="0" allowFullScreen style={{borderRadius:12,border:"none"}}/>
           :<a href={clip.url} target="_blank" rel="noopener noreferrer" style={{color:"#00D4FF",fontSize:13}}>▶ Watch on Medal.tv →</a>}
      </div>
    );
    if(clip.url.startsWith("https://"))return<video src={clip.url} controls playsInline style={{width:"100%",maxHeight:220,borderRadius:12}}/>;
    return<a href={clip.url} target="_blank" rel="noopener noreferrer" style={{color:"#00D4FF",fontSize:13}}>View Clip →</a>;
  };

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",fontWeight:700,letterSpacing:".1em"}}>🎬 CLIPS ({clips.length})</div>
        {canPost&&<button onClick={()=>setAdding(!adding)} style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,padding:"4px 12px",borderRadius:8,background:"rgba(0,212,255,.1)",border:"1px solid rgba(0,212,255,.3)",color:"#00D4FF",cursor:"pointer"}}>+ Add Clip</button>}
      </div>
      {adding&&(
        <div style={{borderRadius:12,padding:14,marginBottom:12,background:"rgba(0,212,255,.05)",border:"1px solid rgba(0,212,255,.2)"}}>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Clip title…" style={{marginBottom:8}}/>
          <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="YouTube, Medal.tv URL, or direct video link…" style={{marginBottom:8}}/>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <button onClick={addClip} disabled={saving||!url.trim()} style={{padding:"7px 16px",borderRadius:8,background:"#00D4FF",color:"#030712",border:"none",fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer",opacity:saving||!url.trim()?0.5:1}}>{saving?"Saving…":"Post"}</button>
            <span style={{fontSize:11,color:"#475569"}}>or</span>
            <label style={{padding:"6px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#94A3B8",fontSize:11,fontFamily:"'Orbitron',sans-serif",cursor:"pointer"}}>
              {uploading?"Uploading…":"Upload Video"}
              <input ref={fileRef} type="file" accept="video/*" style={{display:"none"}} onChange={handleUpload} disabled={uploading}/>
            </label>
            <button onClick={()=>setAdding(false)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12}}>Cancel</button>
          </div>
        </div>
      )}
      {sel&&(
        <div style={{borderRadius:12,padding:14,marginBottom:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:13,fontWeight:700,color:"#E2E8F0"}}>{sel.title||"Clip"}</div>
            <div style={{display:"flex",gap:8}}>
              {canPost&&<button onClick={()=>delClip(sel.id)} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:12}}>🗑 Delete</button>}
              <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12}}>✕</button>
            </div>
          </div>
          {renderEmbed(sel)}
        </div>
      )}
      {!clips.length&&<div style={{textAlign:"center",padding:"24px 0",color:"#334155",fontSize:12}}>No clips posted yet</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
        {clips.map(clip=>{
          const ytId=extractYT(clip.url);
          return(
            <div key={clip.id} onClick={()=>setSel(sel?.id===clip.id?null:clip)} style={{borderRadius:12,overflow:"hidden",border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.03)",cursor:"pointer",transition:"transform .2s, box-shadow .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,212,255,.15)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
              {(clip.type==="youtube"||ytId)
                ?<div style={{position:"relative",paddingBottom:"56.25%"}}>
                    <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} alt="thumb"/>
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.3)"}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,paddingLeft:2}}>▶</div>
                    </div>
                  </div>
                :clip.type==="medal"
                  ?<div style={{height:90,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,rgba(168,85,247,.15),rgba(0,0,0,.2))",gap:4}}>
                      <div style={{fontSize:22}}>🎖</div>
                      <div style={{fontSize:9,color:"#A855F7",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>MEDAL.TV</div>
                    </div>
                  :<div style={{height:90,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.2)",fontSize:28}}>🎬</div>}
              <div style={{padding:"8px 10px"}}>
                <div style={{fontSize:11,fontWeight:600,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{clip.title||"Clip"}</div>
                {clip.player_name&&<div style={{fontSize:10,color:"#475569"}}>{clip.player_name}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DashLeagueClips ──────────────────────────────────────────────────────────
export function DashLeagueClips({league,accentColor}){
  const[clips,setClips]=useState([]);
  const[loaded,setLoaded]=useState(false);
  useEffect(()=>{
    if(loaded)return;
    sb.get(`nova_${league}_clips`,"?order=ts.desc&limit=100").then(r=>{setClips(r||[]);setLoaded(true);});
  },[]);
  return(
    <Card style={{padding:18}} hover={false}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:12,fontWeight:700}}>🎬 ALL CLIPS</div>
      <ClipsSection clips={clips} setClips={setClips} league={league} canPost={true}/>
    </Card>
  );
}

export function DashLeagueTeams({league,accentColor}){
  const mob=useIsMobile();
  const[teams,setTeams]=useState([]);
  const[players,setPlayers]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[showAdd,setShowAdd]=useState(false);
  const[teamName,setTeamName]=useState("");
  const[teamOwner,setTeamOwner]=useState("");
  const[logoB64,setLogoB64]=useState("");
  const[saving,setSaving]=useState(false);
  const[deleting,setDeleting]=useState(null);
  const[editing,setEditing]=useState(null);
  const[editName,setEditName]=useState("");
  const[editOwner,setEditOwner]=useState("");
  const[editLogo,setEditLogo]=useState("");
  const[editSaving,setEditSaving]=useState(false);

  useEffect(()=>{
    if(loaded)return;
    Promise.all([
      sb.get(`nova_${league}_teams`,"?order=name.asc"),
      sb.get(`nova_${league}_players`,"?order=name.asc"),
    ]).then(([t,p])=>{setTeams(t||[]);setPlayers(p||[]);setLoaded(true);});
  },[]);

  const handleLogo=(e,setter)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    if(file.size>800000){alert("Logo must be under 800KB");return;}
    const reader=new FileReader();
    reader.onload=ev=>setter(ev.target.result);
    reader.readAsDataURL(file);
  };

  const addTeam=async()=>{
    if(!teamName.trim())return;
    setSaving(true);
    const t={id:gid(),name:teamName.trim(),owner_name:teamOwner.trim(),logo:logoB64||"",league,ts:Date.now()};
    await sb.post(`nova_${league}_teams`,t);
    setTeams(prev=>[...prev,t]);
    setTeamName("");setTeamOwner("");setLogoB64("");setShowAdd(false);setSaving(false);
  };

  const openEdit=(team)=>{
    setEditing(team);
    setEditName(team.name||"");
    setEditOwner(team.owner_name||"");
    setEditLogo(team.logo||"");
  };

  const saveEdit=async()=>{
    if(!editing||!editName.trim())return;
    setEditSaving(true);
    const patch={name:editName.trim(),owner_name:editOwner.trim(),logo:editLogo};
    await sb.patch(`nova_${league}_teams`,`?id=eq.${editing.id}`,patch);
    setTeams(prev=>prev.map(t=>t.id===editing.id?{...t,...patch}:t));
    // Update players whose team name changed
    if(editName.trim()!==editing.name){
      const affected=players.filter(p=>p.team===editing.name);
      await Promise.all(affected.map(p=>sb.patch(`nova_${league}_players`,`?id=eq.${p.id}`,{team:editName.trim()})));
      setPlayers(prev=>prev.map(p=>p.team===editing.name?{...p,team:editName.trim()}:p));
    }
    setEditSaving(false);setEditing(null);
  };

  const deleteTeam=async(id)=>{
    if(!confirm("Delete this team? Players will become free agents."))return;
    setDeleting(id);
    await sb.del(`nova_${league}_teams`,`?id=eq.${id}`);
    setTeams(prev=>prev.filter(t=>t.id!==id));
    setDeleting(null);
  };

  const teamPlayers=(name)=>players.filter(Boolean).filter(p=>p.team===name);

  // Edit view
  if(editing)return(
    <div>
      <button onClick={()=>setEditing(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:11,marginBottom:16,display:"flex",alignItems:"center",gap:5}}>← BACK</button>
      <Card style={{padding:"18px",maxWidth:500}} hover={false}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:14,fontWeight:700}}>✏️ EDIT TEAM</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Logo */}
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <div style={{width:72,height:72,borderRadius:12,overflow:"hidden",background:`${accentColor}18`,border:`2px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {editLogo?<img src={editLogo} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:32}}>🏟</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:5}}>TEAM LOGO (max 800KB)</div>
              <input type="file" accept="image/*" onChange={e=>handleLogo(e,setEditLogo)} style={{fontSize:11,color:"#94A3B8"}}/>
              {editLogo&&<button onClick={()=>setEditLogo("")} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:10,display:"block",marginTop:4}}>Remove logo</button>}
            </div>
          </div>
          {/* Name */}
          <div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>TEAM NAME</div>
            <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Team name…"/>
            {editName!==editing.name&&<div style={{fontSize:9,color:"#F59E0B",marginTop:3}}>⚠️ Renaming will update all players on this team</div>}
          </div>
          {/* Owner */}
          <div>
            <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>GM / TEAM OWNER NAME</div>
            <input value={editOwner} onChange={e=>setEditOwner(e.target.value)} placeholder="Owner's name…"/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={saveEdit} disabled={editSaving||!editName.trim()}>{editSaving?"Saving…":"💾 Save Changes"}</Btn>
            <button onClick={()=>setEditing(null)} style={{padding:"8px 14px",borderRadius:10,background:"none",border:"1px solid rgba(255,255,255,.1)",color:"#475569",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10}}>Cancel</button>
          </div>
        </div>
      </Card>
    </div>
  );

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#94A3B8",fontWeight:700}}>🏟 TEAMS ({teams.length})</div>
        <button onClick={()=>setShowAdd(o=>!o)}
          style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,
            background:showAdd?accentColor+"22":"rgba(255,255,255,.05)",
            border:`1px solid ${showAdd?accentColor+"55":"rgba(255,255,255,.1)"}`,
            color:showAdd?accentColor:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>
          {showAdd?"✕ Cancel":"➕ Create Team"}
        </button>
      </div>

      {/* Create form */}
      {showAdd&&(
        <Card style={{padding:"16px",marginBottom:16}} hover={false}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:12,fontWeight:700}}>CREATE TEAM</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:60,height:60,borderRadius:10,overflow:"hidden",background:`${accentColor}18`,border:`1px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {logoB64?<img src={logoB64} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:26}}>🏟</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:4}}>LOGO (max 800KB)</div>
                <input type="file" accept="image/*" onChange={e=>handleLogo(e,setLogoB64)} style={{fontSize:11,color:"#94A3B8"}}/>
              </div>
            </div>
            <div><Lbl>Team Name</Lbl><input value={teamName} onChange={e=>setTeamName(e.target.value)} placeholder="e.g. Nova Knights…"/></div>
            <div><Lbl>GM / Team Owner Name</Lbl><input value={teamOwner} onChange={e=>setTeamOwner(e.target.value)} placeholder="Owner name…"/></div>
          </div>
          <Btn onClick={addTeam} disabled={saving||!teamName.trim()}>{saving?"Creating…":"✅ Create Team"}</Btn>
        </Card>
      )}

      {!teams.length&&!showAdd&&<Empty icon="🏟" msg="No teams yet — create one above"/>}

      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10}}>
        {teams.map((t,i)=>{
          const tp=teamPlayers(t.name);
          return(
            <Card key={i} style={{padding:0,overflow:"hidden"}} hover={false}>
              <div style={{padding:"14px 16px",display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:52,height:52,borderRadius:10,overflow:"hidden",background:`${accentColor}18`,border:`1px solid ${accentColor}33`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {t.logo?<img src={t.logo} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:24}}>🏟</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                  {t.owner_name&&<div style={{fontSize:10,color:accentColor,marginTop:1}}>👑 {t.owner_name}</div>}
                  <div style={{fontSize:9,color:"#475569",marginTop:1}}>{tp.length} players</div>
                </div>
                <div style={{display:"flex",gap:5,flexShrink:0}}>
                  <button onClick={()=>openEdit(t)}
                    style={{padding:"5px 10px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#94A3B8",cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700}}>✏️ Edit</button>
                  <button onClick={()=>deleteTeam(t.id)} disabled={deleting===t.id}
                    style={{padding:"5px 8px",borderRadius:8,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",color:"#EF4444",cursor:"pointer",fontSize:12,opacity:deleting===t.id?.5:1}}>🗑</button>
                </div>
              </div>
              {tp.length>0&&(
                <div style={{borderTop:`1px solid ${accentColor}14`,padding:"8px 16px",display:"flex",gap:5,flexWrap:"wrap"}}>
                  {tp.slice(0,5).map((p,j)=>(
                    <span key={j} style={{fontSize:9,color:"#475569",padding:"2px 7px",borderRadius:5,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.05)"}}>
                      {p.name.split(" ").slice(-1)[0]} <span style={{color:accentColor}}>{p.position}</span>
                    </span>
                  ))}
                  {tp.length>5&&<span style={{fontSize:9,color:"#334155"}}>+{tp.length-5}</span>}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function DashLeagueFeed({league,accentColor,cu}){
  const[feed,setFeed]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[title,setTitle]=useState("");
  const[body,setBody]=useState("");
  const[saving,setSaving]=useState(false);
  useEffect(()=>{
    if(loaded)return;
    sb.get(`nova_${league}_feed`,"?order=ts.desc&limit=50").then(r=>{setFeed(r||[]);setLoaded(true);});
  },[]);
  const post=async()=>{
    if(!body.trim())return;
    setSaving(true);
    const p={id:gid(),title:title.trim(),content:body.trim(),author_id:cu?.id,author_name:cu?.display_name,ts:Date.now()};
    await sb.post(`nova_${league}_feed`,p);
    setFeed(prev=>[p,...prev]);setTitle("");setBody("");setSaving(false);
  };
  const del=async(id)=>{await sb.del(`nova_${league}_feed`,`?id=eq.${id}`);setFeed(p=>p.filter(x=>x.id!==id));};
  return(
    <div>
      <Card style={{padding:"16px",marginBottom:14}} hover={false}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:10,fontWeight:700}}>📢 POST GAME UPDATE</div>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title (e.g. Week 3 Recap)…" style={{marginBottom:8}}/>
        <textarea value={body} onChange={e=>setBody(e.target.value)} rows={4} placeholder="Game recap, scores, highlights…" style={{marginBottom:8,resize:"vertical"}}/>
        <Btn onClick={post} disabled={saving||!body.trim()}>{saving?"Posting…":"📢 Post Update"}</Btn>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {!feed.length&&<Empty icon="📢" msg="No posts yet"/>}
        {feed.map(f=>(
          <Card key={f.id} style={{padding:"12px 14px"}} hover={false}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                {f.title&&<div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:accentColor,fontWeight:700,marginBottom:4}}>{f.title}</div>}
                <div style={{fontSize:12,color:"#94A3B8",lineHeight:1.5}}>{f.content}</div>
                <div style={{fontSize:9,color:"#334155",marginTop:6}}>{f.author_name} · {new Date(f.ts).toLocaleDateString()}</div>
              </div>
              <button onClick={()=>del(f.id)} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:16,marginLeft:10,flexShrink:0}}>🗑</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DashLeagueRoster({league,accentColor,cu,sport=""}){
  const mob=useIsMobile();
  const[players,setPlayers]=useState([]);
  const[leagueTeams,setLeagueTeams]=useState([]);
  const[loaded,setLoaded]=useState(false);
  useEffect(()=>{
    if(loaded)return;
    Promise.all([
      sb.get(`nova_${league}_players`,"?order=name.asc"),
      sb.get(`nova_${league}_teams`,"?order=name.asc"),
    ]).then(([p,t])=>{setPlayers(p||[]);setLeagueTeams(t||[]);setLoaded(true);});
  },[]);
  const del=async(id)=>{await sb.del(`nova_${league}_players`,`?id=eq.${id}`);setPlayers(p=>p.filter(x=>x.id!==id));};
  return(
    <div>
      <Card style={{padding:"16px",marginBottom:14}} hover={false}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:12,fontWeight:700}}>➕ ADD PLAYER</div>
        <AddLeaguePlayer league={league} onAdd={p=>setPlayers(prev=>[...prev,p])} cu={cu} sport={sport} leagueTeams={leagueTeams}/>
      </Card>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".1em",marginBottom:10}}>{players.length} PLAYERS</div>
      {!players.length&&<Empty icon="👥" msg="No players yet — add one above"/>}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:8}}>
        {players.filter(Boolean).map((p,i)=>(
          <Card key={i} style={{padding:"12px 14px"}} hover={false}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,color:"#E2E8F0",fontSize:13}}>{p.name}</div>
                <div style={{fontSize:11,color:accentColor,marginTop:2}}>{p.position}{p.jersey?` · #${p.jersey}`:""}</div>
                <div style={{fontSize:10,color:"#475569"}}>{p.team}</div>
              </div>
              <button onClick={()=>del(p.id)} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:14,flexShrink:0}}>🗑</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DashLeagueStats({league,accentColor,isBaseball,sport=""}){
  const[players,setPlayers]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[target,setTarget]=useState("");
  const[statType,setStatType]=useState("season"); // "season" | "career"
  const[field,setField]=useState(()=>sport==="basketball"?"scoring_stats":isBaseball?"hitting_stats":"passing_stats");
  const[data,setData]=useState({});
  const[saving,setSaving]=useState(false);
  const[viewMode,setViewMode]=useState("edit"); // "edit" | "leaderboard" | "leaders"
  const[lbSortCol,setLbSortCol]=useState(null);
  const[lbSortDir,setLbSortDir]=useState("desc");
  const baseballPos=["P","C","1B","2B","3B","SS","LF","CF","RF","DH","SP","RP"];
  const footballPos=["QB","RB","WR","TE","K","DEF","OL","DL","LB","CB","S"];
  const basketballPos=["Top","Corner"];
  const positions=sport==="basketball"?basketballPos:isBaseball?baseballPos:footballPos;
  // Field key includes _season or _career suffix
  const fullField=statType==="season"?field+"_season":field;
  const NBBL_FIELDS=[
    ["hitting_stats","⚾ Hitting",["G","AB","R","H","2B","3B","HR","RBI","BB","SO","SB","AVG","OBP","SLG","OPS"]],
    ["pitching_stats","⚾ Pitching",["G","GS","W","L","SV","IP","H","R","ER","BB","SO","ERA","WHIP","K9","BB9"]],
    ["fielding_stats","🧤 Fielding",["G","GS","PO","A","E","DP","FLD%","INN"]],
  ];
  const NFL_FIELDS=[
    ["passing_stats","🎯 Passing",["G","CMP","ATT","YDS","TD","INT","RTG"]],
    ["rushing_stats","🏃 Rushing",["G","CAR","YDS","TD","AVG","LONG"]],
    ["receiving_stats","📡 Receiving",["G","REC","YDS","TD","AVG","LONG"]],
    ["defensive_stats","🛡 Defense",["G","TCK","SACK","INT","FF","PD"]],
    ["kicking_stats","⚽ Kicking",["G","FGM","FGA","FG%","XPM","XPA","LONG"]],
  ];
  const NBA_FIELDS=[
    ["scoring_stats","🏀 Scoring",["G","MIN","PTS","FGM","FGA","FG%","3PM","3PA","3P%","FTM","FTA","FT%"]],
    ["rebounds_stats","💪 Rebounds",["G","OREB","DREB","REB","REB/G"]],
    ["playmaking_stats","🎯 Playmaking",["G","AST","TOV","AST/G","AST/TOV"]],
    ["defense_stats","🛡 Defense",["G","STL","BLK","PF","STL/G","BLK/G"]],
  ];
  const FIELDS=sport==="basketball"?NBA_FIELDS:isBaseball?NBBL_FIELDS:NFL_FIELDS;
  useEffect(()=>{
    if(loaded)return;
    sb.get(`nova_${league}_players`,"?order=name.asc").then(r=>{setPlayers(r||[]);setLoaded(true);});
  },[]);
  const save=async()=>{
    if(!target)return;
    setSaving(true);
    await sb.patch(`nova_${league}_players`,`?id=eq.${target}`,{[fullField]:data});
    setPlayers(p=>p.map(x=>x.id===target?{...x,[fullField]:data}:x));
    setSaving(false);
    alert(`${statType==="season"?"Season":"Career"} stats saved!`);
  };
  const cols=FIELDS.find(([k])=>k===field)?.[2]||[];
  // Leaderboard: sort players by selected column
  const lbFullField=statType==="season"?field+"_season":field;
  const lbSorted=[...players].sort((a,b)=>{
    if(!lbSortCol)return 0;
    const av=parseFloat(((a[lbFullField]||{})[lbSortCol])||"0")||0;
    const bv=parseFloat(((b[lbFullField]||{})[lbSortCol])||"0")||0;
    return lbSortDir==="desc"?bv-av:av-bv;
  });
  const handleLbSort=(col)=>{
    if(lbSortCol===col)setLbSortDir(d=>d==="desc"?"asc":"desc");
    else{setLbSortCol(col);setLbSortDir("desc");}
  };
  return(
    <Card style={{padding:"18px"}} hover={false}>
      {/* Top header with view toggle */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,fontWeight:700}}>📊 STATS</div>
        <div style={{display:"flex",gap:5}}>
          {[["edit","✏️ Edit"],["leaderboard","📋 Leaderboard"],["leaders","🏆 League Leaders"]].map(([m,l])=>(
            <button key={m} onClick={()=>setViewMode(m)}
              style={{padding:"5px 12px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
                border:`1px solid ${viewMode===m?accentColor+"66":"rgba(255,255,255,.08)"}`,
                background:viewMode===m?accentColor+"18":"rgba(255,255,255,.03)",
                color:viewMode===m?accentColor:"#475569",transition:"all .18s"}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Season / Career toggle — shared across both views */}
      <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        {[["season","📅 Season"],["career","🏆 Career"]].map(([t,l])=>(
          <button key={t} onClick={()=>{setStatType(t);const p=players.find(x=>x.id===target);const ff=t==="season"?field+"_season":field;setData(p?.[ff]||{});}}
            style={{padding:"5px 12px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
              border:`1px solid ${statType===t?accentColor+"66":"rgba(255,255,255,.08)"}`,
              background:statType===t?accentColor+"18":"rgba(255,255,255,.03)",
              color:statType===t?accentColor:"#475569"}}>
            {l}
          </button>
        ))}
        <select value={field} onChange={e=>{setField(e.target.value);setLbSortCol(null);const ff=statType==="season"?e.target.value+"_season":e.target.value;const p=players.find(x=>x.id===target);setData(p?.[ff]||{});}}
          style={{fontSize:10,padding:"4px 8px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",marginLeft:4}}>
          {FIELDS.map(([k,l])=><option key={k} value={k}>{l}</option>)}
        </select>
        {viewMode==="edit"&&<div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",marginLeft:4}}>→ {fullField}</div>}
      </div>

      {viewMode==="edit"&&(
        <>
          <div style={{marginBottom:12}}>
            <Lbl>Player</Lbl>
            <select value={target} onChange={e=>{setTarget(e.target.value);const p=players.find(x=>x.id===e.target.value);setData(p?.[fullField]||{});}} style={{width:"100%"}}>
              <option value="">Select player…</option>
              {players.map(p=><option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}
            </select>
          </div>
          {target&&(
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:8,marginBottom:14}}>
                {cols.map(c=>(
                  <div key={c}>
                    <Lbl>{c}</Lbl>
                    <input value={data[c]||""} onChange={e=>setData(p=>({...p,[c]:e.target.value}))} placeholder="—" style={{textAlign:"center"}}/>
                  </div>
                ))}
              </div>
              <Btn onClick={save} disabled={saving}>{saving?"Saving…":"💾 Save Stats"}</Btn>
            </>
          )}
          {!target&&<div style={{textAlign:"center",padding:"20px 0",color:"#334155",fontSize:12}}>Select a player above to enter stats</div>}
        </>
      )}

      {viewMode==="leaderboard"&&(
        <div style={{overflowX:"auto",borderRadius:10,border:"1px solid rgba(255,255,255,.07)"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:400}}>
            <thead>
              <tr style={{background:"rgba(255,255,255,.04)",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                <th style={{padding:"9px 12px",textAlign:"left",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",fontWeight:700,whiteSpace:"nowrap"}}>#</th>
                <th style={{padding:"9px 12px",textAlign:"left",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",fontWeight:700,whiteSpace:"nowrap"}}>PLAYER</th>
                <th style={{padding:"9px 8px",textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",fontWeight:700}}>POS</th>
                {cols.map(col=>(
                  <th key={col} onClick={()=>handleLbSort(col)}
                    style={{padding:"9px 8px",textAlign:"center",cursor:"pointer",whiteSpace:"nowrap",
                      fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,letterSpacing:".06em",
                      color:lbSortCol===col?accentColor:"#475569",
                      background:lbSortCol===col?accentColor+"12":"transparent",
                      transition:"all .15s",userSelect:"none"}}>
                    {col}{lbSortCol===col?(lbSortDir==="desc"?" ↓":" ↑"):""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lbSorted.map((p,i)=>{
                const stats=p[lbFullField]||{};
                const hasStats=cols.some(c=>stats[c]!==undefined&&stats[c]!=="");
                return(
                  <tr key={p.id} style={{borderBottom:"1px solid rgba(255,255,255,.04)",opacity:hasStats?1:0.4}}>
                    <td style={{padding:"9px 12px",fontSize:10,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>{i+1}</td>
                    <td style={{padding:"9px 12px"}}>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0",whiteSpace:"nowrap"}}>{p.name}</div>
                      {p.team&&<div style={{fontSize:9,color:"#475569"}}>{p.team}</div>}
                    </td>
                    <td style={{padding:"9px 8px",textAlign:"center",fontSize:10,color:accentColor,fontWeight:600}}>{p.position}</td>
                    {cols.map(col=>(
                      <td key={col} style={{padding:"9px 8px",textAlign:"center",fontSize:11,
                        fontWeight:lbSortCol===col?700:400,
                        color:lbSortCol===col?"#E2E8F0":"#94A3B8"}}>
                        {stats[col]??"—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {players.length===0&&<tr><td colSpan={3+cols.length} style={{textAlign:"center",padding:"24px",color:"#334155",fontSize:12}}>No players yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {viewMode==="leaders"&&(
        <div>
          <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginBottom:16}}>
            TOP 3 PER CATEGORY · {statType==="season"?"SEASON":"CAREER"} STATS
          </div>
          {FIELDS.map(([fkey,flabel,fcols])=>{
            const fk=statType==="season"?fkey+"_season":fkey;
            // Only show key counting/rate stats for leaders (skip G, LONG, GS, etc.)
            const skipCols=new Set(["G","LONG","GS","GF","INN","FGA","XPA","3PA","FTA","FGA","ATT","AB"]);
            const leaderCols=fcols.filter(c=>!skipCols.has(c));
            return(
              <div key={fkey} style={{marginBottom:20}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,fontWeight:700,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
                  {flabel}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
                  {leaderCols.map(col=>{
                    const ranked=[...players.filter(Boolean)]
                      .map(p=>({p,val:parseFloat(((p[fk]||{})[col])||"")}))
                      .filter(x=>!isNaN(x.val)&&x.val>0)
                      .sort((a,b)=>b.val-a.val)
                      .slice(0,3);
                    if(!ranked.length)return null;
                    const medals=["🥇","🥈","🥉"];
                    return(
                      <div key={col} style={{background:"rgba(255,255,255,.03)",border:`1px solid ${accentColor}22`,borderRadius:12,padding:"10px 12px"}}>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:accentColor,fontWeight:700,letterSpacing:".08em",marginBottom:8}}>{col}</div>
                        {ranked.map(({p,val},ri)=>(
                          <div key={p.id} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                            <span style={{fontSize:13,flexShrink:0}}>{medals[ri]}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:11,fontWeight:700,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                              <div style={{fontSize:9,color:"#475569"}}>{p.position}{p.team?` · ${p.team}`:""}</div>
                            </div>
                            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:ri===0?accentColor:"#94A3B8",flexShrink:0}}>{val}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {players.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:"#334155",fontSize:12,fontFamily:"'Orbitron',sans-serif"}}>No player stats to display yet</div>}
        </div>
      )}
    </Card>
  );
}

export function DashLeagueTx({league,accentColor}){
  const[players,setPlayers]=useState([]);
  const[txs,setTxs]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[type,setType]=useState("Trade");
  const[from,setFrom]=useState("");
  const[to,setTo]=useState("");
  const[desc,setDesc]=useState("");
  const[saving,setSaving]=useState(false);
  const TX_TYPES=["Trade","Signing","Release","Suspension","Injury","Award","Other"];
  const TX_COLOR={Trade:"#00D4FF",Signing:"#22C55E",Release:"#EF4444",Suspension:"#F59E0B",Injury:"#FB923C",Award:"#A855F7",Other:"#64748B"};
  useEffect(()=>{
    if(loaded)return;
    Promise.all([
      sb.get(`nova_${league}_players`,"?order=name.asc"),
      sb.get(`nova_${league}_transactions`,"?order=ts.desc&limit=100"),
    ]).then(([p,t])=>{setPlayers(p||[]);setTxs(t||[]);setLoaded(true);});
  },[]);
  const submit=async()=>{
    if(!desc.trim())return;
    setSaving(true);
    const tx={id:gid(),type,from_player:from,to_player:to,description:desc.trim(),ts:Date.now()};
    await sb.post(`nova_${league}_transactions`,tx);
    setTxs(p=>[tx,...p]);setDesc("");setFrom("");setTo("");setSaving(false);
  };
  const del=async(id)=>{await sb.del(`nova_${league}_transactions`,`?id=eq.${id}`);setTxs(p=>p.filter(x=>x.id!==id));};
  const[showForm,setShowForm]=useState(false);
  return(
    <div>
      {/* Header with Add button */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#94A3B8",fontWeight:700}}>📋 TRANSACTIONS ({txs.length})</div>
        <button onClick={()=>setShowForm(o=>!o)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,background:showForm?accentColor+"22":"rgba(255,255,255,.05)",border:`1px solid ${showForm?accentColor+"55":"rgba(255,255,255,.1)"}`,color:showForm?accentColor:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>
          {showForm?"✕ Cancel":"➕ Add Transaction"}
        </button>
      </div>
      {showForm&&(
      <Card style={{padding:"16px",marginBottom:14}} hover={false}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:12,fontWeight:700}}>LOG TRANSACTION</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div>
            <Lbl>Type</Lbl>
            <select value={type} onChange={e=>setType(e.target.value)} style={{width:"100%"}}>
              {TX_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Lbl>From Player</Lbl>
            <select value={from} onChange={e=>setFrom(e.target.value)} style={{width:"100%"}}>
              <option value="">—</option>
              {players.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <Lbl>To / Team</Lbl>
            <select value={to} onChange={e=>setTo(e.target.value)} style={{width:"100%"}}>
              <option value="">—</option>
              {players.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <Lbl>Description</Lbl>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g. Aaron Judge traded to Yankees for package…"/>
          </div>
        </div>
        <Btn onClick={()=>{submit();setShowForm(false);}} disabled={saving||!desc.trim()}>{saving?"Saving…":"📋 Log Transaction"}</Btn>
      </Card>
      )}
      {!txs.length&&!showForm&&<Empty icon="📋" msg="No transactions yet — click Add Transaction above"/>}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {txs.map(tx=>(
          <Card key={tx.id} style={{padding:"12px 14px"}} hover={false}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{padding:"3px 9px",borderRadius:10,background:`${TX_COLOR[tx.type]||"#64748B"}22`,border:`1px solid ${TX_COLOR[tx.type]||"#64748B"}44`,color:TX_COLOR[tx.type]||"#64748B",fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,flexShrink:0,marginTop:1}}>{tx.type}</div>
              <div style={{flex:1,minWidth:0}}>
                {(tx.from_player||tx.to_player)&&<div style={{fontSize:10,color:"#00D4FF",fontFamily:"'Orbitron',sans-serif",marginBottom:2}}>{tx.from_player}{tx.from_player&&tx.to_player?" → ":""}{tx.to_player}</div>}
                <div style={{fontSize:12,color:"#94A3B8"}}>{tx.description}</div>
                <div style={{fontSize:9,color:"#334155",marginTop:4}}>{new Date(tx.ts).toLocaleDateString()}</div>
              </div>
              <button onClick={()=>del(tx.id)} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:14,flexShrink:0}}>🗑</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DashLeagueMembers({league,accentColor,users,isBaseball,sport=""}){
  const mob=useIsMobile();
  const[players,setPlayers]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[sel,setSel]=useState(null);
  const[statField,setStatField]=useState(()=>sport==="basketball"?"scoring_stats":isBaseball?"hitting_stats":"passing_stats");
  const[statData,setStatData]=useState({});
  const[saving,setSaving]=useState(false);
  const[statType,setStatType]=useState("season"); // season | career
  const[showAdd,setShowAdd]=useState(false);
  const[addName,setAddName]=useState("");
  const[addPos,setAddPos]=useState([]); // array of positions
  const[addTeam,setAddTeam]=useState("");
  const[addJersey,setAddJersey]=useState("");
  const[addSaving,setAddSaving]=useState(false);
  const baseballPos=["P","C","1B","2B","3B","SS","LF","CF","RF","DH","SP","RP"];
  const footballPos=["QB","RB","WR","TE","K","DEF","OL","DL","LB","CB","S"];
  const basketballPos=["Top","Corner"];
  const positions=sport==="basketball"?basketballPos:isBaseball?baseballPos:footballPos;
  const[confirmDelete,setConfirmDelete]=useState(null); // player id to confirm deletion
  const deletePlayer=async(pid)=>{
    await sb.del(`nova_${league}_players`,`?id=eq.${pid}`);
    setPlayers(p=>p.filter(x=>x.id!==pid));
    if(sel===pid)setSel(null);
    setConfirmDelete(null);
  };
  const addPlayer=async()=>{
    if(!addName.trim()||!addPos.length)return;
    setAddSaving(true);
    const p={id:gid(),name:addName.trim(),position:Array.isArray(addPos)?addPos.join("/"):addPos,team:addTeam.trim(),jersey:addJersey.trim(),ts:Date.now()};
    await sb.post(`nova_${league}_players`,p);
    setPlayers(prev=>[...prev,p]);
    setAddName("");setAddPos("");setAddTeam("");setAddJersey("");
    setShowAdd(false);setAddSaving(false);
  };
  const NBBL_FIELDS=[
    ["hitting_stats","⚾ Hitting",["G","AB","R","H","2B","3B","HR","RBI","BB","SO","SB","AVG","OBP","SLG","OPS"]],
    ["pitching_stats","⚾ Pitching",["G","GS","W","L","SV","IP","H","R","ER","BB","SO","ERA","WHIP","K9","BB9"]],
    ["fielding_stats","🧤 Fielding",["G","GS","PO","A","E","DP","FLD%","INN"]],
  ];
  const NFL_FIELDS=[
    ["passing_stats","🎯 Passing",["G","CMP","ATT","YDS","TD","INT","RTG"]],
    ["rushing_stats","🏃 Rushing",["G","CAR","YDS","TD","AVG","LONG"]],
    ["receiving_stats","📡 Receiving",["G","REC","YDS","TD","AVG","LONG"]],
    ["defensive_stats","🛡 Defense",["G","TCK","SACK","INT","FF","PD"]],
    ["kicking_stats","⚽ Kicking",["G","FGM","FGA","FG%","XPM","XPA","LONG"]],
  ];
  const NBA_FIELDS=[
    ["scoring_stats","🏀 Scoring",["G","MIN","PTS","FGM","FGA","FG%","3PM","3PA","3P%","FTM","FTA","FT%"]],
    ["rebounds_stats","💪 Rebounds",["G","OREB","DREB","REB","REB/G"]],
    ["playmaking_stats","🎯 Playmaking",["G","AST","TOV","AST/G","AST/TOV"]],
    ["defense_stats","🛡 Defense",["G","STL","BLK","PF","STL/G","BLK/G"]],
  ];
  const FIELDS=(sport||"")==="basketball"?NBA_FIELDS:isBaseball?NBBL_FIELDS:NFL_FIELDS;
  const[leagueTeams,setLeagueTeams]=useState([]);
  useEffect(()=>{
    if(loaded)return;
    Promise.all([
      sb.get(`nova_${league}_players`,"?order=name.asc"),
      sb.get(`nova_${league}_teams`,"?order=name.asc"),
    ]).then(([p,t])=>{setPlayers(p||[]);setLeagueTeams(t||[]);setLoaded(true);});
  },[]);
  const matchMember=(nameOrPlayer)=>{
    if(!nameOrPlayer)return null;
    const name=typeof nameOrPlayer==="object"?(nameOrPlayer.name||""):nameOrPlayer;
    if(!name)return null;
    const n=name.toLowerCase();
    return users.find(u=>(u.display_name||"").toLowerCase().includes(n)||n.includes((u.display_name||"").toLowerCase())||(u.username||"").toLowerCase()===n)||null;
  };
  const selPlayer=sel?players.find(p=>p.id===sel):null;
  // Linked Nova member — prefer explicit nova_user_id over name-match
  const linkedMember=selPlayer
    ?(selPlayer.nova_user_id?users.find(u=>u.id===selPlayer.nova_user_id):matchMember(selPlayer.name))
    :null;
  // Roblox: use player's own roblox_id first, fall back to linked member's
  const rId=selPlayer?.roblox_id||linkedMember?.social_roblox||"";
  // Spotify URL stored on player record
  const spotifyUrl=selPlayer?.spotify_url||"";
  // Convert Spotify track/playlist URL to embed URL
  const spotifyEmbed=(url)=>{
    if(!url)return"";
    const m=url.match(/spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
    return m?`https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`:"";
  };
  const fullStatField=statType==="season"?statField+"_season":statField;
  const saveStats=async()=>{
    if(!selPlayer)return;
    setSaving(true);
    await sb.patch(`nova_${league}_players`,`?id=eq.${selPlayer.id}`,{[fullStatField]:statData});
    setPlayers(p=>p.map(x=>x.id===selPlayer.id?{...x,[fullStatField]:statData}:x));
    setSaving(false);alert(`${statType==="season"?"Season":"Career"} stats saved!`);
  };
  const patchPlayer=async(patch)=>{
    await sb.patch(`nova_${league}_players`,`?id=eq.${selPlayer.id}`,patch);
    setPlayers(p=>p.map(x=>x.id===selPlayer.id?{...x,...patch}:x));
  };
  if(sel&&selPlayer){
    const cols=FIELDS.find(([k])=>k===statField)?.[2]||[];
    const embedUrl=spotifyEmbed(selPlayer.spotify_url||"");
    const statRows=[
      {label:"Season Stats",value:statType==="season"?"Live":"Career"},
      {label:"Team",value:selPlayer.team||"Free Agent"},
      {label:"Position",value:selPlayer.position||"—"},
      {label:"Jersey",value:selPlayer.jersey?`#${selPlayer.jersey}`:"—"},
    ];
    return(
      <div>
        <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12,marginBottom:16,fontFamily:"'Orbitron',sans-serif",display:"flex",alignItems:"center",gap:5}}>← ALL PLAYERS</button>
        {confirmDelete===selPlayer.id&&(
          <div style={{marginBottom:14,padding:"14px 18px",borderRadius:12,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
            <div style={{fontSize:12,color:"#FCA5A5",fontFamily:"'Orbitron',sans-serif"}}>Delete <b>{selPlayer.name}</b>? This cannot be undone.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setConfirmDelete(null)} style={{padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.15)",color:"#94A3B8",cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif"}}>Cancel</button>
              <button onClick={()=>deletePlayer(selPlayer.id)} style={{padding:"6px 14px",borderRadius:8,background:"rgba(239,68,68,.25)",border:"1px solid rgba(239,68,68,.5)",color:"#EF4444",cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>🗑 Confirm Delete</button>
            </div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"minmax(0,1.08fr) minmax(0,.92fr)",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Card style={{padding:0,overflow:"hidden",position:"relative",border:"1px solid rgba(255,255,255,.08)"}} hover={false}>
              <div style={{height:120,background:`radial-gradient(circle at top left,${accentColor}55,transparent 45%),linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.01))`}}/>
              <div style={{padding:"0 18px 18px"}}>
                <div style={{display:"flex",alignItems:"flex-end",gap:14,marginTop:-38,flexWrap:"wrap"}}>
                  <div style={{position:"relative",width:92,height:92,borderRadius:22,overflow:"hidden",background:"#0F172A",border:`3px solid ${accentColor}`,boxShadow:`0 14px 40px ${accentColor}33`,flexShrink:0}}>
                    <RobloxAvatar userId={rId} size={92} radius={19} sport={sport==="basketball"?"basketball":isBaseball?"baseball":"football"}/>
                  </div>
                  <div style={{flex:1,minWidth:0,paddingBottom:4}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?18:24,fontWeight:900,color:"#E2E8F0",lineHeight:1.05,overflow:"hidden",textOverflow:"ellipsis"}}>{selPlayer.name}</div>
                      <button onClick={()=>setConfirmDelete(selPlayer.id)} title="Delete member page" style={{flexShrink:0,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",borderRadius:8,padding:"4px 10px",cursor:"pointer",color:"#EF4444",fontSize:12,marginTop:2}}>🗑</button>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8,alignItems:"center"}}>
                      {selPlayer.position&&<span style={{padding:"4px 10px",borderRadius:999,background:`${accentColor}18`,border:`1px solid ${accentColor}33`,color:accentColor,fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:800}}>{selPlayer.position}</span>}
                      {selPlayer.team&&<span style={{padding:"4px 10px",borderRadius:999,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#CBD5E1",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{selPlayer.team}</span>}
                      {selPlayer.jersey&&<span style={{padding:"4px 10px",borderRadius:999,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#94A3B8",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>#{selPlayer.jersey}</span>}
                      {selPlayer.ovr&&<OVRBig ovr={selPlayer.ovr} size={30}/>}
                    </div>
                    {member&&<div style={{marginTop:8,fontSize:11,color:"#64748B"}}>@{member.username}{member.staff_role&&<span style={{marginLeft:8,color:ROLE_COLOR[member.staff_role]||"#00D4FF"}}>{member.staff_role}</span>}</div>}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8,marginTop:16}}>
                  {statRows.map((row,i)=>(
                    <div key={i} style={{padding:"10px 12px",borderRadius:14,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)"}}>
                      <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",letterSpacing:".08em",color:"#64748B"}}>{row.label.toUpperCase()}</div>
                      <div style={{marginTop:4,fontSize:13,fontWeight:800,color:"#E2E8F0"}}>{row.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14}}>
                  {member&&<Btn variant="ghost" size="sm" onClick={()=>navigate("profile",member.id)}>👤 View Nova Profile</Btn>}
                  {selPlayer.roblox_id&&<a href={`https://www.roblox.com/users/${selPlayer.roblox_id}/profile`} target="_blank" rel="noopener noreferrer"><Btn variant="ghost" size="sm">🎮 Roblox Profile</Btn></a>}
                </div>
              </div>
            </Card>

            <Card style={{padding:"16px"}} hover={false}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".1em",marginBottom:10}}>LINKS</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr",gap:10}}>
                <div><Lbl>Roblox ID</Lbl><input defaultValue={selPlayer.roblox_id||""} placeholder="Enter Roblox user ID…" onBlur={e=>{const val=e.target.value.trim();patchPlayer({roblox_id:val||null});}}/></div>
                <div><Lbl>Nova Account</Lbl>
                  <select value={selPlayer.nova_user_id||""} onChange={e=>patchPlayer({nova_user_id:e.target.value||null})} style={{width:"100%"}}>
                    <option value="">{linkedMember?"Change linked account…":"Search Nova member…"}</option>
                    {[...users].sort((a,b)=>(a.display_name||"").localeCompare(b.display_name||"")).map(u=><option key={u.id} value={u.id}>{u.display_name} (@{u.username})</option>)}
                  </select>
                </div>
                <div><Lbl>Walk-up Song</Lbl><input defaultValue={selPlayer.spotify_url||""} placeholder="Paste Spotify track or playlist URL…" onBlur={e=>{const val=e.target.value.trim();patchPlayer({spotify_url:val||null});}}/></div>
                {embedUrl&&<iframe src={embedUrl} width="100%" height="96" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{borderRadius:10,border:"none"}}/>}
              </div>
            </Card>
          </div>

          <Card style={{padding:"16px",border:"1px solid rgba(255,255,255,.08)"}} hover={false}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:12,flexWrap:"wrap"}}>
              <div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#334155",letterSpacing:".1em"}}>PLAYER STATS</div>
                <div style={{fontSize:12,color:"#94A3B8",marginTop:4}}>Modern stat editor + quick profile view</div>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[["season","📅 Season"],["career","🏆 Career"]].map(([t,l])=>(
                  <button key={t} onClick={()=>{setStatType(t);const ff=t==="season"?statField+"_season":statField;setStatData(selPlayer?.[ff]||{});}}
                    style={{padding:"5px 12px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
                      border:`1px solid ${statType===t?accentColor+"66":"rgba(255,255,255,.08)"}`,
                      background:statType===t?accentColor+"18":"rgba(255,255,255,.03)",
                      color:statType===t?accentColor:"#475569"}}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
              {FIELDS.map(([k,l])=>(
                <button key={k} onClick={()=>{setStatField(k);const ff=statType==="season"?k+"_season":k;setStatData(selPlayer?.[ff]||{});}}
                  style={{padding:"4px 10px",borderRadius:10,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
                    border:`1px solid ${statField===k?accentColor+"88":"rgba(255,255,255,.1)"}`,
                    background:statField===k?accentColor+"18":"rgba(255,255,255,.03)",
                    color:statField===k?accentColor:"#64748B"}}>{l}</button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(92px,1fr))",gap:8,marginBottom:12}}>
              {cols.map(c=>(
                <div key={c} style={{padding:"10px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)"}}>
                  <Lbl>{c}</Lbl>
                  <input value={statData[c]||""} onChange={e=>setStatData(p=>({...p,[c]:e.target.value}))} placeholder="—" style={{textAlign:"center"}}/>
                </div>
              ))}
            </div>
            <Btn onClick={saveStats} disabled={saving}>{saving?"Saving…":"💾 Save Stats"}</Btn>
          </Card>
        </div>
      </div>
    );
  }
  return(
    <div>
      {/* Header with Add button */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#94A3B8",fontWeight:700}}>👤 MEMBER PAGES ({players.length})</div>
        <button onClick={()=>setShowAdd(o=>!o)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,background:showAdd?accentColor+"22":"rgba(255,255,255,.05)",border:`1px solid ${showAdd?accentColor+"55":"rgba(255,255,255,.1)"}`,color:showAdd?accentColor:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>
          {showAdd?"✕ Cancel":"➕ Create Member Page"}
        </button>
      </div>
      {showAdd&&(
        <Card style={{padding:"16px",marginBottom:14}} hover={false}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:accentColor,marginBottom:12,fontWeight:700}}>CREATE MEMBER PAGE</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            <div style={{gridColumn:"1/-1"}}><Lbl>Player Name</Lbl><input value={addName} onChange={e=>setAddName(e.target.value)} placeholder="Full name…"/></div>
            <div style={{gridColumn:"1/-1"}}>
              <Lbl>Position(s) — select all that apply</Lbl>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:4}}>
                {positions.map(pos=>{
                  const sel=addPos.includes(pos);
                  return(
                    <button key={pos} type="button" onClick={()=>setAddPos(prev=>sel?prev.filter(x=>x!==pos):[...prev,pos])}
                      style={{padding:"4px 10px",borderRadius:8,cursor:"pointer",fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
                        border:`1px solid ${sel?accentColor+"88":"rgba(255,255,255,.1)"}`,
                        background:sel?accentColor+"22":"rgba(255,255,255,.03)",
                        color:sel?accentColor:"#64748B",transition:"all .15s"}}>
                      {pos}
                    </button>
                  );
                })}
              </div>
              {addPos.length>0&&<div style={{fontSize:9,color:accentColor,marginTop:5,fontFamily:"'Orbitron',sans-serif"}}>Selected: {addPos.join(" / ")}</div>}
            </div>
            <div>
              <Lbl>Team</Lbl>
              {leagueTeams.length>0
                ?<select value={addTeam} onChange={e=>setAddTeam(e.target.value)} style={{width:"100%"}}>
                    <option value="">— Free Agent —</option>
                    {leagueTeams.map(t=><option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                :<input value={addTeam} onChange={e=>setAddTeam(e.target.value)} placeholder="Team name…"/>}
            </div>
            <div><Lbl>Jersey #</Lbl><input value={addJersey} onChange={e=>setAddJersey(e.target.value)} placeholder="#"/></div>
          </div>
          <Btn onClick={addPlayer} disabled={addSaving||!addName.trim()||!addPos.length}>{addSaving?"Creating…":"✅ Create Page"}</Btn>
        </Card>
      )}
      {!players.length&&!showAdd&&<Empty icon={sport==="basketball"?"🏀":isBaseball?"⚾":"🏈"} msg="No member pages yet — click Create Member Page above"/>}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":isBaseball?"1fr 1fr":"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
        {players.filter(Boolean).map((p,i)=>{
          const m=p.nova_user_id?users.find(u=>u.id===p.nova_user_id):matchMember(p.name);
          const rid=p.roblox_id||m?.social_roblox||"";
          // Grab a couple of key season stats to show as pills
          const sKey=sport==="basketball"?"scoring_stats_season":isBaseball?"hitting_stats_season":"passing_stats_season";
          const sData=p[sKey]||{};
          const statPills=sport==="basketball"
            ?[["PTS",sData.PTS],["REB",sData.REB],["AST",sData.AST]]
            :isBaseball
              ?[["AVG",sData.AVG],["HR",sData.HR],["RBI",sData.RBI]]
              :[["YDS",sData.YDS],["TD",sData.TD],["RTG",sData.RTG]];
          const hasStats=statPills.some(([,v])=>v!==undefined&&v!=="");
          const ovrC=ovrColor(p.ovr);
          return(
            <div key={i} style={{borderRadius:14,overflow:"hidden",background:"rgba(255,255,255,.03)",border:`1px solid ${accentColor}22`,cursor:"pointer",transition:"all .2s",position:"relative"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`${accentColor}55`;e.currentTarget.style.background=`linear-gradient(135deg,${accentColor}0d,rgba(255,255,255,.04))`;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 28px ${accentColor}20`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=`${accentColor}22`;e.currentTarget.style.background="rgba(255,255,255,.03)";e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
              {/* Card top accent strip */}
              <div style={{height:3,background:`linear-gradient(90deg,${accentColor},${accentColor}44,transparent)`}}/>
              {/* Delete btn — top right */}
              <button onClick={e=>{e.stopPropagation();setConfirmDelete(p.id);setSel(p.id);}} title="Delete" style={{position:"absolute",top:10,right:10,background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",borderRadius:7,padding:"2px 7px",cursor:"pointer",color:"#EF4444",fontSize:11,zIndex:2}}>🗑</button>
              <div onClick={()=>{const f=sport==="basketball"?"scoring_stats":isBaseball?"hitting_stats":"passing_stats";setSel(p.id);setStatField(f);setStatType("season");setStatData(p[f+"_season"]||{});}} style={{padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  {/* Avatar */}
                  <div style={{position:"relative",flexShrink:0}}>
                    <div style={{width:52,height:52,borderRadius:12,overflow:"hidden",background:`linear-gradient(135deg,${accentColor}22,rgba(255,255,255,.06))`,border:`2px solid ${accentColor}44`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <RobloxAvatar userId={rid} size={52} radius={10} sport={sport==="basketball"?"basketball":isBaseball?"baseball":"football"}/>
                    </div>
                    {p.ovr&&<div style={{position:"absolute",bottom:-4,right:-4,padding:"2px 6px",borderRadius:6,background:ovrC,fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:900,color:"#030712",boxShadow:`0 2px 8px ${ovrC}88`}}>{p.ovr}</div>}
                  </div>
                  {/* Info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,color:"#E2E8F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:".02em"}}>{p.name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
                      <span style={{fontSize:10,color:accentColor,fontWeight:700,fontFamily:"'Orbitron',sans-serif"}}>{p.position}</span>
                      {p.jersey&&<span style={{fontSize:10,color:"#475569"}}>#{p.jersey}</span>}
                      {p.team&&<span style={{fontSize:9,padding:"2px 8px",borderRadius:20,background:`${accentColor}18`,border:`1px solid ${accentColor}33`,color:accentColor,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{p.team}</span>}
                    </div>
                    {m&&<div style={{fontSize:9,color:"#334155",marginTop:2,display:"flex",alignItems:"center",gap:4}}><span style={{opacity:.6}}>@{m.username}</span>{m.staff_role&&<span style={{color:ROLE_COLOR[m.staff_role]||"#00D4FF",fontSize:8,fontFamily:"'Orbitron',sans-serif"}}>{m.staff_role}</span>}</div>}
                  </div>
                  <span style={{color:"#334155",fontSize:16,flexShrink:0}}>›</span>
                </div>
                {/* Stat pills */}
                {hasStats&&(
                  <div style={{display:"flex",gap:6,marginTop:10,paddingTop:10,borderTop:`1px solid ${accentColor}18`}}>
                    {statPills.map(([label,val])=>val!==undefined&&val!==""?(
                      <div key={label} style={{flex:1,textAlign:"center",padding:"5px 0",borderRadius:8,background:`${accentColor}12`,border:`1px solid ${accentColor}20`}}>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#E2E8F0"}}>{val}</div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:accentColor,letterSpacing:".06em"}}>{label}</div>
                      </div>
                    ):null)}
                  </div>
                )}
              </div>
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



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
      {/* Dashboard tab groups */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        {/* Nova tabs — hidden for 2v2FF and RRAdmin */}
        {!isRRAdmin&&!is2v2FF&&!is3v3FF&&<div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginRight:4,flexShrink:0}}>NOVA</div>
          {[["members","👥 Members"],["badges","🏅 Badges"],["roles","⭐ Roles"],["stars","⭐ Stars"],["announce","📢 Announce"],["ratings","📊 Ratings"],["gm_ovr","🎮 GM OVRs"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:18,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"rgba(245,158,11,.5)":"rgba(255,255,255,.08)"}`,background:tab===t?"rgba(245,158,11,.12)":"rgba(255,255,255,.03)",color:tab===t?"#F59E0B":"#64748B",transition:"all .2s"}}>{l}</button>
          ))}
        </div>}
        {/* NFFL tabs — visible for owners, co-owners, AND 2v2FF */}
        {!isRRAdmin&&<div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginRight:4,flexShrink:0}}>🏈 2v2FF</div>
          {[["nffl_feed","📢 Game Feed"],["nffl_roster","👥 Roster"],["nffl_stats","📊 Stats"],["nffl_transactions","📋 Transactions"],["nffl_members","👤 Member Pages"],["nffl_teams","🏟 Teams"],["nffl_clips","🎬 Clips"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:18,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"rgba(245,158,11,.5)":"rgba(255,255,255,.08)"}`,background:tab===t?"rgba(245,158,11,.12)":"rgba(255,255,255,.03)",color:tab===t?"#F59E0B":"#64748B",transition:"all .2s"}}>{l}</button>
          ))}
        </div>}
        {/* NBBL tabs — hidden for 2v2FF (football-only role) */}
        {!isRRAdmin&&!is2v2FF&&!is3v3FF&&<div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginRight:4,flexShrink:0}}>⚾ Baseball League</div>
          {[["nbbl_feed","📢 Game Feed"],["nbbl_roster","👥 Roster"],["nbbl_stats","📊 Stats"],["nbbl_transactions","📋 Transactions"],["nbbl_members","👤 Member Pages"],["nbbl_teams","🏟 Teams"],["nbbl_clips","🎬 Clips"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:18,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"rgba(34,197,94,.5)":"rgba(255,255,255,.08)"}`,background:tab===t?"rgba(34,197,94,.12)":"rgba(255,255,255,.03)",color:tab===t?"#22C55E":"#64748B",transition:"all .2s"}}>{l}</button>
          ))}
        </div>}
        {/* Ring Rush tabs — hidden for 2v2FF */}
        {!is2v2FF&&!is3v3FF&&<div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{fontSize:8,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",marginRight:4,flexShrink:0}}>🏀 Basketball League</div>
          {[["rr_feed","📢 Game Feed"],["rr_roster","👥 Roster"],["rr_stats","📊 Stats"],["rr_transactions","📋 Transactions"],["rr_members","👤 Member Pages"],["rr_teams","🏟 Teams"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:18,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"rgba(236,72,153,.5)":"rgba(255,255,255,.08)"}`,background:tab===t?"rgba(236,72,153,.12)":"rgba(255,255,255,.03)",color:tab===t?"#EC4899":"#64748B",transition:"all .2s"}}>{l}</button>
          ))}
        </div>}
      </div>
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
      {tab==="stars"&&(
        <div style={{maxWidth:600}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#94A3B8",marginBottom:16,letterSpacing:".12em"}}>⭐ STAR MANAGEMENT</div>
          <Card style={{padding:20,marginBottom:16}}>
            <Lbl>Select Member</Lbl>
            <select value={starTarget} onChange={e=>{setStarTarget(e.target.value);if(e.target.value)loadStarBalance(e.target.value);}} style={{width:"100%",marginBottom:14}}>
              <option value="">— Pick a member —</option>
              {[...users].sort((a,b)=>a.display_name.localeCompare(b.display_name)).map(u=>(
                <option key={u.id} value={u.id}>{u.display_name} (@{u.username})</option>
              ))}
            </select>
            {starTarget&&(
              <div style={{fontSize:11,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",marginBottom:14}}>
                Current balance: {starBalances[starTarget]!==undefined?`${starBalances[starTarget].toLocaleString()} ⭐`:"loading..."}
              </div>
            )}
            <Lbl>Amount (use negative to remove stars)</Lbl>
            <input type="number" value={starAmount} onChange={e=>setStarAmount(e.target.value)} placeholder="e.g. 500 or -100" style={{marginBottom:12}}/>
            <Lbl>Reason (optional)</Lbl>
            <input value={starReason} onChange={e=>setStarReason(e.target.value)} placeholder="e.g. Community event prize" style={{marginBottom:16}}/>
            {starMsg&&<div style={{padding:"10px 14px",borderRadius:8,background:starMsg.color+"18",border:`1px solid ${starMsg.color}44`,color:starMsg.color,fontSize:12,fontFamily:"'Orbitron',sans-serif",fontWeight:700,marginBottom:12}}>{starMsg.msg}</div>}
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={giveStars} disabled={starLoading||!starTarget||!starAmount} style={{flex:1}}>{starLoading?"Working...":"⭐ Apply Stars"}</Btn>
              <Btn variant="ghost" onClick={async()=>{
                const allRows=await sb.get("nova_stars","?order=balance.desc&limit=20");
                const updated={};
                (allRows||[]).forEach(r=>{updated[r.user_id]=r.balance||0;});
                setStarBalances(p=>({...p,...updated}));
              }}>Refresh All</Btn>
            </div>
          </Card>
          <Card style={{padding:16}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,color:"#475569",letterSpacing:".12em",marginBottom:12}}>TOP STAR BALANCES</div>
            {Object.entries(starBalances).length===0&&<div style={{fontSize:11,color:"#334155"}}>Click "Refresh All" to load balances</div>}
            {Object.entries(starBalances).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([uid,bal])=>{
              const u=users.find(x=>x.id===uid);if(!u)return null;
              return(
                <div key={uid} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.05)",cursor:"pointer"}} onClick={()=>{setStarTarget(uid);setTab("stars");}}>
                  <Av user={u} size={28}/>
                  <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif"}}>{u.display_name}</div></div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,color:"#F59E0B"}}>{bal.toLocaleString()} ⭐</div>
                </div>
              );
            })}
          </Card>
        </div>
      )}
      {tab==="announce"&&(
        <div style={{maxWidth:600}}>
          <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#94A3B8",marginBottom:16,letterSpacing:".1em"}}>SEND ANNOUNCEMENT</h2>
          <Card style={{padding:20,marginBottom:20}}>
            <Lbl>Message (sent as notification to all members)</Lbl>
            <textarea value={announce} onChange={e=>setAnnounce(e.target.value)} placeholder="Type your announcement..." style={{resize:"vertical",minHeight:100,width:"100%",marginBottom:12,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <Btn onClick={sendAnnouncement} disabled={!announce.trim()}>📢 Send to All</Btn>
              {announceSent&&<span style={{fontSize:12,color:"#22C55E",fontFamily:"'Orbitron',sans-serif"}}>✓ Sent!</span>}
            </div>
          </Card>
          {announcements.length>0&&(
            <div>
              <h3 style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"#475569",marginBottom:10,letterSpacing:".1em"}}>RECENT ANNOUNCEMENTS</h3>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {announcements.map((a,i)=>(
                  <Card key={i} style={{padding:"12px 16px"}}>
                    <div style={{fontSize:13,color:"#E2E8F0",marginBottom:4}}>{a.text}</div>
                    <div style={{fontSize:10,color:"#334155"}}>{fmtAgo(a.ts)}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* NFFL flat tabs */}
      {tab==="gm_ovr"&&<DashGMOvrTab cu={cu}/>}
      {tab==="ratings"&&<DashRatingsTab league="nffl" accentColor="#F59E0B" label="2v2FF"/>}
      {tab==="ratings"&&<DashRatingsTab league="nbbl" accentColor="#22C55E" label="Baseball League"/>}
      {tab==="ratings"&&<DashRatingsTab league="ringrush" accentColor="#EC4899" label="Basketball League"/>}
      {!isRRAdmin&&tab==="nffl_feed"&&<DashLeagueFeed league="nffl" accentColor="#F59E0B" cu={cu}/>}
      {!isRRAdmin&&tab==="nffl_roster"&&<DashLeagueRoster league="nffl" accentColor="#F59E0B" cu={cu}/>}
      {tab==="nffl_stats"&&<DashLeagueStats league="nffl" accentColor="#F59E0B" isBaseball={false}/>}
      {tab==="nffl_transactions"&&<DashLeagueTx league="nffl" accentColor="#F59E0B"/>}
      {tab==="nffl_members"&&<DashLeagueMembers league="nffl" accentColor="#F59E0B" users={users} isBaseball={false} canDelete={cu?.is_owner||isCoOwner||is2v2FF||is3v3FF}/>}
      {tab==="nffl_clips"&&<DashLeagueClips league="nffl" accentColor="#F59E0B"/>}
      {/* NBBL flat tabs */}
      {tab==="nbbl_feed"&&<DashLeagueFeed league="nbbl" accentColor="#22C55E" cu={cu}/>}
      {tab==="nbbl_roster"&&<DashLeagueRoster league="nbbl" accentColor="#22C55E" cu={cu}/>}
      {tab==="nbbl_stats"&&<DashLeagueStats league="nbbl" accentColor="#22C55E" isBaseball={true}/>}
      {tab==="nbbl_transactions"&&<DashLeagueTx league="nbbl" accentColor="#22C55E"/>}
      {tab==="nbbl_members"&&<DashLeagueMembers league="nbbl" accentColor="#22C55E" users={users} isBaseball={true}/>}
      {tab==="nbbl_clips"&&<DashLeagueClips league="nbbl" accentColor="#22C55E"/>}
      {/* Ring Rush */}
      {tab==="nffl_teams"&&<DashLeagueTeams league="nffl" accentColor="#F59E0B"/>}
      {tab==="nbbl_teams"&&<DashLeagueTeams league="nbbl" accentColor="#22C55E"/>}
      {tab==="rr_feed"&&<DashLeagueFeed league="ringrush" accentColor="#EC4899" cu={cu}/>}
      {tab==="rr_roster"&&<DashLeagueRoster league="ringrush" accentColor="#EC4899" cu={cu} sport="basketball"/>}
      {tab==="rr_stats"&&<DashLeagueStats league="ringrush" accentColor="#EC4899" isBaseball={false} sport="basketball"/>}
      {tab==="rr_transactions"&&<DashLeagueTx league="ringrush" accentColor="#EC4899"/>}
      {tab==="rr_members"&&<DashLeagueMembers league="ringrush" accentColor="#EC4899" users={users} isBaseball={false} sport="basketball"/>}
      {tab==="rr_teams"&&<DashLeagueTeams league="ringrush" accentColor="#EC4899"/>}
    </div>
  );
}

