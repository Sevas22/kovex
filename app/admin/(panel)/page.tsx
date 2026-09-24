import {
  AlertTriangleIcon,
  BanknoteIcon,
  ClipboardListIcon,
  LockIcon,
  MessageSquareQuoteIcon,
  PackageIcon,
} from 'lucide-react'
import Link from 'next/link'
import { OrdersTable } from '@/components/admin/orders-table'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { formatCOP, formatNumber, plural } from '@/lib/format'
import { listAdminProducts } from '@/lib/server/admin-products'
import { getCurrentAdmin } from '@/lib/server/auth'
import { getDashboardStats, listOrders } from '@/lib/server/order-queries'

export const metadata = { title: 'Resumen' }

export default async function DashboardPage() {
  const [stats, recent, low, out, admin] = await Promise.all([
    getDashboardStats(),
    listOrders({ filter: 'todos', limit: 8 }),
    listAdminProducts({ status: 'stock-bajo' }),
    listAdminProducts({ status: 'agotados' }),
    getCurrentAdmin(),
  ])
  const alerts = [...out, ...low].slice(0, 6)
  const usage = Math.min(100, (stats.productCount / stats.productLimit) * 100)

  return (
    <>
      <PageHeader
        title={`Hola, ${admin?.name.split(' ')[0] ?? 'equipo'}`}
        description="Esto es lo que está pasando hoy en la tienda."
        actions={
          <Button variant="navy" size="lg" nativeButton={false} render={<Link href="/admin/pedidos?filtro=pendientes" />}>
            Ver pendientes
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Pedidos por confirmar"
          value={formatNumber(stats.pendingOrders)}
          hint="Tienen unidades reservadas esperando pago."
          href="/admin/pedidos?filtro=pedidos"
          icon={ClipboardListIcon}
          tone={stats.pendingOrders ? 'attention' : 'default'}
        />
        <StatCard
          label="Cotizaciones por responder"
          value={formatNumber(stats.pendingQuotes)}
          hint="Asigna precios y respóndelas por WhatsApp."
          href="/admin/pedidos?filtro=cotizaciones"
          icon={MessageSquareQuoteIcon}
          tone={stats.pendingQuotes ? 'attention' : 'default'}
        />
        <StatCard
          label="Ventas confirmadas del mes"
          value={formatCOP(stats.salesThisMonth)}
          hint={plural(stats.ordersThisMonth, 'pedido confirmado', 'pedidos confirmados')}
          icon={BanknoteIcon}
        />
        <StatCard
          label="Unidades reservadas"
          value={formatNumber(stats.reservedUnits)}
          hint="Separadas para pedidos pendientes; no se pueden vender a otros."
          href="/admin/inventario"
          icon={LockIcon}
        />
        <StatCard
          label="Productos en catálogo"
          value={`${formatNumber(stats.productCount)} / ${formatNumber(stats.productLimit)}`}
          hint={`${formatNumber(stats.activeProducts)} visibles en la tienda · plan de ${formatNumber(stats.productLimit)} productos`}
          href="/admin/productos"
          icon={PackageIcon}
        >
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(usage)} aria-valuemin={0} aria-valuemax={100} aria-label="Uso del plan">
            <div className="h-full rounded-full bg-brand-blue" style={{ width: `${Math.max(usage, 1)}%` }} />
          </div>
        </StatCard>
        <StatCard
          label="Alertas de inventario"
          value={formatNumber(stats.lowStock + stats.outOfStock)}
          hint={`${plural(stats.outOfStock, 'agotado')} · ${formatNumber(stats.lowStock)} con stock bajo`}
          href="/admin/productos?estado=stock-bajo"
          icon={AlertTriangleIcon}
          tone={stats.lowStock + stats.outOfStock ? 'attention' : 'default'}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Últimos pedidos y cotizaciones</CardTitle>
            <CardAction>
              <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin/pedidos" />}>
                Ver todos
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {recent.length ? (
              <OrdersTable orders={recent} />
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>Aún no hay pedidos</EmptyTitle>
                  <EmptyDescription>Cuando un cliente envíe su lista desde la tienda aparecerá aquí.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reponer pronto</CardTitle>
            <CardDescription>Productos agotados o con pocas unidades.</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length ? (
              <ul className="flex flex-col divide-y">
                {alerts.map((p) => {
                  const available = p.stock - p.reserved
                  return (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                      <Link href={`/admin/productos/${p.id}`} className="line-clamp-2 text-sm font-medium hover:text-brand-blue">
                        {p.name}
                      </Link>
                      <span
                        className={
                          available <= 0
                            ? 'shrink-0 text-sm font-semibold text-destructive tabular'
                            : 'shrink-0 text-sm font-semibold text-warning tabular'
                        }
                      >
                        {available <= 0 ? 'Agotado' : `${available} disp.`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Todo el inventario está en niveles sanos.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
