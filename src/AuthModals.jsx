import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "./shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "./UI";

// ─── Auth Modals ───────────────────────────────────────────────────────────────
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

