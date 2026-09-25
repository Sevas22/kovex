import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { BrandStrip } from '@/components/store/brand-strip'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { Button } from '@/components/ui/button'

const CLOSING = ['Sin registros ni pasarelas', 'Atención por WhatsApp', 'Envíos a toda Colombia']

export function CtaBand({ whatsappUrl, brands }: { whatsappUrl: string; brands: string[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 pb-16">
      {brands.length ? (
        <div className="reveal mb-14">
          <h2 className="mb-5 flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.25em] text-muted-foreground uppercase">
            <span aria-hidden="true" className="inline-block size-1.5 rotate-45 bg-brand-cyan" />
            Marcas que distribuimos
          </h2>
          {/* Cinta continua: se detiene al pasar el mouse o con el teclado */}
          <BrandStrip brands={brands} />
        </div>
      ) : null}

      <div className="sheen chamfer chamfer-lg relative overflow-hidden rounded-md bg-brand-blue px-6 py-12 text-white md:px-12 md:py-16">
        <Logo
          variant="markNegative"
          className="pointer-events-none absolute -right-6 -bottom-10 h-64 opacity-15 md:right-10 md:h-80"
        />
        <div className="relative max-w-xl">
          <p className="flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.25em] text-white/70 uppercase">
            <span aria-hidden="true" className="inline-block size-1.5 rotate-45 bg-brand-cyan" />
            Cotización mayorista
          </p>
          <h2 className="mt-4 font-display text-xl leading-snug uppercase md:text-3xl">¿Compras por volumen?</h2>
          <p className="mt-4 text-white/85 md:text-lg">
            Envíanos tu lista de referencias y te preparamos una cotización con precios por volumen, disponibilidad y
            tiempos de entrega.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="xl"
              variant="navy"
              className="chamfer"
              nativeButton={false}
              render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <WhatsAppIcon data-icon="inline-start" className="text-whatsapp" />
              Pedir cotización
            </Button>
            <Button
              size="xl"
              variant="ghost"
              className="border border-white/45 text-white hover:bg-white/15 hover:text-white"
              nativeButton={false}
              render={<Link href="/catalogo" />}
            >
              Ver catálogo
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
            {CLOSING.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span aria-hidden="true" className="inline-block size-1.5 rotate-45 bg-brand-cyan" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
