import Link from 'next/link'
import { Suspense } from 'react'
import { CartButton } from './cart-button'
import { DepartmentNav } from './department-nav'
import { HeaderSearch } from './header-search'
import { MobileNav } from './mobile-nav'
import { Logo } from '@/components/brand/logo'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { formatPhone } from '@/lib/text'
import type { CategoryLink, PublicStoreInfo } from '@/lib/types'
import { whatsappLink } from '@/lib/whatsapp'

export function SiteHeader({ departments, store }: { departments: CategoryLink[]; store: PublicStoreInfo }) {
  const whatsappUrl = whatsappLink(store.whatsappNumber, 'Hola KOVEX, quiero información sobre sus productos.')

  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 md:h-20 md:gap-6">
          <MobileNav departments={departments} whatsappUrl={whatsappUrl} />
          <Link href="/" aria-label="KOVEX Colombia, ir al inicio" className="shrink-0">
            <Logo priority className="h-9 md:h-12" />
          </Link>
          <Suspense>
            <HeaderSearch className="hidden md:block" />
          </Suspense>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 items-center gap-2.5 rounded-md px-2 py-1 hover:bg-muted lg:flex"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-whatsapp text-white">
              <WhatsAppIcon className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-xs text-muted-foreground">Asesor mayorista</span>
              <span className="text-sm font-semibold tabular">{formatPhone(store.whatsappNumber)}</span>
            </span>
          </a>
          <CartButton className="ml-auto md:ml-0" />
        </div>
        <div className="px-4 pb-3 md:hidden">
          <Suspense>
            <HeaderSearch />
          </Suspense>
        </div>
      </div>
      <DepartmentNav departments={departments} />
    </header>
  )
}
