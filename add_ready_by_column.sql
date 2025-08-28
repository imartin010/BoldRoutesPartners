-- Add ready_by column to brdata_properties table
-- This column will store delivery dates for properties

ALTER TABLE brdata_properties 
ADD COLUMN ready_by TEXT;

-- Add an index for better performance when filtering by delivery date
CREATE INDEX idx_brdata_properties_ready_by ON brdata_properties(ready_by);

-- Update existing records with sample delivery dates (optional)
-- You can modify these values based on your actual data
UPDATE brdata_properties 
SET ready_by = CASE 
    WHEN id % 10 = 0 THEN 'Ready'
    WHEN id % 10 = 1 THEN '2025'
    WHEN id % 10 = 2 THEN '2026'
    WHEN id % 10 = 3 THEN '2027'
    WHEN id % 10 = 4 THEN '2028'
    WHEN id % 10 = 5 THEN '2029'
    WHEN id % 10 = 6 THEN '2030'
    WHEN id % 10 = 7 THEN '2025-12-15'
    WHEN id % 10 = 8 THEN '2026-06-01'
    WHEN id % 10 = 9 THEN '2027-03-15'
END
WHERE ready_by IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'brdata_properties' 
AND column_name = 'ready_by';
