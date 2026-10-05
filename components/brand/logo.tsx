import Image from 'next/image'
import { cn } from '@/lib/utils'

// Recortes del manual de marca (versión horizontal, negativa y monograma).
const LOGOS = {
  horizontal: { src: '/brand/logo-horizontal.webp', width: 620, height: 158 },
  negative: { src: '/brand/logo-negativo.webp', width: 620, height: 186 },
  mark: { src: '/brand/monograma.webp', width: 391, height: 448 },
  markNegative: { src: '/brand/monograma-negativo.webp', width: 191, height: 239 },
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
