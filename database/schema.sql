-- =========================================================
-- SCHEMA.SQL — jalankan ini di Supabase SQL Editor (urutan penting!)
-- =========================================================

-- 1. Outlets DULU, karena profiles akan mereferensikan tabel ini
create table public.outlets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  manager_id uuid,               -- foreign key ditambahkan belakangan (lihat langkah 3)
  created_at timestamptz default now()
);

-- 2. Profiles — nempel ke auth.users bawaan Supabase
create table public.profiles (
  id uuid references auth.users(id) primary key,
  full_name text not null,
  role text not null check (role in ('admin','manager','kurir','user')),
  outlet_id uuid references public.outlets(id),
  phone text,
  created_at timestamptz default now()
);

-- 3. Baru tambahkan foreign key manager_id, karena profiles sudah ada
alter table public.outlets
  add constraint outlets_manager_fk foreign key (manager_id) references public.profiles(id);

-- 4. Layanan & harga (dikelola admin/manager, bisa diupdate lewat AI agent)
create table public.services (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid references public.outlets(id) not null,
  name text not null,
  price_per_kg numeric not null,
  updated_at timestamptz default now()
);

-- 5. Order
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  outlet_id uuid references public.outlets(id) not null,
  kurir_id uuid references public.profiles(id),
  status text not null default 'pending'
    check (status in ('pending','dijemput_kurir','diproses_outlet','siap_antar','selesai')),
  total_weight_kg numeric,
  total_price numeric,
  pickup_address text not null,
  created_at timestamptz default now()
);

-- 6. Detail item per order
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) not null,
  service_id uuid references public.services(id) not null,
  weight_kg numeric not null,
  subtotal numeric not null
);
