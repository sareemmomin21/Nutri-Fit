// src/pages/QuestionsPage.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function QuestionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  // Redirect if no user ID
  React.useEffect(() => {
    if (!userId) {
      navigate("/");
    }
  }, [userId, navigate]);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    height_cm: "",
    weight_lb: "",

    // Activity & Goals
    activity_level: "",
    fitness_experience: "",
    workout_frequency: "",
    workout_duration: "",

    // Equipment & Access - UPDATED
    has_gym_membership: null,
    home_equipment: [], // Array of equipment available at home

    // Goals & Focus
    primary_focus: "",
    fitness_goals: [],

    // Dietary Information
    dietary_restrictions: [],
    meal_prep_time: "",
    cooking_skill: "",
    budget_preference: "",

    // Training Preferences
    training_styles: [],
  });

  const totalSteps = 6;

  // Equipment options for home
  const homeEquipmentOptions = [
    { value: "dumbbells", label: "Dumbbells" },
    { value: "resistance_bands", label: "Resistance Bands" },
    { value: "kettlebell", label: "Kettlebell" },
    { value: "yoga_mat", label: "Yoga Mat" },
    { value: "pull_up_bar", label: "Pull-up Bar" },
    { value: "exercise_bike", label: "Exercise Bike" },
    { value: "treadmill", label: "Treadmill" },
    { value: "barbell", label: "Barbell & Plates" },
    { value: "bench", label: "Exercise Bench" },
    { value: "jump_rope", label: "Jump Rope" },
    { value: "foam_roller", label: "Foam Roller" },
    { value: "stability_ball", label: "Stability Ball" },
    { value: "suspension_trainer", label: "Suspension Trainer (TRX)" },
    { value: "medicine_ball", label: "Medicine Ball" },
    { value: "cable_machine", label: "Cable Machine" },
  ];

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.first_name.trim())
          newErrors.first_name = "First name is required";
        if (!formData.last_name.trim())
          newErrors.last_name = "Last name is required";
        if (!formData.date_of_birth)
          newErrors.date_of_birth = "Date of birth is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        break;

      case 2: // Physical Stats
        if (
          !formData.height_cm ||
          formData.height_cm < 100 ||
          formData.height_cm > 250
        ) {
          newErrors.height_cm = "Please enter a valid height (100-250 cm)";
        }
        if (
          !formData.weight_lb ||
          formData.weight_lb < 50 ||
          formData.weight_lb > 500
        ) {
          newErrors.weight_lb = "Please enter a valid weight (50-500 lbs)";
        }
        if (!formData.activity_level)
          newErrors.activity_level = "Activity level is required";
        break;

      case 3: // Fitness Experience
        if (!formData.fitness_experience)
          newErrors.fitness_experience = "Fitness experience is required";
        if (
          !formData.workout_frequency ||
          formData.workout_frequency < 0 ||
          formData.workout_frequency > 7
        ) {
          newErrors.workout_frequency =
            "Please enter workout frequency (0-7 days per week)";
        }
        if (
          !formData.workout_duration ||
          formData.workout_duration < 15 ||
          formData.workout_duration > 180
        ) {
          newErrors.workout_duration =
            "Please enter workout duration (15-180 minutes)";
        }
        break;

      case 4: // Equipment & Goals - UPDATED VALIDATION
        if (formData.has_gym_membership === null)
          newErrors.has_gym_membership = "Please select an option";
        if (!formData.primary_focus)
          newErrors.primary_focus = "Primary focus is required";
        if (formData.fitness_goals.length === 0)
          newErrors.fitness_goals = "Please select at least one goal";
        break;

      case 5: // Dietary Preferences
        if (!formData.meal_prep_time)
          newErrors.meal_prep_time = "Meal prep preference is required";
        if (!formData.cooking_skill)
          newErrors.cooking_skill = "Cooking skill level is required";
        if (!formData.budget_preference)
          newErrors.budget_preference = "Budget preference is required";
        break;

      case 6: // Training Styles
        if (formData.training_styles.length === 0)
          newErrors.training_styles =
            "Please select at least one training style";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      // Process equipment data - if gym membership, add all gym equipment
      let processedData = { ...formData };

      if (formData.has_gym_membership) {
        // If user has gym membership, they have access to all equipment
        processedData.available_equipment = "gym_membership_full_access";
      } else {
        // Convert home equipment array to string for database
        processedData.available_equipment = formData.home_equipment.join(", ");
      }

      const response = await fetch(
        "http://127.0.0.1:5000/api/complete_profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, ...processedData }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Store user ID for the app
        localStorage.setItem("nutrifit_user_id", userId);
        navigate("/home");
      } else {
        alert(data.error || "Failed to complete profile");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
      alert("Failed to submit profile. Please try again.");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    marginBottom: "8px",
  };

  const errorStyle = {
    color: "#e53e3e",
    fontSize: "14px",
    marginBottom: "8px",
  };

  const buttonStyle = {
    padding: "12px 24px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  };

  const renderStep1 = () => (
    <div>
      <h3>Personal Information</h3>
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          First Name *
        </label>
        <input
          type="text"
          value={formData.first_name}
          onChange={(e) => handleInputChange("first_name", e.target.value)}
          style={{
            ...inputStyle,
            borderColor: errors.first_name ? "#e53e3e" : "#ddd",
          }}
          placeholder="Enter your first name"
        />
        {errors.first_name && <div style={errorStyle}>{errors.first_name}</div>}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Last Name *
        </label>
        <input
          type="text"
          value={formData.last_name}
          onChange={(e) => handleInputChange("last_name", e.target.value)}
          style={{
            ...inputStyle,
            borderColor: errors.last_name ? "#e53e3e" : "#ddd",
          }}
          placeholder="Enter your last name"
        />
        {errors.last_name && <div style={errorStyle}>{errors.last_name}</div>}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Date of Birth *
        </label>
        <input
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
          style={{
            ...inputStyle,
            borderColor: errors.date_of_birth ? "#e53e3e" : "#ddd",
          }}
          max={new Date().toISOString().split("T")[0]}
        />
        {errors.date_of_birth && (
          <div style={errorStyle}>{errors.date_of_birth}</div>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Gender *
        </label>
        <select
          value={formData.gender}
          onChange={(e) => handleInputChange("gender", e.target.value)}
          style={{
            ...inputStyle,
            borderColor: errors.gender ? "#e53e3e" : "#ddd",
          }}
        >
          <option value="">Select your gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        {errors.gender && <div style={errorStyle}>{errors.gender}</div>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3>Physical Stats & Activity</h3>
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Height (cm) *
        </label>
        <input
          type="number"
          value={formData.height_cm}
          onChange={(e) => handleInputChange("height_cm", e.target.value)}
          style={{
            ...inputStyle,
            borderColor: errors.height_cm ? "#e53e3e" : "#ddd",
          }}
          placeholder="e.g., 175"
          min="100"
          max="250"
        />
        {errors.height_cm && <div style={errorStyle}>{errors.height_cm}</div>}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Weight (lbs) *
        </label>
        <input
          type="number"
          value={formData.weight_lb}
          onChange={(e) => handleInputChange("weight_lb", e.target.value)}
          style={{
            ...inputStyle,
            borderColor: errors.weight_lb ? "#e53e3e" : "#ddd",
          }}
          placeholder="e.g., 150"
          min="50"
          max="500"
        />
        {errors.weight_lb && <div style={errorStyle}>{errors.weight_lb}</div>}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Activity Level *
        </label>
        <select
          value={formData.activity_level}
          onChange={(e) => handleInputChange("activity_level", e.target.value)}
          style={{
            ...inputStyle,
            borderColor: errors.activity_level ? "#e53e3e" : "#ddd",
          }}
        >
          <option value="">Select your activity level</option>
          <option value="sedentary">Sedentary (little/no exercise)</option>
          <option value="lightly_active">
            Lightly Active (light exercise 1-3 days/week)
          </option>
          <option value="moderately_active">
            Moderately Active (moderate exercise 3-5 days/week)
          </option>
          <option value="very_active">
            Very Active (hard exercise 6-7 days/week)
          </option>
          <option value="extremely_active">
            Extremely Active (very hard exercise & physical job)
          </option>
        </select>
        {errors.activity_level && (
          <div style={errorStyle}>{errors.activity_level}</div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h3>Fitness Experience</h3>
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Fitness Experience Level *
        </label>
        <select
          value={formData.fitness_experience}
          onChange={(e) =>
            handleInputChange("fitness_experience", e.target.value)
          }
          style={{
            ...inputStyle,
            borderColor: errors.fitness_experience ? "#e53e3e" : "#ddd",
          }}
        >
          <option value="">Select your experience level</option>
          <option value="beginner">Beginner (0-6 months)</option>
          <option value="intermediate">
            Intermediate (6 months - 2 years)
          </option>
          <option value="advanced">Advanced (2+ years)</option>
        </select>
        {errors.fitness_experience && (
          <div style={errorStyle}>{errors.fitness_experience}</div>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          How many days per week do you currently workout? *
        </label>
        <input
          type="number"
          value={formData.workout_frequency}
          onChange={(e) =>
            handleInputChange("workout_frequency", e.target.value)
          }
          style={{
            ...inputStyle,
            borderColor: errors.workout_frequency ? "#e53e3e" : "#ddd",
          }}
          placeholder="e.g., 3"
          min="0"
          max="7"
        />
        {errors.workout_frequency && (
          <div style={errorStyle}>{errors.workout_frequency}</div>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          How long is your typical workout? (minutes) *
        </label>
        <input
          type="number"
          value={formData.workout_duration}
          onChange={(e) =>
            handleInputChange("workout_duration", e.target.value)
          }
          style={{
            ...inputStyle,
            borderColor: errors.workout_duration ? "#e53e3e" : "#ddd",
          }}
          placeholder="e.g., 60"
          min="15"
          max="180"
        />
        {errors.workout_duration && (
          <div style={errorStyle}>{errors.workout_duration}</div>
        )}
      </div>
    </div>
  );

  // UPDATED STEP 4 - Separate gym and equipment questions
  const renderStep4 = () => (
    <div>
      <h3>Equipment & Goals</h3>

      {/* Gym Membership Question */}
      <div style={{ marginBottom: "25px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Do you have a gym membership? *
        </label>
        <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
          <label
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <input
              type="radio"
              name="gym_membership"
              checked={formData.has_gym_membership === true}
              onChange={() => handleInputChange("has_gym_membership", true)}
              style={{ marginRight: "8px" }}
            />
            Yes, I have access to a gym
          </label>
          <label
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <input
              type="radio"
              name="gym_membership"
              checked={formData.has_gym_membership === false}
              onChange={() => handleInputChange("has_gym_membership", false)}
              style={{ marginRight: "8px" }}
            />
            No, I work out at home/outdoors
          </label>
        </div>
        {errors.has_gym_membership && (
          <div style={errorStyle}>{errors.has_gym_membership}</div>
        )}
      </div>

      {/* Home Equipment Question - Only show if no gym membership */}
      {formData.has_gym_membership === false && (
        <div style={{ marginBottom: "25px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "12px",
              fontWeight: "bold",
            }}
          >
            What workout equipment do you have at home? (Select all that apply)
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "10px",
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
            }}
          >
            {homeEquipmentOptions.map((equipment) => (
              <label
                key={equipment.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.home_equipment.includes(equipment.value)}
                  onChange={(e) =>
                    handleArrayChange(
                      "home_equipment",
                      equipment.value,
                      e.target.checked
                    )
                  }
                  style={{ marginRight: "8px" }}
                />
                {equipment.label}
              </label>
            ))}
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
            Don't worry if you don't have equipment - we have plenty of
            bodyweight exercises!
          </div>
        </div>
      )}

      {/* Gym Access Notice */}
      {formData.has_gym_membership === true && (
        <div
          style={{
            backgroundColor: "#e6fffa",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #81e6d9",
            marginBottom: "25px",
          }}
        >
          <div style={{ color: "#234e52", fontSize: "14px" }}>
            <strong>Great!</strong> With gym access, you'll have access to all
            equipment types. We'll recommend workouts using barbells, machines,
            free weights, and more!
          </div>
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Primary Focus *
        </label>
        <select
          value={formData.primary_focus}
          onChange={(e) => handleInputChange("primary_focus", e.target.value)}
          style={{
            ...inputStyle,
            borderColor: errors.primary_focus ? "#e53e3e" : "#ddd",
          }}
        >
          <option value="">Select your primary focus</option>
          <option value="nutrition">Nutrition</option>
          <option value="fitness">Fitness</option>
          <option value="both">Both Nutrition & Fitness</option>
        </select>
        {errors.primary_focus && (
          <div style={errorStyle}>{errors.primary_focus}</div>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          What are your fitness goals? (Select all that apply) *
        </label>
        {[
          "weight_loss",
          "weight_gain",
          "muscle_building",
          "strength_training",
          "endurance",
          "general_health",
        ].map((goal) => (
          <label
            key={goal}
            style={{ display: "block", marginBottom: "8px", cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={formData.fitness_goals.includes(goal)}
              onChange={(e) =>
                handleArrayChange("fitness_goals", goal, e.target.checked)
              }
              style={{ marginRight: "8px" }}
            />
            {goal.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </label>
        ))}
        {errors.fitness_goals && (
          <div style={errorStyle}>{errors.fitness_goals}</div>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div>
      <h3>Dietary Preferences</h3>
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Dietary Restrictions/Preferences (Select all that apply)
        </label>
        {[
          "vegetarian",
          "vegan",
          "gluten_free",
          "dairy_free",
          "keto",
          "paleo",
          "halal",
          "kosher",
        ].map((restriction) => (
          <label
            key={restriction}
            style={{ display: "block", marginBottom: "8px", cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={formData.dietary_restrictions.includes(restriction)}
              onChange={(e) =>
                handleArrayChange(
                  "dietary_restrictions",
                  restriction,
                  e.target.checked
                )
              }
              style={{ marginRight: "8px" }}
            />
            {restriction
              .replace("_", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </label>
        ))}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          How much time do you prefer to spend on meal preparation? *
        </label>
        <select
          value={formData.meal_prep_time}
          onChange={(e) => handleInputChange("meal_prep_time", e.target.value)}
          style={{
            ...inputStyle,
            borderColor: errors.meal_prep_time ? "#e53e3e" : "#ddd",
          }}
        >
          <option value="">Select meal prep preference</option>
          <option value="minimal">Minimal (under 15 minutes)</option>
          <option value="moderate">Moderate (15-30 minutes)</option>
          <option value="extensive">Extensive (30+ minutes)</option>
        </select>
        {errors.meal_prep_time && (
          <div style={errorStyle}>{errors.meal_prep_time}</div>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Cooking Skill Level *
        </label>
        <select
          value={formData.cooking_skill}
          onChange={(e) => handleInputChange("cooking_skill", e.target.value)}
          style={{
            ...inputStyle,
            borderColor: errors.cooking_skill ? "#e53e3e" : "#ddd",
          }}
        >
          <option value="">Select your cooking skill level</option>
          <option value="beginner">Beginner (basic cooking)</option>
          <option value="intermediate">
            Intermediate (comfortable cooking)
          </option>
          <option value="advanced">Advanced (experienced cook)</option>
        </select>
        {errors.cooking_skill && (
          <div style={errorStyle}>{errors.cooking_skill}</div>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Food Budget Preference *
        </label>
        <select
          value={formData.budget_preference}
          onChange={(e) =>
            handleInputChange("budget_preference", e.target.value)
          }
          style={{
            ...inputStyle,
            borderColor: errors.budget_preference ? "#e53e3e" : "#ddd",
          }}
        >
          <option value="">Select your budget preference</option>
          <option value="low">Budget-conscious</option>
          <option value="medium">Moderate spending</option>
          <option value="high">Premium options</option>
        </select>
        {errors.budget_preference && (
          <div style={errorStyle}>{errors.budget_preference}</div>
        )}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div>
      <h3>Training Preferences</h3>
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          What training styles interest you? (Select all that apply) *
        </label>
        {[
          "weightlifting",
          "bodyweight",
          "cardio",
          "hiit",
          "yoga",
          "pilates",
          "swimming",
          "running",
          "cycling",
          "sports",
        ].map((style) => (
          <label
            key={style}
            style={{ display: "block", marginBottom: "8px", cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={formData.training_styles.includes(style)}
              onChange={(e) =>
                handleArrayChange("training_styles", style, e.target.checked)
              }
              style={{ marginRight: "8px" }}
            />
            {style.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </label>
        ))}
        {errors.training_styles && (
          <div style={errorStyle}>{errors.training_styles}</div>
        )}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return null;
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#2d3748", marginBottom: "0.5rem" }}>
          Complete Your Profile
        </h2>
        <p style={{ color: "#718096", marginBottom: "1rem" }}>
          Help us personalize your nutrition and fitness experience
        </p>

        {/* Progress Bar */}
        <div
          style={{
            backgroundColor: "#e2e8f0",
            height: "8px",
            borderRadius: "4px",
            marginBottom: "1rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: "#48bb78",
              height: "100%",
              width: `${(currentStep / totalSteps) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "14px",
            color: "#718096",
            marginBottom: "2rem",
          }}
        >
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
      </div>

      {/* Step Content */}
      <div
        style={{
          backgroundColor: "#f7fafc",
          padding: "2rem",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          marginBottom: "2rem",
        }}
      >
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          style={{
            ...buttonStyle,
            backgroundColor: currentStep === 1 ? "#e2e8f0" : "#edf2f7",
            color: currentStep === 1 ? "#a0aec0" : "#2d3748",
            cursor: currentStep === 1 ? "not-allowed" : "pointer",
          }}
        >
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            style={{
              ...buttonStyle,
              backgroundColor: "#48bb78",
              color: "white",
            }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            style={{
              ...buttonStyle,
              backgroundColor: "#38a169",
              color: "white",
            }}
          >
            Complete Profile
          </button>
        )}
      </div>

      {/* Skip Option */}
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to skip the questionnaire? This will limit personalization features."
              )
            ) {
              localStorage.setItem("nutrifit_user_id", userId);
              navigate("/home");
            }
          }}
          style={{
            background: "none",
            border: "none",
            color: "#718096",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "14px",
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
