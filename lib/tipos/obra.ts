// lib/tipos/obra.ts

import type { StatusObra } from './comum'

export interface Obra {
  id: string
  nome: string
  cliente: string
  endereco?: string
  contrato?: string
  modalidade?: string
  responsavelTecnico?: string
  registroProfissional?: string
  dataOrcamento: string
  bdiPadraoPercentual: number
  observacoes?: string
  status: StatusObra
  criadoEm: string
  atualizadoEm: string
}
