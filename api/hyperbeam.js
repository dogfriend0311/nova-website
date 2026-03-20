function makeTimeout(ms){
  const ctrl=new AbortController();
  setTimeout(()=>ctrl.abort(),ms);
  return ctrl.signal;
}

const HB_KEY = "sk_test_vUEKzTF26D0FfDCFTJZpUXGrQlpzs8P7ET95_q9CRyI";

const SPORT_PATHS = {
  mlb: "baseball/mlb",
  nfl: "football/nfl",
  nba: "basketball/nba",
  nhl: "hockey/nhl",
};

function normalizeAbbr(s){return(s||"").toUpperCase().replace(/[^A-Z]/g,"");}
function getTeamsFromAthlete(athlete){
  const teams=new Set();
  const addTeam=(t)=>{
    if(!t)return;
    if(t.abbreviation)teams.add(normalizeAbbr(t.abbreviation));
    if(t.shortDisplayName)teams.add(normalizeAbbr(t.shortDisplayName));
    if(t.displayName)teams.add(normalizeAbbr(t.displayName));
    if(t.name)teams.add(normalizeAbbr(t.name));
    if(t.nickname)teams.add(normalizeAbbr(t.nickname));
  };
  addTeam(athlete.team);
  (athlete.previousTeams||[]).forEach(pt=>addTeam(pt.team||pt));
  (athlete.teams||[]).forEach(t=>addTeam(t.team||t));
  return teams;
}
const ALIASES={
  "WSH":"WAS","WAS":"WSH","COMMANDERS":"WAS","REDSKINS":"WAS",
  "LV":"OAK","OAK":"LV","RAIDERS":"LV","LAR":"STL","STL":"LAR",
  "LAC":"SD","SD":"LAC","JAX":"JAC","JAC":"JAX","ARI":"AZ","AZ":"ARI",
  "MIA":"FLA","FLA":"MIA","CLES":"CLE","GUARDIANS":"CLE","INDIANS":"CLE",
  "SFG":"SF","SF":"SFG","SDG":"SD","TBR":"TB","TB":"TBR","KCR":"KC","KC":"KCR",
  "BKN":"NJ","NJ":"BKN","NOH":"NO","NOP":"NO","VGK":"VGS","VGS":"VGK","CBJ":"CLS","CLS":"CBJ",
};
function teamMatches(espnTeams,targetAbbr){
  const t=normalizeAbbr(targetAbbr);
  if(espnTeams.has(t))return true;
  const alias=ALIASES[t];
  if(alias&&espnTeams.has(normalizeAbbr(alias)))return true;
  for(const[k,v]of Object.entries(ALIASES)){if(v===t&&espnTeams.has(normalizeAbbr(k)))return true;}
  return false;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS")return res.status(200).end();

  try {
    if(req.method==="GET"){
      if(req.query.athlete){
        const r=await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/athletes/${req.query.athlete}`);
        const d=await r.json();
        return res.status(200).json({name:d.athlete?.displayName||d.athlete?.shortName||null});
      }
      if(req.query.search&&req.query.sport&&!req.query.validate){
        const q=req.query.search.trim();
        try{
          // MLB Stats API suggest endpoint — fast autocomplete
          const url=`https://statsapi.mlb.com/api/v1/people/search?names=${encodeURIComponent(q)}&sportIds=1&season=2025&limit=10`;
          const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0","Accept":"application/json"},signal:makeTimeout(8000)});
          if(!r.ok){
            console.error("MLB search status:",r.status);
            return res.status(200).json({athletes:[]});
          }
          const d=await r.json();
          const people=(d.people||[]).slice(0,10);
          const athletes=people.map(p=>({
            id:String(p.id),
            name:p.fullName||p.firstName+" "+(p.lastName||""),
            team:p.currentTeam?.name||p.currentTeamName||"",
            position:p.primaryPosition?.abbreviation||p.primaryPosition?.name||"",
          })).filter(a=>a.name.trim().length>1);
          return res.status(200).json({athletes});
        }catch(e){
          console.error("MLB search error:",e.message);
          return res.status(200).json({athletes:[]});
        }
      }
      if(req.query.validate&&req.query.playerId&&req.query.team1&&req.query.team2&&req.query.sport){
        const{playerId,team1,team2,sport}=req.query;
        const sportPath=SPORT_PATHS[sport]||"baseball/mlb";
        const url=`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/athletes/${playerId}`;
        const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0"}});
        if(!r.ok)return res.status(200).json({valid:false,reason:"Player not found.",failOpen:true});
        const d=await r.json();
        const athlete=d.athlete||d;
        if(!athlete?.displayName)return res.status(200).json({valid:false,reason:"Player not found.",failOpen:true});
        const espnTeams=getTeamsFromAthlete(athlete);
        const hasTeam1=teamMatches(espnTeams,team1);
        const hasTeam2=teamMatches(espnTeams,team2);
        return res.status(200).json({
          valid:hasTeam1&&hasTeam2,hasTeam1,hasTeam2,
          playerName:athlete.displayName,teamsFound:Array.from(espnTeams),
          reason:!hasTeam1&&!hasTeam2?`${athlete.displayName} doesn't appear to have played for either team.`
            :!hasTeam1?`${athlete.displayName} doesn't appear to have played for ${team1}.`
            :!hasTeam2?`${athlete.displayName} doesn't appear to have played for ${team2}.`
            :"Valid!",
        });
      }
      // ── MLB plays for packs ──
      if(req.query.mlb_plays){
        const packType=req.query.pack_type||"general";
        const count=parseInt(req.query.count)||5;
        const filterTeam=(req.query.team_name||"").toLowerCase().trim();
        const filterPlayerId=req.query.player_id||"";
        try{
          let plays=[];
          // Only pull from the completed 2025 MLB season (Mar 27 – Oct 30, 2025)
          const seasonStart=new Date("2025-03-27");
          const seasonEnd=new Date("2025-10-30");
          const totalDays=Math.floor((seasonEnd-seasonStart)/(1000*60*60*24));
          // Build a shuffled pool of all 2025 season dates
          const datePool=[];
          for(let i=0;i<totalDays;i++){
            const d=new Date(seasonStart);
            d.setDate(d.getDate()+i);
            datePool.push(d.toISOString().split("T")[0]);
          }
          for(let i=datePool.length-1;i>0;i--){
            const j=Math.floor(Math.random()*(i+1));
            [datePool[i],datePool[j]]=[datePool[j],datePool[i]];
          }
          const maxAttempts=filterTeam||filterPlayerId?60:30;
          for(let attempt=0;attempt<maxAttempts&&plays.length<count*8;attempt++){
            const dateStr=datePool[attempt];
            if(!dateStr)break;
            const sr=await fetch(
              `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}&gameType=R`,
              {signal:makeTimeout(6000)}
            );
            if(!sr.ok)continue;
            const sd=await sr.json();
            let games=(sd.dates?.[0]?.games||[]).filter(g=>g.status?.detailedState==="Final");
            if(!games.length)continue;
            // Team pack: only fetch games involving the team
            if(filterTeam){
              games=games.filter(g=>{
                const h=(g.teams?.home?.team?.name||"").toLowerCase();
                const a=(g.teams?.away?.team?.name||"").toLowerCase();
                return h.includes(filterTeam)||a.includes(filterTeam)
                    ||filterTeam.includes(h.split(" ").pop())
                    ||filterTeam.includes(a.split(" ").pop());
              });
            }
            if(!games.length)continue;
            // Pick up to 3 random games per date
            const picks=games.sort(()=>Math.random()-.5).slice(0,3);
            for(const game of picks){
              try{
                const fr=await fetch(
                  `https://statsapi.mlb.com/api/v1.1/game/${game.gamePk}/feed/live`,
                  {signal:makeTimeout(9000)}
                );
                if(!fr.ok)continue;
                const fd=await fr.json();
                const allPlays=fd.liveData?.plays?.allPlays||[];
                if(!allPlays.length)continue;
                const homeTeamName=fd.gameData?.teams?.home?.teamName||"";
                const awayTeamName=fd.gameData?.teams?.away?.teamName||"";
                const gameDate=fd.gameData?.datetime?.officialDate||dateStr;
                const venue=fd.gameData?.venue?.name||"";
                for(const play of allPlays){
                  const event=play.result?.event||"";
                  const isTopInning=play.about?.halfInning==="top";
                  const inning=play.about?.inning||1;
                  const rbi=play.result?.rbi||0;
                  const batterName=play.matchup?.batter?.fullName||"";
                  const batterPlayerId=String(play.matchup?.batter?.id||"");
                  const pitcherName=play.matchup?.pitcher?.fullName||"";
                  const pitcherPlayerId=String(play.matchup?.pitcher?.id||"");
                  // Skip plays with missing data
                  if(!batterName||!pitcherName||!event)continue;
                  const batterTeam=isTopInning?awayTeamName:homeTeamName;
                  const opponent=isTopInning?homeTeamName:awayTeamName;
                  const inningStr=`${isTopInning?"Top":"Bot"} ${inning}`;
                  // Player pack filter
                  if(filterPlayerId&&batterPlayerId!==filterPlayerId&&pitcherPlayerId!==filterPlayerId)continue;
                  // Team pack filter
                  if(filterTeam){
                    const bt=batterTeam.toLowerCase();
                    if(!bt.includes(filterTeam)&&!filterTeam.includes(bt.split(" ").pop()))continue;
                  }
                  // Score and rate the play
                  const isWalkoff=inning>=9&&!isTopInning&&rbi>0&&play.about?.isComplete;
                  let rating=0,emoji="⚾";
                  if(isWalkoff&&["Home Run","Single","Double","Triple"].includes(event)){
                    rating=10+Math.floor(Math.random()*3);emoji="🏆";
                  } else if(event==="Grand Slam"){
                    rating=11+Math.floor(Math.random()*2);emoji="💎";
                  } else if(event==="Home Run"){
                    const dist=play.hitData?.totalDistance||0;
                    rating=(rbi>=3?9:7)+(dist>430?1:0);emoji="💣";
                  } else if(event==="Triple"){
                    rating=5+Math.floor(Math.random()*2);emoji="🔥";
                  } else if(event==="Double"){
                    rating=rbi>=2?5+Math.floor(Math.random()*2):4;emoji="💥";
                  } else if(event==="Single"){
                    rating=rbi>=2?3:2;emoji="⚾";
                  } else if(event==="Strikeout"){
                    rating=Math.floor(Math.random()*2)+1;emoji="🎯";
                  } else if(event==="Stolen Base 2B"||event==="Stolen Base 3B"||event==="Stolen Base Home"){
                    rating=3;emoji="💨";
                  } else {
                    continue; // skip walks, fielding errors, etc.
                  }
                  const rarity=rating>=12?"mystic":rating>=10?"legendary":rating>=7?"epic":rating>=4?"rare":rating>=2?"uncommon":"common";
                  const hitDist=play.hitData?.totalDistance;
                  const desc=hitDist&&event==="Home Run"
                    ?`${batterName} hits a ${hitDist}ft home run off ${pitcherName} (${inningStr})`
                    :`${batterName} ${event.toLowerCase()} off ${pitcherName} (${inningStr}${rbi>0?`, ${rbi} RBI`:""})`;
                  plays.push({
                    id:`mlb_${game.gamePk}_${play.atBatIndex}`,
                    emoji,
                    playerName:batterName,
                    playerMlbId:batterPlayerId,
                    pitcherName,
                    pitcherMlbId:pitcherPlayerId,
                    teamName:batterTeam,
                    opponent,
                    inning:inningStr,
                    gameDate,
                    venue,
                    description:desc.slice(0,120),
                    rating,
                    rarity,
                    playType:event.toLowerCase().replace(/ /g,"_"),
                    rbi,
                    season:2025,
                    source:"mlb_stats_api",
                  });
                }
              }catch(e){continue;}
            }
          }
          if(!plays.length){
            // API returned nothing — tell client honestly, no fake data
            return res.status(200).json({plays:[],error:"No real MLB plays found. Try again in a moment."});
          }
          // Weight-select by rarity odds
          const ODDS={
            starter:  {common:.55,uncommon:.28,rare:.12,epic:.04,legendary:.01},
            general:  {common:.40,uncommon:.30,rare:.18,epic:.09,legendary:.03},
            yesterday:{common:.38,uncommon:.30,rare:.20,epic:.09,legendary:.03},
            player:   {common:.42,uncommon:.30,rare:.17,epic:.08,legendary:.03},
            team:     {common:.38,uncommon:.28,rare:.20,epic:.10,legendary:.04},
          };
          const odds=ODDS[packType]||ODDS.general;
          const byRarity={common:[],uncommon:[],rare:[],epic:[],legendary:[],mystic:[]};
          for(const p of plays)(byRarity[p.rarity]||byRarity.common).push(p);
          const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
          for(const r of Object.keys(byRarity))byRarity[r]=shuffle(byRarity[r]);
          const selected=[];
          for(let i=0;i<count;i++){
            const rand=Math.random();let cum=0;let rarity="common";
            for(const[r,p]of Object.entries(odds)){cum+=p;if(rand<=cum){rarity=r;break;}}
            // Fall back to any available rarity if target is empty
            const pool=byRarity[rarity]?.length?byRarity[rarity]:
                       byRarity.uncommon?.length?byRarity.uncommon:
                       byRarity.common?.length?byRarity.common:
                       Object.values(byRarity).find(a=>a.length)||[];
            if(pool.length)selected.push(pool.shift());
          }
          return res.status(200).json({plays:selected.filter(Boolean)});
        }catch(e){
          console.error("MLB plays error:",e.message);
          return res.status(200).json({plays:[],error:e.message});
        }
      }

      // ── Spotrac salary lookup ──────────────────────────────────────────────
      if(req.query.spotrac){
        const playerName=(req.query.player||"").toLowerCase().replace(/[^a-z0-9 ]/g,"").replace(/\s+/g,"-");
        const sport=(req.query.sport||"mlb").toLowerCase();
        const sportMap={mlb:"baseball",nfl:"football",nba:"basketball",nhl:"hockey"};
        const sportSlug=sportMap[sport]||sport;
        try{
          // Spotrac search
          const searchUrl=`https://www.spotrac.com/search/?q=${encodeURIComponent(req.query.player||"")}`;
          const sr=await fetch(searchUrl,{
            headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36","Accept":"text/html,application/xhtml+xml","Accept-Language":"en-US,en;q=0.9"},
            signal:makeTimeout(8000),
          });
          if(!sr.ok)return res.status(200).json({found:false});
          const html=await sr.text();
          // Parse search results to find player link
          // Find any spotrac player link for this sport
          const slugPattern=playerName.split("-").slice(0,2).join("[^/]*");
          const linkRe=new RegExp('href="(/'+sportSlug+'/[^"]*'+playerName.split("-")[0]+'[^"]*)"', "i");
          const linkMatch=html.match(linkRe);
          if(!linkMatch)return res.status(200).json({found:false,debug:"no_link_match"});
          const playerUrl="https://www.spotrac.com"+linkMatch[1];
          // Fetch player page
          const pr=await fetch(playerUrl,{
            headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36","Accept":"text/html"},
            signal:makeTimeout(8000),
          });
          if(!pr.ok)return res.status(200).json({found:false});
          const phtml=await pr.text();
          // Extract contract data
          const salaryMatch=phtml.match(/\$([\d,]+)\s*<\/(?:span|td|div)[^>]*>\s*(?:Average\s*Annual|AAV)/i);
          const yearsMatch=phtml.match(/(\d+)\s*[Yy]ear[s]?\s*(?:Contract|Extension|Deal)/i);
          const totalMatch=phtml.match(/Total\s*Value[^$]*\$([\d,]+)/i);
          const salary=salaryMatch?parseFloat(salaryMatch[1].replace(/,/g,""))/1000000:null;
          const years=yearsMatch?parseInt(yearsMatch[1]):null;
          const total=totalMatch?parseFloat(totalMatch[1].replace(/,/g,""))/1000000:null;
          return res.status(200).json({found:!!(salary||years),salary,years,total,url:playerUrl});
        }catch(e){
          return res.status(200).json({found:false,error:e.message});
        }
      }

      // ── ESPN proxy — bypass CORS for non-MLB sports ──
      if(req.query.espn_proxy&&req.query.url){
        try{
          const targetUrl=decodeURIComponent(req.query.url);
          // Only allow ESPN API URLs for safety
          if(!targetUrl.includes("site.api.espn.com")&&!targetUrl.includes("api.espn.com")){
            return res.status(400).json({error:"Only ESPN API URLs allowed"});
          }
          const r=await fetch(targetUrl,{
            headers:{"User-Agent":"Mozilla/5.0","Accept":"application/json"},
            signal:makeTimeout(10000),
          });
          if(!r.ok)return res.status(200).json(null);
          const d=await r.json();
          return res.status(200).json(d);
        }catch(e){
          console.error("ESPN proxy error:",e.message);
          return res.status(200).json(null);
        }
      }

      return res.status(400).json({error:"Missing params"});
    }

    if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
    const body=req.body||{};

    if(body.action==="create"){
      const r=await fetch("https://engine.hyperbeam.com/v0/vm",{
        method:"POST",
        headers:{Authorization:`Bearer ${HB_KEY}`,"Content-Type":"application/json"},
        body:JSON.stringify({start_url:"https://www.google.com",ublock_origin:true}),
      });
      const data=await r.json();
      if(!r.ok)return res.status(r.status).json(data);
      return res.status(200).json(data);
    }

    if(body.action==="delete"&&body.sessionId){
      await fetch(`https://engine.hyperbeam.com/v0/vm/${body.sessionId}`,{
        method:"DELETE",headers:{Authorization:`Bearer ${HB_KEY}`},
      });
      return res.status(200).json({ok:true});
    }

    return res.status(400).json({error:"Unknown action"});
  } catch(e){
    console.error("Handler error:",e);
    return res.status(500).json({error:e.message});
  }
};