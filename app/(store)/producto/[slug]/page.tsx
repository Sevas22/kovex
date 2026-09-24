import { ShieldCheckIcon, TruckIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Fragment } from 'react'
import { SectionHeading } from '@/components/store/home/section-heading'
import { JsonLd } from '@/components/store/json-ld'
import { Price } from '@/components/store/price'
import { BuyBox } from '@/components/store/product/buy-box'
import { Gallery } from '@/components/store/product/gallery'
import { ProductCard } from '@/components/store/product-card'
import { PriceTiers } from '@/components/store/product/price-tiers'
import { StockStatus } from '@/components/store/stock-status'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table'
import { getProductBySlug, getRelatedProducts } from '@/lib/server/catalog'
import { getPublicStoreInfo } from '@/lib/server/settings'
import { whatsappLink } from '@/lib/whatsapp'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Producto no encontrado' }
  return {
    title: product.name,
    description: product.description?.slice(0, 160) ?? `${product.name} al por mayor en KOVEX Colombia.`,
    openGraph: { images: product.images.slice(0, 1) },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, related, store] = await Promise.all([
    getProductBySlug(slug),
    getRelatedProducts(slug),
    getPublicStoreInfo(),
  ])
  if (!product) notFound()

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    image: product.images,
    description: product.description ?? undefined,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.breadcrumbs.map((c) => c.name).join(' > ') || undefined,
    // Los productos "a cotizar" no publican oferta: no tienen precio.
    offers:
      product.price == null
        ? undefined
        : {
            '@type': 'Offer',
            priceCurrency: 'COP',
            price: product.price,
            availability:
              product.available == null || product.available > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: { '@type': 'Organization', name: store.businessName },
          },
  }

  const askUrl = whatsappLink(
    store.whatsappNumber,
    `Hola KOVEX, quiero información sobre: ${product.name} (ref. ${product.sku}).`,
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <JsonLd data={productJsonLd} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {product.breadcrumbs.map((c) => (
            <Fragment key={c.slug}>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={`/catalogo/${c.slug}`} />}>{c.name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1">{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <Gallery images={product.images} name={product.name} />

        <div className="flex flex-col gap-6">
          <div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {product.brand ? <span className="font-semibold text-brand-blue">{product.brand}</span> : null}
              <span className="text-muted-foreground">Ref. {product.sku}</span>
            </p>
            <h1 className="mt-2 text-2xl leading-tight font-bold text-brand-navy md:text-3xl">{product.name}</h1>
          </div>

          <div className="rounded-md border bg-brand-mist p-5">
            <Price value={product.price} compareAt={product.compareAtPrice} size="lg" />
            <p className="mt-2 text-sm text-muted-foreground">
              {product.price == null
                ? 'Agrégalo a tu pedido y te enviamos el precio por WhatsApp según la cantidad que necesites.'
                : `Precio por ${product.unit.toLowerCase()}, IVA incluido. Por volumen te damos precio especial.`}
            </p>
            <StockStatus product={product} className="mt-4 text-sm" />
          </div>

          <PriceTiers product={product} />

          <BuyBox
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              brand: product.brand,
              sku: product.sku,
              image: product.image,
              unit: product.unit,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              available: product.available,
              lowStockThreshold: product.lowStockThreshold,
              isFeatured: product.isFeatured,
              priceTiers: product.priceTiers,
            }}
            whatsappUrl={askUrl}
          />

          <ul className="grid gap-3 border-t pt-6 text-sm sm:grid-cols-2">
            <li className="flex items-start gap-2.5">
              <TruckIcon className="mt-0.5 size-5 shrink-0 text-brand-blue" aria-hidden="true" />
              <span>Envíos a toda Colombia. Coordinamos la entrega por WhatsApp.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-brand-blue" aria-hidden="true" />
              <span>Producto original con garantía de fábrica.</span>
            </li>
          </ul>
        </div>
      </div>

      {product.description || product.specs.length ? (
        <section className="mt-14 grid gap-10 border-t pt-10 lg:grid-cols-2">
          {product.description ? (
            <div>
              <h2 className="font-display text-base text-brand-navy uppercase">Descripción</h2>
              <p className="mt-4 max-w-prose leading-relaxed whitespace-pre-line text-muted-foreground">
                {product.description}
              </p>
            </div>
          ) : null}
          {product.specs.length ? (
            <div>
              <h2 className="font-display text-base text-brand-navy uppercase">Especificaciones</h2>
              <Table className="mt-4">
                <TableBody>
                  {product.specs.map((s) => (
                    <TableRow key={s.label}>
                      <TableHead className="w-2/5 font-medium text-muted-foreground">{s.label}</TableHead>
                      <TableCell className="whitespace-normal">{s.value}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableHead className="font-medium text-muted-foreground">Presentación</TableHead>
                    <TableCell>{product.unit}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : null}
        </section>
      ) : null}

      {related.length ? (
        <section className="mt-16">
          <SectionHeading title="También te puede servir" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
