import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import NutritionPage from "./pages/NutritionPage";
import FitnessPage from "./pages/FitnessPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import QuestionsPage from "./pages/QuestionsPage"; // Add this import

// Protected Route Component
function ProtectedRoute({ children }) {
  const userId = localStorage.getItem("nutrifit_user_id");
  return userId ? children : <Navigate to="/auth" replace />;
}

// Public Route Component (redirect to home if logged in, but allow questions)
function PublicRoute({ children, allowQuestions = false }) {
  const userId = localStorage.getItem("nutrifit_user_id");

  // If it's the questions page, allow access regardless of auth status
  if (allowQuestions) {
    return children;
  }

  return userId ? <Navigate to="/home" replace /> : children;
}

function App() {
  return (
    <Router>
      <div style={{ fontFamily: "Arial, sans-serif" }}>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          {/* Questions Route - accessible to both logged in and non-logged in users */}
          <Route
            path="/questions"
            element={
              <PublicRoute allowQuestions={true}>
                <QuestionsPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nutrition"
            element={
              <ProtectedRoute>
                <NutritionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fitness"
            element={
              <ProtectedRoute>
                <FitnessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect based on auth status */}
          <Route
            path="*"
            element={
              localStorage.getItem("nutrifit_user_id") ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
