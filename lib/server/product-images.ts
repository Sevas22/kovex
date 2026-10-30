import 'server-only'
import { db } from './db'
import { fetchSupplierProduct } from './texcomercial'
import { publicUrlFor } from './uploads'

/**
 * Guarda en la tienda las fotos que el proveedor publica.
 *
 * El catálogo importado ENLAZABA a las fotos del CDN de Texcomercial. Cada vez
 * que él reorganiza su almacenamiento esas direcciones caducan y la tienda se
 * llena de huecos: pasó tres veces en un mes (438, 1.057 y 989 fotos). Reparar
 * los enlaces solo compra unos días.
 *
 * Así que al importar se descarga la foto, se optimiza y se guarda en la base,
 * igual que las que se suben desde el panel. A partir de ahí el proveedor puede
 * mover lo que quiera; la tienda ya no depende de él.
 */

/** Ancho de presentación: la ficha nunca muestra más de 800 px. */
const ANCHO = 900
const CALIDAD = 78
const TRABAJADORES = 6

const UA = { 'user-agent': 'KovexCatalog/1.0 (+catálogo de KOVEX Colombia)' }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export interface PendingProduct {
  id: number
  sourceUrl: string
  /** SKU del proveedor: la llave para reencontrar un producto renombrado. */
  sku: string
}

export type StoreOutcome = 'guardada' | 'sin-foto' | 'fallo'

export interface StoreImagesTotals {
  guardadas: number
  sinFoto: number
  fallos: number
  bytes: number
}

/** La dirección es propia cuando ya apunta a nuestra tabla de archivos. */
export const isOwnImage = (url: string) => url.startsWith('/imagenes/')

/**
 * Direcciones vigentes según la ficha individual del proveedor.
 *
 * La ficha individual (/products/{handle}.js) sí responde con las direcciones
 * de hoy; el listado /products.json devuelve las que tenía cuando se generó.
 * Reintenta porque el proveedor limita las peticiones seguidas (429 y 5xx).
 *
 * Devuelve `null` cuando no se pudo averiguar —y entonces no se toca nada—.
 * Esta distinción es la que importa: una vez se dieron por perdidas 6 fotos
 * buenas de Hyundai porque un fallo de red se confundió con «no hay foto», y
 * borrar es irreversible. Lista vacía significa que el proveedor contestó y
 * dijo que no la tiene; `null` significa que no contestó.
 */
interface FreshImages {
  images: string[]
  /** Nueva dirección del proveedor, si hubo que reencontrar el producto. */
  movedTo?: string
}

async function freshImages(p: PendingProduct): Promise<FreshImages | null> {
  const handle = p.sourceUrl.split('/products/')[1]
  if (!handle) return null
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const product = await fetchSupplierProduct(handle)
      // 404: casi siempre lo renombró, no lo dio de baja. Se busca por SKU.
      if (!product) return relocate(p)
      if (product.images.length > 0) return { images: product.images }
      // La ficha existe pero sin foto. El proveedor suele tener el mismo
      // artículo publicado dos veces (…-verde-1 y …-verde-2) y solo una de las
      // dos lleva foto, así que se busca el gemelo por SKU antes de rendirse.
      return (await relocate(p)) ?? { images: [] }
    } catch {
      // red intermitente o límite del proveedor: vale la pena reintentar
    }
    await sleep(1200 * intento)
  }
  return null
}

/**
 * Reencuentra un producto que el proveedor renombró.
 *
 * Texcomercial es Shopify: al cambiar el título cambia el handle y la dirección
 * vieja devuelve 404, aunque el producto siga en venta. De los 95 productos sin
 * foto, 69 estaban así.
 *
 * El emparejamiento es por SKU exacto y solo por SKU. Buscar por nombre parecido
 * es lo que produce el error que el cliente ya reportó —una motobomba ilustrada
 * con un generador—: en la prueba, el candidato equivocado traía 183TX15000E
 * donde el nuestro dice 183TX15, y la comparación exacta lo descartó sola.
 */
async function relocate(p: PendingProduct): Promise<FreshImages | null> {
  const nuestro = p.sku.trim().toUpperCase()
  if (!nuestro || nuestro.startsWith('TEX-')) return { images: [] }

  let candidatos: string[]
  try {
    candidatos = await suggestHandles(nuestro)
  } catch {
    return null
  }
  for (const handle of candidatos.slice(0, 5)) {
    try {
      const res = await fetch(`https://texcomercial.com.co/products/${handle}.js`, {
        headers: { ...UA, accept: 'application/json' },
        signal: AbortSignal.timeout(20_000),
      })
      if (!res.ok) continue
      const ficha = (await res.json()) as { variants?: { sku?: string }[]; images?: string[] }
      const calza = (ficha.variants ?? []).some((v) => v.sku?.trim().toUpperCase() === nuestro)
      if (!calza) continue
      const images = (ficha.images ?? []).map((s) => (s.startsWith('//') ? `https:${s}` : s))
      return { images, movedTo: `https://texcomercial.com.co/products/${handle}` }
    } catch {
      // se prueba el candidato siguiente
    }
    await sleep(400)
  }
  // Se preguntó y no está: el producto sí salió del catálogo del proveedor.
  return { images: [] }
}

