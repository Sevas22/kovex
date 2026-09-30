import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'

/** Paginación de las tablas del panel: anterior, siguiente y en qué página vas. */
export function AdminPagination({
  page,
  pageCount,
  total,
  label,
  href,
}: {
  page: number
  pageCount: number
  total: number
  /** Nombre de lo que se lista, en plural: «productos». */
  label: string
  href: (page: number) => string
}) {
  if (total === 0) return null

  return (
    <nav
      aria-label={`Paginación de ${label}`}
      className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm"
    >
      <p className="text-muted-foreground">
        {formatNumber(total)} {label} · página {page} de {pageCount}
      </p>
      {pageCount > 1 ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            nativeButton={page <= 1}
            render={page > 1 ? <Link href={href(page - 1)} /> : undefined}
          >
            <ChevronLeftIcon data-icon="inline-start" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            nativeButton={page >= pageCount}
            render={page < pageCount ? <Link href={href(page + 1)} /> : undefined}
          >
            Siguiente
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </div>
      ) : null}
    </nav>
  )
}
