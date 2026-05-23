// lib/tipos/servico.ts

import type {
  CategoriaServico,
  TipoCalculoServico,
  UnidadeMedida,
} from './comum'

export interface Servico {
  id: string
  nome: string
  categoria: CategoriaServico
  unidade: UnidadeMedida
  valorUnitarioPadrao: number
  tipoCalculo: TipoCalculoServico
  usaBdi: boolean
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}
