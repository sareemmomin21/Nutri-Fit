import React from "react";

function FitnessDashboard({ data, isLoading }) {
  const cardStyle = {
    backgroundColor: "#f8fafc",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  };

  const statCardStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  const progressCardStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={cardStyle}>
        <h3>Welcome to Your Fitness Journey!</h3>
        <p>Complete your first workout to see your progress here.</p>
      </div>
    );
  }

  const getStreakColor = (streak) => {
    if (streak >= 7) return "#48bb78";
    if (streak >= 3) return "#ed8936";
    return "#4299e1";
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "#48bb78";
    if (percentage >= 60) return "#38a169";
    if (percentage >= 40) return "#ed8936";
    return "#4299e1";
  };

  return (
    <div>
      <h2 style={{ marginBottom: "2rem", color: "#2d3748" }}>
        Fitness Overview
      </h2>

      {/* Weekly Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div style={statCardStyle}>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#48bb78",
            }}
          >
            {data.weekly_stats?.workouts || 0}
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Workouts This Week
          </div>
        </div>

        <div style={statCardStyle}>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#4299e1",
            }}
          >
            {Math.round(data.weekly_stats?.total_duration || 0)}
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Minutes This Week
          </div>
        </div>

        <div style={statCardStyle}>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#ed8936",
            }}
          >
            {Math.round(data.weekly_stats?.total_calories || 0)}
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Calories Burned
          </div>
        </div>

        <div style={statCardStyle}>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#9f7aea",
            }}
          >
            {Math.round(data.weekly_stats?.avg_duration) || 0}
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Avg Duration (min)
          </div>
        </div>
      </div>

      {/* Streak and Goals Progress */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Workout Streak */}
        <div style={progressCardStyle}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
            Current Streak
          </h3>
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div
              style={{
                fontSize: "3rem",
                fontWeight: "bold",
                color: getStreakColor(data.streak?.current_streak || 0),
              }}
            >
              {data.streak?.current_streak || 0}
            </div>
            <div style={{ color: "#718096" }}>consecutive days</div>
          </div>
          {data.streak?.longest_streak && (
            <div style={{ fontSize: "14px", color: "#4a5568" }}>
              Personal best: {data.streak.longest_streak} days
            </div>
          )}
        </div>

        {/* Weekly Goal Progress */}
        {data.weekly_goal && (
          <div style={progressCardStyle}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
              Weekly Goal Progress
            </h3>
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ fontSize: "14px", color: "#4a5568" }}>
                  {data.weekly_goal.current} / {data.weekly_goal.target}{" "}
                  workouts
                </span>
                <span style={{ fontSize: "14px", color: "#4a5568" }}>
                  {Math.round(data.weekly_goal.percentage)}%
                </span>
              </div>
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
                    width: `${Math.min(data.weekly_goal.percentage, 100)}%`,
                    height: "100%",
                    backgroundColor: getProgressColor(
                      data.weekly_goal.percentage
                    ),
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
            {data.weekly_goal.percentage >= 100 && (
              <div
                style={{
                  color: "#48bb78",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                🎉 Goal achieved this week!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {data.recent_workouts && data.recent_workouts.length > 0 && (
        <div style={progressCardStyle}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
            Recent Activity
          </h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {data.recent_workouts.slice(0, 5).map((workout, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
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
                    {workout.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#718096" }}>
                    {new Date(workout.date).toLocaleDateString()} •{" "}
                    {workout.type}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#4299e1",
                    }}
                  >
                    {workout.duration} min
                  </div>
                  <div style={{ fontSize: "12px", color: "#ed8936" }}>
                    {workout.calories} cal
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fitness Stats Summary */}
      {data.all_time_stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          <div style={statCardStyle}>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#48bb78",
              }}
            >
              {data.all_time_stats.total_workouts || 0}
            </div>
            <div style={{ color: "#718096", fontSize: "12px" }}>
              Total Workouts
            </div>
          </div>

          <div style={statCardStyle}>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#4299e1",
              }}
            >
              {Math.round(data.all_time_stats.total_duration || 0)}
            </div>
            <div style={{ color: "#718096", fontSize: "12px" }}>
              Total Minutes
            </div>
          </div>

          <div style={statCardStyle}>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#ed8936",
              }}
            >
              {Math.round(data.all_time_stats.total_calories || 0)}
            </div>
            <div style={{ color: "#718096", fontSize: "12px" }}>
              Total Calories
            </div>
          </div>

          <div style={statCardStyle}>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#9f7aea",
              }}
            >
              {data.all_time_stats.favorite_type || "N/A"}
            </div>
            <div style={{ color: "#718096", fontSize: "12px" }}>
              Favorite Type
            </div>
          </div>
        </div>
      )}

      {/* Motivational Message */}
      {data.motivation_message && (
        <div
          style={{
            backgroundColor: "#e6fffa",
            border: "1px solid #81e6d9",
            borderRadius: "8px",
            padding: "1rem",
            marginTop: "2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#234e52",
              marginBottom: "0.5rem",
            }}
          >
            💪 {data.motivation_message}
          </div>
        </div>
      )}
    </div>
  );
}

export default FitnessDashboard;
