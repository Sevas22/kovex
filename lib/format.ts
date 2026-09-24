const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function formatCOP(value: number): string {
  return cop.format(value)
}

const integer = new Intl.NumberFormat('es-CO')

export function formatNumber(value: number): string {
  return integer.format(value)
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(value)} %`
}

const dateTime = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Bogota',
})

const dateOnly = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'long',
  timeZone: 'America/Bogota',
})

export function formatDateTime(value: Date | string): string {
  return dateTime.format(new Date(value))
}

export function formatDate(value: Date | string): string {
  return dateOnly.format(new Date(value))
}

export function plural(count: number, singular: string, pluralForm = pluralOf(singular)): string {
  return `${formatNumber(count)} ${count === 1 ? singular : pluralForm}`
}

/** Plural español sencillo: vocal → +s, consonante → +es (unidad → unidades, galón → galones). */
export function pluralOf(word: string): string {
  const lower = word.toLowerCase()
  if (/[aeiouáéíóú]$/.test(lower)) return `${word}s`
  if (/ón$/.test(lower)) return `${word.slice(0, -2)}ones`
  if (/[zZ]$/.test(word)) return `${word.slice(0, -1)}ces`
  return `${word}es`
}
