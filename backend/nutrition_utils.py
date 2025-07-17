import os
import requests
from dotenv import load_dotenv
from typing import List, Dict
import re
import random

load_dotenv()

# USDA API Configuration
USDA_API_KEY = os.getenv("USDA_API_KEY")
USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"
USDA_FOOD_URL = "https://api.nal.usda.gov/fdc/v1/food"

# Enhanced meal-specific food database
MEAL_SUGGESTIONS = {
    'breakfast': [
        # Protein options
        "scrambled eggs", "greek yogurt", "cottage cheese", "protein smoothie", "turkey sausage",
        "smoked salmon", "chia pudding", "protein pancakes", "egg white omelet", "breakfast burrito",
        
        # Grain/Carb options
        "oatmeal", "whole grain toast", "english muffin", "bagel", "cereal", "granola",
        "quinoa breakfast bowl", "overnight oats", "french toast", "whole grain waffles",
        
        # Fruits
        "banana", "berries", "apple slices", "orange", "grapefruit", "melon", "avocado toast",
        
        # Healthy options
        "acai bowl", "breakfast quinoa", "nut butter toast", "fruit smoothie bowl"
    ],
    
    'lunch': [
        # Proteins
        "grilled chicken", "turkey sandwich", "salmon salad", "tuna salad", "chicken caesar salad",
        "quinoa bowl", "lentil soup", "chicken wrap", "turkey club", "grilled fish",
        "veggie burger", "chicken stir fry", "beef stir fry", "tofu bowl", "shrimp salad",
        
        # Meals
        "chicken soup", "vegetable soup", "pasta salad", "grain bowl", "buddha bowl",
        "mediterranean bowl", "mexican bowl", "asian bowl", "power salad", "protein box",
        
        # Sandwiches/Wraps
        "turkey avocado wrap", "chicken salad sandwich", "veggie wrap", "club sandwich",
        "grilled chicken sandwich", "caprese sandwich"
    ],
    
    'dinner': [
        # Main proteins
        "grilled salmon", "chicken breast", "lean beef", "pork tenderloin", "turkey meatballs",
        "baked cod", "grilled shrimp", "chicken thighs", "beef stir fry", "fish tacos",
        "chicken parmesan", "beef and broccoli", "honey garlic salmon", "teriyaki chicken",
        
        # Complete meals
        "chicken and rice", "beef and vegetables", "pasta with chicken", "stir fry vegetables",
        "salmon and quinoa", "chicken curry", "beef chili", "vegetable curry", "seafood pasta",
        "chicken fajitas", "beef tacos", "grilled vegetable platter", "stuffed bell peppers",
        
        # Sides that could be mains
        "roasted vegetables", "sweet potato", "brown rice", "quinoa pilaf", "wild rice"
    ],
    
    'snacks': [
        # Protein snacks
        "greek yogurt", "string cheese", "almonds", "peanut butter", "hard boiled eggs",
        "protein bar", "cottage cheese", "hummus", "trail mix", "beef jerky",
        
        # Fruits & Veggies
        "apple", "banana", "berries", "orange", "carrots", "celery", "bell peppers",
        "cucumber", "cherry tomatoes", "grapes", "pear", "peach",
        
        # Healthy combos
        "apple with peanut butter", "crackers and cheese", "veggie chips", "rice cakes",
        "smoothie", "protein smoothie", "fruit bowl", "nuts and dried fruit"
    ]
}

