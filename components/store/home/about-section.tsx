import { PackageIcon, TagIcon, TruckIcon } from 'lucide-react'
import { CompanyHeading } from './company-heading'
import { KeyFigures } from './key-figures'
import { COMPANY } from '@/lib/company'
import type { CatalogFigures } from '@/lib/server/catalog'

const PILLAR_ICONS = [PackageIcon, TagIcon, TruckIcon]

export function AboutSection({ figures }: { figures: CatalogFigures }) {
  return (
    <section id="nosotros" className="scroll-mt-32 border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="reveal-children grid gap-8 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <div>
            <CompanyHeading>Quiénes somos</CompanyHeading>
            <p className="mt-5 max-w-md text-2xl leading-snug font-semibold text-brand-navy md:text-3xl">
              {COMPANY.tagline}
            </p>
          </div>
          <div className="flex max-w-2xl flex-col gap-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            <p className="text-foreground">{COMPANY.about}</p>
            <p>{COMPANY.aboutDetail}</p>
          </div>
        </div>

        <div className="mt-16 md:mt-20">
          <CompanyHeading as="h3" className="reveal">Nuestros 3 pilares</CompanyHeading>
          <dl className="reveal-children mt-6 grid gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-3">
            {COMPANY.pillars.map((pillar, i) => {
              const Icon = PILLAR_ICONS[i]
              return (
                <div key={pillar.title} className="flex items-start gap-4 bg-white p-6">
                  <Icon className="mt-0.5 size-7 shrink-0 text-brand-blue" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <dt className="font-display text-sm text-brand-navy uppercase">{pillar.title}</dt>
                    <dd className="mt-1.5 text-muted-foreground">{pillar.text}</dd>
                  </div>
                </div>
              )
            })}
          </dl>
        </div>

        <div className="mt-16 border-t pt-12 md:mt-20">
          <KeyFigures figures={figures} />
        </div>
      </div>
    </section>
  )
}
