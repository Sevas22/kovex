'use client'

import { FileTextIcon, SaveIcon, Trash2Icon, UploadIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { ImageUploader } from './image-uploader'
import { useAdminAction } from './use-action'
import { deleteCatalogAction, saveCatalogAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { SeasonalCatalog } from '@/lib/server/seasonal-catalogs'

/** Un catálogo de temporada: portada, PDF (subido o enlazado) y orden. */
export function CatalogForm({ catalog }: { catalog?: SeasonalCatalog }) {
  const router = useRouter()
  const [title, setTitle] = useState(catalog?.title ?? '')
  const [description, setDescription] = useState(catalog?.description ?? '')
  const [cover, setCover] = useState<string[]>(catalog?.coverUrl ? [catalog.coverUrl] : [])
  const [fileUrl, setFileUrl] = useState(catalog?.fileUrl ?? '')
  const [isActive, setIsActive] = useState(catalog?.isActive ?? true)
  const [sortOrder, setSortOrder] = useState(String(catalog?.sortOrder ?? 0))
  const [subiendo, setSubiendo] = useState(false)
  const inputArchivo = useRef<HTMLInputElement>(null)
  const { pending, execute } = useAdminAction()

  const esPropio = fileUrl.startsWith('/archivos/')

  async function subirPdf(file: File) {
    setSubiendo(true)
    try {
      const form = new FormData()
      form.append('archivo', file)
      const res = await fetch('/api/admin/archivos', { method: 'POST', body: form })
      const data = (await res.json()) as { upload?: { url: string; size: number }; error?: string }
      if (!res.ok || !data.upload) {
        toast.error(data.error ?? 'No pudimos subir el PDF.')
        return
      }
      setFileUrl(data.upload.url)
      toast.success(`PDF subido · ${Math.round(data.upload.size / 1024 / 1024)} MB`)
    } catch {
      toast.error('No pudimos subir el PDF.')
    } finally {
      setSubiendo(false)
    }
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault()
    execute(
      () =>
        saveCatalogAction(catalog?.id ?? null, {
          title,
          description: description.trim() || null,
          coverUrl: cover[0] ?? null,
          fileUrl,
          isActive,
          sortOrder: Number(sortOrder) || 0,
        }),
      (data) => {
        if (!catalog && data?.id) router.push(`/admin/temporadas/${data.id}`)
        else router.refresh()
      },
    )
  }

  return (
    <form onSubmit={guardar} className="flex max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos del catálogo</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="c-title">Título</FieldLabel>
              <Input
                id="c-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Catálogo Navidad 2026"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="c-desc">Descripción corta</FieldLabel>
              <Textarea
                id="c-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Lo que encuentra el cliente en este catálogo."
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="c-order">Orden en la página</FieldLabel>
              <Input
                id="c-order"
                inputMode="numeric"
                className="max-w-28 tabular"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value.replace(/\D/g, ''))}
              />
              <FieldDescription>El número más bajo aparece primero.</FieldDescription>
            </Field>
            <Field orientation="horizontal">
              <Switch id="c-active" checked={isActive} onCheckedChange={setIsActive} />
              <FieldLabel htmlFor="c-active">Visible en la tienda</FieldLabel>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>El catálogo</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>Archivo PDF</FieldLabel>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={inputArchivo}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void subirPdf(f)
                    e.target.value = ''
                  }}
                />
                <Button type="button" variant="outline" disabled={subiendo} onClick={() => inputArchivo.current?.click()}>
                  {subiendo ? <Spinner data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
                  Subir PDF
                </Button>
                {fileUrl ? (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline"
                  >
                    <FileTextIcon className="size-4" aria-hidden="true" />
                    {esPropio ? 'Ver el PDF subido' : 'Ver el enlace'}
                  </a>
                ) : null}
              </div>
              <FieldDescription>Hasta 25 MB. O pega una dirección si el PDF ya está en otro lado.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="c-url">Dirección del catálogo</FieldLabel>
              <Input
                id="c-url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://… o sube un PDF arriba"
                required
              />
              <FieldDescription>
                Se llena sola al subir un PDF. También sirve para enlazar uno que ya esté publicado en otro sitio.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Portada</FieldLabel>
              <ImageUploader value={cover} onChange={(v) => setCover(v.slice(0, 1))} />
              <FieldDescription>
                La imagen de la tarjeta. Sin portada se muestra el monograma de KOVEX.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="xl" className="chamfer" disabled={pending || !fileUrl}>
          {pending ? <Spinner data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
          {catalog ? 'Guardar cambios' : 'Crear catálogo'}
        </Button>
        {catalog ? (
          <Button
            type="button"
            size="xl"
            variant="ghost"
            className="text-destructive"
            onClick={() => execute(() => deleteCatalogAction(catalog.id))}
          >
            <Trash2Icon data-icon="inline-start" />
            Eliminar
          </Button>
        ) : null}
      </div>
    </form>
  )
}
