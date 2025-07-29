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
       
        # Meal history table
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
       
        # Food preferences table
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
       
        # Custom foods table
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
       
        # Workout preferences table
        c.execute("""
        CREATE TABLE IF NOT EXISTS workout_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            workout_name TEXT,
            preference TEXT CHECK(preference IN ('liked', 'disliked')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, workout_name)
        )
        """)
        
        # Friends and social features tables
        c.execute("""
        CREATE TABLE IF NOT EXISTS friends (
        user_id   TEXT,
        friend_id TEXT,
        PRIMARY KEY(user_id, friend_id),
        FOREIGN KEY(user_id)   REFERENCES users(id),
        FOREIGN KEY(friend_id) REFERENCES users(id)
        )
        """)

        # Challenges table
        c.execute("""
        CREATE TABLE IF NOT EXISTS challenges (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id      TEXT    NOT NULL,
            title        TEXT    NOT NULL,
            description  TEXT    DEFAULT '',
            completed    BOOLEAN DEFAULT FALSE,
            created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deadline     TIMESTAMP,
            max_progress INTEGER DEFAULT 100,
            progress     INTEGER DEFAULT 0,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """)

        # Friend challenges table
        c.execute("""
        CREATE TABLE IF NOT EXISTS friend_challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            creator_id TEXT NOT NULL,
            target_friend_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            status TEXT CHECK(status IN ('pending', 'accepted', 'declined', 'completed')) DEFAULT 'pending',
            progress INTEGER DEFAULT 0,
            max_progress INTEGER DEFAULT 100,
            deadline TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            accepted_at TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY(creator_id) REFERENCES users(id),
            FOREIGN KEY(target_friend_id) REFERENCES users(id)
        )
        """)

        # Messages table for direct messaging
        c.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id TEXT NOT NULL,
            receiver_id TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sender_id) REFERENCES users(id),
            FOREIGN KEY(receiver_id) REFERENCES users(id)
        )
        """)

        # Friend activities table
        c.execute("""
        CREATE TABLE IF NOT EXISTS friend_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            description TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """)

        # Friend badges/achievements table
        c.execute("""
        CREATE TABLE IF NOT EXISTS friend_badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            badge TEXT NOT NULL,
            description TEXT,
            earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """)

        # Friend reminders table
        c.execute("""
        CREATE TABLE IF NOT EXISTS friend_reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            friend_id TEXT NOT NULL,
            message TEXT,
            remind_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(friend_id) REFERENCES users(id)
        )
        """)
        
        # VITALS TABLES
        c.execute("""
        CREATE TABLE IF NOT EXISTS vitals_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            metric_type TEXT NOT NULL,
            date_logged DATE NOT NULL,
            value_data TEXT, -- JSON data for flexible metric storage
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
        
        # Migrate existing vitals_data table to remove UNIQUE constraint if it exists
        migrate_vitals_data_table(c)
        
        c.execute("""
        CREATE TABLE IF NOT EXISTS vitals_streaks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            metric_type TEXT NOT NULL,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            last_logged_date DATE,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, metric_type)
        )
        """)
        
        c.execute("""
        CREATE TABLE IF NOT EXISTS custom_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            metric_name TEXT NOT NULL,
            metric_type TEXT CHECK(metric_type IN ('number', 'dropdown', 'boolean')),
            unit TEXT,
            target_value REAL,
            options TEXT, -- JSON array for dropdown options
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, metric_name)
        )
        """)
        
        conn.commit()
        print("Database initialized successfully")

def migrate_vitals_data_table(cursor):
    """Migrate vitals_data table to remove UNIQUE constraint if it exists"""
    try:
        # Check if the table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='vitals_data'")
        if cursor.fetchone():
            # Check if the UNIQUE constraint exists
            cursor.execute("PRAGMA index_list(vitals_data)")
            indexes = cursor.fetchall()
            
            # Look for the unique constraint index
            unique_index_name = None
            for index in indexes:
                index_name = index[1]
                # SQLite auto-creates indexes for UNIQUE constraints with names like sqlite_autoindex_table_name_N
                if index_name.startswith('sqlite_autoindex_vitals_data_'):
                    unique_index_name = index_name
                    break
            
            if unique_index_name:
                print(f"🔄 Removing UNIQUE constraint from vitals_data table: {unique_index_name}")
                cursor.execute(f"DROP INDEX {unique_index_name}")
                print("✅ UNIQUE constraint removed successfully")
            else:
                print("ℹ️ No UNIQUE constraint found on vitals_data table")
        else:
            print("ℹ️ vitals_data table doesn't exist yet, no migration needed")
    except Exception as e:
        print(f"⚠️ Warning: Could not migrate vitals_data table: {e}")

def init_fitness_tables():
    """Initialize fitness-related database tables"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Existing tables...
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
        
        # NEW TABLE FOR WORKOUT PREFERENCES
        c.execute("""
        CREATE TABLE IF NOT EXISTS workout_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            workout_name TEXT,
            preference TEXT CHECK(preference IN ('liked', 'disliked')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, workout_name)
        )
        """)
        
        # VITALS TABLES
        c.execute("""
        CREATE TABLE IF NOT EXISTS vitals_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            metric_type TEXT NOT NULL,
            date_logged DATE NOT NULL,
            value_data TEXT, -- JSON data for flexible metric storage
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
        
        c.execute("""
        CREATE TABLE IF NOT EXISTS vitals_streaks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            metric_type TEXT NOT NULL,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            last_logged_date DATE,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, metric_type)
        )
        """)
        
        c.execute("""
        CREATE TABLE IF NOT EXISTS custom_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            metric_name TEXT NOT NULL,
            metric_type TEXT CHECK(metric_type IN ('number', 'dropdown', 'boolean')),
            unit TEXT,
            target_value REAL,
            options TEXT, -- JSON array for dropdown options
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, metric_name)
        )
        """)
        
        conn.commit()
        print("Fitness and vitals tables initialized successfully")


def get_user_workout_preferences(user_id):
    """Get user's workout preferences (likes/dislikes) - ENHANCED VERSION"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        try:
            c.execute("""
            SELECT workout_name, preference
            FROM workout_preferences
            WHERE user_id = ?
            ORDER BY created_at DESC
            """, (user_id,))
            
            preferences = {'liked': [], 'disliked': []}
            for workout_name, preference in c.fetchall():
                if preference in preferences:
                    preferences[preference].append(workout_name)
            
            print(f"📊 Retrieved preferences for user {user_id}: {len(preferences['liked'])} liked, {len(preferences['disliked'])} disliked")
            return preferences
        
        except Exception as e:
            print(f"❌ Error getting workout preferences: {e}")
            return {'liked': [], 'disliked': []}

def remove_workout_preference(user_id, workout_name):
    """Remove a workout preference"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        DELETE FROM workout_preferences
        WHERE user_id = ? AND workout_name = ?
        """, (user_id, workout_name))
        
        removed_count = c.rowcount
        conn.commit()
        
        print(f"🗑️ Removed {removed_count} preference(s) for workout '{workout_name}' for user {user_id}")
        return removed_count > 0

def get_all_disliked_workouts(user_id):
    """Get all workouts that the user has disliked - for filtering suggestions"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        try:
            c.execute("""
            SELECT workout_name
            FROM workout_preferences
            WHERE user_id = ? AND preference = 'disliked'
            """, (user_id,))
            
            disliked = [row[0] for row in c.fetchall()]
            print(f"🚫 User {user_id} has disliked {len(disliked)} workouts")
            return disliked
        
        except Exception as e:
            print(f"❌ Error getting disliked workouts: {e}")
            return []
        
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
            
            # Populate sample data for new user
            populate_sample_data_for_user(user_id)
            
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

