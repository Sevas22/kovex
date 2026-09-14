'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useStore } from '@/lib/store'

type SortKey = 'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre'

function FilterControls({
  categories,
  brands,
  selectedCats,
  selectedBrands,
  toggleCat,
  toggleBrand,
  onClear,
}: {
  categories: { id: string; name: string }[]
  brands: string[]
  selectedCats: string[]
  selectedBrands: string[]
  toggleCat: (id: string) => void
  toggleBrand: (b: string) => void
  onClear: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-navy">
          Categorías
        </h3>
        <div className="flex flex-col gap-2">
          {categories.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCats.includes(c.id)}
                onChange={() => toggleCat(c.id)}
                className="h-4 w-4 accent-brand-blue"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-navy">
          Marcas
        </h3>
        <div className="flex flex-col gap-2">
          {brands.map((b) => (
            <label key={b} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b)}
                onChange={() => toggleBrand(b)}
                className="h-4 w-4 accent-brand-blue"
              />
              {b}
            </label>
          ))}
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onClear} className="gap-1">
        <X className="h-3.5 w-3.5" />
        Limpiar filtros
      </Button>
    </div>
  )
}

export function CatalogView() {
  const { products, categories } = useStore()
  const params = useSearchParams()
  const initialCat = params.get('cat')
  const initialQuery = params.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [selectedCats, setSelectedCats] = useState<string[]>(
    initialCat ? [initialCat] : [],
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [sort, setSort] = useState<SortKey>('relevancia')

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  )

  const toggleCat = (id: string) =>
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
  const toggleBrand = (b: string) =>
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    )
  const clearFilters = () => {
    setSelectedCats([])
    setSelectedBrands([])
    setQuery('')
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = products.filter((p) => {
      if (selectedCats.length && !selectedCats.includes(p.categoryId)) return false
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false
      if (q) {
        const haystack = `${p.name} ${p.brand} ${p.sku}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    switch (sort) {
      case 'precio-asc':
        return [...result].sort((a, b) => a.price - b.price)
      case 'precio-desc':
        return [...result].sort((a, b) => b.price - a.price)
      case 'nombre':
        return [...result].sort((a, b) => a.name.localeCompare(b.name))
      default:
        return result
    }
  }, [products, selectedCats, selectedBrands, query, sort])

  const activeCatName = categories.find((c) => selectedCats[0] === c.id)?.name

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Catálogo
        </p>
        <h1 className="text-2xl font-extrabold text-brand-navy md:text-3xl">
          {selectedCats.length === 1 && activeCatName
            ? activeCatName
            : query
              ? `Resultados para "${query}"`
              : 'Todos los productos'}
        </h1>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filtros - desktop */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <FilterControls
            categories={categories}
            brands={brands}
            selectedCats={selectedCats}
            selectedBrands={selectedBrands}
            toggleCat={toggleCat}
            toggleBrand={toggleBrand}
            onClear={clearFilters}
          />
        </aside>

        <div className="min-w-0 flex-1">
          {/* Barra de herramientas */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en el catálogo..."
                className="pl-10"
                aria-label="Buscar en el catálogo"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Filtros móvil */}
              <Sheet>
                <SheetTrigger className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-8">
                    <FilterControls
                      categories={categories}
                      brands={brands}
                      selectedCats={selectedCats}
                      selectedBrands={selectedBrands}
                      toggleCat={toggleCat}
                      toggleBrand={toggleBrand}
                      onClear={clearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <Label htmlFor="sort" className="hidden text-sm text-muted-foreground sm:block">
                  Ordenar
                </Label>
                <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                  <SelectTrigger id="sort" className="w-[170px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevancia">Relevancia</SelectItem>
                    <SelectItem value="precio-asc">Menor precio</SelectItem>
                    <SelectItem value="precio-desc">Mayor precio</SelectItem>
                    <SelectItem value="nombre">Nombre A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">
            {filtered.length} producto{filtered.length !== 1 && 's'}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-20 text-center">
              <p className="text-sm text-muted-foreground">
                No encontramos productos con esos filtros.
              </p>
              <Button variant="link" onClick={clearFilters} className="text-brand-blue">
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
