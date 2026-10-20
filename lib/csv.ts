/**
 * Lectura y escritura de CSV pensada para que Excel en español no lo rompa.
 *
 * Tres decisiones que importan:
 *
 * - **Separador `;`**. Excel en configuración española espera punto y coma; con
 *   comas abre todo en una sola columna. Ningún nombre del catálogo contiene
 *   `;`, así que es seguro.
 * - **BOM al inicio**. Sin él Excel lee el archivo como ANSI y las tildes y las
 *   eñes salen rotas.
 * - **Coma o punto decimal al leer**. Según cómo tenga configurado Windows,
 *   Excel escribe `15,5` o `15.5`. Los dos tienen que servir.
 */

const SEP = ';'
const BOM = '﻿'

/**
 * Escapa un valor: comillas dobladas y entrecomillado si hace falta.
 *
 * Se entrecomilla también la coma aunque no sea nuestro separador: así el
 * archivo sobrevive si alguien lo abre con una herramienta que sí la usa.
 */
function escapar(valor: unknown): string {
  if (valor == null) return ''
  const texto = String(valor)
  return /["\n\r;,]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const lineas = [headers.map(escapar).join(SEP), ...rows.map((r) => r.map(escapar).join(SEP))]
  // CRLF: lo que espera Excel en Windows.
  return BOM + lineas.join('\r\n') + '\r\n'
}

/** Una fila ya separada en celdas, con el número de línea del archivo. */
export interface CsvRow {
  linea: number
  celdas: string[]
}

/**
 * Separa un CSV respetando las comillas. Acepta `;` o `,` como separador —se
 * deduce de la cabecera— por si el archivo pasó por otra herramienta.
 */
export function parseCsv(texto: string): { headers: string[]; rows: CsvRow[] } {
  const limpio = texto.replace(/^﻿/, '')
  const sep = (limpio.split('\n')[0]?.match(/;/g)?.length ?? 0) >= (limpio.split('\n')[0]?.match(/,/g)?.length ?? 0) ? ';' : ','

  const filas: string[][] = []
  let celda = ''
  let fila: string[] = []
  let enComillas = false

  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i]
    if (enComillas) {
      if (c === '"') {
        if (limpio[i + 1] === '"') { celda += '"'; i++ } else enComillas = false
      } else celda += c
    } else if (c === '"') {
      enComillas = true
    } else if (c === sep) {
      fila.push(celda); celda = ''
    } else if (c === '\n') {
      fila.push(celda); filas.push(fila); fila = []; celda = ''
    } else if (c !== '\r') {
      celda += c
    }
  }
  if (celda !== '' || fila.length) { fila.push(celda); filas.push(fila) }

  const [cabecera = [], ...resto] = filas
  return {
    headers: cabecera.map((h) => h.trim().toLowerCase()),
    // +2: la cabecera es la línea 1 y las filas empiezan en la 2, que es como
    // las numera Excel y como el usuario va a buscarlas.
    rows: resto
      .map((celdas, i) => ({ linea: i + 2, celdas }))
      .filter((r) => r.celdas.some((c) => c.trim() !== '')),
  }
}

/** Número escrito por Excel: acepta coma o punto decimal y separadores de miles. */
export function parseNumero(valor: string): number | null {
  const limpio = valor.trim()
  if (limpio === '') return null
  // Si hay coma y punto, el último que aparece es el decimal.
  const ultimaComa = limpio.lastIndexOf(',')
  const ultimoPunto = limpio.lastIndexOf('.')
  let normal = limpio
  if (ultimaComa >= 0 && ultimoPunto >= 0) {
    normal = ultimaComa > ultimoPunto ? limpio.replace(/\./g, '').replace(',', '.') : limpio.replace(/,/g, '')
  } else if (ultimaComa >= 0) {
    normal = limpio.replace(',', '.')
  }
  const n = Number(normal.replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : null
}
