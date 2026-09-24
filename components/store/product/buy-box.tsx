'use client'

import { ShoppingBagIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { QuantityStepper } from '@/components/store/quantity-stepper'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart'
import type { ProductSummary } from '@/lib/types'

export function BuyBox({ product, whatsappUrl }: { product: ProductSummary; whatsappUrl: string }) {
  const { add, items, setOpen } = useCart()
  const [quantity, setQuantity] = useState(1)
  const inCart = items.find((i) => i.product.id === product.id)?.quantity ?? 0
  const forQuote = product.price == null || product.available === 0
  const exceeds = product.available != null && product.available > 0 && inCart + quantity > product.available

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} size="lg" label="Cantidad" />
        <Button
          size="xl"
          className="chamfer min-w-52 flex-1 sm:flex-none"
          onClick={() => {
            add(product, quantity)
            toast.success(forQuote ? 'Agregado para cotizar' : 'Agregado a tu pedido', {
              description: `${quantity} × ${product.name}`,
              action: { label: 'Ver pedido', onClick: () => setOpen(true) },
            })
            setQuantity(1)
          }}
        >
          <ShoppingBagIcon data-icon="inline-start" />
          {forQuote ? 'Agregar para cotizar' : 'Agregar al pedido'}
        </Button>
      </div>
      {exceeds ? (
        <p className="text-xs text-warning">
          Hay {product.available} disponibles. Puedes pedir más como cotización y te confirmamos tiempos de entrega.
        </p>
      ) : null}
      {inCart ? (
        <p className="text-xs text-muted-foreground">Ya tienes {inCart} en tu pedido.</p>
      ) : null}
      <Button
        size="xl"
        variant="outline"
        nativeButton={false}
        render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
      >
        <WhatsAppIcon data-icon="inline-start" className="text-whatsapp-600" />
        Preguntar por este producto
      </Button>
    </div>
  )
}
