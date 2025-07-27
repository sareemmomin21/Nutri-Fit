import React, { useState } from "react";
import { CustomWorkoutCreationModal } from "./CustomWorkoutModal";

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

export { WorkoutCard, WorkoutModal, FitnessGoalsTab, WorkoutPlanTab };
