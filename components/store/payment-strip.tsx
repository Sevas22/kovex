import Image from 'next/image'
import { PAYMENT_METHODS } from '@/lib/payment-methods'
import { cn } from '@/lib/utils'

/**
 * Cinta de medios de pago, al pie del sitio.
 *
 * Usa el logotipo cuando existe el archivo en /public/pagos y, si no, el nombre
 * en una placa: nunca queda una imagen rota mientras llegan los archivos.
 */
export function PaymentStrip({ className }: { className?: string }) {
  return (
    <section className={cn('border-t bg-muted/40', className)} aria-labelledby="medios-de-pago">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8">
        <h2
          id="medios-de-pago"
          className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
        >
          Medios de pago que aceptamos
        </h2>

        <ul className="flex flex-wrap items-center justify-center gap-2.5">
          {PAYMENT_METHODS.map((m) => (
            <li
              key={m.slug}
              className={cn(
                'flex h-11 items-center justify-center rounded-sm border bg-white px-4',
                m.logo ? 'w-20' : null,
              )}
            >
              {m.logo ? (
                <Image
                  src={m.logo}
                  alt={m.name}
                  width={64}
                  height={28}
                  className="h-6 w-auto object-contain"
                />
              ) : (
                <span className="text-xs font-semibold whitespace-nowrap text-brand-navy">{m.name}</span>
              )}
            </li>
          ))}
        </ul>

        <p className="max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
          El pago se acuerda con tu asesor al confirmar el pedido. El sitio no cobra en línea.
        </p>
      </div>
    </section>
  )
}
