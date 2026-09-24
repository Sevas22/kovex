import 'server-only'
import { cache } from 'react'
import { db, type Sql, type Tx } from './db'
import type { Category, CategoryLink } from '@/lib/types'

export async function loadCategories(sql: Sql | Tx = db()): Promise<Category[]> {
  return sql<Category[]>`
    select id, parent_id, slug, name, description, icon, markup_percent, sort_order, is_active
    from public.categories
    order by sort_order, name
  `
}

export const getCategories = cache(() => loadCategories())

export interface CategoryIndex {
  byId: Map<number, Category>
  bySlug: Map<string, Category>
  childrenOf(id: number | null): Category[]
  departments: Category[]
  /** Ruta desde el departamento hasta la categoría (incluida). */
  pathOf(id: number | null): Category[]
  /** Ids de la categoría y todos sus descendientes. */
  subtreeIds(id: number): number[]
  /** % de margen de la categoría o del ancestro más cercano que lo defina. */
  inheritedMarkup(id: number | null): { percent: number; from: Category } | null
}

export function buildCategoryIndex(categories: Category[]): CategoryIndex {
  const byId = new Map(categories.map((c) => [c.id, c]))
  const bySlug = new Map(categories.map((c) => [c.slug, c]))
  const children = new Map<number | null, Category[]>()
  for (const c of categories) {
    const list = children.get(c.parentId) ?? []
    list.push(c)
    children.set(c.parentId, list)
  }

  function pathOf(id: number | null): Category[] {
    const path: Category[] = []
    let current = id == null ? undefined : byId.get(id)
    while (current && path.length < 10) {
      path.unshift(current)
      current = current.parentId == null ? undefined : byId.get(current.parentId)
    }
    return path
  }

  function subtreeIds(id: number): number[] {
    const ids: number[] = []
    const stack = [id]
    while (stack.length) {
      const next = stack.pop()!
      ids.push(next)
      for (const child of children.get(next) ?? []) stack.push(child.id)
    }
    return ids
  }

  function inheritedMarkup(id: number | null) {
    for (const c of pathOf(id).reverse()) {
      if (c.markupPercent != null) return { percent: c.markupPercent, from: c }
    }
    return null
  }

  return {
    byId,
    bySlug,
    childrenOf: (id) => children.get(id) ?? [],
    departments: children.get(null) ?? [],
    pathOf,
    subtreeIds,
    inheritedMarkup,
  }
}

export const getCategoryIndex = cache(async () => buildCategoryIndex(await getCategories()))

export function toLinks(path: Category[]): CategoryLink[] {
  return path.map((c) => ({ slug: c.slug, name: c.name }))
}
