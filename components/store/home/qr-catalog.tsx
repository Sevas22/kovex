import { DownloadIcon, PrinterIcon, QrCodeIcon, SmartphoneIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { CompanyHeading } from './company-heading'
import { Button } from '@/components/ui/button'

const USOS = [
  { icon: PrinterIcon, text: 'Imprímelo en tarjetas, facturas y volantes.' },
  { icon: SmartphoneIcon, text: 'Pégalo en la vitrina, el mostrador o el camión.' },
  { icon: QrCodeIcon, text: 'Compártelo por WhatsApp o en redes como imagen.' },
]

/**
 * El QR del catálogo, para llevarlo al mundo físico.
 *
 * La imagen es un SVG estático generado con `pnpm qr`: no carga librería ni
 * depende de un servicio externo, y se puede descargar para imprimir a
 * cualquier tamaño sin que pierda definición.
 */
export function QrCatalog({ site }: { site: string }) {
  const visible = site.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <section className="relative overflow-hidden bg-brand-navy text-white">
      <div aria-hidden="true" className="diag-lines pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-[auto_1fr] lg:gap-16">
        {/* El QR va sobre blanco y con aire alrededor: así lo lee cualquier cámara */}
        <div className="chamfer chamfer-lg mx-auto w-56 bg-white p-5 sm:w-64 lg:mx-0">
          <Image
            src="/brand/qr-catalogo.svg"
            alt="Código QR que abre el catálogo de KOVEX Colombia"
            width={256}
            height={256}
            className="h-auto w-full"
          />
          <p className="mt-3 text-center font-display text-[0.6rem] tracking-[0.15em] text-brand-navy uppercase">
            {visible}
          </p>
        </div>

        <div className="reveal-children flex flex-col items-start gap-5">
          <p className="flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.25em] text-brand-cyan uppercase">
            <span aria-hidden="true" className="inline-block size-1.5 rotate-45 bg-brand-cyan" />
            El catálogo en el celular
          </p>

          <CompanyHeading tone="light">Escanea y mira todo el catálogo</CompanyHeading>

          <p className="max-w-xl leading-relaxed text-white/70 md:text-lg">
            Tu cliente apunta la cámara y entra directo al catálogo completo, con precios y disponibilidad. Sin
            escribir direcciones, sin instalar nada y sin crear cuenta.
          </p>

          <ul className="flex flex-col gap-3">
            {USOS.map((u) => (
              <li key={u.text} className="flex items-center gap-3 text-white/70">
                <span className="chamfer chamfer-sm flex size-9 shrink-0 items-center justify-center bg-white/[0.08]">
                  <u.icon className="size-4 text-brand-cyan" strokeWidth={1.8} aria-hidden="true" />
                </span>
                {u.text}
              </li>
            ))}
          </ul>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:bg-white/10"
              nativeButton={false}
              render={<a href="/brand/qr-catalogo.svg" download="kovex-qr-catalogo.svg" />}
            >
              <DownloadIcon data-icon="inline-start" />
              Descargar para imprimir
            </Button>
            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10" nativeButton={false} render={<Link href="/catalogo" />}>
              Ver el catálogo aquí
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
