'use client'

import { useState } from 'react'
import { useAdminAction } from './use-action'
import { saveCategoryMarkupAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatPercent } from '@/lib/format'
import type { CategoryMarkupRow } from '@/lib/server/admin-categories'
import { cn } from '@/lib/utils'

export function CategoryMarkupRowView({ row, defaultMarkup }: { row: CategoryMarkupRow; defaultMarkup: number }) {
  const initial = row.markupPercent == null ? '' : String(row.markupPercent)
  const [value, setValue] = useState(initial)
  const { pending, execute } = useAdminAction()
  const effective = value !== '' ? Number(value.replace(',', '.')) : (row.inherited?.percent ?? defaultMarkup)
  const inheritedLabel = row.inherited ? `${formatPercent(row.inherited.percent)} de ${row.inherited.from}` : `${formatPercent(defaultMarkup)} general`

  return (
    <TableRow>
      <TableCell className={cn(row.depth === 0 && 'font-semibold')}>
        <span style={{ paddingLeft: row.depth * 20 }} className="inline-block">
          {row.depth > 0 ? <span className="mr-1.5 text-muted-foreground">└</span> : null}
          {row.name}
        </span>
      </TableCell>
      <TableCell className="text-right text-muted-foreground tabular">{row.productCount}</TableCell>
      <TableCell>
        <InputGroup className="h-8 w-28 bg-white">
          <InputGroupInput
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ''))}
            placeholder="Hereda"
            aria-label={`Margen de ${row.name}`}
            className="tabular"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>%</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </TableCell>
      <TableCell className="text-sm">
        <span className="font-semibold tabular">{formatPercent(effective)}</span>
        {value === '' ? <span className="block text-xs text-muted-foreground">hereda {inheritedLabel}</span> : null}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="sm"
          disabled={pending || value === initial}
          onClick={() => execute(() => saveCategoryMarkupAction(row.id, value === '' ? null : Number(value.replace(',', '.'))))}
        >
          Guardar
        </Button>
      </TableCell>
    </TableRow>
  )
}
