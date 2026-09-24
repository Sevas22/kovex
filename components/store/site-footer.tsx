import { MailIcon, MapPinIcon } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { formatPhone } from '@/lib/text'
import type { CategoryLink, PublicStoreInfo } from '@/lib/types'
import { whatsappLink } from '@/lib/whatsapp'

export function SiteFooter({ departments, store }: { departments: CategoryLink[]; store: PublicStoreInfo }) {
  return (
    <footer className="bg-brand-navy text-white/75">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <Logo variant="negative" className="h-14 self-start" />
          <p className="max-w-xs text-sm leading-relaxed">
            Distribuidor mayorista multicategoría. Conectamos tu negocio con miles de productos, precios competitivos y
            disponibilidad.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-white">Departamentos</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {departments.map((d) => (
              <li key={d.slug}>
                <Link href={`/catalogo/${d.slug}`} className="hover:text-brand-cyan">
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-white">KOVEX</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {[
              ['/#nosotros', 'Quiénes somos'],
              ['/#mision', 'Misión, visión y valores'],
              ['/#como-comprar', 'Cómo comprar por WhatsApp'],
              ['/#preguntas', 'Preguntas frecuentes'],
              ['/catalogo', 'Catálogo completo'],
              ['/pedido', 'Mi pedido'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-brand-cyan">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-white">Contacto</h2>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <a
                href={whatsappLink(store.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-brand-cyan"
              >
                <WhatsAppIcon className="size-4 shrink-0 text-whatsapp" />
                <span className="tabular">{formatPhone(store.whatsappNumber)}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${store.contactEmail}`} className="flex items-center gap-2 hover:text-brand-cyan">
                <MailIcon className="size-4 shrink-0 text-brand-cyan" aria-hidden="true" />
                {store.contactEmail}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPinIcon className="size-4 shrink-0 text-brand-cyan" aria-hidden="true" />
              {store.city}, Colombia
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {store.businessName}. Todos los derechos reservados.</span>
          <span className="font-display text-[11px] text-white">
            Compra más. Paga mejor. <span className="text-brand-cyan">Haz crecer tu negocio.</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
