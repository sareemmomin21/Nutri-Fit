// src/pages/GamePage.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function GamePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("nutrifit_user_id");

  // --------------------
  // Loading & Tab States
  // --------------------
  const [isLoading, setIsLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // --------------------
  // Overview Data States
  // --------------------
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [badges, setBadges] = useState([]);

  // --------------------
  // Weekly Challenges
  // --------------------
  const [weeklyChallenges, setWeeklyChallenges] = useState([]);
  const [customChallengeText, setCustomChallengeText] = useState("");

  // --------------------
  // Friends & Search
  // --------------------
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // --------------------
  // Fetch Overview
  // --------------------
  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const [streakRes, badgesRes] = await Promise.all([
        fetch("/api/get_streak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }),
        fetch("/api/get_badges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }),
      ]);

      if (streakRes.ok) {
        setStreak(await streakRes.json());
      }
      if (badgesRes.ok) {
        setBadges(await badgesRes.json());
      }
    } catch (err) {
      console.error("Overview fetch error:", err);
    } finally {
      setOverviewLoading(false);
    }
  }, [userId]);

  // --------------------
  // Fetch Weekly Challenges
  // --------------------
  const fetchChallenges = useCallback(async () => {
    setChallengesLoading(true);
    try {
      const res = await fetch("/api/get_weekly_challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (res.ok) {
        setWeeklyChallenges(await res.json());
      }
    } catch (err) {
      console.error("Challenges fetch error:", err);
    } finally {
      setChallengesLoading(false);
    }
  }, [userId]);

  // --------------------
  // Fetch Friends List
  // --------------------
  const fetchFriends = useCallback(async () => {
    setFriendsLoading(true);
    try {
      const res = await fetch("/api/get_friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (res.ok) {
        setFriends(await res.json());
      }
    } catch (err) {
      console.error("Friends fetch error:", err);
    } finally {
      setFriendsLoading(false);
    }
  }, [userId]);

  // --------------------
  // Search for Users to Add
  // --------------------
  const fetchUserSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch("/api/search_users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, query: searchQuery }),
      });
      if (res.ok) {
        setSearchResults(await res.json());
      }
    } catch (err) {
      console.error("Search fetch error:", err);
    } finally {
      setSearchLoading(false);
    }
  }, [userId, searchQuery]);

  // --------------------
  // Add / Remove Friend
  // --------------------
  const handleAddFriend = async (friendId) => {
    try {
      const res = await fetch("/api/add_friend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, friend_id: friendId }),
      });
      if (res.ok) {
        await fetchFriends();
        await fetchUserSearch();
      } else {
        console.error("Add friend failed", await res.json());
      }
    } catch (err) {
      console.error("Network error adding friend:", err);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      const res = await fetch("/api/remove_friend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, friend_id: friendId }),
      });
      if (res.ok) {
        await fetchFriends();
      } else {
        console.error("Remove friend failed", await res.json());
      }
    } catch (err) {
      console.error("Network error removing friend:", err);
    }
  };

  // --------------------
  // Toggle Challenge Complete
  // --------------------
  const handleToggleChallenge = async (challengeId) => {
    try {
      await fetch("/api/complete_challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, challenge_id: challengeId }),
      });
      setWeeklyChallenges((chs) =>
        chs.map((c) =>
          c.id === challengeId ? { ...c, completed: !c.completed } : c
        )
      );
      await fetchOverview();
    } catch (err) {
      console.error("Error toggling challenge:", err);
    }
  };

  // --------------------
  // Add Custom Challenge
  // --------------------
  const handleAddCustom = async () => {
    if (!customChallengeText.trim()) return;
    try {
      const res = await fetch("/api/add_custom_challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, title: customChallengeText }),
      });
      if (res.ok) {
        setCustomChallengeText("");
        await fetchChallenges();
      }
    } catch (err) {
      console.error("Add custom challenge error:", err);
    }
  };

  // --------------------
  // Initial Load
  // --------------------
  useEffect(() => {
    if (!userId) {
      navigate("/auth");
      return;
    }
    Promise.all([fetchOverview(), fetchChallenges(), fetchFriends()]).finally(
      () => setIsLoading(false)
    );
  }, [userId, navigate, fetchOverview, fetchChallenges, fetchFriends]);

  // --------------------
  // Loading Screen
  // --------------------
  if (isLoading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>
          Loading your gamification dashboard...
        </p>
      </div>
    );
  }

  // --------------------
  // Main Render
  // --------------------
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
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <>
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
          </>
        )}

        {/* CHALLENGES */}
        {activeTab === "challenges" && (
          <>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>This Week’s Challenges</h2>
            </div>
            {challengesLoading ? (
              <div style={styles.sectionLoading}>
                Loading challenges…
              </div>
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
                      >
                        {c.completed ? "Completed ✓" : "Mark Complete"}
                      </button>
                    </div>
                  ))}
                </div>
                <div style={styles.customChallenge}>
                  <input
                    value={customChallengeText}
                    onChange={(e) =>
                      setCustomChallengeText(e.target.value)
                    }
                    placeholder="Add your own challenge…"
                    style={styles.customInput}
                  />
                  <button onClick={handleAddCustom} style={styles.customBtn}>
                    + Add
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* FRIENDS */}
        {activeTab === "friends" && (
          <>
            {friendsLoading ? (
              <div style={styles.sectionLoading}>Loading friends…</div>
            ) : (
              <>
                {/* Search */}
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Find Friends</h2>
                </div>
                <div style={styles.searchContainer}>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username or name…"
                    style={styles.searchInput}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") fetchUserSearch();
                    }}
                  />
                  <button
                    onClick={fetchUserSearch}
                    style={styles.searchBtn}
                    disabled={searchLoading}
                  >
                    {searchLoading ? "Searching…" : "Search"}
                  </button>
                </div>

                {/* Search Results */}
                {searchLoading ? (
                  <div style={styles.sectionLoading}>Searching…</div>
                ) : searchResults.length > 0 ? (
                  <div style={styles.resultsGrid}>
                    {searchResults.map((u) => (
                      <div key={u.id} style={styles.resultCard}>
                        <strong>{u.username}</strong>
                        {u.name && (
                          <div style={styles.resultName}>{u.name}</div>
                        )}
                        <button
                          onClick={() => handleAddFriend(u.id)}
                          style={styles.resultBtn}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  searchQuery.trim() && (
                    <p style={styles.emptyText}>No users found.</p>
                  )
                )}

                {/* My Friends */}
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>
                    My Friends ({friends.length})
                  </h2>
                </div>
                {friends.length === 0 ? (
                  <p style={styles.emptyText}>
                    You haven’t added any friends yet.
                  </p>
                ) : (
                  <div style={styles.friendsGrid}>
                    {friends.map((f) => (
                      <div key={f.id} style={styles.friendCard}>
                        <strong style={styles.friendHeader}>
                          {f.name || f.username}
                        </strong>
                        <button
                          onClick={() => handleRemoveFriend(f.id)}
                          style={styles.removeBtn}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
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
  removeBtn: {
    marginTop: "0.75rem",
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
};

// Global keyframes
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `@keyframes spin {0% {transform: rotate(0deg);}100% {transform: rotate(360deg);}}`,
  styleSheet.cssRules.length
);
