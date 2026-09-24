import 'server-only'
import { db } from './db'
import type { InventoryMovementKind, OrderKind, OrderStatus, StockState } from '@/lib/types'

export interface OrderItemView {
  id: number
  productId: number | null
  productSlug: string | null
  productName: string
  productSku: string | null
  productImage: string | null
  unit: string
  quantity: number
  unitPrice: number | null
  /** Precio por unidad sin escala por cantidad. */
  listUnitPrice: number | null
  /** Descuento por volumen aplicado en esa línea. */
  discountPercent: number
  lineTotal: number | null
  stockTracked: boolean
}

export interface OrderView {
  id: number
  code: string
  publicToken: string
  kind: OrderKind
  status: OrderStatus
  stockState: StockState
  customerId: number | null
  customerName: string
  customerCompany: string | null
  customerDocument: string | null
  customerPhone: string
  customerEmail: string | null
  customerCity: string | null
  customerAddress: string | null
  customerNotes: string | null
  subtotal: number
  /** Ahorro total por escalas de cantidad. */
  discountTotal: number
  hasUnpricedItems: boolean
  adminNotes: string | null
  confirmedAt: Date | null
  cancelledAt: Date | null
  cancelReason: string | null
  createdAt: Date
  updatedAt: Date
  items: OrderItemView[]
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function loadOrder(where: { id?: number; token?: string }): Promise<OrderView | null> {
  const sql = db()
  const [order] = where.token
    ? await sql<Omit<OrderView, 'items'>[]>`
        select o.*, o.public_token::text as public_token from public.orders o where o.public_token = ${where.token}::uuid
      `
    : await sql<Omit<OrderView, 'items'>[]>`
        select o.*, o.public_token::text as public_token from public.orders o where o.id = ${where.id!}
      `
  if (!order) return null
  const items = await sql<OrderItemView[]>`
    select i.id, i.product_id, p.slug as product_slug, i.product_name, i.product_sku, i.product_image, i.unit,
           i.quantity, i.unit_price, i.list_unit_price, i.discount_percent, i.line_total, i.stock_tracked
    from public.order_items i
    left join public.products p on p.id = i.product_id
    where i.order_id = ${order.id}
    order by i.id
  `
  return { ...order, items }
}

/** Vista pública de un pedido (enlace que recibe el cliente). */
export async function getOrderByToken(token: string): Promise<OrderView | null> {
  if (!UUID.test(token)) return null
  return loadOrder({ token })
}

export async function getOrderById(id: number): Promise<OrderView | null> {
  if (!Number.isInteger(id) || id <= 0) return null
  return loadOrder({ id })
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export interface OrderListItem {
  id: number
  code: string
  kind: OrderKind
  status: OrderStatus
  customerName: string
  customerCompany: string | null
  customerCity: string | null
  customerPhone: string
  subtotal: number
  hasUnpricedItems: boolean
  itemCount: number
  createdAt: Date
}

export type OrderFilter = 'todos' | 'pedidos' | 'cotizaciones' | 'pendientes'

export async function listOrders(opts: { filter: OrderFilter; status?: OrderStatus; q?: string; limit?: number }) {
  const sql = db()
  const conds = [sql`true`]
  if (opts.filter === 'pedidos') conds.push(sql`o.kind = 'order'`)
  if (opts.filter === 'cotizaciones') conds.push(sql`o.kind = 'quote'`)
  if (opts.filter === 'pendientes') conds.push(sql`o.status in ('pending', 'quoted')`)
  if (opts.status) conds.push(sql`o.status = ${opts.status}`)
  const q = opts.q?.trim()
  if (q) {
    const like = `%${q}%`
    conds.push(sql`(o.code ilike ${like} or o.customer_name ilike ${like} or o.customer_company ilike ${like} or o.customer_phone like ${`%${q.replace(/\D/g, '') || q}%`})`)
  }
  const where = conds.reduce((acc, c) => sql`${acc} and ${c}`)
  return sql<OrderListItem[]>`
    select o.id, o.code, o.kind, o.status, o.customer_name, o.customer_company, o.customer_city, o.customer_phone,
           o.subtotal, o.has_unpriced_items, o.created_at,
           (select count(*)::int from public.order_items i where i.order_id = o.id) as item_count
    from public.orders o
    where ${where}
    order by o.created_at desc
    limit ${opts.limit ?? 100}
  `
}

export interface OrderEvent {
  id: number
  type: string
  message: string
  actor: string | null
  createdAt: Date
}

export async function getOrderEvents(orderId: number): Promise<OrderEvent[]> {
  return db()<OrderEvent[]>`
    select id, type, message, actor, created_at from public.order_events where order_id = ${orderId} order by created_at, id
  `
}

export interface MovementView {
  id: number
  productId: number
  productName: string
  productSlug: string
  orderId: number | null
  orderCode: string | null
  kind: InventoryMovementKind
  stockDelta: number
  reservedDelta: number
  stockAfter: number
  reservedAfter: number
  note: string | null
  actor: string | null
  createdAt: Date
}

export async function listMovements(opts: { productId?: number; orderId?: number; limit?: number }) {
  const sql = db()
  const conds = [sql`true`]
  if (opts.productId) conds.push(sql`m.product_id = ${opts.productId}`)
  if (opts.orderId) conds.push(sql`m.order_id = ${opts.orderId}`)
  const where = conds.reduce((acc, c) => sql`${acc} and ${c}`)
  return sql<MovementView[]>`
    select m.id, m.product_id, p.name as product_name, p.slug as product_slug, m.order_id, o.code as order_code,
           m.kind, m.stock_delta, m.reserved_delta, m.stock_after, m.reserved_after, m.note, m.actor, m.created_at
    from public.inventory_movements m
    join public.products p on p.id = m.product_id
    left join public.orders o on o.id = m.order_id
    where ${where}
    order by m.created_at desc, m.id desc
    limit ${opts.limit ?? 100}
  `
}

export interface DashboardStats {
  pendingOrders: number
  pendingQuotes: number
  salesThisMonth: number
  ordersThisMonth: number
  reservedUnits: number
  productCount: number
  activeProducts: number
  lowStock: number
  outOfStock: number
  productLimit: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [row] = await db()<DashboardStats[]>`
    select
      (select count(*)::int from public.orders where kind = 'order' and status = 'pending') as pending_orders,
      (select count(*)::int from public.orders where kind = 'quote' and status in ('pending', 'quoted')) as pending_quotes,
      (select coalesce(sum(subtotal), 0)::bigint from public.orders
        where kind = 'order' and status in ('confirmed', 'shipped', 'delivered')
          and confirmed_at >= date_trunc('month', now() at time zone 'America/Bogota') at time zone 'America/Bogota'
      ) as sales_this_month,
      (select count(*)::int from public.orders
        where kind = 'order' and status in ('confirmed', 'shipped', 'delivered')
          and confirmed_at >= date_trunc('month', now() at time zone 'America/Bogota') at time zone 'America/Bogota'
      ) as orders_this_month,
      (select coalesce(sum(reserved), 0)::int from public.products) as reserved_units,
      (select count(*)::int from public.products) as product_count,
      (select count(*)::int from public.products where is_active) as active_products,
      (select count(*)::int from public.products p, public.store_settings s
        where p.is_active and p.track_inventory and p.stock - p.reserved > 0
          and p.stock - p.reserved <= coalesce(p.low_stock_threshold, s.low_stock_threshold)) as low_stock,
      (select count(*)::int from public.products
        where is_active and track_inventory and stock - reserved <= 0) as out_of_stock,
      (select product_limit from public.store_settings where id) as product_limit
  `
  return row
}
