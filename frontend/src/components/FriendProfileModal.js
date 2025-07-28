import React, { useState } from "react";
import { FaHeart, FaCheck } from "react-icons/fa";

export default function FriendProfileModal({ friend, preferences, onClose, userId }) {
  const [likingWorkout, setLikingWorkout] = useState(null);
  const [likedWorkouts, setLikedWorkouts] = useState(new Set());

  if (!friend || !preferences) return null;

  const handleLikeWorkout = async (workoutName) => {
    if (!userId) return;
    
    setLikingWorkout(workoutName);
    try {
      const response = await fetch("/api/like_workout_from_friend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          friend_id: friend.id,
          workout_name: workoutName
        }),
      });

      if (response.ok) {
        setLikedWorkouts(prev => new Set([...prev, workoutName]));
        // Show success message
        alert(`Added "${workoutName}" to your liked workouts!`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to like workout");
      }
    } catch (error) {
      console.error("Error liking workout:", error);
      alert("Failed to like workout");
    } finally {
      setLikingWorkout(null);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "2rem", width: "90%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem" }}>
          <h3 style={{ margin: 0, color: "#2d3748", fontSize: "22px" }}>
            {friend.name || friend.username}'s Preferences
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#718096" }}
          >
            ×
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Food Preferences */}
          <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "1.5rem" }}>
            <h4 style={{ margin: 0, color: "#2d3748", fontSize: "18px", marginBottom: "0.75rem" }}>Food Preferences</h4>
            {preferences.food_preferences.liked.length > 0 && (
              <div style={{ marginBottom: "0.75rem" }}>
                <h5 style={{ margin: "0 0 0.5rem", color: "#4a5568", fontSize: "14px" }}>Likes:</h5>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {preferences.food_preferences.liked.map((item, index) => (
                    <span key={index} style={{ backgroundColor: "#edf2f7", color: "#4299e1", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>{item}</span>
                  ))}
                </div>
              </div>
            )}
            {preferences.food_preferences.disliked.length > 0 && (
              <div style={{ marginBottom: "0.75rem" }}>
                <h5 style={{ margin: "0 0 0.5rem", color: "#4a5568", fontSize: "14px" }}>Dislikes:</h5>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {preferences.food_preferences.disliked.map((item, index) => (
                    <span key={index} style={{ backgroundColor: "#fdeded", color: "#e53e3e", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>{item}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Workout Likes */}
          {preferences.workout_likes_dislikes && preferences.workout_likes_dislikes.liked.length > 0 && (
            <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "1.5rem" }}>
              <h4 style={{ margin: 0, color: "#2d3748", fontSize: "18px", marginBottom: "0.75rem" }}>Liked Workouts</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {preferences.workout_likes_dislikes.liked.map((workout, index) => (
                  <div key={index} style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    padding: "8px 12px",
                    backgroundColor: "#f7fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0"
                  }}>
                    <span style={{ fontSize: "14px", color: "#2d3748", fontWeight: "500" }}>
                      {workout}
                    </span>
                    {userId && (
                      <button
                        onClick={() => handleLikeWorkout(workout)}
                        disabled={likingWorkout === workout || likedWorkouts.has(workout)}
                        style={{
                          background: likedWorkouts.has(workout) ? "#10b981" : "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          cursor: likedWorkouts.has(workout) ? "default" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          opacity: likingWorkout === workout ? 0.7 : 1
                        }}
                      >
                        {likingWorkout === workout ? (
                          "Adding..."
                        ) : likedWorkouts.has(workout) ? (
                          <>
                            <FaCheck size={12} />
                            Added
                          </>
                        ) : (
                          <>
                            <FaHeart size={12} />
                            Like
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workout Preferences */}
          <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "1.5rem" }}>
            <h4 style={{ margin: 0, color: "#2d3748", fontSize: "18px", marginBottom: "0.75rem" }}>Workout Preferences</h4>
            {preferences.workout_preferences.primary_focus && (
              <div style={{ marginBottom: "0.75rem" }}>
                <h5 style={{ margin: "0 0 0.5rem", color: "#4a5568", fontSize: "14px" }}>Primary Focus:</h5>
                <span style={{ fontSize: "14px", color: "#2d3748", fontWeight: "bold" }}>
                  {preferences.workout_preferences.primary_focus}
                </span>
              </div>
            )}
            {preferences.workout_preferences.fitness_goals.length > 0 && (
              <div style={{ marginBottom: "0.75rem" }}>
                <h5 style={{ margin: "0 0 0.5rem", color: "#4a5568", fontSize: "14px" }}>Fitness Goals:</h5>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {preferences.workout_preferences.fitness_goals.map((goal, index) => (
                    <span key={index} style={{ backgroundColor: "#edf2f7", color: "#4299e1", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>{goal}</span>
                  ))}
                </div>
              </div>
            )}
            {preferences.workout_preferences.training_styles.length > 0 && (
              <div style={{ marginBottom: "0.75rem" }}>
                <h5 style={{ margin: "0 0 0.5rem", color: "#4a5568", fontSize: "14px" }}>Training Styles:</h5>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {preferences.workout_preferences.training_styles.map((style, index) => (
                    <span key={index} style={{ backgroundColor: "#edf2f7", color: "#4299e1", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>{style}</span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginBottom: "0.75rem" }}>
              <h5 style={{ margin: "0 0 0.5rem", color: "#4a5568", fontSize: "14px" }}>Experience Level:</h5>
              <span style={{ fontSize: "14px", color: "#2d3748", fontWeight: "bold" }}>
                {preferences.workout_preferences.fitness_experience || 'Not specified'}
              </span>
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <h5 style={{ margin: "0 0 0.5rem", color: "#4a5568", fontSize: "14px" }}>Gym Membership:</h5>
              <span style={{ fontSize: "14px", color: "#2d3748", fontWeight: "bold" }}>
                {preferences.workout_preferences.has_gym_membership ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 