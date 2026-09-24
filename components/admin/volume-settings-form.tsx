'use client'

import { useState } from 'react'
import { useAdminAction } from './use-action'
import { VolumeTiersField } from './volume-tiers-field'
import { saveVolumeSettingsAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { formatCOP } from '@/lib/format'
import { buildPriceTiers, floorPriceFor, type VolumeTier } from '@/lib/volume-pricing'

/** Escala general por cantidad y margen mínimo, con una simulación en vivo. */
export function VolumeSettingsForm({
  volumeTiers,
  minMarginPercent,
  priceRounding,
}: {
  volumeTiers: VolumeTier[]
  minMarginPercent: number
  priceRounding: number
}) {
  const [tiers, setTiers] = useState<VolumeTier[]>(volumeTiers)
  const [minMargin, setMinMargin] = useState(String(minMarginPercent))
  const [samplePrice, setSamplePrice] = useState('10000')
  const [sampleCost, setSampleCost] = useState('7000')
  const { pending, execute } = useAdminAction()

  const minMarginValue = Number(minMargin.replace(',', '.')) || 0
  const price = Number(samplePrice) || 0
  const cost = Number(sampleCost) || 0
  const preview = buildPriceTiers({
    listPrice: price || null,
    tiers,
    floorPrice: floorPriceFor(cost || null, minMarginValue),
    rounding: priceRounding,
  })
  const floor = floorPriceFor(cost || null, minMarginValue)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-5">
        <VolumeTiersField
          value={tiers}
          onChange={(v) => setTiers(v ?? [])}
          label="Escala general"
          description="Se aplica a todo producto cuya categoría no tenga una escala propia. Cuenta las unidades de cada producto por separado."
        />

        <Field>
          <FieldLabel htmlFor="min-margin">Margen mínimo</FieldLabel>
          <InputGroup className="max-w-40">
            <InputGroupInput
              id="min-margin"
              inputMode="decimal"
              value={minMargin}
              onChange={(e) => setMinMargin(e.target.value.replace(/[^\d.,]/g, ''))}
              className="text-lg font-semibold tabular"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>%</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>
            Ningún descuento puede dejar el precio por debajo del costo más este porcentaje. Con 0 % el tope es el costo.
          </FieldDescription>
        </Field>

        <Button
          size="lg"
          className="self-start"
          disabled={pending}
          onClick={() => execute(() => saveVolumeSettingsAction({ volumeTiers: tiers, minMarginPercent: minMarginValue }))}
        >
          {pending ? <Spinner data-icon="inline-start" /> : null}
          Guardar escala
        </Button>
      </div>

      <div className="rounded-md border bg-brand-mist p-5">
        <p className="text-sm font-semibold">Simulación</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="sample-price">Precio de venta</FieldLabel>
            <InputGroup className="bg-white">
              <InputGroupAddon>
                <InputGroupText>$</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="sample-price"
                inputMode="numeric"
                value={samplePrice}
                onChange={(e) => setSamplePrice(e.target.value.replace(/\D/g, ''))}
                className="tabular"
              />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="sample-cost-v">Costo</FieldLabel>
            <InputGroup className="bg-white">
              <InputGroupAddon>
                <InputGroupText>$</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="sample-cost-v"
                inputMode="numeric"
                value={sampleCost}
                onChange={(e) => setSampleCost(e.target.value.replace(/\D/g, ''))}
                className="tabular"
              />
            </InputGroup>
          </Field>
        </div>

        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground uppercase">
              <th className="py-1 font-medium">Cantidad</th>
              <th className="py-1 text-right font-medium">Precio c/u</th>
              <th className="py-1 text-right font-medium">Ganancia c/u</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="py-1.5">1 unidad</td>
              <td className="py-1.5 text-right tabular">{formatCOP(price)}</td>
              <td className="py-1.5 text-right tabular text-muted-foreground">{formatCOP(price - cost)}</td>
            </tr>
            {preview.map((tier) => (
              <tr key={tier.minQty} className="border-t">
                <td className="py-1.5">desde {tier.minQty}</td>
                <td className="py-1.5 text-right font-semibold tabular text-success">
                  {formatCOP(tier.unitPrice)} <span className="text-xs">−{tier.percent}%</span>
                </td>
                <td className="py-1.5 text-right tabular text-muted-foreground">{formatCOP(tier.unitPrice - cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {tiers.length > preview.length ? (
          <p className="mt-3 text-xs text-warning">
            Con este costo, el margen mínimo recorta {tiers.length - preview.length} escalón(es): el precio no puede bajar
            de {floor == null ? '—' : formatCOP(floor)}.
          </p>
        ) : null}
        <p className="mt-3 text-xs text-muted-foreground">
          El porcentaje efectivo puede variar del configurado: el precio se redondea hacia arriba al múltiplo elegido.
        </p>
        {tiers.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Sin escalones configurados el precio no cambia con la cantidad.
          </p>
        ) : null}
      </div>
    </div>
  )
}
