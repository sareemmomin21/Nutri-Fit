import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(""); // Add debug info

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", { isLogin, formData }); // Debug log

    if (!validateForm()) return;

    setIsLoading(true);
    setDebugInfo("Sending request...");

    const endpoint = isLogin ? "/api/login" : "/api/signup";
    console.log("Endpoint:", endpoint); // Debug log

    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", resp.status); // Debug log
      const data = await resp.json();
      console.log("Response data:", data); // Debug log

      setDebugInfo(`Response: ${JSON.stringify(data)}`);

      if (data.success) {
        localStorage.setItem("nutrifit_user_id", data.user_id);
        console.log("User ID stored:", data.user_id); // Debug log

        if (isLogin) {
          console.log("Login - Profile completed:", data.profile_completed); // Debug log
          // For login, check if profile is completed
          if (data.profile_completed) {
            console.log("Navigating to /nutrition"); // Debug log
            navigate("/nutrition");
          } else {
            console.log("Navigating to /questions"); // Debug log
            navigate("/questions", { state: { userId: data.user_id } });
          }
        } else {
          console.log("Signup - Navigating to /questions"); // Debug log
          // For signup, ALWAYS go to questions first
          navigate("/questions", { state: { userId: data.user_id } });
        }
      } else {
        setErrors({ general: data.error || "Authentication failed" });
        setDebugInfo(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Network error:", error); // Debug log
      setErrors({ general: "Network error. Please try again." });
      setDebugInfo(`Network error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setFormData({ username: "", password: "", confirmPassword: "", email: "" });
    setErrors({});
    setDebugInfo("");
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "16px",
    marginBottom: "4px",
    transition: "border-color 0.2s",
  };
  const errorInputStyle = { ...inputStyle, borderColor: "#e53e3e" };
  const buttonStyle = {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginBottom: "1rem",
  };
  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: isLoading ? "#a0aec0" : "#48bb78",
    color: "white",
  };
  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "transparent",
    color: "#48bb78",
    border: "2px solid #48bb78",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f7fafc",
        fontFamily: "Arial, sans-serif",
        padding: "2rem",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              color: "#2d3748",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            🥗 NutriFit
          </h1>
          <p style={{ color: "#718096", fontSize: "16px" }}>
            {isLogin ? "Welcome back!" : "Join NutriFit"}
          </p>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div
            style={{
              backgroundColor: "#f0f8ff",
              border: "1px solid #3182ce",
              color: "#2b6cb0",
              padding: "8px",
              borderRadius: "6px",
              marginBottom: "1rem",
              fontSize: "12px",
              wordBreak: "break-all",
            }}
          >
            Debug: {debugInfo}
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div
            style={{
              backgroundColor: "#fed7d7",
              border: "1px solid #e53e3e",
              color: "#c53030",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#2d3748",
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              style={errors.username ? errorInputStyle : inputStyle}
              placeholder="Enter your username"
              disabled={isLoading}
              aria-invalid={!!errors.username}
            />
            {errors.username && (
              <div
                style={{ color: "#e53e3e", fontSize: "14px", marginTop: "4px" }}
              >
                {errors.username}
              </div>
            )}
          </div>

          {/* Email (signup only) */}
          {!isLogin && (
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: "#2d3748",
                }}
              >
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                style={errors.email ? errorInputStyle : inputStyle}
                placeholder="Enter your email"
                disabled={isLoading}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <div
                  style={{
                    color: "#e53e3e",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {errors.email}
                </div>
              )}
            </div>
          )}

          {/* Password */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#2d3748",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              style={errors.password ? errorInputStyle : inputStyle}
              placeholder="Enter your password"
              disabled={isLoading}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <div
                style={{ color: "#e53e3e", fontSize: "14px", marginTop: "4px" }}
              >
                {errors.password}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          {!isLogin && (
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: "#2d3748",
                }}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                style={errors.confirmPassword ? errorInputStyle : inputStyle}
                placeholder="Confirm your password"
                disabled={isLoading}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <div
                  style={{
                    color: "#e53e3e",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={primaryButtonStyle}
            onMouseOver={(e) =>
              !isLoading && (e.target.style.backgroundColor = "#38a169")
            }
            onMouseOut={(e) =>
              !isLoading && (e.target.style.backgroundColor = "#48bb78")
            }
          >
            {isLoading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={toggleMode}
            disabled={isLoading}
            style={secondaryButtonStyle}
            onMouseOver={(e) =>
              !isLoading && (e.target.style.backgroundColor = "#38a169")
            }
            onMouseOut={(e) =>
              !isLoading && (e.target.style.backgroundColor = "transparent")
            }
          >
            {isLogin ? "Create a new account" : "Sign in"}
          </button>
        </div>

        {/* Debug current user */}
        <div style={{ marginTop: "1rem", fontSize: "12px", color: "#666" }}>
          Current user ID: {localStorage.getItem("nutrifit_user_id") || "None"}
        </div>
      </div>
    </div>
  );
}
