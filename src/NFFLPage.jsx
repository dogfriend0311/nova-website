import React, { useState, useEffect } from "react";

const NFFL_SUPABASE_URL = "https://expzaiduzjehvyfclnnj.supabase.co";
const NFFL_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cHphaWR1emplaHZ5ZmNsbm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTUwNTQsImV4cCI6MjA4ODI3MTA1NH0.ZZrWRASkBWha6XDuw23bazoXK224diM0HTlgPkdLCy0";

const nfflH = () => ({
  apikey: NFFL_KEY,
  Authorization: `Bearer ${NFFL_KEY}`,
  "Content-Type": "application/json"
});

const nffl = {
  get: async (table, query = "") => {
    try {
      const r = await fetch(`${NFFL_SUPABASE_URL}/rest/v1/${table}${query}`, { headers: nfflH() });
      if (!r.ok) { console.error("nffl.get", table, await r.text()); return null; }
      return r.json();
    } catch (e) { console.error(e); return null; }
  }
};

const S = {
  wrap: { minHeight: "100vh", padding: "1rem", color: "white", fontFamily: "inherit" },
  card: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(204,0,0,0.25)", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" },
  h1: { fontSize: "2rem", fontWeight: 900, color: "#CC0000", letterSpacing: 2, marginBottom: 4 },
  h2: { fontSize: "1.1rem", fontWeight: 700, color: "#CC0000", letterSpacing: 1, marginBottom: "0.75rem", textTransform: "uppercase" },
  tabRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.5rem" },
  tab: (active) => ({
    padding: "8px 20px", borderRadius: 50,
    border: "1px solid rgba(204,0,0,0.4)",
    background: active ? "#CC0000" : "rgba(204,0,0,0.08)",
    color: active ? "#fff" : "#CC0000",
    fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all .2s"
  }),
  input: { width: "100%", padding: "9px 13px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" },
  statRow: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 14 },
  badge: (color) => ({ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: color + "22", color, border: `1px solid ${color}55`, fontWeight: 700, textTransform: "uppercase" }),
  grid: (min) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fill,minmax(${min}px,1fr))`, gap: "1rem" }),
  avatar: (size) => ({ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, border: "2px solid rgba(204,0,0,0.4)" }),
};

function RobloxAvatar({ robloxId, size = 60 }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!robloxId) return;
    fetch(`/api/roblox-avatar?userId=${robloxId}`)
      .then(r => r.json())
      .then(d => { if (d.imageUrl) setUrl(d.imageUrl); })
      .catch(() => {});
  }, [robloxId]);
  return (
    <div style={{ ...S.avatar(size), margin: "0 auto 0.75rem" }}>
      {url
        ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setUrl(null)} />
        : "🏈"}
    </div>
  );
}

function StatCard({ title, rows }) {
  if (!rows || rows.every(r => !r.value)) return null;
  return (
    <div style={S.card}>
      <div style={S.h2}>{title}</div>
      {rows.map(r => (
        <div key={r.label} style={S.statRow}>
          <span style={{ color: "rgba(255,255,255,0.6)" }}>{r.label}</span>
          <span style={{ fontWeight: 600 }}>{r.value ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}

function PlayerProfile({ player, onBack }) {
  const [season, setSeason] = useState("current");
  const [stats, setStats] = useState({});

  useEffect(() => {
    const tables = ["passing", "rushing", "receiving", "defensive", "kicking"];
    Promise.all(tables.map(t =>
      nffl.get(`${t}_stats`, `?player_id=eq.${player.id}&season=eq.${season}`)
        .then(d => [t, d?.[0] || null])
    )).then(results => {
      const obj = {};
      results.forEach(([t, d]) => { obj[t] = d; });
      setStats(obj);
    });
  }, [player.id, season]);

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#CC0000", cursor: "pointer", fontSize: 14, marginBottom: "1rem" }}>
        ← Back to roster
      </button>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <RobloxAvatar robloxId={player.roblox_id} size={110} />
        <div style={{ flex: 1 }}>
          <h1 style={S.h1}>{player.name}</h1>
          {player.team && <span style={S.badge("#CC0000")}>{player.team}</span>}
          {player.positions && <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 6 }}>📍 {player.positions}</p>}
          {player.bio && <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.6, marginTop: 8, maxWidth: 480 }}>{player.bio}</p>}
          {player.song_url && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>🎵 Player's Song</p>
              <iframe
                src={player.song_url.replace("open.spotify.com/track", "open.spotify.com/embed/track").replace("/embed/embed/", "/embed/")}
                width="280" height="80" frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                style={{ borderRadius: 8 }}
              />
            </div>
          )}
        </div>
      </div>
      <div style={S.tabRow}>
        {["current", "career"].map(s => (
          <button key={s} onClick={() => setSeason(s)} style={S.tab(season === s)}>
            {s === "current" ? "Current Season" : "Career Stats"}
          </button>
        ))}
      </div>
      <div style={S.grid(280)}>
        <StatCard title="📤 Passing" rows={[
          { label: "Completions", value: stats.passing?.completions },
          { label: "Attempts", value: stats.passing?.attempts },
          { label: "Yards", value: stats.passing?.passing_yards },
          { label: "TDs", value: stats.passing?.touchdowns },
          { label: "INTs", value: stats.passing?.interceptions },
          { label: "Longest", value: stats.passing?.longest_pass },
          { label: "Passer Rating", value: stats.passing?.passer_rating },
        ]} />
        <StatCard title="🏃 Rushing" rows={[
          { label: "Carries", value: stats.rushing?.carries },
          { label: "Yards", value: stats.rushing?.rushing_yards },
          { label: "YPC", value: stats.rushing?.yards_per_carry },
          { label: "TDs", value: stats.rushing?.rushing_tds },
          { label: "Longest", value: stats.rushing?.longest_run },
          { label: "Fumbles", value: stats.rushing?.fumbles },
        ]} />
        <StatCard title="🙌 Receiving" rows={[
          { label: "Receptions", value: stats.receiving?.receptions },
          { label: "Targets", value: stats.receiving?.targets },
          { label: "Yards", value: stats.receiving?.receiving_yards },
          { label: "YPR", value: stats.receiving?.yards_per_reception },
          { label: "TDs", value: stats.receiving?.receiving_tds },
          { label: "Longest", value: stats.receiving?.longest_reception },
        ]} />
        <StatCard title="🛡️ Defense" rows={[
          { label: "Tackles", value: stats.defensive?.tackles },
          { label: "Solo Tackles", value: stats.defensive?.solo_tackles },
          { label: "Sacks", value: stats.defensive?.sacks },
          { label: "INTs", value: stats.defensive?.interceptions },
          { label: "Forced Fumbles", value: stats.defensive?.forced_fumbles },
          { label: "Passes Defended", value: stats.defensive?.passes_defended },
          { label: "Def TDs", value: stats.defensive?.defensive_tds },
        ]} />
        <StatCard title="🎯 Kicking" rows={[
          { label: "FG Made", value: stats.kicking?.field_goals_made },
          { label: "FG Attempted", value: stats.kicking?.field_goals_attempted },
          { label: "Longest FG", value: stats.kicking?.longest_fg },
          { label: "XP Made", value: stats.kicking?.extra_points_made },
          { label: "Punts", value: stats.kicking?.punts },
          { label: "Punt Yards", value: stats.kicking?.punt_yards },
        ]} />
      </div>
    </div>
  );
}

function MembersView() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamFilter, setTeamFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nffl.get("players", "?order=name.asc").then(d => {
      if (d) {
        setPlayers(d);
        setTeams([...new Set(d.map(p => p.team).filter(Boolean))]);
      }
      setLoading(false);
    });
  }, []);

  if (selected) return <PlayerProfile player={selected} onBack={() => setSelected(null)} />;

  const filtered = teamFilter === "All" ? players : players.filter(p => p.team === teamFilter);

  return (
    <div>
      <h2 style={S.h1}>Roster</h2>
      <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "1.25rem", fontSize: 13 }}>
        {players.length} players · {teams.length} teams
      </p>
      <div style={S.tabRow}>
        {["All", ...teams].map(t => (
          <button key={t} onClick={() => setTeamFilter(t)} style={S.tab(teamFilter === t)}>{t}</button>
        ))}
      </div>
      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>No players yet.</p>
      ) : (
        <div style={S.grid(170)}>
          {filtered.map(p => (
            <div key={p.id}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(204,0,0,0.2)", borderRadius: 14, padding: "1.25rem", textAlign: "center", cursor: "pointer", transition: "all .2s" }}
              onClick={() => setSelected(p)}
              onMouseEnter={e => { e.currentTarget.style.border = "1px solid rgba(204,0,0,0.6)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(204,0,0,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <RobloxAvatar robloxId={p.roblox_id} size={70} />
              <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{p.name}</div>
              {p.team && <div style={{ fontSize: 11, color: "#CC0000", marginTop: 3 }}>{p.team}</div>}
              {p.positions && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{p.positions}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedView() {
  const [plays, setPlays] = useState([]);
  const [boxScores, setBoxScores] = useState([]);
  const [selectedGame, setSelectedGame] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    const [p, b] = await Promise.all([
      nffl.get("game_feed", "?order=created_at.desc&limit=100"),
      nffl.get("box_scores", "?order=created_at.desc")
    ]);
    if (p) setPlays(p);
    if (b) setBoxScores(b);
    setLoading(false);
  };

  const icon = (t = "") => {
    const s = t.toLowerCase();
    if (s.includes("touchdown") || s.includes("td")) return "🏈";
    if (s.includes("interception")) return "🚨";
    if (s.includes("fumble")) return "💥";
    if (s.includes("field goal")) return "🎯";
    if (s.includes("sack")) return "💪";
    if (s.includes("penalty")) return "🚩";
    return "▶";
  };

  const playColor = (t = "") => {
    const s = t.toLowerCase();
    if (s.includes("touchdown") || s.includes("td")) return "#00ff88";
    if (s.includes("interception")) return "#ff4444";
    if (s.includes("fumble")) return "#ff8800";
    return "rgba(255,255,255,0.9)";
  };

  const filtered = selectedGame === "all" ? plays : plays.filter(p => p.game_id === selectedGame);
  const box = boxScores.find(b => b.game_id === selectedGame);

  return (
    <div>
      <h2 style={S.h1}>Game Feed</h2>
      <div style={S.tabRow}>
        <button onClick={() => setSelectedGame("all")} style={S.tab(selectedGame === "all")}>All Plays</button>
        {boxScores.map(g => (
          <button key={g.game_id} onClick={() => setSelectedGame(g.game_id)} style={S.tab(selectedGame === g.game_id)}>
            {g.away_team} vs {g.home_team}
          </button>
        ))}
      </div>

      {box && (
        <div style={{ ...S.card, overflowX: "auto", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{box.away_team} vs {box.home_team}</span>
            <span style={S.badge(box.status === "live" ? "#00ff88" : box.status === "final" ? "rgba(255,255,255,0.5)" : "#CC0000")}>
              {box.status === "live" ? "🔴 Live" : box.status === "final" ? "Final" : "Upcoming"}
            </span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>{["Team", "Q1", "Q2", "Q3", "Q4", "T"].map(h => (
                <th key={h} style={{ padding: "6px 10px", color: h === "T" ? "#CC0000" : "rgba(255,255,255,0.4)", textAlign: h === "Team" ? "left" : "center", fontWeight: 600 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[
                { n: box.away_team, q: [box.away_q1, box.away_q2, box.away_q3, box.away_q4], t: box.away_total },
                { n: box.home_team, q: [box.home_q1, box.home_q2, box.home_q3, box.home_q4], t: box.home_total }
              ].map((row, i) => (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 700 }}>{row.n}</td>
                  {row.q.map((v, j) => <td key={j} style={{ textAlign: "center", padding: "8px 10px", color: "rgba(255,255,255,0.7)" }}>{v}</td>)}
                  <td style={{ textAlign: "center", padding: "8px 10px", fontWeight: 800, color: "#CC0000", fontSize: 16 }}>{row.t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "0.85rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 6px #00ff88" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>PLAY BY PLAY</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>{filtered.length} plays · refreshes every 15s</span>
        </div>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>No plays yet.</div>
        ) : filtered.map((play, i) => (
          <div key={play.id} style={{ padding: "0.85rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: "0.85rem", background: i === 0 ? "rgba(204,0,0,0.03)" : "transparent" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{icon(play.play_text)}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: playColor(play.play_text), lineHeight: 1.5, fontWeight: play.play_text?.toLowerCase().includes("touchdown") ? 700 : 400, margin: 0 }}>
                {play.player_name && <strong style={{ color: "#CC0000" }}>{play.player_name} </strong>}
                {play.play_text}
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                {play.yards != null && <span style={{ fontSize: 11, color: play.yards > 0 ? "#00ff88" : "#ff6666", fontWeight: 600 }}>{play.yards > 0 ? "+" : ""}{play.yards} yds</span>}
                {play.field_position && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>📍 {play.field_position}</span>}
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{new Date(play.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsView() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nffl.get("transactions", "?order=created_at.desc").then(d => {
      if (d) setTransactions(d);
      setLoading(false);
    });
  }, []);

  const typeColor = { Signing: "#00ff88", Trade: "#378ADD", Promotion: "#AFA9EC", Release: "#ff6666", Other: "rgba(255,255,255,0.5)" };
  const typeIcon = { Signing: "✍️", Trade: "🔄", Promotion: "⬆️", Release: "🚪", Other: "📋" };
  const types = ["All", "Signing", "Trade", "Promotion", "Release", "Other"];
  const filtered = filter === "All" ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div>
      <h2 style={S.h1}>Transactions</h2>
      <div style={S.tabRow}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={S.tab(filter === t)}>{t}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {["Signing", "Trade", "Promotion", "Release"].map(t => {
          const c = transactions.filter(x => x.type === t).length;
          const col = typeColor[t];
          return (
            <div key={t} style={{ flex: 1, minWidth: 80, background: col + "18", border: `1px solid ${col}44`, borderRadius: 10, padding: "0.6rem 0.75rem", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: col }}>{c}</div>
              <div style={{ fontSize: 10, color: col, opacity: 0.8 }}>{t}s</div>
            </div>
          );
        })}
      </div>
      {loading ? <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p> : filtered.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "2rem" }}>No transactions yet.</p>
      ) : filtered.map(tx => {
        const col = typeColor[tx.type] || "rgba(255,255,255,0.4)";
        return (
          <div key={tx.id} style={{ ...S.card, borderLeft: `3px solid ${col}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <span style={S.badge(col)}>{typeIcon[tx.type]} {tx.type}</span>
                {tx.player_name && <div style={{ fontWeight: 700, fontSize: 15, color: "white", marginTop: 6 }}>{tx.player_name}</div>}
                {tx.team_from && tx.team_to && (
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                    <span style={{ color: "#ff6666" }}>{tx.team_from}</span> → <span style={{ color: "#00ff88" }}>{tx.team_to}</span>
                  </div>
                )}
                {tx.team_to && !tx.team_from && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Signed to <span style={{ color: "#00ff88" }}>{tx.team_to}</span></div>}
                {tx.notes && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontStyle: "italic", marginTop: 6 }}>"{tx.notes}"</div>}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                {new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function NFFLPage() {
  const [tab, setTab] = useState("members");

  const tabs = [
    { id: "members", label: "👥 Roster" },
    { id: "feed", label: "📡 Game Feed" },
    { id: "transactions", label: "📋 Transactions" },
  ];

  return (
    <div style={S.wrap}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 900, color: "#CC0000", letterSpacing: 3 }}>
            🏈 NFFL
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: 2 }}>
            NOVA FOOTBALL FUSION LEAGUE
          </p>
        </div>
        <div style={S.tabRow}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={S.tab(tab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "members" && <MembersView />}
        {tab === "feed" && <FeedView />}
        {tab === "transactions" && <TransactionsView />}
      </div>
    </div>
  );
}
