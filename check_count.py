#!/usr/bin/env python3
"""Check total count in database"""

import requests

# Your Supabase details
SUPABASE_URL = "https://mdqqqogshgtpzxtufjzn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXFxb2dzaGd0cHp4dHVmanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5MjUsImV4cCI6MjA3MTY5MjkyNX0.CmxAoMsKcjNWX3FIea-yfOHSD3lkEtw0vCFmDgVfgq8"

url = f"{SUPABASE_URL}/rest/v1/nawy_properties"
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Prefer': 'count=exact'
}

response = requests.head(url, headers=headers)
count = response.headers.get('Content-Range', '0').split('/')[-1]
print(f"📊 Total records in database: {count}")

if count == '0':
    print("❌ Database is empty! The complete importer cleared data but failed to reimport.")
    print("💡 Let's reimport the basic data first, then add JSON fields later.")
else:
    print(f"✅ Database has {count} records")








