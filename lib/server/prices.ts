import 'server-only'
import { computePrice, type PricingMode } from '@/lib/pricing'
import { buildCategoryIndex, loadCategories } from './categories'
import { db, type Sql, type Tx } from './db'
import { loadSettings } from './settings'

interface PricingRow {
  id: number
  pricingMode: PricingMode
  costPrice: number | null
  markupPercent: number | null
  fixedPrice: number | null
  categoryId: number | null
  price: number | null
}

/**
 * Recalcula el precio de venta guardado en products.price.
 * Sin productIds recalcula todo el catálogo (p. ej. al cambiar el margen general).
 * Devuelve cuántos productos cambiaron de precio.
 */
export async function recalculatePrices(sql: Sql | Tx = db(), productIds?: number[]): Promise<number> {
  const [settings, categories] = await Promise.all([loadSettings(sql), loadCategories(sql)])
  const index = buildCategoryIndex(categories)

  const rows = productIds
    ? await sql<PricingRow[]>`
        select id, pricing_mode, cost_price, markup_percent, fixed_price, category_id, price
        from public.products where id = any(${productIds})
      `
    : await sql<PricingRow[]>`
        select id, pricing_mode, cost_price, markup_percent, fixed_price, category_id, price
        from public.products
      `

  const changes = rows.flatMap((row) => {
    const { price } = computePrice({
      mode: row.pricingMode,
      costPrice: row.costPrice,
      fixedPrice: row.fixedPrice,
      productMarkup: row.markupPercent,
      categoryMarkup: index.inheritedMarkup(row.categoryId)?.percent ?? null,
      defaultMarkup: settings.defaultMarkupPercent,
      rounding: settings.priceRounding,
    })
    return price === row.price ? [] : [{ id: row.id, price }]
  })

  if (changes.length === 0) return 0

  await sql`
    update public.products p
    set price = v.price
    from jsonb_to_recordset(${sql.json(changes)}) as v(id bigint, price integer)
    where p.id = v.id
  `
  return changes.length
}
