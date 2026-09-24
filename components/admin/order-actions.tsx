'use client'

import { BanIcon, CheckCheckIcon, PackageCheckIcon, RepeatIcon, TruckIcon } from 'lucide-react'
import { useState } from 'react'
import { useAdminAction } from './use-action'
import {
  cancelOrderAction,
  confirmOrderAction,
  convertQuoteAction,
  deliverOrderAction,
  shipOrderAction,
} from '@/app/admin/actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import type { OrderKind, OrderStatus, StockState } from '@/lib/types'

interface OrderActionsProps {
  orderId: number
  code: string
  kind: OrderKind
  status: OrderStatus
  stockState: StockState
  hasUnpricedItems: boolean
}

function ConfirmButton({
  label,
  icon: Icon,
  title,
  description,
  confirmLabel,
  variant = 'default',
  onConfirm,
  disabled,
  pending,
}: {
  label: string
  icon: React.ComponentType
  title: string
  description: string
  confirmLabel: string
  variant?: 'default' | 'outline' | 'navy'
  onConfirm: () => void
  disabled?: boolean
  pending: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant={variant} size="lg" disabled={disabled || pending} />}>
        {pending ? <Spinner data-icon="inline-start" /> : <Icon data-icon="inline-start" />}
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setOpen(false)
              onConfirm()
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function OrderActions({ orderId, code, kind, status, stockState, hasUnpricedItems }: OrderActionsProps) {
  const { pending, execute } = useAdminAction()
  const [reason, setReason] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)
  const open = status === 'pending' || status === 'quoted'
  const cancellable = open || status === 'confirmed' || status === 'shipped'

  const cancelEffect =
    stockState === 'reserved'
      ? 'Se liberarán las unidades reservadas para que otros clientes puedan comprarlas.'
      : stockState === 'committed'
        ? 'Las unidades vendidas volverán al inventario.'
        : 'No hay inventario comprometido en este registro.'

  return (
    <div className="flex flex-wrap gap-2">
      {kind === 'quote' && open ? (
        <ConfirmButton
          label="Convertir en pedido"
          icon={RepeatIcon}
          title={`Convertir ${code} en pedido`}
          description="El cliente aceptó la cotización. Se reservarán las unidades con control de inventario hasta que confirmes la venta."
          confirmLabel="Convertir y reservar"
          onConfirm={() => execute(() => convertQuoteAction(orderId))}
          disabled={hasUnpricedItems}
          pending={pending}
        />
      ) : null}

      {kind === 'order' && status === 'pending' ? (
        <ConfirmButton
          label="Confirmar venta"
          icon={CheckCheckIcon}
          title={`Confirmar la venta ${code}`}
          description="Úsalo cuando el cliente haya pagado o aceptado por WhatsApp. Las unidades reservadas se descuentan del inventario de forma definitiva."
          confirmLabel="Confirmar y descontar"
          onConfirm={() => execute(() => confirmOrderAction(orderId))}
          pending={pending}
        />
      ) : null}

      {status === 'confirmed' ? (
        <Button variant="navy" size="lg" disabled={pending} onClick={() => execute(() => shipOrderAction(orderId))}>
          <TruckIcon data-icon="inline-start" />
          Marcar como enviado
        </Button>
      ) : null}

      {status === 'confirmed' || status === 'shipped' ? (
        <Button variant="outline" size="lg" disabled={pending} onClick={() => execute(() => deliverOrderAction(orderId))}>
          <PackageCheckIcon data-icon="inline-start" />
          Marcar como entregado
        </Button>
      ) : null}

      {cancellable ? (
        <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <AlertDialogTrigger render={<Button variant="destructive" size="lg" disabled={pending} />}>
            <BanIcon data-icon="inline-start" />
            Cancelar
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar {code}</AlertDialogTitle>
              <AlertDialogDescription>{cancelEffect}</AlertDialogDescription>
            </AlertDialogHeader>
            <Field>
              <FieldLabel htmlFor="cancel-reason">Motivo (opcional)</FieldLabel>
              <Textarea id="cancel-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
            </Field>
            <AlertDialogFooter>
              <AlertDialogCancel>Volver</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  setCancelOpen(false)
                  execute(() => cancelOrderAction(orderId, reason))
                }}
              >
                Cancelar {kind === 'order' ? 'pedido' : 'cotización'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  )
}
