import React, { useState, useEffect } from "react";

export default function Nutrition({ meal, onAte, userId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get userId from props or localStorage
  const currentUserId = userId || localStorage.getItem("nutrifit_user_id");

  useEffect(() => {
    if (currentUserId) {
      fetchSuggestions();
    }
  }, [meal, currentUserId]);

  const fetchSuggestions = async () => {
    if (!currentUserId) {
      setError("User not logged in");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/get_suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          meal: meal,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        setSuggestions(data);
      } else if (data.error) {
        setError(data.error);
        setSuggestions([]);
      } else {
        console.warn("Unexpected response format:", data);
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setError("Failed to load suggestions. Please try again.");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (food, liked, ate = false) => {
    if (!currentUserId) return;

    try {
      const response = await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          food: food.name,
          liked: liked,
          meal: meal,
          ate: ate,
          calories: food.calories,
          protein: food.protein,
          carbohydrates: food.carbohydrates,
          fat: food.fat,
        }),
      });

      if (response.ok) {
        if (ate && onAte) {
          onAte(); // Refresh parent component data
        }
        // Refresh suggestions after feedback
        fetchSuggestions();
      } else {
        console.error("Failed to send feedback");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "1.5rem",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    height: "fit-content",
  };

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

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#48bb78",
    color: "white",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#e2e8f0",
    color: "#4a5568",
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#e53e3e",
    color: "white",
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <h3
        style={{
          margin: "0 0 1rem 0",
          color: "#2d3748",
          textTransform: "capitalize",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: "2px solid #e2e8f0",
          paddingBottom: "0.5rem",
        }}
      >
        <span style={{ fontSize: "20px" }}></span>
        {meal} Suggestions
      </h3>

      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#718096",
          }}
        >
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
          Loading suggestions...
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            backgroundColor: "#fed7d7",
            border: "1px solid #e53e3e",
            color: "#c53030",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>⚠️ Error</p>
          <p style={{ margin: "0", fontSize: "14px" }}>{error}</p>
          <button
            onClick={fetchSuggestions}
            style={{
              ...secondaryButtonStyle,
              marginTop: "0.5rem",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Suggestions State */}
      {!isLoading && !error && suggestions.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            backgroundColor: "#f7fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🍽️</div>
          <h4 style={{ color: "#4a5568", marginBottom: "0.5rem" }}>
            No suggestions available
          </h4>
          <p
            style={{
              color: "#718096",
              fontSize: "14px",
              margin: "0 0 1rem 0",
              lineHeight: "1.4",
            }}
          >
            You might have reached your calorie limit for this meal, or we're
            having trouble finding suitable options.
          </p>
          <button onClick={fetchSuggestions} style={primaryButtonStyle}>
            Refresh Suggestions
          </button>
        </div>
      )}

      {/* Suggestions List */}
      {!isLoading &&
        !error &&
        Array.isArray(suggestions) &&
        suggestions.length > 0 && (
          <div>
            {suggestions.map((food, index) => (
              <div
                key={`${food.fdcId || food.name}-${index}`}
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                  marginBottom: "1rem",
                }}
              >
                {/* Food Name */}
                <h4
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "#2d3748",
                    fontSize: "16px",
                    lineHeight: "1.3",
                  }}
                >
                  {food.name}
                </h4>

                {/* Nutrition Info */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                    gap: "0.5rem",
                    marginBottom: "1rem",
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
                    <div style={{ fontSize: "12px", color: "#718096" }}>
                      cal
                    </div>
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
                    <div style={{ fontSize: "12px", color: "#718096" }}>
                      protein
                    </div>
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
                    <div style={{ fontSize: "12px", color: "#718096" }}>
                      carbs
                    </div>
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
                    <div style={{ fontSize: "12px", color: "#718096" }}>
                      fat
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div>
                    <button
                      onClick={() => handleFeedback(food, true)}
                      style={primaryButtonStyle}
                      onMouseOver={(e) =>
                        (e.target.style.backgroundColor = "#38a169")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = "#48bb78")
                      }
                    >
                      Like
                    </button>
                    <button
                      onClick={() => handleFeedback(food, false)}
                      style={dangerButtonStyle}
                      onMouseOver={(e) =>
                        (e.target.style.backgroundColor = "#c53030")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = "#e53e3e")
                      }
                    >
                      Dislike
                    </button>
                  </div>

                  <button
                    onClick={() => handleFeedback(food, null, true)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: "#4299e1",
                      color: "white",
                      fontWeight: "bold",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#3182ce")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#4299e1")
                    }
                  >
                    I Ate This
                  </button>
                </div>
              </div>
            ))}

            {/* Refresh Button */}
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                onClick={fetchSuggestions}
                style={secondaryButtonStyle}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#cbd5e0")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#e2e8f0")}
              >
                Get New Suggestions
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
