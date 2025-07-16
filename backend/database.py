import sqlite3
import json
import os
from datetime import datetime
import hashlib

DB_PATH = os.path.join(os.path.dirname(__file__), "nutrifit.db")

def hash_password(password):
    """Hash password with salt"""
    salt = "nutrifit_salt_2024"  # In production, will use random salts
    return hashlib.sha256((password + salt).encode()).hexdigest()

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Drop existing tables if they have wrong structure (for development)
        # will comment this out in production
        try:
            c.execute("DROP TABLE IF EXISTS users")
            c.execute("DROP TABLE IF EXISTS meals")
            c.execute("DROP TABLE IF EXISTS daily_nutrition")
            c.execute("DROP TABLE IF EXISTS food_preferences")
            c.execute("DROP TABLE IF EXISTS user_preferences")
        except:
            pass
        
        # users table with authentication and profile data
        c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT,
            first_name TEXT,
            last_name TEXT,
            date_of_birth DATE,
            gender TEXT,
            height_cm REAL,
            weight_lb REAL,
            activity_level TEXT,
            calorie_goal INTEGER,
            protein_goal INTEGER,
            carbs_goal INTEGER,
            fat_goal INTEGER,
            profile_completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # User preferences and goals table
        c.execute("""
        CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            has_gym_membership BOOLEAN DEFAULT FALSE,
            available_equipment TEXT,
            primary_focus TEXT CHECK(primary_focus IN ('nutrition', 'fitness', 'both')),
            fitness_goals TEXT, -- JSON array
            dietary_restrictions TEXT, -- JSON array
            training_styles TEXT, -- JSON array
            workout_frequency INTEGER,
            workout_duration INTEGER, -- minutes
            fitness_experience TEXT CHECK(fitness_experience IN ('beginner', 'intermediate', 'advanced')),
            meal_prep_time TEXT CHECK(meal_prep_time IN ('minimal', 'moderate', 'extensive')),
            cooking_skill TEXT CHECK(cooking_skill IN ('beginner', 'intermediate', 'advanced')),
            budget_preference TEXT CHECK(budget_preference IN ('low', 'medium', 'high')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
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
        
        # Food preferences (likes/dislikes)
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

def create_user(username, password, email=None):
    """Create a new user account"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Check if username already exists
        c.execute("SELECT id FROM users WHERE username = ?", (username,))
        if c.fetchone():
            return None, "Username already exists"
        
        # Generate user ID
        user_id = f"user_{username}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        password_hash = hash_password(password)
        
        try:
            c.execute("""
            INSERT INTO users (id, username, password_hash, email, calorie_goal, protein_goal, carbs_goal, fat_goal)
            VALUES (?, ?, ?, ?, 2000, 150, 250, 70)
            """, (user_id, username, password_hash, email))
            
            # Create default preferences record
            c.execute("""
            INSERT INTO user_preferences (user_id, primary_focus, fitness_goals, dietary_restrictions, training_styles)
            VALUES (?, 'both', '[]', '[]', '[]')
            """, (user_id,))
            
            conn.commit()
            return user_id, None
        except Exception as e:
            return None, str(e)

def authenticate_user(username, password):
    """Authenticate user login"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        password_hash = hash_password(password)
        
        c.execute("""
        SELECT id, profile_completed FROM users 
        WHERE username = ? AND password_hash = ?
        """, (username, password_hash))
        
        result = c.fetchone()
        if result:
            return result[0], result[1]  # user_id, profile_completed
        return None, False

def calculate_bmr(weight_lb, height_cm, age, gender):
    """Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation"""
    weight_kg = weight_lb * 0.4535
    height_m = height_cm / 100
    
    if gender.lower() == 'male':
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    
    return bmr

def calculate_calorie_goals(bmr, activity_level, fitness_goals):
    """Calculate daily calorie and macro goals"""
    activity_multipliers = {
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725,
        'extremely_active': 1.9
    }
    
    tdee = bmr * activity_multipliers.get(activity_level, 1.375)
    
    # Adjust calories based on goals
    if 'weight_loss' in fitness_goals:
        calories = tdee - 500  # 1 lb per week deficit
    elif 'weight_gain' in fitness_goals:
        calories = tdee + 300  # Lean gain surplus
    else:
        calories = tdee  # Maintenance
    
    # Calculate macros (rough estimates)
    protein = max(120, int(calories * 0.25 / 4))  # 25% of calories, minimum 120g
    fat = int(calories * 0.25 / 9)  # 25% of calories
    carbs = int((calories - (protein * 4) - (fat * 9)) / 4)  # Remaining calories
    
    return int(calories), protein, carbs, fat

def update_user_profile(user_id, profile_data):
    """Update user profile with questionnaire data"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Calculate age from date_of_birth
        date_of_birth = profile_data.get('date_of_birth')
        age = None
        if date_of_birth:
            birth_date = datetime.strptime(date_of_birth, '%Y-%m-%d')
            age = (datetime.now() - birth_date).days // 365
        
        # Calculate calorie goals if we have enough data
        calorie_goal = protein_goal = carbs_goal = fat_goal = None
        if all(k in profile_data for k in ['weight_lb', 'height_cm', 'gender', 'activity_level']):
            bmr = calculate_bmr(
                profile_data['weight_lb'], 
                profile_data['height_cm'], 
                age or 25, 
                profile_data['gender']
            )
            calorie_goal, protein_goal, carbs_goal, fat_goal = calculate_calorie_goals(
                bmr, 
                profile_data['activity_level'], 
                profile_data.get('fitness_goals', [])
            )
        
        # Update users table
        c.execute("""
        UPDATE users SET 
            first_name = ?, last_name = ?, date_of_birth = ?, gender = ?,
            height_cm = ?, weight_lb = ?, activity_level = ?,
            calorie_goal = COALESCE(?, calorie_goal),
            protein_goal = COALESCE(?, protein_goal),
            carbs_goal = COALESCE(?, carbs_goal),
            fat_goal = COALESCE(?, fat_goal),
            profile_completed = TRUE,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (
            profile_data.get('first_name'), profile_data.get('last_name'),
            profile_data.get('date_of_birth'), profile_data.get('gender'),
            profile_data.get('height_cm'), profile_data.get('weight_lb'),
            profile_data.get('activity_level'),
            calorie_goal, protein_goal, carbs_goal, fat_goal,
            user_id
        ))
        
        # Update preferences table
        c.execute("""
        UPDATE user_preferences SET 
            has_gym_membership = ?,
            available_equipment = ?,
            primary_focus = ?,
            fitness_goals = ?,
            dietary_restrictions = ?,
            training_styles = ?,
            workout_frequency = ?,
            workout_duration = ?,
            fitness_experience = ?,
            meal_prep_time = ?,
            cooking_skill = ?,
            budget_preference = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        """, (
            profile_data.get('has_gym_membership', False),
            profile_data.get('available_equipment', ''),
            profile_data.get('primary_focus', 'both'),
            json.dumps(profile_data.get('fitness_goals', [])),
            json.dumps(profile_data.get('dietary_restrictions', [])),
            json.dumps(profile_data.get('training_styles', [])),
            profile_data.get('workout_frequency'),
            profile_data.get('workout_duration'),
            profile_data.get('fitness_experience'),
            profile_data.get('meal_prep_time'),
            profile_data.get('cooking_skill'),
            profile_data.get('budget_preference'),
            user_id
        ))
        
        conn.commit()

def get_user_profile(user_id):
    """Get complete user profile data"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get user data
        c.execute("""
        SELECT u.*, p.has_gym_membership, p.available_equipment, p.primary_focus,
               p.fitness_goals, p.dietary_restrictions, p.training_styles,
               p.workout_frequency, p.workout_duration, p.fitness_experience,
               p.meal_prep_time, p.cooking_skill, p.budget_preference
        FROM users u
        LEFT JOIN user_preferences p ON u.id = p.user_id
        WHERE u.id = ?
        """, (user_id,))
        
        row = c.fetchone()
        if not row:
            return None
        
        columns = [description[0] for description in c.description]
        profile = dict(zip(columns, row))
        
        # Parse JSON fields
        for field in ['fitness_goals', 'dietary_restrictions', 'training_styles']:
            if profile.get(field):
                try:
                    profile[field] = json.loads(profile[field])
                except:
                    profile[field] = []
            else:
                profile[field] = []
        
        return profile

def get_user_food_preferences(user_id):
    """Get user's food likes and dislikes"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        SELECT meal_type, food_name, preference
        FROM food_preferences WHERE user_id = ?
        ORDER BY meal_type, food_name
        """, (user_id,))
        
        preferences = {'liked': [], 'disliked': []}
        meal_preferences = {}
        
        for meal_type, food_name, preference in c.fetchall():
            if meal_type not in meal_preferences:
                meal_preferences[meal_type] = {'liked': [], 'disliked': []}
            
            meal_preferences[meal_type][preference].append(food_name)
            preferences[preference].append(f"{food_name} ({meal_type})")
        
        return preferences, meal_preferences

# Keep existing functions but update them to work with new schema
def get_today_date():
    return datetime.now().strftime('%Y-%m-%d')

def ensure_user_exists(user_id):
    """Ensure user exists in database with default values"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Check if user exists
        c.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        if not c.fetchone():
            return False  # User doesn't exist
        
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
        return True

def get_user_data(user_id):
    """Get complete user data in the format expected by existing code"""
    if not ensure_user_exists(user_id):
        return None
        
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
        
        # Build meals data
        for meal_row in meal_rows:
            if len(meal_row) >= 6:
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
        
        # Add preferences
        for pref_row in preference_rows:
            meal_type, food_name, preference = pref_row
            if meal_type in user_data["meals"]:
                user_data["meals"][meal_type][preference].append(food_name)
        
        return user_data

# Keep all other existing functions unchanged...
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