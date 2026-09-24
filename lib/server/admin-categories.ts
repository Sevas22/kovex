import 'server-only'
import { buildCategoryIndex, getCategories } from './categories'
import { db } from './db'

export interface CategoryOption {
  id: number
  label: string
  depth: number
  /** Margen que heredaría un producto de esta categoría (propio o de un ancestro). */
  inherited: { percent: number; from: string } | null
}

/** Categorías en orden de árbol, con la ruta completa como etiqueta. */
export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const index = buildCategoryIndex(await getCategories())
  const out: CategoryOption[] = []
  const walk = (parentId: number | null, depth: number) => {
    for (const c of index.childrenOf(parentId)) {
      const inherited = index.inheritedMarkup(c.id)
      out.push({
        id: c.id,
        label: index.pathOf(c.id).map((p) => p.name).join(' / '),
        depth,
        inherited: inherited ? { percent: inherited.percent, from: inherited.from.name } : null,
      })
      walk(c.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}

export interface CategoryMarkupRow {
  id: number
  name: string
  depth: number
  markupPercent: number | null
  inherited: { percent: number; from: string } | null
  productCount: number
}

export async function getCategoryMarkupRows(): Promise<CategoryMarkupRow[]> {
  const [categories, counts] = await Promise.all([
    getCategories(),
    db()<{ categoryId: number; count: number }[]>`
      select category_id, count(*)::int as count from public.products where category_id is not null group by category_id
    `,
  ])
  const index = buildCategoryIndex(categories)
  const direct = new Map(counts.map((c) => [c.categoryId, c.count]))
  const rows: CategoryMarkupRow[] = []
  const walk = (parentId: number | null, depth: number) => {
    for (const c of index.childrenOf(parentId)) {
      const parentInherited = c.parentId == null ? null : index.inheritedMarkup(c.parentId)
      rows.push({
        id: c.id,
        name: c.name,
        depth,
        markupPercent: c.markupPercent,
        inherited: parentInherited ? { percent: parentInherited.percent, from: parentInherited.from.name } : null,
        productCount: index.subtreeIds(c.id).reduce((s, id) => s + (direct.get(id) ?? 0), 0),
      })
      walk(c.id, depth + 1)
    }
  }
  walk(null, 0)
  return rows
}
