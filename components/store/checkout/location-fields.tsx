'use client'

import { useMemo } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DEPARTAMENTOS, municipiosDe } from '@/lib/colombia'

/**
 * Departamento y municipio, elegidos de la lista oficial del DANE.
 *
 * Antes la ciudad era un campo libre y llegaban «mede», «Bogota dc» o un
 * municipio que no existe, que el asesor tenía que adivinar para cotizar el
 * envío. Al elegirlos de la lista el dato llega escrito igual siempre.
 *
 * El municipio depende del departamento, así que se habilita después: 1.122
 * municipios en una sola lista no ayudan a nadie, y el nombre repetido —San
 * Andrés está en Santander y en el archipiélago— sería ambiguo.
 */
export function LocationFields({
  departamento,
  ciudad,
  onChange,
  errors,
  required,
}: {
  departamento: string
  ciudad: string
  onChange: (next: { departamento: string; ciudad: string }) => void
  errors: { departamento?: string; ciudad?: string }
  required: boolean
}) {
  const municipios = useMemo(() => municipiosDe(departamento), [departamento])

  return (
    <>
      <Field data-invalid={errors.departamento ? true : undefined}>
        <FieldLabel htmlFor="checkout-departamento">Departamento</FieldLabel>
        <Select
          items={Object.fromEntries(DEPARTAMENTOS.map((d) => [d.name, d.name]))}
          value={departamento || null}
          // Al cambiar de departamento el municipio anterior ya no pertenece.
          onValueChange={(v) => onChange({ departamento: v ? String(v) : '', ciudad: '' })}
        >
          <SelectTrigger id="checkout-departamento" size="default" className="h-10 w-full">
            <SelectValue placeholder="Elige el departamento" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {DEPARTAMENTOS.map((d) => (
                <SelectItem key={d.code} value={d.name}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.departamento ? <FieldError>{errors.departamento}</FieldError> : null}
      </Field>

      <Field data-invalid={errors.ciudad ? true : undefined}>
        <FieldLabel htmlFor="checkout-city">Ciudad o municipio</FieldLabel>
        <Select
          items={Object.fromEntries(municipios.map((m) => [m, m]))}
          value={ciudad || null}
          onValueChange={(v) => onChange({ departamento, ciudad: v ? String(v) : '' })}
          disabled={municipios.length === 0}
        >
          <SelectTrigger id="checkout-city" size="default" className="h-10 w-full">
            <SelectValue placeholder={departamento ? 'Elige la ciudad' : 'Primero el departamento'} />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {municipios.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.ciudad ? (
          <FieldError>{errors.ciudad}</FieldError>
        ) : municipios.length > 12 ? (
          <FieldDescription>
            {required ? 'Escribe las primeras letras para encontrarla.' : 'Opcional. Escribe las primeras letras para encontrarla.'}
          </FieldDescription>
        ) : null}
      </Field>
    </>
  )
}
