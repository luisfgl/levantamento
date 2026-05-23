// tests/storage/exportacaoJson.test.ts

import { describe, expect, it } from 'vitest'
import {
  gerarNomeArquivoExportacao,
  montarExportacaoObra,
  validarImportacaoJson,
} from '@/lib/storage/exportacaoJson'
import { ambientesExemplo, levantamentosExemplo, obraExemplo } from '@/lib/dados/obraExemplo'
import { servicosPadrao } from '@/lib/dados/servicosPadrao'

describe('exportacaoJson', () => {
  it('monta exportação de obra', () => {
    const exportacao = montarExportacaoObra({
      obra: obraExemplo,
      ambientes: ambientesExemplo,
      servicos: servicosPadrao,
      levantamentos: levantamentosExemplo,
    })

    expect(exportacao.versao).toBe('1.0.0')
    expect(exportacao.obra.id).toBe(obraExemplo.id)
    expect(exportacao.ambientes).toHaveLength(3)
    expect(exportacao.servicos.length).toBeGreaterThan(0)
    expect(exportacao.levantamentos).toHaveLength(3)
  })

  it('valida JSON de importação correto', () => {
    const exportacao = montarExportacaoObra({
      obra: obraExemplo,
      ambientes: ambientesExemplo,
      servicos: servicosPadrao,
      levantamentos: levantamentosExemplo,
    })

    expect(validarImportacaoJson(exportacao)).toBe(true)
  })

  it('rejeita JSON de importação inválido', () => {
    expect(validarImportacaoJson({})).toBe(false)
    expect(validarImportacaoJson(null)).toBe(false)
    expect(validarImportacaoJson({ versao: '2.0.0' })).toBe(false)
  })

  it('gera nome seguro para arquivo exportado', () => {
    const nome = gerarNomeArquivoExportacao('Residência Modelo', new Date('2026-01-15T00:00:00.000Z'))

    expect(nome).toBe('levantamento-servicos-valores-residencia-modelo-2026-01-15.json')
  })
})