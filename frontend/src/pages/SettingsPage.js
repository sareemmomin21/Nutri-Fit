import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [foodPreferences, setFoodPreferences] = useState({
    overall_preferences: {},
    meal_preferences: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const userId = localStorage.getItem("nutrifit_user_id");

  useEffect(() => {
    if (!userId) {
      navigate("/auth");
      return;
    }
    fetchUserData();
  }, [userId, navigate]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);

      // Fetch profile
      const profileResponse = await fetch(
        "${process.env.REACT_APP_API_URL}/api/get_profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
      }

      // Fetch food preferences
      const prefsResponse = await fetch(
        "${process.env.REACT_APP_API_URL}/api/get_food_preferences",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        setFoodPreferences(prefsData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setMessage({ type: "error", text: "Failed to load user data" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      setIsSaving(true);
      const response = await fetch("${process.env.REACT_APP_API_URL}/api/update_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, ...updatedData }),
      });

      const data = await response.json();
      if (data.success) {
        setProfile((prev) => ({ ...prev, ...updatedData }));
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to update profile",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("nutrifit_user_id");
      navigate("/auth");
    }
  };

  const tabStyle = (isActive) => ({
    padding: "12px 24px",
    border: "none",
    borderBottom: isActive ? "3px solid #48bb78" : "3px solid transparent",
    backgroundColor: "transparent",
    color: isActive ? "#48bb78" : "#718096",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: isActive ? "bold" : "normal",
    transition: "all 0.2s",
  });

  const cardStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "1rem",
  };

  if (isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#718096" }}>
          Loading your settings...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1000px",
        margin: "0 auto",
        backgroundColor: "#f7fafc",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: "0", color: "#2d3748" }}>Settings</h1>
            <p style={{ margin: "0.5rem 0 0 0", color: "#718096" }}>
              Manage your account and preferences
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#e53e3e",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          style={{
            backgroundColor: message.type === "success" ? "#c6f6d5" : "#fed7d7",
            border: `1px solid ${
              message.type === "success" ? "#48bb78" : "#e53e3e"
            }`,
            color: message.type === "success" ? "#22543d" : "#c53030",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
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
            onClick={() => setActiveTab("profile")}
            style={tabStyle(activeTab === "profile")}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            style={tabStyle(activeTab === "goals")}
          >
            Goals & Preferences
          </button>
          <button
            onClick={() => setActiveTab("food")}
            style={tabStyle(activeTab === "food")}
          >
            Food Preferences
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
        {activeTab === "profile" && (
          <ProfileTab
            profile={profile}
            onUpdate={handleProfileUpdate}
            isSaving={isSaving}
          />
        )}

        {activeTab === "goals" && (
          <GoalsTab
            profile={profile}
            onUpdate={handleProfileUpdate}
            isSaving={isSaving}
          />
        )}

        {activeTab === "food" && (
          <FoodPreferencesTab
            preferences={foodPreferences}
            onRefresh={fetchUserData}
          />
        )}
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ profile, onUpdate, isSaving }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        height_cm: profile.height_cm || "",
        weight_lb: profile.weight_lb || "",
        activity_level: profile.activity_level || "",
      });
    }
  }, [profile]);

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

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: "1.5rem", color: "#2d3748" }}>
        Personal Information
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1rem",
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
            First Name
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, first_name: e.target.value }))
            }
            style={inputStyle}
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
            Last Name
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, last_name: e.target.value }))
            }
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1rem",
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
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                date_of_birth: e.target.value,
              }))
            }
            style={inputStyle}
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
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, gender: e.target.value }))
            }
            style={inputStyle}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1rem",
          marginBottom: "1.5rem",
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
            Height (cm)
          </label>
          <input
            type="number"
            value={formData.height_cm}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, height_cm: e.target.value }))
            }
            style={inputStyle}
            min="100"
            max="250"
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
            Weight (lbs)
          </label>
          <input
            type="number"
            value={formData.weight_lb}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, weight_lb: e.target.value }))
            }
            style={inputStyle}
            min="50"
            max="500"
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
            Activity Level
          </label>
          <select
            value={formData.activity_level}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                activity_level: e.target.value,
              }))
            }
            style={inputStyle}
          >
            <option value="">Select level</option>
            <option value="sedentary">Sedentary</option>
            <option value="lightly_active">Lightly Active</option>
            <option value="moderately_active">Moderately Active</option>
            <option value="very_active">Very Active</option>
            <option value="extremely_active">Extremely Active</option>
          </select>
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
        {isSaving ? "Saving..." : "Update Profile"}
      </button>
    </form>
  );
}

// Goals Tab Component
function GoalsTab({ profile, onUpdate, isSaving }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        fitness_goals: profile.fitness_goals || [],
        dietary_restrictions: profile.dietary_restrictions || [],
        training_styles: profile.training_styles || [],
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
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
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
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, primary_focus: e.target.value }))
          }
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
                setFormData((prev) => ({
                  ...prev,
                  fitness_experience: e.target.value,
                }))
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
                setFormData((prev) => ({
                  ...prev,
                  workout_frequency: e.target.value,
                }))
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
                setFormData((prev) => ({
                  ...prev,
                  workout_duration: e.target.value,
                }))
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
                setFormData((prev) => ({
                  ...prev,
                  meal_prep_time: e.target.value,
                }))
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
                setFormData((prev) => ({
                  ...prev,
                  cooking_skill: e.target.value,
                }))
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
                setFormData((prev) => ({
                  ...prev,
                  budget_preference: e.target.value,
                }))
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

// Food Preferences Tab Component
function FoodPreferencesTab({ preferences, onRefresh }) {
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
                <div
                  key={mealType}
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
                    (!mealPrefs.disliked ||
                      mealPrefs.disliked.length === 0) && (
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
            {" "}
            Your food preferences are automatically learned as you use the app.
            Like or dislike foods in the nutrition section to build your
            personalized recommendations!{" "}
          </strong>
        </p>
      </div>
    </div>
  );
}
