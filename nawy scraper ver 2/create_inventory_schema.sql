-- Create or update the inventory_items table with proper schema
-- Run this in your Supabase SQL Editor

-- Drop existing table if needed (be careful with this in production!)
-- DROP TABLE IF EXISTS inventory_items;

CREATE TABLE IF NOT EXISTS inventory_items (
    -- Primary key
    id BIGSERIAL PRIMARY KEY,
    
    -- Nawy API data
    nawy_id INTEGER UNIQUE,
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
    building_number INTEGER,
    
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
    visibility_status TEXT DEFAULT 'public', -- 'public', 'private', 'draft'
    priority_score INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_nawy_id ON inventory_items(nawy_id);
CREATE INDEX IF NOT EXISTS idx_inventory_active ON inventory_items(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_featured ON inventory_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_inventory_price ON inventory_items(price_in_egp);
CREATE INDEX IF NOT EXISTS idx_inventory_area ON inventory_items(unit_area);
CREATE INDEX IF NOT EXISTS idx_inventory_bedrooms ON inventory_items(number_of_bedrooms);
CREATE INDEX IF NOT EXISTS idx_inventory_compound ON inventory_items USING GIN ((compound->>'name'));
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory_items USING GIN ((area->>'name'));
CREATE INDEX IF NOT EXISTS idx_inventory_developer ON inventory_items USING GIN ((developer->>'name'));
CREATE INDEX IF NOT EXISTS idx_inventory_property_type ON inventory_items USING GIN ((property_type->>'name'));

-- Create updated_at trigger
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

-- Enable Row Level Security (RLS) if needed
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies for your application
-- Adjust these based on your authentication needs

-- Allow read access to active properties
CREATE POLICY "Allow read access to active properties" ON inventory_items
    FOR SELECT USING (is_active = true);

-- Allow full access to authenticated users (adjust as needed)
CREATE POLICY "Allow full access to authenticated users" ON inventory_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow public read access to public properties
CREATE POLICY "Allow public read to public properties" ON inventory_items
    FOR SELECT USING (visibility_status = 'public' AND is_active = true);

COMMENT ON TABLE inventory_items IS 'Property inventory from Nawy API with control fields';
COMMENT ON COLUMN inventory_items.nawy_id IS 'Original property ID from Nawy API';
COMMENT ON COLUMN inventory_items.is_active IS 'Controls if property is active/visible';
COMMENT ON COLUMN inventory_items.is_featured IS 'Mark property as featured for highlighting';
COMMENT ON COLUMN inventory_items.visibility_status IS 'Controls property visibility: public, private, draft';
COMMENT ON COLUMN inventory_items.priority_score IS 'Higher scores appear first in listings';
