import React, { useState, useEffect } from "react";
import {
  FaBullseye,
  FaTrophy,
  FaHandshake,
  FaClock,
  FaCalendarAlt,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

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
const inputStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "2px solid #e2e8f0",
  fontSize: "15px",
  transition: "all 0.2s ease",
  backgroundColor: "#fafbfc",
};
const buttonStyle = {
  padding: "12px 24px",
  borderRadius: "12px",
  border: "none",
  fontSize: "15px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  letterSpacing: "0.025em",
};

function ProgressBar({ value, max }) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      style={{
        background: "#f1f5f9",
        borderRadius: "12px",
        height: "16px",
        width: "100%",
        margin: "12px 0",
        overflow: "hidden",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          background:
            percent === 100
              ? "linear-gradient(90deg, #10b981, #059669)"
              : percent > 80
              ? "linear-gradient(90deg, #f59e0b, #d97706)"
              : "linear-gradient(90deg, #3b82f6, #2563eb)",
          height: "100%",
          borderRadius: "12px",
          transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow:
            percent === 100
              ? "0 0 12px rgba(16, 185, 129, 0.4)"
              : percent > 80
              ? "0 0 8px rgba(245, 158, 11, 0.3)"
              : "0 0 6px rgba(59, 130, 246, 0.3)",
        }}
      />
    </div>
  );
}

const durationOptions = [
  { label: "3 days", days: 3 },
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "1 month", days: 30 },
  { label: "Custom", days: null },
];

