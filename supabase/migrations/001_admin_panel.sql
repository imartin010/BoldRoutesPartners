-- Admin Panel Migration
-- This migration is idempotent and can be run multiple times safely

-- Timestamps & indexes
alter table if exists partner_applications add column if not exists created_at timestamptz default now();
alter table if exists closed_deals        add column if not exists created_at timestamptz default now();

create index if not exists ix_apps_created_at  on partner_applications (created_at desc);
create index if not exists ix_deals_created_at on closed_deals (created_at desc);

-- Status & notes
do $$ begin
  alter table partner_applications add column status text not null default 'new';
exception when duplicate_column then null end $$;
do $$ begin
  alter table partner_applications add column notes text;
exception when duplicate_column then null end $$;

do $$ begin
  alter table closed_deals add column review_status text not null default 'pending';
exception when duplicate_column then null end $$;
do $$ begin
  alter table closed_deals add column internal_note text;
exception when duplicate_column then null end $$;

-- Projects uniqueness per developer
create unique index if not exists ux_projects_dev_name on projects (developer_id, lower(name));

-- Tighten storage insert path to deals/
drop policy if exists "anon can upload deal files" on storage.objects;
create policy "anon upload only to deals prefix"
on storage.objects for insert to anon
with check (bucket_id='deal-attachments' and position('deals/' in coalesce(name,''))=1);
