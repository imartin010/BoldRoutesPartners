import requests
import pandas as pd
import time
from datetime import datetime
import json

# Configuration Variables
API_URL = "https://erealty-backend-api.cooingestate.com/v1/properties/search"
AUTH_TOKEN = "eyJraWQiOiJrYU9oZzQrakhkUXlTenpVdjEyY1lTSXJPcndRT0ZxTlVZMWdETTlCbUFNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyYjljNjNkMi0zYmY0LTQzZDgtODk1MC02ZWYxZTZmNjZhOWMiLCJjb2duaXRvOmdyb3VwcyI6WyJOYXd5SW52ZW50b3J5IiwiQnJva2VycyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb21cL2V1LWNlbnRyYWwtMV9kZ2duZjg2RFUiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOnRydWUsImNvZ25pdG86dXNlcm5hbWUiOiI4OGU4ZThjOS0zZTQwLTQzYWMtOGEzOS0wNDE5MmFjNGZhZWEiLCJvcmlnaW5fanRpIjoiYmUwZThkNGEtNmQzNS00YWY0LTk3MzEtNmRjYjVjNWI4M2E0IiwiYXVkIjoiN29ta2d0czZ0cGhzYmpoYWtwam9pN2VxcTkiLCJldmVudF9pZCI6Ijc1OGI0ZWU5LWM2N2YtNDJmMC1hN2VmLWEwMTlmMWE5MmJkZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzU2MTM4OTQ3LCJuYW1lIjoib21hciBtb2hhbWVkIiwicGhvbmVfbnVtYmVyIjoiKzIwMTE0MDgwMTUxNSIsImV4cCI6MTc1NjE1OTAwMywiaWF0IjoxNzU2MTU1NDAzLCJqdGkiOiIzMTI0ZTUzMC1lMzM1LTRmNTctOTAyNi1jZjk3OTI1MGY0ZmUifQ.VxnJsvT7LFvvukoak2Is8wFgZ-PXNstU-dgCylncSXWoxzRxzTwyhdhCmFwv2NhKB1ZNc3AdisYTgv8hq4BYiOZK4pTsyThDBejDn6zvNCfuNHizw2Z0-YWZk9yFsOYw_h76auTQsAtiI5CuI0cbsWC9jKDSheUUEJl1rbVClGUPJ6I_UYOzcnO43aOBgqaAj8hZELKHst7uX75wUXbG3sCAkfWo5MIBhlSOvokqH8xsGUAfVy4XFNW1uNIH_XzvtuPtSH90d-5AltOk82AAk2n_wQeRh-UmCnRNspXm3c9hIfOByFcA3Kq5Yz50Jg4-9wniP7gC0dwi3OGL3pqr6Q"
PAGE_SIZE = 50  # Larger page size for efficiency
DELAY_BETWEEN_REQUESTS = 0.5  # Faster scraping but still respectful
MAX_PAGES = 2000  # Safety limit for ~100k properties
SAVE_EVERY_N_PAGES = 50  # Save progress every 50 pages

# Headers for authentication
headers = {
    "Authorization": f"Bearer {AUTH_TOKEN}"
}

def fetch_page(page_number):
    """Fetch a single page of data from the API - NO compound filter"""
    params = {
        "page": page_number,
        "page_size": PAGE_SIZE
        # NOTE: NO compounds_ids[] parameter = get ALL properties
    }
    
    try:
        response = requests.get(API_URL, headers=headers, params=params, timeout=30)
        
        if response.status_code != 200:
            if response.status_code == 401:
                print("ERROR: 401 Unauthorized - Your token is likely wrong or expired.")
                return None, None, None
            else:
                print(f"ERROR: Request failed with status code {response.status_code}")
                return None, None, None
        
        json_data = response.json()
        properties = json_data.get('results', [])
        total_pages = json_data.get('total_pages', 1)
        total_count = json_data.get('total_count', 0)
        
        return properties, total_pages, total_count
        
    except Exception as e:
        print(f"ERROR: Exception occurred: {e}")
        return None, None, None

