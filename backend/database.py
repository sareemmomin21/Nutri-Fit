import sqlite3
import json
import os
from datetime import datetime, timedelta
import hashlib

DB_PATH = os.path.join(os.path.dirname(__file__), "nutrifit.db")

def hash_password(password):
    """Hash password with salt"""
    salt = "nutrifit_salt_2024"  # In production, use random salts per user
    return hashlib.sha256((password + salt).encode()).hexdigest()

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Add current_day column to users table
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
            current_day INTEGER DEFAULT 1,
            profile_completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Check if current_day column exists, if not add it
        c.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in c.fetchall()]
        if 'current_day' not in columns:
            c.execute("ALTER TABLE users ADD COLUMN current_day INTEGER DEFAULT 1")
        
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
        
        # Daily nutrition tracking - now uses day_number instead of date
        c.execute("""
        CREATE TABLE IF NOT EXISTS daily_nutrition (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            day_number INTEGER,
            total_calories REAL DEFAULT 0,
            total_protein REAL DEFAULT 0,
            total_carbohydrates REAL DEFAULT 0,
            total_fat REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, day_number)
        )
        """)
        
        # Current meal items (what user is building for current day)
        c.execute("""
        CREATE TABLE IF NOT EXISTS current_meal_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            meal_type TEXT,
            food_name TEXT,
            quantity REAL DEFAULT 1,
            serving_size TEXT DEFAULT 'serving',
            calories REAL,
            protein REAL,
            carbohydrates REAL,
            fat REAL,
            source TEXT DEFAULT 'custom',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
        
        # Meal history (saved meals from previous days) - now uses day_number
        c.execute("""
        CREATE TABLE IF NOT EXISTS meal_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            day_number INTEGER,
            meal_type TEXT,
            food_name TEXT,
            quantity REAL DEFAULT 1,
            serving_size TEXT DEFAULT 'serving',
            calories REAL,
            protein REAL,
            carbohydrates REAL,
            fat REAL,
            source TEXT DEFAULT 'custom',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
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
        
        # User custom foods table
        c.execute("""
        CREATE TABLE IF NOT EXISTS user_custom_foods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            food_name TEXT,
            calories_per_serving REAL,
            protein_per_serving REAL,
            carbohydrates_per_serving REAL,
            fat_per_serving REAL,
            default_serving_size TEXT DEFAULT 'serving',
            available_servings TEXT, -- JSON array of serving options
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, food_name)
        )
        """)
        
        conn.commit()
        print("Database initialized successfully")

def get_user_current_day(user_id):
    """Get current day number for user"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("SELECT current_day FROM users WHERE id = ?", (user_id,))
        result = c.fetchone()
        return result[0] if result else 1

def increment_user_day(user_id):
    """Increment user's current day and return new day number"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get current day
        current_day = get_user_current_day(user_id)
        new_day = current_day + 1
        
        # Update user's current day
        c.execute("UPDATE users SET current_day = ? WHERE id = ?", (new_day, user_id))
        
        conn.commit()
        return new_day

def get_day_display_info(user_id, target_day=None):
    """Get display information for a specific day"""
    current_day = get_user_current_day(user_id)
    if target_day is None:
        target_day = current_day
    
    days_ago = current_day - target_day
    
    # Calculate navigation
    can_go_back = target_day > 1
    can_go_forward = target_day < current_day
    prev_day = target_day - 1 if can_go_back else None
    next_day = target_day + 1 if can_go_forward else None
    
    # Format display
    if days_ago == 0:
        display = "Today"
    elif days_ago == 1:
        display = "Yesterday"
    else:
        display = f"{days_ago} days ago"
    
    return {
        'current_day': target_day,
        'display': display,
        'days_ago': days_ago,
        'can_go_back': can_go_back,
        'can_go_forward': can_go_forward,
        'prev_day': prev_day,
        'next_day': next_day,
        'is_today': days_ago == 0
    }

# Update all existing functions to use day_number instead of date
def ensure_user_exists(user_id):
    """Ensure user exists in database with default values"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Check if user exists
        c.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        if not c.fetchone():
            return False  # User doesn't exist
        
        # Ensure today's daily nutrition record exists
        current_day = get_user_current_day(user_id)
        c.execute("""
        INSERT OR IGNORE INTO daily_nutrition (user_id, day_number)
        VALUES (?, ?)
        """, (user_id, current_day))
        
        conn.commit()
        return True

def add_food_to_current_meal(user_id, meal_type, food_data):
    """Add a food item to the current meal"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        INSERT INTO current_meal_items
        (user_id, meal_type, food_name, quantity, serving_size,
         calories, protein, carbohydrates, fat, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, meal_type,
            food_data.get('name', ''),
            food_data.get('quantity', 1),
            food_data.get('serving_size', 'serving'),
            food_data.get('calories', 0),
            food_data.get('protein', 0),
            food_data.get('carbohydrates', 0),
            food_data.get('fat', 0),
            food_data.get('source', 'custom')
        ))
        
        conn.commit()
        
        # Update daily totals
        update_daily_totals(user_id)

