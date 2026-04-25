// ─── RTTSMode (Road to the Show) ───────────────────────────────────────────────
// Full baseball career mode: create a player, progress from minors to MLB,
// sim games, upgrade attributes with points, track career stats.
import React, { useState, useEffect } from "react";
import { sb, gid, useIsMobile } from "./shared";
import { Btn, Card, Lbl } from "./UI";

export default function RTTSMode({ cu }) {
  const mob = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("profile"); // profile, sim, upgrade, stats
  const [player, setPlayer] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [simPoints, setSimPoints] = useState(0);
  const [gameLog, setGameLog] = useState([]);
  const [toast, setToast] = useState(null);

  // Attribute definitions
  const ATTRS = [
    { id: "con", label: "Contact", desc: "Hitting for average", min: 30, max: 99, icon: "🎯" },
    { id: "pow", label: "Power", desc: "Homeruns & extra bases", min: 30, max: 99, icon: "💪" },
    { id: "vis", label: "Vision", desc: "Plate discipline & walks", min: 30, max: 99, icon: "👁️" },
    { id: "spd", label: "Speed", desc: "Running & base stealing", min: 30, max: 99, icon: "⚡" },
    { id: "fld", label: "Fielding", desc: "Defensive ability", min: 30, max: 99, icon: "🧤" },
    { id: "arm", label: "Arm Strength", desc: "Throwing power", min: 30, max: 99, icon: "💪" },
  ];

  const POSITIONS = [
    { id: "C", label: "Catcher", icon: "🧤" },
    { id: "1B", label: "First Base", icon: "1️⃣" },
    { id: "2B", label: "Second Base", icon: "2️⃣" },
    { id: "3B", label: "Third Base", icon: "3️⃣" },
    { id: "SS", label: "Shortstop", icon: "6️⃣" },
    { id: "LF", label: "Left Field", icon: "7️⃣" },
    { id: "CF", label: "Center Field", icon: "8️⃣" },
    { id: "RF", label: "Right Field", icon: "9️⃣" },
  ];

  const LEVELS = [
    { id: "AA", label: "AA (Double-A)", minOvr: 40, next: "AAA", nextReq: "Reach 55 OVR" },
    { id: "AAA", label: "AAA (Triple-A)", minOvr: 55, next: "MLB", nextReq: "Reach 70 OVR" },
    { id: "MLB", label: "Major Leagues", minOvr: 70, next: null, nextReq: null },
  ];

  // Helper: calculate overall rating from attributes
  const calcOverall = (attrs) => {
    const values = Object.values(attrs);
    if (!values.length) return 40;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  // Load or create player for current user
  const loadPlayer = async () => {
    if (!cu) return;
    setLoading(true);
    try {
      const rows = await sb.get("nova_rtts_players", `?user_id=eq.${cu.id}&limit=1`);
      if (rows && rows.length) {
        const p = rows[0];
        // Parse JSON fields
        p.attributes = p.attributes || {
          con: 50, pow: 50, vis: 50, spd: 50, fld: 50, arm: 50
        };
        p.stats = p.stats || {
          season: { G: 0, AB: 0, H: 0, HR: 0, RBI: 0, BB: 0, K: 0, SB: 0, AVG: 0, OPS: 0 },
          career: { G: 0, AB: 0, H: 0, HR: 0, RBI: 0, BB: 0, K: 0, SB: 0, AVG: 0, OPS: 0 }
        };
        p.overall = calcOverall(p.attributes);
        setPlayer(p);
        // Load game log
        const logs = await sb.get("nova_rtts_logs", `?user_id=eq.${cu.id}&order=date.desc&limit=20`);
        setGameLog(logs || []);
      } else if (cu) {
        // Create default player
        const newPlayer = {
          id: gid(),
          user_id: cu.id,
          player_name: cu.display_name || "Road Player",
          position: "SS",
          handedness: "R",
          number: "7",
          avatar: "⚾",
          attributes: { con: 50, pow: 50, vis: 50, spd: 50, fld: 50, arm: 50 },
          level: "AA",
          points: 0,
          stats: {
            season: { G: 0, AB: 0, H: 0, HR: 0, RBI: 0, BB: 0, K: 0, SB: 0, AVG: 0, OPS: 0 },
            career: { G: 0, AB: 0, H: 0, HR: 0, RBI: 0, BB: 0, K: 0, SB: 0, AVG: 0, OPS: 0 }
          },
          created_at: Date.now(),
          updated_at: Date.now(),
        };
        newPlayer.overall = calcOverall(newPlayer.attributes);
        const inserted = await sb.post("nova_rtts_players", newPlayer);
        if (inserted && inserted.length) setPlayer(inserted[0]);
        else setPlayer(newPlayer);
      }
    } catch (e) {
      console.error("loadPlayer error", e);
      showToast("Failed to load player data", "#EF4444");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPlayer();
  }, [cu]);

  const showToast = (msg, color = "#22C55E") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const savePlayer = async (updates) => {
    if (!player) return;
    setSaving(true);
    try {
      const updated = { ...player, ...updates, updated_at: Date.now() };
      await sb.patch("nova_rtts_players", `?id=eq.${player.id}`, updated);
      setPlayer(updated);
      showToast("Saved!");
    } catch (e) {
      showToast("Save failed", "#EF4444");
    }
    setSaving(false);
  };

  const updateAttribute = (attrId, delta) => {
    const newVal = Math.min(ATTRS.find(a => a.id === attrId).max, Math.max(ATTRS.find(a => a.id === attrId).min, player.attributes[attrId] + delta));
    if (newVal === player.attributes[attrId]) return;
    const newAttrs = { ...player.attributes, [attrId]: newVal };
    const cost = Math.abs(delta) * 5;
    if (player.points < cost && delta > 0) {
      showToast(`Not enough points! Need ${cost} points`, "#F59E0B");
      return;
    }
    const newPoints = delta > 0 ? player.points - cost : player.points;
    const newOverall = calcOverall(newAttrs);
    savePlayer({ attributes: newAttrs, overall: newOverall, points: newPoints });
  };

  // Simulate a single game
  const simulateGame = async () => {
    if (!player) return;
    setSimPoints(0);
    setGameResult(null);
    // Determine opponent level based on player's level
    const levelIdx = LEVELS.findIndex(l => l.id === player.level);
    const difficulty = levelIdx; // 0=AA,1=AAA,2=MLB
    const basePitcherOvr = 60 + difficulty * 10;
    // Generate random pitcher quality
    const pitcherOvr = Math.max(40, basePitcherOvr + (Math.random() * 20 - 10));
    // Simulate 4-5 plate appearances
    const pa = Math.floor(Math.random() * 3) + 4; // 4-6 PA
    let ab = 0, h = 0, hr = 0, rbi = 0, bb = 0, k = 0, sb = 0;
    let pointsEarned = 0;
    const playLog = [];

    for (let i = 0; i < pa; i++) {
      // Calculate success chance based on player attributes vs pitcher
      const contactChance = (player.attributes.con / 100) * (1 - (pitcherOvr - 50) / 100);
      const powerChance = (player.attributes.pow / 100) * 0.8;
      const visionChance = (player.attributes.vis / 100);
      const speedBonus = (player.attributes.spd / 100) * 0.2;

      let outcome = "";
      let r = Math.random();
      // Walk check
      if (r < visionChance * 0.12 + 0.05) {
        outcome = "BB";
        bb++;
        pointsEarned += 3;
        playLog.push(`🟢 Walk`);
        continue;
      }
      // Strikeout check
      if (r < 0.2 - visionChance * 0.1) {
        outcome = "K";
        k++;
        playLog.push(`❌ Strikeout`);
        continue;
      }
      // Hit outcome
      let hitType = "";
      let hitChance = contactChance + speedBonus;
      if (Math.random() < hitChance) {
        // Hit
        let powerRoll = Math.random();
        if (powerRoll < powerChance * 0.15) {
          hitType = "HR";
          hr++;
          rbi += Math.floor(Math.random() * 3) + 1;
          pointsEarned += 25;
          playLog.push(`🏆 HOME RUN!`);
        } else if (powerRoll < powerChance * 0.3 + 0.1) {
          hitType = "2B";
          rbi += Math.floor(Math.random() * 2);
          pointsEarned += 8;
          playLog.push(`📈 Double!`);
        } else if (powerRoll < powerChance * 0.4 + 0.2) {
          hitType = "3B";
          rbi += Math.floor(Math.random() * 2);
          pointsEarned += 10;
          playLog.push(`💨 Triple!`);
        } else {
          hitType = "1B";
          rbi += Math.floor(Math.random() * 2);
          pointsEarned += 5;
          playLog.push(`✅ Single`);
        }
        h++;
        ab++;
        // Stolen base chance
        if (hitType !== "HR" && Math.random() < (player.attributes.spd / 100) * 0.3) {
          sb++;
          pointsEarned += 4;
          playLog.push(`🏃 Stolen base!`);
        }
      } else {
        outcome = "OUT";
        ab++;
        playLog.push(`⚾ Out`);
      }
    }

    // Calculate final stat line
    const avg = ab > 0 ? (h / ab).toFixed(3) : ".000";
    const ops = (avg * 1000 + (hr * 4 + (h - hr) * 1) / ab * 100).toFixed(3);
    const gameStats = {
      G: 1, AB: ab, H: h, HR: hr, RBI: rbi, BB: bb, K: k, SB: sb, AVG: avg, OPS: ops
    };

    // Update season and career stats
    const updateStats = (current, add) => ({
      G: (current.G || 0) + add.G,
      AB: (current.AB || 0) + add.AB,
      H: (current.H || 0) + add.H,
      HR: (current.HR || 0) + add.HR,
      RBI: (current.RBI || 0) + add.RBI,
      BB: (current.BB || 0) + add.BB,
      K: (current.K || 0) + add.K,
      SB: (current.SB || 0) + add.SB,
      AVG: ((current.AB + add.AB) > 0 ? ((current.H + add.H) / (current.AB + add.AB)).toFixed(3) : ".000"),
      OPS: (((current.H + add.H) / (current.AB + add.AB) * 1000) + (((current.HR + add.HR) * 4 + ((current.H + add.H) - (current.HR + add.HR)) * 1) / (current.AB + add.AB) * 100)).toFixed(3)
    });

    const newSeason = updateStats(player.stats.season, gameStats);
    const newCareer = updateStats(player.stats.career, gameStats);
    const newPoints = player.points + pointsEarned;

    // Check for promotion
    let newLevel = player.level;
    let promotionMsg = null;
    const currentLevelIdx = LEVELS.findIndex(l => l.id === player.level);
    if (currentLevelIdx < LEVELS.length - 1) {
      const nextLevel = LEVELS[currentLevelIdx + 1];
      if (player.overall >= nextLevel.minOvr) {
        newLevel = nextLevel.id;
        promotionMsg = `🎉 PROMOTED to ${nextLevel.label}! 🎉`;
        showToast(promotionMsg, "#F59E0B");
      }
    }

    // Save game log
    const logEntry = {
      id: gid(),
      user_id: cu.id,
      date: Date.now(),
      stats: gameStats,
      points: pointsEarned,
      level: player.level,
      opponent_ovr: Math.round(pitcherOvr)
    };
    await sb.post("nova_rtts_logs", logEntry);
    setGameLog(prev => [logEntry, ...prev].slice(0, 20));

    // Update player
    await savePlayer({
      stats: { season: newSeason, career: newCareer },
      points: newPoints,
      level: newLevel,
      overall: player.overall
    });

    setGameResult({ gameStats, pointsEarned, playLog, promotion: promotionMsg });
    setSimPoints(pointsEarned);
    showToast(`+${pointsEarned} points earned!`, "#F59E0B");
  };

  // Reset season stats (start new season)
  const resetSeason = async () => {
    if (confirm("Reset season stats? Your career stats will remain.")) {
      const newSeason = { G: 0, AB: 0, H: 0, HR: 0, RBI: 0, BB: 0, K: 0, SB: 0, AVG: 0, OPS: 0 };
      await savePlayer({ stats: { ...player.stats, season: newSeason } });
      showToast("Season reset!");
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", color: "#334155" }}>
        <div className="spin" style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12 }}>LOADING RTTS...</div>
      </div>
    );
  }

  if (!cu) {
    return (
      <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚾</div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: "#475569" }}>Sign in to start your Road to the Show</div>
        <Btn style={{ marginTop: 20 }}>Sign In</Btn>
      </div>
    );
  }

  if (!player) return <div style={{ padding: 60, textAlign: "center", color: "#334155" }}>No player data found. Create a new career?</div>;

  const currentLevel = LEVELS.find(l => l.id === player.level);
  const nextLevel = LEVELS.find(l => l.id === currentLevel?.next);
  const overall = player.overall || calcOverall(player.attributes);

  const TABS = [
    { id: "profile", label: "👤 Profile", icon: "👤" },
    { id: "sim", label: "🎮 Sim Game", icon: "🎮" },
    { id: "upgrade", label: "⬆️ Upgrade", icon: "⬆️" },
    { id: "stats", label: "📊 Stats", icon: "📊" },
  ];

  const ac = "#22C55E"; // MLB green

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: mob ? "10px 10px 80px" : "20px 20px 60px" }}>
      {toast && (
        <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#fff", padding: "8px 18px", borderRadius: 20, fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 700, zIndex: 1000 }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ fontSize: 48 }}>⚾</div>
        <div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: mob ? 18 : 24, fontWeight: 900, color: ac, letterSpacing: ".06em" }}>ROAD TO THE SHOW</div>
          <div style={{ fontSize: 11, color: "#475569" }}>{player.player_name} · {player.position} · #{player.number}</div>
        </div>
      </div>

      {/* Player mini-card */}
      <Card style={{ padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${ac}22`, border: `2px solid ${ac}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
          {player.avatar || "⚾"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 900, color: "#E2E8F0" }}>{player.player_name}</div>
          <div style={{ fontSize: 11, color: ac }}>{player.position} · {player.handedness || "R"} · Level: {currentLevel?.label}</div>
          <div style={{ fontSize: 10, color: "#475569" }}>OVR {overall} · {player.points} points</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: "#334155", fontFamily: "'Orbitron', sans-serif" }}>NEXT</div>
          <div style={{ fontSize: 11, color: ac, fontWeight: 700 }}>{nextLevel ? `${nextLevel.minOvr} OVR` : "MAX"}</div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,.07)", paddingBottom: 8, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 16px",
            cursor: "pointer",
            fontFamily: "'Orbitron', sans-serif",
            fontSize: mob ? 10 : 11,
            fontWeight: 700,
            border: "none",
            background: "none",
            borderBottom: `2px solid ${tab === t.id ? ac : "transparent"}`,
            color: tab === t.id ? ac : "#64748B",
            transition: "all .18s"
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "profile" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 16 }}>
            <div>
              <Lbl>Player Name</Lbl>
              <input value={player.player_name} onChange={e => savePlayer({ player_name: e.target.value })} />
            </div>
            <div>
              <Lbl>Position</Lbl>
              <select value={player.position} onChange={e => savePlayer({ position: e.target.value })} style={{ width: "100%" }}>
                {POSITIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <Lbl>Jersey Number</Lbl>
              <input value={player.number} onChange={e => savePlayer({ number: e.target.value })} maxLength={2} />
            </div>
            <div>
              <Lbl>Handedness</Lbl>
              <select value={player.handedness || "R"} onChange={e => savePlayer({ handedness: e.target.value })}>
                <option value="R">Right</option>
                <option value="L">Left</option>
                <option value="S">Switch</option>
              </select>
            </div>
            <div>
              <Lbl>Avatar Emoji</Lbl>
              <input value={player.avatar} onChange={e => savePlayer({ avatar: e.target.value })} placeholder="⚾" maxLength={2} />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Lbl>Current Level</Lbl>
            <div style={{ padding: "12px", background: "rgba(255,255,255,.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: "'Orbitron', sans-serif", color: ac, fontWeight: 700 }}>{currentLevel?.label}</span>
                <span style={{ fontSize: 10, color: "#334155" }}>{overall} / {currentLevel?.minOvr}+ OVR</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,.1)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, ((overall - currentLevel.minOvr) / (nextLevel ? nextLevel.minOvr - currentLevel.minOvr : 30)) * 100)}%`, height: "100%", background: ac, borderRadius: 2 }} />
              </div>
              {nextLevel && <div style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>→ {nextLevel.label} at {nextLevel.minOvr} OVR</div>}
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => loadPlayer()} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#94A3B8", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", fontSize: 11 }}>↻ Refresh</button>
          </div>
        </div>
      )}

      {tab === "sim" && (
        <div>
          <Card style={{ padding: "18px", marginBottom: 16 }}>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>🎮</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700, color: ac }}>SIMULATE A GAME</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Performance earns points to upgrade your player</div>
            </div>
            <button onClick={simulateGame} disabled={saving} style={{ width: "100%", padding: "12px", borderRadius: 10, background: `linear-gradient(135deg, ${ac}, ${ac}99)`, border: "none", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 900, color: "#fff" }}>
              {saving ? "Playing..." : "▶ SIMULATE GAME"}
            </button>
          </Card>

          {gameResult && (
            <Card style={{ padding: "16px" }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: ac, marginBottom: 10 }}>📋 GAME RECAP</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
                {[["AB", gameResult.gameStats.AB], ["H", gameResult.gameStats.H], ["HR", gameResult.gameStats.HR], ["RBI", gameResult.gameStats.RBI]].map(([l, v]) => (
                  <div key={l} style={{ textAlign: "center", padding: "8px", background: "rgba(255,255,255,.04)", borderRadius: 8 }}>
                    <div style={{ fontSize: 9, color: "#475569" }}>{l}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: ac }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "#E2E8F0", marginBottom: 8 }}>.AVG: {gameResult.gameStats.AVG} · OPS: {gameResult.gameStats.OPS}</div>
              <div style={{ fontSize: 12, color: "#F59E0B", marginBottom: 8 }}>⭐ +{gameResult.pointsEarned} points earned</div>
              <div style={{ fontSize: 10, color: "#64748B", maxHeight: 120, overflowY: "auto", borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 8 }}>
                {gameResult.playLog.map((line, i) => <div key={i}>{line}</div>)}
              </div>
              {gameResult.promotion && <div style={{ marginTop: 10, padding: "8px", background: "rgba(245,158,11,.15)", borderRadius: 8, color: "#F59E0B", fontFamily: "'Orbitron', sans-serif", fontWeight: 700, textAlign: "center" }}>{gameResult.promotion}</div>}
            </Card>
          )}
        </div>
      )}

      {tab === "upgrade" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#F59E0B" }}>⭐ Available Points: {player.points}</div>
            <div style={{ fontSize: 10, color: "#334155" }}>Each +1 costs 5 points</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ATTRS.map(attr => (
              <div key={attr.id} style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{attr.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>{attr.label}</div>
                    <div style={{ fontSize: 9, color: "#475569" }}>{attr.desc}</div>
                  </div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: ac }}>{player.attributes[attr.id]}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => updateAttribute(attr.id, -1)} disabled={player.attributes[attr.id] <= attr.min} style={{ padding: "4px 12px", borderRadius: 8, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#EF4444", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700 }}>-1</button>
                  <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.1)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${((player.attributes[attr.id] - attr.min) / (attr.max - attr.min)) * 100}%`, height: "100%", background: ac }} />
                  </div>
                  <button onClick={() => updateAttribute(attr.id, 1)} disabled={player.attributes[attr.id] >= attr.max || player.points < 5} style={{ padding: "4px 12px", borderRadius: 8, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.3)", color: "#22C55E", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700 }}>+1</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "12px", background: "rgba(0,212,255,.05)", borderRadius: 10, border: "1px solid rgba(0,212,255,.15)", fontSize: 11, color: "#64748B", textAlign: "center" }}>
            💡 Play games to earn points. Higher OVR unlocks promotion to higher levels.
          </div>
        </div>
      )}

      {tab === "stats" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#94A3B8" }}>SEASON {new Date().getFullYear()}</div>
            <button onClick={resetSeason} style={{ padding: "4px 12px", borderRadius: 8, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", color: "#EF4444", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", fontSize: 9 }}>Reset Season</button>
          </div>
          {/* Season stats */}
          <Card style={{ padding: "14px", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: ac, marginBottom: 8 }}>📊 SEASON STATS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
              {[["G", player.stats.season.G], ["AB", player.stats.season.AB], ["H", player.stats.season.H], ["HR", player.stats.season.HR]].map(([l, v]) => (
                <div key={l} style={{ textAlign: "center", padding: "6px", background: "rgba(255,255,255,.04)", borderRadius: 8 }}>
                  <div style={{ fontSize: 8, color: "#475569" }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {[["RBI", player.stats.season.RBI], ["BB", player.stats.season.BB], ["K", player.stats.season.K], ["SB", player.stats.season.SB]].map(([l, v]) => (
                <div key={l} style={{ textAlign: "center", padding: "6px", background: "rgba(255,255,255,.04)", borderRadius: 8 }}>
                  <div style={{ fontSize: 8, color: "#475569" }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, textAlign: "center", fontSize: 12, color: ac, fontFamily: "'Orbitron', sans-serif" }}>
              AVG: {player.stats.season.AVG} · OPS: {player.stats.season.OPS}
            </div>
          </Card>

          {/* Career stats */}
          <Card style={{ padding: "14px", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: "#A855F7", marginBottom: 8 }}>🏆 CAREER STATS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {[["G", player.stats.career.G], ["HR", player.stats.career.HR], ["RBI", player.stats.career.RBI], ["SB", player.stats.career.SB]].map(([l, v]) => (
                <div key={l} style={{ textAlign: "center", padding: "6px", background: "rgba(255,255,255,.04)", borderRadius: 8 }}>
                  <div style={{ fontSize: 8, color: "#475569" }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#A855F7" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, textAlign: "center", fontSize: 12, color: "#A855F7", fontFamily: "'Orbitron', sans-serif" }}>
              AVG: {player.stats.career.AVG} · OPS: {player.stats.career.OPS}
            </div>
          </Card>

          {/* Recent game logs */}
          {gameLog.length > 0 && (
            <Card style={{ padding: "14px" }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: "#334155", marginBottom: 8 }}>📜 RECENT GAMES</div>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {gameLog.map((log, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.04)", fontSize: 10 }}>
                    <span style={{ color: "#64748B" }}>{new Date(log.date).toLocaleDateString()}</span>
                    <span style={{ color: ac }}>{log.stats.AB}-{log.stats.H} · {log.stats.HR}HR · +{log.points}pts</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}