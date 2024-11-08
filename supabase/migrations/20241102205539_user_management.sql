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

-- Create a table for source files, with a foreign key to the profiles table
create table source_files (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid references profiles not null,
  created_at timestamp with time zone default now(),
  content text not null
);
