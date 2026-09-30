/**
 * Importa el catálogo del proveedor página por página.
 *
 * Uso:  pnpm catalog:import [--limite 2000] [--pausa 1500] [--inventario] [--inactivos]
 *
 *   --limite      cuántos productos nuevos crear como máximo (por defecto, el del plan)
 *   --pausa       milisegundos entre páginas (el proveedor limita las peticiones seguidas)
 *   --inventario  crea los productos con control de inventario en cero
 *                 (sin esta opción quedan "disponibles bajo pedido", que es lo normal
 *                  para lo que no se almacena)
 *   --inactivos   los deja ocultos en la tienda para revisarlos antes de publicar
 *
 * Se puede cortar y volver a ejecutar: los productos ya importados solo se actualizan.
 */
import { importSupplierProducts } from '@/lib/server/catalog-import'
import { db } from '@/lib/server/db'
import { loadSettings } from '@/lib/server/settings'
import { fetchSupplierCatalogPage, SupplierBusyError, type SupplierProduct } from '@/lib/server/texcomercial'

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(`--${name}`)
const value = (name: string, fallback: number) => {
  const i = args.indexOf(`--${name}`)
  const n = i >= 0 ? Number(args[i + 1]) : NaN
  return Number.isFinite(n) && n > 0 ? n : fallback
}

const PAGE_SIZE = 250
const LOTE = 100
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function pageWithRetry(page: number, pausa: number): Promise<SupplierProduct[]> {
  for (let intento = 1; intento <= 6; intento++) {
    try {
      return await fetchSupplierCatalogPage(page, PAGE_SIZE)
    } catch (error) {
      if (!(error instanceof SupplierBusyError) && intento === 6) throw error
      const espera = pausa * intento * 2
      console.log(`   proveedor ocupado, reintento ${intento} en ${Math.round(espera / 1000)} s…`)
      await sleep(espera)
    }
  }
  throw new Error(`No se pudo leer la página ${page} después de varios intentos.`)
}

async function main() {
  const sql = db()
  const settings = await loadSettings()
  const [{ count: yaHay }] = await sql<{ count: number }[]>`select count(*)::int as count from public.products`
  const limite = value('limite', settings.productLimit)
  const pausa = value('pausa', 1500)
  const trackInventory = flag('inventario')
  const isActive = !flag('inactivos')
  const cupo = Math.max(0, limite - yaHay)

  console.log(`Catálogo: ${yaHay} productos · límite ${limite} · cupo ${cupo}`)
  if (cupo === 0) {
    console.log('No hay cupo. Sube el límite en Configuración o usa --limite.')
    await sql.end()
    return
  }
  console.log(`Inventario: ${trackInventory ? 'controlado (stock 0)' : 'bajo pedido'} · visibles: ${isActive ? 'sí' : 'no'}`)

  let creados = 0
  let actualizados = 0
  let vistos = 0
  const inicio = Date.now()

  for (let page = 1; page <= 100; page++) {
    const productos = await pageWithRetry(page, pausa)
    if (productos.length === 0) break
    vistos += productos.length

    for (let i = 0; i < productos.length; i += LOTE) {
      if (creados >= cupo) break
      // El cupo se respeta producto a producto: el último lote se recorta.
      const lote = productos.slice(i, i + LOTE).slice(0, cupo - creados)
      if (lote.length === 0) break
      const res = await importSupplierProducts(lote, {
        pricingMode: 'markup',
        markupPercent: null, // hereda de la categoría o del margen general
        initialStock: 0,
        trackInventory,
        isActive,
        actor: 'importación masiva',
      })
      creados += res.created
      actualizados += res.updated
      const seg = Math.round((Date.now() - inicio) / 1000)
      console.log(`   página ${page} · ${vistos} leídos · ${creados} nuevos · ${actualizados} actualizados · ${seg} s`)
    }

    if (creados >= cupo) {
      console.log(`Se alcanzó el cupo de ${cupo} productos nuevos.`)
      break
    }
    if (productos.length < PAGE_SIZE) break
    await sleep(pausa)
  }

  const [{ count: total }] = await sql<{ count: number }[]>`select count(*)::int as count from public.products`
  const [{ count: sinPrecio }] = await sql<{ count: number }[]>`
    select count(*)::int as count from public.products where price is null
  `
  const [{ count: categorias }] = await sql<{ count: number }[]>`select count(*)::int as count from public.categories`
  console.log(
    `\nListo en ${Math.round((Date.now() - inicio) / 1000)} s · ${total} productos · ${categorias} categorías · ${sinPrecio} a cotizar`,
  )
  await sql.end()
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await db().end()
  process.exit(1)
})
