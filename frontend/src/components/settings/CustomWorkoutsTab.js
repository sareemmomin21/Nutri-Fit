// components/CustomWorkoutsTab.js
import React from "react";
import { FaRegLightbulb } from "react-icons/fa";

export function CustomWorkoutsTab({
  customWorkouts,
  onStartWorkout,
  onDeleteWorkout,
  onRefresh,
}) {
  const cardStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  const createWorkoutButtonStyle = {
    padding: "12px 24px",
    backgroundColor: "#9f7aea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    display: "inline-block",
    transition: "background-color 0.2s",
  };

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
        <h3 style={{ margin: "0", color: "#2d3748" }}>
          Custom Workouts ({customWorkouts.length})
        </h3>
        <a
          href="/fitness"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/fitness";
          }}
          style={createWorkoutButtonStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#805ad5")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#9f7aea")}
        >
          Create New Workout
        </a>
      </div>

      {/* Instructions */}
      <div
        style={{
          backgroundColor: "#f0fff4",
          border: "1px solid #9ae6b4",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0", color: "#22543d" }}>
          About Custom Workouts
        </h4>
        <p style={{ margin: "0", fontSize: "14px", color: "#22543d" }}>
          Custom workouts are workouts you've created using the workout builder.
          You can start them directly from here, edit them, or manage them. To
          create new custom workouts, go to <strong>Fitness → Workouts</strong>{" "}
          and click "Create Custom Workout".
        </p>
      </div>

      {/* Custom Workouts List */}
      {customWorkouts.length === 0 ? (
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🏋️‍♂️</div>
            <h4 style={{ color: "#4a5568", margin: "0 0 1rem 0" }}>
              No Custom Workouts Yet
            </h4>
            <p style={{ color: "#718096", marginBottom: "1.5rem" }}>
              Create your first custom workout to have complete control over
              your fitness routine. You can add specific exercises, set reps and
              sets, and save it for later use.
            </p>
            <a
              href="/fitness"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/fitness";
              }}
              style={createWorkoutButtonStyle}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#805ad5")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#9f7aea")}
            >
              Create Your First Custom Workout
            </a>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {customWorkouts.map((workout) => (
            <CustomWorkoutCard
              key={workout.id}
              workout={workout}
              onStartWorkout={onStartWorkout}
              onDeleteWorkout={onDeleteWorkout}
            />
          ))}
        </div>
      )}

      {/* Tips Section */}
      <div
        style={{
          backgroundColor: "#edf2f7",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #cbd5e0",
          marginTop: "1.5rem",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
          <FaRegLightbulb /> Managing Custom Workouts
        </h4>
        <ul
          style={{
            margin: "0",
            paddingLeft: "1.5rem",
            fontSize: "14px",
            color: "#4a5568",
          }}
        >
          <li>
            Click <strong>"Start"</strong> to begin a workout and track your
            progress
          </li>
          <li>
            Use <strong>"Delete"</strong> to permanently remove workouts you no
            longer need
          </li>
          <li>
            Custom workouts also appear in your recommended workouts in the
            Fitness section
          </li>
          <li>
            You can create unlimited custom workouts to match your specific
            training needs
          </li>
        </ul>
      </div>
    </div>
  );
}

// Custom Workout Card Component
function CustomWorkoutCard({ workout, onStartWorkout, onDeleteWorkout }) {
  const cardStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
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
            <h4
              style={{
                margin: "0",
                color: "#2d3748",
                fontSize: "20px",
              }}
            >
              {workout.name}
            </h4>
            <span
              style={{
                backgroundColor: "#9f7aea",
                color: "white",
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              CUSTOM
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
              gap: "1rem",
              marginBottom: "1rem",
              maxWidth: "400px",
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
              <div style={{ fontSize: "12px", color: "#718096" }}>minutes</div>
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
              <div style={{ fontSize: "12px", color: "#718096" }}>calories</div>
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

          <div
            style={{
              fontSize: "14px",
              color: "#4a5568",
              marginBottom: "1rem",
            }}
          >
            <strong>Type:</strong> {workout.workout_data.type || "Custom"} •{" "}
            <strong>Created:</strong>{" "}
            {new Date(workout.created_at).toLocaleDateString()} •{" "}
            <strong>Intensity:</strong>{" "}
            {workout.workout_data.intensity || "Moderate"}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}>
          <button
            onClick={() => onStartWorkout(workout)}
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
            Start
          </button>
          <button
            onClick={() => onDeleteWorkout(workout.id, workout.name)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#e53e3e",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Delete
          </button>
        </div>
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
                .slice(0, 4)
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
                      {exercise.weight && <span> • {exercise.weight}</span>}
                    </span>
                  </div>
                ))}
              {workout.workout_data.exercises.length > 4 && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#718096",
                    fontStyle: "italic",
                    textAlign: "center",
                    padding: "0.5rem",
                  }}
                >
                  +{workout.workout_data.exercises.length - 4} more exercises
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}

export default CustomWorkoutsTab;
