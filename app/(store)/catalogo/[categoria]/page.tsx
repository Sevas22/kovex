import type { Metadata } from 'next'
import { CatalogPage } from '@/components/store/catalog/catalog-page'
import type { SearchParams } from '@/lib/catalog-params'
import { getCategoryIndex } from '@/lib/server/categories'

interface Props {
  params: Promise<{ categoria: string }>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params
  const category = (await getCategoryIndex()).bySlug.get(categoria)
  return category
    ? { title: category.name, description: category.description ?? `${category.name} al por mayor en KOVEX Colombia.` }
    : { title: 'Categoría no encontrada' }
}

export default async function CategoriaPage({ params, searchParams }: Props) {
  const [{ categoria }, sp] = await Promise.all([params, searchParams])
  return <CatalogPage category={categoria} searchParams={sp} />
}
