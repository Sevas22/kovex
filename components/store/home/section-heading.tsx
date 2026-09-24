import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  description,
  link,
  className,
}: {
  /** Etiqueta corta sobre el título, con el rombo de la marca. */
  eyebrow?: string
  title: string
  description?: string
  link?: { href: string; label: string }
  className?: string
}) {
  return (
    <div className={cn('mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3', className)}>
      <div>
        {eyebrow ? (
          <p className="mb-3 flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.25em] text-brand-blue uppercase">
            <span aria-hidden="true" className="inline-block size-1.5 rotate-45 bg-brand-cyan" />
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-xl leading-snug text-brand-navy uppercase md:text-2xl">{title}</h2>
        {description ? <p className="mt-2.5 max-w-lg text-muted-foreground">{description}</p> : null}
      </div>
      {link ? (
        <Link
          href={link.href}
          className="group/link flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-navy"
        >
          {link.label}
          <ArrowRightIcon
            className="size-4 transition-transform group-hover/link:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  )
}
