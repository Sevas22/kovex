import { formatCOP, pluralOf } from '@/lib/format'
import type { ProductSummary } from '@/lib/types'

/** Escalera de precios por cantidad. No se muestra si el producto no tiene escala. */
export function PriceTiers({ product, className }: { product: ProductSummary; className?: string }) {
  const tiers = product.priceTiers ?? []
  if (product.price == null || tiers.length === 0) return null

  const unit = product.unit.toLowerCase()
  const units = pluralOf(unit)
  const first = tiers[0]

  return (
    <div className={className}>
      <table className="w-full overflow-hidden rounded-md border text-sm">
        <caption className="border-b bg-brand-mist px-4 py-2.5 text-left font-semibold text-brand-navy">
          Precio por volumen
        </caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Cantidad</th>
            <th scope="col">Precio por {unit}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b last:border-b-0">
            <td className="px-4 py-2.5 text-muted-foreground">
              1 – {first.minQty - 1} {first.minQty - 1 === 1 ? unit : units}
            </td>
            <td className="px-4 py-2.5 text-right font-semibold tabular">{formatCOP(product.price)}</td>
          </tr>
          {tiers.map((tier) => (
            <tr key={tier.minQty} className="border-b last:border-b-0">
              <td className="px-4 py-2.5 text-muted-foreground">
                Desde {tier.minQty} {units}
              </td>
              <td className="px-4 py-2.5 text-right tabular">
                <span className="font-semibold text-success">{formatCOP(tier.unitPrice)}</span>
                <span className="ml-2 text-xs text-success">−{tier.percent}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">
        El descuento se aplica solo con la cantidad de ese producto y se refleja al agregarlo a tu pedido.
      </p>
    </div>
  )
}
