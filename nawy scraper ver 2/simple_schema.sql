-- Simple Nawy Properties Table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn/sql/new

-- Drop existing table if it exists
DROP TABLE IF EXISTS nawy_properties CASCADE;

-- Create simple table structure
CREATE TABLE nawy_properties (
    id BIGSERIAL PRIMARY KEY,
    nawy_id INTEGER,
    unit_id TEXT,
    unit_number TEXT,
    unit_area NUMERIC,
    number_of_bedrooms INTEGER,
    number_of_bathrooms INTEGER,
    price_in_egp NUMERIC,
    price_per_meter NUMERIC,
    currency TEXT DEFAULT 'EGP',
    finishing TEXT,
    is_launch BOOLEAN DEFAULT FALSE,
    image TEXT,
    
    -- JSON fields for complex data
    compound JSONB,
    area JSONB,
    developer JSONB,
    property_type JSONB,
    
    -- Simple timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create basic indexes for performance
CREATE INDEX idx_nawy_properties_nawy_id ON nawy_properties(nawy_id);
CREATE INDEX idx_nawy_properties_price ON nawy_properties(price_in_egp);
CREATE INDEX idx_nawy_properties_bedrooms ON nawy_properties(number_of_bedrooms);
CREATE INDEX idx_nawy_properties_area ON nawy_properties(unit_area);

-- JSON field indexes (fixed for GIN compatibility)
CREATE INDEX idx_nawy_properties_compound ON nawy_properties USING GIN (compound);
CREATE INDEX idx_nawy_properties_location ON nawy_properties USING GIN (area);
CREATE INDEX idx_nawy_properties_developer ON nawy_properties USING GIN (developer);

-- Enable Row Level Security (optional)
ALTER TABLE nawy_properties ENABLE ROW LEVEL SECURITY;

-- Allow public read access (you can restrict this later)
CREATE POLICY "Allow public read access" ON nawy_properties
    FOR SELECT TO anon, authenticated
    USING (true);

-- Success message
SELECT 'Table nawy_properties created successfully!' as message;
