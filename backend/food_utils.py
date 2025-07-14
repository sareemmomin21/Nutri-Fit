from flask import Flask, request, jsonify
import json
import os


def filter_and_score_foods(foods, meal_context, meal_type):
    """Filter foods and score them based on user preferences and nutritional needs"""
    filtered_foods = []
    
    for food in foods:
        # Skip disliked foods
        if food["name"] in meal_context["disliked_foods"]:
            continue
            
        # Skip foods with unwanted keywords
        undesired_keywords = ["school lunch", "cafeteria", "NFS", "baby food", "infant"]
        if any(keyword.lower() in food["name"].lower() for keyword in undesired_keywords):
            continue
            
        # Calculate score
        score = 0
        
        # Base score for calorie appropriateness
        calorie_diff = abs(food["calories"] - meal_context["remaining_calories"])
        if calorie_diff <= meal_context["remaining_calories"] * 0.15:
            score += 10
        elif calorie_diff <= meal_context["remaining_calories"] * 0.3:
            score += 5
        
        # Bonus for liked foods
        if food["name"] in meal_context["liked_foods"]:
            score += 15
            
        # Bonus for foods that help with macro needs
        if meal_context["macro_needs"]["protein"] and food.get("protein", 0) > 10:
            score += 8
        if meal_context["macro_needs"]["carbs"] and food.get("carbohydrates", 0) > 20:
            score += 6
        if meal_context["macro_needs"]["fat"] and food.get("fat", 0) > 5:
            score += 4
            
        # Bonus for meal-appropriate foods
        if meal_type == "breakfast" and food.get("category") in ["breakfast_special", "protein", "dairy"]:
            score += 5
        elif meal_type == "lunch" and food.get("category") in ["protein", "starch", "vegetable"]:
            score += 5
        elif meal_type == "dinner" and food.get("category") in ["protein", "starch", "vegetable"]:
            score += 5
        elif meal_type == "snacks" and food.get("category") in ["snack", "fruit", "protein"]:
            score += 5
            
        food["score"] = score
        filtered_foods.append(food)
    
    # Sort by score (highest first)
    return sorted(filtered_foods, key=lambda x: x["score"], reverse=True)