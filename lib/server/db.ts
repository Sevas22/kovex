import 'server-only'
import postgres from 'postgres'

function createClient() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('Falta DATABASE_URL. Configúrala en .env.local (ver .env.example).')
  }
  return postgres(url, {
    // El pooler de Supabase (puerto 6543) trabaja en modo transacción: sin sentencias preparadas.
    prepare: false,
    max: process.env.NODE_ENV === 'production' ? 5 : 10,
    idle_timeout: 20,
    connect_timeout: 15,
    onnotice: () => {},
    // Columnas snake_case ↔ propiedades camelCase; undefined se envía como NULL.
    transform: {
      column: { from: postgres.toCamel, to: postgres.fromCamel },
      undefined: null,
    },
    types: {
      // bigint y numeric llegan como texto; en este dominio (ids, pesos, porcentajes) caben en number.
      bigint: {
        to: 20,
        from: [20],
        serialize: (x: number) => String(x),
        parse: (x: string) => Number(x),
      },
      numeric: {
        to: 1700,
        from: [1700],
        serialize: (x: number) => String(x),
        parse: (x: string) => Number(x),
      },
    },
  })
}

type Types = { bigint: number; numeric: number }
export type Sql = postgres.Sql<Types>
export type Tx = postgres.TransactionSql<Types>

const globalForDb = globalThis as unknown as { __kovexSql?: Sql }

/** Cliente único por proceso; se crea al primer uso para que el build no exija DATABASE_URL. */
export function db(): Sql {
  globalForDb.__kovexSql ??= createClient()
  return globalForDb.__kovexSql
}
