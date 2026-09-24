import type { ProductSummary } from './types'

export interface CartItem {
  product: ProductSummary
  quantity: number
}

export interface CartTotals {
  subtotal: number
  unpricedCount: number
  /** Líneas cuya cantidad supera las unidades disponibles. */
  shortages: { name: string; available: number; quantity: number }[]
}

export function cartTotals(items: CartItem[]): CartTotals {
  let subtotal = 0
  let unpricedCount = 0
  const shortages: CartTotals['shortages'] = []
  for (const { product, quantity } of items) {
    if (product.price == null) unpricedCount++
    else subtotal += product.price * quantity
    if (product.available != null && quantity > product.available) {
      shortages.push({ name: product.name, available: Math.max(0, product.available), quantity })
    }
  }
  return { subtotal, unpricedCount, shortages }
}
