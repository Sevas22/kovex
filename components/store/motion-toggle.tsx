'use client'

import { PauseIcon, PlayIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

const KEY = 'kovex-motion'

/**
 * Interruptor flotante de movimiento. El estado vive en `data-motion` del <html>
 * (lo fija un script en el layout antes de pintar, para que no haya parpadeo) y se
 * recuerda en el navegador.
 */
export function MotionToggle() {
  const [on, setOn] = useState(true)

  useEffect(() => {
    setOn(document.documentElement.dataset.motion !== 'off')
  }, [])

  function toggle() {
    const next = !on
    setOn(next)
    document.documentElement.dataset.motion = next ? 'on' : 'off'
    try {
      localStorage.setItem(KEY, next ? 'on' : 'off')
    } catch {
      // Navegación privada o almacenamiento bloqueado: basta con el cambio en memoria.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!on}
      aria-label={`Movimiento: ${on ? 'activado' : 'pausado'}`}
      title={on ? 'Pausar las animaciones' : 'Activar las animaciones'}
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full border border-brand-navy/10 bg-white/90 px-3 py-2.5 text-xs font-semibold text-brand-navy shadow-lg shadow-brand-navy/10 backdrop-blur transition-transform hover:-translate-y-0.5 sm:pr-4 print:hidden"
    >
      {on ? (
        <PauseIcon className="size-3.5 text-brand-blue" aria-hidden="true" />
      ) : (
        <PlayIcon className="size-3.5 text-brand-blue" aria-hidden="true" />
      )}
      <span aria-hidden="true" className="hidden sm:inline">
        Movimiento
      </span>
    </button>
  )
}
