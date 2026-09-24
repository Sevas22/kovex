import type { Metadata } from 'next'

// Panel siempre dinámico: depende de la sesión y de datos en vivo.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s · Panel KOVEX' },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children
}
