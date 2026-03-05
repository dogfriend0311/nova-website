import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
// Replace these two lines with your actual credentials from supabase.com
const SB_URL  = "https://expzaiduzjehvyfclnnj.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cHphaWR1emplaHZ5ZmNsbm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTUwNTQsImV4cCI6MjA4ODI3MTA1NH0.ZZrWRASkBWha6XDuw23bazoXK224diM0HTlgPkdLCy0";
const sb = SB_URL.startsWith("https") ? createClient(SB_URL, SB_ANON) : null;

// ─── DB HELPERS ───────────────────────────────────────────────────────────────
const dbToUser = r => ({
  id: r.id, username: r.username, password: r.password,
  displayName: r.display_name || r.username, avatar: r.avatar || "🌟",
  bio: r.bio || "", isOwner: r.is_owner || false, staffRole: r.staff_role || null,
  joined: r.joined || "Unknown", followers: r.followers || [], following: r.following || [],
  badges: r.badges || [], comments: [],
  status: { type: r.status_type || "offline", activity: r.status_activity || "" },
  page: { music: r.music || [], clips: r.clips || [], social: r.social || [], accent: r.accent || "#00D4FF" }
});
const userToDb = u => ({
  id: u.id, username: u.username, password: u.password,
  display_name: u.displayName, avatar: u.avatar, bio: u.bio,
  is_owner: u.isOwner || false, staff_role: u.staffRole || null, joined: u.joined,
  followers: u.followers || [], following: u.following || [], badges: u.badges || [],
  status_type: u.status?.type || "offline", status_activity: u.status?.activity || "",
  music: u.page?.music || [], clips: u.page?.clips || [], social: u.page?.social || [], accent: u.page?.accent || "#00D4FF"
});
const DB = {
  async loadUsers() {
    if (!sb) return [];
    const { data, error } = await sb.from("profiles").select("*");
    if (error) { console.error("loadUsers:", error); return []; }
    return (data || []).map(dbToUser);
  },
  async upsertUser(u) {
    if (!sb) return;
    const { error } = await sb.from("profiles").upsert(userToDb(u));
    if (error) console.error("upsertUser:", error);
  },
  async deleteUser(id) {
    if (!sb) return;
    await sb.from("profiles").delete().eq("id", id);
  },
  async loadComments(profileId) {
    if (!sb) return [];
    const { data, error } = await sb.from("comments").select("*").eq("profile_user_id", profileId).order("created_at", { ascending: false });
    if (error) { console.error("loadComments:", error); return []; }
    return (data || []).map(c => ({ id: c.id, authorId: c.author_id, authorName: c.author_name, authorAvatar: c.author_avatar, text: c.text, timestamp: new Date(c.created_at).getTime() }));
  },
  async addComment(c) {
    if (!sb) return;
    await sb.from("comments").insert({ id: c.id, profile_user_id: c.profileUserId, author_id: c.authorId, author_name: c.authorName, author_avatar: c.authorAvatar, text: c.text });
  },
  async deleteComment(id) {
    if (!sb) return;
    await sb.from("comments").delete().eq("id", id);
  },
  async loadNotifs(userId) {
    if (!sb) return [];
    const { data, error } = await sb.from("notifications").select("*").eq("to_user_id", userId).order("created_at", { ascending: false }).limit(50);
    if (error) { console.error("loadNotifs:", error); return []; }
    return (data || []).map(n => ({ id: n.id, fromId: n.from_user_id, msg: n.msg, ts: new Date(n.created_at).getTime(), read: n.read || false }));
  },
  async addNotif(toId, fromId, msg) {
    if (!sb) return;
    await sb.from("notifications").insert({ id: gid(), to_user_id: toId, from_user_id: fromId, msg });
  },
  async markNotifsRead(userId) {
    if (!sb) return;
    await sb.from("notifications").update({ read: true }).eq("to_user_id", userId).eq("read", false);
  },
  async clearNotifs(userId) {
    if (!sb) return;
    await sb.from("notifications").delete().eq("to_user_id", userId);
  }
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#030712;color:#E2E8F0;font-family:'Rajdhani',sans-serif;overflow-x:hidden}
  @keyframes twinkle{0%{opacity:.1;transform:scale(.7)}100%{opacity:1;transform:scale(1.4)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
  @keyframes bellShake{0%,100%{transform:rotate(0)}20%{transform:rotate(-14deg)}40%{transform:rotate(14deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(8deg)}}
  @keyframes badgePop{0%{transform:scale(0) rotate(-15deg);opacity:0}70%{transform:scale(1.15) rotate(4deg)}100%{transform:scale(1) rotate(0);opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes carouselSlide{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
  .fadeUp{animation:fadeUp .55s ease both}
  .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
  .notif-item{animation:slideIn .25s ease both}
  .badge-pop{animation:badgePop .4s cubic-bezier(.34,1.56,.64,1) both}
  .bell-shake{animation:bellShake .6s ease}
  .carousel-item{animation:carouselSlide .3s ease both}
  a{color:inherit;text-decoration:none}
  input,textarea,select{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#E2E8F0;font-family:'Rajdhani',sans-serif;font-size:15px;padding:10px 14px;outline:none;width:100%;transition:border-color .2s,box-shadow .2s}
  input:focus,textarea:focus,select:focus{border-color:#00D4FF;box-shadow:0 0 0 3px rgba(0,212,255,.1)}
  input::placeholder,textarea::placeholder{color:#475569}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#030712}::-webkit-scrollbar-thumb{background:rgba(0,212,255,.2);border-radius:4px}
  iframe{display:block}
  .comment-row:hover .del-btn{opacity:1!important}
  .carousel-arrow:hover{background:rgba(0,212,255,.25)!important;border-color:rgba(0,212,255,.45)!important}
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const gid = () => "x" + Date.now() + Math.random().toString(36).slice(2, 5);
const extractSpotify = u => { const m = u.match(/track\/([A-Za-z0-9]+)/); return m ? m[1] : null; };
const extractYouTube = u => { const m = u.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : null; };
const extractMedal   = u => { const m = u.match(/clips\/(\d+)/); return m ? m[1] : null; };
const ROLE_COLOR = { Owner: "#F59E0B", Moderator: "#00D4FF", "Event Host": "#A78BFA", Helper: "#34D399" };
const STATUS_META = {
  online:  { color: "#22C55E", label: "Online" },
  idle:    { color: "#EAB308", label: "Idle" },
  dnd:     { color: "#EF4444", label: "Do Not Disturb" },
  offline: { color: "#6B7280", label: "Offline" },
};
const ALL_BADGES = [
  { id: "og",         icon: "👑", label: "OG Member",       desc: "Been here since the start",        color: "#F59E0B" },
  { id: "nova_star",  icon: "💫", label: "Nova Star",        desc: "Exceptional community member",     color: "#00D4FF" },
  { id: "watchparty", icon: "🎬", label: "Watch Party Reg",  desc: "Never misses a movie night",       color: "#A78BFA" },
  { id: "baseball",   icon: "⚾", label: "Baseball Fan",     desc: "Die-hard sports watcher",          color: "#34D399" },
  { id: "gamer",      icon: "🎮", label: "Gaming Legend",    desc: "Dominates every game night",       color: "#F472B6" },
  { id: "music",      icon: "🎵", label: "Music Guru",       desc: "The server DJ",                    color: "#818CF8" },
  { id: "social",     icon: "🤝", label: "Social Butterfly", desc: "Talks to everyone",                color: "#2DD4BF" },
  { id: "champ",      icon: "🏆", label: "Tourney Champ",    desc: "Tournament winner",                color: "#FB923C" },
  { id: "earlybird",  icon: "🚀", label: "Early Adopter",    desc: "One of the first to join",         color: "#C084FC" },
  { id: "commfave",   icon: "🌟", label: "Community Fave",   desc: "Loved by everyone in the server",  color: "#FBBF24" },
];
const fmtTime = ts => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", size = "md", style: ext = {}, disabled }) {
  const [h, setH] = useState(false);
  const base = { display: "inline-flex", alignItems: "center", gap: 6, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'Orbitron',sans-serif", fontWeight: 700, letterSpacing: ".06em", border: "none", borderRadius: 8, transition: "all .22s ease", opacity: disabled ? .5 : 1, fontSize: size === "sm" ? 10 : size === "lg" ? 14 : 11, padding: size === "sm" ? "6px 13px" : size === "lg" ? "14px 32px" : "8px 16px" };
  const vars = {
    primary:  { background: h ? "linear-gradient(135deg,#00bfea,#7c3aed)" : "linear-gradient(135deg,#00D4FF,#8B5CF6)", color: "#fff", boxShadow: h ? "0 8px 28px rgba(0,212,255,.35)" : "none" },
    ghost:    { background: h ? "rgba(0,212,255,.1)" : "transparent", border: "1px solid rgba(0,212,255,.4)", color: "#00D4FF" },
    danger:   { background: h ? "rgba(239,68,68,.25)" : "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.35)", color: "#EF4444" },
    muted:    { background: h ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#94A3B8" },
    follow:   { background: h ? "rgba(0,212,255,.18)" : "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.35)", color: "#00D4FF" },
    unfollow: { background: h ? "rgba(239,68,68,.15)" : "rgba(255,255,255,.05)", border: `1px solid ${h ? "rgba(239,68,68,.4)" : "rgba(255,255,255,.12)"}`, color: h ? "#EF4444" : "#94A3B8" },
  };
  return <button style={{ ...base, ...vars[variant], transform: h && !disabled ? "translateY(-1px)" : "", ...ext }} onClick={onClick} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>{children}</button>;
}
function RoleBadge({ children, color = "#00D4FF" }) {
  return <span style={{ display: "inline-block", fontSize: 10, fontFamily: "'Orbitron',sans-serif", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 20, background: color + "22", border: `1px solid ${color}55`, color }}>{children}</span>;
}
function Card({ children, style: ext = {}, hover = true, onClick }) {
  const [h, setH] = useState(false);
  return <div onClick={onClick} style={{ background: "rgba(255,255,255,.03)", backdropFilter: "blur(14px)", border: `1px solid ${h && hover ? "rgba(0,212,255,.28)" : "rgba(255,255,255,.07)"}`, borderRadius: 14, transition: "all .28s ease", transform: h && hover ? "translateY(-2px)" : "", boxShadow: h && hover ? "0 12px 40px rgba(0,0,0,.3)" : "none", cursor: onClick ? "pointer" : "default", ...ext }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>{children}</div>;
}
function Modal({ children, onClose, title, width = 480 }) {
  return <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,.78)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: "linear-gradient(150deg,#0c1220,#10172a)", border: "1px solid rgba(0,212,255,.18)", borderRadius: 18, padding: "30px 32px", width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 30px 90px rgba(0,0,0,.85)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
        <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 17, fontWeight: 700, color: "#E2E8F0" }}>{title}</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
      </div>
      {children}
    </div>
  </div>;
}
function Lbl({ children }) { return <div style={{ fontSize: 11, fontFamily: "'Orbitron',sans-serif", fontWeight: 700, letterSpacing: ".1em", color: "#475569", textTransform: "uppercase", marginBottom: 7 }}>{children}</div>; }
function Sec({ title, children, onAdd }) {
  return <div style={{ marginBottom: 36 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 15, fontWeight: 700, color: "#E2E8F0", letterSpacing: ".05em" }}>{title}</h2>
      {onAdd && <Btn variant="ghost" size="sm" onClick={onAdd}>＋ Add</Btn>}
    </div>
    {children}
  </div>;
}
function Empty({ icon, msg }) {
  return <div style={{ textAlign: "center", padding: "36px 20px", color: "#334155", border: "1px dashed rgba(255,255,255,.07)", borderRadius: 12 }}>
    <div style={{ fontSize: 30, marginBottom: 8, opacity: .3 }}>{icon}</div>
    <div style={{ fontSize: 13 }}>{msg}</div>
  </div>;
}
function XBtn({ onClick, style: ext = {} }) {
  const [h, setH] = useState(false);
  return <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ background: h ? "#ef4444" : "rgba(239,68,68,.7)", border: "none", borderRadius: 6, width: 24, height: 24, color: "white", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", ...ext }}>✕</button>;
}
function StatusDot({ type, size = 12, style: ext = {} }) {
  const s = STATUS_META[type] || STATUS_META.offline;
  return <div style={{ width: size, height: size, borderRadius: "50%", background: s.color, flexShrink: 0, boxShadow: type !== "offline" ? `0 0 ${size / 2}px ${s.color}88` : "none", border: "2px solid rgba(3,7,18,.9)", ...ext }} title={s.label} />;
}
function Spinner() {
  return <div style={{ width: 22, height: 22, border: "2px solid rgba(0,212,255,.2)", borderTopColor: "#00D4FF", borderRadius: "50%", animation: "spin .7s linear infinite" }} />;
}

// ─── CLIP CAROUSEL ────────────────────────────────────────────────────────────
function ClipCarousel({ items, renderItem, canEdit, onRemove, emptyIcon, emptyMsg }) {
  const [idx, setIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [ts, setTs] = useState(null);
  const total = items.length;

  useEffect(() => { if (idx >= total && total > 0) setIdx(total - 1); }, [total]);

  // Auto-advance every 25s, resets when idx changes
  useEffect(() => {
    if (total <= 1) return;
    const t = setTimeout(() => { setIdx(i => (i + 1) % total); setKey(k => k + 1); }, 25000);
    return () => clearTimeout(t);
  }, [idx, total]);

  if (total === 0) return <Empty icon={emptyIcon} msg={emptyMsg} />;

  const go = dir => { setIdx(i => (i + dir + total) % total); setKey(k => k + 1); };
  const onTouchStart = e => setTs(e.touches[0].clientX);
  const onTouchEnd = e => {
    if (ts === null) return;
    const d = ts - e.changedTouches[0].clientX;
    if (Math.abs(d) > 45) go(d > 0 ? 1 : -1);
    setTs(null);
  };

  const arrowStyle = { position: "absolute", top: "42%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,.15)", background: "rgba(3,7,18,.8)", color: "#E2E8F0", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, backdropFilter: "blur(6px)", transition: "all .2s" };

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ userSelect: "none" }}>
      <div style={{ position: "relative", padding: total > 1 ? "0 20px" : "0" }}>
        <div key={key} className="carousel-item" style={{ position: "relative" }}>
          {renderItem(items[idx])}
          {canEdit && <XBtn onClick={() => { onRemove(items[idx].id); if (idx > 0) setIdx(i => i - 1); }} style={{ position: "absolute", top: 7, right: 7 }} />}
        </div>
        {total > 1 && <>
          <button className="carousel-arrow" onClick={() => go(-1)} style={{ ...arrowStyle, left: -14 }}>‹</button>
          <button className="carousel-arrow" onClick={() => go(1)} style={{ ...arrowStyle, right: -14 }}>›</button>
        </>}
      </div>
      {total > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 14 }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => { setIdx(i); setKey(k => k + 1); }} style={{ width: i === idx ? 22 : 7, height: 7, borderRadius: 4, background: i === idx ? "#00D4FF" : "rgba(255,255,255,.18)", border: "none", cursor: "pointer", padding: 0, transition: "all .3s ease" }} />
          ))}
          <span style={{ fontSize: 10, color: "#334155", fontFamily: "'Orbitron',sans-serif", marginLeft: 6 }}>{idx + 1}/{total}</span>
        </div>
      )}
    </div>
  );
}

// ─── STARFIELD ────────────────────────────────────────────────────────────────
function Starfield() {
  const s = useRef(null);
  if (!s.current) s.current = Array.from({ length: 200 }, (_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, sz: Math.random() * 2.4 + .4, delay: Math.random() * 7, dur: Math.random() * 3.5 + 2, bright: Math.random() > .92 }));
  return <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", background: "radial-gradient(ellipse at 18% 38%,#0e0228 0%,#030712 54%)" }}>
    <div style={{ position: "absolute", width: "65%", height: "65%", top: "-15%", left: "45%", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 70%)" }} />
    <div style={{ position: "absolute", width: "45%", height: "45%", top: "52%", left: "-8%", borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,255,.05) 0%,transparent 70%)" }} />
    {s.current.map(st => <div key={st.id} style={{ position: "absolute", left: `${st.x}%`, top: `${st.y}%`, width: st.sz, height: st.sz, borderRadius: "50%", background: st.bright ? "#a8e0ff" : st.sz > 1.8 ? "rgba(180,220,255,.9)" : "rgba(255,255,255,.8)", boxShadow: st.bright ? "0 0 4px 1px rgba(168,224,255,.6)" : "none", animation: `twinkle ${st.dur}s ${st.delay}s ease-in-out infinite alternate` }} />)}
  </div>;
}

// ─── NOTIF BELL ───────────────────────────────────────────────────────────────
function NotifBell({ notifs, onRead, onClear, navigate, users }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = notifs.filter(n => !n.read).length;
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return <div ref={ref} style={{ position: "relative" }}>
    <button onClick={() => { setOpen(o => !o); if (!open) onRead(); }} className={unread > 0 ? "bell-shake" : ""} style={{ background: open ? "rgba(0,212,255,.1)" : "none", border: `1px solid ${open ? "rgba(0,212,255,.3)" : "rgba(255,255,255,.09)"}`, borderRadius: 9, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, transition: "all .2s", position: "relative" }}>
      🔔
      {unread > 0 && <div style={{ position: "absolute", top: -4, right: -4, width: 17, height: 17, borderRadius: "50%", background: "linear-gradient(135deg,#EF4444,#DC2626)", color: "white", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Orbitron',sans-serif", border: "2px solid #030712" }}>{unread > 9 ? "9+" : unread}</div>}
    </button>
    {open && <div style={{ position: "absolute", right: 0, top: 46, width: 320, zIndex: 300, background: "linear-gradient(150deg,#0c1220,#0f1929)", border: "1px solid rgba(0,212,255,.15)", borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,.8)", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: ".1em" }}>NOTIFICATIONS</span>
        {notifs.length > 0 && <button onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#334155", fontFamily: "'Rajdhani',sans-serif" }}>Clear all</button>}
      </div>
      <div style={{ maxHeight: 300, overflowY: "auto" }}>
        {notifs.length === 0
          ? <div style={{ padding: "32px 18px", textAlign: "center", color: "#334155", fontSize: 13 }}><div style={{ fontSize: 28, marginBottom: 8 }}>🔕</div>No notifications yet</div>
          : notifs.slice().reverse().map(n => {
            const from = users.find(u => u.id === n.fromId);
            return <div key={n.id} className="notif-item" onClick={() => { navigate("profile", n.fromId); setOpen(false); }} style={{ padding: "12px 18px", display: "flex", gap: 12, alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,.04)", cursor: "pointer", background: n.read ? "transparent" : "rgba(0,212,255,.04)" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.04)"} onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : "rgba(0,212,255,.04)"}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{from?.avatar || "👤"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "#C4CDD6", lineHeight: 1.4 }}><span style={{ fontWeight: 700, color: "#E2E8F0" }}>{from?.displayName || "Someone"}</span> {n.msg}</div>
                <div style={{ fontSize: 11, color: "#334155", marginTop: 3 }}>{fmtTime(n.ts)}</div>
              </div>
              {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00D4FF", marginTop: 4, flexShrink: 0 }} />}
            </div>;
          })}
      </div>
    </div>}
  </div>;
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ cu, onLogin, onRegister, onLogout, nav, page, notifs, onReadNotifs, onClearNotifs, users }) {
  return <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", background: "rgba(3,7,18,.82)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,.055)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <button onClick={() => nav("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ fontSize: 22 }}>💫</span>
        <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 19, letterSpacing: ".12em", background: "linear-gradient(135deg,#fff 10%,#00D4FF 55%,#8B5CF6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NOVA</span>
      </button>
      <div style={{ display: "flex", gap: 2 }}>
        {[["home", "Home"], ["members", "Members"]].map(([p, l]) => <button key={p} onClick={() => nav(p)} style={{ background: page === p ? "rgba(0,212,255,.09)" : "none", border: page === p ? "1px solid rgba(0,212,255,.2)" : "1px solid transparent", cursor: "pointer", padding: "5px 14px", borderRadius: 8, fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: ".04em", color: page === p ? "#00D4FF" : "#94A3B8", transition: "all .2s" }}>{l}</button>)}
        {cu?.isOwner && <button onClick={() => nav("dashboard")} style={{ background: page === "dashboard" ? "rgba(245,158,11,.09)" : "none", border: page === "dashboard" ? "1px solid rgba(245,158,11,.2)" : "1px solid transparent", cursor: "pointer", padding: "5px 14px", borderRadius: 8, fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: ".04em", color: page === "dashboard" ? "#F59E0B" : "#94A3B8", transition: "all .2s" }}>⚡ Dashboard</button>}
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      {cu ? (<>
        <NotifBell notifs={notifs} onRead={onReadNotifs} onClear={onClearNotifs} navigate={nav} users={users} />
        <button onClick={() => nav("profile", cu.id)} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 9, padding: "5px 12px", cursor: "pointer", color: "#E2E8F0", fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 600 }}>
          <div style={{ position: "relative" }}><span style={{ fontSize: 18 }}>{cu.avatar}</span><StatusDot type={cu.status?.type || "offline"} size={10} style={{ position: "absolute", bottom: -1, right: -1 }} /></div>
          <span>{cu.displayName}</span>
        </button>
        <Btn variant="muted" size="sm" onClick={onLogout}>Sign Out</Btn>
      </>) : (<>
        <Btn variant="ghost" size="sm" onClick={onLogin}>Sign In</Btn>
        <Btn variant="primary" size="sm" onClick={onRegister}>Join Nova</Btn>
      </>)}
    </div>
  </nav>;
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({ discordUrl, staffUsers, nav, users }) {
  const feats = [
    { icon: "🎬", title: "Watch Parties",  desc: "Stream movies & shows together in real time" },
    { icon: "🎮", title: "Game Nights",    desc: "Squad up for epic gaming sessions every night" },
    { icon: "🎵", title: "Music Lounge",   desc: "Vibe out together, share playlists, listen live" },
    { icon: "⚾", title: "Sports Nights",  desc: "Watch baseball & live sports with the whole crew" },
  ];
  const online = users.filter(u => u.status?.type === "online").length;
  return <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 100px" }}>
    <div style={{ textAlign: "center", padding: "90px 0 80px" }}>
      <div className="fadeUp" style={{ fontSize: 68, marginBottom: 14, display: "inline-block", animation: "float 3.5s ease-in-out infinite" }}>💫</div>
      <h1 className="fadeUp d1" style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(52px,9vw,100px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: ".06em", marginBottom: 18, background: "linear-gradient(135deg,#fff 0%,#a8d8ff 40%,#00D4FF 65%,#8B5CF6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NOVA</h1>
      <p className="fadeUp d2" style={{ fontSize: 19, color: "#94A3B8", maxWidth: 460, margin: "0 auto 12px", lineHeight: 1.65, fontWeight: 500 }}>Your community for watchparties, game nights, music vibes & live sports.</p>
      <div className="fadeUp d2" style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 38 }}>
        <span style={{ fontSize: 12, color: "#334155", fontFamily: "'Orbitron',sans-serif", letterSpacing: ".18em" }}>{users.length} MEMBERS</span>
        <span style={{ fontSize: 12, color: "#22C55E", fontFamily: "'Orbitron',sans-serif", letterSpacing: ".18em", display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />{online} ONLINE</span>
      </div>
      <div className="fadeUp d3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a href={discordUrl} target="_blank" rel="noopener noreferrer"><Btn size="lg" style={{ fontSize: 13 }}>🚀 Join Nova on Discord</Btn></a>
        <Btn variant="ghost" size="lg" style={{ fontSize: 13 }} onClick={() => nav("members")}>👥 Browse Members</Btn>
      </div>
    </div>
    <div style={{ marginBottom: 80 }}>
      <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: ".22em", color: "#334155", textAlign: "center", textTransform: "uppercase", marginBottom: 28 }}>What We Do</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        {feats.map((f, i) => <Card key={i} style={{ padding: "26px 22px" }}><div style={{ fontSize: 34, marginBottom: 12 }}>{f.icon}</div><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700, color: "#E2E8F0", marginBottom: 8, letterSpacing: ".05em" }}>{f.title}</div><div style={{ color: "#64748B", fontSize: 13, lineHeight: 1.55 }}>{f.desc}</div></Card>)}
      </div>
    </div>
    {staffUsers.length > 0 && <div>
      <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: ".22em", color: "#334155", textAlign: "center", textTransform: "uppercase", marginBottom: 28 }}>Meet the Staff</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
        {staffUsers.map(u => <Card key={u.id} style={{ padding: "22px 18px", textAlign: "center" }} onClick={() => nav("profile", u.id)}>
          <div style={{ position: "relative", width: 60, height: 60, margin: "0 auto 12px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: `radial-gradient(circle,${u.page.accent}44,rgba(0,0,0,.6))`, border: `2px solid ${u.page.accent}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: `0 0 22px ${u.page.accent}33` }}>{u.avatar}</div>
            <StatusDot type={u.status?.type || "offline"} size={13} style={{ position: "absolute", bottom: 1, right: 1 }} />
          </div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700, color: "#E2E8F0", marginBottom: 7 }}>{u.displayName}</div>
          {u.staffRole && <RoleBadge color={ROLE_COLOR[u.staffRole] || "#00D4FF"}>{u.staffRole}</RoleBadge>}
        </Card>)}
      </div>
    </div>}
  </div>;
}

