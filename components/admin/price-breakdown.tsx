import { formatCOP, formatPercent } from '@/lib/format'
import { MARKUP_SOURCE_LABEL, type PriceBreakdown } from '@/lib/pricing'
import { cn } from '@/lib/utils'

/** Explica paso a paso cómo se llegó al precio de venta. */
export function PriceBreakdownView({
  breakdown,
  costPrice,
  rounding,
  className,
}: {
  breakdown: PriceBreakdown
  costPrice: number | null
  rounding: number
  className?: string
}) {
  if (breakdown.missing === 'quote') {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        No se publica precio: el cliente lo agrega a su lista y lo cotizas por WhatsApp.
      </p>
    )
  }
  if (breakdown.missing) {
    return (
      <p className={cn('text-sm text-warning', className)}>
        {breakdown.missing === 'no-cost' ? 'Escribe el costo del proveedor para calcular el precio.' : 'Escribe el precio de venta.'}
      </p>
    )
  }
  if (breakdown.markupPercent == null) {
    return (
      <div className={cn('flex items-baseline justify-between gap-4', className)}>
        <span className="text-sm text-muted-foreground">Precio de venta fijo</span>
        <span className="text-2xl font-bold text-brand-navy tabular">{formatCOP(breakdown.price!)}</span>
      </div>
    )
  }

  const netCost = breakdown.netCost ?? costPrice ?? 0
  const costWithTax = costPrice ?? 0
  const margen = (breakdown.netPrice ?? 0) - netCost
  return (
    <dl className={cn('grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-sm', className)}>
      <dt className="text-muted-foreground">Costo del proveedor</dt>
      <dd className="text-right tabular">{formatCOP(costWithTax)}</dd>
      {/* Si el costo venía con IVA, se muestra la base: el margen se calcula ahí */}
      {netCost !== costWithTax ? (
        <>
          <dt className="text-muted-foreground">Costo sin IVA (base)</dt>
          <dd className="text-right tabular">{formatCOP(netCost)}</dd>
        </>
      ) : null}
      <dt className="text-muted-foreground">
        + {formatPercent(breakdown.markupPercent)} ({MARKUP_SOURCE_LABEL[breakdown.markupSource!]})
      </dt>
      <dd className="text-right tabular">{formatCOP(Math.round(margen))}</dd>
      <dt className="text-muted-foreground">Precio sin IVA</dt>
      <dd className="text-right tabular">{formatCOP(breakdown.netPrice ?? 0)}</dd>
      <dt className="text-muted-foreground">+ IVA</dt>
      <dd className="text-right tabular">{formatCOP(breakdown.taxAmount ?? 0)}</dd>
      {rounding > 1 ? (
        <>
          <dt className="text-xs text-muted-foreground">Redondeado hacia arriba a {formatCOP(rounding)}</dt>
          <dd className="text-right text-xs text-muted-foreground tabular">
            desde {formatCOP(Math.round(breakdown.beforeRounding ?? 0))}
          </dd>
        </>
      ) : null}
      <dt className="border-t pt-2 font-semibold">Precio al público (IVA incluido)</dt>
      <dd className="border-t pt-2 text-right text-xl font-bold text-brand-navy tabular">{formatCOP(breakdown.price!)}</dd>
      <dt className="text-xs text-muted-foreground">
        Ganancia por unidad <span className="text-muted-foreground/70">(sin IVA: el impuesto no es ganancia)</span>
      </dt>
      <dd className="text-right text-xs font-semibold text-success tabular">{formatCOP(breakdown.profit ?? 0)}</dd>
    </dl>
  )
}
