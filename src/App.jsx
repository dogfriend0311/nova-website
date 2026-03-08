import { useState, useRef, useEffect } from "react";

const SUPABASE_URL      = "https://expzaiduzjehvyfclnnj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cHphaWR1emplaHZ5ZmNsbm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTUwNTQsImV4cCI6MjA4ODI3MTA1NH0.ZZrWRASkBWha6XDuw23bazoXK224diM0HTlgPkdLCy0";
const LIVE = true;

const H = (extra={}) => ({ apikey:SUPABASE_ANON_KEY, Authorization:`Bearer ${SUPABASE_ANON_KEY}`, "Content-Type":"application/json", ...extra });
const sbUp = async (bucket,uid,file,pre="") => {
  const path=`${pre}${uid}-${Date.now()}.${file.name.split(".").pop()}`;
  const r=await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,{method:"POST",headers:{apikey:SUPABASE_ANON_KEY,Authorization:`Bearer ${SUPABASE_ANON_KEY}`,"Content-Type":file.type},body:file});
  return r.ok?`${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`:null;
};
const sb = {
  get:    async(t,q="")  =>{ try{const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}${q}`,{headers:H()});if(!r.ok){const e=await r.text();console.error("sb.get error",t,q,e);return null;}return r.json();}catch(e){console.error("sb.get",e);return null;}},
  post:   async(t,b)     =>{ try{const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}`,{method:"POST",headers:H({Prefer:"return=representation"}),body:JSON.stringify(b)});if(!r.ok){const e=await r.text();console.error("sb.post error",t,e);return null;}return r.json();}catch(e){console.error("sb.post",e);return null;}},
  patch:  async(t,q,b)   =>{ try{const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}${q}`,{method:"PATCH",headers:H({Prefer:"return=representation"}),body:JSON.stringify(b)});return r.ok?r.json():null;}catch(e){console.error("sb.patch",e);return null;}},
  del:    async(t,q)     =>{ try{await fetch(`${SUPABASE_URL}/rest/v1/${t}${q}`,{method:"DELETE",headers:H()});}catch(e){console.error("sb.del",e);}},
  upload: (uid,file)     => sbUp("nova-avatars",uid,file),
  uploadBanner:(uid,file,slot)=>sbUp("nova-banners",uid,file,`${slot}-`),
  uploadClip: (uid,file) => sbUp("nova-clips",uid,file),
};

const getSession  = () => { try{ return JSON.parse(localStorage.getItem("nova_session")); }catch{ return null; } };
const saveSession = u  => { try{ localStorage.setItem("nova_session", JSON.stringify(u)); }catch{} };
const clearSess   = () => { try{ localStorage.removeItem("nova_session"); }catch{} };

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#030712;color:#E2E8F0;font-family:'Rajdhani',sans-serif;overflow-x:hidden}
  @keyframes twinkle{0%{opacity:.1;transform:scale(.7)}100%{opacity:1;transform:scale(1.4)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  @keyframes bellShake{0%,100%{transform:rotate(0)}20%{transform:rotate(-14deg)}40%{transform:rotate(14deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(8deg)}}
  @keyframes badgePop{0%{transform:scale(0) rotate(-15deg);opacity:0}70%{transform:scale(1.15) rotate(4deg)}100%{transform:scale(1) rotate(0);opacity:1}}
  @keyframes carouselIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
  .fadeUp{animation:fadeUp .55s ease both}
  .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
  .notif-item{animation:slideIn .25s ease both}
  .badge-pop{animation:badgePop .4s cubic-bezier(.34,1.56,.64,1) both}
  .carousel-slide{animation:carouselIn .3s ease both}
  .bell-shake{animation:bellShake .6s ease}
  a{color:inherit;text-decoration:none}
  input,textarea,select{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#E2E8F0;font-family:'Rajdhani',sans-serif;font-size:15px;padding:10px 14px;outline:none;width:100%;transition:border-color .2s,box-shadow .2s}
  input:focus,textarea:focus,select:focus{border-color:#00D4FF;box-shadow:0 0 0 3px rgba(0,212,255,.1)}
  input::placeholder,textarea::placeholder{color:#475569}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#030712}::-webkit-scrollbar-thumb{background:rgba(0,212,255,.2);border-radius:4px}
  iframe{display:block}
  .comment-row:hover .del-btn{opacity:1!important}
`;

const gid = () => "x"+Date.now()+Math.random().toString(36).slice(2,5);
const extractSpotify = u => { const m=u.match(/track\/([A-Za-z0-9]+)/); return m?m[1]:null; };
const extractYouTube = u => { const m=u.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/); return m?m[1]:null; };
const extractMedal   = u => { const m=u.match(/clips\/(\d+)/); return m?m[1]:null; };
const ROLE_COLOR = { Owner:"#F59E0B", Moderator:"#00D4FF", "Event Host":"#A78BFA", Helper:"#34D399" };
const STATUS_META = {
  online: {color:"#22C55E",label:"Online"},
  idle:   {color:"#EAB308",label:"Idle"},
  dnd:    {color:"#EF4444",label:"Do Not Disturb"},
  offline:{color:"#6B7280",label:"Offline"},
};

const ALL_BADGES = [
  {id:"og",        icon:"👑",label:"OG Member",       desc:"Been here since the start",       color:"#F59E0B"},
  {id:"nova_star", icon:"💫",label:"Nova Star",        desc:"Exceptional community member",    color:"#00D4FF"},
  {id:"watchparty",icon:"🎬",label:"Watch Party Reg",  desc:"Never misses a movie night",      color:"#A78BFA"},
  {id:"baseball",  icon:"⚾",label:"Baseball Fan",     desc:"Die-hard sports watcher",         color:"#34D399"},
  {id:"gamer",     icon:"🎮",label:"Gaming Legend",    desc:"Dominates every game night",      color:"#F472B6"},
  {id:"music",     icon:"🎵",label:"Music Guru",       desc:"The server DJ",                   color:"#818CF8"},
  {id:"social",    icon:"🤝",label:"Social Butterfly", desc:"Talks to everyone",               color:"#2DD4BF"},
  {id:"champ",     icon:"🏆",label:"Tourney Champ",    desc:"Tournament winner",               color:"#FB923C"},
  {id:"earlybird", icon:"🚀",label:"Early Adopter",    desc:"One of the first to join",        color:"#C084FC"},
  {id:"commfave",  icon:"🌟",label:"Community Fave",   desc:"Loved by everyone in the server", color:"#FBBF24"},
];

const MLB_TEAMS = [
  {id:"mlb_nyy",abbr:"NYY",name:"Yankees",   color:"#003087",div:"AL East"},
  {id:"mlb_bos",abbr:"BOS",name:"Red Sox",   color:"#BD3039",div:"AL East"},
  {id:"mlb_tor",abbr:"TOR",name:"Blue Jays", color:"#134A8E",div:"AL East"},
  {id:"mlb_bal",abbr:"BAL",name:"Orioles",   color:"#DF4601",div:"AL East"},
  {id:"mlb_tb", abbr:"TB", name:"Rays",      color:"#8FBCE6",div:"AL East"},
  {id:"mlb_cws",abbr:"CWS",name:"White Sox", color:"#27251F",div:"AL Central"},
  {id:"mlb_cle",abbr:"CLE",name:"Guardians", color:"#00385D",div:"AL Central"},
  {id:"mlb_det",abbr:"DET",name:"Tigers",    color:"#0C2340",div:"AL Central"},
  {id:"mlb_kc", abbr:"KC", name:"Royals",    color:"#004687",div:"AL Central"},
  {id:"mlb_min",abbr:"MIN",name:"Twins",     color:"#002B5C",div:"AL Central"},
  {id:"mlb_hou",abbr:"HOU",name:"Astros",    color:"#EB6E1F",div:"AL West"},
  {id:"mlb_laa",abbr:"LAA",name:"Angels",    color:"#BA0021",div:"AL West"},
  {id:"mlb_oak",abbr:"OAK",name:"Athletics", color:"#003831",div:"AL West"},
  {id:"mlb_sea",abbr:"SEA",name:"Mariners",  color:"#0C2C56",div:"AL West"},
  {id:"mlb_tex",abbr:"TEX",name:"Rangers",   color:"#003278",div:"AL West"},
  {id:"mlb_atl",abbr:"ATL",name:"Braves",    color:"#CE1141",div:"NL East"},
  {id:"mlb_mia",abbr:"MIA",name:"Marlins",   color:"#00A3E0",div:"NL East"},
  {id:"mlb_nym",abbr:"NYM",name:"Mets",      color:"#002D72",div:"NL East"},
  {id:"mlb_phi",abbr:"PHI",name:"Phillies",  color:"#E81828",div:"NL East"},
  {id:"mlb_wsh",abbr:"WSH",name:"Nationals", color:"#AB0003",div:"NL East"},
  {id:"mlb_chc",abbr:"CHC",name:"Cubs",      color:"#0E3386",div:"NL Central"},
  {id:"mlb_cin",abbr:"CIN",name:"Reds",      color:"#C6011F",div:"NL Central"},
  {id:"mlb_mil",abbr:"MIL",name:"Brewers",   color:"#12284B",div:"NL Central"},
  {id:"mlb_pit",abbr:"PIT",name:"Pirates",   color:"#FDB827",div:"NL Central"},
  {id:"mlb_stl",abbr:"STL",name:"Cardinals", color:"#C41E3A",div:"NL Central"},
  {id:"mlb_ari",abbr:"ARI",name:"D-backs",   color:"#A71930",div:"NL West"},
  {id:"mlb_col",abbr:"COL",name:"Rockies",   color:"#33006F",div:"NL West"},
  {id:"mlb_lad",abbr:"LAD",name:"Dodgers",   color:"#005A9C",div:"NL West"},
  {id:"mlb_sd", abbr:"SD", name:"Padres",    color:"#2F241D",div:"NL West"},
  {id:"mlb_sf", abbr:"SF", name:"Giants",    color:"#FD5A1E",div:"NL West"},
];

const SOCIAL_PLATFORMS = [
  {key:"roblox",    icon:"🎮",label:"Roblox",    isLink:true,  url:u=>`https://www.roblox.com/users/search?keyword=${u}`},
  {key:"instagram", icon:"📸",label:"Instagram", isLink:true,  url:u=>`https://instagram.com/${u}`},
  {key:"twitter",   icon:"🐦",label:"Twitter/X", isLink:true,  url:u=>`https://twitter.com/${u}`},
  {key:"youtube",   icon:"▶️",label:"YouTube",   isLink:true,  url:u=>u.startsWith("http")?u:`https://youtube.com/@${u}`},
  {key:"discord",   icon:"💬",label:"Discord",   isLink:false, url:null},
];

const fmtTime = ts => {
  const d=Math.floor((Date.now()-ts)/1000);
  if(d<60)return "just now";
  if(d<3600)return `${Math.floor(d/60)}m ago`;
  if(d<86400)return `${Math.floor(d/3600)}h ago`;
  return new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric"});
};

