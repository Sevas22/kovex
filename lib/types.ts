import type { PricingMode } from './pricing'
import type { PriceTier, VolumeTier } from './volume-pricing'

export type { PricingMode }
export type { PriceTier, VolumeTier }

export interface StoreSettings {
  businessName: string
  whatsappNumber: string
  contactEmail: string
  contactPhone: string | null
  address: string | null
  city: string
  defaultMarkupPercent: number
  priceRounding: number
  lowStockThreshold: number
  productLimit: number
  /** Escala general por cantidad; la heredan categorías y productos. */
  volumeTiers: VolumeTier[]
  /** Margen mínimo que ningún descuento puede traspasar. */
  minMarginPercent: number
}

/** Datos públicos de la tienda que necesitan los componentes de cliente. */
export interface PublicStoreInfo {
  businessName: string
  whatsappNumber: string
  contactEmail: string
  contactPhone: string | null
  city: string
}

export interface Category {
  id: number
  parentId: number | null
  slug: string
  name: string
  description: string | null
  icon: string | null
  markupPercent: number | null
  /** null = heredar la escala del padre o la general; [] = sin escala. */
  volumeTiers: VolumeTier[] | null
  sortOrder: number
  isActive: boolean
}

export interface CategoryLink {
  slug: string
  name: string
}

export interface Department extends CategoryLink {
  id: number
  icon: string | null
  description: string | null
  productCount: number
  image: string | null
}

export interface ProductSpec {
  label: string
  value: string
}

/** Producto tal como lo muestra la tienda (tarjetas, carrito). */
export interface ProductSummary {
  id: number
  slug: string
  name: string
  brand: string | null
  sku: string
  image: string | null
  unit: string
  /** null = precio a cotizar. */
  price: number | null
  compareAtPrice: number | null
  /** Unidades disponibles (stock - reservado); null = no controla inventario. */
  available: number | null
  lowStockThreshold: number
  isFeatured: boolean
  /** Escalera de precios por cantidad, ya calculada y con el piso de margen aplicado. */
  priceTiers: PriceTier[]
}

export interface ProductDetail extends ProductSummary {
  description: string | null
  specs: ProductSpec[]
  images: string[]
  taxRate: number
  breadcrumbs: CategoryLink[]
}

export type StockLevel = 'untracked' | 'out' | 'low' | 'in'

export function stockLevel(p: Pick<ProductSummary, 'available' | 'lowStockThreshold'>): StockLevel {
  if (p.available == null) return 'untracked'
  if (p.available <= 0) return 'out'
  if (p.available <= p.lowStockThreshold) return 'low'
  return 'in'
}

// ---------------------------------------------------------------------------
// Pedidos y cotizaciones
// ---------------------------------------------------------------------------

export type OrderKind = 'quote' | 'order'
export type OrderStatus = 'pending' | 'quoted' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type StockState = 'none' | 'reserved' | 'committed' | 'released' | 'returned'

export const ORDER_KIND_LABEL: Record<OrderKind, string> = {
  quote: 'Cotización',
  order: 'Pedido',
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  quoted: 'Cotizada',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export const STOCK_STATE_LABEL: Record<StockState, string> = {
  none: 'Sin movimiento',
  reserved: 'Unidades reservadas',
  committed: 'Descontado del inventario',
  released: 'Reserva liberada',
  returned: 'Devuelto al inventario',
}

export interface CartLine {
  productId: number
  quantity: number
}

export interface CustomerInput {
  name: string
  company?: string
  document?: string
  phone: string
  email?: string
  city?: string
  address?: string
  notes?: string
}

export type InventoryMovementKind =
  | 'initial'
  | 'restock'
  | 'adjustment'
  | 'reserve'
  | 'release'
  | 'sale'
  | 'return'

export const MOVEMENT_LABEL: Record<InventoryMovementKind, string> = {
  initial: 'Stock inicial',
  restock: 'Entrada',
  adjustment: 'Ajuste',
  reserve: 'Reserva',
  release: 'Reserva liberada',
  sale: 'Venta',
  return: 'Devolución',
}
