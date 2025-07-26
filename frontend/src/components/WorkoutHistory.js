import React, { useState, useEffect } from "react";

// Modal for adding missing workout
function AddMissingWorkoutModal({
  onClose,
  selectedDate,
  userId,
  onWorkoutAdded,
  customWorkouts = [],
}) {
  const [modalTab, setModalTab] = useState("select"); // "select" or "create"
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create workout form state
  const [newWorkout, setNewWorkout] = useState({
    name: "",
    type: "strength",
    duration: "",
    intensity: "moderate",
    calories_burned: "",
    notes: "",
    exercises: [],
  });

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
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

  const handleSelectExistingWorkout = async () => {
    if (!selectedWorkout) return;

    setIsSubmitting(true);
    try {
      // Ensure date is properly formatted as local date string (YYYY-MM-DD)
      const localDateString = selectedDate.includes("T")
        ? selectedDate.split("T")[0]
        : selectedDate;

      console.log("Submitting existing workout with date:", localDateString);
      console.log("Original selectedDate was:", selectedDate);

      // Submit the selected workout for the specific date
      const workoutData = {
        name: selectedWorkout.name,
        type: selectedWorkout.workout_data.type || "strength",
        duration: selectedWorkout.workout_data.duration,
        intensity: selectedWorkout.workout_data.intensity || "moderate",
        calories_burned: selectedWorkout.workout_data.calories_burned,
        exercises: selectedWorkout.workout_data.exercises || [],
        date_completed: localDateString, // Use local date string
        notes: `Logged retrospectively from custom workout: ${selectedWorkout.name}`,
      };

      console.log("Workout data being sent:", workoutData);

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
        const result = await response.json();
        console.log("Backend response:", result);
        onWorkoutAdded();
        onClose();
      } else {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        alert("Failed to add workout. Please try again.");
      }
    } catch (error) {
      console.error("Error adding existing workout:", error);
      alert("Error adding workout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewWorkout = async () => {
    if (
      !newWorkout.name ||
      !newWorkout.duration ||
      !newWorkout.calories_burned
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure date is properly formatted as local date string (YYYY-MM-DD)
      const localDateString = selectedDate.includes("T")
        ? selectedDate.split("T")[0]
        : selectedDate;

      // First, create the custom workout
      const createResponse = await fetch(
        "http://127.0.0.1:5000/api/create_custom_workout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            workout_name: newWorkout.name,
            workout_type: newWorkout.type,
            estimated_duration: parseInt(newWorkout.duration),
            estimated_calories: parseInt(newWorkout.calories_burned),
            intensity: newWorkout.intensity,
            exercises: newWorkout.exercises,
          }),
        }
      );

      if (!createResponse.ok) {
        throw new Error("Failed to create custom workout");
      }

      // Then, log it as completed for the selected date
      const workoutData = {
        name: newWorkout.name,
        type: newWorkout.type,
        duration: parseInt(newWorkout.duration),
        intensity: newWorkout.intensity,
        calories_burned: parseInt(newWorkout.calories_burned),
        exercises: newWorkout.exercises,
        date_completed: localDateString, // Use local date string
        notes: newWorkout.notes || "Logged retrospectively",
      };

      const completeResponse = await fetch(
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

      if (completeResponse.ok) {
        onWorkoutAdded();
        onClose();
      } else {
        alert("Failed to log workout. Please try again.");
      }
    } catch (error) {
      console.error("Error creating and logging workout:", error);
      alert("Error creating workout. Please try again.");
    } finally {
      setIsSubmitting(false);
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

        <h2 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
          Add Workout for{" "}
          {(() => {
            // Parse the selectedDate and format it properly
            if (selectedDate) {
              const [year, month, day] = selectedDate.split("-");
              const date = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day)
              );
              return date.toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
              });
            }
            return "Selected Date";
          })()}
        </h2>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            marginBottom: "2rem",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <button
            onClick={() => setModalTab("select")}
            style={{
              padding: "12px 24px",
              border: "none",
              borderBottom:
                modalTab === "select"
                  ? "3px solid #48bb78"
                  : "3px solid transparent",
              backgroundColor: "transparent",
              color: modalTab === "select" ? "#48bb78" : "#718096",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: modalTab === "select" ? "bold" : "normal",
            }}
          >
            Select Existing ({customWorkouts.length})
          </button>
          <button
            onClick={() => setModalTab("create")}
            style={{
              padding: "12px 24px",
              border: "none",
              borderBottom:
                modalTab === "create"
                  ? "3px solid #48bb78"
                  : "3px solid transparent",
              backgroundColor: "transparent",
              color: modalTab === "create" ? "#48bb78" : "#718096",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: modalTab === "create" ? "bold" : "normal",
            }}
          >
            Create New
          </button>
        </div>

        {/* Tab Content */}
        {modalTab === "select" ? (
          <div>
            <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
              Select from Your Custom Workouts
            </h3>

            {customWorkouts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#718096",
                  backgroundColor: "#f7fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <p>No custom workouts available.</p>
                <p>Switch to "Create New" tab to add a workout for this day.</p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  marginBottom: "2rem",
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                {customWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    onClick={() => setSelectedWorkout(workout)}
                    style={{
                      padding: "1rem",
                      border:
                        selectedWorkout?.id === workout.id
                          ? "2px solid #48bb78"
                          : "1px solid #e2e8f0",
                      borderRadius: "8px",
                      cursor: "pointer",
                      backgroundColor:
                        selectedWorkout?.id === workout.id
                          ? "#f0fff4"
                          : "white",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <h4
                          style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}
                        >
                          {workout.name}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            fontSize: "14px",
                            color: "#718096",
                          }}
                        >
                          <span>{workout.workout_data.duration} min</span>
                          <span>
                            {workout.workout_data.calories_burned} cal
                          </span>
                          <span>{workout.workout_data.type}</span>
                        </div>
                        {workout.workout_data.exercises &&
                          workout.workout_data.exercises.length > 0 && (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#4a5568",
                                marginTop: "0.25rem",
                              }}
                            >
                              {workout.workout_data.exercises.length} exercises
                            </div>
                          )}
                      </div>
                      {selectedWorkout?.id === workout.id && (
                        <div style={{ color: "#48bb78", fontSize: "20px" }}>
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#e2e8f0",
                  color: "#4a5568",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSelectExistingWorkout}
                disabled={isSubmitting || !selectedWorkout}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    isSubmitting || !selectedWorkout ? "#a0aec0" : "#48bb78",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    isSubmitting || !selectedWorkout
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {isSubmitting ? "Adding..." : "Add Selected Workout"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
              Create New Workout
            </h3>

            {/* Quick Workout Form */}
            <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
              <div>
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
                  value={newWorkout.name}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, name: e.target.value })
                  }
                  placeholder="e.g., Morning Run, Evening Yoga"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
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
                    Type *
                  </label>
                  <select
                    value={newWorkout.type}
                    onChange={(e) =>
                      setNewWorkout({ ...newWorkout, type: e.target.value })
                    }
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
                    Intensity *
                  </label>
                  <select
                    value={newWorkout.intensity}
                    onChange={(e) =>
                      setNewWorkout({
                        ...newWorkout,
                        intensity: e.target.value,
                      })
                    }
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
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
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
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={newWorkout.duration}
                    onChange={(e) =>
                      setNewWorkout({ ...newWorkout, duration: e.target.value })
                    }
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
                    Calories Burned *
                  </label>
                  <input
                    type="number"
                    value={newWorkout.calories_burned}
                    onChange={(e) =>
                      setNewWorkout({
                        ...newWorkout,
                        calories_burned: e.target.value,
                      })
                    }
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

              <div>
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
                  value={newWorkout.notes}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, notes: e.target.value })
                  }
                  placeholder="How did the workout feel? Any specific details?"
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
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#e2e8f0",
                  color: "#4a5568",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewWorkout}
                disabled={
                  isSubmitting ||
                  !newWorkout.name ||
                  !newWorkout.duration ||
                  !newWorkout.calories_burned
                }
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    isSubmitting ||
                    !newWorkout.name ||
                    !newWorkout.duration ||
                    !newWorkout.calories_burned
                      ? "#a0aec0"
                      : "#9f7aea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    isSubmitting ||
                    !newWorkout.name ||
                    !newWorkout.duration ||
                    !newWorkout.calories_burned
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {isSubmitting ? "Creating..." : "Create & Add Workout"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Workout History Component
function WorkoutHistory({ userId }) {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [customWorkouts, setCustomWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" or "list"
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (userId) {
      fetchWorkoutHistory();
      fetchCustomWorkouts();
    }
  }, [userId]);

  const fetchWorkoutHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://127.0.0.1:5000/api/get_workout_history",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            days_back: 90, // Get last 3 months
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Convert date strings to Date objects
        const processedData = data.map((workout) => ({
          ...workout,
          date: new Date(workout.date_completed || workout.date),
        }));
        setWorkoutHistory(processedData);
      }
    } catch (error) {
      console.error("Error fetching workout history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomWorkouts = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/get_user_custom_workouts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCustomWorkouts(data);
      }
    } catch (error) {
      console.error("Error fetching custom workouts:", error);
    }
  };

  const handleAddWorkout = (date) => {
    // Ensure we're working with a clean date string (YYYY-MM-DD format)
    let cleanDate;
    if (date instanceof Date) {
      // If it's a Date object, convert to local date string WITHOUT timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      cleanDate = `${year}-${month}-${day}`;
    } else if (typeof date === "string") {
      // If it's already a string, clean it up
      cleanDate = date.includes("T") ? date.split("T")[0] : date;
    } else {
      console.error("Invalid date format:", date);
      return;
    }

    console.log("RAW Date clicked:", date);
    console.log("Date details:", {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      dayOfWeek: date.getDay(),
    });
    console.log("Formatted clean date:", cleanDate);
    console.log(
      "Modal will show date as:",
      (() => {
        const [year, month, day] = cleanDate.split("-");
        const testDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
        return testDate.toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        });
      })()
    );

    setSelectedDate(cleanDate);
    setShowAddWorkoutModal(true);
  };

  const handleWorkoutAdded = async () => {
    fetchWorkoutHistory(); // Refresh the history
    setShowAddWorkoutModal(false);
    setSelectedDate(null);

    // Dispatch multiple custom events to notify all components
    window.dispatchEvent(
      new CustomEvent("workoutCompleted", {
        detail: {
          source: "workoutHistory",
          type: "historical_workout_added",
          date: selectedDate,
        },
      })
    );

    // Also dispatch a specific event for dashboard refresh
    window.dispatchEvent(
      new CustomEvent("dashboardRefresh", {
        detail: { source: "workoutHistory" },
      })
    );

    // Force a complete fitness data refresh with slight delay for backend processing
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("fitnessDataUpdate", {
          detail: {
            source: "workoutHistory",
            action: "historical_workout_added",
          },
        })
      );
    }, 500); // 500ms delay to ensure backend has processed the workout
  };

  // Group workouts by date
  const getWorkoutsForDate = (date) => {
    const dateStr = date.toDateString();
    return workoutHistory.filter(
      (workout) => workout.date.toDateString() === dateStr
    );
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      // 6 weeks
      // Create a new date object for each day to avoid reference issues
      const dayDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      days.push(dayDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  const isToday = (date) => date.toDateString() === today.toDateString();
  const isPastDate = (date) => date < today;
  const isCurrentMonth = (date) => date.getMonth() === currentMonth.getMonth();

  const containerStyle = {
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    marginBottom: "1rem",
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "18px", color: "#718096" }}>
            Loading workout history...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ ...cardStyle, marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h1 style={{ margin: "0", color: "#2d3748" }}>Workout History</h1>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() =>
                setViewMode(viewMode === "calendar" ? "list" : "calendar")
              }
              style={{
                padding: "8px 16px",
                backgroundColor: "#f7fafc",
                color: "#4a5568",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {viewMode === "calendar" ? "📋 List View" : "📅 Calendar View"}
            </button>
          </div>
        </div>
        <p style={{ margin: "0", color: "#718096" }}>
          Track your workout progress and add any missed workouts
        </p>
      </div>

      {viewMode === "calendar" ? (
        <div style={cardStyle}>
          {/* Calendar Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
                )
              }
              style={{
                padding: "8px 12px",
                backgroundColor: "#f7fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              ←
            </button>
            <h2 style={{ margin: "0", color: "#2d3748" }}>
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
                )
              }
              style={{
                padding: "8px 12px",
                backgroundColor: "#f7fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              →
            </button>
          </div>

          {/* Calendar Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "1px",
              backgroundColor: "#e2e8f0",
            }}
          >
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                style={{
                  padding: "1rem",
                  backgroundColor: "#f7fafc",
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#4a5568",
                }}
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              const workouts = getWorkoutsForDate(date);
              const hasWorkouts = workouts.length > 0;
              const canAddWorkout = isPastDate(date) && !isToday(date);

              return (
                <div
                  key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${index}`}
                  style={{
                    minHeight: "120px",
                    padding: "0.5rem",
                    backgroundColor: "white",
                    position: "relative",
                    opacity: isCurrentMonth(date) ? 1 : 0.3,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: isToday(date) ? "bold" : "normal",
                        color: isToday(date) ? "#48bb78" : "#2d3748",
                        backgroundColor: isToday(date)
                          ? "#f0fff4"
                          : "transparent",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {date.getDate()}
                    </span>
                    {canAddWorkout && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Button clicked for date:", date);
                          handleAddWorkout(date);
                        }}
                        style={{
                          fontSize: "12px",
                          padding: "2px 6px",
                          backgroundColor: hasWorkouts ? "#48bb78" : "#ed8936",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer",
                        }}
                        title={
                          hasWorkouts ? "Add another workout" : "Add workout"
                        }
                      >
                        +
                      </button>
                    )}
                  </div>

                  {/* Workout indicators */}
                  <div style={{ display: "grid", gap: "2px" }}>
                    {workouts.slice(0, 3).map((workout, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: "10px",
                          padding: "2px 4px",
                          backgroundColor: "#e6fffa",
                          color: "#234e52",
                          borderRadius: "3px",
                          border: "1px solid #81e6d9",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={`${workout.name} - ${workout.duration}min`}
                      >
                        {workout.name}
                      </div>
                    ))}
                    {workouts.length > 3 && (
                      <div
                        style={{
                          fontSize: "10px",
                          padding: "2px 4px",
                          backgroundColor: "#f7fafc",
                          color: "#718096",
                          borderRadius: "3px",
                          textAlign: "center",
                        }}
                      >
                        +{workouts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              gap: "2rem",
              fontSize: "14px",
              color: "#718096",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#e6fffa",
                  border: "1px solid #81e6d9",
                  borderRadius: "3px",
                }}
              ></div>
              <span>Completed Workout</span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#ed8936",
                  borderRadius: "3px",
                }}
              ></div>
              <span>Add Workout (Orange)</span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#48bb78",
                  borderRadius: "3px",
                }}
              ></div>
              <span>Add Another (Green)</span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#f0fff4",
                  border: "1px solid #48bb78",
                  borderRadius: "3px",
                }}
              ></div>
              <span>Today</span>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div>
          {workoutHistory.length === 0 ? (
            <div style={cardStyle}>
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <h3 style={{ color: "#718096", margin: "0 0 1rem 0" }}>
                  No workout history yet
                </h3>
                <p style={{ color: "#718096", margin: "0" }}>
                  Complete your first workout to see your progress here, or add
                  past workouts you may have missed.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {/* Group workouts by date and display in list format */}
              {(() => {
                const groups = workoutHistory.reduce((groups, workout) => {
                  const date = workout.date.toDateString();
                  if (!groups[date]) {
                    groups[date] = [];
                  }
                  groups[date].push(workout);
                  return groups;
                }, {});

                // Convert to array and sort by date (most recent first)
                return Object.entries(groups)
                  .sort(([a], [b]) => new Date(b) - new Date(a))
                  .map(([date, workouts]) => ({ date, workouts }));
              })().map(({ date, workouts }) => (
                <div key={date} style={cardStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <h3 style={{ margin: "0", color: "#2d3748" }}>
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <div style={{ fontSize: "14px", color: "#718096" }}>
                      {workouts.length} workout
                      {workouts.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: "1rem" }}>
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
                          border: "1px solid #e2e8f0",
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
                            <h4 style={{ margin: "0", color: "#2d3748" }}>
                              {workout.name}
                            </h4>
                            <span
                              style={{
                                backgroundColor: "#e6fffa",
                                color: "#234e52",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                              }}
                            >
                              {workout.type || workout.workout_type}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "2rem",
                              fontSize: "14px",
                              color: "#718096",
                            }}
                          >
                            <span>
                              <strong>Duration:</strong> {workout.duration} min
                            </span>
                            <span>
                              <strong>Calories:</strong>{" "}
                              {workout.calories_burned} cal
                            </span>
                            <span>
                              <strong>Intensity:</strong>{" "}
                              {workout.intensity || workout.difficulty_level}
                            </span>
                          </div>

                          {workout.notes && (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#4a5568",
                                marginTop: "0.5rem",
                                fontStyle: "italic",
                                backgroundColor: "white",
                                padding: "0.5rem",
                                borderRadius: "4px",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              "{workout.notes}"
                            </div>
                          )}
                        </div>

                        {/* Workout stats summary */}
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            alignItems: "center",
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
                            <div style={{ fontSize: "10px", color: "#718096" }}>
                              MIN
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
                              {workout.calories_burned}
                            </div>
                            <div style={{ fontSize: "10px", color: "#718096" }}>
                              CAL
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Daily summary */}
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
                      Daily Total:{" "}
                      {workouts.reduce((sum, w) => sum + (w.duration || 0), 0)}{" "}
                      minutes •{" "}
                      {workouts.reduce(
                        (sum, w) => sum + (w.calories_burned || 0),
                        0
                      )}{" "}
                      calories burned
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add workout for any past date */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
              Add Missing Workout
            </h3>
            <p style={{ color: "#718096", margin: "0 0 1rem 0" }}>
              Did you work out on a day that's not recorded? Add it to your
              history.
            </p>
            <div style={{ display: "flex", gap: "1rem", alignItems: "end" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                >
                  Select Date
                </label>
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]} // Can't add future workouts
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddWorkout(e.target.value);
                    }
                  }}
                  style={{
                    padding: "8px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div style={{ fontSize: "14px", color: "#718096" }}>
                or click the "+" button on calendar view
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      {workoutHistory.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
            Workout Statistics
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#48bb78",
                }}
              >
                {workoutHistory.length}
              </div>
              <div style={{ fontSize: "14px", color: "#718096" }}>
                Total Workouts
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#4299e1",
                }}
              >
                {workoutHistory.reduce((sum, w) => sum + (w.duration || 0), 0)}
              </div>
              <div style={{ fontSize: "14px", color: "#718096" }}>
                Total Minutes
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#ed8936",
                }}
              >
                {workoutHistory.reduce(
                  (sum, w) => sum + (w.calories_burned || 0),
                  0
                )}
              </div>
              <div style={{ fontSize: "14px", color: "#718096" }}>
                Total Calories
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#9f7aea",
                }}
              >
                {workoutHistory.length > 0
                  ? Math.round(
                      workoutHistory.reduce(
                        (sum, w) => sum + (w.duration || 0),
                        0
                      ) / workoutHistory.length
                    )
                  : 0}
              </div>
              <div style={{ fontSize: "14px", color: "#718096" }}>
                Avg Duration
              </div>
            </div>
          </div>

          {/* Most common workout type */}
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#f0fff4",
              borderRadius: "8px",
              border: "1px solid #9ae6b4",
            }}
          >
            <div style={{ fontSize: "14px", color: "#22543d" }}>
              <strong>Most Popular:</strong>{" "}
              {(() => {
                if (workoutHistory.length === 0) return "No data";

                const types = workoutHistory.reduce((acc, workout) => {
                  const type =
                    workout.type || workout.workout_type || "Unknown";
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                }, {});

                const sortedTypes = Object.entries(types).sort(
                  ([, a], [, b]) => b - a
                );
                return sortedTypes[0]?.[0] || "No data";
              })()}{" "}
              workouts
            </div>
          </div>
        </div>
      )}

      {/* Add Missing Workout Modal */}
      {showAddWorkoutModal && selectedDate && (
        <AddMissingWorkoutModal
          onClose={() => {
            setShowAddWorkoutModal(false);
            setSelectedDate(null);
          }}
          selectedDate={selectedDate}
          userId={userId}
          onWorkoutAdded={handleWorkoutAdded}
          customWorkouts={customWorkouts}
        />
      )}
    </div>
  );
}

export default WorkoutHistory;
