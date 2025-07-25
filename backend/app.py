from flask import Flask, request, jsonify
from flask_cors import CORS
from nutrition_utils import (
    search_food_autocomplete, search_food_comprehensive, scale_food_nutrition,
    get_meal_suggestions
)
from database import (
    init_db, get_user_profile, get_daily_totals, get_meal_progress,
    reset_day, create_user, authenticate_user, update_user_profile,
    get_user_food_preferences, add_user_custom_food, get_user_custom_foods,
    add_food_to_current_meal, remove_food_from_current_meal, get_current_meal_items,
    update_food_preference, get_meal_history, get_daily_history, get_meal_history_by_day,
    ensure_user_exists, get_day_display_info, get_daily_data_for_day, get_user_current_day,
    get_globally_disliked_foods,
    # Fitness database functions
    add_workout_session, get_workout_history, get_exercise_performance_history,
    save_workout_plan, get_active_workout_plan, get_fitness_dashboard_data,
    get_fitness_goals, update_fitness_goal_progress, add_fitness_goal,
    get_combined_dashboard_data, init_fitness_tables
)

from fitness_utils import (
    get_workout_recommendations, get_workout_plan, calculate_calories_burned,
    get_recovery_recommendations, generate_workout_stats, create_custom_workout,
    get_exercise_tips, get_workout_difficulty_progression
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
        # Only update the fields that were provided, don't overwrite everything
        update_data = {k: v for k, v in data.items() if k != "user_id"}
        update_user_profile(user_id, update_data, partial_update=True)
        return jsonify({"success": True, "message": "Profile updated successfully"})
    except Exception as e:
        print(f"Error updating profile: {e}")
        return jsonify({"error": "Failed to update profile"}), 500

# Enhanced food search endpoints with USDA integration
@app.route("/api/search_food_autocomplete", methods=["POST"])
def search_food_autocomplete_endpoint():
    data = request.json
    query = data.get("query", "").strip()
    user_id = data.get("user_id")
   
    if len(query) < 2:
        return jsonify([])
   
    try:
        # Get autocomplete suggestions from all sources including USDA
        suggestions = search_food_autocomplete(query)
       
        # Add user's custom foods
        if user_id:
            custom_foods = get_user_custom_foods(user_id, query)
            for food in custom_foods:
                suggestions.insert(0, {
                    'name': food['name'],
                    'source': 'user_custom',
                    'serving': food['serving']
                })
       
        return jsonify(suggestions[:10])
    except Exception as e:
        print(f"Error in autocomplete search: {e}")
        return jsonify([])

@app.route("/api/search_food", methods=["POST"])
def search_food_endpoint():
    data = request.json
    query = data.get("query", "").strip()
    user_id = data.get("user_id")
   
    if not query:
        return jsonify({"error": "Search query required"}), 400
   
    try:
        # Search using comprehensive search (includes USDA)
        results = search_food_comprehensive(query)
       
        # Add user's custom foods if they match
        if user_id:
            custom_foods = get_user_custom_foods(user_id, query)
            for food in custom_foods:
                results.insert(0, food)
       
        return jsonify(results)
    except Exception as e:
        print(f"Error searching food: {e}")
        return jsonify({"error": "Failed to search food"}), 500

@app.route("/api/scale_food", methods=["POST"])
def scale_food():
    """Scale food nutrition by quantity and serving size"""
    data = request.json
    food_data = data.get("food_data")
    quantity = data.get("quantity", 1)
    serving_size = data.get("serving_size")
   
    if not food_data:
        return jsonify({"error": "Food data required"}), 400
   
    try:
        scaled_food = scale_food_nutrition(food_data, quantity, serving_size)
        return jsonify(scaled_food)
    except Exception as e:
        print(f"Error scaling food: {e}")
        return jsonify({"error": "Failed to scale food"}), 500

# Enhanced meal suggestions with better filtering
@app.route("/api/get_meal_suggestions", methods=["POST"])
def get_meal_suggestions_endpoint():
    data = request.json
    meal_type = data.get("meal_type", "breakfast")
    user_id = data.get("user_id")
   
    try:
        # Get more suggestions initially to account for filtering
        suggestions = get_meal_suggestions(meal_type, max_results=15)
       
        # Filter based on user preferences if available
        if user_id:
            from database import get_globally_disliked_foods
           
            # Get all globally disliked foods
            disliked_foods = set(get_globally_disliked_foods(user_id))
           
            filtered_suggestions = []
           
            for suggestion in suggestions:
                # Skip globally disliked foods (case insensitive)
                suggestion_name_lower = suggestion['name'].lower()
                is_disliked = any(
                    disliked.lower() in suggestion_name_lower or
                    suggestion_name_lower in disliked.lower()
                    for disliked in disliked_foods
                )
               
                if not is_disliked:
                    filtered_suggestions.append(suggestion)
               
                # Stop when we have enough suggestions
                if len(filtered_suggestions) >= 3:
                    break
           
            return jsonify(filtered_suggestions[:3])
       
        return jsonify(suggestions[:3])
    except Exception as e:
        print(f"Error getting meal suggestions: {e}")
        return jsonify([])

# Current meal management - OPTIMIZED
@app.route("/api/add_food_to_meal", methods=["POST"])
def add_food_to_meal():
    """Add food to current meal"""
    data = request.json
    user_id = data.get("user_id")
    meal_type = data.get("meal_type")
    food_data = data.get("food_data")
   
    if not all([user_id, meal_type, food_data]):
        return jsonify({"error": "User ID, meal type, and food data required"}), 400
   
    try:
        ensure_user_exists(user_id)
        add_food_to_current_meal(user_id, meal_type, food_data)
        return jsonify({"success": True, "message": "Food added to meal"})
    except Exception as e:
        print(f"Error adding food to meal: {e}")
        return jsonify({"error": "Failed to add food to meal"}), 500

@app.route("/api/remove_food_from_meal", methods=["POST"])
def remove_food_from_meal():
    """Remove food from current meal"""
    data = request.json
    user_id = data.get("user_id")
    meal_item_id = data.get("meal_item_id")
   
    if not all([user_id, meal_item_id]):
        return jsonify({"error": "User ID and meal item ID required"}), 400
   
    try:
        remove_food_from_current_meal(user_id, meal_item_id)
        return jsonify({"success": True, "message": "Food removed from meal"})
    except Exception as e:
        print(f"Error removing food from meal: {e}")
        return jsonify({"error": "Failed to remove food from meal"}), 500

@app.route("/api/get_current_meal", methods=["POST"])
def get_current_meal():
    """Get current meal items - OPTIMIZED"""
    data = request.json
    user_id = data.get("user_id")
    meal_type = data.get("meal_type")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        ensure_user_exists(user_id)
        items = get_current_meal_items(user_id, meal_type)
       
        if meal_type:
            return jsonify(items)
        else:
            # Group by meal type
            meals = {}
            for item in items:
                meal = item['meal_type']
                if meal not in meals:
                    meals[meal] = []
                meals[meal].append(item)
            return jsonify(meals)
           
    except Exception as e:
        print(f"Error getting current meal: {e}")
        return jsonify({"error": "Failed to get current meal"}), 500

# Food preferences
@app.route("/api/update_food_preference", methods=["POST"])
def update_food_preference_endpoint():
    """Update food preference (like/dislike)"""
    data = request.json
    user_id = data.get("user_id")
    meal_type = data.get("meal_type")
    food_name = data.get("food_name")
    liked = data.get("liked")
   
    if not all([user_id, meal_type, food_name]) or liked is None:
        return jsonify({"error": "User ID, meal type, food name, and liked status required"}), 400
   
    try:
        update_food_preference(user_id, meal_type, food_name, liked)
        return jsonify({"success": True, "message": "Food preference updated"})
    except Exception as e:
        print(f"Error updating food preference: {e}")
        return jsonify({"error": "Failed to update food preference"}), 500

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

# Custom foods
@app.route("/api/add_custom_food", methods=["POST"])
def add_custom_food():
    """Add a custom food for the user"""
    data = request.json
    user_id = data.get("user_id")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    # Validate required fields
    required_fields = ['name', 'calories', 'protein', 'carbohydrates', 'fat']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400
   
    try:
        # Validate numeric fields
        food_data = {
            'name': data['name'].strip(),
            'calories': float(data['calories']),
            'protein': float(data['protein']),
            'carbohydrates': float(data['carbohydrates']),
            'fat': float(data['fat']),
            'serving_size': data.get('serving_size', 'serving'),
            'available_servings': data.get('available_servings', ['serving'])
        }
       
        add_user_custom_food(user_id, food_data)
       
        return jsonify({"success": True, "message": "Custom food added successfully"})
    except ValueError:
        return jsonify({"error": "Invalid numeric values"}), 400
    except Exception as e:
        print(f"Error adding custom food: {e}")
        return jsonify({"error": "Failed to add custom food"}), 500

@app.route("/api/get_custom_foods", methods=["POST"])
def get_custom_foods():
    """Get user's custom foods"""
    data = request.json
    user_id = data.get("user_id")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        custom_foods = get_user_custom_foods(user_id)
        return jsonify(custom_foods)
    except Exception as e:
        print(f"Error fetching custom foods: {e}")
        return jsonify({"error": "Failed to fetch custom foods"}), 500

# OPTIMIZED Progress and summary endpoints
@app.route("/get_daily_summary", methods=["POST"])
def get_daily_summary():
    """Combined endpoint for daily totals and nutrients - OPTIMIZED"""
    data = request.json
    user_id = data["user_id"]
   
    try:
        ensure_user_exists(user_id)
        daily_data = get_daily_totals(user_id)
        return jsonify(daily_data)
    except Exception as e:
        print(f"Error fetching daily summary: {e}")
        return jsonify({"error": "User not found"}), 404

@app.route("/get_meal_progress", methods=["POST"])
def get_meal_progress_endpoint():
    """Get detailed meal progress - OPTIMIZED"""
    data = request.json
    user_id = data["user_id"]
   
    try:
        ensure_user_exists(user_id)
        meal_progress = get_meal_progress(user_id)
        return jsonify(meal_progress)
    except Exception as e:
        print(f"Error fetching meal progress: {e}")
        return jsonify({"error": "User not found"}), 404

# SESSION-BASED Day management
@app.route("/next_day", methods=["POST"])
def next_day():
    data = request.json
    user_id = data["user_id"]
   
    try:
        new_day_number = reset_day(user_id)
        return jsonify({
            "status": "day_reset",
            "new_day": new_day_number,
            "message": f"Started day {new_day_number}"
        })
    except Exception as e:
        print(f"Error resetting day: {e}")
        return jsonify({"error": "Failed to reset day"}), 500

# SESSION-BASED History endpoints
@app.route("/api/get_navigation_info", methods=["POST"])
def get_navigation_info():
    """Get navigation info for day browsing - SESSION-BASED"""
    data = request.json
    user_id = data.get("user_id")
    target_day = data.get("target_day")  # Optional, defaults to current day
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        nav_info = get_day_display_info(user_id, target_day)
        return jsonify(nav_info)
    except Exception as e:
        print(f"Error getting navigation info: {e}")
        return jsonify({"error": "Failed to get navigation info"}), 500

@app.route("/api/get_day_data", methods=["POST"])
def get_day_data():
    """Get complete data for a specific day - SESSION-BASED"""
    data = request.json
    user_id = data.get("user_id")
    target_day = data.get("target_day")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    # If no target_day specified, use current day
    if target_day is None:
        target_day = get_user_current_day(user_id)
   
    try:
        day_data = get_daily_data_for_day(user_id, target_day)
        return jsonify(day_data)
    except Exception as e:
        print(f"Error getting day data: {e}")
        return jsonify({"error": "Failed to get day data"}), 500

@app.route("/api/get_daily_history", methods=["POST"])
def get_daily_history_endpoint():
    """Get daily history for analysis - SESSION-BASED"""
    data = request.json
    user_id = data.get("user_id")
    days_back = data.get("days_back", 7)
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        history = get_daily_history(user_id, days_back)
        return jsonify(history)
    except Exception as e:
        print(f"Error fetching daily history: {e}")
        return jsonify({"error": "Failed to fetch daily history"}), 500

@app.route("/api/get_meal_history", methods=["POST"])
def get_meal_history_endpoint():
    """Get meal history for specific day - SESSION-BASED"""
    data = request.json
    user_id = data.get("user_id")
    target_day = data.get("target_day")
    meal_type = data.get("meal_type")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    # If no target_day specified, use current day
    if target_day is None:
        target_day = get_user_current_day(user_id)
   
    try:
        history = get_meal_history(user_id, target_day, meal_type)
       
        if meal_type:
            # Format for specific meal
            items = []
            for item in history:
                items.append({
                    'name': item[0],
                    'quantity': item[1],
                    'serving_size': item[2],
                    'calories': item[3],
                    'protein': item[4],
                    'carbohydrates': item[5],
                    'fat': item[6],
                    'source': item[7] if len(item) > 7 else 'custom'
                })
            return jsonify(items)
        else:
            # Format for all meals
            meals = {}
            for item in history:
                meal = item[0]
                if meal not in meals:
                    meals[meal] = []
                meals[meal].append({
                    'name': item[1],
                    'quantity': item[2],
                    'serving_size': item[3],
                    'calories': item[4],
                    'protein': item[5],
                    'carbohydrates': item[6],
                    'fat': item[7],
                    'source': item[8] if len(item) > 8 else 'custom'
                })
            return jsonify(meals)
           
    except Exception as e:
        print(f"Error fetching meal history: {e}")
        return jsonify({"error": "Failed to fetch meal history"}), 500

@app.route("/api/get_meal_history_by_day", methods=["POST"])
def get_meal_history_by_day_endpoint():
    """Get detailed meal breakdown for a specific day - SESSION-BASED"""
    data = request.json
    user_id = data.get("user_id")
    target_day = data.get("target_day")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    # If no target_day specified, use current day
    if target_day is None:
        target_day = get_user_current_day(user_id)
   
    try:
        meals = get_meal_history_by_day(user_id, target_day)
        return jsonify(meals)
    except Exception as e:
        print(f"Error fetching meal history by day: {e}")
        return jsonify({"error": "Failed to fetch meal history"}), 500

# OPTIMIZED Homepage data endpoint
@app.route("/api/get_dashboard_data", methods=["POST"])
def get_dashboard_data():
    """Get all dashboard data in a single optimized call"""
    data = request.json
    user_id = data.get("user_id")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        # Get all required data in optimized calls
        profile = get_user_profile(user_id)
        daily_summary = get_daily_totals(user_id)
        daily_history = get_daily_history(user_id, 14)  # Last 14 days
        current_day = get_user_current_day(user_id)
        
        # Get fitness data for combined dashboard
        fitness_data = get_fitness_dashboard_data(user_id)
       
        return jsonify({
            "profile": profile,
            "today_summary": daily_summary,
            "daily_history": daily_history,
            "current_day": current_day,
            "fitness_data": fitness_data
        })
    except Exception as e:
        print(f"Error fetching dashboard data: {e}")
        return jsonify({"error": "Failed to fetch dashboard data"}), 500

# Legacy endpoints for backward compatibility
@app.route("/get_daily_total", methods=["POST"])
def get_daily_total():
    """Legacy endpoint - now uses combined data"""
    data = request.json
    user_id = data["user_id"]
   
    try:
        ensure_user_exists(user_id)
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
        ensure_user_exists(user_id)
        daily_data = get_daily_totals(user_id)
        return jsonify(daily_data["nutrients"])
    except Exception as e:
        print(f"Error fetching daily nutrients: {e}")
        return jsonify({"error": "User not found"}), 404

@app.route("/get_suggestion", methods=["POST"])
def get_suggestion():
    """Legacy suggestion endpoint"""
    data = request.json
    user_id = data["user_id"]
    meal = data.get("meal", "breakfast")
   
    try:
        ensure_user_exists(user_id)
        suggestions = get_meal_suggestions(meal, max_results=3)
        return jsonify(suggestions)
    except Exception as e:
        print(f"Error in get_suggestion: {e}")
        return jsonify([])

# Legacy feedback endpoint (now redirects to proper meal management)
@app.route("/feedback", methods=["POST"])
def feedback():
    """Legacy feedback endpoint - redirects to proper meal management"""
    data = request.json
    user_id = data["user_id"]
    food_name = data["food"]
    liked = data.get("liked")
    meal = data.get("meal", "breakfast")
    ate = data.get("ate", False)

    try:
        # Handle preferences
        if liked is not None:
            update_food_preference(user_id, meal, food_name, liked)

        # Handle eating the food - now adds to current meal
        if ate:
            food_data = {
                "name": food_name,
                "calories": data.get("calories", 0),
                "protein": data.get("protein", 0),
                "carbohydrates": data.get("carbohydrates", 0),
                "fat": data.get("fat", 0),
                "quantity": data.get("quantity", 1),
                "serving_size": data.get("serving_size", "serving"),
                "source": data.get("source", "custom")
            }
           
            add_food_to_current_meal(user_id, meal, food_data)

        return jsonify({"status": "success"})
    except Exception as e:
        print(f"Error processing feedback: {e}")
        return jsonify({"error": "Failed to process feedback"}), 500

# FITNESS ENDPOINTS

@app.route("/api/get_workout_recommendations", methods=["POST"])
def get_workout_recommendations_endpoint():
    """Get personalized workout recommendations"""
    data = request.json
    user_id = data.get("user_id")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        # Get user profile
        profile = get_user_profile(user_id)
        if not profile:
            return jsonify({"error": "User profile not found"}), 404
       
        # Get workout recommendations
        recommendations = get_workout_recommendations(profile)
       
        return jsonify(recommendations)
    except Exception as e:
        print(f"Error getting workout recommendations: {e}")
        return jsonify({"error": "Failed to get workout recommendations"}), 500

@app.route("/api/get_workout_plan", methods=["POST"])
def get_workout_plan_endpoint():
    """Get a weekly workout plan"""
    data = request.json
    user_id = data.get("user_id")
    days_per_week = data.get("days_per_week")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        profile = get_user_profile(user_id)
        if not profile:
            return jsonify({"error": "User profile not found"}), 404
       
        workout_plan = get_workout_plan(profile, days_per_week)
       
        return jsonify(workout_plan)
    except Exception as e:
        print(f"Error getting workout plan: {e}")
        return jsonify({"error": "Failed to get workout plan"}), 500

@app.route("/api/save_workout_plan", methods=["POST"])
def save_workout_plan_endpoint():
    """Save a workout plan for the user"""
    data = request.json
    user_id = data.get("user_id")
    plan_name = data.get("plan_name")
    plan_data = data.get("plan_data")
   
    if not all([user_id, plan_name, plan_data]):
        return jsonify({"error": "User ID, plan name, and plan data required"}), 400
   
    try:
        plan_id = save_workout_plan(user_id, plan_name, plan_data)
        return jsonify({"success": True, "plan_id": plan_id})
    except Exception as e:
        print(f"Error saving workout plan: {e}")
        return jsonify({"error": "Failed to save workout plan"}), 500

@app.route("/api/get_active_workout_plan", methods=["POST"])
def get_active_workout_plan_endpoint():
    """Get user's active workout plan"""
    data = request.json
    user_id = data.get("user_id")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        plan = get_active_workout_plan(user_id)
        return jsonify(plan)
    except Exception as e:
        print(f"Error getting active workout plan: {e}")
        return jsonify({"error": "Failed to get active workout plan"}), 500

@app.route("/api/complete_workout", methods=["POST"])
def complete_workout_endpoint():
    """Record a completed workout"""
    data = request.json
    user_id = data.get("user_id")
    workout_data = data.get("workout_data")
   
    if not all([user_id, workout_data]):
        return jsonify({"error": "User ID and workout data required"}), 400
   
    try:
        # Calculate calories burned based on user profile
        profile = get_user_profile(user_id)
        if profile and profile.get('weight_lb'):
            estimated_calories = calculate_calories_burned(
                workout_data.get('duration', 30),
                profile['weight_lb'],
                workout_data.get('intensity', 'moderate')
            )
            workout_data['calories_burned'] = estimated_calories
       
        # Save workout session
        session_id = add_workout_session(user_id, workout_data)
       
        return jsonify({
            "success": True,
            "session_id": session_id,
            "message": "Workout completed successfully!"
        })
    except Exception as e:
        print(f"Error completing workout: {e}")
        return jsonify({"error": "Failed to record workout"}), 500

@app.route("/api/get_workout_history", methods=["POST"])
def get_workout_history_endpoint():
    """Get user's workout history"""
    data = request.json
    user_id = data.get("user_id")
    days_back = data.get("days_back", 30)
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        history = get_workout_history(user_id, days_back)
        return jsonify(history)
    except Exception as e:
        print(f"Error getting workout history: {e}")
        return jsonify({"error": "Failed to get workout history"}), 500

@app.route("/api/get_exercise_performance", methods=["POST"])
def get_exercise_performance_endpoint():
    """Get exercise performance history"""
    data = request.json
    user_id = data.get("user_id")
    exercise_name = data.get("exercise_name")
    days_back = data.get("days_back", 90)
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        performance = get_exercise_performance_history(user_id, exercise_name, days_back)
        return jsonify(performance)
    except Exception as e:
        print(f"Error getting exercise performance: {e}")
        return jsonify({"error": "Failed to get exercise performance"}), 500

@app.route("/api/get_fitness_dashboard", methods=["POST"])
def get_fitness_dashboard_endpoint():
    """Get fitness dashboard data"""
    data = request.json
    user_id = data.get("user_id")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        dashboard_data = get_fitness_dashboard_data(user_id)
        return jsonify(dashboard_data)
    except Exception as e:
        print(f"Error getting fitness dashboard: {e}")
        return jsonify({"error": "Failed to get fitness dashboard"}), 500

@app.route("/api/get_recovery_recommendations", methods=["POST"])
def get_recovery_recommendations_endpoint():
    """Get recovery recommendations based on workout history"""
    data = request.json
    user_id = data.get("user_id")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        from datetime import datetime
        history = get_workout_history(user_id, 7)  # Last 7 days
        recommendations = get_recovery_recommendations(history, datetime.now())
        return jsonify(recommendations)
    except Exception as e:
        print(f"Error getting recovery recommendations: {e}")
        return jsonify({"error": "Failed to get recovery recommendations"}), 500

@app.route("/api/get_exercise_tips", methods=["POST"])
def get_exercise_tips_endpoint():
    """Get form tips and safety advice for exercises"""
    data = request.json
    exercise_name = data.get("exercise_name")
   
    if not exercise_name:
        return jsonify({"error": "Exercise name required"}), 400
   
    try:
        tips = get_exercise_tips(exercise_name)
        return jsonify(tips)
    except Exception as e:
        print(f"Error getting exercise tips: {e}")
        return jsonify({"error": "Failed to get exercise tips"}), 500


@app.route("/api/save_custom_workout", methods=["POST"])
def save_custom_workout_endpoint():
    """Save a custom workout to user's library"""
    data = request.json
    user_id = data.get("user_id")
    workout_data = data.get("workout_data")
    
    if not all([user_id, workout_data]):
        return jsonify({"error": "User ID and workout data required"}), 400
   
    try:
        # Save as a workout plan
        plan_id = save_workout_plan(user_id, workout_data.get('name', 'Custom Workout'), workout_data)
        
        return jsonify({
            "success": True,
            "plan_id": plan_id,
            "message": "Custom workout saved to your library!"
        })
    except Exception as e:
        print(f"Error saving custom workout: {e}")
        return jsonify({"error": "Failed to save custom workout"}), 500


@app.route("/api/get_workout_stats", methods=["POST"])
def get_workout_stats_endpoint():
    """Get workout statistics for a period"""
    data = request.json
    user_id = data.get("user_id")
    days_back = data.get("days_back", 30)
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        history = get_workout_history(user_id, days_back)
        stats = generate_workout_stats(history, days_back)
        return jsonify(stats)
    except Exception as e:
        print(f"Error getting workout stats: {e}")
        return jsonify({"error": "Failed to get workout stats"}), 500

@app.route("/api/add_fitness_goal", methods=["POST"])
def add_fitness_goal_endpoint():
    """Add a new fitness goal"""
    data = request.json
    user_id = data.get("user_id")
    goal_type = data.get("goal_type")
    goal_value = data.get("goal_value")
    target_date = data.get("target_date")
   
    if not all([user_id, goal_type, goal_value]):
        return jsonify({"error": "User ID, goal type, and goal value required"}), 400
   
    try:
        goal_id = add_fitness_goal(user_id, goal_type, goal_value, target_date)
        return jsonify({"success": True, "goal_id": goal_id})
    except Exception as e:
        print(f"Error adding fitness goal: {e}")
        return jsonify({"error": "Failed to add fitness goal"}), 500

@app.route("/api/get_fitness_goals", methods=["POST"])
def get_fitness_goals_endpoint():
    """Get user's fitness goals"""
    data = request.json
    user_id = data.get("user_id")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        goals = get_fitness_goals(user_id)
        return jsonify(goals)
    except Exception as e:
        print(f"Error getting fitness goals: {e}")
        return jsonify({"error": "Failed to get fitness goals"}), 500

@app.route("/api/update_fitness_goal", methods=["POST"])
def update_fitness_goal_endpoint():
    """Update progress on a fitness goal"""
    data = request.json
    user_id = data.get("user_id")
    goal_id = data.get("goal_id")
    current_value = data.get("current_value")
   
    if not all([user_id, goal_id, current_value is not None]):
        return jsonify({"error": "User ID, goal ID, and current value required"}), 400
   
    try:
        update_fitness_goal_progress(user_id, goal_id, current_value)
        return jsonify({"success": True, "message": "Goal progress updated"})
    except Exception as e:
        print(f"Error updating fitness goal: {e}")
        return jsonify({"error": "Failed to update fitness goal"}), 500

@app.route("/api/get_combined_dashboard", methods=["POST"])
def get_combined_dashboard_endpoint():
    """Get combined nutrition and fitness dashboard data"""
    data = request.json
    user_id = data.get("user_id")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        combined_data = get_combined_dashboard_data(user_id)
        return jsonify(combined_data)
    except Exception as e:
        print(f"Error getting combined dashboard: {e}")
        return jsonify({"error": "Failed to get combined dashboard"}), 500

@app.route("/api/get_progression_suggestions", methods=["POST"])
def get_progression_suggestions_endpoint():
    """Get workout progression suggestions"""
    data = request.json
    user_id = data.get("user_id")
    workout_type = data.get("workout_type", "strength")
   
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
   
    try:
        profile = get_user_profile(user_id)
        if not profile:
            return jsonify({"error": "User profile not found"}), 404
       
        current_level = profile.get('fitness_experience', 'beginner')
        suggestions = get_workout_difficulty_progression(current_level, workout_type)
       
        return jsonify({"suggestions": suggestions})
    except Exception as e:
        print(f"Error getting progression suggestions: {e}")
        return jsonify({"error": "Failed to get progression suggestions"}), 500

# Add these new endpoints to your existing app.py

# Replace the existing custom workout endpoint in app.py with this updated version

@app.route("/api/create_custom_workout", methods=["POST"])
def create_custom_workout_endpoint():
    """Create a custom workout from user input and save it properly"""
    data = request.json
    user_id = data.get("user_id")
    workout_name = data.get("workout_name")
    exercises = data.get("exercises", [])
    estimated_calories = data.get("estimated_calories")
    estimated_duration = data.get("estimated_duration")
    workout_type = data.get("workout_type", "strength")
    intensity = data.get("intensity", "moderate")
    
    if not all([user_id, workout_name]):
        return jsonify({"error": "User ID and workout name required"}), 400
    
    try:
        profile = get_user_profile(user_id)
        if not profile:
            return jsonify({"error": "User profile not found"}), 404
        
        # Create custom workout data with proper structure
        custom_workout_data = {
            'name': workout_name,
            'type': workout_type,
            'exercises': exercises,
            'duration': estimated_duration or 30,
            'calories_burned': estimated_calories or 200,
            'intensity': intensity,
            'equipment': ['custom'],  # Mark as custom equipment
            'muscle_groups': ['custom'],
            'created_by_user': True,
            'difficulty_level': intensity
        }
        
        # If exercises provided, enhance the workout data
        if exercises:
            from fitness_utils import create_custom_workout
            enhanced_workout = create_custom_workout(exercises, profile)
            if enhanced_workout:
                # Update with calculated values but keep user's estimates as primary
                custom_workout_data.update({
                    'equipment': enhanced_workout.get('equipment', ['none']),
                    'muscle_groups': enhanced_workout.get('muscle_groups', ['full_body'])
                })
                # Use calculated duration only if user didn't provide one
                if not estimated_duration:
                    custom_workout_data['duration'] = enhanced_workout.get('duration', 30)
                # Use calculated calories only if user didn't provide them
                if not estimated_calories:
                    custom_workout_data['calories_burned'] = enhanced_workout.get('calories_burned', 200)
        
        # Save as workout plan for easy access and integration with recommendations
        plan_id = save_workout_plan(user_id, f"Custom: {workout_name}", custom_workout_data)
        
        return jsonify({
            "success": True,
            "workout": custom_workout_data,
            "plan_id": plan_id,
            "message": "Custom workout created successfully! It will now appear in your workout recommendations."
        })
    except Exception as e:
        print(f"Error creating custom workout: {e}")
        return jsonify({"error": "Failed to create custom workout"}), 500


# Also add this endpoint to handle getting user's custom workouts specifically
@app.route("/api/get_user_custom_workouts", methods=["POST"])
def get_user_custom_workouts_endpoint():
    """Get user's saved custom workouts"""
    data = request.json
    user_id = data.get("user_id")
    
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
    
    try:
        import sqlite3
        import json
        
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            c.execute("""
            SELECT id, plan_name, plan_data, created_at, is_active
            FROM workout_plans
            WHERE user_id = ? AND plan_name LIKE 'Custom:%'
            ORDER BY created_at DESC
            """, (user_id,))
            
            custom_workouts = []
            for row in c.fetchall():
                plan_data = json.loads(row[2])
                custom_workouts.append({
                    'id': row[0],
                    'name': row[1].replace('Custom: ', ''),
                    'workout_data': plan_data,
                    'created_at': row[3],
                    'is_active': row[4]
                })
            
            return jsonify(custom_workouts)
    except Exception as e:
        print(f"Error getting custom workouts: {e}")
        return jsonify({"error": "Failed to get custom workouts"}), 500


@app.route("/api/get_quick_workout_suggestions", methods=["POST"])
def get_quick_workout_suggestions():
    """Get quick workout suggestions based on time, focus, and equipment with enhanced filtering"""
    data = request.json
    user_id = data.get("user_id")
    duration = data.get("duration", 30)
    focus = data.get("focus", "full_body")
    equipment = data.get("equipment", [])
    excluded_workouts = data.get("excluded_workouts", [])

    print(f"🔍 Quick workout request:")
    print(f"   User: {user_id}")
    print(f"   Duration: {duration} min")
    print(f"   Focus: {focus}")
    print(f"   Equipment: {equipment}")
    print(f"   Excluded: {excluded_workouts}")

    if not user_id:
        return jsonify({"error": "User ID required"}), 400

    try:
        from fitness_utils import get_quick_workout_suggestions
        from database import get_user_profile
        
        profile = get_user_profile(user_id)
        if not profile:
            print(f"⚠️ No profile found for user {user_id}, using defaults")
            profile = {"fitness_experience": "beginner"}
        
        suggestions = get_quick_workout_suggestions(
            profile, duration, focus, equipment, excluded_workouts
        )
        
        print(f"✅ Found {len(suggestions)} suggestions for user {user_id}")
        
        # Filter out any None suggestions
        valid_suggestions = [s for s in suggestions if s and s.get('workout')]
        
        return jsonify(valid_suggestions)
        
    except Exception as e:
        error_msg = f"Error getting suggestions: {str(e)}"
        print(f"❌ {error_msg}")
        return jsonify({"error": error_msg}), 500
    

@app.route("/api/get_workout_preferences", methods=["POST"])
def get_workout_preferences():
    """Get user's workout preferences (likes/dislikes) with enhanced error handling"""
    data = request.json
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "User ID required"}), 400

    try:
        from database import get_user_workout_preferences
        preferences = get_user_workout_preferences(user_id)
        print(f"✅ Retrieved workout preferences for user {user_id}: {len(preferences.get('liked', []))} liked, {len(preferences.get('disliked', []))} disliked")
        return jsonify(preferences)
    except Exception as e:
        print(f"❌ Error fetching workout preferences: {e}")
        # Return empty preferences instead of error to not break the UI
        return jsonify({"liked": [], "disliked": []})


@app.route("/api/delete_custom_workout", methods=["POST"])
def delete_custom_workout():
    """Delete a user's custom workout"""
    data = request.json
    user_id = data.get("user_id")
    workout_id = data.get("workout_id")
    
    if not all([user_id, workout_id]):
        return jsonify({"error": "User ID and workout ID required"}), 400
    
    try:
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            
            # Verify the workout belongs to the user before deleting
            c.execute("""
            DELETE FROM workout_plans 
            WHERE id = ? AND user_id = ? AND plan_name LIKE 'Custom:%'
            """, (workout_id, user_id))
            
            if c.rowcount == 0:
                return jsonify({"error": "Workout not found or not authorized"}), 404
            
            conn.commit()
        
        return jsonify({"success": True, "message": "Custom workout deleted successfully"})
    except Exception as e:
        print(f"Error deleting custom workout: {e}")
        return jsonify({"error": "Failed to delete custom workout"}), 500
    
if __name__ == "__main__":
    init_db()
    init_fitness_tables()  # Initialize fitness tables
    app.run(debug=True)