import 'server-only'
import { cache } from 'react'
import { db, type Sql, type Tx } from './db'
import { normalizeTiers } from '@/lib/volume-pricing'
import type { PublicStoreInfo, StoreSettings } from '@/lib/types'

export async function loadSettings(sql: Sql | Tx = db()): Promise<StoreSettings> {
  const [row] = await sql<StoreSettings[]>`
    select business_name, whatsapp_number, contact_email, contact_phone, address, city,
           default_markup_percent, price_rounding, low_stock_threshold, product_limit,
           volume_tiers, min_margin_percent
    from public.store_settings
    where id
  `
  if (!row) throw new Error('No existe la fila de configuración (store_settings).')
  return { ...row, volumeTiers: normalizeTiers(row.volumeTiers) }
}

/** Configuración de la tienda, una sola consulta por request. */
export const getSettings = cache(() => loadSettings())

export async function getPublicStoreInfo(): Promise<PublicStoreInfo> {
  const s = await getSettings()
  return {
    businessName: s.businessName,
    whatsappNumber: s.whatsappNumber,
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    city: s.city,
  }
}

export type SettingsPatch = Partial<Omit<StoreSettings, 'productLimit'>>

export async function updateSettings(patch: SettingsPatch): Promise<void> {
  const sql = db()
  const entries = Object.entries(patch)
    .filter(([, v]) => v !== undefined)
    // La escala es jsonb: hay que enviarla como JSON, no como arreglo de Postgres.
    // El tipo JSONValue de postgres.js no admite arreglos en la raíz; el driver sí.
    .map(([k, v]) => [k, k === 'volumeTiers' ? sql.json(normalizeTiers(v) as never) : v] as const)
  if (entries.length === 0) return
  const values = Object.fromEntries(entries) as Record<string, never>
  await sql`update public.store_settings set ${sql(values, Object.keys(values))} where id`
}
