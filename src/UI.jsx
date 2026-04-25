import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useIsMobile, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NBA_TEAMS, NHL_TEAMS } from "./shared";

// ----------------------------------------------------------------------
// Buttons
// ----------------------------------------------------------------------
export function Btn({children,onClick,variant="primary",size="md",style:ext={},disabled}){
  const [h,setH]=useState(false);
  const fs=size==="sm"?10:size==="lg"?14:11;
  const pd=size==="sm"?"6px 13px":size==="lg"?"14px 30px":"8px 16px";
  const base={display:"inline-flex",alignItems:"center",gap:6,cursor:disabled?"not-allowed":"pointer",fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".06em",border:"none",borderRadius:8,transition:"all .22s",opacity:disabled?.5:1,fontSize:fs,padding:pd,transform:h&&!disabled?"translateY(-1px)":""};
  const v={
    primary:{background:h?"linear-gradient(135deg,#00bfea,#7c3aed)":"linear-gradient(135deg,#00D4FF,#8B5CF6)",color:"#fff",boxShadow:h?"0 8px 28px rgba(0,212,255,.35)":"none"},
    ghost:{background:h?"rgba(0,212,255,.1)":"transparent",border:"1px solid rgba(0,212,255,.4)",color:"#00D4FF"},
    danger:{background:h?"rgba(239,68,68,.25)":"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.35)",color:"#EF4444"},
    muted:{background:h?"rgba(255,255,255,.1)":"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#94A3B8"},
    follow:{background:h?"rgba(0,212,255,.18)":"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.35)",color:"#00D4FF"},
    unfollow:{background:h?"rgba(239,68,68,.15)":"rgba(255,255,255,.05)",border:`1px solid ${h?"rgba(239,68,68,.4)":"rgba(255,255,255,.12)"}`,color:h?"#EF4444":"#94A3B8"},
  };
  return <button style={{...base,...v[variant],...ext}} onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>{children}</button>;
}

// ----------------------------------------------------------------------
// RoleBadge
// ----------------------------------------------------------------------
export function RoleBadge({children,color="#00D4FF"}){
  return <span style={{display:"inline-block",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",padding:"2px 8px",borderRadius:20,background:color+"22",border:`1px solid ${color}55`,color}}>{children}</span>;
}

// ----------------------------------------------------------------------
// Card (container)
// ----------------------------------------------------------------------
export const Card=React.forwardRef(function Card({children,style:ext={},hover=true,onClick},ref){
  const [h,setH]=useState(false);
  return <div ref={ref} onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:"rgba(255,255,255,.03)",backdropFilter:"blur(14px)",border:`1px solid ${h&&hover?"rgba(0,212,255,.28)":"rgba(255,255,255,.07)"}`,borderRadius:14,transition:"all .28s",transform:h&&hover?"translateY(-2px)":"",boxShadow:h&&hover?"0 12px 40px rgba(0,0,0,.3)":"none",cursor:onClick?"pointer":"default",...ext}}>{children}</div>;
});

// ----------------------------------------------------------------------
// Modal
// ----------------------------------------------------------------------
export function Modal({children,onClose,title,width=480}){
  const mob=useIsMobile();
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.82)",backdropFilter:"blur(10px)",display:"flex",alignItems:mob?"flex-end":"center",justifyContent:"center",padding:mob?0:20}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"linear-gradient(150deg,#0c1220,#10172a)",border:"1px solid rgba(0,212,255,.18)",borderRadius:mob?"20px 20px 0 0":"18px",padding:mob?"24px 20px 32px":"30px 32px",width:"100%",maxWidth:mob?"100%":width,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 -20px 60px rgba(0,0,0,.7)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?15:17,fontWeight:700,color:"#E2E8F0"}}>{title}</h2>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"#94A3B8",cursor:"pointer",fontSize:16,padding:"5px 10px"}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Label
// ----------------------------------------------------------------------
export function Lbl({children}){return <div style={{fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".1em",color:"#475569",textTransform:"uppercase",marginBottom:7}}>{children}</div>;}

// ----------------------------------------------------------------------
// Section
// ----------------------------------------------------------------------
export function Sec({title,children,onAdd}){return <div style={{marginBottom:34}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}><h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:700,color:"#E2E8F0",letterSpacing:".05em"}}>{title}</h2>{onAdd&&<Btn variant="ghost" size="sm" onClick={onAdd}>＋ Add</Btn>}</div>{children}</div>;}

