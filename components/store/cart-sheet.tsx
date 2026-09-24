'use client'

import { ShoppingBagIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { ProductImage } from './product-image'
import { QuantityStepper } from './quantity-stepper'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cartTotals, useCart } from '@/lib/cart'
import { formatCOP, plural } from '@/lib/format'

export function CartSheet() {
  const { items, isOpen, setOpen, setQuantity, remove } = useCart()
  const { subtotal, discount, unpricedCount, lines } = cartTotals(items)

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="font-display text-base">Mi pedido</SheetTitle>
          <SheetDescription>
            {items.length ? plural(items.length, 'producto') : 'Tu lista está vacía'}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingBagIcon />
              </EmptyMedia>
              <EmptyTitle>Aún no has agregado productos</EmptyTitle>
              <EmptyDescription>Agrega lo que necesitas y envíanos la lista por WhatsApp.</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" nativeButton={false} render={<Link href="/catalogo" />} onClick={() => setOpen(false)}>
              Ver catálogo
            </Button>
          </Empty>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-3 border-b px-4 py-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-sm border bg-white">
                  <ProductImage src={product.image} alt={product.name} sizes="64px" className="p-1" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Link
                    href={`/producto/${product.slug}`}
                    onClick={() => setOpen(false)}
                    className="line-clamp-2 text-sm leading-snug font-semibold hover:text-brand-blue"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-center justify-between gap-2">
                    <QuantityStepper
                      value={quantity}
                      allowZero
                      onChange={(q) => setQuantity(product.id, q)}
                      label={`Cantidad de ${product.name}`}
                    />
                    <span className="text-sm font-semibold tabular">
                      {product.price == null
                        ? 'A cotizar'
                        : formatCOP(lines.get(product.id)?.lineTotal ?? product.price * quantity)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Quitar ${product.name}`}
                  onClick={() => remove(product.id)}
                >
                  <Trash2Icon />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {items.length ? (
          <SheetFooter className="gap-3 border-t bg-brand-mist">
            {discount > 0 ? (
              <div className="flex items-baseline justify-between text-sm font-semibold text-success">
                <span>Descuento por volumen</span>
                <span className="tabular">−{formatCOP(discount)}</span>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">{discount > 0 ? 'Estimado' : 'Subtotal'}</span>
              <span className="text-xl font-bold tabular">{formatCOP(subtotal)}</span>
            </div>
            {unpricedCount ? (
              <p className="text-xs text-muted-foreground">
                + {plural(unpricedCount, 'producto')} por cotizar. Te enviamos el valor por WhatsApp.
              </p>
            ) : null}
            <Separator />
            <Button size="xl" className="chamfer w-full" nativeButton={false} render={<Link href="/pedido" />} onClick={() => setOpen(false)}>
              Revisar y enviar
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
