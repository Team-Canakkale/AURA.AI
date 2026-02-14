-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Create ENUMs (if they don't exist)
do $$ begin
    create type priority_level as enum ('big_one', 'medium', 'small');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type task_status as enum ('pending', 'completed');
exception
    when duplicate_object then null;
end $$;

-- 3. DROP TABLES IF EXISTS (Optional - Use with caution if you have data!)
-- drop table if exists habitat_tasks;
-- drop table if exists habitat_events;
-- drop table if exists habitat_notes;
-- drop table if exists habitat_tree;
-- drop table if exists finance_transactions;

-- 4. CREATE TABLES

-- TABLE: habitat_tasks
create table if not exists habitat_tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null, -- references auth.users(id) if using Supabase Auth
  title text not null,
  priority text default 'medium',
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- TABLE: habitat_events
create table if not exists habitat_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null,
  title text not null,
  event_date timestamp with time zone not null,
  end_date timestamp with time zone,
  type text,
  location text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- TABLE: habitat_notes
create table if not exists habitat_notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- TABLE: habitat_tree (Gamification)
create table if not exists habitat_tree (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null,
  current_xp integer default 0,
  current_level integer default 1,
  streak_days integer default 0,
  last_watered_at timestamp with time zone default now()
);

-- TABLE: finance_transactions (For Finance Module)
create table if not exists finance_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid,
  date date,
  description text,
  amount numeric,
  category text,
  type text, -- 'income' or 'expense'
  created_at timestamp with time zone default now()
);

-- 5. Enable RLS (Security)
alter table habitat_tasks enable row level security;
alter table habitat_events enable row level security;
alter table habitat_notes enable row level security;
alter table habitat_tree enable row level security;
alter table finance_transactions enable row level security;

-- 6. Create Policies (Allow ALL for now for development ease)
-- Important: Drop existing policies first to avoid errors if re-running
drop policy if exists "Enable all access for all users" on habitat_tasks;
drop policy if exists "Enable all access for all users" on habitat_events;
drop policy if exists "Enable all access for all users" on habitat_notes;
drop policy if exists "Enable all access for all users" on habitat_tree;
drop policy if exists "Enable all access for all users" on finance_transactions;

create policy "Enable all access for all users" on habitat_tasks for all using (true) with check (true);
create policy "Enable all access for all users" on habitat_events for all using (true) with check (true);
create policy "Enable all access for all users" on habitat_notes for all using (true) with check (true);
create policy "Enable all access for all users" on habitat_tree for all using (true) with check (true);
create policy "Enable all access for all users" on finance_transactions for all using (true) with check (true);
