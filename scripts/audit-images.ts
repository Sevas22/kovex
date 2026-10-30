/**
 * Informe de los productos que se quedaron sin foto y por qué.
 *
 *   pnpm catalog:audit-images
 *
 * Deja un Excel en informe-fotos.csv con dos grupos, porque se atienden de
 * manera distinta:
 *
 *   «de baja»  el proveedor ya no lo vende. No es que falte la foto: falta el
 *              producto. Conviene ocultarlo para no recibir pedidos que no se
 *              pueden despachar.
 *   «sin foto» sigue a la venta, pero el proveedor no publica ninguna imagen.
 *              Hay que conseguirla (de la marca o fotografiando el artículo) y
 *              subirla desde el panel.
 *
 * Preguntar por cada producto tarda unos minutos: va de a uno y con pausa para
 * no que el proveedor no corte por exceso de peticiones.
 */
import { writeFileSync } from 'node:fs'
import { toCsv } from '@/lib/csv'
import { db } from '@/lib/server/db'

const SALIDA = 'informe-fotos.csv'

interface Row {
  id: number
  name: string
  brand: string | null
  sku: string
  isActive: boolean
  price: number | null
  sourceUrl: string | null
}

type Estado = 'de baja' | 'sin foto' | 'no se pudo consultar'

async function estadoEnProveedor(sourceUrl: string | null): Promise<Estado> {
  const handle = sourceUrl?.split('/products/')[1]
  if (!handle) return 'no se pudo consultar'
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const res = await fetch(`https://texcomercial.com.co/products/${handle}.js`, {
        headers: { 'user-agent': 'KovexCatalog/1.0', accept: 'application/json' },
        signal: AbortSignal.timeout(20_000),
      })
      if (res.status === 404) return 'de baja'
      if (res.ok) return 'sin foto'
    } catch {
      // red intermitente o límite del proveedor
    }
    await new Promise((r) => setTimeout(r, 1200 * intento))
  }
  return 'no se pudo consultar'
}

async function main() {
  const sql = db()
  const rows = await sql<Row[]>`
    select id, name, brand, sku, is_active, price, source_url
    from public.products
    where cardinality(images) = 0
    order by brand nulls last, name
  `
  console.log(`${rows.length} productos sin foto · consultando al proveedor…`)

  const filas: (string | number | null)[][] = []
  const cuenta: Record<Estado, number> = { 'de baja': 0, 'sin foto': 0, 'no se pudo consultar': 0 }

  for (const [i, r] of rows.entries()) {
    const estado = await estadoEnProveedor(r.sourceUrl)
    cuenta[estado]++
    filas.push([
      r.id,
      estado,
      r.isActive ? 'sí' : 'no',
      r.brand,
      r.name,
      r.sku,
      r.price,
      r.sourceUrl,
      estado === 'de baja' ? 'Ocultar: el proveedor ya no lo vende' : 'Conseguir y subir la foto',
    ])
    if ((i + 1) % 20 === 0) console.log(`   ${i + 1}/${rows.length}`)
    await new Promise((r) => setTimeout(r, 300))
  }

  writeFileSync(
    SALIDA,
    toCsv(
      ['id', 'estado', 'visible en la tienda', 'marca', 'producto', 'sku', 'precio', 'ficha del proveedor', 'qué hacer'],
      filas,
    ),
  )

  console.log(`\nde baja en el proveedor:  ${cuenta['de baja']}`)
  console.log(`a la venta, sin foto:     ${cuenta['sin foto']}`)
  if (cuenta['no se pudo consultar']) console.log(`no se pudo consultar:     ${cuenta['no se pudo consultar']}`)
  console.log(`\nInforme en ${SALIDA}`)
  await sql.end()
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await db().end()
  process.exit(1)
})
