import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-navy">
      <div className="absolute inset-0">
        <Image
          src="/kovex/hero-warehouse.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-navy/40" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-cyan">
            Distribuidor Mayorista
          </span>
          <h1 className="mt-4 text-balance text-4xl font-extrabold leading-tight text-white md:text-6xl">
            Soluciones{' '}
            <span className="text-brand-blue">mayoristas</span> para tu negocio
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-300 md:text-lg">
            Amplio catálogo, las mejores marcas y precios competitivos para impulsar tu
            crecimiento. Todo lo que tu negocio necesita, en un solo lugar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand-blue text-white hover:bg-brand-blue-600"
            >
              <Link href="/catalogo">
                Ver catálogo
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/catalogo?cat=brochas-rodillos">Brochas y Rodillos</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
