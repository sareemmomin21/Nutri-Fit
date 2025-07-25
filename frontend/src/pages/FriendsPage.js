import React, { useState, useEffect, useCallback, useRef } from "react";
import FriendCard from "../components/FriendCard";
import FriendSearch from "../components/FriendSearch";
import FriendProfileModal from "../components/FriendProfileModal";

function ChatModal({ open, friend, userId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!userId || !friend) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/get_messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, friend_id: friend.id, limit: 50 }),
      });
      if (res.ok) {
        setMessages(await res.json());
      } else {
        setError("Failed to load messages");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [userId, friend]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Fetch messages on open/friend change
  useEffect(() => {
    if (open && friend) fetchMessages();
  }, [open, friend, fetchMessages]);

  // Send message
  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/send_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, friend_id: friend.id, content: input }),
      });
      if (res.ok) {
        setInput("");
        await fetchMessages();
      } else {
        setError("Failed to send message");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open || !friend) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
      <div style={{
        background: "white",
        borderRadius: 12,
        padding: 0,
        width: 400,
        maxWidth: "95vw",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>{friend.name || friend.username}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#718096" }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "#f8fafc", minHeight: 0 }}>
          {loading ? (
            <div style={{ color: "#718096", textAlign: "center", marginTop: 40 }}>Loading…</div>
          ) : error ? (
            <div style={{ color: "#e53e3e", textAlign: "center", marginTop: 40 }}>{error}</div>
          ) : (
            <div>
              {messages.length === 0 && <div style={{ color: "#718096", textAlign: "center", margin: 24 }}>(No messages yet)</div>}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: msg.sender_id === userId ? "flex-end" : "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      background: msg.sender_id === userId ? "#48bb78" : "#e2e8f0",
                      color: msg.sender_id === userId ? "white" : "#2d3748",
                      borderRadius: 16,
                      padding: "8px 14px",
                      maxWidth: "70%",
                      fontSize: 15,
                      boxShadow: msg.sender_id === userId ? "0 2px 8px rgba(72,187,120,0.08)" : "none",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                    <div style={{ fontSize: 11, color: msg.sender_id === userId ? "#e6ffe6" : "#718096", marginTop: 4, textAlign: "right" }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <div style={{ borderTop: "1px solid #e2e8f0", padding: 16, background: "#fff", position: "relative", flexShrink: 0 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={2}
            style={{ width: "100%", borderRadius: 8, border: "1px solid #e2e8f0", padding: 8, fontSize: 15, resize: "none", marginBottom: 8, boxSizing: "border-box", maxHeight: 80 }}
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            style={{ float: "right", padding: "6px 18px", background: "#48bb78", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", fontSize: 15, cursor: sending ? "not-allowed" : "pointer" }}
          >
            Send
          </button>
          <div style={{ clear: "both" }} />
        </div>
      </div>
    </div>
  );
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

const leaderboardRowStyle = (rank) => ({
  borderBottom: "1px solid #e2e8f0",
  background: rank === 0 ? "#fefcbf" : rank === 1 ? "#e6fffa" : rank === 2 ? "#f0fff4" : "#f8fafc",
  fontWeight: rank < 3 ? 700 : 400,
});

export default function FriendsPage({ userId }) {
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendPreferences, setFriendPreferences] = useState(null);
  // Placeholder for friend requests (future feature)
  const [requests, setRequests] = useState([]);
  // Messaging state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatFriend, setChatFriend] = useState(null);
  // Advanced features state
  const [activityFeed, setActivityFeed] = useState([]);
  const [badges, setBadges] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderFriendId, setReminderFriendId] = useState(null);
  const [reminderLoading, setReminderLoading] = useState(false);

  // Fetch advanced features
  useEffect(() => {
    if (!userId) return;
    // Activity Feed
    fetch("/api/get_friend_activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, limit: 20 }),
    })
      .then(res => res.ok ? res.json() : [])
      .then(setActivityFeed);
    // Badges (show your own badges)
    fetch("/api/get_friend_badges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_id: userId }),
    })
      .then(res => res.ok ? res.json() : [])
      .then(setBadges);
    // Reminders
    fetch("/api/get_friend_reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
      .then(res => res.ok ? res.json() : [])
      .then(setReminders);
    // Leaderboard (streak by default)
    fetch("/api/get_friends_leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, metric: "streak", limit: 10 }),
    })
      .then(res => res.ok ? res.json() : [])
      .then(setLeaderboard);
  }, [userId]);

  // Fetch Friends List
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

  // Search for Users to Add
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

  // Add Friend
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

  // Remove Friend
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

  // View Friend Preferences
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

  // Invite by Email (placeholder)
  const handleInvite = (email) => {
    alert(`Invite sent to ${email} (feature coming soon!)`);
  };

  // Edit friend note (placeholder, would need backend support)
  const handleEditNote = (friendId, newNote) => {
    setFriends(friends => friends.map(f => f.id === friendId ? { ...f, note: newNote } : f));
    // TODO: send to backend
  };

  // Open chat modal
  const handleMessage = (friend) => {
    setChatFriend(friend);
    setChatOpen(true);
  };

  // Close chat modal
  const handleCloseChat = () => {
    setChatOpen(false);
    setChatFriend(null);
  };

  // Set reminder for a friend
  const handleSetReminder = async () => {
    if (!reminderFriendId || !reminderDate) return;
    setReminderLoading(true);
    await fetch("/api/set_friend_reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        friend_id: reminderFriendId,
        message: reminderMessage,
        remind_at: reminderDate,
      }),
    });
    setReminderLoading(false);
    setReminderFriendId(null);
    setReminderMessage("");
    setReminderDate("");
    // Refresh reminders
    fetch("/api/get_friend_reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
      .then(res => res.ok ? res.json() : [])
      .then(setReminders);
  };

  useEffect(() => {
    if (userId) fetchFriends();
  }, [userId, fetchFriends]);

  return (
    <div>
      {/* Reminders Section */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>⏰ Friend Reminders</div>
        <form
          onSubmit={e => { e.preventDefault(); handleSetReminder(); }}
          style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", background: "#f8fafc", borderRadius: 8, padding: 12 }}
        >
          <select value={reminderFriendId || ""} onChange={e => setReminderFriendId(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", minWidth: 140 }}>
            <option value="">Friend…</option>
            {friends.map(f => (
              <option key={f.id} value={f.id}>{f.name || f.username}</option>
            ))}
          </select>
          <input type="datetime-local" value={reminderDate} onChange={e => setReminderDate(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", minWidth: 180 }} />
          <input type="text" value={reminderMessage} onChange={e => setReminderMessage(e.target.value)} placeholder="Message (optional)" style={{ padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", minWidth: 180 }} />
          <button type="submit" disabled={reminderLoading || !reminderFriendId || !reminderDate} style={{ padding: "10px 20px", background: "#48bb78", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", fontSize: 15, cursor: reminderLoading ? "not-allowed" : "pointer" }}>Set</button>
        </form>
        {reminders.length === 0 ? (
          <div style={subtleText}>(No reminders set)</div>
        ) : (
          <div style={{ maxHeight: 180, overflowY: "auto" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {reminders.map(r => (
                <li key={r.id} style={{ marginBottom: 10, background: "#f8fafc", borderRadius: 8, padding: 12, fontSize: 15, boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                  <b>{r.first_name || r.username}</b>: {r.message || <span style={{ color: "#a0aec0" }}>(No message)</span>} <span style={{ color: "#718096", fontSize: 13 }}>({new Date(r.remind_at).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Leaderboard Section */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>🏆 Friends Leaderboard (Streak)</div>
        {leaderboard.length === 0 ? (
          <div style={subtleText}>(No leaderboard data)</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#f8fafc", borderRadius: 12, minWidth: 320 }}>
              <thead>
                <tr style={{ background: "#f0fff4" }}>
                  <th style={{ textAlign: "left", padding: 10, fontWeight: 700, fontSize: 15 }}>#</th>
                  <th style={{ textAlign: "left", padding: 10, fontWeight: 700, fontSize: 15 }}>Friend</th>
                  <th style={{ textAlign: "left", padding: 10, fontWeight: 700, fontSize: 15 }}>Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((f, i) => (
                  <tr key={f.id} style={leaderboardRowStyle(i)}>
                    <td style={{ padding: 10 }}>{i + 1}</td>
                    <td style={{ padding: 10 }}>{f.first_name || f.username}</td>
                    <td style={{ padding: 10 }}>{f.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <FriendSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        searchLoading={searchLoading}
        onSearch={fetchUserSearch}
        onAddFriend={handleAddFriend}
        friends={friends}
        requests={requests}
        onInvite={handleInvite}
      />
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 22, color: "#2d3748", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <span role="img" aria-label="friends">👥</span> My Friends ({friends.length})
        </h2>
        <div style={{ height: 2, background: "#e2e8f0", margin: "12px 0 24px 0", borderRadius: 2 }} />
        {friendsLoading ? (
          <div>Loading friends…</div>
        ) : friends.length === 0 ? (
          <p style={{ color: "#718096", fontStyle: "italic", textAlign: "center", padding: "1rem 0" }}>
            You haven't added any friends yet.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {friends.map((f) => (
              <FriendCard
                key={f.id}
                friend={f}
                onViewPreferences={handleViewFriendPreferences}
                onRemove={handleRemoveFriend}
                onEditNote={handleEditNote}
                onMessage={handleMessage}
              />
            ))}
          </div>
        )}
      </div>
      <FriendProfileModal
        friend={selectedFriend}
        preferences={friendPreferences}
        onClose={() => {
          setSelectedFriend(null);
          setFriendPreferences(null);
        }}
      />
      <ChatModal
        open={chatOpen}
        friend={chatFriend}
        userId={userId}
        onClose={handleCloseChat}
      />
    </div>
  );
} 