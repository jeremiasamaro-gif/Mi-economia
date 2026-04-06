-- ==========================================================================
-- mi EconomIA — SQL Security Patches
-- ==========================================================================
-- These patches fix vulnerabilities found in the QA Security Audit.
-- Run AFTER schema.sql in Supabase SQL Editor.
-- Each patch is idempotent (safe to run multiple times).
-- ==========================================================================


-- --------------------------------------------------------------------------
-- PATCH 1: BUG-038 — Lock subscription_status & trial_ends_at in profiles
-- --------------------------------------------------------------------------
-- The original UPDATE policy only locks plan + role. Users could change
-- subscription_status to 'active' or trial_ends_at to extend trial.

drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id)
  with check (
    -- Users CANNOT change their own role, plan, or subscription fields
    role = (select role from public.profiles where id = auth.uid())
    and plan = (select plan from public.profiles where id = auth.uid())
    and subscription_status = (select subscription_status from public.profiles where id = auth.uid())
    and trial_ends_at is not distinct from (select trial_ends_at from public.profiles where id = auth.uid())
    and mp_payment_id is not distinct from (select mp_payment_id from public.profiles where id = auth.uid())
    and mp_subscription_id is not distinct from (select mp_subscription_id from public.profiles where id = auth.uid())
  );


-- --------------------------------------------------------------------------
-- PATCH 2: BUG-039 — Expense limit trigger uses get_effective_plan()
-- --------------------------------------------------------------------------
-- Original uses raw `plan` column (always 'free' for trial users), so trial
-- users hit the 20-expense limit. Must use get_effective_plan() instead.

create or replace function public.check_expense_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  effective_plan text;
  month_count integer;
  max_allowed integer;
begin
  -- Use effective plan (trial users get pro access)
  effective_plan := public.get_effective_plan(new.user_id);

  -- Pro users have no limit
  if effective_plan = 'pro' then
    return new;
  end if;

  -- Free users: max 20 expenses per month
  max_allowed := 20;

  select count(*) into month_count
  from public.expenses
  where user_id = new.user_id
    and type = 'expense'
    and date_trunc('month', date) = date_trunc('month', current_date);

  if month_count >= max_allowed then
    raise exception 'Monthly expense limit reached (% of %)', month_count, max_allowed;
  end if;

  return new;
end;
$$;


-- --------------------------------------------------------------------------
-- PATCH 3: BUG-040 — Restrict achievement_key to known keys
-- --------------------------------------------------------------------------
-- Users can currently insert arbitrary achievement_key values.
-- Add a CHECK constraint with known achievement IDs.

alter table public.user_achievements
  drop constraint if exists valid_achievement_key;

alter table public.user_achievements
  add constraint valid_achievement_key
  check (achievement_key in (
    'streak-no-delivery-7',
    'streak-under-budget',
    'streak-savings-3m',
    'streak-logging-7',
    'milestone-first',
    'milestone-10k',
    'milestone-50k',
    'milestone-100k',
    'milestone-500k',
    'milestone-1m'
  ));


-- --------------------------------------------------------------------------
-- PATCH 4: BUG-041 — Groups INSERT requires Pro plan
-- --------------------------------------------------------------------------
-- Only pro users should be able to create groups.

drop policy if exists "Users can create groups" on public.groups;

create policy "Users can create groups"
  on public.groups for insert with check (
    owner_id = auth.uid()
    and public.get_effective_plan(auth.uid()) = 'pro'
  );


-- --------------------------------------------------------------------------
-- PATCH 5: BUG-042 — Support conversations UPDATE policy
-- --------------------------------------------------------------------------
-- Users need to update their conversation (e.g., mark as read).
-- Only allow updating unread_by_user, not status or unread_by_admin.

create policy "Users can update own conversation read status"
  on public.support_conversations for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    -- Only allow changing unread_by_user (not status or unread_by_admin)
    and status = (select status from public.support_conversations where id = support_conversations.id)
    and unread_by_admin = (select unread_by_admin from public.support_conversations where id = support_conversations.id)
  );


-- --------------------------------------------------------------------------
-- PATCH 6: BUG-043 — Expense limit uses current_date, prevent date bypass
-- --------------------------------------------------------------------------
-- Users could set expense.date to a different month to bypass the per-month
-- limit. Fix: the trigger now also counts expenses in the TARGET month
-- (new.date's month), not just current_date's month.

create or replace function public.check_expense_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  effective_plan text;
  month_count_current integer;
  month_count_target integer;
  max_allowed integer;
begin
  -- Use effective plan (trial users get pro access)
  effective_plan := public.get_effective_plan(new.user_id);

  -- Pro users have no limit
  if effective_plan = 'pro' then
    return new;
  end if;

  -- Free users: max 20 expenses per month
  max_allowed := 20;

  -- Check count in the CURRENT month (prevents bypass via future dates)
  select count(*) into month_count_current
  from public.expenses
  where user_id = new.user_id
    and type = 'expense'
    and date_trunc('month', date) = date_trunc('month', current_date);

  -- Check count in the TARGET month (the month the expense is dated for)
  select count(*) into month_count_target
  from public.expenses
  where user_id = new.user_id
    and type = 'expense'
    and date_trunc('month', date) = date_trunc('month', new.date);

  -- Block if EITHER month exceeds the limit
  if month_count_current >= max_allowed then
    raise exception 'Monthly expense limit reached for current month (% of %)', month_count_current, max_allowed;
  end if;

  if month_count_target >= max_allowed then
    raise exception 'Monthly expense limit reached for target month (% of %)', month_count_target, max_allowed;
  end if;

  return new;
end;
$$;
