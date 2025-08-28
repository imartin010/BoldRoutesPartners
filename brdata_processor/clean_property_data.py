#!/usr/bin/env python3
"""
BRData Property Processor
Clean and filter property data, removing resale/sold units and nawy references
"""

import pandas as pd
import os
import shutil
from datetime import datetime

def clean_property_data():
    """Process and clean property data"""
    
    # Input and output paths
    input_file = "nawy scraper ver 2/nawy_ALL_properties_20250826_005624.csv"
    output_dir = "brdata_processor/processed_data"
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    print("🏗️  BRData Property Processor")
    print("=" * 50)
    
    try:
        # Read the CSV file
        print(f"📖 Reading data from: {input_file}")
        df = pd.read_csv(input_file)
        
        print(f"📊 Total properties found: {len(df):,}")
        
        # Show available columns
        print("\n📋 Available columns:")
        for i, col in enumerate(df.columns, 1):
            print(f"  {i:2d}. {col}")
        
        # Check for sale_type column to filter out resale
        if 'sale_type' in df.columns:
            print(f"\n🔍 Sale types found:")
            sale_types = df['sale_type'].value_counts()
            for sale_type, count in sale_types.items():
                print(f"  - {sale_type}: {count:,} properties")
            
            # Filter out resale properties
            before_count = len(df)
            df = df[df['sale_type'] != 'resale']
            after_count = len(df)
            removed_count = before_count - after_count
            
            print(f"\n🗑️  Removed {removed_count:,} resale properties")
            print(f"✅ Clean properties remaining: {after_count:,}")
        
        # Check for any status columns that might indicate sold units
        status_columns = [col for col in df.columns if 'status' in col.lower() or 'available' in col.lower()]
        if status_columns:
            print(f"\n📋 Status columns found: {status_columns}")
            for col in status_columns:
                print(f"  {col} values: {df[col].value_counts().to_dict()}")
        
        # Generate clean filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_file = f"{output_dir}/brdata_properties_{timestamp}.csv"
        
        # Save cleaned data
        df.to_csv(output_file, index=False)
        
        print(f"\n💾 Saved clean data to: {output_file}")
        print(f"📊 Final property count: {len(df):,}")
        
        # Show first few rows to verify
        print(f"\n👀 First 3 properties preview:")
        print(df[['id', 'unit_id', 'sale_type'] if 'sale_type' in df.columns else df.columns[:3]].head(3).to_string())
        
        return output_file
        
    except Exception as e:
        print(f"❌ Error processing data: {e}")
        return None

if __name__ == "__main__":
    result = clean_property_data()
    if result:
        print(f"\n🎉 Success! Clean data saved to: {result}")
    else:
        print("\n💥 Failed to process data")



BRData Property Processor
Clean and filter property data, removing resale/sold units and nawy references
"""

import pandas as pd
import os
import shutil
from datetime import datetime

def clean_property_data():
    """Process and clean property data"""
    
    # Input and output paths
    input_file = "nawy scraper ver 2/nawy_ALL_properties_20250826_005624.csv"
    output_dir = "brdata_processor/processed_data"
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    print("🏗️  BRData Property Processor")
    print("=" * 50)
    
    try:
        # Read the CSV file
        print(f"📖 Reading data from: {input_file}")
        df = pd.read_csv(input_file)
        
        print(f"📊 Total properties found: {len(df):,}")
        
        # Show available columns
        print("\n📋 Available columns:")
        for i, col in enumerate(df.columns, 1):
            print(f"  {i:2d}. {col}")
        
        # Check for sale_type column to filter out resale
        if 'sale_type' in df.columns:
            print(f"\n🔍 Sale types found:")
            sale_types = df['sale_type'].value_counts()
            for sale_type, count in sale_types.items():
                print(f"  - {sale_type}: {count:,} properties")
            
            # Filter out resale properties
            before_count = len(df)
            df = df[df['sale_type'] != 'resale']
            after_count = len(df)
            removed_count = before_count - after_count
            
            print(f"\n🗑️  Removed {removed_count:,} resale properties")
            print(f"✅ Clean properties remaining: {after_count:,}")
        
        # Check for any status columns that might indicate sold units
        status_columns = [col for col in df.columns if 'status' in col.lower() or 'available' in col.lower()]
        if status_columns:
            print(f"\n📋 Status columns found: {status_columns}")
            for col in status_columns:
                print(f"  {col} values: {df[col].value_counts().to_dict()}")
        
        # Generate clean filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_file = f"{output_dir}/brdata_properties_{timestamp}.csv"
        
        # Save cleaned data
        df.to_csv(output_file, index=False)
        
        print(f"\n💾 Saved clean data to: {output_file}")
        print(f"📊 Final property count: {len(df):,}")
        
        # Show first few rows to verify
        print(f"\n👀 First 3 properties preview:")
        print(df[['id', 'unit_id', 'sale_type'] if 'sale_type' in df.columns else df.columns[:3]].head(3).to_string())
        
        return output_file
        
    except Exception as e:
        print(f"❌ Error processing data: {e}")
        return None

if __name__ == "__main__":
    result = clean_property_data()
    if result:
        print(f"\n🎉 Success! Clean data saved to: {result}")
    else:
        print("\n💥 Failed to process data")


