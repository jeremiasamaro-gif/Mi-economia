-- ==========================================================================
-- mi EconomIA — Supabase Schema (Full)
-- ==========================================================================
-- Run this in the Supabase SQL Editor (Dashboard > SQL)
-- Order matters: tables first, then RLS, then triggers, then functions.
-- ==========================================================================


-- --------------------------------------------------------------------------
-- 1. PROFILES (extends Supabase auth.users)
-- --------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  phone text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  role text not null default 'user' check (role in ('user', 'admin')),
  subscription_status text not null default 'trial'
    check (subscription_status in ('trial', 'active', 'inactive', 'disabled')),
  trial_start timestamptz default now(),
  trial_ends_at timestamptz,
  plan_billing text check (plan_billing in ('monthly', 'annual')),
  plan_expires_at timestamptz,
  mp_payment_id text,
  mp_subscription_id text,
  mp_customer_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'User profiles — plan, role, and subscription state. Extended from auth.users.';


-- --------------------------------------------------------------------------
-- 2. EXPENSES
-- --------------------------------------------------------------------------

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  category text not null,
  description text not null default '',
  amount numeric(12, 2) not null check (amount >= 0),
  type text not null default 'expense' check (type in ('income', 'expense')),
  tags text[] default '{}',
  recurring boolean default false,
  recurring_frequency text check (recurring_frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  split_with uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_expenses_user_date on public.expenses (user_id, date desc);
create index idx_expenses_user_month on public.expenses (user_id, date_trunc('month', date));

comment on table public.expenses is
  'Financial transactions — both income and expenses. Core of the app.';


-- --------------------------------------------------------------------------
-- 3. BUDGETS
-- --------------------------------------------------------------------------

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  period text not null default 'monthly' check (period in ('monthly', 'yearly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category, period)
);

comment on table public.budgets is
  'Budget limits per category. Pro feature.';


-- --------------------------------------------------------------------------
-- 4. RECURRING EXPENSES
-- --------------------------------------------------------------------------

create table if not exists public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  next_date date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.recurring_expenses is
  'Scheduled recurring expenses — generates entries automatically.';


-- --------------------------------------------------------------------------
-- 5. GROUPS (Modo Familia)
-- --------------------------------------------------------------------------

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  invite_code text unique not null default substr(gen_random_uuid()::text, 1, 8),
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

comment on table public.groups is 'Family/group sharing. Pro feature.';


-- --------------------------------------------------------------------------
-- 6. ACHIEVEMENTS
-- --------------------------------------------------------------------------

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_key text not null,
  unlocked_at timestamptz not null default now(),
  progress numeric default 0,
  unique (user_id, achievement_key)
);

comment on table public.user_achievements is
  'Unlocked achievements per user. Pro feature.';


-- --------------------------------------------------------------------------
-- 7. SUPPORT CONVERSATIONS & MESSAGES
-- --------------------------------------------------------------------------

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed')),
  last_message_at timestamptz default now(),
  unread_by_admin boolean default true,
  unread_by_user boolean default false,
  created_at timestamptz not null default now(),
  unique (user_id) -- one conversation per user
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  sender_role text not null check (sender_role in ('user', 'admin')),
  content text not null check (char_length(content) <= 1000),
  read boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.support_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  read boolean default false,
  conversation_id uuid references public.support_conversations(id),
  created_at timestamptz not null default now()
);

create index idx_support_msgs_conv on public.support_messages (conversation_id, created_at);


-- --------------------------------------------------------------------------
-- 8. PAYMENTS LOG (audit trail)
-- --------------------------------------------------------------------------

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mp_payment_id text not null,
  mp_status text not null,
  amount numeric(12, 2) not null,
  currency text default 'ARS',
  billing_period text check (billing_period in ('monthly', 'annual')),
  raw_webhook jsonb, -- full MP webhook payload for audit
  created_at timestamptz not null default now()
);

-- Unique on mp_payment_id + approved prevents double processing
create unique index idx_payments_mp_approved
  on public.payments (mp_payment_id) where mp_status = 'approved';

