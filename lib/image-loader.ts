'use client'

interface LoaderParams {
  src: string
  width: number
  quality?: number
}

/**
 * Las imágenes de proveedores (CDN de Shopify) se piden al ancho exacto con ?width=,
 * sin pasar por el optimizador de Vercel. Las locales (/public) se sirven tal cual.
 */
export default function kovexImageLoader({ src, width }: LoaderParams): string {
  if (src.startsWith('https://cdn.shopify.com/')) {
    const url = new URL(src)
    url.searchParams.set('width', String(width))
    return url.toString()
  }
  return `${src}${src.includes('?') ? '&' : '?'}w=${width}`
}
