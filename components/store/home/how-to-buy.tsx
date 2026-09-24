import { ListChecksIcon, TruckIcon } from 'lucide-react'
import { CompanyHeading } from './company-heading'
import { WhatsAppPreview } from './whatsapp-preview'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    n: '01',
    label: 'Lista',
    icon: ListChecksIcon,
    title: 'Arma tu lista',
    text: 'Agrega productos desde el catálogo. Si alguno no tiene precio publicado, lo cotizamos por ti.',
    tags: ['Sin registro', 'Precios por volumen', 'Productos a cotizar'],
  },
  {
    n: '02',
    label: 'WhatsApp',
    icon: WhatsAppIcon,
    title: 'Envíala por WhatsApp',
    text: 'Tu pedido llega a un asesor con el detalle completo y un código para hacerle seguimiento.',
    tags: ['Código KVX-0000', 'Asesor real', 'Respuesta en el chat'],
  },
  {
    n: '03',
    label: 'Despacho',
    icon: TruckIcon,
    title: 'Confirmamos y despachamos',
    text: 'Acordamos pago y entrega contigo. Separamos tus unidades y enviamos a toda Colombia.',
    tags: ['Unidades separadas', 'Pago acordado', 'Envío nacional'],
  },
]

/**
 * Recorrido con columna fija: el título, el ejemplo del chat y el avance se quedan
 * quietos mientras los pasos pasan al lado. En pantallas pequeñas se apila.
 */
export function HowToBuy({ whatsappUrl }: { whatsappUrl: string }) {
  // Ojo: nada de overflow-hidden en esta sección; recortaría el comportamiento fijo
  // de la columna izquierda.
  return (
    <section id="como-comprar" className="scrolly relative scroll-mt-32 bg-brand-navy text-white">
      {/* Trama diagonal a 45°, la geometría del monograma */}
      <div aria-hidden="true" className="diag-lines pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid max-w-7xl gap-4 px-4 lg:grid-cols-2 lg:gap-16">
        <div className="py-14 lg:sticky lg:top-24 lg:flex lg:h-[calc(100svh-6rem)] lg:flex-col lg:justify-center lg:py-0">
          <p className="flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.25em] text-brand-cyan uppercase">
            <span aria-hidden="true" className="inline-block size-1.5 rotate-45 bg-brand-cyan" />
            Así se compra
          </p>
          <CompanyHeading tone="light" className="mt-4">
            Cómo comprar por WhatsApp
          </CompanyHeading>
          <p className="mt-4 max-w-md leading-relaxed text-white/70">
            Sin registros ni pasarelas: tú eliges los productos y un asesor cierra la compra contigo.
          </p>

          <div className="mt-8">
            <WhatsAppPreview />
          </div>

          <div className="mt-8 max-w-md">
            <div className="progress-track h-px w-full bg-white/20">
              <span aria-hidden="true" className="scrolly-progress progress-fill block h-px bg-brand-cyan" />
            </div>
            <ul
              aria-hidden="true"
              className="mt-3 flex justify-between text-[0.65rem] font-semibold tracking-[0.2em] text-white/50 uppercase"
            >
              {STEPS.map((step) => (
                <li key={step.n}>{step.label}</li>
              ))}
            </ul>
          </div>

          <Button
            size="xl"
            variant="whatsapp"
            className="chamfer mt-8 self-start"
            nativeButton={false}
            render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
          >
            <WhatsAppIcon data-icon="inline-start" />
            Escribir a un asesor
          </Button>
        </div>

        <ol className="flex flex-col">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="reveal flex flex-col justify-center py-8 lg:min-h-svh lg:py-0"
            >
              <article className="chamfer chamfer-lg relative overflow-hidden border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm md:p-9">
                {/* Número fantasma: da peso visual sin competir con el texto */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-5 right-3 font-display text-[6.5rem] leading-none text-white/[0.06] tabular md:text-[8rem]"
                >
                  {step.n}
                </span>
                {/* Barra que se traza con el scroll: marca el avance dentro del paso */}
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-white/10">
                  <span className="draw-y-on-view block h-full w-full origin-top bg-brand-cyan" />
                </span>

                <span className="chamfer chamfer-sm flex size-12 items-center justify-center bg-brand-blue text-white">
                  <step.icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
                </span>

                <p className="mt-6 font-display text-sm tracking-widest text-brand-cyan uppercase tabular">
                  {step.n} / {step.label}
                </p>
                <h3 className="mt-3 font-display text-xl leading-snug uppercase md:text-2xl">{step.title}</h3>
                <p className="mt-4 max-w-md leading-relaxed text-white/70 md:text-lg">{step.text}</p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {step.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
