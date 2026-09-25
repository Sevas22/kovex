-- ---------------------------------------------------------------------------
-- Imágenes subidas desde el panel
--
-- Se guardan en la base para que funcionen igual en local y en producción sin
-- depender de un almacenamiento externo. Las fotos del proveedor siguen viniendo
-- de su CDN: aquí solo caen las que sube el administrador.
-- ---------------------------------------------------------------------------

create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  content_type text not null,
  size integer not null,
  width integer,
  height integer,
  data bytea not null,
  created_at timestamptz not null default now(),
  constraint uploads_size_positive check (size > 0),
  constraint uploads_content_type check (content_type in ('image/webp', 'image/jpeg', 'image/png', 'image/avif'))
);

alter table public.uploads enable row level security;
