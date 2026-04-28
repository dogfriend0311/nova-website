import React from "react";
import NFFLPage from "./NFFLPage";
import MessagesPage from "./MessagesPage";
import { LoginModal, RegisterModal } from "./AuthModals";

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

function NBBLPage({ cu, users, navigate }) {
  return (
    <div style={{ padding: "20px", background: "#0a0a0a", minHeight: "100vh" }}>
      <h1 style={{ color: "#fff" }}>NBBL</h1>
      <p style={{ color: "#aaa" }}>Coming soon...</p>
    </div>
  );
}

function RingRushPage({ cu, users, navigate }) {
  return (
    <div style={{ padding: "20px", background: "#0a0a0a", minHeight: "100vh" }}>
      <h1 style={{ color: "#fff" }}>Ring Rush</h1>
      <p style={{ color: "#aaa" }}>Coming soon...</p>
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

function LeaguePlayersPage({ cu, users, navigate }) {
  return (
    <div style={{ padding: "20px", background: "#0a0a0a", minHeight: "100vh" }}>
      <h1 style={{ color: "#fff" }}>League Players</h1>
      <p style={{ color: "#aaa" }}>Coming soon...</p>
    </div>
  );
}

export { NFFLPage, NBBLPage, RingRushPage, MessagesPage, LoginModal, RegisterModal, LeaguePlayersPage };
