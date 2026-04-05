-- ==========================================================================
-- mi EconomIA — Database Triggers
-- ==========================================================================
-- TODO SUPABASE: Run this SQL in Supabase SQL Editor after setting up
-- the profiles table (see supabase/schema.sql for full schema).
--
-- These triggers automate:
-- 1. Profile creation on user signup (with 7-day trial)
-- 2. Trial expiry checking
-- 3. Effective plan resolution
-- ==========================================================================


-- --------------------------------------------------------------------------
-- TRIGGER: Auto-create profile with trial on new user registration
-- --------------------------------------------------------------------------
-- When auth.users gets a new row (new registration),
-- automatically create their profile with a 7-day Pro trial.
-- No manual step needed — registration = immediate trial access.
-- --------------------------------------------------------------------------

create or replace function handle_new_user_trial()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    plan,
    subscription_status,
    trial_start,
    trial_ends_at,
    mp_customer_email,
    role,
    created_at
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Usuario'),
    new.raw_user_meta_data ->> 'phone',
    'free',                           -- Base plan is free
    'trial',                          -- Status = trial (grants pro access)
    now(),                            -- Trial starts immediately
    now() + interval '7 days',        -- Trial expires in 7 days
    new.email,                        -- MP customer email = signup email
    'user',                           -- Default role (admin set manually in DB)
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Fire after every new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure handle_new_user_trial();


-- --------------------------------------------------------------------------
-- HELPER: Check if user is in active trial
-- --------------------------------------------------------------------------
-- Returns true if:
-- - subscription_status = 'trial'
-- - trial_ends_at is in the future
-- --------------------------------------------------------------------------

create or replace function is_trial_active(p_user_id uuid)
returns boolean as $$
  select
    subscription_status = 'trial'
    and trial_ends_at > now()
  from profiles
  where id = p_user_id;
$$ language sql security definer stable;


-- --------------------------------------------------------------------------
-- HELPER: Get effective plan (trial users get pro access)
-- --------------------------------------------------------------------------
-- Business rules:
-- - Trial active → 'pro' (full access during trial)
-- - Subscription active → 'pro'
-- - Everything else → 'free'
-- --------------------------------------------------------------------------

create or replace function get_effective_plan(p_user_id uuid)
returns text as $$
  select case
    when subscription_status = 'trial'
      and trial_ends_at > now() then 'pro'  -- trial = full pro access
    when subscription_status = 'active' then 'pro'
    else 'free'
  end
  from profiles
  where id = p_user_id;
$$ language sql security definer stable;


-- --------------------------------------------------------------------------
-- CRON: Auto-expire trials (run hourly via pg_cron)
-- --------------------------------------------------------------------------
-- Downgrades users whose trial has ended.
-- Schedule with: SELECT cron.schedule('expire-trials', '0 * * * *',
--   'SELECT public.expire_trials()');
-- --------------------------------------------------------------------------

create or replace function expire_trials()
returns void as $$
begin
  update public.profiles
  set plan = 'free',
      subscription_status = 'inactive',
      trial_ends_at = null,
      updated_at = now()
  where subscription_status = 'trial'
    and trial_ends_at < now();
end;
$$ language plpgsql security definer;
