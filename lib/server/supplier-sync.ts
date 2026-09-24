import 'server-only'
import { db } from './db'
import { recalculatePrices } from './prices'
import { fetchSupplierProduct, type SupplierProduct } from './texcomercial'

export interface CostChange {
  id: number
  name: string
  oldCost: number | null
  newCost: number | null
  oldPrice: number | null
  newPrice: number | null
}

export interface SyncResult {
  checked: number
  costChanges: CostChange[]
  /** Productos que el proveedor marcó como agotados en esta revisión. */
  nowUnavailable: { id: number; name: string }[]
  /** Productos que ya no existen en el proveedor. */
  missing: { id: number; name: string }[]
  /** Precio fijo por debajo del nuevo costo: se estaría vendiendo a pérdida. */
  belowCost: { id: number; name: string; fixedPrice: number; cost: number }[]
  failed: number
  /** Productos que siguen sin revisarse en las últimas 24 horas. */
  pending: number
}

interface SyncRow {
  id: number
  name: string
  sourceUrl: string
  costPrice: number | null
  price: number | null
  pricingMode: string
  fixedPrice: number | null
  sourceAvailable: boolean | null
}

const handleFromUrl = (url: string) => /\/products\/([^/?#]+)/.exec(url)?.[1] ?? null

/**
 * Revisa en Texcomercial un lote de productos importados (los que llevan más tiempo sin
 * revisarse) y actualiza costo y disponibilidad. Los precios con margen se recalculan solos.
 */
export async function syncSupplierBatch(limit = 60): Promise<SyncResult> {
  const sql = db()
  const rows = await sql<SyncRow[]>`
    select p.id, p.name, p.source_url, p.cost_price, p.price, p.pricing_mode, p.fixed_price, p.source_available
    from public.products p
    join public.suppliers s on s.id = p.supplier_id
    where s.slug = 'texcomercial' and p.source_url is not null
    order by p.source_synced_at asc nulls first, p.id
    limit ${limit}
  `

  const fetched = new Map<number, SupplierProduct | null | 'error'>()
  let next = 0
  async function worker() {
    while (next < rows.length) {
      const row = rows[next++]
      const handle = handleFromUrl(row.sourceUrl)
      if (!handle) {
        fetched.set(row.id, 'error')
        continue
      }
      try {
        fetched.set(row.id, await fetchSupplierProduct(handle))
      } catch {
        fetched.set(row.id, 'error')
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(5, rows.length) }, worker))

  const result: SyncResult = { checked: 0, costChanges: [], nowUnavailable: [], missing: [], belowCost: [], failed: 0, pending: 0 }
  const changedIds: number[] = []

  for (const row of rows) {
    const remote = fetched.get(row.id)
    if (remote === 'error' || remote === undefined) {
      result.failed++
      continue
    }
    result.checked++
    if (remote === null) {
      await sql`update public.products set source_available = false, source_synced_at = now() where id = ${row.id}`
      result.missing.push({ id: row.id, name: row.name })
      continue
    }
    await sql`
      update public.products
      set cost_price = ${remote.costPrice}, source_available = ${remote.available}, source_synced_at = now()
      where id = ${row.id}
    `
    if (row.sourceAvailable !== false && !remote.available) result.nowUnavailable.push({ id: row.id, name: row.name })
    if (remote.costPrice !== row.costPrice) {
      changedIds.push(row.id)
      result.costChanges.push({
        id: row.id,
        name: row.name,
        oldCost: row.costPrice,
        newCost: remote.costPrice,
        oldPrice: row.price,
        newPrice: row.price,
      })
    }
    if (row.pricingMode === 'fixed' && row.fixedPrice != null && remote.costPrice != null && row.fixedPrice < remote.costPrice) {
      result.belowCost.push({ id: row.id, name: row.name, fixedPrice: row.fixedPrice, cost: remote.costPrice })
    }
  }

  if (changedIds.length) {
    await recalculatePrices(sql, changedIds)
    const prices = await sql<{ id: number; price: number | null }[]>`
      select id, price from public.products where id = any(${changedIds})
    `
    const byId = new Map(prices.map((p) => [p.id, p.price]))
    for (const change of result.costChanges) change.newPrice = byId.get(change.id) ?? null
  }

  const [{ count }] = await sql<{ count: number }[]>`
    select count(*)::int as count
    from public.products p join public.suppliers s on s.id = p.supplier_id
    where s.slug = 'texcomercial' and p.source_url is not null
      and (p.source_synced_at is null or p.source_synced_at < now() - interval '24 hours')
  `
  result.pending = count
  return result
}

export async function getSyncStatus() {
  const [row] = await db()<{ total: number; stale: number; lastSync: Date | null }[]>`
    select count(*)::int as total,
           count(*) filter (where p.source_synced_at is null or p.source_synced_at < now() - interval '24 hours')::int as stale,
           max(p.source_synced_at) as last_sync
    from public.products p join public.suppliers s on s.id = p.supplier_id
    where s.slug = 'texcomercial' and p.source_url is not null
  `
  return row
}
