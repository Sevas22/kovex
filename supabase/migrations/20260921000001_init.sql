-- KOVEX · esquema inicial
-- Catálogo con precios por margen, inventario con reservas y pedidos/cotizaciones
-- que se cierran por WhatsApp.
--
-- Todo el acceso ocurre desde el servidor de Next.js con la conexión de Postgres.
-- RLS queda activado sin políticas: la API pública de Supabase (anon/authenticated)
-- no puede leer ni escribir estas tablas.

create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Configuración de la tienda (una sola fila)
-- ---------------------------------------------------------------------------

create table public.store_settings (
  id boolean primary key default true,
  business_name text not null default 'KOVEX Colombia',
  whatsapp_number text not null default '573011234567',
  contact_email text not null default 'ventas@kovex.com.co',
  contact_phone text,
  address text,
  city text not null default 'Bogotá',
  default_markup_percent numeric(6, 2) not null default 0,
  price_rounding integer not null default 100,
  low_stock_threshold integer not null default 5,
  product_limit integer not null default 2000,
  updated_at timestamptz not null default now(),
  constraint store_settings_singleton check (id),
  constraint store_settings_markup_range check (default_markup_percent between 0 and 1000),
  constraint store_settings_rounding check (price_rounding in (1, 10, 50, 100, 500, 1000)),
  constraint store_settings_low_stock check (low_stock_threshold >= 0),
  constraint store_settings_product_limit check (product_limit > 0),
  constraint store_settings_whatsapp check (whatsapp_number ~ '^[0-9]{10,15}$')
);

create trigger store_settings_updated_at
  before update on public.store_settings
  for each row execute function public.set_updated_at();

insert into public.store_settings default values;

-- ---------------------------------------------------------------------------
-- Proveedores
-- ---------------------------------------------------------------------------

create table public.suppliers (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  website text,
  created_at timestamptz not null default now()
);

insert into public.suppliers (slug, name, website)
values ('texcomercial', 'Texcomercial', 'https://texcomercial.com.co');

-- ---------------------------------------------------------------------------
-- Categorías (árbol: departamento > categoría > subcategoría)
-- ---------------------------------------------------------------------------

create table public.categories (
  id bigint generated always as identity primary key,
  parent_id bigint references public.categories (id) on delete restrict,
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  markup_percent numeric(6, 2),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_markup_range check (markup_percent between 0 and 1000),
  constraint categories_not_own_parent check (parent_id is null or parent_id <> id)
);

create index categories_parent_id_idx on public.categories (parent_id);
create unique index categories_parent_name_key
  on public.categories (coalesce(parent_id, 0), lower(name));

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- Departamentos del manual de marca (menú principal de la tienda).
insert into public.categories (slug, name, icon, sort_order, description) values
  ('ferreteria', 'Ferretería', 'wrench', 1, 'Herramientas, pinturas, construcción y plomería.'),
  ('agro', 'Agro', 'sprout', 2, 'Insumos y soluciones para el campo y la agroindustria.'),
  ('hogar', 'Hogar', 'sofa', 3, 'Cocina, mesa, aseo, organización y muebles.'),
  ('maquinaria', 'Maquinaria', 'tractor', 4, 'Equipos y maquinaria para trabajo pesado.'),
  ('tecnologia', 'Tecnología', 'laptop', 5, 'Televisores, audio, cómputo y accesorios.'),
  ('electro', 'Electro', 'washing-machine', 6, 'Electrodomésticos grandes y pequeños.');

-- ---------------------------------------------------------------------------
-- Productos
-- ---------------------------------------------------------------------------

create table public.products (
  id bigint generated always as identity primary key,
  slug text not null unique,
  sku text not null unique,
  name text not null,
  brand text,
  category_id bigint references public.categories (id) on delete set null,
  description text,
  specs jsonb not null default '[]'::jsonb,
  images text[] not null default '{}',
  unit text not null default 'Unidad',

  -- Precio de venta:
  --   markup → costo del proveedor + % (producto > categoría > general)
  --   fixed  → precio definido a mano
  --   quote  → sin precio publicado, se cotiza por WhatsApp
  pricing_mode text not null default 'markup',
  cost_price integer,
  markup_percent numeric(6, 2),
  fixed_price integer,
  price integer,
  compare_at_price integer,
  tax_rate numeric(5, 2) not null default 19,

  -- Inventario: disponible = stock - reserved
  track_inventory boolean not null default true,
  stock integer not null default 0,
  reserved integer not null default 0,
  low_stock_threshold integer,

  is_active boolean not null default true,
  is_featured boolean not null default false,

  -- Origen (importación desde proveedores)
  supplier_id bigint references public.suppliers (id) on delete set null,
  source_id text,
  source_url text,
  source_available boolean,
  source_synced_at timestamptz,

  -- Texto normalizado (minúsculas, sin tildes) para la búsqueda
  search_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_pricing_mode check (pricing_mode in ('markup', 'fixed', 'quote')),
  constraint products_cost_positive check (cost_price >= 0),
  constraint products_markup_range check (markup_percent between 0 and 1000),
  constraint products_fixed_positive check (fixed_price >= 0),
  constraint products_price_positive check (price >= 0),
  constraint products_compare_positive check (compare_at_price >= 0),
  constraint products_tax_range check (tax_rate between 0 and 100),
  constraint products_quote_without_price check (pricing_mode <> 'quote' or price is null),
  constraint products_stock_positive check (stock >= 0),
  constraint products_reserved_positive check (reserved >= 0),
  constraint products_reserved_within_stock check (reserved <= stock),
  constraint products_low_stock_positive check (low_stock_threshold >= 0),
  constraint products_supplier_source_key unique (supplier_id, source_id)
);

