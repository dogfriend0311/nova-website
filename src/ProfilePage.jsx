import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "./shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "./UI";

// ─── Profile ───────────────────────────────────────────────────────────────────
export default function ProfilePage({userId,cu,users,setUsers,navigate,addNotif,navOpts={}}){
  const mob=useIsMobile();
  const u=users.find(x=>x.id===userId);
  const isMe=cu?.id===userId;
  const isOwner=cu?.is_owner;
  const[showFL,setShowFL]=useState(null);
  const[editModal,setEditModal]=useState(null);
  const[showAddClip,setShowAddClip]=useState(false);
  const[showAddSocial,setShowAddSocial]=useState(false);
  const[commentText,setCommentText]=useState("");
  const[comments,setComments]=useState([]);
  const[showTeamPicker,setShowTeamPicker]=useState(null);
  const[replyTo,setReplyTo]=useState(null); // {id, author_name, author_id}
  const[profileTab,setProfileTab]=useState("posts"); // posts | activity
  const[pinnedCards,setPinnedCards]=useState([]);
  const[pinnedPlays,setPinnedPlays]=useState([]);
  const commentsSectionRef=useRef(null);
  useEffect(()=>{
    if(navOpts.scrollToComments){
      setProfileTab("posts");
      setTimeout(()=>commentsSectionRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),400);
    }
  },[navOpts]);
  const[userActivity,setUserActivity]=useState([]); // comments made by this user elsewhere
  const[activityLoading,setActivityLoading]=useState(false);
  const[showGifPicker,setShowGifPicker]=useState(false);

  useEffect(()=>{
    if(!u)return;
    loadComments();
    // Load pinned cards
    sb.get("nova_user_cards",`?user_id=eq.${userId}&pinned=eq.true&order=pin_order.asc`).then(rows=>{
      if(!rows?.length){setPinnedCards([]);return;}
      // Fix any old ESPN headshot URLs
      setPinnedCards(rows.map(card=>{
        if(card.card_type==="player"&&card.player_id&&(!card.headshot_url||card.headshot_url.includes("espncdn")))
          return{...card,headshot_url:mlbPlayerHeadshot(card.player_id)};
        if(card.card_type==="team"&&card.card_def_id&&(!card.headshot_url||card.headshot_url.includes("espncdn")))
          return{...card,headshot_url:mlbTeamLogo(card.card_def_id.replace("mlb_team_",""))};
        return card;
      }));
    });
    // Load pinned plays
    sb.get("nova_user_plays",`?user_id=eq.${userId}&pinned=eq.true&order=acquired_at.desc`).then(rows=>{
      setPinnedPlays(rows||[]);
    });
  },[userId]);
  useEffect(()=>{
    if(profileTab==="activity"&&userActivity.length===0){
      setActivityLoading(true);
      sb.get("nova_comments",`?author_id=eq.${userId}&order=timestamp.desc&limit=80`)
        .then(rows=>{setUserActivity(rows||[]);setActivityLoading(false);});
    }
  },[profileTab,userId]);
  const loadComments=async()=>{
    const data=await sb.get("nova_comments",`?profile_user_id=eq.${userId}&order=timestamp.desc`);
    if(data)setComments(data);
  };

  if(!u)return <div style={{padding:"100px 20px",textAlign:"center",color:"#334155"}}>User not found</div>;

  const accent=u.page_accent||"#00D4FF";
  const isFollowing=cu&&(cu.following||[]).includes(u.id);
  const following=async()=>{
    if(!cu||isMe)return;
    const myFollowing=cu.following||[];const theirFollowers=u.followers||[];
    const nowF=isFollowing;
    const newMF=nowF?myFollowing.filter(x=>x!==u.id):[...myFollowing,u.id];
    const newTF=nowF?theirFollowers.filter(x=>x!==cu.id):[...theirFollowers,cu.id];
    await sb.patch("nova_users",`?id=eq.${cu.id}`,{following:newMF});
    await sb.patch("nova_users",`?id=eq.${u.id}`,{followers:newTF});
    setUsers(prev=>prev.map(x=>x.id===cu.id?{...x,following:newMF}:x.id===u.id?{...x,followers:newTF}:x));
    if(!nowF)addNotif(u.id,cu.id,"followed you");
  };
  const patchUser=async patch=>{
    await sb.patch("nova_users",`?id=eq.${u.id}`,patch);
    setUsers(prev=>prev.map(x=>x.id===u.id?{...x,...patch}:x));
  };
  const submitComment=async(imgUrl="")=>{
    if(!commentText.trim()&&!imgUrl||!cu)return;
    const text=imgUrl?`__IMG__${imgUrl}`:commentText.trim();
    const c={id:gid(),profile_user_id:u.id,author_id:cu.id,author_name:cu.display_name,author_avatar:cu.avatar,author_avatar_url:cu.avatar_url||"",text,timestamp:Date.now(),reply_to:replyTo?.id||null,reply_to_name:replyTo?.author_name||null,likes:[]};
    await sb.post("nova_comments",c);
    setComments(prev=>[c,...prev]);
    setCommentText("");
    setReplyTo(null);
    if(!isMe)addNotif(u.id,cu.id,"commented on your profile");
    // notify person being replied to
    if(replyTo&&replyTo.author_id&&replyTo.author_id!==cu.id&&replyTo.author_id!==u.id){
      addNotif(replyTo.author_id,cu.id,`replied to your comment: "${text.slice(0,50)}"`);
    }
  };
  const deleteComment=async(cid)=>{
    await sb.del("nova_comments",`?id=eq.${cid}`);
    setComments(prev=>prev.filter(c=>c.id!==cid));
  };
  const addClip=async(clip)=>{
    const clips=[...(u.page_clips||[]),clip];
    await patchUser({page_clips:clips});
    setShowAddClip(false);
  };
  const deleteClip=async(cid)=>{
    const clips=(u.page_clips||[]).filter(c=>c.id!==cid);
    await patchUser({page_clips:clips});
  };
  const addSocial=async(entry)=>{
    const s=[...(u.page_social||[]),entry];
    await patchUser({page_social:s});
    setShowAddSocial(false);
  };
  const deleteSocial=async(sid)=>{
    const s=(u.page_social||[]).filter(x=>x.id!==sid);
    await patchUser({page_social:s});
  };
  const handleBannerUpload=async(f,slot)=>{
    const url=await sb.uploadBanner(u.id,f,slot);
    if(url)await patchUser({[`banner_${slot}_url`]:url});
  };

  const likes={};
  const bannerSlots=["top","left","right"];
  const hasSideBanners=(u.banner_left_url||u.banner_right_url);

  // Support up to 4 tracks — page_music is now an array; handle legacy single-object
  const musicTracks=(()=>{
    const pm=u.page_music;
    if(!pm)return[];
    if(Array.isArray(pm))return pm.filter(t=>t?.url);
    if(pm.url)return[pm]; // legacy single
    return[];
  })();
  const dobAge=u.dob?Math.floor((Date.now()-new Date(u.dob))/(1000*60*60*24*365.25)):null;

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:mob?"0 0 80px":"24px 20px 80px"}}>
      {showFL&&<FLModal type={showFL} user={u} users={users} navigate={navigate} onClose={()=>setShowFL(null)}/>}

      {/* Header */}
      <Card style={{padding:0,overflow:"hidden",marginBottom:20}}>
        {u.banner_top_url
          ?<div style={{height:mob?100:140,background:`url(${u.banner_top_url}) center/cover`,position:"relative"}}>
            {(isMe||isOwner)&&<div style={{position:"absolute",top:8,right:8}}><BannerBtn label="📷 Top" onUpload={f=>handleBannerUpload(f,"top")}/></div>}
          </div>
          :<div style={{height:mob?80:120,background:`linear-gradient(135deg,${accent}22,rgba(139,92,246,.15),rgba(0,0,0,.3))`,position:"relative"}}>
            {(isMe||isOwner)&&<div style={{position:"absolute",top:8,right:8}}><BannerBtn label="📷 Top Banner" onUpload={f=>handleBannerUpload(f,"top")}/></div>}
          </div>
        }
        <div style={{padding:mob?"16px 14px 16px":"20px 24px 20px",display:"flex",gap:mob?10:16,alignItems:"flex-start",flexWrap:mob?"wrap":"nowrap"}}>
          <div style={{position:"relative",flexShrink:0,marginTop:-30}}>
            <div style={{width:mob?64:82,height:mob?64:82,borderRadius:"50%",background:`radial-gradient(circle,${accent}55,rgba(0,0,0,.7))`,border:`3px solid ${accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:mob?28:38,overflow:"hidden",boxShadow:`0 0 28px ${accent}44`}}>
              {u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}
            </div>
            <StatusDot type={u.status_type||"offline"} size={mob?12:14} style={{position:"absolute",bottom:2,right:2}}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",marginBottom:5}}>
              <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?16:21,fontWeight:700,color:"#E2E8F0"}}>{u.display_name}</h1>
              {u.is_owner&&<RoleBadge color="#F59E0B">Owner</RoleBadge>}
              {u.staff_role&&!u.is_owner&&<RoleBadge color={ROLE_COLOR[u.staff_role]||"#00D4FF"}>{u.staff_role}</RoleBadge>}
              {dobAge!==null&&<span style={{fontSize:11,color:"#334155"}}>Age {dobAge}</span>}
            </div>
            <div style={{fontSize:12,color:"#334155",marginBottom:8}}>@{u.username} · Joined {u.joined||"Nova"}</div>
            {u.bio&&<p style={{color:"#94A3B8",fontSize:14,lineHeight:1.6,marginBottom:8}}>{u.bio}</p>}
            {(u.mlb_team||u.nfl_team||u.nba_team||u.nhl_team)&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>{u.mlb_team&&<TeamBadge teamId={u.mlb_team}/>}{u.nfl_team&&<TeamBadge teamId={u.nfl_team}/>}{u.nba_team&&<TeamBadge teamId={u.nba_team}/>}{u.nhl_team&&<TeamBadge teamId={u.nhl_team}/>}</div>}
            <SocialLinks user={u}/>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center",marginTop:10}}>
              <button onClick={()=>setShowFL("followers")} style={{background:"none",border:"none",cursor:"pointer",color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:10}}><span style={{fontSize:14,fontWeight:900}}>{(u.followers||[]).length}</span> followers</button>
              <button onClick={()=>setShowFL("following")} style={{background:"none",border:"none",cursor:"pointer",color:"#E2E8F0",fontFamily:"'Orbitron',sans-serif",fontSize:10}}><span style={{fontSize:14,fontWeight:900}}>{(u.following||[]).length}</span> following</button>
              {cu&&!isMe&&<Btn variant={isFollowing?"unfollow":"follow"} size="sm" onClick={following}>{isFollowing?"Unfollow":"Follow"}</Btn>}
              {(isMe||isOwner)&&<Btn variant="ghost" size="sm" onClick={()=>setEditModal("profile")}>✏️ Edit</Btn>}
              {(isMe||isOwner)&&<Btn variant="ghost" size="sm" onClick={()=>setEditModal("team")}>⚽ Teams</Btn>}
              {(isMe||isOwner)&&<Btn variant="ghost" size="sm" onClick={()=>setEditModal("socials")}>🔗 Socials</Btn>}
            </div>
          </div>
        </div>
      </Card>

      {/* Badges */}
      {(u.badges||[]).length>0&&(
        <div style={{marginBottom:20,display:"flex",gap:10,flexWrap:"wrap"}}>
          {(u.badges||[]).map((bid,i)=>{const b=BADGES.find(x=>x.id===bid);if(!b)return null;return(
            <div key={bid} className="badge-pop" style={{animationDelay:`${i*.06}s`,display:"flex",alignItems:"center",gap:7,padding:"5px 12px",borderRadius:20,background:b.color+"14",border:`1.5px solid ${b.color}44`}} title={b.desc}>
              <span style={{fontSize:16}}>{b.icon}</span>
              <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,letterSpacing:".04em",color:b.color}}>{b.label}</span>
            </div>
          );})}
        </div>
      )}

      {/* Side banners + content */}
      <div style={{display:"flex",gap:16}}>
        {!mob&&hasSideBanners&&(
          <div style={{width:160,flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
            {u.banner_left_url
              ?<div style={{position:"relative"}}><img src={u.banner_left_url} style={{width:160,borderRadius:12,objectFit:"cover",maxHeight:560}}/>{(isMe||isOwner)&&<XBtn onClick={()=>patchUser({banner_left_url:""})} style={{position:"absolute",top:4,right:4}}/>}</div>
              :(isMe||isOwner)&&<BannerBtn label="+ Left" onUpload={f=>handleBannerUpload(f,"left")}/>
            }
          </div>
        )}
        <div style={{flex:1,minWidth:0}}>
          {/* Music */}
          {/* Music tracks (up to 4) */}
          {(musicTracks.length>0||(isMe||isOwner))&&(
            <Card style={{padding:16,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:musicTracks.length>0?10:0}}>
                <div style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:"#475569",letterSpacing:".15em"}}>🎵 VIBING TO</div>
                {(isMe||isOwner)&&musicTracks.length<4&&<Btn variant="ghost" size="sm" onClick={()=>setEditModal("music")}>+ Add Track</Btn>}
              </div>
              {musicTracks.length===0&&(isMe||isOwner)&&(
                <div style={{textAlign:"center",padding:"10px 0"}}><Btn variant="ghost" size="sm" onClick={()=>setEditModal("music")}>🎵 Add Music</Btn></div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {musicTracks.map((track,ti)=>{
                  const tid=track.type==="spotify"?extractSpotify(track.url||""):extractYT(track.url||"");
                  if(!tid)return null;
                  return(
                    <div key={ti} style={{position:"relative"}}>
                      {track.type==="spotify"
                        ?<iframe src={`https://open.spotify.com/embed/track/${tid}?utm_source=generator&theme=0`} width="100%" height="80" frameBorder="0" allow="autoplay;clipboard-write;encrypted-media;fullscreen;picture-in-picture" style={{borderRadius:8,display:"block"}}/>
                        :<iframe src={`https://www.youtube.com/embed/${tid}`} width="100%" height="120" frameBorder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style={{borderRadius:8,display:"block"}}/>
                      }
                      {(isMe||isOwner)&&<button onClick={()=>{const nt=musicTracks.filter((_,i)=>i!==ti);patchUser({page_music:nt});}} style={{position:"absolute",top:4,right:4,background:"rgba(0,0,0,.6)",border:"1px solid rgba(255,255,255,.2)",borderRadius:6,color:"#94A3B8",fontSize:11,cursor:"pointer",padding:"2px 7px"}}>✕</button>}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Clips */}
          <Sec title="🎬 Clips" onAdd={isMe||isOwner?()=>setShowAddClip(true):null}>
            <ClipCarousel clips={u.page_clips||[]} canEdit={isMe||isOwner} onDelete={deleteClip} emptyIcon="🎬" emptyMsg="No clips yet" cu={cu} likes={likes} onLike={()=>{}}/>
          </Sec>

          {/* Pinned Cards */}
          {(pinnedCards.length>0||pinnedPlays.length>0)&&(
            <Sec title="⭐ Nova Cards">
              {pinnedCards.length>0&&(
                <div style={{marginBottom:pinnedPlays.length>0?18:0}}>
                  <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:10}}>CARDS · {pinnedCards.length}</div>
                  <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
                    {pinnedCards.map(card=>(
                      <div key={card.id} style={{flexShrink:0}}>
                        <CardDisplay
                          type={card.card_type}
                          name={card.card_name}
                          headshot={card.custom_headshot||card.headshot_url}
                          totalRating={card.total_play_rating||0}
                          customName={card.custom_name||undefined}
                          customBorder={card.custom_border||undefined}
                          customBg={card.custom_bg||undefined}
                          customEffect={card.custom_effect||undefined}
                          size="md"
                          serial={card.serial}
                          pinned
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pinnedPlays.length>0&&(
                <div>
                  <div style={{fontSize:9,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".12em",marginBottom:10}}>PLAYS · {pinnedPlays.length}</div>
                  <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8}}>
                    {pinnedPlays.map(p=>{
                      const pd=typeof p.play_data==="string"?JSON.parse(p.play_data):p.play_data;
                      return <div key={p.id} style={{flexShrink:0}}><PlayCard play={pd} size="md"/></div>;
                    })}
                  </div>
                </div>
              )}
            </Sec>
          )}

          {/* Social clips */}
          {((u.page_social||[]).length>0||(isMe||isOwner))&&(
            <Sec title="📱 Social Clips" onAdd={isMe||isOwner?()=>setShowAddSocial(true):null}>
              <ClipCarousel clips={u.page_social||[]} canEdit={isMe||isOwner} onDelete={deleteSocial} emptyIcon="📱" emptyMsg="No social clips"/>
            </Sec>
          )}

          {/* Comments with likes + replies + activity tab */}
          <div ref={commentsSectionRef}/>
          <Sec title="💬 Comments">
            {/* Tabs */}
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {[["posts","💬 Comments"],["activity","📋 Activity"]].map(([t,l])=>(
                <button key={t} onClick={()=>setProfileTab(t)} style={{padding:"5px 14px",borderRadius:20,cursor:"pointer",fontSize:10,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${profileTab===t?"rgba(0,212,255,.4)":"rgba(255,255,255,.1)"}`,background:profileTab===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.03)",color:profileTab===t?"#00D4FF":"#64748B"}}>{l}</button>
              ))}
            </div>

            {profileTab==="activity"?(
              <div>
                {activityLoading&&<div style={{textAlign:"center",padding:30,color:"#334155"}}>Loading activity...</div>}
                {!activityLoading&&userActivity.length===0&&<Empty icon="📋" msg="No comment activity yet"/>}
                {!activityLoading&&userActivity.map(ac=>{
                  const isNews=ac.profile_user_id?.startsWith("news_");
                  const targetUser=!isNews&&users.find(x=>x.id===ac.profile_user_id);
                  const isImg=ac.text?.startsWith("__IMG__");
                  const newsId=isNews?ac.profile_user_id.replace("news_",""):null;
                  const handleActivityClick=()=>{
                    if(isNews){
                      navigate("news",null,{expandId:newsId});
                    } else {
                      navigate("profile",ac.profile_user_id,{scrollToComments:true});
                    }
                  };
                  return(
                    <div key={ac.id} onClick={handleActivityClick} style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:8,cursor:"pointer",transition:"border-color .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,212,255,.3)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.06)"}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:10,color:"#475569",marginBottom:4}}>
                          {isNews
                            ?<><span style={{color:"#8B5CF6",fontWeight:700}}>📰 News</span> · <span style={{color:"#94A3B8"}}>click to view discussion</span></>
                            :<>💬 commented on <span style={{color:"#00D4FF",fontWeight:700}}>{targetUser?.display_name||"someone"}'s profile</span></>
                          }
                          <span style={{marginLeft:8}}>{fmtAgo(ac.timestamp)}</span>
                        </div>
                        {ac.reply_to_name&&<div style={{fontSize:10,color:"#8B5CF6",marginBottom:3}}>↩ replying to {ac.reply_to_name}</div>}
                        {isImg
                          ?<span style={{fontSize:11,color:"#475569"}}>📷 Image</span>
                          :<div style={{fontSize:12,color:"#94A3B8",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ac.text}</div>
                        }
                        {(ac.likes?.length>0)&&<div style={{fontSize:10,color:"#EF4444",marginTop:3}}>❤️ {ac.likes.length}</div>}
                      </div>
                      <span style={{fontSize:14,color:"#334155",flexShrink:0,alignSelf:"center"}}>→</span>
                    </div>
                  );
                })}
              </div>
            ):(
              <>
            {cu&&(
              <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"flex-start"}}>
                <Av user={cu} size={32}/>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                  {replyTo&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",borderRadius:8,background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.2)"}}>
                      <span style={{fontSize:11,color:"#8B5CF6",flex:1}}>↩ Replying to <strong>{replyTo.author_name}</strong></span>
                      <button onClick={()=>setReplyTo(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#475569",fontSize:12}}>✕</button>
                    </div>
                  )}
                  <div style={{display:"flex",gap:8}}>
                    <input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitComment();}}} placeholder={replyTo?`Reply to ${replyTo.author_name}...`:"Leave a comment..."} style={{flex:1}}/>
                    <Btn size="sm" onClick={()=>submitComment()} disabled={!commentText.trim()}>Post</Btn>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <CommentImgUpload onUpload={async f=>{
                      const ext=f.name.split(".").pop();
                      const url=await sbUp("nova-banners",`cmt-${gid()}.${ext}`,f);
                      if(url)submitComment(url);
                    }}/>
                    <button onClick={()=>setShowGifPicker(true)} style={{background:"rgba(139,92,246,.15)",border:"1px solid rgba(139,92,246,.3)",borderRadius:8,padding:"4px 10px",cursor:"pointer",color:"#A78BFA",fontSize:12,fontWeight:700}}>GIF</button>
                  </div>
                  {showGifPicker&&<GifPicker onSelect={url=>submitComment(`__IMG__${url}`)} onClose={()=>setShowGifPicker(false)}/>}
                </div>
              </div>
            )}
            {comments.length===0?<Empty icon="💬" msg="No comments yet"/>
            :<div style={{display:"flex",flexDirection:"column",gap:8}}>
              {comments.map(c=>{
                const author=users.find(x=>x.id===c.author_id);
                const canDel=cu&&(cu.id===u.id||cu.is_owner||cu.staff_role);
                const isImg=c.text?.startsWith("__IMG__");
                const likeCount=c.likes?.length||0;
                const iLiked=cu&&(c.likes||[]).includes(cu.id);
                const toggleLike=()=>{
                  if(!cu)return;
                  const newLikes=iLiked?(c.likes||[]).filter(id=>id!==cu.id):[...(c.likes||[]),cu.id];
                  setComments(prev=>prev.map(x=>x.id===c.id?{...x,likes:newLikes}:x));
                  sb.patch("nova_comments",`?id=eq.${c.id}`,{likes:newLikes});
                };
                return(
                  <div key={c.id} className="comment-row" style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",position:"relative"}}>
                    <Av user={author||{avatar:c.author_avatar,avatar_url:c.author_avatar_url,page_accent:"#00D4FF"}} size={30} onClick={()=>navigate("profile",c.author_id)}/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                        <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0",cursor:"pointer"}} onClick={()=>navigate("profile",c.author_id)}>{c.author_name}</span>
                        <span style={{fontSize:10,color:"#334155"}}>{fmtAgo(c.timestamp)}</span>
                      </div>
                      {c.reply_to_name&&<div style={{fontSize:10,color:"#8B5CF6",marginBottom:3}}>↩ replying to {c.reply_to_name}</div>}
                      {isImg
                        ?<img src={c.text.slice(7)} style={{maxWidth:220,maxHeight:260,borderRadius:10,display:"block",marginTop:4,objectFit:"contain",cursor:"pointer"}} onClick={()=>window.open(c.text.slice(7),"_blank")}/>
                        :<div style={{fontSize:13,color:"#94A3B8",lineHeight:1.5}}>{c.text}</div>
                      }
                      <div style={{display:"flex",gap:10,alignItems:"center",marginTop:6}}>
                        <button onClick={toggleLike} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:cu?"pointer":"default",padding:0}}>
                          <span style={{fontSize:13,filter:iLiked?"none":"grayscale(1)",opacity:iLiked?1:.5}}>❤️</span>
                          {likeCount>0&&<span style={{fontSize:10,color:iLiked?"#EF4444":"#475569",fontWeight:700}}>{likeCount}</span>}
                        </button>
                        {cu&&<button onClick={()=>{setReplyTo({id:c.id,author_name:c.author_name,author_id:c.author_id});setProfileTab("posts");}} style={{fontSize:10,color:"#475569",background:"none",border:"none",cursor:"pointer",padding:0}}>↩ Reply</button>}
                      </div>
                    </div>
                    {canDel&&<XBtn className="del-btn" onClick={()=>deleteComment(c.id)} style={{opacity:0,position:"absolute",top:8,right:8}}/>}
                  </div>
                );
              })}
            </div>}
            </>
            )}
          </Sec>
        </div>
        {!mob&&hasSideBanners&&(
          <div style={{width:160,flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
            {u.banner_right_url
              ?<div style={{position:"relative"}}><img src={u.banner_right_url} style={{width:160,borderRadius:12,objectFit:"cover",maxHeight:560}}/>{(isMe||isOwner)&&<XBtn onClick={()=>patchUser({banner_right_url:""})} style={{position:"absolute",top:4,right:4}}/>}</div>
              :(isMe||isOwner)&&<BannerBtn label="+ Right" onUpload={f=>handleBannerUpload(f,"right")}/>
          }
          </div>
        )}
      </div>

      {/* Edit Modals */}
      {editModal==="profile"&&<EditProfileModal u={u} cu={cu} onSave={async p=>{await patchUser(p);setEditModal(null);setUsers(prev=>prev.map(x=>x.id===u.id?{...x,...p}:x));}} onClose={()=>setEditModal(null)}/>}
      {editModal==="music"&&<Modal title="🎵 Set Music" onClose={()=>setEditModal(null)}><EditMusicModal u={u} onSave={async p=>{await patchUser(p);setEditModal(null);}}/></Modal>}
      {editModal==="team"&&<Modal title="🏆 Favorite Teams" onClose={()=>setEditModal(null)} width={580}><EditTeamsModal u={u} onSave={async p=>{await patchUser(p);setEditModal(null);}}/></Modal>}
      {editModal==="socials"&&<Modal title="🔗 Social Links" onClose={()=>setEditModal(null)}><EditSocialsModal u={u} onSave={async p=>{await patchUser(p);setEditModal(null);}}/></Modal>}

      {showAddClip&&<AddClipModal uid={u.id} onAdd={addClip} onClose={()=>setShowAddClip(false)}/>}
      {showAddSocial&&<Modal title="📱 Add Social Clip" onClose={()=>setShowAddSocial(false)}><AddLinkClipModal onAdd={addSocial} onClose={()=>setShowAddSocial(false)}/></Modal>}
    </div>
  );
}

function EditProfileModal({u,cu,onSave,onClose}){
  const[display,setDisplay]=useState(u.display_name||"");
  const[bio,setBio]=useState(u.bio||"");
  const[avatar,setAvatar]=useState(u.avatar||"");
  const[accent,setAccent]=useState(u.page_accent||"#00D4FF");
  const[status,setStatus]=useState(u.status_type||"online");
  const[activity,setActivity]=useState(u.status_activity||"");
  const[dob,setDob]=useState(u.dob||"");
  const[uploading,setUploading]=useState(false);
  const fileRef=useRef(null);
  const handleAv=async e=>{const f=e.target.files[0];if(!f)return;setUploading(true);const url=await sb.upload(u.id,f);if(url)await onSave({avatar_url:url});setUploading(false);};
  return(
    <Modal title="✏️ Edit Profile" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><Lbl>Display Name</Lbl><input value={display} onChange={e=>setDisplay(e.target.value)} placeholder="Your name"/></div>
        <div><Lbl>Bio</Lbl><textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell everyone about yourself" style={{resize:"vertical",minHeight:70}}/></div>
        <div><Lbl>Avatar Emoji</Lbl><input value={avatar} onChange={e=>setAvatar(e.target.value)} placeholder="Paste an emoji 🚀"/></div>
        <div><Lbl>Upload Avatar</Lbl><input type="file" ref={fileRef} accept="image/*" onChange={handleAv} style={{display:"none"}}/><Btn variant="ghost" size="sm" onClick={()=>fileRef.current.click()} disabled={uploading}>{uploading?"Uploading...":"📷 Upload Photo"}</Btn></div>
        <div><Lbl>Date of Birth</Lbl><input type="date" value={dob} onChange={e=>setDob(e.target.value)}/></div>
        <div><Lbl>Accent Color</Lbl><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["#00D4FF","#8B5CF6","#F59E0B","#EF4444","#22C55E","#EC4899","#F97316","#A78BFA"].map(c=><button key={c} onClick={()=>setAccent(c)} style={{width:28,height:28,borderRadius:"50%",background:c,border:`3px solid ${accent===c?"white":"transparent"}`,cursor:"pointer"}}/> )}<input type="color" value={accent} onChange={e=>setAccent(e.target.value)} style={{width:28,height:28,padding:0,border:"none",background:"none",cursor:"pointer"}}/></div></div>
        <div><Lbl>Status</Lbl><select value={status} onChange={e=>setStatus(e.target.value)}>{Object.entries(STATUS_META).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
        <div><Lbl>Activity</Lbl><input value={activity} onChange={e=>setActivity(e.target.value)} placeholder="Watching Yankees game..."/></div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={()=>onSave({display_name:display,bio,avatar,page_accent:accent,status_type:status,status_activity:activity,dob})}>Save</Btn></div>
      </div>
    </Modal>
  );
}
function EditMusicModal({u,onSave}){
  const[url,setUrl]=useState("");
  const[type,setType]=useState("spotify");
  const tracks=(()=>{const pm=u.page_music;if(!pm)return[];if(Array.isArray(pm))return pm.filter(t=>t?.url);if(pm.url)return[pm];return[];})();
  const save=()=>{
    if(!url.trim())return;
    const newTrack={url:url.trim(),type};
    const updated=[...tracks,newTrack].slice(0,4);
    onSave({page_music:updated});
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {tracks.length>0&&<div style={{fontSize:11,color:"#64748B"}}>{tracks.length}/4 tracks added</div>}
      <div style={{display:"flex",gap:8}}>{["spotify","youtube"].map(t=><button key={t} onClick={()=>setType(t)} style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${type===t?"#00D4FF":"rgba(255,255,255,.1)"}`,background:type===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.04)",color:type===t?"#00D4FF":"#94A3B8"}}>{t==="spotify"?"🟢 Spotify":"🔴 YouTube"}</button>)}</div>
      <div><Lbl>Paste Link</Lbl><input value={url} onChange={e=>setUrl(e.target.value)} placeholder={type==="spotify"?"https://open.spotify.com/track/...":"https://youtu.be/..."}/></div>
      <Btn onClick={save} disabled={!url.trim()||tracks.length>=4}>Add Track {tracks.length>=4?"(Full)":""}</Btn>
    </div>
  );
}
function EditTeamsModal({u,onSave}){
  const[mlb,setMlb]=useState(u.mlb_team||"");
  const[nfl,setNfl]=useState(u.nfl_team||"");
  const[nba,setNba]=useState(u.nba_team||"");
  const[nhl,setNhl]=useState(u.nhl_team||"");
  const[tab,setTab]=useState("mlb");
  const tabs=[["mlb","⚾ MLB"],["nfl","🏈 NFL"],["nba","🏀 NBA"],["nhl","🏒 NHL"]];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {tabs.map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{flex:1,minWidth:70,padding:"7px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${tab===t?"#00D4FF":"rgba(255,255,255,.1)"}`,background:tab===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.04)",color:tab===t?"#00D4FF":"#94A3B8"}}>{l}</button>)}
      </div>
      {tab==="mlb"&&<TeamPicker sport="mlb" teams={MLB_TEAMS} value={mlb} onChange={setMlb}/>}
      {tab==="nfl"&&<TeamPicker sport="nfl" teams={NFL_TEAMS} value={nfl} onChange={setNfl}/>}
      {tab==="nba"&&<TeamPicker sport="nba" teams={NBA_TEAMS} value={nba} onChange={setNba}/>}
      {tab==="nhl"&&<TeamPicker sport="nhl" teams={NHL_TEAMS} value={nhl} onChange={setNhl}/>}
      <Btn onClick={()=>onSave({mlb_team:mlb,nfl_team:nfl,nba_team:nba,nhl_team:nhl})}>Save Teams</Btn>
    </div>
  );
}
function EditSocialsModal({u,onSave}){
  const init={roblox:u.social_roblox||"",discord:u.social_discord||"",instagram:u.social_instagram||"",twitter:u.social_twitter||"",youtube:u.social_youtube||""};
  const[vals,setVals]=useState(init);
  const set=(k,v)=>setVals(prev=>({...prev,[k]:v}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {Object.keys(SOCIAL_ICONS).map(k=>(
        <div key={k}><Lbl>{SOCIAL_LABELS[k]}</Lbl><input value={vals[k]} onChange={e=>set(k,e.target.value)} placeholder={k==="discord"?"username#0000":k==="youtube"?"@channel or URL":`@username`}/></div>
      ))}
      <Btn onClick={()=>onSave({social_roblox:vals.roblox,social_discord:vals.discord,social_instagram:vals.instagram,social_twitter:vals.twitter,social_youtube:vals.youtube})}>Save Socials</Btn>
    </div>
  );
}
function AddClipModal({uid,onAdd,onClose}){
  const[type,setType]=useState("url");
  const[title,setTitle]=useState("");
  const[url,setUrl]=useState("");
  const[file,setFile]=useState(null);
  const[uploading,setUploading]=useState(false);
  const fileRef=useRef(null);
  const add=async()=>{
    if(!title)return;
    if(type==="video"){
      if(!file)return;
      setUploading(true);
      const videoUrl=await sb.uploadClip(uid,file);
      setUploading(false);
      if(!videoUrl)return;
      onAdd({id:gid(),type:"video",title,url:videoUrl,ts:Date.now()});
    } else {
      const yt=extractYT(url);
      const med=extractMedal(url);
      if(yt)onAdd({id:gid(),type:"youtube",title,eid:yt,url,ts:Date.now()});
      else if(med)onAdd({id:gid(),type:"medal",title,eid:med,url,ts:Date.now()});
      else onAdd({id:gid(),type:"link",title,url,platform:"other",ts:Date.now()});
    }
  };
  return(
    <Modal title="🎬 Add Clip" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:8}}>{[["url","🔗 URL"],["video","📹 Upload"]].map(([t,l])=><button key={t} onClick={()=>setType(t)} style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"'Orbitron',sans-serif",fontWeight:700,border:`1px solid ${type===t?"#00D4FF":"rgba(255,255,255,.1)"}`,background:type===t?"rgba(0,212,255,.1)":"rgba(255,255,255,.04)",color:type===t?"#00D4FF":"#94A3B8"}}>{l}</button>)}</div>
        <div><Lbl>Title</Lbl><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Clip title"/></div>
        {type==="url"&&<div><Lbl>URL</Lbl><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="YouTube, Medal.tv, etc."/></div>}
        {type==="video"&&<div><Lbl>Video File</Lbl><input type="file" ref={fileRef} accept="video/*" onChange={e=>setFile(e.target.files[0])} style={{display:"none"}}/><Btn variant="ghost" size="sm" onClick={()=>fileRef.current.click()}>{file?`✅ ${file.name}`:"Choose Video"}</Btn></div>}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={add} disabled={uploading||!title}>{uploading?"Uploading...":"Add Clip"}</Btn></div>
      </div>
    </Modal>
  );
}
function AddLinkClipModal({onAdd,onClose}){
  const[title,setTitle]=useState("");const[url,setUrl]=useState("");const[plat,setPlat]=useState("instagram");
  const add=()=>{if(!title||!url)return;onAdd({id:gid(),type:"link",title,url,platform:plat,ts:Date.now()});};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div><Lbl>Title</Lbl><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Clip title"/></div>
      <div><Lbl>URL</Lbl><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Instagram reel, etc."/></div>
      <div><Lbl>Platform</Lbl><select value={plat} onChange={e=>setPlat(e.target.value)}><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="other">Other</option></select></div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={add} disabled={!title||!url}>Add</Btn></div>
    </div>
  );
}

