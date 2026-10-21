-- Ocultar el precio de un producto sin perder cómo se calcula.
--
-- Se podría lograr poniendo pricing_mode = 'quote', pero eso borra el modo
-- anterior: al reactivar no habría forma de saber cuáles eran «costo + margen»
-- y cuál tenía precio fijo. Con una bandera aparte el cálculo queda intacto y
-- volver atrás es gratis.
--
-- Con show_price en false el producto se comporta como «a cotizar»: no publica
-- precio y el cliente lo pide por WhatsApp. Esa ruta ya existe y está probada.

alter table public.products
  add column if not exists show_price boolean not null default true;

comment on column public.products.show_price is
  'false = no se publica el precio; el producto se muestra como «a cotizar».';

create index if not exists products_show_price_idx on public.products (show_price) where not show_price;
