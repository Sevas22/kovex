import { getCurrentAdmin } from '@/lib/server/auth'
import { db } from '@/lib/server/db'
import { buildCategoryIndex, getCategories } from '@/lib/server/categories'
import { getSettings } from '@/lib/server/settings'
import { toCsv } from '@/lib/csv'
import { unitLabel } from '@/lib/units'

/**
 * Descargas del catálogo en CSV.
 *
 *   /api/admin/exportar?tipo=catalogo   lista de precios para vender
 *   /api/admin/exportar?tipo=margenes   márgenes por familia, para ajustar y subir
 *
 * Son dos archivos con propósitos distintos a propósito. El de catálogo es para
 * leer y mandar; el de márgenes es el único que se vuelve a subir, y por eso
 * trae pocas columnas y una sola editable.
 */
export const dynamic = 'force-dynamic'

const archivo = (nombre: string) => {
  const hoy = new Date().toISOString().slice(0, 10)
  return `kovex-${nombre}-${hoy}.csv`
}

const responder = (csv: string, nombre: string) =>
  new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${archivo(nombre)}"`,
      'cache-control': 'no-store',
    },
  })

interface FilaCatalogo {
  sku: string
  name: string
  brand: string | null
  categoryId: number | null
  unit: string
  price: number | null
  taxRate: number
  stock: number
  reserved: number
  trackInventory: boolean
  minOrderQuantity: number
  isActive: boolean
}

export async function GET(request: Request) {
  // 401 y no una excepción: esto se abre desde un enlace del navegador.
  if (!(await getCurrentAdmin())) {
    return new Response('Tu sesión expiró. Vuelve a iniciar sesión.', { status: 401 })
  }
  const tipo = new URL(request.url).searchParams.get('tipo') ?? 'catalogo'
  const sql = db()
  const [categories, settings] = await Promise.all([getCategories(), getSettings()])
  const index = buildCategoryIndex(categories)
  const ruta = (id: number | null) => index.pathOf(id).map((c) => c.name).join(' › ')

  if (tipo === 'margenes') {
    const conteos = await sql<{ categoryId: number; count: number }[]>`
      select category_id, count(*)::int as count from public.products
      where category_id is not null group by category_id
    `
    const porCategoria = new Map(conteos.map((c) => [c.categoryId, c.count]))

    // Solo las que sostienen productos: las demás no mueven ningún precio.
    const filas = categories
      .filter((c) => (porCategoria.get(c.id) ?? 0) > 0)
      .map((c) => {
        const heredado = c.parentId == null ? null : index.inheritedMarkup(c.parentId)
        return [
          c.id,
          ruta(c.id),
          porCategoria.get(c.id) ?? 0,
          // Vacío = hereda. Es la columna editable y la única.
          c.markupPercent == null ? '' : String(c.markupPercent).replace('.', ','),
          c.markupPercent != null
            ? 'propio'
            : heredado
              ? `${heredado.percent} % de ${heredado.from.name}`
              : `${settings.defaultMarkupPercent} % general`,
        ]
      })
      .sort((a, b) => String(a[1]).localeCompare(String(b[1]), 'es'))

    return responder(
      toCsv(['id', 'familia', 'productos', 'margen_%', 'de_donde_viene_hoy'], filas),
      'margenes-por-familia',
    )
  }

  const productos = await sql<FilaCatalogo[]>`
    select sku, name, brand, category_id, unit, price, tax_rate, stock, reserved,
           track_inventory, min_order_quantity, is_active
    from public.products
    order by name
  `

  const filas = productos.map((p) => {
    const disponible = p.trackInventory ? p.stock - p.reserved : null
    return [
      p.sku,
      p.name,
      p.brand ?? '',
      ruta(p.categoryId),
      p.unit,
      p.price ?? '', // vacío = a cotizar
      p.price == null ? 'A cotizar' : 'Publicado',
      p.taxRate,
      disponible == null ? 'Bajo pedido' : disponible,
      p.minOrderQuantity > 1 ? `${p.minOrderQuantity} ${unitLabel(p.unit, p.minOrderQuantity)}` : '',
      p.isActive ? 'Sí' : 'No',
    ]
  })

  return responder(
    toCsv(
      [
        'sku',
        'producto',
        'marca',
        'categoria',
        'unidad',
        'precio_publico',
        'estado_precio',
        'iva_%',
        'disponibles',
        'pedido_minimo',
        'visible_en_tienda',
      ],
      filas,
    ),
    'catalogo',
  )
}
