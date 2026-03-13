const HB_KEY = "sk_test_vUEKzTF26D0FfDCFTJZpUXGrQlpzs8P7ET95_q9CRyI";
const GEMINI_KEY = "AIzaSyCZsG2yaoMFuTCi6iGKt3sXbRqtsYN6gBQ";

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
    // ── GET routes ──
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
      return res.status(400).json({error:"Missing params"});
    }

    if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});

    const body=req.body||{};

    // ── AI Chat (Gemini Flash) ──
    if(body.action==="chat"){
      const messages=body.messages||[];
      const contents=messages.map(m=>({
        role:m.role==="assistant"?"model":"user",
        parts:[{text:m.content}]
      }));
      const geminiRes=await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            systemInstruction:{parts:[{text:`You are Nova's sports assistant — a knowledgeable, enthusiastic sports AI for the Nova community platform. You help users with:\n- Sports questions (MLB, NFL, NBA, NHL stats, history, records, players, teams)\n- Predictions advice and analysis\n- Trivia questions and answers\n- Live scores and standings context\n- Fantasy sports tips\n\nKeep answers concise, fun, and conversational. Use emojis occasionally. If someone asks something completely unrelated to sports or Nova, gently redirect them to sports topics. Never make up statistics — if you're unsure, say so.`}]},
            contents,
            generationConfig:{maxOutputTokens:400,temperature:0.7},
          })
        }
      );
      const gd=await geminiRes.json();
      if(!geminiRes.ok){
        console.error("Gemini error:",JSON.stringify(gd));
        return res.status(200).json({reply:"Sorry, I'm having trouble connecting right now. Try again in a moment! 🔄"});
      }
      const reply=gd.candidates?.[0]?.content?.parts?.[0]?.text||"Sorry, I couldn't generate a response.";
      return res.status(200).json({reply});
    }

    // ── Hyperbeam create ──
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

    // ── Hyperbeam delete ──
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
}