/** Handles que sugiere el buscador del proveedor para un término. */
async function suggestHandles(termino: string): Promise<string[]> {
  const url = `https://texcomercial.com.co/search/suggest.json?q=${encodeURIComponent(termino)}&resources[type]=product&resources[limit]=5`
  const res = await fetch(url, { headers: { ...UA, accept: 'application/json' }, signal: AbortSignal.timeout(20_000) })
  if (!res.ok) throw new Error(`Texcomercial respondió ${res.status} al buscar ${termino}.`)
  const j = (await res.json()) as { resources?: { results?: { products?: { handle: string }[] } } }
  return (j.resources?.results?.products ?? []).map((x) => x.handle)
}

async function optimize(original: Buffer) {
  const { default: sharp } = await import('sharp')
  const data = await sharp(original, { failOn: 'error' })
    .resize({ width: ANCHO, withoutEnlargement: true })
    .webp({ quality: CALIDAD })
    .toBuffer()
  const meta = await sharp(data).metadata()
  return { data, width: meta.width ?? null, height: meta.height ?? null }
}

/**
 * Deja un producto con su foto guardada en la tienda.
 *
 * Una sola foto por producto: con tres, el catálogo de 2.000 productos pesaría
 * 226 MB de los 500 que da el plan; con una, unos 40. El cliente pidió que
 * ningún producto quede sin foto, no una galería, y las alternas del proveedor
 * suelen ser el mismo producto en otro ángulo.
 */
export async function storeProductImage(p: PendingProduct): Promise<{ outcome: StoreOutcome; bytes: number }> {
  const sql = db()
  try {
    const fresca = await freshImages(p)
    // No se pudo preguntar: se deja el producto como estaba y se reintenta en
    // otra corrida. Nunca se borra por no haber podido confirmar.
    if (fresca === null) return { outcome: 'fallo', bytes: 0 }

    // El enlace al proveedor se repara aunque no venga foto: de él dependen la
    // revisión de costo y de disponibilidad (pnpm catalog:sync).
    if (fresca.movedTo) {
      await sql`update public.products set source_url = ${fresca.movedTo} where id = ${p.id}`
    }

    if (fresca.images.length === 0) {
      // El proveedor confirmó que no publica foto: se deja vacío para que la
      // tienda muestre el monograma en vez de un enlace que no carga.
      await sql`update public.products set images = '{}' where id = ${p.id}`
      return { outcome: 'sin-foto', bytes: 0 }
    }

    const res = await fetch(fresca.images[0], { headers: UA, signal: AbortSignal.timeout(30_000) })
    if (!res.ok) return { outcome: 'fallo', bytes: 0 }
    const original = Buffer.from(await res.arrayBuffer())
    if (original.length === 0) return { outcome: 'fallo', bytes: 0 }

    const webp = await optimize(original)
    const [row] = await sql<{ id: string }[]>`
      insert into public.uploads (filename, content_type, size, width, height, data)
      values (${`${p.id}.webp`}, 'image/webp', ${webp.data.length}, ${webp.width}, ${webp.height}, ${webp.data})
      returning id::text as id
    `
    await sql`
      update public.products
      set images = ${[publicUrlFor(row.id, 'image/webp')]}, source_synced_at = now()
      where id = ${p.id}
    `
    return { outcome: 'guardada', bytes: webp.data.length }
  } catch {
    return { outcome: 'fallo', bytes: 0 }
  }
}

/** Los que todavía cuelgan del proveedor, de entre los ids dados (o todos). */
export async function pendingProducts(ids?: number[]): Promise<PendingProduct[]> {
  const sql = db()
  return sql<PendingProduct[]>`
    select id, source_url, sku from public.products
    where source_url is not null
      and not exists (select 1 from unnest(images) i where i like '/imagenes/%')
      ${ids ? sql`and id = any(${ids})` : sql``}
    order by id
  `
}

/**
 * Procesa una lista en paralelo moderado. El proveedor responde bien a seis
 * peticiones a la vez; con más empieza a devolver 429.
 */
export async function storeImagesFor(
  productos: PendingProduct[],
  onProgress?: (hechos: number, total: number, totales: StoreImagesTotals) => void,
): Promise<StoreImagesTotals> {
  const totales: StoreImagesTotals = { guardadas: 0, sinFoto: 0, fallos: 0, bytes: 0 }
  let siguiente = 0

  async function trabajador() {
    while (siguiente < productos.length) {
      const p = productos[siguiente++]
      const { outcome, bytes } = await storeProductImage(p)
      if (outcome === 'guardada') totales.guardadas++
      else if (outcome === 'sin-foto') totales.sinFoto++
      else totales.fallos++
      totales.bytes += bytes

      const hechos = totales.guardadas + totales.sinFoto + totales.fallos
      onProgress?.(hechos, productos.length, totales)
      await sleep(250)
    }
  }

  await Promise.all(Array.from({ length: Math.min(TRABAJADORES, productos.length) }, trabajador))
  return totales
}
