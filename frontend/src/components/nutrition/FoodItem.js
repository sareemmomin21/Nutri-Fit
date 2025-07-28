// Add this enhanced FoodItem component to FoodItem.js

import React from "react";

const LoadingSpinner = ({ size = "20px" }) => (
  <div
    style={{
      width: size,
      height: size,
      border: "2px solid #e2e8f0",
      borderTop: "2px solid #48bb78",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      display: "inline-block",
    }}
  />
);

const DietaryWarning = ({ warning }) => {
  if (!warning) return null;

  return (
    <div
      style={{
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "6px",
        padding: "8px",
        marginBottom: "8px",
        fontSize: "12px",
        color: "#dc2626",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <span style={{ fontSize: "14px" }}></span>
      <span>{warning}</span>
    </div>
  );
};

const FoodItem = ({
  food,
  meal,
  showActions = true,
  showQuantityInfo = false,
  isCurrentMeal = false,
  fromSuggestion = false,
  loadingStates,
  onAdd,
  onRemove,
  onUpdatePreference,
}) => {
  const buttonStyle = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s",
    margin: "0 4px",
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: "1rem",
        borderRadius: "8px",
        border: "1px solid #e9ecef",
        marginBottom: "1rem",
        opacity: loadingStates?.addingFood ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Dietary Warning */}
      <DietaryWarning warning={food.dietary_warning} />

      <h4
        style={{
          margin: "0 0 0.5rem 0",
          color: "#2d3748",
          fontSize: "16px",
          lineHeight: "1.3",
        }}
      >
        {food.name}
        {showQuantityInfo && food.quantity && food.serving_size && (
          <span
            style={{ fontSize: "14px", color: "#718096", fontWeight: "normal" }}
          >
            {" "}
            ({food.quantity} {food.serving_size})
          </span>
        )}
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
          gap: "0.5rem",
          marginBottom: showActions ? "1rem" : "0",
          fontSize: "14px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "8px",
            borderRadius: "4px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontWeight: "bold", color: "#e53e3e" }}>
            {Math.round(food.calories)}
          </div>
          <div style={{ fontSize: "12px", color: "#718096" }}>cal</div>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "8px",
            borderRadius: "4px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontWeight: "bold", color: "#3182ce" }}>
            {Math.round(food.protein || 0)}g
          </div>
          <div style={{ fontSize: "12px", color: "#718096" }}>protein</div>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "8px",
            borderRadius: "4px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontWeight: "bold", color: "#38a169" }}>
            {Math.round(food.carbohydrates || 0)}g
          </div>
          <div style={{ fontSize: "12px", color: "#718096" }}>carbs</div>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "8px",
            borderRadius: "4px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontWeight: "bold", color: "#d69e2e" }}>
            {Math.round(food.fat || 0)}g
          </div>
          <div style={{ fontSize: "12px", color: "#718096" }}>fat</div>
        </div>
      </div>

      {showActions && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {!isCurrentMeal && (
            <>
              <button
                onClick={() => onUpdatePreference(food, true)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#48bb78",
                  color: "white",
                }}
                disabled={loadingStates?.addingFood}
              >
                Like
              </button>
              <button
                onClick={() => onUpdatePreference(food, false)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#e53e3e",
                  color: "white",
                }}
                disabled={loadingStates?.addingFood}
              >
                Dislike
              </button>
              <button
                onClick={() => onAdd(food, false)}
                style={{
                  ...buttonStyle,
                  backgroundColor: food.dietary_warning ? "#f59e0b" : "#4299e1",
                  color: "white",
                }}
                disabled={loadingStates?.addingFood}
                title={
                  food.dietary_warning
                    ? "This item may conflict with your dietary preferences"
                    : ""
                }
              >
                {loadingStates?.addingFood ? (
                  <LoadingSpinner size="16px" />
                ) : (
                  `Add to ${meal}`
                )}
              </button>
            </>
          )}

          {isCurrentMeal && (
            <button
              onClick={() => onRemove(food.id)}
              style={{
                ...buttonStyle,
                backgroundColor: "#e53e3e",
                color: "white",
              }}
              disabled={loadingStates?.removingFood}
            >
              {loadingStates?.removingFood ? (
                <LoadingSpinner size="16px" />
              ) : (
                "Remove"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodItem;
