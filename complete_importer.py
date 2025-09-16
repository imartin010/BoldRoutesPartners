#!/usr/bin/env python3
"""Complete importer with ALL CSV fields including JSON data"""

import pandas as pd
import requests
import json
import time

# Your Supabase details
SUPABASE_URL = "https://mdqqqogshgtpzxtufjzn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXFxb2dzaGd0cHp4dHVmanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5MjUsImV4cCI6MjA3MTY5MjkyNX0.CmxAoMsKcjNWX3FIea-yfOHSD3lkEtw0vCFmDgVfgq8"

def clean_json_field(field_value):
    """Convert CSV JSON string to proper JSON"""
    if pd.isna(field_value) or field_value == '' or field_value == 'nan':
        return None
    
    if isinstance(field_value, str):
        try:
            # Convert Python dict format to JSON
            clean_field = field_value.replace("'", '"')
            return json.loads(clean_field)
        except:
            return None
    
    return field_value

def transform_property_data(row):
    """Transform CSV row to database record with ALL fields"""
    return {
        'nawy_id': int(row['id']) if pd.notna(row['id']) else None,
        'unit_id': str(row['unit_id']) if pd.notna(row['unit_id']) else None,
        'unit_number': str(row['unit_number']) if pd.notna(row['unit_number']) else None,
        'unit_area': float(row['unit_area']) if pd.notna(row['unit_area']) else None,
        'number_of_bedrooms': int(row['number_of_bedrooms']) if pd.notna(row['number_of_bedrooms']) else None,
        'number_of_bathrooms': int(row['number_of_bathrooms']) if pd.notna(row['number_of_bathrooms']) else None,
        'price_per_meter': float(row['price_per_meter']) if pd.notna(row['price_per_meter']) else None,
        'price_in_egp': float(row['price_in_egp']) if pd.notna(row['price_in_egp']) else None,
        'currency': str(row['currency']) if pd.notna(row['currency']) else 'EGP',
        'finishing': str(row['finishing']) if pd.notna(row['finishing']) else None,
        'is_launch': bool(row['is_launch']) if pd.notna(row['is_launch']) else False,
        'image': str(row['image']) if pd.notna(row['image']) else None,
        # JSON fields
        'compound': clean_json_field(row['compound']),
        'area': clean_json_field(row['area']),
        'developer': clean_json_field(row['developer']),
        'property_type': clean_json_field(row['property_type']),
    }

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

def clear_existing_data():
    """Clear existing data"""
    print("🗑️ Clearing existing data...")
    url = f"{SUPABASE_URL}/rest/v1/nawy_properties"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Delete all records
    response = requests.delete(f"{url}?id=gte.1", headers=headers)
    if response.status_code == 204:
        print("✅ Existing data cleared")
    else:
        print(f"⚠️ Clear failed: {response.status_code}")

def main():
    print("🚀 COMPLETE IMPORTER WITH ALL FIELDS!")
    
    # Read CSV
    print("📖 Reading CSV...")
    df = pd.read_csv("nawy_ALL_properties_20250826_005624.csv")
    print(f"✅ Found {len(df)} records")
    
    # Clear existing data
    clear_existing_data()
    
    # Transform first few records to test
    print("🧪 Testing with first 100 records...")
    test_df = df.head(100)
    
    records = []
    for _, row in test_df.iterrows():
        record = transform_property_data(row)
        records.append(record)
    
    print(f"📊 Sample record:")
    print(json.dumps(records[0], indent=2, default=str))
    
    # Upload in small batches
    batch_size = 10
    success_count = 0
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        print(f"📤 Uploading batch {batch_num}...")
        
        if upload_batch(batch):
            success_count += len(batch)
            print(f"✅ Success! Total uploaded: {success_count}")
        else:
            print(f"❌ Batch failed at record {i}")
            break
        
        time.sleep(0.5)
    
    print(f"🎉 DONE! Uploaded {success_count} records with complete data!")

if __name__ == "__main__":
    main()















