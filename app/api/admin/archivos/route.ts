import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentAdmin } from '@/lib/server/auth'
import { MAX_PDF_BYTES, savePdf, UploadError } from '@/lib/server/uploads'

/** Sube el PDF de un catálogo de temporada: POST multipart con el campo "archivo". */
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Tu sesión expiró. Vuelve a iniciar sesión.' }, { status: 401 })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'No pudimos leer el archivo.' }, { status: 400 })
  }

  const file = form.get('archivo')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No llegó ningún PDF.' }, { status: 400 })
  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: `El PDF pesa más de ${Math.round(MAX_PDF_BYTES / 1024 / 1024)} MB.` },
      { status: 413 },
    )
  }

  try {
    return NextResponse.json({ upload: await savePdf(file) })
  } catch (error) {
    if (error instanceof UploadError) return NextResponse.json({ error: error.message }, { status: 400 })
    console.error('[subir-pdf]', error)
    return NextResponse.json({ error: 'No pudimos guardar el PDF. Inténtalo de nuevo.' }, { status: 500 })
  }
}
