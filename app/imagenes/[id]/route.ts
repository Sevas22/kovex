import { NextResponse } from 'next/server'
import { getUpload } from '@/lib/server/uploads'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Sirve una imagen subida desde el panel: /imagenes/<id>.webp */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const uuid = id.replace(/\.[a-z0-9]+$/i, '')
  if (!UUID.test(uuid)) return new NextResponse('No encontrada', { status: 404 })

  const upload = await getUpload(uuid)
  if (!upload) return new NextResponse('No encontrada', { status: 404 })

  return new NextResponse(new Uint8Array(upload.data), {
    headers: {
      'content-type': upload.contentType,
      // El id no se reutiliza, así que la imagen puede quedarse en caché para siempre.
      'cache-control': 'public, max-age=31536000, immutable',
    },
  })
}
