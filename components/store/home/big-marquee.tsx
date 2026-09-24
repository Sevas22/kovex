import { Logo } from '@/components/brand/logo'

/**
 * Cinta tipográfica a gran tamaño: avanza sola, sin parar, y alterna las frases con
 * el monograma de la marca. Se detiene al pasar el mouse o al llegar con el teclado,
 * y queda quieta si el visitante pausa el movimiento.
 */
export function BigMarquee({ words, label }: { words: string[]; label: string }) {
  // Dos vueltas idénticas: la animación desplaza media pista, así el giro es continuo.
  const row = [...words, ...words]
  return (
    <section aria-label={label} className="relative overflow-hidden bg-brand-blue py-8 text-white select-none md:py-10">
      <p className="sr-only">{words.join(' · ')}</p>
      <div className="marquee overflow-hidden" aria-hidden="true">
        <ul className="marquee-track items-center gap-6 md:gap-10" style={{ animationDuration: '64s' }}>
          {row.map((word, i) => {
            // La posición dentro de la vuelta decide el separador: así las dos
            // vueltas son idénticas y el empalme no se nota.
            const j = i % words.length
            return (
              <li
                key={`${word}-${i}`}
                className="flex items-center gap-6 text-[clamp(1.5rem,5vw,3.5rem)] leading-none md:gap-10"
              >
                <span className="font-display whitespace-nowrap uppercase">{word}</span>
                {j % 2 === 1 ? (
                  // Placa blanca con el monograma: el logo también gira en el carrusel.
                  <span className="chamfer chamfer-sm flex h-[1.25em] shrink-0 items-center bg-white px-[0.22em]">
                    <Logo variant="mark" className="h-[0.85em] w-auto" />
                  </span>
                ) : (
                  <span className="inline-block size-[0.16em] shrink-0 rotate-45 bg-brand-cyan" />
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
