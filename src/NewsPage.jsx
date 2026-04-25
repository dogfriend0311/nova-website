import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "./shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "./UI";

// ─── News Page ────────────────────────────────────────────────────────────────
// Uses ESPN news API + GNews RSS — no Twitter/Nitter dependency
const ESPN_NEWS_SOURCES=[
  {id:"mlb",  url:"https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news?limit=20",     label:"MLB News",      sport:"⚾", color:"#002D72"},
  {id:"nfl",  url:"https://site.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=20",     label:"NFL News",      sport:"🏈", color:"#013369"},
  {id:"nba",  url:"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?limit=20",   label:"NBA News",      sport:"🏀", color:"#C9082A"},
  {id:"nhl",  url:"https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/news?limit=20",       label:"NHL News",      sport:"🏒", color:"#0033A0"},
];

// Source label overrides for known ESPN reporters/sections
const REPORTER_TAGS={"Jeff Passan":"⚾","Adam Schefter":"🏈","Dianna Russini":"🏈","Mel Kiper":"🏈","Buster Olney":"⚾","Tim Kurkjian":"⚾"};

const TEAM_KEYWORDS={
  "Yankees":["Yankees","NYY"],"Red Sox":["Red Sox","BOS"],"Mets":["Mets","NYM"],
  "Dodgers":["Dodgers","LAD"],"Cubs":["Cubs","CHC"],"Cardinals":["Cardinals","STL"],
  "Braves":["Braves","ATL"],"Astros":["Astros","HOU"],"Giants":["Giants","SFG","SF Giants"],
  "Padres":["Padres","SD Padres"],"Phillies":["Phillies","PHI"],"Brewers":["Brewers","MIL"],
  "Rays":["Rays","Tampa Bay Rays"],"Blue Jays":["Blue Jays","TOR"],"Orioles":["Orioles","BAL"],
  "White Sox":["White Sox","CWS"],"Royals":["Royals","Kansas City Royals"],"Twins":["Twins","Minnesota Twins"],
  "Guardians":["Guardians","Cleveland Guardians"],"Tigers":["Tigers","Detroit Tigers"],
  "Mariners":["Mariners","Seattle Mariners"],"Angels":["Angels","LA Angels"],"Athletics":["Athletics","Oakland A's"],
  "Rangers":["Rangers","Texas Rangers"],"Rockies":["Rockies","Colorado Rockies"],
  "Marlins":["Marlins","Miami Marlins"],"Nationals":["Nationals","Washington Nationals"],
  "Pirates":["Pirates","Pittsburgh Pirates"],"Reds":["Reds","Cincinnati Reds"],
  "Diamondbacks":["Diamondbacks","Arizona D-backs"],
  "Chiefs":["Chiefs","Kansas City Chiefs"],"Eagles":["Eagles","Philadelphia Eagles"],
  "Cowboys":["Cowboys","Dallas Cowboys"],"49ers":["49ers","San Francisco 49ers"],
  "Bills":["Bills","Buffalo Bills"],"Dolphins":["Dolphins","Miami Dolphins"],
  "Patriots":["Patriots","New England Patriots"],"Jets":["Jets","New York Jets"],
  "Ravens":["Ravens","Baltimore Ravens"],"Steelers":["Steelers","Pittsburgh Steelers"],
  "Browns":["Browns","Cleveland Browns"],"Bengals":["Bengals","Cincinnati Bengals"],
  "Texans":["Texans","Houston Texans"],"Colts":["Colts","Indianapolis Colts"],
  "Jaguars":["Jaguars","Jacksonville Jaguars"],"Titans":["Titans","Tennessee Titans"],
  "Broncos":["Broncos","Denver Broncos"],"Raiders":["Raiders","Las Vegas Raiders"],
  "Chargers":["Chargers","LA Chargers"],"Seahawks":["Seahawks","Seattle Seahawks"],
  "Rams":["Rams","LA Rams"],"Packers":["Packers","Green Bay Packers"],
  "Bears":["Bears","Chicago Bears"],"Lions":["Lions","Detroit Lions"],
  "Vikings":["Vikings","Minnesota Vikings"],"Saints":["Saints","New Orleans Saints"],
  "Falcons":["Falcons","Atlanta Falcons"],"Panthers":["Panthers","Carolina Panthers"],
  "Buccaneers":["Buccaneers","Tampa Bay Bucs"],"Commanders":["Commanders","Washington Commanders"],
  "Giants (NFL)":["NY Giants","New York Giants"],"Cardinals (NFL)":["Arizona Cardinals"],
  "Lakers":["Lakers","Los Angeles Lakers"],"Celtics":["Celtics","Boston Celtics"],
};

