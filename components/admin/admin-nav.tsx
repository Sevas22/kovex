'use client'

import {
  BoxesIcon,
  ClipboardListIcon,
  DownloadCloudIcon,
  LayoutDashboardIcon,
  PackageIcon,
  PercentIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboardIcon, exact: true },
  { href: '/admin/pedidos', label: 'Pedidos y cotizaciones', icon: ClipboardListIcon, badge: 'orders' as const },
  { href: '/admin/clientes', label: 'Clientes', icon: UsersIcon },
  { href: '/admin/productos', label: 'Productos', icon: PackageIcon },
  { href: '/admin/inventario', label: 'Inventario', icon: BoxesIcon },
  { href: '/admin/importar', label: 'Importar productos', icon: DownloadCloudIcon },
  { href: '/admin/precios', label: 'Precios y márgenes', icon: PercentIcon },
  { href: '/admin/configuracion', label: 'Configuración', icon: SettingsIcon },
]

export function AdminNav({ openOrders, onNavigate }: { openOrders: number; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Panel administrativo" className="flex flex-col gap-0.5 px-3">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-white',
              active && 'bg-sidebar-accent text-white shadow-[inset_3px_0_0_var(--brand-cyan)]',
            )}
          >
            <item.icon className="size-4.5 shrink-0" aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            {item.badge === 'orders' && openOrders > 0 ? (
              <span className="rounded-full bg-brand-cyan px-2 text-xs font-bold text-brand-navy tabular">{openOrders}</span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
