'use client'

import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { syncSupplierAction } from '@/app/admin/actions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCOP, formatDateTime, formatNumber, plural } from '@/lib/format'
import type { SyncResult } from '@/lib/server/supplier-sync'

export function SupplierSync({ total, stale, lastSync }: { total: number; stale: number; lastSync: Date | null }) {
  const [result, setResult] = useState<SyncResult | null>(null)
  const [pending, startTransition] = useTransition()

  function sync() {
    startTransition(async () => {
      const res = await syncSupplierAction()
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setResult(res.data!)
      toast.success(`Revisados ${formatNumber(res.data!.checked)} productos en Texcomercial`)
    })
  }

  const pendingCount = result?.pending ?? stale

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Actualizar costos del proveedor</CardTitle>
        <CardDescription>
          {formatNumber(total)} productos vienen de Texcomercial ·{' '}
          {pendingCount ? `${plural(pendingCount, 'producto')} sin revisar en las últimas 24 horas` : 'todos revisados en las últimas 24 horas'}
          {lastSync ? ` · última revisión ${formatDateTime(lastSync)}` : ''}. Los precios con margen se recalculan con el costo nuevo.
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="lg" disabled={pending || total === 0} onClick={sync}>
            {pending ? <Spinner data-icon="inline-start" /> : <RefreshCwIcon data-icon="inline-start" />}
            Revisar 60 productos
          </Button>
        </CardAction>
      </CardHeader>
      {result ? (
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {plural(result.checked, 'producto revisado', 'productos revisados')} ·{' '}
            {plural(result.costChanges.length, 'cambio de costo', 'cambios de costo')}
            {result.failed ? ` · ${result.failed} no respondieron (se reintentan en la próxima revisión)` : ''}
          </p>

          {result.belowCost.length ? (
            <Alert variant="destructive">
              <AlertTriangleIcon />
              <AlertTitle>Precio fijo por debajo del costo</AlertTitle>
              <AlertDescription>
                {result.belowCost.map((p) => (
                  <span key={p.id} className="block">
                    <Link href={`/admin/productos/${p.id}`} className="font-medium underline">
                      {p.name}
                    </Link>
                    : vendes a {formatCOP(p.fixedPrice)} y ahora cuesta {formatCOP(p.cost)}.
                  </span>
                ))}
              </AlertDescription>
            </Alert>
          ) : null}

          {result.nowUnavailable.length || result.missing.length ? (
            <Alert>
              <AlertTriangleIcon />
              <AlertTitle>Cambios de disponibilidad en el proveedor</AlertTitle>
              <AlertDescription>
                {[...result.nowUnavailable.map((p) => ({ ...p, note: 'agotado en Texcomercial' })), ...result.missing.map((p) => ({ ...p, note: 'ya no existe en Texcomercial' }))].map((p) => (
                  <span key={p.id} className="block">
                    <Link href={`/admin/productos/${p.id}`} className="font-medium underline">
                      {p.name}
                    </Link>
                    : {p.note}. Tu stock propio no cambia.
                  </span>
                ))}
              </AlertDescription>
            </Alert>
          ) : null}

          {result.costChanges.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Precio de venta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.costChanges.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="whitespace-normal">
                      <Link href={`/admin/productos/${c.id}`} className="font-medium hover:text-brand-blue">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular">
                      {c.oldCost == null ? '—' : formatCOP(c.oldCost)} → <strong>{c.newCost == null ? '—' : formatCOP(c.newCost)}</strong>
                    </TableCell>
                    <TableCell className="text-right tabular">
                      {c.oldPrice == null ? 'A cotizar' : formatCOP(c.oldPrice)} →{' '}
                      <strong>{c.newPrice == null ? 'A cotizar' : formatCOP(c.newPrice)}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  )
}
