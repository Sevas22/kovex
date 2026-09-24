import Image from 'next/image'
import { cn } from '@/lib/utils'

// Recortes del manual de marca (versión horizontal, negativa y monograma).
const LOGOS = {
  horizontal: { src: '/brand/logo-horizontal.png', width: 1019, height: 260 },
  negative: { src: '/brand/logo-negativo.png', width: 799, height: 239 },
  mark: { src: '/brand/monograma.png', width: 391, height: 448 },
  markNegative: { src: '/brand/monograma-negativo.png', width: 191, height: 239 },
} as const

interface LogoProps {
  /** horizontal: fondos claros · negative: fondos azul profundo · mark / markNegative: monograma. */
  variant?: keyof typeof LOGOS
  className?: string
  priority?: boolean
}

export function Logo({ variant = 'horizontal', className, priority }: LogoProps) {
  const logo = LOGOS[variant]
  return (
    <Image
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt="KOVEX Colombia · Distribuidor mayorista"
      priority={priority}
      unoptimized
      className={cn('h-10 w-auto', className)}
    />
  )
}
