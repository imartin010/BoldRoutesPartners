import pandas as pd
import json
from supabase import create_client, Client
import os
from datetime import datetime
import time
import logging
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('property_import.log'),
        logging.StreamHandler()
    ]
)

# Supabase Configuration
SUPABASE_URL = "https://mdqqqogshgtpzxtufjzn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXFxb2dzaGd0cHp4dHVmanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5MjUsImV4cCI6MjA3MTY5MjkyNX0.CmxAoMsKcjNWX3FIea-yfOHSD3lkEtw0vCFmDgVfgq8"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def clean_json_field(field_value) -> Dict[str, Any] | None:
    """Clean and parse JSON fields from CSV"""
    if pd.isna(field_value) or field_value == '' or field_value == 'nan':
        return None
    
    try:
        if isinstance(field_value, str):
            # Handle string representation of dict/list
            field_value = field_value.replace("'", '"').replace('None', 'null').replace('True', 'true').replace('False', 'false')
            return json.loads(field_value)
        return field_value
    except Exception as e:
        logging.warning(f"Failed to parse JSON field: {field_value[:100]}... Error: {e}")
        return None

def safe_int_convert(value) -> int | None:
    """Safely convert value to integer"""
    if pd.isna(value) or value == '' or value == 'nan':
        return None
    try:
        return int(float(value))  # Convert through float first to handle decimal strings
    except (ValueError, TypeError):
        return None

def safe_float_convert(value) -> float | None:
    """Safely convert value to float"""
    if pd.isna(value) or value == '' or value == 'nan':
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def safe_str_convert(value) -> str | None:
    """Safely convert value to string"""
    if pd.isna(value) or value == '' or value == 'nan':
        return None
    return str(value).strip()

def safe_date_convert(value) -> str | None:
    """Safely convert date value"""
    if pd.isna(value) or value == '' or value == 'nan':
        return None
    try:
        # Handle different date formats
        if isinstance(value, str):
            # Try to parse and reformat
            from dateutil import parser
            parsed_date = parser.parse(value)
            return parsed_date.isoformat()
        return str(value)
    except:
        return None

