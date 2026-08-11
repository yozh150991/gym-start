-- Скопіюй усе це у Supabase -> SQL Editor -> New query -> Run  (потрібно один раз)
-- Створює бакет для фото власних вправ і дозволяє кожному писати лише у свою теку.
-- Читання публічне (бакет public) — саме тому в додатку працює звичайний <img src=URL>.

-- 1) Бакет (публічне читання)
insert into storage.buckets (id, name, public)
values ('exphotos', 'exphotos', true)
on conflict (id) do update set public = true;

-- 2) Політики доступу до об'єктів (перший сегмент шляху = user_id власника)
drop policy if exists "exphotos_insert_own" on storage.objects;
drop policy if exists "exphotos_update_own" on storage.objects;
drop policy if exists "exphotos_delete_own" on storage.objects;

create policy "exphotos_insert_own" on storage.objects
  for insert to authenticated
  with check ( bucket_id = 'exphotos'
               and (storage.foldername(name))[1] = auth.uid()::text );

create policy "exphotos_update_own" on storage.objects
  for update to authenticated
  using      ( bucket_id = 'exphotos'
               and (storage.foldername(name))[1] = auth.uid()::text )
  with check ( bucket_id = 'exphotos'
               and (storage.foldername(name))[1] = auth.uid()::text );

create policy "exphotos_delete_own" on storage.objects
  for delete to authenticated
  using      ( bucket_id = 'exphotos'
               and (storage.foldername(name))[1] = auth.uid()::text );

-- Політика на SELECT не потрібна: бакет public, читання йде через публічний URL.
