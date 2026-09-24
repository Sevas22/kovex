-- Límite de intentos por ventana de tiempo (login del panel, envío de pedidos).
-- Evita que un bot pruebe contraseñas o reserve todo el inventario con pedidos falsos.

create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 0,
  constraint rate_limits_hits_positive check (hits >= 0)
);

create index rate_limits_window_start_idx on public.rate_limits (window_start);

alter table public.rate_limits enable row level security;
