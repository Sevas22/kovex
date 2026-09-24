import 'server-only'
import { headers } from 'next/headers'
import { db } from './db'

/**
 * Cuenta un intento para `key` dentro de una ventana fija. Devuelve false si se superó
 * el límite. Una sola sentencia atómica: dos requests simultáneos no se saltan el conteo.
 */
export async function consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const sql = db()
  const [row] = await sql<{ hits: number }[]>`
    insert into public.rate_limits as r (key, window_start, hits)
    values (${key}, now(), 1)
    on conflict (key) do update set
      hits = case when r.window_start < now() - make_interval(secs => ${windowSeconds}) then 1 else r.hits + 1 end,
      window_start = case when r.window_start < now() - make_interval(secs => ${windowSeconds}) then now() else r.window_start end
    returning hits
  `
  // Limpieza ocasional de ventanas vencidas para que la tabla no crezca.
  if (Math.random() < 0.02) {
    await sql`delete from public.rate_limits where window_start < now() - interval '2 days'`
  }
  return row.hits <= limit
}

export async function resetRateLimit(key: string) {
  await db()`delete from public.rate_limits where key = ${key}`
}

/** IP del cliente según los encabezados del proxy (Vercel envía x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'desconocida'
}
