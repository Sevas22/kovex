import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HeroSection } from '@/components/home/hero-section'
import { PromiseStrip } from '@/components/home/promise-strip'
import { CategoryGrid } from '@/components/home/category-grid'
import { FeaturedProducts } from '@/components/home/featured-products'

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <PromiseStrip />
        <CategoryGrid />
        <FeaturedProducts />
      </main>
      <SiteFooter />
    </>
  )
}
