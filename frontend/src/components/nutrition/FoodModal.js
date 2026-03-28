// Update your FoodModal.js with dietary warning support

import React from "react";
import FoodItem from "./FoodItem";
import { FaExclamationTriangle } from "react-icons/fa";

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

const DietaryWarningModal = ({ warning }) => {
  if (!warning) return null;

  return (
    <div
      style={{
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "1rem",
        fontSize: "14px",
        color: "#dc2626",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontSize: "18px" }}>
          <FaExclamationTriangle />
        </span>
        <strong>Dietary Restriction Alert</strong>
      </div>
      {/* <p style={{ margin: "0", lineHeight: "1.4" }}>{warning}</p> */}
      <p style={{ margin: "8px 0 0 0", fontSize: "12px", fontStyle: "italic" }}>
        You can still add this item if you choose to.
      </p>
    </div>
  );
};

const FoodModal = ({
  show,
  food,
  meal,
  quantity,
  serving,
  loadingStates,
  onClose,
  onAdd,
  onQuantityChange,
  onServingChange,
}) => {
  if (!show || !food) return null;

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

  const smallInputStyle = {
    padding: "6px 8px",
    border: "1px solid #e2e8f0",
    borderRadius: "4px",
    fontSize: "14px",
    outline: "none",
  };

  const primaryButtonStyle = {
    padding: "12px 24px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s",
    backgroundColor: food.dietary_warning ? "#f59e0b" : "#48bb78",
    color: "white",
  };

  const secondaryButtonStyle = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s",
    backgroundColor: "#e2e8f0",
    color: "#4a5568",
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
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

        {/* Dietary Warning */}
        <DietaryWarningModal warning={food.dietary_warning} />

        {/* Food details */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#2d3748" }}>
            Add {food.name}
          </h3>

          <FoodItem
            food={food}
            showActions={false}
            loadingStates={loadingStates}
          />
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
                value={quantity}
                onChange={(e) => onQuantityChange(e.target.value)}
                onFocus={(e) => e.target.select()}
                style={{
                  ...smallInputStyle,
                  width: "100%",
                }}
                placeholder="1"
              />
            </div>

            {food.available_servings && food.available_servings.length > 1 && (
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
                  value={serving}
                  onChange={(e) => onServingChange(e.target.value)}
                  style={{
                    ...smallInputStyle,
                    width: "100%",
                  }}
                >
                  {food.available_servings.map((servingOption, idx) => (
                    <option key={idx} value={servingOption}>
                      {servingOption}
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
            onClick={onClose}
            style={secondaryButtonStyle}
            disabled={loadingStates.addingFood}
          >
            Cancel
          </button>
          <button
            onClick={() => onAdd(food, parseFloat(quantity) || 1, serving)}
            style={primaryButtonStyle}
            disabled={loadingStates.addingFood}
            title={
              food.dietary_warning
                ? "This item may conflict with your dietary preferences"
                : ""
            }
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

export default FoodModal;
