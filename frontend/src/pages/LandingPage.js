import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/questions"); // Navigate to the questions page
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "4rem 2rem",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          color: "#2d3748",
          marginBottom: "1rem",
        }}
      >
        Welcome to Nutri-Fit 🥗
      </h1>

      <p
        style={{
          fontSize: "1.2rem",
          color: "#4a5568",
          maxWidth: "600px",
          marginBottom: "2rem",
        }}
      >
        Your personalized nutrition assistant. Track your meals, hit your goals, and live healthier, all in one simple app.
      </p>

      <button
        onClick={handleGetStarted}
        style={{
          backgroundColor: "#48bb78",
          color: "#fff",
          padding: "0.9rem 2rem",
          fontSize: "1rem",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#38a169")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#48bb78")}
      >
        Get Started
      </button>

      <p
        style={{
          fontSize: "0.9rem",
          color: "#a0aec0",
          marginTop: "2rem",
        }}
      >
        Already have an account? Login on the next page.
      </p>
    </div>
  );
}
