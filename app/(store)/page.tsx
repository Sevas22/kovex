import { AboutSection } from '@/components/store/home/about-section'
import { Audiences } from '@/components/store/home/audiences'
import { CtaBand } from '@/components/store/home/cta-band'
import { DepartmentGrid } from '@/components/store/home/department-grid'
import { Faq } from '@/components/store/home/faq'
import { Hero } from '@/components/store/home/hero'
import { HowToBuy } from '@/components/store/home/how-to-buy'
import { Manifesto } from '@/components/store/home/manifesto'
import { MissionValues } from '@/components/store/home/mission-values'
import { PromiseBar } from '@/components/store/home/promise-bar'
import { SectionHeading } from '@/components/store/home/section-heading'
import { JsonLd } from '@/components/store/json-ld'
import { ProductCard } from '@/components/store/product-card'
import { COMPANY } from '@/lib/company'
import { getSiteUrl } from '@/lib/server/site-url'
import { getBrands, getDepartments, getFeaturedProducts } from '@/lib/server/catalog'
import { getPublicStoreInfo } from '@/lib/server/settings'
import { whatsappLink } from '@/lib/whatsapp'

export default async function HomePage() {
  const [departments, featured, brands, store] = await Promise.all([
    getDepartments(),
    getFeaturedProducts(8),
    getBrands(12),
    getPublicStoreInfo(),
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
      <Hero whatsappUrl={quoteUrl} />
      <PromiseBar />
      <DepartmentGrid departments={departments} />
      {featured.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <SectionHeading
            title="Productos destacados"
            description="Lo que más piden nuestros clientes mayoristas."
            link={{ href: '/catalogo', label: 'Ver catálogo' }}
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Presentación de la empresa */}
      <AboutSection />
      <MissionValues />
      <Manifesto />
      <Audiences />

      <HowToBuy />
      <Faq whatsappUrl={questionUrl} />
      <CtaBand whatsappUrl={quoteUrl} brands={brands.map((b) => b.name)} />
    </>
  )
}
