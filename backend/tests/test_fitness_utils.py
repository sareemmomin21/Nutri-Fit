import pytest
from unittest.mock import patch, Mock

import fitness_utils
from fitness_utils import (
    get_workout_recommendations, calculate_match_score, get_workout_plan,
    calculate_calories_burned, get_quick_workout_suggestions,
    calculate_quick_workout_score, create_custom_workout, get_exercise_tips
)

class TestWorkoutRecommendations:
    """Test workout recommendation system"""
    
    def test_get_workout_recommendations_basic(self, sample_user_profile):
        """Test basic workout recommendations"""
        recommendations = get_workout_recommendations(sample_user_profile)
        
        assert len(recommendations) > 0
        assert all('workout' in rec for rec in recommendations)
        assert all('type' in rec for rec in recommendations)
        assert all('match_score' in rec for rec in recommendations)
    
    def test_get_workout_recommendations_no_profile(self):
        """Test workout recommendations with no user profile"""
        recommendations = get_workout_recommendations(None)
        
        # Should return basic universal workouts
        assert len(recommendations) >= 5
        assert any(rec['workout']['name'] == '15-Minute Total Body' for rec in recommendations)
    
    def test_calculate_match_score(self, sample_user_profile):
        """Test workout match score calculation"""
        workout = {
            'duration': 45,  # Matches user preference
            'equipment': ['dumbbells'],
            'intensity': 'moderate-high',
            'calories_burned': 300,
            'type': 'strength'
        }
        
        available_equipment = ['dumbbells', 'bodyweight']
        score = calculate_match_score(workout, sample_user_profile, available_equipment)
        
        assert isinstance(score, int)
        assert 0 <= score <= 100
        assert score > 50  # Should be a good match

class TestWorkoutPlans:
    """Test workout plan generation"""
    
    def test_get_workout_plan(self, sample_user_profile):
        """Test generating a workout plan"""
        plan = get_workout_plan(sample_user_profile, days_per_week=4)
        
        assert len(plan) == 4
        assert all('day' in day_plan for day_plan in plan)
        assert all('workout' in day_plan for day_plan in plan)
        
        # Check that we have variety in workout types
        workout_types = [day['workout']['type'] for day in plan]
        assert len(set(workout_types)) > 1  # Should have different types
    
    def test_calculate_calories_burned(self):
        """Test calorie calculation"""
        calories = calculate_calories_burned(30, 150, 'moderate')
        assert isinstance(calories, int)
        assert calories > 0
        
        # Heavier person should burn more calories
        calories_heavy = calculate_calories_burned(30, 200, 'moderate')
        assert calories_heavy > calories
        
        # Higher intensity should burn more calories
        calories_high = calculate_calories_burned(30, 150, 'high')
        assert calories_high > calories

class TestQuickWorkouts:
    """Test quick workout suggestions"""
    
    def test_get_quick_workout_suggestions(self, sample_user_profile):
        """Test getting quick workout suggestions"""
        suggestions = get_quick_workout_suggestions(
            sample_user_profile, 
            duration=20, 
            focus='upper_body', 
            equipment=['dumbbells'],
            excluded_workouts=[]
        )
        
        assert len(suggestions) > 0
        assert all('workout' in suggestion for suggestion in suggestions)
        assert all('score' in suggestion for suggestion in suggestions)
        
        # Check that workouts match the focus
        for suggestion in suggestions:
            workout = suggestion['workout']
            # Duration should be close to requested
            assert abs(workout['duration'] - 20) <= 10
    
    def test_get_quick_workout_suggestions_no_equipment(self, sample_user_profile):
        """Test quick workouts with no equipment"""
        suggestions = get_quick_workout_suggestions(
            sample_user_profile,
            duration=15,
            focus='full_body',
            equipment=[],
            excluded_workouts=[]
        )
        
        assert len(suggestions) > 0
        
        # All suggestions should work with no equipment
        for suggestion in suggestions:
            equipment = suggestion['workout'].get('equipment', ['none'])
            assert 'none' in equipment
    
    def test_calculate_quick_workout_score(self, sample_user_profile):
        """Test quick workout scoring"""
        workout = {
            'name': 'Test Workout',
            'duration': 20,
            'intensity': 'moderate',
            'calories_burned': 180,
            'exercises': [{'name': 'Exercise 1'}, {'name': 'Exercise 2'}]
        }
        
        score = calculate_quick_workout_score(workout, sample_user_profile, 20)
        
        assert isinstance(score, int)
        assert 0 <= score <= 100

class TestUtilityFunctions:
    """Test utility functions"""
    
    def test_create_custom_workout(self, sample_user_profile):
        """Test creating a custom workout"""
        exercises = [
            {
                'name': 'Push-ups',
                'sets': 3,
                'reps': 12,
                'rest': '60s',
                'equipment': ['none'],
                'muscle_groups': ['chest']
            },
            {
                'name': 'Squats',
                'sets': 3,
                'reps': 15,
                'rest': '60s',
                'equipment': ['none'],
                'muscle_groups': ['legs']
            }
        ]
        
        custom_workout = create_custom_workout(exercises, sample_user_profile)
        
        assert custom_workout is not None
        assert custom_workout['name'] == 'Custom Workout'
        assert custom_workout['exercises'] == exercises
        assert custom_workout['duration'] > 0
        assert custom_workout['calories_burned'] > 0
    
    def test_get_exercise_tips(self):
        """Test getting exercise tips"""
        tips = get_exercise_tips('squats')
        
        assert 'form_tips' in tips
        assert 'safety' in tips
        assert len(tips['form_tips']) > 0
        assert len(tips['safety']) > 0
        
        # Test unknown exercise
        unknown_tips = get_exercise_tips('unknown_exercise')
        assert 'form_tips' in unknown_tips
        assert 'safety' in unknown_tips
