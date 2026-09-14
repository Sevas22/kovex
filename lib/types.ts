export interface Category {
  id: string
  name: string
  slug: string
}

export interface Product {
  id: string
  name: string
  brand: string
  sku: string
  categoryId: string
  price: number
  unit: string
  image: string
  description: string
  stock: number
  featured: boolean
}

export interface QuoteItem {
  productId: string
  quantity: number
}