def update_user_profile(user_id, profile_data, partial_update=False):
    """Update user profile with dietary restrictions support"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
       
        # Get current profile data if doing partial update
        current_profile = {}
        if partial_update:
            current_profile = get_user_profile(user_id) or {}
        
        # Merge current data with new data
        merged_data = current_profile.copy()
        merged_data.update(profile_data)
        
        # Handle equipment processing
        if 'home_equipment' in profile_data:
            if isinstance(profile_data['home_equipment'], list):
                merged_data['available_equipment'] = ', '.join(profile_data['home_equipment'])
            else:
                merged_data['available_equipment'] = profile_data['home_equipment']
        
        # Calculate age from date_of_birth if present
        age = None
        if merged_data.get('date_of_birth'):
            try:
                birth_date = datetime.strptime(merged_data['date_of_birth'], '%Y-%m-%d')
                age = (datetime.now() - birth_date).days // 365
            except:
                age = 25  # Default age if parsing fails
        elif current_profile.get('date_of_birth'):
            try:
                birth_date = datetime.strptime(current_profile['date_of_birth'], '%Y-%m-%d')
                age = (datetime.now() - birth_date).days // 365
            except:
                age = 25
       
        # Calculate calorie goals if we have enough data
        calorie_goal = protein_goal = carbs_goal = fat_goal = None
        if all(k in merged_data for k in ['weight_lb', 'height_cm', 'gender', 'activity_level']):
            try:
                bmr = calculate_bmr(
                    float(merged_data['weight_lb']),
                    float(merged_data['height_cm']),
                    age or 25,
                    merged_data['gender']
                )
                fitness_goals = merged_data.get('fitness_goals', [])
                if isinstance(fitness_goals, str):
                    fitness_goals = json.loads(fitness_goals)
                calorie_goal, protein_goal, carbs_goal, fat_goal = calculate_calorie_goals(
                    bmr,
                    merged_data['activity_level'],
                    fitness_goals
                )
            except Exception as e:
                print(f"Error calculating goals: {e}")
                # Keep existing goals if calculation fails
                if current_profile:
                    calorie_goal = current_profile.get('calorie_goal')
                    protein_goal = current_profile.get('protein_goal')
                    carbs_goal = current_profile.get('carbs_goal')
                    fat_goal = current_profile.get('fat_goal')
       
        # Build update query for users table
        user_fields = ['first_name', 'last_name', 'date_of_birth', 'gender',
                       'height_cm', 'weight_lb', 'activity_level', 'dietary_restrictions']
        
        user_updates = []
        user_values = []
        
        for field in user_fields:
            if field in profile_data:
                user_updates.append(f"{field} = ?")
                value = profile_data[field]
                
                # Convert dietary restrictions list to JSON string
                if field == 'dietary_restrictions' and isinstance(value, list):
                    value = json.dumps(value)
                
                user_values.append(value)
        
        # Add calculated goals if available
        if calorie_goal is not None:
            user_updates.append("calorie_goal = ?")
            user_values.append(calorie_goal)
        if protein_goal is not None:
            user_updates.append("protein_goal = ?")
            user_values.append(protein_goal)
        if carbs_goal is not None:
            user_updates.append("carbs_goal = ?")
            user_values.append(carbs_goal)
        if fat_goal is not None:
            user_updates.append("fat_goal = ?")
            user_values.append(fat_goal)
        
        # Always mark profile as completed when updating
        user_updates.append("profile_completed = TRUE")
        user_updates.append("updated_at = CURRENT_TIMESTAMP")
        
        if user_updates:
            user_values.append(user_id)
            c.execute(f"""
            UPDATE users SET {', '.join(user_updates)}
            WHERE id = ?
            """, user_values)
       
        # Build update query for preferences table
        pref_fields = ['has_gym_membership', 'available_equipment', 'primary_focus',
                       'fitness_goals', 'dietary_restrictions', 'training_styles',
                       'workout_frequency', 'workout_duration', 'fitness_experience',
                       'meal_prep_time', 'cooking_skill', 'budget_preference']
        
        pref_updates = []
        pref_values = []
        
        for field in pref_fields:
            if field in profile_data or field in merged_data:
                pref_updates.append(f"{field} = ?")
                
                # Use new data if available, otherwise use merged data
                value = profile_data.get(field, merged_data.get(field))
                
                # Convert lists to JSON strings
                if isinstance(value, list):
                    value = json.dumps(value)
                pref_values.append(value)
        
        if pref_updates:
            pref_updates.append("updated_at = CURRENT_TIMESTAMP")
            pref_values.append(user_id)
            
            c.execute(f"""
            UPDATE user_preferences SET {', '.join(pref_updates)}
            WHERE user_id = ?
            """, pref_values)
       
        conn.commit()

def get_user_profile(user_id):
    """Get complete user profile data - ENHANCED for dietary restrictions"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
       
        # Get user data including dietary restrictions from both tables
        c.execute("""
        SELECT u.*, p.has_gym_membership, p.available_equipment, p.primary_focus,
               p.fitness_goals, COALESCE(p.dietary_restrictions, u.dietary_restrictions, '[]') as dietary_restrictions, 
               p.training_styles, p.workout_frequency, p.workout_duration, p.fitness_experience,
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
        
        # Parse equipment into home_equipment list for consistency
        if profile.get('available_equipment'):
            if profile['available_equipment'] == 'gym_membership_full_access':
                profile['home_equipment'] = []
            else:
                profile['home_equipment'] = [eq.strip() for eq in profile['available_equipment'].split(',') if eq.strip()]
        else:
            profile['home_equipment'] = []
       
        return profile

def get_user_dietary_restrictions(user_id):
    """Get user's dietary restrictions as a list"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Try to get from user_preferences first, then users table
        c.execute("""
        SELECT COALESCE(p.dietary_restrictions, u.dietary_restrictions, '[]')
        FROM users u
        LEFT JOIN user_preferences p ON u.id = p.user_id
        WHERE u.id = ?
        """, (user_id,))
        
        result = c.fetchone()
        if result and result[0]:
            try:
                restrictions = json.loads(result[0])
                return restrictions if isinstance(restrictions, list) else []
            except:
                return []
        return []

def update_dietary_restrictions(user_id, restrictions):
    """Update user's dietary restrictions"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        restrictions_json = json.dumps(restrictions) if isinstance(restrictions, list) else restrictions
        
        # Update in both tables for consistency
        c.execute("""
        UPDATE users SET dietary_restrictions = ? WHERE id = ?
        """, (restrictions_json, user_id))
        
        c.execute("""
        UPDATE user_preferences SET dietary_restrictions = ? WHERE user_id = ?
        """, (restrictions_json, user_id))
        
        conn.commit()
        
def get_meal_progress(user_id):
    """Get meal progress with current items and smart calorie allocations"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()

        # Get user's daily calorie goal
        c.execute("SELECT calorie_goal FROM users WHERE id = ?", (user_id,))
        result = c.fetchone()
        calorie_goal = result[0] if result and result[0] else 2000  # default fallback

        # Define dynamic allocations as proportions
        allocations = {
            'breakfast': 0.25,
            'lunch': 0.30,
            'dinner': 0.35,
            'snacks': 0.10
        }

        # Calculate allocations based on calorie goal
        meal_allocations = {
            meal: round(calorie_goal * proportion)
            for meal, proportion in allocations.items()
        }

        # Initialize meal data structure
        meal_data = {
            meal: {
                "calories_allocated": meal_allocations[meal],
                "calories_eaten": 0,
                "calories_remaining": meal_allocations[meal],
                "protein_eaten": 0,
                "carbohydrates_eaten": 0,
                "fat_eaten": 0,
                "progress_percentage": 0
            }
            for meal in allocations
        }

        # Fetch current meal item totals
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

        for row in c.fetchall():
            meal_type = row[0]
            if meal_type in meal_data:
                calories_eaten = row[1]
                allocated = meal_data[meal_type]['calories_allocated']
                meal_data[meal_type].update({
                    "calories_eaten": calories_eaten,
                    "calories_remaining": allocated - calories_eaten,
                    "protein_eaten": row[2],
                    "carbohydrates_eaten": row[3],
                    "fat_eaten": row[4],
                    "progress_percentage": (calories_eaten / allocated) * 100 if allocated > 0 else 0
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

# Fitness-related database functions

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
       
        # Add activity for workout completion directly to avoid database locking
        workout_name = workout_data.get('name', 'workout')
        duration = workout_data.get('duration', 0)
        c.execute("""
            INSERT INTO friend_activities (user_id, type, description)
            VALUES (?, ?, ?)
        """, (user_id, "workout", f"completed a {duration}-minute {workout_name} session"))
        
        # Check for calorie-based badges
        c.execute("""
            SELECT COALESCE(SUM(calories_burned), 0) FROM workout_sessions 
            WHERE user_id = ?
        """, (user_id,))
        total_calories = c.fetchone()[0] or 0
        
        # Get existing badges to avoid duplicates
        c.execute("""
            SELECT badge FROM friend_badges WHERE user_id = ?
        """, (user_id,))
        existing_badges = [row[0] for row in c.fetchall()]
        
        # Calorie milestone badges
        calorie_badges = [
            (1000, "Calorie Burner", "Burned 1,000+ calories! You're on fire!"),
            (5000, "Calorie Crusher", "Burned 5,000+ calories! Incredible dedication!"),
            (10000, "Calorie Champion", "Burned 10,000+ calories! You're unstoppable!"),
            (25000, "Calorie Legend", "Burned 25,000+ calories! You're a fitness legend!"),
            (50000, "Calorie Master", "Burned 50,000+ calories! You're absolutely incredible!"),
            (100000, "Calorie God", "Burned 100,000+ calories! You're a fitness deity!")
        ]
        
        for required_calories, badge_name, description in calorie_badges:
            if total_calories >= required_calories and badge_name not in existing_badges:
                c.execute("""
                    INSERT INTO friend_badges (user_id, badge, description, earned_at)
                    VALUES (?, ?, ?, ?)
                """, (user_id, badge_name, description, datetime.now().isoformat()))
                
                c.execute("""
                    INSERT INTO friend_activities (user_id, type, description)
                    VALUES (?, ?, ?)
                """, (user_id, "badge", f"earned the '{badge_name}' badge"))
        
        # Progressive workout badges
        c.execute("""
            SELECT COUNT(*) FROM workout_sessions 
            WHERE user_id = ?
        """, (user_id,))
        total_workouts = c.fetchone()[0]
        
        workout_badges = [
            (5, "Workout Beginner", "Completed 5+ workouts! You're building great habits!"),
            (10, "Workout Warrior", "Completed 10+ workouts! You're getting stronger!"),
            (25, "Workout Regular", "Completed 25+ workouts! Consistency is your superpower!"),
            (50, "Workout Master", "Completed 50+ workouts! You're absolutely dedicated!"),
            (100, "Workout Legend", "Completed 100+ workouts! You're a fitness legend!"),
            (250, "Workout Champion", "Completed 250+ workouts! You're unstoppable!")
        ]
        
        for required_workouts, badge_name, description in workout_badges:
            if total_workouts >= required_workouts and badge_name not in existing_badges:
                c.execute("""
                    INSERT INTO friend_badges (user_id, badge, description, earned_at)
                    VALUES (?, ?, ?, ?)
                """, (user_id, badge_name, description, datetime.now().isoformat()))
                
                c.execute("""
                    INSERT INTO friend_activities (user_id, type, description)
                    VALUES (?, ?, ?)
                """, (user_id, "badge", f"earned the '{badge_name}' badge"))
       
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
        
        # Insert new plan (don't deactivate others for custom workouts)
        c.execute("""
        INSERT INTO workout_plans (user_id, plan_name, plan_data, is_active)
        VALUES (?, ?, ?, ?)
        """, (user_id, plan_name, json.dumps(plan_data), True))
        
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
                'workouts': week_stats[0] if week_stats else 0,
                'total_duration': week_stats[1] if week_stats else 0,
                'total_calories': week_stats[2] if week_stats else 0,
                'avg_duration': round(week_stats[3]) if week_stats else 0
            },
            'monthly_stats': {
                'workouts': month_stats[0] if month_stats else 0,
                'total_duration': month_stats[1] if month_stats else 0,
                'total_calories': month_stats[2] if month_stats else 0
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

def save_workout_preference(user_id, workout_name, preference):
    """Save a workout preference (liked or disliked) - FIXED VERSION"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # First, remove any existing preference for this workout to avoid duplicates
        c.execute("""
        DELETE FROM workout_preferences
        WHERE user_id = ? AND workout_name = ?
        """, (user_id, workout_name))
        
        # Then insert the new preference
        c.execute("""
        INSERT INTO workout_preferences
        (user_id, workout_name, preference)
        VALUES (?, ?, ?)
        """, (user_id, workout_name, preference))
        
        conn.commit()
        
        print(f"✅ Saved workout preference: {workout_name} -> {preference} for user {user_id}")


def get_user_custom_workouts(user_id):
    """Get all custom workouts for a user"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        SELECT id, plan_name, plan_data, created_at, is_active
        FROM workout_plans
        WHERE user_id = ? AND plan_name LIKE 'Custom:%'
        ORDER BY created_at DESC
        """, (user_id,))
        
        workouts = []
        for row in c.fetchall():
            try:
                plan_data = json.loads(row[2])
                workouts.append({
                    'id': row[0],
                    'name': row[1].replace('Custom: ', ''),
                    'workout_data': plan_data,
                    'created_at': row[3],
                    'is_active': row[4]
                })
            except json.JSONDecodeError:
                print(f"Error parsing workout data for workout ID {row[0]}")
                continue
        
        return workouts



def delete_custom_workout(user_id, workout_id):
    """Delete a custom workout"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        DELETE FROM workout_plans
        WHERE id = ? AND user_id = ? AND plan_name LIKE 'Custom:%'
        """, (workout_id, user_id))
        
        conn.commit()
        return c.rowcount > 0


def save_workout_session(user_id, workout_data):
    """Save a completed workout session"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        INSERT INTO workout_sessions
        (user_id, workout_name, workout_type, duration_minutes, calories_burned,
         difficulty_level, date_completed, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            workout_data['name'],
            workout_data.get('type', 'strength'),
            workout_data['duration'],
            workout_data.get('calories_burned', 0),
            workout_data.get('intensity', 'moderate'),
            workout_data.get('date_completed', datetime.now().strftime('%Y-%m-%d')),
            workout_data.get('notes', '')
        ))
        
        workout_session_id = c.lastrowid
        
        # Save individual exercises if provided
        if 'exercises' in workout_data and workout_data['exercises']:
            for exercise in workout_data['exercises']:
                c.execute("""
                INSERT INTO exercise_performance
                (user_id, workout_session_id, exercise_name, sets, reps, weight_lb,
                 rest_seconds, date_performed)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    user_id,
                    workout_session_id,
                    exercise.get('name', ''),
                    exercise.get('sets', 0),
                    exercise.get('reps', 0),
                    exercise.get('weight', 0),
                    exercise.get('rest_seconds', 0),
                    workout_data.get('date_completed', datetime.now().strftime('%Y-%m-%d'))
                ))
        
        conn.commit()
        return workout_session_id


def get_recent_workouts(user_id, limit=10):
    """Get recent workout sessions for a user"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        SELECT workout_name, workout_type, duration_minutes, calories_burned,
               difficulty_level, date_completed, notes
        FROM workout_sessions
        WHERE user_id = ?
        ORDER BY date_completed DESC, created_at DESC
        LIMIT ?
        """, (user_id, limit))
        
        workouts = []
        for row in c.fetchall():
            workouts.append({
                'name': row[0],
                'type': row[1],
                'duration': row[2],
                'calories_burned': row[3],
                'intensity': row[4],
                'date_completed': row[5],
                'notes': row[6]
            })
        
        return workouts


def get_workout_stats(user_id, days_back=30):
    """Get workout statistics for the dashboard"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get stats for the specified time period
        since_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
        
        c.execute("""
        SELECT 
            COUNT(*) as total_workouts,
            COALESCE(SUM(duration_minutes), 0) as total_minutes,
            COALESCE(SUM(calories_burned), 0) as total_calories,
            COALESCE(AVG(duration_minutes), 0) as avg_duration
        FROM workout_sessions
        WHERE user_id = ? AND date_completed >= ?
        """, (user_id, since_date))
        
        stats = c.fetchone()
        
        return {
            'total_workouts': stats[0] if stats else 0,
            'total_minutes': int(stats[1]) if stats else 0,
            'total_calories': int(stats[2]) if stats else 0,
            'avg_duration': round(stats[3], 1) if stats else 0
        }


def save_custom_workout(user_id, workout_data):
    """Save a custom workout plan"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Convert workout data to JSON string
        workout_json = json.dumps(workout_data)
        
        c.execute("""
        INSERT INTO workout_plans
        (user_id, plan_name, plan_data)
        VALUES (?, ?, ?)
        """, (user_id, f"Custom: {workout_data.get('name', 'Custom Workout')}", workout_json))

def search_users(exclude_user_id, query):
    like = f"%{query}%"
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""
        SELECT id, username, first_name, last_name
        FROM users
        WHERE id != ?
          AND (username LIKE ? COLLATE NOCASE
               OR first_name LIKE ? COLLATE NOCASE
               OR last_name LIKE ? COLLATE NOCASE)
        ORDER BY username
        LIMIT 20
        """, (exclude_user_id, like, like, like))

        return [
            {
              "user_id":    row[0],
              "username":   row[1],
              "first_name": row[2],
              "last_name":  row[3],
              "name":       f"{row[2]} {row[3]}".strip()
            }
            for row in c.fetchall()
        ]

def get_user_friends(user_id):
    """List your current friends."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""
          SELECT u.id, u.username, u.first_name, u.last_name
            FROM users u
            JOIN friends f
              ON f.friend_id = u.id
           WHERE f.user_id = ?
        """, (user_id,))
        return [
          {"user_id": row[0], "username": row[1], "first_name": row[2], "last_name": row[3]}
          for row in c.fetchall()
        ]

def add_friend(user_id, friend_id):
    """Create a mutual friendship link."""
    if user_id == friend_id:
        return False, "Cannot friend yourself"
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        # Check existing
        c.execute("SELECT 1 FROM friends WHERE user_id=? AND friend_id=?", (user_id, friend_id))
        if c.fetchone():
            return False, "Already friends"
        # Insert both directions
        c.execute("INSERT INTO friends (user_id, friend_id) VALUES (?, ?)", (user_id, friend_id))
        c.execute("INSERT INTO friends (user_id, friend_id) VALUES (?, ?)", (friend_id, user_id))
        conn.commit()
        return True, "Friend added"

def remove_friend(user_id, friend_id):
    """Tear down a friendship link."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        # Check existing
        c.execute("SELECT 1 FROM friends WHERE user_id=? AND friend_id=?", (user_id, friend_id))
        if not c.fetchone():
            return False, "Not friends"
        # Delete both directions
        c.execute("DELETE FROM friends WHERE user_id=? AND friend_id=?", (user_id, friend_id))
        c.execute("DELETE FROM friends WHERE user_id=? AND friend_id=?", (friend_id, user_id))
        conn.commit()
        return True, "Friend removed"

def create_friend_challenge(creator_id, target_friend_id, title, description="", max_progress=100):
    """Create a new friend challenge."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        # Check if they are friends
        c.execute("SELECT 1 FROM friends WHERE user_id=? AND friend_id=?", (creator_id, target_friend_id))
        if not c.fetchone():
            return False, "Not friends with this user"
        
        c.execute("""
            INSERT INTO friend_challenges (creator_id, target_friend_id, title, description, max_progress)
            VALUES (?, ?, ?, ?, ?)
        """, (creator_id, target_friend_id, title, description, max_progress))
        conn.commit()
        return True, "Challenge created successfully"

def get_friend_challenges(user_id):
    """Get all friend challenges for a user (both sent and received)."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get challenges sent to this user
        c.execute("""
            SELECT fc.id, fc.creator_id, fc.target_friend_id, fc.title, fc.description,
                   fc.status, fc.progress, fc.max_progress, fc.created_at,
                   u.username as creator_username, u.first_name as creator_first_name
            FROM friend_challenges fc
            JOIN users u ON fc.creator_id = u.id
            WHERE fc.target_friend_id = ?
            ORDER BY fc.created_at DESC
        """, (user_id,))
        
        received_challenges = []
        for row in c.fetchall():
            received_challenges.append({
                "id": row[0],
                "creator_id": row[1],
                "target_friend_id": row[2],
                "title": row[3],
                "description": row[4],
                "status": row[5],
                "progress": row[6],
                "max_progress": row[7],
                "created_at": row[8],
                "creator_name": row[10] if row[10] else row[9],
                "type": "received"
            })
        
        # Get challenges sent by this user
        c.execute("""
            SELECT fc.id, fc.creator_id, fc.target_friend_id, fc.title, fc.description,
                   fc.status, fc.progress, fc.max_progress, fc.created_at,
                   u.username as target_username, u.first_name as target_first_name
            FROM friend_challenges fc
            JOIN users u ON fc.target_friend_id = u.id
            WHERE fc.creator_id = ?
            ORDER BY fc.created_at DESC
        """, (user_id,))
        
        sent_challenges = []
        for row in c.fetchall():
            sent_challenges.append({
                "id": row[0],
                "creator_id": row[1],
                "target_friend_id": row[2],
                "title": row[3],
                "description": row[4],
                "status": row[5],
                "progress": row[6],
                "max_progress": row[7],
                "created_at": row[8],
                "target_name": row[10] if row[10] else row[9],
                "type": "sent"
            })
        
        return {"received": received_challenges, "sent": sent_challenges}

def respond_to_friend_challenge(user_id, challenge_id, response):
    """Accept or decline a friend challenge."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Verify this challenge belongs to the user
        c.execute("SELECT target_friend_id, status FROM friend_challenges WHERE id = ?", (challenge_id,))
        result = c.fetchone()
        if not result:
            return False, "Challenge not found"
        
        if result[0] != user_id:
            return False, "Not authorized to respond to this challenge"
        
        if result[1] != 'pending':
            return False, "Challenge has already been responded to"
        
        if response not in ['accepted', 'declined']:
            return False, "Invalid response"
        
        c.execute("""
            UPDATE friend_challenges 
            SET status = ?, accepted_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        """, (response, challenge_id))
        conn.commit()
        return True, f"Challenge {response}"

def update_friend_challenge_progress(user_id, challenge_id, progress):
    """Update progress on a friend challenge."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Verify this challenge belongs to the user (they can update if they're the target)
        c.execute("SELECT target_friend_id, max_progress, status FROM friend_challenges WHERE id = ?", (challenge_id,))
        result = c.fetchone()
        if not result:
            return False, "Challenge not found"
        
        if result[0] != user_id:
            return False, "Not authorized to update this challenge"
        
        if result[2] != 'accepted':
            return False, "Challenge must be accepted before updating progress"
        
        # Ensure progress is within bounds
        progress = max(0, min(progress, result[1]))
        
        # Check if completing the challenge
        status = 'completed' if progress >= result[1] else 'accepted'
        completed_at = 'CURRENT_TIMESTAMP' if status == 'completed' else None
        
        if completed_at:
            c.execute("""
                UPDATE friend_challenges 
                SET progress = ?, status = ?, completed_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            """, (progress, status, challenge_id))
        else:
            c.execute("""
                UPDATE friend_challenges 
                SET progress = ? 
                WHERE id = ?
            """, (progress, challenge_id))
        
        conn.commit()
        return True, "Progress updated"

def get_friend_preferences(user_id, friend_id):
    """Get a friend's food and workout preferences."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Check if they are friends
        c.execute("SELECT 1 FROM friends WHERE user_id=? AND friend_id=?", (user_id, friend_id))
        if not c.fetchone():
            return None, "Not friends with this user"
        
        # Get food preferences
        c.execute("""
            SELECT meal_type, food_name, preference
            FROM food_preferences WHERE user_id = ?
            ORDER BY meal_type, food_name
        """, (friend_id,))
        
        food_preferences = {'liked': [], 'disliked': []}
        meal_preferences = {}
        
        for meal_type, food_name, preference in c.fetchall():
            if meal_type not in meal_preferences:
                meal_preferences[meal_type] = {'liked': [], 'disliked': []}
            
            meal_preferences[meal_type][preference].append(food_name)
            
            if meal_type != 'global':
                food_preferences[preference].append(f"{food_name} ({meal_type})")
            else:
                if preference == 'disliked':
                    food_preferences[preference].append(food_name)
        
        # Get workout preferences
        c.execute("""
            SELECT primary_focus, fitness_goals, training_styles, fitness_experience,
                   has_gym_membership, available_equipment, workout_frequency, workout_duration
            FROM user_preferences WHERE user_id = ?
        """, (friend_id,))
        
        workout_prefs = {}
        result = c.fetchone()
        if result:
            workout_prefs = {
                "primary_focus": result[0],
                "fitness_goals": json.loads(result[1]) if result[1] else [],
                "training_styles": json.loads(result[2]) if result[2] else [],
                "fitness_experience": result[3],
                "has_gym_membership": bool(result[4]),
                "available_equipment": result[5],
                "workout_frequency": result[6],
                "workout_duration": result[7]
            }
        
        # Get workout likes/dislikes
        c.execute("""
            SELECT workout_name, preference
            FROM workout_preferences WHERE user_id = ?
            ORDER BY created_at DESC
        """, (friend_id,))
        
        workout_likes_dislikes = {'liked': [], 'disliked': []}
        for workout_name, preference in c.fetchall():
            if preference in workout_likes_dislikes:
                workout_likes_dislikes[preference].append(workout_name)
        
        return {
            "food_preferences": food_preferences,
            "meal_preferences": meal_preferences,
            "workout_preferences": workout_prefs,
            "workout_likes_dislikes": workout_likes_dislikes
        }, "Success"

def create_challenge(user_id, title, description, deadline, max_progress):
    """Create a new personal challenge."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""
            INSERT INTO challenges (user_id, title, description, deadline, max_progress, progress)
            VALUES (?, ?, ?, ?, ?, 0)
        """, (user_id, title, description, deadline, max_progress))
        conn.commit()
        return c.lastrowid