function Btn({children,onClick,variant="primary",size="md",style:ext={},disabled}){
  const [h,setH]=useState(false);
  const base={display:"inline-flex",alignItems:"center",gap:6,cursor:disabled?"not-allowed":"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".06em",border:"none",borderRadius:8,transition:"all .22s ease",opacity:disabled?.5:1,fontSize:size==="sm"?10:size==="lg"?14:11,padding:size==="sm"?"6px 13px":size==="lg"?"14px 32px":"8px 16px"};
  const vars={
    primary:{background:h?"linear-gradient(135deg,#00bfea,#7c3aed)":"linear-gradient(135deg,#00D4FF,#8B5CF6)",color:"#fff",boxShadow:h?"0 8px 28px rgba(0,212,255,.35)":"none"},
    ghost:  {background:h?"rgba(0,212,255,.1)":"transparent",border:"1px solid rgba(0,212,255,.4)",color:"#00D4FF"},
    danger: {background:h?"rgba(239,68,68,.25)":"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.35)",color:"#EF4444"},
    muted:  {background:h?"rgba(255,255,255,.1)":"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#94A3B8"},
    follow: {background:h?"rgba(0,212,255,.18)":"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.35)",color:"#00D4FF"},
    unfollow:{background:h?"rgba(239,68,68,.15)":"rgba(255,255,255,.05)",border:`1px solid ${h?"rgba(239,68,68,.4)":"rgba(255,255,255,.12)"}`,color:h?"#EF4444":"#94A3B8"},
  };
  return <button style={{...base,...vars[variant],transform:h&&!disabled?"translateY(-1px)":"", ...ext}} onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>{children}</button>;
}

function RoleBadge({children,color="#00D4FF"}){
  return <span style={{display:"inline-block",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",padding:"2px 8px",borderRadius:20,background:color+"22",border:`1px solid ${color}55`,color}}>{children}</span>;
}
function MLBBadge({team}){
  if(!team)return null;
  const t=MLB_TEAMS.find(x=>x.id===team);
  if(!t)return null;
  return <div style={{display:"inline-flex",alignItems:"center",gap:5,background:t.color+"22",border:`1.5px solid ${t.color}66`,borderRadius:20,padding:"4px 11px"}} title={`${t.name} fan`}>
    <span style={{fontSize:12}}>⚾</span>
    <span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:t.color,letterSpacing:".06em"}}>{t.abbr}</span>
    <span style={{fontSize:9,color:t.color+"aa",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{t.name}</span>
  </div>;
}

function Card({children,style:ext={},hover=true,onClick}){
  const [h,setH]=useState(false);
  return <div onClick={onClick} style={{background:"rgba(255,255,255,.03)",backdropFilter:"blur(14px)",border:`1px solid ${h&&hover?"rgba(0,212,255,.28)":"rgba(255,255,255,.07)"}`,borderRadius:14,transition:"all .28s ease",transform:h&&hover?"translateY(-2px)":"",boxShadow:h&&hover?"0 12px 40px rgba(0,0,0,.3)":"none",cursor:onClick?"pointer":"default",...ext}} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>{children}</div>;
}

function Modal({children,onClose,title,width=480}){
  return <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.78)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:"linear-gradient(150deg,#0c1220,#10172a)",border:"1px solid rgba(0,212,255,.18)",borderRadius:18,padding:"30px 32px",width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 30px 90px rgba(0,0,0,.85)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:26}}>
        <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:17,fontWeight:700,color:"#E2E8F0"}}>{title}</h2>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:20,lineHeight:1,padding:4}}>✕</button>
      </div>
      {children}
    </div>
  </div>;
}

function Lbl({children}){return <div style={{fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".1em",color:"#475569",textTransform:"uppercase",marginBottom:7}}>{children}</div>;}
function Sec({title,children,onAdd}){return <div style={{marginBottom:36}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}><h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:700,color:"#E2E8F0",letterSpacing:".05em"}}>{title}</h2>{onAdd&&<Btn variant="ghost" size="sm" onClick={onAdd}>＋ Add</Btn>}</div>{children}</div>;}
function Empty({icon,msg}){return <div style={{textAlign:"center",padding:"36px 20px",color:"#334155",border:"1px dashed rgba(255,255,255,.07)",borderRadius:12}}><div style={{fontSize:30,marginBottom:8,opacity:.3}}>{icon}</div><div style={{fontSize:13}}>{msg}</div></div>;}
function XBtn({onClick,style:ext={}}){const [h,setH]=useState(false);return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:h?"#ef4444":"rgba(239,68,68,.8)",border:"none",borderRadius:6,width:26,height:26,color:"white",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",zIndex:10,...ext}}>✕</button>;}
function StatusDot({type,size=12,style:ext={}}){const s=STATUS_META[type]||STATUS_META.offline;return <div style={{width:size,height:size,borderRadius:"50%",background:s.color,flexShrink:0,boxShadow:type!=="offline"?`0 0 ${size/2}px ${s.color}88`:"none",border:"2px solid rgba(3,7,18,.9)",...ext}} title={s.label}/>;}

function UploadImgBtn({label,currentUrl,onUpload,style:ext={}}){
  const [uploading,setUploading]=useState(false);
  const ref=useRef(null);
  const handle=async e=>{
    const file=e.target.files[0];if(!file)return;
    if(file.size>8*1024*1024){alert("Use an image under 8MB");return;}
    setUploading(true);
    const url=await onUpload(file);
    setUploading(false);
    return url;
  };
  return <div style={{...ext}}>
    <input type="file" ref={ref} accept="image/*" onChange={handle} style={{display:"none"}}/>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      {currentUrl&&<div style={{width:48,height:48,borderRadius:8,overflow:"hidden",border:"1px solid rgba(255,255,255,.1)",flexShrink:0}}><img src={currentUrl} style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}
      <Btn variant="ghost" size="sm" onClick={()=>ref.current.click()} disabled={uploading}>{uploading?"⏳ Uploading...":label}</Btn>
    </div>
    <div style={{fontSize:11,color:"#334155",marginTop:5}}>Supports JPG, PNG, GIF · Max 8MB</div>
  </div>;
}

function ClipCarousel({clips,canEdit,onDelete,emptyIcon,emptyMsg}){
  const [idx,setIdx]=useState(0);
  const [key,setKey]=useState(0);
  const touchRef=useRef(null);
  const timerRef=useRef(null);
  const ci=Math.min(idx,Math.max(0,clips.length-1));
  const go=dir=>{setIdx(i=>(i+dir+clips.length)%clips.length);setKey(k=>k+1);reset();};
  const reset=()=>{clearInterval(timerRef.current);if(clips.length>1)timerRef.current=setInterval(()=>{setIdx(i=>(i+1)%clips.length);setKey(k=>k+1);},60000);};
  useEffect(()=>{reset();return()=>clearInterval(timerRef.current);},[clips.length]);
  const onTS=e=>{touchRef.current=e.touches[0].clientX;};
  const onTE=e=>{if(touchRef.current===null||clips.length<2)return;const diff=touchRef.current-e.changedTouches[0].clientX;if(Math.abs(diff)>50)go(diff>0?1:-1);touchRef.current=null;};
  if(clips.length===0)return <Empty icon={emptyIcon} msg={emptyMsg}/>;
  const c=clips[ci];
  const renderClip=()=>{
    if(c.type==="video"&&c.url){
      return <div><div style={{fontSize:13,fontWeight:600,color:"#94A3B8",marginBottom:7}}>{c.title}</div><video src={c.url} controls width="100%" style={{borderRadius:10,maxHeight:240,background:"#000"}}/></div>;
    }
    if(c.type==="youtube"&&c.eid){
      return <div><div style={{fontSize:13,fontWeight:600,color:"#94A3B8",marginBottom:7}}>{c.title}</div><div style={{borderRadius:10,overflow:"hidden"}}><iframe src={`https://www.youtube.com/embed/${c.eid}`} width="100%" height="220" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{borderRadius:10}}/></div></div>;
    }
    if(c.type==="medal"){
      return <Card style={{padding:18}}><div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:8}}>MEDAL.TV CLIP</div><div style={{fontWeight:700,color:"#E2E8F0",marginBottom:10}}>{c.title}</div>{c.eid?<iframe src={`https://medal.tv/clip/${c.eid}/embed`} width="100%" height="200" frameBorder="0" allowFullScreen style={{borderRadius:8}}/>:<a href={c.url} target="_blank" rel="noopener noreferrer"><Btn variant="ghost" size="sm">▶ Watch on Medal.tv</Btn></a>}</Card>;
    }
    return <Card style={{padding:18}}><div style={{display:"flex",gap:14,alignItems:"flex-start"}}><div style={{fontSize:28}}>{c.platform==="instagram"?"📸":"🎬"}</div><div style={{flex:1}}><div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",marginBottom:6}}>{c.platform==="instagram"?"INSTAGRAM REEL":"CLIP"}</div><div style={{fontWeight:700,color:"#E2E8F0",marginBottom:10}}>{c.title}</div><a href={c.url} target="_blank" rel="noopener noreferrer"><Btn variant="ghost" size="sm">▶ Watch Clip</Btn></a></div></div></Card>;
  };
  return <div style={{userSelect:"none"}}>
    <div onTouchStart={onTS} onTouchEnd={onTE} style={{position:"relative"}}>
      <div key={key} className="carousel-slide">{renderClip()}</div>
      {clips.length>1&&<><button onClick={()=>go(-1)} style={{position:"absolute",left:-14,top:"50%",transform:"translateY(-50%)",width:32,height:32,borderRadius:"50%",background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",color:"#00D4FF",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5}}>‹</button><button onClick={()=>go(1)} style={{position:"absolute",right:-14,top:"50%",transform:"translateY(-50%)",width:32,height:32,borderRadius:"50%",background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",color:"#00D4FF",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5}}>›</button></>}
      {canEdit&&<XBtn onClick={()=>{onDelete(c.id);setIdx(0);}} style={{position:"absolute",top:0,right:0}}/>}
    </div>
    {clips.length>1&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:14}}>
      {clips.map((_,i)=><div key={i} onClick={()=>{setIdx(i);setKey(k=>k+1);reset();}} style={{width:i===ci?20:7,height:7,borderRadius:i===ci?4:3.5,background:i===ci?"#00D4FF":"rgba(255,255,255,.15)",cursor:"pointer",transition:"all .25s ease"}}/>)}
      <span style={{fontSize:11,color:"#334155",marginLeft:4}}>{ci+1}/{clips.length}</span>
    </div>}
  </div>;
}

