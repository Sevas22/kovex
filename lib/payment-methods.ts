/**
 * Medios de pago que acepta KOVEX.
 *
 * Igual que los logotipos de marca: el archivo vive en /public/pagos con el
 * nombre <slug>.svg (o .png/.webp) y, mientras no exista, la tienda muestra el
 * nombre en una placa. Así nunca queda una imagen rota ni un hueco.
 *
 * Esto NO es una pasarela: el sitio no cobra en línea. La cinta dice qué medios
 * acepta el asesor al cerrar la compra, por eso el título es «Medios de pago
 * que aceptamos» y no «Paga con».
 */

export interface PaymentMethod {
  slug: string
  /** Nombre visible y texto alternativo de la imagen. */
  name: string
  /** Archivo en /public/pagos; null mientras no lo tengamos. */
  logo: string | null
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { slug: 'visa', name: 'Visa', logo: '/pagos/visa.webp' },
  { slug: 'mastercard', name: 'Mastercard', logo: '/pagos/mastercard.webp' },
  { slug: 'amex', name: 'American Express', logo: '/pagos/amex.webp' },
  { slug: 'pse', name: 'PSE', logo: null },
  { slug: 'nequi', name: 'Nequi', logo: '/pagos/nequi.webp' },
  { slug: 'addi', name: 'Addi', logo: null },
  { slug: 'bancolombia', name: 'Bancolombia', logo: '/pagos/bancolombia.webp' },
  { slug: 'efectivo', name: 'Contra entrega', logo: null },
]
