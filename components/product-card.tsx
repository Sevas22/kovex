'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCOP, useStore } from '@/lib/store'
import type { Product } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  const { addToQuote } = useStore()

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg">
      <Link
        href={`/producto/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-secondary"
      >
        <Image
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
        {product.stock <= 0 && (
          <span className="absolute left-2 top-2 rounded bg-destructive px-2 py-0.5 text-[10px] font-semibold text-white">
            Agotado
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Badge
          variant="secondary"
          className="mb-2 w-fit bg-accent text-[10px] font-semibold uppercase tracking-wide text-brand-blue"
        >
          {product.brand}
        </Badge>
        <Link href={`/producto/${product.id}`} className="flex-1">
          <h3 className="text-pretty text-sm font-semibold leading-snug text-foreground hover:text-brand-blue">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">SKU: {product.sku}</p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <span className="text-lg font-extrabold text-brand-navy">
              {formatCOP(product.price)}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              / {product.unit}
            </span>
          </div>
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 bg-brand-blue text-white hover:bg-brand-blue-600"
            aria-label={`Agregar ${product.name} a la cotización`}
            disabled={product.stock <= 0}
            onClick={() => {
              addToQuote(product.id)
              toast.success('Agregado a la cotización', {
                description: product.name,
              })
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
