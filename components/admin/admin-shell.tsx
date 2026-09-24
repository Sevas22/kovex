'use client'

import { ExternalLinkIcon, LogOutIcon, MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { AdminNav } from './admin-nav'
import { logoutAction } from '@/app/admin/actions'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

interface AdminShellProps {
  admin: { name: string; email: string }
  openOrders: number
  children: React.ReactNode
}

function SidebarBody({ admin, openOrders, onNavigate }: Omit<AdminShellProps, 'children'> & { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-6 pt-6 pb-8">
        <Link href="/admin" onClick={onNavigate} aria-label="Panel KOVEX">
          <Logo variant="negative" className="h-11" />
        </Link>
      </div>
      <AdminNav openOrders={openOrders} onNavigate={onNavigate} />
      <div className="mt-auto flex flex-col gap-3 border-t border-sidebar-border p-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-white"
        >
          <ExternalLinkIcon className="size-4" aria-hidden="true" />
          Ver tienda
        </Link>
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="min-w-0 text-sm">
            <p className="truncate font-semibold text-white">{admin.name}</p>
            <p className="truncate text-xs">{admin.email}</p>
          </div>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              aria-label="Cerrar sesión"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
            >
              <LogOutIcon />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export function AdminShell({ admin, openOrders, children }: AdminShellProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-dvh bg-brand-mist lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh lg:block">
        <SidebarBody admin={admin} openOrders={openOrders} />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-brand-navy px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon-lg" className="text-white hover:bg-white/10 hover:text-white" aria-label="Abrir menú" />}
          >
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-0 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Menú del panel</SheetTitle>
            <SidebarBody admin={admin} openOrders={openOrders} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <Logo variant="negative" className="h-8" />
      </header>

      <main className="min-w-0 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  )
}
