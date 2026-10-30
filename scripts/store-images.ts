/**
 * Guarda en la tienda las fotos del proveedor que aún están enlazadas.
 *
 *   pnpm catalog:store-images [--limite N] [--revisar]
 *
 * Desde ahora el importador del panel ya guarda la foto al traer un producto
 * (ver lib/server/product-images.ts). Este script es para el catálogo que se
 * importó antes de ese cambio, y como red de seguridad si al importar el
 * proveedor estaba caído.
 *
 * Es reanudable: salta los productos que ya tienen foto propia, así que si se
 * corta a la mitad basta volver a correrlo.
 */
import { db } from '@/lib/server/db'
import { pendingProducts, storeImagesFor } from '@/lib/server/product-images'

const args = process.argv.slice(2)
const soloRevisar = args.includes('--revisar')
const limite = Number(args[args.indexOf('--limite') + 1]) || Infinity

async function main() {
  const sql = db()
  const pendientes = await pendingProducts()
  const objetivo = pendientes.slice(0, limite === Infinity ? undefined : limite)
  console.log(`${pendientes.length} productos sin foto propia · se procesarán ${objetivo.length}`)
  if (soloRevisar) {
    console.log('(--revisar: no se descarga nada)')
    await sql.end()
    return
  }

  const t = await storeImagesFor(objetivo, (hechos, total, totales) => {
    if (hechos % 50 === 0) {
      console.log(`   ${hechos}/${total} · ${totales.guardadas} guardadas · ${Math.round(totales.bytes / 1024 / 1024)} MB`)
    }
  })

  const [resumen] = await sql<{ propias: number; sinFoto: number }[]>`
    select count(*) filter (where exists (select 1 from unnest(images) i where i like '/imagenes/%'))::int as propias,
           count(*) filter (where cardinality(images) = 0)::int as sin_foto
    from public.products
  `
  console.log(`\nguardadas: ${t.guardadas} · el proveedor no tiene foto: ${t.sinFoto} · fallaron: ${t.fallos}`)
  console.log(`peso añadido: ${Math.round(t.bytes / 1024 / 1024)} MB`)
  console.log(`catálogo: ${resumen.propias} con foto propia · ${resumen.sinFoto} sin foto`)
  await sql.end()
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await db().end()
  process.exit(1)
})
