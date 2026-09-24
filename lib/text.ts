const DIACRITICS = /[̀-ͯ]/g

/** Minúsculas, sin tildes ni signos: base para búsquedas. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, ' ')
    .trim()
}

export function slugify(value: string, maxLength = 80): string {
  return value
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '')
}

const LOWERCASE_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'o', 'para', 'con', 'en', 'x'])

/** "COMPAÑIA DE EMPAQUES" → "Compañia de Empaques". Respeta siglas cortas con números (3M). */
export function titleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word
      if (/\d/.test(word) && word.length <= 3) return word.toUpperCase()
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

/** Solo dígitos, con indicativo 57 si es un celular colombiano de 10 dígitos. */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('3')) return `57${digits}`
  return digits
}

/** 573001234567 → +57 300 123 4567 */
export function formatPhone(digits: string): string {
  const m = /^57(\d{3})(\d{3})(\d{4})$/.exec(digits)
  return m ? `+57 ${m[1]} ${m[2]} ${m[3]}` : `+${digits}`
}
