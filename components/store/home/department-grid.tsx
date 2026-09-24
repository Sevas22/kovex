import Link from 'next/link'
import { SectionHeading } from './section-heading'
import { ProductImage } from '@/components/store/product-image'
import { plural } from '@/lib/format'
import type { Department } from '@/lib/types'

export function DepartmentGrid({ departments }: { departments: Department[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <SectionHeading
        title="Compra por departamento"
        description="Seis líneas de producto para abastecer tu negocio."
        link={{ href: '/catalogo', label: 'Todo el catálogo' }}
        className="reveal"
      />
      <ul className="reveal-children grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {departments.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/catalogo/${d.slug}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-md border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue hover:shadow-lg hover:shadow-brand-navy/5"
            >
              {/* Esquina azul a 45°: el brazo superior del monograma, crece al pasar el mouse */}
              <span
                className="absolute top-0 right-0 z-10 size-7 bg-brand-blue transition-all duration-300 group-hover:size-11 [clip-path:polygon(0_0,100%_0,100%_100%)]"
                aria-hidden="true"
              />
              <div className="relative aspect-square transition-transform duration-500 group-hover:scale-105">
                <ProductImage src={d.image} alt="" sizes="(max-width: 640px) 50vw, 16vw" className="p-5" />
              </div>
              <div className="border-t px-3 py-3">
                <p className="font-semibold text-brand-navy group-hover:text-brand-blue">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {d.productCount ? plural(d.productCount, 'producto') : 'Próximamente'}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
