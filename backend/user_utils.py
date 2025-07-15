from database import (
    get_user_data, 
    get_remaining_calories as db_get_remaining_calories,
    update_meal_nutrition,
    update_food_preference
)

# Keep these functions for backward compatibility but use database
def load_users():
    """Legacy function - now returns empty dict since we use database"""
    return {}

def save_users(data):
    """Legacy function - no longer needed since we use database directly"""
    pass

def get_remaining_calories(user, meal):
    """Get remaining calories for a meal - now uses database"""
    # Extract user_id from user dict or assume it's passed directly
    user_id = user.get("id") if isinstance(user, dict) else "user_123"
    return db_get_remaining_calories(user_id, meal)

def update_meal_calories(user, meal, food):
    """Update meal calories - now uses database"""
    user_id = user.get("id") if isinstance(user, dict) else "user_123"
    update_meal_nutrition(user_id, meal, food)

def get_meal_context(user, meal):
    """Get context about what the user has eaten and preferences"""
    user_id = user.get("id") if isinstance(user, dict) else "user_123"
    
    # Get fresh user data from database
    user_data = get_user_data(user_id)
    if not user_data:
        return {
            "remaining_calories": 0,
            "liked_foods": set(),
            "disliked_foods": set(),
            "macro_needs": {"protein": True, "carbs": True, "fat": True},
            "macro_ratios": {"protein": 0, "carbs": 0, "fat": 0}
        }
    
    meal_data = user_data["meals"].get(meal, {})
    
    # Calculate remaining macros
    remaining_calories = db_get_remaining_calories(user_id, meal)
    
    # Get preference patterns
    liked_foods = set(meal_data.get("liked", []))
    disliked_foods = set(meal_data.get("disliked", []))
    
    # Analyze what they've eaten today across all meals
    total_protein_eaten = user_data["nutrients_eaten"]["protein"]
    total_carbs_eaten = user_data["nutrients_eaten"]["carbohydrates"]
    total_fat_eaten = user_data["nutrients_eaten"]["fat"]
    
    protein_goal = user_data["nutrient_goals"]["protein"]
    carbs_goal = user_data["nutrient_goals"]["carbohydrates"]
    fat_goal = user_data["nutrient_goals"]["fat"]
    
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