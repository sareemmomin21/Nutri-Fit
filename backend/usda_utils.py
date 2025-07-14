import os
import requests
from dotenv import load_dotenv
import re
from typing import List, Dict, Tuple

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

def classify_food_type(food_name: str) -> str:
    """Classify food into categories based on name analysis"""
    name_lower = food_name.lower()
    
    # Main proteins
    protein_keywords = [
        'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'duck',
        'lamb', 'steak', 'pork chop', 'chicken breast', 'ground beef', 'meatball',
        'sausage', 'bacon', 'ham', 'eggs', 'tofu', 'tempeh'
    ]
    
    # Starches/Grains
    starch_keywords = [
        'rice', 'pasta', 'bread', 'potato', 'sweet potato', 'quinoa', 'barley',
        'oats', 'cereal', 'bagel', 'toast', 'noodles', 'couscous', 'bulgur',
        'crackers', 'roll', 'biscuit', 'tortilla', 'wrap'
    ]
    
    # Vegetables
    vegetable_keywords = [
        'broccoli', 'spinach', 'lettuce', 'carrot', 'tomato', 'cucumber',
        'pepper', 'onion', 'mushroom', 'zucchini', 'asparagus', 'green beans',
        'corn', 'peas', 'cauliflower', 'kale', 'cabbage', 'salad', 'vegetable'
    ]
    
    # Fruits
    fruit_keywords = [
        'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry',
        'raspberry', 'mango', 'pineapple', 'peach', 'pear', 'cherry',
        'watermelon', 'cantaloupe', 'kiwi', 'fruit', 'berry'
    ]
    
    # Dairy
    dairy_keywords = [
        'milk', 'cheese', 'yogurt', 'butter', 'cream', 'cottage cheese',
        'greek yogurt', 'sour cream', 'ice cream'
    ]
    
    # Snacks
    snack_keywords = [
        'chips', 'popcorn', 'nuts', 'almonds', 'peanuts', 'granola bar',
        'energy bar', 'trail mix', 'crackers', 'pretzels', 'cookies'
    ]
    
    # Beverages
    beverage_keywords = [
        'juice', 'smoothie', 'coffee', 'tea', 'soda', 'water', 'milk',
        'shake', 'drink', 'beverage'
    ]
    
    # Breakfast specific
    breakfast_keywords = [
        'pancake', 'waffle', 'french toast', 'muffin', 'cereal', 'oatmeal',
        'granola', 'bagel', 'croissant', 'danish', 'breakfast'
    ]
    
    # Check categories in order of specificity
    if any(keyword in name_lower for keyword in breakfast_keywords):
        return 'breakfast_special'
    elif any(keyword in name_lower for keyword in protein_keywords):
        return 'protein'
    elif any(keyword in name_lower for keyword in starch_keywords):
        return 'starch'
    elif any(keyword in name_lower for keyword in vegetable_keywords):
        return 'vegetable'
    elif any(keyword in name_lower for keyword in fruit_keywords):
        return 'fruit'
    elif any(keyword in name_lower for keyword in dairy_keywords):
        return 'dairy'
    elif any(keyword in name_lower for keyword in snack_keywords):
        return 'snack'
    elif any(keyword in name_lower for keyword in beverage_keywords):
        return 'beverage'
    else:
        return 'other'

def get_meal_appropriate_foods(meal_type: str) -> Dict[str, List[str]]:
    """Get appropriate search terms for each meal type"""
    meal_searches = {
        'breakfast': {
            'protein': ['eggs', 'bacon', 'sausage', 'greek yogurt', 'cottage cheese'],
            'starch': ['oatmeal', 'cereal', 'toast', 'bagel', 'pancakes', 'waffle'],
            'fruit': ['banana', 'berries', 'apple', 'orange juice'],
            'dairy': ['milk', 'yogurt', 'cheese'],
            'other': ['coffee', 'breakfast bar', 'muffin']
        },
        'lunch': {
            'protein': ['chicken breast', 'turkey', 'tuna', 'salmon', 'tofu', 'eggs'],
            'starch': ['rice', 'pasta', 'bread', 'quinoa', 'potato'],
            'vegetable': ['salad', 'vegetables', 'soup', 'broccoli', 'spinach'],
            'other': ['sandwich', 'wrap', 'bowl', 'stir fry']
        },
        'dinner': {
            'protein': ['chicken', 'beef', 'fish', 'pork', 'salmon', 'steak'],
            'starch': ['rice', 'pasta', 'potato', 'quinoa', 'bread'],
            'vegetable': ['vegetables', 'salad', 'broccoli', 'asparagus', 'green beans'],
            'other': ['casserole', 'stir fry', 'roasted', 'grilled']
        },
        'snacks': {
            'protein': ['nuts', 'greek yogurt', 'cheese', 'hard boiled eggs'],
            'fruit': ['apple', 'banana', 'berries', 'grapes'],
            'other': ['granola bar', 'crackers', 'popcorn', 'trail mix']
        }
    }
    return meal_searches.get(meal_type, meal_searches['lunch'])

