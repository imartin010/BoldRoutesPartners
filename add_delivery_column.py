#!/usr/bin/env python3
"""
Script to add ready_by column to brdata_properties table and populate with sample delivery dates
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # Use service role key for table alterations

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing Supabase environment variables")
    print("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file")
    sys.exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def add_ready_by_column():
    """Add ready_by column to brdata_properties table"""
    try:
        print("🔧 Adding ready_by column to brdata_properties table...")
        
        # Add the column
        result = supabase.rpc('exec_sql', {
            'sql': 'ALTER TABLE brdata_properties ADD COLUMN IF NOT EXISTS ready_by TEXT;'
        }).execute()
        
        print("✅ Column added successfully!")
        
        # Create index for better performance
        print("🔧 Creating index for ready_by column...")
        supabase.rpc('exec_sql', {
            'sql': 'CREATE INDEX IF NOT EXISTS idx_brdata_properties_ready_by ON brdata_properties(ready_by);'
        }).execute()
        
        print("✅ Index created successfully!")
        
    except Exception as e:
        print(f"❌ Error adding column: {e}")
        return False
    
    return True

def populate_delivery_dates():
    """Populate ready_by column with sample delivery dates"""
    try:
        print("🔧 Populating delivery dates...")
        
        # Get total count of properties
        result = supabase.table('brdata_properties').select('id', count='exact').execute()
        total_count = result.count or 0
        
        print(f"📊 Total properties: {total_count}")
        
        if total_count == 0:
            print("⚠️  No properties found to update")
            return True
        
        # Update in batches to avoid timeouts
        batch_size = 1000
        updated_count = 0
        
        for offset in range(0, total_count, batch_size):
            # Get batch of properties
            result = supabase.table('brdata_properties')\
                .select('id')\
                .range(offset, offset + batch_size - 1)\
                .execute()
            
            if not result.data:
                break
            
            # Update each property with a delivery date
            for i, prop in enumerate(result.data):
                prop_id = prop['id']
                
                # Generate sample delivery dates based on ID
                delivery_date = generate_delivery_date(prop_id)
                
                # Update the property
                supabase.table('brdata_properties')\
                    .update({'ready_by': delivery_date})\
                    .eq('id', prop_id)\
                    .execute()
                
                updated_count += 1
            
            print(f"📝 Updated batch: {offset + 1} to {min(offset + batch_size, total_count)}")
        
        print(f"✅ Successfully updated {updated_count} properties with delivery dates!")
        
    except Exception as e:
        print(f"❌ Error populating delivery dates: {e}")
        return False
    
    return True

def generate_delivery_date(prop_id):
    """Generate a sample delivery year based on property ID"""
    # Use modulo to distribute years evenly
    mod = prop_id % 7
    
    if mod == 0:
        return 'Ready'
    elif mod == 1:
        return '2025'
    elif mod == 2:
        return '2026'
    elif mod == 3:
        return '2027'
    elif mod == 4:
        return '2028'
    elif mod == 5:
        return '2029'
    elif mod == 6:
        return '2030'

def verify_column():
    """Verify the column was added correctly"""
    try:
        print("🔍 Verifying column addition...")
        
        # Check if column exists
        result = supabase.rpc('exec_sql', {
            'sql': '''
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'brdata_properties' 
            AND column_name = 'ready_by';
            '''
        }).execute()
        
        if result.data:
            print("✅ Column verification successful!")
            print(f"Column details: {result.data}")
        else:
            print("❌ Column not found!")
            return False
            
    except Exception as e:
        print(f"❌ Error verifying column: {e}")
        return False
    
    return True

def main():
    """Main function to add column and populate data"""
    print("🚀 Starting delivery column setup...")
    
    # Step 1: Add the column
    if not add_ready_by_column():
        print("❌ Failed to add column. Exiting.")
        return
    
    # Step 2: Verify column was added
    if not verify_column():
        print("❌ Column verification failed. Exiting.")
        return
    
    # Step 3: Populate with sample data
    if not populate_delivery_dates():
        print("❌ Failed to populate delivery dates.")
        return
    
    print("🎉 Delivery column setup completed successfully!")
    print("You can now use the delivery filter in your inventory!")

if __name__ == "__main__":
    main()








