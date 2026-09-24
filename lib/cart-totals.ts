import { nextTier, priceLine, tierForQuantity, type PriceTier } from './volume-pricing'
import type { ProductSummary } from './types'

export interface CartItem {
  product: ProductSummary
  quantity: number
}

export interface CartLineView {
  productId: number
  /** Precio por unidad con la escala aplicada; null = a cotizar. */
  unitPrice: number | null
  listUnitPrice: number | null
  /** Descuento aplicado en esta línea. */
  percent: number
  lineTotal: number
  saved: number
  /** Escalón alcanzado y el siguiente, para invitar a subir la cantidad. */
  tier: PriceTier | null
  next: PriceTier | null
}

export interface CartTotals {
  /** Suma a precio de lista, sin escalas. */
  listSubtotal: number
  /** Suma con las escalas por cantidad aplicadas. */
  subtotal: number
  /** listSubtotal − subtotal. */
  discount: number
  unpricedCount: number
  /** Líneas cuya cantidad supera las unidades disponibles. */
  shortages: { name: string; available: number; quantity: number }[]
  lines: Map<number, CartLineView>
}

export function cartTotals(items: CartItem[]): CartTotals {
  let listSubtotal = 0
  let subtotal = 0
  let unpricedCount = 0
  const shortages: CartTotals['shortages'] = []
  const lines = new Map<number, CartLineView>()

  for (const { product, quantity } of items) {
    const tiers = product.priceTiers ?? []
    const price = priceLine({ listPrice: product.price, tiers, quantity })
    if (product.price == null) unpricedCount++
    else {
      listSubtotal += product.price * quantity
      subtotal += price.lineTotal
    }
    lines.set(product.id, {
      productId: product.id,
      unitPrice: price.unitPrice,
      listUnitPrice: price.listUnitPrice,
      percent: price.percent,
      lineTotal: price.lineTotal,
      saved: price.saved,
      tier: tierForQuantity(tiers, quantity),
      next: nextTier(tiers, quantity),
    })
    if (product.available != null && quantity > product.available) {
      shortages.push({ name: product.name, available: Math.max(0, product.available), quantity })
    }
  }

  return { listSubtotal, subtotal, discount: listSubtotal - subtotal, unpricedCount, shortages, lines }
}
