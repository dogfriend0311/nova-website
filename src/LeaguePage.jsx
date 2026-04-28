import React from "react";
import MessagesPage from "./MessagesPage";
import { RobloxAvatar } from "./UI";
import { sb } from "./shared";

const statGlow = (key, val) => {
  const v = parseFloat(val);
  if (isNaN(v)) return null;

  const map = {
    AVG: [[0.300, "#22C55E"], [0.260, "#F59E0B"]],
    OPS: [[0.900, "#A855F7"], [0.800, "#22C55E"]],
    ERA: [[2.5, "#A855F7"], [3.5, "#22C55E"], [4.5, "#F59E0B"]],
    HR: [[25, "#A855F7"], [15, "#22C55E"]],
    RBI: [[70, "#A855F7"], [50, "#22C55E"]],
    TD: [[15, "#A855F7"], [8, "#22C55E"]],
    YDS: [[1200, "#A855F7"], [600, "#22C55E"]],
    RTG: [[100, "#22C55E"], [90, "#F59E0B"]],
    PTS: [[25, "#A855F7"], [18, "#22C55E"]],
    REB: [[10, "#A855F7"], [7, "#22C55E"]],
    AST: [[8, "#A855F7"], [5, "#22C55E"]],
    SACK: [[8, "#A855F7"], [4, "#22C55E"]],
    INT: [[6, "#A855F7"], [3, "#22C55E"]],
  };

  const lowerBetter = ["ERA", "WHIP", "BB9", "TOV"];
  const tiers = map[key];
  if (!tiers) return null;

  if (lowerBetter.includes(key)) {
    for (const [t, c] of tiers) {
      if (v <= t) return c;
    }
  } else {
    for (const [t, c] of tiers) {
      if (v >= t) return c;
    }
  }

  return null;
};

const StatCell = ({ label, value }) => {
  const color = statGlow(label, value);

  return (
    <div
      style={{
        padding: "8px 12px",
        margin: "4px",
        borderRadius: "8px",
        background: "#111",
        color: "#fff",
        boxShadow: color ? `0 0 10px ${color}` : "none",
        border: color ? `1px solid ${color}` : "1px solid #333",
      }}
    >
      <strong>{label}:</strong> {value}
    </div>
  );
};

