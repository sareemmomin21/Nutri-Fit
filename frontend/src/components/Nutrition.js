import React, { useEffect, useState } from "react";

export default function Nutrition({ meal = "breakfast", onAte = () => {} }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingFeedback, setProcessingFeedback] = useState({});
  const userId = "user_123";

  const getSuggestion = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch("http://localhost:5000/get_suggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          meal,
        }),
      });

      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestion:", error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const sendFeedback = async (liked, food) => {
    const foodKey = food.name;
    setProcessingFeedback((prev) => ({ ...prev, [foodKey]: true }));

    try {
      await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          food: food.name,
          liked,
          meal,
          calories: food.calories,
        }),
      });

      // Only get new suggestion if disliked
      if (!liked) {
        await getSuggestion(true);
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
    } finally {
      setProcessingFeedback((prev) => ({ ...prev, [foodKey]: false }));
    }
  };

  const confirmAte = async (food) => {
    const foodKey = food.name;
    setProcessingFeedback((prev) => ({ ...prev, [foodKey]: true }));

    try {
      await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          food: food.name,
          liked: null,
          meal,
          calories: food.calories,
          protein: food.protein || 0,
          carbohydrates: food.carbohydrates || 0,
          fat: food.fat || 0,
          ate: true,
        }),
      });

      // Get new suggestion after eating
      await getSuggestion(true);

      if (typeof onAte === "function") onAte();
    } catch (error) {
      console.error("Error confirming ate:", error);
    } finally {
      setProcessingFeedback((prev) => ({ ...prev, [foodKey]: false }));
    }
  };

  useEffect(() => {
    getSuggestion();
  }, [meal]);

  const totalCalories = suggestions.reduce(
    (sum, food) => sum + (food.calories || 0),
    0
  );

  const getMealDisplayName = (meal) => {
    return meal.charAt(0).toUpperCase() + meal.slice(1);
  };

  const renderFoodCard = (food, index) => {
    const isProcessing = processingFeedback[food.name];

    return (
      <div
        key={index}
        style={{
          padding: "1.5rem",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          marginBottom: "1rem",
          maxWidth: "450px",
          backgroundColor: "#fafafa",
          position: "relative",
          transition: "all 0.3s ease",
          opacity: isProcessing ? 0.7 : 1,
        }}
      >
        {isProcessing && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              color: "#666",
              fontWeight: "bold",
            }}
          >
            Processing...
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#333" }}>
            {food.name}
          </h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            marginBottom: "1rem",
            fontSize: "0.9rem",
            color: "#666",
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Calories:</strong> {food.calories}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Protein:</strong> {food.protein}g
          </p>
          <p style={{ margin: 0 }}>
            <strong>Carbs:</strong> {food.carbohydrates}g
          </p>
          <p style={{ margin: 0 }}>
            <strong>Fat:</strong> {food.fat}g
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => sendFeedback(true, food)}
            disabled={isProcessing}
            style={{
              background: isProcessing ? "#ccc" : "#4CAF50",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "6px",
              cursor: isProcessing ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Like
          </button>
          <button
            onClick={() => sendFeedback(false, food)}
            disabled={isProcessing}
            style={{
              background: isProcessing ? "#ccc" : "#f44336",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "6px",
              cursor: isProcessing ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Dislike
          </button>
          <button
            onClick={() => confirmAte(food)}
            disabled={isProcessing}
            style={{
              background: isProcessing ? "#ccc" : "#2196F3",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "6px",
              cursor: isProcessing ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Ate This
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        border: "1px solid #ddd",
        borderRadius: "8px",
        margin: "1rem 0",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#333",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {getMealDisplayName(meal)} Suggestions
        </h2>

        {!loading && (
          <button
            onClick={() => getSuggestion(true)}
            disabled={refreshing}
            style={{
              background: refreshing ? "#ccc" : "#FF9800",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "6px",
              cursor: refreshing ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {refreshing ? "Refreshing..." : "Get New Suggestions"}
          </button>
        )}
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#666",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#f0f0f0",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              fontSize: "20px",
              fontWeight: "bold",
              border: "2px solid #ddd",
            }}
          >
            ⋯
          </div>
          <p>Finding perfect {meal} suggestions for you...</p>
        </div>
      ) : suggestions.length > 0 ? (
        <div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            {suggestions.map((food, index) => renderFoodCard(food, index))}
          </div>

          <div
            style={{
              padding: "1rem",
              backgroundColor: "#f0f8ff",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div>
              <strong style={{ color: "#333", fontSize: "1.1rem" }}>
                Total Meal Calories: {Math.round(totalCalories)}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#666",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#f0f0f0",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              fontSize: "20px",
              fontWeight: "bold",
              border: "2px solid #ddd",
              color: "#999",
            }}
          >
            ∅
          </div>
          <p>No suggestions available right now.</p>
          <p style={{ fontSize: "0.9rem" }}>
            You might be close to your calorie limit for this meal.
          </p>
        </div>
      )}
    </div>
  );
}
