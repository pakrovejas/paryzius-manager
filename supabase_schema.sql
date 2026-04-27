-- =============================================
-- PARYZIUS MANAGER — Supabase Schema
-- Paleisti Supabase SQL Editor
-- =============================================

-- 1. Vartotojų profiliai (gamification)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  xp integer default 0,
  streak integer default 0,
  last_active_date date,
  created_at timestamptz default now()
);

-- Automatiškai sukurti profilį kai registruojasi vartotojas
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2. Tiekėjai
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now()
);

-- 3. Sandėlis (inventorius)
create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity numeric default 0,
  unit text default 'vnt',
  min_quantity numeric default 0,
  category text default 'Kita',
  supplier_id uuid references suppliers(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Išlaidos
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric not null,
  category text default 'Kita',
  supplier_id uuid references suppliers(id) on delete set null,
  date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

-- 5. Pajamos
create table if not exists revenue (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  source text default 'Kita',
  date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

-- 6. Meniu
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  category text default 'Kita',
  is_available boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- Row Level Security (RLS)
-- Leidžiame tik prisijungusiems vartotojams
-- =============================================

alter table profiles enable row level security;
alter table suppliers enable row level security;
alter table inventory enable row level security;
alter table expenses enable row level security;
alter table revenue enable row level security;
alter table menu_items enable row level security;

-- Profiles: vartotojas mato tik savo profilį
create policy "profiles_own" on profiles
  for all using (auth.uid() = id);

-- Kitos lentelės: bet kuris prisijungęs vartotojas mato viską
create policy "suppliers_auth" on suppliers
  for all using (auth.role() = 'authenticated');

create policy "inventory_auth" on inventory
  for all using (auth.role() = 'authenticated');

create policy "expenses_auth" on expenses
  for all using (auth.role() = 'authenticated');

create policy "revenue_auth" on revenue
  for all using (auth.role() = 'authenticated');

create policy "menu_auth" on menu_items
  for all using (auth.role() = 'authenticated');