def get_current_meal_items(user_id, meal_type=None):
    """Get current meal items for today"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        if meal_type:
            c.execute("""
            SELECT id, meal_type, food_name, quantity, serving_size,
                   calories, protein, carbohydrates, fat, source
            FROM current_meal_items
            WHERE user_id = ? AND meal_type = ?
            ORDER BY created_at
            """, (user_id, meal_type))
        else:
            c.execute("""
            SELECT id, meal_type, food_name, quantity, serving_size,
                   calories, protein, carbohydrates, fat, source
            FROM current_meal_items
            WHERE user_id = ?
            ORDER BY meal_type, created_at
            """, (user_id,))
        
        items = []
        for row in c.fetchall():
            items.append({
                'id': row[0],
                'meal_type': row[1],
                'name': row[2],
                'quantity': row[3],
                'serving_size': row[4],
                'calories': row[5],
                'protein': row[6],
                'carbohydrates': row[7],
                'fat': row[8],
                'source': row[9]
            })
        
        return items

def update_daily_totals(user_id):
    """Update daily nutrition totals based on current meal items"""
    current_day = get_user_current_day(user_id)
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Calculate totals from current meal items
        c.execute("""
        SELECT
            COALESCE(SUM(calories), 0) as total_calories,
            COALESCE(SUM(protein), 0) as total_protein,
            COALESCE(SUM(carbohydrates), 0) as total_carbohydrates,
            COALESCE(SUM(fat), 0) as total_fat
        FROM current_meal_items
        WHERE user_id = ?
        """, (user_id,))
        
        totals = c.fetchone()
        
        # Update daily nutrition record
        c.execute("""
        INSERT OR REPLACE INTO daily_nutrition
        (user_id, day_number, total_calories, total_protein, total_carbohydrates, total_fat)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, current_day, totals[0], totals[1], totals[2], totals[3]))
        
        conn.commit()

def get_daily_totals(user_id, target_day=None):
    """Get combined daily nutrition totals for a specific day"""
    if target_day is None:
        target_day = get_user_current_day(user_id)
    
    current_day = get_user_current_day(user_id)
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # For current day, use current meal items; for past days, use daily_nutrition table
        if target_day == current_day:
            # Use current meal items for today
            c.execute("""
            SELECT
                COALESCE(SUM(calories), 0) as total_calories,
                COALESCE(SUM(protein), 0) as total_protein,
                COALESCE(SUM(carbohydrates), 0) as total_carbohydrates,
                COALESCE(SUM(fat), 0) as total_fat
            FROM current_meal_items
            WHERE user_id = ?
            """, (user_id,))
        else:
            # Use saved daily nutrition for past days
            c.execute("""
            SELECT total_calories, total_protein, total_carbohydrates, total_fat
            FROM daily_nutrition WHERE user_id = ? AND day_number = ?
            """, (user_id, target_day))
        
        result = c.fetchone()
        if result:
            return {
                "total_eaten": result[0] or 0,
                "nutrients": {
                    "protein": result[1] or 0,
                    "carbohydrates": result[2] or 0,
                    "fat": result[3] or 0
                }
            }
        else:
            return {
                "total_eaten": 0,
                "nutrients": {
                    "protein": 0,
                    "carbohydrates": 0,
                    "fat": 0
                }
            }

