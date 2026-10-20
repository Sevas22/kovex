-- El IVA entra en el cálculo del precio.
--
-- Hasta ahora el precio era costo + margen y la tienda solo *decía* «IVA
-- incluido»: la tarifa de cada producto existía pero no se usaba en ninguna
-- cuenta. Para un responsable de IVA el impuesto no es un costo —lo cobra y lo
-- descuenta—, así que el margen debe calcularse sobre valores sin IVA.
--
-- supplier_prices_include_tax dice cómo leer products.cost_price: si el
-- proveedor publica con IVA incluido hay que sacarlo antes de aplicar el margen.
--
-- Por defecto true, y la razón importa: con true el cálculo queda
-- costo/1,19 × (1+margen) × 1,19, que da el MISMO precio de hoy. Con false
-- todos los precios del catálogo subirían de golpe un 19 %.
--
-- No sabemos todavía si Texcomercial publica con IVA o sin él. Mientras no se
-- confirme, el valor que no mueve ningún precio es el correcto: nadie se
-- entera del cambio hasta que alguien decida. Se cambia desde Configuración.

alter table public.store_settings
  add column if not exists supplier_prices_include_tax boolean not null default true;

comment on column public.store_settings.supplier_prices_include_tax is
  'true = el costo del proveedor ya trae IVA y hay que descontarlo antes del margen.';
