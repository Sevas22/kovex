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
  /** IVA del producto (19, 5, 0…). */
  taxRate: number
  /** true = costPrice ya trae IVA y hay que descontarlo antes del margen. */
  costIncludesTax: boolean
}

export interface PriceBreakdown {
  /** Precio final al público, con IVA; null = se cotiza por WhatsApp. */
  price: number | null
  markupPercent: number | null
  markupSource: MarkupSource | null
  /** Costo + margen + IVA antes del redondeo. */
  beforeRounding: number | null
  /** Costo del proveedor sin IVA: la base sobre la que se aplica el margen. */
  netCost: number | null
  /** Precio de venta sin IVA, deducido del precio público ya redondeado. */
  netPrice: number | null
  /** IVA contenido en el precio público. */
  taxAmount: number | null
  /** Ganancia real: precio neto menos costo neto. El IVA no es ganancia. */
  profit: number | null
  /** Por qué no hay precio, si aplica. */
  missing: 'quote' | 'no-cost' | 'no-fixed' | null
}

/** Quita el IVA de un valor que lo incluye. */
export function netOf(amount: number, taxRate: number): number {
  return Math.round((amount * 10000) / (10000 + Math.round(taxRate * 100)))
}

export function resolveMarkup(input: Pick<PricingInput, 'productMarkup' | 'categoryMarkup' | 'defaultMarkup'>): {
  percent: number
  source: MarkupSource
} {
  if (input.productMarkup != null) return { percent: input.productMarkup, source: 'product' }
  if (input.categoryMarkup != null) return { percent: input.categoryMarkup, source: 'category' }
  return { percent: input.defaultMarkup, source: 'default' }
}

/**
 * Precio al público a partir del costo del proveedor.
 *
 * El margen se aplica siempre sobre valores SIN IVA: para un responsable de
 * IVA el impuesto entra y sale, no es costo ni ganancia. El IVA se suma al
 * final y el redondeo cae sobre el precio que ve el cliente, que es el único
 * número que conviene que quede redondo.
 */
export function computePrice(input: PricingInput): PriceBreakdown {
  const empty = {
    markupPercent: null,
    markupSource: null,
    beforeRounding: null,
    netCost: null,
    netPrice: null,
    taxAmount: null,
    profit: null,
  }

  if (input.mode === 'quote') return { price: null, missing: 'quote', ...empty }

  const tax = Math.round(Math.max(0, input.taxRate) * 100) // puntos base

  if (input.mode === 'fixed') {
    if (input.fixedPrice == null) return { price: null, missing: 'no-fixed', ...empty }
    // El precio fijo se escribe tal como lo ve el cliente: ya trae IVA.
    const netPrice = netOf(input.fixedPrice, input.taxRate)
    const netCost = input.costPrice == null ? null : input.costIncludesTax ? netOf(input.costPrice, input.taxRate) : input.costPrice
    return {
      ...empty,
      price: input.fixedPrice,
      netPrice,
      netCost,
      taxAmount: input.fixedPrice - netPrice,
      profit: netCost == null ? null : netPrice - netCost,
      missing: null,
    }
  }

  if (input.costPrice == null) return { price: null, missing: 'no-cost', ...empty }

  const netCost = input.costIncludesTax ? netOf(input.costPrice, input.taxRate) : input.costPrice
  const { percent, source } = resolveMarkup(input)

  // Aritmética entera (centésimas de %) para evitar errores de coma flotante:
  // 1000 * 1.1 = 1100.0000000000002 subiría el redondeo a 1200.
  const basisPoints = Math.round(percent * 100)
  const conMargen = netCost * (10000 + basisPoints) // pesos × 10000
  const conIva = (conMargen * (10000 + tax)) / 10000 // pesos × 10000
  const step = Math.max(1, Math.round(input.rounding))
  const price = Math.ceil(conIva / (10000 * step)) * step

  const netPrice = netOf(price, input.taxRate)
  return {
    price,
    markupPercent: percent,
    markupSource: source,
    beforeRounding: Math.round(conIva / 100) / 100,
    netCost,
    netPrice,
    taxAmount: price - netPrice,
    profit: netPrice - netCost,
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