export function detectTeams(text){
  if(!text)return[];
  const found=[];
  for(const[team,kws] of Object.entries(TEAM_KEYWORDS)){
    if(kws.some(kw=>new RegExp(`\\b${kw.replace(/[()]/g,"\\$&")}\\b`,"i").test(text))&&!found.includes(team))found.push(team);
  }
  return found.slice(0,4);
}

async function fetchESPNNews(){
  const all=[];
  await Promise.allSettled(ESPN_NEWS_SOURCES.map(async src=>{
    try{
      const d=await(await fetch(src.url)).json();
      (d.articles||[]).forEach(a=>{
        const headline=a.headline||a.title||"";
        const desc=a.description||a.summary||"";
        const fullText=headline+" "+desc;
        const imgUrl=a.images?.[0]?.url||null;
        const reporter=a.byline||null;
        const link=a.links?.web?.href||a.links?.api?.news?.href||"https://espn.com";
        const pubDate=a.published?new Date(a.published).getTime():Date.now();
        all.push({
          id:`espn_${src.id}_${a.id||a.dataSourceIdentifier||Math.random()}`,
          source:src,
          reporter,
          headline,
          desc,
          imgUrl,
          link,
          pubDate,
          teams:detectTeams(fullText),
          categories:(a.categories||[]).map(c=>c.description||c.type).filter(Boolean).slice(0,2),
        });
      });
    }catch{}
  }));
  // Dedup by headline similarity and sort newest first
  const seen=new Set();
  return all.filter(x=>{if(seen.has(x.headline))return false;seen.add(x.headline);return true;})
            .sort((a,b)=>b.pubDate-a.pubDate);
}

