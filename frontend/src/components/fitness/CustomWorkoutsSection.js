import React, { useState, useEffect } from "react";
import { CustomWorkoutCompletionModal } from "./CustomWorkoutModal";

// Custom Workouts Section Component
function CustomWorkoutsSection({
  userId,
  onCompleteWorkout,
  onRefreshWorkouts,
}) {
  const [customWorkouts, setCustomWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchCustomWorkouts();
    }
  }, [userId]);

  // Add effect to listen for refresh events
  useEffect(() => {
    if (onRefreshWorkouts) {
      fetchCustomWorkouts();
    }
  }, [onRefreshWorkouts]);

  const fetchCustomWorkouts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://127.0.0.1:5001/api/get_user_custom_workouts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCustomWorkouts(data.slice(0, 3)); // Show only first 3
      }
    } catch (error) {
      console.error("Error fetching custom workouts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWorkout = (workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutModal(true);
  };

  const handleCompleteWorkout = async (workoutData) => {
    const success = await onCompleteWorkout(workoutData);
    if (success) {
      setShowWorkoutModal(false);
      setSelectedWorkout(null);
    }
    return success;
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "1rem", color: "#718096" }}>
        Loading custom workouts...
      </div>
    );
  }

  if (customWorkouts.length === 0) {
    return null; // Don't show section if no custom workouts
  }

  const priorityCardStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "2px solid #9f7aea", // Purple border for priority
    marginBottom: "1rem",
    boxShadow: "0 4px 6px rgba(159, 122, 234, 0.1)",
    position: "relative",
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* Priority Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ margin: "0", color: "#2d3748" }}>Your Custom Workouts</h3>
        <span
          style={{
            backgroundColor: "#9f7aea",
            color: "white",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          PRIORITY
        </span>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {customWorkouts.map((workout) => (
          <div key={workout.id} style={priorityCardStyle}>
            {/* Priority indicator */}
            <div
              style={{
                position: "absolute",
                top: "-1px",
                right: "1rem",
                backgroundColor: "#9f7aea",
                color: "white",
                padding: "4px 8px",
                borderRadius: "0 0 8px 8px",
                fontSize: "10px",
                fontWeight: "bold",
              }}
            >
              CUSTOM
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1rem",
              }}
            >
              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "#2d3748",
                    fontSize: "18px",
                  }}
                >
                  {workout.name}
                </h4>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem",
                    maxWidth: "350px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#4299e1",
                      }}
                    >
                      {workout.workout_data.duration}
                    </div>
                    <div style={{ fontSize: "12px", color: "#718096" }}>
                      minutes
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#ed8936",
                      }}
                    >
                      {workout.workout_data.calories_burned}
                    </div>
                    <div style={{ fontSize: "12px", color: "#718096" }}>
                      calories
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#9f7aea",
                      }}
                    >
                      {workout.workout_data.exercises?.length || 0}
                    </div>
                    <div style={{ fontSize: "12px", color: "#718096" }}>
                      exercises
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: "14px", color: "#4a5568" }}>
                  <strong>Type:</strong> {workout.workout_data.type || "Custom"}{" "}
                  • <strong>Created:</strong>{" "}
                  {new Date(workout.created_at).toLocaleDateString()}
                </div>
              </div>

              <button
                onClick={() => handleStartWorkout(workout)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#9f7aea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginLeft: "1rem",
                }}
              >
                Start Workout
              </button>
            </div>

            {/* Exercise Preview */}
            {workout.workout_data.exercises &&
              workout.workout_data.exercises.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#f7fafc",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
                    Exercises ({workout.workout_data.exercises.length}):
                  </h5>
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {workout.workout_data.exercises
                      .slice(0, 3)
                      .map((exercise, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "14px",
                            padding: "0.5rem",
                            backgroundColor: "white",
                            borderRadius: "4px",
                          }}
                        >
                          <span style={{ color: "#2d3748", fontWeight: "500" }}>
                            {exercise.name}
                          </span>
                          <span style={{ color: "#718096" }}>
                            {exercise.sets && exercise.reps && (
                              <span>
                                {exercise.sets} × {exercise.reps}
                              </span>
                            )}
                            {exercise.weight && (
                              <span> • {exercise.weight}</span>
                            )}
                          </span>
                        </div>
                      ))}
                    {workout.workout_data.exercises.length > 3 && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#718096",
                          fontStyle: "italic",
                          textAlign: "center",
                          padding: "0.5rem",
                        }}
                      >
                        +{workout.workout_data.exercises.length - 3} more
                        exercises
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Link to view all custom workouts */}
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button
          onClick={() => (window.location.href = "/settings")}
          style={{
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "#9f7aea",
            border: "2px solid #9f7aea",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#9f7aea";
            e.target.style.color = "white";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#9f7aea";
          }}
        >
          View All Custom Workouts in Settings →
        </button>
      </div>

      {/* Workout Completion Modal */}
      {showWorkoutModal && selectedWorkout && (
        <CustomWorkoutCompletionModal
          workout={selectedWorkout}
          onClose={() => setShowWorkoutModal(false)}
          onComplete={handleCompleteWorkout}
        />
      )}
    </div>
  );
}

export default CustomWorkoutsSection;
