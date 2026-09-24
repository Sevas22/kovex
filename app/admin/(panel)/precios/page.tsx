import Link from 'next/link'
import { CategoryMarkupRowView } from '@/components/admin/category-markup-row'
import { PageHeader } from '@/components/admin/page-header'
import { PricingSettingsForm } from '@/components/admin/pricing-settings-form'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCOP, formatPercent } from '@/lib/format'
import { computePrice, MARKUP_SOURCE_LABEL, PRICING_MODE_LABEL } from '@/lib/pricing'
import { getCategoryMarkupRows } from '@/lib/server/admin-categories'
import { listAdminProducts } from '@/lib/server/admin-products'
import { buildCategoryIndex, getCategories } from '@/lib/server/categories'
import { getSettings } from '@/lib/server/settings'

export const metadata = { title: 'Precios y márgenes' }

export default async function PricingPage() {
  const [settings, rows, products, categories] = await Promise.all([
    getSettings(),
    getCategoryMarkupRows(),
    listAdminProducts({ status: 'todos' }),
    getCategories(),
  ])
  const index = buildCategoryIndex(categories)

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
            <PricingSettingsForm defaultMarkupPercent={settings.defaultMarkupPercent} priceRounding={settings.priceRounding} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Margen por categoría</CardTitle>
            <CardDescription>
              Déjalo vacío para heredar. Un margen en un departamento aplica a todas sus subcategorías salvo que tengan uno
              propio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Productos</TableHead>
                  <TableHead>Margen propio</TableHead>
                  <TableHead>Se aplica</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <CategoryMarkupRowView key={row.id} row={row} defaultMarkup={settings.defaultMarkupPercent} />
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
                {products.map((p) => {
                  const inherited = index.inheritedMarkup(p.categoryId)
                  const b = computePrice({
                    mode: p.pricingMode,
                    costPrice: p.costPrice,
                    fixedPrice: p.fixedPrice,
                    productMarkup: p.markupPercent,
                    categoryMarkup: inherited?.percent ?? null,
                    defaultMarkup: settings.defaultMarkupPercent,
                    rounding: settings.priceRounding,
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
          </CardContent>
        </Card>
      </div>
    </>
  )
}
