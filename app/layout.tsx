import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import { Suspense } from 'react'
import { StoreProvider } from '@/lib/store'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'KOVEX Colombia | Distribuidor Mayorista',
  description:
    'Distribuidor mayorista multicategoría. Amplio catálogo de ferretería, brochas y herramientas con precios mayoristas y envíos a toda Colombia.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#0e1b2e',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`light ${montserrat.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Suspense fallback={null}>
          <StoreProvider>{children}</StoreProvider>
        </Suspense>
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
