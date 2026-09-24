import 'server-only'
import { cache } from 'react'
import { db, type Sql, type Tx } from './db'
import type { PublicStoreInfo, StoreSettings } from '@/lib/types'

export async function loadSettings(sql: Sql | Tx = db()): Promise<StoreSettings> {
  const [row] = await sql<StoreSettings[]>`
    select business_name, whatsapp_number, contact_email, contact_phone, address, city,
           default_markup_percent, price_rounding, low_stock_threshold, product_limit
    from public.store_settings
    where id
  `
  if (!row) throw new Error('No existe la fila de configuración (store_settings).')
  return row
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
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return
  const values = Object.fromEntries(entries)
  await db()`update public.store_settings set ${db()(values, Object.keys(values))} where id`
}
