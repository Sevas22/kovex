'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { formatCOP, useStore } from '@/lib/store'

export function QuoteDrawer() {
  const { products, quote, quoteCount, updateQuoteQty, removeFromQuote } = useStore()

  const lines = quote
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product ? { product, quantity: item.quantity } : null
    })
    .filter((l): l is { product: (typeof products)[number]; quantity: number } => l !== null)

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0)

  return (
    <Sheet>
      <SheetTrigger className="relative inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10">
        <ShoppingCart className="h-5 w-5" />
        <span className="hidden sm:inline">Cotización</span>
        {quoteCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-cyan px-1 text-[11px] font-bold text-brand-navy">
            {quoteCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Tu cotización</SheetTitle>
          <SheetDescription>
            Arma tu pedido mayorista y envíalo por WhatsApp para confirmar precios y
            disponibilidad.
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Aún no has agregado productos a tu cotización.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4">
            <ul className="flex flex-col gap-3 py-2">
              {lines.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-3 rounded-lg border border-border p-2">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-secondary">
                    <Image
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCOP(product.price)} / {product.unit}
                    </p>
                    <div className="mt-auto flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        aria-label="Disminuir"
                        onClick={() => updateQuoteQty(product.id, quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        aria-label="Aumentar"
                        onClick={() => updateQuoteQty(product.id, quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-auto h-7 w-7 text-muted-foreground hover:text-destructive"
                        aria-label="Eliminar"
                        onClick={() => removeFromQuote(product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {lines.length > 0 && (
          <SheetFooter className="border-t border-border">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal estimado</span>
              <span className="text-lg font-extrabold text-brand-navy">
                {formatCOP(subtotal)}
              </span>
            </div>
            <Button
              asChild
              className="w-full bg-brand-blue text-white hover:bg-brand-blue-600"
            >
              <Link href="/cotizacion">Revisar y enviar cotización</Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
