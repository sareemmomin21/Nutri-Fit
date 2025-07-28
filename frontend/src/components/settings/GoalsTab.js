// components/GoalsTab.js
import React, { useState, useEffect } from "react";

export default function GoalsTab({ profile, onUpdate, isSaving }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        fitness_goals: Array.isArray(profile.fitness_goals)
          ? profile.fitness_goals
          : [],
        dietary_restrictions: Array.isArray(profile.dietary_restrictions)
          ? profile.dietary_restrictions
          : [],
        training_styles: Array.isArray(profile.training_styles)
          ? profile.training_styles
          : [],
        primary_focus: profile.primary_focus || "",
        workout_frequency: profile.workout_frequency || "",
        workout_duration: profile.workout_duration || "",
        fitness_experience: profile.fitness_experience || "",
        meal_prep_time: profile.meal_prep_time || "",
        cooking_skill: profile.cooking_skill || "",
        budget_preference: profile.budget_preference || "",
      });
    }
  }, [profile]);

  const handleArrayChange = (field, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(Array.isArray(prev[field]) ? prev[field] : []), value]
        : (Array.isArray(prev[field]) ? prev[field] : []).filter(
            (item) => item !== value
          ),
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "16px",
  };

  const sectionStyle = {
    marginBottom: "2rem",
    padding: "1.5rem",
    backgroundColor: "#f7fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: "1.5rem", color: "#2d3748" }}>
        Goals & Preferences
      </h3>

      {/* Primary Focus */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: "1rem", color: "#2d3748" }}>
          Primary Focus
        </h4>
        <select
          value={formData.primary_focus}
          onChange={(e) => handleInputChange("primary_focus", e.target.value)}
          style={inputStyle}
        >
          <option value="">Select your primary focus</option>
          <option value="nutrition">Nutrition</option>
          <option value="fitness">Fitness</option>
          <option value="both">Both Nutrition & Fitness</option>
        </select>
      </div>

      {/* Fitness Goals */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: "1rem", color: "#2d3748" }}>
          Fitness Goals
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "0.5rem",
          }}
        >
          {[
            "weight_loss",
            "weight_gain",
            "muscle_building",
            "strength_training",
            "endurance",
            "general_health",
          ].map((goal) => (
            <label
              key={goal}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={formData.fitness_goals?.includes(goal)}
                onChange={(e) =>
                  handleArrayChange("fitness_goals", goal, e.target.checked)
                }
                style={{ marginRight: "8px" }}
              />
              {goal.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </label>
          ))}
        </div>
      </div>

      {/* Fitness Experience & Schedule */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: "1rem", color: "#2d3748" }}>
          Fitness Experience & Schedule
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Experience Level
            </label>
            <select
              value={formData.fitness_experience}
              onChange={(e) =>
                handleInputChange("fitness_experience", e.target.value)
              }
              style={inputStyle}
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Workout Frequency (days/week)
            </label>
            <input
              type="number"
              value={formData.workout_frequency}
              onChange={(e) =>
                handleInputChange("workout_frequency", e.target.value)
              }
              style={inputStyle}
              min="0"
              max="7"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Workout Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.workout_duration}
              onChange={(e) =>
                handleInputChange("workout_duration", e.target.value)
              }
              style={inputStyle}
              min="15"
              max="180"
            />
          </div>
        </div>
      </div>

      {/* Training Styles */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: "1rem", color: "#2d3748" }}>
          Training Styles
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "0.5rem",
          }}
        >
          {[
            "weightlifting",
            "bodyweight",
            "cardio",
            "hiit",
            "yoga",
            "pilates",
            "swimming",
            "running",
            "cycling",
            "sports",
          ].map((style) => (
            <label
              key={style}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={formData.training_styles?.includes(style)}
                onChange={(e) =>
                  handleArrayChange("training_styles", style, e.target.checked)
                }
                style={{ marginRight: "8px" }}
              />
              {style.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </label>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: "1rem", color: "#2d3748" }}>
          Dietary Restrictions
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "0.5rem",
          }}
        >
          {[
            "vegetarian",
            "vegan",
            "gluten_free",
            "dairy_free",
            "keto",
            "paleo",
            "halal",
            "kosher",
          ].map((restriction) => (
            <label
              key={restriction}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={formData.dietary_restrictions?.includes(restriction)}
                onChange={(e) =>
                  handleArrayChange(
                    "dietary_restrictions",
                    restriction,
                    e.target.checked
                  )
                }
                style={{ marginRight: "8px" }}
              />
              {restriction
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </label>
          ))}
        </div>
      </div>

      {/* Meal Preferences */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: "1rem", color: "#2d3748" }}>
          Meal Preferences
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Meal Prep Time
            </label>
            <select
              value={formData.meal_prep_time}
              onChange={(e) =>
                handleInputChange("meal_prep_time", e.target.value)
              }
              style={inputStyle}
            >
              <option value="">Select preference</option>
              <option value="minimal">Minimal (under 15 min)</option>
              <option value="moderate">Moderate (15-30 min)</option>
              <option value="extensive">Extensive (30+ min)</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Cooking Skill
            </label>
            <select
              value={formData.cooking_skill}
              onChange={(e) =>
                handleInputChange("cooking_skill", e.target.value)
              }
              style={inputStyle}
            >
              <option value="">Select skill level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Budget Preference
            </label>
            <select
              value={formData.budget_preference}
              onChange={(e) =>
                handleInputChange("budget_preference", e.target.value)
              }
              style={inputStyle}
            >
              <option value="">Select budget</option>
              <option value="low">Budget-conscious</option>
              <option value="medium">Moderate spending</option>
              <option value="high">Premium options</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        style={{
          padding: "12px 24px",
          backgroundColor: isSaving ? "#a0aec0" : "#48bb78",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: isSaving ? "not-allowed" : "pointer",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        {isSaving ? "Saving..." : "Update Preferences"}
      </button>
    </form>
  );
}
