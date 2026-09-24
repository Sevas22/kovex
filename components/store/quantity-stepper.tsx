'use client'

import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MAX_QUANTITY } from '@/lib/cart'
import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  /** Permite bajar a 0 (para quitar del carrito). */
  allowZero?: boolean
  size?: 'sm' | 'lg'
  label: string
  className?: string
}

export function QuantityStepper({ value, onChange, allowZero, size = 'sm', label, className }: QuantityStepperProps) {
  const min = allowZero ? 0 : 1
  const buttonSize = size === 'lg' ? 'icon-xl' : 'icon-sm'
  return (
    <div className={cn('inline-flex items-center rounded-md border bg-background', className)} role="group" aria-label={label}>
      <Button
        variant="ghost"
        size={buttonSize}
        aria-label="Disminuir cantidad"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <MinusIcon />
      </Button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={MAX_QUANTITY}
        value={value}
        aria-label="Cantidad"
        onChange={(e) => {
          const next = Number(e.target.value)
          if (Number.isFinite(next)) onChange(Math.max(min, Math.min(MAX_QUANTITY, Math.floor(next))))
        }}
        className={cn(
          'w-12 appearance-none bg-transparent text-center font-semibold tabular outline-none [&::-webkit-inner-spin-button]:appearance-none',
          size === 'lg' ? 'text-base' : 'text-sm',
        )}
      />
      <Button
        variant="ghost"
        size={buttonSize}
        aria-label="Aumentar cantidad"
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(Math.min(MAX_QUANTITY, value + 1))}
      >
        <PlusIcon />
      </Button>
    </div>
  )
}
