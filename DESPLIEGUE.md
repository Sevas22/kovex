# Despliegue a producción

Estado al 5 de octubre de 2026. El código está listo y subido; falta la
configuración del lado de Vercel.

## Qué ya está hecho

- `main` y `desarrollo` apuntan al mismo commit (`bd72a50`) en GitHub.
- No queda nada sin commitear.
- La base de producción (Supabase) está cargada y responde: 1.999 productos,
  299 categorías, 1 usuario del panel.

Comprobaciones que pasan en limpio:

| Comprobación | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` (la que usa Vercel) | pasa |
| `next build` con las variables de producción | pasa |
| `next build` sin ninguna variable | pasa |
| `tsc --noEmit` | sin errores |
| 29 pruebas | todas pasan |

El build sin variables también pasa a propósito: significa que si falta alguna
variable el despliegue **no** se cae, pero el catálogo devolverá error al
abrirlo porque no encuentra la base de datos.

## Lo que falta, en orden

### 1. Confirmar que el proyecto de Vercel es el correcto

El dominio sirve todavía el despliegue del 14 de septiembre, aunque `main` ya
tiene el trabajo nuevo. La sospecha principal es que haya **dos proyectos** en
la cuenta: uno dueño del dominio y otro conectado al repositorio.

Para verificarlo: en el proyecto donde estén las variables de entorno, entrar a
**Settings → Domains** y mirar si aparece `www.kovexcolombia.com`.

- Si aparece → el proyecto es el correcto, seguir al punto 2.
- Si no aparece → las variables están en el proyecto equivocado. Hay que
  ponerlas en el que sí tiene el dominio.

### 2. Las tres variables de entorno

Los valores están en `.env.vercel.local`, que no se sube a git. En Vercel van en
**Settings → Environment Variables**, marcando Production, Preview y Development.

| Variable | Tipo | Nota |
|---|---|---|
| `DATABASE_URL` | **Sensitive** | Pooler de Supabase, puerto 6543. El `%2F` del final de la contraseña es un `/` codificado; no reemplazarlo. |
| `AUTH_SECRET` | **Sensitive** | Firma la sesión del panel. |
| `NEXT_PUBLIC_SITE_URL` | Normal | `https://www.kovexcolombia.com`, sin barra final. Va normal porque se incrusta en el navegador. |

Marcarlas como *Sensitive* hace que el valor no se pueda volver a leer desde el
panel. Es lo que pide el aviso de seguridad de Vercel.

### 3. Redespliegue

**Deployments → el más reciente → Redeploy**, con la casilla *Use existing build
cache* **desmarcada** para que tome las variables nuevas.

Debería construir desde el commit `bd72a50`.

### 4. Verificar que quedó bien

El sitio viejo y el nuevo se distinguen por el título de la pestaña:

- viejo: `KOVEX Colombia | Distribuidor Mayorista`
- nuevo: `KOVEX Colombia · Distribuidor mayorista`

Y `https://www.kovexcolombia.com/favicon.ico` debe responder 200 en vez de 404.

Después, revisar a mano: que el catálogo cargue productos (si la base no está
conectada, ahí es donde falla), que las fotos se vean y que el botón de WhatsApp
abra el chat.

## Pendientes que no dependen del despliegue

**El número de WhatsApp.** En la base de producción sigue el de ejemplo,
`573011234567`. Es el botón principal de todo el sitio: los pedidos que armen
los clientes se irían a un número que no existe. Se cambia desde el panel, en
Configuración, o directo en la base — no hace falta volver a desplegar.

**Rotar la contraseña de Supabase.** La actual pasó por un chat. Se cambia en
Supabase (Settings → Database → Reset database password) y después hay que
actualizar `DATABASE_URL` en Vercel con la nueva.

**51 productos sin foto.** El proveedor no las tiene. En el panel se listan con
el filtro "Sin foto". Mientras tanto muestran el monograma de la marca.
