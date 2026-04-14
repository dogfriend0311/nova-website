// src/components/RTTSMode.jsx
import React, { useState, useEffect } from 'react';

// Helper hooks and functions
function useIsMobile(bp = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < bp);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [bp]);
  return isMobile;
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const RTTS_SAVE_KEY = "nova_rtts_player";

function saveRTTSPlayer(player) {
  try { localStorage.setItem(RTTS_SAVE_KEY, JSON.stringify(player)); } catch(e) {}
}

function loadRTTSPlayer() {
  try { 
    const saved = localStorage.getItem(RTTS_SAVE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch(e) { return null; }
}

// MLB Teams
const MLB_TEAMS_RTTS = [
  { id: 108, name: "Los Angeles Angels", abbr: "LAA", logo: "https://www.mlbstatic.com/team-logos/108.svg" },
  { id: 109, name: "Arizona Diamondbacks", abbr: "ARI", logo: "https://www.mlbstatic.com/team-logos/109.svg" },
  { id: 110, name: "Baltimore Orioles", abbr: "BAL", logo: "https://www.mlbstatic.com/team-logos/110.svg" },
  { id: 111, name: "Boston Red Sox", abbr: "BOS", logo: "https://www.mlbstatic.com/team-logos/111.svg" },
  { id: 112, name: "Chicago Cubs", abbr: "CHC", logo: "https://www.mlbstatic.com/team-logos/112.svg" },
  { id: 113, name: "Cincinnati Reds", abbr: "CIN", logo: "https://www.mlbstatic.com/team-logos/113.svg" },
  { id: 114, name: "Cleveland Guardians", abbr: "CLE", logo: "https://www.mlbstatic.com/team-logos/114.svg" },
  { id: 115, name: "Colorado Rockies", abbr: "COL", logo: "https://www.mlbstatic.com/team-logos/115.svg" },
  { id: 116, name: "Detroit Tigers", abbr: "DET", logo: "https://www.mlbstatic.com/team-logos/116.svg" },
  { id: 117, name: "Houston Astros", abbr: "HOU", logo: "https://www.mlbstatic.com/team-logos/117.svg" },
  { id: 118, name: "Kansas City Royals", abbr: "KC", logo: "https://www.mlbstatic.com/team-logos/118.svg" },
  { id: 119, name: "Los Angeles Dodgers", abbr: "LAD", logo: "https://www.mlbstatic.com/team-logos/119.svg" },
  { id: 120, name: "Washington Nationals", abbr: "WSH", logo: "https://www.mlbstatic.com/team-logos/120.svg" },
  { id: 121, name: "New York Mets", abbr: "NYM", logo: "https://www.mlbstatic.com/team-logos/121.svg" },
  { id: 133, name: "Oakland Athletics", abbr: "OAK", logo: "https://www.mlbstatic.com/team-logos/133.svg" },
  { id: 134, name: "Pittsburgh Pirates", abbr: "PIT", logo: "https://www.mlbstatic.com/team-logos/134.svg" },
  { id: 135, name: "San Diego Padres", abbr: "SD", logo: "https://www.mlbstatic.com/team-logos/135.svg" },
  { id: 136, name: "Seattle Mariners", abbr: "SEA", logo: "https://www.mlbstatic.com/team-logos/136.svg" },
  { id: 137, name: "San Francisco Giants", abbr: "SF", logo: "https://www.mlbstatic.com/team-logos/137.svg" },
  { id: 138, name: "St. Louis Cardinals", abbr: "STL", logo: "https://www.mlbstatic.com/team-logos/138.svg" },
  { id: 139, name: "Tampa Bay Rays", abbr: "TB", logo: "https://www.mlbstatic.com/team-logos/139.svg" },
  { id: 140, name: "Texas Rangers", abbr: "TEX", logo: "https://www.mlbstatic.com/team-logos/140.svg" },
  { id: 141, name: "Toronto Blue Jays", abbr: "TOR", logo: "https://www.mlbstatic.com/team-logos/141.svg" },
  { id: 142, name: "Minnesota Twins", abbr: "MIN", logo: "https://www.mlbstatic.com/team-logos/142.svg" },
  { id: 143, name: "Philadelphia Phillies", abbr: "PHI", logo: "https://www.mlbstatic.com/team-logos/143.svg" },
  { id: 144, name: "Atlanta Braves", abbr: "ATL", logo: "https://www.mlbstatic.com/team-logos/144.svg" },
  { id: 145, name: "Chicago White Sox", abbr: "CWS", logo: "https://www.mlbstatic.com/team-logos/145.svg" },
  { id: 146, name: "Miami Marlins", abbr: "MIA", logo: "https://www.mlbstatic.com/team-logos/146.svg" },
  { id: 147, name: "New York Yankees", abbr: "NYY", logo: "https://www.mlbstatic.com/team-logos/147.svg" },
  { id: 158, name: "Milwaukee Brewers", abbr: "MIL", logo: "https://www.mlbstatic.com/team-logos/158.svg" },
];

const POSITIONS = [
  { value: "C", label: "Catcher", icon: "🧤" },
  { value: "1B", label: "First Base", icon: "1️⃣" },
  { value: "2B", label: "Second Base", icon: "2️⃣" },
  { value: "3B", label: "Third Base", icon: "3️⃣" },
  { value: "SS", label: "Shortstop", icon: "6️⃣" },
  { value: "LF", label: "Left Field", icon: "7️⃣" },
  { value: "CF", label: "Center Field", icon: "8️⃣" },
  { value: "RF", label: "Right Field", icon: "9️⃣" },
  { value: "SP", label: "Starting Pitcher", icon: "🎯" },
  { value: "RP", label: "Relief Pitcher", icon: "🔥" },
  { value: "CP", label: "Closer", icon: "💪" },
];

const PLAYER_STYLES = [
  { value: "power", label: "Power Hitter", icon: "💪" },
  { value: "contact", label: "Contact Hitter", icon: "🎯" },
  { value: "speed", label: "Speedster", icon: "⚡" },
  { value: "balanced", label: "Balanced", icon: "⚖️" },
  { value: "ace", label: "Ace Pitcher", icon: "👑" },
  { value: "flamethrower", label: "Flamethrower", icon: "🔥" },
  { value: "crafty", label: "Crafty", icon: "🧠" },
];

const COMBINE_GAMES = [
  { id: "speed", name: "60-Yard Dash", icon: "⚡", description: "Test your raw speed" },
  { id: "arm", name: "Arm Strength", icon: "💪", description: "Show off your throwing power" },
  { id: "fielding", name: "Fielding Drill", icon: "🧤", description: "Range and glove work" },
  { id: "iq", name: "Baseball IQ", icon: "🧠", description: "Situational knowledge" },
];

const INTERVIEW_QUESTIONS = [
  { q: "What's your biggest strength as a player?", 
    answers: [
      { text: "My power at the plate", draftBoost: 5 },
      { text: "My speed and defense", draftBoost: 5 },
      { text: "My hitting ability", draftBoost: 5 },
      { text: "My leadership", draftBoost: 3 },
    ]
  },
  { q: "How do you handle pressure situations?", 
    answers: [
      { text: "I thrive under pressure", draftBoost: 8 },
      { text: "I stay calm and focused", draftBoost: 5 },
      { text: "I get nervous but perform", draftBoost: 2 },
      { text: "I struggle sometimes", draftBoost: -5 },
    ]
  },
  { q: "What's your preferred role on a team?", 
    answers: [
      { text: "Cleanup hitter, drive in runs", draftBoost: 5 },
      { text: "Leadoff, set the table", draftBoost: 5 },
      { text: "Ace of the rotation", draftBoost: 5 },
      { text: "Whatever helps the team win", draftBoost: 8 },
    ]
  },
  { q: "What's your work ethic like?", 
    answers: [
      { text: "First in, last out", draftBoost: 10 },
      { text: "I put in the work", draftBoost: 5 },
      { text: "I do what's required", draftBoost: -3 },
    ]
  },
];

export default function RTTSMode({ cu }) {
  const mob = useIsMobile();
  const [phase, setPhase] = useState("creator");
  const [player, setPlayer] = useState(() => {
    const saved = loadRTTSPlayer();
    if (saved && saved.id === cu?.id) return saved;
    return {
      id: cu?.id || null,
      name: "",
      number: 1,
      position: "SS",
      playerType: "balanced",
      height: "6'0\"",
      weight: 190,
      ovr: 50,
      contact: 50,
      power: 50,
      speed: 50,
      arm: 50,
      fielding: 50,
      combineScore: 0,
      interviewScore: 0,
      draftedBy: null,
      currentLevel: "Rookie Ball",
      currentTeam: null,
      gamesPlayed: 0,
    };
  });
  
  const [combineIndex, setCombineIndex] = useState(0);
  const [combineResults, setCombineResults] = useState({});
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [interviewResults, setInterviewResults] = useState({});
  
  const isPitcher = player.position === "SP" || player.position === "RP" || player.position === "CP";
  
  useEffect(() => {
    if (player.name && cu?.id) saveRTTSPlayer(player);
  }, [player, cu?.id]);
  
  const createPlayer = () => {
    if (!player.name.trim()) return;
    setPhase("combine");
  };
  
  const runCombineTest = (gameId) => {
    let score = 0;
    if (gameId === "speed") score = rand(40, 100);
    else if (gameId === "arm") score = rand(40, 100);
    else if (gameId === "fielding") score = rand(40, 100);
    else if (gameId === "iq") score = rand(40, 100);
    
    setCombineResults(prev => ({ ...prev, [gameId]: score }));
    
    if (combineIndex < COMBINE_GAMES.length - 1) {
      setCombineIndex(combineIndex + 1);
    } else {
      const total = (combineResults.speed || 0) + (combineResults.arm || 0) + (combineResults.fielding || 0) + score;
      const avg = total / 4;
      setPlayer(p => ({ ...p, combineScore: avg }));
      setPhase("interviews");
      setInterviewIndex(0);
    }
  };
  
  const answerQuestion = (boost) => {
    const newScore = (interviewResults.total || 0) + boost;
    setInterviewResults({ total: newScore, answers: [...(interviewResults.answers || []), boost] });
    
    if (interviewIndex < INTERVIEW_QUESTIONS.length - 1) {
      setInterviewIndex(interviewIndex + 1);
    } else {
      setPlayer(p => ({ ...p, interviewScore: newScore }));
      // Draft logic
      const draftTotal = (player.combineScore || 0) + newScore;
      let draftPick = 1;
      if (draftTotal < 30) draftPick = rand(20, 30);
      else if (draftTotal < 50) draftPick = rand(10, 20);
      else if (draftTotal < 70) draftPick = rand(5, 15);
      else if (draftTotal < 85) draftPick = rand(1, 10);
      else draftPick = rand(1, 5);
      
      const team = MLB_TEAMS_RTTS[Math.floor(Math.random() * MLB_TEAMS_RTTS.length)];
      setPlayer(p => ({ ...p, draftedBy: team, draftPick }));
      setPhase("draft");
    }
  };
  
  // Render based on phase
  if (phase === "creator") {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48 }}>⚾</div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 24, fontWeight: 900, color: "#F59E0B" }}>ROAD TO THE SHOW</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>Create Your MLB Superstar</div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 18 }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, color: "#F59E0B", marginBottom: 12 }}>BASIC INFO</div>
            <input value={player.name} onChange={e => setPlayer(p => ({ ...p, name: e.target.value }))} placeholder="Player Name" style={{ marginBottom: 12, width: "100%" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <input type="number" min="0" max="99" value={player.number} onChange={e => setPlayer(p => ({ ...p, number: parseInt(e.target.value) || 1 }))} placeholder="#" />
              <select value={player.position} onChange={e => setPlayer(p => ({ ...p, position: e.target.value }))}>
                {POSITIONS.map(pos => <option key={pos.value} value={pos.value}>{pos.icon} {pos.label}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <select value={player.height} onChange={e => setPlayer(p => ({ ...p, height: e.target.value }))}>
                {["5'10\"","5'11\"","6'0\"","6'1\"","6'2\"","6'3\"","6'4\""].map(h => <option key={h}>{h}</option>)}
              </select>
              <input type="number" min="140" max="280" value={player.weight} onChange={e => setPlayer(p => ({ ...p, weight: parseInt(e.target.value) }))} placeholder="Weight" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>PLAYER TYPE</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {PLAYER_STYLES.map(style => (
                  <button key={style.value} onClick={() => setPlayer(p => ({ ...p, playerType: style.value }))} style={{
                    padding: "6px 12px", borderRadius: 10, cursor: "pointer", fontSize: 10,
                    border: `1px solid ${player.playerType === style.value ? "#F59E0B" : "rgba(255,255,255,.1)"}`,
                    background: player.playerType === style.value ? "rgba(245,158,11,.12)" : "rgba(255,255,255,.03)",
                    color: player.playerType === style.value ? "#F59E0B" : "#64748B",
                  }}>{style.icon} {style.label}</button>
                ))}
              </div>
            </div>
          </div>
          
          <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 18 }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, color: "#F59E0B", marginBottom: 12 }}>ATTRIBUTES</div>
            <div style={{ textAlign: "center", padding: 8, borderRadius: 10, background: "rgba(245,158,11,.1)", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#64748B" }}>OVERALL</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#F59E0B" }}>{player.ovr}</div>
            </div>
            {[
              { key: "contact", label: "Contact", color: "#22C55E" },
              { key: "power", label: "Power", color: "#EF4444" },
              { key: "speed", label: "Speed", color: "#F59E0B" },
              { key: "arm", label: "Arm", color: "#8B5CF6" },
              { key: "fielding", label: "Fielding", color: "#3B82F6" },
            ].slice(0, isPitcher ? 3 : 5).map(attr => (
              <div key={attr.key} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: "#64748B" }}>{attr.label}</span>
                  <span style={{ fontSize: 11, color: attr.color }}>{player[attr.key]}</span>
                </div>
                <input type="range" min="0" max="99" value={player[attr.key]} onChange={e => setPlayer(p => ({ ...p, [attr.key]: parseInt(e.target.value) }))} style={{ width: "100%" }} />
              </div>
            ))}
          </div>
        </div>
        
        <button onClick={createPlayer} disabled={!player.name.trim()} style={{ width: "100%", marginTop: 20, padding: 14, borderRadius: 12, background: "linear-gradient(135deg,#F59E0B,#EF4444)", color: "#fff", fontFamily: "'Orbitron',sans-serif", fontWeight: 900, cursor: player.name.trim() ? "pointer" : "not-allowed", opacity: player.name.trim() ? 1 : 0.5 }}>NEXT: MLB COMBINE →</button>
      </div>
    );
  }
  
  if (phase === "combine") {
    const game = COMBINE_GAMES[combineIndex];
    const hasResult = combineResults[game.id];
    
    return (
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>{game.icon}</div>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 900, color: "#F59E0B" }}>{game.name}</div>
        <div style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>{game.description}</div>
        {!hasResult ? (
          <button onClick={() => runCombineTest(game.id)} style={{ padding: "14px 32px", borderRadius: 12, background: "linear-gradient(135deg,#F59E0B,#EF4444)", color: "#fff", fontFamily: "'Orbitron',sans-serif", fontWeight: 900, cursor: "pointer" }}>START TEST</button>
        ) : (
          <div>
            <div style={{ background: "rgba(34,197,94,.1)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#F59E0B" }}>{hasResult}</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>Your score</div>
            </div>
            {combineIndex < COMBINE_GAMES.length - 1 && <button onClick={() => setCombineIndex(combineIndex + 1)} style={{ padding: "12px 24px", borderRadius: 10, background: "rgba(245,158,11,.2)", border: "1px solid rgba(245,158,11,.3)", color: "#F59E0B", cursor: "pointer" }}>NEXT TEST →</button>}
          </div>
        )}
      </div>
    );
  }
  
  if (phase === "interviews") {
    const q = INTERVIEW_QUESTIONS[interviewIndex];
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40 }}>🎙️</div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 20, fontWeight: 900, color: "#F59E0B" }}>TEAM INTERVIEW</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>Question {interviewIndex + 1} of {INTERVIEW_QUESTIONS.length}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,.05)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#E2E8F0", marginBottom: 16 }}>{q.q}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.answers.map((a, i) => (
              <button key={i} onClick={() => answerQuestion(a.draftBoost)} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", color: "#CBD5E1", cursor: "pointer", textAlign: "left" }}>{a.text}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (phase === "draft" && player.draftedBy) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 24, fontWeight: 900, color: "#F59E0B", marginBottom: 4 }}>MLB DRAFT</div>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>Congratulations!</div>
        <div style={{ background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, color: "#22C55E", marginBottom: 8 }}>Round 1 · Pick #{player.draftPick}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
            <img src={player.draftedBy.logo} alt={player.draftedBy.name} style={{ width: 48, height: 48 }} onError={e => e.target.style.display = "none"} />
            <div style={{ fontSize: 20, fontWeight: 700, color: "#E2E8F0" }}>{player.draftedBy.name}</div>
          </div>
          <div style={{ fontSize: 13, color: "#64748B" }}>Welcome to the organization, {player.name}!</div>
        </div>
        <button onClick={() => setPhase("minors")} style={{ padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg,#F59E0B,#EF4444)", color: "#fff", fontFamily: "'Orbitron',sans-serif", fontWeight: 900, cursor: "pointer" }}>START YOUR CAREER →</button>
      </div>
    );
  }
  
  // Simple minors view
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>⚾</div>
      <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 20, fontWeight: 900, color: "#F59E0B", marginBottom: 4 }}>ROAD TO THE SHOW</div>
      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>Your Career</div>
      
      <div style={{ background: "rgba(255,255,255,.05)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 }}>
          {player.draftedBy && <img src={player.draftedBy.logo} alt={player.draftedBy.name} style={{ width: 40, height: 40 }} onError={e => e.target.style.display = "none"} />}
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0" }}>{player.name} · #{player.number}</div>
            <div style={{ fontSize: 12, color: "#F59E0B" }}>{player.position} · OVR {player.ovr}</div>
          </div>
        </div>
        <div style={{ background: "rgba(245,158,11,.1)", borderRadius: 12, padding: 12, marginTop: 12 }}>
          <div style={{ fontSize: 11, color: "#64748B" }}>Current Level</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#F59E0B" }}>{player.currentLevel}</div>
          <div style={{ fontSize: 11, color: "#64748B" }}>{player.currentTeam?.name || player.draftedBy?.name || "Team"}</div>
        </div>
      </div>
      
      <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>Career Stats</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          <div><div style={{ fontSize: 20, fontWeight: 900, color: "#22C55E" }}>{player.careerStats.avg || ".000"}</div><div style={{ fontSize: 10, color: "#64748B" }}>AVG</div></div>
          <div><div style={{ fontSize: 20, fontWeight: 900, color: "#EF4444" }}>{player.careerStats.hr || 0}</div><div style={{ fontSize: 10, color: "#64748B" }}>HR</div></div>
          <div><div style={{ fontSize: 20, fontWeight: 900, color: "#F59E0B" }}>{player.careerStats.rbi || 0}</div><div style={{ fontSize: 10, color: "#64748B" }}>RBI</div></div>
        </div>
      </div>
      
      <button onClick={() => alert("Game simulation coming soon! This will simulate games, earn XP, and level up your player.")} style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(135deg,#F59E0B,#EF4444)", color: "#fff", fontFamily: "'Orbitron',sans-serif", fontWeight: 900, cursor: "pointer", marginBottom: 10 }}>SIMULATE NEXT GAME</button>
      
      <button onClick={() => { setPhase("creator"); localStorage.removeItem(RTTS_SAVE_KEY); }} style={{ width: "100%", padding: 12, borderRadius: 12, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#64748B", cursor: "pointer" }}>CREATE NEW PLAYER</button>
    </div>
  );
}