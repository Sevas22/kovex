'use client'

import { useState } from 'react'
import { ProductImage } from '@/components/store/product-image'
import { cn } from '@/lib/utils'

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)
  const current = images[active] ?? null

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-md border bg-white">
        <ProductImage src={current} alt={name} sizes="(max-width: 1024px) 100vw, 50vw" className="p-8" priority />
      </div>
      {images.length > 1 ? (
        <ul className="grid grid-cols-5 gap-2" aria-label="Fotos del producto">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver foto ${i + 1} de ${images.length}`}
                aria-current={i === active}
                className={cn(
                  'relative block aspect-square w-full overflow-hidden rounded-sm border bg-white',
                  i === active ? 'border-brand-blue ring-1 ring-brand-blue' : 'hover:border-brand-steel',
                )}
              >
                <ProductImage src={src} alt="" sizes="96px" className="p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
