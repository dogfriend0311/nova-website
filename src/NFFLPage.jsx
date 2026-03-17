import React, { useState, useEffect, useRef, useCallback } from "react";

// Placeholder NFFLPage component
function NFFLPage({ supabaseUrl, supabaseKey, sb, nav }) {
  const [tab, setTab] = useState("members"); // members | feed | transactions | dashboard
  const [loading, setLoading] = useState(false);

  const S = {
    container: { maxWidth: 1080, margin: "0 auto", padding: "44px 16px 80px" },
    header: {
      fontSize: 24,
      fontWeight: 700,
      fontFamily: "'Orbitron',sans-serif",
      background: "linear-gradient(135deg,#fff 0%,#CC0000 50%,#FF6B6B 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: 8
    },
    tabButton: (isActive) => ({
      padding: "8px 16px",
      borderRadius: 20,
      cursor: "pointer",
      fontSize: 12,
      fontFamily: "'Rajdhani',sans-serif",
      fontWeight: 700,
      border: isActive ? "1px solid rgba(204,0,0,.5)" : "1px solid rgba(255,255,255,.1)",
      background: isActive ? "rgba(204,0,0,.12)" : "rgba(255,255,255,.03)",
      color: isActive ? "#CC0000" : "#94A3B8",
      transition: "all .2s"
    }),
    card: {
      background: "rgba(255,255,255,.02)",
      border: "1px solid rgba(255,255,255,.07)",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16
    },
    heading: {
      fontSize: 18,
      fontWeight: 700,
      color: "#E2E8F0",
      marginBottom: 16,
      fontFamily: "'Orbitron',sans-serif"
    }
  };

  return (
    <div style={S.container}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={S.header}>🏈 NFFL</div>
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>
          NOVA FOOTBALL FUSION LEAGUE · Manage your roster, track scores, and dominate the competition
        </div>
      </div>

export default function NFFLPage() {
  const [tab, setTab] = useState("members");

  const tabs = [
    { id: "members", label: "👥 Roster" },
    { id: "feed", label: "📡 Game Feed" },
    { id: "transactions", label: "📋 Transactions" },
  ];

  const S = {
    wrap: { padding: "44px 16px 80px", background: "linear-gradient(180deg,rgba(15,23,42,.8),rgba(15,23,42,.95))", minHeight: "100vh" },
    tabRow: { display: "flex", gap: 8, flexWrap: "wrap" },
    tab: (isActive) => ({ padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "'Orbitron',sans-serif", fontWeight: 700, border: `1px solid ${isActive ? "rgba(204,0,0,.5)" : "rgba(255,255,255,.1)"}`, background: isActive ? "rgba(204,0,0,.12)" : "rgba(255,255,255,.03)", color: isActive ? "#CC0000" : "#94A3B8", transition: "all .2s" }),
  };

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
