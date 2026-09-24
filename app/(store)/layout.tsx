import { SiteFooter } from '@/components/store/site-footer'
import { SiteHeader } from '@/components/store/site-header'
import { CartProvider } from '@/lib/cart'
import { getDepartments } from '@/lib/server/catalog'
import { getPublicStoreInfo } from '@/lib/server/settings'

// Catálogo, precios y stock cambian desde el panel: todo se lee de la base en cada request
// (y el build nunca consulta la base de datos).
export const dynamic = 'force-dynamic'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [departments, store] = await Promise.all([getDepartments(), getPublicStoreInfo()])
  const links = departments.map((d) => ({ slug: d.slug, name: d.name }))

  return (
    <CartProvider>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader departments={links} store={store} />
        <main className="flex-1">{children}</main>
        <SiteFooter departments={links} store={store} />
      </div>
    </CartProvider>
  )
}
