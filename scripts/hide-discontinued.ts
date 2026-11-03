/**
 * Oculta los productos que el proveedor ya no vende.
 *
 *   pnpm catalog:ocultar-bajas            solo muestra el plan
 *   pnpm catalog:ocultar-bajas --aplicar  los oculta
 *   pnpm catalog:ocultar-bajas --revertir vuelve a mostrarlos
 *
 * Un producto cuya ficha en Texcomercial devuelve 404 —y que tampoco aparece
 * buscándolo por su SKU— salió del catálogo del proveedor. Mientras siga
 * visible, un comprador puede pedir un televisor que no se puede despachar;
 * que además no tenga foto es lo de menos.
 *
 * Ocultar no borra nada: `is_active = false` los saca de la tienda pero siguen
 * en el panel, con su precio y su historial. Antes de ocultar guarda los ids en
 * scripts/respaldo-bajas.json para poder revertirlo con --revertir.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { db } from '@/lib/server/db'
import { fetchSupplierProduct } from '@/lib/server/texcomercial'

const RESPALDO = 'scripts/respaldo-bajas.json'
const aplicar = process.argv.includes('--aplicar')
const revertir = process.argv.includes('--revertir')

interface Row {
  id: number
  name: string
  brand: string | null
  sku: string
  sourceUrl: string | null
}

/** Sigue publicado el producto en el proveedor. null = no se pudo averiguar. */
async function sigueALaVenta(p: Row): Promise<boolean | null> {
  const handle = p.sourceUrl?.split('/products/')[1]
  if (!handle) return null
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const producto = await fetchSupplierProduct(handle)
      if (producto) return true
      // 404: puede ser que lo renombraron. Se busca por SKU antes de darlo de baja.
      return await existeConEseSku(p.sku)
    } catch {
      // límite de peticiones o red: se reintenta
    }
    await new Promise((r) => setTimeout(r, 1200 * intento))
  }
  return null
}

async function existeConEseSku(sku: string): Promise<boolean | null> {
  const nuestro = sku.trim().toUpperCase()
  if (!nuestro || nuestro.startsWith('TEX-')) return false
  try {
    const url = `https://texcomercial.com.co/search/suggest.json?q=${encodeURIComponent(nuestro)}&resources[type]=product&resources[limit]=5`
    const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(20_000) })
    if (!res.ok) return null
    const j = (await res.json()) as { resources?: { results?: { products?: { handle: string }[] } } }
    for (const { handle } of (j.resources?.results?.products ?? []).slice(0, 5)) {
      const ficha = await fetch(`https://texcomercial.com.co/products/${handle}.js`, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(20_000),
      })
      if (!ficha.ok) continue
      const { variants } = (await ficha.json()) as { variants?: { sku?: string }[] }
      if ((variants ?? []).some((v) => v.sku?.trim().toUpperCase() === nuestro)) return true
      await new Promise((r) => setTimeout(r, 300))
    }
    return false
  } catch {
    return null
  }
}

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

  const candidatos = await sql<Row[]>`
    select id, name, brand, sku, source_url from public.products
    where is_active and cardinality(images) = 0 and source_url is not null
    order by id
  `
  console.log(`${candidatos.length} productos visibles sin foto · comprobando cuáles siguen a la venta…\n`)

  const aOcultar: Row[] = []
  const dudosos: Row[] = []
  for (const p of candidatos) {
    const vive = await sigueALaVenta(p)
    if (vive === false) aOcultar.push(p)
    // No se pudo preguntar: no se toca. Ocultar por un fallo de red sería
    // quitar de la venta un producto bueno.
    else if (vive === null) dudosos.push(p)
    await new Promise((r) => setTimeout(r, 300))
  }

  for (const p of aOcultar) console.log(`  ocultar  ${String(p.id).padStart(4)}  ${(p.brand ?? '—').slice(0, 14).padEnd(14)} ${p.name.slice(0, 52)}`)
  for (const p of dudosos) console.log(`  (no se pudo consultar: ${p.id} ${p.name.slice(0, 40)})`)

  console.log(`\n${aOcultar.length} por ocultar · ${candidatos.length - aOcultar.length - dudosos.length} siguen a la venta y solo les falta la foto`)

  if (!aplicar) {
    console.log('\nPlan únicamente. Usa --aplicar para ocultarlos.')
    await sql.end()
    return
  }

  const ids = aOcultar.map((p) => p.id)
  writeFileSync(RESPALDO, JSON.stringify(ids, null, 2))
  const filas = await sql<{ id: number }[]>`
    update public.products set is_active = false where id = any(${ids}) returning id
  `
  console.log(`\n${filas.length} productos ocultos · respaldo en ${RESPALDO}`)
  console.log('Para deshacerlo: pnpm catalog:ocultar-bajas --revertir')
  await sql.end()
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await db().end()
  process.exit(1)
})
