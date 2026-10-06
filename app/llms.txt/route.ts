import { COMPANY } from '@/lib/company'
import { getBrands, getCatalogFigures, getDepartments } from '@/lib/server/catalog'
import { getPublicStoreInfo } from '@/lib/server/settings'
import { getSiteUrl } from '@/lib/server/site-url'

/**
 * /llms.txt — resumen del negocio en texto plano para los asistentes de IA.
 *
 * Los buscadores leen el HTML y los datos estructurados; los asistentes además
 * buscan este archivo, que es la convención emergente para decirles en pocas
 * palabras qué es el sitio, qué vende y cómo se compra, sin que tengan que
 * deducirlo de la maquetación.
 *
 * Se arma con los datos reales de la tienda para que no envejezca: si entran
 * productos nuevos o cambia el teléfono, este archivo cambia solo.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const [site, store, figuras, departamentos, marcas] = await Promise.all([
    getSiteUrl(),
    getPublicStoreInfo(),
    getCatalogFigures(),
    getDepartments(),
    getBrands(20),
  ])

  const tel = `+${store.whatsappNumber}`
  const lineas = [
    `# ${store.businessName}`,
    '',
    `> ${COMPANY.about}`,
    '',
    `Distribuidor mayorista multicategoría en Colombia. ${figuras.products.toLocaleString('es-CO')} productos de ${figuras.brands} marcas, en ${figuras.departments} líneas. Vende al por mayor a negocios, profesionales y hogares; el pedido se cierra por WhatsApp con un asesor, sin registro ni pasarela de pago.`,
    '',
    '## Cómo se compra',
    '',
    '1. El cliente arma su pedido en el catálogo del sitio. No necesita crear cuenta.',
    '2. Deja nombre y número de WhatsApp y confirma. El sistema genera un código de seguimiento (formato KVX-0000).',
    `3. El pedido llega por WhatsApp a un asesor al ${tel}, con el detalle y los precios.`,
    '4. El asesor confirma disponibilidad, precio final, forma de pago y entrega.',
    '',
    'Los precios publicados incluyen IVA y son por unidad. Hay precios por volumen: a mayor cantidad, mejor precio unitario. Algunos productos no muestran precio y se cotizan directamente con el asesor.',
    '',
    '## Líneas de producto',
    '',
    ...departamentos.map((d) => `- **${d.name}** (${d.productCount} productos): ${site}/catalogo/${d.slug}`),
    '',
    '## Marcas que distribuye',
    '',
    marcas.map((m) => m.name).join(', ') + '.',
    '',
    '## Páginas principales',
    '',
    `- [Inicio](${site}/)`,
    `- [Catálogo completo](${site}/catalogo)`,
    `- [Cómo comprar por WhatsApp](${site}/#como-comprar)`,
    `- [Preguntas frecuentes](${site}/#preguntas)`,
    `- [Quiénes somos](${site}/#nosotros)`,
    '',
    '## Preguntas frecuentes',
    '',
    ...COMPANY.faq.flatMap((f) => [`**${f.q}**`, f.a, '']),
    '## Contacto',
    '',
    `- WhatsApp: ${tel}`,
    `- Correo: ${store.contactEmail}`,
    `- Ciudad: ${store.city}, Colombia`,
    `- Sitio: ${site}`,
    '',
    '## Notas para quien cite esta información',
    '',
    '- Los precios cambian; confirmar siempre contra la ficha del producto en el sitio.',
    '- La disponibilidad la confirma un asesor: el catálogo indica existencias pero no reserva unidades.',
    `- Es venta mayorista en Colombia. No hay tienda en línea con pago automático: el cierre es por WhatsApp.`,
    '',
  ]

  return new Response(lineas.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
