'use server'

import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { deleteProduct, ProductError, saveProduct, setProductFlags } from '@/lib/server/admin-products'
import { assertAdmin, authenticate, endSession, startSession } from '@/lib/server/auth'
import { ImportError, importSupplierProducts } from '@/lib/server/catalog-import'
import { buildCategoryIndex, loadCategories } from '@/lib/server/categories'
import { db } from '@/lib/server/db'
import { adjustStock, StockError } from '@/lib/server/inventory'
import {
  cancelOrder,
  confirmOrder,
  convertQuoteToOrder,
  markDelivered,
  markShipped,
  OrderError,
  quoteOrder,
  updateAdminNotes,
} from '@/lib/server/orders'
import { recalculatePrices } from '@/lib/server/prices'
import { clientIp, consumeRateLimit, resetRateLimit } from '@/lib/server/rate-limit'
import { loadSettings, updateSettings } from '@/lib/server/settings'
import { syncSupplierBatch } from '@/lib/server/supplier-sync'
import { fetchSupplierProducts, searchSupplier } from '@/lib/server/texcomercial'
import { computePrice } from '@/lib/pricing'
import { normalizePhone, normalizeText } from '@/lib/text'
import type { VolumeTier } from '@/lib/volume-pricing'

export type ActionResult<T = undefined> = { ok: true; message?: string; data?: T } | { ok: false; error: string }

const KNOWN_ERRORS = [OrderError, StockError, ProductError, ImportError]

/** Ejecuta la acción con sesión verificada y traduce los errores de negocio a mensajes. */
async function run<T>(fn: (actor: string) => Promise<T>, message?: string): Promise<ActionResult<T>> {
  let admin
  try {
    admin = await assertAdmin()
  } catch {
    return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' }
  }
  try {
    const data = await fn(admin.email)
    refresh()
    return { ok: true, message, data }
  } catch (error) {
    if (error instanceof z.ZodError) return { ok: false, error: error.issues[0]?.message ?? 'Datos inválidos.' }
    if (KNOWN_ERRORS.some((E) => error instanceof E)) return { ok: false, error: (error as Error).message }
    console.error('[admin]', error)
    return { ok: false, error: 'Ocurrió un error inesperado. Inténtalo de nuevo.' }
  }
}

// ---------------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------------

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: 'Escribe tu correo y contraseña.' }

  // 10 intentos cada 15 minutos por IP y por correo.
  const ip = await clientIp()
  const emailKey = `login:email:${email.trim().toLowerCase()}`
  const allowed = (await consumeRateLimit(`login:ip:${ip}`, 10, 900)) && (await consumeRateLimit(emailKey, 10, 900))
  if (!allowed) return { error: 'Demasiados intentos. Espera 15 minutos antes de volver a intentarlo.' }

  const admin = await authenticate(email, password)
  if (!admin) return { error: 'El correo o la contraseña no coinciden.' }
  await resetRateLimit(emailKey)
  await startSession(admin.id)
  redirect('/admin')
}

export async function logoutAction() {
  await endSession()
  redirect('/admin/login')
}

// ---------------------------------------------------------------------------
// Pedidos y cotizaciones
// ---------------------------------------------------------------------------

const id = z.number().int().positive()

export async function quoteOrderAction(orderId: number, prices: { itemId: number; unitPrice: number | null }[]) {
  const parsed = z
    .array(z.object({ itemId: id, unitPrice: z.number().int().min(0).max(1_000_000_000).nullable() }))
    .parse(prices)
  return run((actor) => quoteOrder(id.parse(orderId), parsed, actor), 'Cotización actualizada')
}

export async function convertQuoteAction(orderId: number) {
  return run((actor) => convertQuoteToOrder(id.parse(orderId), actor), 'Cotización convertida en pedido. Inventario reservado.')
}

export async function confirmOrderAction(orderId: number) {
  return run((actor) => confirmOrder(id.parse(orderId), actor), 'Venta confirmada. Inventario descontado.')
}

export async function shipOrderAction(orderId: number) {
  return run((actor) => markShipped(id.parse(orderId), actor), 'Pedido marcado como enviado')
}

export async function deliverOrderAction(orderId: number) {
  return run((actor) => markDelivered(id.parse(orderId), actor), 'Pedido marcado como entregado')
}

export async function cancelOrderAction(orderId: number, reason: string) {
  const text = z.string().trim().max(300).parse(reason)
  return run((actor) => cancelOrder(id.parse(orderId), text || null, actor), 'Cancelado')
}

export async function saveOrderNotesAction(orderId: number, notes: string) {
  const text = z.string().trim().max(2000).parse(notes)
  return run(() => updateAdminNotes(id.parse(orderId), text || null), 'Notas guardadas')
}

// ---------------------------------------------------------------------------
// Productos e inventario
// ---------------------------------------------------------------------------

const money = z.number().int().min(0).max(1_000_000_000)
const percent = z.number().min(0, 'El margen no puede ser negativo.').max(1000, 'El margen máximo es 1000 %.')