function BaseballLeaguePage({ cu, users, navigate }) {
  const [players, setPlayers] = React.useState([]);
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    sb.get("nova_nbbl_players", "?order=ovr.desc,name.asc").then(r => {
      setPlayers(r || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const S = {
    wrap: { minHeight: "100vh", padding: "1rem", color: "white", fontFamily: "inherit" },
    card: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" },
    h1: { fontSize: "2rem", fontWeight: 900, color: "#22C55E", letterSpacing: 2, marginBottom: 4 },
    h2: { fontSize: "1.1rem", fontWeight: 700, color: "#22C55E", letterSpacing: 1, marginBottom: "0.75rem", textTransform: "uppercase" },
    statRow: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 14 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem" },
    playerCard: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 12, padding: "1rem", cursor: "pointer", transition: "all .2s" },
  };

  function PlayerProfile({ player, onBack }) {
    return (
      <div style={S.wrap}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#22C55E", cursor: "pointer", fontSize: 14, marginBottom: "1rem" }}>← Back to roster</button>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Left: Sports Card */}
          <div style={{ flex: "0 0 300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              background: "linear-gradient(135deg, #22C55E, #16A34A)",
              borderRadius: 16,
              padding: "20px",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(34, 197, 94, 0.3)",
              border: "2px solid #22C55E",
              width: "100%",
              maxWidth: 280
            }}>
              <RobloxAvatar robloxId={player.roblox_id} size={120} />
              <h2 style={{ color: "#fff", margin: "10px 0 5px", fontSize: 24 }}>{player.name}</h2>
              <div style={{ fontSize: 18, color: "#E2E8F0" }}>OVR: {player.ovr || 70}</div>
              {player.team && <div style={{ fontSize: 14, color: "#94A3B8", marginTop: 5 }}>{player.team}</div>}
              {player.favorite_song && (
                player.favorite_song.includes("spotify.com") ? (
                  <iframe
                    src={player.favorite_song.replace("open.spotify.com/track", "open.spotify.com/embed/track").replace("/embed/embed/", "/embed/")}
                    width="280" height="80" frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    style={{ borderRadius: 8, marginTop: 10 }}
                  />
                ) : (
                  <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 10 }}>🎵 {player.favorite_song}</div>
                )
              )}
            </div>
          </div>
          {/* Right: Stats */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={S.card}>
              <div style={S.h2}>Season Stats</div>
              <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>AVG</span><span style={{ fontWeight: 600 }}>{player.avg || 0}</span></div>
              <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>HR</span><span style={{ fontWeight: 600 }}>{player.hr || 0}</span></div>
              <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>RBI</span><span style={{ fontWeight: 600 }}>{player.rbi || 0}</span></div>
              <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>SB</span><span style={{ fontWeight: 600 }}>{player.sb || 0}</span></div>
            </div>
            <div style={S.card}>
              <div style={S.h2}>Career Stats</div>
              <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>AVG</span><span style={{ fontWeight: 600 }}>{player.career_avg || 0}</span></div>
              <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>HR</span><span style={{ fontWeight: 600 }}>{player.career_hr || 0}</span></div>
              <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>RBI</span><span style={{ fontWeight: 600 }}>{player.career_rbi || 0}</span></div>
              <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>SB</span><span style={{ fontWeight: 600 }}>{player.career_sb || 0}</span></div>
            </div>
            <div style={S.card}>
              <div style={S.h2}>Advanced Stats</div>
              <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>OPS</span><span style={{ fontWeight: 600 }}>{player.ops || 0}</span></div>
              <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>WAR</span><span style={{ fontWeight: 600 }}>{player.war || 0}</span></div>
              <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>wOBA</span><span style={{ fontWeight: 600 }}>{player.woba || 0}</span></div>
              <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>wRC+</span><span style={{ fontWeight: 600 }}>{player.wrc_plus || 0}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [view, setView] = React.useState("roster");
  const topPlayers = React.useMemo(() => {
    return [...players].sort((a,b) => (b.ovr||0) - (a.ovr||0)).slice(0,8);
  }, [players]);
  const teams = React.useMemo(() => {
    const map = {};
    players.forEach(p => { if (p.team) map[p.team] = map[p.team] || []; map[p.team].push(p); });
    return Object.entries(map).sort(([a],[b]) => a.localeCompare(b));
  }, [players]);

  if (selectedPlayer) {
    return <PlayerProfile player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />;
  }

  return (
    <div style={S.wrap}>
      <h1 style={S.h1}>Baseball League</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { key: "roster", label: "Roster" },
          { key: "leaders", label: "Leaders" },
          { key: "teams", label: "Teams" }
        ].map(tab => (
          <button key={tab.key} onClick={() => setView(tab.key)} style={{ padding: "10px 14px", borderRadius: 12, border: view === tab.key ? "1px solid #22C55E" : "1px solid rgba(255,255,255,.1)", background: view === tab.key ? "rgba(34,197,94,.12)" : "rgba(255,255,255,.03)", color: view === tab.key ? "#22C55E" : "#E2E8F0", cursor: "pointer", fontWeight: 700, fontFamily: "'Rajdhani',sans-serif" }}>
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? <p>Loading...</p> : (
        <>
          {view === "roster" && (
            <div style={S.grid}>
              {players.map(p => (
                <div key={p.id} onClick={() => setSelectedPlayer(p)} style={S.playerCard}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 14, color: "#22C55E" }}>{p.position}</div>
                  {p.team && <div style={{ fontSize: 12, color: "#ccc" }}>{p.team}</div>}
                </div>
              ))}
            </div>
          )}
          {view === "leaders" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
              {topPlayers.map(p => (
                <div key={p.id} style={S.playerCard} onClick={() => setSelectedPlayer(p)}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 10 }}>{p.position} · {p.team}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                    <StatCell label="OVR" value={p.ovr || 0} />
                    <StatCell label="AVG" value={p.avg || 0} />
                    <StatCell label="HR" value={p.hr || 0} />
                    <StatCell label="RBI" value={p.rbi || 0} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {view === "teams" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12 }}>
              {teams.map(([team, roster]) => (
                <div key={team} style={S.card}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{team}</div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {roster.map(player => (
                      <div key={player.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#CBD5E1" }}>
                        <span>{player.name}</span>
                        <span>{player.ovr || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { BaseballLeaguePage, MessagesPage };
