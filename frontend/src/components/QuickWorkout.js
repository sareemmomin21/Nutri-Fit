import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import dumbellBenchPress from "./images/dumbell-bench-press.jpg";
import bentOverRows from "./images/bent-over-rows.png";
import lateralRaises from "./images/lateral-raises.png";
import bicepCurl from "./images/bicep-curls.jpg";
import tricepExtension from "./images/tricep-extension.jpg";
import shoulderPress from "./images/shoulder-press.jpg";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
// Exercise image database - you can replace these with actual image URLs
const EXERCISE_IMAGES = {
  // Hardcoded specific exercises you requested
  "chest press": dumbellBenchPress,
  "dumbbell chest press": dumbellBenchPress,
  "bent-over rows": bentOverRows,
  "dumbbell rows": "./images/dumbell-bench-press.jpg",
  "shoulder press": shoulderPress,
  "overhead press": "./images/dumbell-bench-press.jpg",
  "lateral raises": lateralRaises,
  "bicep curls": bicepCurl,
  "tricep extensions": tricepExtension,
  "dumbbell flyes":
    "https://images.unsplash.com/photo-1583500178895-1c445b8f4cc0?w=400&h=300&fit=crop&crop=center",
  "dumbbell reverse flyes":
    "https://images.unsplash.com/photo-1583500178745-5c52744f98bd?w=400&h=300&fit=crop&crop=center",

  // Generic fallback images for other exercises
  "push-ups":
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
  squats:
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop&crop=center",
  "bodyweight squats":
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop&crop=center",
  "goblet squats":
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop&crop=center",
  lunges:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
  plank:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
  burpees:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
  "mountain climbers":
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
  "jumping jacks":
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
  deadlifts:
    "https://images.unsplash.com/photo-1583500178690-5405e627b7b3?w=400&h=300&fit=crop&crop=center",
  "romanian deadlifts":
    "https://images.unsplash.com/photo-1583500178690-5405e627b7b3?w=400&h=300&fit=crop&crop=center",
  "kettlebell swings":
    "https://images.unsplash.com/photo-1583500178879-39fda5146234?w=400&h=300&fit=crop&crop=center",
  thrusters:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop&crop=center",
  default:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
};

