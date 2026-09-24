'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem } from './cart-totals'
import type { ProductSummary } from './types'

export { cartTotals, type CartItem, type CartTotals } from './cart-totals'

const STORAGE_KEY = 'kovex:cart:v1'
export const MAX_QUANTITY = 9999

interface CartContextValue {
  items: CartItem[]
  /** false hasta restaurar el carrito guardado (evita mostrar "vacío" por un instante). */
  ready: boolean
  count: number
  isOpen: boolean
  setOpen: (open: boolean) => void
  add: (product: ProductSummary, quantity?: number) => void
  setQuantity: (productId: number, quantity: number) => void
  remove: (productId: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function readSaved(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i): i is CartItem =>
        typeof i?.product?.id === 'number' && Number.isInteger(i?.quantity) && i.quantity > 0,
    )
  } catch {
    return []
  }
}

function clampQuantity(q: number) {
  return Math.max(1, Math.min(MAX_QUANTITY, Math.floor(q)))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)
  const [isOpen, setOpen] = useState(false)

  // Restaura el carrito y actualiza precio/disponibilidad desde el servidor.
  useEffect(() => {
    const saved = readSaved()
    setItems(saved)
    setReady(true)
    if (saved.length === 0) return
    const ids = saved.map((i) => i.product.id).join(',')
    fetch(`/api/cart?ids=${ids}`)
      .then((res) => (res.ok ? (res.json() as Promise<ProductSummary[]>) : null))
      .then((fresh) => {
        if (!fresh) return
        const byId = new Map(fresh.map((p) => [p.id, p]))
        setItems((prev) =>
          prev.flatMap((i) => {
            const product = byId.get(i.product.id)
            return product ? [{ product, quantity: i.quantity }] : []
          }),
        )
      })
      .catch(() => {
        // Sin conexión: se conserva la copia local; el servidor valida todo al enviar.
      })
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Almacenamiento no disponible (modo privado): el carrito vive solo en memoria.
    }
  }, [items, ready])

  // Mantiene sincronizadas varias pestañas abiertas.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readSaved())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const add = useCallback((product: ProductSummary, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (!existing) return [...prev, { product, quantity: clampQuantity(quantity) }]
      return prev.map((i) =>
        i.product.id === product.id ? { product, quantity: clampQuantity(i.quantity + quantity) } : i,
      )
    })
  }, [])

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => (i.product.id === productId ? { ...i, quantity: clampQuantity(quantity) } : i)),
    )
  }, [])

  const remove = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      isOpen,
      setOpen,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [items, ready, isOpen, add, setQuantity, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
