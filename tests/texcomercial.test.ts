import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { cleanTitle, normalizeSupplierProduct, priceForList } from '@/lib/server/texcomercial'

describe('cleanTitle', () => {
  it('quita los códigos internos numéricos del final', () => {
    assert.deepEqual(cleanTitle('Brocha Popular 2" Negro Cerda Mona -600154-740047'), {
      name: 'Brocha Popular 2" Negro Cerda Mona',
      reference: null,
    })
    assert.equal(cleanTitle('Brocha profesional Mona  2" Cerda Blanca Natural. 104602').name, 'Brocha profesional Mona 2" Cerda Blanca Natural')
  })

  it('separa la referencia de fábrica como dato aparte', () => {
    assert.deepEqual(cleanTitle('Televisor Samsung Smart 50" Crystal UHD 4K Negro UN50U8500HKXZL'), {
      name: 'Televisor Samsung Smart 50" Crystal UHD 4K Negro',
      reference: 'UN50U8500HKXZL',
    })
    assert.deepEqual(cleanTitle('Carretilla Duragro Antipinchazo Metálica 65 Lt Rojo -5401MET-ROJO'), {
      name: 'Carretilla Duragro Antipinchazo Metálica 65 Lt Rojo',
      reference: '5401MET-ROJO',
    })
  })

  it('no toca medidas ni modelos cortos', () => {
    assert.equal(cleanTitle('Motobomba Autocebante De 2X2 Pulg TX20').name, 'Motobomba Autocebante De 2X2 Pulg TX20')
    assert.equal(cleanTitle('Licuadora Oster Vaso de Vidrio de 1.5Lt 6 Velocidades Negro').reference, null)
  })
})

describe('normalizeSupplierProduct', () => {
  const raw = {
    id: 9086326177943,
    title: 'Brocha Popular 2" Negro Cerda Mona -600154-740047',
    handle: 'brocha-popular-2-negro-cerda-mona',
    description:
      '<div class="text-description-product"><span>"Cerdas mixtas.Ideal para vinilos." </span></div><table><tbody>' +
      '<tr><td><strong>PRESENTACIÓN:</strong></td> <td>UNIDAD</td></tr>' +
      '<tr><td><strong>MATERIAL DE TRABAJO:</strong></td> <td>VINILOS,EPOXICOS, LACAS</td></tr>' +
      '<tr><td><strong>POTENCIA:</strong></td> <td>6,5 HP</td></tr>' +
      '<tr><td><strong>PESO:</strong></td> <td>0</td></tr>' +
      '</tbody></table>',
    vendor: 'CARIBE',
    type: 'FERRETERÍA-Y-CONSTRUCCIÓN',
    tags: ['IVA-19%', 'Marca_CARIBE', 'Ferretería-y-construcción_Herramientas-manuales', 'Ferretería-y-construcción_Herramientas-manuales_Brochas'],
    price_min: 360400,
    available: true,
    images: ['//cdn.shopify.com/s/files/brocha.jpg?v=1'],
    variants: [{ sku: '245-600154-740047' }],
  }

  it('convierte la ficha de Shopify al formato de KOVEX', () => {
    const p = normalizeSupplierProduct(raw)
    assert.equal(p.name, 'Brocha Popular 2" Negro Cerda Mona')
    assert.equal(p.brand, 'Caribe')
    assert.equal(p.costPrice, 3604) // price_min viene en centavos
    assert.equal(p.unit, 'Unidad')
    assert.equal(p.taxRate, 19)
    assert.equal(p.department, 'ferreteria')
    assert.deepEqual(p.categoryPath, ['Herramientas manuales', 'Brochas'])
    assert.deepEqual(p.images, ['https://cdn.shopify.com/s/files/brocha.jpg?v=1'])
    assert.equal(p.description, 'Cerdas mixtas. Ideal para vinilos.')
  })

  it('limpia las especificaciones: sin presentación, sin ceros, sin romper decimales', () => {
    const p = normalizeSupplierProduct(raw)
    assert.deepEqual(p.specs, [
      { label: 'Material de trabajo', value: 'Vinilos, epoxicos, lacas' },
      { label: 'Potencia', value: '6,5 hp' },
    ])
  })
})

describe('lista de precios del proveedor', () => {
  // Precios reales de la brocha: la lista más barata vale 3.604 y la nuestra
  // 4.027. Tomar la barata por defecto fue el error que infló los márgenes.
  const brocha = {
    id: 1,
    title: 'Brocha Popular 2"',
    handle: 'brocha',
    description: '',
    vendor: 'CARIBE',
    type: 'FERRETERÍA-Y-CONSTRUCCIÓN',
    tags: ['IVA-19%'],
    price_min: 360400,
    available: true,
    images: [],
    variants: [
      { sku: 'X', title: 'MLP-TLP0032CO11', price: 360400 },
      { sku: 'X', title: 'MLP-TLP0014CO11', price: 402700 },
      // Entre bodegas cambia por céntimos: se toma el menor.
      { sku: 'X', title: 'MLP-TLP0014CO14', price: 402690 },
      { sku: 'X', title: 'MSIN_LISTACO11', price: 471800 },
    ],
  }

  it('toma el precio de la lista pedida, el menor entre bodegas', () => {
    assert.equal(priceForList(brocha, 'TLP0014'), 4027)
    assert.equal(priceForList(brocha, 'TLP0032'), 3604)
  })

  it('entiende MSIN_LISTA, que no lleva el prefijo MLP-', () => {
    assert.equal(priceForList(brocha, 'SIN_LISTA'), 4718)
  })

  it('devuelve null cuando el producto no publica esa lista', () => {
    assert.equal(priceForList(brocha, 'TLP0019'), null)
  })

  it('usa la lista configurada como costo', () => {
    assert.equal(normalizeSupplierProduct(brocha, 'TLP0014').costPrice, 4027)
  })

  it('sin lista configurada se comporta como antes', () => {
    assert.equal(normalizeSupplierProduct(brocha).costPrice, 3604)
  })

  it('si falta esa lista cae a price_min en vez de quedarse sin costo', () => {
    assert.equal(normalizeSupplierProduct(brocha, 'TLP0019').costPrice, 3604)
  })
})
