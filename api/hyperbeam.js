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

module.exports = async function handler(req, res) {
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
        const sportPath=SPORT_PATHS[req.query.sport]||"baseball/mlb";
        const url=`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/athletes?limit=10&active=false&searchTerm=${encodeURIComponent(q)}`;
        const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0"}});
        if(!r.ok)return res.status(200).json({athletes:[]});
        const d=await r.json();
        const items=d.items||d.athletes||[];
        const athletes=items.slice(0,8).map(a=>({
          id:a.id||"",
          name:a.displayName||a.fullName||a.shortName||"",
          team:a.team?.displayName||a.teamName||"",
          position:a.position?.displayName||a.position?.name||a.position||"",
        })).filter(a=>a.name.length>1);
        return res.status(200).json({athletes});
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
        try{
          const today=new Date();
          let plays=[];
          for(let daysBack=1;daysBack<=10&&plays.length<count*3;daysBack++){
            const d=new Date(today);d.setDate(d.getDate()-daysBack);
            const dateStr=d.toISOString().split("T")[0];
            const sr=await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}&gameType=R`,{signal:makeTimeout(6000)});
            if(!sr.ok)continue;
            const sd=await sr.json();
            const games=(sd.dates?.[0]?.games||[]).filter(g=>g.status?.detailedState==="Final");
            if(!games.length)continue;
            // pick up to 2 random games
            const picks=games.sort(()=>Math.random()-.5).slice(0,2);
            for(const game of picks){
              try{
                const fr=await fetch(`https://statsapi.mlb.com/api/v1.1/game/${game.gamePk}/feed/live`,{signal:makeTimeout(8000)});
                if(!fr.ok)continue;
                const fd=await fr.json();
                const allPlays=fd.liveData?.plays?.allPlays||[];
                const homeTeam=fd.gameData?.teams?.home?.teamName||"";
                const awayTeam=fd.gameData?.teams?.away?.teamName||"";
                const gameDate=fd.gameData?.datetime?.officialDate||dateStr;
                for(const play of allPlays){
                  if(!play.result?.event||!play.result?.description)continue;
                  const event=play.result.event;
                  const desc=play.result.description;
                  const playerName=play.matchup?.batter?.fullName||play.matchup?.pitcher?.fullName||"Unknown";
                  const isHome=play.about?.halfInning==="bottom";
                  const teamName=isHome?homeTeam:awayTeam;
                  const inning=play.about?.inning||1;
                  const rbi=play.result?.rbi||0;
                  const isWalkoff=inning>=9&&!play.about?.isTopInning&&rbi>0&&play.about?.isComplete;
                  let rating=0,emoji="⚾";
                  if(isWalkoff&&(event==="Home Run"||event==="Single"||event==="Double"||event==="Triple")){rating=10+Math.floor(Math.random()*3);emoji="🏆";}
                  else if(event==="Grand Slam"){rating=11+Math.floor(Math.random()*2);emoji="💎";}
                  else if(event==="Home Run"){rating=rbi>=3?8+Math.floor(Math.random()*2):7;emoji="💣";}
                  else if(event==="Triple"){rating=5+Math.floor(Math.random()*2);emoji="🔥";}
                  else if(event==="Double"){rating=rbi>=2?5+Math.floor(Math.random()*2):4;emoji="💥";}
                  else if(event==="Single"){rating=rbi>=2?3:Math.floor(Math.random()*3);emoji="⚾";}
                  else if(event==="Strikeout"){rating=Math.floor(Math.random()*3);emoji="🎯";}
                  else continue;
                  const rarity=rating>=10?"legend":rating>=7?"epic":rating>=4?"rare":"common";
                  // team filter for team packs
                  if(packType==="team"&&req.query.team_name&&teamName.toLowerCase()!==req.query.team_name.toLowerCase())continue;
                  plays.push({id:`mlb_${game.gamePk}_${play.atBatIndex||Math.random().toString(36).slice(2,6)}`,emoji,playerName,teamName,description:desc.slice(0,90),rating,rarity,playType:event.toLowerCase().replace(/ /g,"_"),season:2025,gameDate,source:"mlb_stats_api"});
                }
              }catch(e){continue;}
            }
          }
          // Weighted selection by pack odds
          const ODDS={general:{common:.55,rare:.30,epic:.12,legend:.03},superstar:{common:.30,rare:.35,epic:.25,legend:.10},team:{common:.45,rare:.32,epic:.18,legend:.05}};
          const odds=ODDS[packType]||ODDS.general;
          const byRarity={common:[],rare:[],epic:[],legend:[]};
          for(const p of plays)(byRarity[p.rarity]||byRarity.common).push(p);
          const selected=[];
          const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
          Object.keys(byRarity).forEach(r=>byRarity[r]=shuffle(byRarity[r]));
          for(let i=0;i<count;i++){
            const rand=Math.random();let cum=0;let rarity="common";
            for(const[r,p]of Object.entries(odds)){cum+=p;if(rand<=cum){rarity=r;break;}}
            const pool=byRarity[rarity].length?byRarity[rarity]:byRarity.common;
            if(pool.length){selected.push(pool.shift());}
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