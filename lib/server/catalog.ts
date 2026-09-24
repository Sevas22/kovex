import 'server-only'
import { cache } from 'react'
import { getCategoryIndex, toLinks } from './categories'
import { db } from './db'
import { normalizeText } from '@/lib/text'
import type { Category, CategoryLink, Department, ProductDetail, ProductSpec, ProductSummary } from '@/lib/types'

export type CatalogSort = 'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre' | 'recientes'
export type PriceFilter = 'con-precio' | 'a-cotizar'

export interface CatalogQuery {
  q?: string
  category?: string
  brands?: string[]
  inStock?: boolean
  price?: PriceFilter
  sort?: CatalogSort
  page?: number
}

export interface CatalogResult {
  items: ProductSummary[]
  total: number
  page: number
  pageCount: number
  pageSize: number
  brands: { name: string; count: number }[]
  category: { current: Category; path: CategoryLink[]; children: Category[] } | null
}

export const PAGE_SIZE = 24

/** Columnas de ProductSummary; exige el alias p (products) y s (store_settings). */
function summaryColumns() {
  const sql = db()
  return sql`
    p.id, p.slug, p.name, p.brand, p.sku, p.images[1] as image, p.unit, p.price, p.compare_at_price,
    case when p.track_inventory then p.stock - p.reserved end as available,
    coalesce(p.low_stock_threshold, s.low_stock_threshold) as low_stock_threshold,
    p.is_featured
  `
}

export async function listProducts(query: CatalogQuery): Promise<CatalogResult> {
  const sql = db()
  const index = await getCategoryIndex()
  const page = Math.max(1, Math.floor(query.page ?? 1))
  const current = query.category ? index.bySlug.get(query.category) : undefined

  const base = [sql`p.is_active`]
  if (current) base.push(sql`p.category_id = any(${index.subtreeIds(current.id)})`)
  const words = normalizeText(query.q ?? '').split(' ').filter(Boolean).slice(0, 6)
  for (const w of words) base.push(sql`p.search_text like ${`%${w}%`}`)
  if (query.inStock) base.push(sql`(not p.track_inventory or p.stock - p.reserved > 0)`)
  if (query.price === 'con-precio') base.push(sql`p.price is not null`)
  if (query.price === 'a-cotizar') base.push(sql`p.price is null`)

  const withBrands = query.brands?.length ? [...base, sql`p.brand = any(${query.brands})`] : base
  const where = (conds: typeof base) => conds.reduce((acc, c) => sql`${acc} and ${c}`)

  const order = {
    relevancia: words.length
      ? sql`extensions.similarity(p.search_text, ${words.join(' ')}) desc, p.is_featured desc, p.name`
      : sql`p.is_featured desc, p.created_at desc`,
    'precio-asc': sql`p.price asc nulls last, p.name`,
    'precio-desc': sql`p.price desc nulls last, p.name`,
    nombre: sql`p.name`,
    recientes: sql`p.created_at desc`,
  }[query.sort ?? 'relevancia']

  const [rows, brands] = await Promise.all([
    sql<(ProductSummary & { totalCount: number })[]>`
      select ${summaryColumns()}, count(*) over ()::int as total_count
      from public.products p cross join public.store_settings s
      where ${where(withBrands)}
      order by ${order}
      limit ${PAGE_SIZE} offset ${(page - 1) * PAGE_SIZE}
    `,
    // Marcas sin aplicar el filtro de marca, para poder elegir varias.
    sql<{ name: string; count: number }[]>`
      select p.brand as name, count(*)::int as count
      from public.products p
      where ${where(base)} and p.brand is not null
      group by p.brand
      order by count(*) desc, p.brand
    `,
  ])

  const total = rows[0]?.totalCount ?? 0
  return {
    items: rows.map(({ totalCount: _, ...item }) => item),
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    brands,
    category: current
      ? {
          current,
          path: toLinks(index.pathOf(current.id)),
          children: index.childrenOf(current.id).filter((c) => c.isActive),
        }
      : null,
  }
}

