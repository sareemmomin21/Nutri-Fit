import React, { useEffect, useState } from "react";

export default function Nutrition({ meal = "breakfast", onAte = () => {} }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = "user_123";

  const getSuggestion = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const sendFeedback = async (liked, food) => {
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

    // Replace if disliked
    if (!liked) getSuggestion();
  };

  useEffect(() => {
    getSuggestion();
  }, [meal]);

  const totalCalories = suggestions.reduce(
    (sum, food) => sum + (food.calories || 0),
    0
  );

  const confirmAte = async (food) => {
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

    getSuggestion();
    if (typeof onAte === "function") onAte();
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h2>Food Suggestion for {meal[0].toUpperCase() + meal.slice(1)}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : suggestions.length > 0 ? (
        <div>
          {suggestions.map((food, index) => (
            <div
              key={index}
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "1rem",
                maxWidth: "400px",
              }}
            >
              <h3>{food.name}</h3>
              <p>Estimated Calories: {food.calories}</p>
              <p>Protein: {food.protein}g</p>
              <p>Carbs: {food.carbohydrates}g</p>
              <p>Fat: {food.fat}g</p>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() => sendFeedback(true, food)}
                  style={{
                    background: "green",
                    color: "white",
                    padding: "0.5rem",
                  }}
                >
                  Like
                </button>
                <button
                  onClick={() => sendFeedback(false, food)}
                  style={{
                    background: "red",
                    color: "white",
                    padding: "0.5rem",
                  }}
                >
                  Dislike
                </button>
                <button
                  onClick={() => confirmAte(food)}
                  style={{
                    background: "#444",
                    color: "white",
                    padding: "0.5rem",
                  }}
                >
                  Ate This
                </button>
              </div>
            </div>
          ))}
          <strong>Total Calories: {Math.round(totalCalories)}</strong>
        </div>
      ) : (
        <p>No suggestions available right now.</p>
      )}
    </div>
  );
}
