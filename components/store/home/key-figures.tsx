import type { CatalogFigures } from '@/lib/server/catalog'

/** Redondea hacia abajo a la centena para no prometer de más: 2.776 → «+2.700». */
function bigNumber(value: number): string {
  if (value < 100) return String(value)
  return `+${(Math.floor(value / 100) * 100).toLocaleString('es-CO')}`
}

/**
 * Cifras del catálogo bajo la presentación de la empresa. Salen de la base de datos,
 * así que crecen solas a medida que se carga el portafolio.
 */
export function KeyFigures({ figures }: { figures: CatalogFigures }) {
  const items = [
    { value: bigNumber(figures.products), label: 'Referencias activas' },
    { value: String(figures.departments), label: 'Líneas de producto' },
    { value: bigNumber(figures.brands), label: 'Marcas que distribuimos' },
    { value: '24/7', label: 'Catálogo siempre abierto' },
  ]
  return (
    <dl className="reveal-children grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="border-l-2 border-brand-blue pl-4 md:pl-5">
          <dt className="font-display text-3xl leading-none text-brand-navy tabular md:text-4xl">{item.value}</dt>
          <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.label}</dd>
        </div>
      ))}
    </dl>
  )
}
