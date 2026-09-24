import Link from 'next/link'
import { AddToCartButton } from './add-to-cart-button'
import { Price } from './price'
import { ProductImage } from './product-image'
import { StockStatus } from './stock-status'
import { Badge } from '@/components/ui/badge'
import { stockLevel, type ProductSummary } from '@/lib/types'

export function ProductCard({ product, priority }: { product: ProductSummary; priority?: boolean }) {
  const href = `/producto/${product.slug}`
  const out = stockLevel(product) === 'out'

  return (
    <article className="group flex flex-col overflow-hidden rounded-md border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-blue/50 hover:shadow-md hover:shadow-brand-navy/5">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-white" tabIndex={-1} aria-hidden="true">
        <ProductImage
          src={product.image}
          alt={product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="p-5 transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
        {out ? (
          <Badge variant="secondary" className="absolute top-3 left-3">
            Agotado
          </Badge>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 border-t p-4">
        {product.brand ? <p className="text-xs font-semibold text-brand-blue">{product.brand}</p> : null}
        <h3 className="line-clamp-2 min-h-10 text-sm leading-snug font-semibold">
          <Link href={href} className="hover:text-brand-blue">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <Price value={product.price} compareAt={product.compareAtPrice} unit={product.unit} size="md" />
          <AddToCartButton product={product} />
        </div>
        <StockStatus product={product} className="pt-1" />
      </div>
    </article>
  )
}
