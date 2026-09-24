import 'server-only'
import { buildSearchText } from './catalog-import'
import { buildCategoryIndex, getCategories, loadCategories } from './categories'
import { db } from './db'
import { recordInitialStock } from './inventory'
import { recalculatePrices } from './prices'
import { loadSettings } from './settings'
import type { PricingMode } from '@/lib/pricing'
import { normalizeText, slugify } from '@/lib/text'
import type { ProductSpec } from '@/lib/types'

export interface AdminProductRow {
  id: number
  slug: string
  name: string
  brand: string | null
  sku: string
  image: string | null
  categoryId: number | null
  pricingMode: PricingMode
  costPrice: number | null
  markupPercent: number | null
  fixedPrice: number | null
  price: number | null
  stock: number
  reserved: number
  trackInventory: boolean
  lowStockThreshold: number
  isActive: boolean
  isFeatured: boolean
  sourceAvailable: boolean | null
  supplierName: string | null
}

export type ProductStatusFilter = 'todos' | 'activos' | 'inactivos' | 'stock-bajo' | 'agotados' | 'a-cotizar'

export async function listAdminProducts(opts: { q?: string; category?: number; status?: ProductStatusFilter }) {
  const sql = db()
  const conds = [sql`true`]
  const words = normalizeText(opts.q ?? '').split(' ').filter(Boolean).slice(0, 6)
  for (const w of words) conds.push(sql`p.search_text like ${`%${w}%`}`)
  if (opts.category) {
    const index = buildCategoryIndex(await getCategories())
    conds.push(sql`p.category_id = any(${index.subtreeIds(opts.category)})`)
  }
  const low = sql`coalesce(p.low_stock_threshold, s.low_stock_threshold)`
  switch (opts.status) {
    case 'activos':
      conds.push(sql`p.is_active`)
      break
    case 'inactivos':
      conds.push(sql`not p.is_active`)
      break
    case 'stock-bajo':
      conds.push(sql`p.track_inventory and p.stock - p.reserved > 0 and p.stock - p.reserved <= ${low}`)
      break
    case 'agotados':
      conds.push(sql`p.track_inventory and p.stock - p.reserved <= 0`)
      break
    case 'a-cotizar':
      conds.push(sql`p.price is null`)
      break
  }
  const where = conds.reduce((acc, c) => sql`${acc} and ${c}`)
  return sql<AdminProductRow[]>`
    select p.id, p.slug, p.name, p.brand, p.sku, p.images[1] as image, p.category_id, p.pricing_mode, p.cost_price,
           p.markup_percent, p.fixed_price, p.price, p.stock, p.reserved, p.track_inventory,
           ${low} as low_stock_threshold, p.is_active, p.is_featured, p.source_available, sup.name as supplier_name
    from public.products p
    cross join public.store_settings s
    left join public.suppliers sup on sup.id = p.supplier_id
    where ${where}
    order by p.is_active desc, p.name
    limit 500
  `
}

export interface AdminProductDetail extends AdminProductRow {
  description: string | null
  specs: ProductSpec[]
  images: string[]
  unit: string
  taxRate: number
  compareAtPrice: number | null
  ownLowStockThreshold: number | null
  sourceUrl: string | null
  sourceSyncedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export async function getAdminProduct(id: number): Promise<AdminProductDetail | null> {
  if (!Number.isInteger(id) || id <= 0) return null
  const [row] = await db()<AdminProductDetail[]>`
    select p.id, p.slug, p.name, p.brand, p.sku, p.images[1] as image, p.category_id, p.pricing_mode, p.cost_price,
           p.markup_percent, p.fixed_price, p.price, p.stock, p.reserved, p.track_inventory,
           coalesce(p.low_stock_threshold, s.low_stock_threshold) as low_stock_threshold,
           p.low_stock_threshold as own_low_stock_threshold,
           p.is_active, p.is_featured, p.source_available, sup.name as supplier_name,
           p.description, p.specs, p.images, p.unit, p.tax_rate, p.compare_at_price, p.source_url, p.source_synced_at,
           p.created_at, p.updated_at
    from public.products p
    cross join public.store_settings s
    left join public.suppliers sup on sup.id = p.supplier_id
    where p.id = ${id}
  `
  return row ?? null
}

export interface ProductInput {
  name: string
  sku: string
  brand: string | null
  categoryId: number | null
  unit: string
  description: string | null
  images: string[]
  specs: ProductSpec[]
  pricingMode: PricingMode
  costPrice: number | null
  markupPercent: number | null
  fixedPrice: number | null
  compareAtPrice: number | null
  taxRate: number
  trackInventory: boolean
  lowStockThreshold: number | null
  isActive: boolean
  isFeatured: boolean
}

export class ProductError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProductError'
  }
}