// Quick Workout Component with Enhanced Like/Dislike Functionality
function QuickWorkout({ userId }) {
  const [duration, setDuration] = useState(30);
  const [focus, setFocus] = useState("full_body");
  const [equipment, setEquipment] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [excludedWorkouts, setExcludedWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [processingFeedback, setProcessingFeedback] = useState(null);

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
      console.log(
        `🔍 Fetching suggestions for ${duration} minutes, focus: ${focus}, equipment: ${equipment.join(
          ", "
        )}`
      );

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
        console.log(`✅ Received ${data.length} suggestions`);
        setSuggestions(data);
      } else {
        console.error("❌ Failed to fetch suggestions:", response.status);
        const errorText = await response.text();
        console.error("Error details:", errorText);
        setSuggestions([]);

        setFeedbackMessage(
          "⚠️ Failed to load workout suggestions. Please try again."
        );
        setTimeout(() => setFeedbackMessage(""), 3000);
      }
    } catch (error) {
      console.error("❌ Network error fetching suggestions:", error);
      setSuggestions([]);
      setFeedbackMessage(
        "⚠️ Network error. Please check your connection and try again."
      );
      setTimeout(() => setFeedbackMessage(""), 3000);
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
    if (processingFeedback === workoutName) {
      console.log(
        `⏳ Already processing feedback for "${workoutName}", skipping...`
      );
      return;
    }

    setProcessingFeedback(workoutName);

    try {
      console.log(
        `Submitting ${
          liked ? "LIKE 👍" : "DISLIKE 👎"
        } for workout: "${workoutName}"`
      );
      console.log(`📤 Request payload:`, {
        user_id: userId,
        workout_name: workoutName,
        liked: liked,
      });

      setFeedbackMessage(
        liked
          ? `👍 Liked "${workoutName}"! We'll show you more workouts like this.`
          : `👎 Disliked "${workoutName}". We'll avoid suggesting this workout in the future.`
      );

      const response = await fetch(
        "http://127.0.0.1:5000/api/quick_workout_feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            workout_name: workoutName,
            liked: liked,
          }),
        }
      );

      console.log(`📡 Response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log(
          `✅ Successfully saved ${
            liked ? "like" : "dislike"
          } for "${workoutName}"`
        );
        console.log(`📥 Response data:`, data);

        if (!liked) {
          console.log(`🚫 Adding "${workoutName}" to excluded workouts list`);
          setExcludedWorkouts((prev) => {
            const newExcluded = [...prev, workoutName];
            console.log("Updated excluded workouts:", newExcluded);
            return newExcluded;
          });

          setFeedbackMessage(
            `👎 "${workoutName}" disliked and removed from suggestions. Finding new workouts...`
          );
        } else {
          setFeedbackMessage(
            `👍 "${workoutName}" added to your liked workouts!`
          );
        }

        setTimeout(() => setFeedbackMessage(""), 4000);
      } else {
        const errorText = await response.text();
        console.error(`❌ HTTP ${response.status} error:`, errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }

        console.error("❌ Failed to submit workout feedback:", response.status);
        console.error("Error details:", errorData);

        setFeedbackMessage(
          `⚠️ Failed to save preference (${response.status}): ${
            errorData.error || "Unknown error"
          }. Please try again.`
        );
        setTimeout(() => setFeedbackMessage(""), 5000);
      }
    } catch (error) {
      console.error("❌ Network error submitting feedback:", error);
      setFeedbackMessage(
        "⚠️ Network error saving preference. Please check your connection and try again."
      );
      setTimeout(() => setFeedbackMessage(""), 5000);
    } finally {
      setProcessingFeedback(null);
    }
  };

  const handleStartWorkout = (suggestion) => {
    console.log(`🏃‍♂️ Starting workout: "${suggestion.workout.name}"`);
    setSelectedWorkout(suggestion);
    setShowWorkoutModal(true);
  };

  const handleCompleteWorkout = async (workoutData) => {
    try {
      console.log("💪 Completing workout:", workoutData.name);

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

        setFeedbackMessage("🎉 Workout completed successfully!");
        setTimeout(() => setFeedbackMessage(""), 3000);

        console.log(
          "📡 Triggering workoutCompleted event for dashboard refresh"
        );
        window.dispatchEvent(
          new CustomEvent("workoutCompleted", {
            detail: { workoutData, userId },
          })
        );

        return true;
      } else {
        const errorData = await response.json();
        console.error(
          "❌ Failed to complete workout:",
          response.status,
          errorData
        );
        setFeedbackMessage(
          `⚠️ Failed to complete workout: ${errorData.error || "Unknown error"}`
        );
        setTimeout(() => setFeedbackMessage(""), 5000);
        return false;
      }
    } catch (error) {
      console.error("❌ Error completing workout:", error);
      setFeedbackMessage(
        "⚠️ Network error completing workout. Please try again."
      );
      setTimeout(() => setFeedbackMessage(""), 5000);
      return false;
    }
  };

  const resetFilters = () => {
    console.log("🔄 Resetting all filters and excluded workouts");
    setExcludedWorkouts([]);
    setDuration(30);
    setFocus("full_body");
    setEquipment([]);
    setFeedbackMessage(
      "🔄 Filters reset! Finding fresh workout suggestions..."
    );
    setTimeout(() => setFeedbackMessage(""), 3000);
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

      {feedbackMessage && (
        <div
          style={{
            backgroundColor: feedbackMessage.includes("⚠️")
              ? "#fed7d7"
              : "#e6fffa",
            border: `1px solid ${
              feedbackMessage.includes("⚠️") ? "#fc8181" : "#81e6d9"
            }`,
            color: feedbackMessage.includes("⚠️") ? "#c53030" : "#234e52",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>{feedbackMessage}</span>
          {processingFeedback && (
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid transparent",
                borderTop: "2px solid currentColor",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          )}
        </div>
      )}

      {process.env.NODE_ENV === "development" &&
        excludedWorkouts.length > 0 && (
          <div
            style={{
              backgroundColor: "#fff5f5",
              border: "1px solid #feb2b2",
              color: "#c53030",
              padding: "8px 12px",
              borderRadius: "6px",
              marginBottom: "1rem",
              fontSize: "12px",
            }}
          >
            🐛 Debug: Excluded workouts: {excludedWorkouts.join(", ")}
          </div>
        )}

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
          <div style={{ color: "#718096" }}>
            Finding perfect workouts for {duration} minutes...
          </div>
        </div>
      ) : suggestions.length === 0 ? (
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🔍</div>
            <h3 style={{ color: "#4a5568" }}>No workouts found</h3>
            <p style={{ color: "#718096", marginBottom: "1rem" }}>
              Try adjusting your criteria or equipment selection. We're looking
              for workouts that are exactly {duration} minutes long.
            </p>
            {excludedWorkouts.length > 0 && (
              <p
                style={{
                  color: "#e53e3e",
                  fontSize: "14px",
                  marginBottom: "1rem",
                }}
              >
                You've excluded {excludedWorkouts.length} workout
                {excludedWorkouts.length !== 1 ? "s" : ""}. Try resetting your
                filters to see more options.
              </p>
            )}
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
          <div
            style={{
              fontSize: "14px",
              color: "#4a5568",
              backgroundColor: "#f7fafc",
              padding: "0.75rem",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
            }}
          >
            Found {suggestions.length} workout
            {suggestions.length !== 1 ? "s" : ""} for {duration} minutes •{" "}
            {focus.replace("_", " ")} focus
            {excludedWorkouts.length > 0 && (
              <span style={{ color: "#e53e3e" }}>
                {" "}
                • {excludedWorkouts.length} excluded
              </span>
            )}
          </div>
          {suggestions.map((suggestion, index) => (
            <WorkoutSuggestionCard
              key={`${suggestion.workout.name}-${index}`}
              suggestion={suggestion}
              onLike={(workoutName) => handleWorkoutFeedback(workoutName, true)}
              onDislike={(workoutName) =>
                handleWorkoutFeedback(workoutName, false)
              }
              onStart={() => handleStartWorkout(suggestion)}
              isProcessingFeedback={
                processingFeedback === suggestion.workout.name
              }
            />
          ))}
        </div>
      )}

      {showWorkoutModal && selectedWorkout && (
        <QuickWorkoutModal
          suggestion={selectedWorkout}
          onClose={() => setShowWorkoutModal(false)}
          onComplete={handleCompleteWorkout}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Enhanced Workout Suggestion Card Component with Visual Preview
function WorkoutSuggestionCard({
  suggestion,
  onLike,
  onDislike,
  onStart,
  isProcessingFeedback,
}) {
  const { workout, match_reason } = suggestion;
  const [showPreview, setShowPreview] = useState(false);

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

  const getExerciseImage = (exerciseName) => {
    const key = exerciseName.toLowerCase();
    return EXERCISE_IMAGES[key] || EXERCISE_IMAGES["default"];
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    opacity: isProcessingFeedback ? 0.7 : 1,
    transition: "opacity 0.2s",
    position: "relative",
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            <h3 style={{ margin: 0, color: "#2d3748", fontSize: "20px" }}>
              {workout.name}
            </h3>

            {/* View Button with Hover Preview */}
            <div
              style={{ position: "relative", display: "inline-block" }}
              onMouseEnter={() => setShowPreview(true)}
              onMouseLeave={() => setShowPreview(false)}
            >
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 12px",
                  backgroundColor: "#4299e1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#3182ce")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#4299e1")}
              >
                <Eye size={14} />
                View
              </button>

              {/* Hover Preview Modal */}
              {showPreview && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginTop: "8px",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    padding: "1rem",
                    width: "400px",
                    maxWidth: "90vw",
                    zIndex: 1000,
                    animation: "fadeIn 0.2s ease-out",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 1rem 0",
                      color: "#2d3748",
                      fontSize: "16px",
                    }}
                  >
                    Workout Preview: {workout.name}
                  </h4>

                  {workout.exercises && workout.exercises.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gap: "0.75rem",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {workout.exercises.slice(0, 4).map((exercise, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.5rem",
                            backgroundColor: "#f7fafc",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <img
                            src={getExerciseImage(exercise.name)}
                            alt={exercise.name}
                            style={{
                              width: "60px",
                              height: "45px",
                              borderRadius: "6px",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              e.target.src = EXERCISE_IMAGES["default"];
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: "600",
                                color: "#2d3748",
                                fontSize: "14px",
                              }}
                            >
                              {exercise.name}
                            </div>
                            {exercise.sets && exercise.reps && (
                              <div
                                style={{ fontSize: "12px", color: "#718096" }}
                              >
                                {exercise.sets} sets × {exercise.reps} reps
                              </div>
                            )}
                          </div>
                          {exercise.rest && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#4a5568",
                                backgroundColor: "#e2e8f0",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                flexShrink: 0,
                              }}
                            >
                              {exercise.rest} rest
                            </div>
                          )}
                        </div>
                      ))}
                      {workout.exercises.length > 4 && (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "0.5rem",
                            color: "#718096",
                            fontSize: "12px",
                          }}
                        >
                          +{workout.exercises.length - 4} more exercises...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#718096",
                      }}
                    >
                      <div style={{ fontSize: "40px", marginBottom: "0.5rem" }}>
                        💪
                      </div>
                      <div>Full workout details available when you start</div>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: "1rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "1rem",
                        fontSize: "12px",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: "bold", color: "#4299e1" }}>
                          {workout.duration} min
                        </div>
                        <div style={{ color: "#718096" }}>Duration</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: "bold", color: "#ed8936" }}>
                          {workout.calories_burned}
                        </div>
                        <div style={{ color: "#718096" }}>Calories</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: "bold", color: "#9f7aea" }}>
                          {workout.exercises?.length || 0}
                        </div>
                        <div style={{ color: "#718096" }}>Exercises</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

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
            disabled={isProcessingFeedback}
            style={{
              padding: "8px",
              backgroundColor: isProcessingFeedback ? "#fed7d7" : "#fed7d7",
              color: "#c53030",
              border: "none",
              borderRadius: "6px",
              cursor: isProcessingFeedback ? "not-allowed" : "pointer",
              fontSize: "16px",
              transition: "all 0.2s",
              position: "relative",
            }}
            title="Don't show this workout again"
            onMouseOver={(e) =>
              !isProcessingFeedback &&
              (e.target.style.backgroundColor = "#feb2b2")
            }
            onMouseOut={(e) =>
              !isProcessingFeedback &&
              (e.target.style.backgroundColor = "#fed7d7")
            }
          >
            {isProcessingFeedback ? "⏳" : <FaThumbsDown />}
          </button>
          <button
            onClick={() => onLike(workout.name)}
            disabled={isProcessingFeedback}
            style={{
              padding: "8px",
              backgroundColor: isProcessingFeedback ? "#c6f6d5" : "#c6f6d5",
              color: "#22543d",
              border: "none",
              borderRadius: "6px",
              cursor: isProcessingFeedback ? "not-allowed" : "pointer",
              fontSize: "16px",
              transition: "all 0.2s",
            }}
            title="Like this workout"
            onMouseOver={(e) =>
              !isProcessingFeedback &&
              (e.target.style.backgroundColor = "#9ae6b4")
            }
            onMouseOut={(e) =>
              !isProcessingFeedback &&
              (e.target.style.backgroundColor = "#c6f6d5")
            }
          >
            {isProcessingFeedback ? "⏳" : <FaThumbsUp />}
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
              <ExerciseCard key={idx} exercise={exercise} />
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
        disabled={isProcessingFeedback}
        style={{
          width: "100%",
          padding: "12px 24px",
          backgroundColor: isProcessingFeedback ? "#a0aec0" : "#48bb78",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: isProcessingFeedback ? "not-allowed" : "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          transition: "background-color 0.2s",
        }}
        onMouseOver={(e) =>
          !isProcessingFeedback && (e.target.style.backgroundColor = "#38a169")
        }
        onMouseOut={(e) =>
          !isProcessingFeedback && (e.target.style.backgroundColor = "#48bb78")
        }
      >
        {isProcessingFeedback ? "Processing..." : "Start This Workout"}
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
        type: "strength",
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
        {suggestion.workout.exercises &&
          suggestion.workout.exercises.length > 0 && (
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
                  <ExerciseCard key={idx} exercise={exercise} />
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
          <strong> Quick Workout Tips:</strong>
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

// Individual Exercise Card Component with View Button
function ExerciseCard({ exercise }) {
  const [showPreview, setShowPreview] = useState(false);

  const getExerciseImage = (exerciseName) => {
    const key = exerciseName.toLowerCase();
    return EXERCISE_IMAGES[key] || EXERCISE_IMAGES["default"];
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem",
        backgroundColor: "white",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
        position: "relative",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ flex: 1 }}>
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

          {/* View Button for Individual Exercise */}
          <div
            style={{ position: "relative", display: "inline-block" }}
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
          >
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                backgroundColor: "#4299e1",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#3182ce")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#4299e1")}
            >
              <Eye size={12} />
              View
            </button>

            {/* Individual Exercise Preview Modal */}
            {showPreview && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: "0",
                  marginTop: "8px",
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  padding: "1.5rem",
                  width: "320px",
                  zIndex: 1000,
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 1rem 0",
                    color: "#2d3748",
                    fontSize: "16px",
                  }}
                >
                  {exercise.name}
                </h4>

                <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                  <img
                    src={getExerciseImage(exercise.name)}
                    alt={exercise.name}
                    style={{
                      width: "200px",
                      height: "150px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: "1px solid #e2e8f0",
                    }}
                    onError={(e) => {
                      e.target.src = EXERCISE_IMAGES["default"];
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {exercise.sets && exercise.reps && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#4a5568",
                          fontWeight: "600",
                        }}
                      >
                        Sets × Reps:
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#2d3748",
                          fontWeight: "bold",
                        }}
                      >
                        {exercise.sets} × {exercise.reps}
                      </span>
                    </div>
                  )}

                  {exercise.rest && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#4a5568",
                          fontWeight: "600",
                        }}
                      >
                        Rest:
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#2d3748",
                          fontWeight: "bold",
                        }}
                      >
                        {exercise.rest}
                      </span>
                    </div>
                  )}

                  {exercise.difficulty && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#4a5568",
                          fontWeight: "600",
                        }}
                      >
                        Difficulty:
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "white",
                          backgroundColor:
                            exercise.difficulty <= 2
                              ? "#48bb78"
                              : exercise.difficulty <= 3
                              ? "#ed8936"
                              : "#e53e3e",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                        }}
                      >
                        {exercise.difficulty}/5
                      </span>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #e2e8f0",
                    fontSize: "12px",
                    color: "#718096",
                    textAlign: "center",
                  }}
                >
                  Focus on proper form and controlled movement
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {exercise.rest && (
        <div
          style={{
            fontSize: "12px",
            color: "#4a5568",
            backgroundColor: "#e2e8f0",
            padding: "2px 6px",
            borderRadius: "4px",
            marginLeft: "0.5rem",
          }}
        >
          {exercise.rest} rest
        </div>
      )}
    </div>
  );
}

export default QuickWorkout;
