import Image from 'next/image'

const STEPS = [
  {
    title: 'Arma tu lista',
    text: 'Agrega productos desde el catálogo. Si alguno no tiene precio publicado, lo cotizamos por ti.',
  },
  {
    title: 'Envíala por WhatsApp',
    text: 'Tu pedido llega a un asesor con el detalle completo y un código para hacerle seguimiento.',
  },
  {
    title: 'Confirmamos y despachamos',
    text: 'Acordamos pago y entrega contigo. Separamos tus unidades y enviamos a toda Colombia.',
  },
]

export function HowToBuy() {
  return (
    <section id="como-comprar" className="relative scroll-mt-32 overflow-hidden bg-brand-navy text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="py-14 md:py-20 lg:w-1/2 lg:pr-12">
          <h2 className="font-display text-xl uppercase md:text-2xl">Cómo comprar por WhatsApp</h2>
          <p className="mt-3 max-w-lg text-white/70">
            Sin registros ni pasarelas: tú eliges los productos y un asesor cierra la compra contigo.
          </p>
          <ol className="mt-10 flex flex-col gap-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[3.5rem_1fr] gap-4">
                <span className="font-display text-3xl leading-none text-brand-cyan tabular" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-[46%] lg:block">
        <Image
          src="/brand/camion.jpg"
          alt="Camión de distribución KOVEX"
          fill
          sizes="46vw"
          className="object-cover object-left [clip-path:polygon(16%_0,100%_0,100%_100%,0_100%)]"
        />
      </div>
    </section>
  )
}
