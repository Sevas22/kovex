/**
 * Repara las fotos rotas del catálogo.
 *
 * El listado masivo del proveedor (/products.json) entrega URLs de imagen
 * desactualizadas: el archivo ya no existe en su CDN y la foto sale rota. La ficha
 * individual (/products/{handle}.js) sí trae las vigentes.
 *
 * Este script revisa cada imagen guardada y, cuando alguna no responde, vuelve a
 * pedir la ficha del producto y reemplaza sus fotos.
 *
 * Uso:  pnpm catalog:fix-images [--revisar]   (--revisar solo informa, no cambia nada)
 */
import { db } from '@/lib/server/db'

const args = process.argv.slice(2)
const soloRevisar = args.includes('--revisar')
const UA = { 'user-agent': 'KovexCatalog/1.0 (+importador de catálogo de KOVEX Colombia)' }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface Row {
  id: number
  name: string
  images: string[]
  sourceUrl: string | null
}

/** Una foto guardada en la tienda, no enlazada al CDN del proveedor. */
const esPropia = (url: string) => url.startsWith('/imagenes/')

/** true si todas las imágenes del producto responden. */
async function imagesOk(images: string[]): Promise<boolean> {
  for (const url of images) {
    // Las nuestras viven en la base de datos y se sirven con una ruta relativa:
    // no se pueden pedir con fetch desde aquí, y pedirlas las daría por rotas.
    if (esPropia(url)) continue
    try {
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15_000) })
      if (!res.ok) return false
    } catch {
      return false
    }
  }
  return true
}

/**
 * Fotos vigentes según la ficha individual del proveedor. Devuelve [] cuando el
 * producto de verdad no tiene fotos y null cuando no se pudo consultar.
 */
async function freshImages(sourceUrl: string): Promise<string[] | null> {
  const handle = sourceUrl.split('/products/')[1]
  if (!handle) return null
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const res = await fetch(`https://texcomercial.com.co/products/${handle}.js`, {
        headers: UA,
        signal: AbortSignal.timeout(20_000),
      })
      if (res.ok) {
        const { images } = (await res.json()) as { images: string[] }
        return images.slice(0, 6).map((src) => (src.startsWith('//') ? `https:${src}` : src))
      }
      if (res.status !== 429 && res.status < 500) return null
    } catch {
      // red intermitente: se reintenta
    }
    await sleep(1500 * intento)
  }
  return null
}

/** Ejecuta `tarea` sobre la lista con un número fijo de trabajadores. */
async function enParalelo<T>(items: T[], workers: number, tarea: (item: T) => Promise<void>) {
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(workers, items.length) }, async () => {
      while (next < items.length) await tarea(items[next++])
    }),
  )
}

async function main() {
  const sql = db()
  // Los productos cuya foto ya guardamos nosotros quedan fuera: no dependen del
  // proveedor y pedirle un reemplazo solo serviría para perder la que tenemos.
  const productos = await sql<Row[]>`
    select id, name, images, source_url from public.products
    where cardinality(images) > 0 and source_url is not null
      and not exists (select 1 from unnest(images) img where img like '/imagenes/%')
    order by id
  `
  console.log(`Revisando las fotos de ${productos.length} productos…`)

  const rotos: Row[] = []
  let revisados = 0
  await enParalelo(productos, 24, async (p) => {
    if (!(await imagesOk(p.images))) rotos.push(p)
    revisados++
    if (revisados % 250 === 0) console.log(`   ${revisados} revisados · ${rotos.length} con fotos rotas`)
  })

  console.log(`\n${rotos.length} productos con al menos una foto rota (de ${productos.length}).`)
  if (soloRevisar || rotos.length === 0) {
    if (rotos.length) console.log('Ejecuta sin --revisar para repararlos.')
    await sql.end()
    return
  }

  let reparados = 0
  let sinSolucion = 0
  // Las fichas se piden despacio: el proveedor limita las peticiones seguidas.
  let vaciados = 0
  for (const [i, p] of rotos.entries()) {
    const images = await freshImages(p.sourceUrl!)
    if (images && images.length) {
      await sql`update public.products set images = ${images}, source_synced_at = now() where id = ${p.id}`
      reparados++
    } else if (images) {
      // El proveedor ya no tiene fotos: se quitan las rotas para que la tienda
      // muestre el monograma en vez de una imagen que no carga.
      await sql`update public.products set images = '{}', source_synced_at = now() where id = ${p.id}`
      vaciados++
    } else {
      sinSolucion++
    }
    if ((i + 1) % 25 === 0) console.log(`   ${i + 1}/${rotos.length} · ${reparados} reparados`)
    await sleep(350)
  }

  const [{ sinFoto }] = await sql<{ sinFoto: number }[]>`
    select count(*)::int as sin_foto from public.products where cardinality(images) = 0
  `
  console.log(`\nReparados: ${reparados} · sin reemplazo en el proveedor: ${sinSolucion} · sin foto en total: ${sinFoto}`)
  await sql.end()
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await db().end()
  process.exit(1)
})
