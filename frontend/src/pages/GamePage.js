// src/pages/GamePage.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function GamePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("nutrifit_user_id");

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Overview data
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [badges, setBadges] = useState([]);

  // Weekly challenges
  const [weeklyChallenges, setWeeklyChallenges] = useState([]);
  const [customChallengeText, setCustomChallengeText] = useState("");

  // Friends progress
  const [friends, setFriends] = useState([]);

  // Fetch functions
  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const [streakRes, badgeRes] = await Promise.all([
        fetch("/api/get_streak", {
          method: "POST", headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ user_id: userId }),
        }),
        fetch("/api/get_badges", {
          method: "POST", headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ user_id: userId }),
        }),
      ]);
      if (streakRes.ok) {
        const s = await streakRes.json();
        setStreak(s);
      }
      if (badgeRes.ok) {
        const b = await badgeRes.json();
        setBadges(b);
      }
    } catch (err) {
      console.error("Overview fetch error:", err);
    } finally {
      setOverviewLoading(false);
    }
  }, [userId]);

  const fetchChallenges = useCallback(async () => {
    setChallengesLoading(true);
    try {
      const res = await fetch("/api/get_weekly_challenges", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ user_id: userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setWeeklyChallenges(data);
      }
    } catch (err) {
      console.error("Challenges fetch error:", err);
    } finally {
      setChallengesLoading(false);
    }
  }, [userId]);

  const fetchFriends = useCallback(async () => {
    setFriendsLoading(true);
    try {
      const res = await fetch("/api/get_friends_progress", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ user_id: userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (err) {
      console.error("Friends fetch error:", err);
    } finally {
      setFriendsLoading(false);
    }
  }, [userId]);

  // Complete a challenge
  const handleToggleChallenge = async (id) => {
    try {
      await fetch("/api/complete_challenge", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ user_id: userId, challenge_id: id }),
      });
      // Optimistically update:
      setWeeklyChallenges((chs) =>
        chs.map((c) =>
          c.id === id ? { ...c, completed: !c.completed } : c
        )
      );
      // Maybe re-fetch overview (new badge?) 
      fetchOverview();
    } catch (err) {
      console.error("Complete challenge error:", err);
    }
  };

  // Add a custom challenge
  const handleAddCustom = async () => {
    if (!customChallengeText.trim()) return;
    try {
      await fetch("/api/add_custom_challenge", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ user_id: userId, title: customChallengeText }),
      });
      setCustomChallengeText("");
      fetchChallenges();
    } catch (err) {
      console.error("Add custom challenge error:", err);
    }
  };

  // Initial load
  useEffect(() => {
    if (!userId) {
      navigate("/auth");
      return;
    }
    Promise.all([fetchOverview(), fetchChallenges(), fetchFriends()]).finally(
      () => setIsLoading(false)
    );
  }, [userId, navigate, fetchOverview, fetchChallenges, fetchFriends]);

  if (isLoading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading your gamification dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      {/* Welcome */}
      <div style={styles.welcomeBanner}>
        <h1 style={styles.welcomeText}>Welcome back!</h1>
        <p style={styles.welcomeSub}>
          Keep up your streak and challenge yourself today.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabNavContainer}>
        {["overview", "challenges", "friends"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tabButton,
              borderBottom:
                activeTab === tab
                  ? "3px solid #48bb78"
                  : "3px solid transparent",
              color: activeTab === tab ? "#48bb78" : "#718096",
            }}
          >
            {tab === "overview"
              ? "Overview"
              : tab === "challenges"
              ? "Challenges"
              : "Friends"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {/* Overview */}
        {activeTab === "overview" && (
          <div>
            {overviewLoading ? (
              <div style={styles.sectionLoading}>Loading overview…</div>
            ) : (
              <div style={styles.overviewGrid}>
                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>Current Streak</h2>
                  <p style={styles.streakNumber}>{streak.current} days</p>
                </div>
                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>Best Streak</h2>
                  <p style={styles.streakNumber}>{streak.best} days</p>
                </div>
                <div style={styles.cardFull}>
                  <h2 style={styles.cardTitle}>Badges Earned</h2>
                  <div style={styles.badgesContainer}>
                    {badges.length === 0 && (
                      <p style={styles.emptyText}>No badges yet.</p>
                    )}
                    {badges.map((b) => (
                      <div key={b.id} style={styles.badge}>
                        <div style={styles.badgeIcon}>🏅</div>
                        <div>{b.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Challenges */}
        {activeTab === "challenges" && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>This Week’s Challenges</h2>
            </div>
            {challengesLoading ? (
              <div style={styles.sectionLoading}>Loading challenges…</div>
            ) : (
              <>
                {weeklyChallenges.length === 0 && (
                  <p style={styles.emptyText}>
                    No challenges assigned this week.
                  </p>
                )}
                <div style={styles.challengesGrid}>
                  {weeklyChallenges.map((c) => (
                    <div key={c.id} style={styles.challengeCard}>
                      <h3 style={styles.challengeTitle}>{c.title}</h3>
                      <p style={styles.challengeDesc}>{c.description}</p>
                      <button
                        onClick={() => handleToggleChallenge(c.id)}
                        style={{
                          ...styles.challengeBtn,
                          backgroundColor: c.completed
                            ? "#48bb78"
                            : "#3182ce",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.opacity = 0.8)
                        }
                        onMouseOut={(e) => (e.target.style.opacity = 1)}
                      >
                        {c.completed ? "Completed ✓" : "Mark Complete"}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Custom challenge */}
                <div style={styles.customChallenge}>
                  <input
                    value={customChallengeText}
                    onChange={(e) =>
                      setCustomChallengeText(e.target.value)
                    }
                    placeholder="Add your own challenge…"
                    style={styles.customInput}
                  />
                  <button
                    onClick={handleAddCustom}
                    style={styles.customBtn}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#2f855a")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#48bb78")
                    }
                  >
                    + Add
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Friends */}
        {activeTab === "friends" && (
          <div>
            {friendsLoading ? (
              <div style={styles.sectionLoading}>Loading friends…</div>
            ) : (
              <>
                {friends.length === 0 && (
                  <p style={styles.emptyText}>
                    You haven’t added any friends yet.
                  </p>
                )}
                <div style={styles.friendsGrid}>
                  {friends.map((f) => (
                    <div key={f.id} style={styles.friendCard}>
                      <div style={styles.friendHeader}>
                        <strong>{f.name}</strong>
                      </div>
                      <p>Streak: {f.streak} days</p>
                      <p>Badges: {f.badges_count}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline styles object
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
  loadingText: {
    color: "#718096",
    fontSize: "16px",
  },
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
  welcomeText: {
    margin: 0,
    color: "#22543d",
    fontSize: "24px",
  },
  welcomeSub: {
    margin: "0.5rem 0 0",
    color: "#22543d",
  },
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
  sectionLoading: {
    textAlign: "center",
    color: "#718096",
  },
  emptyText: {
    color: "#718096",
    fontStyle: "italic",
    textAlign: "center",
    padding: "1rem 0",
  },

  // Overview
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
  badgeIcon: {
    fontSize: "28px",
    marginBottom: "0.5rem",
  },

  // Challenges
  sectionHeader: {
    marginBottom: "1rem",
  },
  sectionTitle: {
    margin: 0,
    color: "#2d3748",
    fontSize: "20px",
  },
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
  challengeTitle: {
    margin: "0 0 0.5rem",
    color: "#2d3748",
  },
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

  // Friends
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
};

// simple keyframes for spinner (add into a global <style> somewhere)
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`, styleSheet.cssRules.length);
