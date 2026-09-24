import 'server-only'
import { normalizeText, titleCase } from '@/lib/text'
import type { ProductSpec } from '@/lib/types'

// Texcomercial es una tienda Shopify: la búsqueda pública devuelve HTML con los enlaces
// /products/{handle} y cada producto expone su ficha en /products/{handle}.js.
// Sus "variantes" son listas de precios (MLP-TLP…); el precio público es price_min.

const BASE_URL = 'https://texcomercial.com.co'
const USER_AGENT = 'KovexCatalog/1.0 (+importador de catálogo de KOVEX Colombia)'

export type DepartmentSlug = 'ferreteria' | 'agro' | 'hogar' | 'maquinaria' | 'tecnologia' | 'electro'

export interface SupplierProduct {
  sourceId: string
  handle: string
  url: string
  name: string
  rawTitle: string
  brand: string | null
  supplierSku: string | null
  /** Precio público del proveedor en pesos. */
  costPrice: number | null
  available: boolean
  images: string[]
  description: string | null
  specs: ProductSpec[]
  unit: string
  taxRate: number
  department: DepartmentSlug | null
  /** Categoría y subcategoría dentro del departamento. */
  categoryPath: string[]
}

async function fetchFromSupplier(path: string, accept: string): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    headers: { 'user-agent': USER_AGENT, accept },
    signal: AbortSignal.timeout(20_000),
    cache: 'no-store',
  })
}

export interface SupplierSearchPage {
  handles: string[]
  total: number | null
  hasMore: boolean
}

