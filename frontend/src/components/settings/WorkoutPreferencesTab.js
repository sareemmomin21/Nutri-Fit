// components/WorkoutPreferencesTab.js
import React, { useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { settingsAPI } from "../../utils/settingsAPI";

export default function WorkoutPreferencesTab({ preferences, onRefresh }) {
  const [isRemoving, setIsRemoving] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const userId = localStorage.getItem("nutrifit_user_id");

  const handleRemovePreference = async (workoutName, preferenceType) => {
    if (
      !window.confirm(
        `Remove "${workoutName}" from your ${preferenceType} workouts?`
      )
    ) {
      return;
    }

    setIsRemoving(workoutName);

    try {
      const success = await settingsAPI.removeWorkoutPreference(
        userId,
        workoutName
      );

      if (success) {
        setMessage({
          type: "success",
          text: `"${workoutName}" removed from your ${preferenceType} workouts!`,
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        onRefresh();
      } else {
        setMessage({
          type: "error",
          text: "Failed to remove preference",
        });
      }
    } catch (error) {
      console.error("Error removing preference:", error);
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setIsRemoving(null);
    }
  };

  const cardStyle = {
    backgroundColor: "#f7fafc",
    padding: "1.5rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    marginBottom: "1rem",
  };

  const listStyle = {
    listStyle: "none",
    padding: "0",
    margin: "0",
  };

  const itemStyle = {
    padding: "12px 16px",
    backgroundColor: "white",
    marginBottom: "8px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  };

  const badgeStyle = (type) => ({
    padding: "4px 12px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor: type === "liked" ? "#c6f6d5" : "#fed7d7",
    color: type === "liked" ? "#22543d" : "#c53030",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  });

  const removeButtonStyle = (disabled) => ({
    padding: "4px 8px",
    backgroundColor: disabled ? "#e2e8f0" : "#e53e3e",
    color: disabled ? "#a0aec0" : "white",
    border: "none",
    borderRadius: "4px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "12px",
    fontWeight: "bold",
    marginLeft: "8px",
    opacity: disabled ? 0.6 : 1,
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h3 style={{ margin: "0", color: "#2d3748" }}>Workout Preferences</h3>
      </div>

      {/* Message */}
      {message.text && (
        <div
          style={{
            backgroundColor: message.type === "success" ? "#c6f6d5" : "#fed7d7",
            border: `1px solid ${
              message.type === "success" ? "#48bb78" : "#e53e3e"
            }`,
            color: message.type === "success" ? "#22543d" : "#c53030",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage({ type: "", text: "" })}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "16px",
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* How It Works */}
      <div
        style={{
          backgroundColor: "#e6fffa",
          border: "1px solid #81e6d9",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0", color: "#234e52" }}>
          How Workout Preferences Work
        </h4>
        <p style={{ margin: "0", fontSize: "14px", color: "#234e52" }}>
          Your workout preferences are learned when you use the{" "}
          <strong>Quick Workout</strong> feature. When you like or dislike a
          workout, the system remembers your preferences:
        </p>
        <ul
          style={{
            margin: "0.5rem 0 0 1rem",
            fontSize: "14px",
            color: "#234e52",
          }}
        >
          <li>
            <strong>Liked workouts</strong> will appear more often in your
            recommendations
          </li>
          <li>
            <strong>Disliked workouts</strong> will be excluded from future
            suggestions
          </li>
          <li>You can remove any preference using the "Remove" button below</li>
          <li>The system gets smarter the more you use it!</li>
        </ul>
      </div>

      {/* Workout Preferences Summary */}
      <div style={cardStyle}>
        <h4 style={{ marginBottom: "1rem", color: "#2d3748" }}>
          Your Workout Preferences
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          {/* Liked Workouts */}
          <div>
            <h5
              style={{
                color: "#22543d",
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaThumbsUp /> Liked Workouts ({preferences.liked?.length || 0})
            </h5>
            {preferences.liked?.length > 0 ? (
              <ul style={listStyle}>
                {preferences.liked.map((workout, index) => (
                  <li key={index} style={itemStyle}>
                    <span style={{ fontWeight: "500" }}>{workout}</span>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={badgeStyle("liked")}>
                        <FaThumbsUp /> Liked
                      </span>
                      <button
                        onClick={() => handleRemovePreference(workout, "liked")}
                        disabled={isRemoving === workout}
                        style={removeButtonStyle(isRemoving === workout)}
                      >
                        {isRemoving === workout ? "..." : "Remove"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                style={{
                  backgroundColor: "white",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                }}
              >
                <p
                  style={{ color: "#718096", fontStyle: "italic", margin: "0" }}
                >
                  No liked workouts yet
                </p>
                <p
                  style={{
                    color: "#4a5568",
                    fontSize: "14px",
                    margin: "0.5rem 0 0 0",
                  }}
                >
                  Try the Quick Workout feature and like workouts you enjoy!
                </p>
              </div>
            )}
          </div>

          {/* Disliked Workouts */}
          <div>
            <h5
              style={{
                color: "#c53030",
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaThumbsDown /> Disliked Workouts (
              {preferences.disliked?.length || 0})
            </h5>
            {preferences.disliked?.length > 0 ? (
              <ul style={listStyle}>
                {preferences.disliked.map((workout, index) => (
                  <li key={index} style={itemStyle}>
                    <span style={{ fontWeight: "500" }}>{workout}</span>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={badgeStyle("disliked")}>
                        <FaThumbsDown /> Disliked
                      </span>
                      <button
                        onClick={() =>
                          handleRemovePreference(workout, "disliked")
                        }
                        disabled={isRemoving === workout}
                        style={removeButtonStyle(isRemoving === workout)}
                      >
                        {isRemoving === workout ? "..." : "Remove"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                style={{
                  backgroundColor: "white",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                }}
              >
                <p
                  style={{ color: "#718096", fontStyle: "italic", margin: "0" }}
                >
                  No disliked workouts yet
                </p>
                <p
                  style={{
                    color: "#4a5568",
                    fontSize: "14px",
                    margin: "0.5rem 0 0 0",
                  }}
                >
                  Good! You haven't found any workouts you don't like.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          backgroundColor: "#edf2f7",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #cbd5e0",
        }}
      >
        <p style={{ margin: "0", fontSize: "14px", color: "#4a5568" }}>
          <strong>Want to set workout preferences?</strong>
          <br />
          Go to <strong>Fitness → Quick Workout</strong> and use the like and
          dislike buttons on workout suggestions. Your preferences will
          automatically appear here!
        </p>
      </div>
    </div>
  );
}