const volumeTiersSchema = z
  .array(z.object({ minQty: z.number().int().min(2).max(100000), percent: z.number().min(0).max(90) }))
  .max(6)
  .nullable()

const productSchema = z
  .object({
    name: z.string().trim().min(3, 'Escribe el nombre del producto.').max(200),
    sku: z.string().trim().min(2, 'Escribe la referencia (SKU).').max(60),
    brand: z.string().trim().max(80).nullable(),
    categoryId: id.nullable(),
    unit: z.string().trim().min(1).max(40),
    description: z.string().trim().max(5000).nullable(),
    // Una imagen es una URL del proveedor o un archivo subido al panel (/imagenes/<id>).
    images: z
      .array(
        z
          .string()
          .max(500)
          .refine((v) => /^https?:\/\//i.test(v) || /^\/imagenes\/[0-9a-f-]{36}\.[a-z0-9]+$/i.test(v), {
            message: 'Una de las imágenes no es una URL válida.',
          }),
      )
      .max(10),
    specs: z.array(z.object({ label: z.string().trim().min(1).max(80), value: z.string().trim().min(1).max(300) })).max(40),
    pricingMode: z.enum(['markup', 'fixed', 'quote']),
    costPrice: money.nullable(),
    markupPercent: percent.nullable(),
    fixedPrice: money.nullable(),
    compareAtPrice: money.nullable(),
    volumeTiers: volumeTiersSchema,
    taxRate: z.number().min(0).max(100),
    trackInventory: z.boolean(),
    lowStockThreshold: z.number().int().min(0).max(100000).nullable(),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
  })
  .superRefine((p, ctx) => {
    if (p.pricingMode === 'markup' && p.costPrice == null) {
      ctx.addIssue({ code: 'custom', path: ['costPrice'], message: 'Con "costo + margen" necesitas el costo del proveedor.' })
    }
    if (p.pricingMode === 'fixed' && p.fixedPrice == null) {
      ctx.addIssue({ code: 'custom', path: ['fixedPrice'], message: 'Escribe el precio de venta.' })
    }
  })

export type ProductFormInput = z.input<typeof productSchema>

export async function saveProductAction(productId: number | null, input: ProductFormInput, initialStock?: number) {
  const parsed = productSchema.safeParse(input)
  // Un error de validación se le muestra al asesor, no se convierte en pantalla de error.
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos del producto." } as const
  const data = parsed.data
  const stock = z.number().int().min(0).max(1_000_000).optional().parse(initialStock)
  return run(
    (actor) => saveProduct(productId == null ? null : id.parse(productId), data, { initialStock: stock, actor }),
    productId ? 'Cambios guardados' : 'Producto creado',
  )
}

export async function setProductFlagsAction(productId: number, flags: { isActive?: boolean; isFeatured?: boolean }) {
  const parsed = z.object({ isActive: z.boolean().optional(), isFeatured: z.boolean().optional() }).parse(flags)
  return run(() => setProductFlags(id.parse(productId), parsed))
}

export async function deleteProductAction(productId: number) {
  const result = await run(() => deleteProduct(id.parse(productId)), 'Producto eliminado')
  if (result.ok) redirect('/admin/productos')
  return result
}

export async function adjustStockAction(input: { productId: number; mode: 'add' | 'remove' | 'set'; quantity: number; note: string }) {
  const parsed = z
    .object({
      productId: id,
      mode: z.enum(['add', 'remove', 'set']),
      quantity: z.number().int().min(0).max(1_000_000),
      note: z.string().trim().max(300),
    })
    .parse(input)
  if (parsed.mode !== 'set' && parsed.quantity === 0) return { ok: false, error: 'Escribe una cantidad mayor que cero.' } as const
  return run((actor) => adjustStock({ ...parsed, note: parsed.note || null, actor }), 'Inventario actualizado')
}

// ---------------------------------------------------------------------------
// Precios y márgenes
// ---------------------------------------------------------------------------

export async function savePricingSettingsAction(input: { defaultMarkupPercent: number; priceRounding: number }) {
  const parsed = z
    .object({
      defaultMarkupPercent: percent,
      priceRounding: z.union([z.literal(1), z.literal(10), z.literal(50), z.literal(100), z.literal(500), z.literal(1000)]),
    })
    .parse(input)
  return run(async () => {
    await updateSettings(parsed)
    const changed = await recalculatePrices()
    return { changed }
  }, 'Margen general guardado')
}

export async function saveVolumeSettingsAction(input: { volumeTiers: VolumeTier[]; minMarginPercent: number }) {
  const parsed = z.object({ volumeTiers: volumeTiersSchema.unwrap(), minMarginPercent: percent }).parse(input)
  return run(async () => {
    await updateSettings(parsed)
  }, "Escala por cantidad guardada")
}

export async function saveCategoryTiersAction(categoryId: number, tiers: VolumeTier[] | null) {
  const value = volumeTiersSchema.parse(tiers)
  return run(async () => {
    await db()`update public.categories set volume_tiers = ${value == null ? null : db().json(value as never)} where id = ${id.parse(categoryId)}`
  }, "Escala de la categoría guardada")
}

