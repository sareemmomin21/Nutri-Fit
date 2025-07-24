import React, { useState, useEffect, useRef, useCallback } from "react";

export default function Nutrition({ meal, onAte, userId }) {
  const [activeTab, setActiveTab] = useState("add");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mealItems, setMealItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [modalFood, setModalFood] = useState(null);
  const [modalQuantity, setModalQuantity] = useState("1");
  const [modalServing, setModalServing] = useState("");
  const [customFood, setCustomFood] = useState({
    name: "",
    calories: "",
    protein: "",
    carbohydrates: "",
    fat: "",
    serving_size: "serving",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    mealItems: false,
    suggestions: false,
    addingFood: false,
    removingFood: false,
  });

  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const abortControllerRef = useRef(null);

  const currentUserId = userId || localStorage.getItem("nutrifit_user_id");

  // Load data on mount with staggered loading
  useEffect(() => {
    if (currentUserId) {
      // Load meal items first (most important)
      fetchMealItems();

      // Load suggestions after a short delay to avoid blocking
      setTimeout(() => {
        fetchSuggestions();
      }, 100);
    }
  }, [meal, currentUserId]);

  // Debounced autocomplete
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchAutocomplete();
      } else {
        setAutocompleteResults([]);
        setShowAutocomplete(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Handle clicks outside autocomplete
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const setLoadingState = useCallback((key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  }, []);

  const fetchAutocomplete = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        "https://nutri-fit-2iom.onrender.com/api/search_food_autocomplete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: currentUserId,
            query: searchQuery,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAutocompleteResults(data);
        setShowAutocomplete(data.length > 0);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching autocomplete:", error);
      }
    }
  }, [currentUserId, searchQuery]);

  const searchFood = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch("https://nutri-fit-2iom.onrender.com/api/search_food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          query: searchQuery,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data : []);
        setShowAutocomplete(false);
      }
    } catch (error) {
      console.error("Error searching food:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      setLoadingState("suggestions", true);
      const response = await fetch(
        "https://nutri-fit-2iom.onrender.com/api/get_meal_suggestions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: currentUserId,
            meal_type: meal,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoadingState("suggestions", false);
    }
  };

  const fetchMealItems = async () => {
    try {
      setLoadingState("mealItems", true);
      const response = await fetch(
        "https://nutri-fit-2iom.onrender.com/api/get_current_meal",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: currentUserId,
            meal_type: meal,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMealItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching meal items:", error);
    } finally {
      setLoadingState("mealItems", false);
    }
  };

  const openFoodModal = (food, fromAutocomplete = false) => {
    setModalFood(food);
    setModalQuantity("1");
    setModalServing(food.serving || food.available_servings?.[0] || "serving");
    setShowFoodModal(true);

    if (fromAutocomplete) {
      setShowAutocomplete(false);
      setSearchQuery("");
    }
  };

  const closeFoodModal = () => {
    setShowFoodModal(false);
    setModalFood(null);
    setModalQuantity("1");
    setModalServing("");
  };

  const validateAndSetQuantity = (value, isModal = false) => {
    // Validate and set final quantity value
    let finalValue = "1";
    if (value && !isNaN(value) && parseFloat(value) > 0) {
      finalValue = parseFloat(value).toString();
    }

    if (isModal) {
      setModalQuantity(finalValue);
    }
  };

  const addFoodToMeal = async (
    food,
    qty = null,
    serving = null,
    fromSuggestion = false
  ) => {
    if (!currentUserId) return;

    const finalQuantity = qty || parseFloat(modalQuantity) || 1;
    const finalServing = serving || modalServing;

    try {
      setLoadingState("addingFood", true);

      // Scale the food first if needed
      let scaledFood = food;
      if (finalQuantity !== 1 || finalServing !== food.serving) {
        const scaleResponse = await fetch(
          "https://nutri-fit-2iom.onrender.com/api/scale_food",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              food_data: food,
              quantity: finalQuantity,
              serving_size: finalServing,
            }),
          }
        );

        if (scaleResponse.ok) {
          scaledFood = await scaleResponse.json();
        }
      }

      // Add to current meal
      const response = await fetch(
        "https://nutri-fit-2iom.onrender.com/api/add_food_to_meal",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: currentUserId,
            meal_type: meal,
            food_data: {
              name: scaledFood.display_name || scaledFood.name,
              calories: scaledFood.calories,
              protein: scaledFood.protein,
              carbohydrates: scaledFood.carbohydrates,
              fat: scaledFood.fat,
              quantity: finalQuantity,
              serving_size: finalServing,
              source: scaledFood.source || "custom",
            },
          }),
        }
      );

      if (response.ok) {
        // Trigger parent refresh
        if (onAte) onAte();

        // Update local state immediately for better UX
        await fetchMealItems();

        // If from suggestion, remove it from suggestions list
        if (fromSuggestion) {
          setSuggestions((prev) => prev.filter((s) => s.name !== food.name));
        }

        // Reset forms
        setSearchQuery("");
        setSearchResults([]);
        closeFoodModal();
      }
    } catch (error) {
      console.error("Error adding food to meal:", error);
    } finally {
      setLoadingState("addingFood", false);
    }
  };

  const removeFoodFromMeal = async (itemId) => {
    try {
      setLoadingState("removingFood", true);
      const response = await fetch(
        "https://nutri-fit-2iom.onrender.com/api/remove_food_from_meal",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: currentUserId,
            meal_item_id: itemId,
          }),
        }
      );

      if (response.ok) {
        if (onAte) onAte();
        await fetchMealItems();
      }
    } catch (error) {
      console.error("Error removing food from meal:", error);
    } finally {
      setLoadingState("removingFood", false);
    }
  };

  const updateFoodPreference = async (food, liked) => {
    try {
      await fetch("https://nutri-fit-2iom.onrender.com/api/update_food_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          meal_type: meal,
          food_name: food.name,
          liked: liked,
        }),
      });

      // If disliked, remove from current suggestions and fetch new ones
      if (liked === false) {
        setSuggestions((prev) => prev.filter((s) => s.name !== food.name));
        // Fetch new suggestions to replace the disliked one
        setTimeout(() => {
          fetchSuggestions();
        }, 100);
      } else {
        // Just refresh suggestions for likes
        setTimeout(() => {
          fetchSuggestions();
        }, 100);
      }
    } catch (error) {
      console.error("Error updating food preference:", error);
    }
  };

  const addCustomFood = async () => {
    if (!currentUserId) return;

    const requiredFields = [
      "name",
      "calories",
      "protein",
      "carbohydrates",
      "fat",
    ];
    for (const field of requiredFields) {
      if (!customFood[field]) {
        alert(`Please fill in ${field}`);
        return;
      }
    }

    try {
      const addResponse = await fetch(
        "https://nutri-fit-2iom.onrender.com/api/add_custom_food",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: currentUserId,
            ...customFood,
            calories: parseFloat(customFood.calories),
            protein: parseFloat(customFood.protein),
            carbohydrates: parseFloat(customFood.carbohydrates),
            fat: parseFloat(customFood.fat),
          }),
        }
      );

      if (addResponse.ok) {
        // Add to current meal
        await addFoodToMeal(
          {
            name: customFood.name,
            calories: parseFloat(customFood.calories),
            protein: parseFloat(customFood.protein),
            carbohydrates: parseFloat(customFood.carbohydrates),
            fat: parseFloat(customFood.fat),
            serving: customFood.serving_size,
            source: "user_custom",
          },
          1,
          customFood.serving_size
        );

        // Reset form
        setCustomFood({
          name: "",
          calories: "",
          protein: "",
          carbohydrates: "",
          fat: "",
          serving_size: "serving",
        });
        setShowCustomFoodForm(false);
      }
    } catch (error) {
      console.error("Error adding custom food:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !showAutocomplete) {
      searchFood();
    }
  };

  // Styles
  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "1.5rem",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    height: "fit-content",
    position: "relative",
  };

  const tabStyle = (isActive) => ({
    padding: "8px 16px",
    border: "none",
    borderBottom: isActive ? "3px solid #48bb78" : "3px solid transparent",
    backgroundColor: "transparent",
    color: isActive ? "#48bb78" : "#718096",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: isActive ? "bold" : "normal",
    transition: "all 0.2s",
  });

  const buttonStyle = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s",
    margin: "0 4px",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#48bb78",
    color: "white",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#e2e8f0",
    color: "#4a5568",
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#e53e3e",
    color: "white",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "2px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "16px",
    outline: "none",
  };

  const smallInputStyle = {
    padding: "6px 8px",
    border: "1px solid #e2e8f0",
    borderRadius: "4px",
    fontSize: "14px",
    outline: "none",
  };

  const autocompleteStyle = {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxHeight: "200px",
    overflowY: "auto",
    zIndex: 1000,
  };

  const autocompleteItemStyle = {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #f7fafc",
    fontSize: "14px",
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  };

  const modalStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "80vh",
    overflowY: "auto",
    position: "relative",
  };

  const LoadingSpinner = ({ size = "20px" }) => (
    <div
      style={{
        width: size,
        height: size,
        border: "2px solid #e2e8f0",
        borderTop: "2px solid #48bb78",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        display: "inline-block",
      }}
    />
  );

  const FoodItem = ({
    food,
    showActions = true,
    showQuantityInfo = false,
    isCurrentMeal = false,
    fromSuggestion = false,
  }) => (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: "1rem",
        borderRadius: "8px",
        border: "1px solid #e9ecef",
        marginBottom: "1rem",
        opacity: loadingStates.addingFood ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <h4
        style={{
          margin: "0 0 0.5rem 0",
          color: "#2d3748",
          fontSize: "16px",
          lineHeight: "1.3",
        }}
      >
        {food.name}
        {showQuantityInfo && food.quantity && food.serving_size && (
          <span
            style={{ fontSize: "14px", color: "#718096", fontWeight: "normal" }}
          >
            {" "}
            ({food.quantity} {food.serving_size})
          </span>
        )}
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
          gap: "0.5rem",
          marginBottom: showActions ? "1rem" : "0",
          fontSize: "14px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "8px",
            borderRadius: "4px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontWeight: "bold", color: "#e53e3e" }}>
            {Math.round(food.calories)}
          </div>
          <div style={{ fontSize: "12px", color: "#718096" }}>cal</div>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "8px",
            borderRadius: "4px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontWeight: "bold", color: "#3182ce" }}>
            {Math.round(food.protein || 0)}g
          </div>
          <div style={{ fontSize: "12px", color: "#718096" }}>protein</div>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "8px",
            borderRadius: "4px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontWeight: "bold", color: "#38a169" }}>
            {Math.round(food.carbohydrates || 0)}g
          </div>
          <div style={{ fontSize: "12px", color: "#718096" }}>carbs</div>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "8px",
            borderRadius: "4px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontWeight: "bold", color: "#d69e2e" }}>
            {Math.round(food.fat || 0)}g
          </div>
          <div style={{ fontSize: "12px", color: "#718096" }}>fat</div>
        </div>
      </div>

      {showActions && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {!isCurrentMeal && (
            <>
              {/* Show Like/Dislike buttons for ALL suggestions and search results */}
              <button
                onClick={() => updateFoodPreference(food, true)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#48bb78",
                  color: "white",
                }}
                disabled={loadingStates.addingFood}
              >
                Like
              </button>
              <button
                onClick={() => updateFoodPreference(food, false)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#e53e3e",
                  color: "white",
                }}
                disabled={loadingStates.addingFood}
              >
                Dislike
              </button>
              <button
                onClick={() => openFoodModal(food, false)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#4299e1",
                  color: "white",
                }}
                disabled={loadingStates.addingFood}
              >
                {loadingStates.addingFood ? (
                  <LoadingSpinner size="16px" />
                ) : (
                  `Add to ${meal}`
                )}
              </button>
            </>
          )}

          {isCurrentMeal && (
            <button
              onClick={() => removeFoodFromMeal(food.id)}
              style={{
                ...buttonStyle,
                backgroundColor: "#e53e3e",
                color: "white",
              }}
              disabled={loadingStates.removingFood}
            >
              {loadingStates.removingFood ? (
                <LoadingSpinner size="16px" />
              ) : (
                "Remove"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Food Modal Component
  const FoodModal = () => {
    if (!showFoodModal || !modalFood) return null;

    return (
      <div style={modalOverlayStyle} onClick={closeFoodModal}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          {/* Close button */}
          <button
            onClick={closeFoodModal}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#718096",
            }}
          >
            ×
          </button>

          {/* Food details */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
              Add {modalFood.name}
            </h3>

            <FoodItem food={modalFood} showActions={false} />
          </div>

          {/* Quantity and serving inputs */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  Quantity
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={modalQuantity}
                  onChange={(e) => setModalQuantity(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  style={{
                    ...smallInputStyle,
                    width: "100%",
                  }}
                  placeholder="1"
                />
              </div>

              {modalFood.available_servings &&
                modalFood.available_servings.length > 1 && (
                  <div style={{ flex: 2 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      Serving Size
                    </label>
                    <select
                      value={modalServing}
                      onChange={(e) => setModalServing(e.target.value)}
                      style={{
                        ...smallInputStyle,
                        width: "100%",
                      }}
                    >
                      {modalFood.available_servings.map((serving, idx) => (
                        <option key={idx} value={serving}>
                          {serving}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
          >
            <button
              onClick={closeFoodModal}
              style={secondaryButtonStyle}
              disabled={loadingStates.addingFood}
            >
              Cancel
            </button>
            <button
              onClick={() =>
                addFoodToMeal(
                  modalFood,
                  parseFloat(modalQuantity) || 1,
                  modalServing
                )
              }
              style={{
                ...primaryButtonStyle,
                padding: "12px 24px",
              }}
              disabled={loadingStates.addingFood}
            >
              {loadingStates.addingFood ? (
                <LoadingSpinner size="16px" />
              ) : (
                `Add to ${meal}`
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={cardStyle}>
        {/* Header with Tabs */}
        <div
          style={{
            borderBottom: "1px solid #e2e8f0",
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
          }}
        >
          <h3
            style={{
              margin: "0 0 0.5rem 0",
              color: "#2d3748",
              textTransform: "capitalize",
              fontSize: "20px",
            }}
          >
            {meal}
          </h3>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => setActiveTab("add")}
              style={tabStyle(activeTab === "add")}
            >
              Add Food
            </button>
            <button
              onClick={() => setActiveTab("current")}
              style={tabStyle(activeTab === "current")}
            >
              Current {meal} ({mealItems.length})
              {loadingStates.mealItems && <LoadingSpinner size="12px" />}
            </button>
          </div>
        </div>

        {/* Add Food Tab */}
        {activeTab === "add" && (
          <div>
            {/* Suggestions Section */}
            <div style={{ marginBottom: "2rem" }}>
              <h4 style={{ color: "#2d3748", marginBottom: "1rem" }}>
                Suggested for {meal}
                {loadingStates.suggestions && <LoadingSpinner size="16px" />}
              </h4>
              {loadingStates.suggestions ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <LoadingSpinner size="24px" />
                  <div style={{ marginTop: "1rem", color: "#718096" }}>
                    Loading suggestions...
                  </div>
                </div>
              ) : suggestions.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {suggestions.map((food, index) => (
                    <FoodItem
                      key={`suggestion-${index}`}
                      food={food}
                      showActions={true}
                      isCurrentMeal={false}
                      fromSuggestion={true}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "1rem",
                    color: "#718096",
                    fontStyle: "italic",
                  }}
                >
                  No suggestions available
                </div>
              )}
            </div>

            {/* Search Section */}
            <div style={{ marginBottom: "1.5rem", position: "relative" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#2d3748",
                }}
              >
                Search for food
              </label>
              <div style={{ position: "relative" }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() =>
                    autocompleteResults.length > 0 && setShowAutocomplete(true)
                  }
                  placeholder="Type food name (e.g., 'chicken breast', 'banana')"
                  style={inputStyle}
                />

                {/* Autocomplete Dropdown */}
                {showAutocomplete && autocompleteResults.length > 0 && (
                  <div ref={autocompleteRef} style={autocompleteStyle}>
                    {autocompleteResults.map((item, index) => (
                      <div
                        key={index}
                        style={autocompleteItemStyle}
                        onClick={() => openFoodModal(item, true)}
                        onMouseOver={(e) =>
                          (e.target.style.backgroundColor = "#f7fafc")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.backgroundColor = "white")
                        }
                      >
                        <div style={{ fontWeight: "bold" }}>{item.name}</div>
                        <div style={{ fontSize: "12px", color: "#718096" }}>
                          {item.serving} • {item.source} •{" "}
                          {Math.round(item.calories)} cal
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button
                  onClick={searchFood}
                  disabled={!searchQuery.trim() || isSearching}
                  style={{
                    ...primaryButtonStyle,
                    opacity: !searchQuery.trim() || isSearching ? 0.6 : 1,
                    cursor:
                      !searchQuery.trim() || isSearching
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isSearching ? <LoadingSpinner size="16px" /> : "Search"}
                </button>

                <button
                  onClick={() => setShowCustomFoodForm(!showCustomFoodForm)}
                  style={secondaryButtonStyle}
                >
                  Add Custom Food
                </button>
              </div>
            </div>

            {/* Custom Food Form */}
            {showCustomFoodForm && (
              <div
                style={{
                  backgroundColor: "#f7fafc",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1.5rem",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h4 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
                  Add Custom Food
                </h4>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "14px",
                      }}
                    >
                      Food Name *
                    </label>
                    <input
                      type="text"
                      value={customFood.name}
                      onChange={(e) =>
                        setCustomFood({ ...customFood, name: e.target.value })
                      }
                      style={{ ...inputStyle, fontSize: "14px" }}
                      placeholder="e.g., Homemade Pasta"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "14px",
                      }}
                    >
                      Serving Size
                    </label>
                    <input
                      type="text"
                      value={customFood.serving_size}
                      onChange={(e) =>
                        setCustomFood({
                          ...customFood,
                          serving_size: e.target.value,
                        })
                      }
                      style={{ ...inputStyle, fontSize: "14px" }}
                      placeholder="e.g., 1 cup, 1 piece"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "14px",
                      }}
                    >
                      Calories *
                    </label>
                    <input
                      type="number"
                      value={customFood.calories}
                      onChange={(e) =>
                        setCustomFood({
                          ...customFood,
                          calories: e.target.value,
                        })
                      }
                      style={{ ...inputStyle, fontSize: "14px" }}
                      placeholder="e.g., 250"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "14px",
                      }}
                    >
                      Protein (g) *
                    </label>
                    <input
                      type="number"
                      value={customFood.protein}
                      onChange={(e) =>
                        setCustomFood({
                          ...customFood,
                          protein: e.target.value,
                        })
                      }
                      style={{ ...inputStyle, fontSize: "14px" }}
                      placeholder="e.g., 15"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "14px",
                      }}
                    >
                      Carbohydrates (g) *
                    </label>
                    <input
                      type="number"
                      value={customFood.carbohydrates}
                      onChange={(e) =>
                        setCustomFood({
                          ...customFood,
                          carbohydrates: e.target.value,
                        })
                      }
                      style={{ ...inputStyle, fontSize: "14px" }}
                      placeholder="e.g., 30"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "14px",
                      }}
                    >
                      Fat (g) *
                    </label>
                    <input
                      type="number"
                      value={customFood.fat}
                      onChange={(e) =>
                        setCustomFood({ ...customFood, fat: e.target.value })
                      }
                      style={{ ...inputStyle, fontSize: "14px" }}
                      placeholder="e.g., 8"
                    />
                  </div>
                </div>

                <div style={{ marginTop: "1rem", display: "flex", gap: "8px" }}>
                  <button onClick={addCustomFood} style={primaryButtonStyle}>
                    Add to {meal}
                  </button>
                  <button
                    onClick={() => setShowCustomFoodForm(false)}
                    style={secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <h4 style={{ color: "#2d3748", marginBottom: "1rem" }}>
                  Search Results
                </h4>

                {searchResults.map((food, index) => (
                  <FoodItem
                    key={`search-${index}`}
                    food={food}
                    showActions={true}
                    isCurrentMeal={false}
                    fromSuggestion={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Current Meal Tab */}
        {activeTab === "current" && (
          <div>
            {loadingStates.mealItems ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <LoadingSpinner size="24px" />
                <div style={{ marginTop: "1rem", color: "#718096" }}>
                  Loading meal items...
                </div>
              </div>
            ) : mealItems.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  backgroundColor: "#f7fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <p style={{ color: "#718096", margin: "0" }}>
                  No foods added to {meal} yet
                </p>
              </div>
            ) : (
              <div>
                <h4 style={{ color: "#2d3748", marginBottom: "1rem" }}>
                  Current {meal} ({mealItems.length} items)
                </h4>
                {mealItems.map((food) => (
                  <FoodItem
                    key={food.id}
                    food={food}
                    showActions={true}
                    showQuantityInfo={true}
                    isCurrentMeal={true}
                  />
                ))}

                {/* Summary */}
                <div
                  style={{
                    backgroundColor: "#f7fafc",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginTop: "1rem",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
                    Total for {meal}:
                  </h5>
                  <div style={{ fontSize: "14px", color: "#4a5568" }}>
                    <div>
                      Calories:{" "}
                      {mealItems
                        .reduce((sum, f) => sum + (f.calories || 0), 0)
                        .toFixed(0)}
                    </div>
                    <div>
                      Protein:{" "}
                      {mealItems
                        .reduce((sum, f) => sum + (f.protein || 0), 0)
                        .toFixed(1)}
                      g
                    </div>
                    <div>
                      Carbs:{" "}
                      {mealItems
                        .reduce((sum, f) => sum + (f.carbohydrates || 0), 0)
                        .toFixed(1)}
                      g
                    </div>
                    <div>
                      Fat:{" "}
                      {mealItems
                        .reduce((sum, f) => sum + (f.fat || 0), 0)
                        .toFixed(1)}
                      g
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Food Modal */}
      <FoodModal />
    </>
  );
}
