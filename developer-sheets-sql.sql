-- =====================================================
-- SQL QUERIES TO CREATE DEVELOPER-SPECIFIC SHEETS
-- Based on brdata_properties table structure
-- =====================================================

-- First, let's get all unique developers from the database
-- This will show you all available developers to create sheets for

SELECT 
    developer->>'name' as developer_name,
    COUNT(*) as total_properties,
    MIN(price_in_egp) as min_price,
    MAX(price_in_egp) as max_price,
    AVG(price_in_egp) as avg_price,
    COUNT(DISTINCT compound->>'name') as unique_compounds,
    COUNT(DISTINCT area->>'name') as unique_areas
FROM brdata_properties 
WHERE developer->>'name' IS NOT NULL
GROUP BY developer->>'name'
ORDER BY total_properties DESC;

-- =====================================================
-- METHOD 1: CREATE VIEWS for each developer (Recommended)
-- Views are virtual tables that automatically update when the main table changes
-- =====================================================

-- Create a view for Mountain View properties
CREATE OR REPLACE VIEW mountain_view_properties AS
SELECT 
    id,
    unit_id,
    original_unit_id,
    sale_type,
    unit_number,
    unit_area,
    number_of_bedrooms,
    number_of_bathrooms,
    ready_by,
    finishing,
    garden_area,
    roof_area,
    floor_number,
    building_number,
    price_per_meter,
    price_in_egp,
    last_inventory_update,
    currency,
    payment_plans,
    image,
    offers,
    is_launch,
    compound->>'name' as compound_name,
    area->>'name' as area_name,
    developer->>'name' as developer_name,
    phase->>'name' as phase_name,
    property_type->>'name' as property_type_name
FROM brdata_properties 
WHERE developer->>'name' ILIKE '%Mountain View%'
ORDER BY compound->>'name', unit_id;

-- Create a view for EMAAR properties
CREATE OR REPLACE VIEW emaar_properties AS
SELECT 
    id,
    unit_id,
    original_unit_id,
    sale_type,
    unit_number,
    unit_area,
    number_of_bedrooms,
    number_of_bathrooms,
    ready_by,
    finishing,
    garden_area,
    roof_area,
    floor_number,
    building_number,
    price_per_meter,
    price_in_egp,
    last_inventory_update,
    currency,
    payment_plans,
    image,
    offers,
    is_launch,
    compound->>'name' as compound_name,
    area->>'name' as area_name,
    developer->>'name' as developer_name,
    phase->>'name' as phase_name,
    property_type->>'name' as property_type_name
FROM brdata_properties 
WHERE developer->>'name' ILIKE '%EMAAR%'
ORDER BY compound->>'name', unit_id;

-- Create a view for SODIC properties
CREATE OR REPLACE VIEW sodic_properties AS
SELECT 
    id,
    unit_id,
    original_unit_id,
    sale_type,
    unit_number,
    unit_area,
    number_of_bedrooms,
    number_of_bathrooms,
    ready_by,
    finishing,
    garden_area,
    roof_area,
    floor_number,
    building_number,
    price_per_meter,
    price_in_egp,
    last_inventory_update,
    currency,
    payment_plans,
    image,
    offers,
    is_launch,
    compound->>'name' as compound_name,
    area->>'name' as area_name,
    developer->>'name' as developer_name,
    phase->>'name' as phase_name,
    property_type->>'name' as property_type_name
FROM brdata_properties 
WHERE developer->>'name' ILIKE '%SODIC%'
ORDER BY compound->>'name', unit_id;

-- Create a view for ORA properties
CREATE OR REPLACE VIEW ora_properties AS
SELECT 
    id,
    unit_id,
    original_unit_id,
    sale_type,
    unit_number,
    unit_area,
    number_of_bedrooms,
    number_of_bathrooms,
    ready_by,
    finishing,
    garden_area,
    roof_area,
    floor_number,
    building_number,
    price_per_meter,
    price_in_egp,
    last_inventory_update,
    currency,
    payment_plans,
    image,
    offers,
    is_launch,
    compound->>'name' as compound_name,
    area->>'name' as area_name,
    developer->>'name' as developer_name,
    phase->>'name' as phase_name,
    property_type->>'name' as property_type_name
FROM brdata_properties 
WHERE developer->>'name' ILIKE '%ORA%'
ORDER BY compound->>'name', unit_id;

-- Create a view for Palm Hills properties
CREATE OR REPLACE VIEW palm_hills_properties AS
SELECT 
    id,
    unit_id,
    original_unit_id,
    sale_type,
    unit_number,
    unit_area,
    number_of_bedrooms,
    number_of_bathrooms,
    ready_by,
    finishing,
    garden_area,
    roof_area,
    floor_number,
    building_number,
    price_per_meter,
    price_in_egp,
    last_inventory_update,
    currency,
    payment_plans,
    image,
    offers,
    is_launch,
    compound->>'name' as compound_name,
    area->>'name' as area_name,
    developer->>'name' as developer_name,
    phase->>'name' as phase_name,
    property_type->>'name' as property_type_name
FROM brdata_properties 
WHERE developer->>'name' ILIKE '%Palm Hills%'
ORDER BY compound->>'name', unit_id;

-- =====================================================
-- METHOD 2: DYNAMIC QUERY GENERATOR
-- Use this to create views for ALL developers automatically
-- =====================================================

