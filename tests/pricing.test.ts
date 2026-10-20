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
  // Sin IVA, para que las pruebas de margen sigan mirando solo el margen.
  taxRate: 0,
  costIncludesTax: false,
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

describe('computePrice con IVA', () => {
  const conIva: PricingInput = { ...base, taxRate: 19 }

  it('aplica el margen sobre el valor sin IVA y suma el impuesto al final', () => {
    // 3.604 × 1,20 = 4.324,80 neto → × 1,19 = 5.146,51 → sube a 5.200
    const r = computePrice(conIva)
    assert.equal(r.price, 5200)
    assert.equal(r.netCost, 3604)
    // El neto se deduce del precio público ya redondeado.
    assert.equal(r.netPrice, 4370)
    assert.equal(r.taxAmount, 830)
    assert.equal(r.profit, 766)
  })

  it('el IVA no es ganancia: la ganancia es precio neto menos costo neto', () => {
    const r = computePrice(conIva)
    assert.equal(r.profit, r.netPrice! - r.netCost!)
    assert.ok(r.profit! < r.price! - r.netCost!, 'contar el IVA inflaría la ganancia')
  })

  it('descuenta el IVA del costo cuando el proveedor ya lo incluye', () => {
    const incluido = computePrice({ ...conIva, costIncludesTax: true })
    // 3.604 / 1,19 = 3.028,57 de base
    assert.equal(incluido.netCost, 3029)
    assert.ok(incluido.price! < computePrice(conIva).price!, 'sacar el IVA baja la base y el precio')
  })

  it('respeta la tarifa reducida del 5 %', () => {
    const reducido = computePrice({ ...base, taxRate: 5 })
    assert.ok(reducido.price! < computePrice(conIva).price!)
    assert.equal(reducido.netCost, 3604)
  })

  it('con precio fijo deduce el neto y el IVA desde el precio escrito', () => {
    const fijo = computePrice({ ...conIva, mode: 'fixed', fixedPrice: 11900 })
    assert.equal(fijo.price, 11900)
    assert.equal(fijo.netPrice, 10000)
    assert.equal(fijo.taxAmount, 1900)
  })
})
