import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { cartTotals, type CartItem } from '@/lib/cart-totals'
import type { ProductSummary } from '@/lib/types'
import {
  buildPriceTiers,
  floorPriceFor,
  nextTier,
  normalizeTiers,
  parseTiers,
  priceLine,
  tierForQuantity,
} from '@/lib/volume-pricing'

const TIERS = [
  { minQty: 12, percent: 5 },
  { minQty: 50, percent: 10 },
]

describe('escalas por cantidad', () => {
  it('ordena, limpia y deduplica lo que viene de la base', () => {
    const tiers = normalizeTiers([
      { minQty: 50, percent: 10 },
      { minQty: 12, percent: 5 },
      { minQty: 12, percent: 7 }, // duplicado: gana el primero
      { minQty: 1, percent: 5 }, // por debajo del mínimo
      { minQty: 20, percent: 0 }, // sin descuento
      { minQty: 30, percent: 95 }, // fuera de rango
      'basura',
    ])
    assert.deepEqual(tiers, [
      { minQty: 12, percent: 5 },
      { minQty: 50, percent: 10 },
    ])
  })

  it('distingue heredar (null) de no tener escala ([])', () => {
    assert.equal(parseTiers(null), null)
    assert.deepEqual(parseTiers([]), [])
  })

  it('calcula la escalera con redondeo hacia arriba', () => {
    const tiers = buildPriceTiers({ listPrice: 10000, tiers: TIERS, floorPrice: null, rounding: 100 })
    assert.deepEqual(tiers, [
      { minQty: 12, unitPrice: 9500, percent: 5 },
      { minQty: 50, unitPrice: 9000, percent: 10 },
    ])
  })

  it('nunca baja del piso de costo + margen mínimo', () => {
    const floor = floorPriceFor(9200, 0)
    const tiers = buildPriceTiers({ listPrice: 10000, tiers: TIERS, floorPrice: floor, rounding: 100 })
    // El 5 % cabe completo; el 10 % se recorta al piso y queda en 8 %, que sigue siendo mejor.
    assert.deepEqual(tiers, [
      { minQty: 12, unitPrice: 9500, percent: 5 },
      { minQty: 50, unitPrice: 9200, percent: 8 },
    ])
  })

  it('descarta el escalón que el piso deja igual o peor que el anterior', () => {
    const floor = floorPriceFor(9500, 0)
    const tiers = buildPriceTiers({ listPrice: 10000, tiers: TIERS, floorPrice: floor, rounding: 100 })
    assert.deepEqual(tiers, [{ minQty: 12, unitPrice: 9500, percent: 5 }])
  })

  it('descarta la escala entera si el piso se come el primer escalón', () => {
    const floor = floorPriceFor(10000, 10) // 11.000 > precio de venta
    assert.deepEqual(buildPriceTiers({ listPrice: 10000, tiers: TIERS, floorPrice: floor, rounding: 100 }), [])
  })

  it('elige el escalón alcanzado y anuncia el siguiente', () => {
    const tiers = buildPriceTiers({ listPrice: 10000, tiers: TIERS, floorPrice: null, rounding: 100 })
    assert.equal(tierForQuantity(tiers, 11), null)
    assert.equal(tierForQuantity(tiers, 12)?.unitPrice, 9500)
    assert.equal(tierForQuantity(tiers, 120)?.unitPrice, 9000)
    assert.equal(nextTier(tiers, 11)?.minQty, 12)
    assert.equal(nextTier(tiers, 60), null)
  })

  it('valoriza una línea con el ahorro', () => {
    const tiers = buildPriceTiers({ listPrice: 10000, tiers: TIERS, floorPrice: null, rounding: 100 })
    assert.deepEqual(priceLine({ listPrice: 10000, tiers, quantity: 12 }), {
      unitPrice: 9500,
      listUnitPrice: 10000,
      percent: 5,
      lineTotal: 114000,
      saved: 6000,
    })
  })

  it('deja en cero las líneas sin precio publicado', () => {
    const line = priceLine({ listPrice: null, tiers: [], quantity: 5 })
    assert.equal(line.unitPrice, null)
    assert.equal(line.lineTotal, 0)
  })
})

const product = (p: Partial<ProductSummary>): ProductSummary => ({
  id: 1,
  slug: 'p',
  name: 'Producto',
  brand: null,
  sku: 'SKU',
  image: null,
  unit: 'Unidad',
  price: 10000,
  compareAtPrice: null,
  priceTiers: [],
  available: null,
  lowStockThreshold: 5,
  isFeatured: false,
  ...p,
})

describe('totales del carrito con escalas', () => {
  it('descuenta por línea y reporta el ahorro', () => {
    const items: CartItem[] = [
      {
        product: product({ id: 1, priceTiers: [{ minQty: 12, unitPrice: 9500, percent: 5 }] }),
        quantity: 12,
      },
      { product: product({ id: 2, price: 5000 }), quantity: 2 },
      { product: product({ id: 3, price: null }), quantity: 1 },
    ]
    const totals = cartTotals(items)
    assert.equal(totals.listSubtotal, 130000)
    assert.equal(totals.subtotal, 124000)
    assert.equal(totals.discount, 6000)
    assert.equal(totals.unpricedCount, 1)
    assert.equal(totals.lines.get(1)?.percent, 5)
    assert.equal(totals.lines.get(2)?.percent, 0)
  })

  it('no aplica descuento por debajo del escalón', () => {
    const items: CartItem[] = [
      { product: product({ priceTiers: [{ minQty: 12, unitPrice: 9500, percent: 5 }] }), quantity: 11 },
    ]
    const totals = cartTotals(items)
    assert.equal(totals.discount, 0)
    assert.equal(totals.subtotal, 110000)
    assert.equal(totals.lines.get(1)?.next?.minQty, 12)
  })
})
