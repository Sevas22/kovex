import { ArrowDownIcon, ArrowRightIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { Button } from '@/components/ui/button'

export function Hero({ whatsappUrl, categories = [] }: { whatsappUrl: string; categories?: string[] }) {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-mist">
        <div className="mx-auto max-w-7xl px-4">
          <div className="relative z-10 flex flex-col gap-6 py-12 md:py-16 lg:w-[46%] lg:py-28">
            <h1 className="anim-in font-display text-[1.7rem] leading-[1.2] text-brand-navy uppercase sm:text-4xl xl:text-[2.75rem]">
              Soluciones{' '}
              <span className="relative inline-block text-brand-blue">
                mayoristas
                <span
                  aria-hidden="true"
                  className="anim-underline absolute -bottom-1 left-0 h-[3px] w-full bg-brand-cyan"
                />
              </span>{' '}
              para tu negocio
            </h1>
            <p className="anim-in anim-delay-1 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Ferretería, agro, hogar, maquinaria, tecnología y electro en un solo proveedor. Arma tu pedido aquí y
              ciérralo con un asesor por WhatsApp.
            </p>
            <div className="anim-in anim-delay-2 flex flex-wrap gap-3">
              <Button
                size="xl"
                className="chamfer pr-7 transition-transform hover:-translate-y-0.5"
                nativeButton={false}
                render={<Link href="/catalogo" />}
              >
                Ver catálogo
                <ArrowRightIcon data-icon="inline-end" className="transition-transform group-hover/button:translate-x-0.5" />
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="transition-transform hover:-translate-y-0.5"
                nativeButton={false}
                render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
              >
                <WhatsAppIcon data-icon="inline-start" className="text-whatsapp-600" />
                Cotizar por WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* Fachada hasta el borde de la pantalla, con el corte diagonal del monograma */}
        <div className="relative h-64 sm:h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[54%]">
          <div className="anim-wipe absolute inset-0">
            <div className="parallax absolute inset-x-0 -inset-y-[6%] lg:[clip-path:polygon(22%_0,100%_0,100%_100%,0_100%)]">
              <Image
                src="/brand/fachada.jpg"
                alt="Sede de KOVEX Colombia con camión de distribución"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 54vw"
                className="anim-zoom-out object-cover object-[65%_center]"
              />
            </div>
          </div>
          <svg
            className="anim-in anim-delay-3 pointer-events-none absolute inset-0 hidden size-full lg:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="14,0 20,0 -2,100 -8,100" fill="var(--brand-blue)" />
            <polygon points="20.9,0 21.4,0 -0.6,100 -1.1,100" fill="var(--brand-cyan)" />
          </svg>
        </div>
      </section>

      <HeroTicker categories={categories} />
    </>
  )
}

const FALLBACK = ['Ferretería', 'Agro', 'Hogar', 'Maquinaria', 'Tecnología', 'Electro']

/** Cinta bajo el hero: invita a bajar y repasa las líneas de producto. */
function HeroTicker({ categories }: { categories: string[] }) {
  const words = categories.length ? categories : FALLBACK
  const row = [...words, ...words, ...words]
  return (
    <div className="relative flex items-center gap-6 overflow-hidden bg-brand-navy py-3.5 text-white">
      <p className="ml-4 hidden shrink-0 items-center gap-2 text-[0.65rem] font-semibold tracking-[0.25em] text-white/55 uppercase sm:flex">
        <ArrowDownIcon className="size-3.5 text-brand-cyan" aria-hidden="true" />
        Desplázate
      </p>
      <div className="marquee min-w-0 flex-1 overflow-hidden" aria-hidden="true">
        <ul className="marquee-track items-center gap-5 text-[0.7rem] font-semibold tracking-[0.25em] uppercase">
          {row.map((word, i) => (
            <li key={`${word}-${i}`} className="flex items-center gap-5 whitespace-nowrap">
              {word}
              <span className="inline-block size-1.5 rotate-45 bg-brand-cyan" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
