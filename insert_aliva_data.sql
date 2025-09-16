-- Insert missing Aliva properties directly into Supabase database
-- Run this in your Supabase SQL Editor

-- First, let's check if any Aliva data exists
SELECT COUNT(*) as aliva_count 
FROM brdata_properties 
WHERE compound ILIKE '%aliva%';

-- Insert sample Aliva properties to test the system
-- These are based on the data we found in your CSV

INSERT INTO brdata_properties (
  unit_id, unit_number, unit_area, number_of_bedrooms, number_of_bathrooms,
  price_per_meter, price_in_egp, currency, finishing, is_launch,
  compound, area, developer, property_type, payment_plans, ready_by
) VALUES 
-- Club Park - Aliva (52 units in CSV)
('ALV001', 'A101', 120.5, 2, 2, 25000, 3012500, 'EGP', 'Semi-finished', true,
 '{"id": 1358, "name": "Club Park - Aliva"}', 
 '{"id": 15, "name": "Mostakbal City"}',
 '{"id": 15, "name": "Mountain View"}',
 '{"id": 37, "name": "Apartment"}',
 '[{"downPayment": "15%", "monthlyPayment": "8500", "years": "8"}]',
 '2025'),

('ALV002', 'A102', 135.0, 3, 2, 24000, 3240000, 'EGP', 'Semi-finished', true,
 '{"id": 1358, "name": "Club Park - Aliva"}', 
 '{"id": 15, "name": "Mostakbal City"}',
 '{"id": 15, "name": "Mountain View"}',
 '{"id": 37, "name": "Apartment"}',
 '[{"downPayment": "20%", "monthlyPayment": "9200", "years": "8"}]',
 '2025'),

-- Aliva Mountain View Mostakbal City (393 units in CSV)
('ALV003', 'B201', 95.0, 2, 1, 28000, 2660000, 'EGP', 'Finished', true,
 '{"id": 825, "name": "Aliva Mountain View Mostakbal City"}', 
 '{"id": 15, "name": "Mostakbal City"}',
 '{"id": 15, "name": "Mountain View"}',
 '{"id": 37, "name": "Apartment"}',
 '[{"downPayment": "10%", "monthlyPayment": "7500", "years": "10"}]',
 '2026'),

('ALV004', 'B202', 110.0, 2, 2, 27000, 2970000, 'EGP', 'Finished', true,
 '{"id": 825, "name": "Aliva Mountain View Mostakbal City"}', 
 '{"id": 15, "name": "Mostakbal City"}',
 '{"id": 15, "name": "Mountain View"}',
 '{"id": 37, "name": "Apartment"}',
 '[{"downPayment": "15%", "monthlyPayment": "8200", "years": "9"}]',
 '2026'),

-- Lagoon Beach Park - Aliva (207 units in CSV)
('ALV005', 'C301', 140.0, 3, 2, 26000, 3640000, 'EGP', 'Semi-finished', true,
 '{"id": 1359, "name": "Lagoon Beach Park - Aliva"}', 
 '{"id": 15, "name": "Mostakbal City"}',
 '{"id": 15, "name": "Mountain View"}',
 '{"id": 46, "name": "Townhouse"}',
 '[{"downPayment": "20%", "monthlyPayment": "10500", "years": "8"}]',
 '2027'),

('ALV006', 'C302', 155.0, 3, 3, 25500, 3952500, 'EGP', 'Semi-finished', true,
 '{"id": 1359, "name": "Lagoon Beach Park - Aliva"}', 
 '{"id": 15, "name": "Mostakbal City"}',
 '{"id": 15, "name": "Mountain View"}',
 '{"id": 46, "name": "Townhouse"}',
 '[{"downPayment": "25%", "monthlyPayment": "11200", "years": "7"}]',
 '2027'),

-- Central Park - Aliva (82 units in CSV)
('ALV007', 'D401', 85.0, 1, 1, 30000, 2550000, 'EGP', 'Finished', true,
 '{"id": 1357, "name": "Central Park - Aliva"}', 
 '{"id": 15, "name": "Mostakbal City"}',
 '{"id": 15, "name": "Mountain View"}',
 '{"id": 37, "name": "Apartment"}',
 '[{"downPayment": "15%", "monthlyPayment": "6800", "years": "10"}]',
 '2025'),

('ALV008', 'D402', 100.0, 2, 1, 29000, 2900000, 'EGP', 'Finished', true,
 '{"id": 1357, "name": "Central Park - Aliva"}', 
 '{"id": 15, "name": "Mostakbal City"}',
 '{"id": 15, "name": "Mountain View"}',
 '{"id": 37, "name": "Apartment"}',
 '[{"downPayment": "20%", "monthlyPayment": "7500", "years": "9"}]',
 '2025');

-- Verify the insert
SELECT 
  compound,
  COUNT(*) as units_added
FROM brdata_properties 
WHERE compound ILIKE '%aliva%'
GROUP BY compound
ORDER BY compound;

-- Check total count after insert
SELECT COUNT(*) as total_properties FROM brdata_properties;







