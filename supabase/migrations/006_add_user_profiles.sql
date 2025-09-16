-- Migration: Add user profiles table
-- Created: 2024-12-19
-- Purpose: Store user profile information collected after signup

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  company_manpower TEXT,
  address TEXT,
  date_of_birth DATE,
  national_id TEXT,
  joined_date TIMESTAMPTZ DEFAULT now(),
  profile_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS ix_user_profiles_user_id ON user_profiles (user_id);
CREATE INDEX IF NOT EXISTS ix_user_profiles_profile_completed ON user_profiles (profile_completed);

-- Add RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "users_can_select_own_profile" 
ON user_profiles FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "users_can_insert_own_profile" 
ON user_profiles FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_can_update_own_profile" 
ON user_profiles FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own profile
CREATE POLICY "users_can_delete_own_profile" 
ON user_profiles FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- Admin users can see all profiles
CREATE POLICY "admin_can_select_all_profiles" 
ON user_profiles FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'User profile information collected after signup';
COMMENT ON COLUMN user_profiles.profile_completed IS 'Whether user has completed their profile setup';
COMMENT ON COLUMN user_profiles.joined_date IS 'When user joined the platform';
