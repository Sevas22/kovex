'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SORT_OPTIONS, type SortKey } from '@/lib/catalog-params'

export function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const value = (searchParams.get('orden') as SortKey | null) ?? 'relevancia'

  return (
    <Select
      items={SORT_OPTIONS}
      value={value in SORT_OPTIONS ? value : 'relevancia'}
      onValueChange={(next) => {
        const params = new URLSearchParams(searchParams)
        if (!next || next === 'relevancia') params.delete('orden')
        else params.set('orden', String(next))
        params.delete('pagina')
        const qs = params.toString()
        router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
      }}
    >
      <SelectTrigger className="h-9 w-48" aria-label="Ordenar productos">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.entries(SORT_OPTIONS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
