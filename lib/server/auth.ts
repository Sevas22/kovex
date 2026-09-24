import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { db } from './db'
import { verifyPassword } from './passwords'

const COOKIE_NAME = 'kovex_session'
const SESSION_DAYS = 7

export interface AdminUser {
  id: number
  email: string
  name: string
}

function secret(): string {
  const value = process.env.AUTH_SECRET
  if (!value || value.length < 32) {
    throw new Error('AUTH_SECRET debe tener al menos 32 caracteres (ver .env.example).')
  }
  return value
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

function encodeSession(adminId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ sub: adminId, exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000 }),
  ).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function decodeSession(token: string | undefined): number | null {
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = Buffer.from(sign(payload))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { sub: number; exp: number }
    return data.exp > Date.now() ? data.sub : null
  } catch {
    return null
  }
}

/** Valida credenciales. Devuelve null si no coinciden (sin revelar cuál dato falló). */
export async function authenticate(email: string, password: string): Promise<AdminUser | null> {
  const [row] = await db()<(AdminUser & { passwordHash: string })[]>`
    select id, email, name, password_hash from public.admin_users
    where email = ${email.trim().toLowerCase()} and is_active
  `
  // Se verifica igual con un hash ficticio para que el tiempo de respuesta no delate si el correo existe.
  const ok = await verifyPassword(
    password,
    row?.passwordHash ?? 'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
  )
  if (!row || !ok) return null
  await db()`update public.admin_users set last_login_at = now() where id = ${row.id}`
  return { id: row.id, email: row.email, name: row.name }
}

export async function startSession(adminId: number) {
  const store = await cookies()
  store.set(COOKIE_NAME, encodeSession(adminId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
}

export async function endSession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

/** Administrador de la sesión actual (una consulta por request). */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  const store = await cookies()
  const adminId = decodeSession(store.get(COOKIE_NAME)?.value)
  if (adminId == null) return null
  const [row] = await db()<AdminUser[]>`
    select id, email, name from public.admin_users where id = ${adminId} and is_active
  `
  return row ?? null
})

/** Para páginas del panel: redirige al login si no hay sesión. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')
  return admin
}

/** Para Server Actions del panel: lanza error si no hay sesión. */
export async function assertAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
  return admin
}
