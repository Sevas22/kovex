import 'server-only'
import { db } from './db'
import { slugify } from '@/lib/text'

export interface SeasonalCatalog {
  id: number
  slug: string
  title: string
  description: string | null
  coverUrl: string | null
  fileUrl: string
  isActive: boolean
  sortOrder: number
}

export class CatalogError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CatalogError'
  }
}

const COLUMNAS = db()`id, slug, title, description, cover_url, file_url, is_active, sort_order`

/** Los que ve el público, en el orden que fijó el panel. */
export async function listPublicCatalogs(): Promise<SeasonalCatalog[]> {
  return db()<SeasonalCatalog[]>`
    select ${COLUMNAS} from public.seasonal_catalogs
    where is_active order by sort_order, id
  `
}

/** Todos, incluidos los ocultos, para la lista del panel. */
export async function listAdminCatalogs(): Promise<SeasonalCatalog[]> {
  return db()<SeasonalCatalog[]>`
    select ${COLUMNAS} from public.seasonal_catalogs order by sort_order, id
  `
}

export async function getCatalog(id: number): Promise<SeasonalCatalog | null> {
  if (!Number.isInteger(id) || id <= 0) return null
  const [row] = await db()<SeasonalCatalog[]>`select ${COLUMNAS} from public.seasonal_catalogs where id = ${id}`
  return row ?? null
}

export interface CatalogInput {
  title: string
  description: string | null
  coverUrl: string | null
  fileUrl: string
  isActive: boolean
  sortOrder: number
}

/** Slug único a partir del título; si choca, le añade un número. */
async function slugUnico(title: string, excluirId: number | null): Promise<string> {
  const base = slugify(title) || 'catalogo'
  for (let i = 0; i < 50; i++) {
    const intento = i === 0 ? base : `${base}-${i + 1}`
    const [row] = await db()<{ id: number }[]>`
      select id from public.seasonal_catalogs
      where slug = ${intento} and (${excluirId}::bigint is null or id <> ${excluirId})
    `
    if (!row) return intento
  }
  throw new CatalogError('No se pudo generar una dirección única para ese título.')
}

export async function saveCatalog(id: number | null, input: CatalogInput): Promise<number> {
  const slug = await slugUnico(input.title, id)
  const valores = {
    slug,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    coverUrl: input.coverUrl || null,
    fileUrl: input.fileUrl.trim(),
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  }
  if (id == null) {
    const [row] = await db()<{ id: number }[]>`
      insert into public.seasonal_catalogs ${db()(valores)} returning id
    `
    return row.id
  }
  await db()`update public.seasonal_catalogs set ${db()(valores)} where id = ${id}`
  return id
}

export async function deleteCatalog(id: number) {
  await db()`delete from public.seasonal_catalogs where id = ${id}`
}
