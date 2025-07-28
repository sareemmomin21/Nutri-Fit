// utils/settingsAPI.js - API utilities for settings
const API_BASE = "http://127.0.0.1:5000/api";

export const settingsAPI = {
  // Fetch all user data with proper error handling
  async fetchAllUserData(userId) {
    const results = {
      profile: null,
      foodPreferences: {
        overall_preferences: { liked: [], disliked: [] },
        meal_preferences: {},
      },
      workoutPreferences: { liked: [], disliked: [] },
      customWorkouts: [],
    };

    // Fetch profile
    try {
      const profileResponse = await fetch(`${API_BASE}/get_profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (profileResponse.ok) {
        results.profile = await profileResponse.json();
        console.log("Profile data received:", results.profile);
      } else {
        console.error("Profile fetch failed:", profileResponse.status);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }

    // Fetch food preferences
    try {
      const prefsResponse = await fetch(`${API_BASE}/get_food_preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        console.log("Food preferences received:", prefsData);

        results.foodPreferences = {
          overall_preferences: {
            liked: prefsData.overall_preferences?.liked || [],
            disliked: prefsData.overall_preferences?.disliked || [],
          },
          meal_preferences: prefsData.meal_preferences || {},
        };
      } else {
        console.warn("Food preferences fetch failed, using defaults");
      }
    } catch (error) {
      console.error("Error fetching food preferences:", error);
    }

    // Fetch workout preferences
    try {
      const workoutPrefsResponse = await fetch(
        `${API_BASE}/get_workout_preferences`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (workoutPrefsResponse.ok) {
        const workoutPrefsData = await workoutPrefsResponse.json();
        console.log("Workout preferences received:", workoutPrefsData);

        results.workoutPreferences = {
          liked: workoutPrefsData.liked || [],
          disliked: workoutPrefsData.disliked || [],
        };
      } else {
        console.warn("Workout preferences fetch failed, using defaults");
      }
    } catch (error) {
      console.error("Error fetching workout preferences:", error);
    }

    // Fetch custom workouts
    try {
      const customWorkoutsResponse = await fetch(
        `${API_BASE}/get_user_custom_workouts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (customWorkoutsResponse.ok) {
        results.customWorkouts = await customWorkoutsResponse.json();
        console.log("Custom workouts received:", results.customWorkouts);
      } else {
        console.warn("Custom workouts fetch failed, using defaults");
      }
    } catch (error) {
      console.error("Error fetching custom workouts:", error);
    }

    return results;
  },

  // Update user profile
  async updateProfile(userId, updatedData) {
    try {
      const response = await fetch(`${API_BASE}/update_profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, ...updatedData }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  },

  // Complete a workout
  async completeWorkout(userId, workoutData) {
    try {
      const response = await fetch(`${API_BASE}/complete_workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          workout_data: workoutData,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error completing workout:", error);
      return false;
    }
  },

  // Delete custom workout
  async deleteCustomWorkout(userId, workoutId) {
    try {
      const response = await fetch(`${API_BASE}/delete_custom_workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          workout_id: workoutId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error deleting custom workout:", error);
      return false;
    }
  },

  // Remove workout preference
  async removeWorkoutPreference(userId, workoutName) {
    try {
      const response = await fetch(`${API_BASE}/remove_workout_preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          workout_name: workoutName,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error removing workout preference:", error);
      return false;
    }
  },
};
