import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-brand-mist px-4 text-center">
      <Link href="/" aria-label="KOVEX Colombia, ir al inicio">
        <Logo className="h-12" />
      </Link>
      <div>
        <p className="font-display text-5xl text-brand-blue">404</p>
        <h1 className="mt-3 text-xl font-bold text-brand-navy">No encontramos esta página</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Puede que el producto ya no esté disponible o que el enlace tenga un error.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="xl" className="chamfer" nativeButton={false} render={<Link href="/catalogo" />}>
          Ver catálogo
        </Button>
        <Button size="xl" variant="outline" nativeButton={false} render={<Link href="/" />}>
          Ir al inicio
        </Button>
      </div>
    </div>
  )
}
