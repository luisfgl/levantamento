// lib/tipos/vao.ts

export type TipoVao = 'porta' | 'janela' | 'portao' | 'vao_livre' | 'outro'

export interface Vao {
  id: string
  levantamentoId: string
  tipo: TipoVao
  descricao?: string
  largura: number
  altura: number
  quantidade: number
  criadoEm: string
  atualizadoEm: string
}
