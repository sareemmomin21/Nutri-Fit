import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("USDA_API_KEY")
SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

def extract_nutrients(foodNutrients):
    nutrients = {
        "protein": 0,
        "carbohydrates": 0,
        "fat": 0,
    }
    for n in foodNutrients:
        name = n.get("nutrientName", "").lower()
        value = n.get("value", 0)
        if "protein" in name:
            nutrients["protein"] = round(value, 2)
        elif "carbohydrate" in name:
            nutrients["carbohydrates"] = round(value, 2)
        elif "lipid" in name or "fat" in name:
            nutrients["fat"] = round(value, 2)
    return nutrients


def query_usda_foods(meal_type, calories_target=300, max_results=10):
    meal_queries = {
        "breakfast": "eggs OR oats OR cereal OR toast OR yogurt OR smoothie OR pancakes",
        "lunch": "chicken sandwich OR turkey wrap OR rice bowl OR pasta OR salad",
        "dinner": "chicken breast OR salmon OR stir fry OR rice OR stew OR roasted vegetables",
        "snacks": "granola bar OR almonds OR fruit OR greek yogurt OR popcorn"
    }

    query = meal_queries.get(meal_type, "healthy food")

    params = {
        "query": query,
        "pageSize": max_results,
        "api_key": API_KEY,
        "dataType": ["Survey (FNDDS)", "Foundation"]
    }

    response = requests.get(SEARCH_URL, params=params)
    data = response.json()

    results = []
    for item in data.get("foods", []):
        nutrients = item.get("foodNutrients", [])
        calories = next(
            (n["value"] for n in nutrients if n.get("nutrientName", "").lower() == "energy" and n.get("unitName") == "KCAL"),
            0
        )
        nutrient_data = extract_nutrients(nutrients)
        results.append({
            "name": item.get("description", "Unknown Food"),
            "fdcId": item.get("fdcId"),
            "calories": round(calories, 2),
            **nutrient_data  # Add protein, carbs, fat
        })
    return results
