import requests
import pandas as pd
import time
from datetime import datetime

# Configuration Variables
API_URL = "https://erealty-backend-api.cooingestate.com/v1/properties/search"
AUTH_TOKEN = "eyJraWQiOiJrYU9oZzQrakhkUXlTenpVdjEyY1lTSXJPcndRT0ZxTlVZMWdETTlCbUFNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyYjljNjNkMi0zYmY0LTQzZDgtODk1MC02ZWYxZTZmNjZhOWMiLCJjb2duaXRvOmdyb3VwcyI6WyJOYXd5SW52ZW50b3J5IiwiQnJva2VycyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb21cL2V1LWNlbnRyYWwtMV9kZ2duZjg2RFUiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOnRydWUsImNvZ25pdG86dXNlcm5hbWUiOiI4OGU4ZThjOS0zZTQwLTQzYWMtOGEzOS0wNDE5MmFjNGZhZWEiLCJvcmlnaW5fanRpIjoiYmUwZThkNGEtNmQzNS00YWY0LTk3MzEtNmRjYjVjNWI4M2E0IiwiYXVkIjoiN29ta2d0czZ0cGhzYmpoYWtwam9pN2VxcTkiLCJldmVudF9pZCI6Ijc1OGI0ZWU5LWM2N2YtNDJmMC1hN2VmLWEwMTlmMWE5MmJkZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzU2MTM4OTQ3LCJuYW1lIjoib21hciBtb2hhbWVkIiwicGhvbmVfbnVtYmVyIjoiKzIwMTE0MDgwMTUxNSIsImV4cCI6MTc1NjE1OTAwMywiaWF0IjoxNzU2MTU1NDAzLCJqdGkiOiIzMTI0ZTUzMC1lMzM1LTRmNTctOTAyNi1jZjk3OTI1MGY0ZmUifQ.VxnJsvT7LFvvukoak2Is8wFgZ-PXNstU-dgCylncSXWoxzRxzTwyhdhCmFwv2NhKB1ZNc3AdisYTgv8hq4BYiOZK4pTsyThDBejDn6zvNCfuNHizw2Z0-YWZk9yFsOYw_h76auTQsAtiI5CuI0cbsWC9jKDSheUUEJl1rbVClGUPJ6I_UYOzcnO43aOBgqaAj8hZELKHst7uX75wUXbG3sCAkfWo5MIBhlSOvokqH8xsGUAfVy4XFNW1uNIH_XzvtuPtSH90d-5AltOk82AAk2n_wQeRh-UmCnRNspXm3c9hIfOByFcA3Kq5Yz50Jg4-9wniP7gC0dwi3OGL3pqr6Q"
COMPOUND_ID = 775
PAGE_SIZE = 50  # Increased page size to get more data per request
DELAY_BETWEEN_REQUESTS = 1  # seconds to avoid overwhelming the API
MAX_PAGES = 1000  # Safety limit to prevent infinite loops

# Headers for authentication
headers = {
    "Authorization": f"Bearer {AUTH_TOKEN}"
}

def fetch_page(page_number):
    """Fetch a single page of data from the API"""
    params = {
        "page": page_number,
        "page_size": PAGE_SIZE,
        "compounds_ids[]": COMPOUND_ID
    }
    
    print(f"Fetching page {page_number} (page_size: {PAGE_SIZE})...")
    response = requests.get(API_URL, headers=headers, params=params)
    
    if response.status_code != 200:
        if response.status_code == 401:
            print("ERROR: 401 Unauthorized - Your token is likely wrong or expired.")
            return None, None, None
        else:
            print(f"ERROR: Request failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return None, None, None
    
    json_data = response.json()
    properties = json_data.get('results', [])
    total_pages = json_data.get('total_pages', 1)
    total_count = json_data.get('total_count', 0)
    
    print(f"  ✓ Retrieved {len(properties)} properties from page {page_number}")
    print(f"  📊 API reports: {total_count} total, {total_pages} pages")
    
    return properties, total_pages, total_count

def main():
    print("🏠 Starting Nawy COMPLETE Property Scraper")
    print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🏢 Compound ID: {COMPOUND_ID}")
    print(f"📄 Page size: {PAGE_SIZE} properties per page")
    print("-" * 60)
    
    all_properties = []
    seen_property_ids = set()  # Track unique property IDs to avoid duplicates
    page = 1
    consecutive_empty_pages = 0
    
    while page <= MAX_PAGES:
        properties, api_total_pages, api_total_count = fetch_page(page)
        
        if properties is None:
            print(f"❌ Failed to fetch page {page}. Stopping.")
            break
        
        if not properties:
            consecutive_empty_pages += 1
            print(f"  ⚠️ Page {page} returned no results (empty page #{consecutive_empty_pages})")
            
            # Stop if we get 2 consecutive empty pages
            if consecutive_empty_pages >= 2:
                print("  🛑 Two consecutive empty pages - assuming we've reached the end")
                break
        else:
            consecutive_empty_pages = 0  # Reset counter
            
            # Filter out duplicate properties based on ID
            new_properties = []
            for prop in properties:
                prop_id = prop.get('id')
                if prop_id not in seen_property_ids:
                    seen_property_ids.add(prop_id)
                    new_properties.append(prop)
            
            all_properties.extend(new_properties)
            
            if len(new_properties) < len(properties):
                print(f"  🔍 Found {len(properties) - len(new_properties)} duplicate properties (filtered out)")
            
            print(f"  📈 Total unique properties collected so far: {len(all_properties)}")
            
            # If API says there are no more pages but we got results, continue anyway
            if page >= api_total_pages and len(properties) == PAGE_SIZE:
                print(f"  🔄 API says page {page} is the last, but got full page - continuing...")
        
        # Add delay between requests
        if page < MAX_PAGES:
            time.sleep(DELAY_BETWEEN_REQUESTS)
        
        page += 1
    
    # Save all data to CSV
    if all_properties:
        print("-" * 60)
        print("💾 Saving data to CSV...")
        
        df = pd.DataFrame(all_properties)
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'nawy_complete_data_{timestamp}.csv'
        
        df.to_csv(filename, index=False)
        
        print(f"✅ SUCCESS! Saved {len(all_properties)} unique properties to '{filename}'")
        print(f"📊 Data contains {len(df.columns)} columns with property details")
        print(f"🏠 Properties from compound: {COMPOUND_ID}")
        print(f"📄 Total pages processed: {page - 1}")
        
        # Show some basic stats
        if 'price_in_egp' in df.columns:
            prices = df['price_in_egp'].dropna()
            if len(prices) > 0:
                avg_price = prices.mean()
                min_price = prices.min()
                max_price = prices.max()
                print(f"💰 Price range: {min_price:,.0f} - {max_price:,.0f} EGP (avg: {avg_price:,.0f} EGP)")
        
        if 'unit_area' in df.columns:
            areas = df['unit_area'].dropna()
            if len(areas) > 0:
                avg_area = areas.mean()
                print(f"📐 Average unit area: {avg_area:.0f} m²")
        
        # Show property types breakdown
        if 'property_type' in df.columns:
            prop_types = df['property_type'].apply(lambda x: x.get('name') if isinstance(x, dict) else str(x)).value_counts()
            print(f"🏘️ Property types:")
            for prop_type, count in prop_types.head(5).items():
                print(f"   - {prop_type}: {count}")
            
    else:
        print("❌ No properties were retrieved.")
    
    print(f"🏁 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
