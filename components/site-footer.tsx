import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Logo } from '@/components/logo'
import { CATEGORIES, WHATSAPP_NUMBER } from '@/lib/data'

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-brand-navy text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo variant="light" />
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Distribuidor mayorista multicategoría. Conectamos tu negocio con miles de productos,
            precios competitivos y disponibilidad.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
            Categorías
          </h3>
          <ul className="flex flex-col gap-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/catalogo?cat=${c.slug}`} className="hover:text-brand-cyan">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
            Enlaces
          </h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/catalogo" className="hover:text-brand-cyan">
                Catálogo completo
              </Link>
            </li>
            <li>
              <Link href="/cotizacion" className="hover:text-brand-cyan">
                Mi cotización
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-brand-cyan">
                Panel administrativo
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
            Contacto
          </h3>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-brand-cyan" />
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-brand-cyan">
                +57 301 123 4567
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-brand-cyan" />
              ventas@kovex.com.co
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-brand-cyan" />
              Bogotá, Colombia
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-400 sm:flex-row">
          <span>© {new Date().getFullYear()} KOVEX Colombia. Todos los derechos reservados.</span>
          <span className="font-semibold tracking-wide">COMPRA MÁS. PAGA MEJOR. HAZ CRECER TU NEGOCIO.</span>
        </div>
      </div>
    </footer>
  )
}
