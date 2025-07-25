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
  const [workoutPreferences, setWorkoutPreferences] = useState({
    liked: [],
    disliked: [],
  });
  const [customWorkouts, setCustomWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

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
        "http://127.0.0.1:5000/api/get_profile",
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
        "http://127.0.0.1:5000/api/get_food_preferences",
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

      // Fetch workout preferences
      const workoutPrefsResponse = await fetch(
        "http://127.0.0.1:5000/api/get_workout_preferences",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (workoutPrefsResponse.ok) {
        const workoutPrefsData = await workoutPrefsResponse.json();
        setWorkoutPreferences(workoutPrefsData);
      }

      // Fetch custom workouts
      const customWorkoutsResponse = await fetch(
        "http://127.0.0.1:5000/api/get_user_custom_workouts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (customWorkoutsResponse.ok) {
        const customWorkoutsData = await customWorkoutsResponse.json();
        setCustomWorkouts(customWorkoutsData);
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
      const response = await fetch("http://127.0.0.1:5000/api/update_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, ...updatedData }),
      });

      const data = await response.json();
      if (data.success) {
        setProfile((prev) => ({ ...prev, ...updatedData }));
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
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

  const handleCompleteWorkout = async (workoutData) => {
    try {
      console.log("Completing workout from settings:", workoutData.name);

      const response = await fetch(
        "http://127.0.0.1:5000/api/complete_workout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            workout_data: workoutData,
          }),
        }
      );

      if (response.ok) {
        setShowWorkoutModal(false);
        setSelectedWorkout(null);
        setMessage({
          type: "success",
          text: `Workout "${workoutData.name}" completed successfully!`,
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        return true;
      } else {
        console.error("Failed to complete workout:", response.status);
        return false;
      }
    } catch (error) {
      console.error("Error completing workout:", error);
      return false;
    }
  };

  const handleDeleteCustomWorkout = async (workoutId, workoutName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${workoutName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/delete_custom_workout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            workout_id: workoutId,
          }),
        }
      );

      if (response.ok) {
        // Remove from local state
        setCustomWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
        setMessage({
          type: "success",
          text: `Custom workout "${workoutName}" deleted successfully!`,
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.error || "Failed to delete custom workout",
        });
      }
    } catch (error) {
      console.error("Error deleting custom workout:", error);
      setMessage({ type: "error", text: "Failed to delete custom workout" });
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
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e2e8f0",
            flexWrap: "wrap",
          }}
        >
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
          <button
            onClick={() => setActiveTab("workouts")}
            style={tabStyle(activeTab === "workouts")}
          >
            Workout Preferences
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            style={tabStyle(activeTab === "custom")}
          >
            Custom Workouts
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

        {activeTab === "workouts" && (
          <WorkoutPreferencesTab
            preferences={workoutPreferences}
            onRefresh={fetchUserData}
          />
        )}

        {activeTab === "custom" && (
          <CustomWorkoutsTab
            customWorkouts={customWorkouts}
            onStartWorkout={(workout) => {
              setSelectedWorkout(workout);
              setShowWorkoutModal(true);
            }}
            onDeleteWorkout={handleDeleteCustomWorkout}
            onRefresh={fetchUserData}
          />
        )}
      </div>

      {/* Custom Workout Modal */}
      {showWorkoutModal && selectedWorkout && (
        <CustomWorkoutModal
          workout={selectedWorkout}
          onClose={() => {
            setShowWorkoutModal(false);
            setSelectedWorkout(null);
          }}
          onComplete={handleCompleteWorkout}
        />
      )}
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
        has_gym_membership: profile.has_gym_membership || false,
        home_equipment: profile.home_equipment || [],
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

      {/* Gym Membership & Equipment */}
      <div style={sectionStyle}>
        <h4 style={{ marginBottom: "1rem", color: "#2d3748" }}>
          Gym & Equipment
        </h4>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              padding: "8px",
              backgroundColor: "white",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
            }}
          >
            <input
              type="checkbox"
              checked={formData.has_gym_membership}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  has_gym_membership: e.target.checked,
                }))
              }
              style={{ marginRight: "8px" }}
            />
            <span style={{ fontWeight: "bold" }}>I have a gym membership</span>
          </label>
        </div>

        {!formData.has_gym_membership && (
          <div>
            <h5 style={{ marginBottom: "0.5rem", color: "#2d3748" }}>
              Home Equipment (select all that apply)
            </h5>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "0.5rem",
              }}
            >
              {[
                "dumbbells",
                "resistance_bands",
                "kettlebell",
                "yoga_mat",
                "pull_up_bar",
                "exercise_bike",
                "treadmill",
                "jump_rope",
                "stability_ball",
                "foam_roller",
                "bench",
                "barbell",
              ].map((equipment) => (
                <label
                  key={equipment}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "8px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.home_equipment?.includes(equipment)}
                    onChange={(e) =>
                      handleArrayChange(
                        "home_equipment",
                        equipment,
                        e.target.checked
                      )
                    }
                    style={{ marginRight: "8px" }}
                  />
                  {equipment
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
              ))}
            </div>
          </div>
        )}
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
          <strong>How it works:</strong> Your food preferences are automatically
          learned as you use the app. Like or dislike foods in the nutrition
          section to build your personalized recommendations!
        </p>
      </div>
    </div>
  );
}

