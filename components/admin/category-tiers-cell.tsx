'use client'

import { useState } from 'react'
import { useAdminAction } from './use-action'
import { VolumeTiersField } from './volume-tiers-field'
import { saveCategoryTiersAction } from '@/app/admin/actions'
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
import type { CategoryMarkupRow } from '@/lib/server/admin-categories'
import type { VolumeTier } from '@/lib/volume-pricing'

const summary = (tiers: VolumeTier[]) => tiers.map((t) => `${t.minQty} u. −${t.percent}%`).join(' · ')

/** Botón + diálogo para editar la escala por cantidad de una categoría. */
export function CategoryTiersCell({ row, generalTiers }: { row: CategoryMarkupRow; generalTiers: VolumeTier[] }) {
  const [open, setOpen] = useState(false)
  const [tiers, setTiers] = useState<VolumeTier[] | null>(row.volumeTiers)
  const { pending, execute } = useAdminAction()

  const inherited = row.inheritedTiers?.tiers.length
    ? `Hereda de ${row.inheritedTiers.from}: ${summary(row.inheritedTiers.tiers)}.`
    : generalTiers.length
      ? `Hereda la escala general: ${summary(generalTiers)}.`
      : 'No hay escala general configurada.'

  const label = row.volumeTiers == null ? 'Hereda' : row.volumeTiers.length === 0 ? 'Sin escala' : summary(row.volumeTiers)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="max-w-56 justify-start truncate font-normal" />}>
        {label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Escala por cantidad · {row.name}</DialogTitle>
          <DialogDescription>{inherited}</DialogDescription>
        </DialogHeader>
        <VolumeTiersField
          value={tiers}
          onChange={setTiers}
          label="Escala de la categoría"
          inheritedLabel={inherited}
          description="Aplica a los productos de esta categoría y de sus subcategorías que no tengan escala propia."
        />
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancelar</Button>} />
          <Button
            disabled={pending}
            onClick={() => execute(() => saveCategoryTiersAction(row.id, tiers), () => setOpen(false))}
          >
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
