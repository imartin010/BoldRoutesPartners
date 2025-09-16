-- Migration: Require Authentication for All Platform Access
-- Created: 2024-12-19
-- Purpose: Update RLS policies to require authentication for form submissions

-- Update partner applications policies to require authentication
DROP POLICY IF EXISTS "anon_can_insert_applications" ON partner_applications;

-- Only authenticated users can submit applications
CREATE POLICY "authenticated_can_insert_applications" 
ON partner_applications FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Update closed deals policies to require authentication  
DROP POLICY IF EXISTS "anon_can_insert_deals" ON closed_deals;

-- Only authenticated users can submit deals
CREATE POLICY "authenticated_can_insert_deals" 
ON closed_deals FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Update storage policies to require authentication for uploads
DROP POLICY IF EXISTS "anon_upload_only_to_deals_prefix" ON storage.objects;

-- Only authenticated users can upload files
CREATE POLICY "authenticated_upload_to_deals_prefix"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'deal-attachments' 
  AND (storage.foldername(name))[1] = 'deals'
);

-- Create a profiles entry for new authenticated users automatically
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'partner', -- Default role for new users
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update notification functions to work with authenticated users only
CREATE OR REPLACE FUNCTION notify_new_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function to send email notification
  PERFORM
    net.http_post(
      url := 'https://mdqqqogshgtpzxtufjzn.supabase.co/functions/v1/send-notification-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXFxb2dzaGd0cHp4dHVmanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5MjUsImV4cCI6MjA3MTY5MjkyNX0.CmxAoMsKcjNWX3FIea-yfOHSD3lkEtw0vCFmDgVfgq8'
      ),
      body := jsonb_build_object(
        'type', 'application',
        'data', row_to_json(NEW) || jsonb_build_object('submitted_by', auth.uid()),
        'submitted_at', NOW()
      )
    );
  
  -- Log the notification attempt
  INSERT INTO notification_log (submission_type, submission_id, email_sent, created_at)
  VALUES ('application', NEW.id, true, NOW());
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log failed notification
  INSERT INTO notification_log (submission_type, submission_id, email_sent, error_message, created_at)
  VALUES ('application', NEW.id, false, SQLERRM, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_new_deal()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function to send email notification
  PERFORM
    net.http_post(
      url := 'https://mdqqqogshgtpzxtufjzn.supabase.co/functions/v1/send-notification-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXFxb2dzaGd0cHp4dHVmanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5MjUsImV4cCI6MjA3MTY5MjkyNX0.CmxAoMsKcjNWX3FIea-yfOHSD3lkEtw0vCFmDgVfgq8'
      ),
      body := jsonb_build_object(
        'type', 'deal',
        'data', row_to_json(NEW) || jsonb_build_object('submitted_by', auth.uid()),
        'submitted_at', NOW()
      )
    );
  
  -- Log the notification attempt
  INSERT INTO notification_log (submission_type, submission_id, email_sent, created_at)
  VALUES ('deal', NEW.id, true, NOW());
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log failed notification
  INSERT INTO notification_log (submission_type, submission_id, email_sent, error_message, created_at)
  VALUES ('deal', NEW.id, false, SQLERRM, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add user tracking columns to track who submitted what
ALTER TABLE partner_applications 
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();

ALTER TABLE closed_deals 
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ix_partner_applications_submitted_by 
ON partner_applications (submitted_by);

CREATE INDEX IF NOT EXISTS ix_closed_deals_submitted_by 
ON closed_deals (submitted_by);

-- Allow users to see their own submissions
CREATE POLICY "users_can_read_own_applications" 
ON partner_applications FOR SELECT 
TO authenticated
USING (submitted_by = auth.uid());

CREATE POLICY "users_can_read_own_deals" 
ON closed_deals FOR SELECT 
TO authenticated
USING (submitted_by = auth.uid());

-- Admin can still see all submissions
-- (This policy should already exist from previous migration)

-- Comments for documentation
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates profile for new authenticated users';
COMMENT ON COLUMN partner_applications.submitted_by IS 'UUID of authenticated user who submitted the application';
COMMENT ON COLUMN closed_deals.submitted_by IS 'UUID of authenticated user who submitted the deal';

-- Create function to check if user is authenticated (for app use)
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_authenticated() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- Verification queries (for testing)
-- 
-- Check if RLS is working:
-- SELECT * FROM partner_applications; -- Should only show user's own or admin can see all
-- SELECT * FROM closed_deals; -- Should only show user's own or admin can see all
-- 
-- Check user authentication:
-- SELECT is_authenticated(); -- Should return true when authenticated
-- SELECT auth.uid(); -- Should return user's UUID when authenticated

