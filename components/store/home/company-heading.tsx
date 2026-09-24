import { cn } from '@/lib/utils'

/** Título de sección con el marcador diagonal a 45° (el brazo azul del monograma). */
export function CompanyHeading({
  children,
  as: Tag = 'h2',
  tone = 'dark',
  className,
}: {
  children: React.ReactNode
  as?: 'h2' | 'h3'
  tone?: 'dark' | 'light'
  className?: string
}) {
  return (
    <Tag
      className={cn(
        'flex items-start gap-5 font-display leading-snug uppercase',
        Tag === 'h2' ? 'text-lg md:text-xl' : 'text-base',
        tone === 'dark' ? 'text-brand-navy' : 'text-white',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          // Se inclina desde la base para no salirse del margen izquierdo.
          'mt-[0.3em] h-3.5 w-6 shrink-0 origin-bottom -skew-x-[45deg]',
          tone === 'dark' ? 'bg-brand-blue' : 'bg-brand-cyan',
        )}
      />
      {children}
    </Tag>
  )
}
