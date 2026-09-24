'use client'

import { SlidersHorizontalIcon } from 'lucide-react'
import { CatalogFilters } from './catalog-filters'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export function MobileFilters({ brands }: { brands: { name: string; count: number }[] }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="lg" className="lg:hidden" />}>
        <SlidersHorizontalIcon data-icon="inline-start" />
        Filtros
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-8">
          <CatalogFilters brands={brands} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
