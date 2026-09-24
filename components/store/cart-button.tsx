'use client'

import { ShoppingBagIcon } from 'lucide-react'
import { CartSheet } from './cart-sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart'
import { cn } from '@/lib/utils'

export function CartButton({ className }: { className?: string }) {
  const { count, ready, setOpen } = useCart()
  return (
    <>
      <Button
        variant="navy"
        size="xl"
        className={cn('chamfer relative px-3 sm:px-5', className)}
        onClick={() => setOpen(true)}
        aria-label={ready && count ? `Mi pedido, ${count} unidades` : 'Mi pedido'}
      >
        <ShoppingBagIcon data-icon="inline-start" />
        <span className="hidden sm:inline">Mi pedido</span>
        {ready && count > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-cyan px-1.5 text-[11px] font-bold text-brand-navy tabular">
            {count > 999 ? '999+' : count}
          </span>
        ) : null}
      </Button>
      <CartSheet />
    </>
  )
}
