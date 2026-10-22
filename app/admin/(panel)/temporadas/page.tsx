import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/admin/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { listAdminCatalogs } from '@/lib/server/seasonal-catalogs'

export const metadata = { title: 'Catálogos de temporada' }

export default async function TemporadasAdminPage() {
  const catalogos = await listAdminCatalogs()

  return (
    <>
      <PageHeader
        title="Catálogos de temporada"
        description="Folletos en PDF que se publican tal cual, sin crear productos. Aparecen en la tienda bajo «Temporadas»."
        actions={
          <Button size="lg" nativeButton={false} render={<Link href="/admin/temporadas/nuevo" />}>
            <PlusIcon data-icon="inline-start" />
            Nuevo catálogo
          </Button>
        }
      />

      <Card>
        <CardContent>
          {catalogos.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Todavía no hay catálogos</EmptyTitle>
                <EmptyDescription>Sube un PDF o pega la dirección de uno que ya esté publicado.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalogos.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="tabular text-muted-foreground">{c.sortOrder}</TableCell>
                    <TableCell>
                      <Link href={`/admin/temporadas/${c.id}`} className="font-medium hover:underline">
                        {c.title}
                      </Link>
                      {c.description ? (
                        <p className="line-clamp-1 text-xs text-muted-foreground">{c.description}</p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.fileUrl.startsWith('/archivos/') ? 'PDF subido' : 'Enlace externo'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? 'default' : 'secondary'}>
                        {c.isActive ? 'Visible' : 'Oculto'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}
