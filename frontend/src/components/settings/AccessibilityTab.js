import React, { useState, useEffect } from "react";
import { toggleDarkMode, toggleHighContrast, toggleFontSize, getCurrentTheme } from "../../utils/themeUtils";

export default function AccessibilityTab() {
  const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());

  // Update theme state when it changes
  useEffect(() => {
    const updateTheme = () => {
      setCurrentTheme(getCurrentTheme());
    };

    // Listen for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

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

  return (
    <div>
      <h2 style={{ color: "#2D3748", marginBottom: "1rem" }}>
        Accessibility & Theme Settings
      </h2>
      
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ color: "#4A5568", marginBottom: "1rem" }}>Theme Settings</h3>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
          <button
            onClick={handleToggleDarkMode}
            style={{
              padding: "12px 24px",
              backgroundColor: "#48BB78",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              marginRight: "15px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            {currentTheme.isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ 
              color: "#718096", 
              fontSize: "14px",
              marginRight: "8px"
            }}>
              Current:
            </span>
            <span style={{ 
              color: currentTheme.isDark ? "#10b981" : "#48BB78",
              fontSize: "14px",
              fontWeight: "600"
            }}>
              {getCurrentThemeDisplay()} Mode
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ color: "#4A5568", marginBottom: "1rem" }}>Accessibility Options</h3>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
          <button
            onClick={handleToggleHighContrast}
            style={{
              padding: "12px 24px",
              backgroundColor: "#4299E1",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              marginRight: "15px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            {currentTheme.isHighContrast ? "Disable High Contrast" : "Enable High Contrast"}
          </button>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ 
              color: "#718096", 
              fontSize: "14px",
              marginRight: "8px"
            }}>
              Current:
            </span>
            <span style={{ 
              color: currentTheme.isHighContrast ? "#3b82f6" : "#4299E1",
              fontSize: "14px",
              fontWeight: "600"
            }}>
              {getCurrentContrast()} Contrast
            </span>
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
          <button
            onClick={handleToggleFontSize}
            style={{
              padding: "12px 24px",
              backgroundColor: "#ED8936",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              marginRight: "15px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            {currentTheme.isLargeFont ? "Use Normal Font" : "Use Large Font"}
          </button>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ 
              color: "#718096", 
              fontSize: "14px",
              marginRight: "8px"
            }}>
              Current:
            </span>
            <span style={{ 
              color: currentTheme.isLargeFont ? "#f59e0b" : "#ED8936",
              fontSize: "14px",
              fontWeight: "600"
            }}>
              {getCurrentFontSize()} Font Size
            </span>
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: "#F7FAFC", 
        padding: "1.5rem", 
        borderRadius: "12px",
        border: "1px solid #E2E8F0",
        marginTop: "2rem"
      }}>
        <h4 style={{ color: "#2D3748", marginBottom: "1rem", fontSize: "18px" }}>About These Settings</h4>
        <ul style={{ color: "#4A5568", fontSize: "14px", margin: "0", paddingLeft: "1.5rem", lineHeight: "1.6" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: "#2D3748" }}>Dark Mode:</strong> Reduces eye strain in low-light environments and provides a modern, sleek interface
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: "#2D3748" }}>High Contrast:</strong> Improves readability for users with visual impairments by enhancing color differences
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: "#2D3748" }}>Large Font:</strong> Increases text size for better readability and accessibility
          </li>
        </ul>
        <div style={{ 
          backgroundColor: "#EBF8FF", 
          padding: "1rem", 
          borderRadius: "8px", 
          marginTop: "1rem",
          border: "1px solid #BEE3F8"
        }}>
          <p style={{ color: "#2B6CB0", fontSize: "13px", margin: "0", fontWeight: "500" }}>
            💡 Your preferences are automatically saved and will persist across sessions.
          </p>
        </div>
      </div>
    </div>
  );
} 