-- Migration: Setup Email Notifications for Form Submissions
-- Created: 2024-12-19
-- Purpose: Automatically send email notifications to Themartining@gmail.com for all submissions

-- Enable the HTTP extension to make Edge Function calls
CREATE EXTENSION IF NOT EXISTS http;

-- Create function to send application notification
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
        'data', row_to_json(NEW),
        'submitted_at', NOW()
      )
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to send deal notification
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
        'data', row_to_json(NEW),
        'submitted_at', NOW()
      )
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers that fire after INSERT
DROP TRIGGER IF EXISTS trigger_notify_new_application ON partner_applications;
CREATE TRIGGER trigger_notify_new_application
  AFTER INSERT ON partner_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_application();

DROP TRIGGER IF EXISTS trigger_notify_new_deal ON closed_deals;
CREATE TRIGGER trigger_notify_new_deal
  AFTER INSERT ON closed_deals
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_deal();

-- Create a notification log table to track sent emails
CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type TEXT NOT NULL CHECK (submission_type IN ('application', 'deal')),
  submission_id UUID NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  email_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS to notification log (admin only)
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_can_read_notification_log" 
ON notification_log FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS ix_notification_log_created_at 
ON notification_log (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_notification_log_submission 
ON notification_log (submission_type, submission_id);

-- Alternative approach: Manual email sending function for testing
CREATE OR REPLACE FUNCTION send_test_notification(
  p_type TEXT,
  p_submission_id UUID
)
RETURNS JSON AS $$
DECLARE
  submission_data JSON;
  result JSON;
BEGIN
  -- Get the submission data
  IF p_type = 'application' THEN
    SELECT row_to_json(partner_applications.*)
    INTO submission_data
    FROM partner_applications
    WHERE id = p_submission_id;
  ELSIF p_type = 'deal' THEN
    SELECT row_to_json(closed_deals.*)
    INTO submission_data
    FROM closed_deals
    WHERE id = p_submission_id;
  ELSE
    RETURN json_build_object('error', 'Invalid submission type');
  END IF;
  
  IF submission_data IS NULL THEN
    RETURN json_build_object('error', 'Submission not found');
  END IF;
  
  -- Call the Edge Function
  SELECT content::json INTO result
  FROM http_post(
    'https://mdqqqogshgtpzxtufjzn.supabase.co/functions/v1/send-notification-email',
    jsonb_build_object(
      'type', p_type,
      'data', submission_data,
      'submitted_at', NOW()
    ),
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcXFxb2dzaGd0cHp4dHVmanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5MjUsImV4cCI6MjA3MTY5MjkyNX0.CmxAoMsKcjNWX3FIea-yfOHSD3lkEtw0vCFmDgVfgq8')
    ]
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION net.http_post TO postgres, anon, authenticated, service_role;

-- Comments for documentation
COMMENT ON FUNCTION notify_new_application() IS 'Automatically sends email notification when new partner application is submitted';
COMMENT ON FUNCTION notify_new_deal() IS 'Automatically sends email notification when new deal is submitted';
COMMENT ON FUNCTION send_test_notification(TEXT, UUID) IS 'Manually send notification email for testing purposes';
COMMENT ON TABLE notification_log IS 'Tracks all email notifications sent for form submissions';

-- Usage examples (for testing):
-- 
-- Test manual notification after inserting data:
-- SELECT send_test_notification('application', 'uuid-of-application');
-- SELECT send_test_notification('deal', 'uuid-of-deal');
--
-- View notification log:
-- SELECT * FROM notification_log ORDER BY created_at DESC;
