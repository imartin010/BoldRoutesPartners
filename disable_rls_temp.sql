-- Temporarily disable RLS for data import
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn/sql/new

ALTER TABLE nawy_properties DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled for import!' as message;












