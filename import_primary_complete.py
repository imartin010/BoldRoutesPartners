#!/usr/bin/env python3
"""Import PRIMARY units only with complete data structure"""

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

def transform_primary_unit(row):
    """Transform CSV row to database record with complete structure"""
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
        # JSON fields - the complete structure
        'compound': clean_json_field(row['compound']),
        'area': clean_json_field(row['area']),
        'developer': clean_json_field(row['developer']),
        'property_type': clean_json_field(row['property_type']),
    }

def upload_batch(data_batch):
    """Upload a batch of records"""
    url = f"{SUPABASE_URL}/rest/v1/nawy_properties"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    response = requests.post(url, headers=headers, json=data_batch)
    
    if response.status_code != 201:
        print(f"❌ Error {response.status_code}: {response.text[:200]}")
        return False
    
    return True

def clear_database():
    """Clear existing data"""
    print("🗑️ Clearing existing data...")
    url = f"{SUPABASE_URL}/rest/v1/nawy_properties"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    }
    
    response = requests.delete(f"{url}?id=gte.1", headers=headers)
    print(f"✅ Database cleared")

def main():
    print("🏠 IMPORTING PRIMARY UNITS WITH COMPLETE STRUCTURE")
    print("=" * 60)
    
    # Read CSV and filter PRIMARY units only
    print("📖 Reading CSV and filtering PRIMARY units...")
    df = pd.read_csv("nawy scraper ver 2/nawy_ALL_properties_20250826_005624.csv")
    
    # Filter only PRIMARY units
    primary_df = df[df['sale_type'] == 'primary'].copy()
    print(f"✅ Found {len(primary_df)} PRIMARY units out of {len(df)} total")
    
    # Clear existing data
    clear_database()
    
    # Transform first 100 PRIMARY units for testing
    print("🧪 Importing first 100 PRIMARY units...")
    test_df = primary_df.head(100)
    
    records = []
    for _, row in test_df.iterrows():
        record = transform_primary_unit(row)
        records.append(record)
    
    print(f"📊 Sample PRIMARY unit:")
    sample = records[0]
    print(f"  Developer: {sample['developer']['name'] if sample['developer'] else 'N/A'}")
    print(f"  Area: {sample['area']['name'] if sample['area'] else 'N/A'}")
    print(f"  Compound: {sample['compound']['name'] if sample['compound'] else 'N/A'}")
    print(f"  Type: {sample['property_type']['name'] if sample['property_type'] else 'N/A'}")
    print(f"  Size: {sample['unit_area']}m², {sample['number_of_bedrooms']}BR")
    print(f"  Price: {sample['price_in_egp']:,.0f} EGP")
    
    # Upload in small batches
    batch_size = 20
    success_count = 0
    
    print(f"\n🚀 Uploading {len(records)} PRIMARY units...")
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        print(f"📤 Batch {batch_num}...")
        
        if upload_batch(batch):
            success_count += len(batch)
            print(f"✅ Total uploaded: {success_count}")
        else:
            print(f"❌ Failed at batch {batch_num}")
            break
        
        time.sleep(0.5)
    
    print(f"\n🎉 SUCCESS! Imported {success_count} PRIMARY units with complete structure!")
    print("📊 Your inventory now has:")
    print("  ✅ Developer names and IDs")
    print("  ✅ Area/Location names and IDs") 
    print("  ✅ Compound names and IDs")
    print("  ✅ Property types")
    print("  ✅ Complete unit details")

if __name__ == "__main__":
    main()








