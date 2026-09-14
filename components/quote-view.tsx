'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { WHATSAPP_NUMBER } from '@/lib/data'
import { formatCOP, useStore } from '@/lib/store'

// Ícono simple de WhatsApp (no disponible en lucide)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

export function QuoteView() {
  const { products, quote, updateQuoteQty, removeFromQuote, clearQuote } = useStore()
  const [form, setForm] = useState({
    nombre: '',
    negocio: '',
    telefono: '',
    ciudad: '',
    notas: '',
  })

  const lines = quote
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product ? { product, quantity: item.quantity } : null
    })
    .filter((l): l is { product: (typeof products)[number]; quantity: number } => l !== null)

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0)

  function sendWhatsApp() {
    if (!form.nombre.trim() || !form.telefono.trim()) {
      toast.error('Completa tu nombre y teléfono', {
        description: 'Los necesitamos para responder tu cotización.',
      })
      return
    }

    const productLines = lines
      .map(
        (l) =>
          `• ${l.quantity} x ${l.product.name} (${l.product.sku}) — ${formatCOP(
            l.product.price * l.quantity,
          )}`,
      )
      .join('\n')

    const message = [
      '*Nueva cotización - KOVEX Colombia*',
      '',
      productLines,
      '',
      `*Subtotal estimado:* ${formatCOP(subtotal)}`,
      '',
      '*Datos del cliente:*',
      `Nombre: ${form.nombre}`,
      form.negocio ? `Negocio: ${form.negocio}` : '',
      `Teléfono: ${form.telefono}`,
      form.ciudad ? `Ciudad: ${form.ciudad}` : '',
      form.notas ? `Notas: ${form.notas}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    toast.success('Abriendo WhatsApp con tu cotización')
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <ShoppingCart className="mx-auto h-14 w-14 text-muted-foreground/40" />
        <h1 className="mt-4 text-2xl font-extrabold text-brand-navy">
          Tu cotización está vacía
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explora el catálogo y agrega productos para armar tu pedido mayorista.
        </p>
        <Button asChild className="mt-6 bg-brand-blue text-white hover:bg-brand-blue-600">
          <Link href="/catalogo">Ir al catálogo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        href="/catalogo"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-blue"
      >
        <ArrowLeft className="h-4 w-4" />
        Seguir comprando
      </Link>

      <h1 className="mb-6 text-2xl font-extrabold text-brand-navy md:text-3xl">
        Revisa tu cotización
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <ul className="flex flex-col gap-3">
            {lines.map(({ product, quantity }) => (
              <li
                key={product.id}
                className="flex gap-4 rounded-lg border border-border bg-card p-3"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-secondary">
                  <Image
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-contain p-1.5"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/producto/${product.id}`}
                    className="truncate font-semibold hover:text-brand-blue"
                  >
                    {product.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatCOP(product.price)} / {product.unit}
                  </span>
                  <div className="mt-auto flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      aria-label="Disminuir"
                      onClick={() => updateQuoteQty(product.id, quantity - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      aria-label="Aumentar"
                      onClick={() => updateQuoteQty(product.id, quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label="Eliminar"
                    onClick={() => removeFromQuote(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <span className="font-bold text-brand-navy">
                    {formatCOP(product.price * quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <Button
            variant="link"
            className="mt-2 text-muted-foreground hover:text-destructive"
            onClick={() => {
              clearQuote()
              toast('Cotización vaciada')
            }}
          >
            Vaciar cotización
          </Button>
        </div>

        {/* Resumen + datos */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-5">
            <h2 className="text-lg font-bold text-brand-navy">Tus datos</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Enviaremos tu cotización por WhatsApp para confirmar precios y disponibilidad.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <Label htmlFor="negocio">Nombre del negocio</Label>
                <Input
                  id="negocio"
                  value={form.negocio}
                  onChange={(e) => setForm({ ...form, negocio: e.target.value })}
                  placeholder="Ej. Ferretería El Tornillo"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="300 123 4567"
                    inputMode="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input
                    id="ciudad"
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                    placeholder="Bogotá"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  placeholder="Detalles adicionales de tu pedido..."
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Subtotal estimado</span>
              <span className="text-2xl font-extrabold text-brand-navy">
                {formatCOP(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              *El valor final se confirma con el asesor según cantidades mayoristas.
            </p>

            <Button
              size="lg"
              onClick={sendWhatsApp}
              className="mt-4 w-full gap-2 bg-[#25D366] text-white hover:bg-[#1eb955]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Enviar cotización por WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
