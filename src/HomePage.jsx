import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "./shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "./UI";

// ─── Home ──────────────────────────────────────────────────────────────────────
export default function HomePage({discordUrl,staffUsers,nav,users}){
  const mob=useIsMobile();
  const online=users.filter(u=>u.status_type==="online").length;

  const NAV_PAGES=[
    {p:"members",icon:"👥",label:"Members",color:"#00D4FF",desc:"Browse every Nova member, see their stats, teams, and profiles. Follow your favorites and connect with the community."},

    {p:"feed",icon:"🎬",label:"Clips Feed",color:"#EC4899",desc:"Watch and share highlight clips from the community. React, comment, and show love to the best plays."},
    {p:"gmmode",icon:"🏆",label:"GM Mode",color:"#F59E0B",desc:"Run any MLB, NFL, NBA or NHL team as GM. Manage contracts, trade players, sim a full season, and build a dynasty."},
    {p:"cards",icon:"⚾",label:"Nova Cards",color:"#F59E0B",desc:"Collect MLB player and team cards, open packs for real 2025 play cards, level up your cards and flex them on your profile."},

    {p:"trivia",icon:"🧠",label:"Trivia",color:"#A855F7",desc:"Challenge yourself with sports trivia across 4 sports and 3 difficulty levels. MVP years, stat records, championships and more."},
    {p:"leaderboard",icon:"🏆",label:"Leaderboard",color:"#F97316",desc:"See who's on top — ranked by followers, trivia score, predictions accuracy, and most liked comments."},
    {p:"hub",icon:"📊",label:"Hub",color:"#00D4FF",desc:"News, live scores, player stats, game logs, standings and predictions all in one place — across MLB, NBA, NHL, and NFL."},
    {p:"nffl",icon:"🏈",label:"Football League",color:"#F59E0B",desc:"Football League — player stats, game feed, transactions and rosters for our community football league."},
    {p:"nbbl",icon:"⚾",label:"Baseball League",color:"#22C55E",desc:"Baseball League — hitting stats, pitching stats, fielding stats and game feed for our community baseball league."},
    {p:"ringrush",icon:"🏀",label:"Basketball League",color:"#EC4899",desc:"Basketball League — the Basketball League. Stats, rosters, game feed and player profiles for our community hoops league."},
    {p:"messages",icon:"💬",label:"Messages",color:"#38BDF8",desc:"Slide into DMs, create group chats, share clips and GIFs, and hop on voice calls with other Nova members."},
  ];

  return(
    <div style={{maxWidth:1080,margin:"0 auto",padding:"0 20px 100px"}}>
      {/* Hero */}
      <div style={{textAlign:"center",padding:mob?"50px 0 44px":"72px 0 60px"}}>
        <div className="fadeUp" style={{fontSize:mob?46:60,marginBottom:10,display:"inline-block",animation:"float 3.5s ease-in-out infinite"}}>💫</div>
        <h1 className="fadeUp d1" style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?"clamp(48px,16vw,76px)":"clamp(44px,7.5vw,88px)",fontWeight:900,lineHeight:1.02,letterSpacing:".06em",marginBottom:14,background:"linear-gradient(135deg,#fff 0%,#a8d8ff 40%,#00D4FF 65%,#8B5CF6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NOVA</h1>
        <p className="fadeUp d2" style={{fontSize:mob?14:17,color:"#94A3B8",maxWidth:420,margin:"0 auto 12px",lineHeight:1.7,fontWeight:500}}>The sports community for fans who actually know the game.</p>
        <div className="fadeUp d2" style={{display:"flex",gap:20,justifyContent:"center",marginBottom:26}}>
          <span style={{fontSize:11,color:"#334155",fontFamily:"'Orbitron',sans-serif",letterSpacing:".18em"}}>{users.length} MEMBERS</span>
          <span style={{width:1,background:"rgba(255,255,255,.08)"}}/>
          <span style={{fontSize:11,color:"#22C55E",fontFamily:"'Orbitron',sans-serif",letterSpacing:".18em",display:"flex",alignItems:"center",gap:5}}><div style={{width:6,height:6,borderRadius:"50%",background:"#22C55E",boxShadow:"0 0 6px #22C55E"}}/>{online} ONLINE</span>
        </div>
        <div className="fadeUp d3" style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <a href={discordUrl} target="_blank" rel="noopener noreferrer"><Btn size="lg" style={{fontSize:12}}>🚀 Join Nova Discord</Btn></a>
          <Btn variant="ghost" size={mob?"md":"lg"} style={{fontSize:12}} onClick={()=>nav("members")}>👥 Browse Members</Btn>
        </div>
      </div>

      {/* Page cards */}
      <div style={{marginBottom:60}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,letterSpacing:".22em",color:"#334155",textAlign:"center",marginBottom:20}}>EXPLORE NOVA</div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:mob?10:14}}>
          {NAV_PAGES.map(({p,icon,label,color,desc})=>(
            <Card key={p} onClick={()=>nav(p)} style={{padding:mob?"14px":"20px 22px",cursor:"pointer",display:"flex",flexDirection:"column",gap:10,borderColor:"rgba(255,255,255,.06)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:10,background:color+"18",border:`1px solid ${color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:mob?18:20,flexShrink:0}}>{icon}</div>
                <div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?10:11,fontWeight:700,color,letterSpacing:".06em"}}>{label.toUpperCase()}</div>
                </div>
                <div style={{marginLeft:"auto",fontSize:14,color:"#334155",flexShrink:0}}>→</div>
              </div>
              <div style={{fontSize:mob?11:12,color:"#64748B",lineHeight:1.6}}>{desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Staff */}
      {staffUsers.length>0&&(
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,letterSpacing:".22em",color:"#334155",textAlign:"center",textTransform:"uppercase",marginBottom:24}}>Meet the Staff</div>
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(auto-fill,minmax(170px,1fr))",gap:12}}>
            {staffUsers.map(u=>(
              <Card key={u.id} style={{padding:"20px 16px",textAlign:"center"}} onClick={()=>nav("profile",u.id)}>
                <div style={{position:"relative",width:56,height:56,margin:"0 auto 10px"}}>
                  <div style={{width:56,height:56,borderRadius:"50%",background:`radial-gradient(circle,${u.page_accent||"#00D4FF"}44,rgba(0,0,0,.6))`,border:`2px solid ${u.page_accent||"#00D4FF"}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,overflow:"hidden",boxShadow:`0 0 20px ${u.page_accent||"#00D4FF"}33`}}>
                    {u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:u.avatar}
                  </div>
                  <StatusDot type={u.status_type||"offline"} size={12} style={{position:"absolute",bottom:1,right:1}}/>
                </div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,color:"#E2E8F0",marginBottom:6}}>{u.display_name}</div>
                {u.staff_role&&<RoleBadge color={ROLE_COLOR[u.staff_role]||"#00D4FF"}>{u.staff_role}</RoleBadge>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

