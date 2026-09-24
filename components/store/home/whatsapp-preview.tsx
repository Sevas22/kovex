import { CheckCheckIcon } from 'lucide-react'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'

const CHAT = [
  { from: 'cliente', text: 'Hola KOVEX, necesito 20 brochas de 2" y 10 galones de pintura blanca.' },
  { from: 'kovex', text: 'Hola. Tenemos disponibilidad: te paso precio por volumen y tiempo de entrega.' },
  { from: 'cliente', text: 'Perfecto, confirmo el pedido.' },
] as const

/** Ejemplo de la conversación: muestra cómo se cierra una compra sin registros ni pasarelas. */
export function WhatsAppPreview() {
  return (
    <figure className="chamfer chamfer-lg w-full max-w-sm bg-white p-4 shadow-2xl shadow-black/40">
      <figcaption className="flex items-center gap-3 border-b pb-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white">
          <WhatsAppIcon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-brand-navy">Asesor KOVEX</span>
          <span className="block text-[0.7rem] text-success">en línea</span>
        </span>
        <span className="rounded-full bg-brand-mist px-2.5 py-1 text-[0.6rem] font-semibold tracking-wider text-muted-foreground uppercase">
          Ejemplo
        </span>
      </figcaption>

      <ul className="flex flex-col gap-2 py-4 text-[0.8rem] leading-snug">
        {CHAT.map((msg) => (
          <li
            key={msg.text}
            className={
              msg.from === 'cliente'
                ? 'ml-auto max-w-[88%] rounded-lg rounded-br-sm bg-[#d9fdd3] px-3 py-2 text-brand-navy'
                : 'mr-auto max-w-[88%] rounded-lg rounded-bl-sm bg-brand-mist px-3 py-2 text-brand-navy'
            }
          >
            {msg.text}
          </li>
        ))}
      </ul>

      <p className="flex items-center gap-2 border-t pt-3 text-[0.7rem] font-semibold text-muted-foreground">
        <CheckCheckIcon className="size-4 shrink-0 text-brand-blue" aria-hidden="true" />
        Pedido KVX-1042 · unidades separadas
      </p>
    </figure>
  )
}