def search_foods_by_category(meal_type: str, category: str, max_results: int = 15) -> List[Dict]:
    """Search for foods in a specific category for a meal type"""
    search_terms = get_meal_appropriate_foods(meal_type)
    category_terms = search_terms.get(category, search_terms.get('other', ['healthy food']))
    
    all_results = []
    for term in category_terms[:3]:  # Limit search terms to avoid too many API calls
        params = {
            "query": term,
            "pageSize": max_results,
            "api_key": API_KEY,
            "dataType": ["Survey (FNDDS)", "Foundation"]
        }
        
        try:
            response = requests.get(SEARCH_URL, params=params)
            data = response.json()
            
            for item in data.get("foods", []):
                nutrients = item.get("foodNutrients", [])
                calories = next(
                    (n["value"] for n in nutrients if n.get("nutrientName", "").lower() == "energy" and n.get("unitName") == "KCAL"),
                    0
                )
                
                if calories > 0:  # Only include foods with calorie data
                    nutrient_data = extract_nutrients(nutrients)
                    food_item = {
                        "name": item.get("description", "Unknown Food"),
                        "fdcId": item.get("fdcId"),
                        "calories": round(calories, 2),
                        "category": classify_food_type(item.get("description", "")),
                        **nutrient_data
                    }
                    all_results.append(food_item)
        except Exception as e:
            print(f"Error searching for {term}: {e}")
            continue
    
    return all_results

