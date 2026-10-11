-- ============================================================
-- Phase 1: User profiles with role-based access
-- ============================================================

-- Role enum
create type public.user_role as enum ('customer', 'seller', 'courier');

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  full_name       text not null default '',
  phone           text,
  ecocash_number  text,
  role            public.user_role not null default 'customer',
  avatar_url      text,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

-- Row Level Security
alter table public.profiles enable row level security;

create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-update updated_at on every row change
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Auto-create a profile row when a new auth user signs up.
-- security definer runs as the table owner, bypassing RLS so the
-- trigger fires even before the user verifies their email.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')::public.user_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
