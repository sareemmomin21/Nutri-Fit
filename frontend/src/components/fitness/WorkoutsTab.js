import React, { useState } from "react";
import { CustomWorkoutCreationModal } from "./CustomWorkoutModal";
import CustomWorkoutsSection from "./CustomWorkoutsSection";
import { WorkoutCard, WorkoutModal } from "./WorkoutTabs";

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
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger

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
        "http://127.0.0.1:5001/api/create_custom_workout",
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
        // Trigger refresh of custom workouts
        setRefreshTrigger((prev) => prev + 1);
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

      {/* Custom Workouts Section - Pass refresh trigger */}
      <CustomWorkoutsSection
        userId={userId}
        onCompleteWorkout={onCompleteWorkout}
        onRefreshWorkouts={refreshTrigger}
      />

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

      {/* Custom Workout Creation Modal */}
      {showCustomWorkoutModal && (
        <CustomWorkoutCreationModal
          onClose={() => setShowCustomWorkoutModal(false)}
          onCreate={handleCreateCustomWorkout}
        />
      )}
    </div>
  );
}

export default WorkoutsTab;