def update_challenge_progress(user_id, challenge_id, progress):
    """Update progress for a personal challenge."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get current challenge info
        c.execute("SELECT max_progress, completed, title FROM challenges WHERE id = ? AND user_id = ?", (challenge_id, user_id))
        result = c.fetchone()
        if not result:
            return False, "Challenge not found"
        
        max_progress, was_completed, title = result
        new_completed = progress >= max_progress
        
        # Check if this will be their first completed challenge (before updating)
        if new_completed and not was_completed:
            c.execute("""
                SELECT COUNT(*) FROM challenges 
                WHERE user_id = ? AND completed = 1
            """, (user_id,))
            completed_count_before = c.fetchone()[0]
            will_be_first = completed_count_before == 0
            new_total_completed = completed_count_before + 1
        
        c.execute("""
            UPDATE challenges SET progress = ?, completed = ?
            WHERE id = ? AND user_id = ?
        """, (progress, new_completed, challenge_id, user_id))
        
        # Add activity if challenge was just completed
        if new_completed and not was_completed:
            # Add activity directly to avoid database locking
            c.execute("""
                INSERT INTO friend_activities (user_id, type, description)
                VALUES (?, ?, ?)
            """, (user_id, "challenge", f"completed the '{title}' challenge"))
            
            # Award progressive challenge badges
            if will_be_first:
                # First Challenge badge
                c.execute("""
                    SELECT 1 FROM friend_badges 
                    WHERE user_id = ? AND badge = 'First Challenge'
                """, (user_id,))
                has_badge = c.fetchone()
                
                if not has_badge:
                    c.execute("""
                        INSERT INTO friend_badges (user_id, badge, description, earned_at)
                        VALUES (?, ?, ?, ?)
                    """, (user_id, "First Challenge", "Completed your first challenge! Great start!", datetime.now().isoformat()))
                    
                    c.execute("""
                        INSERT INTO friend_activities (user_id, type, description)
                        VALUES (?, ?, ?)
                    """, (user_id, "badge", "earned the 'First Challenge' badge"))
            
            # Progressive challenge badges
            challenge_badges = [
                (2, "Challenge Enthusiast", "Completed 2 challenges! You're getting the hang of this!"),
                (3, "Challenge Regular", "Completed 3 challenges! Consistency is key!"),
                (5, "Challenge Master", "Completed 5+ challenges! You're unstoppable!"),
                (10, "Challenge Legend", "Completed 10+ challenges! You're a fitness legend!"),
                (25, "Challenge Champion", "Completed 25+ challenges! You're absolutely incredible!")
            ]
            
            for required_count, badge_name, description in challenge_badges:
                if new_total_completed >= required_count:
                    c.execute("""
                        SELECT 1 FROM friend_badges 
                        WHERE user_id = ? AND badge = ?
                    """, (user_id, badge_name))
                    has_badge = c.fetchone()
                    
                    if not has_badge:
                        c.execute("""
                            INSERT INTO friend_badges (user_id, badge, description, earned_at)
                            VALUES (?, ?, ?, ?)
                        """, (user_id, badge_name, description, datetime.now().isoformat()))
                        
                        c.execute("""
                            INSERT INTO friend_activities (user_id, type, description)
                            VALUES (?, ?, ?)
                        """, (user_id, "badge", f"earned the '{badge_name}' badge"))
        
        conn.commit()
        return True, "Progress updated successfully"

def delete_challenge(user_id, challenge_id):
    """Delete a personal challenge."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("DELETE FROM challenges WHERE id = ? AND user_id = ?", (challenge_id, user_id))
        conn.commit()
        return c.rowcount > 0