function Starfield(){
  const s=useRef(null);
  if(!s.current)s.current=Array.from({length:200},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,sz:Math.random()*2.4+.4,delay:Math.random()*7,dur:Math.random()*3.5+2,bright:Math.random()>.92}));
  return <div style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden",background:"radial-gradient(ellipse at 18% 38%,#0e0228 0%,#030712 54%)"}}>
    <div style={{position:"absolute",width:"65%",height:"65%",top:"-15%",left:"45%",borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 70%)"}}/>
    <div style={{position:"absolute",width:"45%",height:"45%",top:"52%",left:"-8%",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,212,255,.05) 0%,transparent 70%)"}}/>
    {s.current.map(st=><div key={st.id} style={{position:"absolute",left:`${st.x}%`,top:`${st.y}%`,width:st.sz,height:st.sz,borderRadius:"50%",background:st.bright?"#a8e0ff":st.sz>1.8?"rgba(180,220,255,.9)":"rgba(255,255,255,.8)",boxShadow:st.bright?"0 0 4px 1px rgba(168,224,255,.6)":"none",animation:`twinkle ${st.dur}s ${st.delay}s ease-in-out infinite alternate`}}/>)}
  </div>;
}

function NotifBell({notifs,onRead,onClear,navigate,users}){
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  const unread=notifs.filter(n=>!n.read).length;
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  return <div ref={ref} style={{position:"relative"}}>
    <button onClick={()=>{setOpen(o=>!o);if(!open)onRead();}} className={unread>0?"bell-shake":""} style={{background:open?"rgba(0,212,255,.1)":"none",border:`1px solid ${open?"rgba(0,212,255,.3)":"rgba(255,255,255,.09)"}`,borderRadius:9,width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,transition:"all .2s",position:"relative"}}>
      🔔{unread>0&&<div style={{position:"absolute",top:-4,right:-4,width:17,height:17,borderRadius:"50%",background:"linear-gradient(135deg,#EF4444,#DC2626)",color:"white",fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",border:"2px solid #030712"}}>{unread>9?"9+":unread}</div>}
    </button>
    {open&&<div style={{position:"absolute",right:0,top:46,width:320,zIndex:300,background:"linear-gradient(150deg,#0c1220,#0f1929)",border:"1px solid rgba(0,212,255,.15)",borderRadius:14,boxShadow:"0 20px 60px rgba(0,0,0,.8)",overflow:"hidden"}}>
      <div style={{padding:"14px 18px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#94A3B8",letterSpacing:".1em"}}>NOTIFICATIONS</span>
        {notifs.length>0&&<button onClick={onClear} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#334155",fontFamily:"'Rajdhani',sans-serif"}}>Clear all</button>}
      </div>
      <div style={{maxHeight:300,overflowY:"auto"}}>
        {notifs.length===0?<div style={{padding:"32px 18px",textAlign:"center",color:"#334155",fontSize:13}}><div style={{fontSize:28,marginBottom:8}}>🔕</div>No notifications yet</div>
        :notifs.slice().reverse().map(n=>{const from=users.find(u=>u.id===n.from_user_id);return <div key={n.id} className="notif-item" onClick={()=>{navigate("profile",n.from_user_id);setOpen(false);}} style={{padding:"12px 18px",display:"flex",gap:12,alignItems:"flex-start",borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",background:n.read?"transparent":"rgba(0,212,255,.04)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"} onMouseLeave={e=>e.currentTarget.style.background=n.read?"transparent":"rgba(0,212,255,.04)"}>
          <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,overflow:"hidden"}}>{from?.avatar_url?<img src={from.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>:from?.avatar||"👤"}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,color:"#C4CDD6",lineHeight:1.4}}><span style={{fontWeight:700,color:"#E2E8F0"}}>{from?.display_name||"Someone"}</span> {n.msg}</div><div style={{fontSize:11,color:"#334155",marginTop:3}}>{fmtTime(n.ts||Date.now())}</div></div>
          {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:"#00D4FF",marginTop:4,flexShrink:0}}/>}
        </div>;})}
      </div>
    </div>}
  </div>;
}

function Navbar({cu,onLogin,onRegister,onLogout,nav,page,notifs,onReadNotifs,onClearNotifs,users}){
  return <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:62,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",background:"rgba(3,7,18,.82)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,.055)"}}>
    <div style={{display:"flex",alignItems:"center",gap:22}}>
      <button onClick={()=>nav("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:9}}>
        <span style={{fontSize:22}}>💫</span>
        <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:19,letterSpacing:".12em",background:"linear-gradient(135deg,#fff 10%,#00D4FF 55%,#8B5CF6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NOVA</span>
      </button>
      <div style={{display:"flex",gap:2}}>
        {[["home","Home"],["members","Members"]].map(([p,l])=><button key={p} onClick={()=>nav(p)} style={{background:page===p?"rgba(0,212,255,.09)":"none",border:page===p?"1px solid rgba(0,212,255,.2)":"1px solid transparent",cursor:"pointer",padding:"5px 14px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:14,fontWeight:600,color:page===p?"#00D4FF":"#94A3B8",transition:"all .2s"}}>{l}</button>)}
        {cu?.is_owner&&<button onClick={()=>nav("dashboard")} style={{background:page==="dashboard"?"rgba(245,158,11,.09)":"none",border:page==="dashboard"?"1px solid rgba(245,158,11,.2)":"1px solid transparent",cursor:"pointer",padding:"5px 14px",borderRadius:8,fontFamily:"'Rajdhani',sans-serif",fontSize:14,fontWeight:600,color:page==="dashboard"?"#F59E0B":"#94A3B8",transition:"all .2s"}}>⚡ Dashboard</button>}
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      {cu?<>
        <NotifBell notifs={notifs} onRead={onReadNotifs} onClear={onClearNotifs} navigate={nav} users={users}/>
        <button onClick={()=>nav("profile",cu.id)} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",borderRadius:9,padding:"5px 12px",cursor:"pointer",color:"#E2E8F0",fontFamily:"'Rajdhani',sans-serif",fontSize:14,fontWeight:600}}>
          <div style={{position:"relative",width:28,height:28,borderRadius:"50%",overflow:"hidden",background:`radial-gradient(circle,${cu.page_accent||"#00D4FF"}44,rgba(0,0,0,.7))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
            {cu.avatar_url?<img src={cu.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:cu.avatar}
            <StatusDot type={cu.status_type||"offline"} size={9} style={{position:"absolute",bottom:-1,right:-1}}/>
          </div>
          <span>{cu.display_name}</span>
        </button>
        <Btn variant="muted" size="sm" onClick={onLogout}>Sign Out</Btn>
      </>:<><Btn variant="ghost" size="sm" onClick={onLogin}>Sign In</Btn><Btn variant="primary" size="sm" onClick={onRegister}>Join Nova</Btn></>}
    </div>
  </nav>;
}

function SocialLinks({user}){
  const links=SOCIAL_PLATFORMS.filter(p=>user[`social_${p.key}`]);
  if(!links.length)return null;
  return <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginTop:10,marginBottom:6}}>
    {links.map(p=>{
      const val=user[`social_${p.key}`];
      if(p.isLink){
        return <a key={p.key} href={p.url(val)} target="_blank" rel="noopener noreferrer" title={`${p.label}: ${val}`}>
          <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:"4px 11px",transition:"all .2s",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,212,255,.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.1)"}>
            <span style={{fontSize:13}}>{p.icon}</span>
            <span style={{fontSize:11,color:"#94A3B8",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>@{val}</span>
          </div>
        </a>;
      }
      return <div key={p.key} title={`${p.label}: ${val}`} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:"4px 11px"}}>
        <span style={{fontSize:13}}>{p.icon}</span>
        <span style={{fontSize:11,color:"#94A3B8",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{val}</span>
      </div>;
    })}
  </div>;
}

function HomePage({discordUrl,staffUsers,nav,users}){
  const feats=[{icon:"🎬",title:"Watch Parties",desc:"Stream movies & shows together in real time"},{icon:"🎮",title:"Game Nights",desc:"Squad up for epic gaming sessions every night"},{icon:"🎵",title:"Music Lounge",desc:"Vibe out together, share playlists, listen live"},{icon:"⚾",title:"Sports Nights",desc:"Watch baseball & live sports with the whole crew"}];
  const online=users.filter(u=>u.status_type==="online").length;
  return <div style={{maxWidth:1080,margin:"0 auto",padding:"0 24px 100px"}}>
    <div style={{textAlign:"center",padding:"90px 0 80px"}}>
      <div className="fadeUp" style={{fontSize:68,marginBottom:14,display:"inline-block",animation:"float 3.5s ease-in-out infinite"}}>💫</div>
      <h1 className="fadeUp d1" style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(52px,9vw,100px)",fontWeight:900,lineHeight:1.02,letterSpacing:".06em",marginBottom:18,background:"linear-gradient(135deg,#fff 0%,#a8d8ff 40%,#00D4FF 65%,#8B5CF6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NOVA</h1>
      <p className="fadeUp d2" style={{fontSize:19,color:"#94A3B8",maxWidth:460,margin:"0 auto 12px",lineHeight:1.65,fontWeight:500}}>Your community for watchparties, game nights, music vibes & live sports.</p>
      <div className="fadeUp d2" style={{display:"flex",gap:20,justifyContent:"center",marginBottom:38}}>
        <span style={{fontSize:12,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".18em"}}>{users.length} MEMBERS</span>
        <span style={{fontSize:12,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",letterSpacing:".18em",display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:"#22C55E",boxShadow:"0 0 6px #22C55E"}}/>{online} ONLINE</span>
      </div>
      <div className="fadeUp d3" style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
        <a href={discordUrl} target="_blank" rel="noopener noreferrer"><Btn size="lg" style={{fontSize:13}}>🚀 Join Nova on Discord</Btn></a>
        <Btn variant="ghost" size="lg" style={{fontSize:13}} onClick={()=>nav("members")}>👥 Browse Members</Btn>
      </div>
    </div>
    <div style={{marginBottom:80}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,letterSpacing:".22em",color:"#334155",textAlign:"center",textTransform:"uppercase",marginBottom:28}}>What We Do</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
        {feats.map((f,i)=><Card key={i} style={{padding:"26px 22px"}}><div style={{fontSize:34,marginBottom:12}}>{f.icon}</div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#E2E8F0",marginBottom:8,letterSpacing:".05em"}}>{f.title}</div><div style={{color:"#64748B",fontSize:13,lineHeight:1.55}}>{f.desc}</div></Card>)}
      </div>
    </div>
    {staffUsers.length>0&&<div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,letterSpacing:".22em",color:"#334155",textAlign:"center",textTransform:"uppercase",marginBottom:28}}>Meet the Staff</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14}}>
        {staffUsers.map(u=><Card key={u.id} style={{padding:"22px 18px",textAlign:"center"}} onClick={()=>nav("profile",u.id)}>
          <div style={{position:"relative",width:60,height:60,margin:"0 auto 12px"}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:`radial-gradient(circle,${u.page_accent||"#00D4FF"}44,rgba(0,0,0,.6))`,border:`2px solid ${u.page_accent||"#00D4FF"}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,overflow:"hidden",boxShadow:`0 0 22px ${u.page_accent||"#00D4FF"}33`}}>{u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}</div>
            <StatusDot type={u.status_type||"offline"} size={13} style={{position:"absolute",bottom:1,right:1}}/>
          </div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#E2E8F0",marginBottom:7}}>{u.display_name}</div>
          {u.staff_role&&<RoleBadge color={ROLE_COLOR[u.staff_role]||"#00D4FF"}>{u.staff_role}</RoleBadge>}
        </Card>)}
      </div>
    </div>}
  </div>;
}

function MembersPage({users,nav}){
  const [q,setQ]=useState(""),[filter,setFilter]=useState("all");
  const list=users.filter(u=>{const m=u.display_name?.toLowerCase().includes(q.toLowerCase())||u.username?.toLowerCase().includes(q.toLowerCase());if(filter==="online")return m&&u.status_type==="online";if(filter==="staff")return m&&u.staff_role;return m;});
  return <div style={{maxWidth:1080,margin:"0 auto",padding:"44px 24px 100px"}}>
    <div style={{textAlign:"center",marginBottom:36}}>
      <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:30,fontWeight:700,marginBottom:10,background:"linear-gradient(135deg,#fff,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Members</h1>
      <p style={{color:"#475569",marginBottom:22,fontSize:14}}>{users.length} members across the galaxy</p>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍  Search members..." style={{maxWidth:340,margin:"0 auto 14px",display:"block"}}/>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        {[["all","All"],["online","🟢 Online"],["staff","⚡ Staff"]].map(([v,l])=><button key={v} onClick={()=>setFilter(v)} style={{padding:"6px 16px",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'Rajdhani',sans-serif",fontWeight:600,border:`1px solid ${filter===v?"rgba(0,212,255,.4)":"rgba(255,255,255,.08)"}`,background:filter===v?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",color:filter===v?"#00D4FF":"#475569"}}>{l}</button>)}
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:14}}>
      {list.map(u=><Card key={u.id} style={{padding:18,cursor:"pointer"}} onClick={()=>nav("profile",u.id)}>
        <div style={{position:"relative",width:50,height:50,marginBottom:12}}>
          <div style={{width:50,height:50,borderRadius:"50%",background:`radial-gradient(circle,${u.page_accent||"#00D4FF"}44,rgba(0,0,0,.6))`,border:`2px solid ${u.page_accent||"#00D4FF"}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,overflow:"hidden"}}>{u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}</div>
          <StatusDot type={u.status_type||"offline"} size={12} style={{position:"absolute",bottom:0,right:0}}/>
        </div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{u.display_name}</div>
        <div style={{fontSize:12,color:"#475569",marginBottom:6}}>@{u.username}</div>
        {u.staff_role&&<div style={{marginBottom:6}}><RoleBadge color={ROLE_COLOR[u.staff_role]||"#00D4FF"}>{u.staff_role}</RoleBadge></div>}
        {u.mlb_team&&<div style={{marginBottom:6}}><MLBBadge team={u.mlb_team}/></div>}
        {u.status_activity&&<div style={{fontSize:11,color:"#334155",marginBottom:6,fontStyle:"italic"}}>"{u.status_activity}"</div>}
        <div style={{display:"flex",gap:10,fontSize:11,color:"#475569"}}><span>{(u.followers||[]).length} followers</span><span>·</span><span>{(u.badges||[]).length} 🏅</span></div>
      </Card>)}
    </div>
  </div>;
}

function ProfilePage({user,cu,onUpdatePage,onUpdateProfile,onFollow,onComment,onDelComment}){
  const canEdit=cu?.id===user.id||cu?.is_owner;
  const isFollowing=cu&&(user.followers||[]).includes(cu.id);
  const isSelf=cu?.id===user.id;
  const [addMusic,setAddMusic]=useState(false);
  const [addClip,setAddClip]=useState(false);
  const [addSocial,setAddSocial]=useState(false);
  const [editProf,setEditProf]=useState(false);
  const [showFL,setShowFL]=useState(null);
  const acc=user.page_accent||"#00D4FF";
  const clips=user.page_clips||[];
  const social=user.page_social||[];

  return <div style={{maxWidth:1280,margin:"0 auto",padding:"0 0 100px"}}>
    {/* Layout with side banners */}
    <div style={{display:"flex",gap:0,alignItems:"flex-start"}}>
      {/* Left banner */}
      {user.banner_left_url&&<div style={{width:110,flexShrink:0,position:"sticky",top:62,height:"calc(100vh - 62px)",overflow:"hidden",display:"flex",alignItems:"flex-start"}}>
        <img src={user.banner_left_url} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.85}}/>
        {canEdit&&<XBtn onClick={()=>onUpdateProfile(user.id,{banner_left_url:""})} style={{position:"absolute",top:8,left:8}}/>}
      </div>}

      {/* Main content */}
      <div style={{flex:1,minWidth:0,maxWidth:880,margin:"0 auto",padding:"0 24px"}}>
        {/* Profile header */}
        <div style={{borderRadius:18,overflow:"hidden",marginBottom:28,border:"1px solid rgba(255,255,255,.07)"}}>
          {/* Top Banner */}
          <div style={{height:160,position:"relative",overflow:"hidden"}}>
            {user.banner_top_url
              ?<img src={user.banner_top_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              :<div style={{width:"100%",height:"100%",background:`linear-gradient(135deg,${acc}22 0%,rgba(139,92,246,.18) 50%,rgba(3,7,18,.9) 100%)`}}>
                {[...Array(18)].map((_,i)=><div key={i} style={{position:"absolute",left:`${5+i*5.5}%`,top:`${12+(i%5)*18}%`,width:i%3===0?2.5:1.5,height:i%3===0?2.5:1.5,borderRadius:"50%",background:"white",opacity:.2+(i%5)*.08}}/>)}
              </div>
            }
            {canEdit&&<div style={{position:"absolute",right:14,top:14,display:"flex",gap:8}}>
              <BannerUploadBtn label="🖼️ Banner" onUpload={async f=>{const url=await sbUp("nova-banners",user.id,f,"top-");if(url)onUpdateProfile(user.id,{banner_top_url:url});}} />
              <Btn variant="ghost" size="sm" onClick={()=>setEditProf(true)}>✏️ Edit Profile</Btn>
            </div>}
          </div>

          <div style={{background:"rgba(10,15,30,.92)",backdropFilter:"blur(14px)",padding:"0 28px 26px"}}>
            <div style={{display:"flex",alignItems:"flex-end",gap:14,marginTop:-42,marginBottom:14,flexWrap:"wrap"}}>
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{width:84,height:84,borderRadius:"50%",background:`radial-gradient(circle,${acc}55,rgba(0,0,0,.8))`,border:`3px solid ${acc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,boxShadow:`0 0 32px ${acc}44`,overflow:"hidden"}}>{user.avatar_url?<img src={user.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:user.avatar}</div>
                <StatusDot type={user.status_type||"offline"} size={16} style={{position:"absolute",bottom:3,right:3}}/>
              </div>
              {user.status_activity&&<div style={{marginBottom:6,display:"flex",alignItems:"center",gap:7,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:20,padding:"5px 12px"}}><StatusDot type={user.status_type||"offline"} size={8} style={{position:"static"}}/><span style={{fontSize:12,color:"#94A3B8",fontStyle:"italic"}}>{user.status_activity}</span></div>}
            </div>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5,flexWrap:"wrap"}}>
                  <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:21,fontWeight:700,color:"#F1F5F9"}}>{user.display_name}</h1>
                  {user.staff_role&&<RoleBadge color={ROLE_COLOR[user.staff_role]||acc}>{user.staff_role}</RoleBadge>}
                  {user.mlb_team&&<MLBBadge team={user.mlb_team}/>}
                </div>
                <div style={{color:"#475569",fontSize:13,marginBottom:10}}>@{user.username} · Joined {user.joined}</div>
                <p style={{color:"#94A3B8",fontSize:15,maxWidth:520,lineHeight:1.6,marginBottom:14}}>{user.bio}</p>
                <div style={{display:"flex",gap:22,marginBottom:4}}>
                  <button onClick={()=>setShowFL("followers")} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",fontSize:14,fontFamily:"'Rajdhani',sans-serif",fontWeight:600,padding:0}}><span style={{color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900}}>{(user.followers||[]).length}</span> followers</button>
                  <button onClick={()=>setShowFL("following")} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",fontSize:14,fontFamily:"'Rajdhani',sans-serif",fontWeight:600,padding:0}}><span style={{color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900}}>{(user.following||[]).length}</span> following</button>
                </div>
                <SocialLinks user={user}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"flex-end"}}>
                {cu&&!isSelf&&<Btn variant={isFollowing?"unfollow":"follow"} onClick={()=>onFollow(user.id)} style={{flexShrink:0}}>{isFollowing?"✓ Following":"+ Follow"}</Btn>}
                {canEdit&&<div style={{display:"flex",gap:6}}>
                  <BannerUploadBtn label="⬅️ Left" onUpload={async f=>{const url=await sbUp("nova-banners",user.id,f,"left-");if(url)onUpdateProfile(user.id,{banner_left_url:url});}} />
                  <BannerUploadBtn label="➡️ Right" onUpload={async f=>{const url=await sbUp("nova-banners",user.id,f,"right-");if(url)onUpdateProfile(user.id,{banner_right_url:url});}} />
                </div>}
              </div>
            </div>
            {(user.badges||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:14}}>
              {(user.badges||[]).map((bid,i)=>{const b=ALL_BADGES.find(x=>x.id===bid);if(!b)return null;return <div key={bid} className="badge-pop" style={{animationDelay:`${i*.05}s`,display:"flex",alignItems:"center",gap:6,background:b.color+"15",border:`1px solid ${b.color}40`,borderRadius:20,padding:"4px 12px"}} title={b.desc}><span style={{fontSize:14}}>{b.icon}</span><span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:b.color,letterSpacing:".06em"}}>{b.label}</span></div>;})}
            </div>}
          </div>
        </div>

        <Sec title="🎵 Favorite Music" onAdd={canEdit?()=>setAddMusic(true):null}>
          {(user.page_music||[]).length===0?<Empty icon="🎵" msg="No music added yet"/>:
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14}}>
            {(user.page_music||[]).map(m=><div key={m.id} style={{position:"relative",borderRadius:12,overflow:"hidden"}}>
              {m.type==="spotify"?<iframe src={`https://open.spotify.com/embed/track/${m.eid}?utm_source=generator&theme=0`} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" style={{borderRadius:12}}/>
              :<Card style={{padding:16}}><div style={{fontSize:11,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:6}}>APPLE MUSIC</div><div style={{fontWeight:700,color:"#E2E8F0"}}>{m.title}</div><div style={{color:"#64748B",fontSize:13}}>{m.artist}</div>{m.url&&<a href={m.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:10}}><Btn variant="ghost" size="sm">▶ Listen</Btn></a>}</Card>}
              {canEdit&&<XBtn onClick={()=>onUpdatePage(user.id,{page_music:(user.page_music||[]).filter(x=>x.id!==m.id)})} style={{position:"absolute",top:7,right:7}}/>}
            </div>)}
          </div>}
        </Sec>

        <Sec title="🎮 Gaming Clips" onAdd={canEdit?()=>setAddClip(true):null}>
          <ClipCarousel clips={clips} canEdit={canEdit} onDelete={id=>onUpdatePage(user.id,{page_clips:clips.filter(c=>c.id!==id)})} emptyIcon="🎮" emptyMsg="No gaming clips added yet"/>
        </Sec>

        <Sec title="📱 Sports & Social Clips" onAdd={canEdit?()=>setAddSocial(true):null}>
          <ClipCarousel clips={social} canEdit={canEdit} onDelete={id=>onUpdatePage(user.id,{page_social:social.filter(c=>c.id!==id)})} emptyIcon="📱" emptyMsg="No social clips added yet"/>
        </Sec>

        <CommentsSection comments={user.comments||[]} cu={cu} onPost={t=>onComment(user.id,t)} onDel={cid=>onDelComment(user.id,cid)}/>
      </div>

      {/* Right banner */}
      {user.banner_right_url&&<div style={{width:110,flexShrink:0,position:"sticky",top:62,height:"calc(100vh - 62px)",overflow:"hidden"}}>
        <img src={user.banner_right_url} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.85}}/>
        {canEdit&&<XBtn onClick={()=>onUpdateProfile(user.id,{banner_right_url:""})} style={{position:"absolute",top:8,right:8}}/>}
      </div>}
    </div>

    {editProf&&<EditProfileModal user={user} onSave={u=>{onUpdateProfile(user.id,u);setEditProf(false);}} onClose={()=>setEditProf(false)}/>}
    {addMusic&&<AddMusicModal onSave={m=>{onUpdatePage(user.id,{page_music:[...(user.page_music||[]),m]});setAddMusic(false);}} onClose={()=>setAddMusic(false)}/>}
    {addClip&&<AddClipModal userId={user.id} onSave={c=>{onUpdatePage(user.id,{page_clips:[...clips,c]});setAddClip(false);}} onClose={()=>setAddClip(false)}/>}
    {addSocial&&<AddSocialModal userId={user.id} onSave={s=>{onUpdatePage(user.id,{page_social:[...social,s]});setAddSocial(false);}} onClose={()=>setAddSocial(false)}/>}
    {showFL&&<Modal title={showFL==="followers"?`${user.display_name}'s Followers`:`${user.display_name} is Following`} onClose={()=>setShowFL(null)} width={340}>
      {(showFL==="followers"?user.followers||[]:user.following||[]).length===0?<div style={{textAlign:"center",padding:"28px 0",color:"#334155",fontSize:13}}>None yet</div>
      :<div style={{display:"flex",flexDirection:"column",gap:4}}>{(showFL==="followers"?user.followers||[]:user.following||[]).map(id=><div key={id} style={{padding:"9px 12px",borderRadius:9,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",fontSize:13,color:"#94A3B8",fontFamily:"'Orbitron',sans-serif"}}>@{id}</div>)}</div>}
    </Modal>}
  </div>;
}

function BannerUploadBtn({label,onUpload}){
  const [up,setUp]=useState(false);
  const ref=useRef(null);
  const handle=async e=>{const f=e.target.files[0];if(!f)return;setUp(true);await onUpload(f);setUp(false);};
  return <><input type="file" ref={ref} accept="image/*" onChange={handle} style={{display:"none"}}/><Btn variant="ghost" size="sm" onClick={()=>ref.current.click()} disabled={up}>{up?"⏳":label}</Btn></>;
}

function CommentsSection({comments,cu,onPost,onDel}){
  const [text,setText]=useState("");
  const sorted=[...comments].sort((a,b)=>(b.timestamp||0)-(a.timestamp||0));
  const post=()=>{const t=text.trim();if(!t||!cu)return;onPost(t);setText("");};
  return <Sec title="💬 Comments">
    {cu?<div style={{marginBottom:18,display:"flex",gap:10}}>
      <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,background:"rgba(0,212,255,.1)",border:"1px solid rgba(0,212,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,overflow:"hidden"}}>{cu.avatar_url?<img src={cu.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:cu.avatar}</div>
      <div style={{flex:1}}><textarea value={text} onChange={e=>setText(e.target.value)} rows={2} placeholder="Leave a comment..." style={{resize:"none",marginBottom:7}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();post();}}}/><Btn size="sm" onClick={post} disabled={!text.trim()}>Post Comment</Btn></div>
    </div>:<div style={{textAlign:"center",padding:"14px",background:"rgba(255,255,255,.02)",borderRadius:10,marginBottom:14,fontSize:13,color:"#475569"}}>Sign in to leave a comment</div>}
    {sorted.length===0?<Empty icon="💬" msg="No comments yet — be the first!"/>:
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {sorted.map(c=>{const canDel=cu?.is_owner||cu?.id===c.author_id;return <div key={c.id} className="comment-row" style={{position:"relative",display:"flex",gap:12,padding:"14px 16px",background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.06)",borderRadius:12}}>
        <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,overflow:"hidden"}}>{c.author_avatar_url?<img src={c.author_avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:c.author_avatar||"👤"}</div>
        <div style={{flex:1}}><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{c.author_name||"Member"}</span><span style={{fontSize:11,color:"#334155"}}>{fmtTime(c.timestamp||Date.now())}</span></div><div style={{fontSize:14,color:"#94A3B8",lineHeight:1.5}}>{c.text}</div></div>
        {canDel&&<button className="del-btn" onClick={()=>onDel(c.id)} style={{position:"absolute",top:10,right:10,background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.25)",borderRadius:6,width:24,height:24,color:"#EF4444",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .15s"}}>✕</button>}
      </div>;})}
    </div>}
  </Sec>;
}

function EditProfileModal({user,onSave,onClose}){
  const [displayName,setDisplayName]=useState(user.display_name||"");
  const [bio,setBio]=useState(user.bio||"");
  const [avatar,setAvatar]=useState(user.avatar||"🌟");
  const [avatarUrl,setAvatarUrl]=useState(user.avatar_url||"");
  const [accent,setAccent]=useState(user.page_accent||"#00D4FF");
  const [statusType,setStatusType]=useState(user.status_type||"online");
  const [statusActivity,setStatusActivity]=useState(user.status_activity||"");
  const [uploading,setUploading]=useState(false);
  const [photoMode,setPhotoMode]=useState(user.avatar_url?"photo":"emoji");
  const [mlbTeam,setMlbTeam]=useState(user.mlb_team||"");
  const [tab,setTab]=useState("profile");
  const [socials,setSocials]=useState({
    roblox:user.social_roblox||"",instagram:user.social_instagram||"",
    twitter:user.social_twitter||"",youtube:user.social_youtube||"",discord:user.social_discord||""
  });
  const fileRef=useRef(null);
  const EMOJIS=["💫","⭐","🌟","🌠","🌌","🌙","🌑","☀️","🚀","🛸","🌊","🔥","💎","👾","🎮","🎵","⚾","🌈","🦋","❄️"];
  const handleFile=async e=>{
    const file=e.target.files[0];if(!file)return;
    if(file.size>8*1024*1024){alert("Please use an image under 8MB");return;}
    setUploading(true);
    const reader=new FileReader();
    reader.onload=async ev=>{
      const url=await sb.upload(user.id,file);
      setAvatarUrl(url||ev.target.result);setPhotoMode("photo");setUploading(false);
    };
    reader.readAsDataURL(file);
  };
  const save=()=>onSave({
    display_name:displayName,bio,avatar,avatar_url:photoMode==="photo"?avatarUrl:"",
    status_type:statusType,status_activity:statusActivity,page_accent:accent,mlb_team:mlbTeam,
    social_roblox:socials.roblox,social_instagram:socials.instagram,social_twitter:socials.twitter,
    social_youtube:socials.youtube,social_discord:socials.discord
  });
  const TABS=[["profile","👤 Profile"],["mlb","⚾ MLB Team"],["social","🔗 Social Links"]];
  const divs=["AL East","AL Central","AL West","NL East","NL Central","NL West"];
  return <Modal title="✏️ Edit Profile" onClose={onClose} width={520}><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:6,borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:12,marginBottom:4}}>
      {TABS.map(([v,l])=><button key={v} onClick={()=>setTab(v)} style={{padding:"6px 14px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===v?"#00D4FF":"rgba(255,255,255,.09)"}`,background:tab===v?"rgba(0,212,255,.11)":"rgba(255,255,255,.04)",color:tab===v?"#00D4FF":"#94A3B8"}}>{l}</button>)}
    </div>

    {tab==="profile"&&<>
      <div>
        <Lbl>Profile Picture</Lbl>
        <div style={{display:"flex",gap:8,marginBottom:12}}>{[["emoji","😊 Emoji"],["photo","📷 Photo"]].map(([v,l])=><button key={v} onClick={()=>setPhotoMode(v)} style={{flex:1,padding:"8px 0",borderRadius:8,cursor:"pointer",fontSize:12,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,border:`1px solid ${photoMode===v?"#00D4FF":"rgba(255,255,255,.09)"}`,background:photoMode===v?"rgba(0,212,255,.11)":"rgba(255,255,255,.04)",color:photoMode===v?"#00D4FF":"#94A3B8"}}>{l}</button>)}</div>
        {photoMode==="emoji"?<div style={{display:"flex",flexWrap:"wrap",gap:7}}>{EMOJIS.map(e=><button key={e} onClick={()=>setAvatar(e)} style={{width:38,height:38,borderRadius:8,cursor:"pointer",fontSize:18,border:`2px solid ${avatar===e?"#00D4FF":"rgba(255,255,255,.08)"}`,background:avatar===e?"rgba(0,212,255,.14)":"rgba(255,255,255,.04)",transition:"all .15s"}}>{e}</button>)}</div>
        :<div><input type="file" ref={fileRef} accept="image/*" onChange={handleFile} style={{display:"none"}}/><div style={{display:"flex",alignItems:"center",gap:12}}>{avatarUrl&&<div style={{width:56,height:56,borderRadius:"50%",overflow:"hidden",border:"2px solid rgba(0,212,255,.3)",flexShrink:0}}><img src={avatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}<Btn variant="ghost" onClick={()=>fileRef.current.click()} disabled={uploading}>{uploading?"⏳ Uploading...":"📁 Choose Photo"}</Btn></div><div style={{fontSize:11,color:"#334155",marginTop:7}}>Supports JPG, PNG, GIF · Max 8MB</div></div>}
      </div>
      <div><Lbl>Display Name</Lbl><input value={displayName} onChange={e=>setDisplayName(e.target.value)}/></div>
      <div><Lbl>Bio</Lbl><textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} style={{resize:"vertical"}}/></div>
      <div>
        <Lbl>Status</Lbl>
        <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>{Object.entries(STATUS_META).map(([k,v])=><button key={k} onClick={()=>setStatusType(k)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,border:`1px solid ${statusType===k?v.color+"66":"rgba(255,255,255,.08)"}`,background:statusType===k?v.color+"18":"rgba(255,255,255,.03)",color:statusType===k?v.color:"#64748B"}}><div style={{width:8,height:8,borderRadius:"50%",background:v.color}}/>{v.label}</button>)}</div>
        <input value={statusActivity} onChange={e=>setStatusActivity(e.target.value)} placeholder="What are you up to?"/>
      </div>
      <div><Lbl>Accent Color</Lbl><div style={{display:"flex",alignItems:"center",gap:12}}><input type="color" value={accent} onChange={e=>setAccent(e.target.value)} style={{width:46,height:34,padding:3,cursor:"pointer"}}/><span style={{color:"#64748B",fontSize:14}}>Profile accent color</span></div></div>
    </>}

    {tab==="mlb"&&<>
      <div style={{fontSize:13,color:"#94A3B8",marginBottom:4}}>Pick your favorite MLB team. It will show as a badge on your profile.</div>
      {mlbTeam&&<div style={{marginBottom:10}}><Lbl>Current Team</Lbl><div style={{display:"flex",alignItems:"center",gap:10}}><MLBBadge team={mlbTeam}/><button onClick={()=>setMlbTeam("")} style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:6,padding:"4px 10px",color:"#EF4444",cursor:"pointer",fontSize:11}}>Remove</button></div></div>}
      {divs.map(div=><div key={div} style={{marginBottom:16}}>
        <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:"#334155",letterSpacing:".12em",marginBottom:8}}>{div}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {MLB_TEAMS.filter(t=>t.div===div).map(t=><button key={t.id} onClick={()=>setMlbTeam(mlbTeam===t.id?"":t.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:20,cursor:"pointer",border:`1.5px solid ${mlbTeam===t.id?t.color:t.color+"44"}`,background:mlbTeam===t.id?t.color+"22":"rgba(255,255,255,.03)",transition:"all .15s"}}>
            <span style={{fontSize:11}}>⚾</span>
            <span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:mlbTeam===t.id?t.color:t.color+"aa",letterSpacing:".06em"}}>{t.abbr}</span>
            <span style={{fontSize:10,color:mlbTeam===t.id?t.color:t.color+"88",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{t.name}</span>
          </button>)}
        </div>
      </div>)}
    </>}

    {tab==="social"&&<>
      <div style={{fontSize:13,color:"#94A3B8",marginBottom:4}}>Add your usernames. Roblox, Instagram, Twitter & YouTube will link to your profile. Discord just shows your @.</div>
      {SOCIAL_PLATFORMS.map(p=><div key={p.key}><Lbl>{p.icon} {p.label} {!p.isLink&&"(shows @ only)"}</Lbl><input value={socials[p.key]} onChange={e=>setSocials(s=>({...s,[p.key]:e.target.value}))} placeholder={`Your ${p.label} ${p.key==="discord"?"@":"username"}`}/></div>)}
    </>}

    <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={save}>Save Changes</Btn></div>
  </div></Modal>;
}

function AddMusicModal({onSave,onClose}){
  const [type,setType]=useState("spotify"),[url,setUrl]=useState(""),[title,setTitle]=useState(""),[artist,setArtist]=useState(""),[err,setErr]=useState("");
  const go=()=>{if(type==="spotify"){const eid=extractSpotify(url);if(!eid){setErr("Paste a valid Spotify track link");return;}onSave({id:gid(),type:"spotify",title:title||"Track",artist,eid});}else{if(!title){setErr("Enter a song title");return;}onSave({id:gid(),type:"apple",title,artist,url});}};
  return <Modal title="🎵 Add Music" onClose={onClose}><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div><Lbl>Platform</Lbl><div style={{display:"flex",gap:8}}>{[["spotify","🎵 Spotify"],["apple","🍎 Apple Music"]].map(([v,l])=><button key={v} onClick={()=>setType(v)} style={{flex:1,padding:"9px 0",borderRadius:8,cursor:"pointer",fontSize:12,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,border:`1px solid ${type===v?"#00D4FF":"rgba(255,255,255,.09)"}`,background:type===v?"rgba(0,212,255,.11)":"rgba(255,255,255,.04)",color:type===v?"#00D4FF":"#94A3B8"}}>{l}</button>)}</div></div>
    {type==="spotify"&&<div><Lbl>Spotify Track URL</Lbl><input value={url} onChange={e=>{setUrl(e.target.value);setErr("");}} placeholder="https://open.spotify.com/track/..."/><div style={{fontSize:11,color:"#334155",marginTop:5}}>Right-click song → Share → Copy Song Link</div></div>}
    {type==="apple"&&<div><Lbl>Apple Music Link</Lbl><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://music.apple.com/..."/></div>}
    <div><Lbl>Song Title</Lbl><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Song name"/></div>
    <div><Lbl>Artist</Lbl><input value={artist} onChange={e=>setArtist(e.target.value)} placeholder="Artist name"/></div>
    {err&&<div style={{color:"#EF4444",fontSize:13,background:"rgba(239,68,68,.1)",padding:"9px 12px",borderRadius:8}}>{err}</div>}
    <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={go}>Add Song</Btn></div>
  </div></Modal>;
}

function AddClipModal({userId,onSave,onClose}){
  const [type,setType]=useState("youtube"),[url,setUrl]=useState(""),[title,setTitle]=useState(""),[err,setErr]=useState(""),[uploading,setUploading]=useState(false);
  const fileRef=useRef(null);
  const handleFile=async e=>{
    const file=e.target.files[0];if(!file)return;
    if(file.size>200*1024*1024){setErr("File too large — max 200MB");return;}
    if(!title){setErr("Enter a title first");return;}
    setUploading(true);
    const clipUrl=await sb.uploadClip(userId,file);
    setUploading(false);
    if(!clipUrl){setErr("Upload failed. Try a smaller file or use a link instead.");return;}
    onSave({id:gid(),type:"video",title,url:clipUrl,platform:"upload"});
  };
  const go=()=>{if(!title){setErr("Enter a title");return;}if(type==="youtube"){const eid=extractYouTube(url);if(!eid){setErr("Paste a valid YouTube link");return;}onSave({id:gid(),type:"youtube",title,url,eid});}else{if(!url){setErr("Paste a Medal.tv link");return;}onSave({id:gid(),type:"medal",title,url,eid:extractMedal(url)});}};
  return <Modal title="🎮 Add Gaming Clip" onClose={onClose}><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div><Lbl>Add Method</Lbl><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[["youtube","▶ YouTube"],["medal","🏅 Medal.tv"],["upload","📁 Upload File"]].map(([v,l])=><button key={v} onClick={()=>setType(v)} style={{flex:1,minWidth:90,padding:"9px 0",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,border:`1px solid ${type===v?"#00D4FF":"rgba(255,255,255,.09)"}`,background:type===v?"rgba(0,212,255,.11)":"rgba(255,255,255,.04)",color:type===v?"#00D4FF":"#94A3B8"}}>{l}</button>)}</div></div>
    <div><Lbl>Clip Title</Lbl><input value={title} onChange={e=>{setTitle(e.target.value);setErr("");}} placeholder="Clip title..."/></div>
    {type==="youtube"&&<div><Lbl>YouTube URL</Lbl><input value={url} onChange={e=>{setUrl(e.target.value);setErr("");}} placeholder="https://youtube.com/watch?v=..."/></div>}
    {type==="medal"&&<div><Lbl>Medal.tv URL</Lbl><input value={url} onChange={e=>{setUrl(e.target.value);setErr("");}} placeholder="https://medal.tv/games/.../clips/..."/></div>}
    {type==="upload"&&<div>
      <Lbl>Video File</Lbl>
      <input type="file" ref={fileRef} accept="video/*" onChange={handleFile} style={{display:"none"}}/>
      <Btn variant="ghost" onClick={()=>fileRef.current.click()} disabled={uploading}>{uploading?"⏳ Uploading...":"📁 Choose Video File"}</Btn>
      <div style={{fontSize:11,color:"#334155",marginTop:7}}>Supports MP4, MOV, WebM · Max 200MB · Enter title first</div>
    </div>}
    {err&&<div style={{color:"#EF4444",fontSize:13,background:"rgba(239,68,68,.1)",padding:"9px 12px",borderRadius:8}}>{err}</div>}
    {type!=="upload"&&<div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={go}>Add Clip</Btn></div>}
    {type==="upload"&&<Btn variant="muted" onClick={onClose}>Cancel</Btn>}
  </div></Modal>;
}

function AddSocialModal({userId,onSave,onClose}){
  const [type,setType]=useState("youtube"),[url,setUrl]=useState(""),[title,setTitle]=useState(""),[err,setErr]=useState(""),[uploading,setUploading]=useState(false);
  const fileRef=useRef(null);
  const handleFile=async e=>{
    const file=e.target.files[0];if(!file)return;
    if(file.size>200*1024*1024){setErr("File too large — max 200MB");return;}
    if(!title){setErr("Enter a title first");return;}
    setUploading(true);
    const clipUrl=await sb.uploadClip(userId,file);
    setUploading(false);
    if(!clipUrl){setErr("Upload failed.");return;}
    onSave({id:gid(),type:"video",title,url:clipUrl,platform:"upload"});
  };
  const go=()=>{if(!title){setErr("Enter a title");return;}if(!url){setErr("Paste a link");return;}if(type==="youtube"){const eid=extractYouTube(url);if(!eid){setErr("Paste a valid YouTube link");return;}onSave({id:gid(),type:"link",platform:"youtube",title,url,eid});}else onSave({id:gid(),type:"link",platform:"instagram",title,url,eid:null});};
  return <Modal title="📱 Add Sports & Social Clip" onClose={onClose}><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div><Lbl>Add Method</Lbl><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[["youtube","▶ YouTube/Sports"],["instagram","📸 Instagram Reel"],["upload","📁 Upload File"]].map(([v,l])=><button key={v} onClick={()=>setType(v)} style={{flex:1,minWidth:90,padding:"8px 0",borderRadius:8,cursor:"pointer",fontSize:10,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,border:`1px solid ${type===v?"#00D4FF":"rgba(255,255,255,.09)"}`,background:type===v?"rgba(0,212,255,.11)":"rgba(255,255,255,.04)",color:type===v?"#00D4FF":"#94A3B8"}}>{l}</button>)}</div></div>
    <div><Lbl>Title</Lbl><input value={title} onChange={e=>{setTitle(e.target.value);setErr("");}} placeholder="e.g. World Series Highlights"/></div>
    {type==="youtube"&&<div><Lbl>YouTube URL</Lbl><input value={url} onChange={e=>{setUrl(e.target.value);setErr("");}} placeholder="https://youtube.com/watch?v=..."/></div>}
    {type==="instagram"&&<div><Lbl>Instagram Reel URL</Lbl><input value={url} onChange={e=>{setUrl(e.target.value);setErr("");}} placeholder="https://www.instagram.com/reel/..."/></div>}
    {type==="upload"&&<div>
      <Lbl>Video File</Lbl>
      <input type="file" ref={fileRef} accept="video/*" onChange={handleFile} style={{display:"none"}}/>
      <Btn variant="ghost" onClick={()=>fileRef.current.click()} disabled={uploading}>{uploading?"⏳ Uploading...":"📁 Choose Video File"}</Btn>
      <div style={{fontSize:11,color:"#334155",marginTop:7}}>Supports MP4, MOV, WebM · Max 200MB · Enter title first</div>
    </div>}
    {err&&<div style={{color:"#EF4444",fontSize:13,background:"rgba(239,68,68,.1)",padding:"9px 12px",borderRadius:8}}>{err}</div>}
    {type!=="upload"&&<div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={go}>Add Clip</Btn></div>}
    {type==="upload"&&<Btn variant="muted" onClick={onClose}>Cancel</Btn>}
  </div></Modal>;
}

