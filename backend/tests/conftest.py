import pytest
import tempfile
import os
import sys
from unittest.mock import patch

# Add the parent directory to the Python path so we can import our modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
import database
from database import DB_PATH

@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    # Create a temporary database file for testing
    db_fd, test_db_path = tempfile.mkstemp(suffix='.db')
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    
    # Mock the database path to use our test database
    with patch.object(database, 'DB_PATH', test_db_path):
        database.init_db()
        database.init_fitness_tables()
        
        with app.test_client() as client:
            with app.app_context():
                yield client
    
    # Clean up
    os.close(db_fd)
    os.unlink(test_db_path)

@pytest.fixture
def test_db():
    """Create a test database"""
    db_fd, test_db_path = tempfile.mkstemp(suffix='.db')
    
    with patch.object(database, 'DB_PATH', test_db_path):
        database.init_db()
        database.init_fitness_tables()
        yield test_db_path
    
    os.close(db_fd)
    os.unlink(test_db_path)

@pytest.fixture
def sample_user_profile():
    """Sample user profile for testing"""
    return {
        'id': 'test_user_123',
        'username': 'testuser',
        'first_name': 'Test',
        'last_name': 'User',
        'fitness_experience': 'intermediate',
        'training_styles': ['weightlifting', 'cardio'],
        'has_gym_membership': True,
        'available_equipment': 'gym_membership_full_access',
        'home_equipment': ['dumbbells', 'resistance_bands'],
        'workout_duration': 45,
        'workout_frequency': 4,
        'weight_lb': 180,
        'height_cm': 175,
        'gender': 'male',
        'activity_level': 'moderately_active',
        'calorie_goal': 2200,
        'protein_goal': 150,
        'carbs_goal': 250,
        'fat_goal': 80,
        'fitness_goals': ['muscle_building', 'strength'],
        'dietary_restrictions': ['vegetarian']
    }