-- =====================================================
-- BRDATA PROPERTIES TABLE SETUP
-- Run this in Supabase SQL Editor first
-- =====================================================

-- Step 1: Create new table with proper structure
CREATE TABLE nawy_properties (
    id BIGINT PRIMARY KEY,
    unit_id TEXT,
    original_unit_id TEXT,
    sale_type TEXT,
    unit_number TEXT,
    unit_area NUMERIC(10,2),
    number_of_bedrooms INTEGER,
    number_of_bathrooms INTEGER,
    ready_by TIMESTAMPTZ,
    finishing TEXT,
    garden_area NUMERIC(10,2),
    roof_area NUMERIC(10,2),
    floor_number NUMERIC(5,1),
    building_number TEXT,
    price_per_meter NUMERIC(15,2),
    price_in_egp NUMERIC(15,2),
    last_inventory_update TIMESTAMPTZ,
    currency TEXT,
    payment_plans JSONB,
    image TEXT,
    offers JSONB,
    is_launch BOOLEAN,
    compound JSONB,
    area JSONB,
    developer JSONB,
    phase JSONB,
    property_type JSONB
);

-- Step 2: Create indexes for better performance
CREATE INDEX idx_nawy_properties_developer ON nawy_properties USING GIN (developer);
CREATE INDEX idx_nawy_properties_compound ON nawy_properties USING GIN (compound);
CREATE INDEX idx_nawy_properties_area ON nawy_properties USING GIN (area);
CREATE INDEX idx_nawy_properties_property_type ON nawy_properties USING GIN (property_type);
CREATE INDEX idx_nawy_properties_sale_type ON nawy_properties (sale_type);
CREATE INDEX idx_nawy_properties_is_launch ON nawy_properties (is_launch);
CREATE INDEX idx_nawy_properties_price ON nawy_properties (price_in_egp);
CREATE INDEX idx_nawy_properties_bedrooms ON nawy_properties (number_of_bedrooms);
CREATE INDEX idx_nawy_properties_ready_by ON nawy_properties (ready_by);

-- Step 3: Grant permissions
GRANT ALL ON nawy_properties TO authenticated;
GRANT ALL ON nawy_properties TO anon;

-- Step 4: Verify table creation
SELECT 'Table created successfully!' as status;
SELECT COUNT(*) as total_rows FROM nawy_properties;



-- Run this in Supabase SQL Editor first
-- =====================================================

-- Step 1: Create new table with proper structure
CREATE TABLE nawy_properties (
    id BIGINT PRIMARY KEY,
    unit_id TEXT,
    original_unit_id TEXT,
    sale_type TEXT,
    unit_number TEXT,
    unit_area NUMERIC(10,2),
    number_of_bedrooms INTEGER,
    number_of_bathrooms INTEGER,
    ready_by TIMESTAMPTZ,
    finishing TEXT,
    garden_area NUMERIC(10,2),
    roof_area NUMERIC(10,2),
    floor_number NUMERIC(5,1),
    building_number TEXT,
    price_per_meter NUMERIC(15,2),
    price_in_egp NUMERIC(15,2),
    last_inventory_update TIMESTAMPTZ,
    currency TEXT,
    payment_plans JSONB,
    image TEXT,
    offers JSONB,
    is_launch BOOLEAN,
    compound JSONB,
    area JSONB,
    developer JSONB,
    phase JSONB,
    property_type JSONB
);

-- Step 2: Create indexes for better performance
CREATE INDEX idx_nawy_properties_developer ON nawy_properties USING GIN (developer);
CREATE INDEX idx_nawy_properties_compound ON nawy_properties USING GIN (compound);
CREATE INDEX idx_nawy_properties_area ON nawy_properties USING GIN (area);
CREATE INDEX idx_nawy_properties_property_type ON nawy_properties USING GIN (property_type);
CREATE INDEX idx_nawy_properties_sale_type ON nawy_properties (sale_type);
CREATE INDEX idx_nawy_properties_is_launch ON nawy_properties (is_launch);
CREATE INDEX idx_nawy_properties_price ON nawy_properties (price_in_egp);
CREATE INDEX idx_nawy_properties_bedrooms ON nawy_properties (number_of_bedrooms);
CREATE INDEX idx_nawy_properties_ready_by ON nawy_properties (ready_by);

-- Step 3: Grant permissions
GRANT ALL ON nawy_properties TO authenticated;
GRANT ALL ON nawy_properties TO anon;

-- Step 4: Verify table creation
SELECT 'Table created successfully!' as status;
SELECT COUNT(*) as total_rows FROM nawy_properties;


