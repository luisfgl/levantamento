// lib/tipos/resumo.ts

import type { CategoriaServico } from './comum'

export interface ResumoCategoria {
  categoria: CategoriaServico
  subtotal: number
  valorBdi: number
  total: number
  quantidadeItens: number
}

export interface ResumoObra {
  subtotal: number
  valorBdi: number
  total: number
  quantidadeItens: number
  quantidadeItensComErro: number
  categorias: ResumoCategoria[]
}