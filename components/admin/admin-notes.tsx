'use client'

import { useState } from 'react'
import { useAdminAction } from './use-action'
import { saveOrderNotesAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function AdminNotes({ orderId, initial }: { orderId: number; initial: string | null }) {
  const [value, setValue] = useState(initial ?? '')
  const { pending, execute } = useAdminAction()
  const dirty = value !== (initial ?? '')
  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="Acuerdos de pago, transportadora, guía…"
        aria-label="Notas internas"
      />
      <Button
        variant="outline"
        size="sm"
        className="self-end"
        disabled={!dirty || pending}
        onClick={() => execute(() => saveOrderNotesAction(orderId, value))}
      >
        Guardar notas
      </Button>
    </div>
  )
}
