-- Completely disable RLS to allow imports
ALTER TABLE nawy_properties DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled - imports will work now!' as message;












