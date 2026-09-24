import 'server-only'
import { db, type Tx } from './db'
import { reserveStock, settleOrderStock, StockError } from './inventory'
import { normalizePhone } from '@/lib/text'
import type { CartLine, CustomerInput, OrderKind, OrderStatus, StockState } from '@/lib/types'

export class OrderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OrderError'
  }
}

export function isBusinessError(error: unknown): error is OrderError | StockError {
  return error instanceof OrderError || error instanceof StockError
}

// ---------------------------------------------------------------------------
// Creación desde la tienda
// ---------------------------------------------------------------------------

export interface CreatedOrder {
  id: number
  code: string
  publicToken: string
  kind: OrderKind
}

interface ProductForOrder {
  id: number
  name: string
  sku: string
  image: string | null
  unit: string
  price: number | null
  isActive: boolean
}

export async function createOrder(input: {
  kind: OrderKind
  items: CartLine[]
  customer: CustomerInput
}): Promise<CreatedOrder> {
  const phone = normalizePhone(input.customer.phone)
  const ids = [...new Set(input.items.map((i) => i.productId))]

  return db().begin(async (tx) => {
    const products = await tx<ProductForOrder[]>`
      select id, name, sku, images[1] as image, unit, price, is_active
      from public.products
      where id = any(${ids})
      order by id
    `
    const byId = new Map(products.map((p) => [p.id, p]))
    const unavailable = input.items.filter((i) => !byId.get(i.productId)?.isActive)
    if (unavailable.length) {
      throw new OrderError('Algunos productos de tu lista ya no están disponibles. Revisa tu pedido e inténtalo de nuevo.')
    }

    if (input.kind === 'order') {
      const unpriced = products.filter((p) => p.price == null)
      if (unpriced.length) {
        throw new OrderError(
          `${unpriced.map((p) => p.name).join(', ')} no ${unpriced.length === 1 ? 'tiene' : 'tienen'} precio publicado. ` +
            'Envía tu lista como cotización y te respondemos con el valor.',
        )
      }
    }

    const c = input.customer
    const [customer] = await tx<{ id: number }[]>`
      insert into public.customers (phone, name, company, document, email, city, address)
      values (${phone}, ${c.name}, ${c.company || null}, ${c.document || null}, ${c.email || null},
              ${c.city || null}, ${c.address || null})
      on conflict (phone) do update set
        name = excluded.name,
        company = coalesce(excluded.company, public.customers.company),
        document = coalesce(excluded.document, public.customers.document),
        email = coalesce(excluded.email, public.customers.email),
        city = coalesce(excluded.city, public.customers.city),
        address = coalesce(excluded.address, public.customers.address)
      returning id
    `

    const lines = input.items.map((i) => ({ ...i, product: byId.get(i.productId)! }))
    const subtotal = lines.reduce((sum, l) => sum + (l.product.price ?? 0) * l.quantity, 0)
    const hasUnpriced = lines.some((l) => l.product.price == null)

    const [order] = await tx<CreatedOrder[]>`
      insert into public.orders
        (kind, customer_id, customer_name, customer_company, customer_document, customer_phone,
         customer_email, customer_city, customer_address, customer_notes, subtotal, has_unpriced_items)
      values
        (${input.kind}, ${customer.id}, ${c.name}, ${c.company || null}, ${c.document || null}, ${phone},
         ${c.email || null}, ${c.city || null}, ${c.address || null}, ${c.notes || null}, ${subtotal}, ${hasUnpriced})
      returning id, code, public_token::text as public_token, kind
    `

    const items = lines.map((l) => ({
      orderId: order.id,
      productId: l.product.id,
      productName: l.product.name,
      productSku: l.product.sku,
      productImage: l.product.image,
      unit: l.product.unit,
      quantity: l.quantity,
      unitPrice: l.product.price,
    }))
    await tx`insert into public.order_items ${tx(items)}`

    if (input.kind === 'order') {
      const tracked = await reserveStock(tx, order.id, input.items, null)
      await markTracked(tx, order.id, tracked)
      await tx`update public.orders set stock_state = 'reserved' where id = ${order.id}`
    }

    await addEvent(
      tx,
      order.id,
      'created',
      input.kind === 'order' ? 'El cliente hizo el pedido desde la tienda.' : 'El cliente pidió una cotización desde la tienda.',
      null,
    )
    return order
  })
}

async function markTracked(tx: Tx, orderId: number, productIds: number[]) {
  if (productIds.length === 0) return
  await tx`
    update public.order_items set stock_tracked = true
    where order_id = ${orderId} and product_id = any(${productIds})
  `
}

async function addEvent(tx: Tx, orderId: number, type: string, message: string, actor: string | null) {
  await tx`insert into public.order_events (order_id, type, message, actor) values (${orderId}, ${type}, ${message}, ${actor})`
}

// ---------------------------------------------------------------------------
// Gestión desde el panel
// ---------------------------------------------------------------------------

interface OrderState {
  id: number
  code: string
  kind: OrderKind
  status: OrderStatus
  stockState: StockState
}

async function lockOrder(tx: Tx, orderId: number): Promise<OrderState> {
  const [order] = await tx<OrderState[]>`
    select id, code, kind, status, stock_state from public.orders where id = ${orderId} for update
  `
  if (!order) throw new OrderError('El pedido no existe.')
  return order
}

function assertStatus(order: OrderState, allowed: OrderStatus[], action: string) {
  if (!allowed.includes(order.status)) {
    throw new OrderError(`No se puede ${action}: el pedido ${order.code} ya no está en un estado que lo permita. Recarga la página.`)
  }
}

