import random
from datetime import datetime, timedelta
import json


# Comprehensive workout database
WORKOUT_DATABASE = {
    'strength': {
        'beginner': {
            'upper_body': [
                {
                    'name': 'Push-Up Progression',
                    'exercises': [
                        {'name': 'Wall Push-ups', 'sets': 3, 'reps': '8-12', 'rest': '60s', 'difficulty': 1},
                        {'name': 'Incline Push-ups', 'sets': 3, 'reps': '6-10', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Knee Push-ups', 'sets': 2, 'reps': '5-8', 'rest': '90s', 'difficulty': 3}
                    ],
                    'duration': 25,
                    'calories_burned': 120,
                    'equipment': ['none'],
                    'muscle_groups': ['chest', 'shoulders', 'triceps']
                },
                {
                    'name': 'Beginner Upper Body',
                    'exercises': [
                        {'name': 'Dumbbell Bicep Curls', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 1},
                        {'name': 'Overhead Press', 'sets': 3, 'reps': '8-10', 'rest': '90s', 'difficulty': 2},
                        {'name': 'Bent-over Rows', 'sets': 3, 'reps': '8-10', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Chest Press', 'sets': 3, 'reps': '8-12', 'rest': '90s', 'difficulty': 2}
                    ],
                    'duration': 35,
                    'calories_burned': 180,
                    'equipment': ['dumbbells', 'bench'],
                    'muscle_groups': ['chest', 'back', 'shoulders', 'arms']
                }
            ],
            'lower_body': [
                {
                    'name': 'Bodyweight Lower Body',
                    'exercises': [
                        {'name': 'Bodyweight Squats', 'sets': 3, 'reps': '10-15', 'rest': '60s', 'difficulty': 1},
                        {'name': 'Lunges', 'sets': 3, 'reps': '8-10 each leg', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Glute Bridges', 'sets': 3, 'reps': '12-15', 'rest': '45s', 'difficulty': 1},
                        {'name': 'Calf Raises', 'sets': 3, 'reps': '15-20', 'rest': '45s', 'difficulty': 1}
                    ],
                    'duration': 30,
                    'calories_burned': 150,
                    'equipment': ['none'],
                    'muscle_groups': ['quads', 'glutes', 'hamstrings', 'calves']
                },
                {
                    'name': 'Beginner Leg Day',
                    'exercises': [
                        {'name': 'Goblet Squats', 'sets': 3, 'reps': '10-12', 'rest': '90s', 'difficulty': 2},
                        {'name': 'Romanian Deadlifts', 'sets': 3, 'reps': '8-10', 'rest': '90s', 'difficulty': 2},
                        {'name': 'Leg Press', 'sets': 3, 'reps': '12-15', 'rest': '60s', 'difficulty': 1},
                        {'name': 'Leg Curls', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 2}
                    ],
                    'duration': 40,
                    'calories_burned': 200,
                    'equipment': ['dumbbells', 'leg_press', 'leg_curl_machine'],
                    'muscle_groups': ['quads', 'hamstrings', 'glutes']
                }
            ],
            'full_body': [
                {
                    'name': 'Total Body Beginner',
                    'exercises': [
                        {'name': 'Bodyweight Squats', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 1},
                        {'name': 'Push-ups (modified)', 'sets': 3, 'reps': '5-8', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Bent-over Rows', 'sets': 3, 'reps': '8-10', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Plank', 'sets': 3, 'reps': '20-30s', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Glute Bridges', 'sets': 3, 'reps': '12-15', 'rest': '45s', 'difficulty': 1}
                    ],
                    'duration': 45,
                    'calories_burned': 220,
                    'equipment': ['dumbbells'],
                    'muscle_groups': ['full_body']
                }
            ]
        },
        'intermediate': {
            'upper_body': [
                {
                    'name': 'Push Day',
                    'exercises': [
                        {'name': 'Bench Press', 'sets': 4, 'reps': '8-10', 'rest': '120s', 'difficulty': 3},
                        {'name': 'Shoulder Press', 'sets': 4, 'reps': '8-10', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Incline Dumbbell Press', 'sets': 3, 'reps': '10-12', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Lateral Raises', 'sets': 3, 'reps': '12-15', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Tricep Dips', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 3},
                        {'name': 'Diamond Push-ups', 'sets': 3, 'reps': '8-10', 'rest': '60s', 'difficulty': 3}
                    ],
                    'duration': 55,
                    'calories_burned': 280,
                    'equipment': ['barbell', 'dumbbells', 'bench'],
                    'muscle_groups': ['chest', 'shoulders', 'triceps']
                },
                {
                    'name': 'Pull Day',
                    'exercises': [
                        {'name': 'Pull-ups/Lat Pulldowns', 'sets': 4, 'reps': '6-8', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Barbell Rows', 'sets': 4, 'reps': '8-10', 'rest': '90s', 'difficulty': 3},
                        {'name': 'T-Bar Rows', 'sets': 3, 'reps': '10-12', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Face Pulls', 'sets': 3, 'reps': '12-15', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Barbell Curls', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Hammer Curls', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 2}
                    ],
                    'duration': 60,
                    'calories_burned': 300,
                    'equipment': ['barbell', 'dumbbells', 'cable_machine'],
                    'muscle_groups': ['back', 'biceps', 'rear_delts']
                }
            ],
            'lower_body': [
                {
                    'name': 'Leg Day Power',
                    'exercises': [
                        {'name': 'Back Squats', 'sets': 4, 'reps': '8-10', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Romanian Deadlifts', 'sets': 4, 'reps': '8-10', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Bulgarian Split Squats', 'sets': 3, 'reps': '10-12 each', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Leg Press', 'sets': 3, 'reps': '12-15', 'rest': '90s', 'difficulty': 2},
                        {'name': 'Walking Lunges', 'sets': 3, 'reps': '12-15 each', 'rest': '60s', 'difficulty': 3},
                        {'name': 'Calf Raises', 'sets': 4, 'reps': '15-20', 'rest': '45s', 'difficulty': 2}
                    ],
                    'duration': 65,
                    'calories_burned': 350,
                    'equipment': ['barbell', 'dumbbells', 'leg_press'],
                    'muscle_groups': ['quads', 'hamstrings', 'glutes', 'calves']
                }
            ],
            'full_body': [
                {
                    'name': 'Total Body Strength',
                    'exercises': [
                        {'name': 'Deadlifts', 'sets': 4, 'reps': '6-8', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Squats', 'sets': 4, 'reps': '8-10', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Push-ups', 'sets': 3, 'reps': '12-15', 'rest': '60s', 'difficulty': 3},
                        {'name': 'Pull-ups/Rows', 'sets': 3, 'reps': '8-10', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Overhead Press', 'sets': 3, 'reps': '8-10', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Plank', 'sets': 3, 'reps': '45-60s', 'rest': '60s', 'difficulty': 3}
                    ],
                    'duration': 70,
                    'calories_burned': 380,
                    'equipment': ['barbell', 'dumbbells'],
                    'muscle_groups': ['full_body']
                }
            ]
        },
        'advanced': {
            'upper_body': [
                {
                    'name': 'Advanced Push',
                    'exercises': [
                        {'name': 'Bench Press', 'sets': 5, 'reps': '5-6', 'rest': '180s', 'difficulty': 5},
                        {'name': 'Incline Barbell Press', 'sets': 4, 'reps': '6-8', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Weighted Dips', 'sets': 4, 'reps': '8-10', 'rest': '90s', 'difficulty': 4},
                        {'name': 'Overhead Press', 'sets': 4, 'reps': '6-8', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Close-Grip Bench Press', 'sets': 3, 'reps': '8-10', 'rest': '90s', 'difficulty': 4},
                        {'name': 'Lateral Raises', 'sets': 4, 'reps': '12-15', 'rest': '60s', 'difficulty': 3}
                    ],
                    'duration': 75,
                    'calories_burned': 420,
                    'equipment': ['barbell', 'dumbbells', 'dip_station'],
                    'muscle_groups': ['chest', 'shoulders', 'triceps']
                },
                {
                    'name': 'Advanced Pull',
                    'exercises': [
                        {'name': 'Weighted Pull-ups', 'sets': 5, 'reps': '5-6', 'rest': '180s', 'difficulty': 5},
                        {'name': 'Barbell Rows', 'sets': 4, 'reps': '6-8', 'rest': '120s', 'difficulty': 4},
                        {'name': 'T-Bar Rows', 'sets': 4, 'reps': '8-10', 'rest': '90s', 'difficulty': 4},
                        {'name': 'Deadlifts', 'sets': 4, 'reps': '5-6', 'rest': '180s', 'difficulty': 5},
                        {'name': 'Preacher Curls', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 3},
                        {'name': 'Cable Curls', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 3}
                    ],
                    'duration': 80,
                    'calories_burned': 450,
                    'equipment': ['barbell', 'dumbbells', 'cable_machine', 'pull_up_bar'],
                    'muscle_groups': ['back', 'biceps', 'rear_delts']
                }
            ],
            'lower_body': [
                {
                    'name': 'Advanced Legs',
                    'exercises': [
                        {'name': 'Back Squats', 'sets': 5, 'reps': '5-6', 'rest': '180s', 'difficulty': 5},
                        {'name': 'Romanian Deadlifts', 'sets': 4, 'reps': '6-8', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Front Squats', 'sets': 4, 'reps': '8-10', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Bulgarian Split Squats', 'sets': 3, 'reps': '10-12 each', 'rest': '90s', 'difficulty': 4},
                        {'name': 'Hip Thrusts', 'sets': 4, 'reps': '10-12', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Standing Calf Raises', 'sets': 4, 'reps': '15-20', 'rest': '60s', 'difficulty': 3}
                    ],
                    'duration': 85,
                    'calories_burned': 480,
                    'equipment': ['barbell', 'dumbbells', 'squat_rack'],
                    'muscle_groups': ['quads', 'hamstrings', 'glutes', 'calves']
                }
            ],
            'full_body': [
                {
                    'name': 'Advanced Full Body',
                    'exercises': [
                        {'name': 'Deadlifts', 'sets': 5, 'reps': '5-6', 'rest': '180s', 'difficulty': 5},
                        {'name': 'Squats', 'sets': 4, 'reps': '6-8', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Pull-ups', 'sets': 4, 'reps': '8-10', 'rest': '90s', 'difficulty': 4},
                        {'name': 'Overhead Press', 'sets': 4, 'reps': '6-8', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Barbell Rows', 'sets': 4, 'reps': '8-10', 'rest': '90s', 'difficulty': 4},
                        {'name': 'Dips', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 3}
                    ],
                    'duration': 90,
                    'calories_burned': 500,
                    'equipment': ['barbell', 'dumbbells', 'pull_up_bar', 'dip_station'],
                    'muscle_groups': ['full_body']
                }
            ]
        }
    },
    'cardio': {
        'beginner': [
            {
                'name': 'Walking Program',
                'description': 'Low-impact cardio for beginners',
                'duration': 30,
                'calories_burned': 150,
                'intensity': 'low',
                'equipment': ['none'],
                'instructions': 'Walk at a comfortable pace for 30 minutes. Focus on maintaining good posture and breathing rhythm.'
            },
            {
                'name': 'Stationary Bike',
                'description': 'Low-impact cycling workout',
                'duration': 25,
                'calories_burned': 180,
                'intensity': 'low-moderate',
                'equipment': ['exercise_bike'],
                'instructions': 'Cycle at moderate pace with light resistance. Keep heart rate in comfortable zone.'
            },
            {
                'name': 'Swimming',
                'description': 'Full-body low-impact cardio',
                'duration': 30,
                'calories_burned': 220,
                'intensity': 'moderate',
                'equipment': ['pool'],
                'instructions': 'Swim laps at comfortable pace. Mix different strokes. Rest between laps as needed.'
            }
        ],
        'intermediate': [
            {
                'name': 'Interval Running',
                'description': 'Run/walk intervals for building endurance',
                'duration': 35,
                'calories_burned': 300,
                'intensity': 'moderate-high',
                'equipment': ['none'],
                'instructions': 'Alternate 2 minutes running with 1 minute walking. Repeat for 35 minutes.'
            },
            {
                'name': 'HIIT Circuit',
                'description': 'High-intensity interval training',
                'duration': 25,
                'calories_burned': 280,
                'intensity': 'high',
                'equipment': ['none'],
                'instructions': 'Perform 30s high intensity exercise, 30s rest. Include burpees, mountain climbers, jumping jacks.'
            },
            {
                'name': 'Elliptical Training',
                'description': 'Full-body cardio machine workout',
                'duration': 40,
                'calories_burned': 320,
                'intensity': 'moderate',
                'equipment': ['elliptical'],
                'instructions': 'Maintain steady pace with moderate resistance. Use arm handles for full-body engagement.'
            }
        ],
        'advanced': [
            {
                'name': 'Sprint Intervals',
                'description': 'High-intensity sprint training',
                'duration': 30,
                'calories_burned': 400,
                'intensity': 'very_high',
                'equipment': ['none'],
                'instructions': 'Sprint 30s at maximum effort, rest 90s. Repeat 8-10 times with proper warm-up and cool-down.'
            },
            {
                'name': 'Advanced HIIT',
                'description': 'Complex high-intensity circuit',
                'duration': 35,
                'calories_burned': 450,
                'intensity': 'very_high',
                'equipment': ['dumbbells', 'kettlebell'],
                'instructions': 'Complex movements: burpees, thrusters, box jumps. 45s work, 15s rest for 35 minutes.'
            },
            {
                'name': 'Rowing Machine',
                'description': 'Full-body rowing workout',
                'duration': 45,
                'calories_burned': 480,
                'intensity': 'high',
                'equipment': ['rowing_machine'],
                'instructions': 'Maintain stroke rate of 24-28 spm. Focus on proper form and power through legs.'
            }
        ]
    },
    'flexibility': {
        'beginner': [
            {
                'name': 'Basic Stretching',
                'description': 'Essential stretches for flexibility',
                'duration': 20,
                'calories_burned': 60,
                'intensity': 'low',
                'equipment': ['mat'],
                'instructions': 'Hold each stretch for 30-60 seconds. Focus on major muscle groups.'
            },
            {
                'name': 'Morning Yoga',
                'description': 'Gentle yoga flow for beginners',
                'duration': 25,
                'calories_burned': 80,
                'intensity': 'low',
                'equipment': ['mat'],
                'instructions': 'Basic poses: child\'s pose, cat-cow, downward dog, warrior I. Hold poses for 5-8 breaths.'
            }
        ],
        'intermediate': [
            {
                'name': 'Vinyasa Flow',
                'description': 'Dynamic yoga sequence',
                'duration': 45,
                'calories_burned': 180,
                'intensity': 'moderate',
                'equipment': ['mat'],
                'instructions': 'Flow through sun salutations and standing poses. Maintain breath awareness.'
            },
            {
                'name': 'Pilates Core',
                'description': 'Core-focused Pilates routine',
                'duration': 35,
                'calories_burned': 140,
                'intensity': 'moderate',
                'equipment': ['mat'],
                'instructions': 'Focus on controlled movements and core engagement. Include hundred, roll-ups, leg circles.'
            }
        ],
        'advanced': [
            {
                'name': 'Power Yoga',
                'description': 'Intense yoga practice',
                'duration': 60,
                'calories_burned': 300,
                'intensity': 'high',
                'equipment': ['mat'],
                'instructions': 'Advanced poses and transitions. Maintain heat through continuous movement.'
            },
            {
                'name': 'Advanced Pilates',
                'description': 'Complex Pilates movements',
                'duration': 50,
                'calories_burned': 220,
                'intensity': 'moderate-high',
                'equipment': ['mat', 'resistance_bands'],
                'instructions': 'Advanced exercises: teaser, roll-over, corkscrew. Focus on precision and control.'
            }
        ]
    }
}

# Exercise equipment database
EQUIPMENT_DATABASE = {
    'none': 'No equipment needed',
    'dumbbells': 'Dumbbells (various weights)',
    'barbell': 'Barbell with plates',
    'bench': 'Exercise bench',
    'mat': 'Exercise mat',
    'resistance_bands': 'Resistance bands',
    'pull_up_bar': 'Pull-up bar',
    'kettlebell': 'Kettlebell',
    'exercise_bike': 'Stationary bike',
    'elliptical': 'Elliptical machine',
    'rowing_machine': 'Rowing machine',
    'treadmill': 'Treadmill',
    'cable_machine': 'Cable machine',
    'leg_press': 'Leg press machine',
    'leg_curl_machine': 'Leg curl machine',
    'dip_station': 'Dip station',
    'squat_rack': 'Squat rack',
    'pool': 'Swimming pool'
}

# Muscle group definitions
MUSCLE_GROUPS = {
    'chest': 'Chest muscles (pectorals)',
    'back': 'Back muscles (latissimus dorsi, rhomboids, middle traps)',
    'shoulders': 'Shoulder muscles (deltoids)',
    'arms': 'Arm muscles (biceps, triceps)',
    'biceps': 'Bicep muscles',
    'triceps': 'Tricep muscles',
    'quads': 'Quadriceps (front thigh)',
    'hamstrings': 'Hamstring muscles (back thigh)',
    'glutes': 'Glute muscles (buttocks)',
    'calves': 'Calf muscles',
    'core': 'Core muscles (abs, obliques)',
    'full_body': 'Full body workout',
    'rear_delts': 'Rear deltoids'
}

def get_workout_recommendations(user_profile, preferences=None):
    """
    Get personalized workout recommendations based on user profile
    """
    if not user_profile:
        return []
    
    experience = user_profile.get('fitness_experience', 'beginner')
    training_styles = user_profile.get('training_styles', [])
    has_gym = user_profile.get('has_gym_membership', False)
    available_equipment = user_profile.get('available_equipment', '').lower()
    workout_duration = user_profile.get('workout_duration', 30)
    
    recommendations = []
    
    # Determine available equipment
    user_equipment = ['none']  # Everyone has bodyweight
    if has_gym or 'dumbbell' in available_equipment:
        user_equipment.extend(['dumbbells', 'bench', 'barbell'])
    if has_gym:
        user_equipment.extend(['cable_machine', 'leg_press', 'pull_up_bar'])
    
    # Get strength workouts based on training styles
    if 'weightlifting' in training_styles or 'strength_training' in training_styles:
        strength_workouts = WORKOUT_DATABASE['strength'].get(experience, {})
        
        for category, workouts in strength_workouts.items():
            for workout in workouts:
                # Check if user has required equipment
                if any(eq in user_equipment for eq in workout['equipment']):
                    # Filter by duration preference
                    if abs(workout['duration'] - workout_duration) <= 15:
                        recommendations.append({
                            'type': 'strength',
                            'category': category,
                            'workout': workout,
                            'match_score': calculate_match_score(workout, user_profile)
                        })
    
    # Get cardio workouts
    if 'cardio' in training_styles or 'running' in training_styles or 'hiit' in training_styles:
        cardio_workouts = WORKOUT_DATABASE['cardio'].get(experience, [])
        
        for workout in cardio_workouts:
            if any(eq in user_equipment for eq in workout['equipment']):
                if abs(workout['duration'] - workout_duration) <= 10:
                    recommendations.append({
                        'type': 'cardio',
                        'workout': workout,
                        'match_score': calculate_match_score(workout, user_profile)
                    })
    
    # Get flexibility workouts
    if 'yoga' in training_styles or 'pilates' in training_styles:
        flexibility_workouts = WORKOUT_DATABASE['flexibility'].get(experience, [])
        
        for workout in flexibility_workouts:
            if any(eq in user_equipment for eq in workout['equipment']):
                recommendations.append({
                    'type': 'flexibility',
                    'workout': workout,
                    'match_score': calculate_match_score(workout, user_profile)
                })
    
    # Sort by match score and return top recommendations
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)
    return recommendations[:6]  # Return top 6 recommendations

def calculate_match_score(workout, user_profile):
    """Calculate how well a workout matches user preferences"""
    score = 0
    
    # Duration preference
    target_duration = user_profile.get('workout_duration', 30)
    duration_diff = abs(workout['duration'] - target_duration)
    score += max(0, 50 - duration_diff)  # Max 50 points for perfect duration match
    
    # Equipment availability
    has_gym = user_profile.get('has_gym_membership', False)
    if has_gym:
        score += 20
    elif 'none' in workout['equipment']:
        score += 30  # Bonus for bodyweight exercises if no gym
    
    # Training style alignment
    training_styles = user_profile.get('training_styles', [])
    if 'weightlifting' in training_styles and 'barbell' in workout.get('equipment', []):
        score += 25
    if 'bodyweight' in training_styles and 'none' in workout.get('equipment', []):
        score += 25
    
    # Fitness goals alignment
    fitness_goals = user_profile.get('fitness_goals', [])
    if 'weight_loss' in fitness_goals and workout.get('calories_burned', 0) > 250:
        score += 20
    if 'muscle_building' in fitness_goals and workout.get('type') == 'strength':
        score += 20
    
    return score

def get_workout_plan(user_profile, days_per_week=None):
    """Generate a weekly workout plan"""
    if not days_per_week:
        days_per_week = user_profile.get('workout_frequency', 3)
    
    recommendations = get_workout_recommendations(user_profile)
    
    if not recommendations:
        return []
    
    # Create balanced weekly plan
    plan = []
    used_categories = set()
    
    for i in range(days_per_week):
        day_name = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]
        
        # Try to balance workout types
        available_workouts = [w for w in recommendations if w.get('category') not in used_categories]
        if not available_workouts:
            available_workouts = recommendations
            used_categories.clear()
        
        selected_workout = available_workouts[0]
        used_categories.add(selected_workout.get('category', 'general'))
        
        plan.append({
            'day': day_name,
            'workout': selected_workout,
            'rest_day': False
        })
    
    return plan

def calculate_calories_burned(workout_duration, user_weight_lb, intensity_level):
    """Calculate estimated calories burned based on workout"""
    # Base calories per minute by intensity
    base_calories = {
        'low': 3.5,
        'low-moderate': 4.5,
        'moderate': 6.0,
        'moderate-high': 7.5,
        'high': 9.0,
        'very_high': 11.0
    }
    
    # Weight factor (heavier people burn more calories)
    weight_factor = user_weight_lb / 150  # Normalized to 150lb person
    
    # Calculate calories
    base_rate = base_calories.get(intensity_level, 6.0)
    calories_burned = base_rate * workout_duration * weight_factor
    
    return round(calories_burned)

def get_recovery_recommendations(workout_history, current_date):
    """Provide recovery recommendations based on workout history"""
    if not workout_history:
        return {"rest_needed": False, "message": "No recent workouts found"}
    
    # Count high-intensity workouts in last 3 days
    recent_workouts = [w for w in workout_history if 
                      (current_date - w['date']).days <= 3]
    
    high_intensity_count = len([w for w in recent_workouts 
                               if w.get('intensity') in ['high', 'very_high']])
    
    if high_intensity_count >= 3:
        return {
            "rest_needed": True,
            "message": "Consider taking a rest day or doing light cardio/stretching",
            "recommendation": "Your body needs time to recover after intense workouts"
        }
    
    consecutive_days = 0
    for i, workout in enumerate(sorted(workout_history, key=lambda x: x['date'], reverse=True)):
        if i == 0:
            consecutive_days = 1
        else:
            prev_date = sorted(workout_history, key=lambda x: x['date'], reverse=True)[i-1]['date']
            if (prev_date - workout['date']).days == 1:
                consecutive_days += 1
            else:
                break
    
    if consecutive_days >= 5:
        return {
            "rest_needed": True,
            "message": "Take a rest day to prevent overtraining",
            "recommendation": "You've been consistent! Rest is crucial for progress"
        }
    
    return {
        "rest_needed": False,
        "message": "You're good to continue with your workout routine",
        "recommendation": "Keep up the great work!"
    }

def generate_workout_stats(workout_history, days_back=30):
    """Generate workout statistics for the past period"""
    if not workout_history:
        return {
            "total_workouts": 0,
            "total_duration": 0,
            "total_calories": 0,
            "avg_duration": 0,
            "avg_calories": 0,
            "most_common_type": "None",
            "consistency_score": 0
        }
    
    current_date = datetime.now()
    recent_workouts = [w for w in workout_history if 
                      (current_date - w['date']).days <= days_back]
    
    if not recent_workouts:
        return {
            "total_workouts": 0,
            "total_duration": 0,
            "total_calories": 0,
            "avg_duration": 0,
            "avg_calories": 0,
            "most_common_type": "None",
            "consistency_score": 0
        }
    
    total_workouts = len(recent_workouts)
    total_duration = sum(w['duration'] for w in recent_workouts)
    total_calories = sum(w['calories_burned'] for w in recent_workouts)
    
    # Calculate averages
    avg_duration = total_duration / total_workouts if total_workouts > 0 else 0
    avg_calories = total_calories / total_workouts if total_workouts > 0 else 0
    
    # Find most common workout type
    workout_types = [w['type'] for w in recent_workouts]
    most_common_type = max(set(workout_types), key=workout_types.count) if workout_types else "None"
    
    # Calculate consistency score (percentage of days with workouts)
    days_with_workouts = len(set(w['date'].date() for w in recent_workouts))
    consistency_score = (days_with_workouts / days_back) * 100 if days_back > 0 else 0
    
    return {
        "total_workouts": total_workouts,
        "total_duration": total_duration,
        "total_calories": total_calories,
        "avg_duration": round(avg_duration),
        "avg_calories": round(avg_calories),
        "most_common_type": most_common_type.title(),
        "consistency_score": round(consistency_score, 1)
    }

def get_progressive_overload_suggestions(exercise_history, exercise_name):
    """Suggest progressive overload for specific exercises"""
    if not exercise_history:
        return "Track your performance to get progressive overload suggestions"
    
    # Get recent performance for this exercise
    recent_performances = [p for p in exercise_history 
                         if p['exercise_name'].lower() == exercise_name.lower()]
    
    if len(recent_performances) < 2:
        return "Complete this exercise a few more times to get progression suggestions"
    
    # Sort by date
    recent_performances.sort(key=lambda x: x['date'])
    latest = recent_performances[-1]
    previous = recent_performances[-2]
    
    suggestions = []
    
    # Weight progression
    if latest.get('weight') and previous.get('weight'):
        if latest['weight'] == previous['weight']:
            suggestions.append(f"Try increasing weight by 2.5-5 lbs next time")
    
    # Rep progression
    if latest.get('reps') and previous.get('reps'):
        if latest['reps'] >= previous['reps'] and latest['reps'] >= 12:
            suggestions.append(f"Great job! Consider increasing weight and dropping reps to 8-10")
        elif latest['reps'] < 8:
            suggestions.append(f"Try to increase reps to 8-10 before adding weight")
    
    # Set progression
    if latest.get('sets') and previous.get('sets'):
        if latest['sets'] == previous['sets'] and latest['sets'] < 4:
            suggestions.append(f"Consider adding one more set")
    
    return suggestions if suggestions else ["Keep up the great work! Maintain current intensity."]

def create_custom_workout(exercises, user_profile):
    """Create a custom workout from selected exercises"""
    if not exercises:
        return None
    
    total_duration = 0
    total_calories = 0
    equipment_needed = set()
    muscle_groups = set()
    
    for exercise in exercises:
        # Estimate duration based on sets and reps
        sets = exercise.get('sets', 3)
        rest_time = int(exercise.get('rest', '60s').replace('s', ''))
        total_duration += (sets * 45) + ((sets - 1) * rest_time)  # 45s per set estimate
        
        # Add equipment
        if 'equipment' in exercise:
            equipment_needed.update(exercise['equipment'])
        
        # Add muscle groups
        if 'muscle_groups' in exercise:
            muscle_groups.update(exercise['muscle_groups'])
    
    # Convert seconds to minutes
    total_duration = total_duration // 60
    
    # Estimate calories based on user weight and duration
    user_weight = user_profile.get('weight_lb', 150)
    intensity = 'moderate'  # Default for strength training
    total_calories = calculate_calories_burned(total_duration, user_weight, intensity)
    
    return {
        'name': 'Custom Workout',
        'exercises': exercises,
        'duration': total_duration,
        'calories_burned': total_calories,
        'equipment': list(equipment_needed),
        'muscle_groups': list(muscle_groups),
        'type': 'custom'
    }

def get_exercise_tips(exercise_name):
    """Get form tips and safety advice for specific exercises"""
    tips_database = {
        'squats': {
            'form_tips': [
                "Keep your chest up and back straight",
                "Don't let knees cave inward",
                "Go down until thighs are parallel to floor",
                "Push through your heels to stand up"
            ],
            'safety': [
                "Start with bodyweight before adding weight",
                "Don't round your back",
                "Keep weight on heels, not toes"
            ]
        },
        'deadlifts': {
            'form_tips': [
                "Keep the bar close to your body",
                "Maintain neutral spine throughout",
                "Drive through heels and squeeze glutes at top",
                "Lower the bar with control"
            ],
            'safety': [
                "Always warm up thoroughly",
                "Use proper grip and stance",
                "Don't look up during the lift"
            ]
        },
        'bench press': {
            'form_tips': [
                "Keep shoulder blades pulled back",
                "Lower bar to chest, not neck",
                "Keep feet firmly planted",
                "Use full range of motion"
            ],
            'safety': [
                "Always use a spotter for heavy weights",
                "Don't arch your back excessively",
                "Keep wrists straight"
            ]
        },
        'push-ups': {
            'form_tips': [
                "Keep body in straight line",
                "Lower chest to floor",
                "Push through palms",
                "Keep core engaged"
            ],
            'safety': [
                "Start with modified version if needed",
                "Don't let hips sag",
                "Land softly on push-up position"
            ]
        },
        'pull-ups': {
            'form_tips': [
                "Use full range of motion",
                "Pull shoulder blades down and back",
                "Keep core tight",
                "Control the descent"
            ],
            'safety': [
                "Use assistance if needed",
                "Don't swing or use momentum",
                "Warm up shoulders thoroughly"
            ]
        }
    }
    
    exercise_key = exercise_name.lower().replace('-', ' ')
    return tips_database.get(exercise_key, {
        'form_tips': ["Focus on proper form over speed", "Use full range of motion", "Breathe consistently"],
        'safety': ["Start with lighter weights", "Stop if you feel pain", "Warm up before exercising"]
    })

def get_workout_difficulty_progression(current_level, workout_type):
    """Get suggestions for progressing workout difficulty"""
    progressions = {
        'beginner': {
            'strength': "Focus on learning proper form. Add weight only when you can complete all reps with perfect form.",
            'cardio': "Increase duration by 5 minutes each week. Build your aerobic base gradually.",
            'flexibility': "Hold stretches longer and try new poses. Consistency is key for flexibility gains."
        },
        'intermediate': {
            'strength': "Try advanced variations, increase weight by 2.5-5%, or add more sets.",
            'cardio': "Add interval training, increase intensity, or try new cardio modalities.",
            'flexibility': "Work on deeper stretches and more challenging poses. Add balance challenges."
        },
        'advanced': {
            'strength': "Focus on compound movements, periodization, and specific strength goals.",
            'cardio': "Incorporate sport-specific training, advanced intervals, or endurance challenges.",
            'flexibility': "Master advanced poses, help others, or explore new flexibility disciplines."
        }
    }
    
    return progressions.get(current_level, {}).get(workout_type, "Keep challenging yourself while maintaining good form!")