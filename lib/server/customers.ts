import 'server-only'
import { db } from './db'

export interface CustomerRow {
  id: number
  phone: string
  name: string
  company: string | null
  document: string | null
  email: string | null
  city: string | null
  orders: number
  quotes: number
  /** Suma de pedidos confirmados, enviados o entregados. */
  purchased: number
  openCount: number
  lastActivity: Date | null
  createdAt: Date
}

export async function listCustomers(q?: string): Promise<CustomerRow[]> {
  const sql = db()
  const term = q?.trim()
  const digits = term?.replace(/\D/g, '')
  const filter = term
    ? sql`and (c.name ilike ${`%${term}%`} or c.company ilike ${`%${term}%`} or c.document ilike ${`%${term}%`}
              ${digits ? sql`or c.phone like ${`%${digits}%`}` : sql``})`
    : sql``
  return sql<CustomerRow[]>`
    select c.id, c.phone, c.name, c.company, c.document, c.email, c.city, c.created_at,
           count(o.id) filter (where o.kind = 'order')::int as orders,
           count(o.id) filter (where o.kind = 'quote')::int as quotes,
           coalesce(sum(o.subtotal) filter (where o.status in ('confirmed', 'shipped', 'delivered')), 0)::bigint as purchased,
           count(o.id) filter (where o.status in ('pending', 'quoted'))::int as open_count,
           max(o.created_at) as last_activity
    from public.customers c
    left join public.orders o on o.customer_id = c.id
    where true ${filter}
    group by c.id
    order by max(o.created_at) desc nulls last, c.created_at desc
    limit 300
  `
}
