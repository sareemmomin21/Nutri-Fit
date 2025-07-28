// src/pages/GamePage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OverviewPage from "./OverviewPage";
import ChallengesPage from "./ChallengesPage";
import FriendsPage from "./FriendsPage";

export default function GamePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("nutrifit_user_id");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!userId) {
      navigate("/auth");
    }
  }, [userId, navigate]);

  if (!userId) {
    return null;
  }

  return (
    <div style={styles.pageWrapper}>
      {/* Welcome Banner */}
      <div style={styles.welcomeBanner}>
        <h1 style={styles.welcomeText}>Welcome back!</h1>
        <p style={styles.welcomeSub}>
          Keep up your streak and challenge yourself today.
        </p>
      </div>

      {/* Tabs */}
      <div style={styles.tabNavContainer}>
        {["overview", "challenges", "friends"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              ...styles.tabButton,
              borderBottom:
                activeTab === t
                  ? "3px solid #48bb78"
                  : "3px solid transparent",
              color: activeTab === t ? "#48bb78" : "#718096",
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.tabContent}>
        {activeTab === "overview" && <OverviewPage userId={userId} />}
        {activeTab === "challenges" && <ChallengesPage userId={userId} />}
        {activeTab === "friends" && <FriendsPage userId={userId} />}
      </div>
    </div>
  );
}

