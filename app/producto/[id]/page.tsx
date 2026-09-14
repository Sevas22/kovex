import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductDetail } from '@/components/product-detail'

export default function ProductoPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">
        <ProductDetail />
      </main>
      <SiteFooter />
    </>
  )
}
