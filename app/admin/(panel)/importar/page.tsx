import { PageHeader } from '@/components/admin/page-header'
import { SupplierImporter } from '@/components/admin/supplier-importer'
import { SupplierSync } from '@/components/admin/supplier-sync'
import { db } from '@/lib/server/db'
import { getSettings } from '@/lib/server/settings'
import { getSyncStatus } from '@/lib/server/supplier-sync'

export const metadata = { title: 'Importar productos' }

// La revisión de costos consulta al proveedor producto por producto.
export const maxDuration = 60

export default async function ImportPage() {
  const [settings, [{ count }], sync] = await Promise.all([
    getSettings(),
    db()<{ count: number }[]>`select count(*)::int as count from public.products`,
    getSyncStatus(),
  ])
  return (
    <>
      <PageHeader
        title="Importar productos"
        description="Trae productos de Texcomercial con foto, descripción, especificaciones, marca, categoría y costo. Tú decides el precio de venta y el stock."
      />
      <SupplierSync total={sync.total} stale={sync.stale} lastSync={sync.lastSync} />
      <SupplierImporter
        remaining={Math.max(0, settings.productLimit - count)}
        defaultMarkup={settings.defaultMarkupPercent}
        priceRounding={settings.priceRounding}
      />
    </>
  )
}