export async function saveCategoryMarkupAction(categoryId: number, markupPercent: number | null) {
  const value = percent.nullable().parse(markupPercent)
  return run(async () => {
    await db()`update public.categories set markup_percent = ${value} where id = ${id.parse(categoryId)}`
    const changed = await recalculatePrices()
    return { changed }
  }, 'Margen de la categoría guardado')
}

// ---------------------------------------------------------------------------
// Configuración de la tienda
// ---------------------------------------------------------------------------

export async function saveStoreSettingsAction(input: {
  businessName: string
  whatsappNumber: string
  contactEmail: string
  contactPhone: string
  address: string
  city: string
  lowStockThreshold: number
}) {
  const parsed = z
    .object({
      businessName: z.string().trim().min(2).max(80),
      whatsappNumber: z
        .string()
        .transform(normalizePhone)
        .refine((v) => /^[0-9]{10,15}$/.test(v), 'El WhatsApp debe tener indicativo y número, por ejemplo 573001234567.'),
      contactEmail: z.email('Revisa el correo de contacto.'),
      contactPhone: z.string().trim().max(40),
      address: z.string().trim().max(200),
      city: z.string().trim().min(2).max(80),
      lowStockThreshold: z.number().int().min(0).max(100000),
    })
    .parse(input)
  return run(
    () =>
      updateSettings({
        ...parsed,
        contactPhone: parsed.contactPhone || null,
        address: parsed.address || null,
      }),
    'Configuración guardada',
  )
}

// ---------------------------------------------------------------------------
// Importación desde Texcomercial
// ---------------------------------------------------------------------------

export interface SupplierPreview {
  handle: string
  sourceId: string
  name: string
  brand: string | null
  image: string | null
  costPrice: number | null
  suggestedPrice: number | null
  /** Margen que se aplicaría al importarlo (categoría existente, departamento o general). */
  suggestedMarkup: number
  available: boolean
  categoryPath: string[]
  department: string | null
  alreadyImported: boolean
}

export async function searchSupplierAction(query: string, page = 1) {
  const q = z.string().trim().min(2, 'Escribe al menos 2 letras.').max(80).parse(query)
  return run(async () => {
    const [result, settings, categories] = await Promise.all([searchSupplier(q, page), loadSettings(), loadCategories()])
    const products = await fetchSupplierProducts(result.handles)
    const existing = await db()<{ sourceId: string }[]>`
      select source_id from public.products where source_id = any(${products.map((p) => p.sourceId)})
    `
    const imported = new Set(existing.map((e) => e.sourceId))
    const index = buildCategoryIndex(categories)

    // Categoría más profunda que ya exista para la ruta del proveedor (para heredar su margen).
    const deepestCategory = (department: string | null, path: string[]) => {
      let current = index.departments.find((d) => d.slug === department)
      for (const name of path) {
        const child = current && index.childrenOf(current.id).find((c) => normalizeText(c.name) === normalizeText(name))
        if (!child) break
        current = child
      }
      return current?.id ?? null
    }

    const items: SupplierPreview[] = products.map((p) => {
      const markup = index.inheritedMarkup(deepestCategory(p.department, p.categoryPath))?.percent ?? settings.defaultMarkupPercent
      return {
        handle: p.handle,
        sourceId: p.sourceId,
        name: p.name,
        brand: p.brand,
        image: p.images[0] ?? null,
        costPrice: p.costPrice,
        suggestedMarkup: markup,
        suggestedPrice: computePrice({
          mode: 'markup',
          costPrice: p.costPrice,
          fixedPrice: null,
          productMarkup: markup,
          categoryMarkup: null,
          defaultMarkup: settings.defaultMarkupPercent,
          rounding: settings.priceRounding,
        }).price,
        available: p.available,
        categoryPath: p.categoryPath,
        department: p.department,
        alreadyImported: imported.has(p.sourceId),
      }
    })
    return { items, total: result.total, hasMore: result.hasMore, page }
  })
}

export async function syncSupplierAction() {
  return run(() => syncSupplierBatch(60))
}

export async function importSupplierAction(input: {
  handles: string[]
  pricingMode: 'markup' | 'fixed' | 'quote'
  markupPercent: number | null
  initialStock: number
  isActive: boolean
}) {
  const parsed = z
    .object({
      handles: z.array(z.string().regex(/^[a-z0-9%-]+$/i)).min(1, 'Selecciona al menos un producto.').max(48),
      pricingMode: z.enum(['markup', 'fixed', 'quote']),
      markupPercent: percent.nullable(),
      initialStock: z.number().int().min(0).max(1_000_000),
      isActive: z.boolean(),
    })
    .parse(input)
  return run(async (actor) => {
    const products = await fetchSupplierProducts(parsed.handles)
    if (products.length === 0) throw new ImportError('El proveedor no devolvió esos productos. Intenta de nuevo.')
    return importSupplierProducts(products, { ...parsed, actor })
  })
}
