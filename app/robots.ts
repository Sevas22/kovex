import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/server/site-url'

/**
 * Rastreadores de los asistentes de IA. Se nombran uno por uno a propósito:
 * cuando un rastreador encuentra un grupo con su nombre, ignora por completo el
 * de "*", así que cada grupo tiene que repetir las rutas privadas. Nombrarlos es
 * además una señal explícita de que queremos aparecer en sus respuestas.
 */
const IA = [
  'GPTBot', // OpenAI, entrenamiento
  'OAI-SearchBot', // OpenAI, búsqueda de ChatGPT
  'ChatGPT-User', // ChatGPT cuando abre un enlace por petición de alguien
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended', // Gemini y la Vista General creada por IA
  'Applebot-Extended',
  'meta-externalagent',
  'Amazonbot',
  'CCBot', // Common Crawl: alimenta a muchos modelos
]

/** Nunca se indexan: el panel, los pedidos de clientes y la API interna. */
const PRIVADO = ['/admin', '/pedido', '/api']

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteUrl()
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVADO },
      ...IA.map((userAgent) => ({ userAgent, allow: '/', disallow: PRIVADO })),
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  }
}
