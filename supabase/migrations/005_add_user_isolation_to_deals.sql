-- Migration: Add user isolation to deals
-- Created: 2024-12-19
-- Purpose: Ensure partners can only see and manage their own deals

-- Add partner_id column to closed_deals table
ALTER TABLE closed_deals 
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS ix_closed_deals_partner_id 
ON closed_deals (partner_id);

-- Update existing deals to have a default partner (if any exist)
-- This is a one-time migration for existing data
UPDATE closed_deals 
SET partner_id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@bold-routes.com' 
  LIMIT 1
)
WHERE partner_id IS NULL;

-- Add NOT NULL constraint after updating existing records
ALTER TABLE closed_deals 
ALTER COLUMN partner_id SET NOT NULL;

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "admin_can_select_deals" ON closed_deals;
DROP POLICY IF EXISTS "admin_can_update_deals" ON closed_deals;

-- Create new user-isolated policies

-- Partners can only see their own deals
CREATE POLICY "partners_can_select_own_deals" 
ON closed_deals FOR SELECT 
TO authenticated
USING (partner_id = auth.uid());

-- Partners can only insert deals for themselves
CREATE POLICY "partners_can_insert_own_deals" 
ON closed_deals FOR INSERT 
TO authenticated
WITH CHECK (partner_id = auth.uid());

-- Partners can only update their own deals
CREATE POLICY "partners_can_update_own_deals" 
ON closed_deals FOR UPDATE 
TO authenticated
USING (partner_id = auth.uid())
WITH CHECK (partner_id = auth.uid());

-- Partners can only delete their own deals
CREATE POLICY "partners_can_delete_own_deals" 
ON closed_deals FOR DELETE 
TO authenticated
USING (partner_id = auth.uid());

-- Admin users can see all deals (for management purposes)
CREATE POLICY "admin_can_select_all_deals" 
ON closed_deals FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Admin users can update any deal
CREATE POLICY "admin_can_update_all_deals" 
ON closed_deals FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Add comment for documentation
COMMENT ON COLUMN closed_deals.partner_id IS 'ID of the partner who created this deal';
COMMENT ON INDEX ix_closed_deals_partner_id IS 'Index for partner-specific deal queries';
