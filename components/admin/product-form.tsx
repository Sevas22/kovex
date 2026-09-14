"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"
import type { Product } from "@/lib/types"

interface ProductFormProps {
  product?: Product | null
  onDone: () => void
}

const EMPTY = {
  name: "",
  brand: "",
  sku: "",
  categoryId: "",
  price: "",
  unit: "Unidad",
  image: "",
  description: "",
  stock: "",
  featured: false,
}

export function ProductForm({ product, onDone }: ProductFormProps) {
  const { categories, addProduct, updateProduct } = useStore()
  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          brand: product.brand,
          sku: product.sku,
          categoryId: product.categoryId,
          price: String(product.price),
          unit: product.unit,
          image: product.image,
          description: product.description,
          stock: String(product.stock),
          featured: product.featured,
        }
      : EMPTY,
  )

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.categoryId || !form.price) {
      toast.error("Completa nombre, categoría y precio")
      return
    }

    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim() || "Genérico",
      sku: form.sku.trim() || `SKU-${Date.now()}`,
      categoryId: form.categoryId,
      price: Number(form.price) || 0,
      unit: form.unit.trim() || "Unidad",
      image: form.image.trim() || "/kovex/brocha-profesional.png",
      description: form.description.trim(),
      stock: Number(form.stock) || 0,
      featured: form.featured,
    }

    if (product) {
      updateProduct(product.id, payload)
      toast.success("Producto actualizado")
    } else {
      addProduct(payload)
      toast.success("Producto agregado")
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="pf-name">Nombre del producto *</Label>
        <Input
          id="pf-name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder='Ej. Brocha Profesional 3"'
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pf-brand">Marca</Label>
          <Input
            id="pf-brand"
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
            placeholder="Kovex Pro"
          />
        </div>
        <div>
          <Label htmlFor="pf-sku">SKU / Referencia</Label>
          <Input
            id="pf-sku"
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            placeholder="BR-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pf-category">Categoría *</Label>
          <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
            <SelectTrigger id="pf-category">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="pf-unit">Unidad de venta</Label>
          <Input
            id="pf-unit"
            value={form.unit}
            onChange={(e) => set("unit", e.target.value)}
            placeholder="Unidad / Caja / Set x5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pf-price">Precio (COP) *</Label>
          <Input
            id="pf-price"
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="4900"
          />
        </div>
        <div>
          <Label htmlFor="pf-stock">Stock</Label>
          <Input
            id="pf-stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            placeholder="480"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="pf-image">URL de la imagen</Label>
        <Input
          id="pf-image"
          value={form.image}
          onChange={(e) => set("image", e.target.value)}
          placeholder="/kovex/brocha-profesional.png"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Usa una ruta local o una URL. Si se deja vacío se usa una imagen por defecto.
        </p>
      </div>

      <div>
        <Label htmlFor="pf-desc">Descripción</Label>
        <Textarea
          id="pf-desc"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Detalles del producto, medidas, material..."
          rows={3}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="h-4 w-4 rounded border-input accent-brand-blue"
        />
        Destacar en la página principal
      </label>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-brand-blue text-white hover:bg-brand-blue-600">
          {product ? "Guardar cambios" : "Agregar producto"}
        </Button>
      </div>
    </form>
  )
}
