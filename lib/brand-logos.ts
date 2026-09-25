// Logotipos de las marcas que distribuye KOVEX.
//
// Los archivos viven en /public/marcas con el nombre <slug>.svg (o .png si la marca
// solo entrega mapa de bits). Para agregar una marca: deja el archivo en esa carpeta
// y registra su slug aquí. Mientras no exista el archivo, la tienda muestra el nombre
// en una placa de texto, así que nunca queda un hueco ni una imagen rota.

import { slugify } from './text'

/** Slug de la marca → archivo dentro de /public/marcas. */
export const BRAND_LOGOS: Record<string, string> = {
  samsung: '/marcas/samsung.png',
  corona: '/marcas/corona.svg',
  hyundai: '/marcas/hyundai.svg',
  grival: '/marcas/grival.png',
  haceb: '/marcas/haceb.png',
  colplast: '/marcas/colplast.png',
  duragro: '/marcas/duragro.png',
  rimax: '/marcas/rimax.png',
  oster: '/marcas/oster.png',
}

/** Marcas cuyo logotipo es claro y necesita fondo oscuro para leerse. */
export const LIGHT_LOGOS = new Set<string>(['oster'])

export function brandSlug(name: string): string {
  return slugify(name)
}

/** Ruta del logotipo, o null si todavía no tenemos el archivo. */
export function brandLogo(name: string): string | null {
  return BRAND_LOGOS[brandSlug(name)] ?? null
}
