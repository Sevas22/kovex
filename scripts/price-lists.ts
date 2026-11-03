/**
 * Precios del proveedor por lista.
 *
 *   pnpm catalog:listas --descubrir          baja las listas de todo el catálogo
 *   pnpm catalog:listas --identificar <precio> [<precio>…]
 *                                            dice qué lista corresponde a esos precios
 *   pnpm catalog:listas --lista TLP0019      compara esa lista contra el costo actual
 *   pnpm catalog:listas --lista TLP0019 --aplicar   la guarda como costo
 *
 * Texcomercial publica cada producto con una variante por lista de precio y
 * bodega: «MLP-TLP0019CO11» es la lista TLP0019 en la bodega CO11. Un mismo
 * congelador va de $1.214.899 a $1.590.289 según la lista, un 31% de
 * diferencia. «MSIN_LISTA» es el precio sin lista asignada, el más caro.
 *
 * El importador venía tomando price_min —la lista más barata— que casi nunca
 * es la que le aplican al comprador. De ahí que los costos no cuadraran.
 *
 * La descarga tarda; queda en caché para no repetirla al cambiar de lista.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { toCsv } from '@/lib/csv'
import { db } from '@/lib/server/db'
import { recalculatePrices } from '@/lib/server/prices'

const CACHE = 'scripts/cache-listas.json'
const SIN_LISTA = 'informe-sin-lista.csv'
const args = process.argv.slice(2)
const flag = (name: string) => args.includes(name)
const valor = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const TRABAJADORES = 6
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface Producto {
  id: number
  name: string
  sku: string
  costPrice: number | null
  sourceUrl: string
}

/** Lista → precio en pesos. Se guarda el menor entre bodegas (difieren en centavos). */
type Listas = Record<string, number>

interface Fila {
  id: number
  name: string
  sku: string
  costPrice: number | null
  listas: Listas
}

/** «MLP-TLP0019CO11» → TLP0019 · «MSIN_LISTACO11» → SIN_LISTA */
function nombreDeLista(variante: string): string | null {
  const m = variante.match(/^M(?:LP-)?(.+?)CO\d+$/)
  return m ? m[1] : null
}

async function variantesDe(sourceUrl: string): Promise<Listas | null> {
  const handle = sourceUrl.split('/products/')[1]
  if (!handle) return null
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const res = await fetch(`https://texcomercial.com.co/products/${handle}.js`, {
        headers: { 'user-agent': 'KovexCatalog/1.0', accept: 'application/json' },
        signal: AbortSignal.timeout(20_000),
      })
      if (res.status === 404) return {}
      if (res.ok) {
        const { variants } = (await res.json()) as { variants?: { title: string; price: number }[] }
        const listas: Listas = {}
        for (const v of variants ?? []) {
          const lista = nombreDeLista(v.title)
          if (!lista) continue
          // Shopify entrega centavos; entre bodegas cambia por céntimos.
          const pesos = Math.round(v.price / 100)
          listas[lista] = listas[lista] == null ? pesos : Math.min(listas[lista], pesos)
        }
        return listas
      }
    } catch {
      // límite de peticiones o red
    }
    await sleep(1200 * intento)
  }
  return null
}

async function descubrir() {
  const sql = db()
  const productos = await sql<Producto[]>`
    select id, name, sku, cost_price, source_url from public.products
    where source_url is not null order by id
  `
  console.log(`${productos.length} productos · bajando listas de precio…`)

  const filas: Fila[] = []
  let sinDatos = 0
  let siguiente = 0
  async function trabajador() {
    while (siguiente < productos.length) {
      const p = productos[siguiente++]
      const listas = await variantesDe(p.sourceUrl)
      if (listas == null || Object.keys(listas).length === 0) sinDatos++
      filas.push({ id: p.id, name: p.name, sku: p.sku, costPrice: p.costPrice, listas: listas ?? {} })
      if (filas.length % 100 === 0) console.log(`   ${filas.length}/${productos.length}`)
      await sleep(200)
    }
  }
  await Promise.all(Array.from({ length: TRABAJADORES }, trabajador))

  filas.sort((a, b) => a.id - b.id)
  writeFileSync(CACHE, JSON.stringify(filas))
  console.log(`\n${filas.length} productos · ${sinDatos} sin listas publicadas`)
  resumenDeListas(filas)
  await sql.end()
}

function cargar(): Fila[] {
  if (!existsSync(CACHE)) throw new Error(`Falta ${CACHE}. Corre primero: pnpm catalog:listas --descubrir`)
  return JSON.parse(readFileSync(CACHE, 'utf8')) as Fila[]
}

