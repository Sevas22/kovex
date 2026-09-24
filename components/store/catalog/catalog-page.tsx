import { ChevronLeftIcon, ChevronRightIcon, PackageSearchIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Fragment, Suspense } from 'react'
import { CatalogFilters } from './catalog-filters'
import { MobileFilters } from './mobile-filters'
import { SortSelect } from './sort-select'
import { ProductCard } from '@/components/store/product-card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { buildCatalogQuery, parseCatalogParams, type SearchParams } from '@/lib/catalog-params'
import { plural } from '@/lib/format'
import { getDepartments, listProducts } from '@/lib/server/catalog'
import { cn } from '@/lib/utils'

export async function CatalogPage({ category, searchParams }: { category?: string; searchParams: SearchParams }) {
  const params = parseCatalogParams(searchParams)
  const [result, departments] = await Promise.all([
    listProducts({ ...params, category, inStock: params.inStock, price: params.price }),
    getDepartments(),
  ])
  if (category && !result.category) notFound()

  const basePath = category ? `/catalogo/${category}` : '/catalogo'
  const title = result.category?.current.name ?? (params.q ? `Resultados para “${params.q}”` : 'Todo el catálogo')
  const subcategories = result.category
    ? result.category.children.map((c) => ({ slug: c.slug, name: c.name }))
    : departments.map((d) => ({ slug: d.slug, name: d.name }))
  const pageHref = (page: number) => `${basePath}${buildCatalogQuery({ ...params, page })}`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {result.category ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/catalogo" />}>Catálogo</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {result.category.path.slice(0, -1).map((c) => (
                <Fragment key={c.slug}>
                  <BreadcrumbItem>
                    <BreadcrumbLink render={<Link href={`/catalogo/${c.slug}`} />}>{c.name}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </Fragment>
              ))}
              <BreadcrumbItem>
                <BreadcrumbPage>{result.category.current.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>Catálogo</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mt-4 border-b pb-6">
        <h1 className="font-display text-2xl text-brand-navy uppercase md:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{plural(result.total, 'producto')}</p>
        {subcategories.length ? (
          <nav aria-label="Subcategorías" className="mt-5 flex flex-wrap gap-2">
            {subcategories.map((c) => (
              <Link
                key={c.slug}
                href={`/catalogo/${c.slug}`}
                className="rounded-full border bg-white px-3.5 py-1.5 text-sm font-medium hover:border-brand-blue hover:text-brand-blue"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">
          <Suspense>
            <CatalogFilters brands={result.brands} />
          </Suspense>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Suspense>
              <MobileFilters brands={result.brands} />
            </Suspense>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">Ordenar por</span>
              <Suspense>
                <SortSelect />
              </Suspense>
            </div>
          </div>

          {result.items.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PackageSearchIcon />
                </EmptyMedia>
                <EmptyTitle>No encontramos productos con esos filtros</EmptyTitle>
                <EmptyDescription>
                  Prueba con otra búsqueda o quita algún filtro. Si no lo encuentras, pídelo por WhatsApp y lo buscamos
                  con nuestros proveedores.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" nativeButton={false} render={<Link href={basePath} />}>
                  Quitar filtros
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {result.items.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          )}

          {result.pageCount > 1 ? (
            <nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-1">
              <Button
                variant="outline"
                size="icon-lg"
                aria-label="Página anterior"
                disabled={result.page <= 1}
                nativeButton={false}
                render={<Link href={pageHref(result.page - 1)} />}
              >
                <ChevronLeftIcon />
              </Button>
              {Array.from({ length: result.pageCount }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={pageHref(n)}
                  aria-current={n === result.page ? 'page' : undefined}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-md text-sm font-medium tabular hover:bg-muted',
                    n === result.page && 'bg-brand-navy text-white hover:bg-brand-navy',
                  )}
                >
                  {n}
                </Link>
              ))}
              <Button
                variant="outline"
                size="icon-lg"
                aria-label="Página siguiente"
                disabled={result.page >= result.pageCount}
                nativeButton={false}
                render={<Link href={pageHref(result.page + 1)} />}
              >
                <ChevronRightIcon />
              </Button>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  )
}
