// Cálculo del precio de venta. Módulo puro: lo usan el servidor (al guardar/recalcular)
// y el panel (vista previa en vivo del cálculo).

export type PricingMode = 'markup' | 'fixed' | 'quote'

export type MarkupSource = 'product' | 'category' | 'default'

export interface PricingInput {
  mode: PricingMode
  /** Precio del proveedor en pesos. */
  costPrice: number | null
  fixedPrice: number | null
  /** % propio del producto; null = heredar. */
  productMarkup: number | null
  /** % heredado de la categoría más cercana que lo tenga definido. */
  categoryMarkup: number | null
  /** % general de la tienda. */
  defaultMarkup: number
  /** Redondeo hacia arriba al múltiplo indicado (1 = sin redondeo). */
  rounding: number
}

export interface PriceBreakdown {
  /** Precio final de venta; null = se cotiza por WhatsApp. */
  price: number | null
  markupPercent: number | null
  markupSource: MarkupSource | null
  /** Costo + margen antes del redondeo. */
  beforeRounding: number | null
  /** Por qué no hay precio, si aplica. */
  missing: 'quote' | 'no-cost' | 'no-fixed' | null
}

export function resolveMarkup(input: Pick<PricingInput, 'productMarkup' | 'categoryMarkup' | 'defaultMarkup'>): {
  percent: number
  source: MarkupSource
} {
  if (input.productMarkup != null) return { percent: input.productMarkup, source: 'product' }
  if (input.categoryMarkup != null) return { percent: input.categoryMarkup, source: 'category' }
  return { percent: input.defaultMarkup, source: 'default' }
}

export function computePrice(input: PricingInput): PriceBreakdown {
  const empty = { markupPercent: null, markupSource: null, beforeRounding: null }

  if (input.mode === 'quote') return { price: null, missing: 'quote', ...empty }

  if (input.mode === 'fixed') {
    return input.fixedPrice == null
      ? { price: null, missing: 'no-fixed', ...empty }
      : { price: input.fixedPrice, missing: null, ...empty }
  }

  if (input.costPrice == null) return { price: null, missing: 'no-cost', ...empty }

  const { percent, source } = resolveMarkup(input)
  // Aritmética entera (centésimas de %) para evitar errores de coma flotante:
  // 1000 * 1.1 = 1100.0000000000002 subiría el redondeo a 1200.
  const basisPoints = Math.round(percent * 100)
  const scaled = input.costPrice * (10000 + basisPoints) // pesos × 10000
  const step = Math.max(1, Math.round(input.rounding))
  const price = Math.ceil(scaled / (10000 * step)) * step

  return {
    price,
    markupPercent: percent,
    markupSource: source,
    beforeRounding: Math.round(scaled / 100) / 100,
    missing: null,
  }
}

export const MARKUP_SOURCE_LABEL: Record<MarkupSource, string> = {
  product: 'margen del producto',
  category: 'margen de la categoría',
  default: 'margen general',
}

export const PRICING_MODE_LABEL: Record<PricingMode, string> = {
  markup: 'Costo + margen',
  fixed: 'Precio fijo',
  quote: 'A cotizar',
}
