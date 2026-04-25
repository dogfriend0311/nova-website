import React, { useState, useEffect } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, SUPABASE_URL, SUPABASE_ANON_KEY, ROLE_COLOR, STATUS_META, SOCIAL_ICONS, SOCIAL_COLORS, SOCIAL_LABELS, MLB_TEAMS, NFL_TEAMS, NHL_TEAMS, ALL_BADGES, BADGES, CSS, STATCAST_PLAYERS, STATCAST_TENDENCIES, H, sbUp } from "./shared";
import { Btn, Card, Modal, Lbl, Sec, Empty, XBtn, StatusDot, Av, AvatarCircle, RoleBadge, BannerUploadBtn, BannerBtn, CommentImgUpload, playerHeadshotUrl, TeamLogo, TeamBadge, TeamPicker, SocialLinks, LikeBtn, ClipCarousel, Starfield, NotifBell, FLModal, ovrColor, OVRBig } from "./UI";

// ─── Roblox Avatar Helper (official API) ─────────────────────────────────────
async function fetchRobloxAvatarUrl(userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`);
    const data = await res.json();
    if (data.data && data.data[0] && data.data[0].imageUrl) {
      return data.data[0].imageUrl;
    }
    return null;
  } catch (err) {
    console.error("Roblox avatar fetch error:", err);
    return null;
  }
}

export default function MembersPage({ users, nav }) {
  const mob = useIsMobile();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [hoveredId, setHoveredId] = useState(null);
  const [robloxAvatars, setRobloxAvatars] = useState({});
  const [loadingAvatars, setLoadingAvatars] = useState({});

  // Load Roblox avatars for users who have social_roblox
  useEffect(() => {
    users.forEach(async (user) => {
      const robloxId = user.social_roblox;
      if (robloxId && !robloxAvatars[user.id] && !loadingAvatars[user.id]) {
        setLoadingAvatars(prev => ({ ...prev, [user.id]: true }));
        const url = await fetchRobloxAvatarUrl(robloxId);
        if (url) {
          setRobloxAvatars(prev => ({ ...prev, [user.id]: url }));
        }
        setLoadingAvatars(prev => ({ ...prev, [user.id]: false }));
      }
    });
  }, [users]);

  const filtered = users.filter(u => {
    const matchesSearch = (u.display_name || "").toLowerCase().includes(q.toLowerCase()) ||
                          (u.username || "").toLowerCase().includes(q.toLowerCase());
    if (filter === "online") return matchesSearch && u.status_type === "online";
    if (filter === "staff") return matchesSearch && u.staff_role;
    return matchesSearch;
  });

  const onlineCount = users.filter(u => u.status_type === "online").length;
  const staffCount = users.filter(u => u.staff_role).length;

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "radial-gradient(circle at 10% 20%, #0B0F19, #030712)", overflow: "hidden" }}>
      {/* Animated background elements */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: "60vmax", height: "60vmax", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, rgba(0,0,0,0) 70%)", top: "-20%", left: "-20%", animation: "pulse 12s infinite" }} />
        <div style={{ position: "absolute", width: "50vmax", height: "50vmax", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, rgba(0,0,0,0) 70%)", bottom: "-10%", right: "-10%", animation: "pulse 15s infinite reverse" }} />
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 0.4; }
          }
          .member-card {
            backdrop-filter: blur(12px);
            transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          }
          .member-card:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 20px 35px -12px rgba(0,212,255,0.25);
            border-color: rgba(0,212,255,0.5);
          }
        `}</style>
      </div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", padding: "44px 20px 100px" }}>
        {/* Hero header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-block", background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(168,85,247,0.2))", padding: "4px 16px", borderRadius: 40, marginBottom: 16, backdropFilter: "blur(4px)" }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #00D4FF, #A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>✦ THE COLLECTIVE ✦</span>
          </div>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: mob ? 28 : 42, fontWeight: 800, margin: "0 0 12px", background: "linear-gradient(135deg, #FFFFFF, #00D4FF, #A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.02em" }}>
            Galactic Members
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 15, maxWidth: 500, margin: "0 auto 24px" }}>
            {users.length} legends • {onlineCount} online now • {staffCount} staff
          </p>

          {/* Search & filters */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: "100%", maxWidth: 380 }}>
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search by name or @handle..."
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: 60,
                  background: "rgba(15, 23, 42, 0.7)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(0,212,255,0.3)",
                  color: "#F1F5F9",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.2s",
                  fontFamily: "'Rajdhani', sans-serif"
                }}
                onFocus={e => e.target.style.borderColor = "#00D4FF"}
                onBlur={e => e.target.style.borderColor = "rgba(0,212,255,0.3)"}
              />
              <span style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", color: "#475569" }}>🔍</span>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { key: "all", label: "All", icon: "🌌" },
                { key: "online", label: "Online", icon: "🟢", color: "#22C55E" },
                { key: "staff", label: "Staff", icon: "⚡", color: "#F59E0B" }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 40,
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "'Orbitron', sans-serif",
                    fontWeight: 600,
                    border: `1px solid ${filter === f.key ? (f.color || "#00D4FF") + "80" : "rgba(255,255,255,0.1)"}`,
                    background: filter === f.key ? `radial-gradient(circle at 30% 10%, ${f.color || "#00D4FF"}20, rgba(0,0,0,0.4))` : "rgba(255,255,255,0.02)",
                    color: filter === f.key ? (f.color || "#00D4FF") : "#94A3B8",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Members grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: mob ? "repeat(auto-fill, minmax(160px, 1fr))" : "repeat(auto-fill, minmax(260px, 1fr))",
          gap: mob ? 16 : 24
        }}>
          {filtered.map(user => {
            const avatarUrl = robloxAvatars[user.id];
            const isLoadingAvatar = loadingAvatars[user.id];
            const fallbackEmoji = user.avatar || "👤";
            const isHovered = hoveredId === user.id;

            return (
              <div
                key={user.id}
                className="member-card"
                onClick={() => nav("profile", user.id)}
                onMouseEnter={() => setHoveredId(user.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: "linear-gradient(145deg, rgba(18, 25, 45, 0.7), rgba(8, 12, 24, 0.8))",
                  backdropFilter: "blur(12px)",
                  borderRadius: 28,
                  border: "1px solid rgba(0,212,255,0.2)",
                  padding: mob ? 16 : 20,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Animated gradient overlay on hover */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at 50% 0%, rgba(0,212,255,0.15), transparent 70%)",
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 0.3s",
                  pointerEvents: "none"
                }} />

                {/* Avatar area with status ring */}
                <div style={{ position: "relative", width: mob ? 70 : 90, height: mob ? 70 : 90, margin: "0 auto 14px" }}>
                  <div style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 30% 30%, ${user.page_accent || "#00D4FF"}44, rgba(0,0,0,0.6))`,
                    border: `2px solid ${isHovered ? (user.page_accent || "#00D4FF") : (user.page_accent || "#00D4FF") + "80"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    transition: "border 0.2s",
                    boxShadow: isHovered ? `0 0 20px ${user.page_accent || "#00D4FF"}80` : "none"
                  }}>
                    {isLoadingAvatar ? (
                      <span style={{ fontSize: mob ? 28 : 36 }}>⏳</span>
                    ) : avatarUrl ? (
                      <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" />
                    ) : (
                      <span style={{ fontSize: mob ? 32 : 44 }}>{fallbackEmoji}</span>
                    )}
                  </div>
                  <StatusDot
                    type={user.status_type || "offline"}
                    size={mob ? 14 : 16}
                    style={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      border: "2px solid #0B0F19",
                      borderRadius: "50%"
                    }}
                  />
                </div>

                {/* User info */}
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: mob ? 14 : 16,
                    fontWeight: 800,
                    color: "#F8FAFC",
                    marginBottom: 4,
                    letterSpacing: "-0.3px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {user.display_name}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8, fontFamily: "'Rajdhani', sans-serif" }}>
                    @{user.username}
                  </div>

                  {/* Staff role badge */}
                  {user.staff_role && (
                    <div style={{ marginBottom: 12 }}>
                      <RoleBadge
                        color={ROLE_COLOR[user.staff_role] || "#00D4FF"}
                        style={{
                          boxShadow: `0 0 8px ${ROLE_COLOR[user.staff_role] || "#00D4FF"}80`,
                          fontSize: 10,
                          padding: "4px 12px"
                        }}
                      >
                        {user.staff_role}
                      </RoleBadge>
                    </div>
                  )}

                  {/* Team badges */}
                  {(user.mlb_team || user.nfl_team || user.nba_team || user.nhl_team) && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 }}>
                      {user.mlb_team && <TeamBadge teamId={user.mlb_team} size={20} />}
                      {user.nfl_team && <TeamBadge teamId={user.nfl_team} size={20} />}
                      {user.nba_team && <TeamBadge teamId={user.nba_team} size={20} />}
                      {user.nhl_team && <TeamBadge teamId={user.nhl_team} size={20} />}
                    </div>
                  )}

                  {/* Stats row */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    fontSize: 12,
                    color: "#475569",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: 12,
                    marginTop: 8
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span>❤️</span> {(user.followers || []).length}
                    </span>
                    <span>•</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span>🏅</span> {(user.badges || []).length}
                    </span>
                  </div>
                </div>

                {/* Quick action on hover */}
                {isHovered && (
                  <div style={{
                    position: "absolute",
                    bottom: 16,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    fontSize: 11,
                    color: "#00D4FF",
                    fontFamily: "'Orbitron', sans-serif",
                    fontWeight: 500,
                    letterSpacing: "1px",
                    opacity: 0.8
                  }}>
                    VIEW PROFILE →
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <Empty
            icon="👽"
            msg="No members found"
            style={{ marginTop: 60, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", borderRadius: 32 }}
          />
        )}
      </div>
    </div>
  );
}