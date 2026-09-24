/**
 * Aplica en orden las migraciones de supabase/migrations que aún no se han aplicado.
 * Uso: pnpm db:migrate   (lee DATABASE_URL de .env.local)
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import postgres from 'postgres'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('Falta DATABASE_URL (configúrala en .env.local).')

  const sql = postgres(url, { prepare: false, max: 1, onnotice: () => {} })
  try {
    await sql`
      create table if not exists public.schema_migrations (
        version text primary key,
        name text not null,
        applied_at timestamptz not null default now()
      )
    `
    await sql`alter table public.schema_migrations enable row level security`

    const rows = await sql<{ version: string }[]>`select version from public.schema_migrations`
    const applied = new Set(rows.map((r) => r.version))

    const dir = path.join(process.cwd(), 'supabase', 'migrations')
    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()

    let count = 0
    for (const file of files) {
      const version = file.split('_')[0]
      if (applied.has(version)) continue
      const content = await readFile(path.join(dir, file), 'utf8')
      await sql.begin(async (tx) => {
        await tx.unsafe(content)
        await tx`insert into public.schema_migrations (version, name) values (${version}, ${file})`
      })
      console.log(`✓ ${file}`)
      count++
    }
    console.log(count ? `${count} migración(es) aplicada(s).` : 'La base de datos ya está al día.')
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error('Error aplicando migraciones:', error)
  process.exit(1)
})
