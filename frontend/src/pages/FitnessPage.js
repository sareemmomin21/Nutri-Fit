import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Fitness from "../components/Fitness";

export default function FitnessPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const userId = localStorage.getItem("nutrifit_user_id");

  useEffect(() => {
    if (!userId) {
      navigate("/auth");
      return;
    }

    // Small delay to ensure smooth transition
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [userId, navigate]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
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
            Loading your fitness dashboard...
          </div>
        </div>
      </div>
    );
  }

  return <Fitness />;
}
