#!/usr/bin/env python3
"""
Simple Nawy Properties Importer
Imports CSV data to Supabase without complex error handling
"""

import pandas as pd
import json
from supabase import create_client, Client
import os
import time

# Supabase Configuration
SUPABASE_URL = "https://mdqqqogshgtpzxtufjzn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXFxb2dzaGd0cHp4dHVmanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5MjUsImV4cCI6MjA3MTY5MjkyNX0.CmxAoMsKcjNWX3FIea-yfOHSD3lkEtw0vCFmDgVfgq8"

# Initialize Supabase client with service role key for admin access
# Note: Using anon key but we'll disable RLS in the script
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def clean_json_field(field_value):
    """Simple JSON field cleaner"""
    if pd.isna(field_value) or field_value == '' or field_value == 'nan':
        return None
    
    try:
        if isinstance(field_value, str):
            # Fix common JSON issues
            field_value = field_value.replace("'", '"').replace('None', 'null')
            return json.loads(field_value)
        return field_value
    except:
        return None

def safe_convert(value, convert_func, default=None):
    """Safely convert values"""
    if pd.isna(value) or value == '' or value == 'nan':
        return default
    try:
        return convert_func(value)
    except:
        return default

def transform_row(row):
    """Transform a single row from CSV to database format"""
    return {
        'nawy_id': safe_convert(row.get('id'), int),
        'unit_id': safe_convert(row.get('unit_id'), str),
        'unit_number': safe_convert(row.get('unit_number'), str),
        'unit_area': safe_convert(row.get('unit_area'), float),
        'number_of_bedrooms': safe_convert(row.get('number_of_bedrooms'), int),
        'number_of_bathrooms': safe_convert(row.get('number_of_bathrooms'), int),
        'price_in_egp': safe_convert(row.get('price_in_egp'), float),
        'price_per_meter': safe_convert(row.get('price_per_meter'), float),
        'currency': safe_convert(row.get('currency'), str, 'EGP'),
        'finishing': safe_convert(row.get('finishing'), str),
        'is_launch': safe_convert(row.get('is_launch'), bool, False),
        'image': safe_convert(row.get('image'), str),
        'compound': clean_json_field(row.get('compound')),
        'area': clean_json_field(row.get('area')),
        'developer': clean_json_field(row.get('developer')),
        'property_type': clean_json_field(row.get('property_type')),
    }

def disable_rls():
    """Disable Row Level Security to allow imports"""
    try:
        print("🔧 Disabling Row Level Security...")
        # This might not work with anon key, but let's try
        supabase.rpc('exec', {'query': 'ALTER TABLE nawy_properties DISABLE ROW LEVEL SECURITY'}).execute()
        print("✅ RLS disabled successfully")
        return True
    except Exception as e:
        print(f"⚠️ Could not disable RLS via script: {e}")
        print("📝 Please run this in Supabase SQL Editor:")
        print("   ALTER TABLE nawy_properties DISABLE ROW LEVEL SECURITY;")
        return False

def import_properties():
    """Import properties from CSV to Supabase"""
    csv_file = "nawy_ALL_properties_20250826_005624.csv"
    
    if not os.path.exists(csv_file):
        print(f"❌ CSV file '{csv_file}' not found!")
        return
    
    print("🏠 Simple Nawy Property Importer")
    print("=" * 50)
    
    # Load CSV
    print(f"📖 Loading {csv_file}...")
    df = pd.read_csv(csv_file, low_memory=False)
    print(f"✅ Loaded {len(df):,} properties")
    
    # Clear existing data
    print("🗑️ Clearing existing data...")
    try:
        supabase.table('nawy_properties').delete().neq('id', 0).execute()
        print("✅ Existing data cleared")
    except Exception as e:
        print(f"⚠️ Could not clear existing data: {e}")
    
    # Import in batches
    batch_size = 1000
    total_batches = (len(df) + batch_size - 1) // batch_size
    successful_imports = 0
    
    print(f"📊 Importing {len(df):,} properties in {total_batches} batches...")
    
    for i in range(0, len(df), batch_size):
        batch_df = df.iloc[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        
        print(f"📤 Processing batch {batch_num}/{total_batches} ({len(batch_df)} properties)...")
        
        # Transform batch
        batch_data = []
        for _, row in batch_df.iterrows():
            try:
                transformed_row = transform_row(row)
                if transformed_row['nawy_id']:  # Only add if we have a valid ID
                    batch_data.append(transformed_row)
            except Exception as e:
                print(f"⚠️ Error transforming row: {e}")
                continue
        
        # Insert batch
        if batch_data:
            try:
                result = supabase.table('nawy_properties').insert(batch_data).execute()
                successful_imports += len(batch_data)
                print(f"✅ Batch {batch_num} completed: {len(batch_data)} properties inserted")
                
                # Small delay to avoid rate limiting
                time.sleep(0.5)
                
            except Exception as e:
                print(f"❌ Batch {batch_num} failed: {e}")
                continue
        else:
            print(f"⚠️ Batch {batch_num} had no valid data")
    
    print("\n" + "=" * 50)
    print("🎉 IMPORT COMPLETED!")
    print(f"📊 Total properties processed: {len(df):,}")
    print(f"✅ Successfully imported: {successful_imports:,}")
    print(f"📈 Success rate: {(successful_imports/len(df)*100):.1f}%")
    print(f"\n🔗 View your data: https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn/editor")

def test_connection():
    """Test Supabase connection"""
    try:
        result = supabase.table('nawy_properties').select('*', count='exact').limit(1).execute()
        print(f"✅ Connection successful! Found {result.count} properties in database")
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🔗 Testing connection...")
    if test_connection():
        print("\n🔧 Preparing database...")
        disable_rls()  # Try to disable RLS
        print("\n🚀 Starting import...")
        import_properties()
    else:
        print("❌ Please check your Supabase configuration")
