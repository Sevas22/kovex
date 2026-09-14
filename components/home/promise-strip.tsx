import { BadgeDollarSign, Headset, ShieldCheck, Truck } from 'lucide-react'

const ITEMS = [
  {
    icon: BadgeDollarSign,
    title: 'Precios mayoristas',
    text: 'Ahorra más comprando al por mayor.',
  },
  {
    icon: Truck,
    title: 'Envíos a toda Colombia',
    text: 'Cobertura nacional garantizada.',
  },
  {
    icon: ShieldCheck,
    title: 'Marcas de confianza',
    text: 'Productos 100% garantizados.',
  },
  {
    icon: Headset,
    title: 'Atención especializada',
    text: 'Soporte para tu negocio.',
  },
]

export function PromiseStrip() {
  return (
    <section className="border-y border-border bg-secondary">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-cyan">
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-brand-navy">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
