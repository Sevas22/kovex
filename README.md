# KOVEX Colombia

Tienda mayorista con catálogo, cotizaciones y pedidos que se cierran por WhatsApp, inventario con reservas y panel administrativo.

- **Stack:** Next.js 16 (App Router) · Tailwind 4 + shadcn/ui (Base UI) · Postgres en Supabase (`postgres.js`)
- **Proveedor:** los productos se importan desde Texcomercial (Shopify) con foto, descripción, especificaciones, marca, categoría y costo.

## Puesta en marcha

```bash
pnpm install
cp .env.example .env.local   # completa DATABASE_URL y AUTH_SECRET
pnpm db:migrate              # crea las tablas (supabase/migrations)
pnpm db:seed                 # márgenes de ejemplo + 15 productos de Texcomercial + usuario admin
pnpm dev
```

`pnpm db:seed` imprime el correo y la contraseña del administrador. Si quieres elegirlos, define `ADMIN_EMAIL` y `ADMIN_PASSWORD` antes de correrlo. Para crear o cambiar usuarios después:

```bash
pnpm admin:create correo@kovex.com.co "Nombre" "contraseña-de-10+-caracteres"
```

Otros comandos:

| Comando | Qué hace |
| --- | --- |
| `pnpm catalog:sync` | Revisa todo el catálogo contra Texcomercial (costo y disponibilidad) y recalcula los precios con margen. También está en *Panel → Importar productos*, por lotes de 60. |
| `pnpm test` | Pruebas de precios, textos, carrito, importador y mensaje de WhatsApp. Si defines `TEST_DATABASE_URL` (una base con las migraciones aplicadas), también corre la prueba de integración del inventario, incluidos pedidos simultáneos. |
| `pnpm typecheck` | Chequeo de tipos. |

## Seguridad

- **Límite de intentos:** el login del panel acepta 10 intentos cada 15 minutos, por IP y por correo. El envío de pedidos acepta 8 por hora por IP y 12 al día por número de WhatsApp, para que nadie reserve todo el inventario con pedidos falsos.
- **Sesión:** se firma con HMAC y va en una cookie `httpOnly`. Las contraseñas se guardan con scrypt.
- **Validación:** cada Server Action del panel verifica la sesión y valida los datos con zod. Los precios del pedido siempre se toman del servidor, nunca del navegador.

## Supabase

1. En Supabase ve a **Project Settings → Database → Connection string → Transaction pooler** (puerto 6543) y copia la cadena en `DATABASE_URL`.
2. Aplica las migraciones con `pnpm db:migrate`, o pega `supabase/migrations/*.sql` en el SQL Editor.
3. Todas las tablas tienen RLS activado y ninguna política. La API pública de Supabase no puede leerlas; solo el servidor de Next.js, con la conexión directa.

## Variables de entorno (Vercel)

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Conexión al pooler de Supabase (puerto 6543) |
| `AUTH_SECRET` | Firma de la sesión del panel (32+ caracteres) |
| `NEXT_PUBLIC_SITE_URL` | URL pública; va en los enlaces que viajan por WhatsApp |

## Cómo funciona el inventario

| Momento | Estado | Inventario |
| --- | --- | --- |
| El cliente pide **cotización** | Por responder → Cotizada | Sin cambios |
| El cliente hace un **pedido**, o una cotización se convierte en pedido | Por confirmar | Se **reservan** las unidades (disponible = stock − reservado) |
| El asesor **confirma la venta** (pagó por WhatsApp) | Confirmado → Enviado → Entregado | Se **descuentan** del stock |
| Se **cancela** | Cancelado | Se liberan las reservas o se devuelven las unidades |

Cada cambio queda en el kardex (`inventory_movements`). Las operaciones bloquean los productos en orden para que dos clientes no puedan comprar la última unidad al mismo tiempo.

## Precios

Precio de venta = costo del proveedor + margen, redondeado hacia arriba (por defecto a $100). El margen se toma, en este orden:

1. el del producto;
2. el de su categoría o la categoría padre más cercana;
3. el margen general.

Cada producto puede usar **costo + margen**, **precio fijo** o **a cotizar**. Todo se configura en *Panel → Precios y márgenes*.