def save_current_meals_to_history(user_id):
    """Save current meal items to history and clear current meals"""
    current_day = get_user_current_day(user_id)
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Copy current meal items to history
        c.execute("""
        INSERT INTO meal_history
        (user_id, day_number, meal_type, food_name, quantity, serving_size,
         calories, protein, carbohydrates, fat, source)
        SELECT user_id, ?, meal_type, food_name, quantity, serving_size,
               calories, protein, carbohydrates, fat, source
        FROM current_meal_items
        WHERE user_id = ?
        """, (current_day, user_id))
        
        # Clear current meal items
        c.execute("""
        DELETE FROM current_meal_items
        WHERE user_id = ?
        """, (user_id,))
        
        conn.commit()

def reset_day(user_id):
    """Reset day - save current meals to history and start fresh"""
    # Save current meals to history
    save_current_meals_to_history(user_id)
    
    # Increment user's day
    new_day = increment_user_day(user_id)
    
    # Create new daily nutrition record for new day
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""
        INSERT OR IGNORE INTO daily_nutrition (user_id, day_number)
        VALUES (?, ?)
        """, (user_id, new_day))
        conn.commit()
    
    return new_day

def get_daily_history(user_id, days_back=14):
    """Get daily nutrition totals for analysis"""
    current_day = get_user_current_day(user_id)
    start_day = max(1, current_day - days_back)
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        SELECT day_number, total_calories, total_protein, total_carbohydrates, total_fat
        FROM daily_nutrition
        WHERE user_id = ? AND day_number >= ? AND day_number < ?
        ORDER BY day_number DESC
        """, (user_id, start_day, current_day))
        
        results = []
        for row in c.fetchall():
            day_number = row[0]
            days_ago = current_day - day_number
            
            results.append({
                'day_number': day_number,
                'days_ago': days_ago,
                'calories': row[1] or 0,
                'protein': row[2] or 0,
                'carbohydrates': row[3] or 0,
                'fat': row[4] or 0
            })
        
        return results

def get_daily_data_for_day(user_id, target_day):
    """Get complete daily data for a specific day"""
    current_day = get_user_current_day(user_id)
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get daily totals
        daily_totals = get_daily_totals(user_id, target_day)
        
        # Get meal breakdown for the day
        if target_day == current_day:
            # Use current meal items for today
            c.execute("""
            SELECT meal_type, food_name, quantity, serving_size,
                   calories, protein, carbohydrates, fat, source
            FROM current_meal_items
            WHERE user_id = ?
            ORDER BY meal_type, created_at
            """, (user_id,))
        else:
            # Use meal history for past days
            c.execute("""
            SELECT meal_type, food_name, quantity, serving_size,
                   calories, protein, carbohydrates, fat, source
            FROM meal_history
            WHERE user_id = ? AND day_number = ?
            ORDER BY meal_type, created_at
            """, (user_id, target_day))
        
        meals = {}
        for row in c.fetchall():
            meal_type = row[0]
            if meal_type not in meals:
                meals[meal_type] = []
            
            meals[meal_type].append({
                'name': row[1],
                'quantity': row[2],
                'serving_size': row[3],
                'calories': row[4],
                'protein': row[5],
                'carbohydrates': row[6],
                'fat': row[7],
                'source': row[8]
            })
        
        return {
            'day_number': target_day,
            'totals': daily_totals,
            'meals': meals
        }

# Keep existing functions that don't need major changes
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
            INSERT INTO users (id, username, password_hash, email, calorie_goal, protein_goal, carbs_goal, fat_goal, current_day)
            VALUES (?, ?, ?, ?, 2000, 150, 250, 70, 1)
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

