# Supabase Payment Plan System Migration Guide

## Overview
This guide will help you implement the payment plan system in your Supabase database at [https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn/editor/17359?schema=public](https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn/editor/17359?schema=public).

## Step 1: Apply Database Migration

Copy and paste the following SQL code into your Supabase SQL Editor and run it:

```sql
-- Migration: Payment Plan System for Deals
-- Created: 2024-12-20
-- Purpose: Add payment plan tracking and claim notifications

-- Add payment plan fields to closed_deals table
ALTER TABLE closed_deals
ADD COLUMN IF NOT EXISTS payment_plan JSONB,
ADD COLUMN IF NOT EXISTS total_paid DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'in_progress', 'ready_to_claim', 'claimed')),
ADD COLUMN IF NOT EXISTS ready_to_claim_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id);

-- Create payment_records table to track individual payments
CREATE TABLE IF NOT EXISTS payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES closed_deals(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMPTZ NOT NULL,
    payment_method TEXT,
    reference_number TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_notifications table for ready-to-claim alerts
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('deal_ready_to_claim', 'payment_milestone')),
    deal_id UUID NOT NULL REFERENCES closed_deals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    read_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on new tables
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_records
CREATE POLICY "admin_can_manage_payment_records"
ON payment_records FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- RLS Policies for admin_notifications
CREATE POLICY "admin_can_read_notifications"
ON admin_notifications FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "admin_can_update_notifications"
ON admin_notifications FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Function to calculate payment progress and update deal status
CREATE OR REPLACE FUNCTION update_deal_payment_status(deal_uuid UUID)
RETURNS VOID AS $$
DECLARE
    deal_record RECORD;
    total_payments DECIMAL(15,2);
    required_amount DECIMAL(15,2);
    progress_percentage DECIMAL(5,2);
BEGIN
    -- Get deal information
    SELECT * INTO deal_record 
    FROM closed_deals 
    WHERE id = deal_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deal not found';
    END IF;
    
    -- Calculate total payments
    SELECT COALESCE(SUM(amount), 0) INTO total_payments
    FROM payment_records
    WHERE deal_id = deal_uuid;
    
    -- Update total_paid in closed_deals
    UPDATE closed_deals 
    SET total_paid = total_payments
    WHERE id = deal_uuid;
    
    -- If payment plan exists, check if ready to claim (10% threshold)
    IF deal_record.payment_plan IS NOT NULL THEN
        required_amount := deal_record.deal_value * 0.10; -- 10% threshold
        progress_percentage := (total_payments / deal_record.deal_value) * 100;
        
        -- Check if deal should be marked as ready to claim
        IF total_payments >= required_amount AND deal_record.payment_status != 'ready_to_claim' AND deal_record.payment_status != 'claimed' THEN
            -- Update deal status
            UPDATE closed_deals 
            SET 
                payment_status = 'ready_to_claim',
                ready_to_claim_at = NOW()
            WHERE id = deal_uuid;
            
            -- Create admin notification
            INSERT INTO admin_notifications (type, deal_id, title, message)
            VALUES (
                'deal_ready_to_claim',
                deal_uuid,
                'Deal Ready to Claim',
                'Deal #' || deal_uuid || ' for ' || deal_record.client_name || ' has reached 10% payment threshold and is ready to be claimed.'
            );
        ELSIF total_payments < required_amount AND deal_record.payment_status = 'ready_to_claim' THEN
            -- Revert status if payment dropped below threshold
            UPDATE closed_deals 
            SET 
                payment_status = 'in_progress',
                ready_to_claim_at = NULL
            WHERE id = deal_uuid;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update payment status when payments are added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_deal_payment_status(OLD.deal_id);
        RETURN OLD;
    ELSE
        PERFORM update_deal_payment_status(NEW.deal_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS payment_records_update_status ON payment_records;
CREATE TRIGGER payment_records_update_status
    AFTER INSERT OR UPDATE OR DELETE ON payment_records
    FOR EACH ROW EXECUTE FUNCTION trigger_update_payment_status();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ix_payment_records_deal_id ON payment_records (deal_id);
CREATE INDEX IF NOT EXISTS ix_payment_records_date ON payment_records (payment_date DESC);
CREATE INDEX IF NOT EXISTS ix_admin_notifications_deal_id ON admin_notifications (deal_id);
CREATE INDEX IF NOT EXISTS ix_admin_notifications_type ON admin_notifications (type);
CREATE INDEX IF NOT EXISTS ix_admin_notifications_unread ON admin_notifications (is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS ix_closed_deals_payment_status ON closed_deals (payment_status);
CREATE INDEX IF NOT EXISTS ix_closed_deals_ready_to_claim ON closed_deals (ready_to_claim_at) WHERE ready_to_claim_at IS NOT NULL;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_deal_payment_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_update_payment_status() TO authenticated;

-- Comments for documentation
COMMENT ON COLUMN closed_deals.payment_plan IS 'JSON object containing payment plan details (downpayment percentage, installment years, etc.)';
COMMENT ON COLUMN closed_deals.total_paid IS 'Total amount paid by client so far';
COMMENT ON COLUMN closed_deals.payment_status IS 'Current payment status: pending, in_progress, ready_to_claim, claimed';
COMMENT ON COLUMN closed_deals.ready_to_claim_at IS 'Timestamp when deal became ready to claim (reached 10% threshold)';
COMMENT ON COLUMN closed_deals.claimed_at IS 'Timestamp when deal was claimed by admin';
COMMENT ON COLUMN closed_deals.claimed_by IS 'Admin user who claimed the deal';

COMMENT ON TABLE payment_records IS 'Individual payment records for tracking client payments';
COMMENT ON TABLE admin_notifications IS 'Notifications for admins about deal status changes';
COMMENT ON FUNCTION update_deal_payment_status(UUID) IS 'Calculates payment progress and updates deal status based on 10% threshold';
```

