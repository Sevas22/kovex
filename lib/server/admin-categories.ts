import 'server-only'
import { buildCategoryIndex, getCategories } from './categories'
import { db } from './db'
import { normalizeText } from '@/lib/text'
import { parseTiers, type VolumeTier } from '@/lib/volume-pricing'

export interface CategoryOption {
  id: number
  label: string
  depth: number
  /** Margen que heredaría un producto de esta categoría (propio o de un ancestro). */
  inherited: { percent: number; from: string } | null
  /** Escala por cantidad que heredaría un producto de esta categoría. */
  inheritedTiers: { tiers: VolumeTier[]; from: string } | null
}

/** Categorías en orden de árbol, con la ruta completa como etiqueta. */
export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const index = buildCategoryIndex(await getCategories())
  const out: CategoryOption[] = []
  const walk = (parentId: number | null, depth: number) => {
    for (const c of index.childrenOf(parentId)) {
      const inherited = index.inheritedMarkup(c.id)
      const tiers = index.inheritedTiers(c.id)
      out.push({
        id: c.id,
        label: index.pathOf(c.id).map((p) => p.name).join(' / '),
        depth,
        inherited: inherited ? { percent: inherited.percent, from: inherited.from.name } : null,
        inheritedTiers: tiers ? { tiers: tiers.tiers, from: tiers.from.name } : null,
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
  /** Ruta desde el departamento, sin la propia: «Ferretería › Abrasivos». */
  path: string
  /** Tiene subcategorías: la fila ofrece abrir esa rama. */
  hasChildren: boolean
  markupPercent: number | null
  inherited: { percent: number; from: string } | null
  /** Escala propia; null = heredada. */
  volumeTiers: VolumeTier[] | null
  /** Escala que heredaría del padre (o la general si no hay). */
  inheritedTiers: { tiers: VolumeTier[]; from: string } | null
  productCount: number
}

export interface MarkupRowsQuery {
  /** Abre una rama completa: esa categoría y todo lo que cuelga de ella. */
  branchId?: number
  /** Busca por nombre en todo el árbol, sin importar la profundidad. */
  search?: string
}

/**
 * Filas para la tabla de márgenes. Por defecto solo departamentos y sus hijas: más
 * abajo el árbol del proveedor tiene cientos de hojas que heredan igual.
 */
export async function getCategoryMarkupRows(query: MarkupRowsQuery = {}): Promise<CategoryMarkupRow[]> {
  const [categories, counts] = await Promise.all([
    getCategories(),
    db()<{ categoryId: number; count: number }[]>`
      select category_id, count(*)::int as count from public.products where category_id is not null group by category_id
    `,
  ])
  const index = buildCategoryIndex(categories)
  const direct = new Map(counts.map((c) => [c.categoryId, c.count]))

  const fila = (c: (typeof categories)[number], depth: number): CategoryMarkupRow => {
    const parentInherited = c.parentId == null ? null : index.inheritedMarkup(c.parentId)
    const parentTiers = c.parentId == null ? null : index.inheritedTiers(c.parentId)
    return {
      id: c.id,
      name: c.name,
      depth,
      // La ruta desambigua: el proveedor repite nombres como «Herramientas
      // manuales» en más de un departamento.
      path: index
        .pathOf(c.id)
        .slice(0, -1)
        .map((p) => p.name)
        .join(' › '),
      hasChildren: index.childrenOf(c.id).length > 0,
      markupPercent: c.markupPercent,
      inherited: parentInherited ? { percent: parentInherited.percent, from: parentInherited.from.name } : null,
      volumeTiers: parseTiers(c.volumeTiers),
      inheritedTiers: parentTiers ? { tiers: parentTiers.tiers, from: parentTiers.from.name } : null,
      productCount: index.subtreeIds(c.id).reduce((s, id) => s + (direct.get(id) ?? 0), 0),
    }
  }

  // Búsqueda: cualquier profundidad. Es como se llega a las familias, que son
  // las hojas donde de verdad viven los productos.
  const termino = normalizeText(query.search ?? '').trim()
  if (termino) {
    return categories
      .filter((c) => normalizeText(c.name).includes(termino))
      .map((c) => fila(c, Math.max(0, index.pathOf(c.id).length - 1)))
      .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name, 'es'))
      .slice(0, 60)
  }

  const rows: CategoryMarkupRow[] = []
  const walk = (parentId: number | null, depth: number, maxDepth: number) => {
    if (depth > maxDepth) return
    for (const c of index.childrenOf(parentId)) {
      rows.push(fila(c, depth))
      walk(c.id, depth + 1, maxDepth)
    }
  }

  // Una rama abierta se muestra completa; si no, departamentos y sus hijas,
  // porque el árbol del proveedor tiene cientos de hojas.
  if (query.branchId != null && index.byId.has(query.branchId)) {
    const raiz = index.byId.get(query.branchId)!
    const base = Math.max(0, index.pathOf(raiz.id).length - 1)
    rows.push(fila(raiz, base))
    walk(raiz.id, base + 1, base + 3)
    return rows
  }

  walk(null, 0, 1)
  return rows
}
