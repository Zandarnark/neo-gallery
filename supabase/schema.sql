create extension if not exists pgcrypto;

create table if not exists public.users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('visitor', 'artist', 'admin')) default 'visitor',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exhibitions (
  id text primary key,
  title text not null,
  slug text not null unique,
  status text not null check (status in ('draft', 'published', 'archived')) default 'published',
  start_date date not null,
  end_date date,
  cover_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artworks (
  id text primary key,
  exhibition_id text not null references public.exhibitions(id) on delete cascade,
  artist_id text references public.users(id) on delete set null,
  title text not null,
  media_type text not null check (media_type in ('image', 'video', 'audio')),
  file_url text not null,
  thumb_url text,
  price numeric,
  license_type text check (license_type in ('personal', 'commercial')),
  polygon_count integer,
  lod_levels integer,
  description text,
  position_x numeric,
  position_y numeric,
  position_z numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id text primary key,
  exhibition_id text not null references public.exhibitions(id) on delete cascade,
  type text not null check (type in ('single', 'season')),
  price numeric not null,
  max_qty integer not null,
  sold_qty integer not null default 0,
  perks_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  status text not null,
  total numeric not null,
  currency text not null default 'RUB',
  payment_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id text primary key,
  order_id text not null references public.orders(id) on delete cascade,
  type text not null,
  ref_id text not null,
  qty integer not null,
  price numeric not null
);

create table if not exists public.favorites (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  artwork_id text not null references public.artworks(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, artwork_id)
);

create table if not exists public.cart_items (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  type text not null,
  ref_id text not null,
  title text not null,
  price numeric not null,
  qty integer not null,
  exhibition_id text,
  license_type text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, type, ref_id, license_type)
);

create table if not exists public.analytics_events (
  id text primary key,
  session_id text not null,
  user_id text references public.users(id) on delete set null,
  exhibition_id text references public.exhibitions(id) on delete set null,
  event_type text not null,
  payload_json jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users
for each row execute procedure public.set_updated_at();

drop trigger if exists exhibitions_set_updated_at on public.exhibitions;
create trigger exhibitions_set_updated_at before update on public.exhibitions
for each row execute procedure public.set_updated_at();

drop trigger if exists artworks_set_updated_at on public.artworks;
create trigger artworks_set_updated_at before update on public.artworks
for each row execute procedure public.set_updated_at();

drop trigger if exists tickets_set_updated_at on public.tickets;
create trigger tickets_set_updated_at before update on public.tickets
for each row execute procedure public.set_updated_at();

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at before update on public.cart_items
for each row execute procedure public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('neogallery', 'neogallery', true)
on conflict (id) do nothing;
