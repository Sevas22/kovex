import { NextResponse } from 'next/server'
import { getUpload } from '@/lib/server/uploads'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Sirve un PDF subido desde el panel: /archivos/<id>.pdf
 *
 * Separado de /imagenes/ a propósito: así la ruta dice qué es y el optimizador
 * de imágenes de Next no intenta procesarlo.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const uuid = id.replace(/\.[a-z0-9]+$/i, '')
  if (!UUID.test(uuid)) return new NextResponse('No encontrado', { status: 404 })

  const upload = await getUpload(uuid)
  if (!upload) return new NextResponse('No encontrado', { status: 404 })

  return new NextResponse(new Uint8Array(upload.data), {
    headers: {
      'content-type': upload.contentType,
      // inline: se abre en el visor del navegador en vez de descargarse.
      'content-disposition': 'inline',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  })
}
