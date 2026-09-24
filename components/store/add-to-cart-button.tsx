'use client'

import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart'
import type { ProductSummary } from '@/lib/types'

/** Botón compacto de la tarjeta de producto. */
export function AddToCartButton({ product }: { product: ProductSummary }) {
  const { add, setOpen } = useCart()
  const forQuote = product.price == null || product.available === 0

  return (
    <Button
      size="icon-lg"
      className="chamfer chamfer-sm shrink-0"
      aria-label={`${forQuote ? 'Agregar a la cotización' : 'Agregar al pedido'}: ${product.name}`}
      onClick={() => {
        add(product, 1)
        toast.success(forQuote ? 'Agregado para cotizar' : 'Agregado a tu pedido', {
          description: product.name,
          action: { label: 'Ver pedido', onClick: () => setOpen(true) },
        })
      }}
    >
      <PlusIcon />
    </Button>
  )
}
