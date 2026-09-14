import { Suspense } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CatalogView } from '@/components/catalog-view'

export default function CatalogoPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">
        <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16" />}>
          <CatalogView />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}
