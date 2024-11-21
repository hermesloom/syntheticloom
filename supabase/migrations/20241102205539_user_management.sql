-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  registered_at timestamp with time zone default now(),
  api_credits bigint default 10000,
  api_key text
);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
create function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a table for projects
create table projects (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid references profiles not null,
  name text not null,
  description text,
  created_at timestamp with time zone default now(),
  last_accessed_at timestamp with time zone default now()
);

-- Create a table for source files, now linked to projects instead of directly to profiles
create table source_files (
  id uuid not null primary key default gen_random_uuid(),
  project_id uuid references projects not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Create an index to improve query performance when looking up projects by user
create index idx_projects_user_id on projects(user_id);

-- Create an index to improve query performance when looking up files by project
create index idx_source_files_project_id on source_files(project_id);
