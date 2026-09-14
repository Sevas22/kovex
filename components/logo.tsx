import { cn } from '@/lib/utils'

/**
 * Monograma KOVEX: doble lectura K + X.
 * Barra vertical (fuerza) + diagonal azul superior (evolución) +
 * diagonal navy inferior, con la X integrada en gris (conexión).
 */
export function KovexMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 52"
      className={cn('h-8 w-auto', className)}
      role="img"
      aria-label="Monograma KOVEX"
      fill="none"
    >
      {/* X integrada (gris) */}
      <path d="M20 26 L44 50 L34 50 L14 30 Z" fill="var(--brand-slate)" opacity="0.55" />
      {/* Barra vertical - estructura principal */}
      <rect x="2" y="2" width="11" height="48" fill="var(--brand-navy)" />
      {/* Diagonal inferior (navy) */}
      <path d="M13 26 L37 50 L23 50 L13 40 Z" fill="var(--brand-navy)" />
      {/* Diagonal superior (azul) */}
      <path d="M13 26 L37 2 L23 2 L13 12 Z" fill="var(--brand-blue)" />
    </svg>
  )
}

interface LogoProps {
  className?: string
  /** 'dark' para fondos claros (texto navy), 'light' para fondos navy (texto blanco) */
  variant?: 'dark' | 'light'
  showTagline?: boolean
}

export function Logo({ className, variant = 'dark', showTagline = true }: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-brand-navy'
  const subColor = variant === 'light' ? 'text-slate-300' : 'text-brand-slate'

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <KovexMark className="h-9" />
      <div className="flex flex-col leading-none">
        <span className={cn('text-xl font-extrabold tracking-tight', textColor)}>
          KOVE<span className="text-brand-blue">X</span>
        </span>
        <span className={cn('mt-1 text-[10px] font-semibold tracking-[0.35em]', subColor)}>
          COLOMBIA
        </span>
        {showTagline && (
          <span className={cn('mt-0.5 text-[7px] font-medium tracking-[0.25em]', subColor)}>
            DISTRIBUIDOR MAYORISTA
          </span>
        )}
      </div>
    </div>
  )
}
