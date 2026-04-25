import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "./shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "./UI";

export default function LeaderboardPage({users,navigate}){
  const mob=useIsMobile();
  const[tab,setTab]=useState("followers");
  const[triviaStats,setTriviaStats]=useState([]);
  const[triviaLoading,setTriviaLoading]=useState(false);
  useEffect(()=>{
    if(tab!=="trivia_correct"&&tab!=="trivia_accuracy"&&tab!=="trivia_wrong")return;
    setTriviaLoading(true);
    sb.get("nova_trivia_stats","?order=total_correct.desc&limit=50").then(rows=>{
      setTriviaStats(rows||[]);
      setTriviaLoading(false);
    }).catch(()=>setTriviaLoading(false));
  },[tab]);
  const boards={
    followers:{label:"👥 Followers",key:u=>(u.followers||[]).length,suffix:"followers"},
    badges:{label:"🏅 Badges",key:u=>(u.badges||[]).length,suffix:"badges"},
    predictions:{label:"🎯 Predictions",key:u=>u.correct_predictions||0,suffix:"correct picks"},
    connections:{label:"🌐 Social",key:u=>(u.followers||[]).length+(u.following||[]).length,suffix:"connections"},
  };
  const board=boards[tab];
  const sorted=board?[...users].sort((a,b)=>board.key(b)-board.key(a)).slice(0,20):[];
  const MEDALS=["🥇","🥈","🥉"];

  // Collect all comments across all users for comment likes leaderboard
  const[allComments,setAllComments]=useState([]);
  const[cmtLoading,setCmtLoading]=useState(false);
  useEffect(()=>{
    if(tab!=="commentlikes")return;
    setCmtLoading(true);
    sb.get("nova_comments","?order=timestamp.desc&limit=500").then(rows=>{
      setAllComments((rows||[]).filter(c=>(c.likes||[]).length>0).sort((a,b)=>(b.likes?.length||0)-(a.likes?.length||0)));
      setCmtLoading(false);
    });
  },[tab]);

  return(
    <div style={{maxWidth:700,margin:"0 auto",padding:"44px 16px 80px"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?22:28,fontWeight:700,marginBottom:8,background:"linear-gradient(135deg,#F59E0B,#EF4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🏆 Leaderboard</h1>
        <p style={{color:"#475569",fontSize:14}}>Nova's top members across every category</p>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:28,flexWrap:"wrap",justifyContent:"center"}}>
        {Object.entries(boards).map(([k,v])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===k?"rgba(0,212,255,.5)":"rgba(255,255,255,.1)"}`,background:tab===k?"rgba(0,212,255,.12)":"rgba(255,255,255,.03)",color:tab===k?"#00D4FF":"#64748B",transition:"all .2s"}}>{v.label}</button>
        ))}
        <button onClick={()=>setTab("commentlikes")} style={{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab==="commentlikes"?"rgba(239,68,68,.5)":"rgba(255,255,255,.1)"}`,background:tab==="commentlikes"?"rgba(239,68,68,.12)":"rgba(255,255,255,.03)",color:tab==="commentlikes"?"#EF4444":"#64748B",transition:"all .2s"}}>❤️ Top Comments</button>
        {[["trivia_correct","🧠 Most Correct","#22C55E"],["trivia_accuracy","🎯 Best Accuracy","#00D4FF"],["trivia_wrong","💀 Most Wrong","#EF4444"]].map(([k,label,c])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===k?c+"88":"rgba(255,255,255,.1)"}`,background:tab===k?c+"18":"rgba(255,255,255,.03)",color:tab===k?c:"#64748B",transition:"all .2s"}}>{label}</button>
        ))}
      </div>

      {tab==="commentlikes"?(
        <div>
          {cmtLoading&&<div style={{textAlign:"center",padding:40,color:"#334155"}}>Loading top comments...</div>}
          {!cmtLoading&&allComments.length===0&&<Empty icon="❤️" msg="No liked comments yet!"/>}
          {!cmtLoading&&allComments.length>0&&(()=>{
            const top=allComments[0];
            const topUser=users.find(x=>x.id===top.author_id);
            return(<>
              {/* Showcase top comment */}
              <div style={{background:"linear-gradient(135deg,rgba(239,68,68,.15),rgba(245,158,11,.08))",border:"1px solid rgba(239,68,68,.3)",borderRadius:16,padding:"16px 20px",marginBottom:20}}>
                <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#EF4444",letterSpacing:".12em",marginBottom:10}}>🏆 MOST LIKED COMMENT</div>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <Av user={topUser||{avatar:top.author_avatar,avatar_url:top.author_avatar_url,page_accent:"#EF4444"}} size={36}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",marginBottom:4,cursor:"pointer"}} onClick={()=>navigate("profile",top.author_id)}>{top.author_name}</div>
                    {top.text?.startsWith("__IMG__")
                      ?<img src={top.text.slice(7)} style={{maxWidth:200,maxHeight:140,borderRadius:8,objectFit:"contain"}}/>
                      :<div style={{fontSize:14,color:"#94A3B8",lineHeight:1.6}}>{top.text}</div>
                    }
                    <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:20}}>❤️</span>
                      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:"#EF4444"}}>{top.likes?.length||0}</span>
                      <span style={{fontSize:11,color:"#475569"}}>likes</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Rest of top comments */}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {allComments.slice(0,25).map((c,i)=>{
                  const au=users.find(x=>x.id===c.author_id);
                  return(
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
                      <div style={{width:28,textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:i<3?18:12,fontWeight:900,color:i===0?"#F59E0B":i===1?"#94A3B8":i===2?"#FB923C":"#334155",flexShrink:0}}>{MEDALS[i]||`#${i+1}`}</div>
                      <Av user={au||{avatar:c.author_avatar,avatar_url:c.author_avatar_url,page_accent:"#EF4444"}} size={32}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0",cursor:"pointer",marginBottom:2}} onClick={()=>navigate("profile",c.author_id)}>{c.author_name}</div>
                        {c.text?.startsWith("__IMG__")
                          ?<span style={{fontSize:11,color:"#475569"}}>📷 Image</span>
                          :<div style={{fontSize:12,color:"#64748B",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.text}</div>
                        }
                      </div>
                      <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:4}}>
                        <span>❤️</span><span style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900,color:"#EF4444"}}>{c.likes?.length||0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>);
          })()}
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {sorted.map((u,i)=>(
            <div key={u.id} onClick={()=>navigate("profile",u.id)} style={{display:"flex",alignItems:"center",gap:mob?10:14,padding:mob?"12px 14px":"14px 18px",borderRadius:14,background:i===0?"linear-gradient(135deg,rgba(245,158,11,.12),rgba(251,191,36,.05))":i===1?"linear-gradient(135deg,rgba(148,163,184,.08),rgba(100,116,139,.04))":i===2?"linear-gradient(135deg,rgba(251,146,60,.1),rgba(234,88,12,.04))":"rgba(255,255,255,.03)",border:`1px solid ${i===0?"rgba(245,158,11,.3)":i===1?"rgba(148,163,184,.15)":i===2?"rgba(251,146,60,.2)":"rgba(255,255,255,.07)"}`,cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}>
              <div style={{width:32,textAlign:"center",fontFamily:"'Orbitron',sans-serif",fontSize:i<3?20:13,fontWeight:900,color:i===0?"#F59E0B":i===1?"#94A3B8":i===2?"#FB923C":"#334155",flexShrink:0}}>{MEDALS[i]||`#${i+1}`}</div>
              <Av user={u} size={mob?38:44}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:12,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{u.display_name}</div>
                <div style={{fontSize:11,color:"#475569"}}>@{u.username}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?18:22,fontWeight:900,color:i===0?"#F59E0B":i===1?"#94A3B8":i===2?"#FB923C":"#00D4FF"}}>{board.key(u)}</div>
                <div style={{fontSize:10,color:"#475569"}}>{board.suffix}</div>
              </div>
            </div>
          ))}
          {sorted.length===0&&<Empty icon="🏆" msg="No data yet!"/>}
        </div>
      )}
      {(tab==="trivia_correct"||tab==="trivia_accuracy"||tab==="trivia_wrong")&&(()=>{
        const MEDALS=["🥇","🥈","🥉"];
        if(triviaLoading)return <div style={{textAlign:"center",padding:60,color:"#334155",fontFamily:"'Orbitron',sans-serif",fontSize:12}}>LOADING…</div>;
        if(!triviaStats.length)return <Empty icon="🧠" msg="No trivia scores yet — play some trivia!"/>;
        let sorted2=[...triviaStats];
        let statKey,statLabel,statColor,statSuffix;
        if(tab==="trivia_correct"){
          sorted2.sort((a,b)=>(b.total_correct||0)-(a.total_correct||0));
          statKey=u=>u.total_correct||0; statLabel="TOTAL CORRECT"; statColor="#22C55E"; statSuffix="correct";
        } else if(tab==="trivia_accuracy"){
          sorted2=sorted2.filter(u=>(u.total_questions||0)>=10); // min 10 questions
          sorted2.sort((a,b)=>{
            const ra=(a.total_correct||0)/Math.max(a.total_questions||1,1);
            const rb=(b.total_correct||0)/Math.max(b.total_questions||1,1);
            return rb-ra;
          });
          statKey=u=>Math.round(((u.total_correct||0)/Math.max(u.total_questions||1,1))*100)+"%";
          statLabel="ACCURACY"; statColor="#00D4FF"; statSuffix="accuracy";
        } else {
          sorted2.sort((a,b)=>(b.total_wrong||0)-(a.total_wrong||0));
          statKey=u=>u.total_wrong||0; statLabel="TOTAL WRONG"; statColor="#EF4444"; statSuffix="wrong";
        }
        const top=sorted2[0];
        const topUser=users.find(x=>x.id===top?.user_id);
        return(
          <div>
            {/* Top player showcase */}
            {top&&(
              <div style={{background:`linear-gradient(135deg,${statColor}18,${statColor}08)`,border:`1px solid ${statColor}44`,borderRadius:16,padding:"16px 20px",marginBottom:20}}>
                <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:statColor,letterSpacing:".12em",marginBottom:10}}>🏆 {statLabel} LEADER</div>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <Av user={topUser||{avatar:top.avatar,avatar_url:top.avatar_url,display_name:top.display_name}} size={48}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{top.display_name||top.username}</div>
                    <div style={{fontSize:11,color:"#64748B"}}>{top.games_played} game{top.games_played!==1?"s":""} played · {top.total_questions} questions answered</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:28,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:statColor}}>{typeof statKey==="function"?statKey(top):statKey}</div>
                    <div style={{fontSize:9,color:"#334155",fontFamily:"'Orbitron',sans-serif"}}>{statSuffix}</div>
                  </div>
                </div>
              </div>
            )}
            {/* Full list */}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {sorted2.slice(0,20).map((u,i)=>{
                const usr=users.find(x=>x.id===u.user_id);
                const val=typeof statKey==="function"?statKey(u):statKey;
                const pct=u.total_questions?Math.round((u.total_correct/u.total_questions)*100):0;
                return(
                  <div key={u.user_id||i} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"12px 16px",cursor:"pointer"}} onClick={()=>navigate("profile",u.user_id)}>
                    <div style={{width:24,textAlign:"center",fontSize:i<3?18:13,flexShrink:0}}>{i<3?MEDALS[i]:`#${i+1}`}</div>
                    <Av user={usr||{avatar:u.avatar,avatar_url:u.avatar_url,display_name:u.display_name}} size={34}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",marginBottom:2}}>{u.display_name||u.username}</div>
                      <div style={{fontSize:10,color:"#475569"}}>{u.games_played} games · {pct}% accuracy</div>
                    </div>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900,color:statColor,flexShrink:0}}>{val}</div>
                  </div>
                );
              })}
            </div>
            {tab==="trivia_accuracy"&&sorted2.length<triviaStats.length&&(
              <div style={{textAlign:"center",fontSize:10,color:"#334155",marginTop:12,fontFamily:"'Orbitron',sans-serif"}}>Minimum 10 questions required to appear on accuracy board</div>
            )}
          </div>
        );
      })()}
    </div>
  );
}


