-- Скопіюй усе це у Supabase -> SQL Editor -> New query -> Run
create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "own_select" on public.progress;
drop policy if exists "own_insert" on public.progress;
drop policy if exists "own_update" on public.progress;

create policy "own_select" on public.progress
  for select using (auth.uid() = user_id);
create policy "own_insert" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "own_update" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
