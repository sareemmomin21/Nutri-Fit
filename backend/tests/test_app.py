import pytest
import json
from unittest.mock import patch, Mock

class TestAuthenticationEndpoints:
    """Test user authentication endpoints"""
    
    def test_signup_success(self, client):
        """Test successful user signup"""
        signup_data = {
            'username': 'newuser',
            'password': 'password123',
            'email': 'newuser@example.com'
        }
        
        response = client.post('/api/signup', 
                             data=json.dumps(signup_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'user_id' in data
    
    def test_signup_invalid_data(self, client):
        """Test signup with invalid data"""
        # Test short username
        response = client.post('/api/signup',
                             data=json.dumps({'username': 'ab', 'password': 'password123'}),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        
        # Test short password
        response = client.post('/api/signup',
                             data=json.dumps({'username': 'validuser', 'password': '12345'}),
                             content_type='application/json')
        
        assert response.status_code == 400
    
    def test_login_success(self, client):
        """Test successful login"""
        # First create a user
        signup_data = {'username': 'testuser', 'password': 'password123'}
        client.post('/api/signup', 
                   data=json.dumps(signup_data),
                   content_type='application/json')
        
        # Then login
        login_data = {'username': 'testuser', 'password': 'password123'}
        response = client.post('/api/login',
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'user_id' in data
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        login_data = {'username': 'nonexistent', 'password': 'wrongpassword'}
        response = client.post('/api/login',
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data

class TestNutritionEndpoints:
    """Test nutrition tracking endpoints"""
    
    def test_add_food_to_meal(self, client):
        """Test adding food to meal endpoint"""
        # Create user first
        signup_data = {'username': 'testuser', 'password': 'password123'}
        signup_response = client.post('/api/signup',
                                    data=json.dumps(signup_data),
                                    content_type='application/json')
        user_id = json.loads(signup_response.data)['user_id']
        
        # Add food to meal
        food_data = {
            'user_id': user_id,
            'meal_type': 'breakfast',
            'food_data': {
                'name': 'Oatmeal',
                'calories': 150,
                'protein': 5,
                'carbohydrates': 27,
                'fat': 3,
                'quantity': 1,
                'serving_size': 'cup'
            }
        }
        
        response = client.post('/api/add_food_to_meal',
                             data=json.dumps(food_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
    
    def test_get_daily_summary(self, client):
        """Test getting daily summary"""
        # Create user
        signup_data = {'username': 'testuser', 'password': 'password123'}
        signup_response = client.post('/api/signup',
                                    data=json.dumps(signup_data),
                                    content_type='application/json')
        user_id = json.loads(signup_response.data)['user_id']
        
        # Get daily summary
        response = client.post('/get_daily_summary',
                             data=json.dumps({'user_id': user_id}),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'total_eaten' in data
        assert 'nutrients' in data

class TestFitnessEndpoints:
    """Test fitness tracking endpoints"""
    
    def test_complete_workout(self, client):
        """Test completing a workout"""
        # Create user
        signup_data = {'username': 'testuser', 'password': 'password123'}
        signup_response = client.post('/api/signup',
                                    data=json.dumps(signup_data),
                                    content_type='application/json')
        user_id = json.loads(signup_response.data)['user_id']
        
        # Complete workout
        workout_data = {
            'user_id': user_id,
            'workout_data': {
                'name': 'Morning Cardio',
                'type': 'cardio',
                'duration': 30,
                'calories_burned': 250,
                'date_completed': '2024-01-15',
                'difficulty_level': 'moderate'
            }
        }
        
        response = client.post('/api/complete_workout',
                             data=json.dumps(workout_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'session_id' in data
    
    def test_get_workout_recommendations(self, client):
        """Test getting workout recommendations"""
        # Create user with profile
        signup_data = {'username': 'testuser', 'password': 'password123'}
        signup_response = client.post('/api/signup',
                                    data=json.dumps(signup_data),
                                    content_type='application/json')
        user_id = json.loads(signup_response.data)['user_id']
        
        # Complete profile
        profile_data = {
            'user_id': user_id,
            'first_name': 'Test',
            'last_name': 'User',
            'date_of_birth': '1990-01-01',
            'gender': 'male',
            'height_cm': 175,
            'weight_lb': 180,
            'activity_level': 'moderately_active',
            'fitness_experience': 'intermediate',
            'workout_frequency': 4,
            'workout_duration': 45
        }
        
        client.post('/api/complete_profile',
                   data=json.dumps(profile_data),
                   content_type='application/json')
        
        # Get recommendations
        response = client.post('/api/get_workout_recommendations',
                             data=json.dumps({'user_id': user_id}),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) > 0

class TestAPIEndpoints:
    """Test general API endpoints"""
    
    def test_hello_endpoint(self, client):
        """Test the hello endpoint"""
        response = client.get('/api/hello')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['message'] == 'Hello from Flask!'