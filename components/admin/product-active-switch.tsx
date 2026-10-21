'use client'

import { EyeIcon, EyeOffIcon, StarIcon } from 'lucide-react'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { setProductFlagsAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export function ProductActiveSwitch({ id, name, isActive }: { id: number; name: string; isActive: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(isActive)
  const [, startTransition] = useTransition()
  return (
    <Switch
      checked={optimistic}
      aria-label={`${name} visible en la tienda`}
      onCheckedChange={(value) =>
        startTransition(async () => {
          setOptimistic(value)
          const result = await setProductFlagsAction(id, { isActive: value })
          if (!result.ok) toast.error(result.error)
        })
      }
    />
  )
}

export function ProductFeaturedToggle({ id, name, isFeatured }: { id: number; name: string; isFeatured: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(isFeatured)
  const [, startTransition] = useTransition()
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-pressed={optimistic}
      aria-label={`${name} destacado en el inicio`}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic)
          const result = await setProductFlagsAction(id, { isFeatured: !optimistic })
          if (!result.ok) toast.error(result.error)
        })
      }
    >
      <StarIcon className={cn(optimistic ? 'fill-brand-blue text-brand-blue' : 'text-muted-foreground')} />
    </Button>
  )
}

/** Publica u oculta el precio de un producto suelto, sin tocar su margen. */
export function ProductPriceToggle({ id, name, showPrice }: { id: number; name: string; showPrice: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(showPrice)
  const [, startTransition] = useTransition()
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-pressed={optimistic}
      aria-label={`${name}: ${optimistic ? 'precio publicado' : 'precio oculto'}`}
      title={optimistic ? 'Precio publicado · clic para ocultarlo' : 'Precio oculto · clic para publicarlo'}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic)
          const result = await setProductFlagsAction(id, { showPrice: !optimistic })
          if (!result.ok) toast.error(result.error)
        })
      }
    >
      {optimistic ? (
        <EyeIcon className="text-muted-foreground" />
      ) : (
        <EyeOffIcon className="text-warning" />
      )}
    </Button>
  )
}
