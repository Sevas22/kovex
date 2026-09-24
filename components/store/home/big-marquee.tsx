import { cn } from '@/lib/utils'

/** Rombo a 45°, el mismo corte del monograma, usado como separador. */
function Diamond({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('inline-block size-2.5 shrink-0 rotate-45', className)} />
}

/**
 * Cinta tipográfica a gran tamaño. Avanza con el scroll (no con el tiempo), así que
 * el movimiento responde a lo que hace el usuario.
 */
export function BigMarquee({ words, label }: { words: string[]; label: string }) {
  const row = [...words, ...words]
  return (
    <section aria-label={label} className="relative overflow-hidden bg-brand-blue py-8 text-white select-none md:py-10">
      <p className="sr-only">{words.join(' · ')}</p>
      <div className="marquee marquee-on-scroll overflow-hidden" aria-hidden="true">
        <ul className="marquee-track items-center gap-6 md:gap-10">
          {row.map((word, i) => (
            <li key={`${word}-${i}`} className="flex items-center gap-6 md:gap-10">
              <span className="font-display text-[clamp(1.5rem,5vw,3.5rem)] leading-none whitespace-nowrap uppercase">
                {word}
              </span>
              <Diamond className="bg-brand-cyan" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
