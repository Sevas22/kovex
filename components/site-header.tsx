'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Menu, Phone, Search, Truck } from 'lucide-react'
import { Logo } from '@/components/logo'
import { QuoteDrawer } from '@/components/quote-drawer'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useStore } from '@/lib/store'
import { WHATSAPP_NUMBER } from '@/lib/data'

export function SiteHeader() {
  const { categories } = useStore()
  const router = useRouter()
  const params = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo')
  }

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Barra superior */}
      <div className="hidden bg-brand-navy-800 text-slate-300 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-brand-cyan" />
            Envíos a toda Colombia
          </span>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white"
          >
            <Phone className="h-3.5 w-3.5 text-brand-cyan" />
            Atención mayorista: +57 301 123 4567
          </a>
        </div>
      </div>

      {/* Barra principal */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link href="/" aria-label="Inicio KOVEX">
            <Logo showTagline={false} />
          </Link>

          <form onSubmit={submitSearch} className="relative ml-auto hidden flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos, marcas o SKU..."
              className="h-11 pl-10"
              aria-label="Buscar productos"
            />
          </form>

          <div className="ml-auto md:ml-0">
            <div className="rounded-md bg-brand-navy px-1">
              <QuoteDrawer />
            </div>
          </div>
        </div>

        {/* Buscador móvil */}
        <form onSubmit={submitSearch} className="relative px-4 pb-3 md:hidden">
          <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="h-10 pl-10"
            aria-label="Buscar productos"
          />
        </form>
      </div>

      {/* Barra de categorías */}
      <nav className="bg-brand-navy text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
          <Sheet>
            <SheetTrigger className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 md:hidden">
              <Menu className="h-4 w-4" />
              Categorías
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Categorías</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col px-2">
                <Link
                  href="/catalogo"
                  className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  Todos los productos
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/catalogo?cat=${c.slug}`}
                    className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    {c.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            href="/catalogo"
            className="hidden items-center gap-2 border-r border-white/10 px-4 py-3 text-sm font-semibold md:flex"
          >
            <Menu className="h-4 w-4 text-brand-cyan" />
            Todas las categorías
          </Link>
          <div className="hidden items-center gap-0 md:flex">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/catalogo?cat=${c.slug}`}
                className="px-3 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <Link
            href="/admin"
            className="ml-auto px-3 py-3 text-xs font-medium text-slate-400 hover:text-white"
          >
            Panel admin
          </Link>
        </div>
      </nav>
    </header>
  )
}