async function recomputeTotals(tx: Tx, orderId: number) {
  await tx`
    update public.orders o set
      subtotal = coalesce((select sum(line_total) from public.order_items where order_id = o.id), 0),
      has_unpriced_items = exists (
        select 1 from public.order_items where order_id = o.id and unit_price is null
      )
    where o.id = ${orderId}
  `
}

/** Guarda los precios que el asesor asigna a una cotización y la marca como cotizada. */
export async function quoteOrder(orderId: number, prices: { itemId: number; unitPrice: number | null }[], actor: string) {
  await db().begin(async (tx) => {
    const order = await lockOrder(tx, orderId)
    if (order.kind !== 'quote') throw new OrderError('Solo las cotizaciones admiten precios manuales.')
    assertStatus(order, ['pending', 'quoted'], 'actualizar la cotización')
    for (const p of prices) {
      await tx`
        update public.order_items set unit_price = ${p.unitPrice}
        where id = ${p.itemId} and order_id = ${orderId}
      `
    }
    await recomputeTotals(tx, orderId)
    await tx`update public.orders set status = 'quoted' where id = ${orderId}`
    await addEvent(tx, orderId, 'quoted', 'Se asignaron precios a la cotización.', actor)
  })
}

/** Convierte una cotización aceptada en pedido: reserva el inventario. */
export async function convertQuoteToOrder(orderId: number, actor: string) {
  await db().begin(async (tx) => {
    const order = await lockOrder(tx, orderId)
    if (order.kind !== 'quote') throw new OrderError('Este registro ya es un pedido.')
    assertStatus(order, ['pending', 'quoted'], 'convertir la cotización')

    const items = await tx<{ productId: number | null; quantity: number; unitPrice: number | null; productName: string }[]>`
      select product_id, quantity, unit_price, product_name from public.order_items where order_id = ${orderId}
    `
    const unpriced = items.filter((i) => i.unitPrice == null)
    if (unpriced.length) {
      throw new OrderError(`Asigna precio a: ${unpriced.map((i) => i.productName).join(', ')}.`)
    }
    const lines = items.filter((i) => i.productId != null).map((i) => ({ productId: i.productId!, quantity: i.quantity }))
    const tracked = await reserveStock(tx, orderId, lines, actor)
    await markTracked(tx, orderId, tracked)
    await tx`
      update public.orders set kind = 'order', status = 'pending', stock_state = 'reserved' where id = ${orderId}
    `
    await addEvent(tx, orderId, 'converted', 'La cotización se convirtió en pedido y se reservó el inventario.', actor)
  })
}

/** El cliente pagó / se cerró la venta por WhatsApp: descuenta el inventario reservado. */
export async function confirmOrder(orderId: number, actor: string) {
  await db().begin(async (tx) => {
    const order = await lockOrder(tx, orderId)
    if (order.kind !== 'order') throw new OrderError('Primero convierte la cotización en pedido.')
    assertStatus(order, ['pending'], 'confirmar el pedido')
    await settleOrderStock(tx, orderId, 'sale', actor)
    await tx`
      update public.orders set status = 'confirmed', stock_state = 'committed', confirmed_at = now()
      where id = ${orderId}
    `
    await addEvent(tx, orderId, 'confirmed', 'Venta confirmada: se descontó el inventario.', actor)
  })
}

export async function markShipped(orderId: number, actor: string) {
  await db().begin(async (tx) => {
    const order = await lockOrder(tx, orderId)
    assertStatus(order, ['confirmed'], 'marcar como enviado')
    await tx`update public.orders set status = 'shipped' where id = ${orderId}`
    await addEvent(tx, orderId, 'shipped', 'Pedido despachado.', actor)
  })
}

export async function markDelivered(orderId: number, actor: string) {
  await db().begin(async (tx) => {
    const order = await lockOrder(tx, orderId)
    assertStatus(order, ['confirmed', 'shipped'], 'marcar como entregado')
    await tx`update public.orders set status = 'delivered' where id = ${orderId}`
    await addEvent(tx, orderId, 'delivered', 'Pedido entregado al cliente.', actor)
  })
}

/** Cancela y devuelve el inventario según hasta dónde había llegado el pedido. */
export async function cancelOrder(orderId: number, reason: string | null, actor: string) {
  await db().begin(async (tx) => {
    const order = await lockOrder(tx, orderId)
    assertStatus(order, ['pending', 'quoted', 'confirmed', 'shipped'], 'cancelar')

    let stockState: StockState = order.stockState
    let detail = ''
    if (order.stockState === 'reserved') {
      await settleOrderStock(tx, orderId, 'release', actor, reason ?? undefined)
      stockState = 'released'
      detail = ' Se liberaron las unidades reservadas.'
    } else if (order.stockState === 'committed') {
      await settleOrderStock(tx, orderId, 'return', actor, reason ?? undefined)
      stockState = 'returned'
      detail = ' Las unidades volvieron al inventario.'
    }
    await tx`
      update public.orders
      set status = 'cancelled', stock_state = ${stockState}, cancelled_at = now(), cancel_reason = ${reason}
      where id = ${orderId}
    `
    await addEvent(tx, orderId, 'cancelled', `${order.kind === 'order' ? 'Pedido' : 'Cotización'} cancelado.${detail}`, actor)
  })
}

export async function updateAdminNotes(orderId: number, notes: string | null) {
  await db()`update public.orders set admin_notes = ${notes} where id = ${orderId}`
}
