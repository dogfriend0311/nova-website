import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "../shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "../components/UI";

// ─── WebRTC helpers ─────────────────────────────────────────────────────────────
const ICE_SERVERS={iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"}]};

// Supabase-based signaling: store offer/answer/candidates in nova_signaling
const sig={
  send:async(convId,fromId,type,data)=>{
    await sb.post("nova_signaling",{id:gid(),conv_id:convId,from_id:fromId,type,data:JSON.stringify(data),ts:Date.now()});
  },
  poll:async(convId,afterTs,excludeId)=>{
    return await sb.get("nova_signaling",`?conv_id=eq.${convId}&ts=gt.${afterTs}&from_id=neq.${excludeId}&order=ts.asc`)||[];
  },
  clear:async(convId)=>{
    await sb.del("nova_signaling",`?conv_id=eq.${convId}`);
  },
};

// ─── Voice Call Component ────────────────────────────────────────────────────────
function VoiceCall({cu,conv,users,onEnd}){
  const [status,setStatus]=useState("connecting"); // connecting | active | ended
  const [muted,setMuted]=useState(false);
  const [speaking,setSpeaking]=useState({}); // userId -> bool
  const [remoteNames,setRemoteNames]=useState([]);
  const pcRefs=useRef({});   // peerId -> RTCPeerConnection
  const streamRef=useRef(null);
  const pollRef=useRef(null);
  const tsRef=useRef(Date.now()-500);
  const isHost=useRef(false);

  useEffect(()=>{start();return()=>cleanup();},[]);

  const cleanup=()=>{
    clearInterval(pollRef.current);
    Object.values(pcRefs.current).forEach(pc=>{try{pc.close();}catch{}});
    pcRefs.current={};
    if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
  };

  const start=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
      streamRef.current=stream;
      // Check if there's already a call active in this conv
      const existing=await sb.get("nova_signaling",`?conv_id=eq.${conv.id}&type=eq.call-offer&order=ts.desc&limit=1`);
      if(existing&&existing.length>0){
        // Join existing call as answerer
        await joinCall(existing[0]);
      } else {
        // Start new call as host
        isHost.current=true;
        await sig.send(conv.id,cu.id,"call-offer",{callerId:cu.id,callerName:cu.display_name,ts:Date.now()});
      }
      setStatus("active");
      // Poll for signaling messages
      pollRef.current=setInterval(()=>pollSignals(),1200);
    }catch(e){
      console.error("Voice error:",e);
      setStatus("ended");
    }
  };

  const createPC=async(peerId)=>{
    const pc=new RTCPeerConnection(ICE_SERVERS);
    pcRefs.current[peerId]=pc;
    // Add local tracks
    streamRef.current?.getTracks().forEach(t=>pc.addTrack(t,streamRef.current));
    // Play remote audio
    pc.ontrack=e=>{
      const audio=new Audio();
      audio.srcObject=e.streams[0];
      audio.autoplay=true;
      // Speaking detection
      const ctx=new AudioContext();
      const src=ctx.createMediaStreamSource(e.streams[0]);
      const analyser=ctx.createAnalyser();
      analyser.fftSize=512;
      src.connect(analyser);
      const check=()=>{
        const d=new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(d);
        const vol=d.reduce((a,b)=>a+b,0)/d.length;
        setSpeaking(prev=>({...prev,[peerId]:vol>15}));
        if(pcRefs.current[peerId])requestAnimationFrame(check);
      };
      check();
    };
    pc.onicecandidate=e=>{
      if(e.candidate)sig.send(conv.id,cu.id,"ice-candidate",{to:peerId,candidate:e.candidate});
    };
    return pc;
  };

  const joinCall=async(offerMsg)=>{
    const {callerId}=JSON.parse(offerMsg.data||"{}");
    if(callerId===cu.id)return;
    const pc=await createPC(callerId);
    // Send our join signal
    await sig.send(conv.id,cu.id,"call-join",{joinerId:cu.id,joinerName:cu.display_name});
    setRemoteNames(prev=>[...new Set([...prev,users.find(u=>u.id===callerId)?.display_name||"Someone"])]);
  };

  const pollSignals=async()=>{
    const msgs=await sig.poll(conv.id,tsRef.current,cu.id);
    if(!msgs.length)return;
    tsRef.current=Math.max(...msgs.map(m=>m.ts));
    for(const m of msgs){
      const data=JSON.parse(m.data||"{}");
      if(m.type==="call-join"&&isHost.current){
        // Host creates offer for new joiner
        const {joinerId,joinerName}=data;
        if(joinerId===cu.id)continue;
        setRemoteNames(prev=>[...new Set([...prev,joinerName||"Someone"])]);
        const pc=await createPC(joinerId);
        const offer=await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sig.send(conv.id,cu.id,"sdp-offer",{to:joinerId,sdp:offer});
      } else if(m.type==="sdp-offer"&&data.to===cu.id){
        const pc=pcRefs.current[m.from_id]||await createPC(m.from_id);
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer=await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sig.send(conv.id,cu.id,"sdp-answer",{to:m.from_id,sdp:answer});
        setRemoteNames(prev=>[...new Set([...prev,users.find(u=>u.id===m.from_id)?.display_name||"Someone"])]);
      } else if(m.type==="sdp-answer"&&data.to===cu.id){
        const pc=pcRefs.current[m.from_id];
        if(pc&&pc.signalingState!=="stable")await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } else if(m.type==="ice-candidate"&&data.to===cu.id){
        const pc=pcRefs.current[m.from_id];
        if(pc)try{await pc.addIceCandidate(new RTCIceCandidate(data.candidate));}catch{}
      } else if(m.type==="call-end"){
        endCall();
      }
    }
  };

  const endCall=async()=>{
    await sig.send(conv.id,cu.id,"call-end",{});
    await sig.clear(conv.id);
    cleanup();
    setStatus("ended");
    setTimeout(onEnd,800);
  };

  const toggleMute=()=>{
    const enabled=!muted;
    streamRef.current?.getAudioTracks().forEach(t=>t.enabled=enabled);
    setMuted(!muted);
  };

  if(status==="ended")return null;

  return(
    <div style={{position:"fixed",bottom:80,right:20,zIndex:500,background:"linear-gradient(135deg,#0c1220,#0f1929)",border:"1px solid rgba(34,197,94,.3)",borderRadius:16,padding:"14px 18px",minWidth:220,boxShadow:"0 8px 32px rgba(0,0,0,.6)"}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"#22C55E",letterSpacing:".12em",marginBottom:10}}>
        {status==="connecting"?"⏳ CONNECTING...":"🔴 VOICE CALL · LIVE"}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:speaking[cu.id]?"#22C55E":"#334155",flexShrink:0}}/>
          <span style={{fontSize:12,color:"#E2E8F0",fontWeight:700}}>{cu.display_name} {muted?"🔇":""}</span>
        </div>
        {remoteNames.map((n,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:speaking[i]?"#22C55E":"#334155",flexShrink:0}}/>
            <span style={{fontSize:12,color:"#94A3B8"}}>{n}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={toggleMute} style={{flex:1,padding:"7px 0",borderRadius:10,border:`1px solid ${muted?"rgba(245,158,11,.4)":"rgba(255,255,255,.1)"}`,background:muted?"rgba(245,158,11,.15)":"rgba(255,255,255,.05)",cursor:"pointer",fontSize:13,color:muted?"#F59E0B":"#94A3B8"}}>
          {muted?"🔇 Unmute":"🎤 Mute"}
        </button>
        <button onClick={endCall} style={{flex:1,padding:"7px 0",borderRadius:10,border:"1px solid rgba(239,68,68,.4)",background:"rgba(239,68,68,.15)",cursor:"pointer",fontSize:13,color:"#EF4444"}}>
          📵 End
        </button>
      </div>
    </div>
  );
}

