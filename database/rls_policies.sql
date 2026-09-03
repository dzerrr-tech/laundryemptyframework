-- =========================================================
-- RLS_POLICIES.SQL — jalankan SETELAH schema.sql sukses
-- =========================================================

alter table public.orders enable row level security;
alter table public.services enable row level security;
alter table public.profiles enable row level security;
alter table public.outlets enable row level security;

-- USER: cuma bisa lihat order miliknya sendiri
create policy "user_view_own_orders"
on public.orders for select
using (auth.uid() = user_id);

-- KURIR: cuma bisa lihat order yang di-assign ke dia
create policy "kurir_view_assigned_orders"
on public.orders for select
using (auth.uid() = kurir_id);

-- MANAGER: bisa lihat semua order di outlet-nya sendiri
create policy "manager_view_outlet_orders"
on public.orders for select
using (
  outlet_id in (
    select outlet_id from public.profiles
    where id = auth.uid() and role = 'manager'
  )
);

-- ADMIN: bisa lihat semua order, tanpa syarat
create policy "admin_view_all_orders"
on public.orders for select
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- USER: boleh membuat order baru untuk dirinya sendiri
create policy "user_insert_own_orders"
on public.orders for insert
with check (auth.uid() = user_id);

-- KURIR: boleh update status order yang di-assign ke dia
create policy "kurir_update_assigned_orders"
on public.orders for update
using (auth.uid() = kurir_id);

-- Semua user login boleh lihat daftar layanan & harga (untuk order form)
create policy "authenticated_view_services"
on public.services for select
using (auth.role() = 'authenticated');

-- Hanya admin & manager yang boleh update harga layanan
create policy "admin_manager_update_services"
on public.services for update
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','manager')
  )
);

-- Semua user login boleh lihat profil dasar (untuk keperluan tampilan nama, dsb)
create policy "authenticated_view_profiles"
on public.profiles for select
using (auth.role() = 'authenticated');

-- Semua user login boleh lihat daftar outlet
create policy "authenticated_view_outlets"
on public.outlets for select
using (auth.role() = 'authenticated');