# Common food database for quick lookups
COMMON_FOODS = {
    # Breakfast items
    "scrambled eggs": {"calories": 91, "protein": 6.1, "carbohydrates": 1.0, "fat": 6.7, "serving": "egg"},
    "fried egg": {"calories": 90, "protein": 6.3, "carbohydrates": 0.4, "fat": 6.8, "serving": "egg"},
    "boiled egg": {"calories": 78, "protein": 6.3, "carbohydrates": 0.6, "fat": 5.3, "serving": "egg"},
    "oatmeal": {"calories": 166, "protein": 5.9, "carbohydrates": 28.1, "fat": 3.6, "serving": "cup"},
    "toast": {"calories": 79, "protein": 2.3, "carbohydrates": 14.2, "fat": 1.1, "serving": "slice"},
    "whole grain toast": {"calories": 81, "protein": 4.0, "carbohydrates": 13.8, "fat": 1.3, "serving": "slice"},
    "banana": {"calories": 105, "protein": 1.3, "carbohydrates": 27.0, "fat": 0.4, "serving": "banana"},
    "apple": {"calories": 95, "protein": 0.5, "carbohydrates": 25.0, "fat": 0.3, "serving": "apple"},
    "greek yogurt": {"calories": 100, "protein": 17.0, "carbohydrates": 6.0, "fat": 0.7, "serving": "serving"},
    "cottage cheese": {"calories": 206, "protein": 28.0, "carbohydrates": 6.0, "fat": 9.0, "serving": "cup"},
    
    # Proteins
    "chicken breast": {"calories": 165, "protein": 31.0, "carbohydrates": 0.0, "fat": 3.6, "serving": "serving"},
    "grilled chicken": {"calories": 165, "protein": 31.0, "carbohydrates": 0.0, "fat": 3.6, "serving": "serving"},
    "salmon": {"calories": 206, "protein": 28.9, "carbohydrates": 0.0, "fat": 9.0, "serving": "serving"},
    "grilled salmon": {"calories": 206, "protein": 28.9, "carbohydrates": 0.0, "fat": 9.0, "serving": "serving"},
    "tuna": {"calories": 132, "protein": 28.2, "carbohydrates": 0.0, "fat": 1.3, "serving": "serving"},
    "ground beef": {"calories": 250, "protein": 26.1, "carbohydrates": 0.0, "fat": 15.0, "serving": "serving"},
    "turkey breast": {"calories": 135, "protein": 30.1, "carbohydrates": 0.0, "fat": 1.0, "serving": "serving"},
    "lean beef": {"calories": 220, "protein": 28.0, "carbohydrates": 0.0, "fat": 12.0, "serving": "serving"},
    "shrimp": {"calories": 85, "protein": 20.0, "carbohydrates": 0.0, "fat": 0.5, "serving": "serving"},
    
    # Grains
    "rice": {"calories": 206, "protein": 4.3, "carbohydrates": 44.5, "fat": 0.4, "serving": "cup"},
    "brown rice": {"calories": 218, "protein": 4.5, "carbohydrates": 45.0, "fat": 1.6, "serving": "cup"},
    "pasta": {"calories": 220, "protein": 8.1, "carbohydrates": 43.2, "fat": 1.1, "serving": "cup"},
    "bread": {"calories": 79, "protein": 2.3, "carbohydrates": 14.2, "fat": 1.1, "serving": "slice"},
    "quinoa": {"calories": 222, "protein": 8.1, "carbohydrates": 39.4, "fat": 3.6, "serving": "cup"},
    "quinoa bowl": {"calories": 280, "protein": 12.0, "carbohydrates": 45.0, "fat": 6.0, "serving": "bowl"},
    
    # Vegetables
    "broccoli": {"calories": 34, "protein": 2.8, "carbohydrates": 7.0, "fat": 0.4, "serving": "cup"},
    "carrots": {"calories": 41, "protein": 0.9, "carbohydrates": 9.6, "fat": 0.2, "serving": "cup"},
    "spinach": {"calories": 23, "protein": 2.9, "carbohydrates": 3.6, "fat": 0.4, "serving": "cup"},
    "sweet potato": {"calories": 112, "protein": 2.0, "carbohydrates": 26.0, "fat": 0.1, "serving": "potato"},
    "roasted vegetables": {"calories": 85, "protein": 3.0, "carbohydrates": 18.0, "fat": 2.0, "serving": "cup"},
    
    # Dairy
    "milk": {"calories": 149, "protein": 7.7, "carbohydrates": 11.7, "fat": 8.0, "serving": "cup"},
    "cheese": {"calories": 113, "protein": 7.0, "carbohydrates": 1.0, "fat": 9.0, "serving": "slice"},
    "string cheese": {"calories": 80, "protein": 7.0, "carbohydrates": 1.0, "fat": 6.0, "serving": "stick"},
    
    # Nuts and healthy fats
    "almonds": {"calories": 164, "protein": 6.0, "carbohydrates": 6.1, "fat": 14.2, "serving": "serving"},
    "peanut butter": {"calories": 188, "protein": 8.0, "carbohydrates": 8.0, "fat": 16.0, "serving": "serving"},
    "avocado": {"calories": 234, "protein": 2.9, "carbohydrates": 12.0, "fat": 21.4, "serving": "avocado"},
    "trail mix": {"calories": 140, "protein": 4.0, "carbohydrates": 13.0, "fat": 9.0, "serving": "serving"},
    
    # Fruits
    "orange": {"calories": 62, "protein": 1.2, "carbohydrates": 15.4, "fat": 0.2, "serving": "orange"},
    "strawberries": {"calories": 49, "protein": 1.0, "carbohydrates": 11.7, "fat": 0.5, "serving": "cup"},
    "blueberries": {"calories": 84, "protein": 1.1, "carbohydrates": 21.5, "fat": 0.5, "serving": "cup"},
    "berries": {"calories": 84, "protein": 1.1, "carbohydrates": 21.5, "fat": 0.5, "serving": "cup"},
    "grapes": {"calories": 62, "protein": 0.6, "carbohydrates": 16.0, "fat": 0.3, "serving": "cup"},
    
    # Snacks
    "protein bar": {"calories": 200, "protein": 20.0, "carbohydrates": 22.0, "fat": 6.0, "serving": "bar"},
    "hard boiled eggs": {"calories": 78, "protein": 6.3, "carbohydrates": 0.6, "fat": 5.3, "serving": "egg"},
    "hummus": {"calories": 25, "protein": 1.2, "carbohydrates": 3.0, "fat": 1.4, "serving": "serving"},
    "crackers": {"calories": 16, "protein": 0.3, "carbohydrates": 2.6, "fat": 0.4, "serving": "cracker"},
    
    # Complete meals
    "chicken caesar salad": {"calories": 280, "protein": 26.0, "carbohydrates": 8.0, "fat": 16.0, "serving": "salad"},
    "turkey sandwich": {"calories": 350, "protein": 25.0, "carbohydrates": 45.0, "fat": 8.0, "serving": "sandwich"},
    "salmon salad": {"calories": 320, "protein": 28.0, "carbohydrates": 12.0, "fat": 18.0, "serving": "salad"},
    "chicken soup": {"calories": 120, "protein": 12.0, "carbohydrates": 8.0, "fat": 4.0, "serving": "cup"},
    "vegetable soup": {"calories": 80, "protein": 3.0, "carbohydrates": 15.0, "fat": 1.0, "serving": "cup"},
    "chicken stir fry": {"calories": 240, "protein": 25.0, "carbohydrates": 18.0, "fat": 8.0, "serving": "serving"},
    "beef stir fry": {"calories": 280, "protein": 22.0, "carbohydrates": 20.0, "fat": 12.0, "serving": "serving"},
    "fish tacos": {"calories": 220, "protein": 18.0, "carbohydrates": 25.0, "fat": 7.0, "serving": "serving"},
    "chicken wrap": {"calories": 320, "protein": 24.0, "carbohydrates": 35.0, "fat": 9.0, "serving": "wrap"},
    "buddha bowl": {"calories": 380, "protein": 15.0, "carbohydrates": 52.0, "fat": 14.0, "serving": "bowl"},
    "smoothie": {"calories": 180, "protein": 8.0, "carbohydrates": 35.0, "fat": 3.0, "serving": "smoothie"},
}


