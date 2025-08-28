import requests
import pandas as pd
import time
from datetime import datetime

# Configuration Variables
API_URL = "https://erealty-backend-api.cooingestate.com/v1/properties/search"
AUTH_TOKEN = "eyJraWQiOiJrYU9oZzQrakhkUXlTenpVdjEyY1lTSXJPcndRT0ZxTlVZMWdETTlCbUFNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyYjljNjNkMi0zYmY0LTQzZDgtODk1MC02ZWYxZTZmNjZhOWMiLCJjb2duaXRvOmdyb3VwcyI6WyJOYXd5SW52ZW50b3J5IiwiQnJva2VycyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb21cL2V1LWNlbnRyYWwtMV9kZ2duZjg2RFUiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOnRydWUsImNvZ25pdG86dXNlcm5hbWUiOiI4OGU4ZThjOS0zZTQwLTQzYWMtOGEzOS0wNDE5MmFjNGZhZWEiLCJvcmlnaW5fanRpIjoiYmUwZThkNGEtNmQzNS00YWY0LTk3MzEtNmRjYjVjNWI4M2E0IiwiYXVkIjoiN29ta2d0czZ0cGhzYmpoYWtwam9pN2VxcTkiLCJldmVudF9pZCI6Ijc1OGI0ZWU5LWM2N2YtNDJmMC1hN2VmLWEwMTlmMWE5MmJkZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzU2MTM4OTQ3LCJuYW1lIjoib21hciBtb2hhbWVkIiwicGhvbmVfbnVtYmVyIjoiKzIwMTE0MDgwMTUxNSIsImV4cCI6MTc1NjE1OTAwMywiaWF0IjoxNzU2MTU1NDAzLCJqdGkiOiIzMTI0ZTUzMC1lMzM1LTRmNTctOTAyNi1jZjk3OTI1MGY0ZmUifQ.VxnJsvT7LFvvukoak2Is8wFgZ-PXNstU-dgCylncSXWoxzRxzTwyhdhCmFwv2NhKB1ZNc3AdisYTgv8hq4BYiOZK4pTsyThDBejDn6zvNCfuNHizw2Z0-YWZk9yFsOYw_h76auTQsAtiI5CuI0cbsWC9jKDSheUUEJl1rbVClGUPJ6I_UYOzcnO43aOBgqaAj8hZELKHst7uX75wUXbG3sCAkfWo5MIBhlSOvokqH8xsGUAfVy4XFNW1uNIH_XzvtuPtSH90d-5AltOk82AAk2n_wQeRh-UmCnRNspXm3c9hIfOByFcA3Kq5Yz50Jg4-9wniP7gC0dwi3OGL3pqr6Q"
COMPOUND_ID = 775
PAGE_SIZE = 25
DELAY_BETWEEN_REQUESTS = 1  # seconds to avoid overwhelming the API

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
    
    print(f"Fetching page {page_number}...")
    response = requests.get(API_URL, headers=headers, params=params)
    
    if response.status_code != 200:
        if response.status_code == 401:
            print("ERROR: 401 Unauthorized - Your token is likely wrong or expired.")
            return None, None
        else:
            print(f"ERROR: Request failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return None, None
    
    json_data = response.json()
    properties = json_data.get('results', [])
    total_pages = json_data.get('total_pages', 1)
    total_count = json_data.get('total_count', 0)
    
    print(f"  ✓ Retrieved {len(properties)} properties from page {page_number}")
    return properties, total_pages, total_count

def main():
    print("🏠 Starting Nawy Full Property Scraper")
    print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🏢 Compound ID: {COMPOUND_ID}")
    print("-" * 50)
    
    all_properties = []
    
    # First, get the first page to determine total pages
    properties, total_pages, total_count = fetch_page(1)
    
    if properties is None:
        print("❌ Failed to fetch first page. Exiting.")
        return
    
    all_properties.extend(properties)
    
    print(f"📊 Total properties available: {total_count}")
    print(f"📄 Total pages to fetch: {total_pages}")
    print("-" * 50)
    
    # Fetch remaining pages
    for page in range(2, total_pages + 1):
        time.sleep(DELAY_BETWEEN_REQUESTS)  # Be respectful to the API
        
        properties, _, _ = fetch_page(page)
        
        if properties is None:
            print(f"❌ Failed to fetch page {page}. Stopping.")
            break
            
        all_properties.extend(properties)
        
        # Show progress
        progress = (page / total_pages) * 100
        print(f"  📈 Progress: {progress:.1f}% ({len(all_properties)}/{total_count} properties)")
    
    # Save all data to CSV
    if all_properties:
        print("-" * 50)
        print("💾 Saving data to CSV...")
        
        df = pd.DataFrame(all_properties)
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'nawy_full_data_{timestamp}.csv'
        
        df.to_csv(filename, index=False)
        
        print(f"✅ SUCCESS! Saved {len(all_properties)} properties to '{filename}'")
        print(f"📊 Data contains {len(df.columns)} columns with property details")
        print(f"🏠 Properties from compound: {COMPOUND_ID}")
        
        # Show some basic stats
        if 'price_in_egp' in df.columns:
            avg_price = df['price_in_egp'].mean()
            min_price = df['price_in_egp'].min()
            max_price = df['price_in_egp'].max()
            print(f"💰 Price range: {min_price:,.0f} - {max_price:,.0f} EGP (avg: {avg_price:,.0f} EGP)")
        
        if 'unit_area' in df.columns:
            avg_area = df['unit_area'].mean()
            print(f"📐 Average unit area: {avg_area:.0f} m²")
            
    else:
        print("❌ No properties were retrieved.")
    
    print(f"🏁 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
