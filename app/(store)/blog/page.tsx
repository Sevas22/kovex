import type { Metadata } from 'next'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { CompanyHeading } from '@/components/store/home/company-heading'
import { JsonLd } from '@/components/store/json-ld'
import { POSTS } from '@/lib/blog'
import { getSiteUrl } from '@/lib/server/site-url'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Guías prácticas para comprar al por mayor en Colombia: precios por volumen, cómo surtir un negocio y cómo elegir proveedor.',
  alternates: { canonical: '/blog' },
}

const fecha = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function BlogPage() {
  const site = await getSiteUrl()

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          '@id': `${site}/blog`,
          name: 'Blog de KOVEX Colombia',
          description: metadata.description,
          inLanguage: 'es-CO',
          publisher: { '@id': `${site}/#organizacion` },
          blogPost: POSTS.map((p) => ({
            '@type': 'BlogPosting',
            headline: p.titulo,
            description: p.resumen,
            datePublished: p.fecha,
            url: `${site}/blog/${p.slug}`,
          })),
        }}
      />

      <section className="border-b bg-brand-mist">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <p className="flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.25em] text-brand-blue uppercase">
            <span aria-hidden="true" className="inline-block size-1.5 rotate-45 bg-brand-cyan" />
            Blog
          </p>
          <CompanyHeading className="mt-4">Comprar mejor para tu negocio</CompanyHeading>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground md:text-lg">
            Guías prácticas sobre compra al por mayor en Colombia: cómo calcular márgenes, cuándo conviene subir la
            cantidad del pedido y qué mirar antes de escoger proveedor.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-2 md:py-20 lg:grid-cols-3">
          {POSTS.map((p) => (
            <article
              key={p.slug}
              className="chamfer chamfer-lg group/post relative flex flex-col border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <p className="flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand-blue uppercase">
                {p.etiqueta}
                <span aria-hidden="true" className="text-muted-foreground">
                  ·
                </span>
                <span className="font-normal tracking-normal text-muted-foreground normal-case">
                  {p.minutos} min de lectura
                </span>
              </p>

              <h2 className="mt-4 font-display text-lg leading-snug text-brand-navy uppercase">
                <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0">
                  {p.titulo}
                </Link>
              </h2>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.resumen}</p>

              <p className="mt-6 flex items-center justify-between border-t pt-4 text-sm">
                <time dateTime={p.fecha} className="text-muted-foreground">
                  {fecha(p.fecha)}
                </time>
                <span className="flex items-center gap-1.5 font-semibold text-brand-blue">
                  Leer
                  <ArrowRightIcon className="size-4 transition-transform group-hover/post:translate-x-0.5" aria-hidden="true" />
                </span>
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
