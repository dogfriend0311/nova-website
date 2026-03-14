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
          const today=new Date();
          let plays=[];
          const maxDays=filterTeam||filterPlayerId?20:10; // look further back for filtered packs
          for(let daysBack=1;daysBack<=maxDays&&plays.length<count*6;daysBack++){
            const d=new Date(today);d.setDate(d.getDate()-daysBack);
            const dateStr=d.toISOString().split("T")[0];
            const sr=await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}&gameType=R`,{signal:makeTimeout(7000)});
            if(!sr.ok)continue;
            const sd=await sr.json();
            let games=(sd.dates?.[0]?.games||[]).filter(g=>g.status?.detailedState==="Final");
            if(!games.length)continue;
            // For team packs: only games involving the team
            if(filterTeam){
              games=games.filter(g=>{
                const h=(g.teams?.home?.team?.name||"").toLowerCase();
                const a=(g.teams?.away?.team?.name||"").toLowerCase();
                return h.includes(filterTeam)||a.includes(filterTeam)||
                       filterTeam.includes(h.split(" ").pop())||filterTeam.includes(a.split(" ").pop());
              });
            }
            if(!games.length)continue;
            const picks=games.sort(()=>Math.random()-.5).slice(0,filterTeam||filterPlayerId?5:2);
            for(const game of picks){
              try{
                const fr=await fetch(`https://statsapi.mlb.com/api/v1.1/game/${game.gamePk}/feed/live`,{signal:makeTimeout(9000)});
                if(!fr.ok)continue;
                const fd=await fr.json();
                const allPlays=fd.liveData?.plays?.allPlays||[];
                const homeTeamName=fd.gameData?.teams?.home?.teamName||"";
                const awayTeamName=fd.gameData?.teams?.away?.teamName||"";
                const homeTeamId=String(fd.gameData?.teams?.home?.id||"");
                const awayTeamId=String(fd.gameData?.teams?.away?.id||"");
                const gameDate=fd.gameData?.datetime?.officialDate||dateStr;
                const venue=fd.gameData?.venue?.name||"";
                for(const play of allPlays){
                  if(!play.result?.event||!play.result?.description)continue;
                  const event=play.result.event;
                  const desc=play.result.description;
                  const isTopInning=play.about?.halfInning==="top";
                  const inning=play.about?.inning||1;
                  const rbi=play.result?.rbi||0;
                  // Batter and pitcher details
                  const batterName=play.matchup?.batter?.fullName||"Unknown";
                  const batterPlayerId=String(play.matchup?.batter?.id||"");
                  const pitcherName=play.matchup?.pitcher?.fullName||"Unknown";
                  const pitcherPlayerId=String(play.matchup?.pitcher?.id||"");
                  // The batter's team is top=away, bottom=home
                  const batterTeam=isTopInning?awayTeamName:homeTeamName;
                  const fielderTeam=isTopInning?homeTeamName:awayTeamName;
                  const opponent=isTopInning?homeTeamName:awayTeamName;
                  const inningStr=`${isTopInning?"Top":"Bot"} ${inning}`;
                  // Player pack filter — match batter or pitcher
                  if(filterPlayerId&&batterPlayerId!==filterPlayerId&&pitcherPlayerId!==filterPlayerId)continue;
                  // Team pack filter — match batter's team
                  if(filterTeam){
                    const bt=batterTeam.toLowerCase();
                    if(!bt.includes(filterTeam)&&!filterTeam.includes(bt.split(" ").pop()))continue;
                  }
                  const isWalkoff=inning>=9&&!isTopInning&&rbi>0&&play.about?.isComplete;
                  let rating=0,emoji="⚾";
                  if(isWalkoff&&["Home Run","Single","Double","Triple"].includes(event)){rating=10+Math.floor(Math.random()*3);emoji="🏆";}
                  else if(event==="Grand Slam"){rating=11+Math.floor(Math.random()*2);emoji="💎";}
                  else if(event==="Home Run"){
                    const dist=play.hitData?.totalDistance||0;
                    rating=(rbi>=3?9:7)+(dist>430?1:0);emoji="💣";
                  }
                  else if(event==="Triple"){rating=5+Math.floor(Math.random()*2);emoji="🔥";}
                  else if(event==="Double"){rating=rbi>=2?5+Math.floor(Math.random()*2):4;emoji="💥";}
                  else if(event==="Single"){rating=rbi>=2?3:Math.floor(Math.random()*2)+1;emoji="⚾";}
                  else if(event==="Strikeout"){
                    const pitch=play.matchup?.pitchHand?.code||"";
                    rating=Math.floor(Math.random()*3);emoji="🎯";
                  }
                  else if(event==="Stolen Base 2B"||event==="Stolen Base 3B"||event==="Stolen Base Home"){rating=3;emoji="💨";}
                  else continue;
                  if(rating<=0)rating=1;
                  // Correct 7-tier rarity
                  const rarity=rating>=12?"mystic":rating>=10?"legendary":rating>=7?"epic":rating>=4?"rare":rating>=2?"uncommon":"common";
                  // Rich description
                  const hitDist=play.hitData?.totalDistance;
                  const richDesc=hitDist&&event==="Home Run"
                    ?`${batterName} hits a ${hitDist}ft ${event.toLowerCase()} off ${pitcherName} (${inningStr})`
                    :`${batterName} ${event.toLowerCase()} off ${pitcherName} (${inningStr}${rbi>0?`, ${rbi} RBI`:""})`;
                  plays.push({
                    id:`mlb_${game.gamePk}_${play.atBatIndex||Math.random().toString(36).slice(2,6)}`,
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
                    description:richDesc.slice(0,120),
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
          // Weighted selection by pack odds — using 7-tier names
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
          const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
          Object.keys(byRarity).forEach(r=>{byRarity[r]=shuffle(byRarity[r]);});
          const selected=[];
          for(let i=0;i<count;i++){
            const rand=Math.random();let cum=0;let rarity="common";
            for(const[r,p]of Object.entries(odds)){cum+=p;if(rand<=cum){rarity=r;break;}}
            const pool=byRarity[rarity]?.length?byRarity[rarity]:(byRarity.uncommon.length?byRarity.uncommon:byRarity.common);
            if(pool?.length)selected.push(pool.shift());
          }
          // Pad with fallback if not enough real plays
          while(selected.length<count){
            const FPLAYERS=["Aaron Judge","Shohei Ohtani","Mookie Betts","Freddie Freeman","Juan Soto","Yordan Alvarez","Gunnar Henderson","Bobby Witt Jr.","Paul Skenes","Elly De La Cruz"];
            const fp=FPLAYERS[Math.floor(Math.random()*FPLAYERS.length)];
            const ft=filterTeam||["Yankees","Dodgers","Braves","Astros","Padres"][Math.floor(Math.random()*5)];
            selected.push({id:`fallback_${Date.now()}_${selected.length}`,emoji:"⚾",playerName:fp,pitcherName:"Unknown Pitcher",teamName:ft,opponent:"Unknown",inning:"Bot 5",gameDate:new Date().toISOString().split("T")[0],description:`${fp} RBI Single (Bot 5)`,rating:2,rarity:"uncommon",playType:"single",rbi:1,season:2025,source:"generated"});
          }
          return res.status(200).json({plays:selected.filter(Boolean)});
        }catch(e){
          console.error("MLB plays error:",e.message);
          return res.status(200).json({plays:[]});
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