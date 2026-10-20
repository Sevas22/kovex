import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseCsv, parseNumero, toCsv } from '@/lib/csv'

describe('toCsv', () => {
  it('escribe con punto y coma y BOM, que es lo que Excel en español espera', () => {
    const csv = toCsv(['a', 'b'], [[1, 2]])
    assert.ok(csv.startsWith('\uFEFF'))
    assert.ok(csv.includes('a;b'))
  })

  it('entrecomilla los nombres con comillas, que en el catálogo son 184', () => {
    const csv = toCsv(['nombre'], [['Brocha Popular 2" Negro']])
    assert.ok(csv.includes('"Brocha Popular 2"" Negro"'))
  })

  it('entrecomilla los nombres con coma y con punto y coma', () => {
    assert.ok(toCsv(['n'], [['Cable 2x14, blanco']]).includes('"Cable 2x14, blanco"'))
    assert.ok(toCsv(['n'], [['a;b']]).includes('"a;b"'))
  })
})

describe('parseCsv', () => {
  it('devuelve la vuelta a lo escrito, comillas incluidas', () => {
    const original = [['1', 'Brocha 2" Negro'], ['2', 'Cable, blanco']]
    const { headers, rows } = parseCsv(toCsv(['id', 'nombre'], original))
    assert.deepEqual(headers, ['id', 'nombre'])
    assert.deepEqual(rows.map((r) => r.celdas), original)
  })

  it('numera las líneas como Excel: la primera fila de datos es la 2', () => {
    const { rows } = parseCsv('id;v\r\n7;1\r\n8;2\r\n')
    assert.deepEqual(rows.map((r) => r.linea), [2, 3])
  })

  it('salta las filas vacías que Excel deja al final', () => {
    const { rows } = parseCsv('id;v\r\n7;1\r\n;\r\n\r\n')
    assert.equal(rows.length, 1)
  })

  it('acepta coma como separador si el archivo vino de otra herramienta', () => {
    const { rows } = parseCsv('id,v\n7,35\n')
    assert.deepEqual(rows[0].celdas, ['7', '35'])
  })
})

describe('parseNumero', () => {
  it('acepta coma decimal, que es como escribe Excel en español', () => {
    assert.equal(parseNumero('15,5'), 15.5)
  })

  it('acepta punto decimal', () => {
    assert.equal(parseNumero('15.5'), 15.5)
  })

  it('entiende los separadores de miles en ambos formatos', () => {
    assert.equal(parseNumero('1.234,56'), 1234.56)
    assert.equal(parseNumero('1,234.56'), 1234.56)
  })

  it('vacío es null: en el archivo significa «hereda»', () => {
    assert.equal(parseNumero(''), null)
    assert.equal(parseNumero('   '), null)
  })

  it('tolera el símbolo de porcentaje y los espacios', () => {
    assert.equal(parseNumero(' 35 % '), 35)
  })
})
