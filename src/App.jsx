import React, { useState, useEffect } from "react";
import { sb, gid, getSess, saveSess, clearSess, useIsMobile, CSS } from "./shared";
import { Starfield } from "./UI";
import Navbar from "./Navbar";
import HomePage from "./HomePage";
import MembersPage from "./MemberPage";
import FeedPage from "./FeedPage";
import GameDetailPage from "./GameDetailPage";
import PredictPage from "./PredictPage";
import StatsPage from "./StatsPage";
import NewsPage from "./NewsPage";
import { BaseballLeaguePage, MessagesPage } from "./LeaguePage";
import { LoginModal, RegisterModal } from "./AuthModals";
import CardsPage from "./CardsPage";
import TriviaPage from "./TriviaPage";
import LeaderboardPage from "./LeaderboardPage";
import ProfilePage from "./ProfilePage";
import DashboardPage from "./DashboardPage";
import AnimeCardGame from "./AnimeCardGame"; // ensure this exists
import RTTSMode from "./RTTS";

export default function App() {
  const DISCORD_URL = "https://discord.gg/your-invite-here";
  const [cu, setCu] = useState(() => getSess());
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState("home");
  const [profileId, setProfileId] = useState(null);
  const [gameRef, setGameRef] = useState(null);
  const [statsPlayerRef, setStatsPlayerRef] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [likes, setLikes] = useState({});
  const [msgUnread, setMsgUnread] = useState(0);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [us, ls] = await Promise.all([
      sb.get("nova_users", "?order=joined.asc"),
      sb.get("nova_clip_likes", "?order=ts.desc"),
    ]);
    if (us) setUsers(us);
    if (ls) {
      const map = {};
      ls.forEach(l => {
        if (!map[l.clip_id]) map[l.clip_id] = [];
        map[l.clip_id].push(l.user_id);
      });
      setLikes(map);
    }
  };

  useEffect(() => {
    if (!cu) return;
    const loadNotifs = async () => {
      const data = await sb.get("nova_notifications", `?to_user_id=eq.${cu.id}&order=ts.desc&limit=30`);
      if (data) setNotifs(data);
    };
    loadNotifs();
    const t = setInterval(loadNotifs, 15000);
    return () => clearInterval(t);
  }, [cu?.id]);

  useEffect(() => {
    if (!cu) return;
    const loadConvs = async () => {
      const data = await sb.get("nova_conversations", `?members=cs.{${cu.id}}`);
      if (data) setConversations(data);
    };
    loadConvs();
  }, [cu?.id]);

  useEffect(() => {
    if (!cu || !conversations.length) return;
    const unread = conversations.filter(c => {
      const msgs = messages.filter(m => m.conv_id === c.id);
      if (!msgs.length) return c.last_msg && c.last_sender && c.last_sender !== cu.display_name;
      const last = msgs[msgs.length - 1];
      return last && last.author_id !== cu.id;
    }).length;
    setMsgUnread(unread);
  }, [conversations, messages, cu?.id]);

  const [navOpts, setNavOpts] = useState({});
  const nav = (p, id, opts = {}) => {
    if (p === "profile" && id) setProfileId(id);
    if (p === "game" && id) setGameRef(id);
    if (p === "stats" && id?.playerId) setStatsPlayerRef(id);
    if ((p === "predict" || p === "news") && !id) return nav("hub");
    setNavOpts(opts);
    setPage(p);
  };

  const addNotif = async (toId, fromId, msg, meta = null) => {
    const n = { id: gid(), to_user_id: toId, from_user_id: fromId, msg, ts: Date.now(), read: false, meta };
    await sb.post("nova_notifications", n);
  };

  const handleLogin = u => { setCu(u); setShowLogin(false); };
  const handleRegister = u => { setCu(u); setShowRegister(false); setUsers(prev => [...prev, u]); };
  const handleLogout = () => { clearSess(); setCu(null); setPage("home"); };

  const readNotifs = async () => {
    const unread = notifs.filter(n => !n.read);
    if (!unread.length) return;
    await Promise.all(unread.map(n => sb.patch("nova_notifications", `?id=eq.${n.id}`, { read: true })));
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };
  const markOneNotif = async nid => {
    await sb.patch("nova_notifications", `?id=eq.${nid}`, { read: true });
    setNotifs(prev => prev.map(n => n.id === nid ? { ...n, read: true } : n));
  };
  const clearNotifs = async () => {
    if (!cu) return;
    await sb.del("nova_notifications", `?to_user_id=eq.${cu.id}`);
    setNotifs([]);
  };

  const handleLike = async (clipId, alreadyLiked) => {
    if (!cu) return;
    if (alreadyLiked) {
      await sb.del("nova_clip_likes", `?clip_id=eq.${clipId}&user_id=eq.${cu.id}`);
      setLikes(prev => ({ ...prev, [clipId]: (prev[clipId] || []).filter(id => id !== cu.id) }));
    } else {
      const l = { id: gid(), clip_id: clipId, user_id: cu.id, ts: Date.now() };
      await sb.post("nova_clip_likes", l);
      setLikes(prev => ({ ...prev, [clipId]: [...(prev[clipId] || []), cu.id] }));
    }
  };

  const staffUsers = users.filter(u => u.is_owner || u.staff_role);
  const mob = useIsMobile();

  const content = () => {
    if (page === "profile" && profileId)
      return <ProfilePage userId={profileId} cu={cu} users={users} setUsers={updater => { const next = typeof updater === "function" ? updater(users) : updater; setUsers(next); if (cu) { const up = next.find(x => x.id === cu.id); if (up) setCu(up); } }} navigate={nav} addNotif={addNotif} navOpts={navOpts} />;
    if (page === "news") return <NewsPage cu={cu} users={users} addNotif={addNotif} navOpts={navOpts} />;
    if (page === "members") return <MembersPage users={users} nav={nav} />;
    if (page === "feed") return <FeedPage users={users} cu={cu} likes={likes} onLike={handleLike} navigate={nav} />;
    if (page === "game" && gameRef) return <GameDetailPage gameId={gameRef.id} sport={gameRef.sport} navigate={nav} />;
    if (page === "predict") return <PredictPage cu={cu} users={users} setUsers={setUsers} navigate={nav} />;
    if (page === "hub") return <HubPage cu={cu} users={users} setUsers={setUsers} navigate={nav} />;
    if (page === "stats") return <StatsPage navigate={nav} initPlayer={statsPlayerRef?.id || null} initSport={statsPlayerRef?.sport || null} />;
    if (page === "nbbl") return <BaseballLeaguePage cu={cu} users={users} navigate={nav} />;
    if (page === "cards") return <CardsPage cu={cu} />;
    if (page === "trivia") return <TriviaPage cu={cu} />;
    if (page === "leaderboard") return <LeaderboardPage users={users} navigate={nav} />;
    if (page === "messages") return <MessagesPage cu={cu} users={users} conversations={conversations} setConversations={setConversations} messages={messages} setMessages={setMessages} />;
    if (page === "dashboard") return <DashboardPage cu={cu} users={users} setUsers={updater => { const next = typeof updater === "function" ? updater(users) : updater; setUsers(next); if (cu) { const up = next.find(x => x.id === cu.id); if (up) setCu(up); } }} navigate={nav} />;
    if (page === "animecards") return <AnimeCardGame cu={cu} navigate={nav} />;
    if (page === "rtts") return <RTTSMode cu={cu} />;
    return <HomePage discordUrl={DISCORD_URL} staffUsers={staffUsers} nav={nav} users={users} />;
  };

  return (
    <>
      <style>{CSS}</style>
      <Starfield />
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", paddingTop: 62, paddingBottom: mob && page !== "feed" ? 58 : 0 }}>
        <Navbar cu={cu} onLogin={() => setShowLogin(true)} onRegister={() => setShowRegister(true)} onLogout={handleLogout} nav={nav} page={page} notifs={notifs} onReadNotifs={readNotifs} onClearNotifs={clearNotifs} onMarkOneNotif={markOneNotif} users={users} msgUnread={msgUnread} />
        {content()}
      </div>
      {showLogin && <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} users={users} />}
      {showRegister && <RegisterModal onRegister={handleRegister} onClose={() => setShowRegister(false)} />}
    </>
  );
}