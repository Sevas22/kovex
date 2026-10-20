import Link from 'next/link'
import { CategoryMarkupRowView } from '@/components/admin/category-markup-row'
import { VolumeSettingsForm } from '@/components/admin/volume-settings-form'
import { PageHeader } from '@/components/admin/page-header'
import { AdminPagination } from '@/components/admin/pagination'
import { BulkMarkupForm, type BulkScope } from '@/components/admin/bulk-markup-form'
import { PricingSettingsForm } from '@/components/admin/pricing-settings-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCOP, formatPercent } from '@/lib/format'
import { computePrice, MARKUP_SOURCE_LABEL, PRICING_MODE_LABEL } from '@/lib/pricing'
import { getCategoryMarkupRows } from '@/lib/server/admin-categories'
import { listAdminProducts } from '@/lib/server/admin-products'
import { buildCategoryIndex, getCategories } from '@/lib/server/categories'
import { db } from '@/lib/server/db'
import { getSettings } from '@/lib/server/settings'

export const metadata = { title: 'Precios y márgenes' }

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; familia?: string; rama?: string }>
}) {
  const sp = await searchParams
  const pagina = Number(sp.pagina) || 1
  const familia = (sp.familia ?? '').trim()
  const rama = Number(sp.rama) || undefined
  const [settings, rows, products, categories] = await Promise.all([
    getSettings(),
    getCategoryMarkupRows({ search: familia || undefined, branchId: familia ? undefined : rama }),
    listAdminProducts({ status: 'todos', page: pagina }),
    getCategories(),
  ])
  const filtrando = Boolean(familia || rama)
  const index = buildCategoryIndex(categories)
  const byId = new Map(categories.map((c) => [c.id, c]))
  const conteos = new Map(
    (
      await db()<{ categoryId: number; count: number }[]>`
        select category_id, count(*)::int as count from public.products
        where category_id is not null group by category_id
      `
    ).map((r) => [r.categoryId, r.count]),
  )

  // Alcances del aumento masivo: todo el catálogo y cada departamento.
  const scopes: BulkScope[] = [
    {
      id: null,
      label: 'Todo el catálogo',
      current: settings.defaultMarkupPercent,
      productCount: products.total,
      ownCount: categories.filter((c) => c.markupPercent != null).length,
    },
    ...categories
      .filter((c) => c.parentId == null)
      .map((d) => {
        const dentro = index.subtreeIds(d.id)
        return {
          id: d.id,
          label: d.name,
          current: index.inheritedMarkup(d.id)?.percent ?? settings.defaultMarkupPercent,
          productCount: dentro.reduce((s, cid) => s + (conteos.get(cid) ?? 0), 0),
          ownCount: dentro.filter((cid) => cid !== d.id && byId.get(cid)?.markupPercent != null).length,
        }
      }),
  ]

  return (
    <>
      <PageHeader
        title="Precios y márgenes"
        description="El precio de venta = costo del proveedor + margen, redondeado hacia arriba. El margen se toma del producto; si no tiene, de su categoría (o la categoría padre); si tampoco, del margen general."
      />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Margen general</CardTitle>
            <CardDescription>Al guardar se recalculan los precios de todo el catálogo.</CardDescription>
          </CardHeader>
          <CardContent>
            <PricingSettingsForm
              defaultMarkupPercent={settings.defaultMarkupPercent}
              priceRounding={settings.priceRounding}
              costIncludesTax={settings.supplierPricesIncludeTax}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Escala por cantidad (precio mayorista)</CardTitle>
            <CardDescription>
              Descuento sobre el precio de venta según las unidades de cada producto. Se hereda igual que el margen:
              producto, luego categoría, luego esta escala general. Si no hay escalones, el precio no cambia con la
              cantidad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VolumeSettingsForm
              volumeTiers={settings.volumeTiers}
              minMarginPercent={settings.minMarginPercent}
              priceRounding={settings.priceRounding}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aumento masivo</CardTitle>
            <CardDescription>
              Sube o fija el margen de un departamento entero —o de todo el catálogo— sin tocar familia por familia.
              Al aplicar se recalculan los precios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BulkMarkupForm scopes={scopes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Margen por categoría y familia</CardTitle>
            <CardDescription>
              Déjalo vacío para heredar. Un margen en un departamento aplica a todas sus subcategorías salvo que tengan
              uno propio. Busca una familia por nombre —«lijas», «grifería», «discos»— para fijarle su propio margen, o
              abre una rama para ver todo lo que cuelga de ella.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form method="get" className="flex flex-wrap items-center gap-2">
              <input
                type="search"
                name="familia"
                defaultValue={familia}
                placeholder="Buscar familia: lijas, grifería, discos…"
                aria-label="Buscar familia de productos"
                className="h-9 w-full max-w-sm rounded-md border bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button type="submit" size="sm">
                Buscar
              </Button>
              {filtrando ? (
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin/precios" />}>
                  Ver todas
                </Button>
              ) : null}
              {familia ? (
                <span className="text-sm text-muted-foreground">
                  {rows.length === 60 ? 'Primeras 60 coincidencias' : `${rows.length} coincidencia${rows.length === 1 ? '' : 's'}`}
                </span>
              ) : null}
            </form>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Productos</TableHead>
                  <TableHead>Margen propio</TableHead>
                  <TableHead>Se aplica</TableHead>
                  <TableHead>Escala por cantidad</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <CategoryMarkupRowView
                    key={row.id}
                    row={row}
                    defaultMarkup={settings.defaultMarkupPercent}
                    generalTiers={settings.volumeTiers}
                    showPath={Boolean(familia)}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cómo se calcula cada precio</CardTitle>
            <CardDescription>Así queda hoy cada producto con los márgenes configurados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Modo</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead>Margen aplicado</TableHead>
                  <TableHead className="text-right">Sin redondeo</TableHead>
                  <TableHead className="text-right">Precio de venta</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.items.map((p) => {
                  const inherited = index.inheritedMarkup(p.categoryId)
                  const b = computePrice({
                    mode: p.pricingMode,
                    costPrice: p.costPrice,
                    fixedPrice: p.fixedPrice,
                    productMarkup: p.markupPercent,
                    categoryMarkup: inherited?.percent ?? null,
                    defaultMarkup: settings.defaultMarkupPercent,
                    rounding: settings.priceRounding,
                    taxRate: p.taxRate,
                    costIncludesTax: settings.supplierPricesIncludeTax,
                  })
                  const source =
                    b.markupSource === 'category' && inherited ? `de ${inherited.from.name}` : b.markupSource ? MARKUP_SOURCE_LABEL[b.markupSource] : null
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="max-w-72 whitespace-normal">
                        <Link href={`/admin/productos/${p.id}`} className="line-clamp-1 font-medium hover:text-brand-blue">
                          {p.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.pricingMode === 'quote' ? 'secondary' : 'outline'}>{PRICING_MODE_LABEL[p.pricingMode]}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular">{p.costPrice == null ? '—' : formatCOP(p.costPrice)}</TableCell>
                      <TableCell>
                        {b.markupPercent == null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <>
                            <span className="font-semibold tabular">{formatPercent(b.markupPercent)}</span>
                            <span className="block text-xs text-muted-foreground">{source}</span>
                          </>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground tabular">
                        {b.beforeRounding == null ? '—' : formatCOP(Math.round(b.beforeRounding))}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular">{b.price == null ? 'A cotizar' : formatCOP(b.price)}</TableCell>
                      <TableCell className="text-right text-success tabular">
                        {b.price != null && p.costPrice != null ? formatCOP(b.price - p.costPrice) : '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <AdminPagination
              page={products.page}
              pageCount={products.pageCount}
              total={products.total}
              label="productos"
              href={(n) => (n > 1 ? `/admin/precios?pagina=${n}` : '/admin/precios')}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
