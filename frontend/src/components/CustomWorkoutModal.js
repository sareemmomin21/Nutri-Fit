import React, { useState } from "react";

// Custom Workout Modal Component
function CustomWorkoutModal({ onClose, onCreate }) {
  const [workoutName, setWorkoutName] = useState("");
  const [estimatedCalories, setEstimatedCalories] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [workoutType, setWorkoutType] = useState("strength");
  const [intensity, setIntensity] = useState("moderate");
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({
    name: "",
    sets: "",
    reps: "",
    rest: "60s",
    weight: "",
    notes: "",
  });
  const [isCreating, setIsCreating] = useState(false);

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
    maxWidth: "700px",
    width: "90%",
    maxHeight: "85vh",
    overflowY: "auto",
    position: "relative",
  };

  const workoutTypes = [
    { value: "strength", label: "Strength Training" },
    { value: "cardio", label: "Cardio" },
    { value: "flexibility", label: "Flexibility/Yoga" },
    { value: "hiit", label: "HIIT" },
    { value: "sports", label: "Sports" },
    { value: "other", label: "Other" },
  ];

  const intensityLevels = [
    { value: "light", label: "Light" },
    { value: "moderate", label: "Moderate" },
    { value: "vigorous", label: "Vigorous" },
    { value: "extreme", label: "Extreme" },
  ];

  const addExercise = () => {
    if (newExercise.name.trim()) {
      setExercises([...exercises, { ...newExercise, id: Date.now() }]);
      setNewExercise({
        name: "",
        sets: "",
        reps: "",
        rest: "60s",
        weight: "",
        notes: "",
      });
    }
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const handleCreate = async () => {
    if (!workoutName.trim()) {
      alert("Please enter a workout name");
      return;
    }

    if (!estimatedCalories || estimatedCalories < 1) {
      alert("Please enter estimated calories burned");
      return;
    }

    if (!estimatedDuration || estimatedDuration < 1) {
      alert("Please enter estimated duration in minutes");
      return;
    }

    setIsCreating(true);
    try {
      const success = await onCreate({
        workout_name: workoutName,
        workout_type: workoutType,
        estimated_calories: parseInt(estimatedCalories),
        estimated_duration: parseInt(estimatedDuration),
        intensity: intensity,
        exercises: exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets ? parseInt(ex.sets) : undefined,
          reps: ex.reps,
          rest: ex.rest,
          weight: ex.weight,
          notes: ex.notes,
        })),
      });

      if (success) {
        onClose();
      }
    } finally {
      setIsCreating(false);
    }
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

        <h2 style={{ margin: "0 0 1.5rem 0", color: "#2d3748" }}>
          Create Custom Workout
        </h2>

        {/* Basic Workout Info */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
              }}
            >
              Workout Name *
            </label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., My Morning Routine"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
              }}
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
              Workout Type *
            </label>
            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
              }}
            >
              {workoutTypes.map((type) => (
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
              Intensity Level *
            </label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
              }}
            >
              {intensityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
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
              Duration (minutes) *
            </label>
            <input
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              placeholder="e.g., 45"
              min="1"
              max="300"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
              }}
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
              Estimated Calories Burned *
            </label>
            <input
              type="number"
              value={estimatedCalories}
              onChange={(e) => setEstimatedCalories(e.target.value)}
              placeholder="e.g., 250"
              min="1"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
              }}
            />
          </div>
        </div>

        {/* Exercises Section */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
            Exercises (Optional)
          </h3>

          {/* Add Exercise Form */}
          <div
            style={{
              backgroundColor: "#f7fafc",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <input
                type="text"
                value={newExercise.name}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, name: e.target.value })
                }
                placeholder="Exercise name"
                style={{
                  padding: "6px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                }}
              />
              <input
                type="number"
                value={newExercise.sets}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, sets: e.target.value })
                }
                placeholder="Sets"
                style={{
                  padding: "6px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                }}
              />
              <input
                type="text"
                value={newExercise.reps}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, reps: e.target.value })
                }
                placeholder="Reps/Time"
                style={{
                  padding: "6px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                }}
              />
              <input
                type="text"
                value={newExercise.weight}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, weight: e.target.value })
                }
                placeholder="Weight (optional)"
                style={{
                  padding: "6px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <select
                value={newExercise.rest}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, rest: e.target.value })
                }
                style={{
                  padding: "6px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                }}
              >
                <option value="30s">30s rest</option>
                <option value="45s">45s rest</option>
                <option value="60s">60s rest</option>
                <option value="90s">90s rest</option>
                <option value="120s">2min rest</option>
                <option value="180s">3min rest</option>
              </select>
              <input
                type="text"
                value={newExercise.notes}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, notes: e.target.value })
                }
                placeholder="Notes (e.g., slow tempo, focus on form)"
                style={{
                  padding: "6px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                }}
              />
            </div>

            <button
              onClick={addExercise}
              style={{
                padding: "8px 16px",
                backgroundColor: "#48bb78",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Add Exercise
            </button>
          </div>

          {/* Exercise List */}
          {exercises.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
                Added Exercises ({exercises.length}):
              </h4>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      padding: "0.75rem",
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                        {exercise.name}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#718096",
                          marginTop: "0.25rem",
                        }}
                      >
                        {exercise.sets && exercise.reps && (
                          <span>
                            {exercise.sets} sets × {exercise.reps} reps
                          </span>
                        )}
                        {exercise.weight && <span> • {exercise.weight}</span>}
                        {exercise.rest && <span> • {exercise.rest} rest</span>}
                      </div>
                      {exercise.notes && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#4a5568",
                            marginTop: "0.25rem",
                            fontStyle: "italic",
                          }}
                        >
                          {exercise.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e53e3e",
                        cursor: "pointer",
                        fontSize: "18px",
                        marginLeft: "0.5rem",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
        >
          <button
            onClick={onClose}
            disabled={isCreating}
            style={{
              padding: "12px 24px",
              backgroundColor: "#e2e8f0",
              color: "#4a5568",
              border: "none",
              borderRadius: "8px",
              cursor: isCreating ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={
              isCreating ||
              !workoutName.trim() ||
              !estimatedCalories ||
              !estimatedDuration
            }
            style={{
              padding: "12px 24px",
              backgroundColor:
                isCreating ||
                !workoutName.trim() ||
                !estimatedCalories ||
                !estimatedDuration
                  ? "#a0aec0"
                  : "#9f7aea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor:
                isCreating ||
                !workoutName.trim() ||
                !estimatedCalories ||
                !estimatedDuration
                  ? "not-allowed"
                  : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {isCreating ? "Creating..." : "Create Workout"}
          </button>
        </div>

        {/* Help Text */}
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            backgroundColor: "#edf2f7",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#4a5568",
          }}
        >
          <strong>Tips for creating your workout:</strong>
          <ul style={{ margin: "0.5rem 0 0 1rem", paddingLeft: "1rem" }}>
            <li>Choose a descriptive name that you'll recognize later</li>
            <li>Select the workout type that best matches your routine</li>
            <li>Estimate calories based on your body weight and intensity</li>
            <li>Adding exercises helps track your routine and progress</li>
            <li>You can create different versions for progression</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CustomWorkoutModal;
