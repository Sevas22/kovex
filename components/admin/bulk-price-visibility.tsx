'use client'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAdminAction } from './use-action'
import { bulkShowPriceAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { formatNumber } from '@/lib/format'

/**
 * Publica u oculta los precios en bloque.
 *
 * Actúa sobre lo que el usuario está viendo: si filtró por categoría o buscó
 * algo, toca solo eso; sin filtro, todo el catálogo. Por eso el diálogo dice
 * siempre cuántos productos van a cambiar antes de confirmar.
 */
export function BulkPriceVisibility({
  total,
  filtrado,
  alcance,
}: {
  total: number
  /** true si hay búsqueda o categoría activa. */
  filtrado: boolean
  alcance: { q?: string; category?: number }
}) {
  const [abierto, setAbierto] = useState<'ocultar' | 'publicar' | null>(null)
  const { pending, execute } = useAdminAction()

  const ocultar = abierto === 'ocultar'
  const ambito = filtrado ? `los ${formatNumber(total)} productos de esta vista` : `los ${formatNumber(total)} productos del catálogo`

  function aplicar() {
    execute(
      () => bulkShowPriceAction({ showPrice: !ocultar, alcance }),
      (data) => {
        if (data) toast.info(`${formatNumber(data.changed)} producto(s) cambiaron`)
        setAbierto(null)
      },
    )
  }

  return (
    <Dialog open={abierto !== null} onOpenChange={(v) => !v && setAbierto(null)}>
      <Button variant="outline" size="lg" onClick={() => setAbierto('ocultar')}>
        <EyeOffIcon data-icon="inline-start" />
        Ocultar precios
      </Button>
      <Button variant="outline" size="lg" onClick={() => setAbierto('publicar')}>
        <EyeIcon data-icon="inline-start" />
        Publicar precios
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ocultar ? 'Ocultar los precios' : 'Publicar los precios'}</DialogTitle>
          <DialogDescription>
            {ocultar ? (
              <>
                Se van a ocultar los precios de <strong>{ambito}</strong>. En la tienda aparecen como «a cotizar» y el
                cliente los pide por WhatsApp. No se pierde nada: el margen y el modo de precio de cada producto quedan
                como están, y al volver a publicarlos reaparecen igual.
              </>
            ) : (
              <>
                Se van a publicar los precios de <strong>{ambito}</strong>. Cada producto vuelve a mostrar el precio que
                le corresponde según su margen.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancelar</DialogClose>
          <Button onClick={aplicar} disabled={pending} variant={ocultar ? 'destructive' : 'default'}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {ocultar ? 'Ocultar' : 'Publicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
