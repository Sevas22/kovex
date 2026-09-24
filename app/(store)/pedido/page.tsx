import type { Metadata } from 'next'
import { CheckoutView } from '@/components/store/checkout/checkout-view'

export const metadata: Metadata = {
  title: 'Mi pedido',
  description: 'Revisa tu pedido y envíalo por WhatsApp a un asesor de KOVEX Colombia.',
  robots: { index: false },
}

export default function PedidoPage() {
  return <CheckoutView />
}
