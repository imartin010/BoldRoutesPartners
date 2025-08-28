#!/usr/bin/env python3
"""Ultra simple CSV to Supabase uploader - NO FANCY STUFF"""

import pandas as pd
import requests
import json
import time

# Your Supabase details
SUPABASE_URL = "https://mdqqqogshgtpzxtufjzn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXFxb2dzaGd0cHp4dHVmanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5MjUsImV4cCI6MjA3MTY5MjkyNX0.CmxAoMsKcjNWX3FIea-yfOHSD3lkEtw0vCFmDgVfgq8"

def upload_batch(data_batch):
    """Upload a batch of records via REST API"""
    url = f"{SUPABASE_URL}/rest/v1/nawy_properties"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    response = requests.post(url, headers=headers, json=data_batch)
    
    if response.status_code != 201:
        print(f"❌ Error {response.status_code}: {response.text}")
        return False
    
    return True

def main():
    print("🔥 ULTRA SIMPLE UPLOADER - NO BULLSHIT!")
    
    # Read CSV
    print("📖 Reading CSV...")
    df = pd.read_csv("nawy_ALL_properties_20250826_005624.csv")
    print(f"✅ Found {len(df)} records")
    
    # Convert to simple records
    records = []
    for _, row in df.iterrows():
        # Only use columns that exist in our simple table
        record = {
            'nawy_id': int(row['id']) if pd.notna(row['id']) else None,
            'unit_id': str(row['unit_id']) if pd.notna(row['unit_id']) else None,
            'unit_area': float(row['unit_area']) if pd.notna(row['unit_area']) else None,
            'price_in_egp': float(row['price_in_egp']) if pd.notna(row['price_in_egp']) else None,
            'number_of_bedrooms': int(row['number_of_bedrooms']) if pd.notna(row['number_of_bedrooms']) else None,
            'number_of_bathrooms': int(row['number_of_bathrooms']) if pd.notna(row['number_of_bathrooms']) else None,
        }
        records.append(record)
    
    print(f"🚀 Uploading {len(records)} records in batches of 100...")
    
    # Upload in small batches
    batch_size = 100
    success_count = 0
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        print(f"📤 Uploading batch {i//batch_size + 1}...")
        
        if upload_batch(batch):
            success_count += len(batch)
            print(f"✅ Success! Total uploaded: {success_count}")
        else:
            print(f"❌ Batch failed at record {i}")
            break
        
        time.sleep(0.5)  # Be nice to the server
    
    print(f"🎉 DONE! Uploaded {success_count} records!")

if __name__ == "__main__":
    main()
