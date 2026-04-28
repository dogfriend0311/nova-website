import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "./shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "./UI";

export default function Navbar({cu,onLogin,onRegister,onLogout,nav,page,notifs,onReadNotifs,onClearNotifs,onMarkOneNotif,users,msgUnread}){
  const mob=useIsMobile();
  const[gamesOpen,setGamesOpen]=useState(false);
  const gamesRef=useRef(null);
  const GAMES_PAGES=["trivia","leaderboard","cards","gmmode","animecards"];
  const HUB_PAGES=["hub","stats","news","predict"];
  const dTabs=[["home","Home"],["members","Members"],["feed","🎬 Feed"]];
  const mTabs=[{p:"home",icon:"🏠",lbl:"Home"},{p:"hub",icon:"📊",lbl:"Hub"},{p:"feed",icon:"🎬",lbl:"Feed"},{p:"members",icon:"👥",lbl:"Members"},{p:"messages",icon:"💬",lbl:"DMs",badge:msgUnread}];
  // Close dropdowns on outside click
  useEffect(()=>{
    const h=(e)=>{
      if(gamesRef.current&&!gamesRef.current.contains(e.target))setGamesOpen(false);
    };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);
  return (
    <>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:62,display:"flex",alignItems:"center",justifyContent:"space-between",padding:mob?"0 12px":"0 20px",background:"rgba(3,7,18,.97)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,.055)"}}>
        <div style={{display:"flex",alignItems:"center",gap:mob?8:16}}>
          <button onClick={()=>nav("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:20}}>💫</span>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:mob?15:17,letterSpacing:".12em",background:"linear-gradient(135deg,#fff 10%,#00D4FF 55%,#8B5CF6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NOVA</span>
          </button>
          {!mob&&(
            <div style={{display:"flex",gap:1,alignItems:"center"}}>
              {dTabs.map(([p,l])=><button key={p} onClick={()=>nav(p)} style={{background:page===p?"rgba(0,212,255,.09)":"none",border:page===p?"1px solid rgba(0,212,255,.2)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:page===p?"#00D4FF":"#94A3B8",transition:"all .2s",whiteSpace:"nowrap"}}>{l}</button>)}
              {/* Hub tab — News + Stats + Predict */}
              <button onClick={()=>nav("hub")} style={{background:HUB_PAGES.includes(page)?"rgba(0,212,255,.09)":"none",border:HUB_PAGES.includes(page)?"1px solid rgba(0,212,255,.2)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:HUB_PAGES.includes(page)?"#00D4FF":"#94A3B8",transition:"all .2s",whiteSpace:"nowrap"}}>📊 Hub</button>
              <button onClick={()=>nav("nbbl")} style={{background:page==="nbbl"?"rgba(34,197,94,.09)":"none",border:page==="nbbl"?"1px solid rgba(34,197,94,.25)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:page==="nbbl"?"#22C55E":"#94A3B8",transition:"all .2s",display:"flex",alignItems:"center",gap:5}}>
                  ⚾ Baseball League
              </button>
              {/* Games dropdown */}
              <div ref={gamesRef} style={{position:"relative"}}>
                <button onClick={()=>setGamesOpen(o=>!o)} style={{background:GAMES_PAGES.includes(page)?"rgba(168,85,247,.09)":"none",border:GAMES_PAGES.includes(page)?"1px solid rgba(168,85,247,.25)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:GAMES_PAGES.includes(page)?"#A855F7":"#94A3B8",transition:"all .2s",display:"flex",alignItems:"center",gap:5}}>
                  🎮 Games <span style={{fontSize:9,opacity:.7,transition:"transform .2s",transform:gamesOpen?"rotate(180deg)":"rotate(0deg)",display:"inline-block"}}>▼</span>
                </button>
                {gamesOpen&&(
                  <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,background:"linear-gradient(160deg,#0c1220,#10172a)",border:"1px solid rgba(168,85,247,.25)",borderRadius:12,padding:6,minWidth:160,zIndex:200,boxShadow:"0 16px 40px rgba(0,0,0,.7)"}}>
                    {[["gmmode","🏆","GM Mode","Be the GM of any pro sports team — trades, draft, simulate a season"],["cards","⚾","Nova Cards","Collect & level up MLB player cards"],["animecards","🌸","Anime Cards","Collect, build decks & battle with anime characters"],["trivia","🧠","Trivia","Test your sports knowledge"],["leaderboard","🏆","Leaderboard","Top members ranked"]].map(([p,icon,label,desc])=>(
                      <button key={p} onClick={()=>{nav(p);setGamesOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",borderRadius:8,background:page===p?"rgba(168,85,247,.12)":"none",border:"none",cursor:"pointer",textAlign:"left",transition:"background .15s"}}>
                        <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:page===p?"#A855F7":"#E2E8F0"}}>{label}</div>
                          <div style={{fontSize:10,color:"#475569"}}>{desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {(cu?.is_owner||cu?.staff_role==="Co-owner")&&<button onClick={()=>nav("dashboard")} style={{background:page==="dashboard"?"rgba(245,158,11,.09)":"none",border:page==="dashboard"?"1px solid rgba(245,158,11,.2)":"1px solid transparent",cursor:"pointer",padding:"4px 11px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,color:page==="dashboard"?"#F59E0B":"#94A3B8"}}>⚡ Dashboard</button>}
            </div>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:mob?6:8}}>
          {cu ? (
            <>
              <NotifBell notifs={notifs} onRead={onReadNotifs} onClear={onClearNotifs} onMarkOne={onMarkOneNotif} navigate={nav} users={users}/>
              {!mob&&(
                <button onClick={()=>nav("messages")} style={{position:"relative",background:page==="messages"?"rgba(0,212,255,.1)":"none",border:`1px solid ${page==="messages"?"rgba(0,212,255,.3)":"rgba(255,255,255,.09)"}`,borderRadius:9,width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>
                  💬
                  {msgUnread>0&&<div style={{position:"absolute",top:-4,right:-4,width:17,height:17,borderRadius:"50%",background:"linear-gradient(135deg,#00D4FF,#8B5CF6)",color:"white",fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",border:"2px solid #030712"}}>{msgUnread>9?"9+":msgUnread}</div>}
                </button>
              )}
              <button onClick={()=>nav("profile",cu.id)} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",borderRadius:9,padding:mob?"4px 8px":"4px 10px",cursor:"pointer",color:"#E2E8F0",fontFamily:"'Rajdhani',sans-serif",fontSize:12,fontWeight:600}}>
                <div style={{position:"relative",width:26,height:26,borderRadius:"50%",overflow:"hidden",background:`radial-gradient(circle,${cu.page_accent||"#00D4FF"}44,rgba(0,0,0,.7))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
                  {cu.avatar_url?<img src={cu.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:cu.avatar}
                  <StatusDot type={cu.status_type||"offline"} size={8} style={{position:"absolute",bottom:-1,right:-1}}/>
                </div>
                {!mob&&<span style={{maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cu.display_name}</span>}
              </button>
              {!mob&&<Btn variant="muted" size="sm" onClick={onLogout}>Out</Btn>}
              {mob&&(cu?.is_owner||cu?.staff_role==="Co-owner")&&<button onClick={()=>nav("dashboard")} style={{background:"none",border:"1px solid rgba(245,158,11,.3)",borderRadius:8,padding:"4px 8px",cursor:"pointer",fontSize:11,color:"#F59E0B",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>⚡</button>}
            </>
          ) : (
            <>
              <Btn variant="ghost" size="sm" onClick={onLogin}>Sign In</Btn>
              <Btn variant="primary" size="sm" onClick={onRegister}>{mob?"Join":"Join Nova"}</Btn>
            </>
          )}
        </div>
      </nav>
      {mob&&(
        <div className="mob-nav">
          {mTabs.map(t=>(
            <button key={t.p} className="mob-tab" onClick={()=>nav(t.p)} style={{color:page===t.p?"#00D4FF":"#475569"}}>
              <span className="mob-tab-icon" style={{position:"relative"}}>
                {t.icon}
                {t.badge>0&&<span style={{position:"absolute",top:-4,right:-6,width:15,height:15,borderRadius:"50%",background:"#EF4444",color:"white",fontSize:8,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",border:"1.5px solid #030712"}}>{t.badge>9?"9+":t.badge}</span>}
              </span>
              <span className="mob-tab-label" style={{color:page===t.p?"#00D4FF":"#475569"}}>{t.lbl}</span>
            </button>
          ))}
          {/* Games button on mobile */}
          <button className="mob-tab" onClick={()=>setGamesOpen(o=>!o)} style={{color:GAMES_PAGES.includes(page)?"#A855F7":"#475569"}}>
            <span className="mob-tab-icon">🎮</span>
            <span className="mob-tab-label" style={{color:GAMES_PAGES.includes(page)?"#A855F7":"#475569"}}>Games</span>
          </button>
        </div>
      )}
      {/* Mobile games sheet */}
      {mob&&gamesOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.7)"}} onClick={()=>setGamesOpen(false)}>
          <div style={{position:"absolute",bottom:70,left:0,right:0,background:"linear-gradient(160deg,#0c1220,#10172a)",borderTop:"1px solid rgba(168,85,247,.25)",borderRadius:"20px 20px 0 0",padding:"20px 16px"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".12em",marginBottom:14}}>🎮 GAMES</div>
            {[["gmmode","🏆","GM Mode","Be the GM of any pro sports team — trades, draft, simulate a season"],["cards","⚾","Nova Cards","Collect & level up MLB player cards"],["animecards","🌸","Anime Cards","Collect, build decks & battle with anime characters"],["trivia","🧠","Trivia","Test your sports knowledge"],["leaderboard","🏆","Leaderboard","Top members ranked"]].map(([p,icon,label,desc])=>(
              <button key={p} onClick={()=>{nav(p);setGamesOpen(false);}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 14px",borderRadius:12,background:page===p?"rgba(168,85,247,.12)":"rgba(255,255,255,.03)",border:"1px solid "+(page===p?"rgba(168,85,247,.3)":"rgba(255,255,255,.06)"),marginBottom:8,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:22}}>{icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:page===p?"#A855F7":"#E2E8F0"}}>{label}</div>
                  <div style={{fontSize:11,color:"#475569"}}>{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── Messages ──────────────────────────────────────────────────────────────────

