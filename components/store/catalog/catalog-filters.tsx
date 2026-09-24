'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { buildCatalogQuery, parseCatalogParams, type CatalogParams } from '@/lib/catalog-params'
import { cn } from '@/lib/utils'

export function CatalogFilters({ brands }: { brands: { name: string; count: number }[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const current = parseCatalogParams(Object.fromEntries(searchParams.entries()))
  current.brands = searchParams.getAll('marca')

  function update(patch: Partial<CatalogParams>) {
    const next = { ...current, ...patch, page: 1 }
    startTransition(() => router.replace(`${pathname}${buildCatalogQuery(next)}`, { scroll: false }))
  }

  const hasFilters = current.brands.length > 0 || current.inStock || current.price

  return (
    <div className={cn('flex flex-col gap-7 transition-opacity', pending && 'opacity-60')}>
      <FieldGroup>
        <Field orientation="horizontal">
          <Switch id="solo-stock" checked={current.inStock} onCheckedChange={(checked) => update({ inStock: checked })} />
          <FieldLabel htmlFor="solo-stock">Solo con unidades disponibles</FieldLabel>
        </Field>
      </FieldGroup>

      <FieldSet>
        <FieldLegend variant="label">Precio</FieldLegend>
        <RadioGroup
          value={current.price ?? 'todos'}
          onValueChange={(value) => update({ price: value === 'todos' ? undefined : (value as CatalogParams['price']) })}
        >
          {[
            ['todos', 'Todos'],
            ['con-precio', 'Con precio publicado'],
            ['a-cotizar', 'A cotizar'],
          ].map(([value, label]) => (
            <Field key={value} orientation="horizontal">
              <RadioGroupItem value={value} id={`precio-${value}`} />
              <FieldLabel htmlFor={`precio-${value}`} className="font-normal">
                {label}
              </FieldLabel>
            </Field>
          ))}
        </RadioGroup>
      </FieldSet>

      {brands.length ? (
        <FieldSet>
          <FieldLegend variant="label">Marca</FieldLegend>
          <FieldGroup className="gap-3">
            {brands.map((b) => {
              const id = `marca-${b.name}`
              const checked = current.brands.includes(b.name)
              return (
                <Field key={b.name} orientation="horizontal">
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(on) =>
                      update({ brands: on ? [...current.brands, b.name] : current.brands.filter((x) => x !== b.name) })
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={id} className="w-full justify-between font-normal">
                      {b.name}
                      <span className="text-xs text-muted-foreground tabular">{b.count}</span>
                    </FieldLabel>
                  </FieldContent>
                </Field>
              )
            })}
          </FieldGroup>
        </FieldSet>
      ) : null}

      {hasFilters ? (
        <Button variant="outline" onClick={() => update({ brands: [], inStock: false, price: undefined })}>
          Quitar filtros
        </Button>
      ) : null}
    </div>
  )
}
