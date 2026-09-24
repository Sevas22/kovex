import 'server-only'
import { db, type Tx } from './db'
import type { CartLine, InventoryMovementKind } from '@/lib/types'

/** Error de negocio con un mensaje apto para mostrar al usuario. */
export class StockError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StockError'
  }
}

interface LockedProduct {
  id: number
  name: string
  trackInventory: boolean
  stock: number
  reserved: number
}

/**
 * Bloquea (FOR UPDATE) los productos en orden de id. Todas las operaciones que tocan
 * stock bloquean en el mismo orden, así dos pedidos simultáneos no se bloquean mutuamente.
 */
export async function lockProducts(tx: Tx, ids: number[]): Promise<Map<number, LockedProduct>> {
  if (ids.length === 0) return new Map()
  const rows = await tx<LockedProduct[]>`
    select id, name, track_inventory, stock, reserved
    from public.products
    where id = any(${ids})
    order by id
    for update
  `
  return new Map(rows.map((r) => [r.id, r]))
}

function mergeLines(lines: CartLine[]): CartLine[] {
  const totals = new Map<number, number>()
  for (const l of lines) totals.set(l.productId, (totals.get(l.productId) ?? 0) + l.quantity)
  return [...totals].map(([productId, quantity]) => ({ productId, quantity })).sort((a, b) => a.productId - b.productId)
}

async function applyMovement(
  tx: Tx,
  m: {
    productId: number
    orderId?: number | null
    kind: InventoryMovementKind
    stockDelta: number
    reservedDelta: number
    note?: string | null
    actor?: string | null
  },
) {
  const [row] = await tx<{ stock: number; reserved: number }[]>`
    update public.products
    set stock = stock + ${m.stockDelta}, reserved = reserved + ${m.reservedDelta}
    where id = ${m.productId}
    returning stock, reserved
  `
  if (!row) throw new StockError('El producto ya no existe.')
  await tx`
    insert into public.inventory_movements
      (product_id, order_id, kind, stock_delta, reserved_delta, stock_after, reserved_after, note, actor)
    values
      (${m.productId}, ${m.orderId ?? null}, ${m.kind}, ${m.stockDelta}, ${m.reservedDelta},
       ${row.stock}, ${row.reserved}, ${m.note ?? null}, ${m.actor ?? null})
  `
  return row
}

/**
 * Reserva unidades para un pedido. Falla (y la transacción se revierte) si algún producto
 * con control de inventario no tiene suficientes unidades disponibles.
 * Devuelve los ids de los productos cuyo inventario quedó reservado.
 */
export async function reserveStock(tx: Tx, orderId: number, lines: CartLine[], actor: string | null) {
  const merged = mergeLines(lines)
  const locked = await lockProducts(tx, merged.map((l) => l.productId))

  const shortages: string[] = []
  for (const line of merged) {
    const p = locked.get(line.productId)
    if (!p || !p.trackInventory) continue
    const available = p.stock - p.reserved
    if (available < line.quantity) {
      shortages.push(
        available > 0
          ? `${p.name}: solo quedan ${available} disponibles (pediste ${line.quantity}).`
          : `${p.name}: está agotado.`,
      )
    }
  }
  if (shortages.length) throw new StockError(shortages.join(' '))

  const tracked: number[] = []
  for (const line of merged) {
    const p = locked.get(line.productId)
    if (!p || !p.trackInventory) continue
    await applyMovement(tx, {
      productId: p.id,
      orderId,
      kind: 'reserve',
      stockDelta: 0,
      reservedDelta: line.quantity,
      actor,
    })
    tracked.push(p.id)
  }
  return tracked
}

async function trackedLinesOf(tx: Tx, orderId: number): Promise<CartLine[]> {
  return tx<CartLine[]>`
    select product_id, sum(quantity)::int as quantity
    from public.order_items
    where order_id = ${orderId} and stock_tracked and product_id is not null
    group by product_id
    order by product_id
  `
}

type SettleKind = 'sale' | 'release' | 'return'

/** Aplica la salida definitiva, la liberación o la devolución de las unidades de un pedido. */
export async function settleOrderStock(tx: Tx, orderId: number, kind: SettleKind, actor: string | null, note?: string) {
  const lines = await trackedLinesOf(tx, orderId)
  const locked = await lockProducts(tx, lines.map((l) => l.productId))
  for (const line of lines) {
    if (!locked.has(line.productId)) continue
    const q = line.quantity
    const deltas =
      kind === 'sale'
        ? { stockDelta: -q, reservedDelta: -q }
        : kind === 'release'
          ? { stockDelta: 0, reservedDelta: -q }
          : { stockDelta: q, reservedDelta: 0 }
    await applyMovement(tx, { productId: line.productId, orderId, kind, ...deltas, actor, note })
  }
}

export type AdjustMode = 'add' | 'remove' | 'set'

/** Entrada, salida o conteo físico hecho desde el panel. */
export async function adjustStock(input: {
  productId: number
  mode: AdjustMode
  quantity: number
  note: string | null
  actor: string
}) {
  return db().begin(async (tx) => {
    const locked = await lockProducts(tx, [input.productId])
    const p = locked.get(input.productId)
    if (!p) throw new StockError('El producto no existe.')

    const target =
      input.mode === 'add' ? p.stock + input.quantity : input.mode === 'remove' ? p.stock - input.quantity : input.quantity
    if (target < 0) throw new StockError(`No puedes retirar ${input.quantity}: solo hay ${p.stock} en stock.`)
    if (target < p.reserved) {
      throw new StockError(
        `Hay ${p.reserved} unidades reservadas en pedidos pendientes; el stock no puede quedar por debajo de eso.`,
      )
    }
    const delta = target - p.stock
    if (delta === 0) return { stock: p.stock, reserved: p.reserved }
    return applyMovement(tx, {
      productId: p.id,
      kind: input.mode === 'add' ? 'restock' : 'adjustment',
      stockDelta: delta,
      reservedDelta: 0,
      note: input.note,
      actor: input.actor,
    })
  })
}

export async function recordInitialStock(tx: Tx, productId: number, quantity: number, actor: string | null) {
  if (quantity <= 0) return
  await applyMovement(tx, {
    productId,
    kind: 'initial',
    stockDelta: quantity,
    reservedDelta: 0,
    note: 'Stock inicial',
    actor,
  })
}
