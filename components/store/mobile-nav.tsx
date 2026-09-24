'use client'

import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/brand/logo'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { CategoryLink } from '@/lib/types'

export function MobileNav({ departments, whatsappUrl }: { departments: CategoryLink[]; whatsappUrl: string }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon-lg" className="md:hidden" aria-label="Abrir menú" />}>
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="w-80 gap-0">
        <SheetHeader className="border-b">
          <SheetTitle className="sr-only">Menú</SheetTitle>
          <Logo className="h-9" />
        </SheetHeader>
        <nav aria-label="Departamentos" className="flex flex-col p-2">
          <Link href="/catalogo" onClick={close} className="rounded-md px-3 py-3 text-sm font-semibold hover:bg-muted">
            Todo el catálogo
          </Link>
          {departments.map((d) => (
            <Link
              key={d.slug}
              href={`/catalogo/${d.slug}`}
              onClick={close}
              className="rounded-md px-3 py-3 text-sm font-medium hover:bg-muted"
            >
              {d.name}
            </Link>
          ))}
          <Separator className="my-2" />
          {[
            ['/#nosotros', 'Nosotros'],
            ['/#como-comprar', 'Cómo comprar'],
            ['/#preguntas', 'Preguntas frecuentes'],
          ].map(([href, label]) => (
            <Link key={href} href={href} onClick={close} className="rounded-md px-3 py-3 text-sm hover:bg-muted">
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <Button variant="whatsapp" size="xl" className="w-full" nativeButton={false} render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}>
            <WhatsAppIcon data-icon="inline-start" />
            Escribir a un asesor
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
