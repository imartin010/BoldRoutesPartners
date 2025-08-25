-- RLS Security Test Suite
-- Tests Row Level Security policies are working correctly
-- Run this script with different user contexts to verify security

-- Test setup: Create test data
BEGIN;

-- Insert test developer and project
INSERT INTO developers (id, name, logo, primaryPhone) 
VALUES ('d1234567-1234-1234-1234-123456789012', 'Test Developer', null, '+201234567890')
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, developer_id, name, description)
VALUES ('p1234567-1234-1234-1234-123456789012', 'd1234567-1234-1234-1234-123456789012', 'Test Project', 'Test Description')
ON CONFLICT (id) DO NOTHING;

-- Test Case 1: Anonymous users can submit applications
-- Expected: SUCCESS
INSERT INTO partner_applications (
  full_name, phone, company_name, agents_count, has_papers
) VALUES (
  'Test User', '+201234567890', 'Test Company', 5, true
);

-- Test Case 2: Anonymous users cannot read applications
-- Expected: NO ROWS (policy should block)
SELECT 'Test 2 - Anon read applications:' as test_name, count(*) as row_count 
FROM partner_applications;

-- Test Case 3: Anonymous users can submit deals
-- Expected: SUCCESS
INSERT INTO closed_deals (
  developer_name, project_name, client_name, unit_code,
  dev_sales_name, dev_phone, deal_value, attachments
) VALUES (
  'Test Developer', 'Test Project', 'Test Client', 'A101',
  'Sales Rep', '+201234567890', 1000000, '[]'::jsonb
);

-- Test Case 4: Anonymous users cannot read deals
-- Expected: NO ROWS (policy should block)
SELECT 'Test 4 - Anon read deals:' as test_name, count(*) as row_count 
FROM closed_deals;

ROLLBACK;

-- Test Case 5: Admin user can read all data
-- NOTE: This requires an authenticated session with admin role
-- Run separately with admin user context

/*
-- When running as authenticated admin user:
SELECT 'Test 5a - Admin read applications:' as test_name, count(*) as row_count 
FROM partner_applications;

SELECT 'Test 5b - Admin read deals:' as test_name, count(*) as row_count 
FROM closed_deals;

SELECT 'Test 5c - Admin read profiles:' as test_name, count(*) as row_count 
FROM profiles;
*/

-- Test Case 6: Regular authenticated user cannot read sensitive data
-- NOTE: Run with non-admin authenticated user

/*
-- When running as regular authenticated user:
SELECT 'Test 6a - User read applications:' as test_name, count(*) as row_count 
FROM partner_applications; -- Should return 0

SELECT 'Test 6b - User read deals:' as test_name, count(*) as row_count 
FROM closed_deals; -- Should return 0

SELECT 'Test 6c - User read own profile:' as test_name, count(*) as row_count 
FROM profiles WHERE id = auth.uid(); -- Should return 1

SELECT 'Test 6d - User read other profiles:' as test_name, count(*) as row_count 
FROM profiles WHERE id != auth.uid(); -- Should return 0
*/

-- Test Case 7: Validate constraints are working
BEGIN;

-- Test phone number validation
DO $$
BEGIN
  -- This should fail due to check constraint
  INSERT INTO partner_applications (
    full_name, phone, company_name, agents_count, has_papers
  ) VALUES (
    'Test User', 'invalid-phone', 'Test Company', 5, true
  );
  
  RAISE EXCEPTION 'Should not reach here - constraint should have failed';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE 'Test 7a PASSED - Phone validation constraint working';
  WHEN OTHERS THEN
    RAISE NOTICE 'Test 7a FAILED - Unexpected error: %', SQLERRM;
END $$;

-- Test deal value bounds
DO $$
BEGIN
  -- This should fail due to check constraint (negative value)
  INSERT INTO closed_deals (
    developer_name, project_name, client_name, unit_code,
    dev_sales_name, dev_phone, deal_value, attachments
  ) VALUES (
    'Test Developer', 'Test Project', 'Test Client', 'A101',
    'Sales Rep', '+201234567890', -1000, '[]'::jsonb
  );
  
  RAISE EXCEPTION 'Should not reach here - constraint should have failed';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE 'Test 7b PASSED - Deal value constraint working';
  WHEN OTHERS THEN
    RAISE NOTICE 'Test 7b FAILED - Unexpected error: %', SQLERRM;
END $$;

-- Test string length limits
DO $$
BEGIN
  -- This should fail due to check constraint (name too long)
  INSERT INTO partner_applications (
    full_name, phone, company_name, agents_count, has_papers
  ) VALUES (
    repeat('x', 101), '+201234567890', 'Test Company', 5, true
  );
  
  RAISE EXCEPTION 'Should not reach here - constraint should have failed';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE 'Test 7c PASSED - String length constraint working';
  WHEN OTHERS THEN
    RAISE NOTICE 'Test 7c FAILED - Unexpected error: %', SQLERRM;
END $$;

ROLLBACK;

-- Test results summary
SELECT 
  'RLS_TESTS_COMPLETED' as status,
  'Run this script with different user contexts to verify all policies' as note;

-- Manual validation checklist:
-- □ Anonymous users can INSERT into partner_applications and closed_deals
-- □ Anonymous users cannot SELECT from partner_applications and closed_deals  
-- □ Admin users can SELECT from all tables
-- □ Regular users can only SELECT their own profile
-- □ File upload policies restrict to deals/ prefix
-- □ All constraints prevent invalid data
-- □ Indexes exist and improve query performance
