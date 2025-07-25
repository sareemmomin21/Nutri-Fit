// src/pages/GamePage.js
import React, { useState } from "react";
import OverviewPage from "./OverviewPage";
import ChallengesPage from "./ChallengesPage";
import FriendsPage from "./FriendsPage";
import { useNavigate } from "react-router-dom";

export default function GamePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("nutrifit_user_id");
  const [activeTab, setActiveTab] = useState("overview");

  if (!userId) {
    navigate("/auth");
    return null;
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, color: "#22543d", fontSize: "24px" }}>Welcome back!</h1>
        <p style={{ margin: "0.5rem 0 0", color: "#22543d" }}>
          Keep up your streak and challenge yourself today.
        </p>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: "1rem" }}>
        {["overview", "challenges", "friends"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              borderBottom: activeTab === t ? "3px solid #48bb78" : "3px solid transparent",
              color: activeTab === t ? "#48bb78" : "#718096",
              transition: "all 0.2s",
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ backgroundColor: "white", borderRadius: "0 0 12px 12px", border: "1px solid #e2e8f0", padding: "2rem" }}>
        {activeTab === "overview" && <OverviewPage userId={userId} />}
        {activeTab === "challenges" && <ChallengesPage userId={userId} />}
        {activeTab === "friends" && <FriendsPage userId={userId} />}
      </div>
    </div>
  );
}