function AuthModal({mode,setMode,onSubmit,onClose}){
  const [username,setUsername]=useState(""),[password,setPassword]=useState(""),[displayName,setDisplayName]=useState(""),[err,setErr]=useState(""),[loading,setLoading]=useState(false);
  const go=async()=>{
    setLoading(true);setErr("");
    const e=await onSubmit(username,password,displayName);
    setLoading(false);
    if(e)setErr(e);
  };
  return <Modal title={mode==="login"?"Sign In to Nova 💫":"Create Your Nova Account"} onClose={onClose}><div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div><Lbl>Username</Lbl><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="your_username" onKeyDown={e=>e.key==="Enter"&&go()}/></div>
    {mode==="register"&&<div><Lbl>Display Name</Lbl><input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Your display name"/></div>}
    <div><Lbl>Password</Lbl><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/></div>
    {err&&<div style={{color:"#EF4444",fontSize:13,background:"rgba(239,68,68,.1)",padding:"9px 12px",borderRadius:8}}>⚠️ {err}</div>}
    <Btn size="lg" onClick={go} disabled={loading} style={{width:"100%",justifyContent:"center",marginTop:4}}>{loading?"⏳ Signing in...":mode==="login"?"🚀 Sign In":"💫 Create Account"}</Btn>
    <div style={{textAlign:"center",color:"#475569",fontSize:13}}>{mode==="login"?"New here? ":"Already a member? "}<button onClick={()=>{setMode(mode==="login"?"register":"login");setErr("");}} style={{background:"none",border:"none",color:"#00D4FF",cursor:"pointer",fontSize:13,fontWeight:700}}>{mode==="login"?"Create an account":"Sign in"}</button></div>
  </div></Modal>;
}

function Dashboard({users,staffIds,setStaffIds,discordUrl,setDiscordUrl,onDelUser,onUpdateUser,onAwardBadge,onRevokeBadge,section,setSection,navigate}){
  const [newDiscord,setNewDiscord]=useState(discordUrl),[saved,setSaved]=useState(false);
  const navItems=[{id:"overview",icon:"📊",label:"Overview"},{id:"users",icon:"👥",label:"Members"},{id:"staff",icon:"⚡",label:"Staff"},{id:"badges",icon:"🏅",label:"Badges"},{id:"settings",icon:"⚙️",label:"Settings"}];
  const saveD=()=>{setDiscordUrl(newDiscord);setSaved(true);setTimeout(()=>setSaved(false),2200);};
  return <div style={{maxWidth:1080,margin:"0 auto",padding:"44px 24px 100px",display:"flex",gap:24,alignItems:"flex-start"}}>
    <div style={{width:190,flexShrink:0}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,letterSpacing:".18em",color:"#334155",textTransform:"uppercase",marginBottom:14,paddingLeft:4}}>Owner Panel</div>
      <div style={{display:"flex",flexDirection:"column",gap:3}}>{navItems.map(n=><button key={n.id} onClick={()=>setSection(n.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:9,cursor:"pointer",background:section===n.id?"rgba(0,212,255,.09)":"transparent",border:`1px solid ${section===n.id?"rgba(0,212,255,.25)":"transparent"}`,color:section===n.id?"#00D4FF":"#94A3B8",fontFamily:"'Rajdhani',sans-serif",fontSize:14,fontWeight:600,textAlign:"left",transition:"all .2s"}}><span style={{fontSize:16}}>{n.icon}</span>{n.label}</button>)}</div>
    </div>
    <div style={{flex:1,minWidth:0}}>
      {section==="overview"&&<div>
        <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:22,fontWeight:700,color:"#E2E8F0",marginBottom:26}}>Overview</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:14,marginBottom:28}}>
          {[{icon:"👥",val:users.length,label:"Members",color:"#00D4FF"},{icon:"🟢",val:users.filter(u=>u.status_type==="online").length,label:"Online Now",color:"#22C55E"},{icon:"⚡",val:staffIds.length,label:"Staff",color:"#F59E0B"},{icon:"💬",val:users.reduce((a,u)=>a+(u.comments||[]).length,0),label:"Comments",color:"#A78BFA"},{icon:"🏅",val:users.reduce((a,u)=>a+(u.badges||[]).length,0),label:"Badges Given",color:"#F472B6"}].map((s,i)=><Card key={i} style={{padding:"18px 20px"}}><div style={{fontSize:20,marginBottom:7}}>{s.icon}</div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:26,fontWeight:900,color:s.color,marginBottom:4}}>{s.val}</div><div style={{fontSize:11,color:"#475569"}}>{s.label}</div></Card>)}
        </div>
        <Card style={{padding:22}} hover={false}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#475569",marginBottom:14,letterSpacing:".08em"}}>ALL MEMBERS</div>
          {users.map(u=><div key={u.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
            <div style={{position:"relative",width:36,height:36,flexShrink:0}}><div style={{width:36,height:36,borderRadius:"50%",background:`radial-gradient(circle,${u.page_accent||"#00D4FF"}44,rgba(0,0,0,.7))`,border:`1.5px solid ${u.page_accent||"#00D4FF"}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,overflow:"hidden"}}>{u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}</div><StatusDot type={u.status_type||"offline"} size={10} style={{position:"absolute",bottom:-1,right:-1}}/></div>
            <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{u.display_name}</div><div style={{fontSize:11,color:"#475569"}}>@{u.username} · {(u.followers||[]).length} followers · {(u.badges||[]).length} badges</div></div>
            {u.staff_role&&<RoleBadge color={ROLE_COLOR[u.staff_role]||"#00D4FF"}>{u.staff_role}</RoleBadge>}
            <Btn variant="ghost" size="sm" onClick={()=>navigate("profile",u.id)}>View</Btn>
          </div>)}
        </Card>
      </div>}
      {section==="users"&&<div>
        <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:22,fontWeight:700,color:"#E2E8F0",marginBottom:26}}>Manage Members</h2>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {users.map(u=><Card key={u.id} style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:14}} hover={false}>
            <div style={{position:"relative",width:44,height:44,flexShrink:0}}><div style={{width:44,height:44,borderRadius:"50%",background:`radial-gradient(circle,${u.page_accent||"#00D4FF"}44,rgba(0,0,0,.7))`,border:`2px solid ${u.page_accent||"#00D4FF"}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,overflow:"hidden"}}>{u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}</div><StatusDot type={u.status_type||"offline"} size={11} style={{position:"absolute",bottom:0,right:0}}/></div>
            <div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2,flexWrap:"wrap"}}><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{u.display_name}</span>{u.staff_role&&<RoleBadge color={ROLE_COLOR[u.staff_role]||"#00D4FF"}>{u.staff_role}</RoleBadge>}</div><div style={{fontSize:11,color:"#475569"}}>@{u.username} · {(u.followers||[]).length} followers · {(u.badges||[]).length} badges</div></div>
            <div style={{display:"flex",gap:8,flexShrink:0}}><Btn variant="ghost" size="sm" onClick={()=>navigate("profile",u.id)}>View Page</Btn>{!u.is_owner&&<Btn variant="danger" size="sm" onClick={()=>onDelUser(u.id)}>Remove</Btn>}</div>
          </Card>)}
        </div>
      </div>}
      {section==="staff"&&<div>
        <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:22,fontWeight:700,color:"#E2E8F0",marginBottom:26}}>Staff Management</h2>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {users.map(u=>{const isStaff=staffIds.includes(u.id);return <Card key={u.id} style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:14}} hover={false}>
            <div style={{width:42,height:42,borderRadius:"50%",flexShrink:0,background:`radial-gradient(circle,${u.page_accent||"#00D4FF"}44,rgba(0,0,0,.7))`,border:`2px solid ${isStaff?u.page_accent||"#00D4FF":"rgba(255,255,255,.1)"}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,overflow:"hidden"}}>{u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}</div>
            <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{u.display_name}</div><div style={{fontSize:12,color:"#475569"}}>@{u.username}</div></div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",justifyContent:"flex-end"}}>
              {isStaff&&u.staff_role&&<RoleBadge color={ROLE_COLOR[u.staff_role]||"#00D4FF"}>{u.staff_role}</RoleBadge>}
              {u.is_owner?<RoleBadge color="#F59E0B">Owner</RoleBadge>:isStaff?<Btn variant="danger" size="sm" onClick={()=>{setStaffIds(p=>p.filter(s=>s!==u.id));onUpdateUser(u.id,{staff_role:null});}}>Remove Staff</Btn>:<StaffPicker onAdd={role=>{setStaffIds(p=>[...p,u.id]);onUpdateUser(u.id,{staff_role:role});}}/>}
            </div>
          </Card>;})}
        </div>
      </div>}
      {section==="badges"&&<div>
        <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:22,fontWeight:700,color:"#E2E8F0",marginBottom:8}}>Award Badges</h2>
        <p style={{color:"#475569",fontSize:14,marginBottom:26}}>Click a badge to award it. Click again to revoke.</p>
        {users.map(u=><Card key={u.id} style={{padding:"18px 20px",marginBottom:14}} hover={false}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><div style={{width:36,height:36,borderRadius:"50%",background:`radial-gradient(circle,${u.page_accent||"#00D4FF"}44,rgba(0,0,0,.7))`,border:`1.5px solid ${u.page_accent||"#00D4FF"}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,overflow:"hidden"}}>{u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}</div><div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#E2E8F0"}}>{u.display_name}</div><div style={{fontSize:11,color:"#475569"}}>{(u.badges||[]).length}/{ALL_BADGES.length} badges</div></div></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{ALL_BADGES.map(b=>{const has=(u.badges||[]).includes(b.id);return <button key={b.id} onClick={()=>has?onRevokeBadge(u.id,b.id):onAwardBadge(u.id,b.id)} title={has?`Revoke ${b.label}`:`Award: ${b.desc}`} style={{display:"flex",alignItems:"center",gap:6,background:has?b.color+"22":"rgba(255,255,255,.03)",border:`1px solid ${has?b.color+"55":"rgba(255,255,255,.08)"}`,borderRadius:20,padding:"5px 11px",cursor:"pointer",transition:"all .18s",opacity:has?1:.42}}><span style={{fontSize:14}}>{b.icon}</span><span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:has?b.color:"#475569",letterSpacing:".05em"}}>{b.label}</span>{has&&<span style={{fontSize:9,color:"#EF4444",fontWeight:700}}>✕</span>}</button>;})}</div>
        </Card>)}
      </div>}
      {section==="settings"&&<div>
        <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:22,fontWeight:700,color:"#E2E8F0",marginBottom:26}}>Settings</h2>
        <Card style={{padding:26}} hover={false}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#475569",letterSpacing:".1em",marginBottom:20}}>DISCORD INVITE</div>
          <Lbl>Discord Server Invite URL</Lbl>
          <input value={newDiscord} onChange={e=>setNewDiscord(e.target.value)} placeholder="https://discord.gg/..." style={{marginBottom:14}}/>
          <div style={{display:"flex",alignItems:"center",gap:12}}><Btn onClick={saveD}>💾 Save URL</Btn>{saved&&<span style={{color:"#34D399",fontSize:13,fontWeight:600}}>✓ Saved!</span>}</div>
          <div style={{marginTop:8,fontSize:12,color:"#334155"}}>Current: <span style={{color:"#00D4FF"}}>{discordUrl}</span></div>
        </Card>
      </div>}
    </div>
  </div>;
}

