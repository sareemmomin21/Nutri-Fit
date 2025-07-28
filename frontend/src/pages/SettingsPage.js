// SettingsPage.js - Main Settings Component
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileTab from "../components/settings/ProfileTab";
import GoalsTab from "../components/settings/GoalsTab";
import FoodPreferencesTab from "../components/settings/FoodPreferencesTab";
import WorkoutPreferencesTab from "../components/settings/WorkoutPreferencesTab";
import CustomWorkoutsTab from "../components/settings/CustomWorkoutsTab";
import CustomWorkoutModal from "../components/fitness/CustomWorkoutModal";
import { settingsAPI } from "../utils/settingsAPI";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [foodPreferences, setFoodPreferences] = useState({
    overall_preferences: { liked: [], disliked: [] },
    meal_preferences: {},
  });
  const [workoutPreferences, setWorkoutPreferences] = useState({
    liked: [],
    disliked: [],
  });
  const [customWorkouts, setCustomWorkouts] = useState([]);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
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
      console.log("Fetching user data for:", userId);

      // Use the API utility to fetch all data
      const results = await settingsAPI.fetchAllUserData(userId);

      setProfile(results.profile);
      setFoodPreferences(results.foodPreferences);
      setWorkoutPreferences(results.workoutPreferences);
      setCustomWorkouts(results.customWorkouts);

      if (!results.profile) {
        setMessage({ type: "error", text: "Failed to load profile data" });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setMessage({
        type: "error",
        text: "Failed to load user data. Please try refreshing the page.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      setIsSaving(true);
      const success = await settingsAPI.updateProfile(userId, updatedData);

      if (success) {
        setProfile((prev) => ({ ...prev, ...updatedData }));
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to update profile" });
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
      const success = await settingsAPI.completeWorkout(userId, workoutData);

      if (success) {
        setShowWorkoutModal(false);
        setSelectedWorkout(null);
        setMessage({
          type: "success",
          text: `Workout "${workoutData.name}" completed successfully!`,
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        return true;
      } else {
        console.error("Failed to complete workout");
        setMessage({
          type: "error",
          text: "Failed to complete workout. Please try again.",
        });
        return false;
      }
    } catch (error) {
      console.error("Error completing workout:", error);
      setMessage({
        type: "error",
        text: "Error completing workout. Please try again.",
      });
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
      const success = await settingsAPI.deleteCustomWorkout(userId, workoutId);

      if (success) {
        setCustomWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
        setMessage({
          type: "success",
          text: `Custom workout "${workoutName}" deleted successfully!`,
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to delete custom workout" });
      }
    } catch (error) {
      console.error("Error deleting custom workout:", error);
      setMessage({ type: "error", text: "Failed to delete custom workout" });
    }
  };

  const handleStartWorkout = (workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutModal(true);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("nutrifit_user_id");
      navigate("/auth");
    }
  };

  const clearMessage = () => {
    setMessage({ type: "", text: "" });
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{message.text}</span>
          <button
            onClick={clearMessage}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "16px",
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

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
            onStartWorkout={handleStartWorkout}
            onDeleteWorkout={handleDeleteCustomWorkout}
            onRefresh={fetchUserData}
          />
        )}
      </div>

      {/* Workout Modal */}
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

// Settings Tabs Component
function SettingsTabs({ activeTab, setActiveTab }) {
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

  return (
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
  );
}
