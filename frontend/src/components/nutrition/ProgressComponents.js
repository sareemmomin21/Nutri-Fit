import React from "react";

const getProgressColor = (percentage) => {
  if (percentage >= 90) return "#4CAF50";
  if (percentage >= 70) return "#FF9800";
  return "#2196F3";
};

export const ProgressBar = ({ current, goal, label, unit = "g" }) => {
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

export const MealProgressCard = ({ mealName, progress }) => {
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

export const HistoryMealCard = ({ mealName, foods }) => {
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
