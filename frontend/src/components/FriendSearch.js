import React from "react";

export default function FriendSearch({ searchQuery, setSearchQuery, searchResults, searchLoading, onSearch, onAddFriend, friends = [], requests = [], onInvite }) {
  // Helper to check if user is already a friend
  const isFriend = (userId) => friends.some(f => f.id === userId);
  // Helper to check if user is in requests
  const isRequested = (userId) => requests && requests.some(r => r.id === userId);

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontSize: 22, color: "#2d3748", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <span role="img" aria-label="search">🔍</span> Find Friends
      </h2>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username or name…"
          style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
        />
        <button
          onClick={onSearch}
          style={{ padding: "8px 12px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold" }}
          disabled={searchLoading}
        >
          {searchLoading ? <span className="spinner" style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #e2e8f0", borderTop: "2px solid #3182ce", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : "Search"}
        </button>
      </div>
      {searchLoading ? (
        <div style={{ textAlign: "center", color: "#718096" }}>Searching…</div>
      ) : searchResults.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
          {searchResults.map((u) => (
            <div key={u.id} style={{ backgroundColor: "#f9f9f9", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center", position: "relative" }}>
              <strong>{u.username}</strong>
              {u.name && (
                <div style={{ fontSize: "13px", color: "#4a5568", margin: "0.5rem 0" }}>{u.name}</div>
              )}
              {isFriend(u.id) ? (
                <span style={{ color: "#48bb78", fontWeight: "bold", fontSize: 13 }}>Already friends</span>
              ) : isRequested(u.id) ? (
                <span style={{ color: "#3182ce", fontWeight: "bold", fontSize: 13 }}>Request sent</span>
              ) : (
                <button
                  onClick={() => onAddFriend(u.id)}
                  style={{ padding: "6px 10px", backgroundColor: "#48bb78", color: "white", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", marginTop: 4 }}
                >
                  Add
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        searchQuery.trim() && (
          <div style={{ textAlign: "center", color: "#718096", fontStyle: "italic", padding: "1rem 0" }}>
            No users found.<br />
            {onInvite && (
              <button
                onClick={() => onInvite(searchQuery)}
                style={{ marginTop: 8, padding: "6px 14px", background: "#4299e1", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}
              >
                Invite "{searchQuery}" by Email
              </button>
            )}
          </div>
        )
      )}
      {/* Spinner keyframes */}
      <style>{`@keyframes spin {0% {transform: rotate(0deg);}100% {transform: rotate(360deg);}}`}</style>
    </div>
  );
} 