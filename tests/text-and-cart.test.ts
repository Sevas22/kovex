import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { cartTotals, type CartItem } from '@/lib/cart-totals'
import { formatPhone, normalizePhone, normalizeText, slugify, titleCase } from '@/lib/text'
import type { ProductSummary } from '@/lib/types'
import { buildOrderMessage } from '@/lib/whatsapp'

describe('texto', () => {
  it('normaliza para búsqueda sin tildes ni signos', () => {
    assert.equal(normalizeText('Pintura  Corona® 1 GALÓN'), 'pintura corona 1 galon')
    assert.equal(normalizeText('Ferretería'), 'ferreteria')
  })

  it('genera slugs de URL', () => {
    assert.equal(slugify('Brocha Popular 2" Negro Cerda Mona'), 'brocha-popular-2-negro-cerda-mona')
    assert.equal(slugify('Muebles, sillas y organizadores'), 'muebles-sillas-y-organizadores')
  })

  it('pone en formato título las marcas del proveedor', () => {
    assert.equal(titleCase('COMPAÑIA DE EMPAQUES'), 'Compañia de Empaques')
    assert.equal(titleCase('3M'), '3M')
  })

  it('normaliza celulares colombianos al formato de WhatsApp', () => {
    assert.equal(normalizePhone('300 123 4567'), '573001234567')
    assert.equal(normalizePhone('+57 (310) 555-1234'), '573105551234')
    assert.equal(formatPhone('573001234567'), '+57 300 123 4567')
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
  price: 1000,
  compareAtPrice: null,
  available: 10,
  lowStockThreshold: 5,
  isFeatured: false,
  ...p,
})

describe('carrito', () => {
  it('suma lo que tiene precio, cuenta lo que se cotiza y detecta faltantes', () => {
    const items: CartItem[] = [
      { product: product({ id: 1, price: 5100 }), quantity: 4 },
      { product: product({ id: 2, name: 'Nevera', price: null }), quantity: 2 },
      { product: product({ id: 3, name: 'Motor', price: 950900, available: 2 }), quantity: 3 },
      { product: product({ id: 4, price: 100, available: null }), quantity: 999 },
    ]
    const totals = cartTotals(items)
    assert.equal(totals.subtotal, 5100 * 4 + 950900 * 3 + 100 * 999)
    assert.equal(totals.unpricedCount, 1)
    assert.deepEqual(totals.shortages, [{ name: 'Motor', available: 2, quantity: 3 }])
  })
})

describe('mensaje de WhatsApp', () => {
  it('incluye código, líneas, subtotal, datos del cliente y enlace', () => {
    const msg = buildOrderMessage({
      code: 'KVX-1001',
      kind: 'order',
      items: [
        { name: 'Brocha', sku: 'B-1', quantity: 4, unit: 'Unidad', unitPrice: 5100 },
        { name: 'Pintura', sku: null, quantity: 1, unit: 'Galón', unitPrice: null },
      ],
      subtotal: 20400,
      hasUnpricedItems: true,
      customer: { name: 'Carlos', phone: '+57 310 555 1234', city: 'Bogotá' },
      url: 'https://kovex.co/pedido/abc',
    })
    assert.match(msg, /\*Pedido KVX-1001\*/)
    assert.match(msg, /• 4 × Brocha \[ref\. B-1\] — \$\s?20\.400/)
    assert.match(msg, /• 1 × Pintura \(galón\) — precio a cotizar/)
    assert.match(msg, /Hay productos por cotizar/)
    assert.match(msg, /Ciudad: Bogotá/)
    assert.match(msg, /Detalle: https:\/\/kovex\.co\/pedido\/abc/)
  })
})
