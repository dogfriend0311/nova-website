// ─── Phase 3: MLB Star Earner Cron Job ────────────────────────────────────────
// Called every 3 hours by GitHub Actions
// Checks yesterday's/today's completed MLB games, finds users who own
// player/team cards that performed, and awards stars based on card level.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const CRON_SECRET  = process.env.CRON_SECRET;

const sdb = {
  get: async(t,q="")=>{
    const r=await fetch(`${SUPABASE_URL}/rest/v1/${t}${q}`,{headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`}});
    return r.ok?r.json():[];
  },
  patch: async(t,q,b)=>{
    await fetch(`${SUPABASE_URL}/rest/v1/${t}${q}`,{method:"PATCH",headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(b)});
  },
  post: async(t,b)=>{
    await fetch(`${SUPABASE_URL}/rest/v1/${t}`,{method:"POST",headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(b)});
  },
};

// Stars per event type by card level
// Formula: baseStars * (1 + level * 0.1) rounded
function calcStars(event, level){
  const BASE = {
    "single":5, "double":7, "triple":9,
    "home_run":15, "grand_slam":25, "rbi":3,
    "strikeout_pitcher":4, "walk":2, "stolen_base":5,
    "team_win":5, "save":6,
  };
  const base = BASE[event] || 3;
  return Math.round(base * (1 + (level||0) * 0.1));
}

function gid(){ return "c"+Date.now()+Math.random().toString(36).slice(2,5); }

export default async function handler(req, res){
  // Security check
  const secret = req.headers["x-cron-secret"];
  if(secret !== CRON_SECRET){
    return res.status(401).json({error:"Unauthorized"});
  }

  try {
    const today = new Date();
    const processed = [];

    // Check last 2 days for any completed games not yet processed
    for(let daysBack = 1; daysBack <= 2; daysBack++){
      const d = new Date(today);
      d.setDate(d.getDate() - daysBack);
      const dateStr = d.toISOString().split("T")[0];

      // Check if we already processed this date
      const alreadyDone = await sdb.get("nova_cron_log",`?process_date=eq.${dateStr}&limit=1`);
      if(alreadyDone?.length) continue;

      // Get completed games
      const schedRes = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}&gameType=R`);
      if(!schedRes.ok) continue;
      const schedData = await schedRes.json();
      const games = (schedData.dates?.[0]?.games||[]).filter(g=>g.status?.detailedState==="Final");
      if(!games.length) continue;

      // Get all user cards (player + team)
      const allCards = await sdb.get("nova_user_cards","?select=id,user_id,card_type,player_id,team_name,level,card_name");
      if(!allCards?.length) continue;

      // Build lookup maps
      const playerCardsByPlayerId = {}; // mlb_player_id -> [{userId, cardId, level}]
      const teamCardsByTeamName   = {}; // team name -> [{userId, cardId, level}]
      for(const card of allCards){
        if(card.card_type==="player" && card.player_id){
          if(!playerCardsByPlayerId[card.player_id]) playerCardsByPlayerId[card.player_id]=[];
          playerCardsByPlayerId[card.player_id].push({userId:card.user_id,cardId:card.id,level:card.level||0});
        }
        if(card.card_type==="team" && card.team_name){
          const key=card.team_name.toLowerCase();
          if(!teamCardsByTeamName[key]) teamCardsByTeamName[key]=[];
          teamCardsByTeamName[key].push({userId:card.user_id,cardId:card.id,level:card.level||0});
        }
      }

      // Load all user star rows
      const allStars = await sdb.get("nova_stars","?select=user_id,balance,lifetime_earned");
      const starMap = {};
      (allStars||[]).forEach(s=>starMap[s.user_id]={balance:s.balance||0,lifetime_earned:s.lifetime_earned||0});

      const starDeltas = {}; // userId -> {delta, reasons[]}
      const addDelta = (uid, amt, reason) => {
        if(!starDeltas[uid]) starDeltas[uid]={delta:0,reasons:[]};
        starDeltas[uid].delta += amt;
        starDeltas[uid].reasons.push(reason);
      };

      // Process each game
      for(const game of games){
        try{
          const feedRes = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${game.gamePk}/feed/live`);
          if(!feedRes.ok) continue;
          const feed = await feedRes.json();

          const homeTeam = feed.gameData?.teams?.home?.teamName||"";
          const awayTeam = feed.gameData?.teams?.away?.teamName||"";
          const homeWon  = feed.liveData?.linescore?.teams?.home?.runs > feed.liveData?.linescore?.teams?.away?.runs;
          const awayWon  = !homeWon;

          // Team win stars
          const giveTeamWin = (teamName, won) => {
            if(!won) return;
            const owners = teamCardsByTeamName[teamName.toLowerCase()]||[];
            for(const {userId,level} of owners){
              const stars = calcStars("team_win", level);
              addDelta(userId, stars, `${teamName} won! +${stars}⭐`);
            }
          };
          giveTeamWin(homeTeam, homeWon);
          giveTeamWin(awayTeam, awayWon);

          // Player performance stars
          const allPlays = feed.liveData?.plays?.allPlays||[];
          const playerStats = {}; // mlbPlayerId -> {events[]}
          for(const play of allPlays){
            const batterId = String(play.matchup?.batter?.id||"");
            const pitcherId = String(play.matchup?.pitcher?.id||"");
            const event = play.result?.event||"";
            const rbi = play.result?.rbi||0;
            if(batterId && event){
              if(!playerStats[batterId]) playerStats[batterId]=[];
              playerStats[batterId].push({event,rbi});
            }
            if(pitcherId && event==="Strikeout"){
              if(!playerStats[pitcherId]) playerStats[pitcherId]=[];
              playerStats[pitcherId].push({event:"strikeout_pitcher",rbi:0});
            }
          }

          for(const [mlbId, events] of Object.entries(playerStats)){
            const owners = playerCardsByPlayerId[mlbId]||[];
            if(!owners.length) continue;
            for(const evt of events){
              const evtKey = evt.event.toLowerCase().replace(/ /g,"_");
              for(const {userId, level} of owners){
                const stars = calcStars(evtKey, level);
                if(stars > 0) addDelta(userId, stars, `${evt.event} (+${stars}⭐)`);
              }
            }
          }
        }catch(e){ continue; }
      }

      // Apply all deltas
      for(const [userId, {delta, reasons}] of Object.entries(starDeltas)){
        if(delta <= 0) continue;
        const cur = starMap[userId]||{balance:0,lifetime_earned:0};
        const nb = cur.balance + delta;
        const nl = cur.lifetime_earned + delta;
        await sdb.patch("nova_stars",`?user_id=eq.${userId}`,{balance:nb,lifetime_earned:nl});
        await sdb.post("nova_star_log",{
          id:gid(), user_id:userId, amount:delta,
          reason:`MLB ${dateStr}: ${reasons.slice(0,3).join(", ")}${reasons.length>3?` +${reasons.length-3} more`:""}`,
          ts:Date.now()
        });
        processed.push({userId, delta, reasons:reasons.length});
      }

      // Mark date as processed
      await sdb.post("nova_cron_log",{id:gid(),process_date:dateStr,games_checked:games.length,users_rewarded:processed.length,ts:Date.now()});
    }

    return res.status(200).json({ok:true, processed:processed.length, details:processed.slice(0,20)});
  } catch(e){
    console.error("Cron error:",e);
    return res.status(500).json({error:e.message});
  }
}