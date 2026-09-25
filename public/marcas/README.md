# Logotipos de las marcas distribuidas

Deja aquí un archivo por marca, con el nombre del slug de la marca:

```
samsung.svg   corona.svg   haceb.svg   oster.svg   rimax.svg   grival.svg
hyundai.svg   colplast.svg duragro.svg tracker.svg caribe.svg
compania-de-empaques.svg
```

Preferimos SVG; si la marca solo entrega PNG, que sea con fondo transparente y al
menos 320 px de ancho.

Después registra el archivo en `lib/brand-logos.ts`:

```ts
export const BRAND_LOGOS: Record<string, string> = {
  samsung: '/marcas/samsung.svg',
}
```

Si el logotipo es claro (blanco), agrega el slug a `LIGHT_LOGOS` en ese mismo
archivo para que se muestre sobre fondo azul profundo.

Mientras no exista el archivo, la tienda muestra el nombre de la marca en una
placa de texto.

## De dónde salen los archivos

Del kit de marca de cada fabricante o del material que entrega el proveedor.
Conviene revisar las condiciones de uso de cada marca: casi todas permiten que un
distribuidor autorizado muestre el logotipo, pero fijan el espacio libre alrededor
y prohíben deformarlo o cambiarle el color.

## Estado actual (25/09/2026)

Con logotipo: Samsung, Corona, Grival, Haceb, Colplast, Duragro, Rimax, Oster e
Hyundai.

Pendientes (se muestran con placa de texto): **Caribe**, **Tracker** y
**Compañía de Empaques**. Las dos primeras son marcas propias del proveedor y no
tienen sitio público; el dominio de Compañía de Empaques está en venta. Hay que
pedirle los archivos al proveedor.

Origen de los actuales: Wikimedia Commons (Samsung, Corona, Hyundai) y los sitios
oficiales de cada marca (Haceb, Colplast, Duragro, Rimax, Oster, Grival). Para la
versión definitiva conviene reemplazarlos por los del kit de marca de cada
fabricante.
