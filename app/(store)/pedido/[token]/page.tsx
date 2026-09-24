import { CheckCircle2Icon, CircleDotIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { ProductImage } from '@/components/store/product-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCOP, formatDateTime, plural } from '@/lib/format'
import { getOrderByToken } from '@/lib/server/order-queries'
import { getSettings } from '@/lib/server/settings'
import { getSiteUrl } from '@/lib/server/site-url'
import { formatPhone } from '@/lib/text'
import { ORDER_KIND_LABEL, ORDER_STATUS_LABEL } from '@/lib/types'
import { buildOrderMessage, whatsappLink } from '@/lib/whatsapp'

export const metadata: Metadata = { title: 'Tu pedido', robots: { index: false } }

export default async function OrderConfirmationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const [order, settings, siteUrl] = await Promise.all([getOrderByToken(token), getSettings(), getSiteUrl()])
  if (!order) notFound()

  const isOrder = order.kind === 'order'
  const isOpen = order.status === 'pending' || order.status === 'quoted'
  const message = buildOrderMessage({
    code: order.code,
    kind: order.kind,
    items: order.items.map((i) => ({
      name: i.productName,
      sku: i.productSku,
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: i.unitPrice,
    })),
    subtotal: order.subtotal,
    hasUnpricedItems: order.hasUnpricedItems,
    customer: {
      name: order.customerName,
      company: order.customerCompany,
      document: order.customerDocument,
      phone: formatPhone(order.customerPhone),
      email: order.customerEmail,
      city: order.customerCity,
      address: order.customerAddress,
      notes: order.customerNotes,
    },
    url: `${siteUrl}/pedido/${order.publicToken}`,
  })
  const sendUrl = whatsappLink(settings.whatsappNumber, message)

  const nextSteps = isOrder
    ? [
        'Envía el pedido por WhatsApp con el botón de arriba.',
        'Separamos tus unidades mientras un asesor confirma pago y entrega contigo.',
        'Al confirmar el pago despachamos a la dirección que indicaste.',
      ]
    : [
        'Envía la solicitud por WhatsApp con el botón de arriba.',
        'Un asesor te responde con precios por volumen y tiempos de entrega.',
        'Si estás de acuerdo, convertimos la cotización en pedido.',
      ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2Icon className="size-14 text-success" strokeWidth={1.5} aria-hidden="true" />
        <div>
          <p className="text-sm text-muted-foreground">
            {ORDER_KIND_LABEL[order.kind]} · {formatDateTime(order.createdAt)}
          </p>
          <h1 className="mt-1 font-display text-2xl text-brand-navy uppercase md:text-3xl">{order.code}</h1>
        </div>
        <Badge variant={isOpen ? 'secondary' : 'default'}>{ORDER_STATUS_LABEL[order.status]}</Badge>
        {isOpen ? (
          <>
            <p className="max-w-md text-muted-foreground">
              {isOrder
                ? 'Registramos tu pedido. Último paso: envíalo por WhatsApp para que un asesor lo confirme contigo.'
                : 'Registramos tu solicitud. Último paso: envíala por WhatsApp para que un asesor te responda.'}
            </p>
            <Button
              variant="whatsapp"
              size="xl"
              className="h-13 px-8 text-base"
              nativeButton={false}
              render={<a href={sendUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <WhatsAppIcon data-icon="inline-start" />
              Enviar por WhatsApp
            </Button>
            <p className="text-xs text-muted-foreground">
              Se abrirá un chat con {formatPhone(settings.whatsappNumber)} con el detalle ya escrito.
            </p>
          </>
        ) : null}
      </div>

      <section className="mt-10 rounded-md border bg-card">
        <h2 className="border-b px-5 py-3 text-sm font-semibold">{plural(order.items.length, 'producto')}</h2>
        <ul>
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 border-b px-5 py-3 last:border-b-0">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-sm border bg-white">
                <ProductImage src={item.productImage} alt={item.productName} sizes="56px" className="p-1" />
              </div>
              <div className="min-w-0 flex-1">
                {item.productSlug ? (
                  <Link href={`/producto/${item.productSlug}`} className="line-clamp-2 text-sm font-medium hover:text-brand-blue">
                    {item.productName}
                  </Link>
                ) : (
                  <p className="line-clamp-2 text-sm font-medium">{item.productName}</p>
                )}
                <p className="text-xs text-muted-foreground tabular">
                  {item.quantity} × {item.unitPrice == null ? 'precio a cotizar' : formatCOP(item.unitPrice)}
                </p>
              </div>
              <span className="text-sm font-semibold tabular">
                {item.lineTotal == null ? 'A cotizar' : formatCOP(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t bg-brand-mist px-5 py-4">
          <span className="text-sm text-muted-foreground">
            Subtotal{order.hasUnpricedItems ? ' (sin productos por cotizar)' : ''}
          </span>
          <span className="text-xl font-bold tabular">{formatCOP(order.subtotal)}</span>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-md border p-5">
          <h2 className="text-sm font-semibold">Qué sigue</h2>
          <ol className="mt-3 flex flex-col gap-3 text-sm text-muted-foreground">
            {nextSteps.map((step) => (
              <li key={step} className="flex gap-2">
                <CircleDotIcon className="mt-0.5 size-4 shrink-0 text-brand-blue" aria-hidden="true" />
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-md border p-5 text-sm">
          <h2 className="font-semibold">Tus datos</h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-muted-foreground">
            <dt>Nombre</dt>
            <dd className="text-foreground">{order.customerName}</dd>
            {order.customerCompany ? (
              <>
                <dt>Empresa</dt>
                <dd className="text-foreground">{order.customerCompany}</dd>
              </>
            ) : null}
            <dt>WhatsApp</dt>
            <dd className="text-foreground tabular">{formatPhone(order.customerPhone)}</dd>
            {order.customerCity ? (
              <>
                <dt>Entrega</dt>
                <dd className="text-foreground">
                  {[order.customerAddress, order.customerCity].filter(Boolean).join(', ')}
                </dd>
              </>
            ) : null}
          </dl>
        </div>
      </section>

      <div className="mt-10 text-center">
        <Button variant="outline" size="xl" nativeButton={false} render={<Link href="/catalogo" />}>
          Seguir comprando
        </Button>
      </div>
    </div>
  )
}