def filter_usda_results(foods: List[Dict]) -> List[Dict]:
    """Filter out weird/unwanted USDA results and those with missing nutrition data"""
    filtered = []
    
    # Keywords to avoid
    avoid_keywords = [
        'baby food', 'infant', 'pet food', 'dog', 'cat',
        'supplement', 'vitamin', 'pill', 'tablet',
        'alcoholic', 'beer', 'wine', 'liquor',
        'fast foods', 'restaurant', 'brand name',
        'frozen meal', 'tv dinner',
        'candies', 'candy bar',
        'upc', 'gtin', 'ndb', 'usda commodity'
    ]
    
    # Preferred data types (in order of preference)
    preferred_types = ['Survey (FNDDS)', 'SR Legacy', 'Foundation', 'Branded']
    
    for food in foods:
        description = food.get('description', '').lower()
        data_type = food.get('dataType', '')
        
        # Skip if contains avoid keywords
        if any(keyword in description for keyword in avoid_keywords):
            continue
            
        # Skip if description is too long (usually means it's overly specific)
        if len(description) > 120:
            continue
            
        # Skip if it has weird parenthetical info
        if description.count('(') > 3:
            continue
            
        # Check if nutrition data exists and is meaningful
        nutrients = food.get('foodNutrients', [])
        has_calories = False
        has_macros = False
        
        for nutrient in nutrients:
            nutrient_id = nutrient.get('nutrientId')
            amount = nutrient.get('value', 0)
            
            if nutrient_id == 1008 and amount > 0:  # Energy (calories)
                has_calories = True
            if nutrient_id in [1003, 1004, 1005] and amount > 0:  # Protein, Fat, Carbs
                has_macros = True
                
        # Skip foods with no meaningful nutrition data
        if not has_calories and not has_macros:
            continue
            
        # Prefer certain data types
        food['priority'] = 0
        for i, pref_type in enumerate(preferred_types):
            if pref_type in data_type:
                food['priority'] = len(preferred_types) - i
                break
                
        filtered.append(food)
    
    # Sort by priority and return top results
    filtered.sort(key=lambda x: x.get('priority', 0), reverse=True)
    return filtered[:10]


