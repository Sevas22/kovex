'use client'

import { TrendingUpIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAdminAction } from './use-action'
import { bulkMarkupAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { formatPercent } from '@/lib/format'

export interface BulkScope {
  id: number | null
  label: string
  /** Margen que aplica hoy a esa rama. */
  current: number
  productCount: number
  /** Familias de abajo con margen propio, que no heredan. */
  ownCount: number
}

export function BulkMarkupForm({ scopes }: { scopes: BulkScope[] }) {
  const [scopeKey, setScopeKey] = useState('todo')
  const [modo, setModo] = useState<'sumar' | 'fijar'>('sumar')
  const [puntos, setPuntos] = useState('5')
  const [incluirPropios, setIncluirPropios] = useState(false)
  const { pending, execute } = useAdminAction()

  const scope = scopes.find((s) => String(s.id ?? 'todo') === scopeKey) ?? scopes[0]
  const n = Number(puntos.replace(',', '.'))
  const valido = Number.isFinite(n) && (modo === 'sumar' ? n !== 0 : n >= 0)
  const resultado = modo === 'fijar' ? n : scope.current + n

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="bulk-scope">Sobre qué aplicar</FieldLabel>
          <select
            id="bulk-scope"
            value={scopeKey}
            onChange={(e) => setScopeKey(e.target.value)}
            className="h-9 rounded-md border bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {scopes.map((s) => (
              <option key={String(s.id ?? 'todo')} value={String(s.id ?? 'todo')}>
                {s.label} ({s.productCount} productos)
              </option>
            ))}
          </select>
          <FieldDescription>Margen actual: {formatPercent(scope.current)}</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="bulk-puntos">{modo === 'sumar' ? 'Puntos a sumar' : 'Margen fijo'}</FieldLabel>
          <div className="flex gap-2">
            <select
              value={modo}
              onChange={(e) => setModo(e.target.value as 'sumar' | 'fijar')}
              aria-label="Operación"
              className="h-9 rounded-md border bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="sumar">Sumar</option>
              <option value="fijar">Fijar en</option>
            </select>
            <InputGroup className="h-9 w-28 bg-white">
              <InputGroupInput
                id="bulk-puntos"
                inputMode="decimal"
                value={puntos}
                onChange={(e) => setPuntos(e.target.value.replace(/[^\d.,-]/g, ''))}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>%</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <FieldDescription>
            {valido ? `Quedaría en ${formatPercent(Math.max(0, resultado))}.` : 'Escribe cuántos puntos.'}
          </FieldDescription>
        </Field>
      </div>

      {scope.ownCount > 0 ? (
        <Field orientation="horizontal">
          <Checkbox id="bulk-propios" checked={incluirPropios} onCheckedChange={(v) => setIncluirPropios(v === true)} />
          <FieldLabel htmlFor="bulk-propios" className="font-normal">
            Incluir las {scope.ownCount} categorías de abajo que tienen margen propio
          </FieldLabel>
        </Field>
      ) : null}
      <FieldDescription className="-mt-2">
        {scope.ownCount > 0 && !incluirPropios
          ? `Sin marcar, esas ${scope.ownCount} categorías se quedan con el margen que ya tienen.`
          : 'Todo lo que hereda de esta rama sube con ella.'}
      </FieldDescription>

      <Button
        size="lg"
        className="chamfer self-start"
        disabled={pending || !valido}
        onClick={() =>
          execute(
            () =>
              bulkMarkupAction({
                categoryId: scope.id,
                modo,
                puntos: n,
                incluirPropios,
              }),
            (data) => {
              if (data) toast.info(`${data.tocadas} margen(es) ajustados · ${data.changed} precios recalculados`)
            },
          )
        }
      >
        {pending ? <Spinner data-icon="inline-start" /> : <TrendingUpIcon data-icon="inline-start" />}
        Aplicar y recalcular
      </Button>
    </div>
  )
}
