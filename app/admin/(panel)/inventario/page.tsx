import Link from 'next/link'
import { MovementsTable } from '@/components/admin/movements-table'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber } from '@/lib/format'
import { listAdminProducts } from '@/lib/server/admin-products'
import { getDashboardStats, listMovements } from '@/lib/server/order-queries'

export const metadata = { title: 'Inventario' }

export default async function InventoryPage() {
  const [movements, products, stats] = await Promise.all([
    listMovements({ limit: 100 }),
    listAdminProducts({ status: 'activos' }),
    getDashboardStats(),
  ])
  const tracked = products.filter((p) => p.trackInventory)
  const totals = tracked.reduce(
    (acc, p) => ({ stock: acc.stock + p.stock, reserved: acc.reserved + p.reserved }),
    { stock: 0, reserved: 0 },
  )
  const withReservations = tracked.filter((p) => p.reserved > 0)

  return (
    <>
      <PageHeader
        title="Inventario"
        description="Cada entrada, venta, reserva o devolución queda registrada. Las reservas se crean cuando un cliente hace un pedido y se descuentan al confirmar la venta."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          ['Unidades en bodega', totals.stock],
          ['Reservadas', totals.reserved],
          ['Disponibles para vender', totals.stock - totals.reserved],
          ['Productos agotados', stats.outOfStock],
        ].map(([label, value]) => (
          <Card key={label} className="gap-1">
            <CardHeader>
              <CardDescription>{label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-brand-navy tabular">{formatNumber(Number(value))}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {withReservations.length ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Unidades reservadas en pedidos abiertos</CardTitle>
            <CardDescription>Se liberan si cancelas el pedido o se descuentan al confirmar la venta.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Bodega</TableHead>
                  <TableHead className="text-right">Reservado</TableHead>
                  <TableHead className="text-right">Disponible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withReservations.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/admin/productos/${p.id}`} className="font-medium hover:text-brand-blue">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular">{p.stock}</TableCell>
                    <TableCell className="text-right font-semibold text-warning tabular">{p.reserved}</TableCell>
                    <TableCell className="text-right tabular">{p.stock - p.reserved}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Kardex</CardTitle>
          <CardDescription>Últimos 100 movimientos de todos los productos.</CardDescription>
        </CardHeader>
        <CardContent>
          <MovementsTable movements={movements} showProduct />
        </CardContent>
      </Card>
    </>
  )
}