function StaffPicker({onAdd}){
  const [open,setOpen]=useState(false),[role,setRole]=useState("Moderator");
  if(!open)return <Btn variant="ghost" size="sm" onClick={()=>setOpen(true)}>+ Add Staff</Btn>;
  return <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><select value={role} onChange={e=>setRole(e.target.value)} style={{padding:"5px 8px",fontSize:12,width:"auto"}}><option>Moderator</option><option>Event Host</option><option>Helper</option></select><Btn variant="primary" size="sm" onClick={()=>{onAdd(role);setOpen(false);}}>Add</Btn><Btn variant="muted" size="sm" onClick={()=>setOpen(false)}>✕</Btn></div>;
}

export default function App(){
  const [users,setUsers]=useState([]);
  const [cu,setCu]=useState(null);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState("home");
  const [profileId,setProfileId]=useState(null);
  const [discordUrl,setDiscordUrl]=useState("https://discord.gg/nova");
  const [staffIds,setStaffIds]=useState([]);
  const [showAuth,setShowAuth]=useState(false);
  const [authMode,setAuthMode]=useState("login");
  const [dashSec,setDashSec]=useState("overview");
  const [notifs,setNotifs]=useState([]);

  useEffect(()=>{
    (async()=>{
      console.log("Nova: loading users from Supabase...");
      const data=await sb.get("nova_users","?select=*");
      console.log("Nova: users loaded:", data?.length, data);
      if(data){
        const withComments=await Promise.all(data.map(async u=>{
          const comments=await sb.get("nova_comments",`?profile_user_id=eq.${u.id}`)||[];
          return {...u,comments};
        }));
        setUsers(withComments);
        setStaffIds(withComments.filter(u=>u.staff_role).map(u=>u.id));
        const sess=getSession();
        if(sess){
          const fresh=withComments.find(u=>u.id===sess.id);
          if(fresh){setCu(fresh);const ndata=await sb.get("nova_notifications",`?to_user_id=eq.${fresh.id}&order=ts.desc&limit=50`);if(ndata)setNotifs(ndata);}
        }
      }
      setLoading(false);
    })();
  },[]);

  const nav=(p,id=null)=>{setPage(p);if(id)setProfileId(id);};

  const mutUser=async(id,upd)=>{
    await sb.patch("nova_users",`?id=eq.${id}`,upd);
    setUsers(prev=>prev.map(u=>u.id===id?{...u,...upd}:u));
    if(cu?.id===id){const updated={...cu,...upd};setCu(updated);saveSession(updated);}
  };

  const delUser=async id=>{
    if(id==="owner")return;
    await sb.del("nova_users",`?id=eq.${id}`);
    setUsers(prev=>prev.filter(u=>u.id!==id));
    setStaffIds(prev=>prev.filter(s=>s!==id));
    if(page==="profile"&&profileId===id)nav("members");
  };

  const handleFollow=async targetId=>{
    if(!cu)return;
    const me=cu.id;
    const target=users.find(u=>u.id===targetId);
    if(!target)return;
    const already=(target.followers||[]).includes(me);
    const newFollowers=already?(target.followers||[]).filter(x=>x!==me):[...(target.followers||[]),me];
    const newFollowing=already?(cu.following||[]).filter(x=>x!==targetId):[...(cu.following||[]),targetId];
    await sb.patch("nova_users",`?id=eq.${targetId}`,{followers:newFollowers});
    await sb.patch("nova_users",`?id=eq.${me}`,{following:newFollowing});
    setUsers(prev=>prev.map(u=>{if(u.id===targetId)return{...u,followers:newFollowers};if(u.id===me)return{...u,following:newFollowing};return u;}));
    setCu(prev=>prev?{...prev,following:newFollowing}:prev);
    if(!already){const n={id:gid(),to_user_id:targetId,from_user_id:me,msg:"started following you",ts:Date.now(),read:false};await sb.post("nova_notifications",n);}
  };

  const handleComment=async(uid,text)=>{
    if(!cu)return;
    const c={id:gid(),profile_user_id:uid,author_id:cu.id,author_name:cu.display_name,author_avatar:cu.avatar,author_avatar_url:cu.avatar_url||"",text,timestamp:Date.now()};
    await sb.post("nova_comments",c);
    setUsers(prev=>prev.map(u=>u.id===uid?{...u,comments:[...(u.comments||[]),c]}:u));
    if(uid!==cu.id){const n={id:gid(),to_user_id:uid,from_user_id:cu.id,msg:"commented on your profile",ts:Date.now(),read:false};await sb.post("nova_notifications",n);}
  };

  const handleDelComment=async(uid,cid)=>{
    await sb.del("nova_comments",`?id=eq.${cid}`);
    setUsers(prev=>prev.map(u=>u.id===uid?{...u,comments:(u.comments||[]).filter(c=>c.id!==cid)}:u));
  };

  const awardBadge=async(uid,bid)=>{
    const u=users.find(x=>x.id===uid);if(!u||(u.badges||[]).includes(bid))return;
    const nb=[...(u.badges||[]),bid];
    await sb.patch("nova_users",`?id=eq.${uid}`,{badges:nb});
    setUsers(prev=>prev.map(x=>x.id===uid?{...x,badges:nb}:x));
  };

  const revokeBadge=async(uid,bid)=>{
    const u=users.find(x=>x.id===uid);if(!u)return;
    const nb=(u.badges||[]).filter(b=>b!==bid);
    await sb.patch("nova_users",`?id=eq.${uid}`,{badges:nb});
    setUsers(prev=>prev.map(x=>x.id===uid?{...x,badges:nb}:x));
  };

  const handleAuth=async(username,password,displayName)=>{
    if(authMode==="login"){
      console.log("Nova: attempting login for", username);
      const data=await sb.get("nova_users",`?username=eq.${encodeURIComponent(username)}&password=eq.${encodeURIComponent(password)}&select=*&limit=1`);
      console.log("Nova: login result:", data);
      if(data&&data.length>0){
        const u=data[0];
        const comments=await sb.get("nova_comments",`?profile_user_id=eq.${u.id}`)||[];
        const full={...u,comments};
        setCu(full);saveSession(full);setShowAuth(false);
        setUsers(prev=>prev.map(x=>x.id===u.id?full:x.id===u.id?full:x).includes(full)?prev:[...prev.filter(x=>x.id!==u.id),full]);
        const ndata=await sb.get("nova_notifications",`?to_user_id=eq.${u.id}&order=ts.desc&limit=50`);
        if(ndata)setNotifs(ndata);
        return null;
      }
      return "Invalid username or password — check the console (F12) if stuck";
    } else {
      if(username.length<3)return "Username must be at least 3 characters";
      if(password.length<4)return "Password must be at least 4 characters";
      if(!/^[a-zA-Z0-9_]+$/.test(username))return "Letters, numbers and underscores only";
      if(users.find(u=>u.username===username))return "That username is already taken";
      const nu={id:gid(),username,password,display_name:displayName||username,avatar:"🌟",avatar_url:"",bio:"New to Nova 💫",is_owner:false,staff_role:null,joined:new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"}),followers:[],following:[],badges:[],status_type:"online",status_activity:"Just joined Nova! 🚀",page_accent:"#00D4FF",page_music:[],page_clips:[],page_social:[],mlb_team:"",banner_top_url:"",banner_left_url:"",banner_right_url:"",social_roblox:"",social_instagram:"",social_twitter:"",social_youtube:"",social_discord:""};
      const res=await sb.post("nova_users",nu);
      if(!res)return "Failed to create account — check your Supabase connection";
      const newUser={...nu,comments:[]};
      setUsers(prev=>[...prev,newUser]);
      setCu(newUser);saveSession(newUser);setShowAuth(false);
      return null;
    }
  };

  const profileUser=users.find(u=>u.id===profileId);
  const staffUsers=users.filter(u=>staffIds.includes(u.id));

  if(loading)return <><style>{CSS}</style><Starfield/><div style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}><div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:16,animation:"float 2s ease-in-out infinite"}}>💫</div><div style={{fontFamily:"'Orbitron',sans-serif",color:"#475569",fontSize:13,letterSpacing:".2em"}}>LOADING NOVA...</div></div></div></>;

  return <>
    <style>{CSS}</style>
    <Starfield/>
    <div style={{position:"relative",zIndex:1,minHeight:"100vh"}}>
      <Navbar cu={cu} onLogin={()=>{setAuthMode("login");setShowAuth(true);}} onRegister={()=>{setAuthMode("register");setShowAuth(true);}} onLogout={()=>{setCu(null);clearSess();setPage("home");}} nav={nav} page={page} notifs={notifs} onReadNotifs={async()=>{setNotifs(p=>p.map(n=>({...n,read:true})));if(cu)await sb.patch("nova_notifications",`?to_user_id=eq.${cu.id}`,{read:true});}} onClearNotifs={async()=>{setNotifs([]);if(cu)await sb.del("nova_notifications",`?to_user_id=eq.${cu.id}`);}} users={users}/>
      <div style={{paddingTop:62}}>
        {page==="home"&&<HomePage discordUrl={discordUrl} staffUsers={staffUsers} nav={nav} users={users}/>}
        {page==="members"&&<MembersPage users={users} nav={nav}/>}
        {page==="profile"&&profileUser&&<ProfilePage user={profileUser} cu={cu} onUpdatePage={mutUser} onUpdateProfile={mutUser} onFollow={handleFollow} onComment={handleComment} onDelComment={handleDelComment}/>}
        {page==="profile"&&!profileUser&&<div style={{textAlign:"center",padding:"100px 20px"}}><div style={{fontSize:48,marginBottom:16}}>🌌</div><div style={{fontFamily:"'Orbitron',sans-serif",color:"#475569"}}>Profile not found</div></div>}
        {page==="dashboard"&&cu?.is_owner&&<Dashboard users={users} staffIds={staffIds} setStaffIds={setStaffIds} discordUrl={discordUrl} setDiscordUrl={setDiscordUrl} onDelUser={delUser} onUpdateUser={mutUser} onAwardBadge={awardBadge} onRevokeBadge={revokeBadge} section={dashSec} setSection={setDashSec} navigate={nav}/>}
        {page==="dashboard"&&!cu?.is_owner&&<div style={{textAlign:"center",padding:"100px 20px"}}><div style={{fontSize:48,marginBottom:16}}>🔒</div><div style={{fontFamily:"'Orbitron',sans-serif",color:"#475569"}}>Owner access only</div></div>}
      </div>
    </div>
    {showAuth&&<AuthModal mode={authMode} setMode={setAuthMode} onSubmit={handleAuth} onClose={()=>setShowAuth(false)}/>}
  </>;
}