def transform_property_data(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Transform CSV data to match database schema with enhanced error handling"""
    transformed_data = []
    errors = []
    
    logging.info(f"🔄 Transforming {len(df)} properties...")
    
    for index, row in df.iterrows():
        try:
            # Handle building_number specially (can be text like 'D24')
            building_number = safe_str_convert(row.get('building_number'))
            if building_number and building_number.replace('.', '').isdigit():
                # If it's purely numeric, keep as string but clean it
                building_number = str(int(float(building_number)))
            
            property_data = {
                # Basic property info
                'nawy_id': safe_int_convert(row.get('id')),
                'unit_id': safe_str_convert(row.get('unit_id')),
                'original_unit_id': safe_str_convert(row.get('original_unit_id')),
                'sale_type': safe_str_convert(row.get('sale_type')),
                'unit_number': safe_str_convert(row.get('unit_number')),
                
                # Property details
                'unit_area': safe_float_convert(row.get('unit_area')),
                'number_of_bedrooms': safe_int_convert(row.get('number_of_bedrooms')),
                'number_of_bathrooms': safe_int_convert(row.get('number_of_bathrooms')),
                'garden_area': safe_float_convert(row.get('garden_area')),
                'roof_area': safe_float_convert(row.get('roof_area')),
                'floor_number': safe_int_convert(row.get('floor_number')),
                'building_number': building_number,
                
                # Pricing
                'price_per_meter': safe_float_convert(row.get('price_per_meter')),
                'price_in_egp': safe_float_convert(row.get('price_in_egp')),
                'currency': safe_str_convert(row.get('currency')) or 'EGP',
                
                # Dates
                'ready_by': safe_date_convert(row.get('ready_by')),
                'last_inventory_update': safe_date_convert(row.get('last_inventory_update')),
                
                # Property status
                'finishing': safe_str_convert(row.get('finishing')),
                'is_launch': bool(row.get('is_launch', False)) if pd.notna(row.get('is_launch')) else False,
                
                # Media
                'image': safe_str_convert(row.get('image')),
                
                # JSON fields
                'payment_plans': clean_json_field(row.get('payment_plans')),
                'offers': clean_json_field(row.get('offers')),
                'compound': clean_json_field(row.get('compound')),
                'area': clean_json_field(row.get('area')),
                'developer': clean_json_field(row.get('developer')),
                'phase': clean_json_field(row.get('phase')),
                'property_type': clean_json_field(row.get('property_type')),
                
                # Control fields
                'is_active': True,
                'is_featured': False,
                'visibility_status': 'public',
                'priority_score': 0,
            }
            
            # Validate required fields
            if property_data['nawy_id'] is None:
                errors.append(f"Row {index}: Missing nawy_id")
                continue
                
            transformed_data.append(property_data)
            
            # Progress indicator
            if (index + 1) % 1000 == 0:
                logging.info(f"✅ Processed {index + 1:,}/{len(df):,} properties")
                
        except Exception as e:
            errors.append(f"Row {index}: {str(e)}")
            continue
    
    if errors:
        logging.warning(f"⚠️ {len(errors)} transformation errors occurred")
        # Log first 10 errors
        for error in errors[:10]:
            logging.warning(error)
        if len(errors) > 10:
            logging.warning(f"... and {len(errors) - 10} more errors")
    
    logging.info(f"✅ Successfully transformed {len(transformed_data):,} properties")
    return transformed_data

def test_connection() -> bool:
    """Test Supabase connection"""
    try:
        logging.info("🔗 Testing Supabase connection...")
        result = supabase.table('nawy_properties').select('count').execute()
        logging.info("✅ Supabase connection successful!")
        return True
    except Exception as e:
        logging.error(f"❌ Supabase connection failed: {e}")
        return False

def clear_existing_inventory() -> bool:
    """Clear existing inventory data with confirmation"""
    try:
        # First, get count of existing records
        result = supabase.table('nawy_properties').select('id', count='exact').execute()
        existing_count = result.count or 0
        
        if existing_count > 0:
            logging.warning(f"⚠️ Found {existing_count:,} existing records in inventory_items table")
            confirmation = input("❓ Do you want to clear existing data? (yes/no): ").lower().strip()
            
            if confirmation != 'yes':
                logging.info("❌ Import cancelled by user")
                return False
        
        logging.info("🗑️ Clearing existing inventory...")
        supabase.table('nawy_properties').delete().neq('id', 0).execute()
        logging.info("✅ Existing inventory cleared")
        return True
        
    except Exception as e:
        logging.error(f"❌ Error clearing inventory: {e}")
        return False

def batch_insert_properties(properties_data: List[Dict], batch_size: int = 500) -> int:
    """Insert properties in batches with retry logic"""
    total_properties = len(properties_data)
    successful_inserts = 0
    failed_batches = []
    
    logging.info(f"📊 Starting import of {total_properties:,} properties in batches of {batch_size}")
    
    for i in range(0, total_properties, batch_size):
        batch = properties_data[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (total_properties + batch_size - 1) // batch_size
        
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                logging.info(f"📤 Inserting batch {batch_num}/{total_batches} ({len(batch)} properties) - Attempt {retry_count + 1}")
                
                result = supabase.table('nawy_properties').insert(batch).execute()
                successful_inserts += len(batch)
                logging.info(f"✅ Batch {batch_num} completed successfully")
                break
                
            except Exception as e:
                retry_count += 1
                logging.error(f"❌ Batch {batch_num} attempt {retry_count} failed: {e}")
                
                if retry_count < max_retries:
                    wait_time = retry_count * 2  # Exponential backoff
                    logging.info(f"⏳ Waiting {wait_time} seconds before retry...")
                    time.sleep(wait_time)
                else:
                    logging.error(f"❌ Batch {batch_num} failed after {max_retries} attempts")
                    failed_batches.append(batch_num)
                    break
        
        # Small delay between batches to avoid rate limiting
        if batch_num % 10 == 0:  # Longer pause every 10 batches
            time.sleep(2)
        else:
            time.sleep(0.5)
    
    logging.info(f"🎉 Import completed!")
    logging.info(f"✅ Successfully imported: {successful_inserts:,}/{total_properties:,} properties")
    logging.info(f"📈 Success rate: {(successful_inserts/total_properties*100):.1f}%")
    
    if failed_batches:
        logging.warning(f"⚠️ Failed batches: {failed_batches}")
    
    return successful_inserts

def verify_import() -> None:
    """Verify the import was successful"""
    try:
        logging.info("🔍 Verifying import...")
        
        # Get total count
        result = supabase.table('nawy_properties').select('id', count='exact').execute()
        total_count = result.count or 0
        
        # Get sample data
        sample = supabase.table('nawy_properties').select('*').limit(5).execute()
        
        logging.info(f"📊 Total records in database: {total_count:,}")
        logging.info(f"📝 Sample records retrieved: {len(sample.data)}")
        
        # Test queries
        active_count = supabase.table('nawy_properties').select('id', count='exact').eq('is_active', True).execute()
        logging.info(f"✅ Active properties: {active_count.count:,}")
        
        # Test JSON queries
        compound_test = supabase.table('nawy_properties').select('compound').not_('compound', 'is', None).limit(1).execute()
        if compound_test.data:
            logging.info(f"🏢 Sample compound: {compound_test.data[0]['compound']}")
        
        logging.info("✅ Import verification completed successfully!")
        
    except Exception as e:
        logging.error(f"❌ Verification failed: {e}")

def main():
    print("🏠 Enhanced Nawy Property Database Importer")
    print("=" * 60)
    
    # Check if API key is set
    if SUPABASE_KEY == "YOUR_SUPABASE_ANON_KEY":
        print("❌ Please update SUPABASE_KEY in the script with your actual Supabase anon key!")
        print(f"🔗 Get it from: https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn/settings/api")
        return
    
    # Test connection
    if not test_connection():
        return
    
    # Load CSV data
    csv_file = "nawy_ALL_properties_20250826_005624.csv"
    
    if not os.path.exists(csv_file):
        logging.error(f"❌ CSV file '{csv_file}' not found!")
        return
    
    logging.info(f"📖 Loading data from {csv_file}...")
    try:
        # Load with specific encoding and error handling
        df = pd.read_csv(csv_file, encoding='utf-8', low_memory=False)
        logging.info(f"✅ Loaded {len(df):,} properties from CSV")
        logging.info(f"📋 Columns: {list(df.columns)}")
    except Exception as e:
        logging.error(f"❌ Error loading CSV: {e}")
        return
    
    # Transform data
    properties_data = transform_property_data(df)
    
    if not properties_data:
        logging.error("❌ No valid properties to import!")
        return
    
    # Clear existing data
    if not clear_existing_inventory():
        return
    
    # Import data
    successful_imports = batch_insert_properties(properties_data, batch_size=500)
    
    # Verify import
    if successful_imports > 0:
        verify_import()
    
    # Final summary
    print("\n" + "=" * 60)
    print("🎯 FINAL RESULTS:")
    print(f"📊 Total properties in CSV: {len(df):,}")
    print(f"🔄 Properties transformed: {len(properties_data):,}")
    print(f"✅ Successfully imported: {successful_imports:,}")
    print(f"📈 Success rate: {(successful_imports/len(df)*100):.1f}%")
    
    if successful_imports > 0:
        print(f"\n🔗 View your data:")
        print(f"   Database: https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn/editor")
        print(f"   Table: inventory_items")
        print(f"\n📝 Next steps:")
        print(f"   1. Copy supabase-property-queries.js to your main project")
        print(f"   2. Update your frontend to use the new inventory_items table")
        print(f"   3. Test the property search and filtering functionality")

if __name__ == "__main__":
    main()
