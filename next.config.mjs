/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Las fotos de producto vienen del CDN de Shopify, que redimensiona gratis con ?width=.
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  },
  async redirects() {
    return [{ source: '/cotizacion', destination: '/pedido', permanent: true }]
  },
}

export default nextConfig
