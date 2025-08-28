-- Enhanced inventory_items schema for Nawy property data
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn

-- Drop existing table to avoid conflicts with old structure
DROP TABLE IF EXISTS inventory_items CASCADE;

CREATE TABLE IF NOT EXISTS inventory_items (
    -- Primary key
    id BIGSERIAL PRIMARY KEY,
    
    -- Nawy API data
    nawy_id INTEGER UNIQUE NOT NULL,
    unit_id TEXT,
    original_unit_id TEXT,
    sale_type TEXT,
    unit_number TEXT,
    
    -- Property details
    unit_area DECIMAL,
    number_of_bedrooms INTEGER,
    number_of_bathrooms INTEGER,
    garden_area DECIMAL,
    roof_area DECIMAL,
    floor_number INTEGER,
    building_number TEXT, -- Changed to TEXT to handle 'D24' format
    
    -- Pricing
    price_per_meter DECIMAL,
    price_in_egp DECIMAL,
    currency TEXT DEFAULT 'EGP',
    
    -- Dates
    ready_by TIMESTAMPTZ,
    last_inventory_update TIMESTAMPTZ,
    
    -- Property status
    finishing TEXT,
    is_launch BOOLEAN DEFAULT FALSE,
    
    -- Media
    image TEXT,
    
    -- JSON fields for complex data
    payment_plans JSONB,
    offers JSONB,
    compound JSONB,
    area JSONB,
    developer JSONB,
    phase JSONB,
    property_type JSONB,
    
    -- Control fields for your application
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    visibility_status TEXT DEFAULT 'public' CHECK (visibility_status IN ('public', 'private', 'draft')),
    priority_score INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_inventory_nawy_id ON inventory_items(nawy_id);
CREATE INDEX IF NOT EXISTS idx_inventory_active ON inventory_items(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_inventory_featured ON inventory_items(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_inventory_price ON inventory_items(price_in_egp) WHERE price_in_egp IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_area ON inventory_items(unit_area) WHERE unit_area IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_bedrooms ON inventory_items(number_of_bedrooms) WHERE number_of_bedrooms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_visibility ON inventory_items(visibility_status, is_active);

-- JSON field indexes for search performance
CREATE INDEX IF NOT EXISTS idx_inventory_compound_name ON inventory_items USING GIN ((compound->>'name')) WHERE compound IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_area_name ON inventory_items USING GIN ((area->>'name')) WHERE area IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_developer_name ON inventory_items USING GIN ((developer->>'name')) WHERE developer IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_property_type_name ON inventory_items USING GIN ((property_type->>'name')) WHERE property_type IS NOT NULL;

-- Full-text search index for property search
CREATE INDEX IF NOT EXISTS idx_inventory_search ON inventory_items USING GIN (
    to_tsvector('english', 
        COALESCE(compound->>'name', '') || ' ' ||
        COALESCE(area->>'name', '') || ' ' ||
        COALESCE(developer->>'name', '') || ' ' ||
        COALESCE(property_type->>'name', '') || ' ' ||
        COALESCE(unit_number, '') || ' ' ||
        COALESCE(finishing, '')
    )
) WHERE is_active = true;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_items_updated_at 
    BEFORE UPDATE ON inventory_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access to active, public properties
CREATE POLICY "public_read_active_properties" ON inventory_items
    FOR SELECT TO anon, authenticated
    USING (is_active = true AND visibility_status = 'public');

-- Allow authenticated users to read all active properties
CREATE POLICY "authenticated_read_active_properties" ON inventory_items
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Allow admin users full access (you'll need to adjust based on your auth system)
CREATE POLICY "admin_full_access" ON inventory_items
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Comments for documentation
COMMENT ON TABLE inventory_items IS 'Property inventory from Nawy API with management controls';
COMMENT ON COLUMN inventory_items.nawy_id IS 'Original property ID from Nawy API';
COMMENT ON COLUMN inventory_items.building_number IS 'Building number (can be text like D24)';
COMMENT ON COLUMN inventory_items.is_active IS 'Controls if property is visible in listings';
COMMENT ON COLUMN inventory_items.is_featured IS 'Mark property as featured for highlighting';
COMMENT ON COLUMN inventory_items.visibility_status IS 'public: visible to all, private: admin only, draft: hidden';
COMMENT ON COLUMN inventory_items.priority_score IS 'Higher scores appear first in listings (0-100)';

-- Create some useful views
CREATE OR REPLACE VIEW public_properties AS
SELECT * FROM inventory_items 
WHERE is_active = true AND visibility_status = 'public'
ORDER BY priority_score DESC, created_at DESC;

CREATE OR REPLACE VIEW featured_properties AS
SELECT * FROM inventory_items 
WHERE is_active = true AND is_featured = true AND visibility_status = 'public'
ORDER BY priority_score DESC, created_at DESC;

-- Grant necessary permissions
GRANT SELECT ON public_properties TO anon, authenticated;
GRANT SELECT ON featured_properties TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Inventory schema created successfully!';
    RAISE NOTICE '📊 Ready for 34,077 property import';
    RAISE NOTICE '🔗 Next: Update your importer script with Supabase credentials';
END $$;
