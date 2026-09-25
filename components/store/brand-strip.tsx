import Image from 'next/image'
import { brandLogo, brandSlug, LIGHT_LOGOS } from '@/lib/brand-logos'
import { cn } from '@/lib/utils'

/**
 * Cinta de marcas distribuidas. Usa el logotipo cuando existe el archivo en
 * /public/marcas y, si no, el nombre en una placa: nunca queda una imagen rota.
 */
export function BrandStrip({ brands, className }: { brands: string[]; className?: string }) {
  if (brands.length === 0) return null
  const row = [...brands, ...brands]

  return (
    <div className={cn('marquee overflow-hidden', className)}>
      <ul className="marquee-track items-stretch gap-2.5">
        {row.map((brand, i) => {
          const logo = brandLogo(brand)
          const light = LIGHT_LOGOS.has(brandSlug(brand))
          return (
            <li
              key={`${brand}-${i}`}
              aria-hidden={i >= brands.length}
              className={cn(
                'flex h-16 shrink-0 items-center justify-center rounded-sm border px-6',
                // Los logotipos comparten ancho; las placas de texto se ajustan al nombre.
                logo ? 'w-40' : 'min-w-40',
                light ? 'bg-brand-navy' : 'bg-white',
              )}
            >
              {logo ? (
                <Image
                  src={logo}
                  alt={brand}
                  width={160}
                  height={64}
                  unoptimized
                  className="max-h-10 w-auto object-contain transition duration-300 hover:scale-105"
                />
              ) : (
                <span className="font-display text-xs whitespace-nowrap text-brand-navy uppercase">{brand}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