// NEW: Workout Preferences Tab Component
function WorkoutPreferencesTab({ preferences, onRefresh }) {
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
    padding: "12px 16px",
    backgroundColor: "white",
    marginBottom: "8px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  };

  const badgeStyle = (type) => ({
    padding: "4px 12px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor: type === "liked" ? "#c6f6d5" : "#fed7d7",
    color: type === "liked" ? "#22543d" : "#c53030",
    display: "flex",
    alignItems: "center",
    gap: "4px",
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
        <h3 style={{ margin: "0", color: "#2d3748" }}>Workout Preferences</h3>
      </div>

      {/* How It Works */}
      <div
        style={{
          backgroundColor: "#e6fffa",
          border: "1px solid #81e6d9",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0", color: "#234e52" }}>
          How Workout Preferences Work
        </h4>
        <p style={{ margin: "0", fontSize: "14px", color: "#234e52" }}>
          Your workout preferences are learned when you use the{" "}
          <strong>Quick Workout</strong> feature. When you like () or dislike ()
          a workout, the system remembers your preferences:
        </p>
        <ul
          style={{
            margin: "0.5rem 0 0 1rem",
            fontSize: "14px",
            color: "#234e52",
          }}
        >
          <li>
            <strong>Liked workouts</strong> will appear more often in your
            recommendations
          </li>
          <li>
            <strong>Disliked workouts</strong> will be excluded from future
            suggestions
          </li>
          <li>The system gets smarter the more you use it!</li>
        </ul>
      </div>

      {/* Workout Preferences Summary */}
      <div style={cardStyle}>
        <h4 style={{ marginBottom: "1rem", color: "#2d3748" }}>
          Your Workout Preferences
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          {/* Liked Workouts */}
          <div>
            <h5
              style={{
                color: "#22543d",
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Liked Workouts ({preferences.liked?.length || 0})
            </h5>
            {preferences.liked?.length > 0 ? (
              <ul style={listStyle}>
                {preferences.liked.map((workout, index) => (
                  <li key={index} style={itemStyle}>
                    <span style={{ fontWeight: "500" }}>{workout}</span>
                    <span style={badgeStyle("liked")}>Liked</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                style={{
                  backgroundColor: "white",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "0.5rem" }}></div>
                <p
                  style={{ color: "#718096", fontStyle: "italic", margin: "0" }}
                >
                  No liked workouts yet
                </p>
                <p
                  style={{
                    color: "#4a5568",
                    fontSize: "14px",
                    margin: "0.5rem 0 0 0",
                  }}
                >
                  Try the Quick Workout feature and like workouts you enjoy!
                </p>
              </div>
            )}
          </div>

          {/* Disliked Workouts */}
          <div>
            <h5
              style={{
                color: "#c53030",
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Disliked Workouts ({preferences.disliked?.length || 0})
            </h5>
            {preferences.disliked?.length > 0 ? (
              <ul style={listStyle}>
                {preferences.disliked.map((workout, index) => (
                  <li key={index} style={itemStyle}>
                    <span style={{ fontWeight: "500" }}>{workout}</span>
                    <span style={badgeStyle("disliked")}>❌ Disliked</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                style={{
                  backgroundColor: "white",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "0.5rem" }}></div>
                <p
                  style={{ color: "#718096", fontStyle: "italic", margin: "0" }}
                >
                  No disliked workouts yet
                </p>
                <p
                  style={{
                    color: "#4a5568",
                    fontSize: "14px",
                    margin: "0.5rem 0 0 0",
                  }}
                >
                  Good! You haven't found any workouts you don't like.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          backgroundColor: "#edf2f7",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #cbd5e0",
        }}
      >
        <p style={{ margin: "0", fontSize: "14px", color: "#4a5568" }}>
          <strong> Want to set workout preferences?</strong>
          <br />
          Go to <strong>Fitness → Quick Workout</strong> and use the like () and
          dislike () buttons on workout suggestions. Your preferences will
          automatically appear here!
        </p>
      </div>
    </div>
  );
}

// NEW: Custom Workouts Tab Component
function CustomWorkoutsTab({
  customWorkouts,
  onStartWorkout,
  onDeleteWorkout,
  onRefresh,
}) {
  const cardStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  const createWorkoutButtonStyle = {
    padding: "12px 24px",
    backgroundColor: "#9f7aea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    display: "inline-block",
    transition: "background-color 0.2s",
  };

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
        <h3 style={{ margin: "0", color: "#2d3748" }}>
          Custom Workouts ({customWorkouts.length})
        </h3>
        <a
          href="/fitness"
          style={createWorkoutButtonStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#805ad5")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#9f7aea")}
        >
          Create New Workout
        </a>
      </div>

      {/* Instructions */}
      <div
        style={{
          backgroundColor: "#f0fff4",
          border: "1px solid #9ae6b4",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0", color: "#22543d" }}>
          About Custom Workouts
        </h4>
        <p style={{ margin: "0", fontSize: "14px", color: "#22543d" }}>
          Custom workouts are workouts you've created using the workout builder.
          You can start them directly from here, or manage them. To create new
          custom workouts, go to <strong>Fitness → Workouts</strong> and click
          "Create Custom Workout".
        </p>
      </div>

      {/* Custom Workouts List */}
      {customWorkouts.length === 0 ? (
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "48px", marginBottom: "1rem" }}></div>
            <h4 style={{ color: "#4a5568", margin: "0 0 1rem 0" }}>
              No Custom Workouts Yet
            </h4>
            <p style={{ color: "#718096", marginBottom: "1.5rem" }}>
              Create your first custom workout to have complete control over
              your fitness routine. You can add specific exercises, set reps and
              sets, and save it for later use.
            </p>
            <a
              href="/fitness"
              style={createWorkoutButtonStyle}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#805ad5")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#9f7aea")}
            >
              Create Your First Custom Workout
            </a>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {customWorkouts.map((workout) => (
            <div key={workout.id} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0",
                        color: "#2d3748",
                        fontSize: "20px",
                      }}
                    >
                      {workout.name}
                    </h4>
                    <span
                      style={{
                        backgroundColor: "#9f7aea",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      CUSTOM
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(100px, 1fr))",
                      gap: "1rem",
                      marginBottom: "1rem",
                      maxWidth: "400px",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          color: "#4299e1",
                        }}
                      >
                        {workout.workout_data.duration}
                      </div>
                      <div style={{ fontSize: "12px", color: "#718096" }}>
                        minutes
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          color: "#ed8936",
                        }}
                      >
                        {workout.workout_data.calories_burned}
                      </div>
                      <div style={{ fontSize: "12px", color: "#718096" }}>
                        calories
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          color: "#9f7aea",
                        }}
                      >
                        {workout.workout_data.exercises?.length || 0}
                      </div>
                      <div style={{ fontSize: "12px", color: "#718096" }}>
                        exercises
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#4a5568",
                      marginBottom: "1rem",
                    }}
                  >
                    <strong>Type:</strong>{" "}
                    {workout.workout_data.type || "Custom"} •
                    <strong> Created:</strong>{" "}
                    {new Date(workout.created_at).toLocaleDateString()} •
                    <strong> Intensity:</strong>{" "}
                    {workout.workout_data.intensity || "Moderate"}
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}
                >
                  <button
                    onClick={() => onStartWorkout(workout)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#48bb78",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Start
                  </button>
                  <button
                    onClick={() => onDeleteWorkout(workout.id, workout.name)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#e53e3e",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Exercise Preview */}
              {workout.workout_data.exercises &&
                workout.workout_data.exercises.length > 0 && (
                  <div
                    style={{
                      backgroundColor: "#f7fafc",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <h5 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
                      Exercises ({workout.workout_data.exercises.length}):
                    </h5>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                      {workout.workout_data.exercises
                        .slice(0, 4)
                        .map((exercise, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "14px",
                              padding: "0.5rem",
                              backgroundColor: "white",
                              borderRadius: "4px",
                            }}
                          >
                            <span
                              style={{ color: "#2d3748", fontWeight: "500" }}
                            >
                              {exercise.name}
                            </span>
                            <span style={{ color: "#718096" }}>
                              {exercise.sets && exercise.reps && (
                                <span>
                                  {exercise.sets} × {exercise.reps}
                                </span>
                              )}
                              {exercise.weight && (
                                <span> • {exercise.weight}</span>
                              )}
                            </span>
                          </div>
                        ))}
                      {workout.workout_data.exercises.length > 4 && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#718096",
                            fontStyle: "italic",
                            textAlign: "center",
                            padding: "0.5rem",
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Custom Workout Modal Component
function CustomWorkoutModal({ workout, onClose, onComplete }) {
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [actualDuration, setActualDuration] = useState(
    workout.workout_data.duration
  );
  const [isCompleting, setIsCompleting] = useState(false);

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  };

  const modalStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "700px",
    width: "90%",
    maxHeight: "85vh",
    overflowY: "auto",
    position: "relative",
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const workoutData = {
        name: workout.workout_data.name || workout.name,
        type: workout.workout_data.type || "strength",
        duration: actualDuration,
        intensity: workout.workout_data.intensity || "moderate",
        notes: workoutNotes,
        exercises: workout.workout_data.exercises || [],
        date_completed: new Date().toISOString().split("T")[0],
      };

      const success = await onComplete(workoutData);
      if (!success) {
        alert("Failed to complete workout. Please try again.");
      }
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#718096",
          }}
        >
          ×
        </button>

        <h2 style={{ margin: "0 0 1.5rem 0", color: "#2d3748" }}>
          Complete Workout: {workout.workout_data.name || workout.name}
        </h2>

        {/* Workout Overview */}
        <div
          style={{
            backgroundColor: "#f7fafc",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#4299e1",
                }}
              >
                {workout.workout_data.duration}
              </div>
              <div style={{ fontSize: "12px", color: "#718096" }}>
                planned minutes
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#ed8936",
                }}
              >
                {workout.workout_data.calories_burned}
              </div>
              <div style={{ fontSize: "12px", color: "#718096" }}>
                estimated calories
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#9f7aea",
                }}
              >
                {workout.workout_data.exercises?.length || 0}
              </div>
              <div style={{ fontSize: "12px", color: "#718096" }}>
                exercises
              </div>
            </div>
          </div>

          <div style={{ fontSize: "14px", color: "#4a5568" }}>
            <strong>Type:</strong> {workout.workout_data.type || "Custom"} •
            <strong> Intensity:</strong>{" "}
            {workout.workout_data.intensity || "Moderate"}
          </div>
        </div>

        {/* Exercise List */}
        {workout.workout_data.exercises &&
          workout.workout_data.exercises.length > 0 && (
            <div
              style={{
                backgroundColor: "#f7fafc",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
                Exercises to Complete:
              </h3>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {workout.workout_data.exercises.map((exercise, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem",
                      backgroundColor: "white",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "#2d3748",
                          fontSize: "14px",
                        }}
                      >
                        {exercise.name}
                      </div>
                      {exercise.sets && exercise.reps && (
                        <div style={{ fontSize: "12px", color: "#718096" }}>
                          {exercise.sets} sets × {exercise.reps} reps
                        </div>
                      )}
                      {exercise.weight && (
                        <div style={{ fontSize: "12px", color: "#4a5568" }}>
                          Weight: {exercise.weight}
                        </div>
                      )}
                    </div>
                    {exercise.rest && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#4a5568",
                          backgroundColor: "#e2e8f0",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        Rest: {exercise.rest}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Completion Form */}
        <div style={{ marginBottom: "1.5rem" }}>
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
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Actual Duration (minutes)
              </label>
              <input
                type="number"
                value={actualDuration}
                onChange={(e) => setActualDuration(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                }}
                min="1"
                max="180"
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Estimated Calories Burned
              </label>
              <input
                type="text"
                value={Math.round(
                  (actualDuration / workout.workout_data.duration) *
                    workout.workout_data.calories_burned
                )}
                disabled
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  backgroundColor: "#f7fafc",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
              }}
            >
              Workout Notes (optional)
            </label>
            <textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="How did the workout feel? Any modifications made?"
              style={{
                width: "100%",
                height: "80px",
                padding: "8px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                resize: "vertical",
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
        >
          <button
            onClick={onClose}
            disabled={isCompleting}
            style={{
              padding: "12px 24px",
              backgroundColor: "#e2e8f0",
              color: "#4a5568",
              border: "none",
              borderRadius: "8px",
              cursor: isCompleting ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            style={{
              padding: "12px 24px",
              backgroundColor: isCompleting ? "#a0aec0" : "#48bb78",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isCompleting ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {isCompleting ? "Completing..." : "Complete Workout"}
          </button>
        </div>

        {/* Workout Tips */}
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            backgroundColor: "#edf2f7",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#4a5568",
          }}
        >
          <strong>💡 Custom Workout Tips:</strong>
          <ul style={{ margin: "0.5rem 0 0 1rem", paddingLeft: "1rem" }}>
            <li>
              Follow the planned sets and reps, but adjust weight as needed
            </li>
            <li>Take adequate rest between sets as specified</li>
            <li>Focus on proper form over heavy weights</li>
            <li>
              Modify exercises if needed to match your current fitness level
            </li>
            <li>Stay hydrated and listen to your body</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
