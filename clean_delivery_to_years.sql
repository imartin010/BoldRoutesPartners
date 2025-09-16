-- Clean up delivery data to only show years (no months or full dates)
-- Run this in your Supabase SQL Editor

-- Step 1: Update existing data to only show years
UPDATE brdata_properties 
SET ready_by = CASE 
    WHEN ready_by ILIKE '%2025%' THEN '2025'
    WHEN ready_by ILIKE '%2026%' THEN '2026'
    WHEN ready_by ILIKE '%2027%' THEN '2027'
    WHEN ready_by ILIKE '%2028%' THEN '2028'
    WHEN ready_by ILIKE '%2029%' THEN '2029'
    WHEN ready_by ILIKE '%2030%' THEN '2030'
    WHEN ready_by ILIKE '%ready%' THEN 'Ready'
    ELSE '2025' -- Default for any other values
END
WHERE ready_by IS NOT NULL;

-- Step 2: Verify the cleanup
SELECT 
    ready_by,
    COUNT(*) as count
FROM brdata_properties 
WHERE ready_by IS NOT NULL
GROUP BY ready_by
ORDER BY ready_by;

-- Step 3: Check total count
SELECT 
    COUNT(*) as total_properties,
    COUNT(ready_by) as properties_with_delivery
FROM brdata_properties;