def save_progress(properties, filename_prefix):
    """Save current progress to CSV"""
    if properties:
        df = pd.DataFrame(properties)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'{filename_prefix}_{timestamp}.csv'
        df.to_csv(filename, index=False)
        return filename
    return None

def main():
    print("🌍 Starting Nawy ALL PROPERTIES Scraper (40k+ Units)")
    print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔍 Searching: ALL compounds (no filter)")
    print(f"📄 Page size: {PAGE_SIZE} properties per page")
    print(f"💾 Auto-save every {SAVE_EVERY_N_PAGES} pages")
    print("-" * 70)
    
    all_properties = []
    seen_property_ids = set()
    page = 1
    consecutive_empty_pages = 0
    last_save_page = 0
    
    # Get first page to see total scope
    properties, total_pages, total_count = fetch_page(1)
    
    if properties is None:
        print("❌ Failed to fetch first page. Exiting.")
        return
    
    print(f"🎯 DISCOVERED: {total_count:,} total properties across {total_pages:,} pages!")
    print(f"⏱️ Estimated time: {(total_pages * DELAY_BETWEEN_REQUESTS / 60):.1f} minutes")
    print("-" * 70)
    
    # Process all pages
    while page <= min(total_pages, MAX_PAGES):
        if page > 1:  # We already fetched page 1
            properties, _, _ = fetch_page(page)
        
        if properties is None:
            print(f"❌ Failed to fetch page {page}. Retrying in 5 seconds...")
            time.sleep(5)
            continue
        
        if not properties:
            consecutive_empty_pages += 1
            print(f"⚠️ Page {page} returned no results (empty #{consecutive_empty_pages})")
            if consecutive_empty_pages >= 3:
                print("🛑 Three consecutive empty pages - stopping")
                break
        else:
            consecutive_empty_pages = 0
            
            # Filter duplicates
            new_properties = []
            for prop in properties:
                prop_id = prop.get('id')
                if prop_id not in seen_property_ids:
                    seen_property_ids.add(prop_id)
                    new_properties.append(prop)
            
            all_properties.extend(new_properties)
            
            # Progress reporting
            if page % 10 == 0 or page <= 5:
                progress = (page / total_pages) * 100
                print(f"📈 Page {page:,}/{total_pages:,} ({progress:.1f}%) | Properties: {len(all_properties):,}")
        
        # Auto-save progress
        if page - last_save_page >= SAVE_EVERY_N_PAGES:
            print(f"💾 Auto-saving progress at page {page}...")
            filename = save_progress(all_properties, 'nawy_progress')
            if filename:
                print(f"   ✓ Saved {len(all_properties):,} properties to {filename}")
            last_save_page = page
        
        # Rate limiting
        time.sleep(DELAY_BETWEEN_REQUESTS)
        page += 1
    
    # Final save
    if all_properties:
        print("-" * 70)
        print("💾 Saving final dataset...")
        
        df = pd.DataFrame(all_properties)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'nawy_ALL_properties_{timestamp}.csv'
        df.to_csv(filename, index=False)
        
        print(f"🎉 SUCCESS! Saved {len(all_properties):,} unique properties to '{filename}'")
        print(f"📊 Data contains {len(df.columns)} columns")
        print(f"📄 Pages processed: {page - 1:,}")
        
        # Statistics
        if 'price_in_egp' in df.columns:
            prices = df['price_in_egp'].dropna()
            if len(prices) > 0:
                print(f"💰 Price range: {prices.min():,.0f} - {prices.max():,.0f} EGP")
                print(f"💰 Average price: {prices.mean():,.0f} EGP")
        
        if 'compound' in df.columns:
            compounds = df['compound'].apply(lambda x: x.get('name') if isinstance(x, dict) else str(x)).value_counts()
            print(f"🏘️ Top compounds:")
            for compound, count in compounds.head(5).items():
                print(f"   - {compound}: {count:,} properties")
        
        if 'area' in df.columns:
            areas = df['area'].apply(lambda x: x.get('name') if isinstance(x, dict) else str(x)).value_counts()
            print(f"🌍 Top areas:")
            for area, count in areas.head(5).items():
                print(f"   - {area}: {count:,} properties")
                
    else:
        print("❌ No properties were retrieved.")
    
    print(f"🏁 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
