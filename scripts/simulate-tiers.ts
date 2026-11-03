/**
 * Simula una escala por cantidad contra el catálogo real.
 *
 *   pnpm catalog:simular-escala --escala "5:30,10:40"
 *
 * El descuento por volumen no puede bajar del piso (costo + margen mínimo), así
 * que un descuento del 30% solo es posible si el margen base da para regalarlo.
 * La cuenta es: para descontar D% hace falta un margen de al menos
 * (1 + mínimo) / (1 - D) − 1. Con el 5% de mínimo, descontar 30% exige un 50%
 * de margen; con 10% de margen el tope real es 4,5%.
 *
 * Esto recorre el catálogo con el mismo motor que usa la tienda y dice, escalón
 * por escalón y departamento por departamento, cuántos productos lo pueden dar
 * de verdad. Sirve para decidir márgenes antes de prometerle descuentos a nadie.
 */
import { db } from '@/lib/server/db'
import { loadSettings } from '@/lib/server/settings'
import { buildPriceTiers, floorPriceFor, type VolumeTier } from '@/lib/volume-pricing'

const args = process.argv.slice(2)
const valor = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}

/** «5:30,10:40» → [{minQty:5,percent:30},{minQty:10,percent:40}] */
function parseEscala(texto: string): VolumeTier[] {
  return texto
    .split(',')
    .map((parte) => {
      const [q, p] = parte.split(':').map((x) => Number(x.trim()))
      if (!Number.isFinite(q) || !Number.isFinite(p)) throw new Error(`No entiendo el escalón «${parte}». Usa 5:30`)
      return { minQty: q, percent: p }
    })
    .sort((a, b) => a.minQty - b.minQty)
}

/** Margen que haría falta para poder dar ese descuento sin bajar del piso. */
const margenNecesario = (descuento: number, minimo: number) => ((100 + minimo) / (1 - descuento / 100) - 100)

interface Row {
  id: number
  name: string
  price: number | null
  costPrice: number | null
  departamento: string | null
}

async function main() {
  const texto = valor('--escala')
  if (!texto) throw new Error('Dame la escala: --escala "5:30,10:40"')
  const escala = parseEscala(texto)
  const margenCrudo = valor('--margen')
  const margenSimulado = margenCrudo == null ? null : Number(margenCrudo)
  if (margenSimulado != null && !Number.isFinite(margenSimulado)) throw new Error('--margen tiene que ser un número')

  const sql = db()
  const settings = await loadSettings(sql)
  const rows = await sql<Row[]>`
    with recursive tree as (
      select id, id as root from public.categories where parent_id is null
      union all
      select c.id, t.root from public.categories c join tree t on c.parent_id = t.id
    )
    select p.id, p.name, p.price, p.cost_price, raiz.name as departamento
    from public.products p
    left join tree t on t.id = p.category_id
    left join public.categories raiz on raiz.id = t.root
    where p.is_active and p.price is not null and p.cost_price is not null and p.cost_price > 0
  `

  console.log(`escala pedida: ${escala.map((t) => `${t.minQty} u. −${t.percent}%`).join(' · ')}`)
  console.log(`margen mínimo configurado: ${settings.minMarginPercent}%\n`)

  console.log('  Para dar cada descuento hace falta este margen base:')
  for (const t of escala) {
    console.log(`     −${String(t.percent).padStart(2)}%  →  margen de ${margenNecesario(t.percent, settings.minMarginPercent).toFixed(0)}%`)
  }

  // Por departamento: cuántos productos logran de verdad cada escalón.
  const porDep = new Map<string, { n: number; logran: number[]; topeMedio: number }>()
  for (const r of rows) {
    const dep = r.departamento ?? '(sin departamento)'
    const acc = porDep.get(dep) ?? { n: 0, logran: escala.map(() => 0), topeMedio: 0 }
    acc.n++

    // Con --margen se simula qué pasaría si el catálogo tuviera ese margen.
    // El IVA no distorsiona la cuenta: el costo y el precio lo llevan los dos,
    // así que la proporción entre ellos —que es lo que deja sitio al descuento—
    // no cambia.
    const precio = margenSimulado == null ? r.price : Math.round((r.costPrice! * (100 + margenSimulado)) / 100)

    const escalera = buildPriceTiers({
      listPrice: precio,
      tiers: escala,
      floorPrice: floorPriceFor(r.costPrice, settings.minMarginPercent),
      rounding: settings.priceRounding,
    })
    escala.forEach((t, i) => {
      const logrado = escalera.find((e) => e.minQty === t.minQty)
      // Se cuenta como logrado si da al menos el 90% del descuento pedido.
      if (logrado && logrado.percent >= t.percent * 0.9) acc.logran[i]++
    })
    // Tope real de este producto: cuánto se puede descontar hasta tocar el piso.
    const piso = floorPriceFor(r.costPrice, settings.minMarginPercent) ?? 0
    acc.topeMedio += precio! > 0 ? Math.max(0, (1 - piso / precio!) * 100) : 0
    porDep.set(dep, acc)
  }

  console.log('\n  departamento     productos   descuento máximo posible   ' + escala.map((t) => `−${t.percent}%`).join('   '))
  let total = 0
  const totalLogran = escala.map(() => 0)
  for (const [dep, a] of [...porDep].sort((x, y) => y[1].n - x[1].n)) {
    total += a.n
    a.logran.forEach((n, i) => (totalLogran[i] += n))
    const celdas = a.logran.map((n) => String(n).padStart(5)).join('   ')
    console.log(`  ${dep.padEnd(16)} ${String(a.n).padStart(9)}   ${(a.topeMedio / a.n).toFixed(1).padStart(21)}%   ${celdas}`)
  }
  console.log(`  ${'TOTAL'.padEnd(16)} ${String(total).padStart(9)}   ${''.padStart(22)}   ${totalLogran.map((n) => String(n).padStart(5)).join('   ')}`)

  console.log('\n  (las últimas columnas son cuántos productos alcanzan ese descuento sin bajar del piso)')
  await sql.end()
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await db().end()
  process.exit(1)
})
