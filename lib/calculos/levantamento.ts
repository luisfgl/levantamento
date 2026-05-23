// lib/calculos/levantamento.ts

import type {
  LevantamentoServico,
  ResultadoCalculoLevantamento,
} from '@/lib/tipos/levantamento'
import type { Servico } from '@/lib/tipos/servico'
import { calcularAreaParede, calcularAreaPiso, calcularAreaVao } from './area'
import { calcularBdi, calcularTotal } from './bdi'
import { validarNumeroNaoNegativo, validarObrigatorioNumero } from './validacoes'

function resultadoZerado(erros: string[] = []): ResultadoCalculoLevantamento {
  return {
    areaBruta: 0,
    areaDescontada: 0,
    saldo: 0,
    subtotal: 0,
    valorBdi: 0,
    total: 0,
    erros,
  }
}

function somarAreaVaos(levantamento: LevantamentoServico): number {
  return levantamento.vaos.reduce((total, vao) => {
    return total + calcularAreaVao(vao.largura, vao.altura, vao.quantidade)
  }, 0)
}

function validarVaos(levantamento: LevantamentoServico): string[] {
  const erros: string[] = []

  for (const vao of levantamento.vaos) {
    erros.push(...validarObrigatorioNumero(vao.largura, 'Largura do vÃ£o'))
    erros.push(...validarObrigatorioNumero(vao.altura, 'Altura do vÃ£o'))
    erros.push(...validarObrigatorioNumero(vao.quantidade, 'Quantidade do vÃ£o'))
  }

  return erros
}

export function calcularLevantamento(
  levantamento: LevantamentoServico,
  servico: Servico,
): ResultadoCalculoLevantamento {
  const erros: string[] = []

  erros.push(...validarNumeroNaoNegativo(levantamento.valorUnitario, 'Valor unitÃ¡rio'))
  erros.push(...validarNumeroNaoNegativo(levantamento.bdiPercentual, 'BDI'))

  let areaBruta = 0
  let areaDescontada = 0
  let saldo = 0
  let subtotal = 0

  switch (servico.tipoCalculo) {
    case 'parede': {
      erros.push(...validarObrigatorioNumero(levantamento.comprimento, 'Comprimento'))
      erros.push(...validarObrigatorioNumero(levantamento.altura, 'Altura'))
      erros.push(...validarVaos(levantamento))

      if (erros.length > 0) return resultadoZerado(erros)

      areaBruta = calcularAreaParede(levantamento.comprimento ?? 0, levantamento.altura ?? 0)
      areaDescontada = somarAreaVaos(levantamento)
      saldo = areaBruta - areaDescontada

      if (saldo < 0) {
        erros.push('Ãrea descontada nÃ£o pode ser maior que a Ã¡rea bruta.')
        return {
          areaBruta,
          areaDescontada,
          saldo,
          subtotal: 0,
          valorBdi: 0,
          total: 0,
          erros,
        }
      }

      subtotal = saldo * levantamento.valorUnitario
      break
    }

    case 'piso': {
      erros.push(...validarObrigatorioNumero(levantamento.comprimento, 'Comprimento'))
      erros.push(...validarObrigatorioNumero(levantamento.largura, 'Largura'))

      if (erros.length > 0) return resultadoZerado(erros)

      areaBruta = calcularAreaPiso(levantamento.comprimento ?? 0, levantamento.largura ?? 0)
      saldo = areaBruta
      subtotal = saldo * levantamento.valorUnitario
      break
    }

    case 'item_unitario': {
      erros.push(...validarObrigatorioNumero(levantamento.quantidade, 'Quantidade'))

      if (erros.length > 0) return resultadoZerado(erros)

      saldo = levantamento.quantidade ?? 0
      subtotal = saldo * levantamento.valorUnitario
      break
    }

    case 'valor_manual': {
      erros.push(...validarObrigatorioNumero(levantamento.valorManual, 'Valor manual'))

      if (erros.length > 0) return resultadoZerado(erros)

      saldo = 1
      subtotal = levantamento.valorManual ?? 0
      break
    }

    case 'comprimento_linear': {
      erros.push(...validarObrigatorioNumero(levantamento.comprimento, 'Comprimento'))

      if (erros.length > 0) return resultadoZerado(erros)

      saldo = levantamento.comprimento ?? 0
      subtotal = saldo * levantamento.valorUnitario
      break
    }

    default: {
      return resultadoZerado(['Tipo de cÃ¡lculo nÃ£o suportado.'])
    }
  }

  const usaBdi = levantamento.usaBdi && servico.usaBdi
  const valorBdi = calcularBdi(subtotal, levantamento.bdiPercentual, usaBdi)
  const total = calcularTotal(subtotal, valorBdi)

  return {
    areaBruta,
    areaDescontada,
    saldo,
    subtotal,
    valorBdi,
    total,
    erros,
  }
}