comment on table public.payments is
  'Payment log — every MercadoPago webhook is recorded for audit.';


-- --------------------------------------------------------------------------
-- 9. INSTALLMENT PLANS (cuotas)
-- --------------------------------------------------------------------------

create table if not exists public.installment_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  description text not null,
  category text not null,
  total_amount numeric(12, 2) not null check (total_amount > 0),
  installment_amount numeric(12, 2) not null check (installment_amount > 0),
  total_installments integer not null check (total_installments >= 2 and total_installments <= 48),
  paid_installments integer not null default 0,
  payment_method text check (payment_method in ('efectivo', 'debito', 'credito', 'transferencia', 'mercadopago')),
  start_date text not null,
  next_due_date text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

create index idx_installment_plans_user on public.installment_plans (user_id, status);

comment on table public.installment_plans is
  'Installment payment plans (cuotas). Each plan generates monthly expense entries.';

-- Add installment columns to expenses
alter table public.expenses
  add column if not exists payment_method text check (payment_method in ('efectivo', 'debito', 'credito', 'transferencia', 'mercadopago')),
  add column if not exists installment_id uuid references public.installment_plans(id),
  add column if not exists installment_number integer;


-- ==========================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================================================
-- CRITICAL: Every table MUST have RLS enabled.
-- Principle: users can ONLY access their own data.
-- Admin access is handled via service_role key in Edge Functions.
-- ==========================================================================

-- Profiles
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id)
  with check (
    -- Users CANNOT change their own role or plan (server-side only)
    role = (select role from public.profiles where id = auth.uid())
    and plan = (select plan from public.profiles where id = auth.uid())
  );

-- Expenses
alter table public.expenses enable row level security;

create policy "Users can read own expenses"
  on public.expenses for select using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete using (auth.uid() = user_id);

-- Budgets
alter table public.budgets enable row level security;

create policy "Users can CRUD own budgets"
  on public.budgets for all using (auth.uid() = user_id);

-- Recurring Expenses
alter table public.recurring_expenses enable row level security;

create policy "Users can CRUD own recurring"
  on public.recurring_expenses for all using (auth.uid() = user_id);

-- Groups
alter table public.groups enable row level security;

create policy "Group members can read group"
  on public.groups for select using (
    id in (select group_id from public.group_members where user_id = auth.uid())
  );

create policy "Owners can update group"
  on public.groups for update using (owner_id = auth.uid());

create policy "Users can create groups"
  on public.groups for insert with check (owner_id = auth.uid());

-- Group Members
alter table public.group_members enable row level security;

create policy "Members can see co-members"
  on public.group_members for select using (
    group_id in (select group_id from public.group_members where user_id = auth.uid())
  );

-- Achievements
alter table public.user_achievements enable row level security;

create policy "Users can read own achievements"
  on public.user_achievements for select using (auth.uid() = user_id);

create policy "Users can insert own achievements"
  on public.user_achievements for insert with check (auth.uid() = user_id);

-- Support Conversations
alter table public.support_conversations enable row level security;

create policy "Users see own conversation"
  on public.support_conversations for select using (auth.uid() = user_id);

create policy "Users can create own conversation"
  on public.support_conversations for insert with check (auth.uid() = user_id);

-- Support Messages
alter table public.support_messages enable row level security;

create policy "Users see messages from own conversation"
  on public.support_messages for select using (
    conversation_id in (
      select id from public.support_conversations where user_id = auth.uid()
    )
  );

create policy "Users can send messages in own conversation"
  on public.support_messages for insert with check (
    conversation_id in (
      select id from public.support_conversations where user_id = auth.uid()
    )
    and sender_role = 'user' -- users CANNOT send as admin
    and sender_id = auth.uid()
  );

-- Support Notifications
alter table public.support_notifications enable row level security;

create policy "Users see own notifications"
  on public.support_notifications for select using (auth.uid() = user_id);

