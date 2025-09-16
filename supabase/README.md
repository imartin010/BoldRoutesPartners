# Supabase Migrations

## Running Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run migrations in order:
   - Copy and paste the contents of `migrations/001_admin_panel.sql` and click "Run"
   - Copy and paste the contents of `migrations/005_create_commission_rates_table.sql` and click "Run"
   - Copy and paste the contents of `migrations/006_populate_commission_rates.sql` and click "Run"

### Option 2: Command Line (if you have psql)
```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f supabase/migrations/001_admin_panel.sql
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f supabase/migrations/005_create_commission_rates_table.sql
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f supabase/migrations/006_populate_commission_rates.sql
```

## Setting Up Admin Access

After running the migration, you need to set yourself as an admin:

1. Go to Supabase Dashboard → Table Editor
2. Open the `profiles` table
3. Find your user record (created after first sign-in)
4. Set the `role` column to `'admin'`
5. Save the changes

## Environment Variables Required

Make sure these are set in your `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Storage Setup

The migration automatically updates the storage policy for the `deal-attachments` bucket to restrict uploads to the `deals/` path prefix only.

## Database Schema Updates

The migrations add:
- `created_at` timestamps to applications and deals
- `status` and `notes` columns to applications  
- `review_status` and `internal_note` columns to deals
- `commission_rates` table for dynamic commission management
- Indexes for better query performance
- Unique constraint on project names per developer
- RLS policies for secure data access
- Tightened storage policies
