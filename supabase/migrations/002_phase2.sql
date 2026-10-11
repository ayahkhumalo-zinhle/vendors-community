-- ============================================================
-- Phase 2: Sellers, Products, Orders
-- ============================================================

-- Sellers (one per seller-role user)
create table public.sellers (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade unique not null,
  business_name text not null,
  business_type text not null default 'general',
  address       text,
  city          text not null default 'Harare',
  is_open       boolean not null default true,
  is_verified   boolean not null default false,
  rating        numeric(3,2) default 0,
  created_at    timestamptz default now() not null
);

-- Products
create table public.products (
  id            uuid default gen_random_uuid() primary key,
  seller_id     uuid references public.sellers(id) on delete cascade not null,
  name          text not null,
  description   text,
  price         numeric(10,2) not null check (price >= 0),
  category      text not null default 'general',
  stock_qty     integer not null default 0 check (stock_qty >= 0),
  is_available  boolean not null default true,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- Orders
create table public.orders (
  id               uuid default gen_random_uuid() primary key,
  customer_id      uuid references public.profiles(id) not null,
  seller_id        uuid references public.sellers(id) not null,
  courier_id       uuid references public.profiles(id),
  status           text not null default 'received'
                   check (status in ('received','confirmed','preparing',
                     'courier_assigned','courier_travelling','collected',
                     'in_transit','approaching','delivered','completed','cancelled')),
  total_amount     numeric(10,2) not null,
  delivery_address text not null,
  notes            text,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

-- Order line items
create table public.order_items (
  id          uuid default gen_random_uuid() primary key,
  order_id    uuid references public.orders(id) on delete cascade not null,
  product_id  uuid references public.products(id) not null,
  product_name text not null,
  quantity    integer not null check (quantity > 0),
  unit_price  numeric(10,2) not null
);

-- ── RLS ──────────────────────────────────────────────────────

alter table public.sellers   enable row level security;
alter table public.products  enable row level security;
alter table public.orders    enable row level security;
alter table public.order_items enable row level security;

-- Sellers: owner manages; everyone reads open stores
create policy "sellers: owner full access"
  on public.sellers for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "sellers: public read open stores"
  on public.sellers for select
  using (is_open = true);

-- Products: seller manages; everyone reads available products
create policy "products: seller manages own"
  on public.products for all
  using (seller_id in (select id from public.sellers where user_id = auth.uid()))
  with check (seller_id in (select id from public.sellers where user_id = auth.uid()));

create policy "products: public read available"
  on public.products for select
  using (is_available = true);

-- Orders: customer sees their own; seller sees their store's; courier sees assigned
create policy "orders: customer sees own"
  on public.orders for select
  using (customer_id = auth.uid());

create policy "orders: customer creates"
  on public.orders for insert
  with check (customer_id = auth.uid());

create policy "orders: seller sees store orders"
  on public.orders for select
  using (seller_id in (select id from public.sellers where user_id = auth.uid()));

create policy "orders: seller updates status"
  on public.orders for update
  using (seller_id in (select id from public.sellers where user_id = auth.uid()));

create policy "orders: courier sees assigned"
  on public.orders for select
  using (courier_id = auth.uid());

create policy "orders: courier updates assigned"
  on public.orders for update
  using (courier_id = auth.uid());

create policy "orders: courier claims available"
  on public.orders for update
  using (courier_id is null and status = 'confirmed');

-- Order items: inherit order access
create policy "order_items: insert with order"
  on public.order_items for insert
  with check (order_id in (select id from public.orders where customer_id = auth.uid()));

create policy "order_items: select via order"
  on public.order_items for select
  using (
    order_id in (
      select id from public.orders
      where customer_id = auth.uid()
        or seller_id in (select id from public.sellers where user_id = auth.uid())
        or courier_id = auth.uid()
    )
  );

-- ── Triggers ─────────────────────────────────────────────────

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.handle_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.handle_updated_at();
