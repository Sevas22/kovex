/**
 * Revisa todo el catálogo importado contra Texcomercial (costo y disponibilidad), por lotes.
 * Uso: pnpm catalog:sync
 */
import { db } from '@/lib/server/db'
import { syncSupplierBatch } from '@/lib/server/supplier-sync'

async function main() {
  let round = 0
  let totalChecked = 0
  let totalChanges = 0
  for (;;) {
    round++
    const r = await syncSupplierBatch(60)
    totalChecked += r.checked
    totalChanges += r.costChanges.length
    for (const c of r.costChanges) console.log(`  costo ${c.name}: ${c.oldCost} → ${c.newCost} (venta ${c.oldPrice} → ${c.newPrice})`)
    for (const p of r.belowCost) console.warn(`  ⚠ ${p.name}: precio fijo ${p.fixedPrice} por debajo del costo ${p.cost}`)
    console.log(`Lote ${round}: ${r.checked} revisados, ${r.failed} fallidos, ${r.pending} pendientes`)
    if (r.pending === 0 || r.checked === 0) break
  }
  console.log(`Listo: ${totalChecked} productos revisados, ${totalChanges} cambios de costo.`)
  await db().end()
}

main().catch(async (error) => {
  console.error(error)
  await db().end()
  process.exit(1)
})
