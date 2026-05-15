create type public.user_role as enum ('visitor', 'artist', 'admin');
create type public.artist_tier as enum ('free', 'pro', 'premium');
create type public.exhibition_status as enum ('draft', 'published', 'archived');
create type public.media_type as enum ('image', 'video', 'audio');
create type public.license_type as enum ('personal', 'commercial');
create type public.ticket_type as enum ('single', 'season');
create type public.order_status as enum ('pending', 'paid', 'fulfilled', 'refunded', 'expired', 'canceled', 'failed');
create type public.order_item_type as enum ('ticket', 'merch', 'license', 'subscription');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.user_role not null default 'visitor',
  created_at timestamptz not null default now(),
  avatar_url text
);

create table public.artists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  bio text,
  payout_account text,
  tier public.artist_tier not null default 'free'
);

create table public.exhibitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  status public.exhibition_status not null default 'draft',
  start_date date not null,
  end_date date,
  cover_url text,
  description text,
  created_at timestamptz not null default now()
);

create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  exhibition_id uuid not null references public.exhibitions(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  title text not null,
  media_type public.media_type not null,
  file_url text not null,
  thumb_url text,
  price integer,
  license_type public.license_type,
  description text,
  position_x numeric not null default 0,
  position_y numeric not null default 1.5,
  position_z numeric not null default -5
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  exhibition_id uuid not null references public.exhibitions(id) on delete cascade,
  type public.ticket_type not null,
  price integer not null,
  max_qty integer not null default 0,
  sold_qty integer not null default 0,
  perks_json jsonb
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  status public.order_status not null default 'pending',
  total integer not null,
  currency text not null default 'RUB',
  payment_id text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  type public.order_item_type not null,
  ref_id uuid not null,
  qty integer not null default 1,
  price integer not null
);

create table public.analytics (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  exhibition_id uuid references public.exhibitions(id) on delete set null,
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table public.payments_audit (
  id uuid primary key default gen_random_uuid(),
  payment_id text not null,
  event_type text not null,
  status_before text,
  status_after text,
  webhook_received_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.artists enable row level security;
alter table public.exhibitions enable row level security;
alter table public.artworks enable row level security;
alter table public.tickets enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.analytics enable row level security;
alter table public.payments_audit enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create policy "Users can read own profile" on public.users
  for select using (id = auth.uid() or public.current_user_role() = 'admin');

create policy "Users can create own profile" on public.users
  for insert with check (id = auth.uid());

create policy "Users can update own profile" on public.users
  for update using (id = auth.uid() or public.current_user_role() = 'admin')
  with check (id = auth.uid() or public.current_user_role() = 'admin');

create policy "Published exhibitions are public" on public.exhibitions
  for select using (status = 'published' or public.current_user_role() = 'admin');

create policy "Admins manage exhibitions" on public.exhibitions
  for all using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "Published artworks are public" on public.artworks
  for select using (
    exists (
      select 1 from public.exhibitions e
      where e.id = exhibition_id and e.status = 'published'
    )
    or public.current_user_role() = 'admin'
    or exists (
      select 1 from public.artists a
      where a.id = artist_id and a.user_id = auth.uid()
    )
  );

create policy "Artists manage own artworks" on public.artworks
  for all using (
    public.current_user_role() = 'admin'
    or exists (
      select 1 from public.artists a
      where a.id = artist_id and a.user_id = auth.uid()
    )
  )
  with check (
    public.current_user_role() = 'admin'
    or exists (
      select 1 from public.artists a
      where a.id = artist_id and a.user_id = auth.uid()
    )
  );

create policy "Tickets are public" on public.tickets
  for select using (true);

create policy "Admins manage tickets" on public.tickets
  for all using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "Users read own orders" on public.orders
  for select using (user_id = auth.uid() or public.current_user_role() = 'admin');

create policy "Users create own orders" on public.orders
  for insert with check (user_id = auth.uid());

create policy "Users read own order items" on public.order_items
  for select using (
    public.current_user_role() = 'admin'
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "Users create own order items" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "Analytics insert is allowed" on public.analytics
  for insert with check (true);

create policy "Admins read analytics" on public.analytics
  for select using (public.current_user_role() = 'admin');

create policy "Admins read payments audit" on public.payments_audit
  for select using (public.current_user_role() = 'admin');
