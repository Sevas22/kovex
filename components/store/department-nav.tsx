'use client'

import { LayoutGridIcon } from 'lucide-react'
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
          <Link href="/#nosotros" className="flex items-center px-3 text-sm text-white/70 hover:text-white">
            Nosotros
          </Link>
          <Link href="/#como-comprar" className="flex items-center px-3 text-sm text-white/70 hover:text-white">
            Cómo comprar
          </Link>
        </div>
      </div>
    </nav>
  )
}
