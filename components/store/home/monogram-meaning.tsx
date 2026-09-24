import Image from 'next/image'
import { COMPANY } from '@/lib/company'
import { cn } from '@/lib/utils'

// Lienzo de 260 × 100 unidades. El monograma (391 × 448 px) ocupa el alto completo y queda
// centrado: 87,3 unidades de ancho a partir de x = 86,4. Cada punto marca el trazo que describe.
const CANVAS_WIDTH = 260
const LEFT_EDGE = 64
const RIGHT_EDGE = 196
const POINTS: { x: number; y: number; side: 'left' | 'right' }[] = [
  { x: 98.6, y: 34, side: 'left' }, // Fuerza: barra vertical
  { x: 143.5, y: 18, side: 'right' }, // Innovación: diagonal superior azul
  { x: 127.5, y: 53, side: 'right' }, // Conexión: X interna
  { x: 144, y: 84, side: 'right' }, // Estabilidad: base diagonal
]

const pct = (x: number) => `${(x / CANVAS_WIDTH) * 100}%`

export function MonogramMeaning() {
  return (
    <figure>
      <figcaption className="mb-8 text-center text-sm font-semibold text-muted-foreground">
        Lo que representa nuestra K
      </figcaption>

      {/* Escritorio: monograma anotado como en el manual de marca */}
      <div className="relative mx-auto hidden aspect-[26/10] max-w-5xl lg:block">
        <Image
          src="/brand/monograma.png"
          alt="Monograma KOVEX"
          width={391}
          height={448}
          unoptimized
          className="absolute top-0 left-1/2 h-full w-auto -translate-x-1/2"
        />
        <svg
          viewBox={`0 0 ${CANVAS_WIDTH} 100`}
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
          aria-hidden="true"
        >
          {POINTS.map((p) => (
            <line
              key={`${p.x}-${p.y}`}
              x1={p.x}
              y1={p.y}
              x2={p.side === 'left' ? LEFT_EDGE : RIGHT_EDGE}
              y2={p.y}
              stroke="var(--brand-blue)"
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {POINTS.map((p, i) => (
          <span
            key={COMPANY.monogram[i].title}
            aria-hidden="true"
            className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue ring-4 ring-white"
            style={{ left: pct(p.x), top: `${p.y}%` }}
          />
        ))}
        {COMPANY.monogram.map((m, i) => {
          const p = POINTS[i]
          return (
            <div
              key={m.title}
              className={cn(
                'absolute w-[22%] -translate-y-[0.7rem]',
                p.side === 'left' ? 'text-right' : 'text-left',
              )}
              style={
                p.side === 'left'
                  ? { right: `calc(100% - ${pct(LEFT_EDGE)} + 1rem)`, top: `${p.y}%` }
                  : { left: `calc(${pct(RIGHT_EDGE)} + 1rem)`, top: `${p.y}%` }
              }
            >
              <p className="font-display text-sm text-brand-blue uppercase">{m.title}</p>
              <p className="mt-1 text-sm leading-snug text-muted-foreground">{m.text}</p>
            </div>
          )
        })}
      </div>

      {/* Móvil y tableta: monograma + lista */}
      <div className="lg:hidden">
        <Image src="/brand/monograma.png" alt="Monograma KOVEX" width={391} height={448} unoptimized className="mx-auto h-48 w-auto" />
        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          {COMPANY.monogram.map((m) => (
            <div key={m.title} className="border-l-2 border-brand-blue pl-4">
              <dt className="font-display text-sm text-brand-blue uppercase">{m.title}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{m.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </figure>
  )
}