// ─── Watch Party Component ───────────────────────────────────────────────────────
// ─── Watch Party (Hyperbeam) ─────────────────────────────────────────────────────
// ─── GIF Picker (Tenor) with starred favorites ───────────────────────────────────
// Tenor anonymous key - works from any domain, no registration needed
const TENOR_KEY = "LIVDSRZULELA";

// Favorites stored in localStorage per user
const getFavGifs=()=>{try{return JSON.parse(localStorage.getItem("nova_fav_gifs")||"[]");}catch{return[];}};
const saveFavGifs=arr=>{try{localStorage.setItem("nova_fav_gifs",JSON.stringify(arr.slice(0,50)));}catch{}};

function GifPicker({onSelect,onClose}){
  const [tab,setTab]=useState("trending"); // trending | search | favorites
  const [query,setQuery]=useState("");
  const [gifs,setGifs]=useState([]);
  const [favs,setFavs]=useState(()=>getFavGifs());
  const [loading,setLoading]=useState(false);
  const searchRef=useRef(null);

  useEffect(()=>{
    if(tab==="trending")fetchTrending();
    else if(tab==="search"&&query.trim())doSearch(query);
    else if(tab==="search")fetchTrending();
  },[tab]);

  useEffect(()=>{ if(tab!=="favorites")searchRef.current?.focus(); },[tab]);

  // Parse Tenor v1 result into {id, url, preview, title}
  const parseTenor=results=>(results||[]).map(g=>{
    const med=g.media?.[0];
    const url=med?.gif?.url||med?.mediumgif?.url||med?.tinygif?.url||"";
    const preview=med?.tinygif?.url||med?.gif?.url||url;
    return{id:g.id,url,preview,title:g.title||""};
  }).filter(g=>g.url);

  const fetchTrending=async()=>{
    setLoading(true);
    try{
      const r=await fetch(`https://api.tenor.com/v1/trending?key=${TENOR_KEY}&limit=24&contentfilter=medium&media_filter=minimal`);
      const d=await r.json();
      setGifs(parseTenor(d.results));
    }catch(e){console.error("Tenor trending error",e);}
    setLoading(false);
  };

  const doSearch=async(q)=>{
    if(!q.trim()){fetchTrending();return;}
    setLoading(true);
    try{
      const r=await fetch(`https://api.tenor.com/v1/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=24&contentfilter=medium&media_filter=minimal`);
      const d=await r.json();
      setGifs(parseTenor(d.results));
    }catch(e){console.error("Tenor search error",e);}
    setLoading(false);
  };

  const toggleFav=(gif,e)=>{
    e.stopPropagation();
    const exists=favs.find(f=>f.id===gif.id);
    const next=exists?favs.filter(f=>f.id!==gif.id):[gif,...favs];
    setFavs(next);
    saveFavGifs(next);
  };

  const isFav=id=>favs.some(f=>f.id===id);

  const displayGifs=tab==="favorites"?favs:gifs;

  const tabStyle=(t)=>({
    padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",border:"none",
    background:tab===t?"rgba(0,212,255,.2)":"rgba(255,255,255,.05)",
    color:tab===t?"#00D4FF":"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".05em"
  });

  return(
    <div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.75)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:440,height:540,background:"#0c1220",border:"1px solid rgba(255,255,255,.12)",borderRadius:16,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.9)"}}>
        {/* Header */}
        <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:18}}>🎭</span>
          <input ref={searchRef} placeholder="Search GIFs..." value={query}
            onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"){setTab("search");doSearch(query);}}}
            style={{flex:1,padding:"7px 12px",borderRadius:20,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:"#E2E8F0",fontSize:13,outline:"none"}}/>
          <button onClick={()=>{setTab("search");doSearch(query);}} style={{background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",borderRadius:8,padding:"6px 12px",cursor:"pointer",color:"#00D4FF",fontSize:12}}>Go</button>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#475569",fontSize:20,lineHeight:1}}>✕</button>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",gap:6,padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,.05)",flexShrink:0}}>
          <button style={tabStyle("trending")} onClick={()=>setTab("trending")}>🔥 Trending</button>
          <button style={tabStyle("search")} onClick={()=>setTab("search")}>🔍 Search</button>
          <button style={tabStyle("favorites")} onClick={()=>setTab("favorites")}>⭐ Saved {favs.length>0&&`(${favs.length})`}</button>
        </div>
        {/* Grid */}
        <div style={{flex:1,overflowY:"auto",padding:10,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,alignContent:"start"}}>
          {loading&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:30,color:"#475569",fontSize:13}}>Loading GIFs...</div>}
          {!loading&&tab==="favorites"&&favs.length===0&&(
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:"30px 20px",color:"#334155"}}>
              <div style={{fontSize:28,marginBottom:8}}>⭐</div>
              <div style={{fontSize:12}}>Star GIFs to save them here</div>
            </div>
          )}
          {!loading&&tab!=="favorites"&&gifs.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:30,color:"#475569"}}>No GIFs found</div>}
          {!loading&&displayGifs.map(g=>(
            <div key={g.id} style={{position:"relative",cursor:"pointer",borderRadius:8,overflow:"hidden",aspectRatio:"1",background:"rgba(255,255,255,.04)",border:`1px solid ${isFav(g.id)?"rgba(245,158,11,.4)":"rgba(255,255,255,.06)"}`,transition:"border-color .15s"}}
              onClick={()=>{onSelect(g.url);onClose();}}>
              <img src={g.preview||g.url} alt={g.title} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
              {/* Star button */}
              <button onClick={e=>toggleFav(g,e)} style={{position:"absolute",top:4,right:4,background:"rgba(0,0,0,.6)",border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.opacity=1;e.currentTarget.parentElement.querySelector("button").style.opacity=1;}}
                className="gif-star">
                {isFav(g.id)?"⭐":"☆"}
              </button>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div style={{padding:"6px 12px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".05em"}}>POWERED BY TENOR</div>
          {favs.length>0&&tab==="favorites"&&<button onClick={()=>{setFavs([]);saveFavGifs([]);}} style={{fontSize:10,color:"#EF4444",background:"none",border:"none",cursor:"pointer"}}>Clear all</button>}
        </div>
      </div>
    </div>
  );
}

const HB_KEY = "sk_test_vUEKzTF26D0FfDCFTJZpUXGrQlpzs8P7ET95_q9CRyI";

async function createHBSession(){
  // Call our Vercel serverless proxy to avoid CORS
  const r = await fetch("/api/hyperbeam", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({action:"create"})
  });
  if(!r.ok){ const t=await r.text(); throw new Error(t); }
  return r.json();
}

function WatchParty({cu,conv,users,onEnd}){
  const [phase,setPhase]=useState("idle"); // idle | loading | active
  const [embedUrl,setEmbedUrl]=useState(null);
  const [sessionId,setSessionId]=useState(null);
  const [chatMsgs,setChatMsgs]=useState([]);
  const [chatInput,setChatInput]=useState("");
  const [members,setMembers]=useState([cu.display_name]);
  const [wpGifPicker,setWpGifPicker]=useState(false);
  const [err,setErr]=useState(null);
  const chatPollRef=useRef(null);
  const chatTsRef=useRef(Date.now()-500);
  const memberPollRef=useRef(null);
  const isHost=useRef(false);
  const hbContainerRef=useRef(null);
  const hbInstanceRef=useRef(null);

  // Load Hyperbeam SDK once
  useEffect(()=>{
    if(!document.getElementById("hb-sdk")){
      const s=document.createElement("script");
      s.id="hb-sdk";
      s.src="https://unpkg.com/@hyperbeam/web@0.1.29/dist/index.js";
      s.crossOrigin="anonymous";
      document.head.appendChild(s);
    }
  },[]);

  // When embedUrl arrives and phase goes active, init SDK
  useEffect(()=>{
    if(phase!=="active"||!embedUrl||!hbContainerRef.current)return;
    const init=async()=>{
      // Wait for SDK to load
      let tries=0;
      while(!window.Hyperbeam&&!window.HyperbeamEmbed&&tries<30){await new Promise(r=>setTimeout(r,200));tries++;}
      const HB=window.Hyperbeam||window.HyperbeamEmbed;
      if(!HB){
        // SDK failed — fallback to iframe
        hbContainerRef.current.innerHTML=`<iframe src="${embedUrl}" allow="microphone;camera;fullscreen;clipboard-read;clipboard-write;autoplay" style="width:100%;height:100%;border:none;background:#000;"></iframe>`;
        return;
      }
      try{
        if(hbInstanceRef.current)hbInstanceRef.current.destroy();
        const fn=typeof HB==="function"?HB:(HB.default||HB.Hyperbeam);
        hbInstanceRef.current=await fn(hbContainerRef.current,embedUrl);
      }catch(e){
        console.error("HB SDK init error",e);
        // Fallback to iframe on SDK error
        hbContainerRef.current.innerHTML=`<iframe src="${embedUrl}" allow="microphone;camera;fullscreen;clipboard-read;clipboard-write;autoplay" style="width:100%;height:100%;border:none;background:#000;"></iframe>`;
      }
    };
    init();
    return()=>{ if(hbInstanceRef.current){try{hbInstanceRef.current.destroy();}catch{}} hbInstanceRef.current=null; };
  },[phase,embedUrl]);

  useEffect(()=>{
    // Check if session already exists for this conv
    sb.get("nova_signaling",`?conv_id=eq.${conv.id}_hb&type=eq.hb-session&order=ts.desc&limit=1`).then(rows=>{
      if(rows&&rows.length>0){
        const d=JSON.parse(rows[0].data||"{}");
        if(d.embed_url){ setEmbedUrl(d.embed_url); setSessionId(d.session_id); setPhase("active"); }
      }
    });
    chatPollRef.current=setInterval(pollChat,2500);
    memberPollRef.current=setInterval(pollMembers,3000);
    return()=>{ clearInterval(chatPollRef.current); clearInterval(memberPollRef.current); };
  },[]);

  const pollChat=async()=>{
    const msgs=await sb.get("nova_signaling",`?conv_id=eq.${conv.id}_hbchat&ts=gt.${chatTsRef.current}&order=ts.asc`)||[];
    if(!msgs.length)return;
    chatTsRef.current=Math.max(...msgs.map(m=>m.ts));
    setChatMsgs(prev=>[...prev,...msgs.map(m=>({...JSON.parse(m.data||"{}"),id:m.id}))]);
  };

  const pollMembers=async()=>{
    const rows=await sb.get("nova_signaling",`?conv_id=eq.${conv.id}_hb&type=eq.hb-join&order=ts.asc`)||[];
    const names=[...new Set([cu.display_name,...rows.map(r=>JSON.parse(r.data||"{}").name||"?").filter(Boolean)])];
    setMembers(names);
  };

  const hostParty=async()=>{
    setPhase("loading"); setErr(null);
    try{
      const sess=await createHBSession();
      // Save session to signaling so others can join
      await sb.post("nova_signaling",{id:gid(),conv_id:conv.id+"_hb",from_id:cu.id,type:"hb-session",data:JSON.stringify({embed_url:sess.embed_url,session_id:sess.session_id}),ts:Date.now()});
      isHost.current=true;
      setEmbedUrl(sess.embed_url); setSessionId(sess.session_id); setPhase("active");
    }catch(e){ setErr("Failed to start: "+e.message); setPhase("idle"); }
  };

  const joinParty=async()=>{
    const rows=await sb.get("nova_signaling",`?conv_id=eq.${conv.id}_hb&type=eq.hb-session&order=ts.desc&limit=1`);
    if(!rows||!rows.length){ setErr("No active party found. Ask someone to host first."); return; }
    const d=JSON.parse(rows[0].data||"{}");
    if(!d.embed_url){ setErr("Session URL missing."); return; }
    await sb.post("nova_signaling",{id:gid(),conv_id:conv.id+"_hb",from_id:cu.id,type:"hb-join",data:JSON.stringify({name:cu.display_name}),ts:Date.now()});
    setEmbedUrl(d.embed_url); setSessionId(d.session_id); setPhase("active");
  };

  const endParty=async()=>{
    if(isHost.current&&sessionId){
      try{
        await fetch("/api/hyperbeam",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"delete",sessionId})});
      }catch{}
      await sb.del("nova_signaling",`?conv_id=eq.${conv.id}_hb`);
      await sb.del("nova_signaling",`?conv_id=eq.${conv.id}_hbchat`);
    }
    onEnd();
  };

  const sendGif=async(url)=>{
    const now=Date.now();
    const msgId=gid();
    const msg={name:cu.display_name,text:`__IMG__${url}`,ts:now};
    setChatMsgs(prev=>[...prev,{...msg,id:msgId}]); // optimistic
    chatTsRef.current=now; // bump so pollChat skips this message
    await sb.post("nova_signaling",{id:msgId,conv_id:conv.id+"_hbchat",from_id:cu.id,type:"hb-chat",data:JSON.stringify(msg),ts:now});
  };
  const sendChat=async()=>{
    if(!chatInput.trim())return;
    const now=Date.now();
    const msgId=gid();
    const msg={name:cu.display_name,text:chatInput.trim(),ts:now};
    setChatMsgs(prev=>[...prev,{...msg,id:msgId}]); // optimistic
    chatTsRef.current=now; // bump so pollChat skips this message
    setChatInput("");
    await sb.post("nova_signaling",{id:msgId,conv_id:conv.id+"_hbchat",from_id:cu.id,type:"hb-chat",data:JSON.stringify(msg),ts:now});
  };

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:"#000"}}>
      {/* Header */}
      <div style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",gap:10,background:"rgba(0,0,0,.4)",flexShrink:0}}>
        <span style={{fontSize:18}}>🎬</span>
        <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,color:"#E2E8F0",flex:1}}>WATCH PARTY</span>
        {phase==="active"&&(
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {members.slice(0,4).map((n,i)=>(
              <div key={i} style={{fontSize:10,color:"#22C55E",background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.3)",borderRadius:20,padding:"2px 8px"}}>
                {n===cu.display_name?"● You":n}
              </div>
            ))}
            {members.length>4&&<div style={{fontSize:10,color:"#475569"}}>+{members.length-4}</div>}
          </div>
        )}
        <button onClick={endParty} style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"4px 10px",cursor:"pointer",color:"#EF4444",fontSize:11,fontFamily:"'Orbitron',sans-serif"}}>
          {isHost.current?"END":"LEAVE"}
        </button>
      </div>

      {phase==="idle"&&(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,padding:24}}>
          <div style={{fontSize:52}}>🎬</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:700,color:"#E2E8F0"}}>Watch Party</div>
          <div style={{fontSize:13,color:"#64748B",textAlign:"center",maxWidth:320,lineHeight:1.7}}>
            Browse any website together in real-time — Netflix, ESPN+, YouTube, Twitch, anything. Everyone sees the same browser.
          </div>
          {err&&<div style={{fontSize:12,color:"#EF4444",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"8px 14px"}}>{err}</div>}
          <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
            <Btn onClick={hostParty}>🖥 Host Party</Btn>
            <Btn variant="ghost" onClick={joinParty}>👁 Join Party</Btn>
          </div>
          <div style={{fontSize:11,color:"#334155",textAlign:"center"}}>Host creates a shared virtual browser · Everyone can browse and control it together</div>
        </div>
      )}

      {phase==="loading"&&(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
          <div style={{fontSize:36}}>⏳</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,color:"#00D4FF"}}>STARTING SESSION...</div>
          <div style={{fontSize:11,color:"#475569"}}>Creating virtual browser, please wait</div>
        </div>
      )}

      {phase==="active"&&embedUrl&&(
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {/* Hyperbeam SDK container */}
          <div ref={hbContainerRef} style={{flex:1,background:"#000",minWidth:0}}/>
          {/* Party chat sidebar */}
          <div style={{width:220,flexShrink:0,display:"flex",flexDirection:"column",borderLeft:"1px solid rgba(255,255,255,.07)",background:"rgba(0,0,0,.4)"}}>
            <div style={{padding:"8px 12px",fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",borderBottom:"1px solid rgba(255,255,255,.05)",letterSpacing:".1em"}}>PARTY CHAT</div>
            <div style={{flex:1,overflowY:"auto",padding:"10px",display:"flex",flexDirection:"column",gap:7}}>
              {chatMsgs.length===0&&<div style={{fontSize:11,color:"#334155",textAlign:"center",padding:"20px 0"}}>Chat while you watch!</div>}
              {chatMsgs.map((m,i)=>{
                const isGif=m.text?.startsWith("__IMG__");
                return(
                  <div key={m.id||i}>
                    <span style={{color:m.name===cu.display_name?"#00D4FF":"#8B5CF6",fontWeight:700,fontSize:10}}>{m.name}</span>
                    {isGif
                      ?<img src={m.text.slice(7)} style={{display:"block",maxWidth:"100%",borderRadius:6,marginTop:3}} loading="lazy"/>
                      :<span style={{fontSize:12,color:"#94A3B8"}}> {m.text}</span>
                    }
                  </div>
                );
              })}
            </div>
            {wpGifPicker&&<GifPicker onSelect={url=>{sendGif(url);setWpGifPicker(false);}} onClose={()=>setWpGifPicker(false)}/>}
            <div style={{padding:"8px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:4,flexDirection:"column"}}>
              <div style={{display:"flex",gap:4}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendChat();}} placeholder="Say something..." style={{flex:1,fontSize:11,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#E2E8F0",outline:"none"}}/>
                <button onClick={()=>setWpGifPicker(true)} style={{background:"rgba(139,92,246,.15)",border:"1px solid rgba(139,92,246,.3)",borderRadius:6,padding:"6px 8px",cursor:"pointer",color:"#A78BFA",fontSize:10,fontWeight:700}}>GIF</button>
                <button onClick={sendChat} style={{background:"rgba(0,212,255,.15)",border:"1px solid rgba(0,212,255,.3)",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#00D4FF",fontSize:14}}>→</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage({cu,users,conversations,setConversations,messages,setMessages}){
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
                {/* Voice call button */}
                <button onClick={()=>{setInWatchParty(false);setInCall(v=>!v);}} title="Voice Call" style={{background:inCall?"rgba(34,197,94,.2)":"rgba(255,255,255,.05)",border:`1px solid ${inCall?"rgba(34,197,94,.4)":"rgba(255,255,255,.1)"}`,borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:inCall?"#22C55E":"#94A3B8"}}>📞</button>
                {/* Watch party button */}
                <button onClick={()=>{setInCall(false);setInWatchParty(v=>!v);}} title="Watch Party" style={{background:inWatchParty?"rgba(139,92,246,.2)":"rgba(255,255,255,.05)",border:`1px solid ${inWatchParty?"rgba(139,92,246,.4)":"rgba(255,255,255,.1)"}`,borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:inWatchParty?"#8B5CF6":"#94A3B8"}}>🎬</button>
              </div>
              {/* Voice Call panel */}
              {inCall&&cu&&activeConv&&(
                <div style={{borderBottom:"1px solid rgba(34,197,94,.2)",flexShrink:0}}>
                  <VoiceCall cu={cu} conv={activeConv} users={users} onEnd={()=>setInCall(false)}/>
                </div>
              )}
              {/* Watch Party — rendered as fullscreen modal below */}
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

      {/* Watch Party fullscreen modal */}
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

