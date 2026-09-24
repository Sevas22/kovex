import { ArrowLeftIcon, ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteProductButton } from '@/components/admin/delete-product-button'
import { MovementsTable } from '@/components/admin/movements-table'
import { ProductForm } from '@/components/admin/product-form'
import { StockAdjuster } from '@/components/admin/stock-adjuster'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCOP, formatDateTime } from '@/lib/format'
import { getCategoryOptions } from '@/lib/server/admin-categories'
import { getAdminProduct } from '@/lib/server/admin-products'
import { listMovements } from '@/lib/server/order-queries'
import { getSettings } from '@/lib/server/settings'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const product = await getAdminProduct(Number((await params).id))
  return { title: product?.name ?? 'Producto' }
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = Number(id)
  const [product, categories, settings, movements] = await Promise.all([
    getAdminProduct(productId),
    getCategoryOptions(),
    getSettings(),
    listMovements({ productId, limit: 50 }),
  ])
  if (!product) notFound()
  const available = product.stock - product.reserved

  return (
    <>
      <Link href="/admin/productos" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-blue">
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        Productos
      </Link>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ref. {product.sku}
            {product.supplierName ? ` · Proveedor: ${product.supplierName}` : ''} · Actualizado {formatDateTime(product.updatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="lg" nativeButton={false} render={<a href={`/producto/${product.slug}`} target="_blank" rel="noopener noreferrer" />}>
            <ExternalLinkIcon data-icon="inline-start" />
            Ver en la tienda
          </Button>
          <DeleteProductButton id={product.id} name={product.name} />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Inventario</CardTitle>
          <CardDescription>
            {product.trackInventory
              ? 'Disponible = stock en bodega − unidades reservadas en pedidos sin confirmar.'
              : 'Este producto no controla inventario: se vende bajo pedido.'}
          </CardDescription>
          {product.trackInventory ? (
            <CardAction>
              <StockAdjuster productId={product.id} stock={product.stock} reserved={product.reserved} />
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <dl className="grid grid-cols-3 gap-4 sm:max-w-lg">
            {[
              ['En bodega', product.stock],
              ['Reservado', product.reserved],
              ['Disponible', available],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-brand-mist p-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-2xl font-bold text-brand-navy tabular">{value}</dd>
              </div>
            ))}
          </dl>
          {movements.length ? <MovementsTable movements={movements} /> : <p className="text-sm text-muted-foreground">Sin movimientos todavía.</p>}
        </CardContent>
      </Card>

      {product.sourceUrl ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Proveedor</CardTitle>
            <CardDescription>
              Precio público en Texcomercial: {product.costPrice == null ? 'sin precio' : formatCOP(product.costPrice)} ·{' '}
              {product.sourceAvailable ? 'disponible en el proveedor' : 'agotado en el proveedor'}
              {product.sourceSyncedAt ? ` · sincronizado ${formatDateTime(product.sourceSyncedAt)}` : ''}
            </CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" nativeButton={false} render={<a href={product.sourceUrl} target="_blank" rel="noopener noreferrer" />}>
                <ExternalLinkIcon data-icon="inline-start" />
                Ver en Texcomercial
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      ) : null}

      <ProductForm
        product={product}
        categories={categories}
        pricing={{ defaultMarkupPercent: settings.defaultMarkupPercent, priceRounding: settings.priceRounding }}
      />
    </>
  )
}
