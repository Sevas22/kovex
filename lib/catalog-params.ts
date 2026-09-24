// Filtros del catálogo ↔ parámetros de la URL (compartibles y compatibles con "atrás").

export type SearchParams = Record<string, string | string[] | undefined>

export const SORT_OPTIONS = {
  relevancia: 'Relevancia',
  'precio-asc': 'Menor precio',
  'precio-desc': 'Mayor precio',
  nombre: 'Nombre (A-Z)',
  recientes: 'Más recientes',
} as const

export type SortKey = keyof typeof SORT_OPTIONS
export type PriceKey = 'con-precio' | 'a-cotizar'

export interface CatalogParams {
  q: string
  brands: string[]
  inStock: boolean
  price: PriceKey | undefined
  sort: SortKey
  page: number
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export function parseCatalogParams(sp: SearchParams): CatalogParams {
  const sort = first(sp.orden)
  const price = first(sp.precio)
  const page = Number(first(sp.pagina))
  const brands = sp.marca == null ? [] : Array.isArray(sp.marca) ? sp.marca : [sp.marca]
  return {
    q: (first(sp.q) ?? '').trim().slice(0, 100),
    brands: brands.filter(Boolean).slice(0, 20),
    inStock: first(sp.stock) === '1',
    price: price === 'con-precio' || price === 'a-cotizar' ? price : undefined,
    sort: sort && sort in SORT_OPTIONS ? (sort as SortKey) : 'relevancia',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

export function buildCatalogQuery(p: Partial<CatalogParams>): string {
  const params = new URLSearchParams()
  if (p.q) params.set('q', p.q)
  for (const b of p.brands ?? []) params.append('marca', b)
  if (p.inStock) params.set('stock', '1')
  if (p.price) params.set('precio', p.price)
  if (p.sort && p.sort !== 'relevancia') params.set('orden', p.sort)
  if (p.page && p.page > 1) params.set('pagina', String(p.page))
  const s = params.toString()
  return s ? `?${s}` : ''
}
