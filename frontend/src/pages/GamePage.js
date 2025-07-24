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
  // Friend Challenges
  // --------------------
  const [friendChallenges, setFriendChallenges] = useState({ received: [], sent: [] });
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    friend_id: '',
    title: '',
    description: '',
    max_progress: 100
  });

  // --------------------
  // Friends & Search
  // --------------------
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendPreferences, setFriendPreferences] = useState(null);

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
  // Fetch Friend Challenges
  // --------------------
  const fetchFriendChallenges = useCallback(async () => {
    try {
      const res = await fetch("/api/get_friend_challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (res.ok) {
        setFriendChallenges(await res.json());
      }
    } catch (err) {
      console.error("Friend challenges fetch error:", err);
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
  // Friend Challenge Functions
  // --------------------
  const handleCreateFriendChallenge = async () => {
    if (!newChallenge.friend_id || !newChallenge.title.trim()) return;
    
    try {
      const res = await fetch("/api/create_friend_challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          friend_id: newChallenge.friend_id,
          title: newChallenge.title,
          description: newChallenge.description,
          max_progress: newChallenge.max_progress
        }),
      });
      
      if (res.ok) {
        setNewChallenge({ friend_id: '', title: '', description: '', max_progress: 100 });
        setShowCreateChallenge(false);
        await fetchFriendChallenges();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to create challenge");
      }
    } catch (err) {
      console.error("Create challenge error:", err);
    }
  };

  const handleRespondToChallenge = async (challengeId, response) => {
    try {
      const res = await fetch("/api/respond_friend_challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          challenge_id: challengeId,
          response: response
        }),
      });
      
      if (res.ok) {
        await fetchFriendChallenges();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to respond to challenge");
      }
    } catch (err) {
      console.error("Respond to challenge error:", err);
    }
  };

  const handleUpdateProgress = async (challengeId, progress) => {
    try {
      const res = await fetch("/api/update_challenge_progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          challenge_id: challengeId,
          progress: progress
        }),
      });
      
      if (res.ok) {
        await fetchFriendChallenges();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to update progress");
      }
    } catch (err) {
      console.error("Update progress error:", err);
    }
  };

  // --------------------
  // Friend Preferences
  // --------------------
  const handleViewFriendPreferences = async (friendId) => {
    try {
      const res = await fetch("/api/get_friend_preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, friend_id: friendId }),
      });
      
      if (res.ok) {
        const preferences = await res.json();
        setFriendPreferences(preferences);
        setSelectedFriend(friends.find(f => f.id === friendId));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to load friend preferences");
      }
    } catch (err) {
      console.error("Get friend preferences error:", err);
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
    Promise.all([fetchOverview(), fetchChallenges(), fetchFriends(), fetchFriendChallenges()]).finally(
      () => setIsLoading(false)
    );
  }, [userId, navigate, fetchOverview, fetchChallenges, fetchFriends, fetchFriendChallenges]);

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
              <h2 style={styles.sectionTitle}>Personal Challenges</h2>
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

            {/* Friend Challenges Section */}
            <div style={styles.sectionDivider}></div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Friend Challenges</h2>
              <button 
                onClick={() => setShowCreateChallenge(!showCreateChallenge)}
                style={styles.createChallengeBtn}
              >
                {showCreateChallenge ? "Cancel" : "+ Create Challenge"}
              </button>
            </div>

            {/* Create Challenge Form */}
            {showCreateChallenge && (
              <div style={styles.createChallengeForm}>
                <select
                  value={newChallenge.friend_id}
                  onChange={(e) => setNewChallenge({...newChallenge, friend_id: e.target.value})}
                  style={styles.formSelect}
                >
                  <option value="">Select a friend...</option>
                  {friends.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name || f.username}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Challenge title..."
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                  style={styles.formInput}
                />
                <textarea
                  placeholder="Description (optional)..."
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                  style={styles.formTextarea}
                />
                <div style={styles.formRow}>
                  <label style={styles.formLabel}>
                    Max Progress: 
                    <input
                      type="number"
                      value={newChallenge.max_progress}
                      onChange={(e) => setNewChallenge({...newChallenge, max_progress: parseInt(e.target.value) || 100})}
                      style={styles.formNumberInput}
                      min="1"
                    />
                  </label>
                  <button onClick={handleCreateFriendChallenge} style={styles.submitBtn}>
                    Create Challenge
                  </button>
                </div>
              </div>
            )}

            {/* Received Challenges */}
            {friendChallenges.received.length > 0 && (
              <>
                <h3 style={styles.subSectionTitle}>Challenges from Friends</h3>
                <div style={styles.challengesGrid}>
                  {friendChallenges.received.map((c) => (
                    <div key={c.id} style={styles.friendChallengeCard}>
                      <div style={styles.challengeHeader}>
                        <h4 style={styles.challengeTitle}>{c.title}</h4>
                        <span style={styles.challengeFrom}>from {c.creator_name}</span>
                      </div>
                      <p style={styles.challengeDesc}>{c.description}</p>
                      
                      {c.status === 'pending' && (
                        <div style={styles.challengeActions}>
                          <button 
                            onClick={() => handleRespondToChallenge(c.id, 'accepted')}
                            style={styles.acceptBtn}
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleRespondToChallenge(c.id, 'declined')}
                            style={styles.declineBtn}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      
                      {c.status === 'accepted' && (
                        <div style={styles.progressSection}>
                          <div style={styles.progressBar}>
                            <div 
                              style={{
                                ...styles.progressFill,
                                width: `${(c.progress / c.max_progress) * 100}%`
                              }}
                            />
                          </div>
                          <p style={styles.progressText}>
                            {c.progress} / {c.max_progress}
                          </p>
                          <div style={styles.progressControls}>
                            <input
                              type="number"
                              min="0"
                              max={c.max_progress}
                              defaultValue={c.progress}
                              style={styles.progressInput}
                              onBlur={(e) => {
                                const newProgress = parseInt(e.target.value);
                                if (newProgress !== c.progress) {
                                  handleUpdateProgress(c.id, newProgress);
                                }
                              }}
                            />
                            <button 
                              onClick={() => handleUpdateProgress(c.id, c.max_progress)}
                              style={styles.completeBtn}
                            >
                              Complete
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {c.status === 'declined' && (
                        <p style={styles.statusText}>Declined</p>
                      )}
                      
                      {c.status === 'completed' && (
                        <p style={styles.completedText}>✓ Completed!</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Sent Challenges */}
            {friendChallenges.sent.length > 0 && (
              <>
                <h3 style={styles.subSectionTitle}>Challenges You Created</h3>
                <div style={styles.challengesGrid}>
                  {friendChallenges.sent.map((c) => (
                    <div key={c.id} style={styles.sentChallengeCard}>
                      <div style={styles.challengeHeader}>
                        <h4 style={styles.challengeTitle}>{c.title}</h4>
                        <span style={styles.challengeTo}>to {c.target_name}</span>
                      </div>
                      <p style={styles.challengeDesc}>{c.description}</p>
                      <div style={styles.challengeStatus}>
                        Status: <span style={styles.statusBadge}>{c.status}</span>
                      </div>
                      
                      {c.status === 'accepted' && (
                        <div style={styles.progressSection}>
                          <div style={styles.progressBar}>
                            <div 
                              style={{
                                ...styles.progressFill,
                                width: `${(c.progress / c.max_progress) * 100}%`
                              }}
                            />
                          </div>
                          <p style={styles.progressText}>
                            Progress: {c.progress} / {c.max_progress}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
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
                    You haven't added any friends yet.
                  </p>
                ) : (
                  <div style={styles.friendsGrid}>
                    {friends.map((f) => (
                      <div key={f.id} style={styles.friendCard}>
                        <strong style={styles.friendHeader}>
                          {f.name || f.username}
                        </strong>
                        <div style={styles.friendActions}>
                          <button
                            onClick={() => handleViewFriendPreferences(f.id)}
                            style={styles.preferencesBtn}
                          >
                            View Preferences
                          </button>
                          <button
                            onClick={() => handleRemoveFriend(f.id)}
                            style={styles.removeBtn}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Friend Preferences Modal */}
                {selectedFriend && friendPreferences && (
                  <div style={styles.modal}>
                    <div style={styles.modalContent}>
                      <div style={styles.modalHeader}>
                        <h3 style={styles.modalTitle}>
                          {selectedFriend.name || selectedFriend.username}'s Preferences
                        </h3>
                        <button 
                          onClick={() => {
                            setSelectedFriend(null);
                            setFriendPreferences(null);
                          }}
                          style={styles.closeBtn}
                        >
                          ×
                        </button>
                      </div>
                      
                      <div style={styles.preferencesContent}>
                        {/* Food Preferences */}
                        <div style={styles.preferenceSection}>
                          <h4 style={styles.preferenceTitle}>Food Preferences</h4>
                          
                          {friendPreferences.food_preferences.liked.length > 0 && (
                            <div style={styles.preferenceGroup}>
                              <h5 style={styles.preferenceSubtitle}>Likes:</h5>
                              <div style={styles.preferenceList}>
                                {friendPreferences.food_preferences.liked.map((item, index) => (
                                  <span key={index} style={styles.likedItem}>{item}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {friendPreferences.food_preferences.disliked.length > 0 && (
                            <div style={styles.preferenceGroup}>
                              <h5 style={styles.preferenceSubtitle}>Dislikes:</h5>
                              <div style={styles.preferenceList}>
                                {friendPreferences.food_preferences.disliked.map((item, index) => (
                                  <span key={index} style={styles.dislikedItem}>{item}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Workout Preferences */}
                        <div style={styles.preferenceSection}>
                          <h4 style={styles.preferenceTitle}>Workout Preferences</h4>
                          
                          {friendPreferences.workout_preferences.primary_focus && (
                            <div style={styles.preferenceGroup}>
                              <h5 style={styles.preferenceSubtitle}>Primary Focus:</h5>
                              <span style={styles.preferenceValue}>
                                {friendPreferences.workout_preferences.primary_focus}
                              </span>
                            </div>
                          )}
                          
                          {friendPreferences.workout_preferences.fitness_goals.length > 0 && (
                            <div style={styles.preferenceGroup}>
                              <h5 style={styles.preferenceSubtitle}>Fitness Goals:</h5>
                              <div style={styles.preferenceList}>
                                {friendPreferences.workout_preferences.fitness_goals.map((goal, index) => (
                                  <span key={index} style={styles.goalItem}>{goal}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {friendPreferences.workout_preferences.training_styles.length > 0 && (
                            <div style={styles.preferenceGroup}>
                              <h5 style={styles.preferenceSubtitle}>Training Styles:</h5>
                              <div style={styles.preferenceList}>
                                {friendPreferences.workout_preferences.training_styles.map((style, index) => (
                                  <span key={index} style={styles.styleItem}>{style}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div style={styles.preferenceGroup}>
                            <h5 style={styles.preferenceSubtitle}>Experience Level:</h5>
                            <span style={styles.preferenceValue}>
                              {friendPreferences.workout_preferences.fitness_experience || 'Not specified'}
                            </span>
                          </div>
                          
                          <div style={styles.preferenceGroup}>
                            <h5 style={styles.preferenceSubtitle}>Gym Membership:</h5>
                            <span style={styles.preferenceValue}>
                              {friendPreferences.workout_preferences.has_gym_membership ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
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
