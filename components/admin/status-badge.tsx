import { Badge } from '@/components/ui/badge'
import { ORDER_KIND_LABEL, ORDER_STATUS_LABEL, type OrderKind, type OrderStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: 'bg-warning/12 text-warning',
  quoted: 'bg-accent text-accent-foreground',
  confirmed: 'bg-success/12 text-success',
  shipped: 'bg-brand-navy text-white',
  delivered: 'bg-success text-white',
  cancelled: 'bg-muted text-muted-foreground line-through',
}

export function OrderStatusBadge({ status, kind }: { status: OrderStatus; kind?: OrderKind }) {
  const label = status === 'pending' && kind === 'quote' ? 'Por responder' : status === 'pending' ? 'Por confirmar' : ORDER_STATUS_LABEL[status]
  return <Badge className={cn('font-semibold', STATUS_CLASS[status])}>{label}</Badge>
}

export function OrderKindBadge({ kind }: { kind: OrderKind }) {
  return (
    <Badge variant="outline" className={cn(kind === 'order' ? 'border-brand-blue text-brand-blue' : 'text-muted-foreground')}>
      {ORDER_KIND_LABEL[kind]}
    </Badge>
  )
}
