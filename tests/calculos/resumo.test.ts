// tests/calculos/resumo.test.ts

import { describe, expect, it } from 'vitest'
import { calcularResumoObra } from '@/lib/calculos/resumo'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'

const agora = '2026-01-01T00:00:00.000Z'

const servicos: Servico[] = [
  {
    id: 'serv_reboco',
    nome: 'Reboco interno',
    categoria: 'reboco',
    unidade: 'm2',
    valorUnitarioPadrao: 35,
    tipoCalculo: 'parede',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'serv_piso',
    nome: 'Piso',
    categoria: 'pisos',
    unidade: 'm2',
    valorUnitarioPadrao: 60,
    tipoCalculo: 'piso',
    usaBdi: true,
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
]

function criarLevantamento(parcial: Partial<LevantamentoServico>): LevantamentoServico {
  return {
    id: 'lev_1',
    obraId: 'obra_1',
    ambienteId: 'amb_1',
    servicoId: 'serv_reboco',
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

describe('resumo da obra', () => {
  it('agrupa e soma por categoria', () => {
    const levantamentos: LevantamentoServico[] = [
      criarLevantamento({ id: 'lev_1', servicoId: 'serv_reboco', comprimento: 4, altura: 2.8 }),
      criarLevantamento({ id: 'lev_2', servicoId: 'serv_piso', comprimento: 4, largura: 3, valorUnitario: 60 }),
    ]

    const resumo = calcularResumoObra(levantamentos, servicos)

    expect(resumo.quantidadeItens).toBe(2)
    expect(resumo.quantidadeItensComErro).toBe(0)
    expect(resumo.categorias).toHaveLength(2)
    expect(resumo.subtotal).toBeCloseTo(1112)
    expect(resumo.valorBdi).toBeCloseTo(389.2)
    expect(resumo.total).toBeCloseTo(1501.2)
  })

  it('conta item com erro e nÃ£o soma no total', () => {
    const levantamentos: LevantamentoServico[] = [
      criarLevantamento({ id: 'lev_1', servicoId: 'serv_reboco', comprimento: 4, altura: 2.8 }),
      criarLevantamento({ id: 'lev_erro', servicoId: 'serv_reboco', comprimento: 1, altura: 1, valorUnitario: -10 }),
    ]

    const resumo = calcularResumoObra(levantamentos, servicos)

    expect(resumo.quantidadeItens).toBe(1)
    expect(resumo.quantidadeItensComErro).toBe(1)
    expect(resumo.subtotal).toBeCloseTo(392)
    expect(resumo.valorBdi).toBeCloseTo(137.2)
    expect(resumo.total).toBeCloseTo(529.2)
  })
})