export default function NewsPage({cu,users,addNotif,navOpts={}}){
  const mob=useIsMobile();
  const[feed,setFeed]=useState([]);
  const[loading,setLoading]=useState(true);
  const[filter,setFilter]=useState("all");
  const[expandedId,setExpandedId]=useState(navOpts.expandId||null);
  const expandedRef=useRef(null);
  useEffect(()=>{
    if(navOpts.expandId){
      setExpandedId(navOpts.expandId);
      loadNewsComments(navOpts.expandId);
      setTimeout(()=>expandedRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),600);
    }
  },[navOpts.expandId]);
  const[comments,setComments]=useState({});
  const[commentTexts,setCommentTexts]=useState({});
  const notifiedRef=useRef(new Set());

  const loadFeed=async(quiet=false)=>{
    if(!quiet)setLoading(true);
    const items=await fetchESPNNews();
    setFeed(items);
    if(!quiet)setLoading(false);
    if(cu&&items.length){
      // Map user's team IDs (like "nfl_kc") to team name strings (like "Chiefs") for matching
      const allTeams=[...MLB_TEAMS,...NFL_TEAMS,...NBA_TEAMS,...NHL_TEAMS];
      const cuTeamNames=[cu.mlb_team,cu.nfl_team,cu.nba_team,cu.nhl_team]
        .filter(Boolean)
        .map(id=>allTeams.find(t=>t.id===id))
        .filter(Boolean)
        .flatMap(t=>[t.name.toLowerCase(),t.abbr.toLowerCase()]);
      items.forEach(item=>{
        if(notifiedRef.current.has(item.id))return;
        const match=item.teams.some(t=>cuTeamNames.some(cn=>cn===t.toLowerCase()||t.toLowerCase().includes(cn)||cn.includes(t.toLowerCase())));
        if(match){
          addNotif&&addNotif(cu.id,cu.id,`📰 ${item.headline.slice(0,80)}`,{type:"news",url:item.link});
          notifiedRef.current.add(item.id);
        }
      });
    }
  };

  useEffect(()=>{loadFeed();},[]);
  useEffect(()=>{const t=setInterval(()=>loadFeed(true),90000);return()=>clearInterval(t);},[]);

  // Load persisted comments for a news item when expanded
  const loadNewsComments=async(itemId)=>{
    if(comments[itemId])return;
    const rows=await sb.get("nova_comments",`?profile_user_id=eq.news_${itemId}&order=timestamp.desc`);
    setComments(prev=>({...prev,[itemId]:rows||[]}));
  };

  const toggleExpand=(itemId)=>{
    if(expandedId===itemId){setExpandedId(null);}
    else{setExpandedId(itemId);loadNewsComments(itemId);}
  };

  const postComment=async(itemId,imgUrl="")=>{
    const text=commentTexts[itemId]||"";
    if(!text.trim()&&!imgUrl||!cu)return;
    const msg=imgUrl?`__IMG__${imgUrl}`:text.trim();
    const c={id:gid(),profile_user_id:`news_${itemId}`,author_id:cu.id,author_name:cu.display_name,author_avatar:cu.avatar,author_avatar_url:cu.avatar_url||"",text:msg,timestamp:Date.now(),likes:[]};
    await sb.post("nova_comments",c);
    setComments(prev=>({...prev,[itemId]:[c,...(prev[itemId]||[])]}));
    setCommentTexts(prev=>({...prev,[itemId]:""}));
  };

  const[teamFilter,setTeamFilter]=useState("");
  // Build grouped team list from all 4 sports, alphabetically per sport, only teams in current feed
  const feedTeamSet=new Set(feed.flatMap(x=>x.teams));
  const groupedTeams=[
    {label:"⚾ MLB", teams:MLB_TEAMS.filter(t=>feedTeamSet.has(t.name)).map(t=>t.name).sort()},
    {label:"🏈 NFL", teams:NFL_TEAMS.filter(t=>feedTeamSet.has(t.name)).map(t=>t.name).sort()},
    {label:"🏀 NBA", teams:NBA_TEAMS.filter(t=>feedTeamSet.has(t.name)).map(t=>t.name).sort()},
    {label:"🏒 NHL", teams:NHL_TEAMS.filter(t=>feedTeamSet.has(t.name)).map(t=>t.name).sort()},
  ].filter(g=>g.teams.length>0);
  const displayed=(()=>{
    let items=filter==="all"?feed:feed.filter(x=>x.source.id===filter);
    if(teamFilter)items=items.filter(x=>x.teams.includes(teamFilter));
    return items;
  })();

  return(
    <div style={{maxWidth:800,margin:"0 auto",padding:"44px 16px 80px"}}>
      {/* Header */}
      <div style={{marginBottom:20}}>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?20:24,fontWeight:700,margin:"0 0 4px",background:"linear-gradient(135deg,#00D4FF,#8B5CF6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>📰 Sports News</h1>
        <div style={{fontSize:12,color:"#475569"}}>Powered by ESPN · updates every 90s</div>
      </div>

      {/* Filter tabs */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
        {[["all","🌐 All"],["mlb","⚾ MLB"],["nfl","🏈 NFL"],["nba","🏀 NBA"],["nhl","🏒 NHL"]].map(([id,label])=>(
          <button key={id} onClick={()=>setFilter(id)} style={{padding:"6px 14px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,border:`1px solid ${filter===id?"rgba(0,212,255,.5)":"rgba(255,255,255,.1)"}`,background:filter===id?"rgba(0,212,255,.12)":"rgba(255,255,255,.03)",color:filter===id?"#00D4FF":"#64748B",transition:"all .2s"}}>{label}</button>
        ))}
        <button onClick={()=>loadFeed()} style={{marginLeft:"auto",padding:"6px 12px",borderRadius:20,cursor:"pointer",fontSize:11,fontFamily:"'Rajdhani',sans-serif",fontWeight:600,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.03)",color:"#475569"}}>↻ Refresh</button>
      </div>

      {/* Team filter dropdown */}
      {groupedTeams.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <span style={{fontSize:11,color:"#475569",fontFamily:"'Orbitron',sans-serif",letterSpacing:".08em",flexShrink:0}}>🏷 TEAM:</span>
          <select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)} style={{flex:1,maxWidth:240,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"6px 10px",color:teamFilter?"#00D4FF":"#64748B",fontSize:12,cursor:"pointer"}}>
            <option value="">All Teams</option>
            {groupedTeams.map(g=>(
              <optgroup key={g.label} label={g.label}>
                {g.teams.map(t=><option key={t} value={t} style={{background:"#0F172A"}}>{t}</option>)}
              </optgroup>
            ))}
          </select>
          {teamFilter&&<button onClick={()=>setTeamFilter("")} style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11,color:"#EF4444"}}>✕ Clear</button>}
        </div>
      )}

      {loading&&(
        <div style={{textAlign:"center",padding:"60px 0",color:"#334155"}}>
          <div className="spin" style={{fontSize:28,display:"inline-block",marginBottom:12}}>⚙️</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,letterSpacing:".15em"}}>FETCHING LATEST NEWS...</div>
        </div>
      )}

      {!loading&&displayed.length===0&&(
        <Empty icon="📡" msg="No news found. Try refreshing."/>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {displayed.map(item=>{
          const isExp=expandedId===item.id;
          const itemComments=comments[item.id]||[];
          const cmtText=commentTexts[item.id]||"";
          return(
            <Card key={item.id} ref={isExp?expandedRef:null} style={{padding:"14px 16px"}} hover={false}>
              {/* Source + timestamp */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:item.source.color+"33",border:`1px solid ${item.source.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{item.source.sport}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:item.source.color,letterSpacing:".08em"}}>{item.source.label}{item.reporter&&<span style={{color:"#475569",fontWeight:400}}> · {item.reporter}</span>}</div>
                  <div style={{fontSize:10,color:"#334155"}}>{fmtAgo(item.pubDate)}</div>
                </div>
                <a href={item.link} target="_blank" rel="noreferrer" style={{fontSize:13,color:"#334155",textDecoration:"none",flexShrink:0,padding:"4px 6px",borderRadius:6,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)"}} title="Read on ESPN">↗</a>
              </div>

              {/* Image */}
              {item.imgUrl&&<img src={item.imgUrl} style={{width:"100%",maxHeight:220,objectFit:"cover",borderRadius:10,marginBottom:10,display:"block"}} loading="lazy"/>}

              {/* Headline */}
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:mob?12:14,fontWeight:700,color:"#E2E8F0",lineHeight:1.5,marginBottom:item.desc?6:0}}>{item.headline}</div>

              {/* Description */}
              {item.desc&&<div style={{fontSize:13,color:"#64748B",lineHeight:1.6,marginBottom:8}}>{item.desc.slice(0,200)}{item.desc.length>200?"…":""}</div>}

              {/* Team + category tags */}
              {(item.teams.length>0||item.categories.length>0)&&(
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                  {item.teams.map(t=>(
                    <span key={t} style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(0,212,255,.1)",border:"1px solid rgba(0,212,255,.25)",color:"#00D4FF",fontFamily:"'Orbitron',sans-serif",fontWeight:700}}>{t}</span>
                  ))}
                  {item.categories.slice(0,2).map(c=>(
                    <span key={c} style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#475569"}}>{c}</span>
                  ))}
                </div>
              )}

              {/* Comment toggle */}
              <button onClick={()=>toggleExpand(item.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#475569",display:"flex",alignItems:"center",gap:5,padding:"4px 0",marginTop:2}}>
                💬 {itemComments.length>0?`${itemComments.length} comment${itemComments.length!==1?"s":""}`:cu?"Discuss":"Comments"}
                <span style={{fontSize:10,color:"#334155"}}>{isExp?"▲":"▼"}</span>
              </button>

              {/* Expanded discussion */}
              {isExp&&(
                <div style={{marginTop:10,borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:10}}>
                  {cu&&(
                    <div style={{marginBottom:12}}>
                      <div style={{display:"flex",gap:8,marginBottom:6}}>
                        <Av user={cu} size={28}/>
                        <input value={cmtText} onChange={e=>setCommentTexts(prev=>({...prev,[item.id]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();postComment(item.id);}}} placeholder="Discuss this story..." style={{flex:1,fontSize:13}}/>
                        <Btn size="sm" onClick={()=>postComment(item.id)} disabled={!cmtText.trim()}>Post</Btn>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <CommentImgUpload onUpload={async f=>{
                          const ext=f.name.split(".").pop();
                          const url=await sbUp("nova-banners",`news-${gid()}.${ext}`,f);
                          if(url)postComment(item.id,url);
                        }}/>
                        <button onClick={()=>setNewsGifPicker(item.id)} style={{background:"rgba(139,92,246,.15)",border:"1px solid rgba(139,92,246,.3)",borderRadius:8,padding:"4px 10px",cursor:"pointer",color:"#A78BFA",fontSize:12,fontWeight:700}}>GIF</button>
                      </div>
                      {newsGifPicker===item.id&&<GifPicker onSelect={url=>postComment(item.id,`__IMG__${url}`)} onClose={()=>setNewsGifPicker(null)}/>}
                    </div>
                  )}
                  {!cu&&<div style={{fontSize:12,color:"#475569",marginBottom:10,padding:"8px 12px",background:"rgba(255,255,255,.03)",borderRadius:8}}>Sign in to join the discussion</div>}
                  <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {itemComments.length===0&&<div style={{fontSize:11,color:"#334155",textAlign:"center",padding:"8px 0"}}>No comments yet — be first!</div>}
                    {itemComments.map(c=>{
                      const isImg=c.text?.startsWith("__IMG__");
                      return(
                        <div key={c.id} style={{display:"flex",gap:8,padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,.03)"}}>
                          <AvatarCircle user={{avatar:c.author_avatar,avatar_url:c.author_avatar_url,page_accent:"#00D4FF"}} size={26}/>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                              <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:"#E2E8F0"}}>{c.author_name}</span>
                              <span style={{fontSize:10,color:"#334155"}}>{fmtAgo(c.timestamp)}</span>
                            </div>
                            {isImg
                              ?<img src={c.text.slice(7)} style={{maxWidth:200,maxHeight:160,borderRadius:8,display:"block",objectFit:"contain",cursor:"pointer"}} onClick={()=>window.open(c.text.slice(7),"_blank")}/>
                              :<div style={{fontSize:12,color:"#94A3B8",lineHeight:1.5,wordBreak:"break-word"}}>{c.text}</div>
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

