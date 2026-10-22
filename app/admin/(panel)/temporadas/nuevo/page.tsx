import { CatalogForm } from '@/components/admin/catalog-form'
import { PageHeader } from '@/components/admin/page-header'

export const metadata = { title: 'Nuevo catálogo de temporada' }

export default function NuevoCatalogoPage() {
  return (
    <>
      <PageHeader title="Nuevo catálogo" description="Sube el PDF o pega su dirección, y ponle una portada." />
      <CatalogForm />
    </>
  )
}
