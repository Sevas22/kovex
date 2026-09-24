import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  hint?: React.ReactNode
  href?: string
  icon: React.ComponentType<{ className?: string }>
  tone?: 'default' | 'attention'
  children?: React.ReactNode
}

export function StatCard({ label, value, hint, href, icon: Icon, tone = 'default', children }: StatCardProps) {
  const card = (
    <Card className={cn('h-full gap-3 transition-colors', href && 'hover:ring-brand-blue/40')}>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardDescription className="font-medium">{label}</CardDescription>
        <Icon className={cn('size-5 shrink-0', tone === 'attention' ? 'text-warning' : 'text-brand-blue')} />
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <CardTitle className="text-3xl font-bold text-brand-navy tabular">{value}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        {children}
      </CardContent>
    </Card>
  )
  return href ? (
    <Link href={href} className="block rounded-xl focus-visible:outline-2">
      {card}
    </Link>
  ) : (
    card
  )
}