// ─── MEMBERS ──────────────────────────────────────────────────────────────────
function MembersPage({ users, nav }) {
  const [q, setQ] = useState(""), [filter, setFilter] = useState("all");
  const list = users.filter(u => {
    const m = u.displayName.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase());
    if (filter === "online") return m && u.status?.type === "online";
    if (filter === "staff")  return m && u.staffRole;
    return m;
  });
  return <div style={{ maxWidth: 1080, margin: "0 auto", padding: "44px 24px 100px" }}>
    <div style={{ textAlign: "center", marginBottom: 36 }}>
      <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 30, fontWeight: 700, marginBottom: 10, background: "linear-gradient(135deg,#fff,#00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Members</h1>
      <p style={{ color: "#475569", marginBottom: 22, fontSize: 14 }}>{users.length} members across the galaxy</p>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍  Search members..." style={{ maxWidth: 340, margin: "0 auto 14px", display: "block" }} />
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {[["all", "All"], ["online", "🟢 Online"], ["staff", "⚡ Staff"]].map(([v, l]) => <button key={v} onClick={() => setFilter(v)} style={{ padding: "6px 16px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, border: `1px solid ${filter === v ? "rgba(0,212,255,.4)" : "rgba(255,255,255,.08)"}`, background: filter === v ? "rgba(0,212,255,.1)" : "rgba(255,255,255,.03)", color: filter === v ? "#00D4FF" : "#475569" }}>{l}</button>)}
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 14 }}>
      {list.map(u => <Card key={u.id} style={{ padding: 18, cursor: "pointer" }} onClick={() => nav("profile", u.id)}>
        <div style={{ position: "relative", width: 50, height: 50, marginBottom: 12 }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: `radial-gradient(circle,${u.page.accent}44,rgba(0,0,0,.6))`, border: `2px solid ${u.page.accent}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `0 0 18px ${u.page.accent}22` }}>{u.avatar}</div>
          <StatusDot type={u.status?.type || "offline"} size={12} style={{ position: "absolute", bottom: 0, right: 0 }} />
        </div>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700, color: "#E2E8F0", marginBottom: 2 }}>{u.displayName}</div>
        <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>@{u.username}</div>
        {u.staffRole && <div style={{ marginBottom: 6 }}><RoleBadge color={ROLE_COLOR[u.staffRole] || "#00D4FF"}>{u.staffRole}</RoleBadge></div>}
        {u.status?.activity && <div style={{ fontSize: 11, color: "#334155", marginBottom: 6, fontStyle: "italic" }}>"{u.status.activity}"</div>}
        <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#475569" }}>
          <span>{u.followers.length} followers</span><span>·</span><span>{u.badges.length} 🏅</span>
        </div>
      </Card>)}
    </div>
  </div>;
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function ProfilePage({ user, cu, onUpdatePage, onUpdateProfile, onFollow, onComment, onDelComment }) {
  const canEdit = cu?.id === user.id || cu?.isOwner;
  const isFollowing = cu && user.followers.includes(cu.id);
  const isSelf = cu?.id === user.id;
  const [addMusic, setAddMusic] = useState(false);
  const [addClip, setAddClip] = useState(false);
  const [addSocial, setAddSocial] = useState(false);
  const [editProf, setEditProf] = useState(false);
  const [showFL, setShowFL] = useState(null);
  const acc = user.page.accent || "#00D4FF";
  const rmMusic  = id => onUpdatePage(user.id, { music:  user.page.music.filter(x => x.id !== id) });
  const rmClip   = id => onUpdatePage(user.id, { clips:  user.page.clips.filter(x => x.id !== id) });
  const rmSocial = id => onUpdatePage(user.id, { social: user.page.social.filter(x => x.id !== id) });

  const renderClip = c => c.type === "youtube" && c.eid
    ? <div><div style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 7 }}>{c.title}</div><div style={{ borderRadius: 10, overflow: "hidden" }}><iframe src={`https://www.youtube.com/embed/${c.eid}`} width="100%" height="220" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ borderRadius: 10 }} /></div></div>
    : c.type === "medal" ? <div><div style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 7 }}>{c.title}</div>{c.eid ? <iframe src={`https://medal.tv/clip/${c.eid}/embed`} width="100%" height="210" frameBorder="0" allowFullScreen style={{ borderRadius: 10 }} /> : <Card style={{ padding: 18 }}><div style={{ fontSize: 10, color: "#475569", fontFamily: "'Orbitron',sans-serif", marginBottom: 8 }}>MEDAL.TV CLIP</div><a href={c.url} target="_blank" rel="noopener noreferrer"><Btn variant="ghost" size="sm">▶ Watch on Medal.tv</Btn></a></Card>}</div>
    : null;

  const renderSocial = s => s.eid
    ? <div><div style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 7 }}>{s.title}</div><div style={{ borderRadius: 10, overflow: "hidden" }}><iframe src={`https://www.youtube.com/embed/${s.eid}`} width="100%" height="220" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ borderRadius: 10 }} /></div></div>
    : <Card style={{ padding: 18 }}><div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}><div style={{ fontSize: 28 }}>{s.platform === "instagram" ? "📸" : "🎬"}</div><div><div style={{ fontSize: 10, fontFamily: "'Orbitron',sans-serif", color: "#475569", marginBottom: 6 }}>{s.platform === "instagram" ? "INSTAGRAM REEL" : "CLIP"}</div><div style={{ fontWeight: 700, color: "#E2E8F0", marginBottom: 10 }}>{s.title}</div><a href={s.url} target="_blank" rel="noopener noreferrer"><Btn variant="ghost" size="sm">▶ Watch Clip</Btn></a></div></div></Card>;

  return <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 100px" }}>
    {/* Header */}
    <div style={{ borderRadius: 18, overflow: "hidden", marginBottom: 28, border: "1px solid rgba(255,255,255,.07)" }}>
      <div style={{ height: 148, position: "relative", background: `linear-gradient(135deg,${acc}22 0%,rgba(139,92,246,.18) 50%,rgba(3,7,18,.9) 100%)` }}>
        {[...Array(18)].map((_, i) => <div key={i} style={{ position: "absolute", left: `${5 + i * 5.5}%`, top: `${12 + (i % 5) * 18}%`, width: i % 3 === 0 ? 2.5 : 1.5, height: i % 3 === 0 ? 2.5 : 1.5, borderRadius: "50%", background: "white", opacity: .2 + (i % 5) * .08 }} />)}
        <div style={{ position: "absolute", right: 18, top: 14 }}>{canEdit && <Btn variant="ghost" size="sm" onClick={() => setEditProf(true)}>✏️ Edit Profile</Btn>}</div>
      </div>
      <div style={{ background: "rgba(10,15,30,.92)", backdropFilter: "blur(14px)", padding: "0 28px 26px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginTop: -38, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 82, height: 82, borderRadius: "50%", background: `radial-gradient(circle,${acc}55,rgba(0,0,0,.8))`, border: `3px solid ${acc}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, boxShadow: `0 0 32px ${acc}44` }}>{user.avatar}</div>
            <StatusDot type={user.status?.type || "offline"} size={16} style={{ position: "absolute", bottom: 3, right: 3 }} />
          </div>
          {user.status?.activity && <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: "5px 12px" }}>
            <StatusDot type={user.status?.type || "offline"} size={8} style={{ position: "static" }} />
            <span style={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic" }}>{user.status.activity}</span>
          </div>}
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
              <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 21, fontWeight: 700, color: "#F1F5F9" }}>{user.displayName}</h1>
              {user.staffRole && <RoleBadge color={ROLE_COLOR[user.staffRole] || acc}>{user.staffRole}</RoleBadge>}
            </div>
            <div style={{ color: "#475569", fontSize: 13, marginBottom: 10 }}>@{user.username} · Joined {user.joined}</div>
            <p style={{ color: "#94A3B8", fontSize: 15, maxWidth: 520, lineHeight: 1.6, marginBottom: 14 }}>{user.bio}</p>
            <div style={{ display: "flex", gap: 22, marginBottom: 14 }}>
              <button onClick={() => setShowFL("followers")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 14, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, padding: 0 }}>
                <span style={{ color: "#E2E8F0", fontFamily: "'Orbitron',sans-serif", fontSize: 16, fontWeight: 900 }}>{user.followers.length}</span> followers
              </button>
              <button onClick={() => setShowFL("following")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 14, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, padding: 0 }}>
                <span style={{ color: "#E2E8F0", fontFamily: "'Orbitron',sans-serif", fontSize: 16, fontWeight: 900 }}>{user.following.length}</span> following
              </button>
            </div>
          </div>
          {cu && !isSelf && <Btn variant={isFollowing ? "unfollow" : "follow"} onClick={() => onFollow(user.id)} style={{ flexShrink: 0 }}>{isFollowing ? "✓ Following" : "+ Follow"}</Btn>}
        </div>
        {user.badges.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {user.badges.map((bid, i) => {
            const b = ALL_BADGES.find(x => x.id === bid);
            if (!b) return null;
            return <div key={bid} className="badge-pop" style={{ animationDelay: `${i * .05}s`, display: "flex", alignItems: "center", gap: 6, background: b.color + "15", border: `1px solid ${b.color}40`, borderRadius: 20, padding: "4px 12px" }} title={b.desc}>
              <span style={{ fontSize: 14 }}>{b.icon}</span>
              <span style={{ fontSize: 9, fontFamily: "'Orbitron',sans-serif", fontWeight: 700, color: b.color, letterSpacing: ".06em" }}>{b.label}</span>
            </div>;
          })}
        </div>}
      </div>
    </div>

    {/* Music */}
    <Sec title="🎵 Favorite Music" onAdd={canEdit ? () => setAddMusic(true) : null}>
      {user.page.music.length === 0 ? <Empty icon="🎵" msg="No music added yet" /> :
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 14 }}>
          {user.page.music.map(m => <div key={m.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
            {m.type === "spotify"
              ? <iframe src={`https://open.spotify.com/embed/track/${m.eid}?utm_source=generator&theme=0`} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" style={{ borderRadius: 12 }} />
              : <Card style={{ padding: 16 }}><div style={{ fontSize: 11, color: "#475569", fontFamily: "'Orbitron',sans-serif", marginBottom: 6 }}>APPLE MUSIC</div><div style={{ fontWeight: 700, color: "#E2E8F0" }}>{m.title}</div><div style={{ color: "#64748B", fontSize: 13 }}>{m.artist}</div>{m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 10 }}><Btn variant="ghost" size="sm">▶ Listen</Btn></a>}</Card>}
            {canEdit && <XBtn onClick={() => rmMusic(m.id)} style={{ position: "absolute", top: 7, right: 7 }} />}
          </div>)}
        </div>}
    </Sec>

    {/* Gaming Clips — CAROUSEL */}
    <Sec title="🎮 Gaming Clips" onAdd={canEdit ? () => setAddClip(true) : null}>
      <ClipCarousel items={user.page.clips} renderItem={renderClip} canEdit={canEdit} onRemove={rmClip} emptyIcon="🎮" emptyMsg="No gaming clips added yet" />
    </Sec>

    {/* Social Clips — CAROUSEL */}
    <Sec title="📱 Sports & Social Clips" onAdd={canEdit ? () => setAddSocial(true) : null}>
      <ClipCarousel items={user.page.social} renderItem={renderSocial} canEdit={canEdit} onRemove={rmSocial} emptyIcon="📱" emptyMsg="No social clips added yet" />
    </Sec>

    {/* Comments */}
    <CommentsSection comments={user.comments} cu={cu} onPost={t => onComment(user.id, t)} onDel={cid => onDelComment(user.id, cid)} />

    {editProf && <EditProfileModal user={user} onSave={u => { onUpdateProfile(user.id, u); setEditProf(false); }} onClose={() => setEditProf(false)} />}
    {addMusic  && <AddMusicModal  onSave={m => { onUpdatePage(user.id, { music:  [...user.page.music,  m] }); setAddMusic(false);  }} onClose={() => setAddMusic(false)}  />}
    {addClip   && <AddClipModal   onSave={c => { onUpdatePage(user.id, { clips:  [...user.page.clips,  c] }); setAddClip(false);   }} onClose={() => setAddClip(false)}   />}
    {addSocial && <AddSocialModal onSave={s => { onUpdatePage(user.id, { social: [...user.page.social, s] }); setAddSocial(false); }} onClose={() => setAddSocial(false)} />}
    {showFL && <Modal title={showFL === "followers" ? `${user.displayName}'s Followers` : `${user.displayName} is Following`} onClose={() => setShowFL(null)} width={340}>
      {(showFL === "followers" ? user.followers : user.following).length === 0
        ? <div style={{ textAlign: "center", padding: "28px 0", color: "#334155", fontSize: 13 }}>None yet</div>
        : <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {(showFL === "followers" ? user.followers : user.following).map(id => <div key={id} style={{ padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", fontSize: 13, color: "#94A3B8", fontFamily: "'Orbitron',sans-serif" }}>@{id}</div>)}
        </div>}
    </Modal>}
  </div>;
}

// ─── COMMENTS ─────────────────────────────────────────────────────────────────
function CommentsSection({ comments, cu, onPost, onDel }) {
  const [text, setText] = useState("");
  const sorted = [...comments].sort((a, b) => b.timestamp - a.timestamp);
  const post = () => { const t = text.trim(); if (!t || !cu) return; onPost(t); setText(""); };
  return <Sec title="💬 Comments">
    {cu ? <div style={{ marginBottom: 18, display: "flex", gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "rgba(0,212,255,.1)", border: "1px solid rgba(0,212,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{cu.avatar}</div>
      <div style={{ flex: 1 }}>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={2} placeholder="Leave a comment..." style={{ resize: "none", marginBottom: 7 }} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); post(); } }} />
        <Btn size="sm" onClick={post} disabled={!text.trim()}>Post Comment</Btn>
      </div>
    </div> : <div style={{ textAlign: "center", padding: "14px", background: "rgba(255,255,255,.02)", borderRadius: 10, marginBottom: 14, fontSize: 13, color: "#475569" }}>Sign in to leave a comment</div>}
    {sorted.length === 0 ? <Empty icon="💬" msg="No comments yet — be the first!" /> :
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map(c => {
          const canDel = cu?.isOwner || cu?.id === c.authorId;
          return <div key={c.id} className="comment-row" style={{ position: "relative", display: "flex", gap: 12, padding: "14px 16px", background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{c.authorAvatar || "👤"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700, color: "#E2E8F0" }}>{c.authorName || "Member"}</span>
                <span style={{ fontSize: 11, color: "#334155" }}>{fmtTime(c.timestamp)}</span>
              </div>
              <div style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.5 }}>{c.text}</div>
            </div>
            {canDel && <button className="del-btn" onClick={() => onDel(c.id)} style={{ position: "absolute", top: 10, right: 10, background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 6, width: 24, height: 24, color: "#EF4444", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity .15s" }}>✕</button>}
          </div>;
        })}
      </div>}
  </Sec>;
}

// ─── EDIT PROFILE MODAL ───────────────────────────────────────────────────────
function EditProfileModal({ user, onSave, onClose }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState(user.avatar);
  const [accent, setAccent] = useState(user.page.accent);
  const [statusType, setStatusType] = useState(user.status?.type || "online");
  const [statusActivity, setStatusActivity] = useState(user.status?.activity || "");
  const EMOJIS = ["💫","⭐","🌟","🌠","🌌","🌙","🌑","☀️","🚀","🛸","🌊","🔥","💎","👾","🎮","🎵","⚾","🌈","🦋","❄️"];
  const save = () => onSave({ displayName, bio, avatar, status: { type: statusType, activity: statusActivity }, page: { ...user.page, accent } });
  return <Modal title="✏️ Edit Profile" onClose={onClose}>
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div><Lbl>Avatar</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{EMOJIS.map(e => <button key={e} onClick={() => setAvatar(e)} style={{ width: 38, height: 38, borderRadius: 8, cursor: "pointer", fontSize: 18, border: `2px solid ${avatar === e ? "#00D4FF" : "rgba(255,255,255,.08)"}`, background: avatar === e ? "rgba(0,212,255,.14)" : "rgba(255,255,255,.04)", transition: "all .15s" }}>{e}</button>)}</div></div>
      <div><Lbl>Display Name</Lbl><input value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
      <div><Lbl>Bio</Lbl><textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ resize: "vertical" }} /></div>
      <div>
        <Lbl>Status</Lbl>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {Object.entries(STATUS_META).map(([k, v]) => <button key={k} onClick={() => setStatusType(k)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, border: `1px solid ${statusType === k ? v.color + "66" : "rgba(255,255,255,.08)"}`, background: statusType === k ? v.color + "18" : "rgba(255,255,255,.03)", color: statusType === k ? v.color : "#64748B" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: v.color }} />{v.label}</button>)}
        </div>
        <input value={statusActivity} onChange={e => setStatusActivity(e.target.value)} placeholder="What are you up to? (e.g. Playing Valorant)" />
        <div style={{ fontSize: 11, color: "#334155", marginTop: 5 }}>⚠️ Status is set manually — real Discord sync requires a bot.</div>
      </div>
      <div><Lbl>Accent Color</Lbl><div style={{ display: "flex", alignItems: "center", gap: 12 }}><input type="color" value={accent} onChange={e => setAccent(e.target.value)} style={{ width: 46, height: 34, padding: 3, cursor: "pointer" }} /><span style={{ color: "#64748B", fontSize: 14 }}>Profile accent color</span></div></div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={save}>Save Changes</Btn></div>
    </div>
  </Modal>;
}

