// lib/tipos/levantamento.ts

import type { UnidadeMedida } from './comum'
import type { Vao } from './vao'

export interface LevantamentoServico {
  id: string
  obraId: string
  ambienteId: string
  servicoId: string
  descricao?: string

  comprimento?: number
  largura?: number
  altura?: number
  quantidade?: number
  valorManual?: number

  unidade: UnidadeMedida
  valorUnitario: number
  bdiPercentual: number
  usaBdi: boolean

  vaos: Vao[]

  observacoes?: string
  criadoEm: string
  atualizadoEm: string
}
export interface ResultadoCalculoLevantamento {
  areaBruta: number
  areaDescontada: number
  saldo: number
  subtotal: number
  valorBdi: number
  total: number
  erros: string[]
}
