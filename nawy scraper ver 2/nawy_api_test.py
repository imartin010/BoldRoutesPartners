import requests
import pandas as pd

# Configuration Variables
API_URL = "https://erealty-backend-api.cooingestate.com/v1/properties/search"
AUTH_TOKEN = "eyJraWQiOiJrYU9oZzQrakhkUXlTenpVdjEyY1lTSXJPcndRT0ZxTlVZMWdETTlCbUFNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyYjljNjNkMi0zYmY0LTQzZDgtODk1MC02ZWYxZTZmNjZhOWMiLCJjb2duaXRvOmdyb3VwcyI6WyJOYXd5SW52ZW50b3J5IiwiQnJva2VycyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb21cL2V1LWNlbnRyYWwtMV9kZ2duZjg2RFUiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOnRydWUsImNvZ25pdG86dXNlcm5hbWUiOiI4OGU4ZThjOS0zZTQwLTQzYWMtOGEzOS0wNDE5MmFjNGZhZWEiLCJvcmlnaW5fanRpIjoiYmUwZThkNGEtNmQzNS00YWY0LTk3MzEtNmRjYjVjNWI4M2E0IiwiYXVkIjoiN29ta2d0czZ0cGhzYmpoYWtwam9pN2VxcTkiLCJldmVudF9pZCI6Ijc1OGI0ZWU5LWM2N2YtNDJmMC1hN2VmLWEwMTlmMWE5MmJkZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzU2MTM4OTQ3LCJuYW1lIjoib21hciBtb2hhbWVkIiwicGhvbmVfbnVtYmVyIjoiKzIwMTE0MDgwMTUxNSIsImV4cCI6MTc1NjE1OTAwMywiaWF0IjoxNzU2MTU1NDAzLCJqdGkiOiIzMTI0ZTUzMC1lMzM1LTRmNTctOTAyNi1jZjk3OTI1MGY0ZmUifQ.VxnJsvT7LFvvukoak2Is8wFgZ-PXNstU-dgCylncSXWoxzRxzTwyhdhCmFwv2NhKB1ZNc3AdisYTgv8hq4BYiOZK4pTsyThDBejDn6zvNCfuNHizw2Z0-YWZk9yFsOYw_h76auTQsAtiI5CuI0cbsWC9jKDSheUUEJl1rbVClGUPJ6I_UYOzcnO43aOBgqaAj8hZELKHst7uX75wUXbG3sCAkfWo5MIBhlSOvokqH8xsGUAfVy4XFNW1uNIH_XzvtuPtSH90d-5AltOk82AAk2n_wQeRh-UmCnRNspXm3c9hIfOByFcA3Kq5Yz50Jg4-9wniP7gC0dwi3OGL3pqr6Q"
COMPOUND_ID = 775

# Headers for authentication
headers = {
    "Authorization": f"Bearer {AUTH_TOKEN}"
}

# Parameters for the API request
params = {
    "page": 1,
    "page_size": 25,
    "compounds_ids[]": COMPOUND_ID
}

# Make the API request
print("Making API request...")
response = requests.get(API_URL, headers=headers, params=params)

# Error checking
if response.status_code != 200:
    if response.status_code == 401:
        print("ERROR: 401 Unauthorized - Your token is likely wrong or expired.")
        print("Please check your AUTH_TOKEN and try again.")
    else:
        print(f"ERROR: Request failed with status code {response.status_code}")
        print(f"Response: {response.text}")
    exit()

# Data processing and saving
print("Request successful! Processing data...")
json_data = response.json()

# Extract the properties list from the 'results' key
properties = json_data.get('results', [])

if not properties:
    print("Warning: No properties found in the response data.")
else:
    # Convert to DataFrame
    df = pd.DataFrame(properties)
    
    # Save to CSV without index
    df.to_csv('nawy_test_output.csv', index=False)
    
    print(f"Success! Data for the first page saved to nawy_test_output.csv")
    print(f"Retrieved {len(properties)} properties from the API.")
