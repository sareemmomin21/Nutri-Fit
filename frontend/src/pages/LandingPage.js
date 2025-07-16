import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const userId = localStorage.getItem("nutrifit_user_id");
    if (userId) {
      navigate("/nutrition");
    }
  }, [navigate]);

  const handleGetStarted = () => {
    navigate("/auth");
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        🥗 NutriFit
      </h1>

      <p
        style={{
          fontSize: "1.2rem",
          color: "#4a5568",
          maxWidth: "600px",
          marginBottom: "2rem",
          lineHeight: "1.6",
        }}
      >
        Your personalized nutrition and fitness companion. Track your meals,
        achieve your goals, and transform your lifestyle with AI-powered
        recommendations.
      </p>

      {/* Feature highlights */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2rem",
          maxWidth: "800px",
          marginBottom: "3rem",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎯</div>
          <h3 style={{ color: "#2d3748", marginBottom: "0.5rem" }}>
            Personalized Goals
          </h3>
          <p style={{ color: "#718096", fontSize: "14px", lineHeight: "1.4" }}>
            Set and track custom nutrition and fitness goals tailored to your
            lifestyle
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🤖</div>
          <h3 style={{ color: "#2d3748", marginBottom: "0.5rem" }}>
            Smart Suggestions
          </h3>
          <p style={{ color: "#718096", fontSize: "14px", lineHeight: "1.4" }}>
            AI-powered meal recommendations based on your preferences and
            nutritional needs
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📊</div>
          <h3 style={{ color: "#2d3748", marginBottom: "0.5rem" }}>
            Progress Tracking
          </h3>
          <p style={{ color: "#718096", fontSize: "14px", lineHeight: "1.4" }}>
            Monitor your daily nutrition intake and fitness progress with
            detailed analytics
          </p>
        </div>
      </div>

      <button
        onClick={handleGetStarted}
        style={{
          backgroundColor: "#48bb78",
          color: "#fff",
          padding: "1rem 2.5rem",
          fontSize: "1.1rem",
          fontWeight: "bold",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(72, 187, 120, 0.3)",
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "#38a169";
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 16px rgba(72, 187, 120, 0.4)";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "#48bb78";
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 12px rgba(72, 187, 120, 0.3)";
        }}
      >
        Get Started Free
      </button>

      <p
        style={{
          fontSize: "0.9rem",
          color: "#a0aec0",
          marginTop: "2rem",
        }}
      >
        Join thousands of users achieving their health goals with NutriFit
      </p>

      {/* Call to action for existing users */}
      <div
        style={{
          marginTop: "3rem",
          padding: "1.5rem",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <p
          style={{
            margin: "0 0 1rem 0",
            color: "#4a5568",
            fontSize: "16px",
          }}
        >
          Already have an account?
        </p>
        <button
          onClick={() => navigate("/auth")}
          style={{
            backgroundColor: "transparent",
            color: "#48bb78",
            padding: "0.75rem 1.5rem",
            fontSize: "16px",
            fontWeight: "bold",
            border: "2px solid #48bb78",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#48bb78";
            e.target.style.color = "white";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#48bb78";
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
