/**
 * Plural de las unidades de venta.
 *
 * Las unidades del proveedor no son palabras sueltas: hay «Unidad» y «Metro»,
 * pero también «Paquete Por 6 Unidades» y «Caja x 8 Canastillas». Pluralizar la
 * cadena completa produciría «Paquete Por 6 Unidadess», así que solo se flexiona
 * el núcleo —la primera palabra— y el resto se deja como está.
 */

/** Plural de una palabra suelta en español. */
function pluralPalabra(w: string): string {
  if (/[aeiouáéíóú]$/i.test(w)) return `${w}s`
  if (/z$/i.test(w)) return `${w.slice(0, -1)}ces`
  // Las agudas terminadas en -ón, -án o -és pierden la tilde: galón → galones.
  const sinTilde = w.replace(/ó(n)$/i, 'o$1').replace(/á(n)$/i, 'a$1').replace(/é(s)$/i, 'e$1')
  return `${sinTilde}es`
}

/**
 * La unidad escrita para una cantidad, en minúsculas.
 *
 *   unitLabel('Unidad', 12)                 → 'unidades'
 *   unitLabel('Galón', 3)                   → 'galones'
 *   unitLabel('Metro Cuadrado', 5)          → 'metros cuadrados'
 *   unitLabel('Paquete Por 6 Unidades', 2)  → 'paquetes por 6 unidades'
 */
export function unitLabel(unit: string, quantity: number): string {
  const limpio = unit.trim().toLowerCase()
  if (!limpio) return ''
  if (Math.abs(quantity) === 1) return limpio

  const partes = limpio.split(/\s+/)
  partes[0] = pluralPalabra(partes[0])
  // Concordancia del adjetivo cuando la unidad son dos palabras: «metro cuadrado».
  if (partes.length === 2 && /[oa]$/.test(partes[1])) partes[1] = pluralPalabra(partes[1])
  return partes.join(' ')
}
