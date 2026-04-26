-- ============================================================
-- Pomodoro Pro: schema and RLS
-- Run once in the Supabase SQL editor (or via CLI: `supabase db push`).
-- ============================================================

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- subscriptions: one row per user, written ONLY by the Stripe
-- webhook (service-role). Users may read their own row.
-- ------------------------------------------------------------
create table if not exists public.subscriptions (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id   text unique,
  stripe_subscription_id text unique,
  tier                 text not null default 'free'
                       check (tier in ('free', 'pro', 'team')),
  status               text,
  current_period_end   timestamptz,
  updated_at           timestamptz not null default now()
);

create index if not exists subscriptions_stripe_customer_idx
  on public.subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;

-- Users can read their own subscription row.
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for the anon/authenticated roles.
-- The Stripe webhook uses the service_role key, which bypasses RLS.

-- ------------------------------------------------------------
-- tasks: per-user pomodoro task list
-- ------------------------------------------------------------
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id, created_at desc);

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
  on public.tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Trigger: when a new auth user is created, give them a free-tier row.
-- This lets the dashboard read tier without a left-join.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, tier)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
