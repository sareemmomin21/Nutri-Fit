import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("nutrifit_user_id");

  const handleLandingClick = (e) => {
    e.preventDefault();
    if (userId) {
      // If user is logged in, go to home page instead of landing
      navigate("/home");
    } else {
      // If not logged in, go to landing page
      navigate("/");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nutrifit_user_id");
    navigate("/");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #ddd",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {/* Logo/Brand */}
        <div style={{ fontWeight: "bold", fontSize: "20px", color: "#48bb78" }}>
          NutriFit
        </div>

        {/* Navigation Links */}
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <a href="/" onClick={handleLandingClick} style={navLinkStyle}>
            {userId ? "Home" : "Get Started"}
          </a>

          {userId && (
            <>
              <Link to="/nutrition" style={navLinkStyle}>
                Nutrition
              </Link>
              <Link to="/fitness" style={navLinkStyle}>
                Fitness
              </Link>
              <Link to="/vitals" style={navLinkStyle}>
                Vitals
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {userId ? (
          <>
            <Link
              to="/settings"
              style={{ ...navLinkStyle, fontWeight: "bold" }}
            >
              Settings
            </Link>
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
                fontWeight: "bold",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#c53030")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#e53e3e")}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            style={{
              ...navLinkStyle,
              backgroundColor: "#48bb78",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#38a169")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#48bb78")}
          >
            Login / Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
}

const navLinkStyle = {
  textDecoration: "none",
  color: "#333",
  fontSize: "16px",
  padding: "4px 8px",
  borderRadius: "4px",
  transition: "background-color 0.2s",
};
