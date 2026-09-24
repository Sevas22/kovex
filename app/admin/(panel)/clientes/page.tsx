import { SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/admin/page-header'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCOP, formatDateTime, formatNumber } from '@/lib/format'
import { listCustomers } from '@/lib/server/customers'
import { formatPhone } from '@/lib/text'
import { whatsappLink } from '@/lib/whatsapp'

export const metadata = { title: 'Clientes' }

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim() ?? ''
  const customers = await listCustomers(q)

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Se registran solos cuando envían un pedido o una cotización. Se identifican por su número de WhatsApp."
      />

      <form className="mb-4 w-full md:w-80">
        <InputGroup className="h-9 bg-white">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput name="q" defaultValue={q} placeholder="Nombre, empresa, NIT o teléfono" aria-label="Buscar clientes" />
        </InputGroup>
      </form>

      <Card>
        <CardContent>
          {customers.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{q ? 'Sin resultados' : 'Aún no hay clientes'}</EmptyTitle>
                <EmptyDescription>
                  {q ? `Nadie coincide con “${q}”.` : 'Aparecerán aquí cuando alguien envíe su primer pedido o cotización.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead className="text-right">Pedidos</TableHead>
                  <TableHead className="text-right">Cotizaciones</TableHead>
                  <TableHead className="text-right">Compras confirmadas</TableHead>
                  <TableHead className="text-right">Última actividad</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="whitespace-normal">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[c.company, c.document && `NIT/CC ${c.document}`, c.city].filter(Boolean).join(' · ') || '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="tabular">{formatPhone(c.phone)}</p>
                      {c.email ? <p className="text-xs text-muted-foreground">{c.email}</p> : null}
                    </TableCell>
                    <TableCell className="text-right tabular">{formatNumber(c.orders)}</TableCell>
                    <TableCell className="text-right tabular">{formatNumber(c.quotes)}</TableCell>
                    <TableCell className="text-right font-semibold tabular">{c.purchased ? formatCOP(c.purchased) : '—'}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {c.lastActivity ? formatDateTime(c.lastActivity) : '—'}
                      {c.openCount ? (
                        <Badge variant="secondary" className="mt-1 ml-auto block w-fit">
                          {c.openCount} por atender
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          nativeButton={false}
                          render={<Link href={`/admin/pedidos?filtro=todos&q=${c.phone}`} />}
                        >
                          Ver pedidos
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Escribir a ${c.name} por WhatsApp`}
                          nativeButton={false}
                          render={<a href={whatsappLink(c.phone, `Hola ${c.name.split(' ')[0]}, te escribimos de KOVEX Colombia.`)} target="_blank" rel="noopener noreferrer" />}
                        >
                          <WhatsAppIcon className="text-whatsapp-600" />
                        </Button>
                      </div>
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
