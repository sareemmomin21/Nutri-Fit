import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
// Quick Workout Component
function QuickWorkout({ userId }) {
  const [duration, setDuration] = useState(30);
  const [focus, setFocus] = useState("full_body");
  const [equipment, setEquipment] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [excludedWorkouts, setExcludedWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  const focusOptions = [
    {
      value: "full_body",
      label: "Full Body",
      description: "Complete workout hitting all muscle groups",
    },
    {
      value: "upper_body",
      label: "Upper Body",
      description: "Chest, shoulders, arms, and back",
    },
    {
      value: "lower_body",
      label: "Lower Body",
      description: "Legs, glutes, and calves",
    },
    {
      value: "core",
      label: "Core",
      description: "Abs, obliques, and core stability",
    },
    {
      value: "cardio",
      label: "Cardio",
      description: "Heart-pumping, calorie-burning exercises",
    },
  ];

  const equipmentOptions = [
    { value: "none", label: "No Equipment (Bodyweight Only)" },
    { value: "dumbbells", label: "Dumbbells" },
    { value: "resistance_bands", label: "Resistance Bands" },
    { value: "kettlebell", label: "Kettlebell" },
    { value: "yoga_mat", label: "Yoga Mat" },
    { value: "pull_up_bar", label: "Pull-up Bar" },
    { value: "exercise_bike", label: "Exercise Bike" },
    { value: "treadmill", label: "Treadmill" },
    { value: "jump_rope", label: "Jump Rope" },
    { value: "stability_ball", label: "Stability Ball" },
    { value: "foam_roller", label: "Foam Roller" },
    { value: "bench", label: "Bench" },
    { value: "barbell", label: "Barbell" },
  ];

  useEffect(() => {
    if (userId) {
      fetchSuggestions();
    }
  }, [duration, focus, equipment, excludedWorkouts, userId]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/get_quick_workout_suggestions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            duration: duration,
            focus: focus,
            equipment: equipment,
            excluded_workouts: excludedWorkouts,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEquipmentChange = (equipmentValue) => {
    setEquipment((prev) => {
      if (equipmentValue === "none") {
        return ["none"];
      } else {
        const newEquipment = prev.filter((eq) => eq !== "none");
        if (newEquipment.includes(equipmentValue)) {
          return newEquipment.filter((eq) => eq !== equipmentValue);
        } else {
          return [...newEquipment, equipmentValue];
        }
      }
    });
  };

  const handleWorkoutFeedback = async (workoutName, liked) => {
    try {
      console.log(
        `Submitting ${liked ? "like" : "dislike"} for workout: ${workoutName}`
      );

      const response = await fetch(
        "http://127.0.0.1:5000/api/quick_workout_feedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            workout_name: workoutName,
            liked: liked,
          }),
        }
      );

      if (response.ok) {
        console.log(
          `Successfully submitted ${
            liked ? "like" : "dislike"
          } for ${workoutName}`
        );

        if (!liked) {
          // If disliked, exclude this workout and fetch new suggestions
          setExcludedWorkouts((prev) => {
            const newExcluded = [...prev, workoutName];
            console.log("Updated excluded workouts:", newExcluded);
            return newExcluded;
          });
        } else {
          // If liked, just show a success message
          alert(`Great! We'll show you more workouts like "${workoutName}"`);
        }
      } else {
        console.error("Failed to submit workout feedback");
        alert("Failed to save preference. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error saving preference. Please try again.");
    }
  };

  const handleStartWorkout = (suggestion) => {
    setSelectedWorkout(suggestion);
    setShowWorkoutModal(true);
  };

  const handleCompleteWorkout = async (workoutData) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/complete_workout",
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
        setShowWorkoutModal(false);
        setSelectedWorkout(null);
        alert("Workout completed successfully!");

        // Trigger a refresh event that the parent Fitness component can listen to
        window.dispatchEvent(new CustomEvent("workoutCompleted"));

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error completing workout:", error);
      return false;
    }
  };

  const resetFilters = () => {
    setExcludedWorkouts([]);
    setDuration(30);
    setFocus("full_body");
    setEquipment([]);
  };

  const containerStyle = {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ margin: "0 0 2rem 0", color: "#2d3748" }}>Quick Workout</h2>

      {/* Workout Criteria Form */}
      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 1.5rem 0", color: "#2d3748" }}>
          What kind of workout are you looking for?
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {/* Duration Slider */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
                color: "#4a5568",
              }}
            >
              Duration: {duration} minutes
            </label>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              style={{
                width: "100%",
                height: "8px",
                backgroundColor: "#e2e8f0",
                borderRadius: "4px",
                outline: "none",
                cursor: "pointer",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#718096",
                marginTop: "0.25rem",
              }}
            >
              <span>10 min</span>
              <span>60 min</span>
            </div>
          </div>

          {/* Focus Area */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
                color: "#4a5568",
              }}
            >
              Focus Area
            </label>
            <select
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                backgroundColor: "white",
                fontSize: "14px",
              }}
            >
              {focusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div
              style={{
                fontSize: "12px",
                color: "#718096",
                marginTop: "0.25rem",
              }}
            >
              {focusOptions.find((opt) => opt.value === focus)?.description}
            </div>
          </div>
        </div>

        {/* Equipment Selection */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.75rem",
              fontWeight: "bold",
              color: "#4a5568",
            }}
          >
            Available Equipment
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.5rem",
            }}
          >
            {equipmentOptions.map((option) => (
              <label
                key={option.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px",
                  backgroundColor: equipment.includes(option.value)
                    ? "#e6fffa"
                    : "#f7fafc",
                  border: equipment.includes(option.value)
                    ? "1px solid #81e6d9"
                    : "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "all 0.2s",
                }}
              >
                <input
                  type="checkbox"
                  checked={equipment.includes(option.value)}
                  onChange={() => handleEquipmentChange(option.value)}
                  style={{ marginRight: "8px" }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button
            onClick={fetchSuggestions}
            disabled={isLoading}
            style={{
              padding: "12px 24px",
              backgroundColor: isLoading ? "#a0aec0" : "#48bb78",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "background-color 0.2s",
            }}
          >
            {isLoading ? "Finding Workouts..." : "Get New Suggestions"}
          </button>

          {excludedWorkouts.length > 0 && (
            <button
              onClick={resetFilters}
              style={{
                padding: "12px 24px",
                backgroundColor: "#e2e8f0",
                color: "#4a5568",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Reset Filters ({excludedWorkouts.length} excluded)
            </button>
          )}
        </div>
      </div>

      {/* Workout Suggestions */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e2e8f0",
              borderTop: "4px solid #48bb78",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem auto",
            }}
          ></div>
          <div style={{ color: "#718096" }}>Finding perfect workouts...</div>
        </div>
      ) : suggestions.length === 0 ? (
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h3 style={{ color: "#4a5568" }}>No workouts found</h3>
            <p style={{ color: "#718096", marginBottom: "1rem" }}>
              Try adjusting your criteria or equipment selection.
            </p>
            <button
              onClick={resetFilters}
              style={{
                padding: "8px 16px",
                backgroundColor: "#48bb78",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {suggestions.map((suggestion, index) => (
            <WorkoutSuggestionCard
              key={index}
              suggestion={suggestion}
              onLike={(workoutName) => handleWorkoutFeedback(workoutName, true)}
              onDislike={(workoutName) =>
                handleWorkoutFeedback(workoutName, false)
              }
              onStart={() => handleStartWorkout(suggestion)}
            />
          ))}
        </div>
      )}

      {/* Workout Modal */}
      {showWorkoutModal && selectedWorkout && (
        <QuickWorkoutModal
          suggestion={selectedWorkout}
          onClose={() => setShowWorkoutModal(false)}
          onComplete={handleCompleteWorkout}
        />
      )}
    </div>
  );
}

// Workout Suggestion Card Component
function WorkoutSuggestionCard({ suggestion, onLike, onDislike, onStart }) {
  const { workout, match_reason } = suggestion;

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case "low":
        return "#48bb78";
      case "low-moderate":
        return "#38a169";
      case "moderate":
        return "#ed8936";
      case "moderate-high":
        return "#e53e3e";
      case "high":
        return "#c53030";
      case "very_high":
        return "#9c4221";
      default:
        return "#4299e1";
    }
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: "0 0 0.5rem 0",
              color: "#2d3748",
              fontSize: "20px",
            }}
          >
            {workout.name}
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                backgroundColor: getIntensityColor(workout.intensity),
                color: "white",
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {workout.intensity}
            </span>

            <div style={{ fontSize: "14px", color: "#718096" }}>
              {match_reason}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
              maxWidth: "400px",
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
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#9f7aea",
                }}
              >
                {workout.exercises?.length || 0}
              </div>
              <div style={{ fontSize: "12px", color: "#718096" }}>
                exercises
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}>
          <button
            onClick={() => onDislike(workout.name)}
            style={{
              padding: "8px",
              backgroundColor: "#fed7d7",
              color: "#c53030",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
            title="Don't show this workout again"
          >
            <FaThumbsDown />
          </button>
          <button
            onClick={() => onLike(workout.name)}
            style={{
              padding: "8px",
              backgroundColor: "#c6f6d5",
              color: "#22543d",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
            title="Like this workout"
          >
            <FaThumbsUp />
          </button>
        </div>
      </div>

      {/* Exercise List */}
      {workout.exercises && workout.exercises.length > 0 && (
        <div
          style={{
            backgroundColor: "#f7fafc",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <h4 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
            Exercises ({workout.exercises.length}):
          </h4>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {workout.exercises.map((exercise, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  backgroundColor: "white",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color: "#2d3748",
                      fontSize: "14px",
                    }}
                  >
                    {exercise.name}
                  </div>
                  {exercise.sets && exercise.reps && (
                    <div style={{ fontSize: "12px", color: "#718096" }}>
                      {exercise.sets} sets × {exercise.reps} reps
                    </div>
                  )}
                </div>
                {exercise.rest && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#4a5568",
                      backgroundColor: "#e2e8f0",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {exercise.rest} rest
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipment Info */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "14px", color: "#4a5568" }}>
          <strong>Equipment needed:</strong>{" "}
          {workout.equipment?.includes("none") ||
          !workout.equipment ||
          workout.equipment.length === 0
            ? "None (bodyweight only)"
            : workout.equipment.join(", ")}
        </div>
      </div>

      {/* Start Workout Button */}
      <button
        onClick={onStart}
        style={{
          width: "100%",
          padding: "12px 24px",
          backgroundColor: "#48bb78",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          transition: "background-color 0.2s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#38a169")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#48bb78")}
      >
        Start This Workout
      </button>
    </div>
  );
}

// Quick Workout Modal Component
function QuickWorkoutModal({ suggestion, onClose, onComplete }) {
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [actualDuration, setActualDuration] = useState(
    suggestion.workout.duration
  );
  const [isCompleting, setIsCompleting] = useState(false);

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

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const workoutData = {
        name: suggestion.workout.name,
        type: "strength", // Default type for quick workouts
        duration: actualDuration,
        intensity: suggestion.workout.intensity || "moderate",
        notes: workoutNotes,
        exercises: suggestion.workout.exercises || [],
        date_completed: new Date().toISOString().split("T")[0],
      };

      const success = await onComplete(workoutData);
      if (!success) {
        alert("Failed to complete workout. Please try again.");
      }
    } finally {
      setIsCompleting(false);
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
          Complete Workout: {suggestion.workout.name}
        </h2>

        {/* Workout Overview */}
        <div
          style={{
            backgroundColor: "#f7fafc",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
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
                {suggestion.workout.duration}
              </div>
              <div style={{ fontSize: "12px", color: "#718096" }}>
                planned minutes
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#ed8936",
                }}
              >
                {suggestion.workout.calories_burned}
              </div>
              <div style={{ fontSize: "12px", color: "#718096" }}>
                estimated calories
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#9f7aea",
                }}
              >
                {suggestion.workout.exercises?.length || 0}
              </div>
              <div style={{ fontSize: "12px", color: "#718096" }}>
                exercises
              </div>
            </div>
          </div>

          <div style={{ fontSize: "14px", color: "#4a5568" }}>
            <strong>Match reason:</strong> {suggestion.match_reason}
          </div>
        </div>

        {/* Exercise List */}
        {suggestion.workout.exercises && (
          <div
            style={{
              backgroundColor: "#f7fafc",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
              Exercises to Complete:
            </h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {suggestion.workout.exercises.map((exercise, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    backgroundColor: "white",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#2d3748",
                        fontSize: "14px",
                      }}
                    >
                      {exercise.name}
                    </div>
                    {exercise.sets && exercise.reps && (
                      <div style={{ fontSize: "12px", color: "#718096" }}>
                        {exercise.sets} sets × {exercise.reps} reps
                      </div>
                    )}
                  </div>
                  {exercise.rest && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#4a5568",
                        backgroundColor: "#e2e8f0",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      Rest: {exercise.rest}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion Form */}
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
                Estimated Calories Burned
              </label>
              <input
                type="text"
                value={Math.round(
                  (actualDuration / suggestion.workout.duration) *
                    suggestion.workout.calories_burned
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
              Workout Notes (optional)
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

        {/* Action Buttons */}
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

        {/* Workout Tips */}
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
          <strong>💡 Quick Workout Tips:</strong>
          <ul style={{ margin: "0.5rem 0 0 1rem", paddingLeft: "1rem" }}>
            <li>Focus on proper form over speed</li>
            <li>Take the suggested rest times between exercises</li>
            <li>Modify exercises if needed to match your fitness level</li>
            <li>Stay hydrated throughout your workout</li>
            <li>Listen to your body and stop if you feel pain</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default QuickWorkout;
