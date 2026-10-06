import type { Metadata } from 'next'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { JsonLd } from '@/components/store/json-ld'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { POSTS, type Bloque, otrosPosts, postBySlug } from '@/lib/blog'
import { getPublicStoreInfo } from '@/lib/server/settings'
import { getSiteUrl } from '@/lib/server/site-url'
import { whatsappLink } from '@/lib/whatsapp'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = postBySlug(slug)
  if (!post) return { title: 'Artículo no encontrado' }
  return {
    title: post.titulo,
    description: post.resumen,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: 'article', publishedTime: post.fecha, title: post.titulo, description: post.resumen },
  }
}

const fecha = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

/** Un bloque del cuerpo. El contenido es nuestro, así que no hace falta sanear. */
function Bloque({ b }: { b: Bloque }) {
  switch (b.t) {
    case 'h2':
      return <h2 className="mt-12 font-display text-xl leading-snug text-brand-navy uppercase md:text-2xl">{b.x}</h2>
    case 'ul':
      return (
        <ul className="mt-5 flex flex-col gap-3">
          {b.x.map((li) => (
            <li key={li} className="flex gap-3 leading-relaxed">
              <span aria-hidden="true" className="mt-2.5 inline-block size-1.5 shrink-0 rotate-45 bg-brand-cyan" />
              {li}
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="mt-5 flex flex-col gap-3">
          {b.x.map((li, i) => (
            <li key={li} className="flex gap-3 leading-relaxed">
              <span className="font-display text-sm text-brand-blue tabular">{String(i + 1).padStart(2, '0')}</span>
              {li}
            </li>
          ))}
        </ol>
      )
    case 'cita':
      return (
        <blockquote className="mt-10 border-l-2 border-brand-cyan pl-5 font-display text-lg leading-snug text-brand-navy uppercase">
          {b.x}
        </blockquote>
      )
    default:
      return <p className="mt-5 leading-relaxed">{b.x}</p>
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = postBySlug(slug)
  if (!post) notFound()

  const [site, store] = await Promise.all([getSiteUrl(), getPublicStoreInfo()])
  const otros = otrosPosts(slug)
  const whatsappUrl = whatsappLink(store.whatsappNumber, 'Hola KOVEX, quiero información sobre sus productos.')

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.titulo,
          description: post.resumen,
          datePublished: post.fecha,
          dateModified: post.fecha,
          inLanguage: 'es-CO',
          mainEntityOfPage: { '@type': 'WebPage', '@id': `${site}/blog/${post.slug}` },
          author: { '@id': `${site}/#organizacion` },
          publisher: { '@id': `${site}/#organizacion` },
          articleSection: post.etiqueta,
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Blog', item: `${site}/blog` },
            { '@type': 'ListItem', position: 2, name: post.titulo, item: `${site}/blog/${post.slug}` },
          ],
        }}
      />

      <article className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/blog" />}>Blog</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{post.etiqueta}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <p className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] text-brand-blue uppercase">
            {post.etiqueta}
            <span aria-hidden="true" className="text-muted-foreground">
              ·
            </span>
            <time dateTime={post.fecha} className="font-normal tracking-normal text-muted-foreground normal-case">
              {fecha(post.fecha)} · {post.minutos} min de lectura
            </time>
          </p>

          <h1 className="mt-4 font-display text-2xl leading-tight text-brand-navy uppercase md:text-4xl">
            {post.titulo}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.resumen}</p>

          <div className="mt-10 border-t pt-2 text-base text-foreground">
            {post.cuerpo.map((b, i) => (
              <Bloque key={i} b={b} />
            ))}
          </div>

          <aside className="chamfer chamfer-lg mt-14 border bg-brand-mist p-7 md:p-9">
            <p className="font-display text-lg leading-snug text-brand-navy uppercase">
              ¿Necesitas surtir tu negocio?
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Ferretería, agro, hogar, maquinaria, tecnología y electro en un solo proveedor. Arma tu pedido en el
              catálogo y ciérralo con un asesor por WhatsApp.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="chamfer" nativeButton={false} render={<Link href="/catalogo" />}>
                Ver catálogo
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
              >
                <WhatsAppIcon data-icon="inline-start" className="text-whatsapp-600" />
                Hablar con un asesor
              </Button>
            </div>
          </aside>
        </div>
      </article>

      {otros.length > 0 && (
        <section className="border-t bg-brand-mist">
          <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
            <h2 className="font-display text-xl text-brand-navy uppercase">Sigue leyendo</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {otros.map((o) => (
                <article key={o.slug} className="chamfer chamfer-lg relative border bg-card p-6">
                  <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-brand-blue uppercase">
                    {o.etiqueta}
                  </p>
                  <h3 className="mt-3 font-display text-base leading-snug text-brand-navy uppercase">
                    <Link href={`/blog/${o.slug}`} className="after:absolute after:inset-0">
                      {o.titulo}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{o.resumen}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
