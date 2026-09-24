'use client'

import { useState } from 'react'
import { PriceBreakdownView } from './price-breakdown'
import { useAdminAction } from './use-action'
import { savePricingSettingsAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { formatCOP } from '@/lib/format'
import { computePrice } from '@/lib/pricing'

const ROUNDING: Record<string, string> = {
  '1': 'Sin redondeo',
  '10': 'A $10',
  '50': 'A $50',
  '100': 'A $100',
  '500': 'A $500',
  '1000': 'A $1.000',
}

export function PricingSettingsForm({ defaultMarkupPercent, priceRounding }: { defaultMarkupPercent: number; priceRounding: number }) {
  const [markup, setMarkup] = useState(String(defaultMarkupPercent))
  const [rounding, setRounding] = useState(String(priceRounding))
  const [sampleCost, setSampleCost] = useState('3604')
  const { pending, execute } = useAdminAction()

  const markupValue = Number(markup.replace(',', '.')) || 0
  const sample = computePrice({
    mode: 'markup',
    costPrice: Number(sampleCost) || 0,
    fixedPrice: null,
    productMarkup: null,
    categoryMarkup: null,
    defaultMarkup: markupValue,
    rounding: Number(rounding),
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="default-markup">Margen general</FieldLabel>
          <InputGroup className="max-w-40">
            <InputGroupInput
              id="default-markup"
              inputMode="decimal"
              value={markup}
              onChange={(e) => setMarkup(e.target.value.replace(/[^\d.,]/g, ''))}
              className="text-lg font-semibold tabular"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>%</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>Se aplica a todo producto cuya categoría no tenga un margen propio.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="rounding">Redondeo del precio de venta</FieldLabel>
          <Select items={ROUNDING} value={rounding} onValueChange={(v) => v && setRounding(String(v))}>
            <SelectTrigger id="rounding" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(ROUNDING).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>Siempre hacia arriba, para no vender por debajo del margen.</FieldDescription>
        </Field>
        <Button
          size="lg"
          className="self-start"
          disabled={pending}
          onClick={() =>
            execute(
              () => savePricingSettingsAction({ defaultMarkupPercent: markupValue, priceRounding: Number(rounding) as 1 }),
            )
          }
        >
          {pending ? <Spinner data-icon="inline-start" /> : null}
          Guardar y recalcular precios
        </Button>
      </FieldGroup>

      <div className="rounded-md border bg-brand-mist p-5">
        <Field>
          <FieldLabel htmlFor="sample-cost">Prueba el cálculo con un costo</FieldLabel>
          <InputGroup className="max-w-48 bg-white">
            <InputGroupAddon>
              <InputGroupText>$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput id="sample-cost" inputMode="numeric" value={sampleCost} onChange={(e) => setSampleCost(e.target.value.replace(/\D/g, ''))} className="tabular" />
          </InputGroup>
        </Field>
        <PriceBreakdownView breakdown={sample} costPrice={Number(sampleCost) || 0} rounding={Number(rounding)} className="mt-4" />
        <p className="mt-3 text-xs text-muted-foreground">
          Ejemplo: un costo de {formatCOP(Number(sampleCost) || 0)} con el margen general.
        </p>
      </div>
    </div>
  )
}
