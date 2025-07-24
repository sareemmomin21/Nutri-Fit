import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Nutrition from "../components/Nutrition";

export default function NutritionPage() {
  const navigate = useNavigate();
  const [dailySummary, setDailySummary] = useState({
    total_eaten: 0,
    nutrients: {
      protein: 0,
      carbohydrates: 0,
      fat: 0,
    },
  });
  const [mealProgress, setMealProgress] = useState({});
  const [goals, setGoals] = useState({
    calorie_goal: 2000,
    protein: 150,
    carbohydrates: 250,
    fat: 70,
  });
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [currentDayInfo, setCurrentDayInfo] = useState(null);
  const [currentDayData, setCurrentDayData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Get user ID from localStorage
  const userId = localStorage.getItem("nutrifit_user_id");

  useEffect(() => {
    if (!userId) {
      navigate("/auth");
      return;
    }

    fetchUserProfile();
    if (!showHistory) {
      fetchTodayData();
    }
  }, [userId, navigate, showHistory]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch("${process.env.REACT_APP_API_URL}/api/get_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);

        // Update goals from user profile
        setGoals({
          calorie_goal: profile.calorie_goal || 2000,
          protein: profile.protein_goal || 150,
          carbohydrates: profile.carbs_goal || 250,
          fat: profile.fat_goal || 70,
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchTodayData = useCallback(async () => {
    try {
      // Fetch daily summary
      const summaryResponse = await fetch(
        "${process.env.REACT_APP_API_URL}/get_daily_summary",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );
      if (summaryResponse.ok) {
        const data = await summaryResponse.json();
        setDailySummary(data);
      }

      // Fetch meal progress
      const progressResponse = await fetch(
        "${process.env.REACT_APP_API_URL}/get_meal_progress",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );
      if (progressResponse.ok) {
        const data = await progressResponse.json();
        setMealProgress(data);
      }
    } catch (error) {
      console.error("Error fetching today's data:", error);
    }
  }, [userId]);

  const fetchNavigationInfo = useCallback(
    async (targetDay = null) => {
      try {
        const response = await fetch(
          "${process.env.REACT_APP_API_URL}/api/get_navigation_info",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, target_day: targetDay }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCurrentDayInfo(data);
          return data;
        }
      } catch (error) {
        console.error("Error fetching navigation info:", error);
      }
      return null;
    },
    [userId]
  );

  const fetchDayData = useCallback(
    async (targetDay) => {
      try {
        setHistoryLoading(true);
        const response = await fetch("${process.env.REACT_APP_API_URL}/api/get_day_data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, target_day: targetDay }),
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentDayData(data);
        }
      } catch (error) {
        console.error("Error fetching day data:", error);
      } finally {
        setHistoryLoading(false);
      }
    },
    [userId]
  );

  const handleShowHistory = useCallback(async () => {
    setShowHistory(true);
    setHistoryLoading(true);

    // Fetch navigation info for current day
    const navInfo = await fetchNavigationInfo();
    if (navInfo) {
      await fetchDayData(navInfo.current_day);
    }
  }, [fetchNavigationInfo, fetchDayData]);

  const navigateDate = useCallback(
    async (direction) => {
      if (!currentDayInfo) return;

      const targetDay =
        direction === "prev"
          ? currentDayInfo.prev_day
          : currentDayInfo.next_day;

      if (targetDay === null) return;

      const navInfo = await fetchNavigationInfo(targetDay);
      if (navInfo) {
        await fetchDayData(navInfo.current_day);
      }
    },
    [currentDayInfo, fetchNavigationInfo, fetchDayData]
  );

  const refreshData = useCallback(() => {
    if (showHistory && currentDayInfo) {
      fetchDayData(currentDayInfo.current_day);
    } else {
      fetchTodayData();
    }
  }, [showHistory, currentDayInfo, fetchDayData, fetchTodayData]);

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "#4CAF50";
    if (percentage >= 70) return "#FF9800";
    return "#2196F3";
  };

  const ProgressBar = ({ current, goal, label, unit = "g" }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    const color = getProgressColor(percentage);

    return (
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
          }}
        >
          <span>
            <strong>{label}</strong>
          </span>
          <span>
            {current.toFixed(1)}
            {unit} / {goal}
            {unit}
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "20px",
            backgroundColor: "#e0e0e0",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: "100%",
              backgroundColor: color,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "#666",
            textAlign: "right",
            marginTop: "0.2rem",
          }}
        >
          {percentage.toFixed(1)}%
        </div>
      </div>
    );
  };

  const MealProgressCard = ({ mealName, progress }) => {
    if (!progress) return null;

    const percentage = Math.min(progress.progress_percentage, 100);
    const color = getProgressColor(percentage);

    return (
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1rem",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h4
          style={{
            margin: "0 0 0.5rem 0",
            textTransform: "capitalize",
            color: "#333",
          }}
        >
          {mealName}
        </h4>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.9rem",
            marginBottom: "0.5rem",
          }}
        >
          <span>
            Calories: {progress.calories_eaten} / {progress.calories_allocated}
          </span>
          <span
            style={{ color: progress.calories_remaining > 0 ? "green" : "red" }}
          >
            {progress.calories_remaining > 0
              ? `${progress.calories_remaining} left`
              : "Over"}
          </span>
        </div>

        <div
          style={{
            width: "100%",
            height: "15px",
            backgroundColor: "#e0e0e0",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: "100%",
              backgroundColor: color,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0.5rem",
            marginTop: "0.5rem",
            fontSize: "0.8rem",
            color: "#666",
          }}
        >
          <div>P: {progress.protein_eaten.toFixed(1)}g</div>
          <div>C: {progress.carbohydrates_eaten.toFixed(1)}g</div>
          <div>F: {progress.fat_eaten.toFixed(1)}g</div>
        </div>
      </div>
    );
  };

  const HistoryMealCard = ({ mealName, foods }) => {
    if (!foods || foods.length === 0) return null;

    const totalCalories = foods.reduce(
      (sum, food) => sum + (food.calories || 0),
      0
    );
    const totalProtein = foods.reduce(
      (sum, food) => sum + (food.protein || 0),
      0
    );
    const totalCarbs = foods.reduce(
      (sum, food) => sum + (food.carbohydrates || 0),
      0
    );
    const totalFat = foods.reduce((sum, food) => sum + (food.fat || 0), 0);

    return (
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <h4
          style={{
            margin: "0 0 1rem 0",
            textTransform: "capitalize",
            color: "#2d3748",
            borderBottom: "2px solid #e2e8f0",
            paddingBottom: "0.5rem",
            fontSize: "18px",
          }}
        >
          {mealName} ({foods.length} items)
        </h4>

        {foods.map((food, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 0",
              borderBottom:
                index < foods.length - 1 ? "1px solid #f0f0f0" : "none",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "15px",
                  color: "#2d3748",
                  marginBottom: "2px",
                }}
              >
                {food.name}
              </div>
              <div style={{ fontSize: "13px", color: "#718096" }}>
                {food.quantity} {food.serving_size}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              <span
                style={{
                  color: "#e53e3e",
                  backgroundColor: "#fed7d7",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {Math.round(food.calories || 0)}cal
              </span>
              <span
                style={{
                  color: "#3182ce",
                  backgroundColor: "#bee3f8",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {Math.round(food.protein || 0)}p
              </span>
              <span
                style={{
                  color: "#38a169",
                  backgroundColor: "#c6f6d5",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {Math.round(food.carbohydrates || 0)}c
              </span>
              <span
                style={{
                  color: "#d69e2e",
                  backgroundColor: "#faf089",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {Math.round(food.fat || 0)}f
              </span>
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "#f7fafc",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ color: "#2d3748", marginBottom: "0.5rem" }}>
            {mealName} Total:
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "0.5rem",
              fontSize: "13px",
            }}
          >
            <div style={{ color: "#e53e3e" }}>
              {Math.round(totalCalories)} cal
            </div>
            <div style={{ color: "#3182ce" }}>
              {Math.round(totalProtein)}g protein
            </div>
            <div style={{ color: "#38a169" }}>
              {Math.round(totalCarbs)}g carbs
            </div>
            <div style={{ color: "#d69e2e" }}>{Math.round(totalFat)}g fat</div>
          </div>
        </div>
      </div>
    );
  };

  const handleNextDay = async () => {
    if (
      window.confirm(
        "Are you sure you want to start a new day? This will save your current meals to history and reset your progress."
      )
    ) {
      try {
        const response = await fetch("${process.env.REACT_APP_API_URL}/next_day", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data.message); // Log the new day message
          refreshData();
        }
      } catch (error) {
        console.error("Error resetting day:", error);
      }
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
            Loading your nutrition dashboard...
          </div>
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
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Welcome Message */}
      {userProfile && (
        <div
          style={{
            backgroundColor: "#f0fff4",
            border: "1px solid #9ae6b4",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <p
            style={{
              margin: "0",
              color: "#22543d",
              fontSize: "16px",
            }}
          >
            Welcome back, {userProfile.first_name || "there"}!
            {currentDayInfo && (
              <span style={{ marginLeft: "1rem", fontWeight: "bold" }}>
                {currentDayInfo.is_today
                  ? "Ready to track your nutrition today?"
                  : `Viewing ${currentDayInfo.display}`}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px 12px 0 0",
          border: "1px solid #e2e8f0",
          borderBottom: "none",
        }}
      >
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
          <button
            onClick={() => setShowHistory(false)}
            style={{
              padding: "12px 24px",
              border: "none",
              borderBottom: !showHistory
                ? "3px solid #48bb78"
                : "3px solid transparent",
              backgroundColor: "transparent",
              color: !showHistory ? "#48bb78" : "#718096",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: !showHistory ? "bold" : "normal",
              transition: "all 0.2s",
            }}
          >
            Today's Tracking
          </button>
          <button
            onClick={handleShowHistory}
            style={{
              padding: "12px 24px",
              border: "none",
              borderBottom: showHistory
                ? "3px solid #48bb78"
                : "3px solid transparent",
              backgroundColor: "transparent",
              color: showHistory ? "#48bb78" : "#718096",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: showHistory ? "bold" : "normal",
              transition: "all 0.2s",
            }}
          >
            History & Progress
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "0 0 12px 12px",
          border: "1px solid #e2e8f0",
          padding: "2rem",
        }}
      >
        {/* Today's Tracking View */}
        {!showHistory && (
          <>
            {/* Header Section */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "2rem",
                borderRadius: "12px",
                marginBottom: "2rem",
                border: "1px solid #e2e8f0",
              }}
            >
              <h1
                style={{
                  margin: "0 0 1.5rem 0",
                  color: "#2d3748",
                  fontSize: "28px",
                }}
              >
                Daily Nutrition Dashboard
              </h1>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "2rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 1.5rem 0",
                      color: "#2d3748",
                      fontSize: "20px",
                    }}
                  >
                    Daily Progress
                  </h3>
                  <ProgressBar
                    current={dailySummary.total_eaten}
                    goal={goals.calorie_goal}
                    label="Calories"
                    unit=""
                  />
                  <ProgressBar
                    current={dailySummary.nutrients.protein}
                    goal={goals.protein}
                    label="Protein"
                  />
                  <ProgressBar
                    current={dailySummary.nutrients.carbohydrates}
                    goal={goals.carbohydrates}
                    label="Carbs"
                  />
                  <ProgressBar
                    current={dailySummary.nutrients.fat}
                    goal={goals.fat}
                    label="Fat"
                  />
                </div>

                <div
                  style={{
                    backgroundColor: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 1.5rem 0",
                      color: "#2d3748",
                      fontSize: "20px",
                    }}
                  >
                    Meal Progress
                  </h3>
                  {Object.entries(mealProgress).map(([mealName, progress]) => (
                    <MealProgressCard
                      key={mealName}
                      mealName={mealName}
                      progress={progress}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Meal Tracking */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <Nutrition meal="breakfast" onAte={refreshData} userId={userId} />
              <Nutrition meal="lunch" onAte={refreshData} userId={userId} />
              <Nutrition meal="dinner" onAte={refreshData} userId={userId} />
              <Nutrition meal="snacks" onAte={refreshData} userId={userId} />
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                marginTop: "2rem",
              }}
            >
              <button
                onClick={refreshData}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  fontWeight: "bold",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#45a049")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
              >
                Refresh Data
              </button>

              <button
                onClick={handleNextDay}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  fontWeight: "bold",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#0056b3")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
              >
                Save & Start New Day
              </button>
            </div>
          </>
        )}

        {/* History View */}
        {showHistory && (
          <div>
            {/* Navigation Header */}
            {currentDayInfo && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                  padding: "1rem",
                  backgroundColor: "#f7fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <button
                  onClick={() => navigateDate("prev")}
                  disabled={!currentDayInfo.can_go_back}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: currentDayInfo.can_go_back
                      ? "#4299e1"
                      : "#e2e8f0",
                    color: currentDayInfo.can_go_back ? "white" : "#a0aec0",
                    border: "none",
                    borderRadius: "6px",
                    cursor: currentDayInfo.can_go_back
                      ? "pointer"
                      : "not-allowed",
                    fontWeight: "bold",
                  }}
                >
                  ← Previous Day
                </button>

                <div style={{ textAlign: "center" }}>
                  <h2
                    style={{ margin: "0", color: "#2d3748", fontSize: "24px" }}
                  >
                    {currentDayInfo.display}
                  </h2>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#718096",
                      marginTop: "4px",
                    }}
                  >
                    Day {currentDayInfo.current_day}
                  </div>
                </div>

                <button
                  onClick={() => navigateDate("next")}
                  disabled={!currentDayInfo.can_go_forward}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: currentDayInfo.can_go_forward
                      ? "#4299e1"
                      : "#e2e8f0",
                    color: currentDayInfo.can_go_forward ? "white" : "#a0aec0",
                    border: "none",
                    borderRadius: "6px",
                    cursor: currentDayInfo.can_go_forward
                      ? "pointer"
                      : "not-allowed",
                    fontWeight: "bold",
                  }}
                >
                  Next Day →
                </button>
              </div>
            )}

            {/* Loading State for History */}
            {historyLoading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "200px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      border: "3px solid #e2e8f0",
                      borderTop: "3px solid #48bb78",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto 1rem auto",
                    }}
                  ></div>
                  <div style={{ color: "#718096", fontSize: "14px" }}>
                    Loading day data...
                  </div>
                </div>
              </div>
            )}

            {/* Day Content */}
            {!historyLoading && currentDayData && (
              <>
                {/* Day Summary */}
                <div
                  style={{
                    marginBottom: "2rem",
                    padding: "1.5rem",
                    backgroundColor: "#f0fff4",
                    border: "1px solid #9ae6b4",
                    borderRadius: "12px",
                  }}
                >
                  <h4 style={{ margin: "0 0 1rem 0", color: "#22543d" }}>
                    Daily Summary
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "1rem",
                      fontSize: "14px",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#e53e3e",
                        }}
                      >
                        {Math.round(currentDayData.totals.total_eaten)}
                      </div>
                      <div style={{ color: "#718096" }}>Total Calories</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#3182ce",
                        }}
                      >
                        {Math.round(currentDayData.totals.nutrients.protein)}g
                      </div>
                      <div style={{ color: "#718096" }}>Total Protein</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#38a169",
                        }}
                      >
                        {Math.round(
                          currentDayData.totals.nutrients.carbohydrates
                        )}
                        g
                      </div>
                      <div style={{ color: "#718096" }}>Total Carbs</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#d69e2e",
                        }}
                      >
                        {Math.round(currentDayData.totals.nutrients.fat)}g
                      </div>
                      <div style={{ color: "#718096" }}>Total Fat</div>
                    </div>
                  </div>
                </div>

                {/* Meals */}
                {Object.keys(currentDayData.meals).length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      backgroundColor: "#f7fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <p
                      style={{
                        color: "#718096",
                        fontStyle: "italic",
                        margin: "0",
                      }}
                    >
                      No meals logged for this day.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(400px, 1fr))",
                      gap: "1.5rem",
                    }}
                  >
                    {["breakfast", "lunch", "dinner", "snacks"].map(
                      (mealType) => (
                        <HistoryMealCard
                          key={mealType}
                          mealName={mealType}
                          foods={currentDayData.meals[mealType] || []}
                        />
                      )
                    )}
                  </div>
                )}
              </>
            )}

            {/* Error state */}
            {!historyLoading && !currentDayData && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  backgroundColor: "#f7fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3 style={{ color: "#4a5568", marginBottom: "1rem" }}>
                  Unable to load day data
                </h3>
                <p style={{ color: "#718096", margin: "0" }}>
                  Please try refreshing the page or selecting a different day.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
