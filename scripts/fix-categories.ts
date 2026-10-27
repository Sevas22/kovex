/**
 * Reubica las categorías que el proveedor dejó en el departamento equivocado.
 *
 *   pnpm categorias:arreglar            solo muestra el plan
 *   pnpm categorias:arreglar --aplicar  lo ejecuta
 *
 * Texcomercial etiqueta sus productos como «Departamento_Categoría_Subcategoría»
 * y esas etiquetas son inconsistentes: en Agro terminaron baños, pisos, tejas y
 * tomacorrientes. El comprador que filtra Agro no espera encontrar grifería.
 *
 * Para cada hoja de la rama equivocada se busca la hoja equivalente en el
 * departamento correcto —y si no existe se crea—, se mueven los productos y se
 * borran las categorías que quedan vacías.
 *
 * Antes de mover nada guarda un respaldo en scripts/respaldo-categorias.json con
 * el producto y su categoría original, para poder revertirlo.
 */
import { writeFileSync } from 'node:fs'
import { db } from '@/lib/server/db'
import { slugify } from '@/lib/text'

const aplicar = process.argv.includes('--aplicar')

/** Categoría de primer nivel que está mal ubicada → departamento correcto. */
const REUBICAR: Record<string, string> = {
  Abrasivos: 'Ferretería',
  Adhesivos: 'Ferretería',
  'Baños y cocinas': 'Ferretería',
  'Interruptores y pulsadores': 'Ferretería',
  'Materiales para la construcción': 'Ferretería',
  'Paneles led': 'Ferretería',
  Paredes: 'Ferretería',
  'Pinturas y accesorios': 'Ferretería',
  Pisos: 'Ferretería',
  Plomería: 'Ferretería',
  'Tejas y techos': 'Ferretería',
  Tomas: 'Ferretería',
}

/** Departamento del que se sacan: el que el cliente vio mal armado. */
const ORIGEN = 'Agro'

interface Cat {
  id: number
  name: string
  parentId: number | null
}

async function main() {
  const sql = db()
  const todas = await sql<Cat[]>`select id, name, parent_id from public.categories`
  const porId = new Map(todas.map((c) => [c.id, c]))
  const hijasDe = (id: number | null) => todas.filter((c) => c.parentId === id)
  const departamento = (n: string) => todas.find((c) => c.parentId == null && c.name.toLowerCase().startsWith(n.toLowerCase()))

  const origen = departamento(ORIGEN)
  if (!origen) throw new Error(`No existe el departamento ${ORIGEN}`)

  const respaldo: { productId: number; from: number }[] = []
  const movimientos: string[] = []
  const aBorrar: number[] = []
  let total = 0

  for (const [nombre, destinoDep] of Object.entries(REUBICAR)) {
    const rama = hijasDe(origen.id).find((c) => c.name === nombre)
    if (!rama) continue
    const dep = departamento(destinoDep)
    if (!dep) throw new Error(`No existe el departamento ${destinoDep}`)

    // La categoría gemela en el departamento correcto; se crea si falta.
    let gemela = hijasDe(dep.id).find((c) => c.name === nombre)
    if (!gemela) {
      if (aplicar) {
        const [row] = await sql<{ id: number }[]>`
          insert into public.categories (slug, name, parent_id, is_active)
          values (${await slugLibre(sql, nombre)}, ${nombre}, ${dep.id}, true) returning id
        `
        gemela = { id: row.id, name: nombre, parentId: dep.id }
        todas.push(gemela)
      } else {
        movimientos.push(`  crear  ${destinoDep} › ${nombre}`)
        gemela = { id: -1, name: nombre, parentId: dep.id }
      }
    }

    // Cada hoja de la rama se funde con su equivalente del destino.
    const hojas = [rama, ...descendientes(rama.id)]
    for (const hoja of hojas) {
      const productos = await sql<{ id: number }[]>`
        select id from public.products where category_id = ${hoja.id}
      `
      if (productos.length === 0) {
        aBorrar.push(hoja.id)
        continue
      }
      // La hoja equivalente: misma posición relativa dentro de la gemela.
      const destinoHoja =
        hoja.id === rama.id
          ? gemela
          : (hijasDe(gemela.id).find((c) => c.name === hoja.name) ?? gemela)

      movimientos.push(
        `  ${String(productos.length).padStart(3)}  ${ORIGEN} › ${ruta(hoja)}  →  ${destinoDep} › ${nombre}${destinoHoja.id !== gemela.id ? ` › ${destinoHoja.name}` : ''}`,
      )
      total += productos.length

      if (aplicar) {
        for (const p of productos) respaldo.push({ productId: p.id, from: hoja.id })
        await sql`
          update public.products set category_id = ${destinoHoja.id}
          where category_id = ${hoja.id}
        `
      }
      aBorrar.push(hoja.id)
    }
  }

  function descendientes(id: number): Cat[] {
    const hijas = hijasDe(id)
    return hijas.flatMap((h) => [h, ...descendientes(h.id)])
  }
  function ruta(c: Cat): string {
    const partes: string[] = []
    let actual: Cat | undefined = c
    while (actual && actual.parentId != null) {
      partes.unshift(actual.name)
      actual = porId.get(actual.parentId)
    }
    return partes.join(' › ')
  }

  console.log(aplicar ? 'APLICANDO\n' : 'PLAN (sin cambios; usa --aplicar para ejecutarlo)\n')
  for (const m of movimientos) console.log(m)
  console.log(`\n  ${total} productos · ${aBorrar.length} categorías vacías por borrar`)

  if (aplicar) {
    writeFileSync('scripts/respaldo-categorias.json', JSON.stringify(respaldo, null, 2))
    // De la hoja hacia la raíz, para no dejar padres con hijas huérfanas.
    for (const id of [...aBorrar].reverse()) {
      await sql`delete from public.categories where id = ${id} and not exists (
        select 1 from public.products where category_id = ${id}
      ) and not exists (select 1 from public.categories where parent_id = ${id})`
    }
    const [{ n }] = await sql<{ n: number }[]>`
      select count(*)::int as n from public.products p
      join public.categories c on c.id = p.category_id where c.id is not null`
    console.log(`\n  respaldo en scripts/respaldo-categorias.json (${respaldo.length} productos)`)
    console.log(`  productos con categoría: ${n}`)
  }
  await sql.end()
}

async function slugLibre(sql: ReturnType<typeof db>, nombre: string): Promise<string> {
  const base = slugify(nombre) || 'categoria'
  for (let i = 0; i < 50; i++) {
    const intento = i === 0 ? base : `${base}-${i + 1}`
    const [row] = await sql<{ id: number }[]>`select id from public.categories where slug = ${intento}`
    if (!row) return intento
  }
  throw new Error(`No se pudo generar un slug para ${nombre}`)
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await db().end()
  process.exit(1)
})