// ----------------------------------------------------------------------
// Empty state
// ----------------------------------------------------------------------
export function Empty({icon,msg}){return <div style={{textAlign:"center",padding:"36px 20px",color:"#334155",border:"1px dashed rgba(255,255,255,.07)",borderRadius:12}}><div style={{fontSize:30,marginBottom:8,opacity:.3}}>{icon}</div><div style={{fontSize:13}}>{msg}</div></div>;}

// ----------------------------------------------------------------------
// Close button
// ----------------------------------------------------------------------
export function XBtn({onClick,style:ext={}}){const [h,setH]=useState(false);return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:h?"#ef4444":"rgba(239,68,68,.8)",border:"none",borderRadius:6,width:26,height:26,color:"white",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",zIndex:10,...ext}}>✕</button>;}

// ----------------------------------------------------------------------
// Status Dot
// ----------------------------------------------------------------------
export function StatusDot({type,size=12,style:ext={}}){const s=STATUS_META[type]||STATUS_META.offline;return <div style={{width:size,height:size,borderRadius:"50%",background:s.color,flexShrink:0,boxShadow:type!=="offline"?`0 0 ${size/2}px ${s.color}88`:"none",border:"2px solid rgba(3,7,18,.9)",...ext}} title={s.label}/>;}

// ----------------------------------------------------------------------
// Avatar Circle (uses page_accent)
// ----------------------------------------------------------------------
export function AvatarCircle({user,size=36,onClick}){
  return <div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:`radial-gradient(circle,${user?.page_accent||"#00D4FF"}44,rgba(0,0,0,.7))`,border:`2px solid ${user?.page_accent||"#00D4FF"}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.45,overflow:"hidden",cursor:onClick?"pointer":"default"}}>
    {user?.avatar_url?<img src={user.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:user?.avatar||"👤"}
  </div>;
}
export const Av = AvatarCircle;

// ----------------------------------------------------------------------
// Banner upload button
// ----------------------------------------------------------------------
export function BannerUploadBtn({label,onUpload}){
  const [up,setUp]=useState(false);
  const ref=useRef(null);
  const h=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>10*1024*1024){alert("Max 10MB");return;}setUp(true);await onUpload(f);setUp(false);e.target.value="";};
  return <><input type="file" ref={ref} accept="image/*" onChange={h} style={{display:"none"}}/><Btn variant="ghost" size="sm" onClick={()=>ref.current.click()} disabled={up}>{up?"⏳":label}</Btn></>;
}
export const BannerBtn = BannerUploadBtn;

// ----------------------------------------------------------------------
// Comment image upload
// ----------------------------------------------------------------------
export function CommentImgUpload({onUpload}){
  const[up,setUp]=useState(false);const ref=useRef(null);
  const h=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>8*1024*1024){alert("Max 8MB");return;}setUp(true);await onUpload(f);setUp(false);e.target.value="";};
  return <><input type="file" ref={ref} accept="image/*" onChange={h} style={{display:"none"}}/><button onClick={()=>ref.current.click()} disabled={up} title="Attach photo" style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12,color:"#64748B",display:"flex",alignItems:"center",gap:5,width:"fit-content"}}>{up?"⏳ Uploading...":"📷 Add Photo"}</button></>;
}

// ----------------------------------------------------------------------
// Player headshot URL
// ----------------------------------------------------------------------
export function playerHeadshotUrl(playerId,sport){
  if(!playerId)return"";
  if(sport==="mlb")return`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;
  return`https://a.espncdn.com/combiner/i?img=/i/headshots/${sport}/players/full/${playerId}.png&w=350&h=254&cb=1`;
}

// ----------------------------------------------------------------------
// Team Logo
// ----------------------------------------------------------------------
export function TeamLogo({espn,sport,size=22}){
  const [err,setErr]=useState(false);
  if(err) return <span style={{fontSize:size*.65}}>{sport==="mlb"?"⚾":sport==="nfl"?"🏈":sport==="nba"?"🏀":"🏒"}</span>;
  return <img src={`https://a.espncdn.com/i/teamlogos/${sport}/500/${espn}.png`} width={size} height={size} style={{objectFit:"contain",flexShrink:0}} onError={()=>setErr(true)}/>;
}

// ----------------------------------------------------------------------
// Team badge (compact)
// ----------------------------------------------------------------------
export function TeamBadge({teamId}){
  const allTeams=[...MLB_TEAMS,...NFL_TEAMS,...NBA_TEAMS,...NHL_TEAMS];
  const team=allTeams.find(t=>t.id===teamId);if(!team)return null;
  const sport=teamId.startsWith("nfl_")?"nfl":teamId.startsWith("nba_")?"nba":teamId.startsWith("nhl_")?"nhl":"mlb";
  return <div style={{display:"inline-flex",alignItems:"center",gap:5,background:team.color+"22",border:`1.5px solid ${team.color}66`,borderRadius:20,padding:"3px 10px"}}><TeamLogo espn={team.espn} sport={sport} size={18}/><span style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:team.color,letterSpacing:".06em"}}>{team.abbr}</span><span style={{fontSize:9,color:team.color+"cc",fontWeight:600}}>{team.name}</span></div>;
}

