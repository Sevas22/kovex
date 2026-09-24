// Escalas por cantidad. Módulo puro: lo usan el servidor (al armar el catálogo y al
// guardar un pedido) y el navegador (estimado en vivo del carrito).
//
// Regla: el descuento se calcula sobre el precio de lista y nunca deja el precio por
// debajo del piso (costo + margen mínimo). El piso solo se conoce en el servidor, así
// que el servidor publica la escalera ya calculada y el navegador solo la consulta.

/** Regla configurada: desde `minQty` unidades, `percent` % de descuento. */
export interface VolumeTier {
  minQty: number
  percent: number
}

/** Escalón ya calculado para un producto concreto. */
export interface PriceTier {
  minQty: number
  /** Precio por unidad a partir de esa cantidad. */
  unitPrice: number
  /** Descuento real frente al precio de lista, después del piso y del redondeo. */
  percent: number
}

export const MAX_TIERS = 6
export const MIN_TIER_QTY = 2

/** Ordena, limpia y deduplica una escala venida de la base o de un formulario. */
export function normalizeTiers(value: unknown): VolumeTier[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<number>()
  const tiers: VolumeTier[] = []
  for (const raw of value) {
    const minQty = Math.floor(Number((raw as VolumeTier)?.minQty))
    const percent = Math.round(Number((raw as VolumeTier)?.percent) * 100) / 100
    if (!Number.isFinite(minQty) || !Number.isFinite(percent)) continue
    if (minQty < MIN_TIER_QTY || percent <= 0 || percent > 90) continue
    if (seen.has(minQty)) continue
    seen.add(minQty)
    tiers.push({ minQty, percent })
  }
  return tiers.sort((a, b) => a.minQty - b.minQty).slice(0, MAX_TIERS)
}

/** null cuando el valor guardado es null (heredar); [] cuando es una escala vacía. */
export function parseTiers(value: unknown): VolumeTier[] | null {
  if (value == null) return null
  return normalizeTiers(value)
}

/**
 * Escalera pública de un producto: precio por unidad en cada escalón, con el piso de
 * margen y el redondeo ya aplicados. Devuelve solo los escalones que abaratan de verdad.
 */
export function buildPriceTiers(input: {
  listPrice: number | null
  tiers: VolumeTier[]
  /** Costo + margen mínimo. null = sin piso (no conocemos el costo). */
  floorPrice: number | null
  rounding: number
}): PriceTier[] {
  const { listPrice } = input
  if (listPrice == null || listPrice <= 0) return []

  const step = Math.max(1, Math.round(input.rounding))
  const floor = input.floorPrice == null ? 0 : Math.ceil(input.floorPrice / step) * step
  const out: PriceTier[] = []

  for (const tier of normalizeTiers(input.tiers)) {
    const target = Math.ceil((listPrice * (100 - tier.percent)) / 100 / step) * step
    const unitPrice = Math.max(target, floor)
    if (unitPrice >= listPrice) continue // el piso se comió el descuento
    const previous = out.at(-1)
    if (previous && unitPrice >= previous.unitPrice) continue // no mejora al escalón anterior
    const percent = Math.round(((listPrice - unitPrice) / listPrice) * 1000) / 10
    if (percent <= 0) continue
    out.push({ minQty: tier.minQty, unitPrice, percent })
  }
  return out
}

/** Precio mínimo al que se puede vender: costo + margen mínimo. null = sin piso. */
export function floorPriceFor(costPrice: number | null, minMarginPercent: number): number | null {
  if (costPrice == null) return null
  return Math.round((costPrice * (100 + minMarginPercent)) / 100)
}

/** Escalón que corresponde a una cantidad (el mayor que ya se alcanzó). */
export function tierForQuantity(tiers: PriceTier[], quantity: number): PriceTier | null {
  let match: PriceTier | null = null
  for (const tier of tiers) if (quantity >= tier.minQty) match = tier
  return match
}

/** Siguiente escalón, para invitar a subir la cantidad ("desde 12 u. ahorras 5 %"). */
export function nextTier(tiers: PriceTier[], quantity: number): PriceTier | null {
  return tiers.find((t) => quantity < t.minQty) ?? null
}

export interface LinePrice {
  /** Precio por unidad que se cobra. */
  unitPrice: number | null
  /** Precio por unidad sin escala. */
  listUnitPrice: number | null
  percent: number
  lineTotal: number
  /** Ahorro de la línea frente al precio de lista. */
  saved: number
}

export function priceLine(input: { listPrice: number | null; tiers: PriceTier[]; quantity: number }): LinePrice {
  const { listPrice, quantity } = input
  if (listPrice == null) {
    return { unitPrice: null, listUnitPrice: null, percent: 0, lineTotal: 0, saved: 0 }
  }
  const tier = tierForQuantity(input.tiers, quantity)
  const unitPrice = tier?.unitPrice ?? listPrice
  return {
    unitPrice,
    listUnitPrice: listPrice,
    percent: tier?.percent ?? 0,
    lineTotal: unitPrice * quantity,
    saved: (listPrice - unitPrice) * quantity,
  }
}
