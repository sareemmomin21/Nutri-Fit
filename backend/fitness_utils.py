import random
from datetime import datetime, timedelta
import json

# Comprehensive workout database with extensive options for all equipment types
WORKOUT_DATABASE = {
    'strength': {
        'beginner': {
            # BODYWEIGHT ONLY WORKOUTS
            'bodyweight': [
                {
                    'name': 'Beginner Bodyweight Upper',
                    'exercises': [
                        {'name': 'Wall Push-ups', 'sets': 3, 'reps': '8-12', 'rest': '60s', 'difficulty': 1},
                        {'name': 'Incline Push-ups (stairs/couch)', 'sets': 3, 'reps': '6-10', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Arm Circles', 'sets': 3, 'reps': '10 each direction', 'rest': '30s', 'difficulty': 1},
                        {'name': 'Pike Push-ups', 'sets': 2, 'reps': '5-8', 'rest': '90s', 'difficulty': 3}
                    ],
                    'duration': 25,
                    'calories_burned': 120,
                    'equipment': ['none'],
                    'muscle_groups': ['chest', 'shoulders', 'triceps'],
                    'intensity': 'low-moderate'
                },
                {
                    'name': 'Beginner Bodyweight Lower',
                    'exercises': [
                        {'name': 'Bodyweight Squats', 'sets': 3, 'reps': '10-15', 'rest': '60s', 'difficulty': 1},
                        {'name': 'Lunges', 'sets': 3, 'reps': '8-10 each leg', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Glute Bridges', 'sets': 3, 'reps': '12-15', 'rest': '45s', 'difficulty': 1},
                        {'name': 'Calf Raises', 'sets': 3, 'reps': '15-20', 'rest': '45s', 'difficulty': 1},
                        {'name': 'Wall Sit', 'sets': 3, 'reps': '20-30s', 'rest': '60s', 'difficulty': 2}
                    ],
                    'duration': 30,
                    'calories_burned': 150,
                    'equipment': ['none'],
                    'muscle_groups': ['quads', 'glutes', 'hamstrings', 'calves'],
                    'intensity': 'moderate'
                },
                {
                    'name': 'Full Body Bodyweight Flow',
                    'exercises': [
                        {'name': 'Jumping Jacks', 'sets': 3, 'reps': '20', 'rest': '30s', 'difficulty': 1},
                        {'name': 'Modified Burpees', 'sets': 3, 'reps': '5-8', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Mountain Climbers', 'sets': 3, 'reps': '20 total', 'rest': '45s', 'difficulty': 2},
                        {'name': 'Plank', 'sets': 3, 'reps': '20-30s', 'rest': '60s', 'difficulty': 2}
                    ],
                    'duration': 20,
                    'calories_burned': 160,
                    'equipment': ['none'],
                    'muscle_groups': ['full_body'],
                    'intensity': 'moderate'
                }
            ],
            
            # DUMBBELL WORKOUTS
            'dumbbells': [
                {
                    'name': 'Dumbbell Upper Body Basics',
                    'exercises': [
                        {'name': 'Dumbbell Chest Press (floor)', 'sets': 3, 'reps': '8-12', 'rest': '90s', 'difficulty': 2},
                        {'name': 'Dumbbell Rows (bent over)', 'sets': 3, 'reps': '8-10', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Shoulder Press', 'sets': 3, 'reps': '8-10', 'rest': '90s', 'difficulty': 2},
                        {'name': 'Bicep Curls', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 1},
                        {'name': 'Tricep Extensions', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 2}
                    ],
                    'duration': 35,
                    'calories_burned': 180,
                    'equipment': ['dumbbells'],
                    'muscle_groups': ['chest', 'back', 'shoulders', 'arms'],
                    'intensity': 'moderate'
                },
                {
                    'name': 'Dumbbell Lower Body',
                    'exercises': [
                        {'name': 'Goblet Squats', 'sets': 3, 'reps': '10-12', 'rest': '90s', 'difficulty': 2},
                        {'name': 'Dumbbell Lunges', 'sets': 3, 'reps': '8-10 each', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Romanian Deadlifts', 'sets': 3, 'reps': '8-10', 'rest': '90s', 'difficulty': 2},
                        {'name': 'Dumbbell Step-ups', 'sets': 3, 'reps': '10 each leg', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Dumbbell Calf Raises', 'sets': 3, 'reps': '15-20', 'rest': '45s', 'difficulty': 1}
                    ],
                    'duration': 40,
                    'calories_burned': 200,
                    'equipment': ['dumbbells'],
                    'muscle_groups': ['quads', 'hamstrings', 'glutes'],
                    'intensity': 'moderate'
                }
            ],
            
            # RESISTANCE BAND WORKOUTS
            'resistance_bands': [
                {
                    'name': 'Band Total Body',
                    'exercises': [
                        {'name': 'Band Chest Press', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Band Rows', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Band Squats', 'sets': 3, 'reps': '12-15', 'rest': '60s', 'difficulty': 1},
                        {'name': 'Band Bicep Curls', 'sets': 3, 'reps': '12-15', 'rest': '45s', 'difficulty': 1},
                        {'name': 'Band Lateral Raises', 'sets': 3, 'reps': '12-15', 'rest': '45s', 'difficulty': 1}
                    ],
                    'duration': 30,
                    'calories_burned': 140,
                    'equipment': ['resistance_bands'],
                    'muscle_groups': ['full_body'],
                    'intensity': 'low-moderate'
                }
            ],
            
            # KETTLEBELL WORKOUTS
            'kettlebell': [
                {
                    'name': 'Beginner Kettlebell Flow',
                    'exercises': [
                        {'name': 'Kettlebell Deadlifts', 'sets': 3, 'reps': '8-10', 'rest': '90s', 'difficulty': 2},
                        {'name': 'Kettlebell Goblet Squats', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Kettlebell Halos', 'sets': 3, 'reps': '5 each direction', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Kettlebell Carries', 'sets': 3, 'reps': '20 steps', 'rest': '60s', 'difficulty': 1}
                    ],
                    'duration': 25,
                    'calories_burned': 170,
                    'equipment': ['kettlebell'],
                    'muscle_groups': ['full_body'],
                    'intensity': 'moderate'
                }
            ],
            
            # YOGA MAT WORKOUTS
            'yoga_mat': [
                {
                    'name': 'Mat Core & Flexibility',
                    'exercises': [
                        {'name': 'Modified Plank', 'sets': 3, 'reps': '20-30s', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Dead Bug', 'sets': 3, 'reps': '10 each side', 'rest': '45s', 'difficulty': 2},
                        {'name': 'Cat-Cow Stretch', 'sets': 3, 'reps': '10', 'rest': '30s', 'difficulty': 1},
                        {'name': 'Hip Flexor Stretch', 'sets': 2, 'reps': '30s each', 'rest': '30s', 'difficulty': 1},
                        {'name': 'Child\'s Pose', 'sets': 2, 'reps': '30s', 'rest': '30s', 'difficulty': 1}
                    ],
                    'duration': 25,
                    'calories_burned': 100,
                    'equipment': ['yoga_mat'],
                    'muscle_groups': ['core', 'flexibility'],
                    'intensity': 'low'
                }
            ]
        },
        
        'intermediate': {
            # BODYWEIGHT INTERMEDIATE
            'bodyweight': [
                {
                    'name': 'Intermediate Bodyweight Circuit',
                    'exercises': [
                        {'name': 'Standard Push-ups', 'sets': 4, 'reps': '10-15', 'rest': '60s', 'difficulty': 3},
                        {'name': 'Pike Push-ups', 'sets': 3, 'reps': '8-12', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Single Leg Squats (assisted)', 'sets': 3, 'reps': '5-8 each', 'rest': '90s', 'difficulty': 4},
                        {'name': 'Burpees', 'sets': 3, 'reps': '8-12', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Plank to Downward Dog', 'sets': 3, 'reps': '10', 'rest': '60s', 'difficulty': 3}
                    ],
                    'duration': 35,
                    'calories_burned': 220,
                    'equipment': ['none'],
                    'muscle_groups': ['full_body'],
                    'intensity': 'moderate-high'
                },
                {
                    'name': 'Bodyweight HIIT',
                    'exercises': [
                        {'name': 'Jump Squats', 'sets': 4, 'reps': '15', 'rest': '30s', 'difficulty': 3},
                        {'name': 'Push-up to T', 'sets': 3, 'reps': '10', 'rest': '45s', 'difficulty': 3},
                        {'name': 'High Knees', 'sets': 4, 'reps': '30s', 'rest': '30s', 'difficulty': 2},
                        {'name': 'Reverse Lunges', 'sets': 3, 'reps': '12 each', 'rest': '60s', 'difficulty': 2}
                    ],
                    'duration': 25,
                    'calories_burned': 280,
                    'equipment': ['none'],
                    'muscle_groups': ['full_body'],
                    'intensity': 'high'
                }
            ],
            
            # DUMBBELL INTERMEDIATE
            'dumbbells': [
                {
                    'name': 'Dumbbell Push/Pull Split',
                    'exercises': [
                        {'name': 'Dumbbell Bench Press', 'sets': 4, 'reps': '8-10', 'rest': '120s', 'difficulty': 3},
                        {'name': 'Dumbbell Rows', 'sets': 4, 'reps': '8-10', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Dumbbell Shoulder Press', 'sets': 3, 'reps': '10-12', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Dumbbell Flyes', 'sets': 3, 'reps': '10-12', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Dumbbell Reverse Flyes', 'sets': 3, 'reps': '12-15', 'rest': '60s', 'difficulty': 2}
                    ],
                    'duration': 50,
                    'calories_burned': 280,
                    'equipment': ['dumbbells'],
                    'muscle_groups': ['chest', 'back', 'shoulders'],
                    'intensity': 'moderate-high'
                },
                {
                    'name': 'Dumbbell Complex Training',
                    'exercises': [
                        {'name': 'Dumbbell Thrusters', 'sets': 4, 'reps': '8-10', 'rest': '90s', 'difficulty': 4},
                        {'name': 'Dumbbell Renegade Rows', 'sets': 3, 'reps': '8 each', 'rest': '90s', 'difficulty': 4},
                        {'name': 'Dumbbell Bulgarian Split Squats', 'sets': 3, 'reps': '10 each', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Dumbbell Man Makers', 'sets': 3, 'reps': '6-8', 'rest': '120s', 'difficulty': 4}
                    ],
                    'duration': 45,
                    'calories_burned': 320,
                    'equipment': ['dumbbells'],
                    'muscle_groups': ['full_body'],
                    'intensity': 'high'
                }
            ],
            
            # RESISTANCE BANDS INTERMEDIATE
            'resistance_bands': [
                {
                    'name': 'Band Strength Circuit',
                    'exercises': [
                        {'name': 'Band Squats with Overhead Press', 'sets': 4, 'reps': '12', 'rest': '60s', 'difficulty': 3},
                        {'name': 'Band Pull-Aparts', 'sets': 3, 'reps': '15-20', 'rest': '45s', 'difficulty': 2},
                        {'name': 'Band Lateral Walks', 'sets': 3, 'reps': '10 each direction', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Band Tricep Extensions', 'sets': 3, 'reps': '12-15', 'rest': '60s', 'difficulty': 2},
                        {'name': 'Band Face Pulls', 'sets': 3, 'reps': '15', 'rest': '45s', 'difficulty': 2}
                    ],
                    'duration': 35,
                    'calories_burned': 200,
                    'equipment': ['resistance_bands'],
                    'muscle_groups': ['full_body'],
                    'intensity': 'moderate'
                }
            ],
            
            # GYM EQUIPMENT (INTERMEDIATE)
            'gym_full': [
                {
                    'name': 'Machine Circuit Training',
                    'exercises': [
                        {'name': 'Lat Pulldown', 'sets': 4, 'reps': '8-10', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Leg Press', 'sets': 4, 'reps': '12-15', 'rest': '90s', 'difficulty': 2},
                        {'name': 'Chest Press Machine', 'sets': 3, 'reps': '10-12', 'rest': '90s', 'difficulty': 2},
                        {'name': 'Seated Cable Rows', 'sets': 3, 'reps': '10-12', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Leg Curl Machine', 'sets': 3, 'reps': '12-15', 'rest': '60s', 'difficulty': 2}
                    ],
                    'duration': 55,
                    'calories_burned': 280,
                    'equipment': ['cable_machine', 'leg_press', 'leg_curl_machine'],
                    'muscle_groups': ['full_body'],
                    'intensity': 'moderate-high'
                },
                {
                    'name': 'Barbell Compound Movements',
                    'exercises': [
                        {'name': 'Barbell Squats', 'sets': 4, 'reps': '8-10', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Barbell Deadlifts', 'sets': 4, 'reps': '6-8', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Barbell Bench Press', 'sets': 4, 'reps': '8-10', 'rest': '120s', 'difficulty': 3},
                        {'name': 'Barbell Rows', 'sets': 3, 'reps': '8-10', 'rest': '90s', 'difficulty': 3},
                        {'name': 'Overhead Press', 'sets': 3, 'reps': '8-10', 'rest': '90s', 'difficulty': 3}
                    ],
                    'duration': 65,
                    'calories_burned': 350,
                    'equipment': ['barbell', 'bench', 'squat_rack'],
                    'muscle_groups': ['full_body'],
                    'intensity': 'high'
                }
            ]
        },
        
        'advanced': {
            # BODYWEIGHT ADVANCED
            'bodyweight': [
                {
                    'name': 'Advanced Calisthenics',
                    'exercises': [
                        {'name': 'One-Arm Push-up Progression', 'sets': 4, 'reps': '3-5 each', 'rest': '120s', 'difficulty': 5},
                        {'name': 'Pistol Squats', 'sets': 4, 'reps': '5-8 each', 'rest': '90s', 'difficulty': 5},
                        {'name': 'Handstand Push-ups', 'sets': 3, 'reps': '3-6', 'rest': '120s', 'difficulty': 5},
                        {'name': 'L-Sits', 'sets': 4, 'reps': '10-20s', 'rest': '90s', 'difficulty': 4},
                        {'name': 'Archer Push-ups', 'sets': 3, 'reps': '6-10 each', 'rest': '90s', 'difficulty': 4}
                    ],
                    'duration': 50,
                    'calories_burned': 300,
                    'equipment': ['none'],
                    'muscle_groups': ['full_body'],
                    'intensity': 'very_high'
                }
            ],
            
            # ADVANCED GYM WORKOUTS
            'gym_full': [
                {
                    'name': 'Advanced Powerlifting',
                    'exercises': [
                        {'name': 'Barbell Squats (Heavy)', 'sets': 5, 'reps': '3-5', 'rest': '180s', 'difficulty': 5},
                        {'name': 'Barbell Deadlifts (Heavy)', 'sets': 5, 'reps': '3-5', 'rest': '180s', 'difficulty': 5},
                        {'name': 'Barbell Bench Press (Heavy)', 'sets': 5, 'reps': '3-5', 'rest': '180s', 'difficulty': 5},
                        {'name': 'Weighted Pull-ups', 'sets': 4, 'reps': '5-8', 'rest': '120s', 'difficulty': 4},
                        {'name': 'Barbell Hip Thrusts', 'sets': 4, 'reps': '8-10', 'rest': '90s', 'difficulty': 3}
                    ],
                    'duration': 80,
                    'calories_burned': 420,
                    'equipment': ['barbell', 'bench', 'squat_rack', 'pull_up_bar'],
                    'muscle_groups': ['full_body'],
                    'intensity': 'very_high'
                }
            ]
        }
    },
    
    # CARDIO WORKOUTS (equipment-specific)
    'cardio': {
        'beginner': [
            # NO EQUIPMENT CARDIO
            {
                'name': 'Walking/Marching in Place',
                'description': 'Low-impact cardio for absolute beginners',
                'duration': 20,
                'calories_burned': 100,
                'intensity': 'low',
                'equipment': ['none'],
                'instructions': 'March in place or walk around your space. Focus on arm movement and steady breathing.'
            },
            {
                'name': 'Basic Step-Ups',
                'description': 'Using stairs or sturdy platform',
                'duration': 15,
                'calories_burned': 120,
                'intensity': 'low-moderate',
                'equipment': ['none'],
                'instructions': 'Step up and down on a sturdy surface. Start slow and maintain good posture.'
            },
            
            # EQUIPMENT-BASED CARDIO
            {
                'name': 'Beginner Bike Session',
                'description': 'Easy cycling workout',
                'duration': 25,
                'calories_burned': 180,
                'intensity': 'low-moderate',
                'equipment': ['exercise_bike'],
                'instructions': 'Cycle at comfortable pace with minimal resistance. Focus on steady rhythm.'
            },
            {
                'name': 'Treadmill Walk',
                'description': 'Gentle treadmill introduction',
                'duration': 30,
                'calories_burned': 150,
                'intensity': 'low',
                'equipment': ['treadmill'],
                'instructions': 'Walk at 2.5-3.5 mph with slight incline. Hold handrails if needed.'
            },
            {
                'name': 'Jump Rope Basics',
                'description': 'Learning jump rope fundamentals',
                'duration': 10,
                'calories_burned': 100,
                'intensity': 'moderate',
                'equipment': ['jump_rope'],
                'instructions': 'Practice basic bounce. Rest 30s between 1-minute intervals.'
            }
        ],
        
        'intermediate': [
            {
                'name': 'Bodyweight HIIT Circuit',
                'description': 'High-intensity interval training',
                'duration': 25,
                'calories_burned': 280,
                'intensity': 'high',
                'equipment': ['none'],
                'instructions': 'Alternate 45s work with 15s rest. Include burpees, mountain climbers, jumping jacks.'
            },
            {
                'name': 'Intermediate Cycling',
                'description': 'Varied intensity bike workout',
                'duration': 35,
                'calories_burned': 300,
                'intensity': 'moderate-high',
                'equipment': ['exercise_bike'],
                'instructions': 'Alternate 2 min moderate with 1 min high intensity. Adjust resistance accordingly.'
            },
            {
                'name': 'Treadmill Intervals',
                'description': 'Run/walk intervals',
                'duration': 30,
                'calories_burned': 320,
                'intensity': 'moderate-high',
                'equipment': ['treadmill'],
                'instructions': 'Alternate 2 min running (6-7 mph) with 1 min walking recovery.'
            },
            {
                'name': 'Jump Rope Intervals',
                'description': 'Advanced jump rope training',
                'duration': 20,
                'calories_burned': 280,
                'intensity': 'high',
                'equipment': ['jump_rope'],
                'instructions': 'Alternate 30s intense jumping with 30s active rest for 20 minutes.'
            }
        ],
        
        'advanced': [
            {
                'name': 'Advanced HIIT Complex',
                'description': 'Complex movement HIIT',
                'duration': 30,
                'calories_burned': 400,
                'intensity': 'very_high',
                'equipment': ['none'],
                'instructions': 'Complex movements: burpee box jumps, single-leg burpees. 20s max effort, 10s rest.'
            },
            {
                'name': 'Spin Class Style',
                'description': 'High-intensity cycling',
                'duration': 45,
                'calories_burned': 500,
                'intensity': 'very_high',
                'equipment': ['exercise_bike'],
                'instructions': 'Simulate spin class with sprints, climbs, and varying resistance levels.'
            }
        ]
    },
    
    # FLEXIBILITY/MOBILITY WORKOUTS
    'flexibility': {
        'beginner': [
            {
                'name': 'Basic Stretching Routine',
                'description': 'Essential stretches for beginners',
                'duration': 15,
                'calories_burned': 50,
                'intensity': 'low',
                'equipment': ['none'],
                'instructions': 'Hold each stretch 30s. Focus on major muscle groups.'
            },
            {
                'name': 'Yoga Mat Flow',
                'description': 'Gentle yoga sequence',
                'duration': 25,
                'calories_burned': 80,
                'intensity': 'low',
                'equipment': ['yoga_mat'],
                'instructions': 'Basic poses: child\'s pose, cat-cow, downward dog. Hold 5-8 breaths.'
            },
            {
                'name': 'Foam Rolling Session',
                'description': 'Self-massage and mobility',
                'duration': 20,
                'calories_burned': 60,
                'intensity': 'low',
                'equipment': ['foam_roller'],
                'instructions': 'Roll each muscle group slowly. Spend 1-2 minutes per area.'
            }
        ],
        
        'intermediate': [
            {
                'name': 'Dynamic Stretching Flow',
                'description': 'Movement-based flexibility',
                'duration': 30,
                'calories_burned': 120,
                'intensity': 'low-moderate',
                'equipment': ['yoga_mat'],
                'instructions': 'Flowing movements to improve range of motion and prepare for activity.'
            },
            {
                'name': 'Resistance Band Stretching',
                'description': 'Assisted stretching with bands',
                'duration': 25,
                'calories_burned': 90,
                'intensity': 'low-moderate',
                'equipment': ['resistance_bands', 'yoga_mat'],
                'instructions': 'Use bands to assist and deepen stretches. Focus on shoulders and hips.'
            }
        ],
        
        'advanced': [
            {
                'name': 'Advanced Yoga Flow',
                'description': 'Challenging yoga sequence',
                'duration': 45,
                'calories_burned': 200,
                'intensity': 'moderate',
                'equipment': ['yoga_mat'],
                'instructions': 'Advanced poses and transitions. Include arm balances and inversions.'
            }
        ]
    }
}

# 5 Universal Basic Workouts (hardcoded to always appear)
BASIC_UNIVERSAL_WORKOUTS = [
    {
        'type': 'strength',
        'category': 'bodyweight',
        'workout': {
            'name': '15-Minute Total Body',
            'exercises': [
                {'name': 'Bodyweight Squats', 'sets': 3, 'reps': '10', 'rest': '30s', 'difficulty': 1},
                {'name': 'Push-ups (or knee push-ups)', 'sets': 3, 'reps': '8', 'rest': '30s', 'difficulty': 1},
                {'name': 'Plank Hold', 'sets': 2, 'reps': '20s', 'rest': '45s', 'difficulty': 1},
                {'name': 'Jumping Jacks', 'sets': 2, 'reps': '15', 'rest': '30s', 'difficulty': 1}
            ],
            'duration': 15,
            'calories_burned': 100,
            'equipment': ['none'],
            'muscle_groups': ['full_body'],
            'intensity': 'low-moderate'
        },
        'match_score': 95
    },
    {
        'type': 'cardio',
        'workout': {
            'name': '10-Minute Morning Energizer',
            'description': 'Quick cardio to start your day',
            'duration': 10,
            'calories_burned': 80,
            'intensity': 'moderate',
            'equipment': ['none'],
            'instructions': 'Alternate 30s marching in place, 30s arm circles, 30s gentle jumping jacks. Repeat 5 times.'
        },
        'match_score': 94
    },
    {
        'type': 'flexibility',
        'workout': {
            'name': '10-Minute Gentle Stretch',
            'description': 'Perfect for any time of day',
            'duration': 10,
            'calories_burned': 30,
            'intensity': 'low',
            'equipment': ['none'],
            'instructions': 'Hold each stretch for 30s: neck rolls, shoulder shrugs, forward fold, seated spinal twist, child\'s pose.'
        },
        'match_score': 93
    },
    {
        'type': 'strength',
        'category': 'bodyweight',
        'workout': {
            'name': '5-Minute Core Blast',
            'exercises': [
                {'name': 'Modified Crunches', 'sets': 2, 'reps': '10', 'rest': '30s', 'difficulty': 1},
                {'name': 'Dead Bug', 'sets': 2, 'reps': '8 each side', 'rest': '30s', 'difficulty': 2},
                {'name': 'Knee-to-Chest', 'sets': 2, 'reps': '10 each', 'rest': '30s', 'difficulty': 1},
                {'name': 'Side Plank (modified)', 'sets': 2, 'reps': '15s each side', 'rest': '30s', 'difficulty': 2}
            ],
            'duration': 5,
            'calories_burned': 40,
            'equipment': ['none'],
            'muscle_groups': ['core'],
            'intensity': 'low-moderate'
        },
        'match_score': 92
    },
    {
        'type': 'cardio',
        'workout': {
            'name': '20-Minute Steady Walk',
            'description': 'Low-impact cardio for everyone',
            'duration': 20,
            'calories_burned': 120,
            'intensity': 'low',
            'equipment': ['none'],
            'instructions': 'Walk at a comfortable pace indoors or outdoors. Focus on steady breathing and good posture.'
        },
        'match_score': 91
    }
]

# Equipment mapping for workout recommendations
EQUIPMENT_MAPPING = {
    'none': ['bodyweight'],
    'dumbbells': ['dumbbells', 'bodyweight'],
    'resistance_bands': ['resistance_bands', 'bodyweight'],
    'kettlebell': ['kettlebell', 'bodyweight'],
    'yoga_mat': ['yoga_mat', 'bodyweight'],
    'pull_up_bar': ['bodyweight'],  # Enhanced bodyweight with pull-ups
    'exercise_bike': ['exercise_bike'],
    'treadmill': ['treadmill'],
    'barbell': ['gym_full', 'dumbbells', 'bodyweight'],
    'bench': ['gym_full', 'dumbbells', 'bodyweight'],
    'jump_rope': ['jump_rope'],
    'foam_roller': ['foam_roller'],
    'stability_ball': ['stability_ball'],
    'suspension_trainer': ['suspension_trainer'],
    'medicine_ball': ['medicine_ball'],
    'cable_machine': ['gym_full'],
    'gym_membership_full_access': ['gym_full', 'dumbbells', 'bodyweight', 'exercise_bike', 'treadmill']
}

def get_workout_recommendations(user_profile, preferences=None, custom_workouts=None):
    """Get personalized workout recommendations based on user profile and equipment - INCLUDES CUSTOM WORKOUTS"""
    if not user_profile:
        return BASIC_UNIVERSAL_WORKOUTS
   
    experience = user_profile.get('fitness_experience', 'beginner')
    training_styles = user_profile.get('training_styles', [])
    has_gym = user_profile.get('has_gym_membership', False)
    available_equipment = user_profile.get('available_equipment', '')
    workout_duration = user_profile.get('workout_duration', 30)
    home_equipment = user_profile.get('home_equipment', [])
   
    recommendations = []
   
    # Determine available workout types based on equipment
    available_workout_types = set(['bodyweight'])  # Everyone can do bodyweight
    
    if has_gym or available_equipment == 'gym_membership_full_access':
        # Full gym access
        available_workout_types.update(['gym_full', 'dumbbells', 'exercise_bike', 'treadmill'])
    else:
        # Parse home equipment
        if isinstance(home_equipment, list):
            equipment_list = home_equipment
        else:
            equipment_list = available_equipment.split(', ') if available_equipment else []
        
        for equipment in equipment_list:
            if equipment in EQUIPMENT_MAPPING:
                available_workout_types.update(EQUIPMENT_MAPPING[equipment])

    print(f"DEBUG: User training styles: {training_styles}")
    print(f"DEBUG: Available workout types: {available_workout_types}")
    print(f"DEBUG: Experience level: {experience}")
   
    # ADD CUSTOM WORKOUTS FIRST (if any exist)
    if custom_workouts:
        print(f"DEBUG: Adding {len(custom_workouts)} custom workouts")
        for custom_workout in custom_workouts:
            # Check if user has required equipment for custom workout
            workout_equipment = custom_workout.get('equipment', ['none'])
            equipment_available = (any(eq in available_workout_types for eq in workout_equipment) or 
                                 'none' in workout_equipment or
                                 any(eq == 'none' for eq in workout_equipment))
            
            if equipment_available:
                # Determine workout type from custom workout
                workout_type = custom_workout.get('workout_type', 'strength')
                if workout_type == 'custom':
                    workout_type = 'strength'  # Default custom workouts to strength
                
                recommendations.append({
                    'type': workout_type,
                    'category': 'custom',
                    'workout': custom_workout,
                    'match_score': calculate_match_score(custom_workout, user_profile, available_workout_types) + 10  # Bonus for custom workouts
                })
                print(f"DEBUG: Added custom workout: {custom_workout.get('name', 'Custom Workout')}")
    
    # STRENGTH WORKOUTS - Include if user wants strength training OR no preferences specified
    include_strength = (not training_styles or 
                       any(style in training_styles for style in ['weightlifting', 'strength_training', 'bodyweight', 'powerlifting']))
    
    if include_strength:
        print("DEBUG: Including strength workouts")
        strength_workouts = WORKOUT_DATABASE['strength'].get(experience, {})
        
        for workout_type in available_workout_types:
            if workout_type in strength_workouts:
                workouts = strength_workouts[workout_type]
                if isinstance(workouts, list):
                    for workout in workouts:
                        # More lenient duration matching
                        duration_diff = abs(workout['duration'] - workout_duration)
                        if duration_diff <= 25:  # Allow 25 minute difference
                            recommendations.append({
                                'type': 'strength',
                                'category': workout_type,
                                'workout': workout,
                                'match_score': calculate_match_score(workout, user_profile, available_workout_types)
                            })
                            print(f"DEBUG: Added strength workout: {workout['name']}")
   
    # CARDIO WORKOUTS - Include if user wants cardio OR no preferences specified
    include_cardio = (not training_styles or 
                     any(style in training_styles for style in ['cardio', 'running', 'hiit', 'cycling', 'swimming']))
    
    if include_cardio:
        print("DEBUG: Including cardio workouts")
        cardio_workouts = WORKOUT_DATABASE['cardio'].get(experience, [])
        
        for workout in cardio_workouts:
            workout_equipment = workout.get('equipment', ['none'])
            # Check if user has the required equipment
            equipment_available = (any(eq in available_workout_types for eq in workout_equipment) or 
                                 'none' in workout_equipment or
                                 any(eq == 'none' for eq in workout_equipment))
            
            if equipment_available:
                duration_diff = abs(workout['duration'] - workout_duration)
                if duration_diff <= 20:  # Allow 20 minute difference for cardio
                    recommendations.append({
                        'type': 'cardio',
                        'workout': workout,
                        'match_score': calculate_match_score(workout, user_profile, available_workout_types)
                    })
                    print(f"DEBUG: Added cardio workout: {workout['name']}")
   
    # FLEXIBILITY/YOGA WORKOUTS - Include if user wants flexibility OR no preferences specified
    include_flexibility = (not training_styles or 
                          any(style in training_styles for style in ['yoga', 'pilates', 'stretching', 'flexibility']))
    
    if include_flexibility:
        print("DEBUG: Including flexibility workouts")
        flexibility_workouts = WORKOUT_DATABASE['flexibility'].get(experience, [])
        
        for workout in flexibility_workouts:
            workout_equipment = workout.get('equipment', ['none'])
            equipment_available = (any(eq in available_workout_types for eq in workout_equipment) or 
                                 'none' in workout_equipment or
                                 any(eq == 'none' for eq in workout_equipment))
            
            if equipment_available:
                recommendations.append({
                    'type': 'flexibility',
                    'workout': workout,
                    'match_score': calculate_match_score(workout, user_profile, available_workout_types)
                })
                print(f"DEBUG: Added flexibility workout: {workout['name']}")
   
    # If no training styles specified, ensure we have at least one of each type
    if not training_styles:
        print("DEBUG: No training styles specified, ensuring variety")
        
        # Ensure at least one strength workout
        if not any(rec['type'] == 'strength' for rec in recommendations):
            bodyweight_workouts = WORKOUT_DATABASE['strength'].get(experience, {}).get('bodyweight', [])
            if bodyweight_workouts:
                recommendations.append({
                    'type': 'strength',
                    'category': 'bodyweight',
                    'workout': bodyweight_workouts[0],
                    'match_score': 75
                })
                print("DEBUG: Added fallback strength workout")
        
        # Ensure at least one cardio workout
        if not any(rec['type'] == 'cardio' for rec in recommendations):
            cardio_workouts = WORKOUT_DATABASE['cardio'].get(experience, [])
            bodyweight_cardio = [w for w in cardio_workouts if 'none' in w.get('equipment', [])]
            if bodyweight_cardio:
                recommendations.append({
                    'type': 'cardio',
                    'workout': bodyweight_cardio[0],
                    'match_score': 75
                })
                print("DEBUG: Added fallback cardio workout")
        
        # Ensure at least one flexibility workout
        if not any(rec['type'] == 'flexibility' for rec in recommendations):
            flexibility_workouts = WORKOUT_DATABASE['flexibility'].get(experience, [])
            basic_flexibility = [w for w in flexibility_workouts if 'none' in w.get('equipment', [])]
            if basic_flexibility:
                recommendations.append({
                    'type': 'flexibility',
                    'workout': basic_flexibility[0],
                    'match_score': 75
                })
                print("DEBUG: Added fallback flexibility workout")

    print(f"DEBUG: Total recommendations before sorting: {len(recommendations)}")
    
    # Sort by match score (custom workouts will rank higher due to bonus)
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)
    
    # Ensure diversity in final recommendations
    diverse_recommendations = []
    type_counts = {'strength': 0, 'cardio': 0, 'flexibility': 0}
    custom_count = 0
    
    # First pass: Prioritize custom workouts
    for rec in recommendations:
        if rec.get('category') == 'custom' and custom_count < 3:  # Limit custom workouts to 3
            diverse_recommendations.append(rec)
            type_counts[rec['type']] += 1
            custom_count += 1
    
    # Second pass: Ensure we get some of each type (if available)
    min_per_type = 1 if not training_styles else 0  # If no preferences, ensure at least 1 of each
    max_per_type = 6  # Allow up to 6 of each type
    
    # Add at least min_per_type of each workout type
    for workout_type in ['strength', 'cardio', 'flexibility']:
        type_recs = [r for r in recommendations if r['type'] == workout_type and r not in diverse_recommendations]
        for rec in type_recs[:min_per_type]:
            if len(diverse_recommendations) < 15:
                diverse_recommendations.append(rec)
                type_counts[workout_type] += 1
    
    # Third pass: Fill remaining slots with best matches, respecting max limits
    for rec in recommendations:
        if len(diverse_recommendations) >= 12:  # Limit total recommendations
            break
        workout_type = rec['type']
        if (rec not in diverse_recommendations and 
            type_counts[workout_type] < max_per_type):
            diverse_recommendations.append(rec)
            type_counts[workout_type] += 1
    
    # Fourth pass: If we still have space, add more
    if len(diverse_recommendations) < 8:
        for rec in recommendations:
            if len(diverse_recommendations) >= 10:
                break
            if rec not in diverse_recommendations:
                diverse_recommendations.append(rec)
    
    print(f"DEBUG: Final recommendations by type: {dict(type_counts)}")
    print(f"DEBUG: Custom workouts included: {custom_count}")
    print(f"DEBUG: Total final recommendations: {len(diverse_recommendations)}")
    
    # Shuffle within each type to add variety (but keep custom workouts at top)
    custom_recs = [r for r in diverse_recommendations if r.get('category') == 'custom']
    strength_recs = [r for r in diverse_recommendations if r['type'] == 'strength' and r.get('category') != 'custom']
    cardio_recs = [r for r in diverse_recommendations if r['type'] == 'cardio' and r.get('category') != 'custom']
    flexibility_recs = [r for r in diverse_recommendations if r['type'] == 'flexibility' and r.get('category') != 'custom']
    
    random.shuffle(strength_recs)
    random.shuffle(cardio_recs)
    random.shuffle(flexibility_recs)
    
    # Start with custom workouts, then interleave the rest
    final_recommendations = custom_recs.copy()
    max_length = max(len(strength_recs), len(cardio_recs), len(flexibility_recs))
    
    for i in range(max_length):
        if i < len(strength_recs):
            final_recommendations.append(strength_recs[i])
        if i < len(cardio_recs):
            final_recommendations.append(cardio_recs[i])
        if i < len(flexibility_recs):
            final_recommendations.append(flexibility_recs[i])
    
    # Add the 5 universal basic workouts at the end (always available)
    final_recommendations.extend(BASIC_UNIVERSAL_WORKOUTS)
    
    return final_recommendations[:20]  # Return up to 20 total (custom + personalized + universal)

def calculate_match_score(workout, user_profile, available_equipment):
    """Calculate how well a workout matches user preferences and equipment - ENHANCED"""
    score = 0
   
    # Duration preference (max 30 points) - more lenient
    target_duration = user_profile.get('workout_duration', 30)
    duration_diff = abs(workout['duration'] - target_duration)
    if duration_diff <= 5:
        score += 30
    elif duration_diff <= 10:
        score += 25
    elif duration_diff <= 15:
        score += 20
    elif duration_diff <= 25:
        score += 15
    else:
        score += max(0, 10 - duration_diff // 5)
   
    # Equipment availability (max 25 points)
    workout_equipment = workout.get('equipment', ['none'])
    if any(eq in available_equipment for eq in workout_equipment) or 'none' in workout_equipment:
        score += 25
        
        # Bonus for perfect equipment match
        if 'gym_full' in available_equipment and any(eq in ['barbell', 'cable_machine'] for eq in workout_equipment):
            score += 5
        elif 'dumbbells' in available_equipment and 'dumbbells' in workout_equipment:
            score += 5
   
    # Training style alignment (max 25 points)
    training_styles = user_profile.get('training_styles', [])
    
    # Get workout type from the recommendation
    workout_type = None
    if hasattr(workout, 'get'):
        workout_type = workout.get('type')
    
    # If workout_type is not in the workout dict, infer from context
    if not workout_type:
        if 'exercises' in workout:
            workout_type = 'strength'
        elif 'instructions' in workout:
            if any(word in workout.get('name', '').lower() for word in ['cardio', 'running', 'bike', 'hiit']):
                workout_type = 'cardio'
            else:
                workout_type = 'flexibility'
    
    if training_styles:
        if 'weightlifting' in training_styles and (workout_type == 'strength' or 'exercises' in workout):
            score += 20
        if 'bodyweight' in training_styles and 'none' in workout.get('equipment', []):
            score += 20
        if 'cardio' in training_styles and (workout_type == 'cardio' or 'cardio' in workout.get('name', '').lower()):
            score += 20
        if 'hiit' in training_styles and 'high' in workout.get('intensity', ''):
            score += 15
        if 'yoga' in training_styles and (workout_type == 'flexibility' or 'yoga' in workout.get('name', '').lower()):
            score += 20
        if 'running' in training_styles and 'running' in workout.get('name', '').lower():
            score += 20
        if 'cycling' in training_styles and any(word in workout.get('name', '').lower() for word in ['bike', 'cycling']):
            score += 20
    else:
        # No specific preferences, give moderate score to all
        score += 10
   
    # Fitness goals alignment (max 15 points)
    fitness_goals = user_profile.get('fitness_goals', [])
    calories_burned = workout.get('calories_burned', 0)
    
    if fitness_goals:
        if 'weight_loss' in fitness_goals and calories_burned > 150:
            score += 15
        if 'muscle_building' in fitness_goals and (workout_type == 'strength' or 'exercises' in workout):
            score += 15
        if 'endurance' in fitness_goals and (workout_type == 'cardio' or calories_burned > 200):
            score += 15
        if 'flexibility' in fitness_goals and workout_type == 'flexibility':
            score += 15
        if 'general_health' in fitness_goals:
            score += 8  # Any workout helps general health
    else:
        score += 5  # Default bonus if no specific goals
   
    # Experience level match (max 15 points)
    experience = user_profile.get('fitness_experience', 'beginner')
    workout_intensity = workout.get('intensity', 'moderate')
    
    if experience == 'beginner':
        if workout_intensity in ['low', 'low-moderate']:
            score += 15
        elif workout_intensity == 'moderate':
            score += 10
        else:
            score += 5
    elif experience == 'intermediate':
        if workout_intensity in ['moderate', 'moderate-high']:
            score += 15
        elif workout_intensity in ['low-moderate', 'high']:
            score += 10
        else:
            score += 5
    elif experience == 'advanced':
        if workout_intensity in ['high', 'very_high']:
            score += 15
        elif workout_intensity == 'moderate-high':
            score += 10
        else:
            score += 5
   
    # Random factor to add variety (max 5 points)
    score += random.randint(0, 5)
   
    return min(score, 100)  # Cap at 100

def get_workout_plan(user_profile, days_per_week=None):
    """Generate a weekly workout plan with proper variety - ENHANCED"""
    if not days_per_week:
        days_per_week = user_profile.get('workout_frequency', 3)
   
    recommendations = get_workout_recommendations(user_profile)
   
    if not recommendations:
        return []
   
    # Separate recommendations by type
    strength_workouts = [w for w in recommendations if w['type'] == 'strength']
    cardio_workouts = [w for w in recommendations if w['type'] == 'cardio']
    flexibility_workouts = [w for w in recommendations if w['type'] == 'flexibility']
   
    plan = []
    used_workouts = set()
    
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    for i in range(days_per_week):
        day_name = days[i]
        
        # Create a rotation pattern based on user preferences
        training_styles = user_profile.get('training_styles', [])
        
        if not training_styles:
            # Default pattern: alternate between strength, cardio, flexibility
            if i % 3 == 0 and strength_workouts:
                preferred_type = 'strength'
                available_workouts = [w for w in strength_workouts if w['workout']['name'] not in used_workouts]
            elif i % 3 == 1 and cardio_workouts:
                preferred_type = 'cardio'
                available_workouts = [w for w in cardio_workouts if w['workout']['name'] not in used_workouts]
            elif flexibility_workouts:
                preferred_type = 'flexibility'
                available_workouts = [w for w in flexibility_workouts if w['workout']['name'] not in used_workouts]
            else:
                # Fallback to any available workout
                available_workouts = [w for w in recommendations if w['workout']['name'] not in used_workouts]
        else:
            # User has preferences, weight toward their preferred styles
            if 'weightlifting' in training_styles or 'strength_training' in training_styles:
                if i % 2 == 0 and strength_workouts:  # More strength focus
                    available_workouts = [w for w in strength_workouts if w['workout']['name'] not in used_workouts]
                else:
                    # Mix in other types
                    other_workouts = cardio_workouts + flexibility_workouts
                    available_workouts = [w for w in other_workouts if w['workout']['name'] not in used_workouts]
            elif 'cardio' in training_styles or 'running' in training_styles:
                if i % 2 == 0 and cardio_workouts:  # More cardio focus
                    available_workouts = [w for w in cardio_workouts if w['workout']['name'] not in used_workouts]
                else:
                    other_workouts = strength_workouts + flexibility_workouts
                    available_workouts = [w for w in other_workouts if w['workout']['name'] not in used_workouts]
            else:
                # Default rotation for other preferences
                available_workouts = [w for w in recommendations if w['workout']['name'] not in used_workouts]
        
        # Select the best available workout
        if available_workouts:
            selected_workout = available_workouts[0]
        elif recommendations:
            # If we've used all workouts, start reusing them
            selected_workout = recommendations[i % len(recommendations)]
        else:
            # No workouts available (shouldn't happen)
            continue
        
        used_workouts.add(selected_workout['workout']['name'])
        
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
    sorted_workouts = sorted(workout_history, key=lambda x: x['date'], reverse=True)
    
    for i, workout in enumerate(sorted_workouts):
        if i == 0:
            consecutive_days = 1
        else:
            prev_date = sorted_workouts[i-1]['date']
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
                "Progress gradually"
            ]
        },
        'burpees': {
            'form_tips': [
                "Jump back to plank position",
                "Perform a full push-up",
                "Jump feet back to squat",
                "Explode up with arms overhead"
            ],
            'safety': [
                "Land softly on jumps",
                "Modify if needed",
                "Start with slow tempo"
            ]
        },
        'lunges': {
            'form_tips': [
                "Keep front knee over ankle",
                "Lower back knee toward ground",
                "Keep torso upright",
                "Push through front heel to return"
            ],
            'safety': [
                "Don't let front knee go past toes",
                "Control the descent",
                "Start with bodyweight only"
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
            'strength': "Focus on mastering bodyweight movements first. Add resistance (bands/weights) only when you can complete all reps with perfect form.",
            'cardio': "Increase duration by 5 minutes each week. Build your aerobic base gradually before adding intensity.",
            'flexibility': "Hold stretches longer and try new poses. Consistency is key for flexibility gains."
        },
        'intermediate': {
            'strength': "Try advanced variations, increase weight by 2.5-5%, or add more sets. Consider compound movements.",
            'cardio': "Add interval training, increase intensity, or try new cardio modalities like HIIT.",
            'flexibility': "Work on deeper stretches and more challenging poses. Add balance challenges."
        },
        'advanced': {
            'strength': "Focus on compound movements, periodization, and specific strength goals. Consider powerlifting or Olympic lifting.",
            'cardio': "Incorporate sport-specific training, advanced intervals, or endurance challenges.",
            'flexibility': "Master advanced poses, help others, or explore new flexibility disciplines."
        }
    }
   
    return progressions.get(current_level, {}).get(workout_type, "Keep challenging yourself while maintaining good form!")

def get_user_custom_workouts(user_id):
    """Get all custom workouts created by a specific user (to be implemented in backend)"""
    # This function should be implemented in your backend to fetch custom workouts from database
    # For now, returning empty list - you'll need to implement this in your Flask backend
    return []

def format_custom_workout_for_recommendations(custom_workout_data):
    """Format a custom workout from the database into the recommendation format"""
    return {
        'name': custom_workout_data.get('workout_name', 'Custom Workout'),
        'workout_type': custom_workout_data.get('workout_type', 'strength'),
        'duration': custom_workout_data.get('estimated_duration', 30),
        'calories_burned': custom_workout_data.get('estimated_calories', 200),
        'intensity': custom_workout_data.get('intensity', 'moderate'),
        'equipment': custom_workout_data.get('equipment', ['none']),
        'exercises': custom_workout_data.get('exercises', []),
        'muscle_groups': ['custom'],  # You can enhance this based on exercises
        'type': 'custom',
        'description': f"Your custom {custom_workout_data.get('workout_type', 'strength')} workout"
    }