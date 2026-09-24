import Link from 'next/link'
import { OrderKindBadge, OrderStatusBadge } from './status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCOP, formatDateTime } from '@/lib/format'
import type { OrderListItem } from '@/lib/server/order-queries'

export function OrdersTable({ orders }: { orders: OrderListItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((o) => (
          <TableRow key={o.id} className="relative">
            <TableCell className="font-semibold">
              <Link href={`/admin/pedidos/${o.id}`} className="text-brand-blue after:absolute after:inset-0 hover:underline">
                {o.code}
              </Link>
            </TableCell>
            <TableCell>
              <p className="font-medium">{o.customerName}</p>
              <p className="text-xs text-muted-foreground">
                {[o.customerCompany, o.customerCity].filter(Boolean).join(' · ') || `${o.itemCount} productos`}
              </p>
            </TableCell>
            <TableCell>
              <OrderKindBadge kind={o.kind} />
            </TableCell>
            <TableCell>
              <OrderStatusBadge status={o.status} kind={o.kind} />
            </TableCell>
            <TableCell className="text-right tabular">
              {o.subtotal > 0 ? formatCOP(o.subtotal) : '—'}
              {o.hasUnpricedItems ? <p className="text-xs text-muted-foreground">+ por cotizar</p> : null}
            </TableCell>
            <TableCell className="text-right text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
