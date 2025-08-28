-- Check if ready_by column has data
-- Run this in your Supabase SQL Editor

-- Check if column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'brdata_properties' 
AND column_name = 'ready_by';

-- Check sample data
SELECT id, ready_by 
FROM brdata_properties 
ORDER BY id 
LIMIT 20;

-- Count properties with and without delivery dates
SELECT 
    COUNT(*) as total_properties,
    COUNT(ready_by) as properties_with_delivery,
    COUNT(*) - COUNT(ready_by) as properties_without_delivery
FROM brdata_properties;

-- Check unique delivery values
SELECT 
    ready_by,
    COUNT(*) as count
FROM brdata_properties 
WHERE ready_by IS NOT NULL
GROUP BY ready_by
ORDER BY count DESC
LIMIT 20;

-- Test delivery filter (YEARS ONLY)
SELECT COUNT(*) as properties_2025
FROM brdata_properties 
WHERE ready_by = '2025';

SELECT COUNT(*) as properties_ready
FROM brdata_properties 
WHERE ready_by = 'Ready';

-- Check distribution of years
SELECT 
    ready_by,
    COUNT(*) as count
FROM brdata_properties 
WHERE ready_by IS NOT NULL
GROUP BY ready_by
ORDER BY ready_by;