def create_balanced_meal(meal_type: str, calories_target: int, disliked_foods: set) -> List[Dict]:
    """Create a balanced meal with appropriate components"""
    
    # Filter out undesired keywords
    undesired_keywords = ["school lunch", "cafeteria", "NFS", "baby food", "infant"]
    
    def is_valid_food(food):
        return (
            food["name"] not in disliked_foods and
            not any(keyword.lower() in food["name"].lower() for keyword in undesired_keywords) and
            food["calories"] > 0
        )
    
    if meal_type == 'breakfast':
        # Breakfast: protein + starch + optional fruit/dairy
        target_protein_cals = calories_target * 0.4
        target_starch_cals = calories_target * 0.45
        target_other_cals = calories_target * 0.15
        
        proteins = [f for f in search_foods_by_category('breakfast', 'protein') if is_valid_food(f)]
        starches = [f for f in search_foods_by_category('breakfast', 'starch') if is_valid_food(f)]
        others = [f for f in search_foods_by_category('breakfast', 'fruit') + 
                 search_foods_by_category('breakfast', 'dairy') if is_valid_food(f)]
        
        meal = []
        if proteins:
            best_protein = min(proteins, key=lambda x: abs(x['calories'] - target_protein_cals))
            meal.append(best_protein)
        
        if starches:
            best_starch = min(starches, key=lambda x: abs(x['calories'] - target_starch_cals))
            meal.append(best_starch)
        
        if others and len(meal) < 3:
            best_other = min(others, key=lambda x: abs(x['calories'] - target_other_cals))
            meal.append(best_other)
        
        return meal
    
    elif meal_type == 'lunch':
        # Lunch: protein + starch + vegetable OR complete dish
        target_protein_cals = calories_target * 0.45
        target_starch_cals = calories_target * 0.35
        target_veg_cals = calories_target * 0.2
        
        proteins = [f for f in search_foods_by_category('lunch', 'protein') if is_valid_food(f)]
        starches = [f for f in search_foods_by_category('lunch', 'starch') if is_valid_food(f)]
        vegetables = [f for f in search_foods_by_category('lunch', 'vegetable') if is_valid_food(f)]
        complete_dishes = [f for f in search_foods_by_category('lunch', 'other') if is_valid_food(f)]
        
        # Try complete dish first
        if complete_dishes:
            suitable_dishes = [f for f in complete_dishes if calories_target * 0.8 <= f['calories'] <= calories_target * 1.2]
            if suitable_dishes:
                return [min(suitable_dishes, key=lambda x: abs(x['calories'] - calories_target))]
        
        # Otherwise build meal
        meal = []
        if proteins:
            best_protein = min(proteins, key=lambda x: abs(x['calories'] - target_protein_cals))
            meal.append(best_protein)
        
        if starches:
            best_starch = min(starches, key=lambda x: abs(x['calories'] - target_starch_cals))
            meal.append(best_starch)
        
        if vegetables:
            best_veg = min(vegetables, key=lambda x: abs(x['calories'] - target_veg_cals))
            meal.append(best_veg)
        
        return meal
    
    elif meal_type == 'dinner':
        # Dinner: protein + starch + vegetable (proper meal)
        target_protein_cals = calories_target * 0.45
        target_starch_cals = calories_target * 0.3
        target_veg_cals = calories_target * 0.25
        
        proteins = [f for f in search_foods_by_category('dinner', 'protein') if is_valid_food(f)]
        starches = [f for f in search_foods_by_category('dinner', 'starch') if is_valid_food(f)]
        vegetables = [f for f in search_foods_by_category('dinner', 'vegetable') if is_valid_food(f)]
        
        meal = []
        if proteins:
            best_protein = min(proteins, key=lambda x: abs(x['calories'] - target_protein_cals))
            meal.append(best_protein)
        
        if starches:
            best_starch = min(starches, key=lambda x: abs(x['calories'] - target_starch_cals))
            meal.append(best_starch)
        
        if vegetables:
            best_veg = min(vegetables, key=lambda x: abs(x['calories'] - target_veg_cals))
            meal.append(best_veg)
        
        return meal
    
    elif meal_type == 'snacks':
        # Snacks: single item or two small items
        all_snacks = []
        for category in ['protein', 'fruit', 'other']:
            all_snacks.extend([f for f in search_foods_by_category('snacks', category) if is_valid_food(f)])
        
        # Single snack
        suitable_single = [f for f in all_snacks if calories_target * 0.8 <= f['calories'] <= calories_target * 1.2]
        if suitable_single:
            return [min(suitable_single, key=lambda x: abs(x['calories'] - calories_target))]
        
        # Two small snacks
        small_snacks = [f for f in all_snacks if f['calories'] <= calories_target * 0.6]
        if len(small_snacks) >= 2:
            for i, snack1 in enumerate(small_snacks):
                for snack2 in small_snacks[i+1:]:
                    total_cals = snack1['calories'] + snack2['calories']
                    if calories_target * 0.8 <= total_cals <= calories_target * 1.2:
                        return [snack1, snack2]
        
        # Fallback to closest single item
        if all_snacks:
            return [min(all_snacks, key=lambda x: abs(x['calories'] - calories_target))]
    
    return []

def query_usda_foods(meal_type, calories_target=300, max_results=10):
    """Enhanced food querying with smart meal composition"""
    users_data = {}
    try:
        import json
        with open("users.json", "r") as f:
            users_data = json.load(f)
    except:
        pass
    
    # Get disliked foods for user_123 (you might want to pass this as parameter)
    disliked_foods = set()
    if "user_123" in users_data:
        meal_data = users_data["user_123"]["meals"].get(meal_type, {})
        disliked_foods = set(meal_data.get("disliked", []))
    
    # Create balanced meal
    balanced_meal = create_balanced_meal(meal_type, calories_target, disliked_foods)
    
    if balanced_meal:
        return balanced_meal
    
    # Fallback to original method if balanced meal creation fails
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
    
    try:
        response = requests.get(SEARCH_URL, params=params)
        data = response.json()
        
        results = []
        for item in data.get("foods", []):
            nutrients = item.get("foodNutrients", [])
            calories = next(
                (n["value"] for n in nutrients if n.get("nutrientName", "").lower() == "energy" and n.get("unitName") == "KCAL"),
                0
            )
            if calories > 0:
                nutrient_data = extract_nutrients(nutrients)
                results.append({
                    "name": item.get("description", "Unknown Food"),
                    "fdcId": item.get("fdcId"),
                    "calories": round(calories, 2),
                    "category": classify_food_type(item.get("description", "")),
                    **nutrient_data
                })
        return results
    except Exception as e:
        print(f"Error in fallback query: {e}")
        return []