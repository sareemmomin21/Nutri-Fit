import React, { useState, useEffect, useCallback } from "react";

export default function OverviewPage({ userId }) {
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [badges, setBadges] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [stats, setStats] = useState({
    challengesCompleted: 0,
    totalWorkouts: 0,
    caloriesBurned: 0,
    friendsCount: 0
  });

  const cardStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "2.5rem",
    backgroundColor: "#fff",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    marginBottom: "2rem",
    transition: "all 0.3s ease",
  };
  
  const sectionHeaderStyle = {
    fontSize: "22px",
    color: "#1a202c",
    marginBottom: "24px",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    letterSpacing: "-0.025em",
  };
  
  const subtleText = {
    color: "#a0aec0",
    fontStyle: "italic",
    fontSize: "15px",
    fontWeight: 500,
  };

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const [streakRes, badgesRes, activityRes, friendBadgesRes, statsRes] = await Promise.all([
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
        fetch("/api/get_friend_activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, limit: 20 }),
        }),
        fetch("/api/get_friend_badges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ friend_id: userId }),
        }),
        fetch("/api/get_user_stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }),
      ]);
      
      if (streakRes.ok) setStreak(await streakRes.json());
      if (badgesRes.ok) setBadges(await badgesRes.json());
      if (activityRes.ok) setActivityFeed(await activityRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      
      // Fetch additional stats
      try {
        const friendsRes = await fetch("/api/get_friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });
        if (friendsRes.ok) {
          const friends = await friendsRes.json();
          setStats(prev => ({ ...prev, friendsCount: friends.length }));
        }
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    } catch (err) {
      console.error("Overview fetch error:", err);
    } finally {
      setOverviewLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchOverview();
  }, [userId, fetchOverview]);

  // Refresh data when component mounts or when user switches to this tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchOverview();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchOverview]);

  if (overviewLoading) {
    return (
      <div style={{ 
        textAlign: "center", 
        color: "#64748b", 
        fontSize: "16px",
        padding: "40px",
        fontWeight: "500"
      }}>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          border: "3px solid #e2e8f0", 
          borderTop: "3px solid #10b981", 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite",
          margin: "0 auto 16px"
        }}></div>
        Loading your overview...
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={sectionHeaderStyle}>🎯 Your Fitness Dashboard</div>
          <button
            onClick={fetchOverview}
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            onMouseEnter={e => {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
            }}
            onMouseLeave={e => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            🔄 Refresh
          </button>
        </div>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "24px",
          marginBottom: "24px"
        }}>
          <div style={{ 
            background: "linear-gradient(135deg, #10b981, #059669)",
            padding: "24px",
            borderRadius: "16px",
            textAlign: "center",
            color: "white",
            boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔥</div>
            <div style={{ fontSize: "28px", fontWeight: "800", marginBottom: "4px" }}>{streak.current}</div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>Current Streak</div>
          </div>
          
          <div style={{ 
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            padding: "24px",
            borderRadius: "16px",
            textAlign: "center",
            color: "white",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🏆</div>
            <div style={{ fontSize: "28px", fontWeight: "800", marginBottom: "4px" }}>{streak.best}</div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>Best Streak</div>
          </div>
          
          <div style={{ 
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            padding: "24px",
            borderRadius: "16px",
            textAlign: "center",
            color: "white",
            boxShadow: "0 4px 20px rgba(245, 158, 11, 0.3)"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🏅</div>
            <div style={{ fontSize: "28px", fontWeight: "800", marginBottom: "4px" }}>{badges.length}</div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>Badges Earned</div>
          </div>
          
          <div style={{ 
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            padding: "24px",
            borderRadius: "16px",
            textAlign: "center",
            color: "white",
            boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>👥</div>
            <div style={{ fontSize: "28px", fontWeight: "800", marginBottom: "4px" }}>{stats.friendsCount}</div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>Friends</div>
          </div>
        </div>
      </div>

      {/* Activity Feed Section */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>📰 Friend Activity Feed</div>
        {activityFeed.length === 0 ? (
          <div style={{ 
            color: "#a0aec0",
            fontSize: "15px",
            fontWeight: "500",
            textAlign: "center", 
            padding: "40px 20px",
            background: "#f8fafc",
            borderRadius: "12px",
            border: "2px dashed #e2e8f0"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px", fontStyle: "normal" }}>📭</div>
            No recent friend activity
            <div style={{ fontSize: "13px", marginTop: "8px", opacity: 0.7, fontStyle: "normal" }}>
              When your friends complete challenges or earn badges, they'll appear here!
            </div>
          </div>
        ) : (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {activityFeed.map((a, index) => (
                <div key={a.id || index} style={{ 
                  background: "#f8fafc", 
                  borderRadius: "12px", 
                  padding: "16px", 
                  fontSize: "15px", 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s ease"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ 
                      width: "40px", 
                      height: "40px", 
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "16px"
                    }}>
                      {(a.first_name || a.username || "F").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", color: "#1a202c", marginBottom: "4px" }}>
                        {a.first_name || a.username || "A friend"}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "14px" }}>
                        {a.description || "Completed an activity"}
                      </div>
                    </div>
                    <div style={{ 
                      color: "#a0aec0", 
                      fontSize: "12px", 
                      fontWeight: "500",
                      textAlign: "right"
                    }}>
                      {new Date(a.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Badges/Achievements Section */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>🏅 Your Badges & Achievements</div>
        {badges.length === 0 ? (
          <div style={{ 
            color: "#a0aec0",
            fontSize: "15px",
            fontWeight: "500",
            textAlign: "center", 
            padding: "40px 20px",
            background: "#f8fafc",
            borderRadius: "12px",
            border: "2px dashed #e2e8f0"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px", fontStyle: "normal" }}>🏆</div>
            No badges earned yet
            <div style={{ fontSize: "13px", marginTop: "8px", opacity: 0.7, fontStyle: "normal" }}>
              Complete challenges and reach milestones to earn badges!
            </div>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "20px" 
          }}>
            {badges.map((b, i) => (
              <div key={i} style={{
                background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                border: "2px solid #f59e0b",
                borderRadius: "16px",
                padding: "24px",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(245, 158, 11, 0.15)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onMouseEnter={e => {
                e.target.style.transform = "translateY(-4px)";
                e.target.style.boxShadow = "0 8px 25px rgba(245, 158, 11, 0.25)";
              }}
              onMouseLeave={e => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 20px rgba(245, 158, 11, 0.15)";
              }}
              >
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏅</div>
                <div style={{ 
                  fontWeight: "800", 
                  fontSize: "18px", 
                  color: "#92400e",
                  marginBottom: "8px"
                }}>
                  {b.badge || b.name || "Achievement"}
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  color: "#a16207", 
                  marginBottom: "12px",
                  lineHeight: "1.4"
                }}>
                  {b.description || "Great job on this achievement!"}
                </div>
                <div style={{ 
                  fontSize: "12px", 
                  color: "#92400e",
                  fontWeight: "600"
                }}>
                  {new Date(b.earned_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats Section */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>📊 Quick Stats</div>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
          gap: "20px" 
        }}>
          <div style={{ 
            background: "#f0f9ff", 
            border: "2px solid #0ea5e9", 
            borderRadius: "12px", 
            padding: "20px", 
            textAlign: "center" 
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>🎯</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#0369a1" }}>
              {stats.challengesCompleted}
            </div>
            <div style={{ fontSize: "13px", color: "#0c4a6e" }}>Challenges Completed</div>
          </div>
          
          <div style={{ 
            background: "#f0fdf4", 
            border: "2px solid #22c55e", 
            borderRadius: "12px", 
            padding: "20px", 
            textAlign: "center" 
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>💪</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#15803d" }}>
              {stats.totalWorkouts}
            </div>
            <div style={{ fontSize: "13px", color: "#14532d" }}>Total Workouts</div>
          </div>
          
          <div style={{ 
            background: "#fef3c7", 
            border: "2px solid #f59e0b", 
            borderRadius: "12px", 
            padding: "20px", 
            textAlign: "center" 
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔥</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#a16207" }}>
              {stats.caloriesBurned.toLocaleString()}
            </div>
            <div style={{ fontSize: "13px", color: "#92400e" }}>Calories Burned</div>
          </div>
          
          <div style={{ 
            background: "#f3e8ff", 
            border: "2px solid #a855f7", 
            borderRadius: "12px", 
            padding: "20px", 
            textAlign: "center" 
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>👥</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#7c3aed" }}>
              {stats.friendsCount}
            </div>
            <div style={{ fontSize: "13px", color: "#5b21b6" }}>Friends</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 