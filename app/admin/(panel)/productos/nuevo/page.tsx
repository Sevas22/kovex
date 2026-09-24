import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/admin/page-header'
import { ProductForm } from '@/components/admin/product-form'
import { getCategoryOptions } from '@/lib/server/admin-categories'
import { getSettings } from '@/lib/server/settings'

export const metadata = { title: 'Nuevo producto' }

export default async function NewProductPage() {
  const [categories, settings] = await Promise.all([getCategoryOptions(), getSettings()])
  return (
    <>
      <Link href="/admin/productos" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-blue">
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        Productos
      </Link>
      <PageHeader title="Nuevo producto" description="Para traer productos del proveedor usa Importar productos." />
      <ProductForm
        product={null}
        categories={categories}
        pricing={{ defaultMarkupPercent: settings.defaultMarkupPercent, priceRounding: settings.priceRounding }}
      />
    </>
  )
}
