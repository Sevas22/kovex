"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { LogOut, Package, Pencil, Plus, Search, Star, Store, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Logo } from "@/components/logo"
import { ProductForm } from "./product-form"
import { formatCOP, useStore } from "@/lib/store"
import type { Product } from "@/lib/types"

export function AdminDashboard() {
  const { products, categories, deleteProduct, logout } = useStore()
  const [query, setQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—"

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q),
    )
  }, [products, query])

  const stats = useMemo(
    () => ({
      total: products.length,
      featured: products.filter((p) => p.featured).length,
      lowStock: products.filter((p) => p.stock < 100).length,
    }),
    [products],
  )

  function openNew() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setDialogOpen(true)
  }

  function handleDelete(product: Product) {
    deleteProduct(product.id)
    toast.success("Producto eliminado", { description: product.name })
  }

  return (
    <div className="min-h-dvh bg-secondary">
      {/* Barra superior */}
      <header className="border-b border-sidebar-border bg-brand-navy">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Logo variant="light" className="h-7" />
            <span className="hidden text-sm font-medium text-slate-400 sm:inline">
              Panel administrativo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:bg-brand-navy-800 hover:text-white"
            >
              <Link href="/" target="_blank">
                <Store className="mr-1.5 h-4 w-4" />
                Ver tienda
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout()
                toast("Sesión cerrada")
              }}
              className="text-slate-300 hover:bg-brand-navy-800 hover:text-white"
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Métricas */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={Package} label="Productos totales" value={stats.total} />
          <StatCard icon={Star} label="Destacados" value={stats.featured} />
          <StatCard
            icon={Package}
            label="Stock bajo (< 100)"
            value={stats.lowStock}
            accent
          />
        </div>

        {/* Controles */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, SKU o marca"
              className="pl-9"
            />
          </div>
          <Button onClick={openNew} className="bg-brand-blue text-white hover:bg-brand-blue-600">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo producto
          </Button>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Categoría</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 text-right font-semibold">Precio</th>
                  <th className="px-4 py-3 text-right font-semibold">Stock</th>
                  <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-medium text-brand-navy">
                              {product.name}
                            </span>
                            {product.featured && (
                              <Star className="h-3.5 w-3.5 shrink-0 fill-brand-blue text-brand-blue" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{product.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="font-normal">
                        {categoryName(product.categoryId)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-navy">
                      {formatCOP(product.price)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          product.stock < 100 ? "font-semibold text-destructive" : ""
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          aria-label="Editar"
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          aria-label="Eliminar"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      No se encontraron productos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Actualiza la información del producto."
                : "Completa los datos para agregar un producto al catálogo."}
            </DialogDescription>
          </DialogHeader>
          <ProductForm product={editing} onDone={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Package
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${
          accent ? "bg-destructive/10 text-destructive" : "bg-accent text-brand-blue"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-brand-navy">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
