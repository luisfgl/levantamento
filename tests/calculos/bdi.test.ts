// tests/calculos/bdi.test.ts

import { describe, expect, it } from 'vitest'
import { calcularBdi, calcularTotal } from '@/lib/calculos/bdi'

describe('cÃ¡lculos de BDI', () => {
  it('calcula BDI quando habilitado', () => {
    expect(calcularBdi(1000, 35, true)).toBeCloseTo(350)
  })

  it('retorna zero quando BDI estÃ¡ desabilitado', () => {
    expect(calcularBdi(1000, 35, false)).toBeCloseTo(0)
  })

  it('calcula total com BDI', () => {
    expect(calcularTotal(1000, 350)).toBeCloseTo(1350)
  })
})
