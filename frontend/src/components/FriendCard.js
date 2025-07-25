import React, { useState } from "react";

export default function FriendCard({ friend, onViewPreferences, onRemove, onEditNote, onMessage }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(friend.note || "");
  const initials = (friend.name || friend.username || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleSaveNote = () => {
    setEditingNote(false);
    if (onEditNote) onEditNote(friend.id, noteValue);
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        padding: "1.5rem",
        boxShadow: "0 2px 8px rgba(72,187,120,0.08)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        transition: "box-shadow 0.2s, transform 0.2s",
        position: "relative",
        cursor: "pointer",
        minHeight: 80,
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(72,187,120,0.16)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(72,187,120,0.08)")}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#f0fff4",
          color: "#48bb78",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: 20,
        }}
      >
        {initials}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "bold", fontSize: 18, color: "#2d3748" }}>
          {friend.name || friend.username}
        </div>
        <div style={{ color: "#718096", fontSize: 14 }}>{friend.username}</div>
        <div style={{ color: "#4299e1", fontSize: 13, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontStyle: "italic" }}>Note:</span>
          {editingNote ? (
            <>
              <input
                value={noteValue}
                onChange={e => setNoteValue(e.target.value)}
                style={{ fontSize: 13, padding: 2, borderRadius: 4, border: "1px solid #e2e8f0", marginRight: 4 }}
                autoFocus
                onKeyDown={e => {
                  if (e.key === "Enter") handleSaveNote();
                  if (e.key === "Escape") setEditingNote(false);
                }}
              />
              <button onClick={handleSaveNote} style={{ background: "#48bb78", color: "white", border: "none", borderRadius: 4, fontSize: 13, padding: "2px 8px", fontWeight: "bold", marginRight: 2 }}>Save</button>
              <button onClick={() => setEditingNote(false)} style={{ background: "#e2e8f0", color: "#2d3748", border: "none", borderRadius: 4, fontSize: 13, padding: "2px 8px", fontWeight: "bold" }}>Cancel</button>
            </>
          ) : (
            <>
              <span>{friend.note || <span style={{ color: "#cbd5e1" }}>(add a note)</span>}</span>
              <span
                style={{ marginLeft: 4, cursor: "pointer", color: "#4299e1", fontSize: 15, display: "inline-flex", alignItems: "center" }}
                title="Edit note"
                onClick={e => { e.stopPropagation(); setEditingNote(true); }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
              </span>
            </>
          )}
        </div>
      </div>
      <button
        onClick={() => onViewPreferences(friend.id)}
        style={{
          padding: "6px 12px",
          background: "#4299e1",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontWeight: "bold",
          marginRight: 8,
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        View
      </button>
      {onMessage && (
        <button
          onClick={() => onMessage(friend)}
          style={{
            padding: "6px 12px",
            background: "#3182ce",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            marginRight: 8,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          Message
        </button>
      )}
      <button
        onClick={() => setShowConfirm(true)}
        style={{
          padding: "6px 12px",
          background: "#e53e3e",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontWeight: "bold",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        Remove
      </button>
      {showConfirm && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10
        }}>
          <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", textAlign: "center" }}>
            <div style={{ marginBottom: 12 }}>Remove <b>{friend.name || friend.username}</b> from your friends?</div>
            <button
              onClick={() => { setShowConfirm(false); onRemove(friend.id); }}
              style={{ marginRight: 8, padding: "6px 16px", background: "#e53e3e", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}
            >
              Yes, Remove
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              style={{ padding: "6px 16px", background: "#edf2f7", color: "#2d3748", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 