export default function ChallengesPage({ userId }) {
  const [challenges, setChallenges] = useState([]);
  const [friendChallenges, setFriendChallenges] = useState({
    received: [],
    sent: [],
  });
  const [friends, setFriends] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    max_progress: 10,
    friend_id: "",
  });
  const [duration, setDuration] = useState(7); // default 1 week
  const [customDate, setCustomDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editProgress, setEditProgress] = useState({}); // { [challengeId]: value }

  // Fetch personal and friend challenges
  const fetchAll = () => {
    setLoading(true);
    fetch("/api/get_weekly_challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setChallenges)
      .finally(() => setLoading(false));
    fetch("/api/get_friend_challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
      .then((res) => (res.ok ? res.json() : { received: [], sent: [] }))
      .then((data) => {
        // Filter out declined challenges
        setFriendChallenges({
          received: data.received.filter((c) => c.status !== "declined"),
          sent: data.sent.filter((c) => c.status !== "declined"),
        });
      });
    fetch("/api/get_friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setFriends);
  };
  useEffect(() => {
    if (!userId) return;
    fetchAll();
    // eslint-disable-next-line
  }, [userId, creating]);

  // Calculate deadline from duration
  useEffect(() => {
    if (duration && duration !== "custom") {
      const d = new Date();
      d.setDate(d.getDate() + Number(duration));
      setForm((f) => ({ ...f, deadline: d.toISOString().slice(0, 16) }));
    } else if (duration === "custom" && customDate) {
      setForm((f) => ({ ...f, deadline: customDate }));
    }
    // eslint-disable-next-line
  }, [duration, customDate]);

  // Create challenge (personal or friend)
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setSuccessMsg("");
    if (form.friend_id) {
      await fetch("/api/create_friend_challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          friend_id: form.friend_id,
          title: form.title,
          description: form.description,
          max_progress: form.max_progress,
          deadline: form.deadline,
        }),
      });
    } else {
      await fetch("/api/add_custom_challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          title: form.title,
          description: form.description,
          deadline: form.deadline,
          max_progress: form.max_progress,
        }),
      });
    }
    setForm({
      title: "",
      description: "",
      deadline: "",
      max_progress: 10,
      friend_id: "",
    });
    setDuration(7);
    setCustomDate("");
    setCreating(false);
    setSuccessMsg("Challenge created!");
    fetchAll();
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  // Update progress for personal challenge
  const handleUpdateProgress = async (challengeId, progress) => {
    await fetch("/api/update_challenge_progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        challenge_id: challengeId,
        progress,
      }),
    });
    fetchAll();
  };

  // Friend challenge actions
  const handleRespond = async (challengeId, response) => {
    await fetch("/api/respond_friend_challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        challenge_id: challengeId,
        response,
      }),
    });
    fetchAll();
  };
  const handleFriendProgress = async (challengeId, progress) => {
    await fetch("/api/update_challenge_progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        challenge_id: challengeId,
        progress,
      }),
    });
    fetchAll();
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (window.confirm("Are you sure you want to delete this challenge?")) {
      await fetch("/api/delete_challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, challenge_id: challengeId }),
      });
      fetchAll();
    }
  };

  const handleDeleteFriendChallenge = async (challengeId) => {
    if (window.confirm("Are you sure you want to delete this challenge?")) {
      await fetch("/api/delete_friend_challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, challenge_id: challengeId }),
      });
      fetchAll();
    }
  };

  return (
    <div>
      {/* Create Challenge Form */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <FaBullseye style={{ marginRight: "8px" }} />
          Create a Challenge
        </div>
        <form
          onSubmit={handleCreate}
          style={{ display: "flex", flexDirection: "column", gap: "40px" }}
        >
          {/* First Row - Title and Description */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "40px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  color: "#4a5568",
                  fontWeight: "600",
                }}
              >
                Challenge Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g., Run 5 miles"
                required
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  color: "#4a5568",
                  fontWeight: "600",
                }}
              >
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="e.g., Complete 5 mile runs this week"
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
          </div>

          {/* Second Row - Duration, Goal Items, and Challenge Type */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "40px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  color: "#4a5568",
                  fontWeight: "600",
                }}
              >
                Duration
              </label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {durationOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() =>
                      setDuration(opt.days === null ? "custom" : opt.days)
                    }
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border:
                        duration === opt.days ||
                        (duration === "custom" && opt.days === null)
                          ? "2px solid #10b981"
                          : "1px solid #e2e8f0",
                      background:
                        duration === opt.days ||
                        (duration === "custom" && opt.days === null)
                          ? "#ecfdf5"
                          : "#f8fafc",
                      color:
                        duration === opt.days ||
                        (duration === "custom" && opt.days === null)
                          ? "#065f46"
                          : "#4a5568",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "13px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {duration === "custom" && (
                <input
                  type="datetime-local"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  style={{ ...inputStyle, marginTop: "8px" }}
                  required
                />
              )}
              {form.deadline && (
                <div
                  style={{
                    color: "#10b981",
                    fontSize: "13px",
                    marginTop: "6px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <FaCalendarAlt style={{ marginRight: "4px" }} />
                  Deadline: {new Date(form.deadline).toLocaleString()}
                </div>
              )}
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  color: "#4a5568",
                  fontWeight: "600",
                }}
              >
                Goal Items
              </label>
              <input
                type="number"
                min={1}
                value={form.max_progress}
                onChange={(e) =>
                  setForm((f) => ({ ...f, max_progress: e.target.value }))
                }
                required
                style={{ ...inputStyle, width: "100%" }}
                placeholder="e.g., 10"
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  color: "#4a5568",
                  fontWeight: "600",
                }}
              >
                Challenge Type
              </label>
              <select
                value={form.friend_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, friend_id: e.target.value }))
                }
                style={{ ...inputStyle, width: "100%" }}
              >
                <option value="">Personal Challenge</option>
                {friends.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name || f.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Third Row - Submit Button */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "24px",
            }}
          >
            <button
              type="submit"
              disabled={creating}
              style={{
                ...buttonStyle,
                background: creating
                  ? "#9ca3af"
                  : "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                minWidth: "160px",
                boxShadow: creating
                  ? "none"
                  : "0 4px 12px rgba(16, 185, 129, 0.3)",
                transform: creating ? "none" : "translateY(0)",
              }}
              onMouseEnter={(e) => {
                if (!creating) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 6px 16px rgba(16, 185, 129, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!creating) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(16, 185, 129, 0.3)";
                }
              }}
            >
              {creating ? "Creating..." : "Create Challenge"}
            </button>
          </div>
        </form>
        {successMsg && (
          <div
            style={{
              color: "#10b981",
              marginTop: "16px",
              fontWeight: "600",
              fontSize: "15px",
              padding: "12px 16px",
              backgroundColor: "#ecfdf5",
              borderRadius: "12px",
              border: "1px solid #a7f3d0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaCheck style={{ marginRight: "4px" }} />
            {successMsg}
          </div>
        )}
      </div>
      {/* Personal Challenges */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <FaTrophy style={{ marginRight: "8px" }} />
          Your Challenges
        </div>
        {loading ? (
          <div style={subtleText}>Loading…</div>
        ) : challenges.length === 0 ? (
          <div style={subtleText}>(No challenges yet)</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "32px",
              padding: "8px",
            }}
          >
            {challenges.map((c) => {
              const now = new Date();
              const deadline = c.deadline ? new Date(c.deadline) : null;
              const expired = deadline && deadline < now;
              const daysLeft = deadline
                ? Math.floor((deadline - now) / (1000 * 60 * 60 * 24))
                : null;
              return (
                <div
                  key={c.id}
                  style={{
                    background: expired ? "#fef2f2" : "#ffffff",
                    border: expired ? "2px solid #fecaca" : "2px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: expired
                      ? "0 4px 12px rgba(239, 68, 68, 0.1)"
                      : "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {c.completed && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      COMPLETED
                    </div>
                  )}
                  <div
                    style={{
                      fontWeight: "800",
                      fontSize: "18px",
                      marginBottom: "8px",
                      color: "#1a202c",
                    }}
                  >
                    {c.title}
                  </div>
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "15px",
                      marginBottom: "16px",
                      lineHeight: "1.5",
                    }}
                  >
                    {c.description}
                  </div>
                  <ProgressBar value={c.progress} max={c.max_progress} />
                  <div
                    style={{
                      fontSize: "14px",
                      color: expired
                        ? "#ef4444"
                        : daysLeft !== null
                        ? "#10b981"
                        : "#64748b",
                      marginBottom: "12px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {expired ? (
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <FaExclamationTriangle
                          style={{ marginRight: "4px", color: "#ef4444" }}
                        />
                        Expired
                      </span>
                    ) : daysLeft !== null ? (
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <FaClock style={{ marginRight: "4px" }} />
                        {daysLeft} day{daysLeft === 1 ? "" : "s"} left
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <FaCalendarAlt style={{ marginRight: "4px" }} />
                        No deadline
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      color: "#374151",
                      marginBottom: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Progress: {c.progress} / {c.max_progress}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "14px",
                        color: "#4a5568",
                        fontWeight: "600",
                      }}
                    >
                      Update Progress:
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={c.max_progress}
                      value={
                        editProgress[c.id] !== undefined
                          ? editProgress[c.id]
                          : c.progress
                      }
                      onChange={(e) => {
                        setEditProgress((prev) => ({
                          ...prev,
                          [c.id]: e.target.value,
                        }));
                      }}
                      onBlur={(e) => {
                        const val = parseInt(editProgress[c.id], 10);
                        if (!isNaN(val) && val !== c.progress) {
                          handleUpdateProgress(c.id, val);
                        }
                        setEditProgress((prev) => {
                          const copy = { ...prev };
                          delete copy[c.id];
                          return copy;
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.target.blur();
                        }
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "2px solid #e2e8f0",
                        width: "80px",
                        marginRight: "8px",
                        fontSize: "14px",
                        backgroundColor: "#fafbfc",
                        transition: "all 0.2s ease",
                      }}
                      placeholder={`0-${c.max_progress}`}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        fontWeight: "500",
                      }}
                    >
                      of {c.max_progress} completed
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "12px",
                    }}
                  >
                    <span
                      style={{
                        color: c.completed ? "#10b981" : "#64748b",
                        fontWeight: "700",
                        fontSize: "14px",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        backgroundColor: c.completed ? "#ecfdf5" : "#f1f5f9",
                      }}
                    >
                      {c.completed ? (
                        <span style={{ display: "flex", alignItems: "center" }}>
                          <FaCheck style={{ marginRight: "4px" }} />
                          Completed!
                        </span>
                      ) : (
                        <span style={{ display: "flex", alignItems: "center" }}>
                          <FaClock style={{ marginRight: "4px" }} />
                          In Progress
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => handleDeleteChallenge(c.id)}
                      style={{
                        padding: "6px 12px",
                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow =
                          "0 4px 8px rgba(239, 68, 68, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 2px 4px rgba(239, 68, 68, 0.2)";
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Friend Challenges */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <FaHandshake style={{ marginRight: "8px" }} />
          Friend Challenges
        </div>
        {/* Received */}
        {friendChallenges.received.length === 0 ? (
          <div style={subtleText}>(No friend challenges received)</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "32px",
              marginBottom: "32px",
              padding: "8px",
            }}
          >
            {friendChallenges.received.map((c) => {
              const now = new Date();
              const deadline = c.deadline ? new Date(c.deadline) : null;
              const expired = deadline && deadline < now;
              const daysLeft = deadline
                ? Math.floor((deadline - now) / (1000 * 60 * 60 * 24))
                : null;
              return (
                <div
                  key={c.id}
                  style={{
                    background: expired ? "#fff5f5" : "#f8fafc",
                    border: expired ? "1px solid #feb2b2" : "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                    transition: "box-shadow 0.3s",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 17,
                      marginBottom: 4,
                    }}
                  >
                    {c.title}
                  </div>
                  <div
                    style={{ color: "#718096", fontSize: 14, marginBottom: 8 }}
                  >
                    {c.description}
                  </div>
                  <div
                    style={{ color: "#718096", fontSize: 13, marginBottom: 8 }}
                  >
                    from <b>{c.creator_name}</b>
                  </div>
                  <ProgressBar value={c.progress} max={c.max_progress} />
                  <div
                    style={{
                      fontSize: 14,
                      color: expired ? "#e53e3e" : "#2d3748",
                      marginBottom: 8,
                    }}
                  >
                    {expired
                      ? "Expired"
                      : daysLeft !== null
                      ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                      : "No deadline"}
                  </div>
                  <div
                    style={{ fontSize: 14, color: "#2d3748", marginBottom: 8 }}
                  >
                    Progress: {c.progress} / {c.max_progress}
                  </div>
                  {c.status === "pending" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleRespond(c.id, "accepted")}
                        style={{
                          padding: "8px 16px",
                          background: "#48bb78",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespond(c.id, "declined")}
                        style={{
                          padding: "8px 16px",
                          background: "#e53e3e",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {c.status === "accepted" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 14,
                          color: "#4a5568",
                          fontWeight: "500",
                        }}
                      >
                        Update Progress:
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={c.max_progress}
                        value={
                          editProgress[c.id] !== undefined
                            ? editProgress[c.id]
                            : c.progress
                        }
                        onChange={(e) => {
                          setEditProgress((prev) => ({
                            ...prev,
                            [c.id]: e.target.value,
                          }));
                        }}
                        onBlur={(e) => {
                          const val = parseInt(editProgress[c.id], 10);
                          if (!isNaN(val) && val !== c.progress) {
                            handleFriendProgress(c.id, val);
                          }
                          setEditProgress((prev) => {
                            const copy = { ...prev };
                            delete copy[c.id];
                            return copy;
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.target.blur();
                          }
                        }}
                        style={{
                          padding: 8,
                          borderRadius: 6,
                          border: "1px solid #e2e8f0",
                          width: 80,
                        }}
                        placeholder={`0-${c.max_progress}`}
                      />
                      <span style={{ fontSize: 12, color: "#718096" }}>
                        of {c.max_progress} completed
                      </span>
                      <span
                        style={{
                          color:
                            c.progress >= c.max_progress
                              ? "#48bb78"
                              : "#718096",
                          fontWeight: "bold",
                        }}
                      >
                        {c.progress >= c.max_progress
                          ? "Completed!"
                          : "In Progress"}
                      </span>
                    </div>
                  )}
                  {c.status === "completed" && (
                    <span style={{ color: "#48bb78", fontWeight: "bold" }}>
                      ✓ Completed!
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {/* Sent */}
        <div
          style={{ fontWeight: 600, color: "#2d3748", margin: "16px 0 8px" }}
        >
          Challenges You Sent
        </div>
        {friendChallenges.sent.length === 0 ? (
          <div style={subtleText}>(No friend challenges sent)</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "32px",
              padding: "8px",
            }}
          >
            {friendChallenges.sent.map((c) => {
              const now = new Date();
              const deadline = c.deadline ? new Date(c.deadline) : null;
              const expired = deadline && deadline < now;
              const daysLeft = deadline
                ? Math.floor((deadline - now) / (1000 * 60 * 60 * 24))
                : null;
              return (
                <div
                  key={c.id}
                  style={{
                    background: expired ? "#fef2f2" : "#ffffff",
                    border: expired ? "2px solid #fecaca" : "2px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: expired
                      ? "0 4px 12px rgba(239, 68, 68, 0.1)"
                      : "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "800",
                      fontSize: "18px",
                      marginBottom: "8px",
                      color: "#1a202c",
                    }}
                  >
                    {c.title}
                  </div>
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "15px",
                      marginBottom: "12px",
                      lineHeight: "1.5",
                    }}
                  >
                    {c.description}
                  </div>
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "14px",
                      marginBottom: "16px",
                      fontWeight: "600",
                    }}
                  >
                    to <b>{c.target_name}</b>
                  </div>
                  <ProgressBar value={c.progress} max={c.max_progress} />
                  <div
                    style={{
                      fontSize: "14px",
                      color: expired
                        ? "#ef4444"
                        : daysLeft !== null
                        ? "#10b981"
                        : "#64748b",
                      marginBottom: "12px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {expired ? (
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <FaExclamationTriangle
                          style={{ marginRight: "4px", color: "#ef4444" }}
                        />
                        Expired
                      </span>
                    ) : daysLeft !== null ? (
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <FaClock style={{ marginRight: "4px" }} />
                        {daysLeft} day{daysLeft === 1 ? "" : "s"} left
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <FaCalendarAlt style={{ marginRight: "4px" }} />
                        No deadline
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      color: "#374151",
                      marginBottom: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Progress: {c.progress} / {c.max_progress}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "12px",
                    }}
                  >
                    <span
                      style={{
                        color: c.status === "completed" ? "#10b981" : "#64748b",
                        fontWeight: "700",
                        fontSize: "14px",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        backgroundColor:
                          c.status === "completed" ? "#ecfdf5" : "#f1f5f9",
                      }}
                    >
                      Status: {c.status}
                    </span>
                    <button
                      onClick={() => handleDeleteFriendChallenge(c.id)}
                      style={{
                        padding: "6px 12px",
                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow =
                          "0 4px 8px rgba(239, 68, 68, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 2px 4px rgba(239, 68, 68, 0.2)";
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
