import { formatCOP } from './format'
import type { OrderKind } from './types'

export function whatsappLink(number: string, text?: string): string {
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

export interface OrderMessageData {
  code: string
  kind: OrderKind
  items: {
    name: string
    sku: string | null
    quantity: number
    unit: string
    unitPrice: number | null
    /** Precio por unidad antes de la escala por cantidad. */
    listUnitPrice?: number | null
    /** Descuento por volumen aplicado a la línea. */
    discountPercent?: number
  }[]
  subtotal: number
  /** Ahorro total por escalas de cantidad. */
  discountTotal?: number
  hasUnpricedItems: boolean
  customer: {
    name: string
    company?: string | null
    document?: string | null
    phone: string
    email?: string | null
    city?: string | null
    address?: string | null
    notes?: string | null
  }
  url?: string
}

/** Mensaje que el cliente envía a KOVEX al terminar su pedido o cotización. */
export function buildOrderMessage(d: OrderMessageData): string {
  const title = d.kind === 'order' ? `*Pedido ${d.code}*` : `*Solicitud de cotización ${d.code}*`
  const lines = d.items.map((i) => {
    const discount = i.discountPercent ?? 0
    const unitPrice =
      i.unitPrice == null
        ? 'precio a cotizar'
        : `${formatCOP(i.unitPrice * i.quantity)} (${formatCOP(i.unitPrice)} c/u${discount > 0 ? `, −${discount}% por volumen` : ''})`
    const unit = i.unit.toLowerCase() === 'unidad' ? '' : ` (${i.unit.toLowerCase()})`
    return `• ${i.quantity} × ${i.name}${unit}${i.sku ? ` [ref. ${i.sku}]` : ''} — ${unitPrice}`
  })

  const totals: string[] = []
  const discountTotal = d.discountTotal ?? 0
  if (discountTotal > 0) {
    totals.push(`Precio de lista: ${formatCOP(d.subtotal + discountTotal)}`)
    totals.push(`Descuento por volumen: −${formatCOP(discountTotal)}`)
  }
  if (d.subtotal > 0) {
    totals.push(`*${discountTotal > 0 ? 'Total estimado' : 'Subtotal'}:* ${formatCOP(d.subtotal)} (IVA incluido)`)
  }
  if (d.hasUnpricedItems) totals.push('Hay productos por cotizar: espero su precio.')

  const c = d.customer
  const customer = [
    `Nombre: ${c.name}`,
    c.company && `Empresa: ${c.company}`,
    c.document && `NIT/CC: ${c.document}`,
    `Teléfono: ${c.phone}`,
    c.email && `Correo: ${c.email}`,
    c.city && `Ciudad: ${c.city}`,
    c.address && `Dirección: ${c.address}`,
    c.notes && `Notas: ${c.notes}`,
  ].filter(Boolean)

  return [
    'Hola KOVEX 👋',
    title,
    '',
    ...lines,
    '',
    ...totals,
    '',
    '*Mis datos*',
    ...customer,
    ...(d.url ? ['', `Detalle: ${d.url}`] : []),
  ].join('\n')
}

/** Mensaje inicial del asesor hacia el cliente desde el panel. */
export function buildCustomerReply(d: { name: string; code: string; kind: OrderKind; body?: string }): string {
  const firstName = d.name.split(' ')[0]
  const subject = d.kind === 'order' ? `tu pedido ${d.code}` : `tu solicitud de cotización ${d.code}`
  return [`Hola ${firstName}, te escribimos de KOVEX Colombia sobre ${subject}.`, d.body].filter(Boolean).join('\n\n')
}
