#!/usr/bin/env python3
"""Analyze the data structure and create a comprehensive data map"""

import pandas as pd
import json
from collections import defaultdict

def parse_json_field(field):
    """Parse JSON field from CSV"""
    if pd.isna(field) or field == '':
        return None
    try:
        # Convert Python dict format to JSON
        clean_field = str(field).replace("'", '"')
        return json.loads(clean_field)
    except:
        return None

def analyze_data_structure():
    print("🗺️ CREATING DATA STRUCTURE MAP")
    print("=" * 60)
    
    # Read sample of CSV
    df = pd.read_csv('nawy scraper ver 2/nawy_ALL_properties_20250826_005624.csv', nrows=10000)
    print(f"📊 Analyzing {len(df)} records...")
    print()
    
    # Parse JSON fields
    df['compound_parsed'] = df['compound'].apply(parse_json_field)
    df['area_parsed'] = df['area'].apply(parse_json_field)
    df['developer_parsed'] = df['developer'].apply(parse_json_field)
    df['property_type_parsed'] = df['property_type'].apply(parse_json_field)
    df['phase_parsed'] = df['phase'].apply(parse_json_field)
    
    print("🏗️ DATA STRUCTURE HIERARCHY:")
    print("=" * 60)
    
    # Create hierarchical structure
    structure = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(list))))
    
    for _, row in df.iterrows():
        developer = row['developer_parsed']
        area = row['area_parsed'] 
        compound = row['compound_parsed']
        prop_type = row['property_type_parsed']
        phase = row['phase_parsed']
        
        dev_name = developer['name'] if developer else 'Unknown Developer'
        dev_id = developer['id'] if developer else 0
        
        area_name = area['name'] if area else 'Unknown Area'
        area_id = area['id'] if area else 0
        
        compound_name = compound['name'] if compound else 'Unknown Compound'
        compound_id = compound['id'] if compound else 0
        
        prop_type_name = prop_type['name'] if prop_type else 'Unknown Type'
        
        phase_name = phase['name'] if phase else 'No Phase'
        
        structure[f"{dev_name} (ID:{dev_id})"][f"{area_name} (ID:{area_id})"][f"{compound_name} (ID:{compound_id})"][prop_type_name].append({
            'unit_id': row['unit_id'],
            'nawy_id': row['id'],
            'area': row['unit_area'],
            'bedrooms': row['number_of_bedrooms'],
            'price': row['price_in_egp'],
            'sale_type': row['sale_type'],
            'phase': phase_name
        })
    
    # Display structure
    for dev_name, areas in list(structure.items())[:3]:  # Show first 3 developers
        print(f"\n🏢 DEVELOPER: {dev_name}")
        
        for area_name, compounds in list(areas.items())[:2]:  # Show first 2 areas per dev
            print(f"  📍 AREA: {area_name}")
            
            for compound_name, prop_types in list(compounds.items())[:2]:  # Show first 2 compounds per area
                print(f"    🏘️ COMPOUND: {compound_name}")
                
                for prop_type, units in prop_types.items():
                    unit_count = len(units)
                    sample_unit = units[0] if units else {}
                    print(f"      🏠 TYPE: {prop_type} ({unit_count} units)")
                    if sample_unit:
                        print(f"         Sample: {sample_unit.get('area')}m², {sample_unit.get('bedrooms')}BR, {sample_unit.get('price', 0):,.0f} EGP")
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY STATISTICS:")
    print("=" * 60)
    
    # Count unique entities
    developers = df['developer_parsed'].dropna().apply(lambda x: f"{x['name']} (ID:{x['id']})").nunique()
    areas = df['area_parsed'].dropna().apply(lambda x: f"{x['name']} (ID:{x['id']})").nunique()
    compounds = df['compound_parsed'].dropna().apply(lambda x: f"{x['name']} (ID:{x['id']})").nunique()
    prop_types = df['property_type_parsed'].dropna().apply(lambda x: x['name']).nunique()
    
    print(f"🏢 Developers: {developers}")
    print(f"📍 Areas: {areas}")
    print(f"🏘️ Compounds: {compounds}")
    print(f"🏠 Property Types: {prop_types}")
    
    print("\n" + "=" * 60)
    print("🔢 CODE STRUCTURE:")
    print("=" * 60)
    
    # Show code ranges
    dev_ids = [x['id'] for x in df['developer_parsed'].dropna() if x]
    area_ids = [x['id'] for x in df['area_parsed'].dropna() if x]
    compound_ids = [x['id'] for x in df['compound_parsed'].dropna() if x]
    
    if dev_ids:
        print(f"Developer IDs: {min(dev_ids)} - {max(dev_ids)} (Range: {max(dev_ids)-min(dev_ids)+1})")
    if area_ids:
        print(f"Area IDs: {min(area_ids)} - {max(area_ids)} (Range: {max(area_ids)-min(area_ids)+1})")
    if compound_ids:
        print(f"Compound IDs: {min(compound_ids)} - {max(compound_ids)} (Range: {max(compound_ids)-min(compound_ids)+1})")
    
    print("\n" + "=" * 60)
    print("🎯 TOP DEVELOPERS BY UNIT COUNT:")
    print("=" * 60)
    
    dev_counts = df['developer_parsed'].dropna().apply(lambda x: x['name']).value_counts().head(5)
    for dev, count in dev_counts.items():
        print(f"{dev:30} | {count:4} units")
    
    print("\n" + "=" * 60)
    print("🎯 TOP AREAS BY UNIT COUNT:")
    print("=" * 60)
    
    area_counts = df['area_parsed'].dropna().apply(lambda x: x['name']).value_counts().head(5)
    for area, count in area_counts.items():
        print(f"{area:30} | {count:4} units")
    
    print("\n" + "=" * 60)
    print("🎯 TOP COMPOUNDS BY UNIT COUNT:")
    print("=" * 60)
    
    compound_counts = df['compound_parsed'].dropna().apply(lambda x: x['name']).value_counts().head(5)
    for compound, count in compound_counts.items():
        print(f"{compound:30} | {count:4} units")

if __name__ == "__main__":
    analyze_data_structure()












