import React, { useState, useEffect, useCallback } from "react";

export default function OverviewPage({ userId }) {
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [badges, setBadges] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

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
      if (streakRes.ok) setStreak(await streakRes.json());
      if (badgesRes.ok) setBadges(await badgesRes.json());
    } catch (err) {
      console.error("Overview fetch error:", err);
    } finally {
      setOverviewLoading(false);
    }
  }, [userId]);

  // Fetch overview, badges, and activity feed
  useEffect(() => {
    setOverviewLoading(true);
    Promise.all([
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
    ])
      .then(async ([streakRes, badgesRes, activityRes, friendBadgesRes]) => {
        if (streakRes.ok) setStreak(await streakRes.json());
        if (badgesRes.ok) setBadges(await badgesRes.json());
        if (activityRes.ok) setActivityFeed(await activityRes.json());
        // Optionally merge badges from both endpoints
        // (if /api/get_badges and /api/get_friend_badges are different)
      })
      .finally(() => setOverviewLoading(false));
  }, [userId]);

  if (overviewLoading) {
    return <div style={{ textAlign: "center", color: "#718096" }}>Loading overview…</div>;
  }

  const cardStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "2rem",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "2rem",
  };
  const sectionHeaderStyle = {
    fontSize: 20,
    color: "#2d3748",
    marginBottom: 16,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };
  const subtleText = {
    color: "#718096",
    fontStyle: "italic",
  };
  const badgeCardStyle = {
    background: "#f0fff4",
    border: "1px solid #9ae6b4",
    borderRadius: 12,
    padding: 16,
    minWidth: 120,
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(72,187,120,0.08)",
    marginBottom: 12,
  };

  return (
    <div>
      {/* Activity Feed Section */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>📰 Friend Activity Feed</div>
        {activityFeed.length === 0 ? (
          <div style={subtleText}>(No recent friend activity)</div>
        ) : (
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {activityFeed.map(a => (
                <li key={a.id} style={{ marginBottom: 10, background: "#f8fafc", borderRadius: 8, padding: 12, fontSize: 15, boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                  <b>{a.first_name || a.username}</b> {a.description} <span style={{ color: "#718096", fontSize: 13 }}>({new Date(a.timestamp).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Badges/Achievements Section */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>🏅 Your Badges & Achievements</div>
        {badges.length === 0 ? (
          <div style={subtleText}>(No badges yet)</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 20 }}>
            {badges.map((b, i) => (
              <div key={i} style={badgeCardStyle}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>🏅</div>
                <div style={{ fontWeight: "bold", fontSize: 16 }}>{b.badge}</div>
                <div style={{ fontSize: 13, color: "#718096", margin: "6px 0" }}>{b.description}</div>
                <div style={{ fontSize: 12, color: "#a0aec0" }}>{new Date(b.earned_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Streak and Stats Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <h2 style={{ margin: 0, marginBottom: "1rem", color: "#2d3748", fontSize: "18px" }}>Current Streak</h2>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#48bb78", margin: 0 }}>{streak.current} days</p>
        </div>
        <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <h2 style={{ margin: 0, marginBottom: "1rem", color: "#2d3748", fontSize: "18px" }}>Best Streak</h2>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "#48bb78", margin: 0 }}>{streak.best} days</p>
        </div>
        <div style={{ gridColumn: "1 / -1", backgroundColor: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: 0, marginBottom: "1rem", color: "#2d3748", fontSize: "18px" }}>Badges Earned</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {badges.length === 0 && <p style={{ color: "#718096", fontStyle: "italic", textAlign: "center", padding: "1rem 0" }}>No badges yet.</p>}
            {badges.map((b) => (
              <div key={b.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "80px" }}>
                <div style={{ fontSize: "28px", marginBottom: "0.5rem" }}>🏅</div>
                <div>{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 