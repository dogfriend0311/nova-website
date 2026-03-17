import React, { useState, useEffect, useRef, useCallback } from "react";

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