def get_meal_progress(user_id):
    """Get meal progress with current items"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get meal totals from current items
        c.execute("""
        SELECT meal_type,
               COALESCE(SUM(calories), 0) as calories_eaten,
               COALESCE(SUM(protein), 0) as protein_eaten,
               COALESCE(SUM(carbohydrates), 0) as carbohydrates_eaten,
               COALESCE(SUM(fat), 0) as fat_eaten
        FROM current_meal_items
        WHERE user_id = ?
        GROUP BY meal_type
        """, (user_id,))
        
        meal_data = {}
        meal_allocations = {
            'breakfast': 500,
            'lunch': 600,
            'dinner': 700,
            'snacks': 200
        }
        
        # Initialize all meals
        for meal_type, allocation in meal_allocations.items():
            meal_data[meal_type] = {
                "calories_allocated": allocation,
                "calories_eaten": 0,
                "calories_remaining": allocation,
                "protein_eaten": 0,
                "carbohydrates_eaten": 0,
                "fat_eaten": 0,
                "progress_percentage": 0
            }
        
        # Update with actual data
        for row in c.fetchall():
            meal_type = row[0]
            if meal_type in meal_data:
                calories_eaten = row[1]
                meal_data[meal_type].update({
                    "calories_eaten": calories_eaten,
                    "calories_remaining": meal_data[meal_type]["calories_allocated"] - calories_eaten,
                    "protein_eaten": row[2],
                    "carbohydrates_eaten": row[3],
                    "fat_eaten": row[4],
                    "progress_percentage": (calories_eaten / meal_data[meal_type]["calories_allocated"]) * 100 if meal_data[meal_type]["calories_allocated"] > 0 else 0
                })
        
        return meal_data

def remove_food_from_current_meal(user_id, meal_item_id):
    """Remove a food item from the current meal"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        DELETE FROM current_meal_items
        WHERE id = ? AND user_id = ?
        """, (meal_item_id, user_id))
        
        conn.commit()
        
        # Update daily totals
        update_daily_totals(user_id)

def update_food_preference(user_id, meal_type, food_name, liked):
    """Update food preference (like/dislike)"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        if liked is not None:
            preference = 'liked' if liked else 'disliked'
            
            # Remove any existing preference for this food in this meal AND globally
            c.execute("""
            DELETE FROM food_preferences
            WHERE user_id = ? AND food_name = ?
            """, (user_id, food_name))
            
            # Add new preference for this specific meal
            c.execute("""
            INSERT INTO food_preferences (user_id, meal_type, food_name, preference)
            VALUES (?, ?, ?, ?)
            """, (user_id, meal_type, food_name, preference))
            
            # If disliked, also add a global dislike to prevent it from showing in other meals
            if not liked:
                c.execute("""
                INSERT OR IGNORE INTO food_preferences (user_id, meal_type, food_name, preference)
                VALUES (?, 'global', ?, 'disliked')
                """, (user_id, food_name))
            
        conn.commit()

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
            
            # Also add to overall preferences with meal context
            if meal_type != 'global':
                preferences[preference].append(f"{food_name} ({meal_type})")
            else:
                # Global dislikes (don't show meal context)
                if preference == 'disliked':
                    preferences[preference].append(food_name)
        
        return preferences, meal_preferences

def get_globally_disliked_foods(user_id):
    """Get foods that user has globally disliked"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        SELECT DISTINCT food_name
        FROM food_preferences 
        WHERE user_id = ? AND preference = 'disliked'
        """, (user_id,))
        
        return [row[0].lower() for row in c.fetchall()]

def add_user_custom_food(user_id, food_data):
    """Add a custom food for a user"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        INSERT OR REPLACE INTO user_custom_foods
        (user_id, food_name, calories_per_serving, protein_per_serving,
         carbohydrates_per_serving, fat_per_serving, default_serving_size, available_servings)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            food_data['name'],
            food_data['calories'],
            food_data['protein'],
            food_data['carbohydrates'],
            food_data['fat'],
            food_data.get('serving_size', 'serving'),
            json.dumps(food_data.get('available_servings', ['serving']))
        ))
        
        conn.commit()

def get_user_custom_foods(user_id, search_query=None):
    """Get user's custom foods with optional search"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        if search_query:
            c.execute("""
            SELECT food_name, calories_per_serving, protein_per_serving,
                   carbohydrates_per_serving, fat_per_serving, default_serving_size, available_servings
            FROM user_custom_foods
            WHERE user_id = ? AND food_name LIKE ?
            ORDER BY food_name
            """, (user_id, f'%{search_query}%'))
        else:
            c.execute("""
            SELECT food_name, calories_per_serving, protein_per_serving,
                   carbohydrates_per_serving, fat_per_serving, default_serving_size, available_servings
            FROM user_custom_foods
            WHERE user_id = ?
            ORDER BY food_name
            """, (user_id,))
        
        foods = []
        for row in c.fetchall():
            foods.append({
                'name': row[0],
                'calories': row[1],
                'protein': row[2],
                'carbohydrates': row[3],
                'fat': row[4],
                'serving': row[5],
                'available_servings': json.loads(row[6]) if row[6] else ['serving'],
                'source': 'user_custom'
            })
        
        return foods

