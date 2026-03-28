import React, { useState } from "react";

export default function FriendCard({
  friend,
  onViewPreferences,
  onRemove,
  onEditNote,
  onMessage,
}) {
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
        flexDirection: "column",
        gap: "1rem",
        transition: "box-shadow 0.2s, transform 0.2s",
        position: "relative",
        cursor: "pointer",
        minHeight: 180,
        width: "100%",
        boxSizing: "border-box",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 16px rgba(72,187,120,0.16)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 2px 8px rgba(72,187,120,0.08)")
      }
    >
      {/* Header with avatar and basic info */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "1rem",
          width: "100%",
        }}
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
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: 18,
              color: "#2d3748",
              wordBreak: "break-word",
              lineHeight: "1.3",
            }}
          >
            {friend.name || friend.username}
          </div>
          <div
            style={{
              color: "#718096",
              fontSize: 14,
              wordBreak: "break-word",
              marginTop: "2px",
            }}
          >
            {friend.username}
          </div>
        </div>
      </div>

      {/* Note section */}
      <div
        style={{
          color: "#4299e1",
          fontSize: 13,
          display: "flex",
          alignItems: "flex-start",
          gap: 4,
          width: "100%",
          minHeight: "40px",
        }}
      >
        <span style={{ fontStyle: "italic", flexShrink: 0 }}>Note:</span>
        {editingNote ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              flex: 1,
              minWidth: 0,
            }}
          >
            <input
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              style={{
                fontSize: 13,
                padding: "6px 8px",
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                width: "100%",
                boxSizing: "border-box",
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveNote();
                if (e.key === "Escape") setEditingNote(false);
              }}
            />
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={handleSaveNote}
                style={{
                  background: "#48bb78",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 13,
                  padding: "4px 12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditingNote(false)}
                style={{
                  background: "#e2e8f0",
                  color: "#2d3748",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 13,
                  padding: "4px 12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "4px",
              flex: 1,
              minWidth: 0,
            }}
          >
            <span
              style={{
                wordBreak: "break-word",
                flex: 1,
                minWidth: 0,
              }}
            >
              {friend.note || (
                <span style={{ color: "#cbd5e1" }}>(add a note)</span>
              )}
            </span>
            <span
              style={{
                cursor: "pointer",
                color: "#4299e1",
                fontSize: 15,
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
              }}
              title="Edit note"
              onClick={(e) => {
                e.stopPropagation();
                setEditingNote(true);
              }}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginTop: "auto",
          paddingTop: "8px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <button
          onClick={() => onViewPreferences(friend.id)}
          style={{
            flex: "1 1 auto",
            minWidth: "70px",
            padding: "8px 12px",
            background: "#4299e1",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.2s",
            fontSize: "13px",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#3182ce")}
          onMouseLeave={(e) => (e.target.style.background = "#4299e1")}
        >
          View
        </button>
        {onMessage && (
          <button
            onClick={() => onMessage(friend)}
            style={{
              flex: "1 1 auto",
              minWidth: "70px",
              padding: "8px 12px",
              background: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background 0.2s",
              fontSize: "13px",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#2c5282")}
            onMouseLeave={(e) => (e.target.style.background = "#3182ce")}
          >
            Message
          </button>
        )}
        <button
          onClick={() => setShowConfirm(true)}
          style={{
            padding: "8px 12px",
            background: "#e53e3e",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.2s",
            fontSize: "13px",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.target.style.background = "#c53030")}
          onMouseLeave={(e) => (e.target.style.background = "#e53e3e")}
        >
          Remove
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            borderRadius: 16,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              textAlign: "center",
              maxWidth: "90%",
              wordBreak: "break-word",
            }}
          >
            <div
              style={{ marginBottom: 16, fontSize: "14px", lineHeight: "1.4" }}
            >
              Remove <b>{friend.name || friend.username}</b> from your friends?
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => {
                  setShowConfirm(false);
                  onRemove(friend.id);
                }}
                style={{
                  padding: "8px 16px",
                  background: "#e53e3e",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: "8px 16px",
                  background: "#edf2f7",
                  color: "#2d3748",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