// --------------------
// Styles (same as before)
// --------------------
const styles = {
  loadingWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    fontFamily: "Arial, sans-serif",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #48bb78",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  loadingText: { color: "#718096", fontSize: "16px" },
  pageWrapper: {
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  welcomeBanner: {
    backgroundColor: "#f0fff4",
    border: "1px solid #9ae6b4",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "2rem",
  },
  welcomeText: { margin: 0, color: "#22543d", fontSize: "24px" },
  welcomeSub: { margin: "0.5rem 0 0", color: "#22543d" },
  tabNavContainer: {
    display: "flex",
    borderBottom: "1px solid #e2e8f0",
    marginBottom: "1rem",
  },
  tabButton: {
    flex: 1,
    padding: "12px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "all 0.2s",
  },
  tabContent: {
    backgroundColor: "white",
    borderRadius: "0 0 12px 12px",
    border: "1px solid #e2e8f0",
    padding: "2rem",
  },
  sectionLoading: { textAlign: "center", color: "#718096" },
  sectionHeader: { marginBottom: "1rem" },
  sectionTitle: { margin: 0, color: "#2d3748", fontSize: "20px" },
  emptyText: {
    color: "#718096",
    fontStyle: "italic",
    textAlign: "center",
    padding: "1rem 0",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  },
  cardFull: {
    gridColumn: "1 / -1",
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  cardTitle: {
    margin: 0,
    marginBottom: "1rem",
    color: "#2d3748",
    fontSize: "18px",
  },
  streakNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#48bb78",
    margin: 0,
  },
  badgesContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
  },
  badge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "80px",
  },
  badgeIcon: { fontSize: "28px", marginBottom: "0.5rem" },
  challengesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  challengeCard: {
    backgroundColor: "#f9f9f9",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  challengeTitle: { margin: "0 0 0.5rem", color: "#2d3748" },
  challengeDesc: {
    margin: "0 0 1rem",
    color: "#4a5568",
    fontSize: "14px",
  },
  challengeBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "opacity 0.2s",
  },
  customChallenge: {
    display: "flex",
    gap: "0.5rem",
    maxWidth: "400px",
    margin: "0 auto",
  },
  customInput: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  customBtn: {
    padding: "8px 12px",
    backgroundColor: "#48bb78",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  searchContainer: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    marginBottom: "1rem",
  },
  searchInput: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  searchBtn: {
    padding: "8px 12px",
    backgroundColor: "#3182ce",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "opacity 0.2s",
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.75rem",
    marginBottom: "2rem",
  },
  resultCard: {
    backgroundColor: "#f9f9f9",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  },
  resultName: {
    fontSize: "13px",
    color: "#4a5568",
    margin: "0.5rem 0",
  },
  resultBtn: {
    padding: "6px 10px",
    backgroundColor: "#48bb78",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  friendsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  friendCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  friendHeader: {
    marginBottom: "0.5rem",
    fontSize: "16px",
    color: "#2d3748",
  },
  friendActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "0.75rem",
  },
  preferencesBtn: {
    padding: "6px 10px",
    backgroundColor: "#4299e1",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  removeBtn: {
    padding: "6px 10px",
    backgroundColor: "#e53e3e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "opacity 0.2s",
  },
  friendChallengeCard: {
    backgroundColor: "#f9f9f9",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginBottom: "1rem",
  },
  challengeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  challengeTitle: {
    margin: 0,
    color: "#2d3748",
    fontSize: "16px",
  },
  challengeFrom: {
    fontSize: "14px",
    color: "#718096",
  },
  challengeTo: {
    fontSize: "14px",
    color: "#718096",
  },
  challengeDesc: {
    margin: "0 0 1rem",
    color: "#4a5568",
    fontSize: "14px",
  },
  challengeActions: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  acceptBtn: {
    padding: "6px 10px",
    backgroundColor: "#48bb78",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  declineBtn: {
    padding: "6px 10px",
    backgroundColor: "#e53e3e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  progressSection: {
    marginTop: "1rem",
    marginBottom: "0.5rem",
  },
  progressBar: {
    height: "8px",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#48bb78",
    borderRadius: "4px",
  },
  progressText: {
    fontSize: "14px",
    color: "#4a5568",
    textAlign: "right",
    marginTop: "0.25rem",
  },
  progressControls: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  progressInput: {
    width: "60px",
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    textAlign: "center",
    fontSize: "14px",
  },
  completeBtn: {
    padding: "6px 10px",
    backgroundColor: "#48bb78",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  statusText: {
    fontSize: "14px",
    color: "#e53e3e",
    fontWeight: "bold",
    marginTop: "0.5rem",
  },
  completedText: {
    fontSize: "14px",
    color: "#48bb78",
    fontWeight: "bold",
    marginTop: "0.5rem",
  },
  sentChallengeCard: {
    backgroundColor: "#f9f9f9",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginBottom: "1rem",
  },
  challengeStatus: {
    fontSize: "14px",
    color: "#718096",
    marginTop: "0.5rem",
  },
  statusBadge: {
    padding: "4px 8px",
    backgroundColor: "#edf2f7",
    color: "#4299e1",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  createChallengeBtn: {
    padding: "6px 10px",
    backgroundColor: "#48bb78",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  createChallengeForm: {
    backgroundColor: "#f9f9f9",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginTop: "1rem",
  },
  formSelect: {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    marginBottom: "1rem",
  },
  formInput: {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    marginBottom: "1rem",
  },
  formTextarea: {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    marginBottom: "1rem",
    minHeight: "80px",
  },
  formRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  formLabel: {
    fontSize: "14px",
    color: "#4a5568",
    marginRight: "1rem",
  },
  formNumberInput: {
    width: "80px",
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    textAlign: "center",
    fontSize: "14px",
  },
  submitBtn: {
    padding: "8px 12px",
    backgroundColor: "#48bb78",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  subSectionTitle: {
    margin: "1.5rem 0 0.75rem",
    color: "#2d3748",
    fontSize: "18px",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "1rem",
  },
  modalTitle: {
    margin: 0,
    color: "#2d3748",
    fontSize: "22px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#718096",
  },
  preferencesContent: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  preferenceSection: {
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "1.5rem",
  },
  preferenceTitle: {
    margin: 0,
    color: "#2d3748",
    fontSize: "18px",
    marginBottom: "0.75rem",
  },
  preferenceGroup: {
    marginBottom: "0.75rem",
  },
  preferenceSubtitle: {
    margin: "0 0 0.5rem",
    color: "#4a5568",
    fontSize: "14px",
  },
  preferenceList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  likedItem: {
    backgroundColor: "#edf2f7",
    color: "#4299e1",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
  },
      dislikedItem: {
      backgroundColor: "#fdeded",
      color: "#e53e3e",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "bold",
    },
    goalItem: {
      backgroundColor: "#edf2f7",
      color: "#4299e1",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "bold",
    },
    styleItem: {
      backgroundColor: "#edf2f7",
      color: "#4299e1",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "bold",
    },
    preferenceValue: {
      fontSize: "14px",
      color: "#2d3748",
      fontWeight: "bold",
    },
    sectionDivider: {
      height: "1px",
      backgroundColor: "#e2e8f0",
      margin: "2rem 0",
    },
  };

// Global keyframes
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `@keyframes spin {0% {transform: rotate(0deg);}100% {transform: rotate(360deg);}}`,
  styleSheet.cssRules.length
);
