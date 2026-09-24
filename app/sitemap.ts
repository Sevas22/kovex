import type { MetadataRoute } from 'next'
import { getCategoryIndex } from '@/lib/server/categories'
import { db } from '@/lib/server/db'
import { getSiteUrl } from '@/lib/server/site-url'

// Se genera en cada request: el catálogo cambia desde el panel y el build no consulta la base.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, index, products] = await Promise.all([
    getSiteUrl(),
    getCategoryIndex(),
    db()<{ slug: string; categoryId: number | null; updatedAt: Date }[]>`
      select slug, category_id, updated_at from public.products where is_active
    `,
  ])

  // Categorías con al menos un producto visible en su rama.
  const withProducts = new Set<number>()
  for (const p of products) for (const c of index.pathOf(p.categoryId)) withProducts.add(c.id)
  const categories = [...index.byId.values()].filter((c) => c.isActive && withProducts.has(c.id))

  return [
    { url: `${site}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${site}/catalogo`, changeFrequency: 'daily', priority: 0.9 },
    ...categories.map((c) => ({
      url: `${site}/catalogo/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${site}/producto/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