def delete_friend_challenge(user_id, challenge_id):
    """Delete a friend challenge (only creator can delete)."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("DELETE FROM friend_challenges WHERE id = ? AND creator_id = ?", (challenge_id, user_id))
        conn.commit()
        return c.rowcount > 0

def fetch_weekly_challenges(user_id: str) -> list:
    """Return all challenges (including custom) for this user."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""
            SELECT id, title, description, completed, deadline, max_progress, progress
            FROM challenges
            WHERE user_id = ?
            ORDER BY created_at
        """, (user_id,))
        rows = c.fetchall()
        return [
            {
                "id":          row[0],
                "title":       row[1],
                "description": row[2],
                "completed":   bool(row[3]),
                "deadline":    row[4],
                "max_progress": row[5],
                "progress":    row[6],
            }
            for row in rows
        ]

def create_friend_challenge(creator_id, target_friend_id, title, description, max_progress, deadline):
    """Create a new friend challenge."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        # Check if they are friends
        c.execute("SELECT 1 FROM friends WHERE user_id=? AND friend_id=?", (creator_id, target_friend_id))
        if not c.fetchone():
            return False, "Not friends with this user"
        c.execute("""
            INSERT INTO friend_challenges (creator_id, target_friend_id, title, description, max_progress, deadline)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (creator_id, target_friend_id, title, description, max_progress, deadline))
        conn.commit()
        return True, "Challenge created successfully"

def update_friend_challenge_progress(user_id, challenge_id, progress):
    """Update progress on a friend challenge."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        # Verify this challenge belongs to the user (they can update if they're the target)
        c.execute("SELECT target_friend_id, max_progress, status FROM friend_challenges WHERE id = ?", (challenge_id,))
        result = c.fetchone()
        if not result:
            return False, "Challenge not found"
        if result[0] != user_id:
            return False, "Not authorized to update this challenge"
        if result[2] != 'accepted':
            return False, "Challenge must be accepted before updating progress"
        # Ensure progress is within bounds
        progress = max(0, min(progress, result[1]))
        # Check if completing the challenge
        status = 'completed' if progress >= result[1] else 'accepted'
        completed_at = 'CURRENT_TIMESTAMP' if status == 'completed' else None
        if completed_at:
            c.execute("""
                UPDATE friend_challenges 
                SET progress = ?, status = ?, completed_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            """, (progress, status, challenge_id))
        else:
            c.execute("""
                UPDATE friend_challenges 
                SET progress = ? 
                WHERE id = ?
            """, (progress, challenge_id))
        conn.commit()
        return True, "Progress updated"

def get_friend_challenges_with_progress(user_id):
    """Get all friend challenges for a user, including their progress."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get challenges sent to this user
        c.execute("""
            SELECT fc.id, fc.creator_id, fc.target_friend_id, fc.title, fc.description,
                   fc.status, fc.progress, fc.max_progress, fc.created_at, fc.deadline,
                   u.username as creator_username, u.first_name as creator_first_name
            FROM friend_challenges fc
            JOIN users u ON fc.creator_id = u.id
            WHERE fc.target_friend_id = ?
            ORDER BY fc.created_at DESC
        """, (user_id,))
        
        received_challenges = []
        for row in c.fetchall():
            received_challenges.append({
                "id": row[0],
                "creator_id": row[1],
                "target_friend_id": row[2],
                "title": row[3],
                "description": row[4],
                "status": row[5],
                "progress": row[6],
                "max_progress": row[7],
                "created_at": row[8],
                "deadline": row[9],
                "creator_name": row[10] if row[10] else row[11],
                "type": "received"
            })
        
        # Get challenges sent by this user
        c.execute("""
            SELECT fc.id, fc.creator_id, fc.target_friend_id, fc.title, fc.description,
                   fc.status, fc.progress, fc.max_progress, fc.created_at, fc.deadline,
                   u.username as target_username, u.first_name as target_first_name
            FROM friend_challenges fc
            JOIN users u ON fc.target_friend_id = u.id
            WHERE fc.creator_id = ?
            ORDER BY fc.created_at DESC
        """, (user_id,))
        
        sent_challenges = []
        for row in c.fetchall():
            sent_challenges.append({
                "id": row[0],
                "creator_id": row[1],
                "target_friend_id": row[2],
                "title": row[3],
                "description": row[4],
                "status": row[5],
                "progress": row[6],
                "max_progress": row[7],
                "created_at": row[8],
                "deadline": row[9],
                "target_name": row[10] if row[10] else row[11],
                "type": "sent"
            })
        
        return {"received": received_challenges, "sent": sent_challenges}

def get_challenge_progress(user_id, challenge_id):
    """Get the progress and deadline of a specific challenge."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""
            SELECT progress, deadline
            FROM challenges
            WHERE id = ? AND user_id = ?
        """, (challenge_id, user_id))
        result = c.fetchone()
        if result:
            return {
                "progress": result[0],
                "deadline": result[1]
            }
        return None

def get_challenge_deadline(user_id, challenge_id):
    """Get the deadline of a specific challenge."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""
            SELECT deadline
            FROM challenges
            WHERE id = ? AND user_id = ?
        """, (challenge_id, user_id))
        result = c.fetchone()
        if result:
            return result[0]
        return None

def get_friends_leaderboard(user_id, metric='streak', limit=10):
    """Get leaderboard of friends by metric (streak, challenges, workouts)."""
    import sqlite3
    DB_PATH = __import__("os").path.join(__import__("os").path.dirname(__file__), "nutrifit.db")
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        # Get friend ids
        c.execute("SELECT friend_id FROM friends WHERE user_id = ?", (user_id,))
        friend_ids = [row[0] for row in c.fetchall()]
        if not friend_ids:
            return []
        q_marks = ",".join(["?"] * len(friend_ids))
        if metric == 'streak':
            c.execute(f"""
                SELECT u.id, u.username, u.first_name, u.last_name, u.current_day as streak
                FROM users u
                WHERE u.id IN ({q_marks})
                ORDER BY u.current_day DESC
                LIMIT ?
            """, (*friend_ids, limit))
        elif metric == 'challenges':
            c.execute(f"""
                SELECT u.id, u.username, u.first_name, u.last_name, COUNT(c.id) as challenges
                FROM users u
                LEFT JOIN challenges c ON c.user_id = u.id AND c.completed = 1
                WHERE u.id IN ({q_marks})
                GROUP BY u.id
                ORDER BY challenges DESC
                LIMIT ?
            """, (*friend_ids, limit))
        elif metric == 'workouts':
            c.execute(f"""
                SELECT u.id, u.username, u.first_name, u.last_name, COUNT(w.id) as workouts
                FROM users u
                LEFT JOIN workout_sessions w ON w.user_id = u.id
                WHERE u.id IN ({q_marks})
                GROUP BY u.id
                ORDER BY workouts DESC
                LIMIT ?
            """, (*friend_ids, limit))
        else:
            return []
        return [
            {
                "id": row[0],
                "username": row[1],
                "first_name": row[2],
                "last_name": row[3],
                "value": row[4],
            }
            for row in c.fetchall()
        ]

def get_friend_activities(user_id, limit=20):
    """Get activities from friends for the activity feed."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get activities from friends
        c.execute("""
            SELECT fa.id, fa.user_id, fa.type, fa.description, fa.timestamp,
                   u.username, u.first_name, u.last_name
            FROM friend_activities fa
            JOIN users u ON fa.user_id = u.id
            JOIN friends f ON f.friend_id = fa.user_id
            WHERE f.user_id = ?
            ORDER BY fa.timestamp DESC
            LIMIT ?
        """, (user_id, limit))
        
        activities = []
        for row in c.fetchall():
            activities.append({
                "id": row[0],
                "user_id": row[1],
                "type": row[2],
                "description": row[3],
                "timestamp": row[4],
                "username": row[5],
                "first_name": row[6],
                "last_name": row[7]
            })
        
        return activities

def get_friend_badges(friend_id):
    return []

def get_friend_reminders(user_id):
    """Get reminders sent TO the user by their friends."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute(
            """
            SELECT fr.id, fr.user_id, u.username, u.first_name, fr.message, fr.remind_at
            FROM friend_reminders fr
            JOIN users u ON fr.user_id = u.id
            WHERE fr.friend_id = ?
            ORDER BY fr.remind_at DESC
            """,
            (user_id,)
        )
        return [
            {
                "id": row[0],
                "user_id": row[1],
                "username": row[2],
                "first_name": row[3],
                "message": row[4],
                "remind_at": row[5]
            }
            for row in c.fetchall()
        ]

def get_messages(user1_id, user2_id, limit=50):
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute(
            """
            SELECT sender_id, receiver_id, content, timestamp
            FROM messages
            WHERE (sender_id = ? AND receiver_id = ?)
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY timestamp DESC
            LIMIT ?
            """,
            (user1_id, user2_id, user2_id, user1_id, limit)
        )
        messages = [
            {
                "sender_id": row[0],
                "receiver_id": row[1],
                "content": row[2],
                "timestamp": row[3]
            }
            for row in c.fetchall()
        ]
        return list(reversed(messages))  # Show oldest first

def send_message(sender_id, receiver_id, content):
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute(
            "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
            (sender_id, receiver_id, content)
        )
        conn.commit()
        return c.lastrowid

def set_friend_reminder(user_id, friend_id, message, remind_at):
    import sqlite3, os
    DB_PATH = os.path.join(os.path.dirname(__file__), "nutrifit.db")
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute(
            "INSERT INTO friend_reminders (user_id, friend_id, message, remind_at) VALUES (?, ?, ?, ?)",
            (user_id, friend_id, message, remind_at)
        )
        conn.commit()
        return c.lastrowid

def get_reminders_you_set(user_id):
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute(
            """
            SELECT fr.id, fr.friend_id, u.username, u.first_name, fr.message, fr.remind_at
            FROM friend_reminders fr
            JOIN users u ON fr.friend_id = u.id
            WHERE fr.user_id = ?
            ORDER BY fr.remind_at DESC
            """,
            (user_id,)
        )
        return [
            {
                "id": row[0],
                "friend_id": row[1],
                "username": row[2],
                "first_name": row[3],
                "message": row[4],
                "remind_at": row[5]
            }
            for row in c.fetchall()
        ]

def delete_reminder(reminder_id, user_id):
    """Delete a reminder (only the user who set it can delete it)."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("DELETE FROM friend_reminders WHERE id = ? AND user_id = ?", (reminder_id, user_id))
        conn.commit()
        return c.rowcount > 0

def delete_reminder_received(reminder_id, user_id):
    """Delete a reminder received by the user (only the recipient can delete it)."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("DELETE FROM friend_reminders WHERE id = ? AND friend_id = ?", (reminder_id, user_id))
        conn.commit()
        return c.rowcount > 0

def get_user_streak(user_id):
    """Get user's current and best streak from the database."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get current streak (current_day from users table)
        c.execute("SELECT current_day FROM users WHERE id = ?", (user_id,))
        result = c.fetchone()
        current_streak = result[0] if result else 1
        
        # Calculate actual consecutive days streak
        c.execute("""
            SELECT COUNT(DISTINCT date_completed) as consecutive_days
            FROM (
                SELECT date_completed,
                       ROW_NUMBER() OVER (ORDER BY date_completed DESC) as rn,
                       DATE(date_completed, '-' || ROW_NUMBER() OVER (ORDER BY date_completed DESC) || ' days') as expected_date
                FROM workout_sessions 
                WHERE user_id = ?
                ORDER BY date_completed DESC
            ) t
            WHERE date_completed = expected_date
        """, (user_id,))
        
        actual_streak_result = c.fetchone()
        actual_streak = actual_streak_result[0] if actual_streak_result else 0
        
        # Use the higher of current_day or actual streak
        current_streak = max(current_streak, actual_streak)
        
        # For now, use current_day as best streak too
        # In a real app, you'd track best streak separately
        best_streak = current_streak
        
        return {
            "current": current_streak,
            "best": best_streak
        }

def get_user_badges(user_id):
    """Get user's earned badges from the database."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get badges from friend_badges table
        c.execute("""
            SELECT id, badge, description, earned_at
            FROM friend_badges
            WHERE user_id = ?
            ORDER BY earned_at DESC
        """, (user_id,))
        
        badges = []
        for row in c.fetchall():
            badges.append({
                "id": row[0],
                "badge": row[1],
                "description": row[2],
                "earned_at": row[3]
            })
        
        # Get existing badge names to avoid duplicates
        existing_badge_names = [b["badge"] for b in badges]
        
        # Check for new badges to award
        current_day = get_user_current_day(user_id)
        streak_info = get_user_streak(user_id)
        current_streak = streak_info["current"]
        
        # Streak-based badges
        streak_badges = [
            (3, "Streak Starter", "Maintained a 3-day streak! You're building momentum!"),
            (7, "Week Warrior", "Maintained a 7-day streak! Consistency is key!"),
            (14, "Fortnight Fighter", "Maintained a 14-day streak! You're unstoppable!"),
            (30, "Monthly Master", "Maintained a 30-day streak! Incredible dedication!"),
            (60, "Two-Month Titan", "Maintained a 60-day streak! You're a fitness legend!"),
            (100, "Century Champion", "Maintained a 100-day streak! You're absolutely incredible!")
        ]
        
        for required_streak, badge_name, description in streak_badges:
            if current_streak >= required_streak and badge_name not in existing_badge_names:
                new_badge = {
                    "id": f"auto_streak_{required_streak}",
                    "badge": badge_name,
                    "description": description,
                    "earned_at": datetime.now().isoformat()
                }
                badges.append(new_badge)
                # Add to database
                c.execute("""
                    INSERT INTO friend_badges (user_id, badge, description, earned_at)
                    VALUES (?, ?, ?, ?)
                """, (user_id, new_badge["badge"], new_badge["description"], new_badge["earned_at"]))
                # Add activity directly to avoid database locking
                c.execute("""
                    INSERT INTO friend_activities (user_id, type, description)
                    VALUES (?, ?, ?)
                """, (user_id, "badge", f"earned the '{new_badge['badge']}' badge"))
        
        # Time-based badges
        time_badges = [
            (7, "First Week", "Completed your first week of fitness tracking!"),
            (30, "First Month", "A full month of dedication! Keep it up!"),
            (90, "Quarter Champion", "Three months of consistent fitness! Amazing!"),
            (180, "Half-Year Hero", "Six months of dedication! You're incredible!"),
            (365, "Year Warrior", "A full year of fitness! You're absolutely legendary!")
        ]
        
        for required_days, badge_name, description in time_badges:
            if current_day >= required_days and badge_name not in existing_badge_names:
                new_badge = {
                    "id": f"auto_time_{required_days}",
                    "badge": badge_name,
                    "description": description,
                    "earned_at": datetime.now().isoformat()
                }
                badges.append(new_badge)
                # Add to database
                c.execute("""
                    INSERT INTO friend_badges (user_id, badge, description, earned_at)
                    VALUES (?, ?, ?, ?)
                """, (user_id, new_badge["badge"], new_badge["description"], new_badge["earned_at"]))
                # Add activity directly to avoid database locking
                c.execute("""
                    INSERT INTO friend_activities (user_id, type, description)
                    VALUES (?, ?, ?)
                """, (user_id, "badge", f"earned the '{new_badge['badge']}' badge"))
        
        # Challenge-based badges (these are now handled in update_challenge_progress)
        # But we can add some additional ones here
        c.execute("""
            SELECT COUNT(*) FROM challenges 
            WHERE user_id = ? AND completed = 1
        """, (user_id,))
        completed_challenges = c.fetchone()[0]
        
        # Workout-based badges (these are now handled in add_workout_session)
        # But we can add some additional ones here
        c.execute("""
            SELECT COUNT(*) FROM workout_sessions 
            WHERE user_id = ?
        """, (user_id,))
        total_workouts = c.fetchone()[0]
        
        # Calorie-based badges (these are now handled in add_workout_session)
        c.execute("""
            SELECT COALESCE(SUM(calories_burned), 0) FROM workout_sessions 
            WHERE user_id = ?
        """, (user_id,))
        total_calories = c.fetchone()[0] or 0
        
        # Special combination badges
        if (completed_challenges >= 5 and total_workouts >= 10 and 
            "Fitness Enthusiast" not in existing_badge_names):
            new_badge = {
                "id": "auto_combo_1",
                "badge": "Fitness Enthusiast",
                "description": "Completed 5+ challenges AND 10+ workouts! You're a true fitness enthusiast!",
                "earned_at": datetime.now().isoformat()
            }
            badges.append(new_badge)
            c.execute("""
                INSERT INTO friend_badges (user_id, badge, description, earned_at)
                VALUES (?, ?, ?, ?)
            """, (user_id, new_badge["badge"], new_badge["description"], new_badge["earned_at"]))
            c.execute("""
                INSERT INTO friend_activities (user_id, type, description)
                VALUES (?, ?, ?)
            """, (user_id, "badge", f"earned the '{new_badge['badge']}' badge"))
        
        if (current_streak >= 30 and total_calories >= 10000 and 
            "Fitness Legend" not in existing_badge_names):
            new_badge = {
                "id": "auto_combo_2",
                "badge": "Fitness Legend",
                "description": "30+ day streak AND 10,000+ calories burned! You're a fitness legend!",
                "earned_at": datetime.now().isoformat()
            }
            badges.append(new_badge)
            c.execute("""
                INSERT INTO friend_badges (user_id, badge, description, earned_at)
                VALUES (?, ?, ?, ?)
            """, (user_id, new_badge["badge"], new_badge["description"], new_badge["earned_at"]))
            c.execute("""
                INSERT INTO friend_activities (user_id, type, description)
                VALUES (?, ?, ?)
            """, (user_id, "badge", f"earned the '{new_badge['badge']}' badge"))
        
        conn.commit()
        return badges

def get_user_stats(user_id):
    """Get comprehensive user statistics for the overview page."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get challenges completed
        c.execute("""
            SELECT COUNT(*) FROM challenges 
            WHERE user_id = ? AND completed = 1
        """, (user_id,))
        challenges_completed = c.fetchone()[0]
        
        # Get total workouts
        c.execute("""
            SELECT COUNT(*) FROM workout_sessions 
            WHERE user_id = ?
        """, (user_id,))
        total_workouts = c.fetchone()[0]
        
        # Get total calories burned
        c.execute("""
            SELECT COALESCE(SUM(calories_burned), 0) FROM workout_sessions 
            WHERE user_id = ?
        """, (user_id,))
        calories_burned = c.fetchone()[0] or 0
        
        # Get friends count
        c.execute("""
            SELECT COUNT(*) FROM friends 
            WHERE user_id = ?
        """, (user_id,))
        friends_count = c.fetchone()[0]
        
        return {
            "challengesCompleted": challenges_completed,
            "totalWorkouts": total_workouts,
            "caloriesBurned": calories_burned,
            "friendsCount": friends_count
        }

def add_user_activity(user_id, activity_type, description):
    """Add a user activity to the friend_activities table."""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
            INSERT INTO friend_activities (user_id, type, description)
            VALUES (?, ?, ?)
        """, (user_id, activity_type, description))

def get_dashboard_data(user_id):
    """Get comprehensive dashboard data for a user"""
    profile = get_user_profile(user_id)
    if not profile:
        return None
    
    current_day = get_user_current_day(user_id)
    day_info = get_day_display_info(user_id, current_day)
    
    # Get nutrition data
    daily_totals = get_daily_totals(user_id, current_day)
    meal_progress = get_meal_progress(user_id)
    
    # Get fitness data
    recent_workouts = get_recent_workouts(user_id, 5)
    workout_stats = get_workout_stats(user_id, 7)  # Last 7 days
    
    # Calculate remaining calories
    calories_goal = profile.get('calorie_goal', 2000)
    calories_eaten = daily_totals.get('total_eaten', 0)
    calories_remaining = calories_goal - calories_eaten
    
    # Calculate progress percentages
    calorie_progress = min(100, (calories_eaten / calories_goal * 100)) if calories_goal > 0 else 0
    
    # Macro goals
    protein_goal = profile.get('protein_goal', 150)
    carbs_goal = profile.get('carbs_goal', 250)
    fat_goal = profile.get('fat_goal', 70)
    
    nutrients = daily_totals.get('nutrients', {})
    protein_eaten = nutrients.get('protein', 0)
    carbs_eaten = nutrients.get('carbohydrates', 0)
    fat_eaten = nutrients.get('fat', 0)
    
    macro_progress = {
        'protein': {
            'eaten': protein_eaten,
            'goal': protein_goal,
            'remaining': protein_goal - protein_eaten,
            'percentage': min(100, (protein_eaten / protein_goal * 100)) if protein_goal > 0 else 0
        },
        'carbohydrates': {
            'eaten': carbs_eaten,
            'goal': carbs_goal,
            'remaining': carbs_goal - carbs_eaten,
            'percentage': min(100, (carbs_eaten / carbs_goal * 100)) if carbs_goal > 0 else 0
        },
        'fat': {
            'eaten': fat_eaten,
            'goal': fat_goal,
            'remaining': fat_goal - fat_eaten,
            'percentage': min(100, (fat_eaten / fat_goal * 100)) if fat_goal > 0 else 0
        }
    }
    
    return {
        'user_profile': profile,
        'day_info': day_info,
        'calories': {
            'goal': calories_goal,
            'eaten': calories_eaten,
            'remaining': calories_remaining,
            'progress_percentage': calorie_progress
        },
        'macros': macro_progress,
        'meal_progress': meal_progress,
        'recent_workouts': recent_workouts,
        'workout_stats': workout_stats
    }

def populate_sample_data_for_user(user_id):
    """Populate sample data for new user"""
    # This function can be expanded to add sample vitals data
    pass

# VITALS DATABASE FUNCTIONS

def log_vitals_data(user_id, metric_type, value_data, date_logged=None):
    """Log vitals data for a user - now allows multiple entries per day"""
    if date_logged is None:
        date_logged = datetime.now().date()
    
    current_timestamp = datetime.now()
    
    print(f"🗄️ Logging vitals data: user_id={user_id}, metric_type={metric_type}, value_data={value_data}, date_logged={date_logged}, timestamp={current_timestamp}")
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Store the vitals data with current timestamp - now allows multiple entries per day
        c.execute("""
        INSERT INTO vitals_data (user_id, metric_type, date_logged, value_data, created_at)
        VALUES (?, ?, ?, ?, ?)
        """, (user_id, metric_type, date_logged, json.dumps(value_data), current_timestamp))
        
        # Update streak using the same connection
        update_vitals_streak(user_id, metric_type, date_logged, conn)
        
        conn.commit()
        log_id = c.lastrowid
        print(f"✅ Successfully stored vitals data with log_id: {log_id}")
        return log_id

def get_today_vitals_logs(user_id, metric_type):
    """Get all vitals logs for today for a specific metric"""
    today = datetime.now().date()
    
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        SELECT value_data, created_at
        FROM vitals_data
        WHERE user_id = ? AND metric_type = ? AND date_logged = ?
        ORDER BY created_at DESC
        """, (user_id, metric_type, today))
        
        logs = []
        for row in c.fetchall():
            value_data = json.loads(row[0])
            timestamp = row[1]
            logs.append({
                'value': value_data,
                'timestamp': timestamp
            })
        
        return logs

