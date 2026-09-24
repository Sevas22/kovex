'use server'

import { z } from 'zod'
import { createOrder, isBusinessError } from '@/lib/server/orders'
import { clientIp, consumeRateLimit } from '@/lib/server/rate-limit'
import { normalizePhone } from '@/lib/text'

const optionalText = (max: number) => z.string().trim().max(max).optional().transform((v) => v || undefined)

const checkoutSchema = z
  .object({
    kind: z.enum(['quote', 'order']),
    items: z
      .array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(9999) }))
      .min(1, 'Tu lista está vacía.')
      .max(150, 'Tu lista es muy larga; divídela en varios pedidos.'),
    customer: z.object({
      name: z.string().trim().min(2, 'Escribe tu nombre.').max(120),
      phone: z
        .string()
        .trim()
        .refine((v) => v.replace(/\D/g, '').length >= 7 && v.replace(/\D/g, '').length <= 15, {
          message: 'Escribe un número de WhatsApp válido.',
        }),
      company: optionalText(120),
      document: optionalText(30),
      email: z
        .string()
        .trim()
        .max(160)
        .optional()
        .refine((v) => !v || z.email().safeParse(v).success, { message: 'Revisa el correo.' })
        .transform((v) => v || undefined),
      city: optionalText(80),
      address: optionalText(200),
      notes: optionalText(1000),
    }),
    /** Campo trampa: los humanos no lo ven ni lo llenan. */
    website: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.kind !== 'order') return
    if (!data.customer.city) ctx.addIssue({ code: 'custom', path: ['customer', 'city'], message: 'Indica la ciudad de entrega.' })
    if (!data.customer.address) {
      ctx.addIssue({ code: 'custom', path: ['customer', 'address'], message: 'Indica la dirección de entrega.' })
    }
  })

export type CheckoutInput = z.input<typeof checkoutSchema>

export type CheckoutResult =
  | { ok: true; token: string; code: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

export async function submitCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.at(-1)
      if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, error: 'Revisa los datos marcados.', fieldErrors }
  }
  if (parsed.data.website) return { ok: false, error: 'No pudimos procesar la solicitud.' }

  // Máximo 8 envíos por hora desde la misma IP y 12 al día por número de WhatsApp.
  const ip = await clientIp()
  const phone = normalizePhone(parsed.data.customer.phone)
  const allowed =
    (await consumeRateLimit(`checkout:ip:${ip}`, 8, 3600)) && (await consumeRateLimit(`checkout:phone:${phone}`, 12, 86400))
  if (!allowed) {
    return {
      ok: false,
      error: 'Recibimos varios pedidos seguidos desde tu conexión. Espera un momento o escríbenos directamente por WhatsApp.',
    }
  }

  try {
    const order = await createOrder({
      kind: parsed.data.kind,
      items: parsed.data.items,
      customer: parsed.data.customer,
    })
    return { ok: true, token: order.publicToken, code: order.code }
  } catch (error) {
    if (isBusinessError(error)) return { ok: false, error: error.message }
    console.error('[checkout]', error)
    return { ok: false, error: 'No pudimos guardar tu pedido. Inténtalo de nuevo en un momento.' }
  }
}
