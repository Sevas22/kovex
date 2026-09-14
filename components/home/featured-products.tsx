'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { useStore } from '@/lib/store'

export function FeaturedProducts() {
  const { products } = useStore()
  const featured = products.filter((p) => p.featured).slice(0, 8)

  if (featured.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-navy md:text-3xl">
            Productos destacados
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Lo más pedido por nuestros clientes mayoristas.
          </p>
        </div>
        <Link
          href="/catalogo"
          className="hidden items-center gap-1 text-sm font-semibold text-brand-blue hover:underline sm:flex"
        >
          Ver catálogo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
