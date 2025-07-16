import React, { useEffect, useState } from "react";
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

  // Get user ID from localStorage
  const userId = localStorage.getItem("nutrifit_user_id");

  useEffect(() => {
    if (!userId) {
      navigate("/auth");
      return;
    }

    fetchUserProfile();
    fetchDailySummary();
    fetchMealProgress();
  }, [userId, navigate]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/get_profile", {
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
  };

  // Combined fetch for daily totals and nutrients
  const fetchDailySummary = async () => {
    try {
      const response = await fetch("http://localhost:5000/get_daily_summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await response.json();
      setDailySummary(data);
    } catch (error) {
      console.error("Error fetching daily summary:", error);
    }
  };

  const fetchMealProgress = async () => {
    try {
      const response = await fetch("http://localhost:5000/get_meal_progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await response.json();
      setMealProgress(data);
    } catch (error) {
      console.error("Error fetching meal progress:", error);
    }
  };

  const refreshData = () => {
    fetchDailySummary();
    fetchMealProgress();
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "#4CAF50"; // Green
    if (percentage >= 70) return "#FF9800"; // Orange
    return "#2196F3"; // Blue
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
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px" }}></span>
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
              : "Over budget"}
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

  const handleNextDay = async () => {
    if (
      window.confirm(
        "Are you sure you want to start a new day? This will reset all your progress."
      )
    ) {
      try {
        await fetch("http://localhost:5000/next_day", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });
        window.location.reload();
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
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Welcome Message */}
      {userProfile && (
        <div
          style={{
            backgroundColor: "#f0fff4",
            border: "1px solid #9ae6b4",
            borderRadius: "8px",
            padding: "1rem",
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
            Welcome back, {userProfile.first_name || "there"}! Ready to track
            your nutrition today?
          </p>
        </div>
      )}

      {/* Header Section */}
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "2rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          border: "1px solid #ddd",
        }}
      >
        <h1
          style={{
            margin: "0 0 1rem 0",
            color: "#333",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          Daily Nutrition Dashboard
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
            }}
          >
            <h3
              style={{
                margin: "0 0 1rem 0",
                color: "#333",
                display: "flex",
                alignItems: "center",
                gap: "8px",
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
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
            }}
          >
            <h3
              style={{
                margin: "0 0 1rem 0",
                color: "#333",
                display: "flex",
                alignItems: "center",
                gap: "8px",
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

      {/* Meal Suggestions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "1rem",
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
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
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
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
        >
          Next Day
        </button>
      </div>
    </div>
  );
}
