from flask import Flask, request, jsonify
import json
import os

USER_FILE = os.path.join(os.path.dirname(__file__), "users.json")
def load_users():
    try:
        with open(USER_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    

def save_users(data):
    with open(USER_FILE, "w") as f:
        json.dump(data, f, indent=2)

def get_remaining_calories(user, meal):
    meal_info = user["meals"].get(meal, {})
    return meal_info.get("calories_allocated", 0) - meal_info.get("calories_eaten", 0)

def update_meal_calories(user, meal, food):
    user["meals"][meal]["calories_eaten"] += food["calories"]
    user["meals"][meal]["protein_eaten"] += food.get("protein", 0)
    user["meals"][meal]["carbohydrates_eaten"] += food.get("carbohydrates", 0)
    user["meals"][meal]["fat_eaten"] += food.get("fat", 0)
    user["nutrients_eaten"]["protein"] += food.get("protein", 0)
    user["nutrients_eaten"]["carbohydrates"] += food.get("carbohydrates", 0)
    user["nutrients_eaten"]["fat"] += food.get("fat", 0)

def get_meal_context(user, meal):
    """Get context about what the user has eaten and preferences"""
    meal_data = user["meals"][meal]
    
    # Calculate remaining macros
    remaining_calories = get_remaining_calories(user, meal)
    
    # Get preference patterns
    liked_foods = set(meal_data.get("liked", []))
    disliked_foods = set(meal_data.get("disliked", []))
    
    # Analyze what they've eaten today across all meals
    total_protein_eaten = user["nutrients_eaten"]["protein"]
    total_carbs_eaten = user["nutrients_eaten"]["carbohydrates"]
    total_fat_eaten = user["nutrients_eaten"]["fat"]
    
    protein_goal = user["nutrient_goals"]["protein"]
    carbs_goal = user["nutrient_goals"]["carbohydrates"]
    fat_goal = user["nutrient_goals"]["fat"]
    
    # Calculate what macros they need more of
    protein_ratio = total_protein_eaten / protein_goal if protein_goal > 0 else 0
    carbs_ratio = total_carbs_eaten / carbs_goal if carbs_goal > 0 else 0
    fat_ratio = total_fat_eaten / fat_goal if fat_goal > 0 else 0
    
    return {
        "remaining_calories": remaining_calories,
        "liked_foods": liked_foods,
        "disliked_foods": disliked_foods,
        "macro_needs": {
            "protein": protein_ratio < 0.8,  # Need more protein if less than 80% of goal
            "carbs": carbs_ratio < 0.8,
            "fat": fat_ratio < 0.8
        },
        "macro_ratios": {
            "protein": protein_ratio,
            "carbs": carbs_ratio,
            "fat": fat_ratio
        }
    }