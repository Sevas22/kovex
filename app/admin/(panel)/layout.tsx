import { AdminShell } from '@/components/admin/admin-shell'
import { requireAdmin } from '@/lib/server/auth'
import { db } from '@/lib/server/db'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  const [{ open }] = await db()<{ open: number }[]>`
    select count(*)::int as open from public.orders where status in ('pending', 'quoted')
  `
  return (
    <AdminShell admin={{ name: admin.name, email: admin.email }} openOrders={open}>
      {children}
    </AdminShell>
  )
}
