import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DEPARTAMENTOS, esMunicipioValido, municipiosDe } from '@/lib/colombia'

describe('departamentos y municipios', () => {
  it('trae la división oficial completa', () => {
    assert.equal(DEPARTAMENTOS.length, 33)
    const total = DEPARTAMENTOS.reduce((n, d) => n + d.municipios.length, 0)
    assert.equal(total, 1122)
  })

  it('escribe los nombres como se leen, con tildes', () => {
    const nombres = DEPARTAMENTOS.map((d) => d.name)
    assert.ok(nombres.includes('Bogotá, D.C.'), 'Bogotá no debe quedar como «Bogotá, D.c.»')
    assert.ok(nombres.includes('Valle del Cauca'))
    assert.ok(nombres.includes('Norte de Santander'))
    assert.ok(municipiosDe('Antioquia').includes('Medellín'))
  })

  it('ordena alfabéticamente, respetando el español', () => {
    const nombres = DEPARTAMENTOS.map((d) => d.name)
    assert.deepEqual(nombres, [...nombres].sort((a, b) => a.localeCompare(b, 'es')))
    const antioquia = municipiosDe('Antioquia')
    assert.deepEqual(antioquia, [...antioquia].sort((a, b) => a.localeCompare(b, 'es')))
  })

  // El caso que obliga a guardar los dos datos: el municipio solo es ambiguo.
  it('distingue municipios con el mismo nombre en departamentos distintos', () => {
    assert.ok(esMunicipioValido('Santander', 'San Andrés'))
    assert.ok(esMunicipioValido('Archipiélago de San Andrés, Providencia y Santa Catalina', 'San Andrés'))
    assert.ok(!esMunicipioValido('Antioquia', 'San Andrés'))
  })

  it('rechaza pares que no existen', () => {
    assert.ok(!esMunicipioValido('Antioquia', 'Bogotá, D.C.'))
    assert.ok(!esMunicipioValido('Cundinamarca', 'Medellín'))
    assert.ok(!esMunicipioValido('Narnia', 'Medellín'))
    assert.deepEqual(municipiosDe('Narnia'), [])
  })

  it('no repite municipios dentro de un mismo departamento', () => {
    for (const d of DEPARTAMENTOS) {
      assert.equal(new Set(d.municipios).size, d.municipios.length, `${d.name} tiene municipios repetidos`)
    }
  })
})
