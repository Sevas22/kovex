-- La lista de precios con la que KOVEX le compra al proveedor.
--
-- Texcomercial publica cada producto con una variante por lista de precio y
-- bodega («MLP-TLP0014CO11» = lista TLP0014, bodega CO11). El mismo congelador
-- cuesta $1.214.899 en la lista más barata y $1.590.289 sin lista asignada.
--
-- El importador venía tomando price_min, o sea la lista más barata, que no es
-- la que le facturan: los costos quedaban hasta un 34% por debajo de lo real y
-- los márgenes salían inflados. La lista de KOVEX es TLP0014, confirmada
-- contra cuatro productos en la sesión del comprador.
--
-- Si el proveedor le reasigna otra lista, se cambia aquí y se vuelve a
-- sincronizar; no hay que tocar código.

alter table public.store_settings
  add column if not exists supplier_price_list text not null default 'TLP0014';