/** Departamentos del menú con cantidad de productos e imagen representativa. */
export const getDepartments = cache(async (): Promise<Department[]> => {
  return db()<Department[]>`
    with recursive tree as (
      select id, id as root from public.categories where parent_id is null
      union all
      select c.id, t.root from public.categories c join tree t on c.parent_id = t.id
    )
    select d.id, d.slug, d.name, d.icon, d.description,
           count(p.id)::int as product_count,
           (array_agg(p.images[1] order by p.is_featured desc, p.created_at desc)
              filter (where p.images[1] is not null))[1] as image
    from public.categories d
    left join tree t on t.root = d.id
    left join public.products p on p.category_id = t.id and p.is_active
    where d.parent_id is null and d.is_active
    group by d.id
    order by d.sort_order
  `
})

export async function getFeaturedProducts(limit = 8): Promise<ProductSummary[]> {
  return db()<ProductSummary[]>`
    select ${summaryColumns()}
    from public.products p cross join public.store_settings s
    where p.is_active
    order by p.is_featured desc, p.created_at desc
    limit ${limit}
  `
}

export interface CatalogFigures {
  products: number
  departments: number
  brands: number
}

/** Cifras del catálogo para la presentación de la empresa (se calculan, no se escriben a mano). */
export const getCatalogFigures = cache(async (): Promise<CatalogFigures> => {
  const [row] = await db()<CatalogFigures[]>`
    select
      (select count(*)::int from public.products where is_active) as products,
      (select count(*)::int from public.categories where parent_id is null and is_active) as departments,
      (select count(distinct brand)::int from public.products where is_active and brand is not null) as brands
  `
  return row
})

export async function getBrands(limit = 12): Promise<{ name: string; count: number }[]> {
  return db()<{ name: string; count: number }[]>`
    select brand as name, count(*)::int as count
    from public.products
    where is_active and brand is not null
    group by brand
    order by count(*) desc, brand
    limit ${limit}
  `
}

interface ProductRow extends ProductSummary {
  description: string | null
  specs: ProductSpec[]
  images: string[]
  taxRate: number
  categoryId: number | null
}

export const getProductBySlug = cache(async (slug: string): Promise<ProductDetail | null> => {
  const [row] = await db()<ProductRow[]>`
    select ${summaryColumns()}, p.description, p.specs, p.images, p.tax_rate, p.category_id
    from public.products p cross join public.store_settings s
    where p.slug = ${slug} and p.is_active
  `
  if (!row) return null
  const index = await getCategoryIndex()
  const { categoryId, ...product } = row
  return { ...product, breadcrumbs: toLinks(index.pathOf(categoryId)) }
})

/** Otros productos de la misma categoría (o del departamento si hay pocos). */
export async function getRelatedProducts(slug: string, limit = 4): Promise<ProductSummary[]> {
  const sql = db()
  const [row] = await sql<{ id: number; categoryId: number | null }[]>`
    select id, category_id from public.products where slug = ${slug}
  `
  if (!row?.categoryId) return []
  const index = await getCategoryIndex()
  const path = index.pathOf(row.categoryId)
  const scope = path.length > 1 ? path[path.length - 2] : path[0]
  return sql<ProductSummary[]>`
    select ${summaryColumns()}
    from public.products p cross join public.store_settings s
    where p.is_active and p.id <> ${row.id} and p.category_id = any(${index.subtreeIds(scope.id)})
    order by (p.category_id = ${row.categoryId}) desc, p.is_featured desc, p.created_at desc
    limit ${limit}
  `
}

/** Datos frescos (precio y disponibilidad) de los productos del carrito. */
export async function lookupProducts(ids: number[]): Promise<ProductSummary[]> {
  if (ids.length === 0) return []
  return db()<ProductSummary[]>`
    select ${summaryColumns()}
    from public.products p cross join public.store_settings s
    where p.is_active and p.id = any(${ids})
  `
}
