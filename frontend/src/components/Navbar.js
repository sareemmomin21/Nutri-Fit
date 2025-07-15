import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "Arial" }}>
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #ddd",
        }}
      >
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link to="/" style={navLinkStyle}>
            Landing
          </Link>
          <Link to="/nutrition" style={navLinkStyle}>
            Nutrition
          </Link>
          <Link to="/fitness" style={navLinkStyle}>
            Fitness
          </Link>
        </div>

        <div>
          <Link to="/settings" style={{ ...navLinkStyle, fontWeight: "bold" }}>
            Settings
          </Link>
        </div>
      </nav>
    </div>
  );
}

const navLinkStyle = {
  textDecoration: "none",
  color: "#333",
  fontSize: "16px",
};
