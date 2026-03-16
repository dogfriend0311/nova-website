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
          Nova Fantasy Football League · Manage your roster, track scores, and dominate the competition
        </div>
      </div>

      {/* Tab buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          ["members", "👥 Members"],
          ["feed", "📡 Game Feed"],
          ["transactions", "📋 Transactions"],
          ["dashboard", "⚙️ Dashboard"]
        ].map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={S.tabButton(tab === t)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content sections */}
      {tab === "members" && (
        <div style={S.card}>
          <div style={S.heading}>League Members</div>
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>No league members yet</div>
            <div style={{ fontSize: 12, color: "#334155" }}>
              Create a league and invite members to get started
            </div>
          </div>
        </div>
      )}

      {tab === "feed" && (
        <div style={S.card}>
          <div style={S.heading}>Game Feed</div>
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>No games scheduled</div>
            <div style={{ fontSize: 12, color: "#334155" }}>
              Check back during the NFL season for live game updates
            </div>
          </div>
        </div>
      )}

      {tab === "transactions" && (
        <div style={S.card}>
          <div style={S.heading}>League Transactions</div>
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>No transactions yet</div>
            <div style={{ fontSize: 12, color: "#334155" }}>
              All trades, signings, and roster moves will appear here
            </div>
          </div>
        </div>
      )}

      {tab === "dashboard" && (
        <div style={S.card}>
          <div style={S.heading}>Owner Dashboard</div>
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>Dashboard access restricted</div>
            <div style={{ fontSize: 12, color: "#334155" }}>
              League owners only. Contact the league admin for access
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NFFLPage;
