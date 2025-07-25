import React, { useState, useEffect } from "react";

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

function ProgressBar({ value, max }) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ background: "#e2e8f0", borderRadius: 8, height: 12, width: "100%", margin: "8px 0", overflow: "hidden" }}>
      <div style={{ width: `${percent}%`, background: percent === 100 ? "#48bb78" : percent > 80 ? "#f6ad55" : "#3182ce", height: "100%", borderRadius: 8, transition: "width 0.5s cubic-bezier(.4,2,.6,1)", boxShadow: percent === 100 ? "0 0 8px #48bb78" : undefined }} />
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
  const [friendChallenges, setFriendChallenges] = useState({ received: [], sent: [] });
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
      .then(res => res.ok ? res.json() : [])
      .then(setChallenges)
      .finally(() => setLoading(false));
    fetch("/api/get_friend_challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
      .then(res => res.ok ? res.json() : { received: [], sent: [] })
      .then(setFriendChallenges);
    fetch("/api/get_friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
      .then(res => res.ok ? res.json() : [])
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
      setForm(f => ({ ...f, deadline: d.toISOString().slice(0, 16) }));
    } else if (duration === "custom" && customDate) {
      setForm(f => ({ ...f, deadline: customDate }));
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
    setForm({ title: "", description: "", deadline: "", max_progress: 10, friend_id: "" });
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
      body: JSON.stringify({ user_id: userId, challenge_id: challengeId, progress }),
    });
    fetchAll();
  };

  // Friend challenge actions
  const handleRespond = async (challengeId, response) => {
    await fetch("/api/respond_friend_challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, challenge_id: challengeId, response }),
    });
    fetchAll();
  };
  const handleFriendProgress = async (challengeId, progress) => {
    await fetch("/api/update_challenge_progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, challenge_id: challengeId, progress }),
    });
    fetchAll();
  };

  return (
    <div>
      {/* Create Challenge Form */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>🎯 Create a Challenge</div>
        <form onSubmit={handleCreate} style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", minWidth: 180, flex: 1 }}
          />
          <input
            type="text"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", minWidth: 180, flex: 2 }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 180 }}>
            <label style={{ fontWeight: 500, color: "#2d3748", marginBottom: 2 }}>How long do you have?</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {durationOptions.map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setDuration(opt.days === null ? "custom" : opt.days)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: duration === opt.days || (duration === "custom" && opt.days === null) ? "2px solid #48bb78" : "1px solid #e2e8f0",
                    background: duration === opt.days || (duration === "custom" && opt.days === null) ? "#f0fff4" : "#f8fafc",
                    color: "#2d3748",
                    fontWeight: 500,
                    cursor: "pointer",
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
                onChange={e => setCustomDate(e.target.value)}
                style={{ marginTop: 6, padding: 8, borderRadius: 6, border: "1px solid #e2e8f0" }}
                required
              />
            )}
            {form.deadline && (
              <div style={{ color: "#718096", fontSize: 13, marginTop: 2 }}>
                Deadline: {new Date(form.deadline).toLocaleString()}
              </div>
            )}
          </div>
          <input
            type="number"
            min={1}
            value={form.max_progress}
            onChange={e => setForm(f => ({ ...f, max_progress: e.target.value }))}
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", width: 100 }}
            placeholder="Goal"
          />
          <select
            value={form.friend_id}
            onChange={e => setForm(f => ({ ...f, friend_id: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", minWidth: 140 }}
          >
            <option value="">Personal Challenge</option>
            {friends.map(f => (
              <option key={f.id} value={f.id}>{f.name || f.username}</option>
            ))}
          </select>
          <button type="submit" disabled={creating} style={{ padding: "10px 20px", background: "#48bb78", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", fontSize: 15, cursor: creating ? "not-allowed" : "pointer" }}>Create</button>
        </form>
        {successMsg && <div style={{ color: "#48bb78", marginTop: 12, fontWeight: 600 }}>{successMsg}</div>}
      </div>
      {/* Personal Challenges */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>🏅 Your Challenges</div>
        {loading ? (
          <div style={subtleText}>Loading…</div>
        ) : challenges.length === 0 ? (
          <div style={subtleText}>(No challenges yet)</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {challenges.map(c => {
              const now = new Date();
              const deadline = c.deadline ? new Date(c.deadline) : null;
              const expired = deadline && deadline < now;
              const daysLeft = deadline ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)) : null;
              return (
                <div key={c.id} style={{ background: expired ? "#fff5f5" : "#f8fafc", border: expired ? "1px solid #feb2b2" : "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", transition: "box-shadow 0.3s" }}>
                  <div style={{ fontWeight: "bold", fontSize: 17, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ color: "#718096", fontSize: 14, marginBottom: 8 }}>{c.description}</div>
                  <ProgressBar value={c.progress} max={c.max_progress} />
                  <div style={{ fontSize: 14, color: expired ? "#e53e3e" : "#2d3748", marginBottom: 8 }}>
                    {expired ? "Expired" : daysLeft !== null ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : "No deadline"}
                  </div>
                  <div style={{ fontSize: 14, color: "#2d3748", marginBottom: 8 }}>
                    Progress: {c.progress} / {c.max_progress}
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={c.max_progress}
                    value={editProgress[c.id] !== undefined ? editProgress[c.id] : c.progress}
                    onChange={e => {
                      setEditProgress(prev => ({ ...prev, [c.id]: e.target.value }));
                    }}
                    onBlur={e => {
                      const val = parseInt(editProgress[c.id], 10);
                      if (!isNaN(val) && val !== c.progress) {
                        handleUpdateProgress(c.id, val);
                      }
                      setEditProgress(prev => {
                        const copy = { ...prev };
                        delete copy[c.id];
                        return copy;
                      });
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                    style={{ padding: 8, borderRadius: 6, border: "1px solid #e2e8f0", width: 80, marginRight: 8 }}
                  />
                  <span style={{ color: c.completed ? "#48bb78" : "#718096", fontWeight: "bold" }}>{c.completed ? "Completed!" : "In Progress"}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Friend Challenges */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>🤝 Friend Challenges</div>
        {/* Received */}
        {friendChallenges.received.length === 0 ? (
          <div style={subtleText}>(No friend challenges received)</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 24 }}>
            {friendChallenges.received.map(c => {
              const now = new Date();
              const deadline = c.deadline ? new Date(c.deadline) : null;
              const expired = deadline && deadline < now;
              const daysLeft = deadline ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)) : null;
              return (
                <div key={c.id} style={{ background: expired ? "#fff5f5" : "#f8fafc", border: expired ? "1px solid #feb2b2" : "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", transition: "box-shadow 0.3s" }}>
                  <div style={{ fontWeight: "bold", fontSize: 17, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ color: "#718096", fontSize: 14, marginBottom: 8 }}>{c.description}</div>
                  <div style={{ color: "#718096", fontSize: 13, marginBottom: 8 }}>from <b>{c.creator_name}</b></div>
                  <ProgressBar value={c.progress} max={c.max_progress} />
                  <div style={{ fontSize: 14, color: expired ? "#e53e3e" : "#2d3748", marginBottom: 8 }}>
                    {expired ? "Expired" : daysLeft !== null ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : "No deadline"}
                  </div>
                  <div style={{ fontSize: 14, color: "#2d3748", marginBottom: 8 }}>
                    Progress: {c.progress} / {c.max_progress}
                  </div>
                  {c.status === "pending" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleRespond(c.id, "accepted")}
                        style={{ padding: "8px 16px", background: "#48bb78", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}>Accept</button>
                      <button onClick={() => handleRespond(c.id, "declined")}
                        style={{ padding: "8px 16px", background: "#e53e3e", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}>Decline</button>
                    </div>
                  )}
                  {c.status === "accepted" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="number"
                        min={0}
                        max={c.max_progress}
                        value={editProgress[c.id] !== undefined ? editProgress[c.id] : c.progress}
                        onChange={e => {
                          setEditProgress(prev => ({ ...prev, [c.id]: e.target.value }));
                        }}
                        onBlur={e => {
                          const val = parseInt(editProgress[c.id], 10);
                          if (!isNaN(val) && val !== c.progress) {
                            handleFriendProgress(c.id, val);
                          }
                          setEditProgress(prev => {
                            const copy = { ...prev };
                            delete copy[c.id];
                            return copy;
                          });
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.target.blur();
                          }
                        }}
                        style={{ padding: 8, borderRadius: 6, border: "1px solid #e2e8f0", width: 80 }}
                      />
                      <span style={{ color: c.progress >= c.max_progress ? "#48bb78" : "#718096", fontWeight: "bold" }}>{c.progress >= c.max_progress ? "Completed!" : "In Progress"}</span>
                    </div>
                  )}
                  {c.status === "declined" && <span style={{ color: "#e53e3e", fontWeight: "bold" }}>Declined</span>}
                  {c.status === "completed" && <span style={{ color: "#48bb78", fontWeight: "bold" }}>✓ Completed!</span>}
                </div>
              );
            })}
          </div>
        )}
        {/* Sent */}
        <div style={{ fontWeight: 600, color: "#2d3748", margin: "16px 0 8px" }}>Challenges You Sent</div>
        {friendChallenges.sent.length === 0 ? (
          <div style={subtleText}>(No friend challenges sent)</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {friendChallenges.sent.map(c => {
              const now = new Date();
              const deadline = c.deadline ? new Date(c.deadline) : null;
              const expired = deadline && deadline < now;
              const daysLeft = deadline ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)) : null;
              return (
                <div key={c.id} style={{ background: expired ? "#fff5f5" : "#f8fafc", border: expired ? "1px solid #feb2b2" : "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", transition: "box-shadow 0.3s" }}>
                  <div style={{ fontWeight: "bold", fontSize: 17, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ color: "#718096", fontSize: 14, marginBottom: 8 }}>{c.description}</div>
                  <div style={{ color: "#718096", fontSize: 13, marginBottom: 8 }}>to <b>{c.target_name}</b></div>
                  <ProgressBar value={c.progress} max={c.max_progress} />
                  <div style={{ fontSize: 14, color: expired ? "#e53e3e" : "#2d3748", marginBottom: 8 }}>
                    {expired ? "Expired" : daysLeft !== null ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : "No deadline"}
                  </div>
                  <div style={{ fontSize: 14, color: "#2d3748", marginBottom: 8 }}>
                    Progress: {c.progress} / {c.max_progress}
                  </div>
                  <span style={{ color: c.status === "completed" ? "#48bb78" : "#718096", fontWeight: "bold" }}>Status: {c.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 