def get_meal_history(user_id, target_day, meal_type=None):
    """Get meal history for a specific day and optionally a specific meal"""
    current_day = get_user_current_day(user_id)
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        if meal_type:
            if target_day == current_day:
                c.execute("""
                SELECT food_name, quantity, serving_size, calories, protein, carbohydrates, fat, source
                FROM current_meal_items
                WHERE user_id = ? AND meal_type = ?
                ORDER BY created_at
                """, (user_id, meal_type))
            else:
                c.execute("""
                SELECT food_name, quantity, serving_size, calories, protein, carbohydrates, fat, source
                FROM meal_history
                WHERE user_id = ? AND day_number = ? AND meal_type = ?
                ORDER BY created_at
                """, (user_id, target_day, meal_type))
        else:
            if target_day == current_day:
                c.execute("""
                SELECT meal_type, food_name, quantity, serving_size, calories, protein, carbohydrates, fat, source
                FROM current_meal_items
                WHERE user_id = ?
                ORDER BY meal_type, created_at
                """, (user_id,))
            else:
                c.execute("""
                SELECT meal_type, food_name, quantity, serving_size, calories, protein, carbohydrates, fat, source
                FROM meal_history
                WHERE user_id = ? AND day_number = ?
                ORDER BY meal_type, created_at
                """, (user_id, target_day))
        
        return c.fetchall()

def get_meal_history_by_day(user_id, target_day):
    """Get detailed meal history for a specific day"""
    daily_data = get_daily_data_for_day(user_id, target_day)
    return daily_data['meals']

# Add these functions to database.py

def init_fitness_tables():
    """Initialize fitness-related database tables"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Workout sessions table
        c.execute("""
        CREATE TABLE IF NOT EXISTS workout_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            workout_name TEXT,
            workout_type TEXT,
            duration_minutes INTEGER,
            calories_burned INTEGER,
            difficulty_level TEXT,
            date_completed DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
        
        # Exercise performance tracking
        c.execute("""
        CREATE TABLE IF NOT EXISTS exercise_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            workout_session_id INTEGER,
            exercise_name TEXT,
            sets INTEGER,
            reps INTEGER,
            weight_lb REAL,
            rest_seconds INTEGER,
            difficulty INTEGER,
            date_performed DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (workout_session_id) REFERENCES workout_sessions (id)
        )
        """)
        
        # Workout plans table
        c.execute("""
        CREATE TABLE IF NOT EXISTS workout_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            plan_name TEXT,
            plan_data TEXT, -- JSON data
            is_active BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
        
        # Fitness goals table
        c.execute("""
        CREATE TABLE IF NOT EXISTS fitness_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            goal_type TEXT,
            goal_value REAL,
            current_value REAL DEFAULT 0,
            target_date DATE,
            is_achieved BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
        
        conn.commit()

def add_workout_session(user_id, workout_data):
    """Add a completed workout session"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        INSERT INTO workout_sessions 
        (user_id, workout_name, workout_type, duration_minutes, calories_burned, 
         difficulty_level, date_completed, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            workout_data.get('name', ''),
            workout_data.get('type', ''),
            workout_data.get('duration', 0),
            workout_data.get('calories_burned', 0),
            workout_data.get('difficulty_level', 'moderate'),
            workout_data.get('date_completed', datetime.now().date()),
            workout_data.get('notes', '')
        ))
        
        workout_session_id = c.lastrowid
        
        # Add exercise performance data if available
        if 'exercises' in workout_data:
            for exercise in workout_data['exercises']:
                c.execute("""
                INSERT INTO exercise_performance 
                (user_id, workout_session_id, exercise_name, sets, reps, weight_lb, 
                 rest_seconds, difficulty, date_performed, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    user_id,
                    workout_session_id,
                    exercise.get('name', ''),
                    exercise.get('sets', 0),
                    exercise.get('reps', 0),
                    exercise.get('weight_lb', 0),
                    int(exercise.get('rest', '60s').replace('s', '')),
                    exercise.get('difficulty', 1),
                    workout_data.get('date_completed', datetime.now().date()),
                    exercise.get('notes', '')
                ))
        
        conn.commit()
        return workout_session_id

