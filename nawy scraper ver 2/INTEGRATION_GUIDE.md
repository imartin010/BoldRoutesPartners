# Integration Guide for Your Existing Website

## 🎯 Goal
Add the 34k+ Nawy properties to your existing website without disrupting your current setup.

## 📁 File Organization
**Keep your scraper folder separate!**
```
D:\nawy scraper ver 2\          ← Keep all scraper files here
├── supabase_property_importer.py  ← Run database import from here
├── create_inventory_schema.sql    ← Run in Supabase
└── nawy_ALL_properties_20250826_005624.csv

Your Existing Website Project\   ← Your current project
├── (your existing files)
└── (add only these new files)
    ├── lib/supabase-property-queries.js  ← Copy this file
    └── components/PropertyAdminPanel.tsx  ← Optional admin panel
```

## 🚀 Step-by-Step Integration

### Step 1: Database Setup (Required)
1. **Go to Supabase SQL Editor**: https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn/sql
2. **Copy and run** the `create_inventory_schema.sql` script
3. **Get your API key**: https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn/settings/api

### Step 2: Import Data (Required)
**Stay in your scraper folder** (`D:\nawy scraper ver 2\`):
1. Install packages: `pip install pandas supabase`
2. Edit `supabase_property_importer.py` - replace `YOUR_SUPABASE_ANON_KEY`
3. Run: `python supabase_property_importer.py`

### Step 3: Frontend Integration (Required)
**In your existing website project**:
1. **Copy** `supabase-property-queries.js` to your project's `lib/` or `utils/` folder
2. **Update** your existing property components to use these new queries
3. **Replace** your old property data source with the new Supabase queries

### Step 4: Update Your Components (Required)
**Example: Update your existing property listing component**:

```javascript
// Before (your old way)
import { getProperties } from './old-data-source';

// After (new way)
import { getActiveProperties, getFeaturedProperties } from './lib/supabase-property-queries';

function PropertyListing() {
  const [properties, setProperties] = useState([]);
  
  useEffect(() => {
    // Old way
    // const data = await getProperties();
    
    // New way
    const loadProperties = async () => {
      const { properties, error } = await getActiveProperties(1, 20);
      if (!error) {
        setProperties(properties);
      }
    };
    loadProperties();
  }, []);
  
  // Your existing JSX remains the same!
  return (
    <div>
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
```

## 🎛️ Control Features Available

After integration, you can control properties via database or admin panel:

### Database Control (Direct SQL)
```sql
-- Hide specific properties
UPDATE inventory_items SET is_active = false WHERE compound->>'name' = 'Unwanted Compound';

-- Feature premium properties
UPDATE inventory_items SET is_featured = true WHERE price_in_egp > 50000000;

-- Set priority for ordering
UPDATE inventory_items SET priority_score = 100 WHERE compound->>'name' = 'Premium Compound';
```

### Admin Panel Control (Optional)
Copy `PropertyAdminPanel.tsx` to your project for a web interface to:
- Toggle properties active/inactive
- Mark properties as featured
- Set priority scores
- Bulk operations
- Filter and search

## 🔧 Available Query Functions

```javascript
// Get paginated properties with filters
const { properties, totalPages } = await getActiveProperties(1, 20, {
  compound: 'ZED',
  area: 'New Cairo',
  min_price: 5000000,
  max_price: 20000000,
  bedrooms: 3
});

// Get featured properties for homepage
const { properties } = await getFeaturedProperties(10);

// Get property details
const { property } = await getPropertyById(355633);

// Get filter options
const { compounds } = await getCompounds();
const { areas } = await getAreas();

// Search properties
const { properties } = await searchProperties('ZED New Cairo');

// Get statistics
const { stats } = await getPropertyStats();
```

## 🎨 Property Data Structure
Each property object contains:
```javascript
{
  id: 1,
  nawy_id: 355633,
  unit_area: 168.0,
  number_of_bedrooms: 2,
  number_of_bathrooms: 3,
  price_in_egp: 15250000,
  compound: { id: 244, name: 'ZED' },
  area: { id: 21, name: 'El Sheikh Zayed' },
  developer: { id: 76, name: 'Ora Developers' },
  property_type: { id: 50, name: 'Loft' },
  payment_plans: [...],
  offers: [...],
  is_active: true,
  is_featured: false,
  priority_score: 0
}
```

## ✅ What You DON'T Need to Change
- Your existing UI components
- Your styling/CSS
- Your routing
- Your other functionality

## 🚫 What You DON'T Need to Copy
- Don't copy scraper scripts to your website
- Don't copy CSV files to your website
- Keep scraper tools separate from your production website

## 🎯 Final Result
After integration:
- ✅ Your website displays 34k+ real properties
- ✅ You can control which properties show/hide
- ✅ Properties are searchable and filterable
- ✅ Your existing design/functionality stays the same
- ✅ Data is stored in your Supabase database
- ✅ Real-time updates possible
