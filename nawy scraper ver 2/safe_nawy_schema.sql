-- Safe Nawy Properties Schema - Creates separate table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn

-- Create dedicated table for Nawy properties (keeps existing inventory_items intact)
CREATE TABLE IF NOT EXISTS nawy_properties (
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
CREATE INDEX IF NOT EXISTS idx_nawy_nawy_id ON nawy_properties(nawy_id);
CREATE INDEX IF NOT EXISTS idx_nawy_active ON nawy_properties(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_nawy_featured ON nawy_properties(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_nawy_price ON nawy_properties(price_in_egp) WHERE price_in_egp IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nawy_area ON nawy_properties(unit_area) WHERE unit_area IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nawy_bedrooms ON nawy_properties(number_of_bedrooms) WHERE number_of_bedrooms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nawy_visibility ON nawy_properties(visibility_status, is_active);

-- JSON field indexes for search performance
CREATE INDEX IF NOT EXISTS idx_nawy_compound_name ON nawy_properties USING GIN ((compound->>'name')) WHERE compound IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nawy_area_name ON nawy_properties USING GIN ((area->>'name')) WHERE area IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nawy_developer_name ON nawy_properties USING GIN ((developer->>'name')) WHERE developer IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nawy_property_type_name ON nawy_properties USING GIN ((property_type->>'name')) WHERE property_type IS NOT NULL;

-- Full-text search index for property search
CREATE INDEX IF NOT EXISTS idx_nawy_search ON nawy_properties USING GIN (
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
CREATE OR REPLACE FUNCTION update_nawy_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nawy_properties_updated_at 
    BEFORE UPDATE ON nawy_properties 
    FOR EACH ROW 
    EXECUTE FUNCTION update_nawy_updated_at_column();

-- Enable Row Level Security
ALTER TABLE nawy_properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access to active, public properties
CREATE POLICY "public_read_active_nawy_properties" ON nawy_properties
    FOR SELECT TO anon, authenticated
    USING (is_active = true AND visibility_status = 'public');

-- Allow authenticated users to read all active properties
CREATE POLICY "authenticated_read_active_nawy_properties" ON nawy_properties
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Allow admin users full access (you'll need to adjust based on your auth system)
CREATE POLICY "admin_full_access_nawy_properties" ON nawy_properties
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Comments for documentation
COMMENT ON TABLE nawy_properties IS 'Nawy property inventory with management controls';
COMMENT ON COLUMN nawy_properties.nawy_id IS 'Original property ID from Nawy API';
COMMENT ON COLUMN nawy_properties.building_number IS 'Building number (can be text like D24)';
COMMENT ON COLUMN nawy_properties.is_active IS 'Controls if property is visible in listings';
COMMENT ON COLUMN nawy_properties.is_featured IS 'Mark property as featured for highlighting';
COMMENT ON COLUMN nawy_properties.visibility_status IS 'public: visible to all, private: admin only, draft: hidden';
COMMENT ON COLUMN nawy_properties.priority_score IS 'Higher scores appear first in listings (0-100)';

-- Create some useful views
CREATE OR REPLACE VIEW public_nawy_properties AS
SELECT * FROM nawy_properties 
WHERE is_active = true AND visibility_status = 'public'
ORDER BY priority_score DESC, created_at DESC;

CREATE OR REPLACE VIEW featured_nawy_properties AS
SELECT * FROM nawy_properties 
WHERE is_active = true AND is_featured = true AND visibility_status = 'public'
ORDER BY priority_score DESC, created_at DESC;

-- Grant necessary permissions
GRANT SELECT ON public_nawy_properties TO anon, authenticated;
GRANT SELECT ON featured_nawy_properties TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Nawy properties schema created successfully!';
    RAISE NOTICE '📊 Ready for 34,077 property import';
    RAISE NOTICE '🔗 Table name: nawy_properties (separate from existing inventory_items)';
    RAISE NOTICE '🛡️ Your existing inventory system remains untouched';
END $$;