// ─── ADD MUSIC ────────────────────────────────────────────────────────────────
function AddMusicModal({ onSave, onClose }) {
  const [type, setType] = useState("spotify"), [url, setUrl] = useState(""), [title, setTitle] = useState(""), [artist, setArtist] = useState(""), [err, setErr] = useState("");
  const go = () => {
    if (type === "spotify") { const eid = extractSpotify(url); if (!eid) { setErr("Paste a valid Spotify track link"); return; } onSave({ id: gid(), type: "spotify", title: title || "Track", artist, eid }); }
    else { if (!title) { setErr("Enter a song title"); return; } onSave({ id: gid(), type: "apple", title, artist, url }); }
  };
  return <Modal title="🎵 Add Music" onClose={onClose}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><Lbl>Platform</Lbl><div style={{ display: "flex", gap: 8 }}>{[["spotify", "🎵 Spotify"], ["apple", "🍎 Apple Music"]].map(([v, l]) => <button key={v} onClick={() => setType(v)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, border: `1px solid ${type === v ? "#00D4FF" : "rgba(255,255,255,.09)"}`, background: type === v ? "rgba(0,212,255,.11)" : "rgba(255,255,255,.04)", color: type === v ? "#00D4FF" : "#94A3B8" }}>{l}</button>)}</div></div>
      {type === "spotify" && <div><Lbl>Spotify Track URL</Lbl><input value={url} onChange={e => { setUrl(e.target.value); setErr(""); }} placeholder="https://open.spotify.com/track/..." /><div style={{ fontSize: 11, color: "#334155", marginTop: 5 }}>Right-click song → Share → Copy Song Link</div></div>}
      {type === "apple" && <div><Lbl>Apple Music Link</Lbl><input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://music.apple.com/..." /></div>}
      <div><Lbl>Song Title</Lbl><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Song name" /></div>
      <div><Lbl>Artist</Lbl><input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist name" /></div>
      {err && <div style={{ color: "#EF4444", fontSize: 13, background: "rgba(239,68,68,.1)", padding: "9px 12px", borderRadius: 8 }}>{err}</div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={go}>Add Song</Btn></div>
    </div>
  </Modal>;
}

// ─── ADD CLIP ─────────────────────────────────────────────────────────────────
function AddClipModal({ onSave, onClose }) {
  const [type, setType] = useState("youtube"), [url, setUrl] = useState(""), [title, setTitle] = useState(""), [err, setErr] = useState("");
  const go = () => {
    if (!title) { setErr("Enter a title"); return; }
    if (type === "youtube") { const eid = extractYouTube(url); if (!eid) { setErr("Paste a valid YouTube link"); return; } onSave({ id: gid(), type: "youtube", title, url, eid }); }
    else { if (!url) { setErr("Paste a Medal.tv link"); return; } onSave({ id: gid(), type: "medal", title, url, eid: extractMedal(url) }); }
  };
  return <Modal title="🎮 Add Gaming Clip" onClose={onClose}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><Lbl>Platform</Lbl><div style={{ display: "flex", gap: 8 }}>{[["youtube", "▶ YouTube"], ["medal", "🏅 Medal.tv"]].map(([v, l]) => <button key={v} onClick={() => setType(v)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, border: `1px solid ${type === v ? "#00D4FF" : "rgba(255,255,255,.09)"}`, background: type === v ? "rgba(0,212,255,.11)" : "rgba(255,255,255,.04)", color: type === v ? "#00D4FF" : "#94A3B8" }}>{l}</button>)}</div></div>
      <div><Lbl>Clip Title</Lbl><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Clip title..." /></div>
      <div><Lbl>{type === "youtube" ? "YouTube URL" : "Medal.tv URL"}</Lbl><input value={url} onChange={e => { setUrl(e.target.value); setErr(""); }} placeholder={type === "youtube" ? "https://youtube.com/watch?v=..." : "https://medal.tv/games/.../clips/..."} /></div>
      {err && <div style={{ color: "#EF4444", fontSize: 13, background: "rgba(239,68,68,.1)", padding: "9px 12px", borderRadius: 8 }}>{err}</div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={go}>Add Clip</Btn></div>
    </div>
  </Modal>;
}

// ─── ADD SOCIAL ───────────────────────────────────────────────────────────────
function AddSocialModal({ onSave, onClose }) {
  const [type, setType] = useState("youtube"), [url, setUrl] = useState(""), [title, setTitle] = useState(""), [err, setErr] = useState("");
  const go = () => {
    if (!title) { setErr("Enter a title"); return; }
    if (!url) { setErr("Paste a link"); return; }
    if (type === "youtube") { const eid = extractYouTube(url); if (!eid) { setErr("Paste a valid YouTube link"); return; } onSave({ id: gid(), type: "link", platform: "youtube", title, url, eid }); }
    else onSave({ id: gid(), type: "link", platform: "instagram", title, url, eid: null });
  };
  return <Modal title="📱 Add Sports & Social Clip" onClose={onClose}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><Lbl>Platform</Lbl><div style={{ display: "flex", gap: 8 }}>{[["youtube", "▶ YouTube/Sports"], ["instagram", "📸 Instagram Reel"]].map(([v, l]) => <button key={v} onClick={() => setType(v)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, border: `1px solid ${type === v ? "#00D4FF" : "rgba(255,255,255,.09)"}`, background: type === v ? "rgba(0,212,255,.11)" : "rgba(255,255,255,.04)", color: type === v ? "#00D4FF" : "#94A3B8" }}>{l}</button>)}</div></div>
      <div><Lbl>Title</Lbl><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. World Series Highlights" /></div>
      <div><Lbl>URL</Lbl><input value={url} onChange={e => { setUrl(e.target.value); setErr(""); }} placeholder={type === "youtube" ? "https://youtube.com/watch?v=..." : "https://www.instagram.com/reel/..."} /></div>
      {type === "instagram" && <div style={{ fontSize: 11, color: "#334155", background: "rgba(255,255,255,.03)", padding: "9px 12px", borderRadius: 8 }}>⚠️ Instagram reels show as a link card — Instagram doesn't allow direct embeds.</div>}
      {err && <div style={{ color: "#EF4444", fontSize: 13, background: "rgba(239,68,68,.1)", padding: "9px 12px", borderRadius: 8 }}>{err}</div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><Btn variant="muted" onClick={onClose}>Cancel</Btn><Btn onClick={go}>Add Clip</Btn></div>
    </div>
  </Modal>;
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ mode, setMode, onSubmit, onClose }) {
  const [username, setUsername] = useState(""), [password, setPassword] = useState(""), [displayName, setDisplayName] = useState(""), [err, setErr] = useState(""), [loading, setLoading] = useState(false);
  const go = async () => {
    setLoading(true);
    const e = await onSubmit(username, password, displayName);
    setLoading(false);
    if (e) setErr(e);
  };
  return <Modal title={mode === "login" ? "Sign In to Nova 💫" : "Create Your Nova Account"} onClose={onClose}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><Lbl>Username</Lbl><input value={username} onChange={e => setUsername(e.target.value)} placeholder="your_username" onKeyDown={e => e.key === "Enter" && go()} /></div>
      {mode === "register" && <div><Lbl>Display Name</Lbl><input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your display name" /></div>}
      <div><Lbl>Password</Lbl><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && go()} /></div>
      {err && <div style={{ color: "#EF4444", fontSize: 13, background: "rgba(239,68,68,.1)", padding: "9px 12px", borderRadius: 8 }}>⚠️ {err}</div>}
      <Btn size="lg" onClick={go} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4, gap: 10 }}>
        {loading ? <Spinner /> : null}
        {mode === "login" ? "🚀 Sign In" : "💫 Create Account"}
      </Btn>
      <div style={{ textAlign: "center", color: "#475569", fontSize: 13 }}>
        {mode === "login" ? "New here? " : "Already a member? "}
        <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }} style={{ background: "none", border: "none", color: "#00D4FF", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{mode === "login" ? "Create an account" : "Sign in"}</button>
      </div>
    </div>
  </Modal>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ users, staffIds, setStaffIds, discordUrl, setDiscordUrl, onDelUser, onUpdateUser, onAwardBadge, onRevokeBadge, section, setSection, navigate }) {
  const [newDiscord, setNewDiscord] = useState(discordUrl), [saved, setSaved] = useState(false);
  const navItems = [{ id: "overview", icon: "📊", label: "Overview" }, { id: "users", icon: "👥", label: "Members" }, { id: "staff", icon: "⚡", label: "Staff" }, { id: "badges", icon: "🏅", label: "Badges" }, { id: "settings", icon: "⚙️", label: "Settings" }];
  const saveD = () => { setDiscordUrl(newDiscord); setSaved(true); setTimeout(() => setSaved(false), 2200); };
  return <div style={{ maxWidth: 1080, margin: "0 auto", padding: "44px 24px 100px", display: "flex", gap: 24, alignItems: "flex-start" }}>
    <div style={{ width: 190, flexShrink: 0 }}>
      <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: ".18em", color: "#334155", textTransform: "uppercase", marginBottom: 14, paddingLeft: 4 }}>Owner Panel</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {navItems.map(n => <button key={n.id} onClick={() => setSection(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, cursor: "pointer", background: section === n.id ? "rgba(0,212,255,.09)" : "transparent", border: `1px solid ${section === n.id ? "rgba(0,212,255,.25)" : "transparent"}`, color: section === n.id ? "#00D4FF" : "#94A3B8", fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 600, textAlign: "left", transition: "all .2s" }}><span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}</button>)}
      </div>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      {section === "overview" && <div>
        <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 700, color: "#E2E8F0", marginBottom: 26 }}>Overview</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(148px,1fr))", gap: 14, marginBottom: 28 }}>
          {[{ icon: "👥", val: users.length, label: "Members", color: "#00D4FF" }, { icon: "🟢", val: users.filter(u => u.status?.type === "online").length, label: "Online Now", color: "#22C55E" }, { icon: "⚡", val: staffIds.length, label: "Staff", color: "#F59E0B" }, { icon: "💬", val: users.reduce((a, u) => a + u.comments.length, 0), label: "Comments", color: "#A78BFA" }, { icon: "🏅", val: users.reduce((a, u) => a + u.badges.length, 0), label: "Badges Given", color: "#F472B6" }].map((s, i) => <Card key={i} style={{ padding: "18px 20px" }}><div style={{ fontSize: 20, marginBottom: 7 }}>{s.icon}</div><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 26, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.val}</div><div style={{ fontSize: 11, color: "#475569" }}>{s.label}</div></Card>)}
        </div>
        <Card style={{ padding: 22 }} hover={false}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 14, letterSpacing: ".08em" }}>ALL MEMBERS</div>
          {users.map(u => <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
            <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `radial-gradient(circle,${u.page.accent}44,rgba(0,0,0,.7))`, border: `1.5px solid ${u.page.accent}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{u.avatar}</div>
              <StatusDot type={u.status?.type || "offline"} size={10} style={{ position: "absolute", bottom: -1, right: -1 }} />
            </div>
            <div style={{ flex: 1 }}><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700, color: "#E2E8F0" }}>{u.displayName}</div><div style={{ fontSize: 11, color: "#475569" }}>@{u.username} · {u.followers.length} followers · {u.badges.length} badges</div></div>
            {u.staffRole && <RoleBadge color={ROLE_COLOR[u.staffRole] || "#00D4FF"}>{u.staffRole}</RoleBadge>}
            <Btn variant="ghost" size="sm" onClick={() => navigate("profile", u.id)}>View</Btn>
          </div>)}
        </Card>
      </div>}

      {section === "users" && <div>
        <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 700, color: "#E2E8F0", marginBottom: 26 }}>Manage Members</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map(u => <Card key={u.id} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }} hover={false}>
            <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `radial-gradient(circle,${u.page.accent}44,rgba(0,0,0,.7))`, border: `2px solid ${u.page.accent}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21 }}>{u.avatar}</div>
              <StatusDot type={u.status?.type || "offline"} size={11} style={{ position: "absolute", bottom: 0, right: 0 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}><span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>{u.displayName}</span>{u.staffRole && <RoleBadge color={ROLE_COLOR[u.staffRole] || "#00D4FF"}>{u.staffRole}</RoleBadge>}</div>
              <div style={{ fontSize: 11, color: "#475569" }}>@{u.username} · {u.followers.length} followers · {u.badges.length} badges</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <Btn variant="ghost" size="sm" onClick={() => navigate("profile", u.id)}>View Page</Btn>
              {!u.isOwner && <Btn variant="danger" size="sm" onClick={() => onDelUser(u.id)}>Remove</Btn>}
            </div>
          </Card>)}
        </div>
      </div>}

      {section === "staff" && <div>
        <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 700, color: "#E2E8F0", marginBottom: 26 }}>Staff Management</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map(u => {
            const isStaff = staffIds.includes(u.id);
            return <Card key={u.id} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }} hover={false}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, background: `radial-gradient(circle,${u.page.accent}44,rgba(0,0,0,.7))`, border: `2px solid ${isStaff ? u.page.accent : "rgba(255,255,255,.1)"}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{u.avatar}</div>
              <div style={{ flex: 1 }}><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700, color: "#E2E8F0", marginBottom: 2 }}>{u.displayName}</div><div style={{ fontSize: 12, color: "#475569" }}>@{u.username}</div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {isStaff && u.staffRole && <RoleBadge color={ROLE_COLOR[u.staffRole] || "#00D4FF"}>{u.staffRole}</RoleBadge>}
                {u.isOwner ? <RoleBadge color="#F59E0B">Owner</RoleBadge>
                  : isStaff ? <Btn variant="danger" size="sm" onClick={() => { setStaffIds(p => p.filter(s => s !== u.id)); onUpdateUser(u.id, { staffRole: null }); }}>Remove Staff</Btn>
                  : <StaffPicker onAdd={role => { setStaffIds(p => [...p, u.id]); onUpdateUser(u.id, { staffRole: role }); }} />}
              </div>
            </Card>;
          })}
        </div>
      </div>}

      {section === "badges" && <div>
        <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>Award Badges</h2>
        <p style={{ color: "#475569", fontSize: 14, marginBottom: 26 }}>Click any badge to award or revoke it. Bright = awarded, faded = not yet.</p>
        {users.map(u => <Card key={u.id} style={{ padding: "18px 20px", marginBottom: 14 }} hover={false}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `radial-gradient(circle,${u.page.accent}44,rgba(0,0,0,.7))`, border: `1.5px solid ${u.page.accent}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{u.avatar}</div>
            <div><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>{u.displayName}</div><div style={{ fontSize: 11, color: "#475569" }}>{u.badges.length} / {ALL_BADGES.length} badges</div></div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ALL_BADGES.map(b => {
              const has = u.badges.includes(b.id);
              return <button key={b.id} onClick={() => has ? onRevokeBadge(u.id, b.id) : onAwardBadge(u.id, b.id)} title={has ? `Revoke ${b.label}` : `Award: ${b.desc}`} style={{ display: "flex", alignItems: "center", gap: 6, background: has ? b.color + "22" : "rgba(255,255,255,.03)", border: `1px solid ${has ? b.color + "55" : "rgba(255,255,255,.08)"}`, borderRadius: 20, padding: "5px 11px", cursor: "pointer", transition: "all .18s", opacity: has ? 1 : .42 }}>
                <span style={{ fontSize: 14 }}>{b.icon}</span>
                <span style={{ fontSize: 9, fontFamily: "'Orbitron',sans-serif", fontWeight: 700, color: has ? b.color : "#475569", letterSpacing: ".05em" }}>{b.label}</span>
                {has && <span style={{ fontSize: 9, color: "#EF4444", fontWeight: 700 }}>✕</span>}
              </button>;
            })}
          </div>
        </Card>)}
      </div>}

      {section === "settings" && <div>
        <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 700, color: "#E2E8F0", marginBottom: 26 }}>Settings</h2>
        <Card style={{ padding: 26 }} hover={false}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 700, color: "#475569", letterSpacing: ".1em", marginBottom: 20 }}>DISCORD INVITE</div>
          <Lbl>Discord Server Invite URL</Lbl>
          <input value={newDiscord} onChange={e => setNewDiscord(e.target.value)} placeholder="https://discord.gg/..." style={{ marginBottom: 14 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Btn onClick={saveD}>💾 Save URL</Btn>
            {saved && <span style={{ color: "#34D399", fontSize: 13, fontWeight: 600 }}>✓ Saved!</span>}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#334155" }}>Current: <span style={{ color: "#00D4FF" }}>{discordUrl}</span></div>
        </Card>
      </div>}
    </div>
  </div>;
}