function resumenDeListas(filas: Fila[]) {
  const cobertura = new Map<string, number>()
  for (const f of filas) for (const l of Object.keys(f.listas)) cobertura.set(l, (cobertura.get(l) ?? 0) + 1)
  console.log('\n  lista          productos')
  for (const [l, n] of [...cobertura].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${l.padEnd(14)} ${String(n).padStart(6)}`)
  }
}

/**
 * Qué listas explican los precios que el comprador ve en pantalla.
 *
 * La tolerancia no es por redondeo sino porque el mismo artículo cuesta unos
 * pesos distinto según la bodega (1.590.286 en CO14, 1.590.289 en CO11) y aquí
 * se guarda el menor. Entre listas distintas la diferencia es de miles, así que
 * holgar diez pesos no confunde una lista con otra.
 */
function identificar(precios: number[], filas: Fila[]) {
  const TOLERANCIA = 10
  let candidatas: string[] | null = null
  for (const precio of precios) {
    const coinciden = new Set<string>()
    for (const f of filas) {
      for (const [lista, valor] of Object.entries(f.listas)) {
        if (Math.abs(valor - precio) <= TOLERANCIA) coinciden.add(lista)
      }
    }
    console.log(`  $${precio.toLocaleString('es-CO')} → ${coinciden.size ? [...coinciden].sort().join(', ') : 'ninguna lista'}`)
    candidatas = candidatas == null ? [...coinciden] : candidatas.filter((l) => coinciden.has(l))
  }
  console.log(`\nListas compatibles con todos: ${candidatas?.length ? candidatas.sort().join(', ') : 'ninguna'}`)
  if (candidatas?.length === 1) console.log(`\nEs la lista ${candidatas[0]}.`)
  else if (candidatas && candidatas.length > 1) console.log('\nDame el precio de otro producto para acabar de distinguirlas.')
}

async function aplicar(lista: string, guardar: boolean) {
  const filas = cargar()
  const sql = db()

  const cambios: { id: number; name: string; antes: number | null; despues: number }[] = []
  const sinEsaLista: Fila[] = []
  for (const f of filas) {
    const precio = f.listas[lista]
    if (precio == null) {
      sinEsaLista.push(f)
      continue
    }
    if (f.costPrice !== precio) cambios.push({ id: f.id, name: f.name, antes: f.costPrice, despues: precio })
  }

  const subidas = cambios.filter((c) => (c.antes ?? 0) < c.despues).length
  console.log(`lista ${lista}`)
  console.log(`  ${cambios.length} productos cambian de costo (${subidas} suben, ${cambios.length - subidas} bajan)`)
  console.log(`  ${filas.length - sinEsaLista.length - cambios.length} ya estaban correctos`)
  console.log(`  ${sinEsaLista.length} no tienen esa lista publicada`)

  const media =
    cambios.length > 0
      ? cambios.reduce((s, c) => s + (c.antes ? (c.despues - c.antes) / c.antes : 0), 0) / cambios.length
      : 0
  console.log(`  variación media del costo: ${(media * 100).toFixed(1)} %`)

  for (const c of cambios.slice(0, 10)) {
    console.log(`     ${String(c.id).padStart(4)}  ${String(c.antes ?? 0).padStart(10)} → ${String(c.despues).padStart(10)}  ${c.name.slice(0, 42)}`)
  }
  if (cambios.length > 10) console.log(`     … y ${cambios.length - 10} más`)

  if (sinEsaLista.length) {
    // Quedan fuera del recálculo, así que conviene tenerlos en Excel: casi
    // siempre son productos que el proveedor ya no publica.
    const estado = await sql<{ id: number; isActive: boolean; departamento: string | null }[]>`
      with recursive tree as (
        select id, id as root from public.categories where parent_id is null
        union all
        select c.id, t.root from public.categories c join tree t on c.parent_id = t.id
      )
      select p.id, p.is_active, raiz.name as departamento
      from public.products p
      left join tree t on t.id = p.category_id
      left join public.categories raiz on raiz.id = t.root
      where p.id = any(${sinEsaLista.map((f) => f.id)})
    `
    const porId = new Map(estado.map((e) => [e.id, e]))
    writeFileSync(
      SIN_LISTA,
      toCsv(
        ['id', 'producto', 'sku', 'departamento', 'visible en la tienda', 'costo actual', 'listas publicadas', 'qué pasa'],
        sinEsaLista.map((f) => {
          const e = porId.get(f.id)
          const cuantas = Object.keys(f.listas).length
          return [
            f.id,
            f.name,
            f.sku,
            e?.departamento ?? null,
            e?.isActive ? 'sí' : 'no',
            f.costPrice,
            cuantas,
            cuantas === 0 ? 'El proveedor ya no lo publica' : `No tiene la lista ${lista}`,
          ]
        }),
      ),
    )
    const visibles = sinEsaLista.filter((f) => porId.get(f.id)?.isActive).length
    console.log(`\nSin la lista ${lista}: ${sinEsaLista.length} productos (${visibles} todavía visibles) → ${SIN_LISTA}`)
    for (const f of sinEsaLista.slice(0, 10)) {
      console.log(`     ${String(f.id).padStart(4)}  ${Object.keys(f.listas).length} listas  ${f.name.slice(0, 48)}`)
    }
    if (sinEsaLista.length > 10) console.log(`     … y ${sinEsaLista.length - 10} más, todos en el Excel`)
  }

  if (!guardar) {
    console.log('\nPlan únicamente. Añade --aplicar para guardar los costos.')
    await sql.end()
    return
  }

  for (const c of cambios) {
    await sql`update public.products set cost_price = ${c.despues} where id = ${c.id}`
  }
  console.log(`\n${cambios.length} costos actualizados.`)

  // El precio de venta sale del costo por el margen, así que hay que rehacerlo
  // en el mismo paso: dejar el costo nuevo con el precio viejo sería publicar
  // márgenes que no existen.
  const recalculados = await recalculatePrices(
    sql,
    cambios.map((c) => c.id),
  )
  console.log(`${recalculados} precios de venta recalculados con los márgenes del panel.`)
  await sql.end()
}

async function main() {
  if (flag('--descubrir')) return descubrir()

  if (flag('--identificar')) {
    const precios = args
      .slice(args.indexOf('--identificar') + 1)
      .filter((a) => !a.startsWith('--'))
      .map((a) => Number(a.replace(/[^\d]/g, '')))
      .filter((n) => n > 0)
    if (precios.length === 0) throw new Error('Dame al menos un precio: --identificar 1590289')
    return identificar(precios, cargar())
  }

  const lista = valor('--lista')
  if (lista) return aplicar(lista, flag('--aplicar'))

  resumenDeListas(cargar())
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await db().end()
  process.exit(1)
})
