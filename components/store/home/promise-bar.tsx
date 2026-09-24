import { BadgeDollarSignIcon, HeadsetIcon, ShieldCheckIcon, TruckIcon } from 'lucide-react'

const ITEMS = [
  { icon: BadgeDollarSignIcon, title: 'Precios mayoristas', text: 'Ahorra más comprando por volumen.' },
  { icon: TruckIcon, title: 'Envíos a toda Colombia', text: 'Despachos con aliados logísticos.' },
  { icon: ShieldCheckIcon, title: 'Marcas de confianza', text: 'Productos con garantía de fábrica.' },
  { icon: HeadsetIcon, title: 'Asesoría experta', text: 'Te ayudamos a elegir mejor.' },
]

export function PromiseBar() {
  return (
    <section aria-label="Por qué comprar en KOVEX" className="border-b bg-background">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <li key={item.title} className="flex items-center gap-3 border-border px-4 py-5 lg:border-l lg:first:border-l-0">
            <item.icon className="size-7 shrink-0 text-brand-blue" strokeWidth={1.6} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
