-- Simple script to add ready_by column to brdata_properties table
-- Run this in your Supabase SQL Editor

-- Step 1: Add the ready_by column
ALTER TABLE brdata_properties 
ADD COLUMN IF NOT EXISTS ready_by TEXT;

-- Step 2: Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_brdata_properties_ready_by 
ON brdata_properties(ready_by);

-- Step 3: Populate with sample delivery dates (YEARS ONLY)
-- This will distribute delivery years across your properties
UPDATE brdata_properties 
SET ready_by = CASE 
    WHEN id % 7 = 0 THEN 'Ready'
    WHEN id % 7 = 1 THEN '2025'
    WHEN id % 7 = 2 THEN '2026'
    WHEN id % 7 = 3 THEN '2027'
    WHEN id % 7 = 4 THEN '2028'
    WHEN id % 7 = 5 THEN '2029'
    WHEN id % 7 = 6 THEN '2030'
END
WHERE ready_by IS NULL;

-- Step 4: Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'brdata_properties' 
AND column_name = 'ready_by';

-- Step 5: Check sample data
SELECT id, ready_by 
FROM brdata_properties 
ORDER BY id 
LIMIT 20;








