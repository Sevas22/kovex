'use client'

import { SearchIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')

  return (
    <form
      role="search"
      className={cn('w-full', className)}
      onSubmit={(e) => {
        e.preventDefault()
        const q = query.trim()
        router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo')
      }}
    >
      <InputGroup className="h-11 max-w-2xl bg-brand-mist">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos o marcas"
          aria-label="Buscar productos"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="submit" variant="default" size="sm" className="chamfer chamfer-sm px-4">
            Buscar
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
