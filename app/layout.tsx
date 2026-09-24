import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Michroma, Montserrat } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

// Aproximación web a "KOVEX Display" (tipografía propia del logotipo): ancha y geométrica.
const michroma = Michroma({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-michroma',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'KOVEX Colombia · Distribuidor mayorista',
    template: '%s · KOVEX Colombia',
  },
  description:
    'Distribuidor mayorista multicategoría: ferretería, agro, hogar, maquinaria, tecnología y electro. Cotiza y compra por WhatsApp con envíos a toda Colombia.',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'KOVEX Colombia',
    images: ['/brand/fachada.jpg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#071629',
  colorScheme: 'light',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={`${montserrat.variable} ${michroma.variable}`}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster position="top-center" richColors theme="light" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
