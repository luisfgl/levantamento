// lib/storage/exportacaoJson.ts

import type { Ambiente } from '@/lib/tipos/ambiente'
import type { LevantamentoServico } from '@/lib/tipos/levantamento'
import type { Obra } from '@/lib/tipos/obra'
import type { Servico } from '@/lib/tipos/servico'

export interface ExportacaoProjetoLSV {
  versao: '1.0.0'
  exportadoEm: string
  obra: Obra
  ambientes: Ambiente[]
  servicos: Servico[]
  levantamentos: LevantamentoServico[]
}

interface MontarExportacaoParams {
  obra: Obra
  ambientes: Ambiente[]
  servicos: Servico[]
  levantamentos: LevantamentoServico[]
}

export function montarExportacaoObra({
  obra,
  ambientes,
  servicos,
  levantamentos,
}: MontarExportacaoParams): ExportacaoProjetoLSV {
  return {
    versao: '1.0.0',
    exportadoEm: new Date().toISOString(),
    obra,
    ambientes: ambientes.filter((ambiente) => ambiente.obraId === obra.id),
    servicos,
    levantamentos: levantamentos.filter((levantamento) => levantamento.obraId === obra.id),
  }
}

export function validarImportacaoJson(dados: unknown): dados is ExportacaoProjetoLSV {
  if (!dados || typeof dados !== 'object') return false

  const parcial = dados as Partial<ExportacaoProjetoLSV>

  if (parcial.versao !== '1.0.0') return false
  if (!parcial.exportadoEm || typeof parcial.exportadoEm !== 'string') return false
  if (!parcial.obra || typeof parcial.obra !== 'object') return false
  if (!Array.isArray(parcial.ambientes)) return false
  if (!Array.isArray(parcial.servicos)) return false
  if (!Array.isArray(parcial.levantamentos)) return false

  return true
}

export function gerarNomeArquivoExportacao(nomeObra: string, data = new Date()): string {
  const nomeNormalizado = nomeObra
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  const dataIso = data.toISOString().slice(0, 10)
  const nomeSeguro = nomeNormalizado || 'obra'

  return `levantamento-servicos-valores-${nomeSeguro}-${dataIso}.json`
}

export function baixarJson(nomeArquivo: string, dados: unknown): void {
  if (typeof window === 'undefined') return

  const conteudo = JSON.stringify(dados, null, 2)
  const blob = new Blob([conteudo], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()

  URL.revokeObjectURL(url)
}