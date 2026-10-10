/**
 * Genera el QR del catálogo como SVG estático.
 *
 *   pnpm qr            → usa el dominio de producción
 *   pnpm qr "https://otro-dominio.com"
 *
 * Se guarda en public/brand/ y se versiona con el proyecto. Es estático a
 * propósito: el dominio no cambia, así la página no carga ninguna librería ni
 * depende de un servicio externo para pintarlo, y el cliente puede descargar el
 * archivo para imprimirlo en tarjetas, vitrina o el camión.
 *
 * Si algún día cambia el dominio, se vuelve a correr y ya.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { toString as qrToString } from 'qrcode'

const SITIO = process.argv[2] ?? 'https://www.kovexcolombia.com'
// El parámetro deja ver en las analíticas cuánta gente llegó escaneando.
const DESTINO = `${SITIO.replace(/\/$/, '')}/catalogo?utm_source=qr`

async function main() {
  const svg = await qrToString(DESTINO, {
    type: 'svg',
    // Alta: el código sigue leyéndose con un logo encima o impreso a baja calidad.
    errorCorrectionLevel: 'H',
    margin: 2,
    color: { dark: '#071629', light: '#ffffff' },
  })

  await mkdir('public/brand', { recursive: true })
  await writeFile('public/brand/qr-catalogo.svg', svg, 'utf8')
  console.log(`QR generado → public/brand/qr-catalogo.svg`)
  console.log(`   apunta a: ${DESTINO}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