def get_vitals_data(user_id, metric_type, start_date=None, end_date=None):
    """Get vitals data for a user within a date range - now returns all entries per day"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        query = """
        SELECT date_logged, value_data, created_at
        FROM vitals_data
        WHERE user_id = ? AND metric_type = ?
        """
        params = [user_id, metric_type]
        
        if start_date:
            query += " AND date_logged >= ?"
            params.append(start_date)
        if end_date:
            query += " AND date_logged <= ?"
            params.append(end_date)
        
        query += " ORDER BY date_logged ASC, created_at ASC"
        
        c.execute(query, params)
        
        data = {}
        for row in c.fetchall():
            date_str = row[0]
            value_data = json.loads(row[1])
            timestamp = row[2]
            
            if date_str not in data:
                data[date_str] = []
            
            data[date_str].append({
                'value': value_data,
                'timestamp': timestamp
            })
        
        return data

def update_vitals_streak(user_id, metric_type, date_logged, conn=None):
    """Update streak for a vitals metric"""
    if conn is None:
        # If no connection provided, create one
        with sqlite3.connect(DB_PATH) as db_conn:
            return update_vitals_streak(user_id, metric_type, date_logged, db_conn)
    
    c = conn.cursor()
    
    # Get current streak info
    c.execute("""
    SELECT current_streak, longest_streak, last_logged_date
    FROM vitals_streaks
    WHERE user_id = ? AND metric_type = ?
    """, (user_id, metric_type))
    
    result = c.fetchone()
    
    if result:
        current_streak, longest_streak, last_logged_date = result
        
        if last_logged_date:
            last_date = datetime.strptime(last_logged_date, '%Y-%m-%d').date()
            days_diff = (date_logged - last_date).days
            
            if days_diff == 1:
                # Consecutive day
                new_streak = current_streak + 1
            elif days_diff == 0:
                # Same day, keep current streak
                new_streak = current_streak
            else:
                # Gap in logging, reset streak
                new_streak = 1
        else:
            # First time logging
            new_streak = 1
        
        new_longest_streak = max(longest_streak, new_streak)
        
        # Update streak
        c.execute("""
        UPDATE vitals_streaks
        SET current_streak = ?, longest_streak = ?, last_logged_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND metric_type = ?
        """, (new_streak, new_longest_streak, date_logged, user_id, metric_type))
    else:
        # Create new streak record
        c.execute("""
        INSERT INTO vitals_streaks (user_id, metric_type, current_streak, longest_streak, last_logged_date)
        VALUES (?, ?, 1, 1, ?)
        """, (user_id, metric_type, date_logged))

def get_vitals_streak(user_id, metric_type):
    """Get current streak for a vitals metric"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        SELECT current_streak, longest_streak, last_logged_date
        FROM vitals_streaks
        WHERE user_id = ? AND metric_type = ?
        """, (user_id, metric_type))
        
        result = c.fetchone()
        if result:
            return {
                'current_streak': result[0],
                'longest_streak': result[1],
                'last_logged_date': result[2]
            }
        return {
            'current_streak': 0,
            'longest_streak': 0,
            'last_logged_date': None
        }

def get_all_vitals_streaks(user_id):
    """Get all vitals streaks for a user"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        SELECT metric_type, current_streak, longest_streak, last_logged_date
        FROM vitals_streaks
        WHERE user_id = ?
        """, (user_id,))
        
        streaks = {}
        for row in c.fetchall():
            streaks[row[0]] = {
                'current_streak': row[1],
                'longest_streak': row[2],
                'last_logged_date': row[3]
            }
        
        return streaks

def create_custom_metric(user_id, metric_name, metric_type, unit=None, target_value=None, options=None):
    """Create a custom vitals metric"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        options_json = json.dumps(options) if options else None
        
        c.execute("""
        INSERT INTO custom_metrics (user_id, metric_name, metric_type, unit, target_value, options)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, metric_name, metric_type, unit, target_value, options_json))
        
        conn.commit()
        return c.lastrowid

def get_custom_metrics(user_id):
    """Get all custom metrics for a user"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        SELECT id, metric_name, metric_type, unit, target_value, options, is_active
        FROM custom_metrics
        WHERE user_id = ? AND is_active = TRUE
        ORDER BY created_at
        """, (user_id,))
        
        metrics = []
        for row in c.fetchall():
            metric = {
                'id': row[0],
                'name': row[1],
                'type': row[2],
                'unit': row[3],
                'target_value': row[4],
                'options': json.loads(row[5]) if row[5] else None,
                'is_active': row[6]
            }
            metrics.append(metric)
        
        return metrics

def update_custom_metric(user_id, metric_id, updates):
    """Update a custom metric"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        set_clauses = []
        values = []
        
        for field, value in updates.items():
            if field == 'options' and value is not None:
                set_clauses.append(f"{field} = ?")
                values.append(json.dumps(value))
            elif field in ['metric_name', 'metric_type', 'unit', 'target_value', 'is_active']:
                set_clauses.append(f"{field} = ?")
                values.append(value)
        
        if set_clauses:
            values.append(metric_id)
            values.append(user_id)
            
            c.execute(f"""
            UPDATE custom_metrics
            SET {', '.join(set_clauses)}
            WHERE id = ? AND user_id = ?
            """, values)
            
            conn.commit()
            return True
        
        return False

def delete_custom_metric(user_id, metric_id):
    """Delete a custom metric (soft delete by setting is_active to False)"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute("""
        UPDATE custom_metrics
        SET is_active = FALSE
        WHERE id = ? AND user_id = ?
        """, (metric_id, user_id))
        
        conn.commit()
        return c.rowcount > 0

def get_vitals_summary(user_id, metric_type, days_back=7):
    """Get vitals summary for dashboard"""
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        # Get recent data
        start_date = (datetime.now() - timedelta(days=days_back)).date()
        
        c.execute("""
        SELECT date_logged, value_data
        FROM vitals_data
        WHERE user_id = ? AND metric_type = ?
        AND date_logged >= ?
        ORDER BY date_logged DESC
        """, (user_id, metric_type, start_date))
        
        recent_data = []
        for row in c.fetchall():
            recent_data.append({
                'date': row[0],
                'data': json.loads(row[1])
            })
        
        # Get streak info
        streak_info = get_vitals_streak(user_id, metric_type)
        
        # Get today's aggregated data
        today = datetime.now().date()
        c.execute("""
        SELECT value_data
        FROM vitals_data
        WHERE user_id = ? AND metric_type = ? AND date_logged = ?
        ORDER BY created_at ASC
        """, (user_id, metric_type, today))
        
        today_entries = c.fetchall()
        today_value = None
        
        if today_entries:
            # Aggregate today's entries
            numerical_values = []
            for row in today_entries:
                value_data = json.loads(row[0])
                if metric_type == 'water':
                    numerical_values.append(value_data.get('amount', 0))
                elif metric_type == 'mood':
                    numerical_values.append(value_data.get('rating', 0))
                elif metric_type == 'sleep':
                    numerical_values.append(value_data.get('hours', 0))
                elif metric_type == 'weight':
                    numerical_values.append(value_data.get('pounds', 0))
                elif metric_type == 'steps':
                    numerical_values.append(value_data.get('count', 0))
                else:
                    # For custom metrics or unknown types
                    if isinstance(value_data, dict):
                        for key in ['value', 'amount', 'count', 'rating', 'hours', 'pounds']:
                            if key in value_data:
                                numerical_values.append(value_data[key])
                                break
                        else:
                            try:
                                numerical_values.append(float(value_data))
                            except (ValueError, TypeError):
                                numerical_values.append(0)
                    else:
                        try:
                            numerical_values.append(float(value_data))
                        except (ValueError, TypeError):
                            numerical_values.append(0)
            
            if numerical_values:
                if metric_type == 'mood':
                    # For mood, average the values
                    aggregated_value = sum(numerical_values) / len(numerical_values)
                else:
                    # For other metrics, sum the values
                    aggregated_value = sum(numerical_values)
                
                # Create aggregated value_data structure
                if metric_type == 'water':
                    today_value = {'amount': aggregated_value, 'unit': 'oz'}
                elif metric_type == 'mood':
                    today_value = {'rating': aggregated_value, 'note': 'Aggregated'}
                elif metric_type == 'sleep':
                    today_value = {'hours': aggregated_value, 'minutes': 0}
                elif metric_type == 'weight':
                    today_value = {'pounds': aggregated_value}
                elif metric_type == 'steps':
                    today_value = {'count': aggregated_value}
                else:
                    today_value = {'value': aggregated_value}
        
        return {
            'recent_data': recent_data,
            'streak': streak_info,
            'today_value': today_value,
            'days_back': days_back
        }

def get_vitals_chart_data(user_id, metric_type, range_key):
    """Get formatted data for chart display - now handles multiple entries per day"""
    # Calculate date range based on range_key
    today = datetime.now().date()
    
    if range_key == '1w':
        start_date = today - timedelta(days=7)
    elif range_key == '1m':
        start_date = today - timedelta(days=30)
    elif range_key == '3m':
        start_date = today - timedelta(days=90)
    elif range_key == '6m':
        start_date = today - timedelta(days=180)
    elif range_key == '1y':
        start_date = today - timedelta(days=365)
    else:
        start_date = today - timedelta(days=7)
    
    # Get data for the range
    data = get_vitals_data(user_id, metric_type, start_date, today)
    
    # Format for chart display - aggregate multiple entries per day
    chart_data = []
    current_date = start_date
    
    while current_date <= today:
        date_str = current_date.strftime('%Y-%m-%d')
        if date_str in data:
            # Handle multiple entries for the same day
            day_entries = data[date_str]
            if isinstance(day_entries, list):
                # Multiple entries - extract numerical values and aggregate them
                numerical_values = []
                for entry in day_entries:
                    value_data = entry['value']
                    if metric_type == 'water':
                        numerical_values.append(value_data.get('amount', 0))
                    elif metric_type == 'mood':
                        numerical_values.append(value_data.get('rating', 0))
                    elif metric_type == 'sleep':
                        numerical_values.append(value_data.get('hours', 0))
                    elif metric_type == 'weight':
                        numerical_values.append(value_data.get('pounds', 0))
                    elif metric_type == 'steps':
                        numerical_values.append(value_data.get('count', 0))
                    else:
                        # For custom metrics or unknown types, try to get a numerical value
                        if isinstance(value_data, dict):
                            # Try common keys
                            for key in ['value', 'amount', 'count', 'rating', 'hours', 'pounds']:
                                if key in value_data:
                                    numerical_values.append(value_data[key])
                                    break
                            else:
                                # If no common key found, try to convert the whole value
                                try:
                                    numerical_values.append(float(value_data))
                                except (ValueError, TypeError):
                                    numerical_values.append(0)
                        else:
                            try:
                                numerical_values.append(float(value_data))
                            except (ValueError, TypeError):
                                numerical_values.append(0)
                
                if numerical_values:
                    if metric_type == 'mood':
                        # For mood, average the values
                        aggregated_value = sum(numerical_values) / len(numerical_values)
                    else:
                        # For other metrics, sum the values
                        aggregated_value = sum(numerical_values)
                else:
                    aggregated_value = 0
            else:
                # Single entry (backward compatibility)
                value_data = day_entries['value']
                if metric_type == 'water':
                    aggregated_value = value_data.get('amount', 0)
                elif metric_type == 'mood':
                    aggregated_value = value_data.get('rating', 0)
                elif metric_type == 'sleep':
                    aggregated_value = value_data.get('hours', 0)
                elif metric_type == 'weight':
                    aggregated_value = value_data.get('pounds', 0)
                elif metric_type == 'steps':
                    aggregated_value = value_data.get('count', 0)
                else:
                    # For custom metrics or unknown types
                    if isinstance(value_data, dict):
                        for key in ['value', 'amount', 'count', 'rating', 'hours', 'pounds']:
                            if key in value_data:
                                aggregated_value = value_data[key]
                                break
                        else:
                            try:
                                aggregated_value = float(value_data)
                            except (ValueError, TypeError):
                                aggregated_value = 0
                    else:
                        try:
                            aggregated_value = float(value_data)
                        except (ValueError, TypeError):
                            aggregated_value = 0
            
            chart_data.append({
                'date': date_str,
                'value': aggregated_value,
                'has_data': True
            })
        else:
            chart_data.append({
                'date': date_str,
                'value': None,
                'has_data': False
            })
        current_date += timedelta(days=1)
    
    return chart_data
