/**
 * Flujo completo de inventario contra una base real (con las migraciones aplicadas).
 * Solo corre si defines TEST_DATABASE_URL. Crea sus propios productos y los borra al final:
 * no toca el resto de los datos.
 */
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

const url = process.env.TEST_DATABASE_URL

describe('inventario (integración)', { skip: !url && 'define TEST_DATABASE_URL para correrla' }, () => {
  let mod: {
    db: typeof import('@/lib/server/db').db
    createOrder: typeof import('@/lib/server/orders').createOrder
    confirmOrder: typeof import('@/lib/server/orders').confirmOrder
    cancelOrder: typeof import('@/lib/server/orders').cancelOrder
    convertQuoteToOrder: typeof import('@/lib/server/orders').convertQuoteToOrder
    quoteOrder: typeof import('@/lib/server/orders').quoteOrder
  }
  const tag = `test-${Date.now()}`
  const productIds: number[] = []
  const orderIds: number[] = []
  const phone = `57${String(Date.now()).slice(-10)}`
  const customer = { name: 'Prueba Automática', phone }

  async function product(stock: number, price: number | null = 1000) {
    const [row] = await mod.db()<{ id: number }[]>`
      insert into public.products (slug, sku, name, pricing_mode, fixed_price, price, stock)
      values (${`${tag}-${productIds.length}`}, ${`${tag}-${productIds.length}`}, 'Producto de prueba',
              ${price == null ? 'quote' : 'fixed'}, ${price}, ${price}, ${stock})
      returning id
    `
    productIds.push(row.id)
    return row.id
  }

  const stockOf = async (id: number) =>
    (await mod.db()<{ stock: number; reserved: number }[]>`select stock, reserved from public.products where id = ${id}`)[0]

  before(async () => {
    process.env.DATABASE_URL = url
    const [dbm, orders] = await Promise.all([import('@/lib/server/db'), import('@/lib/server/orders')])
    mod = { db: dbm.db, ...orders }
  })

  after(async () => {
    if (!mod) return
    const sql = mod.db()
    await sql`delete from public.orders where customer_phone = ${phone}`
    await sql`delete from public.customers where phone = ${phone}`
    await sql`delete from public.products where id = any(${productIds})`
    await sql.end()
  })

  it('un pedido reserva, confirmar descuenta y cancelar devuelve', async () => {
    const id = await product(5)
    const order = await mod.createOrder({ kind: 'order', customer, items: [{ productId: id, quantity: 3 }] })
    orderIds.push(order.id)
    assert.deepEqual(await stockOf(id), { stock: 5, reserved: 3 })

    await mod.confirmOrder(order.id, 'test')
    assert.deepEqual(await stockOf(id), { stock: 2, reserved: 0 })

    await mod.cancelOrder(order.id, 'prueba', 'test')
    assert.deepEqual(await stockOf(id), { stock: 5, reserved: 0 })
  })

  it('cancelar antes de confirmar libera la reserva', async () => {
    const id = await product(4)
    const order = await mod.createOrder({ kind: 'order', customer, items: [{ productId: id, quantity: 4 }] })
    assert.deepEqual(await stockOf(id), { stock: 4, reserved: 4 })
    await mod.cancelOrder(order.id, null, 'test')
    assert.deepEqual(await stockOf(id), { stock: 4, reserved: 0 })
  })

  it('no permite pedir más de lo disponible (contando lo reservado)', async () => {
    const id = await product(5)
    await mod.createOrder({ kind: 'order', customer, items: [{ productId: id, quantity: 3 }] })
    await assert.rejects(
      mod.createOrder({ kind: 'order', customer, items: [{ productId: id, quantity: 3 }] }),
      /solo quedan 2 disponibles/,
    )
    assert.deepEqual(await stockOf(id), { stock: 5, reserved: 3 })
  })

  it('pedidos simultáneos nunca venden de más', async () => {
    const id = await product(5)
    const attempts = await Promise.allSettled(
      Array.from({ length: 12 }, () => mod.createOrder({ kind: 'order', customer, items: [{ productId: id, quantity: 1 }] })),
    )
    assert.equal(attempts.filter((a) => a.status === 'fulfilled').length, 5)
    assert.deepEqual(await stockOf(id), { stock: 5, reserved: 5 })
  })

  it('una cotización no toca el inventario hasta convertirse en pedido', async () => {
    const id = await product(10, null)
    const quote = await mod.createOrder({ kind: 'quote', customer, items: [{ productId: id, quantity: 2 }] })
    assert.deepEqual(await stockOf(id), { stock: 10, reserved: 0 })

    await assert.rejects(mod.convertQuoteToOrder(quote.id, 'test'), /Asigna precio/)
    const [item] = await mod.db()<{ id: number }[]>`select id from public.order_items where order_id = ${quote.id}`
    await mod.quoteOrder(quote.id, [{ itemId: item.id, unitPrice: 5000 }], 'test')
    await mod.convertQuoteToOrder(quote.id, 'test')
    assert.deepEqual(await stockOf(id), { stock: 10, reserved: 2 })
  })

  it('un producto sin precio no se puede pedir directamente', async () => {
    const id = await product(3, null)
    await assert.rejects(
      mod.createOrder({ kind: 'order', customer, items: [{ productId: id, quantity: 1 }] }),
      /no tiene precio publicado/,
    )
  })
})
