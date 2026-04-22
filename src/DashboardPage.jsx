// ─── DashLeagueMembers (with delete + Roblox avatar fix) ─────────────────────
export function DashLeagueMembers({ league, accentColor, users, isBaseball, sport = "" }) {
  const mob = useIsMobile();
  const [players, setPlayers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [sel, setSel] = useState(null);
  const [statField, setStatField] = useState(() => sport === "basketball" ? "scoring_stats" : isBaseball ? "hitting_stats" : "passing_stats");
  const [statData, setStatData] = useState({});
  const [saving, setSaving] = useState(false);
  const [statType, setStatType] = useState("season");
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPos, setAddPos] = useState([]);
  const [addTeam, setAddTeam] = useState("");
  const [addJersey, setAddJersey] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [leagueTeams, setLeagueTeams] = useState([]);
  const [robloxAvatarUrl, setRobloxAvatarUrl] = useState("");
  const [loadingRoblox, setLoadingRoblox] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const baseballPos = ["P","C","1B","2B","3B","SS","LF","CF","RF","DH","SP","RP"];
  const footballPos = ["QB","RB","WR","TE","K","DEF","OL","DL","LB","CB","S"];
  const basketballPos = ["Top","Corner"];
  const positions = sport === "basketball" ? basketballPos : isBaseball ? baseballPos : footballPos;

  const NBBL_FIELDS = [
    ["hitting_stats","⚾ Hitting",["G","AB","R","H","2B","3B","HR","RBI","BB","SO","SB","AVG","OBP","SLG","OPS"]],
    ["pitching_stats","⚾ Pitching",["G","GS","W","L","SV","IP","H","R","ER","BB","SO","ERA","WHIP","K9","BB9"]],
    ["fielding_stats","🧤 Fielding",["G","GS","PO","A","E","DP","FLD%","INN"]],
  ];
  const NFL_FIELDS = [
    ["passing_stats","🎯 Passing",["G","CMP","ATT","YDS","TD","INT","RTG"]],
    ["rushing_stats","🏃 Rushing",["G","CAR","YDS","TD","AVG","LONG"]],
    ["receiving_stats","📡 Receiving",["G","REC","YDS","TD","AVG","LONG"]],
    ["defensive_stats","🛡 Defense",["G","TCK","SACK","INT","FF","PD"]],
    ["kicking_stats","⚽ Kicking",["G","FGM","FGA","FG%","XPM","XPA","LONG"]],
  ];
  const NBA_FIELDS = [
    ["scoring_stats","🏀 Scoring",["G","MIN","PTS","FGM","FGA","FG%","3PM","3PA","3P%","FTM","FTA","FT%"]],
    ["rebounds_stats","💪 Rebounds",["G","OREB","DREB","REB","REB/G"]],
    ["playmaking_stats","🎯 Playmaking",["G","AST","TOV","AST/G","AST/TOV"]],
    ["defense_stats","🛡 Defense",["G","STL","BLK","PF","STL/G","BLK/G"]],
  ];
  const FIELDS = (sport || "") === "basketball" ? NBA_FIELDS : isBaseball ? NBBL_FIELDS : NFL_FIELDS;

  useEffect(() => {
    if (loaded) return;
    Promise.all([
      sb.get(`nova_${league}_players`, "?order=name.asc"),
      sb.get(`nova_${league}_teams`, "?order=name.asc"),
    ]).then(([p, t]) => { setPlayers(p || []); setLeagueTeams(t || []); setLoaded(true); });
  }, []);

  // Fetch Roblox avatar when selPlayer changes
  useEffect(() => {
    const selPlayer = players.find(p => p.id === sel);
    if (selPlayer && selPlayer.roblox_id) {
      setLoadingRoblox(true);
      fetchRobloxAvatarUrl(selPlayer.roblox_id).then(url => {
        setRobloxAvatarUrl(url || "");
        setLoadingRoblox(false);
      }).catch(() => setLoadingRoblox(false));
    } else {
      setRobloxAvatarUrl("");
    }
  }, [sel, players]);

  const addPlayer = async () => {
    if (!addName.trim() || !addPos.length) return;
    setAddSaving(true);
    const p = { id: gid(), name: addName.trim(), position: Array.isArray(addPos) ? addPos.join("/") : addPos, team: addTeam.trim(), jersey: addJersey.trim(), ts: Date.now() };
    await sb.post(`nova_${league}_players`, p);
    setPlayers(prev => [...prev, p]);
    setAddName(""); setAddPos([]); setAddTeam(""); setAddJersey("");
    setShowAdd(false); setAddSaving(false);
  };

  const deletePlayer = async (playerId) => {
    if (!confirm("Delete this member page permanently? This cannot be undone.")) return;
    setDeleting(playerId);
    await sb.del(`nova_${league}_players`, `?id=eq.${playerId}`);
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    if (sel === playerId) setSel(null);
    setDeleting(null);
  };

  const matchMember = (nameOrPlayer) => {
    if (!nameOrPlayer) return null;
    const name = typeof nameOrPlayer === "object" ? (nameOrPlayer.name || "") : nameOrPlayer;
    if (!name) return null;
    const n = name.toLowerCase();
    return users.find(u => (u.display_name || "").toLowerCase().includes(n) || n.includes((u.display_name || "").toLowerCase()) || (u.username || "").toLowerCase() === n) || null;
  };

  const selPlayer = sel ? players.find(p => p.id === sel) : null;
  const linkedMember = selPlayer ? (selPlayer.nova_user_id ? users.find(u => u.id === selPlayer.nova_user_id) : matchMember(selPlayer.name)) : null;
  const fullStatField = statType === "season" ? statField + "_season" : statField;

  const saveStats = async () => {
    if (!selPlayer) return;
    setSaving(true);
    await sb.patch(`nova_${league}_players`, `?id=eq.${selPlayer.id}`, { [fullStatField]: statData });
    setPlayers(p => p.map(x => x.id === selPlayer.id ? { ...x, [fullStatField]: statData } : x));
    setSaving(false);
    alert(`${statType === "season" ? "Season" : "Career"} stats saved!`);
  };

  const patchPlayer = async (patch) => {
    await sb.patch(`nova_${league}_players`, `?id=eq.${selPlayer.id}`, patch);
    setPlayers(p => p.map(x => x.id === selPlayer.id ? { ...x, ...patch } : x));
    if (patch.roblox_id !== undefined) {
      if (patch.roblox_id) {
        setLoadingRoblox(true);
        fetchRobloxAvatarUrl(patch.roblox_id).then(url => {
          setRobloxAvatarUrl(url || "");
          setLoadingRoblox(false);
        });
      } else {
        setRobloxAvatarUrl("");
      }
    }
  };

  if (sel && selPlayer) {
    const cols = FIELDS.find(([k]) => k === statField)?.[2] || [];
    const statRows = [
      { label: "Season Stats", value: statType === "season" ? "Live" : "Career" },
      { label: "Team", value: selPlayer.team || "Free Agent" },
      { label: "Position", value: selPlayer.position || "—" },
      { label: "Jersey", value: selPlayer.jersey ? `#${selPlayer.jersey}` : "—" },
    ];
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => setSel(null)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 12, fontFamily: "'Orbitron',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>← ALL PLAYERS</button>
          <button onClick={() => deletePlayer(selPlayer.id)} style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#EF4444", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontFamily: "'Orbitron',sans-serif", fontWeight: 700, cursor: "pointer" }}>🗑 Delete Member Page</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "minmax(0, 1.08fr) minmax(0, .92fr)", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card style={{ padding: 0, overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,.08)" }} hover={false}>
              <div style={{ height: 120, background: `radial-gradient(circle at top left,${accentColor}55,transparent 45%),linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.01))` }} />
              <div style={{ padding: "0 18px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginTop: -38, flexWrap: "wrap" }}>
                  <div style={{ position: "relative", width: 92, height: 92, borderRadius: 22, overflow: "hidden", background: "#0F172A", border: `3px solid ${accentColor}`, boxShadow: `0 14px 40px ${accentColor}33`, flexShrink: 0 }}>
                    {loadingRoblox ? (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1E293B" }}>
                        <span style={{ fontSize: 24 }}>⏳</span>
                      </div>
                    ) : robloxAvatarUrl ? (
                      <img src={robloxAvatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="roblox avatar" onError={(e) => { e.target.style.display = "none"; e.target.parentElement.innerHTML = "<span style='font-size:32px'>🌌</span>"; }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, background: "linear-gradient(135deg, #00D4FF22, #A855F722)" }}>
                        <span>🌌</span>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
                    <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: mob ? 18 : 24, fontWeight: 900, color: "#E2E8F0", lineHeight: 1.05, overflow: "hidden", textOverflow: "ellipsis" }}>{selPlayer.name}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, alignItems: "center" }}>
                      {selPlayer.position && <span style={{ padding: "4px 10px", borderRadius: 999, background: `${accentColor}18`, border: `1px solid ${accentColor}33`, color: accentColor, fontSize: 10, fontFamily: "'Orbitron',sans-serif", fontWeight: 800 }}>{selPlayer.position}</span>}
                      {selPlayer.team && <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "#CBD5E1", fontSize: 10, fontFamily: "'Orbitron',sans-serif", fontWeight: 700 }}>{selPlayer.team}</span>}
                      {selPlayer.jersey && <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "#94A3B8", fontSize: 10, fontFamily: "'Orbitron',sans-serif", fontWeight: 700 }}>#{selPlayer.jersey}</span>}
                      {selPlayer.ovr && <OVRBig ovr={selPlayer.ovr} size={30} />}
                    </div>
                    {linkedMember && <div style={{ marginTop: 8, fontSize: 11, color: "#64748B" }}>@{linkedMember.username}{linkedMember.staff_role && <span style={{ marginLeft: 8, color: ROLE_COLOR[linkedMember.staff_role] || "#00D4FF" }}>{linkedMember.staff_role}</span>}</div>}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8, marginTop: 16 }}>
                  {statRows.map((row, i) => (
                    <div key={i} style={{ padding: "10px 12px", borderRadius: 14, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" }}>
                      <div style={{ fontSize: 9, fontFamily: "'Orbitron',sans-serif", letterSpacing: ".08em", color: "#64748B" }}>{row.label.toUpperCase()}</div>
                      <div style={{ marginTop: 4, fontSize: 13, fontWeight: 800, color: "#E2E8F0" }}>{row.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                  {linkedMember && <Btn variant="ghost" size="sm" onClick={() => navigate("profile", linkedMember.id)}>👤 View Nova Profile</Btn>}
                  {selPlayer.roblox_id && <a href={`https://www.roblox.com/users/${selPlayer.roblox_id}/profile`} target="_blank" rel="noopener noreferrer"><Btn variant="ghost" size="sm">🎮 Roblox Profile</Btn></a>}
                </div>
              </div>
            </Card>

            <Card style={{ padding: "16px" }} hover={false}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 9, color: "#334155", letterSpacing: ".1em", marginBottom: 10 }}>LINKS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                <div>
                  <Lbl>Roblox ID</Lbl>
                  <input
                    defaultValue={selPlayer.roblox_id || ""}
                    placeholder="Enter Roblox user ID…"
                    onBlur={e => {
                      const val = e.target.value.trim();
                      patchPlayer({ roblox_id: val || null });
                    }}
                  />
                  {loadingRoblox && <div style={{ fontSize: 10, color: "#F59E0B", marginTop: 4 }}>Loading Roblox avatar...</div>}
                </div>
                <div>
                  <Lbl>Nova Account</Lbl>
                  <select value={selPlayer.nova_user_id || ""} onChange={e => patchPlayer({ nova_user_id: e.target.value || null })} style={{ width: "100%" }}>
                    <option value="">{linkedMember ? "Change linked account…" : "Search Nova member…"}</option>
                    {[...users].sort((a, b) => (a.display_name || "").localeCompare(b.display_name || "")).map(u => <option key={u.id} value={u.id}>{u.display_name} (@{u.username})</option>)}
                  </select>
                </div>
                <div>
                  <Lbl>Walk-up Song</Lbl>
                  <input defaultValue={selPlayer.spotify_url || ""} placeholder="Paste Spotify track or playlist URL…" onBlur={e => patchPlayer({ spotify_url: e.target.value.trim() || null })} />
                </div>
                {selPlayer.spotify_url && (() => {
                  const match = selPlayer.spotify_url.match(/spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
                  if (match) {
                    const embedUrl = `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
                    return <iframe src={embedUrl} width="100%" height="96" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{ borderRadius: 10, border: "none" }} />;
                  }
                  return null;
                })()}
              </div>
            </Card>
          </div>

          <Card style={{ padding: "16px", border: "1px solid rgba(255,255,255,.08)" }} hover={false}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 9, color: "#334155", letterSpacing: ".1em" }}>PLAYER STATS</div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>Modern stat editor + quick profile view</div>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {[["season", "📅 Season"], ["career", "🏆 Career"]].map(([t, l]) => (
                  <button key={t} onClick={() => { setStatType(t); const ff = t === "season" ? statField + "_season" : statField; setStatData(selPlayer?.[ff] || {}); }}
                    style={{ padding: "5px 12px", borderRadius: 10, cursor: "pointer", fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 700, border: `1px solid ${statType === t ? accentColor + "66" : "rgba(255,255,255,.08)"}`, background: statType === t ? accentColor + "18" : "rgba(255,255,255,.03)", color: statType === t ? accentColor : "#475569" }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
              {FIELDS.map(([k, l]) => (
                <button key={k} onClick={() => { setStatField(k); const ff = statType === "season" ? k + "_season" : k; setStatData(selPlayer?.[ff] || {}); }}
                  style={{ padding: "4px 10px", borderRadius: 10, cursor: "pointer", fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 700, border: `1px solid ${statField === k ? accentColor + "88" : "rgba(255,255,255,.1)"}`, background: statField === k ? accentColor + "18" : "rgba(255,255,255,.03)", color: statField === k ? accentColor : "#64748B" }}>{l}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(92px,1fr))", gap: 8, marginBottom: 12 }}>
              {cols.map(c => (
                <div key={c} style={{ padding: "10px", borderRadius: 12, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" }}>
                  <Lbl>{c}</Lbl>
                  <input value={statData[c] || ""} onChange={e => setStatData(p => ({ ...p, [c]: e.target.value }))} placeholder="—" style={{ textAlign: "center" }} />
                </div>
              ))}
            </div>
            <Btn onClick={saveStats} disabled={saving}>{saving ? "Saving…" : "💾 Save Stats"}</Btn>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, color: "#94A3B8", fontWeight: 700 }}>👤 MEMBER PAGES ({players.length})</div>
        <button onClick={() => setShowAdd(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20, background: showAdd ? accentColor + "22" : "rgba(255,255,255,.05)", border: `1px solid ${showAdd ? accentColor + "55" : "rgba(255,255,255,.1)"}`, color: showAdd ? accentColor : "#E2E8F0", fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}>
          {showAdd ? "✕ Cancel" : "➕ Create Member Page"}
        </button>
      </div>
      {showAdd && (
        <Card style={{ padding: "16px", marginBottom: 14 }} hover={false}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, color: accentColor, marginBottom: 12, fontWeight: 700 }}>CREATE MEMBER PAGE</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div style={{ gridColumn: "1/-1" }}><Lbl>Player Name</Lbl><input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Full name…" /></div>
            <div style={{ gridColumn: "1/-1" }}>
              <Lbl>Position(s) — select all that apply</Lbl>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
                {positions.map(pos => {
                  const selected = addPos.includes(pos);
                  return (
                    <button key={pos} type="button" onClick={() => setAddPos(prev => selected ? prev.filter(x => x !== pos) : [...prev, pos])}
                      style={{ padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 700, border: `1px solid ${selected ? accentColor + "88" : "rgba(255,255,255,.1)"}`, background: selected ? accentColor + "22" : "rgba(255,255,255,.03)", color: selected ? accentColor : "#64748B", transition: "all .15s" }}>
                      {pos}
                    </button>
                  );
                })}
              </div>
              {addPos.length > 0 && <div style={{ fontSize: 9, color: accentColor, marginTop: 5, fontFamily: "'Orbitron',sans-serif" }}>Selected: {addPos.join(" / ")}</div>}
            </div>
            <div>
              <Lbl>Team</Lbl>
              {leagueTeams.length > 0
                ? <select value={addTeam} onChange={e => setAddTeam(e.target.value)} style={{ width: "100%" }}>
                    <option value="">— Free Agent —</option>
                    {leagueTeams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                : <input value={addTeam} onChange={e => setAddTeam(e.target.value)} placeholder="Team name…" />}
            </div>
            <div><Lbl>Jersey #</Lbl><input value={addJersey} onChange={e => setAddJersey(e.target.value)} placeholder="#" /></div>
          </div>
          <Btn onClick={addPlayer} disabled={addSaving || !addName.trim() || !addPos.length}>{addSaving ? "Creating…" : "✅ Create Page"}</Btn>
        </Card>
      )}
      {!players.length && !showAdd && <Empty icon={sport === "basketball" ? "🏀" : isBaseball ? "⚾" : "🏈"} msg="No member pages yet — click Create Member Page above" />}
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : isBaseball ? "1fr 1fr" : "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
        {players.filter(Boolean).map((p, i) => {
          const m = p.nova_user_id ? users.find(u => u.id === p.nova_user_id) : matchMember(p.name);
          const sKey = sport === "basketball" ? "scoring_stats_season" : isBaseball ? "hitting_stats_season" : "passing_stats_season";
          const sData = p[sKey] || {};
          const statPills = sport === "basketball"
            ? [["PTS", sData.PTS], ["REB", sData.REB], ["AST", sData.AST]]
            : isBaseball
              ? [["AVG", sData.AVG], ["HR", sData.HR], ["RBI", sData.RBI]]
              : [["YDS", sData.YDS], ["TD", sData.TD], ["RTG", sData.RTG]];
          const hasStats = statPills.some(([, v]) => v !== undefined && v !== "");
          const ovrC = ovrColor(p.ovr);
          return (
            <div key={i} style={{ borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,.03)", border: `1px solid ${accentColor}22`, transition: "all .2s", position: "relative" }}>
              <div onClick={() => { const f = sport === "basketball" ? "scoring_stats" : isBaseball ? "hitting_stats" : "passing_stats"; setSel(p.id); setStatField(f); setStatType("season"); setStatData(p[f + "_season"] || {}); }}
                style={{ cursor: "pointer", padding: "14px 16px" }}
                onMouseEnter={e => { e.currentTarget.parentElement.style.borderColor = `${accentColor}55`; e.currentTarget.parentElement.style.background = `linear-gradient(135deg,${accentColor}0d,rgba(255,255,255,.04))`; e.currentTarget.parentElement.style.transform = "translateY(-2px)"; e.currentTarget.parentElement.style.boxShadow = `0 8px 28px ${accentColor}20`; }}
                onMouseLeave={e => { e.currentTarget.parentElement.style.borderColor = `${accentColor}22`; e.currentTarget.parentElement.style.background = "rgba(255,255,255,.03)"; e.currentTarget.parentElement.style.transform = ""; e.currentTarget.parentElement.style.boxShadow = ""; }}>
                <div style={{ height: 3, background: `linear-gradient(90deg,${accentColor},${accentColor}44,transparent)`, marginBottom: 8 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, overflow: "hidden", background: `linear-gradient(135deg,${accentColor}22,rgba(255,255,255,.06))`, border: `2px solid ${accentColor}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 22 }}>{sport === "basketball" ? "🏀" : isBaseball ? "⚾" : "🏈"}</span>
                    </div>
                    {p.ovr && <div style={{ position: "absolute", bottom: -4, right: -4, padding: "2px 6px", borderRadius: 6, background: ovrC, fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 900, color: "#030712", boxShadow: `0 2px 8px ${ovrC}88` }}>{p.ovr}</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 900, color: "#E2E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: ".02em" }}>{p.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, color: accentColor, fontWeight: 700, fontFamily: "'Orbitron',sans-serif" }}>{p.position}</span>
                      {p.jersey && <span style={{ fontSize: 10, color: "#475569" }}>#{p.jersey}</span>}
                      {p.team && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 20, background: `${accentColor}18`, border: `1px solid ${accentColor}33`, color: accentColor, fontFamily: "'Orbitron',sans-serif", fontWeight: 700 }}>{p.team}</span>}
                    </div>
                    {m && <div style={{ fontSize: 9, color: "#334155", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}><span style={{ opacity: .6 }}>@{m.username}</span>{m.staff_role && <span style={{ color: ROLE_COLOR[m.staff_role] || "#00D4FF", fontSize: 8, fontFamily: "'Orbitron',sans-serif" }}>{m.staff_role}</span>}</div>}
                  </div>
                  <span style={{ color: "#334155", fontSize: 16, flexShrink: 0 }}>›</span>
                </div>
                {hasStats && (
                  <div style={{ display: "flex", gap: 6, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${accentColor}18` }}>
                    {statPills.map(([label, val]) => val !== undefined && val !== "" ? (
                      <div key={label} style={{ flex: 1, textAlign: "center", padding: "5px 0", borderRadius: 8, background: `${accentColor}12`, border: `1px solid ${accentColor}20` }}>
                        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 900, color: "#E2E8F0" }}>{val}</div>
                        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 8, color: accentColor, letterSpacing: ".06em" }}>{label}</div>
                      </div>
                    ) : null)}
                  </div>
                )}
              </div>
              <div style={{ position: "absolute", top: 8, right: 8, zIndex: 5 }}>
                <button onClick={(e) => { e.stopPropagation(); deletePlayer(p.id); }} disabled={deleting === p.id}
                  style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", border: "1px solid rgba(239,68,68,0.5)", color: "#EF4444", width: 28, height: 28, borderRadius: 20, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", opacity: deleting === p.id ? 0.5 : 1 }}>
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}