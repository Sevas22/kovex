'use client'

import { StarIcon } from 'lucide-react'
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
