import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "../shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "../components/UI";

// ─── Feed ──────────────────────────────────────────────────────────────────────
export default function FeedPage({users,cu,likes,onLike,navigate}){
  const mob=useIsMobile();
  const[feedIdx,setFeedIdx]=useState(0);
  const feedRef=useRef(null);
  const allClips=[];
  users.forEach(u=>{
    (u.page_clips||[]).forEach(c=>allClips.push({...c,owner:u}));
    (u.page_social||[]).forEach(c=>allClips.push({...c,owner:u}));
  });
  allClips.sort((a,b)=>(b.ts||0)-(a.ts||0));
  useEffect(()=>{
    const el=feedRef.current; if(!el)return;
    const h=()=>setFeedIdx(Math.round(el.scrollTop/el.clientHeight));
    el.addEventListener("scroll",h,{passive:true});
    return()=>el.removeEventListener("scroll",h);
  },[]);
  const feedH=mob?"calc(100vh - 120px)":"calc(100vh - 62px)";
  if(!allClips.length)return(
    <div style={{height:feedH,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,color:"#334155"}}>
      <div style={{fontSize:48}}>🎬</div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14}}>No clips yet</div>
    </div>
  );
  return(
    <div ref={feedRef} className="feed-wrap" style={{height:feedH}}>
      {allClips.map((c,i)=>{
        const active=i===feedIdx;
        const liked=cu&&(likes[c.id]||[]).includes(cu.id);
        const likeCount=(likes[c.id]||[]).length;
        return(
          <div key={c.id+i} className="feed-item" style={{height:feedH,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",background:"#000",overflow:"hidden"}}>
            <div style={{width:"100%",maxWidth:520,padding:"0 16px",zIndex:2,position:"relative"}}>
              {c.type==="video"&&c.url&&<video src={c.url} controls={active} autoPlay={active} muted loop style={{width:"100%",maxHeight:"75vh",borderRadius:16,objectFit:"contain",background:"#000"}}/>}
              {c.type==="youtube"&&c.eid&&<iframe src={`https://www.youtube.com/embed/${c.eid}`} width="100%" height="420" frameBorder="0" allow="accelerometer;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{borderRadius:16}}/>}
              {(c.type==="link"||c.type==="medal")&&(
                <div style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,padding:28,textAlign:"center"}}>
                  <div style={{fontSize:48,marginBottom:12}}>🎮</div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,color:"#E2E8F0",marginBottom:12}}>{c.title}</div>
                  <a href={c.url} target="_blank" rel="noopener noreferrer"><Btn variant="ghost">▶ Watch Clip</Btn></a>
                </div>
              )}
            </div>
            <div style={{position:"absolute",right:16,bottom:"15%",display:"flex",flexDirection:"column",gap:18,alignItems:"center",zIndex:10}}>
              <button onClick={()=>cu&&onLike(c.id,liked)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",color:liked?"#EF4444":"rgba(255,255,255,.8)"}}>
                <span style={{fontSize:32}}>{liked?"❤️":"🤍"}</span>
                <span style={{fontSize:11,fontWeight:700,fontFamily:"'Orbitron',sans-serif",color:"white",textShadow:"0 1px 4px rgba(0,0,0,.8)"}}>{likeCount}</span>
              </button>
              <button onClick={()=>navigate("profile",c.owner.id)} style={{background:"none",border:"none",cursor:"pointer"}}>
                <Av user={c.owner} size={44}/>
              </button>
            </div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"60px 60px 24px 16px",background:"linear-gradient(transparent,rgba(0,0,0,.85))",zIndex:5}}>
              <div onClick={()=>navigate("profile",c.owner.id)} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,cursor:"pointer"}}>
                <Av user={c.owner} size={32}/>
                <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"white"}}>{c.owner.display_name}</span>
              </div>
              <div style={{fontSize:14,color:"rgba(255,255,255,.9)",fontWeight:600}}>{c.title}</div>
            </div>
            {i===0&&allClips.length>1&&<div style={{position:"absolute",bottom:80,left:"50%",transform:"translateX(-50%)",fontSize:11,color:"rgba(255,255,255,.3)",fontFamily:"'Orbitron',sans-serif",letterSpacing:".1em",zIndex:10}}>SCROLL FOR MORE ↓</div>}
          </div>
        );
      })}
    </div>
  );
}

