'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { ChevronRight, Minus, Plus, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCOP, useStore } from '@/lib/store'

export function ProductDetail() {
  const params = useParams<{ id: string }>()
  const { products, categories, addToQuote } = useStore()
  const [qty, setQty] = useState(1)

  const product = products.find((p) => p.id === params.id)

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-brand-navy">Producto no encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          El producto que buscas no está disponible.
        </p>
        <Button asChild className="mt-6 bg-brand-blue text-white hover:bg-brand-blue-600">
          <Link href="/catalogo">Volver al catálogo</Link>
        </Button>
      </div>
    )
  }

  const category = categories.find((c) => c.id === product.categoryId)
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Migas */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-brand-blue">
          Inicio
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/catalogo" className="hover:text-brand-blue">
          Catálogo
        </Link>
        {category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/catalogo?cat=${category.slug}`} className="hover:text-brand-blue">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-8"
          />
        </div>

        <div className="flex flex-col">
          <Badge className="w-fit bg-accent text-xs font-semibold uppercase tracking-wide text-brand-blue">
            {product.brand}
          </Badge>
          <h1 className="mt-3 text-balance text-3xl font-extrabold text-brand-navy">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">SKU: {product.sku}</p>

          <div className="mt-5 flex items-end gap-2">
            <span className="text-4xl font-extrabold text-brand-navy">
              {formatCOP(product.price)}
            </span>
            <span className="mb-1 text-sm text-muted-foreground">/ {product.unit}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-brand-blue">Precio mayorista</p>

          <div className="mt-2">
            {product.stock > 0 ? (
              <span className="text-sm text-emerald-600">
                Disponible · {product.stock} en stock
              </span>
            ) : (
              <span className="text-sm text-destructive">Agotado temporalmente</span>
            )}
          </div>

          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* Cantidad y acciones */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <Button
                size="icon"
                variant="ghost"
                className="h-11 w-11"
                aria-label="Disminuir cantidad"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-base font-semibold">{qty}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-11 w-11"
                aria-label="Aumentar cantidad"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="lg"
              className="flex-1 gap-2 bg-brand-blue text-white hover:bg-brand-blue-600"
              disabled={product.stock <= 0}
              onClick={() => {
                addToQuote(product.id, qty)
                toast.success('Agregado a la cotización', {
                  description: `${qty} × ${product.name}`,
                })
              }}
            >
              <ShoppingCart className="h-5 w-5" />
              Agregar a la cotización
            </Button>
          </div>

          {/* Beneficios */}
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-lg bg-secondary p-4 text-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-brand-blue" />
              Envíos a toda Colombia
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-blue" />
              Producto garantizado
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-extrabold text-brand-navy">
            Productos relacionados
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
