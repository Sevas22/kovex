'use client'

import { ChevronLeftIcon, ChevronRightIcon, ImagePlusIcon, LinkIcon, Trash2Icon, UploadIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const MAX_IMAGES = 10

/**
 * Galería del producto: sube archivos desde el computador (se guardan en la tienda)
 * o pega una URL del proveedor. La primera imagen es la principal.
 */
export function ImageUploader({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [url, setUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) return
    const room = MAX_IMAGES - value.length
    if (room <= 0) {
      toast.error(`Máximo ${MAX_IMAGES} imágenes por producto.`)
      return
    }

    const form = new FormData()
    for (const file of list.slice(0, room)) form.append('archivos', file)

    setUploading(true)
    try {
      const res = await fetch('/api/admin/imagenes', { method: 'POST', body: form })
      const data = (await res.json()) as { uploads?: { url: string }[]; error?: string }
      if (!res.ok || !data.uploads) {
        toast.error(data.error ?? 'No pudimos subir las imágenes.')
        return
      }
      onChange([...value, ...data.uploads.map((u) => u.url)])
      toast.success(data.uploads.length === 1 ? 'Imagen subida' : `${data.uploads.length} imágenes subidas`)
    } catch {
      toast.error('No pudimos subir las imágenes. Revisa tu conexión.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return
    const next = [...value]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  function addUrl() {
    const clean = url.trim()
    if (!clean) return
    if (!/^https?:\/\//i.test(clean)) {
      toast.error('La URL debe empezar por http:// o https://')
      return
    }
    if (value.includes(clean)) {
      toast.error('Esa imagen ya está en la lista.')
      return
    }
    onChange([...value, clean])
    setUrl('')
  }

  return (
    <div className="flex flex-col gap-3">
      <FieldLabel>Imágenes</FieldLabel>

      {value.length ? (
        <ul className="flex flex-wrap gap-3">
          {value.map((src, i) => (
            <li key={src} className="group relative">
              <div className="relative size-28 overflow-hidden rounded-md border bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-contain p-1.5" />
                {i === 0 ? (
                  <span className="absolute top-1 left-1 rounded-sm bg-brand-blue px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">
                    Principal
                  </span>
                ) : null}
              </div>
              <div className="mt-1 flex items-center justify-between gap-1">
                <div className="flex gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Mover a la izquierda"
                    disabled={i === 0}
                    onClick={() => move(i, i - 1)}
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Mover a la derecha"
                    disabled={i === value.length - 1}
                    onClick={() => move(i, i + 1)}
                  >
                    <ChevronRightIcon />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Quitar la imagen"
                  onClick={() => onChange(value.filter((_, n) => n !== i))}
                >
                  <Trash2Icon className="text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          void upload(e.dataTransfer.files)
        }}
        className={cn(
          'flex flex-col items-center gap-2 rounded-md border border-dashed px-4 py-6 text-center transition-colors',
          dragging ? 'border-brand-blue bg-accent' : 'bg-muted/40',
        )}
      >
        <ImagePlusIcon className="size-6 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          Arrastra las fotos aquí o{' '}
          <button
            type="button"
            className="font-semibold text-brand-blue underline-offset-2 hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            elígelas de tu computador
          </button>
          .
        </p>
        <p className="text-xs text-muted-foreground">JPG, PNG, WebP o AVIF · hasta 6 MB cada una</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && void upload(e.target.files)}
        />
        {uploading ? (
          <p className="flex items-center gap-2 text-sm font-medium text-brand-blue">
            <Spinner className="size-4" />
            Subiendo…
          </p>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <UploadIcon data-icon="inline-start" />
            Subir imágenes
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addUrl()
            }
          }}
          placeholder="https://… (imagen del proveedor)"
          className="h-9 font-mono text-xs"
          aria-label="Agregar imagen por URL"
        />
        <Button type="button" variant="outline" size="sm" onClick={addUrl}>
          <LinkIcon data-icon="inline-start" />
          Agregar
        </Button>
      </div>

      <FieldDescription>
        La primera imagen es la que se ve en el catálogo. Ordénalas con las flechas.
      </FieldDescription>
    </div>
  )
}
