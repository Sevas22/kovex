'use client'

import { ArrowDownToLineIcon, SlidersHorizontalIcon } from 'lucide-react'
import { useState } from 'react'
import { useAdminAction } from './use-action'
import { adjustStockAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type Mode = 'add' | 'remove' | 'set'

const MODES: Record<Mode, { label: string; help: string }> = {
  add: { label: 'Entrada', help: 'Llegó mercancía del proveedor: suma al stock.' },
  remove: { label: 'Salida', help: 'Daño, pérdida o uso interno: resta del stock.' },
  set: { label: 'Conteo', help: 'Después de contar la bodega: fija el stock exacto.' },
}

export function StockAdjuster({ productId, stock, reserved }: { productId: number; stock: number; reserved: number }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('add')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const { pending, execute } = useAdminAction()

  const qty = Number(quantity || 0)
  const next = mode === 'add' ? stock + qty : mode === 'remove' ? stock - qty : qty

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          setQuantity('')
          setNote('')
        }
      }}
    >
      <DialogTrigger render={<Button size="lg" />}>
        <ArrowDownToLineIcon data-icon="inline-start" />
        Ajustar inventario
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar inventario</DialogTitle>
          <DialogDescription>
            Stock actual: {stock} · reservadas en pedidos: {reserved}. Cada ajuste queda registrado en el kardex.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-4">
          <ToggleGroup value={[mode]} onValueChange={(v) => v[0] && setMode(v[0] as Mode)} variant="outline" className="grid w-full grid-cols-3">
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <ToggleGroupItem key={m} value={m}>
                {MODES[m].label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Field>
            <FieldLabel htmlFor="adj-qty">{mode === 'set' ? 'Stock contado' : 'Cantidad'}</FieldLabel>
            <Input id="adj-qty" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))} autoFocus />
            <FieldDescription>
              {MODES[mode].help} Quedaría en <strong className="tabular">{Math.max(next, 0)}</strong>
              {next < reserved ? ' — menos que lo reservado, no se permite.' : '.'}
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="adj-note">Nota</FieldLabel>
            <Input id="adj-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Factura del proveedor, motivo…" />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button
            disabled={pending || quantity === '' || next < reserved || next < 0}
            onClick={() =>
              execute(() => adjustStockAction({ productId, mode, quantity: qty, note }), () => setOpen(false))
            }
          >
            {pending ? <Spinner data-icon="inline-start" /> : <SlidersHorizontalIcon data-icon="inline-start" />}
            Guardar ajuste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
