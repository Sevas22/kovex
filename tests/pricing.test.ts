import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { computePrice, type PricingInput } from '@/lib/pricing'

const base: PricingInput = {
  mode: 'markup',
  costPrice: 3604,
  fixedPrice: null,
  productMarkup: null,
  categoryMarkup: null,
  defaultMarkup: 20,
  rounding: 100,
}

describe('computePrice', () => {
  it('suma el margen y redondea hacia arriba al múltiplo configurado', () => {
    // 3604 × 1,40 = 5045,6 → 5100
    assert.equal(computePrice({ ...base, productMarkup: 40 }).price, 5100)
  })

  it('prioriza producto > categoría > general', () => {
    assert.deepEqual(
      [
        computePrice({ ...base, productMarkup: 40, categoryMarkup: 35 }).markupSource,
        computePrice({ ...base, categoryMarkup: 35 }).markupSource,
        computePrice(base).markupSource,
      ],
      ['product', 'category', 'default'],
    )
    assert.equal(computePrice({ ...base, categoryMarkup: 35 }).price, 4900) // 4865,4 → 4900
    assert.equal(computePrice(base).price, 4400) // 4324,8 → 4400
  })

  it('no sufre errores de coma flotante (1000 × 1,1 no debe subir a 1200)', () => {
    assert.equal(computePrice({ ...base, costPrice: 1000, defaultMarkup: 10 }).price, 1100)
    assert.equal(computePrice({ ...base, costPrice: 1000, defaultMarkup: 10, rounding: 1 }).price, 1100)
  })

  it('un margen de 0 % respeta el costo y solo redondea', () => {
    assert.equal(computePrice({ ...base, defaultMarkup: 0 }).price, 3700)
    assert.equal(computePrice({ ...base, defaultMarkup: 0, rounding: 1 }).price, 3604)
  })

  it('acepta márgenes con decimales', () => {
    // 2707 × 1,125 = 3045,375 → 3046 sin redondeo
    assert.equal(computePrice({ ...base, costPrice: 2707, productMarkup: 12.5, rounding: 1 }).price, 3046)
  })

  it('precio fijo y a cotizar', () => {
    assert.equal(computePrice({ ...base, mode: 'fixed', fixedPrice: 229900 }).price, 229900)
    assert.equal(computePrice({ ...base, mode: 'fixed' }).missing, 'no-fixed')
    const quote = computePrice({ ...base, mode: 'quote' })
    assert.equal(quote.price, null)
    assert.equal(quote.missing, 'quote')
  })

  it('sin costo no hay precio con margen', () => {
    const r = computePrice({ ...base, costPrice: null })
    assert.equal(r.price, null)
    assert.equal(r.missing, 'no-cost')
  })
})
