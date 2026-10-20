'use client'

import { ExternalLinkIcon } from 'lucide-react'
import { useState } from 'react'
import { useAdminAction } from './use-action'
import { saveStoreSettingsAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import type { StoreSettings } from '@/lib/types'
import { normalizePhone } from '@/lib/text'

export function StoreSettingsForm({ settings }: { settings: StoreSettings }) {
  const [form, setForm] = useState({
    businessName: settings.businessName,
    whatsappNumber: settings.whatsappNumber,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone ?? '',
    address: settings.address ?? '',
    city: settings.city,
    lowStockThreshold: String(settings.lowStockThreshold),
  })
  const [incluyeIva, setIncluyeIva] = useState(settings.supplierPricesIncludeTax)
  const { pending, execute } = useAdminAction()
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const testUrl = `https://wa.me/${normalizePhone(form.whatsappNumber)}?text=${encodeURIComponent('Prueba de WhatsApp desde el panel KOVEX')}`

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        execute(() =>
          saveStoreSettingsAction({
            ...form,
            lowStockThreshold: Number(form.lowStockThreshold) || 0,
            supplierPricesIncludeTax: incluyeIva,
          }),
        )
      }}
      className="flex max-w-2xl flex-col gap-8"
    >
      <FieldSet>
        <FieldLegend>WhatsApp de ventas</FieldLegend>
        <FieldDescription>
          Aquí llegan los pedidos y cotizaciones de la tienda. Debe ser el número con indicativo (57…), no un enlace wa.link: los
          enlaces cortos no permiten enviar el detalle del pedido escrito.
        </FieldDescription>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="s-whatsapp">Número</FieldLabel>
            <div className="flex gap-2">
              <Input id="s-whatsapp" value={form.whatsappNumber} onChange={set('whatsappNumber')} inputMode="tel" className="max-w-60 tabular" />
              <Button variant="outline" nativeButton={false} render={<a href={testUrl} target="_blank" rel="noopener noreferrer" />}>
                <ExternalLinkIcon data-icon="inline-start" />
                Probar
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Datos de contacto</FieldLegend>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="s-name">Nombre comercial</FieldLabel>
            <Input id="s-name" value={form.businessName} onChange={set('businessName')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="s-email">Correo</FieldLabel>
              <Input id="s-email" type="email" value={form.contactEmail} onChange={set('contactEmail')} />
            </Field>
            <Field>
              <FieldLabel htmlFor="s-phone">Teléfono fijo</FieldLabel>
              <Input id="s-phone" value={form.contactPhone} onChange={set('contactPhone')} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="s-address">Dirección</FieldLabel>
              <Input id="s-address" value={form.address} onChange={set('address')} />
            </Field>
            <Field>
              <FieldLabel htmlFor="s-city">Ciudad</FieldLabel>
              <Input id="s-city" value={form.city} onChange={set('city')} />
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>IVA</FieldLegend>
        <Field orientation="horizontal">
          <Switch id="s-iva" checked={incluyeIva} onCheckedChange={setIncluyeIva} />
          <FieldLabel htmlFor="s-iva">El costo del proveedor ya incluye IVA</FieldLabel>
        </Field>
        <FieldDescription className="-mt-2">
          El margen siempre se calcula sobre el valor sin IVA, y el impuesto se suma al final según la tarifa de cada
          producto. Esto dice cómo leer el costo que viene del proveedor.{' '}
          <strong>Cambiarlo recalcula todos los precios del catálogo.</strong> Si lo apagas sin que el proveedor lo
          haya confirmado, los precios suben alrededor de un 19 %.
        </FieldDescription>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Inventario</FieldLegend>
        <Field>
          <FieldLabel htmlFor="s-low">Alerta de stock bajo</FieldLabel>
          <Input id="s-low" inputMode="numeric" value={form.lowStockThreshold} onChange={set('lowStockThreshold')} className="max-w-32 tabular" />
          <FieldDescription>Con estas unidades o menos, el producto aparece como “últimas unidades” y en las alertas.</FieldDescription>
        </Field>
      </FieldSet>

      <Button type="submit" size="xl" className="chamfer self-start" disabled={pending}>
        {pending ? <Spinner data-icon="inline-start" /> : null}
        Guardar configuración
      </Button>
    </form>
  )
}
