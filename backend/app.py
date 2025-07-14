from flask import Flask, request, jsonify
import json
import os
from flask_cors import CORS
from usda_utils import query_usda_foods, create_balanced_meal
from user_utils import (
    load_users, save_users,
    get_remaining_calories,
    update_meal_calories,
    get_meal_context
)
from food_utils import filter_and_score_foods


app = Flask(__name__)
USER_FILE = os.path.join(os.path.dirname(__file__), "users.json")
CORS(app)

@app.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Flask!"})




@app.route("/get_suggestion", methods=["POST"])
def get_suggestion():
    data = request.json
    user_id = data["user_id"]
    meal = data.get("meal", "breakfast")

    users = load_users()
    user = users.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if user is close to meal calorie limit
    remaining_calories = get_remaining_calories(user, meal)
    if remaining_calories <= 50:  # Very little calories left
        return jsonify([])

    # Get meal context for smarter suggestions
    meal_context = get_meal_context(user, meal)
    
    # Use the enhanced food querying
    try:
        # First try to create a balanced meal
        balanced_meal = create_balanced_meal(
            meal, 
            remaining_calories, 
            meal_context["disliked_foods"]
        )
        
        if balanced_meal:
            # Score and filter the balanced meal components
            scored_foods = filter_and_score_foods(balanced_meal, meal_context, meal)
            
            # Verify total calories are reasonable
            total_calories = sum(food["calories"] for food in scored_foods)
            if total_calories <= remaining_calories * 1.2:  # Within 20% of target
                return jsonify(scored_foods)
        
        # Fallback to original method with improvements
        all_foods = query_usda_foods(meal, calories_target=remaining_calories, max_results=30)
        
        # Filter and score foods
        scored_foods = filter_and_score_foods(all_foods, meal_context, meal)
        
        if not scored_foods:
            return jsonify([])
        
        # Try to find single food that fits well
        min_cals = remaining_calories * 0.8
        max_cals = remaining_calories * 1.2
        
        suitable_single = [f for f in scored_foods if min_cals <= f["calories"] <= max_cals]
        if suitable_single:
            return jsonify(suitable_single[:1])
        
        # Try to find two foods that combine well
        for i in range(len(scored_foods)):
            for j in range(i + 1, len(scored_foods)):
                f1, f2 = scored_foods[i], scored_foods[j]
                total_cals = f1["calories"] + f2["calories"]
                if min_cals <= total_cals <= max_cals:
                    return jsonify([f1, f2])
        
        # Fallback to best single food
        if scored_foods:
            best_food = scored_foods[0]
            return jsonify([best_food])
            
    except Exception as e:
        print(f"Error in get_suggestion: {e}")
        return jsonify([])

    return jsonify([])

@app.route("/next_day", methods=["POST"])
def next_day():
    data = request.json
    user_id = data["user_id"]
    users = load_users()

    if user_id not in users:
        return jsonify({"error": "User not found"}), 404

    user = users[user_id]
    for meal_data in user["meals"].values():
        meal_data["calories_eaten"] = 0
        meal_data["protein_eaten"] = 0
        meal_data["carbohydrates_eaten"] = 0
        meal_data["fat_eaten"] = 0

    user["nutrients_eaten"] = {"protein": 0, "carbohydrates": 0, "fat": 0}

    save_users(users)
    return jsonify({"status": "day_reset"})

@app.route("/get_daily_total", methods=["POST"])
def get_daily_total():
    data = request.json
    user_id = data["user_id"]
    users = load_users()

    if user_id not in users:
        return jsonify({"error": "User not found"}), 404

    user = users[user_id]
    total = sum(m["calories_eaten"] for m in user["meals"].values())
    return jsonify({"total_eaten": total})

@app.route("/get_daily_nutrients", methods=["POST"])
def get_daily_nutrients():
    data = request.json
    user_id = data["user_id"]
    users = load_users()

    if user_id not in users:
        return jsonify({"error": "User not found"}), 404

    user = users[user_id]
    return jsonify(user["nutrients_eaten"])

@app.route("/get_meal_progress", methods=["POST"])
def get_meal_progress():
    """New endpoint to get detailed meal progress"""
    data = request.json
    user_id = data["user_id"]
    users = load_users()

    if user_id not in users:
        return jsonify({"error": "User not found"}), 404

    user = users[user_id]
    meal_progress = {}
    
    for meal_name, meal_data in user["meals"].items():
        meal_progress[meal_name] = {
            "calories_allocated": meal_data["calories_allocated"],
            "calories_eaten": meal_data["calories_eaten"],
            "calories_remaining": meal_data["calories_allocated"] - meal_data["calories_eaten"],
            "protein_eaten": meal_data["protein_eaten"],
            "carbohydrates_eaten": meal_data["carbohydrates_eaten"],
            "fat_eaten": meal_data["fat_eaten"],
            "progress_percentage": (meal_data["calories_eaten"] / meal_data["calories_allocated"]) * 100 if meal_data["calories_allocated"] > 0 else 0
        }
    
    return jsonify(meal_progress)

@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.json
    user_id = data["user_id"]
    food_name = data["food"]
    liked = data.get("liked")
    meal = data.get("meal", "breakfast")
    calories = data.get("calories", 0)
    ate = data.get("ate", False)

    food_nutrients = {
        "calories": data.get("calories", 0),
        "protein": data.get("protein", 0),
        "carbohydrates": data.get("carbohydrates", 0),
        "fat": data.get("fat", 0)
    }

    users = load_users()

    if user_id not in users:
        return jsonify({"error": "User not found"}), 404

    user = users[user_id]
    meal_data = user["meals"][meal]

    # Handle preferences
    if liked is True:
        if food_name not in meal_data["liked"]:
            meal_data["liked"].append(food_name)
        # Remove from disliked if it was there
        if food_name in meal_data["disliked"]:
            meal_data["disliked"].remove(food_name)
    elif liked is False:
        if food_name not in meal_data["disliked"]:
            meal_data["disliked"].append(food_name)
        # Remove from liked if it was there
        if food_name in meal_data["liked"]:
            meal_data["liked"].remove(food_name)

    # Handle eating the food
    if ate:
        update_meal_calories(user, meal, food_nutrients)

    save_users(users)
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(debug=True)