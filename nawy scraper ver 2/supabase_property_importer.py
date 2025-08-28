import pandas as pd
import json
from supabase import create_client, Client
import os
from datetime import datetime

# Supabase Configuration
SUPABASE_URL = "https://mdqqqogshgtpzxtufjzn.supabase.co"  # Your project URL
SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY"  # Replace with your anon key

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def clean_json_field(field_value):
    """Clean and parse JSON fields from CSV"""
    if pd.isna(field_value) or field_value == '':
        return None
    
    try:
        # Handle string representation of dict/list
        if isinstance(field_value, str):
            # Replace single quotes with double quotes for valid JSON
            field_value = field_value.replace("'", '"').replace('None', 'null').replace('True', 'true').replace('False', 'false')
            return json.loads(field_value)
        return field_value
    except:
        return None

def transform_property_data(df):
    """Transform CSV data to match database schema"""
    transformed_data = []
    
    for _, row in df.iterrows():
        property_data = {
            # Basic property info
            'nawy_id': int(row['id']) if pd.notna(row['id']) else None,
            'unit_id': row['unit_id'] if pd.notna(row['unit_id']) and row['unit_id'] != '' else None,
            'original_unit_id': row['original_unit_id'] if pd.notna(row['original_unit_id']) and row['original_unit_id'] != '' else None,
            'sale_type': row['sale_type'] if pd.notna(row['sale_type']) else None,
            'unit_number': row['unit_number'] if pd.notna(row['unit_number']) else None,
            
            # Property details
            'unit_area': float(row['unit_area']) if pd.notna(row['unit_area']) else None,
            'number_of_bedrooms': int(row['number_of_bedrooms']) if pd.notna(row['number_of_bedrooms']) else None,
            'number_of_bathrooms': int(row['number_of_bathrooms']) if pd.notna(row['number_of_bathrooms']) else None,
            'garden_area': float(row['garden_area']) if pd.notna(row['garden_area']) else None,
            'roof_area': float(row['roof_area']) if pd.notna(row['roof_area']) else None,
            'floor_number': int(row['floor_number']) if pd.notna(row['floor_number']) else None,
            'building_number': int(row['building_number']) if pd.notna(row['building_number']) else None,
            
            # Pricing
            'price_per_meter': float(row['price_per_meter']) if pd.notna(row['price_per_meter']) else None,
            'price_in_egp': float(row['price_in_egp']) if pd.notna(row['price_in_egp']) else None,
            'currency': row['currency'] if pd.notna(row['currency']) else 'EGP',
            
            # Dates
            'ready_by': row['ready_by'] if pd.notna(row['ready_by']) else None,
            'last_inventory_update': row['last_inventory_update'] if pd.notna(row['last_inventory_update']) else None,
            
            # Property status
            'finishing': row['finishing'] if pd.notna(row['finishing']) else None,
            'is_launch': bool(row['is_launch']) if pd.notna(row['is_launch']) else False,
            
            # Media
            'image': row['image'] if pd.notna(row['image']) and row['image'] != '' else None,
            
            # JSON fields
            'payment_plans': clean_json_field(row['payment_plans']),
            'offers': clean_json_field(row['offers']),
            'compound': clean_json_field(row['compound']),
            'area': clean_json_field(row['area']),
            'developer': clean_json_field(row['developer']),
            'phase': clean_json_field(row['phase']),
            'property_type': clean_json_field(row['property_type']),
            
            # Control fields for visibility/management
            'is_active': True,  # Default to active
            'is_featured': False,  # Default to not featured
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
        }
        
        transformed_data.append(property_data)
    
    return transformed_data

def clear_existing_inventory():
    """Clear existing inventory data"""
    print("🗑️ Clearing existing inventory...")
    try:
        result = supabase.table('inventory_items').delete().neq('id', 0).execute()
        print(f"✅ Cleared existing inventory")
        return True
    except Exception as e:
        print(f"❌ Error clearing inventory: {e}")
        return False

def batch_insert_properties(properties_data, batch_size=1000):
    """Insert properties in batches to avoid timeout"""
    total_properties = len(properties_data)
    successful_inserts = 0
    
    print(f"📊 Starting import of {total_properties:,} properties...")
    
    for i in range(0, total_properties, batch_size):
        batch = properties_data[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (total_properties + batch_size - 1) // batch_size
        
        try:
            print(f"📤 Inserting batch {batch_num}/{total_batches} ({len(batch)} properties)...")
            result = supabase.table('inventory_items').insert(batch).execute()
            successful_inserts += len(batch)
            print(f"✅ Batch {batch_num} completed successfully")
            
        except Exception as e:
            print(f"❌ Error in batch {batch_num}: {e}")
            # Continue with next batch instead of stopping
            continue
    
    print(f"🎉 Import completed! {successful_inserts:,}/{total_properties:,} properties imported successfully")
    return successful_inserts

def main():
    print("🏠 Nawy Property Database Importer")
    print("=" * 50)
    
    # Load the CSV data
    csv_file = "nawy_ALL_properties_20250826_005624.csv"
    
    if not os.path.exists(csv_file):
        print(f"❌ CSV file '{csv_file}' not found!")
        return
    
    print(f"📖 Loading data from {csv_file}...")
    try:
        df = pd.read_csv(csv_file)
        print(f"✅ Loaded {len(df):,} properties from CSV")
    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
        return
    
    # Transform data
    print("🔄 Transforming data for database...")
    properties_data = transform_property_data(df)
    print(f"✅ Transformed {len(properties_data):,} properties")
    
    # Clear existing inventory
    if not clear_existing_inventory():
        return
    
    # Import new data
    successful_imports = batch_insert_properties(properties_data)
    
    print("\n" + "=" * 50)
    print(f"🎯 FINAL RESULTS:")
    print(f"📊 Total properties processed: {len(df):,}")
    print(f"✅ Successfully imported: {successful_imports:,}")
    print(f"📈 Success rate: {(successful_imports/len(df)*100):.1f}%")
    
    if successful_imports > 0:
        print(f"\n🔗 View your data: {SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/database/tables")

if __name__ == "__main__":
    main()
