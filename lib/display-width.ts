// Ancho de cada carácter en mayúsculas de la tipografía de titulares (Michroma),
// medido en «em». Sirve para que un banner calcule su propio tamaño de letra y la
// frase ocupe el ancho disponible sin desbordarse ni partirse en dos líneas.
const ADVANCE: Record<string, number> = {
  A: 1.073, B: 1.041, C: 1.057, D: 1.088, E: 0.885, F: 0.854, G: 1.073, H: 1.076,
  I: 0.291, J: 0.847, K: 0.994, L: 0.823, M: 1.381, N: 1.143, O: 1.057, P: 0.982,
  Q: 1.057, R: 1.029, S: 1.056, T: 0.946, U: 1.045, V: 1.01, W: 1.635, X: 1.073,
  Y: 1.073, Z: 1.009, Á: 1.073, É: 0.885, Í: 0.291, Ó: 1.057, Ú: 1.045, Ñ: 1.143,
  Ü: 1.045, '0': 0.961, '1': 0.961, '2': 0.961, '3': 0.961, '4': 1.01, '5': 0.961,
  '6': 0.961, '7': 0.979, '8': 0.961, '9': 0.979, ' ': 0.294, '.': 0.229, ',': 0.229,
  ';': 0.229, ':': 0.229, '!': 0.287, '¡': 0.287, '?': 0.916, '¿': 0.916, '-': 0.51,
  '–': 0.541, '—': 0.541, "'": 0.229, '"': 0.385, '(': 0.385, ')': 0.385, '%': 1.899,
  '&': 1.198, '+': 0.694, '/': 0.51,
}

const DEFAULT_ADVANCE = 1.05
/** Margen de seguridad por si la tipografía cae en la alternativa del sistema. */
const SAFETY = 1.02

/** Ancho de la frase en «em» (con el interletrado de .font-display incluido). */
export function displayWidth(text: string): number {
  const upper = text.toUpperCase()
  let width = 0
  for (const char of upper) width += (ADVANCE[char] ?? DEFAULT_ADVANCE) + 0.01
  return Math.round(width * SAFETY * 100) / 100
}
