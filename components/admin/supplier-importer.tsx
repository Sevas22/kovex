'use client'

import { CheckCircle2Icon, DownloadCloudIcon, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  importSupplierAction,
  searchSupplierAction,
  type SupplierPreview,
} from '@/app/admin/actions'
import { ProductImage } from '@/components/store/product-image'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatCOP, formatNumber, formatPercent, plural } from '@/lib/format'
import { computePrice, PRICING_MODE_LABEL, type PricingMode } from '@/lib/pricing'
import { cn } from '@/lib/utils'

const DEPARTMENT_LABEL: Record<string, string> = {
  ferreteria: 'Ferretería',
  agro: 'Agro',
  hogar: 'Hogar',
  maquinaria: 'Maquinaria',
  tecnologia: 'Tecnología',
  electro: 'Electro',
}

interface SearchState {
  query: string
  page: number
  total: number | null
  hasMore: boolean
  items: SupplierPreview[]
}

export function SupplierImporter({
  remaining,
  defaultMarkup,
  priceRounding,
}: {
  remaining: number
  defaultMarkup: number
  priceRounding: number
}) {
  const [query, setQuery] = useState('brochas')
  const [search, setSearch] = useState<SearchState | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [mode, setMode] = useState<PricingMode>('markup')
  const [markup, setMarkup] = useState('')
  const [stock, setStock] = useState('0')
  const [active, setActive] = useState(true)
  const [lastImport, setLastImport] = useState<{ created: number; updated: number } | null>(null)
  const [searching, startSearch] = useTransition()
  const [importing, startImport] = useTransition()

  function runSearch(q: string, page: number) {
    startSearch(async () => {
      const result = await searchSupplierAction(q, page)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      const data = result.data!
      setSearch({ query: q, page, total: data.total, hasMore: data.hasMore, items: data.items })
      setSelected(new Set())
    })
  }

  function runImport() {
    startImport(async () => {
      const result = await importSupplierAction({
        handles: [...selected],
        pricingMode: mode,
        markupPercent: mode === 'markup' && markup !== '' ? Number(markup.replace(',', '.')) : null,
        initialStock: Number(stock) || 0,
        isActive: active,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      const { created, updated } = result.data!
      setLastImport({ created, updated })
      toast.success(`Importación lista: ${plural(created, 'nuevo')}, ${plural(updated, 'actualizado')}`)
      if (search) runSearch(search.query, search.page)
    })
  }

  const toggle = (handle: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(handle)) next.delete(handle)
      else next.add(handle)
      return next
    })
  const newSelected = search?.items.filter((i) => selected.has(i.handle) && !i.alreadyImported).length ?? 0
  const customMarkup = markup === '' ? null : Number(markup.replace(',', '.'))

  function previewPrice(item: SupplierPreview) {
    if (mode === 'quote') return 'A cotizar'
    if (item.costPrice == null) return '—'
    if (mode === 'fixed') return formatCOP(item.costPrice)
    const { price } = computePrice({
      mode: 'markup',
      costPrice: item.costPrice,
      fixedPrice: null,
      productMarkup: customMarkup ?? item.suggestedMarkup,
      categoryMarkup: null,
      defaultMarkup: defaultMarkup,
      rounding: priceRounding,
    })
    return price == null ? '—' : formatCOP(price)
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            runSearch(query, 1)
          }}
        >
          <InputGroup className="h-11 bg-white">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca en Texcomercial: brochas, pintura, licuadora…"
              aria-label="Buscar en Texcomercial"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="submit" variant="default" size="sm" disabled={searching}>
                {searching ? <Spinner /> : null}
                Buscar
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>

        {lastImport ? (
          <Alert>
            <CheckCircle2Icon />
            <AlertTitle>
              {plural(lastImport.created, 'producto nuevo', 'productos nuevos')} y {plural(lastImport.updated, 'actualizado')}
            </AlertTitle>
            <AlertDescription>
              Ya están en el catálogo con su precio calculado.{' '}
              <Link href="/admin/productos" className="font-medium text-brand-blue underline">
                Ver productos
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}

        {searching && !search ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : null}

        {search ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="text-muted-foreground">
                {search.total != null ? `${formatNumber(search.total)} resultados en Texcomercial` : 'Resultados'} · página {search.page}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(new Set(search.items.filter((i) => !i.alreadyImported).map((i) => i.handle)))}
                >
                  Seleccionar los nuevos
                </Button>
                {selected.size ? (
                  <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                    Limpiar
                  </Button>
                ) : null}
              </div>
            </div>

            {search.items.length === 0 ? (
              <Empty className="border border-dashed bg-white">
                <EmptyHeader>
                  <EmptyTitle>Sin resultados</EmptyTitle>
                  <EmptyDescription>Prueba con otra palabra, como la usarías en el buscador de Texcomercial.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul className={cn('grid grid-cols-2 gap-3 md:grid-cols-3', searching && 'opacity-60')}>
                {search.items.map((item) => {
                  const checked = selected.has(item.handle)
                  return (
                    <li key={item.handle}>
                      <div
                        onClick={() => toggle(item.handle)}
                        className={cn(
                          'flex h-full cursor-pointer flex-col overflow-hidden rounded-md border bg-white transition-colors',
                          checked ? 'border-brand-blue ring-2 ring-brand-blue/30' : 'hover:border-brand-steel',
                        )}
                      >
                        <div className="relative aspect-square">
                          <ProductImage src={item.image} alt="" sizes="220px" className="p-4" />
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggle(item.handle)}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-3 left-3 size-5 bg-white"
                            aria-label={`Seleccionar ${item.name}`}
                          />
                          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                            {item.alreadyImported ? <Badge>Ya importado</Badge> : null}
                            {!item.available ? <Badge variant="secondary">Agotado en proveedor</Badge> : null}
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-1 border-t p-3 text-sm">
                          <p className="text-xs font-semibold text-brand-blue">{item.brand}</p>
                          <p className="line-clamp-2 font-medium">{item.name}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {[item.department ? DEPARTMENT_LABEL[item.department] : null, ...item.categoryPath].filter(Boolean).join(' › ')}
                          </p>
                          <dl className="mt-auto grid grid-cols-2 gap-1 pt-2 text-xs">
                            <dt className="text-muted-foreground">Costo</dt>
                            <dd className="text-right tabular">{item.costPrice == null ? '—' : formatCOP(item.costPrice)}</dd>
                            <dt className="text-muted-foreground">
                              {mode === 'markup' ? `Venta (+${formatPercent(customMarkup ?? item.suggestedMarkup)})` : 'Venta'}
                            </dt>
                            <dd className="text-right font-semibold tabular">{previewPrice(item)}</dd>
                          </dl>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="flex justify-center gap-2">
              <Button variant="outline" disabled={search.page <= 1 || searching} onClick={() => runSearch(search.query, search.page - 1)}>
                Anterior
              </Button>
              <Button variant="outline" disabled={!search.hasMore || searching} onClick={() => runSearch(search.query, search.page + 1)}>
                Siguiente página
              </Button>
            </div>
          </>
        ) : null}
      </div>

      <Card className="xl:sticky xl:top-6">
        <CardHeader>
          <CardTitle>Opciones de importación</CardTitle>
          <CardDescription>
            Se crean con la categoría del proveedor. Los que ya existen solo actualizan costo y disponibilidad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>Precio de venta</FieldLabel>
              <ToggleGroup value={[mode]} onValueChange={(v) => v[0] && setMode(v[0] as PricingMode)} variant="outline" className="grid w-full grid-cols-3 items-stretch">
                {(Object.keys(PRICING_MODE_LABEL) as PricingMode[]).map((m) => (
                  <ToggleGroupItem key={m} value={m} className="h-auto min-h-8 px-1.5 py-1.5 text-xs leading-tight whitespace-normal">
                    {PRICING_MODE_LABEL[m]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <FieldDescription>
                {mode === 'markup'
                  ? 'Costo del proveedor + margen.'
                  : mode === 'fixed'
                    ? 'Toma el precio del proveedor como precio de venta fijo; luego puedes editarlo.'
                    : 'Sin precio publicado: el cliente lo cotiza por WhatsApp.'}
              </FieldDescription>
            </Field>
            {mode === 'markup' ? (
              <Field>
                <FieldLabel htmlFor="imp-markup">Margen para estos productos</FieldLabel>
                <InputGroup className="max-w-36">
                  <InputGroupInput
                    id="imp-markup"
                    inputMode="decimal"
                    value={markup}
                    onChange={(e) => setMarkup(e.target.value.replace(/[^\d.,]/g, ''))}
                    placeholder="Heredado"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>%</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>Vacío: usa el margen de la categoría o el general.</FieldDescription>
              </Field>
            ) : null}
            <Field>
              <FieldLabel htmlFor="imp-stock">Stock inicial</FieldLabel>
              <Input id="imp-stock" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ''))} className="max-w-28" />
              <FieldDescription>El proveedor no publica cantidades; ajusta el stock real después.</FieldDescription>
            </Field>
            <Field orientation="horizontal">
              <Switch id="imp-active" checked={active} onCheckedChange={setActive} />
              <FieldLabel htmlFor="imp-active">Publicar en la tienda de inmediato</FieldLabel>
            </Field>
            <Button size="xl" className="chamfer w-full" disabled={selected.size === 0 || importing || newSelected > remaining} onClick={runImport}>
              {importing ? <Spinner data-icon="inline-start" /> : <DownloadCloudIcon data-icon="inline-start" />}
              Importar {selected.size ? plural(selected.size, 'producto') : 'productos'}
            </Button>
            <p className={cn('text-xs', newSelected > remaining ? 'text-destructive' : 'text-muted-foreground')}>
              Te quedan {formatNumber(remaining)} productos disponibles en el plan.
            </p>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
