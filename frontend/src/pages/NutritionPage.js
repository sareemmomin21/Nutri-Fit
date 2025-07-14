import React, { useEffect, useState } from "react";
import Nutrition from "../components/Nutrition";

export default function NutritionPage() {
  const [totalEaten, setTotalEaten] = useState(0);
  const [nutrientTotals, setNutrientTotals] = useState({
    protein: 0,
    carbohydrates: 0,
    fat: 0,
  });
  const [mealProgress, setMealProgress] = useState({});
  const [goals, setGoals] = useState({
    calorie_goal: 2000,
    protein: 150,
    carbohydrates: 250,
    fat: 70,
  });
  const userId = "user_123";

  const fetchTotal = async () => {
    try {
      const response = await fetch("http://localhost:5000/get_daily_total", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await response.json();
      setTotalEaten(data.total_eaten);
    } catch (error) {
      console.error("Error fetching total:", error);
    }
  };

  const fetchNutrients = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/get_daily_nutrients",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );
      const data = await response.json();
      setNutrientTotals(data);
    } catch (error) {
      console.error("Error fetching nutrients:", error);
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

  useEffect(() => {
    fetchTotal();
    fetchNutrients();
    fetchMealProgress();
  }, []);

  const refreshData = () => {
    fetchTotal();
    fetchNutrients();
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

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
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
        <h1 style={{ margin: "0 0 1rem 0", color: "#333" }}>
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
            <h3 style={{ margin: "0 0 1rem 0", color: "#333" }}>
              Daily Progress
            </h3>
            <ProgressBar
              current={totalEaten}
              goal={goals.calorie_goal}
              label="Calories"
              unit=""
            />
            <ProgressBar
              current={nutrientTotals.protein}
              goal={goals.protein}
              label="Protein"
            />
            <ProgressBar
              current={nutrientTotals.carbohydrates}
              goal={goals.carbohydrates}
              label="Carbs"
            />
            <ProgressBar
              current={nutrientTotals.fat}
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
            <h3 style={{ margin: "0 0 1rem 0", color: "#333" }}>
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
        <Nutrition meal="breakfast" onAte={refreshData} />
        <Nutrition meal="lunch" onAte={refreshData} />
        <Nutrition meal="dinner" onAte={refreshData} />
        <Nutrition meal="snacks" onAte={refreshData} />
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
