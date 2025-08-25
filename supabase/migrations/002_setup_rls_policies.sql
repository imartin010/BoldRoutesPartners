-- Migration: Setup Row Level Security Policies
-- Created: 2024-12-19
-- Purpose: Implement proper RLS for data security

-- Enable RLS on all user-generated tables
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE closed_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "anon_can_insert_applications" ON partner_applications;
DROP POLICY IF EXISTS "admin_can_select_applications" ON partner_applications;
DROP POLICY IF EXISTS "anon_can_insert_deals" ON closed_deals;
DROP POLICY IF EXISTS "admin_can_select_deals" ON closed_deals;
DROP POLICY IF EXISTS "users_can_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_can_read_all_profiles" ON profiles;

-- Partner Applications Policies
-- Anonymous users can only insert (submit applications)
CREATE POLICY "anon_can_insert_applications" 
ON partner_applications FOR INSERT 
TO anon
WITH CHECK (true);

-- Authenticated admin users can select all applications
CREATE POLICY "admin_can_select_applications" 
ON partner_applications FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Authenticated admin users can update application status
CREATE POLICY "admin_can_update_applications" 
ON partner_applications FOR UPDATE 
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

-- Closed Deals Policies
-- Anonymous users can only insert (submit deals)
CREATE POLICY "anon_can_insert_deals" 
ON closed_deals FOR INSERT 
TO anon
WITH CHECK (true);

-- Authenticated admin users can select all deals
CREATE POLICY "admin_can_select_deals" 
ON closed_deals FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Authenticated admin users can update deal review status
CREATE POLICY "admin_can_update_deals" 
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

-- Profiles Policies
-- Users can read their own profile
CREATE POLICY "users_can_read_own_profile" 
ON profiles FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- Users can update their own profile (except role)
CREATE POLICY "users_can_update_own_profile" 
ON profiles FOR UPDATE 
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() 
  AND (
    OLD.role = NEW.role -- Role cannot be changed by user
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin' -- Unless they are admin
    )
  )
);

-- Admin users can read all profiles
CREATE POLICY "admin_can_read_all_profiles" 
ON profiles FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Storage Policies for deal-attachments bucket
-- Drop existing storage policies
DROP POLICY IF EXISTS "anon_can_upload_deal_files" ON storage.objects;
DROP POLICY IF EXISTS "admin_can_download_deal_files" ON storage.objects;

-- Anonymous users can only upload to deals/ prefix
CREATE POLICY "anon_upload_only_to_deals_prefix"
ON storage.objects FOR INSERT 
TO anon
WITH CHECK (
  bucket_id = 'deal-attachments' 
  AND (storage.foldername(name))[1] = 'deals'
);

-- Admin users can select (download) files
CREATE POLICY "admin_can_download_deal_files"
ON storage.objects FOR SELECT 
TO authenticated
USING (
  bucket_id = 'deal-attachments'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Additional security: Add file size limits via storage config
-- Note: This would typically be done in Supabase dashboard or via API
-- Maximum file size: 10MB per file
-- File type restrictions: PDF, DOC, DOCX, JPG, PNG only

-- Create audit table for tracking admin actions (optional but recommended)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admin can read audit logs
CREATE POLICY "admin_can_read_audit_log" 
ON audit_log FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS ix_audit_log_created_at 
ON audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_audit_log_user_action 
ON audit_log (user_id, action);

-- Comments for documentation
COMMENT ON TABLE audit_log IS 'Tracks all admin actions for security auditing';
COMMENT ON POLICY "anon_can_insert_applications" ON partner_applications IS 'Allow public application submissions';
COMMENT ON POLICY "admin_can_select_applications" ON partner_applications IS 'Restrict application viewing to admin users only';
COMMENT ON POLICY "anon_upload_only_to_deals_prefix" ON storage.objects IS 'Restrict file uploads to deals/ folder only';
