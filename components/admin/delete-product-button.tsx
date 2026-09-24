'use client'

import { Trash2Icon } from 'lucide-react'
import { useAdminAction } from './use-action'
import { deleteProductAction } from '@/app/admin/actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const { pending, execute } = useAdminAction()
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="lg" disabled={pending} />}>
        <Trash2Icon data-icon="inline-start" />
        Eliminar
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar “{name}”</AlertDialogTitle>
          <AlertDialogDescription>
            Se borra del catálogo junto con su kardex. Los pedidos anteriores conservan el nombre y el precio con que se
            vendió. Si solo quieres dejar de mostrarlo, desactiva “Visible en la tienda”.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => execute(() => deleteProductAction(id))}>
            Eliminar producto
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
