'use client'

import { SaveIcon } from 'lucide-react'
import { useState } from 'react'
import { useAdminAction } from './use-action'
import { quoteOrderAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCOP } from '@/lib/format'

interface Line {
  id: number
  name: string
  sku: string | null
  unit: string
  quantity: number
  unitPrice: number | null
  /** Precio sugerido: precio de venta actual del producto o costo + margen. */
  suggested: number | null
}

/** Tabla editable para asignar precios a una cotización. */
export function QuotePricer({ orderId, lines }: { orderId: number; lines: Line[] }) {
  const { pending, execute } = useAdminAction()
  const [prices, setPrices] = useState<Record<number, string>>(() =>
    Object.fromEntries(lines.map((l) => [l.id, String(l.unitPrice ?? l.suggested ?? '')])),
  )
  const parsed = lines.map((l) => {
    const raw = prices[l.id]?.replace(/\D/g, '') ?? ''
    return { ...l, value: raw === '' ? null : Number(raw) }
  })
  const total = parsed.reduce((s, l) => s + (l.value ?? 0) * l.quantity, 0)
  const missing = parsed.filter((l) => l.value == null).length

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Cant.</TableHead>
            <TableHead className="w-44">Precio unitario</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parsed.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="whitespace-normal">
                <p className="font-medium">{l.name}</p>
                <p className="text-xs text-muted-foreground">
                  {l.sku ? `Ref. ${l.sku}` : null}
                  {l.suggested != null ? ` · sugerido ${formatCOP(l.suggested)}` : ''}
                </p>
              </TableCell>
              <TableCell className="text-right tabular">{l.quantity}</TableCell>
              <TableCell>
                <InputGroup className="h-9 bg-white">
                  <InputGroupAddon>
                    <InputGroupText>$</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    inputMode="numeric"
                    value={prices[l.id] ?? ''}
                    onChange={(e) => setPrices((p) => ({ ...p, [l.id]: e.target.value.replace(/\D/g, '') }))}
                    aria-label={`Precio unitario de ${l.name}`}
                    placeholder="Sin precio"
                    className="tabular"
                  />
                </InputGroup>
              </TableCell>
              <TableCell className="text-right font-medium tabular">
                {l.value == null ? '—' : formatCOP(l.value * l.quantity)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total cotizado{missing ? ` (faltan ${missing} precios)` : ''}</TableCell>
            <TableCell className="text-right text-base font-bold tabular">{formatCOP(total)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={pending}
          onClick={() =>
            execute(() =>
              quoteOrderAction(
                orderId,
                parsed.map((l) => ({ itemId: l.id, unitPrice: l.value })),
              ),
            )
          }
        >
          {pending ? <Spinner data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
          Guardar precios de la cotización
        </Button>
      </div>
    </div>
  )
}
