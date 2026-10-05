/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Las fotos de producto vienen del CDN de Shopify, que redimensiona gratis con ?width=.
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    // Anchos a medida del diseño: evita pedir fotos de 3840 px que nadie ve y
    // acorta el srcset que viaja en cada página.
    deviceSizes: [360, 480, 640, 828, 1080, 1440, 1920],
    imageSizes: [64, 96, 128, 256, 384],
  },
  async redirects() {
    return [{ source: '/cotizacion', destination: '/pedido', permanent: true }]
  },
}

export default nextConfig
