// components/ProfileTab.js
import React, { useState, useEffect } from "react";

export default function ProfileTab({ profile, onUpdate, isSaving }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        height_cm: profile.height_cm || "",
        weight_lb: profile.weight_lb || "",
        activity_level: profile.activity_level || "",
      });
    }
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "16px",
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: "1.5rem", color: "#2d3748" }}>
        Personal Information
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            First Name
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleInputChange("first_name", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Last Name
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => handleInputChange("last_name", e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange("gender", e.target.value)}
            style={inputStyle}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Height (cm)
          </label>
          <input
            type="number"
            value={formData.height_cm}
            onChange={(e) => handleInputChange("height_cm", e.target.value)}
            style={inputStyle}
            min="100"
            max="250"
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Weight (lbs)
          </label>
          <input
            type="number"
            value={formData.weight_lb}
            onChange={(e) => handleInputChange("weight_lb", e.target.value)}
            style={inputStyle}
            min="50"
            max="500"
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Activity Level
          </label>
          <select
            value={formData.activity_level}
            onChange={(e) =>
              handleInputChange("activity_level", e.target.value)
            }
            style={inputStyle}
          >
            <option value="">Select level</option>
            <option value="sedentary">Sedentary</option>
            <option value="lightly_active">Lightly Active</option>
            <option value="moderately_active">Moderately Active</option>
            <option value="very_active">Very Active</option>
            <option value="extremely_active">Extremely Active</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        style={{
          padding: "12px 24px",
          backgroundColor: isSaving ? "#a0aec0" : "#48bb78",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: isSaving ? "not-allowed" : "pointer",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        {isSaving ? "Saving..." : "Update Profile"}
      </button>
    </form>
  );
}
