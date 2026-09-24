/**
 * Crea un usuario del panel o cambia su contraseña.
 * Uso: pnpm admin:create correo@kovex.com.co "Nombre" "contraseña-segura"
 */
import { db } from '@/lib/server/db'
import { upsertAdminUser } from '@/lib/server/passwords'

async function main() {
  const [email, name, password] = process.argv.slice(2)
  if (!email || !name || !password) {
    throw new Error('Uso: pnpm admin:create <correo> <nombre> <contraseña>')
  }
  const admin = await upsertAdminUser({ email, name, password })
  console.log(`Listo: ${admin.email} puede entrar a /admin`)
  await db().end()
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await db().end()
  process.exit(1)
})
