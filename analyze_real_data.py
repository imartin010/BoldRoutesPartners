#!/usr/bin/env python3
"""Analyze the actual data structure in Supabase database"""

import requests
import json

# Your Supabase details
SUPABASE_URL = "https://mdqqqogshgtpzxtufjzn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXFxb2dzaGd0cHp4dHVmanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5MjUsImV4cCI6MjA3MTY5MjkyNX0.CmxAoMsKcjNWX3FIea-yfOHSD3lkEtw0vCFmDgVfgq8"

def analyze_database():
    """Get and analyze 10 real units from database"""
    print("🔍 ANALYZING REAL DATA IN SUPABASE DATABASE")
    print("=" * 60)
    
    url = f"{SUPABASE_URL}/rest/v1/nawy_properties"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Get 10 records
    params = {'limit': 10, 'offset': 0}
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"❌ Error {response.status_code}: {response.text}")
        return
    
    data = response.json()
    print(f"📊 Found {len(data)} records in database")
    print()
    
    # Analyze structure
    if data:
        print("🏗️ DATABASE STRUCTURE:")
        sample = data[0]
        for key, value in sample.items():
            value_type = type(value).__name__
            if value is None:
                status = "❌ NULL"
            elif value == "":
                status = "⚠️ EMPTY"
            else:
                status = "✅ HAS DATA"
            
            print(f"  {key:20} | {value_type:10} | {status:12} | {repr(value)[:50]}")
        
        print("\n" + "=" * 60)
        print("📋 10 SAMPLE UNITS:")
        print("=" * 60)
        
        for i, record in enumerate(data, 1):
            print(f"\n🏠 UNIT #{i}")
            print(f"  Nawy ID: {record.get('nawy_id')}")
            print(f"  Unit ID: {record.get('unit_id') or 'No Unit ID'}")
            print(f"  Area: {record.get('unit_area')} m²")
            print(f"  Bedrooms: {record.get('number_of_bedrooms')}")
            print(f"  Bathrooms: {record.get('number_of_bathrooms')}")
            print(f"  Price: {record.get('price_in_egp'):,.0f} EGP" if record.get('price_in_egp') else "Price: Not set")
            print(f"  Price/m²: {record.get('price_per_meter'):,.0f} EGP/m²" if record.get('price_per_meter') else "Price/m²: Not set")
            print(f"  Finishing: {record.get('finishing') or 'Not specified'}")
            print(f"  Launch: {'Yes' if record.get('is_launch') else 'No'}")
            print(f"  Image: {'Yes' if record.get('image') else 'No'}")
            
            # Check JSON fields
            compound = record.get('compound')
            area = record.get('area') 
            developer = record.get('developer')
            prop_type = record.get('property_type')
            
            print(f"  Compound: {compound if compound else 'Not set'}")
            print(f"  Area: {area if area else 'Not set'}")
            print(f"  Developer: {developer if developer else 'Not set'}")
            print(f"  Type: {prop_type if prop_type else 'Not set'}")
            
            if i >= 10:  # Show only 10
                break
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY:")
    print("=" * 60)
    
    # Count what we have
    has_basic = sum(1 for r in data if r.get('unit_area') and r.get('price_in_egp'))
    has_compound = sum(1 for r in data if r.get('compound'))
    has_area = sum(1 for r in data if r.get('area'))
    has_developer = sum(1 for r in data if r.get('developer'))
    has_unit_id = sum(1 for r in data if r.get('unit_id'))
    
    print(f"✅ Basic Data (area + price): {has_basic}/{len(data)} units")
    print(f"🏢 Compound Names: {has_compound}/{len(data)} units")
    print(f"📍 Area/Location: {has_area}/{len(data)} units") 
    print(f"🏗️ Developer Info: {has_developer}/{len(data)} units")
    print(f"🏷️ Unit IDs: {has_unit_id}/{len(data)} units")
    
    print(f"\n🎯 RECOMMENDATION:")
    if has_compound == 0:
        print("❌ JSON fields are missing - need to reimport with complete data")
        print("💡 Current data only has basic info: area, bedrooms, bathrooms, price")
    else:
        print("✅ JSON fields are present - can display full property details")

if __name__ == "__main__":
    analyze_database()








