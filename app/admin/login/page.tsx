import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/login-form'
import { Logo } from '@/components/brand/logo'
import { getCurrentAdmin } from '@/lib/server/auth'

export const metadata: Metadata = { title: { absolute: 'Ingresar · Panel KOVEX' }, robots: { index: false } }

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect('/admin')

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-brand-navy px-4">
      <Logo
        variant="markNegative"
        className="pointer-events-none absolute -right-24 -bottom-24 h-[70vh] opacity-[0.06]"
      />
      <div className="relative w-full max-w-sm">
        <Logo variant="negative" className="mx-auto mb-8 h-14" priority />
        <div className="chamfer chamfer-lg rounded-md bg-white p-7 shadow-2xl">
          <h1 className="font-display text-lg text-brand-navy uppercase">Panel administrativo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestiona pedidos, productos, precios e inventario.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
