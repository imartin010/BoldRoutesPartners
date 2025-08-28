#!/usr/bin/env python3
"""Check what's actually in the Supabase database"""

import requests
import json

# Your Supabase details
SUPABASE_URL = "https://mdqqqogshgtpzxtufjzn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXFxb2dzaGd0cHp4dHVmanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5MjUsImV4cCI6MjA3MTY5MjkyNX0.CmxAoMsKcjNWX3FIea-yfOHSD3lkEtw0vCFmDgVfgq8"

def check_database():
    """Check what's in the database"""
    print("🔍 CHECKING SUPABASE DATABASE...")
    
    url = f"{SUPABASE_URL}/rest/v1/nawy_properties"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Get first 10 records
    params = {
        'limit': 10,
        'offset': 0
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"❌ Error {response.status_code}: {response.text}")
        return
    
    data = response.json()
    print(f"✅ Got {len(data)} records")
    print()
    
    for i, record in enumerate(data[:3], 1):  # Show first 3 in detail
        print(f"=== RECORD {i} ===")
        print(f"ID: {record.get('id')}")
        print(f"Nawy ID: {record.get('nawy_id')}")
        print(f"Unit ID: {record.get('unit_id')}")
        print(f"Unit Area: {record.get('unit_area')}")
        print(f"Bedrooms: {record.get('number_of_bedrooms')}")
        print(f"Bathrooms: {record.get('number_of_bathrooms')}")
        print(f"Price: {record.get('price_in_egp')}")
        print(f"Finishing: {record.get('finishing')}")
        print()
        print("JSON FIELDS:")
        print(f"Compound: {repr(record.get('compound'))}")
        print(f"Area: {repr(record.get('area'))}")
        print(f"Developer: {repr(record.get('developer'))}")
        print(f"Property Type: {repr(record.get('property_type'))}")
        print()
        
        # Try to parse compound
        compound = record.get('compound')
        if compound:
            print(f"Compound type: {type(compound)}")
            if isinstance(compound, str):
                print("Trying to parse compound...")
                try:
                    clean = compound.replace("'", '"')
                    parsed = json.loads(clean)
                    print(f"✅ Parsed compound: {parsed}")
                    print(f"Compound name: {parsed.get('name')}")
                except Exception as e:
                    print(f"❌ Parse failed: {e}")
        print("-" * 50)

if __name__ == "__main__":
    check_database()








