/**
 * Busca fotos para los productos que no tienen, en las tiendas oficiales de cada marca.
 *
 *   pnpm catalog:find-images [--aplicar]
 *
 * Sin --aplicar solo muestra lo que encontró. Con --aplicar descarga la foto, la
 * guarda en la tienda (tabla uploads, igual que una subida desde el panel) y la
 * asigna al producto. No se enlaza al sitio de la marca: si mañana cambian su CDN,
 * la foto de KOVEX sigue estando.
 *
 * El emparejamiento es por referencia de fábrica (el código del modelo), que es el
 * dato que no se presta a confusiones. Si no hay referencia, el producto se salta.
 */
import { db } from '@/lib/server/db'
import { saveUpload } from '@/lib/server/uploads'

const aplicar = process.argv.includes('--aplicar')
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0 Safari/537.36' }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Tiendas Shopify oficiales con catálogo público, por marca. La clave tiene que
 * coincidir con `products.brand` tal como la guardó el importador.
 *
 * De las marcas que nos faltan, estas son las únicas con catálogo consultable:
 * el resto (Corona, Grival, Abracol, Plastired, Proalco, Rimax, Oster, Imusa,
 * Mercury, Tracker, Winner, Electrolux) o no tiene tienda propia o no expone el
 * catálogo. Para esas hay que conseguir las fotos por otra vía.
 */
const TIENDAS: Record<string, string> = {
  Hyundai: 'https://hyundaielectronics.com.co',
  Cristar: 'https://cristar.com.co',
  Colplast: 'https://colplast.com.co',
}

interface Candidato {
  titulo: string
  imagen: string
}

/** Descarga el catálogo completo de una tienda Shopify (hasta 2.000 productos). */
async function cargarCatalogo(base: string): Promise<Candidato[]> {
  const todos: Candidato[] = []
  for (let page = 1; page <= 8; page++) {
    const res = await fetch(`${base}/products.json?limit=250&page=${page}`, { headers: UA })
    if (!res.ok) break
    const texto = await res.text()
    if (!texto.startsWith('{')) break
    const { products } = JSON.parse(texto) as {
      products: { title: string; images: { src: string }[] }[]
    }
    for (const p of products) {
      if (p.images?.[0]?.src) todos.push({ titulo: p.title, imagen: p.images[0].src })
    }
    if (products.length < 250) break
    await sleep(600)
  }
  return todos
}

/**
 * Referencias de fábrica del producto. El importador separa el código del nombre y
 * lo guarda en las especificaciones; el SKU del proveedor suele traerlo con un
 * prefijo propio ("168HYLED6516QR"), así que también se prueba sin él.
 */
function referencias(p: { name: string; sku: string; specs: { label: string; value: string }[] }): string[] {
  const limpio = (t: string) => t.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const refs = new Set<string>()
  for (const s of p.specs ?? []) {
    if (/referencia/i.test(s.label) && s.value) refs.add(limpio(s.value))
  }
  const sku = limpio(p.sku)
  if (sku.length >= 6) {
    refs.add(sku)
    if (sku.length > 9) refs.add(sku.slice(3))
  }
  for (const t of p.name.toUpperCase().match(/[A-Z0-9][A-Z0-9-]{5,}/g) ?? []) refs.add(limpio(t))
  return [...refs].filter((t) => t.length >= 6 && /\d/.test(t) && /[A-Z]/.test(t))
}

async function main() {
  const sql = db()
  const sinFoto = await sql<
    { id: number; name: string; brand: string | null; sku: string; specs: { label: string; value: string }[] }[]
  >`
    select id, name, brand, sku, specs from public.products
    where cardinality(images) = 0 order by brand, name
  `
  console.log(`${sinFoto.length} productos sin foto\n`)

  let encontrados = 0
  let aplicados = 0

  for (const [marca, base] of Object.entries(TIENDAS)) {
    const pendientes = sinFoto.filter((p) => p.brand === marca)
    if (pendientes.length === 0) continue
    console.log(`${marca}: ${pendientes.length} productos · leyendo ${base}`)
    const catalogo = await cargarCatalogo(base)
    console.log(`   catálogo de la marca: ${catalogo.length} productos\n`)

    for (const p of pendientes) {
      const refs = referencias(p)
      const match = refs.length
        ? catalogo.find((c) => refs.some((r) => c.titulo.toUpperCase().replace(/[^A-Z0-9]/g, '').includes(r)))
        : undefined
      if (!match) {
        console.log(`   ✗ ${p.name.slice(0, 58)}${refs.length ? ` (ref. ${refs.join(', ')})` : ' (sin referencia)'}`)
        continue
      }
      encontrados++
      console.log(`   ✓ ${p.name.slice(0, 50)}\n       ← ${match.titulo.slice(0, 60)}`)
      if (!aplicar) continue

      const res = await fetch(match.imagen, { headers: UA })
      if (!res.ok) {
        console.log(`       no se pudo descargar (${res.status})`)
        continue
      }
      const tipo = res.headers.get('content-type') ?? 'image/jpeg'
      const archivo = new File([await res.arrayBuffer()], `${p.id}.jpg`, { type: tipo.split(';')[0] })
      const subida = await saveUpload(archivo)
      await sql`update public.products set images = ${[subida.url]} where id = ${p.id}`
      aplicados++
      console.log(`       guardada ${Math.round(subida.size / 1024)} KB → ${subida.url}`)
      await sleep(500)
    }
  }

  console.log(`\nCoincidencias: ${encontrados}${aplicar ? ` · fotos guardadas: ${aplicados}` : ' (usa --aplicar para guardarlas)'}`)
  await sql.end()
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await db().end()
  process.exit(1)
})
