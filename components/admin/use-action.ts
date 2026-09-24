'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import type { ActionResult } from '@/app/admin/actions'

/** Ejecuta una Server Action del panel y muestra el resultado en un toast. */
export function useAdminAction() {
  const [pending, startTransition] = useTransition()

  function execute<T>(action: () => Promise<ActionResult<T>>, onSuccess?: (data: T | undefined) => void) {
    startTransition(async () => {
      const result = await action()
      if (result.ok) {
        if (result.message) toast.success(result.message)
        onSuccess?.(result.data)
      } else {
        toast.error(result.error)
      }
    })
  }

  return { pending, execute }
}
