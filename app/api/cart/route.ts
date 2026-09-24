import { NextResponse, type NextRequest } from 'next/server'
import { lookupProducts } from '@/lib/server/catalog'

/** Precio y disponibilidad actuales de los productos del carrito: GET /api/cart?ids=1,2,3 */
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get('ids') ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 200)

  const products = await lookupProducts(ids)
  return NextResponse.json(products, { headers: { 'cache-control': 'no-store' } })
}
