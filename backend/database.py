import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "nutrifit.db")

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Drop existing tables if they have wrong structure (for development)
        # Comment this out in production!
        try:
            c.execute("DROP TABLE IF EXISTS meals")
            c.execute("DROP TABLE IF EXISTS daily_nutrition") 
            c.execute("DROP TABLE IF EXISTS food_preferences")
        except:
            pass
        
        # Users table for profile data
        c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            age INTEGER,
            gender TEXT,
            height_cm REAL,
            weight_lb REAL,
            calorie_goal INTEGER,
            protein_goal INTEGER,
            carbs_goal INTEGER,
            fat_goal INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Daily nutrition tracking
        c.execute("""
        CREATE TABLE IF NOT EXISTS daily_nutrition (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            date TEXT,
            total_calories REAL DEFAULT 0,
            total_protein REAL DEFAULT 0,
            total_carbohydrates REAL DEFAULT 0,
            total_fat REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, date)
        )
        """)
        
        # Meal allocations and progress
        c.execute("""
        CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            date TEXT,
            meal_type TEXT,
            calories_allocated INTEGER DEFAULT 0,
            calories_eaten REAL DEFAULT 0,
            protein_eaten REAL DEFAULT 0,
            carbohydrates_eaten REAL DEFAULT 0,
            fat_eaten REAL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, date, meal_type)
        )
        """)
        
        # Food preferences
        c.execute("""
        CREATE TABLE IF NOT EXISTS food_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            meal_type TEXT,
            food_name TEXT,
            preference TEXT CHECK(preference IN ('liked', 'disliked')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, meal_type, food_name)
        )
        """)
        
        conn.commit()
        print("Database initialized successfully")

def get_today_date():
    return datetime.now().strftime('%Y-%m-%d')

def ensure_user_exists(user_id):
    """Ensure user exists in database with default values"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Check if user exists
        c.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        if not c.fetchone():
            # Create user with defaults
            c.execute("""
            INSERT INTO users (id, calorie_goal, protein_goal, carbs_goal, fat_goal)
            VALUES (?, 2000, 150, 250, 70)
            """, (user_id,))
            
        # Ensure today's records exist
        today = get_today_date()
        
        # Daily nutrition record
        c.execute("""
        INSERT OR IGNORE INTO daily_nutrition (user_id, date)
        VALUES (?, ?)
        """, (user_id, today))
        
        # Meal records
        meals = ['breakfast', 'lunch', 'dinner', 'snacks']
        meal_allocations = {
            'breakfast': 500,
            'lunch': 600,
            'dinner': 700,
            'snacks': 200
        }
        
        for meal in meals:
            c.execute("""
            INSERT OR IGNORE INTO meals (user_id, date, meal_type, calories_allocated)
            VALUES (?, ?, ?, ?)
            """, (user_id, today, meal, meal_allocations[meal]))
        
        conn.commit()

def get_user_data(user_id):
    """Get complete user data in the format expected by existing code"""
    ensure_user_exists(user_id)
    today = get_today_date()
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get user profile
        c.execute("""
        SELECT calorie_goal, protein_goal, carbs_goal, fat_goal
        FROM users WHERE id = ?
        """, (user_id,))
        
        user_profile = c.fetchone()
        if not user_profile:
            return None
            
        # Get daily nutrition totals
        c.execute("""
        SELECT total_protein, total_carbohydrates, total_fat
        FROM daily_nutrition WHERE user_id = ? AND date = ?
        """, (user_id, today))
        
        nutrition_data = c.fetchone()
        
        # Get meal data
        c.execute("""
        SELECT meal_type, calories_allocated, calories_eaten, 
               protein_eaten, carbohydrates_eaten, fat_eaten
        FROM meals WHERE user_id = ? AND date = ?
        """, (user_id, today))
        
        meal_rows = c.fetchall()
        
        # Get preferences
        c.execute("""
        SELECT meal_type, food_name, preference
        FROM food_preferences WHERE user_id = ?
        """, (user_id,))
        
        preference_rows = c.fetchall()
        
        # Build user data structure
        user_data = {
            "calorie_goal": user_profile[0],
            "nutrient_goals": {
                "protein": user_profile[1],
                "carbohydrates": user_profile[2],
                "fat": user_profile[3]
            },
            "nutrients_eaten": {
                "protein": nutrition_data[0] if nutrition_data else 0,
                "carbohydrates": nutrition_data[1] if nutrition_data else 0,
                "fat": nutrition_data[2] if nutrition_data else 0
            },
            "meals": {}
        }
        
        # Build meals data - handle potential missing columns gracefully
        for meal_row in meal_rows:
            if len(meal_row) >= 6:  # Ensure we have all expected columns
                meal_type = meal_row[0]
                user_data["meals"][meal_type] = {
                    "calories_allocated": meal_row[1] or 0,
                    "calories_eaten": meal_row[2] or 0,
                    "protein_eaten": meal_row[3] or 0,
                    "carbohydrates_eaten": meal_row[4] or 0,
                    "fat_eaten": meal_row[5] or 0,
                    "liked": [],
                    "disliked": []
                }
            else:
                # Fallback for incomplete data
                meal_type = meal_row[0]
                user_data["meals"][meal_type] = {
                    "calories_allocated": meal_row[1] if len(meal_row) > 1 else 0,
                    "calories_eaten": meal_row[2] if len(meal_row) > 2 else 0,
                    "protein_eaten": 0,
                    "carbohydrates_eaten": 0,
                    "fat_eaten": 0,
                    "liked": [],
                    "disliked": []
                }
        
        # Add preferences
        for pref_row in preference_rows:
            meal_type, food_name, preference = pref_row
            if meal_type in user_data["meals"]:
                user_data["meals"][meal_type][preference].append(food_name)
        
        return user_data

def update_meal_nutrition(user_id, meal_type, nutrition_data):
    """Update meal and daily nutrition when user eats food"""
    today = get_today_date()
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Update meal data
        c.execute("""
        UPDATE meals 
        SET calories_eaten = calories_eaten + ?,
            protein_eaten = protein_eaten + ?,
            carbohydrates_eaten = carbohydrates_eaten + ?,
            fat_eaten = fat_eaten + ?
        WHERE user_id = ? AND date = ? AND meal_type = ?
        """, (
            nutrition_data.get("calories", 0),
            nutrition_data.get("protein", 0),
            nutrition_data.get("carbohydrates", 0),
            nutrition_data.get("fat", 0),
            user_id, today, meal_type
        ))
        
        # Update daily totals
        c.execute("""
        UPDATE daily_nutrition
        SET total_calories = total_calories + ?,
            total_protein = total_protein + ?,
            total_carbohydrates = total_carbohydrates + ?,
            total_fat = total_fat + ?
        WHERE user_id = ? AND date = ?
        """, (
            nutrition_data.get("calories", 0),
            nutrition_data.get("protein", 0),
            nutrition_data.get("carbohydrates", 0),
            nutrition_data.get("fat", 0),
            user_id, today
        ))
        
        conn.commit()

def update_food_preference(user_id, meal_type, food_name, liked):
    """Update food preference (like/dislike)"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        if liked is not None:
            preference = 'liked' if liked else 'disliked'
            
            # Remove any existing preference for this food in this meal
            c.execute("""
            DELETE FROM food_preferences 
            WHERE user_id = ? AND meal_type = ? AND food_name = ?
            """, (user_id, meal_type, food_name))
            
            # Add new preference
            c.execute("""
            INSERT INTO food_preferences (user_id, meal_type, food_name, preference)
            VALUES (?, ?, ?, ?)
            """, (user_id, meal_type, food_name, preference))
            
        conn.commit()

