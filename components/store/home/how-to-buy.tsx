import { ListChecksIcon, TruckIcon } from 'lucide-react'
import Image from 'next/image'
import { CompanyHeading } from './company-heading'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'

const STEPS = [
  {
    n: '01',
    label: 'Lista',
    icon: ListChecksIcon,
    title: 'Arma tu lista',
    text: 'Agrega productos desde el catálogo. Si alguno no tiene precio publicado, lo cotizamos por ti.',
  },
  {
    n: '02',
    label: 'WhatsApp',
    icon: WhatsAppIcon,
    title: 'Envíala por WhatsApp',
    text: 'Tu pedido llega a un asesor con el detalle completo y un código para hacerle seguimiento.',
  },
  {
    n: '03',
    label: 'Despacho',
    icon: TruckIcon,
    title: 'Confirmamos y despachamos',
    text: 'Acordamos pago y entrega contigo. Separamos tus unidades y enviamos a toda Colombia.',
  },
]

/**
 * Recorrido con columna fija: el título y el avance se quedan quietos mientras los
 * pasos pasan al lado. En pantallas pequeñas se apila como una lista normal.
 */
export function HowToBuy() {
  return (
    <section id="como-comprar" className="scrolly relative scroll-mt-32 bg-brand-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 lg:grid-cols-2 lg:gap-16">
        <div className="py-14 lg:sticky lg:top-24 lg:flex lg:h-[calc(100svh-6rem)] lg:flex-col lg:justify-center lg:py-0">
          <CompanyHeading tone="light">Cómo comprar por WhatsApp</CompanyHeading>
          <p className="mt-4 max-w-md leading-relaxed text-white/70">
            Sin registros ni pasarelas: tú eliges los productos y un asesor cierra la compra contigo.
          </p>

          <div className="chamfer chamfer-lg relative mt-8 hidden aspect-[16/10] w-full max-w-md overflow-hidden lg:block">
            <Image
              src="/brand/camion.jpg"
              alt="Camión de distribución KOVEX"
              fill
              sizes="40vw"
              className="object-cover"
            />
          </div>

          <div className="mt-8 max-w-md">
            <div className="progress-track h-px w-full bg-white/20">
              <span aria-hidden="true" className="scrolly-progress progress-fill block h-px bg-brand-cyan" />
            </div>
            <ul aria-hidden="true" className="mt-3 flex justify-between text-[0.65rem] font-semibold tracking-[0.2em] text-white/50 uppercase">
              {STEPS.map((step) => (
                <li key={step.n}>{step.label}</li>
              ))}
            </ul>
          </div>
        </div>

        <ol className="flex flex-col">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="reveal flex flex-col justify-center border-t border-white/10 py-12 first:border-t-0 lg:min-h-svh lg:border-t-0 lg:py-0"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-display text-sm tracking-widest text-brand-cyan uppercase tabular">
                  {step.n} / {step.label}
                </p>
                <step.icon className="size-7 text-white/35" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-xl leading-snug uppercase md:text-2xl">{step.title}</h3>
              <p className="mt-4 max-w-md leading-relaxed text-white/70 md:text-lg">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
