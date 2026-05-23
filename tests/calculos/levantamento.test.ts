// tests/calculos/levantamento.test.ts

import { describe, expect, it } from 'vitest'
import { calcularLevantamento } from '@/lib/calculos/levantamento'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'

const agora = '2026-01-01T00:00:00.000Z'

function criarServico(parcial: Partial<Servico>): Servico {
  return {
    id: 'serv_1',
    nome: 'Serviço teste',
    categoria: 'reboco',
    unidade: 'm2',
    valorUnitarioPadrao: 0,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
    ...parcial,
  }
}

function criarLevantamento(parcial: Partial<LevantamentoServico>): LevantamentoServico {
  return {
    id: 'lev_1',
    obraId: 'obra_1',
    ambienteId: 'amb_1',
    servicoId: 'serv_1',
    unidade: 'm2',
    valorUnitario: 35,
    bdiPercentual: 35,
    usaBdi: true,
    vaos: [],
    criadoEm: agora,
    atualizadoEm: agora,
    ...parcial,
  }
}

describe('cálculo de levantamento', () => {
  it('calcula parede sem vão', () => {
    const servico = criarServico({ tipoCalculo: 'parede' })
    const levantamento = criarLevantamento({ comprimento: 4, altura: 2.8 })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toHaveLength(0)
    expect(resultado.areaBruta).toBeCloseTo(11.2)
    expect(resultado.saldo).toBeCloseTo(11.2)
    expect(resultado.subtotal).toBeCloseTo(392)
    expect(resultado.valorBdi).toBeCloseTo(137.2)
    expect(resultado.total).toBeCloseTo(529.2)
  })

  it('calcula parede com vão', () => {
    const servico = criarServico({ tipoCalculo: 'parede' })
    const levantamento = criarLevantamento({
      comprimento: 5,
      altura: 2.8,
      vaos: [
        {
          id: 'vao_1',
          levantamentoId: 'lev_1',
          tipo: 'porta',
          largura: 0.8,
          altura: 2.1,
          quantidade: 1,
          criadoEm: agora,
          atualizadoEm: agora,
        },
        {
          id: 'vao_2',
          levantamentoId: 'lev_1',
          tipo: 'janela',
          largura: 1.5,
          altura: 1.2,
          quantidade: 1,
          criadoEm: agora,
          atualizadoEm: agora,
        },
      ],
    })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toHaveLength(0)
    expect(resultado.areaBruta).toBeCloseTo(14)
    expect(resultado.areaDescontada).toBeCloseTo(3.48)
    expect(resultado.saldo).toBeCloseTo(10.52)
    expect(resultado.subtotal).toBeCloseTo(368.2)
    expect(resultado.valorBdi).toBeCloseTo(128.87)
    expect(resultado.total).toBeCloseTo(497.07)
  })

  it('calcula piso', () => {
    const servico = criarServico({ tipoCalculo: 'piso', categoria: 'pisos' })
    const levantamento = criarLevantamento({ comprimento: 4, largura: 3, valorUnitario: 60 })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toHaveLength(0)
    expect(resultado.areaBruta).toBeCloseTo(12)
    expect(resultado.subtotal).toBeCloseTo(720)
    expect(resultado.valorBdi).toBeCloseTo(252)
    expect(resultado.total).toBeCloseTo(972)
  })

  it('calcula item unitário', () => {
    const servico = criarServico({
      tipoCalculo: 'item_unitario',
      categoria: 'acabamentos',
      unidade: 'un',
    })
    const levantamento = criarLevantamento({
      quantidade: 2,
      valorUnitario: 250,
      unidade: 'un',
    })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toHaveLength(0)
    expect(resultado.saldo).toBeCloseTo(2)
    expect(resultado.subtotal).toBeCloseTo(500)
    expect(resultado.valorBdi).toBeCloseTo(175)
    expect(resultado.total).toBeCloseTo(675)
  })

  it('calcula valor manual', () => {
    const servico = criarServico({
      tipoCalculo: 'valor_manual',
      categoria: 'instalacoes',
      unidade: 'verba',
    })
    const levantamento = criarLevantamento({
      valorManual: 1000,
      unidade: 'verba',
    })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toHaveLength(0)
    expect(resultado.subtotal).toBeCloseTo(1000)
    expect(resultado.valorBdi).toBeCloseTo(350)
    expect(resultado.total).toBeCloseTo(1350)
  })

  it('calcula comprimento linear', () => {
    const servico = criarServico({
      tipoCalculo: 'comprimento_linear',
      categoria: 'pisos',
      unidade: 'm',
    })
    const levantamento = criarLevantamento({
      comprimento: 12,
      valorUnitario: 15,
      unidade: 'm',
    })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros).toHaveLength(0)
    expect(resultado.saldo).toBeCloseTo(12)
    expect(resultado.subtotal).toBeCloseTo(180)
    expect(resultado.valorBdi).toBeCloseTo(63)
    expect(resultado.total).toBeCloseTo(243)
  })

  it('gera erro quando área descontada é maior que área bruta', () => {
    const servico = criarServico({ tipoCalculo: 'parede' })
    const levantamento = criarLevantamento({
      comprimento: 1,
      altura: 1,
      vaos: [
        {
          id: 'vao_1',
          levantamentoId: 'lev_1',
          tipo: 'porta',
          largura: 2,
          altura: 2,
          quantidade: 1,
          criadoEm: agora,
          atualizadoEm: agora,
        },
      ],
    })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros.join(' ')).toMatch(/descontada.*maior.*bruta/i)
    expect(resultado.total).toBeCloseTo(0)
  })

  it('gera erro quando valor unitário é negativo', () => {
    const servico = criarServico({ tipoCalculo: 'parede' })
    const levantamento = criarLevantamento({
      comprimento: 4,
      altura: 2.8,
      valorUnitario: -1,
    })

    const resultado = calcularLevantamento(levantamento, servico)

    expect(resultado.erros.join(' ')).toMatch(/valor.*negativo/i)
    expect(resultado.total).toBeCloseTo(0)
  })
})