export async function searchSupplier(query: string, page = 1): Promise<SupplierSearchPage> {
  const params = new URLSearchParams({
    type: 'product',
    q: query,
    'options[prefix]': 'last',
    'options[unavailable_products]': 'last',
    page: String(page),
  })
  const res = await fetchFromSupplier(`/search?${params}`, 'text/html')
  if (!res.ok) throw new Error(`Texcomercial respondió ${res.status} a la búsqueda.`)
  const html = await res.text()

  const handles: string[] = []
  for (const m of html.matchAll(/href="\/products\/([a-z0-9%-]+)/gi)) {
    const handle = decodeURIComponent(m[1])
    if (!handles.includes(handle)) handles.push(handle)
  }
  const total = /(\d[\d.]*)\s+resultados?/i.exec(html)
  return {
    handles,
    total: total ? Number(total[1].replace(/\./g, '')) : null,
    hasMore: html.includes(`page=${page + 1}`),
  }
}

interface ShopifyProductJs {
  id: number
  title: string
  handle: string
  description: string
  vendor: string
  type: string
  tags: string[]
  price_min: number
  available: boolean
  images: string[]
  variants: { sku: string | null }[]
}

export async function fetchSupplierProduct(handle: string): Promise<SupplierProduct | null> {
  const res = await fetchFromSupplier(`/products/${encodeURIComponent(handle)}.js`, 'application/json')
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Texcomercial respondió ${res.status} al pedir ${handle}.`)
  return normalizeSupplierProduct((await res.json()) as ShopifyProductJs)
}

/** Descarga varias fichas con concurrencia limitada para no saturar al proveedor. */
export async function fetchSupplierProducts(handles: string[], concurrency = 4): Promise<SupplierProduct[]> {
  const results: (SupplierProduct | null)[] = new Array(handles.length).fill(null)
  let next = 0
  async function worker() {
    while (next < handles.length) {
      const i = next++
      try {
        results[i] = await fetchSupplierProduct(handles[i])
      } catch {
        results[i] = null
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, handles.length) }, worker))
  return results.filter((p): p is SupplierProduct => p !== null)
}

// ---------------------------------------------------------------------------
// Normalización
// ---------------------------------------------------------------------------

/** Referencia de fábrica: "VL143F040216", "-5401MET-ROJO", "UN50U8500HKXZL", "9900". */
function isReferenceCode(token: string): boolean {
  const t = token.replace(/^[-.]+/, '')
  if (/^\d{4,}$/.test(t)) return true
  return t.length >= 6 && /^[A-Z0-9-]+$/.test(t) && /\d/.test(t) && /[A-Z]/.test(t)
}

/**
 * Separa el nombre comercial de los códigos que el proveedor agrega al final:
 * "Brocha Popular 2\" -600154-740047" → { name: "Brocha Popular 2\"", reference: null }
 * "Vajilla … Multicolor VL143F040216" → { name: "Vajilla … Multicolor", reference: "VL143F040216" }
 */
export function cleanTitle(raw: string): { name: string; reference: string | null } {
  const tokens = raw
    .replace(/[\s.\-–]+\d{5,}(?:[\s-]+\d{4,})*\s*$/, '') // códigos internos numéricos
    .replace(/\s{2,}/g, ' ')
    .trim()
    .split(' ')
  const refs: string[] = []
  while (tokens.length > 3 && isReferenceCode(tokens[tokens.length - 1])) {
    refs.unshift(tokens.pop()!.replace(/^[-.]+/, ''))
  }
  return { name: tokens.join(' ').replace(/[\s.\-–]+$/, ''), reference: refs.join(' ') || null }
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' }

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#?\w+);/g, (m, e: string) => ENTITIES[e] ?? (e.startsWith('#') ? String.fromCharCode(Number(e.slice(1))) : m))
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
}

/** "VINILOS,EPOXICOS" → "Vinilos, epoxicos"; respeta textos que ya vienen en mayúsculas y minúsculas. */
function sentenceCase(value: string): string {
  // Espacio tras las comas que separan palabras, sin tocar decimales como "6,5".
  const clean = value.replace(/\s*,\s*(?=[^\d\s])/g, ', ').replace(/\s+/g, ' ').trim()
  if (clean !== clean.toUpperCase()) return clean
  const lower = clean.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function parseSpecs(html: string): ProductSpec[] {
  const specs: ProductSpec[] = []
  for (const row of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => stripHtml(c[1]))
    if (cells.length < 2) continue
    const label = sentenceCase(cells[0].replace(/:\s*$/, ''))
    const value = sentenceCase(cells[1])
    if (!label || !value || value === '0') continue
    specs.push({ label, value })
  }
  return specs
}

function parseDescription(html: string): string | null {
  const block = /<div class="text-description-product">([\s\S]*?)<\/div>/i.exec(html)
  const text = stripHtml(block ? block[1] : html.replace(/<table[\s\S]*<\/table>/gi, ''))
    .replace(/["“”]/g, '') // comillas sueltas que deja el proveedor
    .replace(/([.!?])(?=[A-ZÁÉÍÓÚÑ])/g, '$1 ') // "Polipropileno.Recorte" → "Polipropileno. Recorte"
    .replace(/\s{2,}/g, ' ')
    .trim()
  return text.length > 3 ? text : null
}

const DEPARTMENTS: [RegExp, DepartmentSlug][] = [
  [/^ferreteria/, 'ferreteria'],
  [/^agro/, 'agro'],
  [/^hogar/, 'hogar'],
  [/^maquinaria/, 'maquinaria'],
  [/^tecnologia/, 'tecnologia'],
  [/^electro/, 'electro'],
]

function toDepartment(value: string): DepartmentSlug | null {
  const n = normalizeText(value)
  return DEPARTMENTS.find(([re]) => re.test(n))?.[1] ?? null
}

/** Etiquetas "Departamento_Categoría_Subcategoría" → ["Categoría", "Subcategoría"]. */
function parseCategoryPath(tags: string[], department: DepartmentSlug | null): string[] {
  const paths = tags
    .filter((t) => t.includes('_') && !/^(__|marca_|color_)/i.test(t))
    .map((t) => t.split('_').map((part) => part.replace(/-/g, ' ').trim()))
    .filter((parts) => parts.length >= 2 && toDepartment(parts[0]) === department)
    .sort((a, b) => b.length - a.length)

  const best = paths[0]?.slice(1) ?? []
  const [category, sub] = best
  if (!category) return []
  const name = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  return sub && normalizeText(sub) !== normalizeText(category) ? [name(category), name(sub)] : [name(category)]
}

export function normalizeSupplierProduct(p: ShopifyProductJs): SupplierProduct {
  const specs = parseSpecs(p.description)
  const presentation = specs.find((s) => normalizeText(s.label) === 'presentacion')?.value
  const iva = p.tags.map((t) => /^IVA-(\d+(?:\.\d+)?)%$/i.exec(t)).find(Boolean)
  const department = toDepartment(p.type) ?? toDepartment(p.tags.find((t) => t.includes('_')) ?? '')
  const { name, reference } = cleanTitle(p.title)
  const productSpecs = specs.filter((s) => normalizeText(s.label) !== 'presentacion')
  if (reference) productSpecs.unshift({ label: 'Referencia', value: reference })

  return {
    sourceId: String(p.id),
    handle: p.handle,
    url: `${BASE_URL}/products/${p.handle}`,
    name,
    rawTitle: p.title,
    brand: p.vendor ? titleCase(p.vendor) : null,
    supplierSku: p.variants[0]?.sku || null,
    costPrice: p.price_min > 0 ? Math.round(p.price_min / 100) : null,
    available: p.available,
    images: p.images.slice(0, 6).map((src) => (src.startsWith('//') ? `https:${src}` : src)),
    description: parseDescription(p.description),
    specs: productSpecs,
    unit: presentation ? titleCase(presentation) : 'Unidad',
    taxRate: iva ? Number(iva[1]) : 19,
    department,
    categoryPath: parseCategoryPath(p.tags, department),
  }
}
