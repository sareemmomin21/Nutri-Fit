from flask import Flask, request, jsonify
import json
import os
from flask_cors import CORS
from usda_utils import query_usda_foods

app = Flask(__name__)
USER_FILE = os.path.join(os.path.dirname(__file__), "users.json")
CORS(app)

@app.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Flask!"})

def load_users():
    with open(USER_FILE, "r") as f:
        return json.load(f)

def save_users(data):
    with open(USER_FILE, "w") as f:
        json.dump(data, f, indent=2)

# def create_new_user(calorie_goal=2000):
#     return {
#         "calorie_goal": calorie_goal,
#         "nutrient_goals": {
#             "protein": 150,
#             "carbohydrates": 275,
#             "fat": 70
#         },
#         "nutrients_eaten": {
#             "protein": 0,
#             "carbohydrates": 0,
#             "fat": 0
#         },
#         "meals": {
#             "breakfast": {
#                 "calories_allocated": int(calorie_goal * 0.25),
#                 "calories_eaten": 0,
#                 "protein_eaten": 0,
#                 "carbohydrates_eaten": 0,
#                 "fat_eaten": 0,
#                 "liked": [],
#                 "disliked": []
#             },
#             "lunch": {
#                 "calories_allocated": int(calorie_goal * 0.30),
#                 "calories_eaten": 0,
#                 "protein_eaten": 0,
#                 "carbohydrates_eaten": 0,
#                 "fat_eaten": 0,
#                 "liked": [],
#                 "disliked": []
#             },
#             "dinner": {
#                 "calories_allocated": int(calorie_goal * 0.35),
#                 "calories_eaten": 0,
#                 "protein_eaten": 0,
#                 "carbohydrates_eaten": 0,
#                 "fat_eaten": 0,
#                 "liked": [],
#                 "disliked": []
#             },
#             "snacks": {
#                 "calories_allocated": int(calorie_goal * 0.10),
#                 "calories_eaten": 0,
#                 "protein_eaten": 0,
#                 "carbohydrates_eaten": 0,
#                 "fat_eaten": 0,
#                 "liked": [],
#                 "disliked": []
#             }
#         }
#     }

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

@app.route("/get_suggestion", methods=["POST"])
def get_suggestion():
    data = request.json
    user_id = data["user_id"]
    meal = data.get("meal", "breakfast")

    users = load_users()
    user = users.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user["meals"][meal]["calories_eaten"] >= user["meals"][meal]["calories_allocated"] * 0.9:
        return jsonify([])

    remaining = get_remaining_calories(user, meal)
    disliked = set(user["meals"][meal]["disliked"])

    all_foods = query_usda_foods(meal, calories_target=remaining, max_results=30)
    undesired_keywords = ["school lunch", "cafeteria", "NFS"]

    filtered_foods = [
        f for f in all_foods
        if not any(keyword.lower() in f["name"].lower() for keyword in undesired_keywords)
    ]

    min_cals = remaining * 0.85
    max_cals = remaining * 1.15

    valid = [f for f in filtered_foods if f["name"] not in disliked and min_cals <= f["calories"] <= max_cals]
    if valid:
        return jsonify(valid[:1])

    for i in range(len(filtered_foods)):
        for j in range(i + 1, len(filtered_foods)):
            f1, f2 = filtered_foods[i], filtered_foods[j]
            total = f1["calories"] + f2["calories"]
            if (
                f1["name"] not in disliked and
                f2["name"] not in disliked and
                min_cals <= total <= max_cals
            ):
                return jsonify([f1, f2])

    close_fit = [
        f for f in filtered_foods if f["name"] not in disliked and min_cals <= f["calories"] <= max_cals
    ]
    if close_fit:
        return jsonify(close_fit[:1])

    fallback = [f for f in filtered_foods if f["name"] not in disliked and f["calories"] >= 100]
    if fallback:
        best = sorted(fallback, key=lambda x: abs(x["calories"] - remaining))[0]
        return jsonify([best])

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

    if liked is True and food_name not in meal_data["liked"]:
        meal_data["liked"].append(food_name)
    elif liked is False and food_name not in meal_data["disliked"]:
        meal_data["disliked"].append(food_name)

    if ate:
        update_meal_calories(user, meal, food_nutrients)

    save_users(users)
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(debug=True)