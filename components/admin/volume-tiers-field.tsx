'use client'

import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldDescription, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { MAX_TIERS, MIN_TIER_QTY, type VolumeTier } from '@/lib/volume-pricing'

/**
 * Editor de una escala por cantidad: «desde N unidades, X % de descuento».
 * value = null significa heredar la escala del nivel superior.
 */
export function VolumeTiersField({
  value,
  onChange,
  label = 'Escala por cantidad',
  inheritedLabel,
  description,
}: {
  value: VolumeTier[] | null
  onChange: (tiers: VolumeTier[] | null) => void
  label?: string
  /** Si se pasa, aparece la opción de heredar (value = null). */
  inheritedLabel?: string
  description?: string
}) {
  const tiers = value ?? []
  const inherits = value == null

  const update = (index: number, patch: Partial<VolumeTier>) => {
    onChange(tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)))
  }

  const add = () => {
    const last = tiers.at(-1)
    onChange([
      ...tiers,
      { minQty: last ? last.minQty * 2 : 12, percent: last ? Math.min(90, last.percent + 2) : 5 },
    ])
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FieldLabel>{label}</FieldLabel>
        {inheritedLabel ? (
          <div className="flex items-center gap-1 text-xs">
            <Button
              type="button"
              size="xs"
              variant={inherits ? 'default' : 'ghost'}
              onClick={() => onChange(null)}
            >
              Heredar
            </Button>
            <Button
              type="button"
              size="xs"
              variant={inherits ? 'ghost' : 'default'}
              onClick={() => onChange(tiers)}
            >
              Escala propia
            </Button>
          </div>
        ) : null}
      </div>

      {inherits ? (
        <p className="rounded-md border border-dashed px-3 py-2.5 text-sm text-muted-foreground">{inheritedLabel}</p>
      ) : (
        <>
          {tiers.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-2.5 text-sm text-muted-foreground">
              Sin escala: el precio no cambia con la cantidad.
            </p>
          ) : null}
          <ul className="flex flex-col gap-2">
            {tiers.map((tier, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-12 text-sm text-muted-foreground">Desde</span>
                <InputGroup className="h-9 w-28">
                  <InputGroupInput
                    inputMode="numeric"
                    aria-label={`Cantidad mínima del escalón ${index + 1}`}
                    value={String(tier.minQty)}
                    onChange={(e) => update(index, { minQty: Number(e.target.value.replace(/\D/g, '')) || MIN_TIER_QTY })}
                    className="tabular"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>u.</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <span className="text-sm text-muted-foreground">descuento</span>
                <InputGroup className="h-9 w-24">
                  <InputGroupInput
                    inputMode="decimal"
                    aria-label={`Descuento del escalón ${index + 1}`}
                    value={String(tier.percent)}
                    onChange={(e) =>
                      update(index, { percent: Number(e.target.value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0 })
                    }
                    className="tabular"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>%</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Quitar el escalón ${index + 1}`}
                  onClick={() => onChange(tiers.filter((_, i) => i !== index))}
                >
                  <Trash2Icon />
                </Button>
              </li>
            ))}
          </ul>
          {tiers.length < MAX_TIERS ? (
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={add}>
              <PlusIcon data-icon="inline-start" />
              Agregar escalón
            </Button>
          ) : null}
        </>
      )}

      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </div>
  )
}
