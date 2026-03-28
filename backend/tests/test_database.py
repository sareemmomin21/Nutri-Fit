import pytest
import json
from unittest.mock import patch
from datetime import datetime, timedelta

import database
from database import (
    create_user, authenticate_user, get_user_profile, update_user_profile,
    ensure_user_exists, add_food_to_current_meal, get_current_meal_items,
    get_daily_totals, reset_day, get_user_current_day, add_workout_session,
    get_workout_history, save_workout_preference, get_user_workout_preferences
)

class TestUserManagement:
    """Test user creation, authentication, and profile management"""
    
    def test_create_user_success(self, test_db):
        """Test successful user creation"""
        with patch.object(database, 'DB_PATH', test_db):
            user_id, error = create_user("testuser", "password123", "test@example.com")
            
            assert user_id is not None
            assert error is None
            assert "testuser" in user_id
    
    def test_create_user_duplicate_username(self, test_db):
        """Test creating user with duplicate username fails"""
        with patch.object(database, 'DB_PATH', test_db):
            # Create first user
            user_id1, error1 = create_user("testuser", "password123")
            assert user_id1 is not None
            
            # Try to create user with same username
            user_id2, error2 = create_user("testuser", "different_password")
            assert user_id2 is None
            assert error2 == "Username already exists"
    
    def test_authenticate_user_success(self, test_db):
        """Test successful user authentication"""
        with patch.object(database, 'DB_PATH', test_db):
            # Create user
            user_id, _ = create_user("testuser", "password123")
            
            # Authenticate
            auth_user_id, profile_completed = authenticate_user("testuser", "password123")
            assert auth_user_id == user_id
            assert profile_completed == False  # New user hasn't completed profile
    
    def test_authenticate_user_invalid_credentials(self, test_db):
        """Test authentication with invalid credentials"""
        with patch.object(database, 'DB_PATH', test_db):
            create_user("testuser", "password123")
            
            # Try wrong password
            user_id, profile_completed = authenticate_user("testuser", "wrongpassword")
            assert user_id is None
            assert profile_completed == False
            
            # Try wrong username
            user_id, profile_completed = authenticate_user("wronguser", "password123")
            assert user_id is None
    
    def test_get_user_profile(self, test_db):
        """Test retrieving user profile"""
        with patch.object(database, 'DB_PATH', test_db):
            user_id, _ = create_user("testuser", "password123")
            
            profile = get_user_profile(user_id)
            assert profile is not None
            assert profile['username'] == 'testuser'
            assert profile['calorie_goal'] == 2000  # Default value
    
    def test_update_user_profile(self, test_db):
        """Test updating user profile"""
        with patch.object(database, 'DB_PATH', test_db):
            user_id, _ = create_user("testuser", "password123")
            
            profile_data = {
                'first_name': 'John',
                'last_name': 'Doe',
                'weight_lb': 180,
                'height_cm': 175,
                'activity_level': 'moderately_active',
                'dietary_restrictions': ['vegetarian']
            }
            
            update_user_profile(user_id, profile_data)
            
            updated_profile = get_user_profile(user_id)
            assert updated_profile['first_name'] == 'John'
            assert updated_profile['weight_lb'] == 180
            assert updated_profile['dietary_restrictions'] == ['vegetarian']

class TestNutritionTracking:
    """Test nutrition tracking functionality"""
    
    def test_add_food_to_current_meal(self, test_db):
        """Test adding food to current meal"""
        with patch.object(database, 'DB_PATH', test_db):
            user_id, _ = create_user("testuser", "password123")
            
            food_data = {
                'name': 'Chicken Breast',
                'quantity': 1,
                'serving_size': '100g',
                'calories': 165,
                'protein': 31,
                'carbohydrates': 0,
                'fat': 3.6,
                'source': 'usda'
            }
            
            add_food_to_current_meal(user_id, 'lunch', food_data)
            
            items = get_current_meal_items(user_id, 'lunch')
            assert len(items) == 1
            assert items[0]['name'] == 'Chicken Breast'
            assert items[0]['calories'] == 165
    
    def test_get_daily_totals(self, test_db):
        """Test getting daily nutrition totals"""
        with patch.object(database, 'DB_PATH', test_db):
            user_id, _ = create_user("testuser", "password123")
            
            # Add some foods
            food_data = {
                'name': 'Banana',
                'calories': 105,
                'protein': 1.3,
                'carbohydrates': 27,
                'fat': 0.3
            }
            add_food_to_current_meal(user_id, 'breakfast', food_data)
            
            totals = get_daily_totals(user_id)
            assert totals['total_eaten'] == 105
            assert totals['nutrients']['protein'] == 1.3
            assert totals['nutrients']['carbohydrates'] == 27
    
    def test_reset_day(self, test_db):
        """Test resetting to next day"""
        with patch.object(database, 'DB_PATH', test_db):
            user_id, _ = create_user("testuser", "password123")
            
            # Add food to current day
            food_data = {'name': 'Apple', 'calories': 80, 'protein': 0, 'carbohydrates': 21, 'fat': 0}
            add_food_to_current_meal(user_id, 'snacks', food_data)
            
            initial_day = get_user_current_day(user_id)
            
            # Reset day
            new_day = reset_day(user_id)
            
            assert new_day == initial_day + 1
            
            # Current meal should be empty
            items = get_current_meal_items(user_id)
            assert len(items) == 0

class TestFitnessTracking:
    """Test fitness tracking functionality"""
    
    def test_save_and_get_workout_preferences(self, test_db):
        """Test saving and retrieving workout preferences"""
        with patch.object(database, 'DB_PATH', test_db):
            user_id, _ = create_user("testuser", "password123")
            
            # Save some preferences
            save_workout_preference(user_id, "Push-up Challenge", "liked")
            save_workout_preference(user_id, "Burpee Hell", "disliked")
            save_workout_preference(user_id, "Yoga Flow", "liked")
            
            preferences = get_user_workout_preferences(user_id)
            
            assert "Push-up Challenge" in preferences['liked']
            assert "Yoga Flow" in preferences['liked']
            assert "Burpee Hell" in preferences['disliked']
            assert len(preferences['liked']) == 2
            assert len(preferences['disliked']) == 1

class TestUtilityFunctions:
    """Test utility functions"""
    
    def test_ensure_user_exists(self, test_db):
        """Test ensure_user_exists function"""
        with patch.object(database, 'DB_PATH', test_db):
            user_id, _ = create_user("testuser", "password123")
            
            # Should return True for existing user
            assert ensure_user_exists(user_id) == True
            
            # Should return False for non-existing user
            assert ensure_user_exists("fake_user_id") == False