def get_daily_totals(user_id):
    """Get combined daily nutrition totals"""
    today = get_today_date()
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get total calories eaten across all meals
        c.execute("""
        SELECT COALESCE(SUM(calories_eaten), 0) as total_calories
        FROM meals WHERE user_id = ? AND date = ?
        """, (user_id, today))
        
        total_calories = c.fetchone()[0]
        
        # Get daily nutrition totals
        c.execute("""
        SELECT total_protein, total_carbohydrates, total_fat
        FROM daily_nutrition WHERE user_id = ? AND date = ?
        """, (user_id, today))
        
        nutrition_data = c.fetchone()
        
        return {
            "total_eaten": total_calories,
            "nutrients": {
                "protein": nutrition_data[0] if nutrition_data else 0,
                "carbohydrates": nutrition_data[1] if nutrition_data else 0,
                "fat": nutrition_data[2] if nutrition_data else 0
            }
        }

def get_meal_progress(user_id):
    """Get detailed progress for all meals"""
    today = get_today_date()
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        SELECT meal_type, calories_allocated, calories_eaten,
               protein_eaten, carbohydrates_eaten, fat_eaten
        FROM meals WHERE user_id = ? AND date = ?
        """, (user_id, today))
        
        meal_data = {}
        for row in c.fetchall():
            meal_type = row[0]
            calories_allocated = row[1]
            calories_eaten = row[2]
            
            meal_data[meal_type] = {
                "calories_allocated": calories_allocated,
                "calories_eaten": calories_eaten,
                "calories_remaining": calories_allocated - calories_eaten,
                "protein_eaten": row[3],
                "carbohydrates_eaten": row[4],
                "fat_eaten": row[5],
                "progress_percentage": (calories_eaten / calories_allocated) * 100 if calories_allocated > 0 else 0
            }
        
        return meal_data

def reset_day(user_id):
    """Reset all daily data for new day"""
    today = get_today_date()
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Reset meal data
        c.execute("""
        UPDATE meals 
        SET calories_eaten = 0, protein_eaten = 0, 
            carbohydrates_eaten = 0, fat_eaten = 0
        WHERE user_id = ? AND date = ?
        """, (user_id, today))
        
        # Reset daily nutrition
        c.execute("""
        UPDATE daily_nutrition
        SET total_calories = 0, total_protein = 0,
            total_carbohydrates = 0, total_fat = 0
        WHERE user_id = ? AND date = ?
        """, (user_id, today))
        
        conn.commit()

def get_remaining_calories(user_id, meal_type):
    """Get remaining calories for a specific meal"""
    today = get_today_date()
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        SELECT calories_allocated - calories_eaten
        FROM meals WHERE user_id = ? AND date = ? AND meal_type = ?
        """, (user_id, today, meal_type))
        
        result = c.fetchone()
        return result[0] if result else 0

def debug_database_structure():
    """Debug function to check database structure"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Check if tables exist and their structure
        c.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = c.fetchall()
        print("Tables in database:", tables)
        
        # Check meals table structure
        c.execute("PRAGMA table_info(meals);")
        meals_info = c.fetchall()
        print("Meals table structure:", meals_info)
        
        # Check sample data
        c.execute("SELECT * FROM meals LIMIT 5;")
        sample_meals = c.fetchall()
        print("Sample meals data:", sample_meals)
        
        return {"tables": tables, "meals_info": meals_info, "sample_meals": sample_meals}