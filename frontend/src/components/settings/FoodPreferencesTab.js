// components/FoodPreferencesTab.js
import React from "react";

export function FoodPreferencesTab({ preferences, onRefresh }) {
  const cardStyle = {
    backgroundColor: "#f7fafc",
    padding: "1.5rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    marginBottom: "1rem",
  };

  const listStyle = {
    listStyle: "none",
    padding: "0",
    margin: "0",
  };

  const itemStyle = {
    padding: "8px 12px",
    backgroundColor: "white",
    marginBottom: "4px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const badgeStyle = (type) => ({
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor: type === "liked" ? "#c6f6d5" : "#fed7d7",
    color: type === "liked" ? "#22543d" : "#c53030",
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h3 style={{ margin: "0", color: "#2d3748" }}>Food Preferences</h3>
      </div>

      {/* Overall Summary */}
      <div style={cardStyle}>
        <h4 style={{ marginBottom: "1rem", color: "#2d3748" }}>
          Overall Summary
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          <div>
            <h5 style={{ color: "green", marginBottom: "0.5rem" }}>
              Liked Foods ({preferences.overall_preferences.liked?.length || 0})
            </h5>
            {preferences.overall_preferences.liked?.length > 0 ? (
              <ul style={listStyle}>
                {preferences.overall_preferences.liked
                  .slice(0, 5)
                  .map((food, index) => (
                    <li key={index} style={itemStyle}>
                      <span>{food}</span>
                      <span style={badgeStyle("liked")}>Liked</span>
                    </li>
                  ))}
                {preferences.overall_preferences.liked.length > 5 && (
                  <li
                    style={{
                      ...itemStyle,
                      backgroundColor: "#f7fafc",
                      fontStyle: "italic",
                    }}
                  >
                    ...and {preferences.overall_preferences.liked.length - 5}{" "}
                    more
                  </li>
                )}
              </ul>
            ) : (
              <p style={{ color: "#718096", fontStyle: "italic" }}>
                No liked foods yet
              </p>
            )}
          </div>

          <div>
            <h5 style={{ color: "#c53030", marginBottom: "0.5rem" }}>
              Disliked Foods (
              {preferences.overall_preferences.disliked?.length || 0})
            </h5>
            {preferences.overall_preferences.disliked?.length > 0 ? (
              <ul style={listStyle}>
                {preferences.overall_preferences.disliked
                  .slice(0, 5)
                  .map((food, index) => (
                    <li key={index} style={itemStyle}>
                      <span>{food}</span>
                      <span style={badgeStyle("disliked")}>Disliked</span>
                    </li>
                  ))}
                {preferences.overall_preferences.disliked.length > 5 && (
                  <li
                    style={{
                      ...itemStyle,
                      backgroundColor: "#f7fafc",
                      fontStyle: "italic",
                    }}
                  >
                    ...and {preferences.overall_preferences.disliked.length - 5}{" "}
                    more
                  </li>
                )}
              </ul>
            ) : (
              <p style={{ color: "#718096", fontStyle: "italic" }}>
                No disliked foods yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Meal-Specific Preferences */}
      <div style={cardStyle}>
        <h4 style={{ marginBottom: "1rem", color: "#2d3748" }}>
          Preferences by Meal
        </h4>
        {Object.keys(preferences.meal_preferences).length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {Object.entries(preferences.meal_preferences).map(
              ([mealType, mealPrefs]) => (
                <MealPreferenceCard
                  key={mealType}
                  mealType={mealType}
                  mealPrefs={mealPrefs}
                />
              )
            )}
          </div>
        ) : (
          <p style={{ color: "#718096", fontStyle: "italic" }}>
            No meal-specific preferences yet. Start using the app to build your
            food preferences!
          </p>
        )}
      </div>

      <div
        style={{
          backgroundColor: "#edf2f7",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #cbd5e0",
        }}
      >
        <p style={{ margin: "0", fontSize: "14px", color: "#4a5568" }}>
          <strong>
            Your food preferences are automatically learned as you use the app.
            Like or dislike foods in the nutrition section to build your
            personalized recommendations!
          </strong>
        </p>
      </div>
    </div>
  );
}

// Helper component for meal preference cards
function MealPreferenceCard({ mealType, mealPrefs }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "1rem",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
      }}
    >
      <h5
        style={{
          textTransform: "capitalize",
          marginBottom: "0.5rem",
          color: "#2d3748",
          borderBottom: "2px solid #e2e8f0",
          paddingBottom: "0.5rem",
        }}
      >
        {mealType}
      </h5>

      {mealPrefs.liked?.length > 0 && (
        <div style={{ marginBottom: "0.5rem" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#22543d",
              marginBottom: "4px",
            }}
          >
            Liked ({mealPrefs.liked.length})
          </div>
          {mealPrefs.liked.slice(0, 3).map((food, index) => (
            <div
              key={index}
              style={{
                fontSize: "13px",
                padding: "2px 6px",
                backgroundColor: "#c6f6d5",
                color: "#22543d",
                borderRadius: "4px",
                marginBottom: "2px",
                display: "inline-block",
                marginRight: "4px",
              }}
            >
              {food}
            </div>
          ))}
          {mealPrefs.liked.length > 3 && (
            <div
              style={{
                fontSize: "12px",
                color: "#718096",
                fontStyle: "italic",
              }}
            >
              +{mealPrefs.liked.length - 3} more
            </div>
          )}
        </div>
      )}

      {mealPrefs.disliked?.length > 0 && (
        <div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#c53030",
              marginBottom: "4px",
            }}
          >
            Disliked ({mealPrefs.disliked.length})
          </div>
          {mealPrefs.disliked.slice(0, 3).map((food, index) => (
            <div
              key={index}
              style={{
                fontSize: "13px",
                padding: "2px 6px",
                backgroundColor: "#fed7d7",
                color: "#c53030",
                borderRadius: "4px",
                marginBottom: "2px",
                display: "inline-block",
                marginRight: "4px",
              }}
            >
              {food}
            </div>
          ))}
          {mealPrefs.disliked.length > 3 && (
            <div
              style={{
                fontSize: "12px",
                color: "#718096",
                fontStyle: "italic",
              }}
            >
              +{mealPrefs.disliked.length - 3} more
            </div>
          )}
        </div>
      )}

      {(!mealPrefs.liked || mealPrefs.liked.length === 0) &&
        (!mealPrefs.disliked || mealPrefs.disliked.length === 0) && (
          <p
            style={{
              color: "#718096",
              fontStyle: "italic",
              fontSize: "14px",
              margin: "0",
            }}
          >
            No preferences set yet
          </p>
        )}
    </div>
  );
}

export default FoodPreferencesTab;
