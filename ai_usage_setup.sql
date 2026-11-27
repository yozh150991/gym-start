-- (v44) Денний ліміт ШІ-розпізнавань на користувача для Edge Function `recognize`.
-- Скопіюй усе це у Supabase -> SQL Editor -> New query -> Run (один раз; повторний запуск безпечний).
-- Функція recognize викликає public.bump_ai_usage() через PostgREST з JWT самого користувача,
-- отримує лічильник за сьогодні і, якщо він більший за RECOGNIZE_DAILY_LIMIT (за замовч. 30), віддає 429.
-- Поки цей SQL не запущено, recognize працює без ліміту (fail-open).

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default current_date,
  count   int  not null default 0,
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;

-- лише читання власних рядків; писати напряму не можна — тільки через bump_ai_usage()
drop policy if exists "ai_usage_select_own" on public.ai_usage;
create policy "ai_usage_select_own" on public.ai_usage
  for select using (auth.uid() = user_id);

create or replace function public.bump_ai_usage()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  n   int;
begin
  if uid is null then
    raise exception 'bump_ai_usage: not authenticated';
  end if;
  insert into public.ai_usage as u (user_id, day, count)
  values (uid, current_date, 1)
  on conflict (user_id, day) do update set count = u.count + 1
  returning u.count into n;
  return n;
end;
$$;

revoke all on function public.bump_ai_usage() from public, anon;
grant execute on function public.bump_ai_usage() to authenticated;
