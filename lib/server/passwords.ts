import 'server-only'
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { db } from './db'

const N = 16384
const R = 8
const P = 1
const KEY_LENGTH = 64

function derive(password: string, salt: Buffer, n = N, r = R, p = P): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, KEY_LENGTH, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  )
}

/** Formato: scrypt$N$r$p$salt$hash (base64). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await derive(password, salt)
  return ['scrypt', N, R, P, salt.toString('base64'), hash.toString('base64')].join('$')
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, salt, hash] = stored.split('$')
  if (algo !== 'scrypt' || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64')
  const actual = await derive(password, Buffer.from(salt, 'base64'), Number(n), Number(r), Number(p))
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export async function upsertAdminUser(input: { email: string; name: string; password: string }) {
  if (input.password.length < 10) throw new Error('La contraseña debe tener al menos 10 caracteres.')
  const passwordHash = await hashPassword(input.password)
  const [row] = await db()<{ id: number; email: string }[]>`
    insert into public.admin_users (email, name, password_hash)
    values (${input.email.trim().toLowerCase()}, ${input.name}, ${passwordHash})
    on conflict (email) do update set name = excluded.name, password_hash = excluded.password_hash, is_active = true
    returning id, email
  `
  return row
}