create policy "Users can mark own notifications read"
  on public.support_notifications for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Payments (read-only for users — writes happen via Edge Function)
alter table public.payments enable row level security;

create policy "Users can see own payments"
  on public.payments for select using (auth.uid() = user_id);

-- Installment Plans
alter table public.installment_plans enable row level security;

create policy "Users can CRUD own installment plans"
  on public.installment_plans for all using (auth.uid() = user_id);


-- ==========================================================================
-- TRIGGERS & FUNCTIONS
-- ==========================================================================

-- Auto-create profile on user signup with 7-day Pro trial
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, full_name, phone,
    plan, subscription_status, trial_start, trial_ends_at,
    mp_customer_email
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Usuario'),
    new.raw_user_meta_data ->> 'phone',
    'free',                     -- Base plan is free
    'trial',                    -- Status = trial (grants pro access)
    now(),                      -- Trial starts immediately
    now() + interval '7 days',  -- Trial expires in 7 days
    new.email                   -- MP customer email defaults to signup email
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: check if user is in active trial
create or replace function public.is_trial_active(p_user_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select
    subscription_status = 'trial'
    and trial_ends_at > now()
  from public.profiles
  where id = p_user_id;
$$;

-- Helper: get effective plan (trial users get pro access)
create or replace function public.get_effective_plan(p_user_id uuid)
returns text
language sql
stable
security definer set search_path = public
as $$
  select case
    when subscription_status = 'trial' and trial_ends_at > now() then 'pro'
    when subscription_status = 'active' then 'pro'
    else 'free'
  end
  from public.profiles
  where id = p_user_id;
$$;


-- Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_expenses_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

create trigger set_budgets_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

create trigger set_recurring_updated_at
  before update on public.recurring_expenses
  for each row execute function public.set_updated_at();


-- Enforce expense limit per plan
create or replace function public.check_expense_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_plan text;
  month_count integer;
  max_allowed integer;
begin
  -- Get user's plan
  select plan into user_plan
  from public.profiles
  where id = new.user_id;

  -- Pro users have no limit
  if user_plan = 'pro' then
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

create trigger enforce_expense_limit
  before insert on public.expenses
  for each row
  when (new.type = 'expense')
  execute function public.check_expense_limit();


-- Auto-expire trials (run via pg_cron or Supabase scheduled function)
create or replace function public.expire_trials()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
  set plan = 'free',
      subscription_status = 'inactive',
      trial_ends_at = null,
      updated_at = now()
  where subscription_status = 'trial'
    and trial_ends_at < now();
end;
$$;

-- Schedule: SELECT cron.schedule('expire-trials', '0 * * * *', 'SELECT public.expire_trials()');


-- ==========================================================================
-- DB FUNCTIONS (for efficient queries from frontend)
-- ==========================================================================

-- Monthly totals for charts
create or replace function public.get_monthly_totals(p_months integer default 6)
returns table (
  month text,
  income numeric,
  expense numeric,
  balance numeric
)
language sql
stable
security definer set search_path = public
as $$
  select
    to_char(date_trunc('month', e.date), 'Mon') as month,
    coalesce(sum(case when e.type = 'income' then e.amount end), 0) as income,
    coalesce(sum(case when e.type = 'expense' then e.amount end), 0) as expense,
    coalesce(sum(case when e.type = 'income' then e.amount else -e.amount end), 0) as balance
  from public.expenses e
  where e.user_id = auth.uid()
    and e.date >= date_trunc('month', current_date - (p_months || ' months')::interval)
  group by date_trunc('month', e.date)
  order by date_trunc('month', e.date);
$$;

-- Category totals for current month
create or replace function public.get_category_totals()
returns table (
  name text,
  value numeric
)
language sql
stable
security definer set search_path = public
as $$
  select
    e.category as name,
    sum(e.amount) as value
  from public.expenses e
  where e.user_id = auth.uid()
    and e.type = 'expense'
    and date_trunc('month', e.date) = date_trunc('month', current_date)
  group by e.category
  order by value desc;
$$;
