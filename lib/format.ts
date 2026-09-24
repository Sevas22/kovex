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

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : pluralForm}`
}
