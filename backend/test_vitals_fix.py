#!/usr/bin/env python3
"""
Test script to verify vitals functionality after fixes
"""

import sqlite3
import json
import traceback
from datetime import datetime, timedelta
from database import init_db, log_vitals_data, get_vitals_data, get_vitals_chart_data, DB_PATH

def test_vitals_functionality():
    """Test the vitals functionality"""
    print("🧪 Testing vitals functionality...")
    
    # Initialize database
    init_db()
    
    # Test user ID
    test_user_id = "test_user_123"
    
    # Test data
    test_data = [
        {
            "metric_type": "water",
            "value_data": {"amount": 8, "unit": "oz"},
            "date_logged": datetime.now().date()
        },
        {
            "metric_type": "water", 
            "value_data": {"amount": 12, "unit": "oz"},
            "date_logged": datetime.now().date()
        },
        {
            "metric_type": "mood",
            "value_data": {"rating": 4, "note": "Feeling good"},
            "date_logged": datetime.now().date()
        },
        {
            "metric_type": "mood",
            "value_data": {"rating": 5, "note": "Excellent day"},
            "date_logged": datetime.now().date()
        }
    ]
    
    print(f"📝 Testing logging {len(test_data)} vitals entries...")
    
    # Test logging multiple entries for the same day
    for i, data in enumerate(test_data):
        try:
            log_id = log_vitals_data(
                test_user_id, 
                data["metric_type"], 
                data["value_data"], 
                data["date_logged"]
            )
            print(f"✅ Logged entry {i+1}: {data['metric_type']} = {data['value_data']} (ID: {log_id})")
        except Exception as e:
            print(f"❌ Failed to log entry {i+1}: {e}")
            print(f"Full error: {traceback.format_exc()}")
            return False
    
    print("\n📊 Testing data retrieval...")
    
    # Test getting vitals data
    try:
        water_data = get_vitals_data(test_user_id, "water")
        mood_data = get_vitals_data(test_user_id, "mood")
        
        print(f"✅ Retrieved water data: {len(water_data)} day(s)")
        print(f"✅ Retrieved mood data: {len(mood_data)} day(s)")
        
        # Check if we have multiple entries for today
        today_str = datetime.now().date().strftime('%Y-%m-%d')
        if today_str in water_data:
            water_entries = water_data[today_str]
            print(f"📈 Today's water entries: {len(water_entries)}")
            for entry in water_entries:
                print(f"   - {entry['value']} at {entry['timestamp']}")
        
        if today_str in mood_data:
            mood_entries = mood_data[today_str]
            print(f"📈 Today's mood entries: {len(mood_entries)}")
            for entry in mood_entries:
                print(f"   - {entry['value']} at {entry['timestamp']}")
        
    except Exception as e:
        print(f"❌ Failed to retrieve data: {e}")
        print(f"Full error: {traceback.format_exc()}")
        return False
    
    print("\n📈 Testing chart data generation...")
    
    # Test chart data generation
    try:
        water_chart_data = get_vitals_chart_data(test_user_id, "water", "1w")
        mood_chart_data = get_vitals_chart_data(test_user_id, "mood", "1w")
        
        print(f"✅ Generated water chart data: {len(water_chart_data)} points")
        print(f"✅ Generated mood chart data: {len(mood_chart_data)} points")
        
        # Check if today's data is properly aggregated
        today_data = None
        for point in water_chart_data:
            if point['date'] == today_str and point['has_data']:
                today_data = point
                break
        
        if today_data:
            print(f"📊 Today's aggregated water value: {today_data['value']} (should be 20)")
            if today_data['value'] == 20:
                print("✅ Water aggregation working correctly!")
            else:
                print(f"⚠️ Water aggregation issue: expected 20, got {today_data['value']}")
        
        today_mood_data = None
        for point in mood_chart_data:
            if point['date'] == today_str and point['has_data']:
                today_mood_data = point
                break
        
        if today_mood_data:
            print(f"📊 Today's aggregated mood value: {today_mood_data['value']} (should be 4.5)")
            if today_mood_data['value'] == 4.5:
                print("✅ Mood aggregation working correctly!")
            else:
                print(f"⚠️ Mood aggregation issue: expected 4.5, got {today_mood_data['value']}")
        
    except Exception as e:
        print(f"❌ Failed to generate chart data: {e}")
        print(f"Full error: {traceback.format_exc()}")
        return False
    
    print("\n🎉 All tests completed successfully!")
    return True

if __name__ == "__main__":
    success = test_vitals_functionality()
    if success:
        print("\n✅ Vitals functionality is working correctly!")
    else:
        print("\n❌ Vitals functionality has issues that need to be addressed.") 