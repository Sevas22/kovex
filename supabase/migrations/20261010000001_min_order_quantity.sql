-- Cantidad mínima de venta por producto.
--
-- Hay productos que el proveedor solo despacha por paquete: cintas, lijas,
-- tornillería. El panel permite fijar ese mínimo y la tienda lo respeta desde
-- el botón de agregar hasta la validación del pedido en el servidor.
--
-- 1 = sin mínimo (se puede comprar de a una), que es el comportamiento previo.

alter table public.products
  add column if not exists min_order_quantity integer not null default 1;

alter table public.products
  drop constraint if exists products_min_order_positive;

alter table public.products
  add constraint products_min_order_positive check (min_order_quantity >= 1);

comment on column public.products.min_order_quantity is
  'Unidades mínimas por pedido. 1 = sin mínimo.';
