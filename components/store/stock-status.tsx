import { stockLevel, type ProductSummary } from '@/lib/types'
import { cn } from '@/lib/utils'

const DOT = {
  in: 'bg-success',
  low: 'bg-warning',
  out: 'bg-destructive',
  untracked: 'bg-brand-steel',
} as const

export function stockLabel(p: Pick<ProductSummary, 'available' | 'lowStockThreshold'>): string {
  const level = stockLevel(p)
  if (level === 'untracked') return 'Disponible bajo pedido'
  if (level === 'out') return 'Agotado · puedes cotizarlo'
  if (level === 'low') return p.available === 1 ? 'Última unidad' : `Últimas ${p.available} unidades`
  return 'En stock'
}

export function StockStatus({
  product,
  className,
}: {
  product: Pick<ProductSummary, 'available' | 'lowStockThreshold'>
  className?: string
}) {
  const level = stockLevel(product)
  return (
    <p className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
      <span className={cn('size-2 shrink-0 rounded-full', DOT[level])} aria-hidden="true" />
      {stockLabel(product)}
    </p>
  )
}
