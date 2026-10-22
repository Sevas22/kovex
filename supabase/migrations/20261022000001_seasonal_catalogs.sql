-- Catálogos de temporada: PDFs sueltos, sin crear productos.
--
-- Son folletos —Navidad, Día de la Madre, novedades del proveedor— que el
-- cliente publica tal cual. No se desglosan en productos: el comprador ve la
-- portada, abre el PDF y pide por WhatsApp lo que le interese.
--
-- file_url admite las dos formas que pidió: un PDF subido al panel, que queda
-- en /archivos/<id>.pdf, o una dirección externa pegada a mano.

create table if not exists public.seasonal_catalogs (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  description text,
  /** Portada de la tarjeta; sin ella se muestra el monograma. */
  cover_url text,
  /** El PDF: /archivos/<id>.pdf o una URL externa. */
  file_url text not null,
  is_active boolean not null default true,
  /** Orden manual en la cuadrícula; menor primero. */
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint seasonal_catalogs_title_len check (char_length(title) between 2 and 120),
  constraint seasonal_catalogs_file_url_len check (char_length(file_url) between 3 and 2000)
);

create index if not exists seasonal_catalogs_orden_idx
  on public.seasonal_catalogs (sort_order, id) where is_active;

create trigger seasonal_catalogs_updated_at
  before update on public.seasonal_catalogs
  for each row execute function public.set_updated_at();

alter table public.seasonal_catalogs enable row level security;
