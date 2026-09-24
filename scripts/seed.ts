/**
 * Carga de demostración: márgenes de ejemplo y 15 productos reales de Texcomercial
 * repartidos en los 6 departamentos, con los tres modos de precio para ver cómo se
 * comporta el cálculo. Se puede ejecutar varias veces sin duplicar nada.
 *
 * Uso: pnpm db:seed
 */
import { randomBytes } from 'node:crypto'
import { importSupplierProducts } from '@/lib/server/catalog-import'
import { db } from '@/lib/server/db'
import { upsertAdminUser } from '@/lib/server/passwords'
import { recalculatePrices } from '@/lib/server/prices'
import { fetchSupplierProducts } from '@/lib/server/texcomercial'
import type { PricingMode } from '@/lib/pricing'

interface DemoProduct {
  handle: string
  mode: PricingMode
  /** % propio del producto; si no se indica hereda de la categoría o del general. */
  markup?: number
  fixedPrice?: number
  stock: number
  featured?: boolean
}

// Margen general y por departamento (el producto puede sobrescribirlo).
const DEFAULT_MARKUP = 20
const DEPARTMENT_MARKUP: Record<string, number | null> = {
  ferreteria: 35,
  agro: null, // hereda el 20 % general
  hogar: 25,
  maquinaria: 18,
  tecnologia: 10,
  electro: 15,
}

const PRODUCTS: DemoProduct[] = [
  // Ferretería
  { handle: 'brocha-popular-2-negro-cerda-mona', mode: 'markup', markup: 40, stock: 120, featured: true },
  { handle: 'brocha-la-todera-3-azul-cerda-mona', mode: 'markup', stock: 80 },
  { handle: 'pintura-corona-professional-1a-mano-blanco-1-galon', mode: 'markup', stock: 40, featured: true },
  { handle: 'llave-jardin-pesada-satin-x4', mode: 'quote', stock: 12 },
  // Agro
  { handle: 'carretilla-duragro-antipinchazo-metalica-65lt-rojo-2', mode: 'markup', stock: 15, featured: true },
  { handle: 'malla-cuad-todo-terre-15x15mm-1x30mt-vde', mode: 'quote', stock: 50 },
  // Hogar
  { handle: 'vajilla-corona-16-piezas-4-puestos-meranti-vl143f040216', mode: 'markup', stock: 25, featured: true },
  { handle: 'silla-mecedora-ovo-colplast-gris-hielo-1453-7707388154532', mode: 'fixed', fixedPrice: 229_900, stock: 10, featured: true },
  { handle: 'estante-solido-rimax-15-pulgadas-5-niveles-negro', mode: 'markup', stock: 18 },
  // Maquinaria
  { handle: 'motobomba-autocebante-2x2-pulg-1', mode: 'quote', stock: 3 },
  { handle: 'motor-gasolina-cuatro-tiempos-15hp-eje-roscado-1', mode: 'markup', stock: 2, featured: true },
  // Tecnología
  { handle: 'televisor-samsung-smart-50-crystal-uhd-4k-negro', mode: 'markup', markup: 12, stock: 6, featured: true },
  { handle: 'televisor-hyundai-qled-60-uhd-4k-hyled6005qg', mode: 'markup', stock: 0 },
  // Electro
  { handle: 'licuadora-oster-vidrio-1-5-lt-6-velocidades-negro', mode: 'markup', stock: 30, featured: true },
  { handle: 'nevera-haceb-207l-frost-ce-r2-negro', mode: 'quote', stock: 4 },
]

async function main() {
  const sql = db()

  console.log('→ Márgenes de ejemplo')
  await sql`update public.store_settings set default_markup_percent = ${DEFAULT_MARKUP}, price_rounding = 100 where id`
  for (const [slug, markup] of Object.entries(DEPARTMENT_MARKUP)) {
    await sql`update public.categories set markup_percent = ${markup} where slug = ${slug} and parent_id is null`
  }

  console.log('→ Descargando fichas de Texcomercial…')
  const handles = PRODUCTS.map((p) => p.handle)
  const fetched = await fetchSupplierProducts(handles)
  const missing = handles.filter((h) => !fetched.some((f) => f.handle === h))
  if (missing.length) console.warn(`  ⚠ No se encontraron en el proveedor: ${missing.join(', ')}`)

  for (const demo of PRODUCTS) {
    const item = fetched.find((f) => f.handle === demo.handle)
    if (!item) continue
    const result = await importSupplierProducts([item], {
      pricingMode: demo.mode,
      markupPercent: demo.markup ?? null,
      initialStock: demo.stock,
      isActive: true,
      actor: 'seed',
    })
    const id = result.productIds[0]
    // Reaplica la configuración de la demo también en productos ya existentes.
    await sql`
      update public.products set
        pricing_mode = ${demo.mode},
        markup_percent = ${demo.mode === 'markup' ? (demo.markup ?? null) : null},
        fixed_price = ${demo.fixedPrice ?? null},
        is_featured = ${demo.featured ?? false}
      where id = ${id}
    `
    console.log(`  ${result.created ? '✓ creado ' : '↻ existía'}  ${item.name}`)
  }
  const changed = await recalculatePrices(sql)
  console.log(`→ Precios recalculados (${changed} cambios)`)

  const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from public.admin_users`
  if (count === 0) {
    const email = process.env.ADMIN_EMAIL ?? 'admin@kovex.com.co'
    const password = process.env.ADMIN_PASSWORD ?? randomBytes(9).toString('base64url')
    await upsertAdminUser({ email, name: 'Administrador KOVEX', password })
    console.log(`→ Usuario administrador creado\n   correo: ${email}\n   contraseña: ${password}`)
  }

  const summary = await sql<{ name: string; mode: string; cost: number | null; price: number | null; stock: number }[]>`
    select name, pricing_mode as mode, cost_price as cost, price, stock from public.products order by id
  `
  console.table(summary)
  await sql.end()
}

main().catch(async (error) => {
  console.error(error)
  await db().end()
  process.exit(1)
})
