'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/admin/actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined)
  return (
    <form action={action} className="mt-6">
      <FieldGroup className="gap-4">
        <Field data-invalid={state?.error ? true : undefined}>
          <FieldLabel htmlFor="email">Correo</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="username" required className="h-10" />
        </Field>
        <Field data-invalid={state?.error ? true : undefined}>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-10" />
        </Field>
        {state?.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" size="xl" className="chamfer w-full" disabled={pending}>
          {pending ? <Spinner data-icon="inline-start" /> : null}
          Ingresar
        </Button>
      </FieldGroup>
    </form>
  )
}