/** Crea o actualiza un producto y recalcula su precio de venta. Devuelve el id. */
export async function saveProduct(id: number | null, input: ProductInput, opts: { initialStock?: number; actor: string }) {
  return db().begin(async (tx) => {
    const [dupSku] = await tx`select id from public.products where sku = ${input.sku} and id <> ${id ?? 0}`
    if (dupSku) throw new ProductError(`Ya existe otro producto con la referencia ${input.sku}.`)

    const categories = buildCategoryIndex(await loadCategories(tx))
    const path = categories.pathOf(input.categoryId).map((c) => c.name)
    const values = {
      name: input.name,
      sku: input.sku,
      brand: input.brand,
      categoryId: input.categoryId,
      unit: input.unit,
      description: input.description,
      images: input.images,
      specs: tx.json(input.specs as never),
      pricingMode: input.pricingMode,
      costPrice: input.costPrice,
      markupPercent: input.markupPercent,
      fixedPrice: input.fixedPrice,
      compareAtPrice: input.compareAtPrice,
      taxRate: input.taxRate,
      trackInventory: input.trackInventory,
      lowStockThreshold: input.lowStockThreshold,
      isActive: input.isActive,
      isFeatured: input.isFeatured,
      // Con precio fijo o a cotizar el precio se asigna abajo; "quote" exige price null.
      price: null,
      searchText: buildSearchText([input.name, input.brand, input.sku, ...path]),
    }

    let productId = id
    if (productId == null) {
      const settings = await loadSettings(tx)
      const [{ count }] = await tx<{ count: number }[]>`select count(*)::int as count from public.products`
      if (count >= settings.productLimit) {
        throw new ProductError(`Llegaste al límite de ${settings.productLimit} productos de tu plan.`)
      }
      let slug = slugify(input.name) || 'producto'
      for (let i = 2; (await tx`select 1 from public.products where slug = ${slug}`).length; i++) {
        slug = `${slugify(input.name)}-${i}`
      }
      const [row] = await tx<{ id: number }[]>`insert into public.products ${tx({ ...values, slug })} returning id`
      productId = row.id
      if (opts.initialStock && opts.initialStock > 0 && input.trackInventory) {
        await recordInitialStock(tx, productId, opts.initialStock, opts.actor)
      }
    } else {
      const { price: _price, ...rest } = values
      const [row] = await tx`update public.products set ${tx(rest)}, price = null where id = ${productId} returning id`
      if (!row) throw new ProductError('El producto ya no existe.')
    }
    await recalculatePrices(tx, [productId])
    return productId
  })
}

export async function setProductFlags(id: number, flags: { isActive?: boolean; isFeatured?: boolean }) {
  const values = Object.fromEntries(Object.entries(flags).filter(([, v]) => v !== undefined))
  if (Object.keys(values).length === 0) return
  await db()`update public.products set ${db()(values)} where id = ${id}`
}

/** Elimina un producto que no tenga unidades reservadas en pedidos abiertos. */
export async function deleteProduct(id: number) {
  const [row] = await db()<{ reserved: number }[]>`select reserved from public.products where id = ${id}`
  if (!row) return
  if (row.reserved > 0) {
    throw new ProductError('Tiene unidades reservadas en pedidos abiertos. Cancela o confirma esos pedidos, o desactívalo.')
  }
  await db()`delete from public.products where id = ${id}`
}
