
// lib/calculos/resumo.ts

import type { CategoriaServico } from '@/lib/tipos/comum'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { ResumoCategoria, ResumoObra } from '@/lib/tipos/resumo'
import type { Servico } from '@/lib/tipos/servico'
import { calcularLevantamento } from './levantamento'

function criarResumoCategoria(categoria: CategoriaServico): ResumoCategoria {
  return {
    categoria,
    subtotal: 0,
    valorBdi: 0,
    total: 0,
    quantidadeItens: 0,
  }
}

export function calcularResumoObra(
  levantamentos: LevantamentoServico[],
  servicos: Servico[],
): ResumoObra {
  const categoriasMap = new Map<CategoriaServico, ResumoCategoria>()

  let subtotalGeral = 0
  let valorBdiGeral = 0
  let totalGeral = 0
  let quantidadeItens = 0
  let quantidadeItensComErro = 0

  for (const levantamento of levantamentos) {
    const servico = servicos.find((item) => item.id === levantamento.servicoId)

    if (!servico) {
      quantidadeItensComErro += 1
      continue
    }

    const resultado = calcularLevantamento(levantamento, servico)

    if (resultado.erros.length > 0) {
      quantidadeItensComErro += 1
      continue
    }

    const categoria = servico.categoria
    const resumoCategoria = categoriasMap.get(categoria) ?? criarResumoCategoria(categoria)

    resumoCategoria.subtotal += resultado.subtotal
    resumoCategoria.valorBdi += resultado.valorBdi
    resumoCategoria.total += resultado.total
    resumoCategoria.quantidadeItens += 1

    categoriasMap.set(categoria, resumoCategoria)

    subtotalGeral += resultado.subtotal
    valorBdiGeral += resultado.valorBdi
    totalGeral += resultado.total
    quantidadeItens += 1
  }

  return {
    subtotal: subtotalGeral,
    valorBdi: valorBdiGeral,
    total: totalGeral,
    quantidadeItens,
    quantidadeItensComErro,
    categorias: Array.from(categoriasMap.values()),
  }
}
