import { ArrowLeftIcon, ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminNotes } from '@/components/admin/admin-notes'
import { OrderActions } from '@/components/admin/order-actions'
import { QuotePricer } from '@/components/admin/quote-pricer'
import { OrderKindBadge, OrderStatusBadge } from '@/components/admin/status-badge'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCOP, formatDateTime } from '@/lib/format'
import { computePrice } from '@/lib/pricing'
import { priceTiersFor } from '@/lib/server/product-pricing'
import { tierForQuantity } from '@/lib/volume-pricing'
import { buildCategoryIndex, getCategories } from '@/lib/server/categories'
import { db } from '@/lib/server/db'
import { getOrderById, getOrderEvents, listMovements } from '@/lib/server/order-queries'
import { getSettings } from '@/lib/server/settings'
import { getSiteUrl } from '@/lib/server/site-url'
import { formatPhone } from '@/lib/text'
import { MOVEMENT_LABEL, STOCK_STATE_LABEL } from '@/lib/types'
import { buildCustomerReply, whatsappLink } from '@/lib/whatsapp'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const order = await getOrderById(Number((await params).id))
  return { title: order?.code ?? 'Pedido' }
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderById(Number(id))
  if (!order) notFound()

  const [events, movements, settings, siteUrl, categories] = await Promise.all([
    getOrderEvents(order.id),
    listMovements({ orderId: order.id }),
    getSettings(),
    getSiteUrl(),
    getCategories(),
  ])

  const editableQuote = order.kind === 'quote' && (order.status === 'pending' || order.status === 'quoted')

  // Precio sugerido por línea: precio de venta vigente (o costo + margen si no tiene),
  // con la escala por cantidad ya aplicada a las unidades que pidió el cliente.
  const suggested = new Map<number, { price: number | null; cost: number | null; percent: number; minQty: number | null }>()
  if (editableQuote) {
    const index = buildCategoryIndex(categories)
    const ids = order.items.flatMap((i) => (i.productId ? [i.productId] : []))
    const products = await db()<
      {
        id: number
        price: number | null
        costPrice: number | null
        markupPercent: number | null
        categoryId: number | null
        volumeTiers: unknown
      }[]
    >`
      select id, price, cost_price, markup_percent, category_id, volume_tiers
      from public.products where id = any(${ids})
    `
    const byId = new Map(products.map((p) => [p.id, p]))
    const ctx = { settings, index }
    for (const item of order.items) {
      const product = item.productId == null ? undefined : byId.get(item.productId)
      if (!product) continue
      const listPrice =
        product.price ??
        computePrice({
          mode: 'markup',
          costPrice: product.costPrice,
          fixedPrice: null,
          productMarkup: product.markupPercent,
          categoryMarkup: index.inheritedMarkup(product.categoryId)?.percent ?? null,
          defaultMarkup: settings.defaultMarkupPercent,
          rounding: settings.priceRounding,
        }).price
      const tier = tierForQuantity(priceTiersFor({ ...product, price: listPrice }, ctx), item.quantity)
      suggested.set(item.id, {
        price: tier?.unitPrice ?? listPrice,
        cost: product.costPrice,
        percent: tier?.percent ?? 0,
        minQty: tier?.minQty ?? null,
      })
    }
  }

  const priceLines = order.items
    .filter((i) => i.unitPrice != null)
    .map((i) => `• ${i.quantity} × ${i.productName}: ${formatCOP(i.unitPrice!)} c/u`)
  const replyBody =
    order.kind === 'quote' && order.status === 'quoted'
      ? ['Estos son los precios de tu cotización:', ...priceLines, `Total: ${formatCOP(order.subtotal)} (IVA incluido).`, `Detalle: ${siteUrl}/pedido/${order.publicToken}`].join('\n')
      : undefined
  const replyUrl = whatsappLink(
    order.customerPhone,
    buildCustomerReply({ name: order.customerName, code: order.code, kind: order.kind, body: replyBody }),
  )

  return (
    <>
      <Link href="/admin/pedidos" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-blue">
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        Pedidos y cotizaciones
      </Link>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl text-brand-navy">{order.code}</h1>
            <OrderKindBadge kind={order.kind} />
            <OrderStatusBadge status={order.status} kind={order.kind} />
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Creado el {formatDateTime(order.createdAt)} · {STOCK_STATE_LABEL[order.stockState]}
          </p>
        </div>
        <OrderActions
          orderId={order.id}
          code={order.code}
          kind={order.kind}
          status={order.status}
          stockState={order.stockState}
          hasUnpricedItems={order.hasUnpricedItems}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{editableQuote ? 'Precios de la cotización' : 'Productos'}</CardTitle>
              {editableQuote ? (
                <CardDescription>
                  Ajusta los precios según el volumen y guárdalos. Luego respóndele al cliente por WhatsApp y, si acepta,
                  conviértela en pedido.
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent>
              {editableQuote ? (
                <QuotePricer
                  orderId={order.id}
                  lines={order.items.map((i) => ({
                    id: i.id,
                    name: i.productName,
                    sku: i.productSku,
                    unit: i.unit,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    listUnitPrice: i.listUnitPrice,
                    suggested: suggested.get(i.id) ?? null,
                  }))}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cant.</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="whitespace-normal">
                          {i.productId ? (
                            <Link href={`/admin/productos/${i.productId}`} className="font-medium hover:text-brand-blue">
                              {i.productName}
                            </Link>
                          ) : (
                            <span className="font-medium">{i.productName}</span>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {i.productSku ? `Ref. ${i.productSku}` : ''}
                            {i.stockTracked ? ' · controla inventario' : ''}
                          </p>
                        </TableCell>
                        <TableCell className="text-right tabular">{i.quantity}</TableCell>
                        <TableCell className="text-right tabular">{i.unitPrice == null ? 'A cotizar' : formatCOP(i.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium tabular">
                          {i.lineTotal == null ? '—' : formatCOP(i.lineTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3}>Subtotal (IVA incluido)</TableCell>
                      <TableCell className="text-right text-base font-bold tabular">{formatCOP(order.subtotal)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Movimientos de inventario</CardTitle>
              <CardDescription>{STOCK_STATE_LABEL[order.stockState]}.</CardDescription>
            </CardHeader>
            <CardContent>
              {movements.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Movimiento</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Reservado</TableHead>
                      <TableHead className="text-right">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{MOVEMENT_LABEL[m.kind]}</TableCell>
                        <TableCell className="max-w-56 truncate">{m.productName}</TableCell>
                        <TableCell className="text-right tabular">
                          {m.stockDelta ? `${m.stockDelta > 0 ? '+' : ''}${m.stockDelta} → ` : ''}
                          {m.stockAfter}
                        </TableCell>
                        <TableCell className="text-right tabular">
                          {m.reservedDelta ? `${m.reservedDelta > 0 ? '+' : ''}${m.reservedDelta} → ` : ''}
                          {m.reservedAfter}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {order.kind === 'quote'
                    ? 'Las cotizaciones no mueven inventario hasta que se convierten en pedido.'
                    : 'Sin movimientos.'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                <dt className="text-muted-foreground">Nombre</dt>
                <dd className="font-medium">{order.customerName}</dd>
                {order.customerCompany ? (
                  <>
                    <dt className="text-muted-foreground">Empresa</dt>
                    <dd>{order.customerCompany}</dd>
                  </>
                ) : null}
                {order.customerDocument ? (
                  <>
                    <dt className="text-muted-foreground">NIT/CC</dt>
                    <dd className="tabular">{order.customerDocument}</dd>
                  </>
                ) : null}
                <dt className="text-muted-foreground">WhatsApp</dt>
                <dd className="tabular">{formatPhone(order.customerPhone)}</dd>
                {order.customerEmail ? (
                  <>
                    <dt className="text-muted-foreground">Correo</dt>
                    <dd className="break-all">{order.customerEmail}</dd>
                  </>
                ) : null}
                {order.customerCity || order.customerAddress ? (
                  <>
                    <dt className="text-muted-foreground">Entrega</dt>
                    <dd>{[order.customerAddress, order.customerCity].filter(Boolean).join(', ')}</dd>
                  </>
                ) : null}
              </dl>
              {order.customerNotes ? (
                <p className="rounded-md bg-brand-mist p-3 text-sm">
                  <span className="font-medium">Nota del cliente:</span> {order.customerNotes}
                </p>
              ) : null}
              <Button variant="whatsapp" size="lg" nativeButton={false} render={<a href={replyUrl} target="_blank" rel="noopener noreferrer" />}>
                <WhatsAppIcon data-icon="inline-start" />
                {replyBody ? 'Enviar cotización al cliente' : 'Escribir al cliente'}
              </Button>
              <Button variant="ghost" size="sm" nativeButton={false} render={<a href={`/pedido/${order.publicToken}`} target="_blank" rel="noopener noreferrer" />}>
                <ExternalLinkIcon data-icon="inline-start" />
                Ver como lo ve el cliente
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas internas</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminNotes orderId={order.id} initial={order.adminNotes} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col gap-3 border-l pl-4">
                {events.map((e) => (
                  <li key={e.id} className="relative text-sm">
                    <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full bg-brand-blue ring-4 ring-card" aria-hidden="true" />
                    <p>{e.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(e.createdAt)}
                      {e.actor ? ` · ${e.actor}` : ' · cliente'}
                    </p>
                  </li>
                ))}
              </ol>
              {order.cancelReason ? <p className="mt-3 text-sm text-muted-foreground">Motivo: {order.cancelReason}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
