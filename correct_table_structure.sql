-- =====================================================
-- CORRECT BRDATA PROPERTIES TABLE STRUCTURE
-- Matches your CSV exactly - 27 columns
-- =====================================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS brdata_properties CASCADE;

-- Create new table with EXACT CSV structure
CREATE TABLE brdata_properties (
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

-- Create indexes for better performance
CREATE INDEX idx_brdata_properties_sale_type ON brdata_properties (sale_type);
CREATE INDEX idx_brdata_properties_is_launch ON brdata_properties (is_launch);
CREATE INDEX idx_brdata_properties_price ON brdata_properties (price_in_egp);
CREATE INDEX idx_brdata_properties_bedrooms ON brdata_properties (number_of_bedrooms);
CREATE INDEX idx_brdata_properties_ready_by ON brdata_properties (ready_by);
CREATE INDEX idx_brdata_properties_unit_area ON brdata_properties (unit_area);

-- JSON field indexes (GIN for fast JSON queries)
CREATE INDEX idx_brdata_properties_developer ON brdata_properties USING GIN (developer);
CREATE INDEX idx_brdata_properties_compound ON brdata_properties USING GIN (compound);
CREATE INDEX idx_brdata_properties_area ON brdata_properties USING GIN (area);
CREATE INDEX idx_brdata_properties_property_type ON brdata_properties USING GIN (property_type);
CREATE INDEX idx_brdata_properties_payment_plans ON brdata_properties USING GIN (payment_plans);

-- Grant permissions
GRANT ALL ON brdata_properties TO authenticated;
GRANT ALL ON brdata_properties TO anon;

-- Enable Row Level Security (optional)
ALTER TABLE brdata_properties ENABLE ROW LEVEL SECURITY;

-- Allow public read access (you can restrict this later)
CREATE POLICY "Allow public read access" ON brdata_properties FOR SELECT TO anon, authenticated USING (true);

-- Success message
SELECT 'Table brdata_properties created successfully with correct structure!' as message;
SELECT COUNT(*) as total_rows FROM brdata_properties;