create index products_category_id_idx on public.products (category_id);
create index products_supplier_id_idx on public.products (supplier_id);
create index products_featured_idx on public.products (created_at desc)
  where is_active and is_featured;
create index products_brand_idx on public.products (brand) where is_active;
create index products_search_trgm_idx
  on public.products using gin (search_text extensions.gin_trgm_ops);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Clientes (se crean/actualizan por teléfono al recibir un pedido)
-- ---------------------------------------------------------------------------

create table public.customers (
  id bigint generated always as identity primary key,
  phone text not null unique,
  name text not null,
  company text,
  document text,
  email text,
  city text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Pedidos y cotizaciones
-- ---------------------------------------------------------------------------
-- kind   quote → solicitud de cotización (no toca el inventario)
--        order → pedido (reserva stock al crearse)
-- status pending → quoted (solo cotizaciones) → confirmed → shipped → delivered
--        cualquier estado abierto → cancelled
-- stock_state registra qué se hizo con el inventario:
--        none → reserved → committed (venta) | released (cancelado antes de confirmar)
--        committed → returned (cancelado después de confirmar)

create sequence public.order_number_seq start 1001;

create table public.orders (
  id bigint generated always as identity primary key,
  code text not null unique default ('KVX-' || nextval('public.order_number_seq')),
  public_token uuid not null unique default gen_random_uuid(),
  kind text not null,
  status text not null default 'pending',
  stock_state text not null default 'none',
  customer_id bigint references public.customers (id) on delete set null,
  customer_name text not null,
  customer_company text,
  customer_document text,
  customer_phone text not null,
  customer_email text,
  customer_city text,
  customer_address text,
  customer_notes text,
  subtotal bigint not null default 0,
  has_unpriced_items boolean not null default false,
  admin_notes text,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_kind check (kind in ('quote', 'order')),
  constraint orders_status check (
    status in ('pending', 'quoted', 'confirmed', 'shipped', 'delivered', 'cancelled')
  ),
  constraint orders_quoted_only_for_quotes check (kind = 'quote' or status <> 'quoted'),
  constraint orders_stock_state check (
    stock_state in ('none', 'reserved', 'committed', 'released', 'returned')
  ),
  constraint orders_subtotal_positive check (subtotal >= 0)
);

create index orders_customer_id_idx on public.orders (customer_id);
create index orders_kind_status_idx on public.orders (kind, status, created_at desc);
create index orders_created_at_idx on public.orders (created_at desc);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders (id) on delete cascade,
  product_id bigint references public.products (id) on delete set null,
  product_name text not null,
  product_sku text,
  product_image text,
  unit text not null default 'Unidad',
  quantity integer not null,
  unit_price integer,
  line_total bigint generated always as (quantity::bigint * unit_price) stored,
  -- true si al reservar el producto controlaba inventario; define qué se libera o descuenta.
  stock_tracked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_price_positive check (unit_price >= 0)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

create table public.order_events (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders (id) on delete cascade,
  type text not null,
  message text not null,
  actor text,
  created_at timestamptz not null default now()
);

create index order_events_order_id_idx on public.order_events (order_id, created_at);

-- ---------------------------------------------------------------------------
-- Kardex: cada cambio de stock o de reservas queda registrado
-- ---------------------------------------------------------------------------

create table public.inventory_movements (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  order_id bigint references public.orders (id) on delete set null,
  kind text not null,
  stock_delta integer not null default 0,
  reserved_delta integer not null default 0,
  stock_after integer not null,
  reserved_after integer not null,
  note text,
  actor text,
  created_at timestamptz not null default now(),
  constraint inventory_movements_kind check (
    kind in ('initial', 'restock', 'adjustment', 'reserve', 'release', 'sale', 'return')
  )
);

create index inventory_movements_product_idx
  on public.inventory_movements (product_id, created_at desc);
create index inventory_movements_order_id_idx on public.inventory_movements (order_id);
create index inventory_movements_created_idx on public.inventory_movements (created_at desc);

-- ---------------------------------------------------------------------------
-- Usuarios del panel administrativo
-- ---------------------------------------------------------------------------

create table public.admin_users (
  id bigint generated always as identity primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  constraint admin_users_email_lowercase check (email = lower(email))
);

-- ---------------------------------------------------------------------------
-- Seguridad: RLS activado sin políticas en todas las tablas
-- ---------------------------------------------------------------------------

alter table public.store_settings enable row level security;
alter table public.suppliers enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.admin_users enable row level security;
