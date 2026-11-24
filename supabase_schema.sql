-- URBANIQ AI — Supabase PostgreSQL Schema
create table if not exists public.complaints (
  id text primary key,
  user_id uuid references auth.users(id),
  citizen_name text not null,
  title text not null,
  description text not null,
  category text not null,
  department text not null,
  severity text default 'Medium',
  priority_score int default 50,
  status text default 'Pending',
  ward text,
  lat double precision,
  lng double precision,
  image_url text,
  language text default 'English',
  ai_summary text,
  is_duplicate boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.complaints enable row level security;

create policy "Public read access"
on public.complaints for select
using (true);

create policy "Authenticated insert access"
on public.complaints for insert
with check (auth.role() = 'authenticated');

create policy "Authenticated update access"
on public.complaints for update
using (auth.role() = 'authenticated');
