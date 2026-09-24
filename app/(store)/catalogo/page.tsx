import type { Metadata } from 'next'
import { CatalogPage } from '@/components/store/catalog/catalog-page'
import type { SearchParams } from '@/lib/catalog-params'

export const metadata: Metadata = {
  title: 'Catálogo',
  description: 'Catálogo mayorista de ferretería, agro, hogar, maquinaria, tecnología y electro.',
}

export default async function CatalogoPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <CatalogPage searchParams={await searchParams} />
}
