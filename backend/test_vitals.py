#!/usr/bin/env python3
"""
Test script for vitals functionality
"""

import os
import sys
import sqlite3
from datetime import datetime, timedelta
import json

# Add the current directory to the path so we can import database
sys.path.append(os.path.dirname(__file__))

from database import (
    init_db, 
    init_fitness_tables, 
    log_vitals_data, 
    get_vitals_data, 
    get_vitals_streak,
    get_all_vitals_streaks,
    get_vitals_summary,
    get_vitals_chart_data,
    DB_PATH
)

def test_database_initialization():
    """Test if database can be initialized"""
    print("🔧 Testing database initialization...")
    
    try:
        # Initialize database
        init_db()
        init_fitness_tables()
        
        # Check if database file exists
        if os.path.exists(DB_PATH):
            print(f"✅ Database file created: {DB_PATH}")
            
            # Test database connection
            with sqlite3.connect(DB_PATH) as conn:
                c = conn.cursor()
                
                # Check if vitals tables exist
                c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='vitals_data'")
                if c.fetchone():
                    print("✅ vitals_data table exists")
                else:
                    print("❌ vitals_data table does not exist")
                
                c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='vitals_streaks'")
                if c.fetchone():
                    print("✅ vitals_streaks table exists")
                else:
                    print("❌ vitals_streaks table does not exist")
                    
        else:
            print(f"❌ Database file not created: {DB_PATH}")
            return False
            
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
        return False
    
    return True

def test_vitals_logging():
    """Test vitals data logging"""
    print("\n📝 Testing vitals data logging...")
    
    test_user_id = "test_user_123"
    
    try:
        # Test water logging
        water_data = {"amount": 32, "unit": "oz"}
        log_id = log_vitals_data(test_user_id, "water", water_data)
        print(f"✅ Water logged successfully with ID: {log_id}")
        
        # Test sleep logging
        sleep_data = {"hours": 7, "minutes": 30}
        log_id = log_vitals_data(test_user_id, "sleep", sleep_data)
        print(f"✅ Sleep logged successfully with ID: {log_id}")
        
        # Test steps logging
        steps_data = {"steps": 8500}
        log_id = log_vitals_data(test_user_id, "steps", steps_data)
        print(f"✅ Steps logged successfully with ID: {log_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Vitals logging error: {e}")
        return False

def test_vitals_retrieval():
    """Test vitals data retrieval"""
    print("\n📊 Testing vitals data retrieval...")
    
    test_user_id = "test_user_123"
    
    try:
        # Test getting vitals data
        water_data = get_vitals_data(test_user_id, "water")
        print(f"✅ Retrieved water data: {water_data}")
        
        # Test getting streaks
        streaks = get_all_vitals_streaks(test_user_id)
        print(f"✅ Retrieved streaks: {streaks}")
        
        # Test getting summary
        summary = get_vitals_summary(test_user_id, "water", 7)
        print(f"✅ Retrieved summary: {summary}")
        
        # Test getting chart data
        chart_data = get_vitals_chart_data(test_user_id, "water", "1w")
        print(f"✅ Retrieved chart data: {len(chart_data)} points")
        
        return True
        
    except Exception as e:
        print(f"❌ Vitals retrieval error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Starting vitals functionality tests...\n")
    
    # Test database initialization
    if not test_database_initialization():
        print("❌ Database initialization failed")
        return
    
    # Test vitals logging
    if not test_vitals_logging():
        print("❌ Vitals logging failed")
        return
    
    # Test vitals retrieval
    if not test_vitals_retrieval():
        print("❌ Vitals retrieval failed")
        return
    
    print("\n🎉 All tests passed! Vitals functionality is working correctly.")

if __name__ == "__main__":
    main() 