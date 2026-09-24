import Image from 'next/image'
import { Logo } from '@/components/brand/logo'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  src: string | null
  alt: string
  sizes: string
  className?: string
  priority?: boolean
}

/** Foto del producto sobre fondo blanco; si no hay foto, muestra el monograma. */
export function ProductImage({ src, alt, sizes, className, priority }: ProductImageProps) {
  if (!src) {
    return (
      <div className="flex size-full items-center justify-center bg-brand-mist" role="img" aria-label={alt}>
        <Logo variant="mark" className="h-1/3 opacity-15" />
      </div>
    )
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn('object-contain', className)} />
}
