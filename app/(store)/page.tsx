import { LayersIcon, MessageCircleIcon, TagIcon } from 'lucide-react'
import { AboutSection } from '@/components/store/home/about-section'
import { Audiences } from '@/components/store/home/audiences'
import { BigMarquee } from '@/components/store/home/big-marquee'
import { CinemaScroll } from '@/components/store/home/cinema-scroll'
import { CtaBand } from '@/components/store/home/cta-band'
import { DepartmentGrid } from '@/components/store/home/department-grid'
import { Faq } from '@/components/store/home/faq'
import { Hero } from '@/components/store/home/hero'
import { HowToBuy } from '@/components/store/home/how-to-buy'
import { Manifesto } from '@/components/store/home/manifesto'
import { MissionValues } from '@/components/store/home/mission-values'
import { PromiseBar } from '@/components/store/home/promise-bar'
import { SectionHeading } from '@/components/store/home/section-heading'
import { StatementBanner } from '@/components/store/home/statement-banner'
import { JsonLd } from '@/components/store/json-ld'
import { ProductCard } from '@/components/store/product-card'
import { COMPANY } from '@/lib/company'
import { getSiteUrl } from '@/lib/server/site-url'
import { getBrands, getCatalogFigures, getDepartments, getFeaturedProducts } from '@/lib/server/catalog'
import { getPublicStoreInfo } from '@/lib/server/settings'
import { whatsappLink } from '@/lib/whatsapp'

const BANNER_ITEMS = [
  { icon: LayersIcon, title: 'Multicategoría', text: 'Seis líneas de producto en un mismo pedido y un solo proveedor.' },
  { icon: TagIcon, title: 'Precio por volumen', text: 'Mientras más compras, mejor queda tu costo por unidad.' },
  { icon: MessageCircleIcon, title: 'Cierre por WhatsApp', text: 'Un asesor confirma disponibilidad, pago y entrega contigo.' },
]

const PROMISE_COLUMNS = [
  {
    title: 'Un solo pedido',
    text: 'Ferretería, agro, hogar, maquinaria, tecnología y electro en la misma compra, con un solo interlocutor.',
  },
  {
    title: 'Precio por volumen',
    text: 'Mientras más unidades, mejor queda tu costo. El asesor te confirma la escala que te corresponde.',
  },
  {
    title: 'Sin frenar tu operación',
    text: 'Disponibilidad real, unidades separadas al confirmar y despachos a toda Colombia.',
  },
]

const PROMISE_WORDS = [
  'Precio mayorista',
  'Disponibilidad real',
  'Marcas con respaldo',
  'Envíos a todo el país',
  'Un solo proveedor',
]

export default async function HomePage() {
  const [departments, featured, brands, store, figures] = await Promise.all([
    getDepartments(),
    getFeaturedProducts(8),
    getBrands(12),
    getPublicStoreInfo(),
    getCatalogFigures(),
  ])
  const quoteUrl = whatsappLink(store.whatsappNumber, 'Hola KOVEX, quiero una cotización mayorista.')
  const questionUrl = whatsappLink(store.whatsappNumber, 'Hola KOVEX, tengo una pregunta.')
  const site = await getSiteUrl()

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: store.businessName,
          url: site,
          logo: `${site}/brand/logo-horizontal.png`,
          description: COMPANY.about,
          slogan: COMPANY.slogan,
          email: store.contactEmail,
          address: { '@type': 'PostalAddress', addressLocality: store.city, addressCountry: 'CO' },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: `+${store.whatsappNumber}`,
            contactType: 'sales',
            areaServed: 'CO',
            availableLanguage: 'es',
          },
        }}
      />
      <Hero whatsappUrl={quoteUrl} categories={departments.map((d) => d.name)} />
      <PromiseBar />

      <StatementBanner
        eyebrow="Distribuidor mayorista multicategoría"
        lines={['Miles de soluciones.', 'Un solo proveedor.']}
        accentFrom={1}
        items={BANNER_ITEMS}
      />

      <DepartmentGrid departments={departments} />
      {featured.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <SectionHeading
            eyebrow="Selección KOVEX"
            title="Productos destacados"
            description="Lo que más piden nuestros clientes mayoristas."
            link={{ href: '/catalogo', label: 'Ver catálogo' }}
            className="reveal"
          />
          <div className="reveal-children grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <CinemaScroll whatsappUrl={quoteUrl} />

      {/* Presentación de la empresa */}
      <AboutSection figures={figures} />
      <MissionValues />
      <Manifesto />
      <BigMarquee words={PROMISE_WORDS} label="Nuestra promesa mayorista" />
      <Audiences />

      <StatementBanner
        eyebrow="Nuestra promesa"
        lines={['Compra más.', 'Paga mejor.', 'Haz crecer tu negocio.']}
        accentFrom={2}
        max="5.5rem"
        pattern
        watermark
        columns={PROMISE_COLUMNS}
      />

      <HowToBuy whatsappUrl={quoteUrl} />
      <Faq whatsappUrl={questionUrl} />
      <CtaBand whatsappUrl={quoteUrl} brands={brands.map((b) => b.name)} />
    </>
  )
}