// ----------------------------------------------------------------------
// Team Picker (modal)
// ----------------------------------------------------------------------
export function TeamPicker({sport,teams,value,onChange}){
  const byDiv={};
  teams.forEach(t=>{if(!byDiv[t.div])byDiv[t.div]=[];byDiv[t.div].push(t);});
  return(
    <div style={{maxHeight:320,overflowY:"auto",display:"flex",flexDirection:"column",gap:10}}>
      {Object.entries(byDiv).map(([div,ts])=>(
        <div key={div}>
          <div style={{fontSize:9,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".12em",marginBottom:6}}>{div}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {ts.map(t=>(
              <button key={t.id} onClick={()=>onChange(value===t.id?"":t.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:20,cursor:"pointer",border:`1.5px solid ${value===t.id?t.color+"aa":"rgba(255,255,255,.1)"}`,background:value===t.id?t.color+"22":"rgba(255,255,255,.03)",transition:"all .15s"}}>
                <TeamLogo espn={t.espn} sport={sport} size={16}/>
                <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,color:value===t.id?t.color:"#94A3B8"}}>{t.abbr}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------
// Social Links
// ----------------------------------------------------------------------
export function SocialLinks({user}){
  const platforms=Object.keys(SOCIAL_ICONS).filter(k=>user[`social_${k}`]);
  if(!platforms.length)return null;
  return (
    <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:10,marginBottom:4}}>
      {platforms.map(k=>{
        const val=user[`social_${k}`]; const color=SOCIAL_COLORS[k];
        const inner=<div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,background:color+"18",border:`1.5px solid ${color}44`,cursor:k!=="discord"?"pointer":"default"}}><span style={{color,display:"flex",alignItems:"center"}}>{SOCIAL_ICONS[k]}</span><span style={{fontSize:12,fontWeight:600,color:"#C4CDD6"}}>{k==="discord"?val:`@${val}`}</span></div>;
        if(k==="discord")return <div key={k}>{inner}</div>;
        const urls={roblox:`https://www.roblox.com/search/users?keyword=${val}`,instagram:`https://instagram.com/${val}`,twitter:`https://twitter.com/${val}`,youtube:val.startsWith("http")?val:`https://youtube.com/@${val}`};
        return <a key={k} href={urls[k]} target="_blank" rel="noopener noreferrer">{inner}</a>;
      })}
    </div>
  );
}

// ----------------------------------------------------------------------
// Like Button
// ----------------------------------------------------------------------
export function LikeBtn({clipId,cu,likes,onLike}){
  const liked=cu&&(likes[clipId]||[]).includes(cu.id);
  const count=(likes[clipId]||[]).length;
  const [bounce,setBounce]=useState(false);
  const click=()=>{if(!cu)return;setBounce(true);setTimeout(()=>setBounce(false),300);onLike(clipId,liked);};
  return <button onClick={click} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:cu?"pointer":"not-allowed",color:liked?"#EF4444":"#64748B",transform:bounce?"scale(1.3)":"scale(1)",transition:"transform .15s"}}>
    <span style={{fontSize:22,lineHeight:1}}>{liked?"❤️":"🤍"}</span>
    <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{count}</span>
  </button>;
}

