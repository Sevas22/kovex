'use client'

import { PlusIcon, SaveIcon, Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PriceBreakdownView } from './price-breakdown'
import { VolumeTiersField } from './volume-tiers-field'
import { useAdminAction } from './use-action'
import { saveProductAction, type ProductFormInput } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatCOP, formatPercent } from '@/lib/format'
import { computePrice, PRICING_MODE_LABEL, type PricingMode } from '@/lib/pricing'
import type { AdminProductDetail } from '@/lib/server/admin-products'
import type { CategoryOption } from '@/lib/server/admin-categories'
import { buildPriceTiers, floorPriceFor, type VolumeTier } from '@/lib/volume-pricing'

interface ProductFormProps {
  product: AdminProductDetail | null
  categories: CategoryOption[]
  pricing: { defaultMarkupPercent: number; priceRounding: number; volumeTiers: VolumeTier[]; minMarginPercent: number }
}

const toText = (n: number | null | undefined) => (n == null ? '' : String(n))
const toInt = (s: string) => (s.trim() === '' ? null : Number(s.replace(/\D/g, '')))
const toDecimal = (s: string) => (s.trim() === '' ? null : Number(s.replace(',', '.')))

export function ProductForm({ product, categories, pricing }: ProductFormProps) {
  const router = useRouter()
  const { pending, execute } = useAdminAction()

  const [name, setName] = useState(product?.name ?? '')
  const [sku, setSku] = useState(product?.sku ?? '')
  const [brand, setBrand] = useState(product?.brand ?? '')
  const [categoryId, setCategoryId] = useState<string>(product?.categoryId ? String(product.categoryId) : '')
  const [unit, setUnit] = useState(product?.unit ?? 'Unidad')
  const [description, setDescription] = useState(product?.description ?? '')
  const [images, setImages] = useState((product?.images ?? []).join('\n'))
  const [specs, setSpecs] = useState(product?.specs ?? [])
  const [mode, setMode] = useState<PricingMode>(product?.pricingMode ?? 'markup')
  const [cost, setCost] = useState(toText(product?.costPrice))
  const [markup, setMarkup] = useState(toText(product?.markupPercent))
  const [fixed, setFixed] = useState(toText(product?.fixedPrice))
  const [compareAt, setCompareAt] = useState(toText(product?.compareAtPrice))
  const [taxRate, setTaxRate] = useState(toText(product?.taxRate ?? 19))
  const [trackInventory, setTrackInventory] = useState(product?.trackInventory ?? true)
  const [lowStock, setLowStock] = useState(toText(product?.ownLowStockThreshold))
  const [initialStock, setInitialStock] = useState('')
  const [isActive, setIsActive] = useState(product?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false)
  const [tiers, setTiers] = useState<VolumeTier[] | null>(product?.volumeTiers ?? null)

  const category = categories.find((c) => String(c.id) === categoryId)
  const breakdown = computePrice({
    mode,
    costPrice: toInt(cost),
    fixedPrice: toInt(fixed),
    productMarkup: toDecimal(markup),
    categoryMarkup: category?.inherited?.percent ?? null,
    defaultMarkup: pricing.defaultMarkupPercent,
    rounding: pricing.priceRounding,
  })
  const inheritedHint = category?.inherited
    ? `Si lo dejas vacío usa ${formatPercent(category.inherited.percent)} de ${category.inherited.from}.`
    : `Si lo dejas vacío usa el margen general (${formatPercent(pricing.defaultMarkupPercent)}).`
  const tiersHint = category?.inheritedTiers?.tiers.length
    ? `Hereda la escala de ${category.inheritedTiers.from} (${category.inheritedTiers.tiers.map((t) => `${t.minQty} u. −${t.percent}%`).join(", ")}).`
    : pricing.volumeTiers.length
      ? `Hereda la escala general (${pricing.volumeTiers.map((t) => `${t.minQty} u. −${t.percent}%`).join(", ")}).`
      : "No hay escala general configurada: el precio no cambia con la cantidad."
  const previewTiers = buildPriceTiers({
    listPrice: breakdown.price,
    tiers: tiers ?? [],
    floorPrice: floorPriceFor(toInt(cost), pricing.minMarginPercent),
    rounding: pricing.priceRounding,
  })
  const imageList = images.split('\n').map((s) => s.trim()).filter(Boolean)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const input: ProductFormInput = {
      name,
      sku,
      brand: brand.trim() || null,
      categoryId: categoryId ? Number(categoryId) : null,
      unit: unit.trim() || 'Unidad',
      description: description.trim() || null,
      images: imageList,
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      pricingMode: mode,
      costPrice: toInt(cost),
      markupPercent: mode === 'markup' ? toDecimal(markup) : null,
      fixedPrice: mode === 'fixed' ? toInt(fixed) : null,
      compareAtPrice: toInt(compareAt),
      taxRate: toDecimal(taxRate) ?? 19,
      trackInventory,
      lowStockThreshold: toInt(lowStock),
      volumeTiers: tiers,
      isActive,
      isFeatured,
    }
    execute(
      () => saveProductAction(product?.id ?? null, input, product ? undefined : (toInt(initialStock) ?? 0)),
      (newId) => {
        if (!product && typeof newId === 'number') router.push(`/admin/productos/${newId}`)
      },
    )
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="p-name">Nombre</FieldLabel>
                <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="p-sku">Referencia (SKU)</FieldLabel>
                  <Input id="p-sku" value={sku} onChange={(e) => setSku(e.target.value)} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="p-brand">Marca</FieldLabel>
                  <Input id="p-brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="p-unit">Presentación</FieldLabel>
                  <Input id="p-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unidad, Caja x12, Galón…" />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="p-category">Categoría</FieldLabel>
                <Select
                  items={Object.fromEntries(categories.map((c) => [String(c.id), c.label]))}
                  value={categoryId || null}
                  onValueChange={(v) => setCategoryId(v ? String(v) : '')}
                >
                  <SelectTrigger id="p-category" className="w-full">
                    <SelectValue placeholder="Sin categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          <span style={{ paddingLeft: c.depth * 12 }}>{c.label.split(' / ').at(-1)}</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="p-desc">Descripción</FieldLabel>
                <Textarea id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </Field>
              <Field>
                <FieldLabel htmlFor="p-images">Imágenes</FieldLabel>
                <Textarea
                  id="p-images"
                  value={images}
                  onChange={(e) => setImages(e.target.value)}
                  rows={3}
                  placeholder="https://… (una URL por línea; la primera es la principal)"
                  className="font-mono text-xs"
                />
                {imageList.length ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {imageList.slice(0, 6).map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt="" className="size-16 rounded-sm border bg-white object-contain p-1" />
                    ))}
                  </div>
                ) : null}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Especificaciones</CardTitle>
            <CardDescription>Se muestran en la ficha del producto.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {specs.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
                <Input
                  value={s.label}
                  onChange={(e) => setSpecs((all) => all.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  placeholder="Característica"
                  aria-label={`Característica ${i + 1}`}
                />
                <Input
                  value={s.value}
                  onChange={(e) => setSpecs((all) => all.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                  placeholder="Valor"
                  aria-label={`Valor ${i + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar especificación"
                  onClick={() => setSpecs((all) => all.filter((_, j) => j !== i))}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setSpecs((all) => [...all, { label: '', value: '' }])}
            >
              <PlusIcon data-icon="inline-start" />
              Agregar especificación
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Precio</CardTitle>
            <CardDescription>El precio de venta se calcula solo y se actualiza si cambias los márgenes.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ToggleGroup
              value={[mode]}
              onValueChange={(v) => v[0] && setMode(v[0] as PricingMode)}
              variant="outline"
              className="grid w-full grid-cols-3 items-stretch"
            >
              {(Object.keys(PRICING_MODE_LABEL) as PricingMode[]).map((m) => (
                <ToggleGroupItem key={m} value={m} className="h-auto min-h-8 px-1.5 py-1.5 text-xs leading-tight whitespace-normal">
                  {PRICING_MODE_LABEL[m]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="p-cost">Costo del proveedor</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>$</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput id="p-cost" inputMode="numeric" value={cost} onChange={(e) => setCost(e.target.value.replace(/\D/g, ''))} className="tabular" />
                </InputGroup>
              </Field>
              {mode === 'markup' ? (
                <Field>
                  <FieldLabel htmlFor="p-markup">Margen propio de este producto</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="p-markup"
                      inputMode="decimal"
                      value={markup}
                      onChange={(e) => setMarkup(e.target.value.replace(/[^\d.,]/g, ''))}
                      placeholder="Heredado"
                      className="tabular"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>%</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>{inheritedHint}</FieldDescription>
                </Field>
              ) : null}
              {mode === 'fixed' ? (
                <Field>
                  <FieldLabel htmlFor="p-fixed">Precio de venta</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>$</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput id="p-fixed" inputMode="numeric" value={fixed} onChange={(e) => setFixed(e.target.value.replace(/\D/g, ''))} className="tabular" />
                  </InputGroup>
                </Field>
              ) : null}
            </FieldGroup>

            <div className="rounded-md bg-brand-mist p-4">
              <PriceBreakdownView breakdown={breakdown} costPrice={toInt(cost)} rounding={pricing.priceRounding} />
            </div>

            <div className="rounded-md border p-4">
              <VolumeTiersField
                value={tiers}
                onChange={setTiers}
                inheritedLabel={tiersHint}
                description="Descuento sobre el precio de venta según las unidades de este producto. Nunca baja del costo más el margen mínimo."
              />
              {breakdown.price != null && tiers?.length ? (
                <ul className="mt-4 flex flex-wrap gap-2 text-xs">
                  {previewTiers.map((t) => (
                    <li key={t.minQty} className="rounded-full bg-success/10 px-2.5 py-1 font-semibold text-success tabular">
                      desde {t.minQty} u. · {formatCOP(t.unitPrice)} (−{t.percent}%)
                    </li>
                  ))}
                  {previewTiers.length === 0 ? (
                    <li className="text-muted-foreground">El margen mínimo no deja aplicar ningún descuento.</li>
                  ) : null}
                </ul>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="p-compare">Precio antes (opcional)</FieldLabel>
                <Input id="p-compare" inputMode="numeric" value={compareAt} onChange={(e) => setCompareAt(e.target.value.replace(/\D/g, ''))} className="tabular" />
              </Field>
              <Field>
                <FieldLabel htmlFor="p-tax">IVA %</FieldLabel>
                <Input id="p-tax" inputMode="decimal" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="tabular" />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventario y visibilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field orientation="horizontal">
                <Switch id="p-track" checked={trackInventory} onCheckedChange={setTrackInventory} />
                <FieldLabel htmlFor="p-track">Controlar inventario</FieldLabel>
              </Field>
              {!trackInventory ? (
                <FieldDescription className="-mt-2">Se muestra como “disponible bajo pedido” y no se reservan unidades.</FieldDescription>
              ) : null}
              {!product && trackInventory ? (
                <Field>
                  <FieldLabel htmlFor="p-stock">Stock inicial</FieldLabel>
                  <Input id="p-stock" inputMode="numeric" value={initialStock} onChange={(e) => setInitialStock(e.target.value.replace(/\D/g, ''))} placeholder="0" />
                </Field>
              ) : null}
              {trackInventory ? (
                <Field>
                  <FieldLabel htmlFor="p-low">Alerta de stock bajo</FieldLabel>
                  <Input id="p-low" inputMode="numeric" value={lowStock} onChange={(e) => setLowStock(e.target.value.replace(/\D/g, ''))} placeholder="Usa el valor general" />
                </Field>
              ) : null}
              <Field orientation="horizontal">
                <Switch id="p-active" checked={isActive} onCheckedChange={setIsActive} />
                <FieldLabel htmlFor="p-active">Visible en la tienda</FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Switch id="p-featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                <FieldLabel htmlFor="p-featured">Destacado en el inicio</FieldLabel>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Button type="submit" size="xl" className="chamfer sticky bottom-4" disabled={pending}>
          {pending ? <Spinner data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
          {product ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}
