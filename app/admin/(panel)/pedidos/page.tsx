import { SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { OrdersTable } from '@/components/admin/orders-table'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { listOrders, type OrderFilter } from '@/lib/server/order-queries'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Pedidos y cotizaciones' }

const FILTERS: { value: OrderFilter; label: string }[] = [
  { value: 'pendientes', label: 'Por atender' },
  { value: 'pedidos', label: 'Pedidos' },
  { value: 'cotizaciones', label: 'Cotizaciones' },
  { value: 'todos', label: 'Todos' },
]

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string; q?: string }>
}) {
  const sp = await searchParams
  const filter = FILTERS.some((f) => f.value === sp.filtro) ? (sp.filtro as OrderFilter) : 'pendientes'
  const q = sp.q?.trim() ?? ''
  const orders = await listOrders({ filter, q })

  return (
    <>
      <PageHeader
        title="Pedidos y cotizaciones"
        description="Todo lo que llega desde la tienda. Confirma la venta cuando el cliente pague por WhatsApp: ahí se descuenta el inventario."
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav aria-label="Filtrar" className="inline-flex w-fit rounded-lg bg-white p-1 ring-1 ring-border">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={`/admin/pedidos?filtro=${f.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              aria-current={f.value === filter ? 'page' : undefined}
              className={cn(
                'rounded-md px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground',
                f.value === filter && 'bg-brand-navy text-white hover:text-white',
              )}
            >
              {f.label}
            </Link>
          ))}
        </nav>
        <form className="w-full md:w-80">
          <input type="hidden" name="filtro" value={filter} />
          <InputGroup className="h-9 bg-white">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput name="q" defaultValue={q} placeholder="Código, cliente o teléfono" aria-label="Buscar pedidos" />
          </InputGroup>
        </form>
      </div>

      <Card>
        <CardContent>
          {orders.length ? (
            <OrdersTable orders={orders} />
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{q ? 'Sin resultados' : 'Nada por aquí'}</EmptyTitle>
                <EmptyDescription>
                  {q ? `No hay registros que coincidan con “${q}”.` : 'No hay registros con este filtro.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </>
  )
}
