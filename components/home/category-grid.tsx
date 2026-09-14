import Link from 'next/link'
import { ArrowRight, Brush, PaintRoller, ShieldCheck, Wrench, Zap } from 'lucide-react'
import { CATEGORIES } from '@/lib/data'

const ICONS: Record<string, typeof Brush> = {
  'brochas-rodillos': Brush,
  herramientas: Wrench,
  electricas: Zap,
  adhesivos: PaintRoller,
  seguridad: ShieldCheck,
}

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-navy md:text-3xl">
            Explora por categoría
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Miles de soluciones para ferretería, pintura y más.
          </p>
        </div>
        <Link
          href="/catalogo"
          className="hidden items-center gap-1 text-sm font-semibold text-brand-blue hover:underline sm:flex"
        >
          Ver todo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((c) => {
          const Icon = ICONS[c.id] ?? Wrench
          return (
            <Link
              key={c.id}
              href={`/catalogo?cat=${c.slug}`}
              className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center transition-all hover:border-brand-blue hover:shadow-md"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                <Icon className="h-7 w-7" />
              </span>
              <span className="text-sm font-semibold text-foreground">{c.name}</span>
              <span className="flex items-center gap-1 text-xs font-medium text-brand-blue">
                Ver productos
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
