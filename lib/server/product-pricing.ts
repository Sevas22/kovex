import 'server-only'
import { buildCategoryIndex, getCategoryIndex, type CategoryIndex } from './categories'
import { getSettings } from './settings'
import { buildPriceTiers, floorPriceFor, parseTiers, type PriceTier, type VolumeTier } from '@/lib/volume-pricing'
import type { ProductSummary, StoreSettings } from '@/lib/types'

export type { CategoryIndex }
export { buildCategoryIndex }

/** Columnas privadas que necesita el cálculo y que nunca viajan al navegador. */
export interface PricingColumns {
  costPrice: number | null
  volumeTiers: unknown
  categoryId: number | null
}

export interface TierContext {
  settings: Pick<StoreSettings, 'volumeTiers' | 'minMarginPercent' | 'priceRounding'>
  index: CategoryIndex
}

/** Escala que aplica a un producto: la suya, la de la categoría más cercana o la general. */
export function resolveVolumeTiers(row: Pick<PricingColumns, 'volumeTiers' | 'categoryId'>, ctx: TierContext): VolumeTier[] {
  const own = parseTiers(row.volumeTiers)
  if (own) return own
  return ctx.index.inheritedTiers(row.categoryId)?.tiers ?? ctx.settings.volumeTiers
}

export { floorPriceFor }

export function priceTiersFor(row: Pick<PricingColumns, 'costPrice' | 'volumeTiers' | 'categoryId'> & { price: number | null }, ctx: TierContext): PriceTier[] {
  return buildPriceTiers({
    listPrice: row.price,
    tiers: resolveVolumeTiers(row, ctx),
    floorPrice: floorPriceFor(row.costPrice, ctx.settings.minMarginPercent),
    rounding: ctx.settings.priceRounding,
  })
}

/**
 * Añade la escalera de precios a las filas del catálogo y descarta las columnas
 * privadas (costo y escala cruda), que no deben salir del servidor.
 */
export async function attachPriceTiers<T extends ProductSummary & PricingColumns>(
  rows: T[],
): Promise<(Omit<T, keyof PricingColumns> & { priceTiers: PriceTier[] })[]> {
  if (rows.length === 0) return []
  const [settings, index] = await Promise.all([getSettings(), getCategoryIndex()])
  const ctx: TierContext = { settings, index }
  return rows.map((row) => {
    const { costPrice, volumeTiers, categoryId, ...summary } = row
    return { ...summary, priceTiers: priceTiersFor({ ...row }, ctx) }
  })
}
