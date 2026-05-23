// tests/calculos/area.test.ts

import { describe, expect, it } from 'vitest'
import { calcularAreaParede, calcularAreaPiso, calcularAreaVao } from '@/lib/calculos/area'

describe('cÃ¡lculos de Ã¡rea', () => {
  it('calcula Ã¡rea de parede', () => {
    expect(calcularAreaParede(4, 2.8)).toBeCloseTo(11.2)
  })

  it('calcula Ã¡rea de piso', () => {
    expect(calcularAreaPiso(5, 3)).toBeCloseTo(15)
  })

  it('calcula Ã¡rea de vÃ£o', () => {
    expect(calcularAreaVao(0.8, 2.1, 1)).toBeCloseTo(1.68)
  })
})
