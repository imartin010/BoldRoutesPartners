#!/usr/bin/env python3
"""Import ALL PRIMARY units with payment data"""

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
            # Handle Python dict format with None values
            clean_field = field_value.replace("'", '"')
            clean_field = clean_field.replace(': None', ': null')
            clean_field = clean_field.replace(':None', ': null')
            return json.loads(clean_field)
        except:
            return None
    
    return field_value

def extract_payment_info(payment_plans_raw):
    """Extract payment information from payment plans"""
    if not payment_plans_raw:
        return None, None, None, None
    
    try:
        payment_plans = clean_json_field(payment_plans_raw)
        if not payment_plans or not isinstance(payment_plans, list) or len(payment_plans) == 0:
            return None, None, None, None
        
        # Take the first payment plan
        plan = payment_plans[0]
        
        down_payment_value = plan.get('down_payment_value')
        down_payment_percent = plan.get('down_payment')
        monthly_installment = plan.get('equal_installments_value')
        years = plan.get('years')
        
        return down_payment_value, down_payment_percent, monthly_installment, years
    except:
        return None, None, None, None

def transform_unit_with_payments(row):
    """Transform CSV row including payment data"""
    # Extract payment info
    down_payment_value, down_payment_percent, monthly_installment, years = extract_payment_info(row['payment_plans'])
    
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
        # Payment fields
        'payment_plans': clean_json_field(row['payment_plans']),
        'down_payment_value': down_payment_value,
        'down_payment_percent': down_payment_percent,
        'monthly_installment': monthly_installment,
        'payment_years': years,
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
    print("🚀 IMPORTING ALL PRIMARY UNITS WITH PAYMENT PLANS")
    print("=" * 60)
    
    # Read CSV and filter PRIMARY units only
    print("📖 Reading CSV and filtering PRIMARY units...")
    df = pd.read_csv("nawy scraper ver 2/nawy_ALL_properties_20250826_005624.csv", low_memory=False)
    
    # Filter only PRIMARY units
    primary_df = df[df['sale_type'] == 'primary'].copy()
    print(f"✅ Found {len(primary_df)} PRIMARY units out of {len(df)} total")
    
    # Clear existing data
    clear_database()
    
    # Transform ALL PRIMARY units
    print(f"🔄 Processing ALL {len(primary_df)} PRIMARY units...")
    records = []
    payment_count = 0
    
    for _, row in primary_df.iterrows():
        record = transform_unit_with_payments(row)
        records.append(record)
        
        if record['down_payment_value'] or record['monthly_installment']:
            payment_count += 1
    
    print(f"💳 Units with payment data: {payment_count}/{len(records)}")
    
    # Upload in batches
    batch_size = 100  # Larger batches for efficiency
    success_count = 0
    total_batches = (len(records) + batch_size - 1) // batch_size
    
    print(f"\n🚀 Uploading {len(records)} PRIMARY units in {total_batches} batches...")
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        
        print(f"📤 Batch {batch_num}/{total_batches} ({len(batch)} units)...")
        
        if upload_batch(batch):
            success_count += len(batch)
            print(f"✅ Progress: {success_count}/{len(records)} ({(success_count/len(records)*100):.1f}%)")
        else:
            print(f"❌ Failed at batch {batch_num}")
            print(f"💾 Successfully imported {success_count} units before error")
            break
        
        # Small delay to avoid overwhelming the server
        time.sleep(0.2)
    
    print(f"\n🎉 SUCCESS! Imported {success_count} PRIMARY units with payment plans!")
    print(f"📊 Coverage: {(success_count/len(primary_df)*100):.1f}% of all PRIMARY units")

if __name__ == "__main__":
    main()








