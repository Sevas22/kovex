import { formatCOP } from './format'
import type { OrderKind } from './types'

export function whatsappLink(number: string, text?: string): string {
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

export interface OrderMessageData {
  code: string
  kind: OrderKind
  items: { name: string; sku: string | null; quantity: number; unit: string; unitPrice: number | null }[]
  subtotal: number
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
    const price =
      i.unitPrice == null ? 'precio a cotizar' : `${formatCOP(i.unitPrice * i.quantity)} (${formatCOP(i.unitPrice)} c/u)`
    const unit = i.unit.toLowerCase() === 'unidad' ? '' : ` (${i.unit.toLowerCase()})`
    return `• ${i.quantity} × ${i.name}${unit}${i.sku ? ` [ref. ${i.sku}]` : ''} — ${price}`
  })

  const totals: string[] = []
  if (d.subtotal > 0) totals.push(`*Subtotal:* ${formatCOP(d.subtotal)} (IVA incluido)`)
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
