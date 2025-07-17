import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [todayProgress, setTodayProgress] = useState({
    calories: 0,
    calorieGoal: 2000,
    protein: 0,
    proteinGoal: 150,
    carbs: 0,
    carbsGoal: 250,
    fat: 0,
    fatGoal: 70,
  });
  const [weeklyStats, setWeeklyStats] = useState({
    avgCalories: 0,
    avgProtein: 0,
    consistencyScore: 0,
    bestDay: null,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("nutrifit_user_id");

  useEffect(() => {
    if (!userId) {
      navigate("/auth");
      return;
    }
    fetchDashboardData();
  }, [userId, navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Single optimized API call to get all dashboard data
      const response = await fetch(
        "http://localhost:5000/api/get_dashboard_data",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);

      // Set today's progress
      if (data.profile) {
        setTodayProgress({
          calories: data.today_summary.total_eaten,
          calorieGoal: data.profile.calorie_goal || 2000,
          protein: data.today_summary.nutrients.protein,
          proteinGoal: data.profile.protein_goal || 150,
          carbs: data.today_summary.nutrients.carbohydrates,
          carbsGoal: data.profile.carbs_goal || 250,
          fat: data.today_summary.nutrients.fat,
          fatGoal: data.profile.fat_goal || 70,
        });
      }

      // Calculate weekly stats
      if (data.daily_history) {
        calculateWeeklyStats(data.daily_history, data.profile);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWeeklyStats = (history, profile) => {
    if (!history || history.length === 0) return;

    const calorieGoal = profile?.calorie_goal || 2000;
    const last7Days = history.filter((day) => day.days_ago <= 7);

    // Calculate averages
    const avgCalories =
      last7Days.length > 0
        ? last7Days.reduce((sum, day) => sum + day.calories, 0) /
          last7Days.length
        : 0;

    const avgProtein =
      last7Days.length > 0
        ? last7Days.reduce((sum, day) => sum + day.protein, 0) /
          last7Days.length
        : 0;

    // Calculate consistency (days with >80% of calorie goal)
    const consistentDays = last7Days.filter(
      (day) => day.calories >= calorieGoal * 0.8
    ).length;
    const consistencyScore =
      last7Days.length > 0 ? (consistentDays / last7Days.length) * 100 : 0;

    // Find best day (highest protein/calorie ratio)
    const bestDay = last7Days.reduce((best, day) => {
      const ratio = day.calories > 0 ? day.protein / day.calories : 0;
      const bestRatio =
        best && best.calories > 0 ? best.protein / best.calories : 0;
      return ratio > bestRatio ? day : best;
    }, null);

    // Calculate streaks
    const streakInfo = calculateStreaks(history, calorieGoal);

    setWeeklyStats({
      avgCalories: Math.round(avgCalories),
      avgProtein: Math.round(avgProtein),
      consistencyScore: Math.round(consistencyScore),
      bestDay,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
    });
  };

  const calculateStreaks = (history, calorieGoal) => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort by days_ago (ascending - oldest first)
    const sortedHistory = [...history].sort((a, b) => b.days_ago - a.days_ago);

    for (const day of sortedHistory) {
      if (day.calories >= calorieGoal * 0.8) {
        tempStreak++;
        // Current streak only counts if it includes today (days_ago = 0)
        if (day.days_ago === 0 || (currentStreak === 0 && day.days_ago <= 1)) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        if (day.days_ago === 0) {
          currentStreak = 0;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  };

  const calculateProgress = (current, goal) => {
    return goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "#48bb78";
    if (percentage >= 70) return "#ed8936";
    return "#4299e1";
  };

  const formatDaysAgo = (daysAgo) => {
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    return `${daysAgo} days ago`;
  };

  const getMotivationalMessage = () => {
    const progress = calculateProgress(
      todayProgress.calories,
      todayProgress.calorieGoal
    );
    const { currentStreak } = weeklyStats;

    if (progress >= 90) {
      return "Great job! You're hitting your goals consistently!";
    } else if (progress >= 70) {
      return "You're doing well! Keep up the momentum!";
    } else if (currentStreak > 0) {
      return `You have a ${currentStreak}-day streak going! Don't break it now!`;
    } else {
      return "Every meal is a new opportunity to fuel your body right!";
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
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
          <div style={{ color: "#718096", fontSize: "16px" }}>
            Loading your dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", color: "#e53e3e" }}>
          <h3>Error loading dashboard</h3>
          <p>{error}</p>
          <button
            onClick={fetchDashboardData}
            style={{
              padding: "8px 16px",
              backgroundColor: "#48bb78",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1400px",
        margin: "0 auto",
        backgroundColor: "#f7fafc",
        minHeight: "100vh",
      }}
    >
      {/* Welcome Section */}
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
          Welcome back
          {dashboardData?.profile?.first_name
            ? `, ${dashboardData.profile.first_name}`
            : ""}
          !
        </h1>
        <p style={{ margin: "0", color: "#718096", fontSize: "18px" }}>
          {getMotivationalMessage()}
        </p>
        {dashboardData?.current_day && (
          <div
            style={{
              marginTop: "0.5rem",
              padding: "8px 12px",
              backgroundColor: "#e6fffa",
              borderRadius: "6px",
              border: "1px solid #81e6d9",
              display: "inline-block",
            }}
          >
            <span
              style={{ color: "#234e52", fontSize: "14px", fontWeight: "bold" }}
            >
              Day {dashboardData.current_day} of your nutrition journey
            </span>
          </div>
        )}
      </div>

      {/* Stats Overview Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {/* Current Streak */}
        <div
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#48bb78" }}
          >
            {weeklyStats.currentStreak}
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Day Current Streak
          </div>
          <div style={{ color: "#a0aec0", fontSize: "12px", marginTop: "4px" }}>
            Best: {weeklyStats.longestStreak} days
          </div>
        </div>

        {/* Weekly Average Calories */}
        <div
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#4299e1" }}
          >
            {weeklyStats.avgCalories}
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Weekly Avg Calories
          </div>
          <div style={{ color: "#a0aec0", fontSize: "12px", marginTop: "4px" }}>
            Goal: {todayProgress.calorieGoal}
          </div>
        </div>

        {/* Consistency Score */}
        <div
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#ed8936" }}
          >
            {weeklyStats.consistencyScore}%
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Consistency Score
          </div>
          <div style={{ color: "#a0aec0", fontSize: "12px", marginTop: "4px" }}>
            Last 7 days
          </div>
        </div>

        {/* Weekly Protein Average */}
        <div
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#9f7aea" }}
          >
            {weeklyStats.avgProtein}g
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Weekly Avg Protein
          </div>
          <div style={{ color: "#a0aec0", fontSize: "12px", marginTop: "4px" }}>
            Goal: {todayProgress.proteinGoal}g
          </div>
        </div>
      </div>

      {/* Today's Progress */}
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ margin: "0 0 1.5rem 0", color: "#2d3748" }}>
          Today's Progress
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Calories Progress */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontWeight: "bold", color: "#2d3748" }}>
                Calories
              </span>
              <span style={{ fontSize: "14px", color: "#718096" }}>
                {Math.round(todayProgress.calories)} /{" "}
                {todayProgress.calorieGoal}
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
                  width: `${calculateProgress(
                    todayProgress.calories,
                    todayProgress.calorieGoal
                  )}%`,
                  height: "100%",
                  backgroundColor: getProgressColor(
                    calculateProgress(
                      todayProgress.calories,
                      todayProgress.calorieGoal
                    )
                  ),
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Protein Progress */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontWeight: "bold", color: "#2d3748" }}>
                Protein
              </span>
              <span style={{ fontSize: "14px", color: "#718096" }}>
                {Math.round(todayProgress.protein)}g /{" "}
                {todayProgress.proteinGoal}g
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
                  width: `${calculateProgress(
                    todayProgress.protein,
                    todayProgress.proteinGoal
                  )}%`,
                  height: "100%",
                  backgroundColor: "#3182ce",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Carbs Progress */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontWeight: "bold", color: "#2d3748" }}>
                Carbohydrates
              </span>
              <span style={{ fontSize: "14px", color: "#718096" }}>
                {Math.round(todayProgress.carbs)}g / {todayProgress.carbsGoal}g
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
                  width: `${calculateProgress(
                    todayProgress.carbs,
                    todayProgress.carbsGoal
                  )}%`,
                  height: "100%",
                  backgroundColor: "#38a169",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Fat Progress */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontWeight: "bold", color: "#2d3748" }}>Fat</span>
              <span style={{ fontSize: "14px", color: "#718096" }}>
                {Math.round(todayProgress.fat)}g / {todayProgress.fatGoal}g
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
                  width: `${calculateProgress(
                    todayProgress.fat,
                    todayProgress.fatGoal
                  )}%`,
                  height: "100%",
                  backgroundColor: "#d69e2e",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {/* Calorie Trend Chart */}
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 1.5rem 0", color: "#2d3748" }}>
            14-Day Calorie Trend
          </h3>
          <div style={{ position: "relative", height: "200px" }}>
            <svg width="100%" height="100%" viewBox="0 0 400 200">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="40"
                  y1={40 + i * 32}
                  x2="380"
                  y2={40 + i * 32}
                  stroke="#f7fafc"
                  strokeWidth="1"
                />
              ))}

              {/* Goal line */}
              <line
                x1="40"
                y1="100"
                x2="380"
                y2="100"
                stroke="#48bb78"
                strokeWidth="2"
                strokeDasharray="5,5"
              />

              {/* Data line */}
              {dashboardData?.daily_history &&
                dashboardData.daily_history.length > 0 && (
                  <polyline
                    fill="none"
                    stroke="#4299e1"
                    strokeWidth="3"
                    points={dashboardData.daily_history
                      .slice(-14)
                      .map((day, index) => {
                        const x = 40 + (index * 340) / 13;
                        const y =
                          168 -
                          (day.calories / todayProgress.calorieGoal) * 128;
                        return `${x},${Math.max(40, Math.min(168, y))}`;
                      })
                      .join(" ")}
                  />
                )}

              {/* Data points */}
              {dashboardData?.daily_history &&
                dashboardData.daily_history.slice(-14).map((day, index) => {
                  const x = 40 + (index * 340) / 13;
                  const y =
                    168 - (day.calories / todayProgress.calorieGoal) * 128;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={Math.max(40, Math.min(168, y))}
                      r="4"
                      fill="#4299e1"
                    />
                  );
                })}

              {/* Y-axis labels */}
              <text x="35" y="45" textAnchor="end" fontSize="12" fill="#718096">
                {Math.round(todayProgress.calorieGoal * 1.2)}
              </text>
              <text x="35" y="77" textAnchor="end" fontSize="12" fill="#718096">
                {Math.round(todayProgress.calorieGoal * 1.0)}
              </text>
              <text
                x="35"
                y="109"
                textAnchor="end"
                fontSize="12"
                fill="#718096"
              >
                {Math.round(todayProgress.calorieGoal * 0.8)}
              </text>
              <text
                x="35"
                y="141"
                textAnchor="end"
                fontSize="12"
                fill="#718096"
              >
                {Math.round(todayProgress.calorieGoal * 0.6)}
              </text>
              <text
                x="35"
                y="173"
                textAnchor="end"
                fontSize="12"
                fill="#718096"
              >
                0
              </text>
            </svg>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#718096",
              textAlign: "center",
              marginTop: "0.5rem",
            }}
          >
            Green line shows your daily calorie goal
          </div>
        </div>

        {/* Macro Distribution */}
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 1.5rem 0", color: "#2d3748" }}>
            Today's Macro Distribution
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            {todayProgress.calories > 0 ? (
              <div
                style={{
                  position: "relative",
                  width: "150px",
                  height: "150px",
                }}
              >
                <svg width="150" height="150" viewBox="0 0 150 150">
                  {(() => {
                    const total =
                      todayProgress.protein * 4 +
                      todayProgress.carbs * 4 +
                      todayProgress.fat * 9;
                    if (total === 0) return null;

                    const proteinAngle =
                      ((todayProgress.protein * 4) / total) * 360;
                    const carbAngle = ((todayProgress.carbs * 4) / total) * 360;
                    const fatAngle = ((todayProgress.fat * 9) / total) * 360;

                    let currentAngle = 0;
                    const radius = 60;
                    const centerX = 75;
                    const centerY = 75;

                    const createPath = (startAngle, endAngle, color) => {
                      const start = (startAngle * Math.PI) / 180;
                      const end = (endAngle * Math.PI) / 180;
                      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

                      const x1 = centerX + radius * Math.cos(start);
                      const y1 = centerY + radius * Math.sin(start);
                      const x2 = centerX + radius * Math.cos(end);
                      const y2 = centerY + radius * Math.sin(end);

                      return (
                        <path
                          key={startAngle}
                          d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={color}
                        />
                      );
                    };

                    const paths = [];
                    if (proteinAngle > 0) {
                      paths.push(
                        createPath(
                          currentAngle,
                          currentAngle + proteinAngle,
                          "#3182ce"
                        )
                      );
                      currentAngle += proteinAngle;
                    }
                    if (carbAngle > 0) {
                      paths.push(
                        createPath(
                          currentAngle,
                          currentAngle + carbAngle,
                          "#38a169"
                        )
                      );
                      currentAngle += carbAngle;
                    }
                    if (fatAngle > 0) {
                      paths.push(
                        createPath(
                          currentAngle,
                          currentAngle + fatAngle,
                          "#d69e2e"
                        )
                      );
                    }

                    return paths;
                  })()}
                </svg>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#2d3748",
                    }}
                  >
                    {Math.round(todayProgress.calories)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#718096" }}>
                    calories
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#718096" }}>
                No data to display yet.
                <br />
                Start tracking your meals!
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#3182ce",
                  borderRadius: "2px",
                }}
              ></div>
              <span style={{ fontSize: "12px", color: "#718096" }}>
                Protein ({Math.round(todayProgress.protein)}g)
              </span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#38a169",
                  borderRadius: "2px",
                }}
              ></div>
              <span style={{ fontSize: "12px", color: "#718096" }}>
                Carbs ({Math.round(todayProgress.carbs)}g)
              </span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#d69e2e",
                  borderRadius: "2px",
                }}
              ></div>
              <span style={{ fontSize: "12px", color: "#718096" }}>
                Fat ({Math.round(todayProgress.fat)}g)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent History */}
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ margin: "0 0 1.5rem 0", color: "#2d3748" }}>
          Recent History
        </h2>

        {!dashboardData?.daily_history ||
        dashboardData.daily_history.length === 0 ? (
          <p style={{ color: "#718096" }}>
            No history available yet. Start tracking your meals!
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      color: "#4a5568",
                    }}
                  >
                    Day
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      color: "#4a5568",
                    }}
                  >
                    Calories
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      color: "#4a5568",
                    }}
                  >
                    Protein
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      color: "#4a5568",
                    }}
                  >
                    Carbs
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      color: "#4a5568",
                    }}
                  >
                    Fat
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      color: "#4a5568",
                    }}
                  >
                    Goal %
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.daily_history.slice(0, 7).map((day, index) => {
                  const goalPercentage = Math.round(
                    (day.calories / todayProgress.calorieGoal) * 100
                  );
                  return (
                    <tr
                      key={day.day_number}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        backgroundColor: index % 2 === 0 ? "#f7fafc" : "white",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px",
                          fontWeight: day.days_ago === 0 ? "bold" : "normal",
                        }}
                      >
                        {formatDaysAgo(day.days_ago)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {Math.round(day.calories)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {Math.round(day.protein)}g
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {Math.round(day.carbohydrates)}g
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {Math.round(day.fat)}g
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          color:
                            goalPercentage >= 80
                              ? "#48bb78"
                              : goalPercentage >= 60
                              ? "#ed8936"
                              : "#e53e3e",
                        }}
                      >
                        {goalPercentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Insights Section */}
      {dashboardData?.daily_history &&
        dashboardData.daily_history.length > 3 && (
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "12px",
              marginBottom: "2rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ margin: "0 0 1.5rem 0", color: "#2d3748" }}>
              Insights & Recommendations
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              {/* Consistency Insight */}
              <div
                style={{
                  padding: "1rem",
                  backgroundColor:
                    weeklyStats.consistencyScore >= 70 ? "#f0fff4" : "#fff5f5",
                  borderRadius: "8px",
                  border: `1px solid ${
                    weeklyStats.consistencyScore >= 70 ? "#9ae6b4" : "#fed7d7"
                  }`,
                }}
              >
                <h4 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
                  Consistency
                </h4>
                <p style={{ margin: "0", fontSize: "14px", color: "#4a5568" }}>
                  {weeklyStats.consistencyScore >= 70
                    ? "Great job! You're consistently meeting your nutrition goals."
                    : "Try to be more consistent with your daily nutrition tracking."}
                </p>
              </div>

              {/* Protein Insight */}
              <div
                style={{
                  padding: "1rem",
                  backgroundColor:
                    weeklyStats.avgProtein >= todayProgress.proteinGoal * 0.8
                      ? "#f0fff4"
                      : "#fffbf0",
                  borderRadius: "8px",
                  border: `1px solid ${
                    weeklyStats.avgProtein >= todayProgress.proteinGoal * 0.8
                      ? "#9ae6b4"
                      : "#fbd38d"
                  }`,
                }}
              >
                <h4 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
                  Protein Intake
                </h4>
                <p style={{ margin: "0", fontSize: "14px", color: "#4a5568" }}>
                  {weeklyStats.avgProtein >= todayProgress.proteinGoal * 0.8
                    ? "Your protein intake is on track! Keep it up."
                    : "Consider adding more protein-rich foods to reach your goals."}
                </p>
              </div>

              {/* Best Day Insight */}
              {weeklyStats.bestDay && (
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#f7fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
                    Best Recent Day
                  </h4>
                  <p
                    style={{ margin: "0", fontSize: "14px", color: "#4a5568" }}
                  >
                    {formatDaysAgo(weeklyStats.bestDay.days_ago)} was your best
                    day with {Math.round(weeklyStats.bestDay.calories)} calories
                    and {Math.round(weeklyStats.bestDay.protein)}g protein!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Quick Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        <button
          onClick={() => navigate("/nutrition")}
          style={{
            padding: "1.5rem",
            backgroundColor: "#48bb78",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.2s",
            textAlign: "center",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#38a169")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#48bb78")}
        >
          Track Meals
        </button>

        <button
          onClick={() => navigate("/fitness")}
          style={{
            padding: "1.5rem",
            backgroundColor: "#4299e1",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.2s",
            textAlign: "center",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#3182ce")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#4299e1")}
        >
          View Fitness
        </button>

        <button
          onClick={() => navigate("/settings")}
          style={{
            padding: "1.5rem",
            backgroundColor: "#718096",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.2s",
            textAlign: "center",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#4a5568")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#718096")}
        >
          Settings
        </button>
      </div>
    </div>
  );
}
