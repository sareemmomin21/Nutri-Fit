import React, { useEffect, useState } from "react";
import Nutrition from "../components/Nutrition";

export default function NutritionPage() {
  const [totalEaten, setTotalEaten] = useState(0);
  const userId = "user_123";

  const fetchTotal = async () => {
    const response = await fetch("http://localhost:5000/get_daily_total", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });

    const data = await response.json();
    setTotalEaten(data.total_eaten);
  };

  useEffect(() => {
    fetchTotal();
    fetchNutrients();
  }, []);

  const [nutrientTotals, setNutrientTotals] = useState({
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
  });

  const fetchNutrients = async () => {
    const response = await fetch("http://localhost:5000/get_daily_nutrients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });

    const data = await response.json();
    setNutrientTotals(data);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Total Calories Eaten Today: {Math.round(totalEaten)}</h2>
      <p>Protein: {nutrientTotals.protein.toFixed(1)}g</p>
      <p>Carbs: {nutrientTotals.carbohydrates.toFixed(1)}g</p>
      <p>Fat: {nutrientTotals.fat.toFixed(1)}g</p>

      <Nutrition
        meal="breakfast"
        onAte={() => {
          fetchTotal();
          fetchNutrients();
        }}
      />
      <Nutrition
        meal="lunch"
        onAte={() => {
          fetchTotal();
          fetchNutrients();
        }}
      />
      <Nutrition
        meal="dinner"
        onAte={() => {
          fetchTotal();
          fetchNutrients();
        }}
      />
      <Nutrition
        meal="snacks"
        onAte={() => {
          fetchTotal();
          fetchNutrients();
        }}
      />

      <button
        onClick={async () => {
          await fetch("http://localhost:5000/next_day", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId }),
          });
          window.location.reload(); // Refresh UI after reset
        }}
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        ⏭️ Next Day
      </button>
    </div>
  );
}