def search_usda_foods(query: str, max_results: int = 10) -> List[Dict]:
    """Search USDA database for foods"""
    if not USDA_API_KEY:
        print("No USDA API key found")
        return []
    
    try:
        params = {
            'api_key': USDA_API_KEY,
            'query': query,
            'dataType': ['Survey (FNDDS)', 'SR Legacy', 'Foundation'],
            'pageSize': 25,  # Get more to filter from
            'requireAllWords': False
        }
        
        response = requests.get(USDA_SEARCH_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        foods = data.get('foods', [])
        if not foods:
            return []
            
        # Filter weird results
        filtered_foods = filter_usda_results(foods)
        
        results = []
        for food in filtered_foods[:max_results]:
            # Get detailed nutrition info
            nutrition = get_usda_nutrition(food.get('fdcId'))
            if nutrition and nutrition.get('calories', 0) > 0:  # Only include foods with calories
                results.append({
                    'name': clean_food_name(food.get('description', '')),
                    'calories': nutrition.get('calories', 0),
                    'protein': nutrition.get('protein', 0),
                    'carbohydrates': nutrition.get('carbohydrates', 0),
                    'fat': nutrition.get('fat', 0),
                    'serving': 'serving',
                    'source': 'usda',
                    'fdc_id': food.get('fdcId'),
                    'available_servings': ['serving', 'cup', 'piece', 'oz']
                })
        
        return results
        
    except Exception as e:
        print(f"Error searching USDA: {e}")
        return []


def get_usda_nutrition(fdc_id: str) -> Dict:
    """Get detailed nutrition info for a specific USDA food"""
    if not USDA_API_KEY or not fdc_id:
        return {}
    
    try:
        url = f"{USDA_FOOD_URL}/{fdc_id}"
        params = {'api_key': USDA_API_KEY}
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        nutrients = {}
        nutrient_map = {
            '1008': 'calories',    # Energy (kcal)
            '1003': 'protein',     # Protein
            '1005': 'carbohydrates',  # Carbohydrate
            '1004': 'fat'          # Total lipid (fat)
        }
        
        for nutrient in data.get('foodNutrients', []):
            nutrient_id = str(nutrient.get('nutrient', {}).get('id', ''))
            if nutrient_id in nutrient_map:
                amount = nutrient.get('amount', 0)
                if amount is not None and amount > 0:  # Only positive values
                    nutrients[nutrient_map[nutrient_id]] = round(amount, 1)
        
        # Ensure all nutrients are present with reasonable defaults
        for key in ['calories', 'protein', 'carbohydrates', 'fat']:
            if key not in nutrients:
                nutrients[key] = 0.0
                
        # Skip foods with no meaningful nutrition data
        if nutrients['calories'] == 0 and nutrients['protein'] == 0 and nutrients['carbohydrates'] == 0 and nutrients['fat'] == 0:
            return {}
                
        return nutrients
        
    except Exception as e:
        print(f"Error getting USDA nutrition for {fdc_id}: {e}")
        return {}


def clean_food_name(name: str) -> str:
    """Clean up food names from USDA"""
    # Remove extra whitespace
    name = ' '.join(name.split())
    
    # Remove common suffixes that make names too long
    suffixes_to_remove = [
        ', raw', ', cooked', ', boiled', ', steamed', ', baked',
        ', fresh', ', frozen', ', canned', ', dried',
        ', without salt', ', with salt', ', unsalted', ', salted',
        ', whole', ', chopped', ', sliced', ', diced'
    ]
    
    name_lower = name.lower()
    for suffix in suffixes_to_remove:
        if name_lower.endswith(suffix):
            name = name[:-len(suffix)]
            break
    
    # Capitalize properly
    return name.title()


def search_custom_foods(query: str) -> List[Dict]:
    """Search common foods database"""
    query_lower = query.lower().strip()
    results = []
    
    for food_name, food_data in COMMON_FOODS.items():
        if query_lower in food_name.lower():
            results.append({
                'name': food_name.title(),
                'calories': food_data['calories'],
                'protein': food_data['protein'],
                'carbohydrates': food_data['carbohydrates'],
                'fat': food_data['fat'],
                'serving': food_data['serving'],
                'source': 'custom',
                'available_servings': [food_data['serving'], 'serving', 'cup', 'piece']
            })
    
    return results


def search_food_autocomplete(query: str) -> List[Dict]:
    """Get autocomplete suggestions from all sources"""
    if len(query) < 2:
        return []
    
    suggestions = []
    
    # Search custom foods first (fast)
    custom_results = search_custom_foods(query)
    suggestions.extend(custom_results[:3])
    
    # Search USDA (comprehensive)
    usda_results = search_usda_foods(query, max_results=7)
    suggestions.extend(usda_results)
    
    # Remove duplicates and return top 10
    seen_names = set()
    unique_suggestions = []
    for suggestion in suggestions:
        name_key = suggestion['name'].lower()
        if name_key not in seen_names:
            seen_names.add(name_key)
            unique_suggestions.append(suggestion)
    
    return unique_suggestions[:10]


def search_food_comprehensive(query: str) -> List[Dict]:
    """Comprehensive food search from all sources"""
    if not query.strip():
        return []
    
    all_results = []
    
    # Search all sources
    custom_results = search_custom_foods(query)
    usda_results = search_usda_foods(query, max_results=12)
    
    # Combine with priority: custom first, then USDA
    all_results.extend(custom_results)
    all_results.extend(usda_results)
    
    # Remove duplicates
    seen_names = set()
    unique_results = []
    for result in all_results:
        name_key = result['name'].lower()
        if name_key not in seen_names:
            seen_names.add(name_key)
            unique_results.append(result)
    
    return unique_results[:15]


def create_display_name(food_name: str, quantity: float, serving: str) -> str:
    """Create properly formatted display name"""
    if quantity == 1:
        if serving in ['serving', '1 serving']:
            return f"1 serving of {food_name}"
        else:
            return f"1 {serving} of {food_name}"
    else:
        # Handle pluralization
        if serving == 'serving':
            plural_serving = 'servings'
        elif serving.endswith('s'):
            plural_serving = serving
        else:
            plural_serving = f"{serving}s"
            
        return f"{quantity} {plural_serving} of {food_name}"


def scale_food_nutrition(food_data: Dict, quantity: float, serving_size: str = None) -> Dict:
    """Scale food nutrition by quantity and serving size"""
    result = food_data.copy()
    
    # Base multiplier is quantity
    multiplier = quantity
    
    # Adjust for serving size if different from default
    if serving_size and serving_size != food_data.get('serving', ''):
        # Common serving size conversions (approximate)
        serving_conversions = {
            ('serving', 'cup'): 0.8,      # 1 cup ≈ 0.8 servings average
            ('serving', 'piece'): 1.0,    # 1 piece ≈ 1 serving
            ('serving', 'oz'): 0.28,      # 1 oz = 0.28 servings
            ('cup', 'serving'): 1.25,
            ('piece', 'serving'): 1.0,
            ('oz', 'serving'): 3.57,
            # Add more specific conversions as needed
        }
        
        conversion_key = (food_data.get('serving', ''), serving_size)
        if conversion_key in serving_conversions:
            multiplier *= serving_conversions[conversion_key]
    
    # Scale nutrients
    for nutrient in ['calories', 'protein', 'carbohydrates', 'fat']:
        if nutrient in result:
            result[nutrient] = round(result[nutrient] * multiplier, 1)
    
    # Create proper display name
    result['display_name'] = create_display_name(
        result['name'],
        quantity,
        serving_size or result.get('serving', 'serving')
    )
    
    result['quantity'] = quantity
    result['serving_used'] = serving_size or result.get('serving', 'serving')
    
    return result


def get_meal_suggestions(meal_type: str, max_results: int = 10) -> List[Dict]:
    """Get meal-appropriate food suggestions with more variety"""
    # Get suggestions from our enhanced meal database
    meal_foods = MEAL_SUGGESTIONS.get(meal_type, MEAL_SUGGESTIONS['snacks'])
    
    # Shuffle for variety and take more than requested to account for filtering
    available_foods = meal_foods.copy()
    random.shuffle(available_foods)
    
    suggestions = []
    
    # Try to get nutrition data for each suggestion
    for food_name in available_foods[:max_results * 2]:  # Get more to filter from
        # First check if it's in our common foods database
        if food_name.lower() in COMMON_FOODS:
            food_data = COMMON_FOODS[food_name.lower()]
            suggestions.append({
                'name': food_name.title(),
                'calories': food_data['calories'],
                'protein': food_data['protein'],
                'carbohydrates': food_data['carbohydrates'],
                'fat': food_data['fat'],
                'serving': food_data['serving'],
                'source': 'custom',
                'available_servings': [food_data['serving'], 'serving', 'cup', 'piece']
            })
        else:
            # Try to search for it in USDA database
            usda_results = search_usda_foods(food_name, max_results=1)
            if usda_results:
                suggestions.append(usda_results[0])
            else:
                # Fallback with estimated nutrition for common items
                suggestions.append({
                    'name': food_name.title(),
                    'calories': estimate_calories_by_meal(meal_type),
                    'protein': estimate_protein_by_meal(meal_type),
                    'carbohydrates': estimate_carbs_by_meal(meal_type),
                    'fat': estimate_fat_by_meal(meal_type),
                    'serving': 'serving',
                    'source': 'estimated',
                    'available_servings': ['serving', 'cup', 'piece']
                })
        
        # Stop when we have enough good suggestions
        if len(suggestions) >= max_results:
            break
    
    return suggestions[:max_results]


def estimate_calories_by_meal(meal_type: str) -> int:
    """Estimate calories based on meal type"""
    estimates = {
        'breakfast': random.randint(200, 400),
        'lunch': random.randint(300, 500),
        'dinner': random.randint(350, 600),
        'snacks': random.randint(100, 250)
    }
    return estimates.get(meal_type, 250)


def estimate_protein_by_meal(meal_type: str) -> float:
    """Estimate protein based on meal type"""
    estimates = {
        'breakfast': random.randint(8, 20),
        'lunch': random.randint(15, 30),
        'dinner': random.randint(20, 35),
        'snacks': random.randint(3, 12)
    }
    return float(estimates.get(meal_type, 15))


def estimate_carbs_by_meal(meal_type: str) -> float:
    """Estimate carbs based on meal type"""
    estimates = {
        'breakfast': random.randint(15, 40),
        'lunch': random.randint(25, 50),
        'dinner': random.randint(30, 60),
        'snacks': random.randint(8, 25)
    }
    return float(estimates.get(meal_type, 25))


def estimate_fat_by_meal(meal_type: str) -> float:
    """Estimate fat based on meal type"""
    estimates = {
        'breakfast': random.randint(5, 15),
        'lunch': random.randint(8, 20),
        'dinner': random.randint(10, 25),
        'snacks': random.randint(2, 12)
    }
    return float(estimates.get(meal_type, 10))