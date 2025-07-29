#!/usr/bin/env python3
"""
Script to recreate vitals_data table without UNIQUE constraint
"""

import sqlite3
import json
from datetime import datetime

def recreate_vitals_table():
    """Recreate vitals_data table without UNIQUE constraint"""
    db_path = "nutrifit.db"
    
    with sqlite3.connect(db_path) as conn:
        c = conn.cursor()
        
        print("🔄 Recreating vitals_data table...")
        
        # Get all existing data
        c.execute("SELECT user_id, metric_type, date_logged, value_data, created_at FROM vitals_data")
        existing_data = c.fetchall()
        print(f"📊 Found {len(existing_data)} existing records to preserve")
        
        # Drop the old table
        c.execute("DROP TABLE vitals_data")
        print("🗑️ Dropped old vitals_data table")
        
        # Create new table without UNIQUE constraint
        c.execute("""
        CREATE TABLE vitals_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            metric_type TEXT NOT NULL,
            date_logged DATE NOT NULL,
            value_data TEXT, -- JSON data for flexible metric storage
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
        print("✅ Created new vitals_data table without UNIQUE constraint")
        
        # Reinsert all existing data
        if existing_data:
            c.executemany("""
            INSERT INTO vitals_data (user_id, metric_type, date_logged, value_data, created_at)
            VALUES (?, ?, ?, ?, ?)
            """, existing_data)
            print(f"✅ Reinserted {len(existing_data)} existing records")
        
        conn.commit()
        print("🎉 Vitals table recreation completed successfully!")

if __name__ == "__main__":
    recreate_vitals_table() 