-- This query generates CREATE VIEW statements for all developers
SELECT 
    'CREATE OR REPLACE VIEW ' || 
    LOWER(REPLACE(REPLACE(REPLACE(developer->>'name', ' ', '_'), '.', ''), '&', 'and')) || 
    '_properties AS
SELECT 
    id, unit_id, original_unit_id, sale_type, unit_number, unit_area,
    number_of_bedrooms, number_of_bathrooms, ready_by, finishing,
    garden_area, roof_area, floor_number, building_number,
    price_per_meter, price_in_egp, last_inventory_update, currency,
    payment_plans, image, offers, is_launch,
    compound->>''name'' as compound_name,
    area->>''name'' as area_name,
    developer->>''name'' as developer_name,
    phase->>''name'' as phase_name,
    property_type->>''name'' as property_type_name
FROM brdata_properties 
WHERE developer->>''name'' = ''' || developer->>'name' || '''
ORDER BY compound->>''name'', unit_id;' as create_view_sql
FROM (
    SELECT DISTINCT developer->>'name' as developer_name, developer
    FROM brdata_properties 
    WHERE developer->>'name' IS NOT NULL
    AND developer->>'name' != ''
) developers
ORDER BY developer_name;

-- =====================================================
-- METHOD 3: EXPORT QUERIES for CSV/Excel sheets
-- Use these to export data for each developer
-- =====================================================

-- Export Mountain View properties
SELECT 
    developer->>'name' as Developer,
    compound->>'name' as Project,
    area->>'name' as Area,
    property_type->>'name' as Type,
    unit_id as "Unit ID",
    unit_number as "Unit Number",
    unit_area as "Area (sqm)",
    number_of_bedrooms as Bedrooms,
    number_of_bathrooms as Bathrooms,
    price_in_egp as "Price (EGP)",
    price_per_meter as "Price per sqm",
    finishing as Finishing,
    ready_by as "Ready By",
    sale_type as "Sale Type",
    floor_number as Floor,
    building_number as Building,
    garden_area as "Garden Area",
    roof_area as "Roof Area",
    is_launch as "Is Launch"
FROM brdata_properties 
WHERE developer->>'name' ILIKE '%Mountain View%'
ORDER BY compound->>'name', unit_id;

-- =====================================================
-- METHOD 4: CREATE FILTERED TABLES (if you need physical copies)
-- Warning: These create actual tables that won't update automatically
-- =====================================================

-- Create a physical table for Mountain View (example)
CREATE TABLE mountain_view_data AS
SELECT 
    id,
    unit_id,
    original_unit_id,
    sale_type,
    unit_number,
    unit_area,
    number_of_bedrooms,
    number_of_bathrooms,
    ready_by,
    finishing,
    garden_area,
    roof_area,
    floor_number,
    building_number,
    price_per_meter,
    price_in_egp,
    last_inventory_update,
    currency,
    payment_plans,
    image,
    offers,
    is_launch,
    compound->>'name' as compound_name,
    area->>'name' as area_name,
    developer->>'name' as developer_name,
    phase->>'name' as phase_name,
    property_type->>'name' as property_type_name
FROM brdata_properties 
WHERE developer->>'name' ILIKE '%Mountain View%';

-- =====================================================
-- UTILITY QUERIES
-- =====================================================

-- List all created views
SELECT schemaname, viewname, viewowner
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname LIKE '%_properties';

-- Get row counts for each developer view
SELECT 
    'mountain_view_properties' as view_name,
    COUNT(*) as row_count
FROM mountain_view_properties
UNION ALL
SELECT 
    'emaar_properties' as view_name,
    COUNT(*) as row_count
FROM emaar_properties
UNION ALL
SELECT 
    'sodic_properties' as view_name,
    COUNT(*) as row_count
FROM sodic_properties
UNION ALL
SELECT 
    'ora_properties' as view_name,
    COUNT(*) as row_count
FROM ora_properties
UNION ALL
SELECT 
    'palm_hills_properties' as view_name,
    COUNT(*) as row_count
FROM palm_hills_properties;

-- =====================================================
-- PERMISSIONS (run if needed)
-- =====================================================

-- Grant select permissions on all developer views
GRANT SELECT ON mountain_view_properties TO authenticated, anon;
GRANT SELECT ON emaar_properties TO authenticated, anon;
GRANT SELECT ON sodic_properties TO authenticated, anon;
GRANT SELECT ON ora_properties TO authenticated, anon;
GRANT SELECT ON palm_hills_properties TO authenticated, anon;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Query Mountain View properties
-- SELECT * FROM mountain_view_properties WHERE compound_name LIKE '%Aliva%';

-- Get summary statistics for a developer
-- SELECT 
--     developer_name,
--     COUNT(*) as total_units,
--     COUNT(DISTINCT compound_name) as total_projects,
--     AVG(price_in_egp) as avg_price,
--     MIN(price_in_egp) as min_price,
--     MAX(price_in_egp) as max_price
-- FROM mountain_view_properties
-- GROUP BY developer_name;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Method 1 (Views) is recommended as they stay up-to-date automatically
-- 2. Use Method 2 to generate views for all developers dynamically  
-- 3. Use Method 3 queries for CSV/Excel exports
-- 4. Method 4 creates static copies (use only if needed)
-- 5. Views can be queried just like regular tables
-- 6. Views don't take up storage space like physical tables
-- =====================================================