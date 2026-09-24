import Image from 'next/image'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { Button } from '@/components/ui/button'
import { displayWidth } from '@/lib/display-width'

const STEPS_LABEL = 'Elegir · Cotizar · Despachar'

/**
 * Sección de pantalla completa: la foto crece hasta ocupar todo el ancho mientras la
 * página avanza y el texto permanece fijo. Sin soporte de líneas de tiempo de scroll
 * se ve igual, pero con la foto ya a pantalla completa desde el inicio.
 */
export function CinemaScroll({ whatsappUrl }: { whatsappUrl: string }) {
  const lines = ['Cotiza hoy.', 'Despacha mañana.']
  return (
    <section className="scrolly relative h-[240svh] bg-brand-navy">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="scrolly-frame cinema-frame absolute overflow-hidden">
          <Image
            src="/brand/camion.jpg"
            alt="Camión de distribución de KOVEX Colombia listo para despachar"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 via-brand-navy/60 to-brand-navy/95"
          />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-center px-4 text-center text-white">
          <p className="scrolly-fade text-[0.7rem] font-semibold tracking-[0.3em] text-brand-cyan uppercase">
            KOVEX Colombia · Logística
          </p>
          <div className="statement-box mx-auto mt-6 w-full max-w-5xl">
            {lines.map((line, i) => (
              <span key={line} className="line-mask">
                <span
                  className={`statement-line block ${i === 1 ? 'text-brand-cyan' : ''}`}
                  style={{ '--ch': displayWidth(line), '--statement-max': '4.75rem' } as React.CSSProperties}
                >
                  {line}
                </span>
              </span>
            ))}
          </div>
          <p className="scrolly-fade mx-auto mt-6 max-w-md leading-relaxed text-white/80 md:text-lg">
            Separamos tus unidades apenas confirmas el pedido y despachamos a toda Colombia con aliados logísticos.
          </p>
          <div className="scrolly-fade mt-8 flex justify-center">
            <Button
              size="xl"
              variant="navy"
              className="chamfer"
              nativeButton={false}
              render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <WhatsAppIcon data-icon="inline-start" className="text-whatsapp" />
              Cotizar por WhatsApp
            </Button>
          </div>
        </div>

        {/* Barra inferior: etiqueta del recorrido y avance de la sección */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-[max(6vw,1rem)] pb-8 text-white">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 text-[0.7rem] font-semibold tracking-[0.25em] uppercase text-white/70">{STEPS_LABEL}</p>
            <div className="progress-track h-px w-full bg-white/25">
              <span aria-hidden="true" className="scrolly-progress progress-fill block h-px bg-brand-cyan" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
