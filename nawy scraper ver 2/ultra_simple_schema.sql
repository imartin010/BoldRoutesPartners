-- Ultra Simple Schema (no complex indexes)
DROP TABLE IF EXISTS nawy_properties CASCADE;

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
    compound JSONB,
    area JSONB,
    developer JSONB,
    property_type JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only basic indexes
CREATE INDEX idx_nawy_properties_nawy_id ON nawy_properties(nawy_id);
CREATE INDEX idx_nawy_properties_price ON nawy_properties(price_in_egp);

-- Enable RLS and public access
ALTER TABLE nawy_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON nawy_properties FOR SELECT TO anon, authenticated USING (true);

SELECT 'Ultra simple table created successfully!' as message;












