import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/server/site-url'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteUrl()
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/pedido', '/api'] },
    sitemap: `${site}/sitemap.xml`,
  }
}
