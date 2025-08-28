#!/usr/bin/env python3
"""Continue uploading from where we left off"""

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
        print(f"❌ Error {response.status_code}: {response.text[:200]}...")
        return False
    
    return True

def main():
    print("🔄 CONTINUING UPLOAD FROM RECORD 23,200...")
    
    # Read CSV
    print("📖 Reading CSV...")
    df = pd.read_csv("nawy_ALL_properties_20250826_005624.csv")
    print(f"✅ Found {len(df)} total records")
    
    # Skip the first 23,200 records that were already uploaded
    start_index = 23200
    remaining_df = df.iloc[start_index:]
    print(f"🚀 Uploading remaining {len(remaining_df)} records...")
    
    # Convert to simple records
    records = []
    for _, row in remaining_df.iterrows():
        record = {
            'nawy_id': int(row['id']) if pd.notna(row['id']) else None,
            'unit_id': str(row['unit_id']) if pd.notna(row['unit_id']) else None,
            'unit_area': float(row['unit_area']) if pd.notna(row['unit_area']) else None,
            'price_in_egp': float(row['price_in_egp']) if pd.notna(row['price_in_egp']) else None,
            'number_of_bedrooms': int(row['number_of_bedrooms']) if pd.notna(row['number_of_bedrooms']) else None,
            'number_of_bathrooms': int(row['number_of_bathrooms']) if pd.notna(row['number_of_bathrooms']) else None,
        }
        records.append(record)
    
    # Upload in small batches
    batch_size = 50  # Smaller batches to avoid timeouts
    success_count = 0
    total_uploaded = 23200  # Already uploaded
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        print(f"📤 Uploading batch {batch_num} (records {start_index + i + 1}-{start_index + i + len(batch)})...")
        
        if upload_batch(batch):
            success_count += len(batch)
            total_uploaded += len(batch)
            print(f"✅ Success! Total uploaded: {total_uploaded}")
        else:
            print(f"❌ Batch failed at record {start_index + i}")
            break
        
        time.sleep(1)  # Longer pause to be nice to the server
    
    print(f"🎉 FINAL TOTAL: {total_uploaded} records uploaded!")

if __name__ == "__main__":
    main()