## Step 2: Verify Migration

After running the migration, verify the tables exist:

1. Go to your [Supabase Table Editor](https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn/editor/17359?schema=public)
2. Check that these tables exist:
   - `closed_deals` (should have new columns: `payment_plan`, `total_paid`, `payment_status`, etc.)
   - `payment_records` (new table)
   - `admin_notifications` (new table)

## Step 3: Test the System

### Test Deal Creation with Payment Plan
1. Go to `/close-deal` in your app
2. Fill out a deal form with payment plan details
3. Submit the deal
4. Check in Supabase that the deal appears in `closed_deals` table with the payment plan data

### Test Payment Recording
1. Go to `/admin/deals` 
2. View a deal with a payment plan
3. Click the "Payment Plan" tab
4. Add payment records to test the automatic status updates

### Test Admin Notifications
1. Add payments that total 10% or more of the deal value
2. Check that the deal status automatically changes to "ready_to_claim"
3. Verify notifications appear in the admin dashboard and notification bell

## Expected Database Structure

After migration, your `closed_deals` table should have these columns:
- `payment_plan` (JSONB) - stores payment plan configuration
- `total_paid` (DECIMAL) - automatically calculated sum of payments
- `payment_status` (TEXT) - current payment status
- `ready_to_claim_at` (TIMESTAMPTZ) - when deal became ready to claim
- `claimed_at` (TIMESTAMPTZ) - when admin claimed the deal
- `claimed_by` (UUID) - which admin user claimed it

## Features Enabled

✅ **Automatic payment tracking** with real-time status updates
✅ **10% threshold detection** for ready-to-claim deals  
✅ **Admin notifications** when deals become claimable
✅ **Payment history** with full audit trail
✅ **Visual progress indicators** in admin interface
✅ **Secure RLS policies** for data protection

## Next Steps

1. Apply the migration SQL in your Supabase dashboard
2. Test the `/close-deal` form with payment plans
3. Verify deals appear in `/admin/deals` with payment status
4. Test payment recording and automatic status updates
5. Check notifications work in the admin dashboard

If you encounter any issues, check the Supabase logs for error details.
