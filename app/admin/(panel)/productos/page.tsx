import { DownloadCloudIcon, PlusIcon, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/admin/page-header'
import { ProductActiveSwitch, ProductFeaturedToggle } from '@/components/admin/product-active-switch'
import { ProductImage } from '@/components/store/product-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCOP, formatNumber, formatPercent } from '@/lib/format'
import { computePrice, PRICING_MODE_LABEL } from '@/lib/pricing'
import { listAdminProducts, type ProductStatusFilter } from '@/lib/server/admin-products'
import { buildCategoryIndex, getCategories } from '@/lib/server/categories'
import { getSettings } from '@/lib/server/settings'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Productos' }

const FILTERS: { value: ProductStatusFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Visibles' },
  { value: 'inactivos', label: 'Ocultos' },
  { value: 'a-cotizar', label: 'A cotizar' },
  { value: 'stock-bajo', label: 'Stock bajo' },
  { value: 'agotados', label: 'Agotados' },
]

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ estado?: string; q?: string }> }) {
  const sp = await searchParams
  const status = FILTERS.some((f) => f.value === sp.estado) ? (sp.estado as ProductStatusFilter) : 'todos'
  const q = sp.q?.trim() ?? ''
  const [products, categories, settings] = await Promise.all([
    listAdminProducts({ q, status }),
    getCategories(),
    getSettings(),
  ])
  const index = buildCategoryIndex(categories)

  return (
    <>
      <PageHeader
        title="Productos"
        description={`${formatNumber(products.length)} en esta vista · el plan permite hasta ${formatNumber(settings.productLimit)} productos.`}
        actions={
          <>
            <Button variant="outline" size="lg" nativeButton={false} render={<Link href="/admin/importar" />}>
              <DownloadCloudIcon data-icon="inline-start" />
              Importar de Texcomercial
            </Button>
            <Button size="lg" nativeButton={false} render={<Link href="/admin/productos/nuevo" />}>
              <PlusIcon data-icon="inline-start" />
              Nuevo producto
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filtrar productos" className="inline-flex w-fit flex-wrap rounded-lg bg-white p-1 ring-1 ring-border">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={`/admin/productos?estado=${f.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              aria-current={f.value === status ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground',
                f.value === status && 'bg-brand-navy text-white hover:text-white',
              )}
            >
              {f.label}
            </Link>
          ))}
        </nav>
        <form className="w-full lg:w-80">
          <input type="hidden" name="estado" value={status} />
          <InputGroup className="h-9 bg-white">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput name="q" defaultValue={q} placeholder="Nombre, marca o referencia" aria-label="Buscar productos" />
          </InputGroup>
        </form>
      </div>

      <Card>
        <CardContent>
          {products.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No hay productos en esta vista</EmptyTitle>
                <EmptyDescription>Cambia el filtro o importa productos desde Texcomercial.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Margen</TableHead>
                  <TableHead className="text-right">Venta</TableHead>
                  <TableHead className="text-right">Disponible</TableHead>
                  <TableHead className="text-center">Visible</TableHead>
                  <TableHead className="text-center">Destacado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const breakdown = computePrice({
                    mode: p.pricingMode,
                    costPrice: p.costPrice,
                    fixedPrice: p.fixedPrice,
                    productMarkup: p.markupPercent,
                    categoryMarkup: index.inheritedMarkup(p.categoryId)?.percent ?? null,
                    defaultMarkup: settings.defaultMarkupPercent,
                    rounding: settings.priceRounding,
                  })
                  const available = p.stock - p.reserved
                  const category = index.pathOf(p.categoryId).at(-1)?.name
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="whitespace-normal">
                        <div className="flex items-center gap-3">
                          <div className="relative size-11 shrink-0 overflow-hidden rounded-sm border bg-white">
                            <ProductImage src={p.image} alt="" sizes="44px" className="p-1" />
                          </div>
                          <div className="min-w-0">
                            <Link href={`/admin/productos/${p.id}`} className="line-clamp-1 font-medium hover:text-brand-blue">
                              {p.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {[p.brand, category, p.sku].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.pricingMode === 'quote' ? 'secondary' : 'outline'}>{PRICING_MODE_LABEL[p.pricingMode]}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular">{p.costPrice == null ? '—' : formatCOP(p.costPrice)}</TableCell>
                      <TableCell className="text-right tabular">
                        {breakdown.markupPercent == null ? (
                          '—'
                        ) : (
                          <span title={breakdown.markupSource === 'product' ? 'Margen propio' : 'Heredado'}>
                            {formatPercent(breakdown.markupPercent)}
                            {breakdown.markupSource !== 'product' ? <span className="text-muted-foreground">*</span> : null}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular">{p.price == null ? 'A cotizar' : formatCOP(p.price)}</TableCell>
                      <TableCell className="text-right tabular">
                        {p.trackInventory ? (
                          <>
                            <span className={cn(available <= 0 && 'text-destructive', available > 0 && available <= p.lowStockThreshold && 'text-warning', 'font-semibold')}>
                              {available}
                            </span>
                            {p.reserved ? <span className="block text-xs text-muted-foreground">{p.reserved} reservadas</span> : null}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Bajo pedido</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <ProductActiveSwitch id={p.id} name={p.name} isActive={p.isActive} />
                      </TableCell>
                      <TableCell className="text-center">
                        <ProductFeaturedToggle id={p.id} name={p.name} isFeatured={p.isFeatured} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
          <p className="mt-3 text-xs text-muted-foreground">* Margen heredado de la categoría o del margen general.</p>
        </CardContent>
      </Card>
    </>
  )
}
