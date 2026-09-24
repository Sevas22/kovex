import { formatCOP } from '@/lib/format'
import { cn } from '@/lib/utils'

interface PriceProps {
  value: number | null
  unit?: string
  compareAt?: number | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/** Precio de venta o "A cotizar" cuando el producto no tiene precio publicado. */
export function Price({ value, unit, compareAt, size = 'md', className }: PriceProps) {
  if (value == null) {
    return (
      <div className={cn('flex flex-col', className)}>
        <span
          className={cn(
            'chamfer chamfer-sm w-fit bg-brand-navy px-2 py-0.5 font-semibold text-white',
            size === 'lg' ? 'text-base' : 'text-xs',
          )}
        >
          Precio a cotizar
        </span>
        {size === 'lg' ? null : <span className="mt-1 text-[11px] text-muted-foreground">Te lo enviamos por WhatsApp</span>}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {compareAt && compareAt > value ? (
        <span className="text-xs text-muted-foreground line-through tabular">{formatCOP(compareAt)}</span>
      ) : null}
      <span
        className={cn(
          'font-bold leading-none text-brand-navy tabular',
          size === 'sm' && 'text-base',
          size === 'md' && 'text-lg',
          size === 'lg' && 'text-3xl md:text-4xl',
        )}
      >
        {formatCOP(value)}
      </span>
      {unit ? <span className="mt-1 text-[11px] text-muted-foreground">por {unit.toLowerCase()} · IVA incluido</span> : null}
    </div>
  )
}
