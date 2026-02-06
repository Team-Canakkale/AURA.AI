-- Create ENUM types for Priority and Status
create type priority_level as enum ('big_one', 'medium', 'small');
create type task_status as enum ('pending', 'completed');

-- Create the TASKS table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null check (char_length(title) > 0),
  priority priority_level default 'medium',
  status task_status default 'pending',
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table tasks enable row level security;

-- Policy: Users can create their own tasks
create policy "Users can insert their own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

-- Policy: Users can view their own tasks
create policy "Users can view their own tasks"
  on tasks for select
  using (auth.uid() = user_id);

-- Policy: Users can update their own tasks (e.g. toggle status)
create policy "Users can update their own tasks"
  on tasks for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own tasks
create policy "Users can delete their own tasks"
  on tasks for delete
  using (auth.uid() = user_id);
