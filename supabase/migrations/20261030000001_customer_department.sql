-- El pedido guarda el departamento además del municipio.
--
-- En Colombia el municipio solo no identifica un lugar: San Andrés existe en
-- Santander y en el archipiélago, y hay varios Santa Rosa y San Pedro. El
-- asesor cotiza el envío por departamento, así que necesita los dos datos.
--
-- Se deja nullable: los pedidos anteriores solo tienen ciudad y siguen válidos.

alter table public.customers add column if not exists department text;
alter table public.orders add column if not exists customer_department text;