// ----------------------------------------------------------------------
// Clip Carousel
// ----------------------------------------------------------------------
export function ClipCarousel({clips,canEdit,onDelete,emptyIcon,emptyMsg,cu,likes,onLike}){
  const [idx,setIdx]=useState(0);const [key,setKey]=useState(0);
  const touchRef=useRef(null);const timerRef=useRef(null);
  const ci=clips.length?Math.min(idx,clips.length-1):0;
  const go=dir=>{setIdx(i=>(i+dir+clips.length)%clips.length);setKey(k=>k+1);reset();};
  const reset=()=>{clearInterval(timerRef.current);if(clips.length>1)timerRef.current=setInterval(()=>{setIdx(i=>(i+1)%clips.length);setKey(k=>k+1);},60000);};
  useEffect(()=>{reset();return()=>clearInterval(timerRef.current);},[clips.length]);
  if(!clips.length)return <Empty icon={emptyIcon} msg={emptyMsg}/>;
  const c=clips[ci];
  const renderClip=()=>{
    if(c.type==="video"&&c.url)return <div><div style={{fontSize:13,fontWeight:600,color:"#94A3B8",marginBottom:7}}>{c.title}</div><video src={c.url} controls width="100%" style={{borderRadius:10,maxHeight:260,background:"#000"}}/></div>;
    if(c.type==="youtube"&&c.eid)return <div><div style={{fontSize:13,fontWeight:600,color:"#94A3B8",marginBottom:7}}>{c.title}</div><iframe src={`https://www.youtube.com/embed/${c.eid}`} width="100%" height="220" frameBorder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{borderRadius:10}}/></div>;
    if(c.type==="medal")return <Card style={{padding:18}}><div style={{fontSize:10,color:"#475569",fontFamily:"'Orbitron',sans-serif",marginBottom:8}}>MEDAL.TV</div><div style={{fontWeight:700,color:"#E2E8F0",marginBottom:10}}>{c.title}</div>{c.eid?<iframe src={`https://medal.tv/clip/${c.eid}/embed`} width="100%" height="200" frameBorder="0" allowFullScreen style={{borderRadius:8}}/>:<a href={c.url} target="_blank" rel="noopener noreferrer"><Btn variant="ghost" size="sm">▶ Watch</Btn></a>}</Card>;
    return <Card style={{padding:18}}><div style={{display:"flex",gap:14}}><div style={{fontSize:28}}>{c.platform==="instagram"?"📸":"🎬"}</div><div style={{flex:1}}><div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",marginBottom:6}}>{c.platform==="instagram"?"INSTAGRAM REEL":"CLIP"}</div><div style={{fontWeight:700,color:"#E2E8F0",marginBottom:10}}>{c.title}</div><a href={c.url} target="_blank" rel="noopener noreferrer"><Btn variant="ghost" size="sm">▶ Watch Clip</Btn></a></div></div></Card>;
  };
  return (
    <div style={{userSelect:"none"}}>
      <div onTouchStart={e=>touchRef.current=e.touches[0].clientX} onTouchEnd={e=>{if(touchRef.current===null||clips.length<2)return;const d=touchRef.current-e.changedTouches[0].clientX;if(Math.abs(d)>50)go(d>0?1:-1);touchRef.current=null;}} style={{position:"relative"}}>
        <div key={key} className="carousel-slide">{renderClip()}</div>
        {clips.length>1&&<>
          <button onClick={()=>go(-1)} style={{position:"absolute",left:-14,top:"50%",transform:"translateY(-50%)",width:32,height:32,borderRadius:"50%",background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",color:"#00D4FF",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5}}>‹</button>
          <button onClick={()=>go(1)} style={{position:"absolute",right:-14,top:"50%",transform:"translateY(-50%)",width:32,height:32,borderRadius:"50%",background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",color:"#00D4FF",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5}}>›</button>
        </>}
        {canEdit&&<XBtn onClick={()=>{onDelete(c.id);setIdx(0);}} style={{position:"absolute",top:0,right:0}}/>}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.06)"}}>
        {clips.length>1
          ? <div style={{display:"flex",alignItems:"center",gap:6}}>{clips.map((_,i)=><div key={i} onClick={()=>{setIdx(i);setKey(k=>k+1);reset();}} style={{width:i===ci?20:7,height:7,borderRadius:i===ci?4:3.5,background:i===ci?"#00D4FF":"rgba(255,255,255,.15)",cursor:"pointer",transition:"all .25s"}}/>)}<span style={{fontSize:11,color:"#334155",marginLeft:4}}>{ci+1}/{clips.length}</span></div>
          : <div/>
        }
        {likes&&onLike&&<LikeBtn clipId={c.id} cu={cu} likes={likes} onLike={onLike}/>}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Starfield (background)
// ----------------------------------------------------------------------
export function Starfield(){
  const canvasRef=useRef(null);
  const rafRef=useRef(null);
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const ctx=canvas.getContext("2d");
    let W=window.innerWidth, H=window.innerHeight;
    const resize=()=>{W=window.innerWidth; H=window.innerHeight; canvas.width=W; canvas.height=H;};
    resize();
    window.addEventListener("resize",resize);
    const NUM=280;
    const stars=Array.from({length:NUM},()=>({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.6+0.3,
      baseAlpha:Math.random()*0.6+0.2,
      alpha:0,
      twinkleSpeed:Math.random()*0.008+0.003,
      twinkleDir:Math.random()>0.5?1:-1,
      color:Math.random()>0.88?(Math.random()>0.5?"#b3d9ff":"#d4b3ff"):"#ffffff",
      glow:Math.random()>0.92,
    }));
    stars.forEach(s=>{ s.alpha=Math.random()*s.baseAlpha; });
    const shoots=[];
    const spawnShoot=()=>{
      const angle=Math.PI*0.8+Math.random()*Math.PI*0.3;
      const speed=Math.random()*6+8;
      shoots.push({
        x:Math.random()*W*0.8+W*0.2,
        y:Math.random()*H*0.3,
        vx:Math.cos(angle)*speed,
        vy:Math.sin(angle)*speed,
        len:Math.random()*140+80,
        alpha:1,
        width:Math.random()*1.2+0.4,
        trail:[],
      });
    };
    let nextShoot=Date.now()+3000+Math.random()*5000;
    let rocket=null;
    let nextRocket=Date.now()+8000+Math.random()*12000;
    const spawnRocket=()=>{
      const side=Math.floor(Math.random()*4);
      let x,y,angle;
      if(side===0){x=Math.random()*W;y=-60;angle=Math.PI/2+((Math.random()-.5)*0.6);}
      else if(side===1){x=W+60;y=Math.random()*H;angle=Math.PI+((Math.random()-.5)*0.6);}
      else if(side===2){x=Math.random()*W;y=H+60;angle=-Math.PI/2+((Math.random()-.5)*0.6);}
      else{x=-60;y=Math.random()*H;angle=(Math.random()-.5)*0.6;}
      const speed=2.2+Math.random()*1.4;
      rocket={x,y,angle,speed,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,trail:[],size:1+Math.random()*0.5};
    };
    const drawRocket=(r)=>{
      for(let t=1;t<r.trail.length;t++){
        const prog=t/r.trail.length;
        ctx.save();
        ctx.globalAlpha=prog*0.35;
        ctx.strokeStyle=`rgba(255,160,60,${prog})`;
        ctx.lineWidth=3*prog*r.size;
        ctx.lineCap="round";
        ctx.beginPath();
        ctx.moveTo(r.trail[t-1].x,r.trail[t-1].y);
        ctx.lineTo(r.trail[t].x,r.trail[t].y);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.translate(r.x,r.y);
      ctx.rotate(r.angle+Math.PI/2);
      const sc=r.size*14;
      const flicker=0.7+Math.random()*0.6;
      ctx.beginPath();
      ctx.moveTo(0,sc*0.6);
      ctx.lineTo(-sc*0.22*flicker,sc*1.2*flicker);
      ctx.lineTo(0,sc*0.95);
      ctx.lineTo(sc*0.22*flicker,sc*1.2*flicker);
      ctx.closePath();
      const flameGrad=ctx.createLinearGradient(0,sc*0.6,0,sc*1.2);
      flameGrad.addColorStop(0,"rgba(255,220,80,0.95)");
      flameGrad.addColorStop(0.5,"rgba(255,100,20,0.8)");
      flameGrad.addColorStop(1,"rgba(255,40,0,0)");
      ctx.fillStyle=flameGrad;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0,-sc);
      ctx.bezierCurveTo(sc*0.45,-sc*0.5,sc*0.45,sc*0.3,sc*0.28,sc*0.6);
      ctx.lineTo(-sc*0.28,sc*0.6);
      ctx.bezierCurveTo(-sc*0.45,sc*0.3,-sc*0.45,-sc*0.5,0,-sc);
      const bodyGrad=ctx.createLinearGradient(-sc*0.4,0,sc*0.4,0);
      bodyGrad.addColorStop(0,"#a0b4c8");
      bodyGrad.addColorStop(0.35,"#e8f0f8");
      bodyGrad.addColorStop(0.65,"#c8d8e8");
      bodyGrad.addColorStop(1,"#7090a8");
      ctx.fillStyle=bodyGrad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0,-sc*0.28,sc*0.18,0,Math.PI*2);
      ctx.fillStyle="rgba(120,200,255,0.85)";
      ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,0.5)";
      ctx.lineWidth=1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-sc*0.28,sc*0.4);
      ctx.lineTo(-sc*0.7,sc*0.9);
      ctx.lineTo(-sc*0.28,sc*0.65);
      ctx.closePath();
      ctx.fillStyle="#8aaabb";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sc*0.28,sc*0.4);
      ctx.lineTo(sc*0.7,sc*0.9);
      ctx.lineTo(sc*0.28,sc*0.65);
      ctx.closePath();
      ctx.fillStyle="#8aaabb";
      ctx.fill();
      ctx.restore();
    };
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      const bg=ctx.createRadialGradient(W*0.18,H*0.38,0,W*0.5,H*0.5,W*0.9);
      bg.addColorStop(0,"#0e0228");
      bg.addColorStop(0.55,"#030712");
      bg.addColorStop(1,"#030712");
      ctx.fillStyle=bg;
      ctx.fillRect(0,0,W,H);
      const neb=ctx.createRadialGradient(W*0.78,H*0.15,0,W*0.78,H*0.15,W*0.35);
      neb.addColorStop(0,"rgba(139,92,246,0.07)");
      neb.addColorStop(1,"transparent");
      ctx.fillStyle=neb;
      ctx.fillRect(0,0,W,H);
      const neb2=ctx.createRadialGradient(W*0.12,H*0.82,0,W*0.12,H*0.82,W*0.28);
      neb2.addColorStop(0,"rgba(0,180,255,0.05)");
      neb2.addColorStop(1,"transparent");
      ctx.fillStyle=neb2;
      ctx.fillRect(0,0,W,H);
      stars.forEach(s=>{
        s.alpha+=s.twinkleSpeed*s.twinkleDir;
        if(s.alpha>=s.baseAlpha){s.alpha=s.baseAlpha;s.twinkleDir=-1;}
        else if(s.alpha<=0.05){s.alpha=0.05;s.twinkleDir=1;}
        ctx.save();
        ctx.globalAlpha=s.alpha;
        if(s.glow){
          const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*5);
          g.addColorStop(0,s.color);
          g.addColorStop(1,"transparent");
          ctx.fillStyle=g;
          ctx.fillRect(s.x-s.r*5,s.y-s.r*5,s.r*10,s.r*10);
        }
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=s.color;
        ctx.fill();
        ctx.restore();
      });
      const now=Date.now();
      if(now>=nextShoot){spawnShoot();nextShoot=now+3000+Math.random()*5000;}
      for(let i=shoots.length-1;i>=0;i--){
        const sh=shoots[i];
        sh.x+=sh.vx; sh.y+=sh.vy;
        sh.alpha-=0.018;
        sh.trail.push({x:sh.x,y:sh.y});
        if(sh.trail.length>30)sh.trail.shift();
        if(sh.alpha<=0||sh.x<-200||sh.y>H+200){shoots.splice(i,1);continue;}
        ctx.save();
        ctx.lineCap="round";
        for(let t=1;t<sh.trail.length;t++){
          const prog=t/sh.trail.length;
          ctx.globalAlpha=sh.alpha*prog*0.9;
          ctx.strokeStyle=`rgba(200,230,255,${prog})`;
          ctx.lineWidth=sh.width*(1-prog*0.5);
          ctx.beginPath();
          ctx.moveTo(sh.trail[t-1].x,sh.trail[t-1].y);
          ctx.lineTo(sh.trail[t].x,sh.trail[t].y);
          ctx.stroke();
        }
        ctx.globalAlpha=sh.alpha;
        const headGlow=ctx.createRadialGradient(sh.x,sh.y,0,sh.x,sh.y,sh.width*4);
        headGlow.addColorStop(0,"rgba(255,255,255,1)");
        headGlow.addColorStop(0.4,"rgba(180,220,255,0.6)");
        headGlow.addColorStop(1,"transparent");
        ctx.fillStyle=headGlow;
        ctx.fillRect(sh.x-sh.width*4,sh.y-sh.width*4,sh.width*8,sh.width*8);
        ctx.restore();
      }
      const nowR=Date.now();
      if(!rocket&&nowR>=nextRocket){spawnRocket();nextRocket=nowR+10000+Math.random()*15000;}
      if(rocket){
        rocket.trail.push({x:rocket.x,y:rocket.y});
        if(rocket.trail.length>50)rocket.trail.shift();
        rocket.x+=rocket.vx;
        rocket.y+=rocket.vy;
        drawRocket(rocket);
        if(rocket.x<-200||rocket.x>W+200||rocket.y<-200||rocket.y>H+200)rocket=null;
      }
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(rafRef.current);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:0,display:"block",pointerEvents:"none"}}/>;
}

