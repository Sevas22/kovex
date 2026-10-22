import { notFound } from 'next/navigation'
import { CatalogForm } from '@/components/admin/catalog-form'
import { PageHeader } from '@/components/admin/page-header'
import { getCatalog } from '@/lib/server/seasonal-catalogs'

export const metadata = { title: 'Catálogo de temporada' }

export default async function EditarCatalogoPage({ params }: { params: Promise<{ id: string }> }) {
  const catalog = await getCatalog(Number((await params).id))
  if (!catalog) notFound()
  return (
    <>
      <PageHeader title={catalog.title} description="Catálogo de temporada." />
      <CatalogForm catalog={catalog} />
    </>
  )
}
