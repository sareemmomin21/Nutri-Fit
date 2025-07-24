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
  const [fitnessStats, setFitnessStats] = useState({
    weeklyWorkouts: 0,
    weeklyDuration: 0,
    weeklyCaloriesBurned: 0,
    avgWorkoutDuration: 0,
  });
  const [combinedInsights, setCombinedInsights] = useState({
    netCalories: 0,
    calorieBalance: "balanced",
    workoutConsistency: 0,
    recommendations: [],
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
        "https://nutri-fit-2iom.onrender.com/api/get_dashboard_data",
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

      // Set fitness stats
      if (data.fitness_data) {
        setFitnessStats({
          weeklyWorkouts: data.fitness_data.weekly_stats?.workouts || 0,
          weeklyDuration: data.fitness_data.weekly_stats?.total_duration || 0,
          weeklyCaloriesBurned:
            data.fitness_data.weekly_stats?.total_calories || 0,
          avgWorkoutDuration: data.fitness_data.weekly_stats?.avg_duration || 0,
        });
      }

      // Calculate weekly stats
      if (data.daily_history) {
        calculateWeeklyStats(data.daily_history, data.profile);
      }

      // Calculate combined insights
      if (data.today_summary && data.fitness_data) {
        calculateCombinedInsights(
          data.today_summary,
          data.fitness_data,
          data.profile
        );
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

  const calculateCombinedInsights = (nutritionData, fitnessData, profile) => {
    const caloriesConsumed = nutritionData.total_eaten || 0;
    const caloriesBurned = fitnessData.weekly_stats?.total_calories || 0;
    const weeklyWorkouts = fitnessData.weekly_stats?.workouts || 0;
    const calorieGoal = profile?.calorie_goal || 2000;

    // Calculate net calories (weekly average)
    const netCalories = caloriesConsumed - caloriesBurned / 7; // Daily average burned

    // Determine calorie balance
    let calorieBalance = "balanced";
    if (netCalories > calorieGoal * 1.1) {
      calorieBalance = "surplus";
    } else if (netCalories < calorieGoal * 0.9) {
      calorieBalance = "deficit";
    }

    // Calculate workout consistency (workouts per week)
    const workoutConsistency = Math.min((weeklyWorkouts / 3) * 100, 100); // Target: 3 workouts/week

    // Generate recommendations
    const recommendations = [];

    if (weeklyWorkouts === 0) {
      recommendations.push(
        "Start with 1-2 workouts this week to boost your metabolism!"
      );
    } else if (weeklyWorkouts < 3) {
      recommendations.push(
        "Great start! Try to add one more workout to reach your weekly goal."
      );
    } else if (weeklyWorkouts >= 5) {
      recommendations.push(
        "Excellent workout consistency! Consider active recovery days."
      );
    }

    if (calorieBalance === "surplus" && weeklyWorkouts < 3) {
      recommendations.push(
        "You're consuming more calories than burning. Consider adding more cardio."
      );
    } else if (calorieBalance === "deficit" && weeklyWorkouts >= 4) {
      recommendations.push(
        "Great job staying active! You may need to eat more to fuel your workouts."
      );
    }

    if (caloriesBurned > 0) {
      const extraCaloriesEarned = Math.round(caloriesBurned / 7);
      recommendations.push(
        `Your workouts earned you ~${extraCaloriesEarned} extra calories per day!`
      );
    }

    setCombinedInsights({
      netCalories: Math.round(netCalories),
      calorieBalance,
      workoutConsistency: Math.round(workoutConsistency),
      recommendations,
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
    const { weeklyWorkouts } = fitnessStats;

    if (progress >= 90 && weeklyWorkouts >= 3) {
      return "Outstanding! You're crushing both nutrition and fitness goals!";
    } else if (progress >= 70 && weeklyWorkouts >= 2) {
      return "Great balance of nutrition and exercise! Keep up the momentum!";
    } else if (currentStreak > 0) {
      return `You have a ${currentStreak}-day nutrition streak going! Don't break it now!`;
    } else if (weeklyWorkouts >= 3) {
      return "Awesome workout consistency! Now let's dial in your nutrition.";
    } else {
      return "Every meal and workout is a new opportunity to improve your health!";
    }
  };

  const getBalanceColor = (balance) => {
    switch (balance) {
      case "surplus":
        return "#ed8936";
      case "deficit":
        return "#4299e1";
      default:
        return "#48bb78";
    }
  };

  const getBalanceText = (balance) => {
    switch (balance) {
      case "surplus":
        return "Calorie Surplus";
      case "deficit":
        return "Calorie Deficit";
      default:
        return "Balanced";
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
              Day {dashboardData.current_day} of your health journey
            </span>
          </div>
        )}
      </div>

      {/* Combined Stats Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {/* Nutrition Streak */}
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
            Day Nutrition Streak
          </div>
        </div>

        {/* Weekly Workouts */}
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
            {fitnessStats.weeklyWorkouts}
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Workouts This Week
          </div>
        </div>

        {/* Calorie Balance */}
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
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: getBalanceColor(combinedInsights.calorieBalance),
            }}
          >
            {combinedInsights.netCalories}
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Net Calories Today
          </div>
          <div
            style={{
              fontSize: "12px",
              color: getBalanceColor(combinedInsights.calorieBalance),
              marginTop: "4px",
              fontWeight: "bold",
            }}
          >
            {getBalanceText(combinedInsights.calorieBalance)}
          </div>
        </div>

        {/* Weekly Calories Burned */}
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
            {fitnessStats.weeklyCaloriesBurned}
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Calories Burned (Week)
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
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#9f7aea" }}
          >
            {Math.round(
              (weeklyStats.consistencyScore +
                combinedInsights.workoutConsistency) /
                2
            )}
            %
          </div>
          <div style={{ color: "#718096", fontSize: "14px" }}>
            Overall Consistency
          </div>
        </div>
      </div>

      {/* Combined Insights Section */}
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
          Smart Insights
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {combinedInsights.recommendations.map((rec, index) => (
            <div
              key={index}
              style={{
                padding: "1rem",
                backgroundColor: "#f7fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "14px", color: "#4a5568" }}> {rec}</div>
            </div>
          ))}
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
          Today's Nutrition Progress
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

              {/* Goal line - FIXED to use actual user calorie goal */}
              <line
                x1="40"
                y1="72"
                x2="380"
                y2="72"
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
                        const chartMax = todayProgress.calorieGoal * 1.2;
                        const y = 168 - (day.calories / chartMax) * 128;

                        return `${x},${Math.max(40, Math.min(168, y))}`;
                      })
                      .join(" ")}
                  />
                )}

              {/* Data points */}
              {dashboardData?.daily_history &&
                dashboardData.daily_history.slice(-14).map((day, index) => {
                  const x = 40 + (index * 340) / 13;
                  const chartMax = todayProgress.calorieGoal * 1.2;
                  const y = 168 - (day.calories / chartMax) * 128;

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

              {/* Y-axis labels - FIXED to show actual user goals */}
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

        {/* Fitness vs Nutrition Chart */}
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 1.5rem 0", color: "#2d3748" }}>
            Weekly Balance Overview
          </h3>

          <div style={{ display: "grid", gap: "1rem" }}>
            {/* Nutrition Bar */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  Nutrition Consistency
                </span>
                <span style={{ fontSize: "14px", color: "#718096" }}>
                  {weeklyStats.consistencyScore}%
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
                    width: `${weeklyStats.consistencyScore}%`,
                    height: "100%",
                    backgroundColor: "#48bb78",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Fitness Bar */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                  Workout Consistency
                </span>
                <span style={{ fontSize: "14px", color: "#718096" }}>
                  {combinedInsights.workoutConsistency}%
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
                    width: `${combinedInsights.workoutConsistency}%`,
                    height: "100%",
                    backgroundColor: "#4299e1",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Combined Stats */}
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#f7fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  fontSize: "14px",
                }}
              >
                <div>
                  <strong>Weekly Averages:</strong>
                  <br />
                  {weeklyStats.avgCalories} calories
                  <br />
                  {weeklyStats.avgProtein}g protein
                </div>
                <div>
                  <strong>Fitness Summary:</strong>
                  <br />
                  {fitnessStats.weeklyWorkouts} workouts
                  <br />
                  {fitnessStats.weeklyCaloriesBurned} cal burned
                </div>
              </div>
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
          View Workouts
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
