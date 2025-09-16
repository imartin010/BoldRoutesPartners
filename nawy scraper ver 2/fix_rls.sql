-- Fix RLS policy to allow inserts
-- Run this in Supabase SQL Editor

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Allow public read access" ON nawy_properties;

-- Create a policy that allows both read and insert
CREATE POLICY "Allow public access" ON nawy_properties
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Alternatively, you can temporarily disable RLS completely:
-- ALTER TABLE nawy_properties DISABLE ROW LEVEL SECURITY;

SELECT 'RLS policy fixed - imports should work now!' as message;















