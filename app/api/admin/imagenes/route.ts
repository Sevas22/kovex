import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentAdmin } from '@/lib/server/auth'
import { MAX_UPLOAD_BYTES, saveUpload, UploadError } from '@/lib/server/uploads'

/** Máximo de archivos por envío, para no bloquear la conexión con una carga enorme. */
const MAX_FILES = 10

/** Sube imágenes de producto desde el panel: POST multipart con el campo "archivos". */
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Tu sesión expiró. Vuelve a iniciar sesión.' }, { status: 401 })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'No pudimos leer los archivos.' }, { status: 400 })
  }

  const files = form.getAll('archivos').filter((f): f is File => f instanceof File)
  if (files.length === 0) return NextResponse.json({ error: 'No llegó ninguna imagen.' }, { status: 400 })
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Sube máximo ${MAX_FILES} imágenes a la vez.` }, { status: 400 })
  }
  const total = files.reduce((sum, f) => sum + f.size, 0)
  if (total > MAX_UPLOAD_BYTES * MAX_FILES) {
    return NextResponse.json({ error: 'El envío es demasiado grande.' }, { status: 413 })
  }

  try {
    const uploads = []
    for (const file of files) uploads.push(await saveUpload(file))
    return NextResponse.json({ uploads })
  } catch (error) {
    if (error instanceof UploadError) return NextResponse.json({ error: error.message }, { status: 400 })
    console.error('[subir-imagen]', error)
    return NextResponse.json({ error: 'No pudimos guardar la imagen. Inténtalo de nuevo.' }, { status: 500 })
  }
}
