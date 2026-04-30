-- Run this once in Supabase → SQL Editor

create table if not exists predictions (
  id          bigint generated always as identity primary key,
  timestamp   timestamptz not null default now(),
  features    text,
  model_used  text,
  prediction  text,
  confidence  numeric
);

create table if not exists datasets (
  id          bigint generated always as identity primary key,
  name        text,
  uploaded_at timestamptz not null default now(),
  rows        integer
);

-- Optional: enable Row Level Security and allow all reads/writes
-- (use service-role key in .env to bypass RLS entirely)
alter table predictions enable row level security;
alter table datasets    enable row level security;

create policy "allow all" on predictions for all using (true) with check (true);
create policy "allow all" on datasets    for all using (true) with check (true);
