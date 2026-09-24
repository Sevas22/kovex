import 'server-only'
import { db, type Tx } from './db'
import { recordInitialStock } from './inventory'
import { recalculatePrices } from './prices'
import { loadSettings } from './settings'
import type { SupplierProduct } from './texcomercial'
import type { PricingMode } from '@/lib/pricing'
import { normalizeText, slugify } from '@/lib/text'

export class ImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImportError'
  }
}

export interface ImportOptions {
  pricingMode: PricingMode
  /** % propio para los productos importados; null = heredar de la categoría o el general. */
  markupPercent: number | null
  initialStock: number
  isActive: boolean
  actor: string | null
}

export interface ImportResult {
  created: number
  updated: number
  productIds: number[]
}

export function buildSearchText(parts: (string | null | undefined)[]): string {
  return normalizeText(parts.filter(Boolean).join(' '))
}

async function uniqueValue(tx: Tx, column: 'slug' | 'sku', base: string): Promise<string> {
  for (let i = 1; i < 100; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`
    const [row] =
      column === 'slug'
        ? await tx`select 1 from public.products where slug = ${candidate}`
        : await tx`select 1 from public.products where sku = ${candidate}`
    if (!row) return candidate
  }
  throw new ImportError(`No se pudo generar un ${column} único para ${base}.`)
}

/** Busca o crea la cadena de categorías bajo un departamento y devuelve la hoja. */
async function ensureCategory(
  tx: Tx,
  cache: Map<string, { id: number; names: string[] }>,
  departmentSlug: string,
  path: string[],
): Promise<{ id: number; names: string[] } | null> {
  const key = [departmentSlug, ...path.map(normalizeText)].join('/')
  const cached = cache.get(key)
  if (cached) return cached

  const [dept] = await tx<{ id: number; name: string }[]>`
    select id, name from public.categories where slug = ${departmentSlug} and parent_id is null
  `
  if (!dept) return null

  let parent = { id: dept.id, slug: departmentSlug }
  const names = [dept.name]
  for (const name of path) {
    const [existing] = await tx<{ id: number; slug: string }[]>`
      select id, slug from public.categories where parent_id = ${parent.id} and lower(name) = lower(${name})
    `
    if (existing) {
      parent = existing
    } else {
      // "brochas"; si ya existe en otra rama, "ferreteria-brochas", "ferreteria-brochas-2"…
      const candidates = [slugify(name), slugify(`${parent.slug}-${name}`)]
      let slug = candidates[0]
      for (let i = 1; (await tx`select 1 from public.categories where slug = ${slug}`).length > 0; i++) {
        slug = i === 1 ? candidates[1] : `${candidates[1]}-${i}`
      }
      const [created] = await tx<{ id: number; slug: string }[]>`
        insert into public.categories (parent_id, slug, name)
        values (${parent.id}, ${slug}, ${name})
        returning id, slug
      `
      parent = created
    }
    names.push(name)
  }
  const result = { id: parent.id, names }
  cache.set(key, result)
  return result
}

/**
 * Crea o actualiza productos del proveedor. Los ya importados solo actualizan costo y
 * disponibilidad del proveedor: nombre, precio de venta, stock y categoría quedan como
 * los haya editado el administrador.
 */
export async function importSupplierProducts(items: SupplierProduct[], opts: ImportOptions): Promise<ImportResult> {
  if (items.length === 0) return { created: 0, updated: 0, productIds: [] }

  return db().begin(async (tx) => {
    const settings = await loadSettings(tx)
    const [supplier] = await tx<{ id: number }[]>`select id from public.suppliers where slug = 'texcomercial'`
    if (!supplier) throw new ImportError('Falta el proveedor Texcomercial en la base de datos.')

    const existing = await tx<{ id: number; sourceId: string }[]>`
      select id, source_id from public.products
      where supplier_id = ${supplier.id} and source_id = any(${items.map((i) => i.sourceId)})
    `
    const existingBySource = new Map(existing.map((e) => [e.sourceId, e.id]))
    const newItems = items.filter((i) => !existingBySource.has(i.sourceId))

    const [{ count }] = await tx<{ count: number }[]>`select count(*)::int as count from public.products`
    if (count + newItems.length > settings.productLimit) {
      throw new ImportError(
        `Tu plan incluye hasta ${settings.productLimit} productos. Tienes ${count} y quieres importar ${newItems.length} nuevos.`,
      )
    }

    const categoryCache = new Map<string, { id: number; names: string[] }>()
    const productIds: number[] = []
    let created = 0
    let updated = 0

    for (const item of items) {
      const existingId = existingBySource.get(item.sourceId)
      if (existingId) {
        await tx`
          update public.products set
            cost_price = ${item.costPrice},
            source_available = ${item.available},
            source_url = ${item.url},
            source_synced_at = now()
          where id = ${existingId}
        `
        productIds.push(existingId)
        updated++
        continue
      }

      const category = item.department ? await ensureCategory(tx, categoryCache, item.department, item.categoryPath) : null
      const slug = await uniqueValue(tx, 'slug', slugify(item.name) || item.handle)
      const sku = await uniqueValue(tx, 'sku', item.supplierSku ?? `TEX-${item.sourceId}`)

      const [row] = await tx<{ id: number }[]>`
        insert into public.products ${tx({
          slug,
          sku,
          name: item.name,
          brand: item.brand,
          categoryId: category?.id ?? null,
          description: item.description,
          specs: tx.json(item.specs as never),
          images: item.images,
          unit: item.unit,
          pricingMode: opts.pricingMode,
          costPrice: item.costPrice,
          markupPercent: opts.pricingMode === 'markup' ? opts.markupPercent : null,
          fixedPrice: opts.pricingMode === 'fixed' ? item.costPrice : null,
          taxRate: item.taxRate,
          trackInventory: true,
          isActive: opts.isActive,
          supplierId: supplier.id,
          sourceId: item.sourceId,
          sourceUrl: item.url,
          sourceAvailable: item.available,
          sourceSyncedAt: new Date(),
          searchText: buildSearchText([item.name, item.brand, sku, ...(category?.names ?? [])]),
        })}
        returning id
      `
      await recordInitialStock(tx, row.id, opts.initialStock, opts.actor)
      productIds.push(row.id)
      created++
    }

    await recalculatePrices(tx, productIds)
    return { created, updated, productIds }
  })
}
