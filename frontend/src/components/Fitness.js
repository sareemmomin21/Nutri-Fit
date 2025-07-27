import React, { useState, useEffect } from "react";
import FitnessDashboard from "./fitness/FitnessDashboard";
import QuickWorkout from "./fitness/QuickWorkout";
import WorkoutHistory from "./fitness/WorkoutHistory";
import WorkoutsTab from "./fitness/WorkoutsTab";
import { FitnessGoalsTab, WorkoutPlanTab } from "./fitness/WorkoutTabs";

// Main Fitness Component (Updated with separated components)
export default function Fitness() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [workoutRecommendations, setWorkoutRecommendations] = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [fitnessGoals, setFitnessGoals] = useState([]);
  const [recoveryInfo, setRecoveryInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    dashboard: false,
    recommendations: false,
    plan: false,
    history: false,
    goals: false,
  });

  const userId = localStorage.getItem("nutrifit_user_id");

  // In your main Fitness component useEffect
  useEffect(() => {
    if (userId) {
      fetchDashboardData();
      fetchWorkoutRecommendations();
      fetchWorkoutPlan();
      fetchWorkoutHistory();
      fetchFitnessGoals();
      fetchRecoveryInfo();
    }

    // Enhanced event listeners for better integration
    const handleWorkoutCompleted = (event) => {
      console.log("Workout completed event:", event.detail);
      fetchDashboardData();
      fetchWorkoutHistory();
      fetchRecoveryInfo();
    };

    const handleDashboardRefresh = () => {
      console.log("Dashboard refresh requested");
      fetchDashboardData();
    };

    const handleFitnessDataUpdate = (event) => {
      console.log("Fitness data update:", event.detail);
      // Refresh all fitness data when historical workouts are added
      fetchDashboardData();
      fetchWorkoutHistory();
      fetchRecoveryInfo();
      fetchFitnessGoals(); // Goals might be affected by new workouts
    };

    // Add all event listeners
    window.addEventListener("workoutCompleted", handleWorkoutCompleted);
    window.addEventListener("dashboardRefresh", handleDashboardRefresh);
    window.addEventListener("fitnessDataUpdate", handleFitnessDataUpdate);

    return () => {
      window.removeEventListener("workoutCompleted", handleWorkoutCompleted);
      window.removeEventListener("dashboardRefresh", handleDashboardRefresh);
      window.removeEventListener("fitnessDataUpdate", handleFitnessDataUpdate);
    };
  }, [userId]);

  const setLoadingState = (key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  const fetchDashboardData = async () => {
    try {
      setLoadingState("dashboard", true);
      const response = await fetch(
        "http://127.0.0.1:5000/api/get_fitness_dashboard",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingState("dashboard", false);
      setIsLoading(false);
    }
  };

  const fetchWorkoutRecommendations = async () => {
    try {
      setLoadingState("recommendations", true);
      const response = await fetch(
        "http://127.0.0.1:5000/api/get_workout_recommendations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkoutRecommendations(data);
      }
    } catch (error) {
      console.error("Error fetching workout recommendations:", error);
    } finally {
      setLoadingState("recommendations", false);
    }
  };

  const fetchWorkoutPlan = async () => {
    try {
      setLoadingState("plan", true);
      const response = await fetch(
        "http://127.0.0.1:5000/api/get_workout_plan",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkoutPlan(data);
      }
    } catch (error) {
      console.error("Error fetching workout plan:", error);
    } finally {
      setLoadingState("plan", false);
    }
  };

  const fetchWorkoutHistory = async () => {
    try {
      setLoadingState("history", true);
      const response = await fetch(
        "http://127.0.0.1:5000/api/get_workout_history",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, days_back: 30 }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkoutHistory(data);
      }
    } catch (error) {
      console.error("Error fetching workout history:", error);
    } finally {
      setLoadingState("history", false);
    }
  };

  const fetchFitnessGoals = async () => {
    try {
      setLoadingState("goals", true);
      const response = await fetch(
        "http://127.0.0.1:5000/api/get_fitness_goals",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFitnessGoals(data);
      }
    } catch (error) {
      console.error("Error fetching fitness goals:", error);
    } finally {
      setLoadingState("goals", false);
    }
  };

  const fetchRecoveryInfo = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/get_recovery_recommendations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecoveryInfo(data);
      }
    } catch (error) {
      console.error("Error fetching recovery info:", error);
    }
  };

  const completeWorkout = async (workoutData) => {
    try {
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
        // Refresh data after completing workout
        fetchDashboardData();
        fetchWorkoutHistory();
        fetchRecoveryInfo();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error completing workout:", error);
      return false;
    }
  };

  const addFitnessGoal = async (goalData) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/add_fitness_goal",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            ...goalData,
          }),
        }
      );

      if (response.ok) {
        fetchFitnessGoals();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding fitness goal:", error);
      return false;
    }
  };

  // Styles
  const containerStyle = {
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
    maxWidth: "1400px",
    margin: "0 auto",
    backgroundColor: "#f7fafc",
    minHeight: "100vh",
  };

  const headerStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "2rem",
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
        margin: "0 auto",
      }}
    />
  );

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <LoadingSpinner size="40px" />
          <div style={{ marginTop: "1rem", color: "#718096" }}>
            Loading your fitness dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
          Fitness Dashboard
        </h1>
        <p style={{ margin: "0", color: "#718096" }}>
          Track your workouts, monitor progress, and achieve your fitness goals
        </p>
      </div>

      {/* Recovery Alert */}
      {recoveryInfo && recoveryInfo.rest_needed && (
        <div
          style={{
            backgroundColor: "#fed7d7",
            border: "1px solid #e53e3e",
            color: "#c53030",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          <strong>Recovery Recommendation:</strong> {recoveryInfo.message}
          <br />
          <small>{recoveryInfo.recommendation}</small>
        </div>
      )}

      {/* Tab Navigation */}
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
            onClick={() => setActiveTab("dashboard")}
            style={tabStyle(activeTab === "dashboard")}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("quick")}
            style={tabStyle(activeTab === "quick")}
          >
            Quick Workout
          </button>
          <button
            onClick={() => setActiveTab("workouts")}
            style={tabStyle(activeTab === "workouts")}
          >
            Workouts
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            style={tabStyle(activeTab === "plan")}
          >
            My Plan
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            style={tabStyle(activeTab === "goals")}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={tabStyle(activeTab === "history")}
          >
            History
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
        {activeTab === "dashboard" && (
          <FitnessDashboard
            data={dashboardData}
            isLoading={loadingStates.dashboard}
          />
        )}

        {activeTab === "quick" && <QuickWorkout userId={userId} />}

        {activeTab === "workouts" && (
          <WorkoutsTab
            recommendations={workoutRecommendations}
            isLoading={loadingStates.recommendations}
            onCompleteWorkout={completeWorkout}
            userId={userId}
          />
        )}

        {activeTab === "plan" && (
          <WorkoutPlanTab
            plan={workoutPlan}
            isLoading={loadingStates.plan}
            onCompleteWorkout={completeWorkout}
            userId={userId}
          />
        )}

        {activeTab === "goals" && (
          <FitnessGoalsTab
            goals={fitnessGoals}
            isLoading={loadingStates.goals}
            onAddGoal={addFitnessGoal}
            userId={userId}
          />
        )}

        {activeTab === "history" && <WorkoutHistory userId={userId} />}
      </div>

      {/* Add CSS for spinning animation */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
