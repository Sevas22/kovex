import type { Metadata } from 'next'
import { FileTextIcon } from 'lucide-react'
import Image from 'next/image'
import { CompanyHeading } from '@/components/store/home/company-heading'
import { JsonLd } from '@/components/store/json-ld'
import { Logo } from '@/components/brand/logo'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { listPublicCatalogs } from '@/lib/server/seasonal-catalogs'
import { getSiteUrl } from '@/lib/server/site-url'

export const metadata: Metadata = {
  title: 'Catálogos de temporada',
  description:
    'Catálogos de temporada de KOVEX Colombia: Navidad, novedades y colecciones especiales. Ábrelos y cotiza por WhatsApp.',
  alternates: { canonical: '/temporadas' },
}

export default async function TemporadasPage() {
  const [catalogos, site] = await Promise.all([listPublicCatalogs(), getSiteUrl()])

  return (
    <>
      {catalogos.length > 0 ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Catálogos de temporada de KOVEX Colombia',
            itemListElement: catalogos.map((c, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: c.title,
              url: c.fileUrl.startsWith('http') ? c.fileUrl : `${site}${c.fileUrl}`,
            })),
          }}
        />
      ) : null}

      <section className="border-b bg-brand-mist">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <p className="flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.25em] text-brand-blue uppercase">
            <span aria-hidden="true" className="inline-block size-1.5 rotate-45 bg-brand-cyan" />
            Temporadas
          </p>
          <CompanyHeading className="mt-4">Catálogos de temporada</CompanyHeading>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground md:text-lg">
            Colecciones y novedades que cambian con la temporada. Ábrelos, mira lo que te sirve y escríbenos por
            WhatsApp con las referencias que te interesen.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          {catalogos.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Todavía no hay catálogos publicados</EmptyTitle>
                <EmptyDescription>
                  Pronto encontrarás aquí las colecciones de temporada. Mientras tanto, mira el catálogo completo.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {catalogos.map((c) => (
                <li key={c.id}>
                  <a
                    href={c.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chamfer chamfer-lg group/cat flex h-full flex-col overflow-hidden border bg-card transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-[3/4] bg-brand-mist">
                      {c.coverUrl ? (
                        <Image
                          src={c.coverUrl}
                          alt={`Portada de ${c.title}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover/cat:scale-[1.03]"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center" role="img" aria-label={c.title}>
                          <Logo variant="mark" className="h-1/4 opacity-15" />
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h2 className="font-display text-base leading-snug text-brand-navy uppercase">{c.title}</h2>
                      {c.description ? (
                        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                      ) : null}
                      <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-brand-blue">
                        <FileTextIcon className="size-4" aria-hidden="true" />
                        Abrir catálogo
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