def get_workout_history(user_id, days_back=30):
    """Get user's workout history"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        c.execute("""
        SELECT id, workout_name, workout_type, duration_minutes, calories_burned,
               difficulty_level, date_completed, notes, created_at
        FROM workout_sessions
        WHERE user_id = ? AND date_completed >= ?
        ORDER BY date_completed DESC
        """, (user_id, cutoff_date.date()))
        
        workouts = []
        for row in c.fetchall():
            workouts.append({
                'id': row[0],
                'name': row[1],
                'type': row[2],
                'duration': row[3],
                'calories_burned': row[4],
                'difficulty_level': row[5],
                'date': datetime.strptime(str(row[6]), '%Y-%m-%d'),
                'notes': row[7],
                'created_at': row[8]
            })
        
        return workouts

def get_exercise_performance_history(user_id, exercise_name=None, days_back=90):
    """Get performance history for exercises"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        if exercise_name:
            c.execute("""
            SELECT exercise_name, sets, reps, weight_lb, date_performed, notes
            FROM exercise_performance
            WHERE user_id = ? AND exercise_name = ? AND date_performed >= ?
            ORDER BY date_performed DESC
            """, (user_id, exercise_name, cutoff_date.date()))
        else:
            c.execute("""
            SELECT exercise_name, sets, reps, weight_lb, date_performed, notes
            FROM exercise_performance
            WHERE user_id = ? AND date_performed >= ?
            ORDER BY date_performed DESC, exercise_name
            """, (user_id, cutoff_date.date()))
        
        performances = []
        for row in c.fetchall():
            performances.append({
                'exercise_name': row[0],
                'sets': row[1],
                'reps': row[2],
                'weight_lb': row[3],
                'date': datetime.strptime(str(row[4]), '%Y-%m-%d'),
                'notes': row[5]
            })
        
        return performances

def save_workout_plan(user_id, plan_name, plan_data):
    """Save a workout plan for the user"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Deactivate current active plan
        c.execute("""
        UPDATE workout_plans SET is_active = FALSE WHERE user_id = ?
        """, (user_id,))
        
        # Insert new plan
        c.execute("""
        INSERT INTO workout_plans (user_id, plan_name, plan_data, is_active)
        VALUES (?, ?, ?, TRUE)
        """, (user_id, plan_name, json.dumps(plan_data)))
        
        conn.commit()
        return c.lastrowid

def get_active_workout_plan(user_id):
    """Get user's active workout plan"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        SELECT id, plan_name, plan_data, created_at
        FROM workout_plans
        WHERE user_id = ? AND is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 1
        """, (user_id,))
        
        row = c.fetchone()
        if row:
            return {
                'id': row[0],
                'name': row[1],
                'plan_data': json.loads(row[2]),
                'created_at': row[3]
            }
        return None

def get_fitness_dashboard_data(user_id):
    """Get comprehensive fitness data for dashboard"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get weekly workout stats
        week_ago = datetime.now() - timedelta(days=7)
        c.execute("""
        SELECT COUNT(*) as workouts_this_week,
               COALESCE(SUM(duration_minutes), 0) as total_duration,
               COALESCE(SUM(calories_burned), 0) as total_calories,
               COALESCE(AVG(duration_minutes), 0) as avg_duration
        FROM workout_sessions
        WHERE user_id = ? AND date_completed >= ?
        """, (user_id, week_ago.date()))
        
        week_stats = c.fetchone()
        
        # Get monthly workout stats
        month_ago = datetime.now() - timedelta(days=30)
        c.execute("""
        SELECT COUNT(*) as workouts_this_month,
               COALESCE(SUM(duration_minutes), 0) as total_duration,
               COALESCE(SUM(calories_burned), 0) as total_calories
        FROM workout_sessions
        WHERE user_id = ? AND date_completed >= ?
        """, (user_id, month_ago.date()))
        
        month_stats = c.fetchone()
        
        # Get workout type distribution
        c.execute("""
        SELECT workout_type, COUNT(*) as count
        FROM workout_sessions
        WHERE user_id = ? AND date_completed >= ?
        GROUP BY workout_type
        ORDER BY count DESC
        """, (user_id, month_ago.date()))
        
        workout_types = c.fetchall()
        
        # Get recent workouts
        c.execute("""
        SELECT workout_name, workout_type, duration_minutes, calories_burned, date_completed
        FROM workout_sessions
        WHERE user_id = ?
        ORDER BY date_completed DESC
        LIMIT 5
        """, (user_id,))
        
        recent_workouts = c.fetchall()
        
        return {
            'weekly_stats': {
                'workouts': week_stats[0],
                'total_duration': week_stats[1],
                'total_calories': week_stats[2],
                'avg_duration': round(week_stats[3])
            },
            'monthly_stats': {
                'workouts': month_stats[0],
                'total_duration': month_stats[1],
                'total_calories': month_stats[2]
            },
            'workout_types': [{'type': row[0], 'count': row[1]} for row in workout_types],
            'recent_workouts': [{
                'name': row[0],
                'type': row[1],
                'duration': row[2],
                'calories': row[3],
                'date': row[4]
            } for row in recent_workouts]
        }

