import React, { useState, useEffect } from "react";
import {
  toggleDarkMode,
  toggleHighContrast,
  toggleFontSize,
  getCurrentTheme,
} from "../../utils/themeUtils";

import { FaMoon, FaSun } from "react-icons/fa";
import { GiNewspaper } from "react-icons/gi";
import { MdOutlineWbSunny } from "react-icons/md";
import { TbDisabled } from "react-icons/tb";

export default function AccessibilityTab() {
  const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());

  // Update theme state when it changes
  useEffect(() => {
    const updateTheme = () => {
      setCurrentTheme(getCurrentTheme());
    };

    // Listen for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    setCurrentTheme(getCurrentTheme());
  };

  const handleToggleHighContrast = () => {
    toggleHighContrast();
    setCurrentTheme(getCurrentTheme());
  };

  const handleToggleFontSize = () => {
    toggleFontSize();
    setCurrentTheme(getCurrentTheme());
  };

  const getCurrentThemeDisplay = () => {
    return currentTheme.isDark ? "Dark" : "Light";
  };

  const getCurrentContrast = () => {
    return currentTheme.isHighContrast ? "High" : "Normal";
  };

  const getCurrentFontSize = () => {
    return currentTheme.isLargeFont ? "Large" : "Normal";
  };

  const buttonBaseStyle = {
    padding: "14px 28px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "50px",
    position: "relative",
    overflow: "hidden",
  };

  const statusBadgeStyle = {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    marginBottom: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h2
          style={{
            color: "#1a202c",
            marginBottom: "8px",
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          Accessibility & Display
        </h2>
        <p
          style={{
            color: "#718096",
            fontSize: "16px",
            margin: "0",
            lineHeight: "1.5",
          }}
        >
          Customize your experience for better accessibility and comfort
        </p>
      </div>

      {/* Theme Settings Card */}
      <div style={cardStyle}>
        <div style={{ marginBottom: "20px" }}>
          <h3
            style={{
              color: "#2d3748",
              marginBottom: "8px",
              fontSize: "20px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Theme Settings
          </h3>
          <p
            style={{
              color: "#718096",
              fontSize: "14px",
              margin: "0",
            }}
          >
            Switch between light and dark modes
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <button
            onClick={handleToggleDarkMode}
            style={{
              ...buttonBaseStyle,
              backgroundColor: currentTheme.isDark ? "#4c51bf" : "#667eea",
              color: "white",
              flex: "1",
              minWidth: "200px",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            <span>{currentTheme.isDark ? <FaSun /> : <FaMoon />}</span>
            {currentTheme.isDark
              ? "Switch to Light Mode"
              : "Switch to Dark Mode"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                color: "#718096",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Current:
            </span>
            <span
              style={{
                ...statusBadgeStyle,
                backgroundColor: currentTheme.isDark ? "#553c9a" : "#667eea",
                color: "white",
              }}
            >
              {getCurrentThemeDisplay()} Mode
            </span>
          </div>
        </div>
      </div>

      {/* Accessibility Options Card */}
      <div style={cardStyle}>
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              color: "#2d3748",
              marginBottom: "8px",
              fontSize: "20px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <TbDisabled /> Accessibility Options
          </h3>
          <p
            style={{
              color: "#718096",
              fontSize: "14px",
              margin: "0",
            }}
          >
            Enhance visibility and readability
          </p>
        </div>

        {/* High Contrast */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <button
            onClick={handleToggleHighContrast}
            style={{
              ...buttonBaseStyle,
              backgroundColor: currentTheme.isHighContrast
                ? "#2b6cb0"
                : "#4299e1",
              color: "white",
              flex: "1",
              minWidth: "200px",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            <span>
              <MdOutlineWbSunny />
            </span>
            {currentTheme.isHighContrast
              ? "Disable High Contrast"
              : "Enable High Contrast"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                color: "#718096",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Current:
            </span>
            <span
              style={{
                ...statusBadgeStyle,
                backgroundColor: currentTheme.isHighContrast
                  ? "#2b6cb0"
                  : "#e2e8f0",
                color: currentTheme.isHighContrast ? "white" : "#718096",
              }}
            >
              {getCurrentContrast()} Contrast
            </span>
          </div>
        </div>

        {/* Large Font */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <button
            onClick={handleToggleFontSize}
            style={{
              ...buttonBaseStyle,
              backgroundColor: currentTheme.isLargeFont ? "#c05621" : "#ed8936",
              color: "white",
              flex: "1",
              minWidth: "200px",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            <span>
              <GiNewspaper />
            </span>
            {currentTheme.isLargeFont ? "Use Normal Font" : "Use Large Font"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                color: "#718096",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Current:
            </span>
            <span
              style={{
                ...statusBadgeStyle,
                backgroundColor: currentTheme.isLargeFont
                  ? "#c05621"
                  : "#e2e8f0",
                color: currentTheme.isLargeFont ? "white" : "#718096",
              }}
            >
              {getCurrentFontSize()} Font
            </span>
          </div>
        </div>
      </div>

      {/* Information Card */}
      <div
        style={{
          ...cardStyle,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
        }}
      >
        <h4
          style={{
            color: "white",
            marginBottom: "16px",
            fontSize: "18px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          About These Settings
        </h4>
        <div
          style={{
            display: "grid",
            gap: "12px",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          {/* Dark Mode Card - Dark themed */}
          <div
            style={{
              background: "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #4a5568",
              color: "#e2e8f0",
            }}
          >
            <strong style={{ color: "#90cdf4" }}>Dark Mode:</strong> Reduces eye
            strain in low-light environments and provides a modern interface
            that's easier on the eyes during extended use.
          </div>

          {/* High Contrast Card - High contrast styled */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "12px",
              borderRadius: "8px",
              border: "3px solid #000000",
              color: "#000000",
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              fontWeight: "bold",
            }}
          >
            <strong style={{ color: "#000000" }}>High Contrast:</strong>{" "}
            Increases color differences and adds text shadows to improve
            readability for users with visual impairments or in bright
            environments.
          </div>

          {/* Large Font Card - Large font styled */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: "16px",
              borderRadius: "8px",
              backdropFilter: "blur(10px)",
              fontSize: "16px",
              lineHeight: "1.8",
            }}
          >
            <strong style={{ fontSize: "17px" }}>Large Font:</strong> Increases
            text size and improves spacing for better readability and
            accessibility compliance.
          </div>
        </div>

        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            padding: "16px",
            borderRadius: "12px",
            marginTop: "20px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <p
            style={{
              color: "white",
              fontSize: "14px",
              margin: "0",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Your preferences are automatically saved and will persist across all
            sessions and devices.
          </p>
        </div>
      </div>
    </div>
  );
}
