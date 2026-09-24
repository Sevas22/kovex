import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'
import type { MovementView } from '@/lib/server/order-queries'
import { MOVEMENT_LABEL } from '@/lib/types'
import { cn } from '@/lib/utils'

function Delta({ value }: { value: number }) {
  if (!value) return <span className="text-muted-foreground">—</span>
  return <span className={cn('font-semibold', value > 0 ? 'text-success' : 'text-destructive')}>{value > 0 ? `+${value}` : value}</span>
}

export function MovementsTable({ movements, showProduct }: { movements: MovementView[]; showProduct?: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          {showProduct ? <TableHead>Producto</TableHead> : null}
          <TableHead>Movimiento</TableHead>
          <TableHead className="text-right">Stock</TableHead>
          <TableHead className="text-right">Reservado</TableHead>
          <TableHead className="text-right">Disponible</TableHead>
          <TableHead>Detalle</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((m) => (
          <TableRow key={m.id}>
            <TableCell className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</TableCell>
            {showProduct ? (
              <TableCell className="max-w-64 whitespace-normal">
                <Link href={`/admin/productos/${m.productId}`} className="line-clamp-1 font-medium hover:text-brand-blue">
                  {m.productName}
                </Link>
              </TableCell>
            ) : null}
            <TableCell className="font-medium">{MOVEMENT_LABEL[m.kind]}</TableCell>
            <TableCell className="text-right tabular">
              <Delta value={m.stockDelta} /> <span className="text-muted-foreground">→ {m.stockAfter}</span>
            </TableCell>
            <TableCell className="text-right tabular">
              <Delta value={m.reservedDelta} /> <span className="text-muted-foreground">→ {m.reservedAfter}</span>
            </TableCell>
            <TableCell className="text-right font-semibold tabular">{m.stockAfter - m.reservedAfter}</TableCell>
            <TableCell className="max-w-64 text-xs whitespace-normal text-muted-foreground">
              {m.orderCode && m.orderId ? (
                <Link href={`/admin/pedidos/${m.orderId}`} className="font-medium text-brand-blue hover:underline">
                  {m.orderCode}
                </Link>
              ) : null}
              {m.note ? `${m.orderCode ? ' · ' : ''}${m.note}` : null}
              {m.actor ? ` · ${m.actor}` : m.orderCode ? ' · cliente' : ''}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
