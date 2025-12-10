-- Supabase SQL: Tabellen voor AppGezin
-- Dit script gebruikt CREATE TABLE IF NOT EXISTS en ALTER TABLE
-- om bestaande data te behouden

-- 1. family_members
create table if not exists family_members (
  id text primary key,
  name text not null,
  type text,
  color text,
  birthdate text
);

-- 2. meals
create table if not exists meals (
  id text primary key,
  dish text not null,
  date date,
  mealtype text,
  location text,
  locationdetails text,
  participants jsonb,
  recurring text
);

-- 3. shopping_categories
create table if not exists shopping_categories (
  id text primary key,
  name text not null,
  color text
);

-- 3a. shops
create table if not exists shops (
  id text primary key,
  name text not null,
  address text,
  notes text
);

-- 4. shopping_items
create table if not exists shopping_items (
  id text primary key,
  name text not null,
  category text,
  quantity int,
  unit text,
  iscompleted boolean,
  addeddate timestamptz,
  completeddate timestamptz,
  instock boolean
);

-- Voeg notes kolom toe aan shopping_items als deze nog niet bestaat
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'shopping_items' 
    and column_name = 'notes'
  ) then
    alter table shopping_items add column notes text;
  end if;
end $$;

-- Voeg shopid kolom toe aan shopping_items als deze nog niet bestaat
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'shopping_items' 
    and column_name = 'shopid'
  ) then
    alter table shopping_items add column shopid text;
  end if;
end $$;


-- 5. sleepovers
create table if not exists sleepovers (
  id text primary key,
  childid text,
  date date,
  location text,
  hostname text,
  pickuptime text,
  notes text
);

-- 6. tasks
create table if not exists tasks (
  id text primary key,
  title text not null,
  description text,
  assignedto jsonb,
  priority text,
  status text,
  date date,
  duedate date,
  categories jsonb,
  "order" int,
  createddate timestamptz,
  completeddate timestamptz
);

-- 7. calendar_events
create table if not exists calendar_events (
  id text primary key,
  title text not null,
  start_date date,
  end_date date,
  description text,
  location text,
  participants jsonb
);
