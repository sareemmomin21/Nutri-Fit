import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import QuestionsPage from "./pages/QuestionsPage";
import NutritionPage from "./pages/NutritionPage";
import FitnessPage from "./pages/FitnessPage";
import SettingsPage from "./pages/SettingsPage";
import Navbar from "./components/Navbar";

// Protected Route Component
function ProtectedRoute({ children }) {
  const userId = localStorage.getItem("nutrifit_user_id");

  if (!userId) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

// Navigation Guard Component
function NavigationGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("nutrifit_user_id");
    if (userId) {
      // Optionally verify the user ID with the backend
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e2e8f0",
              borderTop: "4px solid #48bb78",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem auto",
            }}
          ></div>
          <div style={{ color: "#718096", fontSize: "16px" }}>
            Loading NutriFit...
          </div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <Router>
      <NavigationGuard>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected routes */}
            <Route
              path="/questions"
              element={
                <ProtectedRoute>
                  <QuestionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nutrition"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <NutritionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fitness"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <FitnessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </NavigationGuard>
    </Router>
  );
}

export default App;
