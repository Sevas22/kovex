import type { LucideIcon } from 'lucide-react'
import { displayWidth } from '@/lib/display-width'
import { cn } from '@/lib/utils'

export type StatementItem = { icon: LucideIcon; title: string; text: string }

/**
 * Banner tipográfico: frases cortas a gran tamaño que suben línea por línea con el
 * scroll. Cada línea se ajusta sola al ancho disponible (unidades de contenedor),
 * por eso nunca se parte ni se desborda.
 */
export function StatementBanner({
  eyebrow,
  lines,
  accentFrom,
  items,
  tone = 'light',
  max = '4.5rem',
  className,
}: {
  eyebrow?: string
  lines: string[]
  /** Desde esta línea (índice) el texto va en el color de acento. */
  accentFrom?: number
  items?: StatementItem[]
  tone?: 'light' | 'dark'
  /** Tamaño máximo de línea. */
  max?: string
  className?: string
}) {
  const dark = tone === 'dark'
  return (
    <section
      className={cn(
        'relative overflow-hidden',
        dark ? 'bg-brand-navy text-white' : 'bg-brand-mist text-brand-navy',
        className,
      )}
    >
      <div className="statement-box mx-auto max-w-7xl px-4 py-20 text-center md:py-28">
        {eyebrow ? (
          <p
            className={cn(
              'reveal mb-8 flex items-center justify-center gap-3 text-[0.7rem] font-semibold tracking-[0.2em] uppercase sm:tracking-[0.3em]',
              dark ? 'text-brand-cyan' : 'text-brand-blue',
            )}
          >
            <span aria-hidden="true" className="hidden h-px w-8 bg-current opacity-50 sm:block" />
            {eyebrow}
            <span aria-hidden="true" className="hidden h-px w-8 bg-current opacity-50 sm:block" />
          </p>
        ) : null}

        <h2 className="lines-in">
          {lines.map((line, i) => (
            <span key={line} className="line-mask">
              <span
                className={cn(
                  'statement-line block',
                  accentFrom !== undefined && i >= accentFrom && (dark ? 'text-brand-cyan' : 'text-brand-blue'),
                )}
                style={{ '--ch': displayWidth(line), '--statement-max': max } as React.CSSProperties}
              >
                {line}
              </span>
            </span>
          ))}
        </h2>

        {items?.length ? (
          <>
            <span aria-hidden="true" className={cn('rule-in mt-14 block h-px', dark ? 'bg-white/25' : 'bg-brand-navy/15')} />
            <ul className="reveal-children mx-auto mt-10 grid max-w-5xl gap-10 sm:grid-cols-3">
              {items.map((item) => (
                <li key={item.title} className="flex flex-col items-center gap-3">
                  <item.icon
                    className={cn('size-7', dark ? 'text-brand-cyan' : 'text-brand-blue')}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <h3 className="font-display text-sm uppercase">{item.title}</h3>
                  <p className={cn('max-w-xs text-sm leading-relaxed', dark ? 'text-white/70' : 'text-muted-foreground')}>
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </section>
  )
}
