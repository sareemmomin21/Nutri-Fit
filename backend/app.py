from flask import Flask, request, jsonify
from flask_cors import CORS
from usda_utils import query_usda_foods, create_balanced_meal
from user_utils import get_meal_context
from food_utils import filter_and_score_foods
from database import (
    init_db, get_user_data, get_daily_totals,
    get_meal_progress, reset_day, update_meal_nutrition,
    update_food_preference, get_remaining_calories,
    create_user, authenticate_user, update_user_profile,
    get_user_profile, get_user_food_preferences
)

app = Flask(__name__)
CORS(app)

@app.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Flask!"})

# Authentication endpoints
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")
    email = data.get("email", "").strip()
    
    # Basic validation
    if not username or len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400
    
    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    # Create user
    user_id, error = create_user(username, password, email if email else None)
    
    if error:
        return jsonify({"error": error}), 400
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "message": "Account created successfully"
    })

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    
    user_id, profile_completed = authenticate_user(username, password)
    
    if not user_id:
        return jsonify({"error": "Invalid username or password"}), 401
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "profile_completed": profile_completed
    })

# Profile management endpoints
@app.route("/api/complete_profile", methods=["POST"])
def complete_profile():
    data = request.json
    user_id = data.get("user_id")
    
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
    
    # Validate required fields
    required_fields = ['first_name', 'last_name', 'date_of_birth', 'gender', 
                      'height_cm', 'weight_lb', 'activity_level']
    
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field.replace('_', ' ').title()} is required"}), 400
    
    try:
        # Validate data types
        data['height_cm'] = float(data['height_cm'])
        data['weight_lb'] = float(data['weight_lb'])
        
        if data.get('workout_frequency'):
            data['workout_frequency'] = int(data['workout_frequency'])
        if data.get('workout_duration'):
            data['workout_duration'] = int(data['workout_duration'])
            
        # Update profile
        update_user_profile(user_id, data)
        
        return jsonify({"success": True, "message": "Profile completed successfully"})
        
    except ValueError as e:
        return jsonify({"error": "Invalid data format"}), 400
    except Exception as e:
        print(f"Error completing profile: {e}")
        return jsonify({"error": "Failed to update profile"}), 500

@app.route("/api/get_profile", methods=["POST"])
def get_profile():
    data = request.json
    user_id = data.get("user_id")
    
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
    
    try:
        profile = get_user_profile(user_id)
        if not profile:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify(profile)
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return jsonify({"error": "Failed to fetch profile"}), 500

@app.route("/api/update_profile", methods=["POST"])
def update_profile():
    data = request.json
    user_id = data.get("user_id")
    
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
    
    try:
        # Update profile (same function as complete_profile)
        update_user_profile(user_id, data)
        return jsonify({"success": True, "message": "Profile updated successfully"})
    except Exception as e:
        print(f"Error updating profile: {e}")
        return jsonify({"error": "Failed to update profile"}), 500

@app.route("/api/get_food_preferences", methods=["POST"])
def get_food_preferences():
    data = request.json
    user_id = data.get("user_id")
    
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
    
    try:
        preferences, meal_preferences = get_user_food_preferences(user_id)
        return jsonify({
            "overall_preferences": preferences,
            "meal_preferences": meal_preferences
        })
    except Exception as e:
        print(f"Error fetching food preferences: {e}")
        return jsonify({"error": "Failed to fetch preferences"}), 500

# Existing endpoints with user validation
@app.route("/get_suggestion", methods=["POST"])
def get_suggestion():
    data = request.json
    user_id = data["user_id"]
    meal = data.get("meal", "breakfast")

    # Get user data from database
    user = get_user_data(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if user is close to meal calorie limit
    remaining_calories = get_remaining_calories(user_id, meal)
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
   
    try:
        reset_day(user_id)
        return jsonify({"status": "day_reset"})
    except Exception as e:
        print(f"Error resetting day: {e}")
        return jsonify({"error": "Failed to reset day"}), 500


@app.route("/get_daily_summary", methods=["POST"])
def get_daily_summary():
    """Combined endpoint for daily totals and nutrients"""
    data = request.json
    user_id = data["user_id"]
   
    try:
        daily_data = get_daily_totals(user_id)
        return jsonify(daily_data)
    except Exception as e:
        print(f"Error fetching daily summary: {e}")
        return jsonify({"error": "User not found"}), 404


# Keep legacy endpoints for backward compatibility
@app.route("/get_daily_total", methods=["POST"])
def get_daily_total():
    """Legacy endpoint - now uses combined data"""
    data = request.json
    user_id = data["user_id"]
   
    try:
        daily_data = get_daily_totals(user_id)
        return jsonify({"total_eaten": daily_data["total_eaten"]})
    except Exception as e:
        print(f"Error fetching daily total: {e}")
        return jsonify({"error": "User not found"}), 404


@app.route("/get_daily_nutrients", methods=["POST"])
def get_daily_nutrients():
    """Legacy endpoint - now uses combined data"""
    data = request.json
    user_id = data["user_id"]
   
    try:
        daily_data = get_daily_totals(user_id)
        return jsonify(daily_data["nutrients"])
    except Exception as e:
        print(f"Error fetching daily nutrients: {e}")
        return jsonify({"error": "User not found"}), 404


@app.route("/get_meal_progress", methods=["POST"])
def get_meal_progress_endpoint():
    """Get detailed meal progress"""
    data = request.json
    user_id = data["user_id"]
   
    try:
        meal_progress = get_meal_progress(user_id)
        return jsonify(meal_progress)
    except Exception as e:
        print(f"Error fetching meal progress: {e}")
        return jsonify({"error": "User not found"}), 404


@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.json
    user_id = data["user_id"]
    food_name = data["food"]
    liked = data.get("liked")
    meal = data.get("meal", "breakfast")
    ate = data.get("ate", False)

    food_nutrients = {
        "calories": data.get("calories", 0),
        "protein": data.get("protein", 0),
        "carbohydrates": data.get("carbohydrates", 0),
        "fat": data.get("fat", 0)
    }

    try:
        # Handle preferences
        if liked is not None:
            update_food_preference(user_id, meal, food_name, liked)

        # Handle eating the food
        if ate:
            update_meal_nutrition(user_id, meal, food_nutrients)

        return jsonify({"status": "success"})
    except Exception as e:
        print(f"Error processing feedback: {e}")
        return jsonify({"error": "Failed to process feedback"}), 500


if __name__ == "__main__":
    init_db()
    app.run(debug=True)