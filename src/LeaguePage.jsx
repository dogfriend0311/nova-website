import React from "react";
import MessagesPage from "./MessagesPage";
import { LoginModal, RegisterModal } from "./AuthModals";
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
    // Assuming sb is imported or available
    // sb.get("nova_nbbl_players", "?order=name.asc").then(r => {
    //   setPlayers(r || []);
    //   setLoading(false);
    // });
    setLoading(false); // Placeholder
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

  if (selectedPlayer) {
    return <PlayerProfile player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />;
  }

  return (
    <div style={S.wrap}>
      <h1 style={S.h1}>Baseball League</h1>
      {loading ? <p>Loading...</p> : (
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
    </div>
  );
}

function RingRushPage({ cu, users, navigate }) {
  const [players, setPlayers] = React.useState([]);
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    sb.get("nova_ringrush_players", "?order=name.asc").then(r => {
      setPlayers(r || []);
      setLoading(false);
    });
  }, []);

  const S = {
    wrap: { minHeight: "100vh", padding: "1rem", color: "white", fontFamily: "inherit" },
    card: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(236,72,153,0.25)", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" },
    h1: { fontSize: "2rem", fontWeight: 900, color: "#EC4899", letterSpacing: 2, marginBottom: 4 },
    h2: { fontSize: "1.1rem", fontWeight: 700, color: "#EC4899", letterSpacing: 1, marginBottom: "0.75rem", textTransform: "uppercase" },
    statRow: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 14 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem" },
    playerCard: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(236,72,153,0.25)", borderRadius: 12, padding: "1rem", cursor: "pointer", transition: "all .2s" },
  };

  function PlayerProfile({ player, onBack }) {
    return (
      <div style={S.wrap}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#EC4899", cursor: "pointer", fontSize: 14, marginBottom: "1rem" }}>← Back to roster</button>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <RobloxAvatar robloxId={player.roblox_id} size={110} />
          <div style={{ flex: 1 }}>
            <h1 style={S.h1}>{player.name}</h1>
            {player.team && <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: "#EC489922", color: "#EC4899", border: "1px solid #EC489955", fontWeight: 700, textTransform: "uppercase" }}>{player.team}</span>}
            {player.favorite_song && <p style={{ marginTop: "0.5rem", color: "#ccc" }}>Favorite Song: {player.favorite_song}</p>}
          </div>
        </div>
        <div style={S.card}>
          <div style={S.h2}>Season Stats</div>
          <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>PTS</span><span style={{ fontWeight: 600 }}>{player.pts || 0}</span></div>
          <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>REB</span><span style={{ fontWeight: 600 }}>{player.reb || 0}</span></div>
          <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>AST</span><span style={{ fontWeight: 600 }}>{player.ast || 0}</span></div>
          <div style={S.statRow}><span style={{ color: "rgba(255,255,255,0.6)" }}>STL</span><span style={{ fontWeight: 600 }}>{player.stl || 0}</span></div>
        </div>
      </div>
    );
  }

  if (selectedPlayer) {
    return <PlayerProfile player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />;
  }

  return (
    <div style={S.wrap}>
      <h1 style={S.h1}>Basketball League</h1>
      {loading ? <p>Loading...</p> : (
        <div style={S.grid}>
          {players.map(p => (
            <div key={p.id} onClick={() => setSelectedPlayer(p)} style={S.playerCard}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 14, color: "#EC4899" }}>{p.position}</div>
              {p.team && <div style={{ fontSize: 12, color: "#ccc" }}>{p.team}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LeaguePage() {
  const playerStats = {
    AVG: ".312",
    OPS: ".945",
    HR: "28",
    RBI: "75",
    ERA: "2.85",
    AST: "9",
  };

  return (
    <div style={{ padding: "20px", background: "#0a0a0a", minHeight: "100vh" }}>
      <h1 style={{ color: "#fff", marginBottom: "20px" }}>
        League Stats
      </h1>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {Object.entries(playerStats).map(([key, val]) => (
          <StatCell key={key} label={key} value={val} />
        ))}
      </div>
    </div>
  );
}

export { BaseballLeaguePage, MessagesPage, LoginModal, RegisterModal };
