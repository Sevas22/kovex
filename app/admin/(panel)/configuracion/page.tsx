import { PageHeader } from '@/components/admin/page-header'
import { StoreSettingsForm } from '@/components/admin/store-settings-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/format'
import { getSettings } from '@/lib/server/settings'

export const metadata = { title: 'Configuración' }

export default async function SettingsPage() {
  const settings = await getSettings()
  return (
    <>
      <PageHeader title="Configuración" description="Datos de la tienda que ven los clientes y a dónde llegan los pedidos." />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="pt-2">
            <StoreSettingsForm settings={settings} />
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Tu plan</CardTitle>
            <CardDescription>Catálogo de hasta {formatNumber(settings.productLimit)} productos.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Para ampliar el límite escríbele al equipo que administra la plataforma.
          </CardContent>
        </Card>
      </div>
    </>
  )
}
