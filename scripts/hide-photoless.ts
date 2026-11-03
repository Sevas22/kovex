/**
 * Oculta los productos que siguen a la venta pero no tienen foto.
 *
 *   pnpm catalog:ocultar-sin-foto            solo muestra el plan
 *   pnpm catalog:ocultar-sin-foto --aplicar  los oculta
 *   pnpm catalog:ocultar-sin-foto --revertir vuelve a mostrarlos
 *
 * Es distinto de `catalog:ocultar-bajas`: aquellos salieron del catálogo del
 * proveedor, estos se despachan sin problema y solo les falta la imagen. Se
 * ocultan porque el cliente pidió que ningún producto se muestre sin foto.
 *
 * Al subir la foto desde el panel hay que volver a marcarlos como visibles;
 * ocultar no es una decisión permanente, es esperar a la foto.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { db } from '@/lib/server/db'

const RESPALDO = 'scripts/respaldo-sin-foto.json'
const aplicar = process.argv.includes('--aplicar')
const revertir = process.argv.includes('--revertir')

async function main() {
  const sql = db()

  if (revertir) {
    const ids = JSON.parse(readFileSync(RESPALDO, 'utf8')) as number[]
    const filas = await sql<{ id: number }[]>`
      update public.products set is_active = true where id = any(${ids}) returning id
    `
    console.log(`${filas.length} productos vuelven a estar visibles.`)
    await sql.end()
    return
  }

  const rows = await sql<{ id: number; name: string; brand: string | null; departamento: string | null }[]>`
    with recursive tree as (
      select id, id as root from public.categories where parent_id is null
      union all
      select c.id, t.root from public.categories c join tree t on c.parent_id = t.id
    )
    select p.id, p.name, p.brand, raiz.name as departamento
    from public.products p
    left join tree t on t.id = p.category_id
    left join public.categories raiz on raiz.id = t.root
    where p.is_active and cardinality(p.images) = 0
    order by raiz.name nulls last, p.name
  `

  for (const p of rows) {
    console.log(`  ${String(p.id).padStart(4)}  ${(p.departamento ?? '—').padEnd(12)} ${(p.brand ?? '—').slice(0, 14).padEnd(14)} ${p.name.slice(0, 48)}`)
  }
  console.log(`\n${rows.length} productos visibles sin foto`)

  if (!aplicar) {
    console.log('\nPlan únicamente. Usa --aplicar para ocultarlos.')
    await sql.end()
    return
  }

  const ids = rows.map((p) => p.id)
  writeFileSync(RESPALDO, JSON.stringify(ids, null, 2))
  const filas = await sql<{ id: number }[]>`
    update public.products set is_active = false where id = any(${ids}) returning id
  `
  console.log(`\n${filas.length} productos ocultos · respaldo en ${RESPALDO}`)
  console.log('Al subir la foto, vuelve a marcarlos visibles desde el panel.')
  console.log('Para deshacerlo todo: pnpm catalog:ocultar-sin-foto --revertir')
  await sql.end()
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await db().end()
  process.exit(1)
})