// ----------------------------------------------------------------------
// Notification Bell
// ----------------------------------------------------------------------
export function NotifBell({notifs,onRead,onClear,onMarkOne,navigate,users}){
  const [open,setOpen]=useState(false);const ref=useRef(null);
  const unread=notifs.filter(n=>!n.read).length;
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const handleClick=(n)=>{
    if(!n.read&&onMarkOne)onMarkOne(n.id);
    if(n.meta?.type==="news"&&n.meta?.url){window.open(n.meta.url,"_blank");setOpen(false);}
    else if(n.from_user_id&&n.from_user_id!==n.to_user_id){navigate("profile",n.from_user_id);setOpen(false);}
  };
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>{setOpen(o=>!o);}} className={unread>0?"bell-shake":""} style={{background:open?"rgba(0,212,255,.1)":"none",border:`1px solid ${open?"rgba(0,212,255,.3)":"rgba(255,255,255,.09)"}`,borderRadius:9,width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,transition:"all .2s",position:"relative"}}>
        🔔
        {unread>0&&<div style={{position:"absolute",top:-4,right:-4,width:17,height:17,borderRadius:"50%",background:"linear-gradient(135deg,#EF4444,#DC2626)",color:"white",fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",border:"2px solid #030712"}}>{unread>9?"9+":unread}</div>}
      </button>
      {open&&(
        <div style={{position:"absolute",right:0,top:46,width:340,zIndex:300,background:"linear-gradient(150deg,#0c1220,#0f1929)",border:"1px solid rgba(0,212,255,.15)",borderRadius:14,boxShadow:"0 20px 60px rgba(0,0,0,.8)",overflow:"hidden"}}>
          <div style={{padding:"14px 18px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#94A3B8",letterSpacing:".1em"}}>NOTIFICATIONS {unread>0&&<span style={{color:"#EF4444"}}>· {unread} NEW</span>}</span>
            <div style={{display:"flex",gap:8}}>
              {unread>0&&<button onClick={onRead} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:"#00D4FF"}}>Mark all read</button>}
              {notifs.length>0&&<button onClick={onClear} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:"#334155"}}>Clear</button>}
            </div>
          </div>
          <div style={{maxHeight:380,overflowY:"auto"}}>
            {notifs.length===0
              ? <div style={{padding:"28px 18px",textAlign:"center",color:"#334155",fontSize:13}}><div style={{fontSize:26,marginBottom:8}}>🔕</div>No notifications yet</div>
              : notifs.slice().reverse().map(n=>{
                  const isNews=n.meta?.type==="news";
                  const from=users.find(u=>u.id===n.from_user_id);
                  return (
                    <div key={n.id} onClick={()=>handleClick(n)} style={{padding:"11px 16px",display:"flex",gap:10,alignItems:"flex-start",borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",background:n.read?"transparent":"rgba(0,212,255,.05)",transition:"background .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}
                      onMouseLeave={e=>e.currentTarget.style.background=n.read?"transparent":"rgba(0,212,255,.05)"}>
                      {isNews
                        ?<div style={{width:32,height:32,borderRadius:8,background:"rgba(139,92,246,.2)",border:"1px solid rgba(139,92,246,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>📰</div>
                        :<AvatarCircle user={from} size={32}/>
                      }
                      <div style={{flex:1,minWidth:0}}>
                        {isNews
                          ?<div style={{fontSize:12,color:"#C4CDD6",lineHeight:1.4,marginBottom:2}}>{n.msg}</div>
                          :<div style={{fontSize:12,color:"#C4CDD6",lineHeight:1.4}}><span style={{fontWeight:700,color:"#E2E8F0"}}>{from?.display_name||"Someone"}</span> {n.msg}</div>
                        }
                        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                          <span style={{fontSize:10,color:"#334155"}}>{fmtTime(n.ts||Date.now())}</span>
                          {isNews&&<span style={{fontSize:9,color:"#8B5CF6",fontFamily:"'Orbitron',sans-serif"}}>TAP TO READ →</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
                        {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:"#00D4FF"}}/>}
                        {!n.read&&<button onClick={e=>{e.stopPropagation();onMarkOne&&onMarkOne(n.id);}} style={{fontSize:9,background:"none",border:"1px solid rgba(255,255,255,.1)",borderRadius:4,cursor:"pointer",color:"#475569",padding:"2px 4px"}} title="Mark read">✓</button>}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Followers/Following modal
// ----------------------------------------------------------------------
export function FLModal({type,user,users,navigate,onClose}){
  const ids=type==="followers"?user.followers||[]:user.following||[];
  const members=ids.map(id=>users.find(u=>u.id===id)).filter(Boolean);
  return (
    <Modal title={type==="followers"?"Followers":"Following"} onClose={onClose} width={360}>
      {members.length===0
        ? <div style={{textAlign:"center",padding:"28px 0",color:"#334155",fontSize:13}}>None yet</div>
        : <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {members.map(m=>(
              <div key={m.id} onClick={()=>{navigate("profile",m.id);onClose();}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,212,255,.07)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"}>
                <AvatarCircle user={m} size={38}/>
                <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0"}}>{m.display_name}</div><div style={{fontSize:11,color:"#475569"}}>@{m.username}</div></div>
                <span style={{fontSize:11,color:"#00D4FF"}}>→</span>
              </div>
            ))}
          </div>
      }
    </Modal>
  );
}

// ----------------------------------------------------------------------
// OVR color helper
// ----------------------------------------------------------------------
export function ovrColor(ovr){
  if(!ovr) return "#64748B";
  if(ovr>=93) return "#A855F7";
  if(ovr>=87) return "#22C55E";
  if(ovr>=80) return "#3B82F6";
  if(ovr>=73) return "#F59E0B";
  if(ovr>=65) return "#FB923C";
  return "#64748B";
}

// ----------------------------------------------------------------------
// Roblox Avatar
// ----------------------------------------------------------------------
export function RobloxAvatar({userId,size=44,radius=12,fallback=null,sport="football"}){
  const [url,setUrl]=useState(null);
  const [err,setErr]=useState(false);
  const fb=fallback||(sport==="basketball"?"🏀":sport==="baseball"?"⚾":"🏈");
  useEffect(()=>{
    if(!userId){setErr(true);return;}
    setUrl(null);setErr(false);
    fetch(`/api/roblox-avatar?userId=${userId}`)
      .then(r=>r.json())
      .then(d=>{if(d.imageUrl)setUrl(d.imageUrl);else setErr(true);})
      .catch(()=>setErr(true));
  },[userId]);
  const boxStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    overflow: "hidden",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };
  if(err||!userId){
    return <div style={boxStyle}><span style={{fontSize:size*.42}}>{fb}</span></div>;
  }
  if(!url){
    return <div style={{...boxStyle,background:"rgba(255,255,255,.04)"}}><span style={{fontSize:size*.22,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>…</span></div>;
  }
  return <div style={boxStyle}><img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>setErr(true)}/></div>;
}

// ----------------------------------------------------------------------
// OVR Big (large badge)
// ----------------------------------------------------------------------
export function OVRBig({ovr,size=44}){
  const col=ovrColor(ovr);
  return(
    <div style={{width:size,height:size,borderRadius:size*0.22,background:col+"20",border:`2px solid ${col}55`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:size*0.38,fontWeight:900,color:col,lineHeight:1}}>{ovr||"?"}</span>
    </div>
  );
}