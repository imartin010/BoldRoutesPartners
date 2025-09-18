-- Migration: Update user_profiles for Bold Routes member system
-- Created: 2024-12-20
-- Purpose: Add Bold Routes membership fields and company registration tracking

-- Add new columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_bold_routes_member BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bold_routes_member_id TEXT,
ADD COLUMN IF NOT EXISTS employee_position TEXT,
ADD COLUMN IF NOT EXISTS company_registration_status TEXT DEFAULT 'not_registered' CHECK (company_registration_status IN ('not_registered', 'pending', 'approved', 'rejected'));

-- Remove old columns that are no longer needed
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS date_of_birth,
DROP COLUMN IF EXISTS national_id;

-- Update the table comment
COMMENT ON COLUMN user_profiles.is_bold_routes_member IS 'Whether user is already a Bold Routes member';
COMMENT ON COLUMN user_profiles.bold_routes_member_id IS 'Bold Routes member ID if already registered';
COMMENT ON COLUMN user_profiles.employee_position IS 'Employee position in the company';
COMMENT ON COLUMN user_profiles.company_registration_status IS 'Status: not_registered, pending, approved, rejected';

-- Create companies table for new company registrations
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    company_size TEXT,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create company_members table to track company employees
CREATE TABLE IF NOT EXISTS company_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    position TEXT NOT NULL,
    is_primary_contact BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);

-- Create bold_routes_members table for member ID management
CREATE TABLE IF NOT EXISTS bold_routes_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bold_routes_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "admin_can_manage_companies"
ON companies FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "users_can_view_own_company"
ON companies FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM company_members 
        WHERE company_members.company_id = companies.id 
        AND company_members.user_id = auth.uid()
    )
);

-- RLS Policies for company_members
CREATE POLICY "admin_can_manage_company_members"
ON company_members FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "users_can_view_own_company_members"
ON company_members FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM company_members 
        WHERE user_id = auth.uid()
    )
);

-- RLS Policies for bold_routes_members
CREATE POLICY "admin_can_manage_bold_routes_members"
ON bold_routes_members FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "users_can_view_own_member_record"
ON bold_routes_members FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ix_companies_status ON companies (status);
CREATE INDEX IF NOT EXISTS ix_companies_registration_date ON companies (registration_date DESC);
CREATE INDEX IF NOT EXISTS ix_company_members_company_id ON company_members (company_id);
CREATE INDEX IF NOT EXISTS ix_company_members_user_id ON company_members (user_id);
CREATE INDEX IF NOT EXISTS ix_bold_routes_members_member_id ON bold_routes_members (member_id);
CREATE INDEX IF NOT EXISTS ix_bold_routes_members_user_id ON bold_routes_members (user_id);
CREATE INDEX IF NOT EXISTS ix_bold_routes_members_status ON bold_routes_members (status);

-- Function to generate Bold Routes member ID
CREATE OR REPLACE FUNCTION generate_bold_routes_member_id()
RETURNS TEXT AS $$
DECLARE
    new_member_id TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        -- Format: BR-YYYY-XXXX (e.g., BR-2024-0001)
        new_member_id := 'BR-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(counter::TEXT, 4, '0');
        
        -- Check if this ID already exists
        IF NOT EXISTS (SELECT 1 FROM bold_routes_members WHERE member_id = new_member_id) THEN
            RETURN new_member_id;
        END IF;
        
        counter := counter + 1;
        
        -- Safety check to prevent infinite loop
        IF counter > 9999 THEN
            RAISE EXCEPTION 'Unable to generate unique member ID';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create company and assign member
CREATE OR REPLACE FUNCTION create_company_and_member(
    p_company_name TEXT,
    p_company_size TEXT,
    p_user_id UUID,
    p_position TEXT
)
RETURNS JSON AS $$
DECLARE
    new_company_id UUID;
    new_member_id TEXT;
    result JSON;
BEGIN
    -- Create company
    INSERT INTO companies (company_name, company_size)
    VALUES (p_company_name, p_company_size)
    RETURNING id INTO new_company_id;
    
    -- Generate member ID
    SELECT generate_bold_routes_member_id() INTO new_member_id;
    
    -- Create member record
    INSERT INTO bold_routes_members (member_id, user_id, company_id)
    VALUES (new_member_id, p_user_id, new_company_id);
    
    -- Add user as company member
    INSERT INTO company_members (company_id, user_id, position, is_primary_contact)
    VALUES (new_company_id, p_user_id, p_position, true);
    
    -- Update user profile
    UPDATE user_profiles 
    SET 
        is_bold_routes_member = true,
        bold_routes_member_id = new_member_id,
        company_registration_status = 'pending',
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Return result
    result := json_build_object(
        'company_id', new_company_id,
        'member_id', new_member_id,
        'status', 'pending'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_bold_routes_member_id() TO authenticated;
GRANT EXECUTE ON FUNCTION create_company_and_member(TEXT, TEXT, UUID, TEXT) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE companies IS 'Companies registered with Bold Routes Partners';
COMMENT ON TABLE company_members IS 'Employees and their positions within companies';
COMMENT ON TABLE bold_routes_members IS 'Bold Routes member records with unique member IDs';
COMMENT ON FUNCTION generate_bold_routes_member_id() IS 'Generates unique Bold Routes member IDs in format BR-YYYY-XXXX';
COMMENT ON FUNCTION create_company_and_member(TEXT, TEXT, UUID, TEXT) IS 'Creates a new company and assigns the user as a member with generated member ID';
