#!/usr/bin/env python3
"""
Quick test script to verify the property import was successful
Run this after importing your data to ensure everything works correctly
"""

from supabase import create_client, Client
import json

# Supabase Configuration
SUPABASE_URL = "https://mdqqqogshgtpzxtufjzn.supabase.co"
SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY"  # Replace with your actual key

def test_import():
    """Test the imported property data"""
    print("🧪 Testing Nawy Property Import")
    print("=" * 50)
    
    # Initialize client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Test 1: Basic count
        print("📊 Test 1: Getting total property count...")
        result = supabase.table('nawy_properties').select('id', count='exact').execute()
        total_count = result.count
        print(f"✅ Total properties: {total_count:,}")
        
        if total_count < 30000:
            print("⚠️  Warning: Expected ~34,000 properties, got fewer than expected")
        
        # Test 2: Active properties
        print("\n🔍 Test 2: Checking active properties...")
        active_result = supabase.table('nawy_properties').select('id', count='exact').eq('is_active', True).execute()
        active_count = active_result.count
        print(f"✅ Active properties: {active_count:,}")
        
        # Test 3: Sample data structure
        print("\n📋 Test 3: Checking data structure...")
        sample = supabase.table('nawy_properties').select('*').limit(1).execute()
        if sample.data:
            property_sample = sample.data[0]
            print(f"✅ Sample property ID: {property_sample.get('nawy_id')}")
            print(f"✅ Has compound data: {'compound' in property_sample and property_sample['compound'] is not None}")
            print(f"✅ Has pricing: {'price_in_egp' in property_sample and property_sample['price_in_egp'] is not None}")
            print(f"✅ Has area data: {'area' in property_sample and property_sample['area'] is not None}")
        
        # Test 4: JSON field parsing
        print("\n🔧 Test 4: Testing JSON field queries...")
        compound_test = supabase.table('nawy_properties').select('compound').not_('compound', 'is', None).limit(1).execute()
        if compound_test.data and compound_test.data[0]['compound']:
            compound_name = compound_test.data[0]['compound'].get('name', 'N/A')
            print(f"✅ Sample compound: {compound_name}")
        
        # Test 5: Price range
        print("\n💰 Test 5: Checking price ranges...")
        price_test = supabase.table('nawy_properties').select('price_in_egp').not_('price_in_egp', 'is', None).order('price_in_egp', ascending=True).limit(1).execute()
        if price_test.data:
            min_price = price_test.data[0]['price_in_egp']
            print(f"✅ Min price found: {min_price:,.0f} EGP")
        
        price_test_max = supabase.table('nawy_properties').select('price_in_egp').not_('price_in_egp', 'is', None).order('price_in_egp', ascending=False).limit(1).execute()
        if price_test_max.data:
            max_price = price_test_max.data[0]['price_in_egp']
            print(f"✅ Max price found: {max_price:,.0f} EGP")
        
        # Test 6: Search functionality
        print("\n🔍 Test 6: Testing search functionality...")
        search_test = supabase.table('nawy_properties').select('compound, area').eq('is_active', True).limit(100).execute()
        if search_test.data:
            compounds = [item['compound']['name'] for item in search_test.data if item['compound'] and item['compound'].get('name')]
            unique_compounds = list(set(compounds))
            print(f"✅ Found {len(unique_compounds)} unique compounds in sample")
            if unique_compounds:
                print(f"✅ Sample compounds: {', '.join(unique_compounds[:3])}")
        
        # Test 7: Index performance (basic timing)
        print("\n⚡ Test 7: Testing query performance...")
        import time
        start_time = time.time()
        perf_test = supabase.table('nawy_properties').select('*').eq('is_active', True).limit(20).execute()
        query_time = time.time() - start_time
        print(f"✅ Query time for 20 records: {query_time:.3f} seconds")
        
        if query_time > 1.0:
            print("⚠️  Warning: Query seems slow, check if indexes were created properly")
        
        # Final summary
        print("\n" + "=" * 50)
        print("🎉 IMPORT TEST RESULTS:")
        print(f"📊 Total properties: {total_count:,}")
        print(f"✅ Active properties: {active_count:,}")
        print(f"⚡ Query performance: {query_time:.3f}s")
        print(f"🔗 Database URL: https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn/editor")
        
        if total_count > 30000:
            print("✅ Import appears successful!")
            print("\n📝 Next steps:")
            print("1. Copy propertyQueries.ts to your main project")
            print("2. Update your frontend to use the new queries")
            print("3. Test the property search and filtering")
        else:
            print("❌ Import may be incomplete - check the import logs")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("Make sure:")
        print("1. Your Supabase key is correct")
        print("2. The nawy_properties table exists")
        print("3. RLS policies allow read access")

if __name__ == "__main__":
    test_import()
