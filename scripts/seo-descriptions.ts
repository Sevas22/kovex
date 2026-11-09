/**
 * Descripciones de los departamentos, para buscadores y para modelos de IA.
 *
 *   pnpm seo:descripciones            muestra el plan
 *   pnpm seo:descripciones --aplicar  las guarda
 *
 * Las que había medían entre 37 y 54 caracteres («Electrodomésticos grandes y
 * pequeños.»). Con eso una categoría no compite por «electrodomésticos al por
 * mayor», y un modelo que responde «¿dónde compro X al por mayor en Colombia?»
 * no tiene de dónde citar.
 *
 * Cada texto nombra marcas que KOVEX de verdad distribuye en esa línea —se
 * sacaron del catálogo, no se inventaron— porque la marca es lo que el
 * comprador mayorista busca y lo que el modelo reconoce. Se quedan por debajo
 * de 165 caracteres para que Google no las corte.
 */
import { db } from '@/lib/server/db'

const aplicar = process.argv.includes('--aplicar')

const TEXTOS: Record<string, string> = {
  Agro: 'Insumos agropecuarios al por mayor: sacos y empaques de polipropileno, herramienta de campo Bellota, cuerda Trenzacol y carretillas Duragro. Envíos a toda Colombia.',
  Electro:
    'Electrodomésticos al por mayor para almacenes y distribuidores: neveras, lavadoras y estufas Haceb, Mabe y Electrolux, y línea pequeña Oster y Hamilton Beach.',
  Ferretería:
    'Ferretería y construcción al por mayor: enchape y sanitarios Corona, grifería Grival, línea eléctrica Mercury, herramienta Abracol, brochas Caribe y lámina Acesco.',
  Hogar:
    'Artículos para el hogar al por mayor: ollas Imusa, plástico Rimax y Plastired, vajilla Corona, cristalería Cristar y colchones Spring. Precio por volumen.',
  Maquinaria:
    'Maquinaria liviana al por mayor: motobombas, motores a gasolina y generadores Tracker para agro, construcción y respaldo eléctrico. Envíos a toda Colombia.',
  Tecnología:
    'Tecnología al por mayor para almacenes: televisores Samsung, Hyundai y Haier, audio y accesorios de cómputo, con precio por volumen y despacho nacional.',
}

async function main() {
  const sql = db()
  const actuales = await sql<{ id: number; name: string; description: string | null }[]>`
    select id, name, description from public.categories where parent_id is null order by name
  `

  let cambios = 0
  for (const c of actuales) {
    const nuevo = TEXTOS[c.name]
    if (!nuevo) {
      console.log(`  (sin texto preparado para ${c.name})`)
      continue
    }
    if (nuevo === c.description) continue
    cambios++
    console.log(`\n${c.name}  ${c.description?.length ?? 0} → ${nuevo.length} caracteres`)
    console.log(`  antes: ${c.description ?? '(vacía)'}`)
    console.log(`  ahora: ${nuevo}`)
    if (aplicar) await sql`update public.categories set description = ${nuevo} where id = ${c.id}`
  }

  console.log(`\n${cambios} departamentos ${aplicar ? 'actualizados' : 'por actualizar'}`)
  if (!aplicar) console.log('Plan únicamente. Añade --aplicar para guardarlas.')
  await sql.end()
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await db().end()
  process.exit(1)
})
