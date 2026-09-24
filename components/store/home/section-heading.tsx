import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function SectionHeading({
  title,
  description,
  link,
  className,
}: {
  title: string
  description?: string
  link?: { href: string; label: string }
  className?: string
}) {
  return (
    <div className={cn('mb-6 flex items-end justify-between gap-4', className)}>
      <div>
        <h2 className="font-display text-lg text-brand-navy uppercase md:text-xl">{title}</h2>
        {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {link ? (
        <Link
          href={link.href}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
        >
          {link.label}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  )
}