def get_fitness_goals(user_id):
    """Get user's fitness goals"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        SELECT id, goal_type, goal_value, current_value, target_date, is_achieved
        FROM fitness_goals
        WHERE user_id = ?
        ORDER BY created_at DESC
        """, (user_id,))
        
        goals = []
        for row in c.fetchall():
            goals.append({
                'id': row[0],
                'type': row[1],
                'target': row[2],
                'current': row[3],
                'target_date': row[4],
                'achieved': row[5]
            })
        
        return goals

def update_fitness_goal_progress(user_id, goal_id, current_value):
    """Update progress on a fitness goal"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Update current value
        c.execute("""
        UPDATE fitness_goals 
        SET current_value = ?
        WHERE id = ? AND user_id = ?
        """, (current_value, goal_id, user_id))
        
        # Check if goal is achieved
        c.execute("""
        SELECT goal_value FROM fitness_goals
        WHERE id = ? AND user_id = ?
        """, (goal_id, user_id))
        
        goal_value = c.fetchone()
        if goal_value and current_value >= goal_value[0]:
            c.execute("""
            UPDATE fitness_goals 
            SET is_achieved = TRUE
            WHERE id = ? AND user_id = ?
            """, (goal_id, user_id))
        
        conn.commit()

def add_fitness_goal(user_id, goal_type, goal_value, target_date):
    """Add a new fitness goal"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        INSERT INTO fitness_goals (user_id, goal_type, goal_value, target_date)
        VALUES (?, ?, ?, ?)
        """, (user_id, goal_type, goal_value, target_date))
        
        conn.commit()
        return c.lastrowid

def get_combined_dashboard_data(user_id):
    """Get combined nutrition and fitness data for the main dashboard"""
    # Get nutrition data
    nutrition_data = get_daily_totals(user_id)
    
    # Get fitness data
    fitness_data = get_fitness_dashboard_data(user_id)
    
    # Get user profile for goals
    profile = get_user_profile(user_id)
    
    # Calculate combined metrics
    combined_data = {
        'nutrition': nutrition_data,
        'fitness': fitness_data,
        'profile': profile,
        'combined_metrics': {
            'calories_consumed': nutrition_data['total_eaten'],
            'calories_burned_exercise': fitness_data['weekly_stats']['total_calories'],
            'net_calories': nutrition_data['total_eaten'] - fitness_data['weekly_stats']['total_calories'],
            'workout_nutrition_ratio': {
                'workouts_this_week': fitness_data['weekly_stats']['workouts'],
                'avg_calories_per_workout': fitness_data['weekly_stats']['total_calories'] / max(1, fitness_data['weekly_stats']['workouts']),
                'calories_per_workout_day': nutrition_data['total_eaten'] / max(1, fitness_data['weekly_stats']['workouts'])
            }
        }
    }
    
    return combined_data