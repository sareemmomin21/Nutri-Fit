import React, { useState, useEffect } from "react";
import FitnessDashboard from "./FitnessDashboard";
import CustomWorkoutModal from "./CustomWorkoutModal";

// Workout History Tab Component
function WorkoutHistoryTab({ history, isLoading }) {
  const cardStyle = {
    backgroundColor: "#f8fafc",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "1rem",
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div>Loading workout history...</div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div style={cardStyle}>
        <h3>No workout history yet</h3>
        <p>Complete your first workout to see your progress history here.</p>
      </div>
    );
  }

  // Group workouts by date
  const groupedHistory = history.reduce((acc, workout) => {
    const date = workout.date.toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(workout);
    return acc;
  }, {});

  return (
    <div>
      <h2 style={{ marginBottom: "2rem", color: "#2d3748" }}>
        Workout History
      </h2>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {Object.entries(groupedHistory).map(([date, workouts]) => (
          <div
            key={date}
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                margin: "0 0 1rem 0",
                color: "#2d3748",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "0.5rem",
              }}
            >
              {date}
            </h3>

            {workouts.map((workout, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      color: "#2d3748",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {workout.name}
                  </div>
                  <div style={{ fontSize: "14px", color: "#718096" }}>
                    {workout.type} • {workout.difficulty_level}
                  </div>
                  {workout.notes && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#4a5568",
                        marginTop: "0.25rem",
                        fontStyle: "italic",
                      }}
                    >
                      "{workout.notes}"
                    </div>
                  )}
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#4299e1",
                      }}
                    >
                      {workout.duration}
                    </div>
                    <div style={{ fontSize: "12px", color: "#718096" }}>
                      min
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
                      {workout.calories_burned}
                    </div>
                    <div style={{ fontSize: "12px", color: "#718096" }}>
                      cal
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Daily Summary */}
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#e6fffa",
                borderRadius: "8px",
                border: "1px solid #81e6d9",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#234e52",
                }}
              >
                Daily Total: {workouts.reduce((sum, w) => sum + w.duration, 0)}{" "}
                minutes •{" "}
                {workouts.reduce((sum, w) => sum + w.calories_burned, 0)}{" "}
                calories
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fitness Goals Tab Component
function FitnessGoalsTab({ goals, isLoading, onAddGoal, userId }) {
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: "",
    goal_value: "",
    target_date: "",
  });

  const cardStyle = {
    backgroundColor: "#f8fafc",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "1rem",
  };

  const goalTypes = [
    { value: "workouts_per_week", label: "Workouts per Week" },
    { value: "minutes_per_week", label: "Minutes per Week" },
    { value: "calories_burned", label: "Calories Burned" },
    { value: "weight_loss", label: "Weight Loss (lbs)" },
    { value: "weight_gain", label: "Weight Gain (lbs)" },
    { value: "strength_goal", label: "Strength Goal" },
  ];

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.goal_type || !newGoal.goal_value) return;

    const success = await onAddGoal(newGoal);
    if (success) {
      setNewGoal({ goal_type: "", goal_value: "", target_date: "" });
      setShowAddGoalForm(false);
    }
  };

  const calculateProgress = (goal) => {
    if (!goal.target || goal.target === 0) return 0;
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "#48bb78";
    if (progress >= 75) return "#38a169";
    if (progress >= 50) return "#ed8936";
    return "#4299e1";
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div>Loading fitness goals...</div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ margin: "0", color: "#2d3748" }}>Fitness Goals</h2>
        <button
          onClick={() => setShowAddGoalForm(!showAddGoalForm)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#48bb78",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Add Goal
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddGoalForm && (
        <form
          onSubmit={handleAddGoal}
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            marginBottom: "2rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
            Add New Goal
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Goal Type
              </label>
              <select
                value={newGoal.goal_type}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, goal_type: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                }}
                required
              >
                <option value="">Select goal type</option>
                {goalTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Target Value
              </label>
              <input
                type="number"
                value={newGoal.goal_value}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, goal_value: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                }}
                required
                min="1"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Target Date (optional)
              </label>
              <input
                type="date"
                value={newGoal.target_date}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, target_date: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#48bb78",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Add Goal
            </button>
            <button
              type="button"
              onClick={() => setShowAddGoalForm(false)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#e2e8f0",
                color: "#4a5568",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div style={cardStyle}>
          <h3>No fitness goals set yet</h3>
          <p>Add your first fitness goal to start tracking your progress!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {goals.map((goal, index) => {
            const progress = calculateProgress(goal);
            const progressColor = getProgressColor(progress);
            const goalTypeLabel =
              goalTypes.find((t) => t.value === goal.type)?.label || goal.type;

            return (
              <div
                key={index}
                style={{
                  backgroundColor: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem 0", color: "#2d3748" }}>
                      {goalTypeLabel}
                    </h4>
                    <div style={{ fontSize: "14px", color: "#718096" }}>
                      {goal.current} / {goal.target}
                      {goal.target_date && (
                        <span>
                          {" "}
                          • Target:{" "}
                          {new Date(goal.target_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {goal.achieved && (
                    <div
                      style={{
                        backgroundColor: "#c6f6d5",
                        color: "#22543d",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      ✓ ACHIEVED
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "0.5rem" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "20px",
                      backgroundColor: "#e2e8f0",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        backgroundColor: progressColor,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    color: "#4a5568",
                    textAlign: "right",
                  }}
                >
                  {progress.toFixed(1)}% complete
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Workouts Tab Component
function WorkoutsTab({
  recommendations,
  isLoading,
  onCompleteWorkout,
  userId,
}) {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showCustomWorkoutModal, setShowCustomWorkoutModal] = useState(false);
  const [completingWorkout, setCompletingWorkout] = useState(false);

  const cardStyle = {
    backgroundColor: "#f8fafc",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "1rem",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const buttonStyle = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#48bb78",
    color: "white",
  };

  const handleStartWorkout = (workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutModal(true);
  };

  const handleCompleteWorkout = async (workoutData) => {
    setCompletingWorkout(true);
    try {
      const success = await onCompleteWorkout(workoutData);
      if (success) {
        setShowWorkoutModal(false);
        setSelectedWorkout(null);
        alert("Workout completed successfully!");
      } else {
        alert("Failed to complete workout. Please try again.");
      }
    } catch (error) {
      console.error("Error completing workout:", error);
      alert("Error completing workout. Please try again.");
    } finally {
      setCompletingWorkout(false);
    }
  };

  const handleCreateCustomWorkout = async (customWorkoutData) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/create_custom_workout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            ...customWorkoutData,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert("Custom workout created successfully!");
        setShowCustomWorkoutModal(false);
        return true;
      } else {
        alert("Failed to create custom workout. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Error creating custom workout:", error);
      alert("Error creating custom workout. Please try again.");
      return false;
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div>Loading workout recommendations...</div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ margin: "0", color: "#2d3748" }}>Recommended Workouts</h2>
        <button
          onClick={() => setShowCustomWorkoutModal(true)}
          style={{
            ...primaryButtonStyle,
            backgroundColor: "#9f7aea",
          }}
        >
          Create Custom Workout
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div style={cardStyle}>
          <h3>No recommendations available</h3>
          <p>
            Complete your profile to get personalized workout recommendations.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {recommendations.map((rec, index) => (
            <WorkoutCard
              key={index}
              recommendation={rec}
              onStartWorkout={handleStartWorkout}
            />
          ))}
        </div>
      )}

      {/* Workout Modal */}
      {showWorkoutModal && selectedWorkout && (
        <WorkoutModal
          workout={selectedWorkout}
          onClose={() => setShowWorkoutModal(false)}
          onComplete={handleCompleteWorkout}
          isCompleting={completingWorkout}
        />
      )}

      {/* Custom Workout Modal */}
      {showCustomWorkoutModal && (
        <CustomWorkoutModal
          onClose={() => setShowCustomWorkoutModal(false)}
          onCreate={handleCreateCustomWorkout}
        />
      )}
    </div>
  );
}

// Workout Card Component
function WorkoutCard({ recommendation, onStartWorkout }) {
  const workout = recommendation.workout;
  const type = recommendation.type;

  const cardStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "strength":
        return "#4299e1";
      case "cardio":
        return "#ed8936";
      case "flexibility":
        return "#9f7aea";
      default:
        return "#48bb78";
    }
  };

  const getEquipmentList = (equipment) => {
    if (!equipment || equipment.length === 0) return "No equipment needed";
    if (equipment.includes("none")) return "No equipment needed";
    return equipment.join(", ");
  };

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            <h3 style={{ margin: "0", color: "#2d3748" }}>{workout.name}</h3>
            <span
              style={{
                backgroundColor: getTypeColor(type),
                color: "white",
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {type}
            </span>
          </div>

          {workout.description && (
            <p
              style={{
                color: "#718096",
                fontSize: "14px",
                marginBottom: "1rem",
              }}
            >
              {workout.description}
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#4299e1",
                }}
              >
                {workout.duration}
              </div>
              <div style={{ fontSize: "12px", color: "#718096" }}>minutes</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#ed8936",
                }}
              >
                {workout.calories_burned}
              </div>
              <div style={{ fontSize: "12px", color: "#718096" }}>calories</div>
            </div>
            {workout.intensity && (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#9f7aea",
                  }}
                >
                  {workout.intensity}
                </div>
                <div style={{ fontSize: "12px", color: "#718096" }}>
                  intensity
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                fontSize: "14px",
                color: "#4a5568",
                marginBottom: "0.5rem",
              }}
            >
              <strong>Equipment:</strong> {getEquipmentList(workout.equipment)}
            </div>
            {workout.muscle_groups && (
              <div style={{ fontSize: "14px", color: "#4a5568" }}>
                <strong>Target:</strong> {workout.muscle_groups.join(", ")}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onStartWorkout(recommendation)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#48bb78",
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

      {/* Exercise List for Strength Workouts */}
      {type === "strength" && workout.exercises && (
        <div
          style={{
            backgroundColor: "#f7fafc",
            padding: "1rem",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
            Exercises:
          </h4>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {workout.exercises.slice(0, 3).map((exercise, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#2d3748" }}>{exercise.name}</span>
                <span style={{ color: "#718096" }}>
                  {exercise.sets} sets × {exercise.reps} reps
                </span>
              </div>
            ))}
            {workout.exercises.length > 3 && (
              <div
                style={{
                  fontSize: "14px",
                  color: "#718096",
                  fontStyle: "italic",
                }}
              >
                +{workout.exercises.length - 3} more exercises
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions for Cardio/Flexibility */}
      {(type === "cardio" || type === "flexibility") &&
        workout.instructions && (
          <div
            style={{
              backgroundColor: "#f7fafc",
              padding: "1rem",
              borderRadius: "8px",
              marginTop: "1rem",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
              Instructions:
            </h4>
            <p style={{ margin: "0", fontSize: "14px", color: "#4a5568" }}>
              {workout.instructions}
            </p>
          </div>
        )}
    </div>
  );
}

// Workout Modal Component
function WorkoutModal({ workout, onClose, onComplete, isCompleting }) {
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [actualDuration, setActualDuration] = useState(
    workout.workout.duration
  );

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  };

  const modalStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "80vh",
    overflowY: "auto",
    position: "relative",
  };

  const handleComplete = () => {
    const workoutData = {
      name: workout.workout.name,
      type: workout.type,
      duration: actualDuration,
      intensity: workout.workout.intensity || "moderate",
      notes: workoutNotes,
      exercises: workout.workout.exercises || [],
      date_completed: new Date().toISOString().split("T")[0],
    };

    onComplete(workoutData);
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#718096",
          }}
        >
          ×
        </button>

        <h2 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
          Complete Workout: {workout.workout.name}
        </h2>

        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Actual Duration (minutes)
              </label>
              <input
                type="number"
                value={actualDuration}
                onChange={(e) => setActualDuration(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                }}
                min="1"
                max="180"
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Estimated Calories
              </label>
              <input
                type="text"
                value={Math.round(
                  (actualDuration / workout.workout.duration) *
                    workout.workout.calories_burned
                )}
                disabled
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  backgroundColor: "#f7fafc",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
              }}
            >
              Notes (optional)
            </label>
            <textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="How did the workout feel? Any modifications made?"
              style={{
                width: "100%",
                height: "80px",
                padding: "8px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                resize: "vertical",
              }}
            />
          </div>
        </div>

        <div
          style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
        >
          <button
            onClick={onClose}
            disabled={isCompleting}
            style={{
              padding: "12px 24px",
              backgroundColor: "#e2e8f0",
              color: "#4a5568",
              border: "none",
              borderRadius: "8px",
              cursor: isCompleting ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            style={{
              padding: "12px 24px",
              backgroundColor: isCompleting ? "#a0aec0" : "#48bb78",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isCompleting ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {isCompleting ? "Completing..." : "Complete Workout"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Workout Plan Tab Component
function WorkoutPlanTab({ plan, isLoading, onCompleteWorkout, userId }) {
  const [selectedDay, setSelectedDay] = useState(null);

  const cardStyle = {
    backgroundColor: "#f8fafc",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "1rem",
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div>Loading workout plan...</div>
      </div>
    );
  }

  if (!plan || plan.length === 0) {
    return (
      <div style={cardStyle}>
        <h3>No workout plan available</h3>
        <p>Complete your profile to get a personalized weekly workout plan.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: "2rem", color: "#2d3748" }}>
        Your Weekly Workout Plan
      </h2>

      <div style={{ display: "grid", gap: "1rem" }}>
        {plan.map((dayPlan, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ margin: "0", color: "#2d3748" }}>{dayPlan.day}</h3>
              {dayPlan.workout && (
                <button
                  onClick={() => setSelectedDay(dayPlan)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#48bb78",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  Start Workout
                </button>
              )}
            </div>

            {dayPlan.workout ? (
              <div>
                <div style={{ marginBottom: "1rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
                    {dayPlan.workout.workout.name}
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      gap: "2rem",
                      fontSize: "14px",
                      color: "#718096",
                    }}
                  >
                    <span>{dayPlan.workout.workout.duration} min</span>
                    <span>{dayPlan.workout.workout.calories_burned} cal</span>
                    <span style={{ textTransform: "capitalize" }}>
                      {dayPlan.workout.type}
                    </span>
                  </div>
                </div>

                {dayPlan.workout.workout.exercises && (
                  <div style={{ fontSize: "14px", color: "#4a5568" }}>
                    <strong>Exercises:</strong>{" "}
                    {dayPlan.workout.workout.exercises
                      .slice(0, 3)
                      .map((ex) => ex.name)
                      .join(", ")}
                    {dayPlan.workout.workout.exercises.length > 3 &&
                      ` +${dayPlan.workout.workout.exercises.length - 3} more`}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: "#718096", fontStyle: "italic" }}>
                Rest day - Focus on recovery and light stretching
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Day Modal */}
      {selectedDay && (
        <WorkoutModal
          workout={selectedDay.workout}
          onClose={() => setSelectedDay(null)}
          onComplete={onCompleteWorkout}
          isCompleting={false}
        />
      )}
    </div>
  );
}

export default function Fitness() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [workoutRecommendations, setWorkoutRecommendations] = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [fitnessGoals, setFitnessGoals] = useState([]);
  const [recoveryInfo, setRecoveryInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    dashboard: false,
    recommendations: false,
    plan: false,
    history: false,
    goals: false,
  });

  const userId = localStorage.getItem("nutrifit_user_id");

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
      fetchWorkoutRecommendations();
      fetchWorkoutPlan();
      fetchWorkoutHistory();
      fetchFitnessGoals();
      fetchRecoveryInfo();
    }
  }, [userId]);

  const setLoadingState = (key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  const fetchDashboardData = async () => {
    try {
      setLoadingState("dashboard", true);
      const response = await fetch(
        "http://localhost:5000/api/get_fitness_dashboard",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingState("dashboard", false);
      setIsLoading(false);
    }
  };

  const fetchWorkoutRecommendations = async () => {
    try {
      setLoadingState("recommendations", true);
      const response = await fetch(
        "http://localhost:5000/api/get_workout_recommendations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkoutRecommendations(data);
      }
    } catch (error) {
      console.error("Error fetching workout recommendations:", error);
    } finally {
      setLoadingState("recommendations", false);
    }
  };

  const fetchWorkoutPlan = async () => {
    try {
      setLoadingState("plan", true);
      const response = await fetch(
        "http://localhost:5000/api/get_workout_plan",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkoutPlan(data);
      }
    } catch (error) {
      console.error("Error fetching workout plan:", error);
    } finally {
      setLoadingState("plan", false);
    }
  };

  const fetchWorkoutHistory = async () => {
    try {
      setLoadingState("history", true);
      const response = await fetch(
        "http://localhost:5000/api/get_workout_history",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, days_back: 30 }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkoutHistory(data);
      }
    } catch (error) {
      console.error("Error fetching workout history:", error);
    } finally {
      setLoadingState("history", false);
    }
  };

  const fetchFitnessGoals = async () => {
    try {
      setLoadingState("goals", true);
      const response = await fetch(
        "http://localhost:5000/api/get_fitness_goals",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFitnessGoals(data);
      }
    } catch (error) {
      console.error("Error fetching fitness goals:", error);
    } finally {
      setLoadingState("goals", false);
    }
  };

  const fetchRecoveryInfo = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/get_recovery_recommendations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecoveryInfo(data);
      }
    } catch (error) {
      console.error("Error fetching recovery info:", error);
    }
  };

  const completeWorkout = async (workoutData) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/complete_workout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            workout_data: workoutData,
          }),
        }
      );

      if (response.ok) {
        // Refresh data after completing workout
        fetchDashboardData();
        fetchWorkoutHistory();
        fetchRecoveryInfo();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error completing workout:", error);
      return false;
    }
  };

  const addFitnessGoal = async (goalData) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/add_fitness_goal",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            ...goalData,
          }),
        }
      );

      if (response.ok) {
        fetchFitnessGoals();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding fitness goal:", error);
      return false;
    }
  };

  // Styles
  const containerStyle = {
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
    maxWidth: "1400px",
    margin: "0 auto",
    backgroundColor: "#f7fafc",
    minHeight: "100vh",
  };

  const headerStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "2rem",
  };

  const tabStyle = (isActive) => ({
    padding: "12px 24px",
    border: "none",
    borderBottom: isActive ? "3px solid #48bb78" : "3px solid transparent",
    backgroundColor: "transparent",
    color: isActive ? "#48bb78" : "#718096",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: isActive ? "bold" : "normal",
    transition: "all 0.2s",
  });

  const LoadingSpinner = ({ size = "20px" }) => (
    <div
      style={{
        width: size,
        height: size,
        border: "2px solid #e2e8f0",
        borderTop: "2px solid #48bb78",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        display: "inline-block",
        margin: "0 auto",
      }}
    />
  );

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <LoadingSpinner size="40px" />
          <div style={{ marginTop: "1rem", color: "#718096" }}>
            Loading your fitness dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
          Fitness Dashboard
        </h1>
        <p style={{ margin: "0", color: "#718096" }}>
          Track your workouts, monitor progress, and achieve your fitness goals
        </p>
      </div>

      {/* Recovery Alert */}
      {recoveryInfo && recoveryInfo.rest_needed && (
        <div
          style={{
            backgroundColor: "#fed7d7",
            border: "1px solid #e53e3e",
            color: "#c53030",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          <strong>Recovery Recommendation:</strong> {recoveryInfo.message}
          <br />
          <small>{recoveryInfo.recommendation}</small>
        </div>
      )}

      {/* Tab Navigation */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px 12px 0 0",
          border: "1px solid #e2e8f0",
          borderBottom: "none",
        }}
      >
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
          <button
            onClick={() => setActiveTab("dashboard")}
            style={tabStyle(activeTab === "dashboard")}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("workouts")}
            style={tabStyle(activeTab === "workouts")}
          >
            Workouts
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            style={tabStyle(activeTab === "plan")}
          >
            My Plan
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            style={tabStyle(activeTab === "goals")}
          >
            Goals
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "0 0 12px 12px",
          border: "1px solid #e2e8f0",
          padding: "2rem",
        }}
      >
        {activeTab === "dashboard" && (
          <FitnessDashboard
            data={dashboardData}
            isLoading={loadingStates.dashboard}
          />
        )}

        {activeTab === "workouts" && (
          <WorkoutsTab
            recommendations={workoutRecommendations}
            isLoading={loadingStates.recommendations}
            onCompleteWorkout={completeWorkout}
            userId={userId}
          />
        )}

        {activeTab === "plan" && (
          <WorkoutPlanTab
            plan={workoutPlan}
            isLoading={loadingStates.plan}
            onCompleteWorkout={completeWorkout}
            userId={userId}
          />
        )}

        {activeTab === "history" && (
          <WorkoutHistoryTab
            history={workoutHistory}
            isLoading={loadingStates.history}
          />
        )}

        {activeTab === "goals" && (
          <FitnessGoalsTab
            goals={fitnessGoals}
            isLoading={loadingStates.goals}
            onAddGoal={addFitnessGoal}
            userId={userId}
          />
        )}
      </div>
    </div>
  );
}
