-- Supabase SQL: Tabellen voor AppGezin

-- 1. family_members
drop table if exists family_members;
create table family_members (
  id text primary key,
  name text not null,
  type text,
  color text,
  birthdate text
);

-- 2. meals
drop table if exists meals;
create table meals (
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
drop table if exists shopping_categories;
create table shopping_categories (
  id text primary key,
  name text not null,
  color text
);

-- 4. shopping_items
drop table if exists shopping_items;
create table shopping_items (
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

-- 5. sleepovers
drop table if exists sleepovers;
create table sleepovers (
  id text primary key,
  childid text,
  date date,
  location text,
  hostname text,
  pickuptime text,
  notes text
);

-- 6. tasks
drop table if exists tasks;
create table tasks (
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
drop table if exists calendar_events;
create table calendar_events (
  id text primary key,
  title text not null,
  start_date date,
  end_date date,
  description text,
  location text,
  participants jsonb
);
