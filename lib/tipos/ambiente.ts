// lib/tipos/ambiente.ts

export interface Ambiente {
  id: string
  obraId: string
  pavimento?: string
  nome: string
  descricao?: string
  ordem: number
  criadoEm: string
  atualizadoEm: string
}
