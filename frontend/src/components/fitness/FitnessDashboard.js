import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

function FitnessDashboard({ data, isLoading, userId, onRefreshNeeded }) {
  const [selectedTrendMetric, setSelectedTrendMetric] = useState("calories");
  const [trendData, setTrendData] = useState([]);
  const [workoutTypeData, setWorkoutTypeData] = useState([]);
  const [localData, setLocalData] = useState(data);
  const [refreshing, setRefreshing] = useState(false);

  // Update local data when prop changes
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Listen for workout completion events to refresh data
  useEffect(() => {
    const handleWorkoutCompleted = async (event) => {
      console.log("🔄 FitnessDashboard: Workout completed, refreshing data...");
      setRefreshing(true);

      // Call parent refresh function
      if (onRefreshNeeded) {
        await onRefreshNeeded();
      }

      setRefreshing(false);
    };

    const handleDashboardRefresh = async (event) => {
      console.log("🔄 FitnessDashboard: Dashboard refresh requested...");
      setRefreshing(true);

      if (onRefreshNeeded) {
        await onRefreshNeeded();
      }

      setRefreshing(false);
    };

    // Listen for custom events
    window.addEventListener("workoutCompleted", handleWorkoutCompleted);
    window.addEventListener("dashboardRefresh", handleDashboardRefresh);
    window.addEventListener("fitnessDataUpdate", handleDashboardRefresh);

    return () => {
      window.removeEventListener("workoutCompleted", handleWorkoutCompleted);
      window.removeEventListener("dashboardRefresh", handleDashboardRefresh);
      window.removeEventListener("fitnessDataUpdate", handleDashboardRefresh);
    };
  }, [onRefreshNeeded]);

  // FIXED: Process data for charts using enhanced 14-day data
  useEffect(() => {
    if (localData?.all_workouts_14_days || localData?.recent_workouts) {
      // Use the enhanced 14-day data if available, otherwise fall back to recent_workouts
      const workoutsToProcess =
        localData.all_workouts_14_days || localData.recent_workouts;

      console.log(
        "📊 Processing enhanced chart data with workouts:",
        workoutsToProcess.length
      );
      console.log("📊 First few workouts:", workoutsToProcess.slice(0, 3));

      // Create a map of workouts by date for faster lookups
      const workoutsByDate = {};

      // Process all workouts and group by date
      workoutsToProcess.forEach((workout) => {
        let workoutDate;

        // Handle different date formats from backend
        if (workout.date) {
          // If date is already a Date object or can be parsed
          workoutDate = new Date(workout.date);
        } else if (workout.date_completed) {
          if (typeof workout.date_completed === "string") {
            // Handle YYYY-MM-DD format
            if (workout.date_completed.includes("-")) {
              workoutDate = new Date(workout.date_completed + "T00:00:00");
            } else {
              workoutDate = new Date(workout.date_completed);
            }
          } else {
            workoutDate = new Date(workout.date_completed);
          }
        } else {
          workoutDate = new Date(); // Default to today
        }

        // Ensure valid date
        if (isNaN(workoutDate.getTime())) {
          console.warn("Invalid date for workout:", workout);
          workoutDate = new Date();
        }

        // Create date string in YYYY-MM-DD format for consistent grouping
        const dateStr = workoutDate.toISOString().split("T")[0];

        if (!workoutsByDate[dateStr]) {
          workoutsByDate[dateStr] = [];
        }

        workoutsByDate[dateStr].push({
          ...workout,
          calories: workout.calories_burned || workout.calories || 0,
          duration: workout.duration || workout.duration_minutes || 0,
        });
      });

      console.log(
        "📊 Workouts grouped by date:",
        Object.keys(workoutsByDate).length,
        "days"
      );
      console.log("📊 Date groups:", Object.keys(workoutsByDate).sort());

      // Generate exactly 14 days of data
      const last14Days = [];
      const today = new Date();

      // Generate 14 days going backwards from today
      for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Create date string in YYYY-MM-DD format
        const dateStr = date.toISOString().split("T")[0];

        // Get workouts for this date (if any)
        const dayWorkouts = workoutsByDate[dateStr] || [];

        const totalCalories = dayWorkouts.reduce(
          (sum, w) => sum + w.calories,
          0
        );
        const totalDuration = dayWorkouts.reduce(
          (sum, w) => sum + w.duration,
          0
        );

        last14Days.push({
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          calories: totalCalories,
          duration: totalDuration,
          workouts: dayWorkouts.length,
          fullDate: dateStr,
          workoutNames:
            dayWorkouts.map((w) => w.name).join(", ") || "No workouts",
        });
      }

      console.log("📊 Generated 14-day trend data:", last14Days.length, "days");
      console.log(
        "📊 Non-zero days:",
        last14Days.filter((d) => d.workouts > 0).length
      );
      console.log("📊 Sample trend data (last 3 days):", last14Days.slice(-3));

      setTrendData(last14Days);

      // Process workout type distribution (using all 14-day data)
      const typeCount = {};
      workoutsToProcess.forEach((workout) => {
        const type = workout.type || workout.workout_type || "Other";
        typeCount[type] = (typeCount[type] || 0) + 1;
      });

      const typeData = Object.entries(typeCount).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count,
        percentage: Math.round((count / workoutsToProcess.length) * 100),
      }));

      setWorkoutTypeData(typeData);
    } else {
      console.log("📊 No workout data available for charts");
      // Still generate 14 days of empty data for consistent chart display
      const last14Days = [];
      const today = new Date();

      for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        last14Days.push({
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          calories: 0,
          duration: 0,
          workouts: 0,
          fullDate: date.toISOString().split("T")[0],
          workoutNames: "No workouts",
        });
      }

      setTrendData(last14Days);
      setWorkoutTypeData([]);
    }
  }, [localData]);

  const cardStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  const statCardStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  const COLORS = [
    "#4299e1",
    "#ed8936",
    "#9f7aea",
    "#48bb78",
    "#e53e3e",
    "#38b2ac",
  ];

  if (isLoading || refreshing) {
    return (
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
          {refreshing ? "Updating dashboard..." : "Loading dashboard..."}
        </div>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (
    !localData ||
    (!localData.weekly_stats &&
      !localData.recent_workouts &&
      !localData.all_workouts_14_days)
  ) {
    return (
      <div style={{ ...cardStyle, textAlign: "center", padding: "3rem" }}>
        <div
          style={{ fontSize: "48px", marginBottom: "1rem", color: "#9ca3af" }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <h3 style={{ color: "#4a5568", margin: "0 0 1rem 0" }}>
          Welcome to Your Fitness Journey!
        </h3>
        <p style={{ color: "#718096", margin: "0 0 1.5rem 0" }}>
          Complete your first workout to see your progress and insights here.
        </p>
      </div>
    );
  }

  // Use consistent data source for all calculations
  const weeklyWorkouts = localData.weekly_stats?.workouts || 0;
  const weeklyDuration = localData.weekly_stats?.total_duration || 0;
  const weeklyCalories = localData.weekly_stats?.total_calories || 0;
  const currentStreak = localData.streak?.current_streak || 0;
  const bestStreak = localData.streak?.longest_streak || 0;

  // Show the actual number of days with workouts in the past 14 days
  const daysWithWorkouts = trendData.filter((d) => d.workouts > 0).length;

  // Calculate averages
  const avgDuration =
    weeklyWorkouts > 0 ? Math.round(weeklyDuration / weeklyWorkouts) : 0;
  const dailyAvgDuration = Math.round(weeklyDuration / 7);
  const dailyAvgCalories = Math.round(weeklyCalories / 7);

  // Get streak color based on value
  const getStreakColor = (streak) => {
    if (streak >= 30) return "#059669";
    if (streak >= 14) return "#10b981";
    if (streak >= 7) return "#34d399";
    if (streak >= 3) return "#f59e0b";
    return "#3b82f6";
  };

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
        <h2
          style={{
            margin: "0",
            color: "#1f2937",
            fontSize: "24px",
            fontWeight: "600",
          }}
        >
          Fitness Overview
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {refreshing && (
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid #e2e8f0",
                borderTop: "2px solid #48bb78",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          )}
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            {daysWithWorkouts > 0
              ? `${daysWithWorkouts} active days in past 2 weeks`
              : "Start your fitness journey today!"}
          </div>
          {process.env.NODE_ENV === "development" && (
            <div style={{ fontSize: "12px", color: "#9ca3af" }}>
              Total workouts:{" "}
              {localData.all_workouts_14_days?.length ||
                localData.recent_workouts?.length ||
                0}
            </div>
          )}
        </div>
      </div>

      {/* Main Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* This Week's Workouts */}
        <div
          style={{
            ...statCardStyle,
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            color: "white",
            border: "none",
          }}
        >
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
            }}
          >
            {weeklyWorkouts}
          </div>
          <div
            style={{ fontSize: "14px", opacity: 0.9, marginBottom: "0.5rem" }}
          >
            Workouts This Week
          </div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            Target: 3-5 per week
          </div>
        </div>

        {/* Weekly Duration */}
        <div style={statCardStyle}>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              color: "#059669",
              marginBottom: "0.5rem",
            }}
          >
            {weeklyDuration}
          </div>
          <div
            style={{
              color: "#6b7280",
              fontSize: "14px",
              marginBottom: "0.5rem",
            }}
          >
            Minutes This Week
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            {dailyAvgDuration} min daily average
          </div>
        </div>

        {/* Weekly Calories */}
        <div style={statCardStyle}>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              color: "#dc2626",
              marginBottom: "0.5rem",
            }}
          >
            {weeklyCalories}
          </div>
          <div
            style={{
              color: "#6b7280",
              fontSize: "14px",
              marginBottom: "0.5rem",
            }}
          >
            Calories Burned This Week
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            {dailyAvgCalories} cal daily average
          </div>
        </div>

        {/* Active Days (NEW) */}
        <div style={statCardStyle}>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              color: getStreakColor(daysWithWorkouts),
              marginBottom: "0.5rem",
            }}
          >
            {daysWithWorkouts}
          </div>
          <div
            style={{
              color: "#6b7280",
              fontSize: "14px",
              marginBottom: "0.5rem",
            }}
          >
            Active Days (14-day)
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            {Math.round((daysWithWorkouts / 14) * 100)}% consistency
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Workout Trends Chart - ENHANCED */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              style={{
                margin: "0",
                color: "#1f2937",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              14-Day Workout Trends
            </h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setSelectedTrendMetric("calories")}
                style={{
                  padding: "8px 12px",
                  backgroundColor:
                    selectedTrendMetric === "calories" ? "#dc2626" : "#f3f4f6",
                  color:
                    selectedTrendMetric === "calories" ? "white" : "#6b7280",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
              >
                Calories
              </button>
              <button
                onClick={() => setSelectedTrendMetric("duration")}
                style={{
                  padding: "8px 12px",
                  backgroundColor:
                    selectedTrendMetric === "duration" ? "#059669" : "#f3f4f6",
                  color:
                    selectedTrendMetric === "duration" ? "white" : "#6b7280",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
              >
                Duration
              </button>
              <button
                onClick={() => setSelectedTrendMetric("workouts")}
                style={{
                  padding: "8px 12px",
                  backgroundColor:
                    selectedTrendMetric === "workouts" ? "#3b82f6" : "#f3f4f6",
                  color:
                    selectedTrendMetric === "workouts" ? "white" : "#6b7280",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
              >
                Workouts
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={trendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value, name) => {
                  if (selectedTrendMetric === "calories")
                    return [value, "Calories"];
                  if (selectedTrendMetric === "duration")
                    return [value, "Minutes"];
                  return [value, "Workouts"];
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${label} • ${data.workoutNames || "No workouts"}`;
                  }
                  return `Date: ${label}`;
                }}
              />
              <Area
                type="monotone"
                dataKey={selectedTrendMetric}
                stroke={
                  selectedTrendMetric === "calories"
                    ? "#dc2626"
                    : selectedTrendMetric === "duration"
                    ? "#059669"
                    : "#3b82f6"
                }
                fill={
                  selectedTrendMetric === "calories"
                    ? "#fecaca"
                    : selectedTrendMetric === "duration"
                    ? "#a7f3d0"
                    : "#bfdbfe"
                }
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Enhanced debug info */}
          <div
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              marginTop: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Showing {trendData.length} days of data</span>
            <span>
              Active days:{" "}
              {trendData.filter((d) => d[selectedTrendMetric] > 0).length}
            </span>
            <span>
              Total {selectedTrendMetric}:{" "}
              {trendData.reduce((sum, d) => sum + d[selectedTrendMetric], 0)}
            </span>
          </div>
        </div>

        {/* Workout Type Distribution */}
        <div style={cardStyle}>
          <h3
            style={{
              margin: "0 0 1.5rem 0",
              color: "#1f2937",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            Workout Types
          </h3>
          {workoutTypeData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={workoutTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {workoutTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, "workouts"]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: "1rem" }}>
                {workoutTypeData.map((type, index) => (
                  <div
                    key={type.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                      fontSize: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          backgroundColor: COLORS[index % COLORS.length],
                          borderRadius: "2px",
                        }}
                      />
                      <span style={{ color: "#374151" }}>{type.name}</span>
                    </div>
                    <span style={{ color: "#6b7280", fontWeight: "500" }}>
                      {type.value} ({type.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              No workout data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {(localData.recent_workouts || localData.all_workouts_14_days) &&
        (localData.recent_workouts?.length > 0 ||
          localData.all_workouts_14_days?.length > 0) && (
          <div style={cardStyle}>
            <h3
              style={{
                margin: "0 0 1.5rem 0",
                color: "#1f2937",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Recent Activity
            </h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {(
                localData.recent_workouts ||
                localData.all_workouts_14_days ||
                []
              )
                .slice(0, 5)
                .map((workout, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem",
                      backgroundColor: index === 0 ? "#f0f9ff" : "#f9fafb",
                      borderRadius: "8px",
                      border:
                        index === 0 ? "1px solid #3b82f6" : "1px solid #e5e7eb",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "8px",
                          backgroundColor: index === 0 ? "#3b82f6" : "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        {workout.type
                          ? workout.type.charAt(0).toUpperCase()
                          : "W"}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: "600",
                            color: "#1f2937",
                            fontSize: "14px",
                          }}
                        >
                          {workout.name || workout.workout_name}
                          {index === 0 && (
                            <span
                              style={{
                                color: "#3b82f6",
                                marginLeft: "0.5rem",
                                fontSize: "12px",
                              }}
                            >
                              • Latest
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          {(() => {
                            let displayDate;
                            if (workout.date) {
                              displayDate = new Date(workout.date);
                            } else if (workout.date_completed) {
                              displayDate = new Date(workout.date_completed);
                            } else {
                              displayDate = new Date();
                            }
                            return displayDate.toLocaleDateString();
                          })()}{" "}
                          • {workout.type || workout.workout_type || "Workout"}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#059669",
                        }}
                      >
                        {workout.duration || workout.duration_minutes} min
                      </div>
                      <div style={{ fontSize: "12px", color: "#dc2626" }}>
                        {workout.calories_burned || workout.calories} cal
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            {(localData.recent_workouts?.length > 5 ||
              localData.all_workouts_14_days?.length > 5) && (
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f3f4f6",
                    color: "#3b82f6",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  View All in History Tab
                </button>
              </div>
            )}
          </div>
        )}

      {/* Summary Stats - Enhanced with 14-day data */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <div
          style={{
            ...cardStyle,
            backgroundColor: "#fef3c7",
            borderColor: "#f59e0b",
          }}
        >
          <div
            style={{ fontSize: "1.8rem", fontWeight: "700", color: "#d97706" }}
          >
            {weeklyWorkouts}
          </div>
          <div
            style={{ color: "#92400e", fontSize: "14px", fontWeight: "500" }}
          >
            Workouts This Week
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            backgroundColor: "#d1fae5",
            borderColor: "#10b981",
          }}
        >
          <div
            style={{ fontSize: "1.8rem", fontWeight: "700", color: "#047857" }}
          >
            {weeklyDuration}
          </div>
          <div
            style={{ color: "#065f46", fontSize: "14px", fontWeight: "500" }}
          >
            Minutes This Week
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            backgroundColor: "#fecaca",
            borderColor: "#ef4444",
          }}
        >
          <div
            style={{ fontSize: "1.8rem", fontWeight: "700", color: "#dc2626" }}
          >
            {weeklyCalories}
          </div>
          <div
            style={{ color: "#991b1b", fontSize: "14px", fontWeight: "500" }}
          >
            Calories This Week
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            backgroundColor: "#e0e7ff",
            borderColor: "#6366f1",
          }}
        >
          <div
            style={{ fontSize: "1.8rem", fontWeight: "700", color: "#4f46e5" }}
          >
            {localData.all_workouts_14_days?.length ||
              localData.recent_workouts?.length ||
              0}
          </div>
          <div
            style={{ color: "#3730a3", fontSize: "14px", fontWeight: "500" }}
          >
            Total Workouts (14d)
          </div>
        </div>
      </div>
    </div>
  );
}

export default FitnessDashboard;
