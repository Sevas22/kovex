import 'server-only'
import { db } from './db'

/** Tipos que acepta el panel al subir una imagen. */
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024
/** Ancho máximo al que se reescala antes de guardar. */
const MAX_WIDTH = 1600

export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadError'
  }
}

export interface StoredUpload {
  id: string
  url: string
  width: number | null
  height: number | null
  size: number
}

/**
 * Reescala y convierte a WebP si hay soporte disponible. sharp viene con Next, pero
 * si algún día no está, se guarda el archivo original sin transformar.
 */
async function optimize(
  buffer: Buffer,
  contentType: string,
): Promise<{ data: Buffer; contentType: string; width: number | null; height: number | null }> {
  try {
    const { default: sharp } = await import('sharp')
    const image = sharp(buffer, { failOn: 'error' })
    const meta = await image.metadata()
    const resized = meta.width && meta.width > MAX_WIDTH ? image.resize({ width: MAX_WIDTH }) : image
    const data = await resized.webp({ quality: 82 }).toBuffer()
    const out = await sharp(data).metadata()
    return { data, contentType: 'image/webp', width: out.width ?? null, height: out.height ?? null }
  } catch {
    return { data: buffer, contentType, width: null, height: null }
  }
}

export async function saveUpload(file: File): Promise<StoredUpload> {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    throw new UploadError(`«${file.name}» no es una imagen JPG, PNG, WebP o AVIF.`)
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(`«${file.name}» pesa más de ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.`)
  }

  const original = Buffer.from(await file.arrayBuffer())
  if (original.length === 0) throw new UploadError(`«${file.name}» está vacío.`)
  const optimized = await optimize(original, file.type)

  const [row] = await db()<{ id: string }[]>`
    insert into public.uploads (filename, content_type, size, width, height, data)
    values (${file.name.slice(0, 200)}, ${optimized.contentType}, ${optimized.data.length},
            ${optimized.width}, ${optimized.height}, ${optimized.data})
    returning id::text as id
  `
  return {
    id: row.id,
    url: publicUrlFor(row.id, optimized.contentType),
    width: optimized.width,
    height: optimized.height,
    size: optimized.data.length,
  }
}

const EXTENSION: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/avif': 'avif',
}

/** La extensión es cosmética: la ruta resuelve por el id. */
export function publicUrlFor(id: string, contentType: string): string {
  return `/imagenes/${id}.${EXTENSION[contentType] ?? 'webp'}`
}

export async function getUpload(id: string): Promise<{ data: Buffer; contentType: string } | null> {
  const [row] = await db()<{ data: Buffer; contentType: string }[]>`
    select data, content_type from public.uploads where id = ${id}::uuid
  `
  return row ?? null
}
