import pandas as pd
from supabase import create_client, Client
import json
import time
import numpy as np

# Your Supabase credentials
SUPABASE_URL = "https://mdqqqogshgtpzxtufjzn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXFxb2dzaGd0cHp4dHVmanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5MjUsImV4cCI6MjA3MTY5MjkyNX0.CmxAoMsKcjNWX3FIea-yfOHSD3lkEtw0vCFmDgVfgq8"

def convert_to_supabase_safe(row):
    """Convert a row to Supabase-safe format"""
    safe_row = {}
    
    for col, value in row.items():
        if pd.isna(value):
            # Handle NULL values
            if col in ['id', 'number_of_bedrooms', 'number_of_bathrooms']:
                safe_row[col] = 0
            elif col in ['unit_area', 'garden_area', 'roof_area', 'floor_number', 'price_per_meter', 'price_in_egp']:
                safe_row[col] = 0.0
            elif col in ['is_launch']:
                safe_row[col] = False
            else:
                safe_row[col] = None
        else:
            # Handle non-NULL values
            if col == 'id':
                safe_row[col] = int(value) if not pd.isna(value) else 0
            elif col in ['number_of_bedrooms', 'number_of_bathrooms']:
                safe_row[col] = int(value) if not pd.isna(value) else 0
            elif col in ['unit_area', 'garden_area', 'roof_area', 'floor_number', 'price_per_meter', 'price_in_egp']:
                # Convert to regular Python float, handle infinite values
                if np.isinf(value):
                    safe_row[col] = 0.0
                else:
                    safe_row[col] = float(value) if not pd.isna(value) else 0.0
            elif col == 'is_launch':
                safe_row[col] = bool(value) if not pd.isna(value) else False
            elif col in ['compound', 'area', 'developer', 'phase', 'property_type', 'payment_plans', 'offers']:
                # Ensure JSON fields are valid strings
                if isinstance(value, str):
                    safe_row[col] = value
                else:
                    safe_row[col] = str(value) if not pd.isna(value) else '{}'
            else:
                # Text fields
                safe_row[col] = str(value) if not pd.isna(value) else ''
    
    return safe_row

def import_csv_to_supabase():
    print("🚀 BRData CSV Import to Supabase (Safe Version)")
    print("=" * 60)
    
    try:
        # Initialize Supabase client
        print("🔌 Connecting to Supabase...")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected successfully!")
        
        # Read the CSV file
        csv_file = "brdata_processor/processed_data/brdata_properties_20250827_141439.csv"
        print(f"📖 Reading CSV: {csv_file}")
        df = pd.read_csv(csv_file)
        print(f"📊 Total rows: {len(df):,}")
        
        # Convert data to Supabase-safe format
        print("🔄 Converting data to Supabase-safe format...")
        safe_records = []
        
        for idx, row in df.iterrows():
            if idx % 1000 == 0:
                print(f"  Processing row {idx:,}/{len(df):,}")
            
            safe_row = convert_to_supabase_safe(row)
            safe_records.append(safe_row)
        
        print("✅ Data conversion completed!")
        
        # Process data in larger batches for speed
        batch_size = 1000  # Increased from 100 for faster import
        total_batches = (len(safe_records) + batch_size - 1) // batch_size
        
        print(f"📦 Processing in {total_batches} batches of {batch_size} records...")
        
        total_imported = 0
        
        for batch_num in range(total_batches):
            start_idx = batch_num * batch_size
            end_idx = min((batch_num + 1) * batch_size, len(safe_records))
            batch = safe_records[start_idx:end_idx]
            
            print(f"📤 Importing batch {batch_num + 1}/{total_batches} (rows {start_idx + 1}-{end_idx})...")
            
            try:
                # Insert batch into Supabase
                result = supabase.table('brdata_properties').insert(batch).execute()
                
                if hasattr(result, 'data') and result.data:
                    batch_count = len(result.data)
                    total_imported += batch_count
                    print(f"✅ Batch {batch_num + 1} imported: {batch_count} records")
                else:
                    print(f"⚠️  Batch {batch_num + 1} result unclear")
                
                # Minimal delay between batches for speed
                time.sleep(0.5)
                
            except Exception as e:
                print(f"❌ Error importing batch {batch_num + 1}: {str(e)}")
                # Try to continue with next batch
                continue
        
        print(f"\n🎉 Import completed!")
        print(f"📊 Total records imported: {total_imported:,}")
        print(f"📊 Expected records: {len(df):,}")
        
        # Verify the import
        print("\n🔍 Verifying import...")
        try:
            count_result = supabase.table('brdata_properties').select('id', count='exact').execute()
            if hasattr(count_result, 'count'):
                print(f"✅ Database count: {count_result.count:,}")
            else:
                print("⚠️  Could not verify count")
        except Exception as e:
            print(f"⚠️  Could not verify count: {str(e)}")
            
    except Exception as e:
        print(f"❌ Import failed: {str(e)}")
        print("💡 Make sure:")
        print("   • Your Supabase credentials are correct")
        print("   • The brdata_properties table exists")
        print("   • Your CSV file is accessible")

if __name__ == "__main__":
    import_csv_to_supabase()



