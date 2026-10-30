/**
 * Genera lib/colombia.ts con los departamentos y municipios oficiales.
 *
 *   pnpm colombia:build
 *
 * La fuente es el DANE, publicado en datos.gov.co: 1.122 municipios en 33
 * departamentos. Se genera en vez de escribirse a mano porque la lista cambia
 * (se crean municipios) y porque teclear 1.122 nombres con sus tildes invita a
 * errores que solo aparecen cuando un comprador no encuentra su pueblo.
 *
 * El resultado se versiona: la tienda no consulta nada en línea al pintar el
 * formulario.
 */
import { writeFileSync } from 'node:fs'
import { titleCase } from '@/lib/text'

const FUENTE = 'https://www.datos.gov.co/resource/82di-kkh9.json?$limit=2000'
const SALIDA = 'lib/colombia.ts'

interface Fila {
  cod_mpio: string
  dpto: string
  nom_mpio: string
}

/** «BOGOTÁ, D.C.» no sobrevive a un title case normal: queda «Bogotá, D.c.». */
const nombre = (raw: string) => titleCase(raw).replace(/\bD\.c\.?/gi, 'D.C.')

async function main() {
  const res = await fetch(FUENTE, { signal: AbortSignal.timeout(60_000) })
  if (!res.ok) throw new Error(`datos.gov.co respondió ${res.status}`)
  const filas = (await res.json()) as Fila[]
  if (!Array.isArray(filas) || filas.length < 1000) {
    throw new Error(`Se esperaban más de 1.000 municipios y llegaron ${filas.length}.`)
  }

  // El código de municipio son 5 dígitos: los dos primeros son el departamento.
  const porDepartamento = new Map<string, { name: string; municipios: string[] }>()
  for (const f of filas) {
    const code = f.cod_mpio.slice(0, 2)
    const entry = porDepartamento.get(code) ?? { name: nombre(f.dpto), municipios: [] }
    entry.municipios.push(nombre(f.nom_mpio))
    porDepartamento.set(code, entry)
  }

  const cmp = (a: string, b: string) => a.localeCompare(b, 'es')
  const departamentos = [...porDepartamento.entries()]
    .map(([code, d]) => ({ code, name: d.name, municipios: d.municipios.sort(cmp) }))
    .sort((a, b) => cmp(a.name, b.name))

  const cuerpo = departamentos
    .map(
      (d) =>
        `  { code: '${d.code}', name: ${JSON.stringify(d.name)}, municipios: [${d.municipios
          .map((m) => JSON.stringify(m))
          .join(', ')}] },`,
    )
    .join('\n')

  writeFileSync(
    SALIDA,
    `/**
 * Departamentos y municipios de Colombia, según el DANE.
 *
 * Generado por \`pnpm colombia:build\`; no se edita a mano.
 * ${filas.length} municipios en ${departamentos.length} departamentos.
 *
 * Hay nombres repetidos entre departamentos —San Andrés existe en Santander y
 * en el archipiélago—, así que el municipio solo identifica un lugar junto con
 * su departamento. Por eso el pedido guarda los dos.
 */

export interface Departamento {
  /** Código DANE de dos dígitos. */
  code: string
  name: string
  municipios: string[]
}

export const DEPARTAMENTOS: Departamento[] = [
${cuerpo}
]

/** Municipios de un departamento, por nombre. Vacío si el nombre no existe. */
export function municipiosDe(departamento: string): string[] {
  return DEPARTAMENTOS.find((d) => d.name === departamento)?.municipios ?? []
}

/** Si el municipio pertenece de verdad a ese departamento. */
export function esMunicipioValido(departamento: string, municipio: string): boolean {
  return municipiosDe(departamento).includes(municipio)
}
`,
  )

  console.log(`${filas.length} municipios · ${departamentos.length} departamentos → ${SALIDA}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
