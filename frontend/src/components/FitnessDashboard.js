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
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#48bb78" }}
          >
            {data.weekly_stats.workouts}
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Workouts This Week
          </div>
        </div>

        <div style={statCardStyle}>
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#4299e1" }}
          >
            {Math.round(data.weekly_stats.total_duration)}
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Minutes This Week
          </div>
        </div>

        <div style={statCardStyle}>
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#ed8936" }}
          >
            {Math.round(data.weekly_stats.total_calories)}
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Calories Burned
          </div>
        </div>

        <div style={statCardStyle}>
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#9f7aea" }}
          >
            {data.weekly_stats.avg_duration}
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Avg Duration (min)
          </div>
        </div>
      </div>
    </div>
  );
}

export default FitnessDashboard;