import json
import time
import numpy as np

# Your Supabase credentials
SUPABASE_URL = "https://mdqqqogshgtpzxtufjzn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXFxb2dzaGd0cHp4dHVmanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5MjUsImV4cCI6MjA3MTY5MjkyNX0.CmxAoMsKcjNWX3FIea-yfOHSD3lkEtw0vCFmDgVfgq8"

def convert_to_supabase_safe(row):
    """Convert a row to Supabase-safe format"""
    safe_row = {}
    
    for col, value in row.items():
        if pd.isna(value):
            # Handle NULL values
            if col in ['id', 'number_of_bedrooms', 'number_of_bathrooms']:
                safe_row[col] = 0
            elif col in ['unit_area', 'garden_area', 'roof_area', 'floor_number', 'price_per_meter', 'price_in_egp']:
                safe_row[col] = 0.0
            elif col in ['is_launch']:
                safe_row[col] = False
            else:
                safe_row[col] = None
        else:
            # Handle non-NULL values
            if col == 'id':
                safe_row[col] = int(value) if not pd.isna(value) else 0
            elif col in ['number_of_bedrooms', 'number_of_bathrooms']:
                safe_row[col] = int(value) if not pd.isna(value) else 0
            elif col in ['unit_area', 'garden_area', 'roof_area', 'floor_number', 'price_per_meter', 'price_in_egp']:
                # Convert to regular Python float, handle infinite values
                if np.isinf(value):
                    safe_row[col] = 0.0
                else:
                    safe_row[col] = float(value) if not pd.isna(value) else 0.0
            elif col == 'is_launch':
                safe_row[col] = bool(value) if not pd.isna(value) else False
            elif col in ['compound', 'area', 'developer', 'phase', 'property_type', 'payment_plans', 'offers']:
                # Ensure JSON fields are valid strings
                if isinstance(value, str):
                    safe_row[col] = value
                else:
                    safe_row[col] = str(value) if not pd.isna(value) else '{}'
            else:
                # Text fields
                safe_row[col] = str(value) if not pd.isna(value) else ''
    
    return safe_row

def import_csv_to_supabase():
    print("🚀 BRData CSV Import to Supabase (Safe Version)")
    print("=" * 60)
    
    try:
        # Initialize Supabase client
        print("🔌 Connecting to Supabase...")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected successfully!")
        
        # Read the CSV file
        csv_file = "brdata_processor/processed_data/brdata_properties_20250827_141439.csv"
        print(f"📖 Reading CSV: {csv_file}")
        df = pd.read_csv(csv_file)
        print(f"📊 Total rows: {len(df):,}")
        
        # Convert data to Supabase-safe format
        print("🔄 Converting data to Supabase-safe format...")
        safe_records = []
        
        for idx, row in df.iterrows():
            if idx % 1000 == 0:
                print(f"  Processing row {idx:,}/{len(df):,}")
            
            safe_row = convert_to_supabase_safe(row)
            safe_records.append(safe_row)
        
        print("✅ Data conversion completed!")
        
        # Process data in larger batches for speed
        batch_size = 1000  # Increased from 100 for faster import
        total_batches = (len(safe_records) + batch_size - 1) // batch_size
        
        print(f"📦 Processing in {total_batches} batches of {batch_size} records...")
        
        total_imported = 0
        
        for batch_num in range(total_batches):
            start_idx = batch_num * batch_size
            end_idx = min((batch_num + 1) * batch_size, len(safe_records))
            batch = safe_records[start_idx:end_idx]
            
            print(f"📤 Importing batch {batch_num + 1}/{total_batches} (rows {start_idx + 1}-{end_idx})...")
            
            try:
                # Insert batch into Supabase
                result = supabase.table('brdata_properties').insert(batch).execute()
                
                if hasattr(result, 'data') and result.data:
                    batch_count = len(result.data)
                    total_imported += batch_count
                    print(f"✅ Batch {batch_num + 1} imported: {batch_count} records")
                else:
                    print(f"⚠️  Batch {batch_num + 1} result unclear")
                
                # Minimal delay between batches for speed
                time.sleep(0.5)
                
            except Exception as e:
                print(f"❌ Error importing batch {batch_num + 1}: {str(e)}")
                # Try to continue with next batch
                continue
        
        print(f"\n🎉 Import completed!")
        print(f"📊 Total records imported: {total_imported:,}")
        print(f"📊 Expected records: {len(df):,}")
        
        # Verify the import
        print("\n🔍 Verifying import...")
        try:
            count_result = supabase.table('brdata_properties').select('id', count='exact').execute()
            if hasattr(count_result, 'count'):
                print(f"✅ Database count: {count_result.count:,}")
            else:
                print("⚠️  Could not verify count")
        except Exception as e:
            print(f"⚠️  Could not verify count: {str(e)}")
            
    except Exception as e:
        print(f"❌ Import failed: {str(e)}")
        print("💡 Make sure:")
        print("   • Your Supabase credentials are correct")
        print("   • The brdata_properties table exists")
        print("   • Your CSV file is accessible")

if __name__ == "__main__":
    import_csv_to_supabase()


