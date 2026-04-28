-- =============================================
-- MIGRACIJA: Receptūrų lentelė + unikalūs laukai
-- Paleisti Supabase SQL Editor PRIEŠ importą
-- =============================================

-- Pridėti unit_cost į inventory (jei nėra)
alter table inventory add column if not exists unit_cost numeric default 0;

-- Unikalus pavadinimas inventory
alter table inventory add constraint if not exists inventory_name_unique unique (name);

-- Unikalus pavadinimas menu_items
alter table menu_items add constraint if not exists menu_items_name_unique unique (name);

-- Receptūrų lentelė
create table if not exists recipe_items (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  inventory_id uuid not null references inventory(id) on delete cascade,
  quantity numeric not null default 1,
  created_at timestamptz default now(),
  unique (menu_item_id, inventory_id)
);

alter table recipe_items enable row level security;

create policy "recipe_items_auth" on recipe_items
  for all using (auth.role() = 'authenticated');
