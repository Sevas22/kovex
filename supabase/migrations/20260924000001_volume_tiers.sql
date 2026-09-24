-- ---------------------------------------------------------------------------
-- Escalas por cantidad (precio mayorista)
--
-- Una escala es una lista [{ "minQty": 12, "percent": 5 }] ordenada por cantidad.
-- Se hereda producto → categoría → general; null = heredar, [] = sin escala.
-- El descuento nunca baja el precio del costo + margen mínimo: ese piso se
-- aplica al calcular, no se guarda.
-- ---------------------------------------------------------------------------

alter table public.store_settings
  add column volume_tiers jsonb not null default '[]'::jsonb,
  add column min_margin_percent numeric(6, 2) not null default 0;

alter table public.store_settings
  add constraint store_settings_min_margin_range check (min_margin_percent between 0 and 1000);

alter table public.categories add column volume_tiers jsonb;
alter table public.products add column volume_tiers jsonb;

-- Precio de lista y descuento aplicado en el momento de crear el pedido: la
-- cotización que vio el cliente no cambia aunque después cambien los precios.
alter table public.order_items
  add column list_unit_price integer,
  add column discount_percent numeric(5, 2) not null default 0;

alter table public.order_items
  add constraint order_items_list_price_positive check (list_unit_price >= 0),
  add constraint order_items_discount_range check (discount_percent between 0 and 100);

alter table public.orders add column discount_total bigint not null default 0;

-- Las líneas existentes no tenían escala: su precio de lista es el que se cobró.
update public.order_items set list_unit_price = unit_price where unit_price is not null;
