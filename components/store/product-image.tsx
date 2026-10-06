'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Logo } from '@/components/brand/logo'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  src: string | null
  alt: string
  sizes: string
  className?: string
  priority?: boolean
}

/**
 * Foto del producto sobre fondo blanco; si no hay foto —o si la que hay no
 * carga— muestra el monograma.
 *
 * Lo segundo importa: las fotos del proveedor viven en su CDN y él rota las
 * URLs cada cierto tiempo, así que las guardadas caducan. Sin este respaldo el
 * navegador pinta su ícono de imagen rota, que se ve peor que no tener foto.
 */
export function ProductImage({ src, alt, sizes, className, priority }: ProductImageProps) {
  // Se recuerda cuál URL falló, no un simple "falló": así una galería que
  // cambia de foto vuelve a intentarlo con la nueva.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) {
    return (
      <div className="flex size-full items-center justify-center bg-brand-mist" role="img" aria-label={alt}>
        <Logo variant="mark" className="h-1/3 opacity-15" />
      </div>
    )
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailedSrc(src)}
      className={cn('object-contain', className)}
    />
  )
}
