import { HandshakeIcon, LightbulbIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react'
import { CompanyHeading } from './company-heading'
import { COMPANY } from '@/lib/company'

const VALUE_ICONS = [ShieldCheckIcon, LightbulbIcon, HandshakeIcon, UsersIcon]

export function MissionValues() {
  return (
    <section id="mision" className="scroll-mt-32 bg-brand-mist">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="reveal-children grid gap-12 md:grid-cols-2 md:gap-0 md:divide-x md:divide-border">
          <div className="md:pr-12">
            <CompanyHeading>Misión</CompanyHeading>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-navy md:text-xl">{COMPANY.mission}</p>
          </div>
          <div className="md:pl-12">
            <CompanyHeading>Visión</CompanyHeading>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-navy md:text-xl">{COMPANY.vision}</p>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-12 md:mt-20">
          <CompanyHeading>Nuestros valores</CompanyHeading>
          <ul className="reveal-children mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {COMPANY.values.map((value, i) => {
              const Icon = VALUE_ICONS[i]
              return (
                <li key={value.title} className="flex flex-col gap-3">
                  <Icon className="size-9 text-brand-blue" strokeWidth={1.5} aria-hidden="true" />
                  <h3 className="text-lg font-bold text-brand-navy">{value.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{value.text}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
