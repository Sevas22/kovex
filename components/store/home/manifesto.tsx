import { CompanyHeading } from './company-heading'
import { Logo } from '@/components/brand/logo'
import { COMPANY } from '@/lib/company'

export function Manifesto() {
  const [lead, closing] = COMPANY.manifestoClosing
  return (
    <section className="relative overflow-hidden bg-brand-navy text-white">
      <Logo
        variant="markNegative"
        className="pointer-events-none absolute top-1/2 -right-16 h-[115%] -translate-y-1/2 opacity-[0.08] md:right-8"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="reveal-children max-w-3xl">
          <CompanyHeading tone="light">Nuestro manifiesto</CompanyHeading>
          <div className="mt-8 flex flex-col gap-5 text-lg leading-relaxed text-white/80 md:text-xl">
            {COMPANY.manifesto.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-10 font-display text-2xl leading-snug uppercase md:text-3xl">
            {lead}
            <br />
            <span className="text-brand-cyan">{closing}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
