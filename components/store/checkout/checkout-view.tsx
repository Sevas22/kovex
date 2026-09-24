'use client'

import { AlertTriangleIcon, ArrowLeftIcon, ShoppingBagIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { submitCheckout, type CheckoutInput } from '@/app/(store)/pedido/actions'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { ProductImage } from '@/components/store/product-image'
import { QuantityStepper } from '@/components/store/quantity-stepper'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cartTotals, useCart } from '@/lib/cart'
import { formatCOP, plural } from '@/lib/format'
import type { OrderKind } from '@/lib/types'

type Customer = CheckoutInput['customer']
const EMPTY: Customer = { name: '', phone: '', company: '', document: '', email: '', city: '', address: '', notes: '' }

export function CheckoutView() {
  const router = useRouter()
  const { items, ready, setQuantity, remove, clear } = useCart()
  const [customer, setCustomer] = useState<Customer>(EMPTY)
  const [chosenKind, setChosenKind] = useState<OrderKind>('order')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const { subtotal, unpricedCount, shortages } = cartTotals(items)
  const orderBlocked = unpricedCount > 0 || shortages.length > 0
  const kind: OrderKind = orderBlocked ? 'quote' : chosenKind

  if (!ready) return <div className="min-h-[60vh]" />

  if (items.length === 0) {
    return (
      <Empty className="mx-auto my-16 max-w-lg border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShoppingBagIcon />
          </EmptyMedia>
          <EmptyTitle>Tu pedido está vacío</EmptyTitle>
          <EmptyDescription>Agrega productos desde el catálogo para armar tu pedido o solicitar una cotización.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="xl" className="chamfer" nativeButton={false} render={<Link href="/catalogo" />}>
            Ir al catálogo
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const set = (key: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomer((c) => ({ ...c, [key]: e.target.value }))
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest)
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const website = new FormData(e.currentTarget).get('website')
    startTransition(async () => {
      const result = await submitCheckout({
        kind,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        customer,
        website: typeof website === 'string' ? website : undefined,
      })
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        setFormError(result.error)
        return
      }
      clear()
      router.push(`/pedido/${result.token}`)
    })
  }

  const field = (key: keyof Customer, label: string, props: React.ComponentProps<'input'> = {}, description?: string) => (
    <Field data-invalid={errors[key] ? true : undefined}>
      <FieldLabel htmlFor={`checkout-${key}`}>{label}</FieldLabel>
      <Input
        id={`checkout-${key}`}
        value={customer[key] ?? ''}
        onChange={set(key)}
        aria-invalid={errors[key] ? true : undefined}
        className="h-10"
        {...props}
      />
      {description && !errors[key] ? <FieldDescription>{description}</FieldDescription> : null}
      {errors[key] ? <FieldError>{errors[key]}</FieldError> : null}
    </Field>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <Link href="/catalogo" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-blue">
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        Seguir comprando
      </Link>
      <h1 className="mt-3 font-display text-2xl text-brand-navy uppercase md:text-3xl">Revisa tu pedido</h1>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_420px]">
        {/* Productos */}
        <section aria-label="Productos" className="rounded-md border bg-card">
          <ul>
            {items.map(({ product, quantity }) => {
              const short = product.available != null && quantity > product.available
              return (
                <li key={product.id} className="flex gap-4 border-b p-4 last:border-b-0">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-sm border bg-white">
                    <ProductImage src={product.image} alt={product.name} sizes="80px" className="p-1.5" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/producto/${product.slug}`} className="line-clamp-2 font-semibold hover:text-brand-blue">
                          {product.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {product.price == null ? 'Precio a cotizar' : `${formatCOP(product.price)} por ${product.unit.toLowerCase()}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon-sm" aria-label={`Quitar ${product.name}`} onClick={() => remove(product.id)}>
                        <Trash2Icon />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <QuantityStepper
                        value={quantity}
                        onChange={(q) => setQuantity(product.id, q)}
                        label={`Cantidad de ${product.name}`}
                      />
                      <span className="font-semibold tabular">
                        {product.price == null ? 'A cotizar' : formatCOP(product.price * quantity)}
                      </span>
                    </div>
                    {short ? (
                      <p className="flex items-center gap-1.5 text-xs text-warning">
                        <AlertTriangleIcon className="size-3.5" aria-hidden="true" />
                        {product.available && product.available > 0
                          ? `Hay ${product.available} disponibles. Ajusta la cantidad o envíalo como cotización.`
                          : 'Agotado por ahora: lo cotizamos con tiempo de entrega.'}
                      </p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Envío */}
        <form onSubmit={submit} noValidate className="flex flex-col gap-6 rounded-md border bg-card p-5 lg:sticky lg:top-40">
          <div className="flex flex-col gap-3">
            <h2 className="font-semibold">¿Cómo quieres enviarlo?</h2>
            <ToggleGroup
              value={[kind]}
              onValueChange={(v) => v[0] && setChosenKind(v[0] as OrderKind)}
              variant="outline"
              className="grid w-full grid-cols-2"
            >
              <ToggleGroupItem value="order" disabled={orderBlocked} className="h-auto flex-col items-start gap-0.5 px-3 py-2.5 text-left">
                <span className="font-semibold">Hacer pedido</span>
                <span className="text-xs font-normal text-muted-foreground">Separamos las unidades</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="quote" className="h-auto flex-col items-start gap-0.5 px-3 py-2.5 text-left">
                <span className="font-semibold">Pedir cotización</span>
                <span className="text-xs font-normal text-muted-foreground">Te enviamos precios</span>
              </ToggleGroupItem>
            </ToggleGroup>
            {orderBlocked ? (
              <p className="text-xs text-muted-foreground">
                {unpricedCount
                  ? `${plural(unpricedCount, 'producto')} de tu lista no ${unpricedCount === 1 ? 'tiene' : 'tienen'} precio publicado, así que la enviaremos como cotización.`
                  : 'Algunas cantidades superan lo disponible, así que la enviaremos como cotización.'}
              </p>
            ) : null}
          </div>

          <Separator />

          <FieldGroup className="gap-4">
            {field('name', 'Nombre y apellido', { autoComplete: 'name', required: true })}
            {field('phone', 'WhatsApp', { autoComplete: 'tel', inputMode: 'tel', placeholder: '300 123 4567', required: true }, 'Te respondemos a este número.')}
            <div className="grid gap-4 sm:grid-cols-2">
              {field('company', 'Empresa o negocio', { autoComplete: 'organization' })}
              {field('document', 'NIT o cédula')}
            </div>
            {field('email', 'Correo', { type: 'email', autoComplete: 'email' })}
            <div className="grid gap-4 sm:grid-cols-2">
              {field('city', kind === 'order' ? 'Ciudad de entrega' : 'Ciudad', { autoComplete: 'address-level2' })}
              {field('address', kind === 'order' ? 'Dirección de entrega' : 'Dirección', { autoComplete: 'street-address' })}
            </div>
            <Field>
              <FieldLabel htmlFor="checkout-notes">Notas para el asesor</FieldLabel>
              <Textarea id="checkout-notes" value={customer.notes ?? ''} onChange={set('notes')} rows={3} />
            </Field>
            {/* Campo trampa para bots */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          </FieldGroup>

          <div className="flex flex-col gap-1 rounded-md bg-brand-mist p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-2xl font-bold tabular">{formatCOP(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              IVA incluido.{unpricedCount ? ` Más ${plural(unpricedCount, 'producto')} por cotizar.` : ''} El envío se coordina con el asesor.
            </p>
          </div>

          {formError ? (
            <Alert variant="destructive">
              <AlertTriangleIcon />
              <AlertTitle>No se pudo enviar</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" variant="whatsapp" size="xl" className="w-full" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : <WhatsAppIcon data-icon="inline-start" />}
            {kind === 'order' ? 'Confirmar pedido' : 'Solicitar cotización'}
          </Button>
          <p className="-mt-3 text-center text-xs text-muted-foreground">
            En el siguiente paso lo envías por WhatsApp a un asesor.
          </p>
        </form>
      </div>
    </div>
  )
}
