-- Migration: Add timestamps, indexes, and constraints
-- Created: 2024-12-19
-- Purpose: Improve data consistency and query performance

-- Add missing timestamps with default now()
ALTER TABLE partner_applications 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE closed_deals 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Add status columns for better workflow management
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'partner_applications' AND column_name = 'status') THEN
    ALTER TABLE partner_applications 
    ADD COLUMN status TEXT NOT NULL DEFAULT 'new' 
    CHECK (status IN ('new', 'approved', 'rejected'));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'closed_deals' AND column_name = 'review_status') THEN
    ALTER TABLE closed_deals 
    ADD COLUMN review_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (review_status IN ('pending', 'verified', 'rejected'));
  END IF;
END $$;

-- Add unique constraints for data integrity
CREATE UNIQUE INDEX IF NOT EXISTS ux_developers_name 
ON developers (LOWER(name));

CREATE UNIQUE INDEX IF NOT EXISTS ux_projects_dev_name 
ON projects (developer_id, LOWER(name));

-- Add performance indexes for admin queries
CREATE INDEX IF NOT EXISTS ix_partner_applications_created_at 
ON partner_applications (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_closed_deals_created_at 
ON closed_deals (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_partner_applications_status 
ON partner_applications (status);

CREATE INDEX IF NOT EXISTS ix_closed_deals_review_status 
ON closed_deals (review_status);

-- Add functional indexes for search operations
CREATE INDEX IF NOT EXISTS ix_partner_applications_search 
ON partner_applications USING gin(
  to_tsvector('english', full_name || ' ' || company_name || ' ' || phone)
);

CREATE INDEX IF NOT EXISTS ix_closed_deals_search 
ON closed_deals USING gin(
  to_tsvector('english', developer_name || ' ' || project_name || ' ' || client_name)
);

-- Add constraints for data validation
ALTER TABLE partner_applications 
ADD CONSTRAINT IF NOT EXISTS chk_agents_count_positive 
CHECK (agents_count > 0 AND agents_count < 1000);

ALTER TABLE closed_deals 
ADD CONSTRAINT IF NOT EXISTS chk_deal_value_reasonable 
CHECK (deal_value > 0 AND deal_value <= 1000000000); -- 1 billion EGP max

-- Add length constraints to prevent DoS
ALTER TABLE partner_applications 
ADD CONSTRAINT IF NOT EXISTS chk_full_name_length 
CHECK (length(full_name) <= 100);

ALTER TABLE partner_applications 
ADD CONSTRAINT IF NOT EXISTS chk_company_name_length 
CHECK (length(company_name) <= 200);

ALTER TABLE closed_deals 
ADD CONSTRAINT IF NOT EXISTS chk_client_name_length 
CHECK (length(client_name) <= 100);

ALTER TABLE closed_deals 
ADD CONSTRAINT IF NOT EXISTS chk_developer_name_length 
CHECK (length(developer_name) <= 100);

-- Comments for documentation
COMMENT ON COLUMN partner_applications.status IS 'Workflow status: new, approved, rejected';
COMMENT ON COLUMN closed_deals.review_status IS 'Review status: pending, verified, rejected';
COMMENT ON INDEX ix_partner_applications_search IS 'Full-text search index for applications';
COMMENT ON INDEX ix_closed_deals_search IS 'Full-text search index for deals';
