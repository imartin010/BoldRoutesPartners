-- Add payment plan columns to nawy_properties table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/mdqqqogshgtpzxtufjzn/sql/new

ALTER TABLE nawy_properties 
ADD COLUMN IF NOT EXISTS payment_plans JSONB,
ADD COLUMN IF NOT EXISTS down_payment_value NUMERIC,
ADD COLUMN IF NOT EXISTS down_payment_percent NUMERIC,
ADD COLUMN IF NOT EXISTS monthly_installment NUMERIC,
ADD COLUMN IF NOT EXISTS payment_years INTEGER;

-- Add indexes for payment filtering
CREATE INDEX IF NOT EXISTS idx_nawy_properties_down_payment ON nawy_properties(down_payment_value);
CREATE INDEX IF NOT EXISTS idx_nawy_properties_monthly ON nawy_properties(monthly_installment);
CREATE INDEX IF NOT EXISTS idx_nawy_properties_years ON nawy_properties(payment_years);

-- Add comment
COMMENT ON COLUMN nawy_properties.payment_plans IS 'Complete payment plan data from Nawy API';
COMMENT ON COLUMN nawy_properties.down_payment_value IS 'Extracted down payment amount in EGP';
COMMENT ON COLUMN nawy_properties.monthly_installment IS 'Extracted monthly installment in EGP';

SELECT 'Payment columns added successfully!' as message;








