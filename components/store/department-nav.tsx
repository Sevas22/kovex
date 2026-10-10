'use client'

import { LayoutGridIcon, LockIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CategoryLink } from '@/lib/types'
import { cn } from '@/lib/utils'

export function DepartmentNav({ departments }: { departments: CategoryLink[] }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Departamentos" className="hidden bg-brand-navy text-white md:block">
      <div className="mx-auto flex h-12 max-w-7xl items-stretch px-4">
        <Link
          href="/catalogo"
          aria-current={pathname === '/catalogo' ? 'page' : undefined}
          className="chamfer flex items-center gap-2 bg-brand-blue pr-7 pl-4 text-sm font-semibold transition-colors hover:bg-brand-blue-600"
        >
          <LayoutGridIcon className="size-4" aria-hidden="true" />
          Todo el catálogo
        </Link>
        <ul className="flex items-stretch overflow-x-auto">
          {departments.map((d) => {
            const href = `/catalogo/${d.slug}`
            const active = pathname === href
            return (
              <li key={d.slug} className="flex">
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center border-b-2 border-transparent px-4 text-sm font-medium text-white/80 transition-colors hover:text-white',
                    active && 'border-brand-cyan text-white',
                  )}
                >
                  {d.name}
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="ml-auto hidden items-stretch lg:flex">
          <Link href="/#nosotros" className="flex items-center px-3 text-sm whitespace-nowrap text-white/70 hover:text-white">
            Nosotros
          </Link>
          <Link href="/#como-comprar" className="flex items-center px-3 text-sm whitespace-nowrap text-white/70 hover:text-white">
            Cómo comprar
          </Link>
          <Link href="/blog" className="flex items-center px-3 text-sm whitespace-nowrap text-white/70 hover:text-white">
            Blog
          </Link>
          {/* Atajo al panel para el equipo de KOVEX. Discreto a propósito: la
              contraseña es la que protege, pero no hace falta anunciar la puerta.
              /admin ya está excluido en robots.txt. */}
          <Link
            href="/admin"
            title="Panel administrativo"
            aria-label="Panel administrativo"
            className="flex items-center border-l border-white/10 pr-1 pl-3 text-white/40 transition-colors hover:text-brand-cyan"
          >
            <LockIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </nav>
  )
}
