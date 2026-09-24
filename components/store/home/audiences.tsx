import { Building2Icon, HardHatIcon, HouseIcon } from 'lucide-react'
import { CompanyHeading } from './company-heading'
import { COMPANY } from '@/lib/company'

const AUDIENCE_ICONS = [Building2Icon, HardHatIcon, HouseIcon]

function ColombiaFlag() {
  return (
    <span className="flex h-6 w-9 shrink-0 flex-col overflow-hidden rounded-[3px] ring-1 ring-black/5" aria-hidden="true">
      <span className="h-1/2 bg-[#FCD116]" />
      <span className="h-1/4 bg-[#003893]" />
      <span className="h-1/4 bg-[#CE1126]" />
    </span>
  )
}

export function Audiences() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:py-24 lg:grid-cols-[1fr_2fr] lg:gap-14">
        <div className="flex flex-col gap-6">
          <div>
            <CompanyHeading>Para quién trabajamos</CompanyHeading>
            <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
              Desde el negocio que compra por volumen hasta el profesional que necesita la herramienta para mañana.
            </p>
          </div>
          <div className="flex items-start gap-4 rounded-md bg-brand-mist p-5">
            <ColombiaFlag />
            <div>
              <p className="font-display text-sm text-brand-navy uppercase">Orgullosamente colombianos</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{COMPANY.proudlyColombian}</p>
            </div>
          </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {COMPANY.audiences.map((audience, i) => {
            const Icon = AUDIENCE_ICONS[i]
            return (
              <li key={audience.title} className="flex flex-col gap-4 rounded-md border p-6">
                <span className="chamfer chamfer-sm flex size-12 items-center justify-center bg-brand-navy text-white">
                  <Icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-brand-navy">{audience.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{audience.text}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