function StaffPicker({ onAdd }) {
  const [open, setOpen] = useState(false), [role, setRole] = useState("Moderator");
  if (!open) return <Btn variant="ghost" size="sm" onClick={() => setOpen(true)}>+ Add Staff</Btn>;
  return <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
    <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: "5px 8px", fontSize: 12, width: "auto" }}>
      <option>Moderator</option><option>Event Host</option><option>Helper</option>
    </select>
    <Btn variant="primary" size="sm" onClick={() => { onAdd(role); setOpen(false); }}>Add</Btn>
    <Btn variant="muted" size="sm" onClick={() => setOpen(false)}>✕</Btn>
  </div>;
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [users, setUsers] = useState([]);
  const [cu, setCu] = useState(null);
  const [page, setPage] = useState("home");
  const [profileId, setProfileId] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const [notifs, setNotifs] = useState([]);
  const [discordUrl, setDiscordUrl] = useState("https://discord.gg/nova");
  const [staffIds, setStaffIds] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [dashSec, setDashSec] = useState("overview");

  // Initial data load
  useEffect(() => {
    DB.loadUsers().then(u => {
      setUsers(u);
      setStaffIds(u.filter(x => x.staffRole).map(x => x.id));
      setAppLoading(false);
    });
  }, []);

  // Load notifs + subscribe when logged in
  useEffect(() => {
    if (!cu || !sb) return;
    DB.loadNotifs(cu.id).then(setNotifs);
    const channel = sb.channel("notifs_" + cu.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `to_user_id=eq.${cu.id}` }, p => {
        const n = p.new;
        setNotifs(prev => [{ id: n.id, fromId: n.from_user_id, msg: n.msg, ts: new Date(n.created_at).getTime(), read: false }, ...prev]);
      }).subscribe();
    return () => sb.removeChannel(channel);
  }, [cu?.id]);

  // Load comments when visiting a profile
  useEffect(() => {
    if (page !== "profile" || !profileId) return;
    DB.loadComments(profileId).then(comments => {
      setUsers(prev => prev.map(u => u.id === profileId ? { ...u, comments } : u));
    });
    if (!sb) return;
    const channel = sb.channel("comments_" + profileId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `profile_user_id=eq.${profileId}` }, p => {
        const c = p.new;
        const comment = { id: c.id, authorId: c.author_id, authorName: c.author_name, authorAvatar: c.author_avatar, text: c.text, timestamp: new Date(c.created_at).getTime() };
        setUsers(prev => prev.map(u => u.id === profileId ? { ...u, comments: [comment, ...u.comments.filter(x => x.id !== c.id)] } : u));
      }).subscribe();
    return () => sb.removeChannel(channel);
  }, [page, profileId]);

  const nav = (p, id = null) => { setPage(p); if (id) setProfileId(id); };

  // Mutate user in state + DB
  const mutUser = async (id, updates) => {
    const current = users.find(u => u.id === id);
    if (!current) return;
    const updated = { ...current, ...updates };
    setUsers(prev => prev.map(u => u.id === id ? updated : u));
    setCu(prev => prev?.id === id ? { ...prev, ...updates } : prev);
    await DB.upsertUser(updated);
  };

  const updatePage = async (uid, pageUpd) => {
    const target = users.find(u => u.id === uid);
    if (!target) return;
    const updated = { ...target, page: { ...target.page, ...pageUpd } };
    setUsers(prev => prev.map(u => u.id === uid ? updated : u));
    setCu(prev => prev?.id === uid ? updated : prev);
    await DB.upsertUser(updated);
    for (const fid of target.followers.filter(f => f !== uid)) await DB.addNotif(fid, uid, "updated their page");
  };

  const updateProfile = async (uid, upd) => {
    const target = users.find(u => u.id === uid);
    await mutUser(uid, upd);
    if (target) for (const fid of target.followers.filter(f => f !== uid)) await DB.addNotif(fid, uid, "updated their profile");
  };

  const handleFollow = async (targetId) => {
    if (!cu) return;
    const me = cu.id;
    const target = users.find(u => u.id === targetId);
    const meUser = users.find(u => u.id === me);
    if (!target || !meUser) return;
    const isFollowing = target.followers.includes(me);
    if (isFollowing) {
      const uT = { ...target, followers: target.followers.filter(x => x !== me) };
      const uM = { ...meUser, following: meUser.following.filter(x => x !== targetId) };
      setUsers(prev => prev.map(u => u.id === targetId ? uT : u.id === me ? uM : u));
      setCu(prev => prev?.id === me ? uM : prev);
      await DB.upsertUser(uT); await DB.upsertUser(uM);
    } else {
      const uT = { ...target, followers: [...target.followers, me] };
      const uM = { ...meUser, following: [...meUser.following, targetId] };
      setUsers(prev => prev.map(u => u.id === targetId ? uT : u.id === me ? uM : u));
      setCu(prev => prev?.id === me ? uM : prev);
      await DB.upsertUser(uT); await DB.upsertUser(uM);
      await DB.addNotif(targetId, me, "started following you");
    }
  };

  const handleComment = async (profileUserId, text) => {
    if (!cu) return;
    const c = { id: gid(), profileUserId, authorId: cu.id, authorName: cu.displayName, authorAvatar: cu.avatar, text, timestamp: Date.now() };
    setUsers(prev => prev.map(u => u.id === profileUserId ? { ...u, comments: [c, ...u.comments] } : u));
    await DB.addComment(c);
    if (profileUserId !== cu.id) await DB.addNotif(profileUserId, cu.id, "commented on your profile");
  };

  const handleDelComment = async (profileUserId, commentId) => {
    setUsers(prev => prev.map(u => u.id === profileUserId ? { ...u, comments: u.comments.filter(c => c.id !== commentId) } : u));
    await DB.deleteComment(commentId);
  };

  const awardBadge  = async (uid, bid) => { const t = users.find(u => u.id === uid); if (t && !t.badges.includes(bid)) await mutUser(uid, { badges: [...t.badges, bid] }); };
  const revokeBadge = async (uid, bid) => { const t = users.find(u => u.id === uid); if (t) await mutUser(uid, { badges: t.badges.filter(b => b !== bid) }); };

  const delUser = async (id) => {
    if (id === "owner") return;
    setUsers(prev => prev.filter(u => u.id !== id));
    setStaffIds(prev => prev.filter(s => s !== id));
    await DB.deleteUser(id);
    if (page === "profile" && profileId === id) nav("members");
  };

  const handleAuth = async (username, password, displayName) => {
    if (authMode === "login") {
      const u = users.find(u => u.username === username && u.password === password);
      if (u) { setCu(u); setShowAuth(false); return null; }
      return "Invalid username or password";
    } else {
      if (username.length < 3) return "Username must be at least 3 characters";
      if (password.length < 4) return "Password must be at least 4 characters";
      if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Letters, numbers and underscores only";
      if (users.find(u => u.username === username)) return "That username is already taken";
      const nu = { id: "u" + Date.now(), username, password, displayName: displayName || username, avatar: "🌟", bio: "New to Nova 💫", isOwner: false, staffRole: null, joined: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }), followers: [], following: [], badges: [], comments: [], status: { type: "online", activity: "Just joined Nova! 🚀" }, page: { music: [], clips: [], social: [], accent: "#00D4FF" } };
      setUsers(prev => [...prev, nu]);
      setCu(nu);
      await DB.upsertUser(nu);
      setShowAuth(false);
      return null;
    }
  };

  const profileUser = users.find(u => u.id === profileId);
  const staffUsers  = users.filter(u => staffIds.includes(u.id));

  // Loading screen
  if (appLoading) return <>
    <style>{CSS}</style><Starfield />
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 18, display: "inline-block", animation: "float 2s ease-in-out infinite" }}>💫</div>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, color: "#334155", letterSpacing: ".2em" }}>LOADING NOVA...</div>
      </div>
    </div>
  </>;

  // Setup screen if Supabase not configured
  if (!sb) return <>
    <style>{CSS}</style><Starfield />
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 500, textAlign: "center", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "40px 36px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
        <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 20, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>Supabase Setup Required</h2>
        <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>Open <code style={{ color: "#00D4FF" }}>src/App.jsx</code> and replace the two placeholder values at the very top of the file with your credentials from <strong style={{ color: "#94A3B8" }}>supabase.com</strong>.</p>
        <div style={{ background: "rgba(0,0,0,.35)", borderRadius: 10, padding: "14px 18px", textAlign: "left" }}>
          <code style={{ fontSize: 12, color: "#00D4FF", display: "block", marginBottom: 6 }}>const SB_URL = "YOUR_SUPABASE_URL_HERE"</code>
          <code style={{ fontSize: 12, color: "#A78BFA" }}>const SB_ANON = "YOUR_SUPABASE_ANON_KEY_HERE"</code>
        </div>
      </div>
    </div>
  </>;

  return <>
    <style>{CSS}</style><Starfield />
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      <Navbar cu={cu} onLogin={() => { setAuthMode("login"); setShowAuth(true); }} onRegister={() => { setAuthMode("register"); setShowAuth(true); }} onLogout={() => { setCu(null); setNotifs([]); setPage("home"); }} nav={nav} page={page} notifs={notifs} onReadNotifs={async () => { setNotifs(p => p.map(n => ({ ...n, read: true }))); await DB.markNotifsRead(cu?.id); }} onClearNotifs={async () => { setNotifs([]); await DB.clearNotifs(cu?.id); }} users={users} />
      <div style={{ paddingTop: 62 }}>
        {page === "home" && <HomePage discordUrl={discordUrl} staffUsers={staffUsers} nav={nav} users={users} />}
        {page === "members" && <MembersPage users={users} nav={nav} />}
        {page === "profile" && profileUser && <ProfilePage user={profileUser} cu={cu} onUpdatePage={updatePage} onUpdateProfile={updateProfile} onFollow={handleFollow} onComment={handleComment} onDelComment={handleDelComment} />}
        {page === "profile" && !profileUser && <div style={{ textAlign: "center", padding: "100px 20px" }}><div style={{ fontSize: 48, marginBottom: 16 }}>🌌</div><div style={{ fontFamily: "'Orbitron',sans-serif", color: "#475569" }}>Profile not found</div></div>}
        {page === "dashboard" && cu?.isOwner && <Dashboard users={users} staffIds={staffIds} setStaffIds={setStaffIds} discordUrl={discordUrl} setDiscordUrl={setDiscordUrl} onDelUser={delUser} onUpdateUser={mutUser} onAwardBadge={awardBadge} onRevokeBadge={revokeBadge} section={dashSec} setSection={setDashSec} navigate={nav} />}
        {page === "dashboard" && !cu?.isOwner && <div style={{ textAlign: "center", padding: "100px 20px" }}><div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div><div style={{ fontFamily: "'Orbitron',sans-serif", color: "#475569" }}>Owner access only</div></div>}
      </div>
    </div>
    {showAuth && <AuthModal mode={authMode} setMode={setAuthMode} onSubmit={handleAuth} onClose={() => setShowAuth(false)} />}
  </>;
}
