import { Logo } from '@/components/brand/logo'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { Button } from '@/components/ui/button'

export function CtaBand({ whatsappUrl, brands }: { whatsappUrl: string; brands: string[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 pb-16">
      {brands.length ? (
        <div className="reveal mb-12">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Marcas que distribuimos</h2>
          {/* Cinta continua: se detiene al pasar el mouse o con el teclado */}
          <div className="marquee overflow-hidden">
            <ul className="marquee-track gap-2">
              {[...brands, ...brands].map((b, i) => (
                <li
                  key={`${b}-${i}`}
                  aria-hidden={i >= brands.length}
                  className="rounded-sm border bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-brand-navy"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="sheen chamfer chamfer-lg relative rounded-md bg-brand-blue px-6 py-10 text-white md:px-12 md:py-14">
        <Logo
          variant="markNegative"
          className="pointer-events-none absolute -right-6 -bottom-10 h-64 opacity-15 md:right-10 md:h-80"
        />
        <div className="relative max-w-xl">
          <h2 className="font-display text-xl uppercase md:text-2xl">¿Compras por volumen?</h2>
          <p className="mt-3 text-white/85">
            Envíanos tu lista de referencias y te preparamos una cotización mayorista con disponibilidad y tiempos de
            entrega.
          </p>
          <Button
            size="xl"
            variant="navy"
            className="mt-6"
            nativeButton={false}
            render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
          >
            <WhatsAppIcon data-icon="inline-start" className="text-whatsapp" />
            Pedir cotización
          </Button>
        </div>
      </div>
    </section>
  )
}
