'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CATEGORIES, SEED_PRODUCTS } from './data'
import type { Category, Product, QuoteItem } from './types'

// Credenciales demo para el panel administrativo.
// En producción esto se reemplaza por autenticación real contra la base de datos.
const DEMO_ADMIN = { email: 'admin@kovex.com', password: 'kovex2025' }

interface StoreContextValue {
  categories: Category[]
  products: Product[]
  addProduct: (p: Omit<Product, 'id'>) => void
  updateProduct: (id: string, p: Omit<Product, 'id'>) => void
  deleteProduct: (id: string) => void
  // Cotización
  quote: QuoteItem[]
  quoteCount: number
  addToQuote: (productId: string, quantity?: number) => void
  updateQuoteQty: (productId: string, quantity: number) => void
  removeFromQuote: (productId: string) => void
  clearQuote: () => void
  // Auth admin
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS)
  const [quote, setQuote] = useState<QuoteItem[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const addProduct = useCallback((p: Omit<Product, 'id'>) => {
    setProducts((prev) => [{ ...p, id: `p${Date.now()}` }, ...prev])
  }, [])

  const updateProduct = useCallback((id: string, p: Omit<Product, 'id'>) => {
    setProducts((prev) => prev.map((prod) => (prod.id === id ? { ...p, id } : prod)))
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id))
    setQuote((prev) => prev.filter((item) => item.productId !== id))
  }, [])

  const addToQuote = useCallback((productId: string, quantity = 1) => {
    setQuote((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i,
        )
      }
      return [...prev, { productId, quantity }]
    })
  }, [])

  const updateQuoteQty = useCallback((productId: string, quantity: number) => {
    setQuote((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0),
    )
  }, [])

  const removeFromQuote = useCallback((productId: string) => {
    setQuote((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const clearQuote = useCallback(() => setQuote([]), [])

  const login = useCallback((email: string, password: string) => {
    const ok =
      email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password
    if (ok) setIsAuthenticated(true)
    return ok
  }, [])

  const logout = useCallback(() => setIsAuthenticated(false), [])

  const quoteCount = useMemo(
    () => quote.reduce((sum, i) => sum + i.quantity, 0),
    [quote],
  )

  const value = useMemo<StoreContextValue>(
    () => ({
      categories: CATEGORIES,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      quote,
      quoteCount,
      addToQuote,
      updateQuoteQty,
      removeFromQuote,
      clearQuote,
      isAuthenticated,
      login,
      logout,
    }),
    [
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      quote,
      quoteCount,
      addToQuote,
      updateQuoteQty,
      removeFromQuote,
      clearQuote,
      isAuthenticated,
      login,
      logout,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider')
  return ctx
}

export function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}
